/**
 * Base error class for Venice AI SDK errors.
 */
export class VeniceError extends Error {
  /**
   * Create a new Venice SDK error.
   * @param message - The error message.
   * @param options - Additional error options.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'VeniceError';
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, VeniceError.prototype);
  }
}

export default VeniceError;

/**
 * Interface for error options.
 */
export interface ErrorOptions {
  cause?: unknown;
}