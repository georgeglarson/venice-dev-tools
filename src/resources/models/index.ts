/**
 * Models Resource
 * 
 * This module provides access to the Models API resources.
 */

import { HttpClient } from '../../utils/http';
import { ModelsListResource } from './list';
import { ModelsTraitsResource } from './traits';
import { ModelsCompatibilityResource } from './compatibility';
import { ListModelsResponse, ListModelTraitsResponse, ListModelCompatibilityMappingsResponse } from '../../types/models';

/**
 * Models Resource
 */
export class ModelsResource {
  /**
   * Models list resource
   */
  private listResource: ModelsListResource;

  /**
   * Models traits resource
   */
  private traitsResource: ModelsTraitsResource;

  /**
   * Models compatibility resource
   */
  private compatibilityResource: ModelsCompatibilityResource;

  /**
   * Creates a new models resource
   * 
   * @param http - HTTP client
   */
  constructor(http: HttpClient) {
    this.listResource = new ModelsListResource(http);
    this.traitsResource = new ModelsTraitsResource(http);
    this.compatibilityResource = new ModelsCompatibilityResource(http);
  }

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
  public list(): Promise<ListModelsResponse> {
    return this.listResource.list();
  }

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
  public traits(): Promise<ListModelTraitsResponse> {
    return this.traitsResource.list();
  }

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
  public compatibility(): Promise<ListModelCompatibilityMappingsResponse> {
    return this.compatibilityResource.list();
  }
}