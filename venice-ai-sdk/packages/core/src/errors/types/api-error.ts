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
    super(message, {
      code: `API_ERROR_${status}`,
      context: {
        status,
        details,
        timestamp: new Date().toISOString()
      },
      recoveryHints: [
        {
          action: 'check_api_status',
          description: `Check if the Venice API is operational (HTTP ${status})`,
          automated: false
        },
        {
          action: 'verify_credentials',
          description: 'Verify your API key and permissions are valid',
          automated: false
        },
        ...(status >= 500 ? [{
          action: 'retry_request',
          description: 'Server error detected - retry the request after a short delay',
          automated: true
        }] : [])
      ]
    });
    this.name = 'VeniceApiError';
    this.status = status;
    this.details = details;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, VeniceApiError.prototype);
  }
}

export default VeniceApiError;