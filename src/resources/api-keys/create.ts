/**
 * API Keys Create Resource
 * 
 * This module provides methods for interacting with the API Keys Create API.
 * It allows you to create new API keys.
 * 
 * @example
 * ```typescript
 * import { VeniceAI } from 'venice-ai-sdk-apl';
 * 
 * const venice = new VeniceAI({
 *   apiKey: 'your-api-key',
 * });
 * 
 * // Create a new API key
 * const response = await venice.apiKeys.create({
 *   name: 'My New API Key'
 * });
 * 
 * console.log(response.key);
 * ```
 */

import { BaseResource } from '../base-resource';
import { CreateApiKeyParams, CreateApiKeyResponse } from '../../types/api-keys';
import { ValidationError } from '../../errors/validation-error';

/**
 * API Keys Create Resource
 */
export class ApiKeysCreateResource extends BaseResource {
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
  public async create(params: CreateApiKeyParams): Promise<CreateApiKeyResponse> {
    // Validate required parameters
    if (!params.name) {
      throw new ValidationError({
        message: 'Name is required',
        field: 'name',
      });
    }

    return this.post<CreateApiKeyResponse>('/api_keys', params);
  }
}