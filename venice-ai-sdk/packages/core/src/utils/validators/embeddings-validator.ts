import { BaseValidator } from './base-validator';
import type { CreateEmbeddingRequest } from '../../types/embeddings';
import { VeniceValidationError } from '../../errors';

/**
 * Validator for embeddings API requests
 */
export class EmbeddingsValidator extends BaseValidator {
  /**
   * Validate an embeddings creation request
   */
  public validate(request: CreateEmbeddingRequest): void {
    this.validateRequired(request, 'request');
    this.validateObject(request, 'request');

    if (typeof request.input === 'string') {
      this.validateString(request.input, 'input');
    } else if (Array.isArray(request.input)) {
      this.validateNonEmptyArray(request.input, 'input');
      request.input.forEach((item, index) => {
        this.validateString(item, `input[${index}]`);
      });
    } else {
      throw new VeniceValidationError(
        'input must be a string or array of strings'
      );
    }

    if (request.model !== undefined) {
      this.validateString(request.model, 'model');
    }

    if (request.encoding_format !== undefined) {
      this.validateEnum(
        request.encoding_format,
        'encoding_format',
        ['float', 'base64']
      );
    }

    if (request.dimensions !== undefined) {
      this.validateNumber(request.dimensions, 'dimensions', 1);
    }

    if (request.user !== undefined) {
      this.validateString(request.user, 'user');
    }
  }
}
