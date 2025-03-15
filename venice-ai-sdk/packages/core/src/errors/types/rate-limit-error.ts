import { VeniceApiError } from './api-error';

/**
 * Error for rate limit issues.
 */
export class VeniceRateLimitError extends VeniceApiError {
  /**
   * Create a new rate limit error.
   * @param message - The error message.
   */
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
    this.name = 'VeniceRateLimitError';
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, VeniceRateLimitError.prototype);
  }
}

export default VeniceRateLimitError;