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
    const response = await this.http.get<ListApiKeysResponse>(
      this.getPath('')
    );

    // Emit a response event
    this.emit('response', {
      type: 'keys.list',
      data: { count: response.data.api_keys ? response.data.api_keys.length : 0 }
    });

    return response.data;
  }

  /**
   * Create a new API key
   * @param request - The request to create a new API key
   * @returns A promise that resolves to the created API key
   */
  public async create(request: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    // Validate request
    if (!request.name) {
      throw new VeniceValidationError('Missing required parameter: name');
    }

    // Emit a request event
    this.emit('request', { type: 'keys.create', data: request });

    // Make the API request
    const response = await this.http.post<CreateApiKeyResponse>(
      this.getPath(''),
      request
    );

    // Emit a response event
    this.emit('response', {
      type: 'keys.create',
      data: { success: true }
    });

    return response.data;
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
    const response = await this.http.get<{ api_key: ApiKey }>(
      this.getPath(`/${id}`)
    );

    // Emit a response event
    this.emit('response', {
      type: 'keys.retrieve',
      data: { id: response.data.api_key.id }
    });

    return response.data;
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

    // Make the API request
    const response = await this.http.request<UpdateApiKeyResponse>(
      this.getPath(`/${id}`),
      {
        method: 'PATCH',
        body: request
      }
    );

    // Emit a response event
    this.emit('response', {
      type: 'keys.update',
      data: { id: response.data.api_key.id }
    });

    return response.data;
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
        expiresAt: string | undefined;
        apiKeyType: string;
        consumptionLimit: {
          vcu: number | null;
          usd: number | null;
        };
      };
    }>(this.getPath('/generate_web3_key'), payload);

    // Emit a response event
    this.emit('response', {
      type: 'keys.createWithWeb3',
      data: { success: true }
    });

    // Return the API key in the expected format
    return {
      api_key: {
        id: response.data.data.id,
        key: response.data.data.apiKey,
        name: response.data.data.description,
        created_at: new Date().toISOString(),
        expires_at: response.data.data.expiresAt
      }
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
