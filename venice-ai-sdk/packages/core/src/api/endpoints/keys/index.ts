/**
 * API endpoint for API key management operations
 * 
 * This module provides functionality for managing API keys, including:
 * - Standard CRUD operations (list, create, retrieve, update, delete)
 * - Rate limit operations (get rate limits, get rate limit logs)
 * - Web3 authentication operations (generate token, create with web3)
 */
import { ApiEndpoint } from '../../registry/endpoint';
import {
  ApiKey,
  ApiKeyConsumptionLimits,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  ListApiKeysResponse,
  UpdateApiKeyRequest,
  UpdateApiKeyResponse,
  GenerateWeb3TokenResponse,
  CreateWeb3ApiKeyRequest,
  CreateWeb3ApiKeyResponse,
  ListRateLimitLogsResponse
} from '../../../types';
import { VeniceValidationError } from '../../../errors/types/validation-error';

/**
 * Normalize API key payloads returned by the Venice API to the SDK shape.
 * Adds backwards-compatible aliases so legacy consumers continue working.
 */
function normalizeApiKeyPayload(raw: any, keyValue?: string): ApiKey {
  if (!raw || !raw.id) {
    throw new VeniceValidationError('Malformed API key response from Venice API');
  }

  const consumption: ApiKeyConsumptionLimits | null =
    raw.consumptionLimits ??
    raw.consumptionLimit ??
    (raw.consumpionLimits as ApiKeyConsumptionLimits) ??
    null;

  const usage = raw.usage;
  const apiKeyValue = keyValue ?? raw.apiKey ?? raw.key;

  const description = raw.description ?? raw.name ?? '';
  const createdAt = raw.createdAt ?? raw.created_at ?? null;
  const expiresAt = raw.expiresAt ?? raw.expires_at ?? null;
  const lastUsedAt = raw.lastUsedAt ?? raw.last_used_at ?? null;

  return {
    id: raw.id,
    description,
    apiKeyType: raw.apiKeyType ?? raw.api_key_type ?? 'INFERENCE',
    createdAt,
    expiresAt,
    lastUsedAt,
    last6Chars: raw.last6Chars ?? raw.last_6_chars ?? (apiKeyValue ? apiKeyValue.slice(-6) : undefined),
    consumptionLimits: consumption
      ? {
          usd: consumption.usd ?? null,
          vcu: consumption.vcu ?? null,
          diem: consumption.diem ?? null,
        }
      : null,
    usage,
    apiKey: apiKeyValue,
    key: apiKeyValue,
    name: description,
    created_at: createdAt,
    expires_at: expiresAt,
    last_used_at: lastUsedAt,
    is_revoked: raw.isRevoked ?? raw.is_revoked ?? false,
  };
}

/**
 * Utility to coerce optional consumption limits into the correct shape
 */
function normalizeConsumptionLimit(limit?: ApiKeyConsumptionLimits | null): ApiKeyConsumptionLimits | undefined {
  if (!limit) {
    return undefined;
  }

  return {
    usd: limit.usd ?? null,
    vcu: limit.vcu ?? null,
    diem: limit.diem ?? null,
  };
}

/**
 * Prepare the payload for creating an API key, adapting legacy aliases.
 */
function buildCreatePayload(request: CreateApiKeyRequest): Record<string, unknown> {
  const description = request.description ?? request.name;
  if (!description) {
    throw new VeniceValidationError('Missing required parameter: description');
  }

  const payload: Record<string, unknown> = {
    description,
    apiKeyType: request.apiKeyType ?? 'INFERENCE',
  };

  const expiresAt = request.expiresAt ?? request.expires_at;
  if (expiresAt !== undefined) {
    payload.expiresAt = expiresAt;
  }

  const consumptionLimit = normalizeConsumptionLimit(request.consumptionLimit);
  if (consumptionLimit) {
    payload.consumptionLimit = consumptionLimit;
  }

  return payload;
}

/**
 * Prepare payload for update requests (when supported).
 */
function buildUpdatePayload(request: UpdateApiKeyRequest): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  const description = request.description ?? request.name;
  if (description !== undefined) {
    payload.description = description;
  }

  if (request.apiKeyType) {
    payload.apiKeyType = request.apiKeyType;
  }

  const expiresAt = request.expiresAt ?? request.expires_at;
  if (expiresAt !== undefined) {
    payload.expiresAt = expiresAt;
  }

  const consumptionLimit = normalizeConsumptionLimit(request.consumptionLimit);
  if (consumptionLimit) {
    payload.consumptionLimit = consumptionLimit;
  }

  if (Object.keys(payload).length === 0) {
    throw new VeniceValidationError('At least one field must be provided when updating an API key');
  }

  return payload;
}

