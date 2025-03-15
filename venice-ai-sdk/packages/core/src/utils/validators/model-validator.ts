import { 
  ModelRequest, 
  ListModelsParams 
} from '../../types/models';
import { BaseValidator } from './base-validator';

/**
 * Validator for model-related requests.
 */
export class ModelValidator extends BaseValidator {
  /**
   * Validate a model request.
   * @param request - The request to validate.
   * @throws VeniceValidationError if the request is invalid.
   */
  public validateModelRequest(request: ModelRequest): void {
    this.validateRequired(request, 'request');
    this.validateString(request.model, 'model');
    this.validateString(request.prompt, 'prompt');
    
    if (request.max_tokens !== undefined) {
      this.validateNumber(request.max_tokens, 'max_tokens', 1);
    }
    
    if (request.temperature !== undefined) {
      this.validateNumber(request.temperature, 'temperature', 0, 2);
    }
    
    if (request.top_p !== undefined) {
      this.validateNumber(request.top_p, 'top_p', 0, 1);
    }
    
    if (request.n !== undefined) {
      this.validateNumber(request.n, 'n', 1);
    }
    
    if (request.stream !== undefined) {
      this.validateBoolean(request.stream, 'stream');
    }
    
    if (request.logprobs !== undefined) {
      this.validateNumber(request.logprobs, 'logprobs', 0);
    }
    
    if (request.echo !== undefined) {
      this.validateBoolean(request.echo, 'echo');
    }
    
    if (request.stop !== undefined) {
      this.validateNonEmptyArray(request.stop, 'stop');
      request.stop.forEach((stop, index) => {
        this.validateString(stop, `stop[${index}]`);
      });
    }
    
    if (request.presence_penalty !== undefined) {
      this.validateNumber(request.presence_penalty, 'presence_penalty', -2, 2);
    }
    
    if (request.frequency_penalty !== undefined) {
      this.validateNumber(request.frequency_penalty, 'frequency_penalty', -2, 2);
    }
    
    if (request.best_of !== undefined) {
      this.validateNumber(request.best_of, 'best_of', 1);
    }
    
    if (request.logit_bias !== undefined) {
      this.validateObject(request.logit_bias, 'logit_bias');
      
      // Validate each logit bias value
      Object.entries(request.logit_bias).forEach(([token, value]) => {
        this.validateNumber(value, `logit_bias[${token}]`, -100, 100);
      });
    }
    
    if (request.user !== undefined) {
      this.validateString(request.user, 'user');
    }
  }

  /**
   * Validate parameters for listing models.
   * @param params - The parameters to validate.
   * @throws VeniceValidationError if the parameters are invalid.
   */
  public validateListModelsParams(params: ListModelsParams): void {
    if (params.type !== undefined) {
      this.validateEnum(params.type, 'type', ['text', 'image', 'all', 'code']);
    }
  }
}

export default ModelValidator;