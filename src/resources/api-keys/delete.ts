/**
 * API Keys Delete Resource
 * 
 * This module provides methods for interacting with the API Keys Delete API.
 * It allows you to delete API keys.
 * 
 * @example
 * ```typescript
 * import { VeniceAI } from 'venice-ai-sdk-apl';
 * 
 * const venice = new VeniceAI({
 *   apiKey: 'your-api-key',
 * });
 * 
 * // Delete an API key
 * const response = await venice.apiKeys.delete({
 *   id: 'api-key-id'
 * });
 * 
 * console.log(response.success);
 * ```
 */

import { BaseResource } from '../base-resource';
import { DeleteApiKeyParams, DeleteApiKeyResponse } from '../../types/api-keys';
import { ValidationError } from '../../errors/validation-error';

/**
 * API Keys Delete Resource
 */
export class ApiKeysDeleteResource extends BaseResource {
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
  public async deleteKey(params: DeleteApiKeyParams): Promise<DeleteApiKeyResponse> {
    // Validate required parameters
    if (!params.id) {
      throw new ValidationError({
        message: 'ID is required',
        field: 'id',
      });
    }

    return this.delete('/api_keys', { id: params.id });
  }
}