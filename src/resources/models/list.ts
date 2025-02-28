/**
 * Models List Resource
 * 
 * This module provides methods for interacting with the Models List API.
 * It allows you to retrieve available models and their capabilities.
 * 
 * @example
 * ```typescript
 * import { VeniceAI } from 'venice-ai-sdk-apl';
 * 
 * const venice = new VeniceAI({
 *   apiKey: 'your-api-key',
 * });
 * 
 * // List available models
 * const response = await venice.models.list();
 * 
 * console.log(response.data);
 * ```
 */

import { BaseResource } from '../base-resource';
import { ListModelsResponse } from '../../types/models';

/**
 * Models List Resource
 */
export class ModelsListResource extends BaseResource {
  /**
   * Lists available models
   * 
   * @returns Promise that resolves with the list of available models
   * 
   * @example
   * ```typescript
   * const response = await venice.models.list();
   * ```
   */
  public async list(): Promise<ListModelsResponse> {
    return this.get<ListModelsResponse>('/models');
  }
}