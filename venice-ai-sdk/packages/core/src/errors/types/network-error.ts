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
    this.code = 'NETWORK_ERROR';
    
    this.recoveryHints = [
      {
        action: 'check_connection',
        description: 'Verify your internet connection is stable',
        automated: false,
      },
      {
        action: 'retry_request',
        description: 'Retry the request after a short delay',
        code: 'await new Promise(resolve => setTimeout(resolve, 1000));\nawait client.retry(request);',
        automated: true,
      },
      {
        action: 'check_firewall',
        description: 'Ensure firewall/proxy is not blocking api.venice.ai',
        automated: false,
      },
      {
        action: 'configure_retry',
        description: 'Enable automatic retry with exponential backoff',
        code: `const client = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY,
  retry: {
    maxRetries: 3,
    retryableErrorTypes: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND']
  }
});`,
        automated: false,
      },
    ];
    
    Object.setPrototypeOf(this, VeniceNetworkError.prototype);
  }
}

export default VeniceNetworkError;