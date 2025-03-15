import { VeniceApiError } from './api-error';

/**
 * Error for authentication issues.
 */
export class VeniceAuthError extends VeniceApiError {
  /**
   * Create a new authentication error.
   * @param message - The error message.
   */
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'VeniceAuthError';
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, VeniceAuthError.prototype);
  }
}

export default VeniceAuthError;