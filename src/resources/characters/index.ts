/**
 * Characters Resource
 * 
 * This module provides access to the Characters API resources.
 */

import { HttpClient } from '../../utils/http';
import { BaseResource } from '../base-resource';
import { ListCharactersResponse } from '../../types/characters';

/**
 * Characters Resource
 */
export class CharactersResource extends BaseResource {
  /**
   * Creates a new characters resource
   * 
   * @param http - HTTP client
   */
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Lists available characters
   *
   * @param options - Options for filtering characters
   * @param options.isWebEnabled - Filter by web-enabled status
   * @param options.isAdult - Filter by adult content status
   * @returns Promise that resolves with the list of available characters
   *
   * @example
   * ```typescript
   * // List all characters
   * const response = await venice.characters.list();
   *
   * // List only web-enabled characters
   * const webEnabledCharacters = await venice.characters.list({ isWebEnabled: true });
   *
   * // List non-adult characters
   * const familyFriendlyCharacters = await venice.characters.list({ isAdult: false });
   * ```
   */
  public async list(options?: { isWebEnabled?: boolean; isAdult?: boolean }): Promise<ListCharactersResponse> {
    const queryParams = new URLSearchParams();
    
    if (options?.isWebEnabled !== undefined) {
      queryParams.append('isWebEnabled', options.isWebEnabled.toString());
    }
    
    if (options?.isAdult !== undefined) {
      queryParams.append('isAdult', options.isAdult.toString());
    }
    
    const queryString = queryParams.toString();
    return this.get(`/characters${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Gets a character by slug
   *
   * @param slug - Character slug
   * @returns Promise that resolves with the character
   *
   * @example
   * ```typescript
   * const character = await venice.characters.getCharacter('assistant');
   * ```
   */
  public async getCharacter(slug: string): Promise<ListCharactersResponse> {
    return this.get(`/characters/${slug}`);
  }
}