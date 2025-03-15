import { VeniceError } from './base-error';

/**
 * Error for API-related issues.
 */
export class VeniceApiError extends VeniceError {
  /**
   * HTTP status code associated with the error.
   */
  readonly status: number;

  /**
   * Additional details about the error.
   */
  readonly details?: Record<string, any>;

  /**
   * Create a new API error.
   * @param message - The error message.
   * @param status - The HTTP status code.
   * @param details - Additional error details.
   */
  constructor(message: string, status: number, details?: Record<string, any>) {
    super(message);
    this.name = 'VeniceApiError';
    this.status = status;
    this.details = details;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, VeniceApiError.prototype);
  }
}

export default VeniceApiError;