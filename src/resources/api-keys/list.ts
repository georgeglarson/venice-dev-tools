/**
 * API Keys List Resource
 * 
 * This module provides methods for interacting with the API Keys List API.
 * It allows you to retrieve your API keys.
 * 
 * @example
 * ```typescript
 * import { VeniceAI } from 'venice-ai-sdk-apl';
 * 
 * const venice = new VeniceAI({
 *   apiKey: 'your-api-key',
 * });
 * 
 * // List API keys
 * const response = await venice.apiKeys.list();
 * 
 * console.log(response.keys);
 * ```
 */

import { BaseResource } from '../base-resource';
import { ListApiKeysResponse } from '../../types/api-keys';
import { Logger } from '../../utils/logger';

/**
 * API Keys List Resource
 */
export class ApiKeysListResource extends BaseResource {
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
  public async list(): Promise<ListApiKeysResponse> {
    try {
      Logger.debug('Fetching API keys');
      const response = await this.get<any>('/api_keys');
      
      // Handle different response structures
      // The API might return keys in a 'data' array (like models endpoint)
      // or in a 'keys' array as expected
      if (response.data && Array.isArray(response.data)) {
        Logger.debug(`Found ${response.data.length} API keys in 'data' array`);
        
        // Convert to expected format
        return {
          keys: response.data,
          _metadata: response._metadata
        };
      } else if (response.keys && Array.isArray(response.keys)) {
        // Standard expected format
        Logger.debug(`Found ${response.keys.length} API keys in 'keys' array`);
        return response;
      } else {
        // No recognizable keys array
        Logger.warn('API keys response missing keys array', response);
        
        return {
          keys: [],
          _metadata: response._metadata
        };
      }
    } catch (error) {
      // Log the error but rethrow it so the caller can handle it
      Logger.error('Error fetching API keys', error);
      throw error;
    }
  }
  
  /**
   * Gets a specific API key by ID
   * 
   * @param id - API key ID
   * @returns Promise that resolves with the API key details
   * 
   * @example
   * ```typescript
   * const key = await venice.apiKeys.list.getKey('api-key-id');
   * ```
   */
  public async getKey(id: string): Promise<any> {
    try {
      Logger.debug(`Fetching API key: ${id}`);
      const response = await this.get<any>(`/api_keys/${id}`);
      
      return response;
    } catch (error) {
      Logger.error(`Error fetching API key: ${id}`, error);
      
      throw error;
    }
  }
}