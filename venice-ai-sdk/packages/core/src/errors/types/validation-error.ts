import { VeniceError } from './base-error';

/**
 * Error for validation issues.
 */
export class VeniceValidationError extends VeniceError {
  /**
   * Additional validation details.
   */
  readonly details?: Record<string, any>;

  /**
   * Create a new validation error.
   * @param message - The error message.
   * @param details - Additional validation details.
   */
  constructor(message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'VeniceValidationError';
    this.details = details;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, VeniceValidationError.prototype);
  }
}

export default VeniceValidationError;