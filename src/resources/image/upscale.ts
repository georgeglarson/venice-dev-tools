/**
 * Image Upscale Resource
 * 
 * This module provides methods for interacting with the Image Upscale API.
 * It allows you to upscale images to higher resolutions.
 * 
 * @example
 * ```typescript
 * import { VeniceAI } from 'venice-ai-sdk-apl';
 * import fs from 'fs';
 * 
 * const venice = new VeniceAI({
 *   apiKey: 'your-api-key',
 * });
 * 
 * // Upscale an image
 * const imageBuffer = fs.readFileSync('image.jpg');
 * const base64Image = imageBuffer.toString('base64');
 * 
 * const response = await venice.image.upscale({
 *   model: 'upscale-model',
 *   image: base64Image,
 *   scale: 2
 * });
 * 
 * console.log(response.url);
 * ```
 */

import { BaseResource } from '../base-resource';
import { UpscaleImageParams, UpscaleImageResponse } from '../../types/image';
import { ValidationError } from '../../errors/validation-error';

/**
 * Image Upscale Resource
 */
export class ImageUpscaleResource extends BaseResource {
  /**
   * Upscales an image to a higher resolution
   * 
   * @param params - Parameters for upscaling an image
   * @returns Promise that resolves with the upscaled image
   * 
   * @example
   * ```typescript
   * const response = await venice.image.upscale({
   *   model: 'upscale-model',
   *   image: base64EncodedImage,
   *   scale: 2
   * });
   * ```
   */
  public async upscale(params: UpscaleImageParams): Promise<UpscaleImageResponse> {
    // Validate required parameters
    if (!params.model) {
      throw new ValidationError({
        message: 'Model is required',
        field: 'model',
      });
    }

    if (!params.image) {
      throw new ValidationError({
        message: 'Image is required',
        field: 'image',
      });
    }

    // Validate scale if provided
    if (params.scale && (params.scale < 1 || params.scale > 4)) {
      throw new ValidationError({
        message: 'Scale must be between 1 and 4',
        field: 'scale',
        expected: 'Between 1 and 4',
        actual: params.scale.toString(),
      });
    }

    return this.post<UpscaleImageResponse>('/image/upscale', params);
  }
}