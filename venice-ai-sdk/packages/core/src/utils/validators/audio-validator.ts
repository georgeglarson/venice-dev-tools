import { BaseValidator } from './base-validator';
import type { CreateSpeechRequest } from '../../types/audio';
import { VeniceValidationError } from '../../errors';

/**
 * Validator for audio API requests
 */
export class AudioValidator extends BaseValidator {
  /**
   * Validate a speech creation request
   */
  public validate(request: CreateSpeechRequest): void {
    this.validateRequired(request, 'request');
    this.validateObject(request, 'request');

    this.validateString(request.input, 'input');
    
    if (request.input.length > 4096) {
      throw new VeniceValidationError(
        'input must be 4096 characters or less',
        { input: 'Must be 4096 characters or less' }
      );
    }

    this.validateString(request.model, 'model');
    this.validateString(request.voice, 'voice');

    if (request.response_format !== undefined) {
      this.validateEnum(
        request.response_format,
        'response_format',
        ['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm']
      );
    }

    if (request.speed !== undefined) {
      this.validateNumber(request.speed, 'speed', 0.25, 4.0);
    }
  }
}
