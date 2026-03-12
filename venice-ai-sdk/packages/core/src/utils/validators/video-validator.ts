import { BaseValidator } from './base-validator';
import type { CreateVideoRequest } from '../../types/video';
import { VeniceValidationError } from '../../errors';

/**
 * Validator for video API requests
 */
export class VideoValidator extends BaseValidator {
  /**
   * Validate a video generation request
   */
  public validate(request: CreateVideoRequest): void {
    this.validateRequired(request, 'request');
    this.validateObject(request, 'request');
    this.validateString(request.model, 'model');
    this.validateString(request.prompt, 'prompt');

    if (request.prompt.length > 2500) {
      throw new VeniceValidationError(
        'prompt must be 2500 characters or less',
        { prompt: 'Must be 2500 characters or less' }
      );
    }
  }
}
