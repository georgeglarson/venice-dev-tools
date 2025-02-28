/**
 * Image Generation Resource
 * 
 * This module provides methods for interacting with the Image Generation API.
 * It allows you to generate images based on text prompts.
 * 
 * @example
 * ```typescript
 * import { VeniceAI } from 'venice-ai-sdk-apl';
 * 
 * const venice = new VeniceAI({
 *   apiKey: 'your-api-key',
 * });
 * 
 * // Generate an image
 * const response = await venice.image.generate({
 *   model: 'fluently-xl',
 *   prompt: 'A beautiful sunset over a mountain range',
 *   negative_prompt: 'Clouds, Rain, Snow',
 *   style_preset: '3D Model',
 *   height: 1024,
 *   width: 1024
 * });
 * 
 * console.log(response.images[0].url);
 * ```
 */

import { BaseResource } from '../base-resource';
import { GenerateImageParams, GenerateImageResponse } from '../../types/image';
import { ValidationError } from '../../errors/validation-error';

/**
 * Image Generation Resource
 */
export class ImageGenerateResource extends BaseResource {
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
   *   prompt: 'A beautiful sunset over a mountain range',
   *   negative_prompt: 'Clouds, Rain, Snow',
   *   style_preset: '3D Model',
   *   height: 1024,
   *   width: 1024
   * });
   * ```
   */
  public async generate(params: GenerateImageParams): Promise<GenerateImageResponse> {
    // Validate required parameters
    if (!params.model) {
      throw new ValidationError({
        message: 'Model is required',
        field: 'model',
      });
    }

    if (!params.prompt) {
      throw new ValidationError({
        message: 'Prompt is required',
        field: 'prompt',
      });
    }

    // Validate image dimensions if provided
    if (params.height && (params.height < 256 || params.height > 2048 || params.height % 8 !== 0)) {
      throw new ValidationError({
        message: 'Height must be between 256 and 2048 and a multiple of 8',
        field: 'height',
        expected: 'Multiple of 8 between 256 and 2048',
        actual: params.height.toString(),
      });
    }

    if (params.width && (params.width < 256 || params.width > 2048 || params.width % 8 !== 0)) {
      throw new ValidationError({
        message: 'Width must be between 256 and 2048 and a multiple of 8',
        field: 'width',
        expected: 'Multiple of 8 between 256 and 2048',
        actual: params.width.toString(),
      });
    }

    // Validate steps if provided
    if (params.steps && (params.steps < 10 || params.steps > 150)) {
      throw new ValidationError({
        message: 'Steps must be between 10 and 150',
        field: 'steps',
        expected: 'Between 10 and 150',
        actual: params.steps.toString(),
      });
    }

    // Validate cfg_scale if provided
    if (params.cfg_scale && (params.cfg_scale < 0 || params.cfg_scale > 35)) {
      throw new ValidationError({
        message: 'CFG scale must be between 0 and 35',
        field: 'cfg_scale',
        expected: 'Between 0 and 35',
        actual: params.cfg_scale.toString(),
      });
    }

    // Validate lora_strength if provided
    if (params.lora_strength && (params.lora_strength < 0 || params.lora_strength > 100)) {
      throw new ValidationError({
        message: 'LoRA strength must be between 0 and 100',
        field: 'lora_strength',
        expected: 'Between 0 and 100',
        actual: params.lora_strength.toString(),
      });
    }

    return this.post<GenerateImageResponse>('/image/generate', params);
  }
}