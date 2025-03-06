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
import { RequestParams } from '../../types/common';
import FormData from 'form-data';
import axios from 'axios';
import { ApiError } from '../../errors/api-error';

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

    // Determine if we should return binary data
    const returnBinary = params.return_binary === true;
    
    try {
      // Create a FormData object for multipart/form-data
      const formData = new FormData();
      
      // Add the image to the form data
      if (typeof params.image === 'object' && Buffer.isBuffer(params.image)) {
        // If it's a Buffer, add it directly to the form data
        formData.append('image', params.image, 'image.jpg');
      } else if (typeof params.image === 'string') {
        // If it's a base64 string, convert it to a Buffer first
        const imageBuffer = Buffer.from(params.image, 'base64');
        formData.append('image', imageBuffer, 'image.jpg');
      } else {
        throw new ValidationError({
          message: 'Image must be a Buffer or base64 string',
          field: 'image',
        });
      }
      
      // Add other parameters to the form data
      if (params.model) {
        formData.append('model', params.model);
      }
      
      if (params.scale) {
        formData.append('scale', params.scale.toString());
      }
      
      // Get the base URL and API key from the HTTP client
      const baseUrl = this.http.getBaseURL();
      const apiKey = this.http.getApiKey();
      
      // Make the request directly with axios
      const response = await axios({
        method: 'post',
        url: `${baseUrl}/image/upscale`,
        data: formData,
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'Venice-AI-SDK-APL/0.1.0'
        },
        responseType: returnBinary ? 'arraybuffer' : 'json'
      });
      
      // Return the response data
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error in upscale:', error.message);
      } else {
        console.error('Unknown error in upscale');
      }
      
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError({
          message: error.response.data?.error || 'API request failed',
          status: error.response.status,
          code: 'API_ERROR',
          data: error.response.data
        });
      }
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error in upscale');
      }
    }
  }
}