/**
 * API endpoint for API key management operations
 */
export class KeysEndpoint extends ApiEndpoint {
  /**
   * Gets the base endpoint path
   * @returns The endpoint path
   */
  getEndpointPath(): string {
    return '/api_keys';
  }

  //=============================================================================
  // Standard CRUD Operations
  //=============================================================================

  /**
   * List all API keys
   * @returns A promise that resolves to a list of API keys
   */
  public async list(): Promise<ListApiKeysResponse> {
    // Emit a request event
    this.emit('request', { type: 'keys.list' });

    // Make the API request
    const response = await this.http.get<{ object: string; data: any[] }>(
      this.getPath('')
    );

    const normalized = (response.data?.data ?? []).map((item: any) => normalizeApiKeyPayload(item));

    // Emit a response event
    this.emit('response', {
      type: 'keys.list',
      data: { count: normalized.length }
    });

    return {
      object: response.data?.object ?? 'list',
      data: normalized,
      api_keys: normalized, // backward compatibility
    };
  }

  /**
   * Create a new API key
   * @param request - The request to create a new API key
   * @returns A promise that resolves to the created API key
   */
  public async create(request: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    // Emit a request event
    this.emit('request', { type: 'keys.create', data: request });

    const payload = buildCreatePayload(request);

    // Make the API request
    const response = await this.http.post<{
      success?: boolean;
      data: any;
    }>(
      this.getPath(''),
      payload
    );

    const apiKey = normalizeApiKeyPayload(response.data?.data, response.data?.data?.apiKey);

    // Emit a response event
    this.emit('response', {
      type: 'keys.create',
      data: { success: true, id: apiKey.id }
    });

    return {
      success: response.data?.success ?? true,
      api_key: apiKey,
    };
  }

  /**
   * Retrieve a specific API key by ID
   * @param id - The ID of the API key to retrieve
   * @returns A promise that resolves to the requested API key
   */
  public async retrieve(id: string): Promise<{ api_key: ApiKey }> {
    // Validate ID
    if (!id) {
      throw new VeniceValidationError('Missing required parameter: id');
    }

    // Emit a request event
    this.emit('request', { type: 'keys.retrieve', data: { id } });

    // Make the API request
    const response = await this.http.get<{ data?: any; api_key?: any }>(
      this.getPath(`/${id}`)
    );

    const apiKeyPayload = response.data?.data ?? response.data?.api_key ?? response.data;
    const apiKey = normalizeApiKeyPayload(apiKeyPayload);

    // Emit a response event
    this.emit('response', {
      type: 'keys.retrieve',
      data: { id: apiKey.id }
    });

    return { api_key: apiKey };
  }

  /**
   * Update an API key
   * @param id - The ID of the API key to update
   * @param request - The update request
   * @returns A promise that resolves to the updated API key
   */
  public async update(id: string, request: UpdateApiKeyRequest): Promise<UpdateApiKeyResponse> {
    // Validate ID
    if (!id) {
      throw new VeniceValidationError('Missing required parameter: id');
    }

    // Emit a request event
    this.emit('request', { type: 'keys.update', data: { id, ...request } });

    // The Venice API currently does not expose an update endpoint.
    // Provide a clear error to callers until support is added.
    throw new VeniceValidationError(
      'Updating API keys is not supported by the Venice API at this time.'
    );

    // The code below is preserved for forward compatibility when the API adds support.
    // const payload = buildUpdatePayload(request);
    // const response = await this.http.request<{ data: any }>(
    //   this.getPath(`/${id}`),
    //   {
    //     method: 'PATCH',
    //     body: payload
    //   }
    // );
    //
    // const apiKey = normalizeApiKeyPayload(response.data?.data ?? response.data);
    //
    // this.emit('response', {
    //   type: 'keys.update',
    //   data: { id: apiKey.id }
    // });
    //
    // return { api_key: apiKey };
  }

  /**
   * Delete an API key
   * @param params - The parameters for deleting an API key
   * @returns A promise that resolves when the API key is deleted
   */
  public async delete(params: { id: string }): Promise<{ success: boolean }> {
    // Validate ID
    if (!params.id) {
      throw new VeniceValidationError('Missing required parameter: id');
    }

    // Emit a request event
    this.emit('request', { type: 'keys.delete', data: { id: params.id } });

    // Make the API request
    const response = await this.http.delete<{ success: boolean }>(
      this.getPath(''),
      { query: { id: params.id } }
    );

    // Emit a response event
    this.emit('response', {
      type: 'keys.delete',
      data: { id: params.id }
    });

    return response.data;
  }

