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
   * @param options - Options for listing models
   * @param options.type - Filter models by type (all, text, code, image)
   * @returns Promise that resolves with the list of available models
   *
   * @example
   * ```typescript
   * // List all models
   * const allModels = await venice.models.list();
   *
   * // List only image models
   * const imageModels = await venice.models.list({ type: 'image' });
   * ```
   */
  public async list(options?: { type?: 'all' | 'text' | 'code' | 'image' }): Promise<ListModelsResponse> {
    const query: Record<string, string | number | boolean | undefined> = {};
    
    if (options?.type) {
      query.type = options.type;
    }
    
    return this.get<ListModelsResponse>('/models', query);
  }
}