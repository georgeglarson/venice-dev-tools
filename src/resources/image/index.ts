/**
 * Image Resource
 * 
 * This module provides access to the Image API resources.
 */

import { HttpClient } from '../../utils/http';
import { ImageGenerateResource } from './generate';
import { ImageUpscaleResource } from './upscale';
import { ImageStylesResource } from './styles';
import { GenerateImageParams, GenerateImageResponse, UpscaleImageParams, UpscaleImageResponse } from '../../types/image';

/**
 * Image Resource
 */
export class ImageResource {
  /**
   * Image generation resource
   */
  private generateResource: ImageGenerateResource;

  /**
   * Image upscale resource
   */
  private upscaleResource: ImageUpscaleResource;

  /**
   * Image styles resource
   */
  public styles: ImageStylesResource;

  /**
   * Creates a new image resource
   * 
   * @param http - HTTP client
   */
  constructor(http: HttpClient) {
    this.generateResource = new ImageGenerateResource(http);
    this.upscaleResource = new ImageUpscaleResource(http);
    this.styles = new ImageStylesResource(http);
  }

  /**
   * Generates an image based on a text prompt
   * 
   * @param params - Parameters for generating an image
   * @returns Promise that resolves with the generated image
   * 
   * @example
   * ```typescript
   * const response = await venice.image.generate({
   *   model: 'fluently-xl',
   *   prompt: 'A beautiful sunset over a mountain range'
   * });
   * ```
   */
  public generate(params: GenerateImageParams): Promise<GenerateImageResponse> {
    return this.generateResource.generate(params);
  }

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
   *   image: base64EncodedImage
   * });
   * ```
   */
  public upscale(params: UpscaleImageParams): Promise<UpscaleImageResponse> {
    return this.upscaleResource.upscale(params);
  }
}