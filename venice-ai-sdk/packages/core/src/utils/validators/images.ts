import { ImageRequest } from '../../types';
import { 
  validateRequired, 
  validateString, 
  validateNumber, 
  validateNonEmptyArray,
  validateEnum
} from '../validation';
import { VeniceValidationError } from '../../errors';

/**
 * Validates an image request
 */
export function validateImageRequest(request: ImageRequest): void {
  validateRequired(request, 'request');
  validateString(request.model, 'model');
  validateNumber(request.n, 'n', 1, 10);
  validateNumber(request.size, 'size', 256, 1024);
  validateEnum(request.response_format, 'response_format', ['url', 'b64_json']);
  
  if (request.user !== undefined) {
    validateString(request.user, 'user');
  }
  
  if (request.prompt !== undefined) {
    validateString(request.prompt, 'prompt');
  }
  
  if (request.negative_prompt !== undefined) {
    validateString(request.negative_prompt, 'negative_prompt');
  }
  
  if (request.style !== undefined) {
    validateString(request.style, 'style');
  }
  
  if (request.quality !== undefined) {
    validateEnum(request.quality, 'quality', ['standard', 'high', 'ultra']);
  }
  
  if (request.safety !== undefined) {
    validateEnum(request.safety, 'safety', ['low', 'medium', 'high']);
  }
  
  if (request.copyright !== undefined) {
    validateEnum(request.copyright, 'copyright', ['free', 'commercial']);
  }
  
  if (request.watermark !== undefined) {
    validateEnum(request.watermark, 'watermark', ['none', 'low', 'high']);
  }
  
  if (request.metadata !== undefined) {
    validateNonEmptyArray(request.metadata, 'metadata');
    
    request.metadata.forEach((metadata: { key: string; value: string }, index: number) => {
      validateString(metadata.key, `metadata[${index}].key`);
      validateString(metadata.value, `metadata[${index}].value`);
    });
  }
}