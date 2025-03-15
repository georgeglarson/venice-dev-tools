import { VeniceError, ErrorOptions } from './base-error';

/**
 * Error for streaming issues.
 */
export class VeniceStreamError extends VeniceError {
  /**
   * Create a new stream error.
   * @param message - The error message.
   * @param options - Additional error options.
   */
  constructor(message: string = 'Stream processing error', options?: ErrorOptions) {
    super(message, options);
    this.name = 'VeniceStreamError';
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, VeniceStreamError.prototype);
  }
}

export default VeniceStreamError;