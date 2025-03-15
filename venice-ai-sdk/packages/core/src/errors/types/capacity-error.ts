import { VeniceApiError } from './api-error';

/**
 * Error for model capacity issues.
 */
export class VeniceCapacityError extends VeniceApiError {
  /**
   * Create a new model capacity error.
   * @param message - The error message.
   */
  constructor(message: string = 'The model is at capacity. Please try again later.') {
    super(message, 503);
    this.name = 'VeniceCapacityError';
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, VeniceCapacityError.prototype);
  }
}

export default VeniceCapacityError;