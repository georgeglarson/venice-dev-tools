/**
 * Models Traits Resource
 * 
 * This module provides methods for interacting with the Models Traits API.
 * It allows you to retrieve available model traits.
 * 
 * @example
 * ```typescript
 * import { VeniceAI } from 'venice-ai-sdk-apl';
 * 
 * const venice = new VeniceAI({
 *   apiKey: 'your-api-key',
 * });
 * 
 * // List available model traits
 * const response = await venice.models.traits();
 * 
 * console.log(response.traits);
 * ```
 */

import { BaseResource } from '../base-resource';
import { ListModelTraitsResponse } from '../../types/models';

/**
 * Models Traits Resource
 */
export class ModelsTraitsResource extends BaseResource {
  /**
   * Lists available model traits
   * 
   * @returns Promise that resolves with the list of available model traits
   * 
   * @example
   * ```typescript
   * const response = await venice.models.traits();
   * ```
   */
  public async list(): Promise<ListModelTraitsResponse> {
    try {
      const response = await this.get<any>('/models/traits');
      
      // Ensure the response has the expected structure
      if (!response.traits) {
        return {
          traits: [],
          _metadata: response._metadata
        };
      }
      
      return response;
    } catch (error) {
      // If the endpoint is not available, return an empty response
      return {
        traits: []
      };
    }
  }
}