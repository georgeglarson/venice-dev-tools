import {
  ImageRequest,
  GenerateImageRequest,
  UpscaleImageRequest,
  EditImageRequest,
  MultiEditImageRequest,
  RemoveBackgroundRequest
} from '../../types/images';
import { VeniceValidationError } from '../../errors';
import { BaseValidator } from './base-validator';

/**
 * Validator for image-related requests.
 */
export class ImageValidator extends BaseValidator {
  /**
   * Validate an image generation request.
   * @param request - The request to validate.
   * @throws VeniceValidationError if the request is invalid.
   */
  public validateImageRequest(request: ImageRequest): void {
    this.validateRequired(request, 'request');
    this.validateString(request.model, 'model');
    
    if (request.n !== undefined) {
      this.validateNumber(request.n, 'n', 1, 10);
    }
    
    if (request.size !== undefined) {
      this.validateNumber(request.size, 'size', 256, 1024);
    }
    
    if (request.response_format !== undefined) {
      this.validateEnum(request.response_format, 'response_format', ['url', 'b64_json']);
    }
    
    if (request.user !== undefined) {
      this.validateString(request.user, 'user');
    }
    
    if (request.prompt !== undefined) {
      this.validateString(request.prompt, 'prompt');
    }
    
    if (request.negative_prompt !== undefined) {
      this.validateString(request.negative_prompt, 'negative_prompt');
    }
    
    if (request.style !== undefined) {
      this.validateString(request.style, 'style');
    }
    
    if (request.quality !== undefined) {
      this.validateEnum(request.quality, 'quality', ['standard', 'high', 'ultra']);
    }
    
    if (request.safety !== undefined) {
      this.validateEnum(request.safety, 'safety', ['low', 'medium', 'high']);
    }
    
    if (request.copyright !== undefined) {
      this.validateEnum(request.copyright, 'copyright', ['free', 'commercial']);
    }
    
    if (request.watermark !== undefined) {
      this.validateEnum(request.watermark, 'watermark', ['none', 'low', 'high']);
    }
    
    if (request.metadata !== undefined) {
      this.validateImageMetadata(request.metadata);
    }
  }

  /**
   * Validate a generate image request.
   * @param request - The request to validate.
   * @throws VeniceValidationError if the request is invalid.
   */
  public validateGenerateImageRequest(request: GenerateImageRequest): void {
    this.validateImageRequest(request);
    // Add any additional validation specific to GenerateImageRequest here
  }

  /**
   * Validate an upscale image request.
   * @param params - The upscale parameters to validate.
   * @throws VeniceValidationError if the parameters are invalid.
   */
  public validateUpscaleImageParams(params: UpscaleImageRequest): void {
    this.validateRequired(params, 'params');
    this.validateRequired(params.image, 'image');
    
    if (params.scale !== undefined) {
      this.validateEnum(params.scale, 'scale', [2, 4]);
    }
  }

  public validateEditImageRequest(request: EditImageRequest): void {
    this.validateRequired(request, 'request');
    this.validateString(request.prompt, 'prompt');
    if (request.prompt.length > 32768) {
      throw new VeniceValidationError('prompt must be 32768 characters or less', { prompt: 'Must be 32768 characters or less' });
    }
    this.validateRequired(request.image, 'image');
    if (request.aspect_ratio !== undefined) {
      this.validateEnum(request.aspect_ratio, 'aspect_ratio', ['auto', '1:1', '3:2', '16:9', '21:9', '9:16', '2:3', '3:4', '4:5']);
    }
  }

  public validateMultiEditImageRequest(request: MultiEditImageRequest): void {
    this.validateRequired(request, 'request');
    this.validateString(request.prompt, 'prompt');
    if (request.prompt.length > 32768) {
      throw new VeniceValidationError('prompt must be 32768 characters or less', { prompt: 'Must be 32768 characters or less' });
    }
    this.validateNonEmptyArray(request.images, 'images');
    if (request.images.length > 3) {
      throw new VeniceValidationError('images must contain at most 3 items', { images: 'Maximum 3 images allowed' });
    }
  }

  public validateRemoveBackgroundRequest(request: RemoveBackgroundRequest): void {
    this.validateRequired(request, 'request');
    if (!request.image && !request.image_url) {
      throw new VeniceValidationError('Either image or image_url is required');
    }
    if (request.image && request.image_url) {
      throw new VeniceValidationError('Only one of image or image_url should be provided');
    }
    if (request.image_url !== undefined) {
      this.validateUrl(request.image_url, 'image_url');
    }
  }

  /**
   * Validate image metadata.
   * @param metadata - The metadata to validate.
   * @throws VeniceValidationError if the metadata is invalid.
   */
  private validateImageMetadata(metadata: { key: string; value: string }[]): void {
    this.validateNonEmptyArray(metadata, 'metadata');
    
    metadata.forEach((item, index) => {
      this.validateString(item.key, `metadata[${index}].key`);
      this.validateString(item.value, `metadata[${index}].value`);
    });
  }
}

export default ImageValidator;