/**
 * API Keys Resource
 * 
 * This module provides access to the API Keys API resources.
 */

import { HttpClient } from '../../utils/http';
import { ApiKeysListResource } from './list';
import { ApiKeysCreateResource } from './create';
import { ApiKeysDeleteResource } from './delete';
import { ApiKeysRateLimitsResource } from './rate-limits';
import { Web3ApiKeyResource } from './web3';
import { 
  ListApiKeysResponse, 
  CreateApiKeyParams, 
  CreateApiKeyResponse,
  DeleteApiKeyParams,
  DeleteApiKeyResponse,
  GetApiKeyRateLimitsResponse
} from '../../types/api-keys';

/**
 * API Keys Resource
 */
export class ApiKeysResource {
  /**
   * API keys list resource
   */
  private listResource: ApiKeysListResource;

  /**
   * API keys create resource
   */
  private createResource: ApiKeysCreateResource;

  /**
   * API keys delete resource
   */
  private deleteResource: ApiKeysDeleteResource;

  /**
   * API keys rate limits resource
   */
  private rateLimitsResource: ApiKeysRateLimitsResource;

  /**
   * Web3 API key resource
   */
  public web3: Web3ApiKeyResource;

  /**
   * Creates a new API keys resource
   * 
   * @param http - HTTP client
   */
  constructor(http: HttpClient) {
    this.listResource = new ApiKeysListResource(http);
    this.createResource = new ApiKeysCreateResource(http);
    this.deleteResource = new ApiKeysDeleteResource(http);
    this.rateLimitsResource = new ApiKeysRateLimitsResource(http);
    this.web3 = new Web3ApiKeyResource(http);
  }

  /**
   * Lists your API keys
   * 
   * @returns Promise that resolves with the list of API keys
   * 
   * @example
   * ```typescript
   * const response = await venice.apiKeys.list();
   * ```
   */
  public list(): Promise<ListApiKeysResponse> {
    return this.listResource.list();
  }

  /**
   * Creates a new API key
   * 
   * @param params - Parameters for creating an API key
   * @returns Promise that resolves with the created API key
   * 
   * @example
   * ```typescript
   * const response = await venice.apiKeys.create({
   *   name: 'My New API Key'
   * });
   * ```
   */
  public create(params: CreateApiKeyParams): Promise<CreateApiKeyResponse> {
    return this.createResource.create(params);
  }

  /**
   * Deletes an API key
   * 
   * @param params - Parameters for deleting an API key
   * @returns Promise that resolves with the deletion result
   * 
   * @example
   * ```typescript
   * const response = await venice.apiKeys.delete({
   *   id: 'api-key-id'
   * });
   * ```
   */
  public delete(params: DeleteApiKeyParams): Promise<DeleteApiKeyResponse> {
    return this.deleteResource.deleteKey(params);
  }

  /**
   * Gets rate limits for your API keys
   * 
   * @returns Promise that resolves with the API key rate limits
   * 
   * @example
   * ```typescript
   * const response = await venice.apiKeys.rateLimits();
   * ```
   */
  public rateLimits(): Promise<GetApiKeyRateLimitsResponse> {
    return this.rateLimitsResource.getRateLimits();
  }

  /**
   * Gets rate limits for a specific model
   * 
   * @param modelId - Model ID
   * @returns Promise that resolves with the rate limits for the specified model
   * 
   * @example
   * ```typescript
   * const limits = await venice.apiKeys.getModelRateLimits('llama-3.3-70b');
   * ```
   */
  public getModelRateLimits(modelId: string): Promise<any> {
    return this.rateLimitsResource.getModelRateLimits(modelId);
  }
}