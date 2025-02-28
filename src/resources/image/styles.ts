/**
 * Image Styles Resource
 * 
 * This module provides methods for interacting with the Image Styles API.
 * It allows you to retrieve available image generation styles.
 * 
 * @example
 * ```typescript
 * import { VeniceAI } from 'venice-ai-sdk-apl';
 * 
 * const venice = new VeniceAI({
 *   apiKey: 'your-api-key',
 * });
 * 
 * // List available image styles
 * const response = await venice.image.styles.list();
 * 
 * console.log(response.styles);
 * ```
 */

import { BaseResource } from '../base-resource';
import { ListImageStylesResponse, ImageStyle } from '../../types/image';
import { Logger } from '../../utils/logger';

/**
 * Image Styles Resource
 */
export class ImageStylesResource extends BaseResource {
  /**
   * Lists available image generation styles
   * 
   * @returns Promise that resolves with the list of available styles
   * 
   * @example
   * ```typescript
   * const response = await venice.image.styles.list();
   * ```
   */
  public async list(): Promise<ListImageStylesResponse> {
    try {
      Logger.debug('Fetching image styles');
      const response = await this.get<any>('/image/styles');
      
      // Handle the new response format (array of strings)
      if (response.data && Array.isArray(response.data)) {
        Logger.debug(`Found ${response.data.length} image styles in new format`);
        
        // Convert the array of strings to the expected format
        const styles = response.data.map((styleName: string) => {
          return {
            id: styleName.toLowerCase().replace(/\s+/g, '-'),
            name: styleName,
            description: `${styleName} style for image generation`
          };
        });
        
        return {
          styles,
          _metadata: response._metadata
        };
      }
      
      // Handle the original expected format
      if (!response.styles) {
        Logger.warn('Image styles response missing styles array', response);
        
        return {
          styles: [],
          _metadata: response._metadata
        };
      }
      
      Logger.debug(`Found ${response.styles.length} image styles`);
      return response;
    } catch (error) {
      // If the endpoint is not available, return an empty response
      Logger.error('Error fetching image styles', error);
      
      return {
        styles: []
      };
    }
  }
  
  /**
   * Gets a specific image style by ID
   * 
   * @param id - Style ID
   * @returns Promise that resolves with the style details
   * 
   * @example
   * ```typescript
   * const style = await venice.image.styles.getStyle('3d-model');
   * ```
   */
  public async getStyle(id: string): Promise<ImageStyle> {
    try {
      Logger.debug(`Fetching image style: ${id}`);
      
      // First, get all styles
      const allStyles = await this.list();
      
      // Find the style with the matching ID
      const style = allStyles.styles.find(s => s.id === id);
      
      if (!style) {
        Logger.warn(`Style not found: ${id}`);
        throw new Error(`Style not found: ${id}`);
      }
      
      return style;
    } catch (error) {
      Logger.error(`Error fetching image style: ${id}`, error);
      
      throw error;
    }
  }
}