import { VeniceError, ErrorOptions } from './base-error';

/**
 * Error for network issues.
 */
export class VeniceNetworkError extends VeniceError {
  /**
   * Create a new network error.
   * @param message - The error message.
   * @param options - Additional error options.
   */
  constructor(message: string = 'Network error occurred', options?: ErrorOptions) {
    super(message, options);
    this.name = 'VeniceNetworkError';
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, VeniceNetworkError.prototype);
  }
}

export default VeniceNetworkError;