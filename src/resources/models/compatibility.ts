/**
 * Models Compatibility Resource
 * 
 * This module provides methods for interacting with the Models Compatibility API.
 * It allows you to retrieve model compatibility mappings.
 * 
 * @example
 * ```typescript
 * import { VeniceAI } from 'venice-ai-sdk-apl';
 * 
 * const venice = new VeniceAI({
 *   apiKey: 'your-api-key',
 * });
 * 
 * // List model compatibility mappings
 * const response = await venice.models.compatibility();
 * 
 * console.log(response.mappings);
 * ```
 */

import { BaseResource } from '../base-resource';
import { ListModelCompatibilityMappingsResponse } from '../../types/models';

/**
 * Models Compatibility Resource
 */
export class ModelsCompatibilityResource extends BaseResource {
  /**
   * Lists model compatibility mappings
   * 
   * @returns Promise that resolves with the list of model compatibility mappings
   * 
   * @example
   * ```typescript
   * const response = await venice.models.compatibility();
   * ```
   */
  public async list(): Promise<ListModelCompatibilityMappingsResponse> {
    try {
      const response = await this.get<any>('/models/compatibility_mapping');
      
      // Ensure the response has the expected structure
      if (!response.mappings) {
        return {
          mappings: [],
          _metadata: response._metadata
        };
      }
      
      return response;
    } catch (error) {
      // If the endpoint is not available, return an empty response
      return {
        mappings: []
      };
    }
  }
}