  /**
   * Revoke (delete) an API key (alias for delete)
   * @param id - The ID of the API key to revoke
   * @returns A promise that resolves when the API key is revoked
   */
  public async revoke(id: string): Promise<void> {
    // Validate ID
    if (!id) {
      throw new VeniceValidationError('Missing required parameter: id');
    }

    // Emit a request event
    this.emit('request', { type: 'keys.revoke', data: { id } });

    // Make the API request
    await this.http.delete(this.getPath(''), { query: { id } });

    // Emit a response event
    this.emit('response', {
      type: 'keys.revoke',
      data: { id }
    });
  }

  //=============================================================================
  // Rate Limit Operations
  //=============================================================================

  /**
   * Get API key rate limits
   * @returns A promise that resolves to the rate limits
   */
  public async getRateLimits(): Promise<{ data: any }> {
    // Emit a request event
    this.emit('request', { type: 'keys.rateLimits' });

    // Make the API request
    const response = await this.http.get<{ data: any }>(
      this.getPath('/rate_limits')
    );

    // Emit a response event
    this.emit('response', {
      type: 'keys.rateLimits',
      data: { success: true }
    });

    return response.data;
  }

  /**
   * Get API key rate limit logs
   * @returns A promise that resolves to the rate limit logs
   */
  public async getRateLimitLogs(): Promise<ListRateLimitLogsResponse> {
    // Emit a request event
    this.emit('request', { type: 'keys.rateLimitLogs' });

    // Make the API request
    const response = await this.http.get<ListRateLimitLogsResponse>(
      this.getPath('/rate_limits/log')
    );

    // Emit a response event
    this.emit('response', {
      type: 'keys.rateLimitLogs',
      data: { count: response.data.data.length }
    });

    return response.data;
  }

  //=============================================================================
  // Web3 Authentication Operations
  //=============================================================================

  /**
   * Generate a token for web3 authentication
   * @returns A promise that resolves to the generated token
   */
  public async generateWeb3Token(): Promise<GenerateWeb3TokenResponse> {
    // Emit a request event
    this.emit('request', { type: 'keys.generateWeb3Token' });

    // Make the API request
    const response = await this.http.get<{
      success: boolean;
      data: { token: string };
    }>(this.getPath('/generate_web3_key'));

    // Emit a response event
    this.emit('response', {
      type: 'keys.generateWeb3Token',
      data: { success: true }
    });

    // Return the token in the expected format
    return {
      token: response.data.data.token
    };
  }

  /**
   * Create an API key with web3 authentication
   * @param params - The parameters for creating an API key with web3 authentication
   * @returns A promise that resolves to the created API key
   */
  public async createWithWeb3(params: CreateWeb3ApiKeyRequest): Promise<CreateWeb3ApiKeyResponse> {
    // Validate required parameters
    this.validateWeb3Params(params);

    // Emit a request event
    this.emit('request', { type: 'keys.createWithWeb3', data: params });

    // Prepare request payload
    const payload = this.prepareWeb3Payload(params);

    // Make the API request
    const response = await this.http.post<{
      success: boolean;
      data: {
        id: string;
        apiKey: string;
        description: string;
        expiresAt: string | null | undefined;
        apiKeyType: string;
        consumptionLimit: ApiKeyConsumptionLimits;
      };
    }>(this.getPath('/generate_web3_key'), payload);

    const apiKey = normalizeApiKeyPayload(response.data.data, response.data.data.apiKey);

    // Emit a response event
    this.emit('response', {
      type: 'keys.createWithWeb3',
      data: { success: true }
    });

    return {
      api_key: apiKey
    };
  }

  /**
   * Validate web3 authentication parameters
   * @param params - The parameters to validate
   * @throws VeniceValidationError if any required parameter is missing
   */
  private validateWeb3Params(params: CreateWeb3ApiKeyRequest): void {
    if (!params.address) {
      throw new VeniceValidationError('Missing required parameter: address');
    }
    if (!params.signature) {
      throw new VeniceValidationError('Missing required parameter: signature');
    }
    if (!params.token) {
      throw new VeniceValidationError('Missing required parameter: token');
    }
  }

  /**
   * Prepare web3 authentication payload
   * @param params - The parameters to prepare
   * @returns The prepared payload
   */
  private prepareWeb3Payload(params: CreateWeb3ApiKeyRequest): any {
    return {
      address: params.address,
      signature: params.signature,
      token: params.token,
      description: params.description || 'Web3 API Key',
      apiKeyType: params.apiKeyType || 'INFERENCE',
      expiresAt: params.expiresAt,
      consumptionLimit: params.consumptionLimit
    };
  }
}

// Default export
export default KeysEndpoint;
