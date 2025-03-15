import { VeniceApiError } from './api-error';

/**
 * Error for payment required issues.
 */
export class VenicePaymentRequiredError extends VeniceApiError {
  /**
   * Create a new payment required error.
   * @param message - The error message.
   */
  constructor(message: string = 'Insufficient USD or VCU balance to complete request') {
    super(message, 402);
    this.name = 'VenicePaymentRequiredError';
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, VenicePaymentRequiredError.prototype);
  }
}

export default VenicePaymentRequiredError;