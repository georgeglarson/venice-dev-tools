import { VeniceError } from './base-error';

/**
 * Error for timeout issues.
 */
export class VeniceTimeoutError extends VeniceError {
  /**
   * Create a new timeout error.
   * @param message - The error message.
   */
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'VeniceTimeoutError';
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, VeniceTimeoutError.prototype);
  }
}

export default VeniceTimeoutError;