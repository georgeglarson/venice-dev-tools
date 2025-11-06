import { VeniceApiError } from './api-error';
import { RecoveryHint } from './base-error';

/**
 * Error for rate limit issues.
 */
export class VeniceRateLimitError extends VeniceApiError {
  /**
   * Number of seconds to wait before retrying.
   */
  public retryAfter?: number;

  /**
   * Create a new rate limit error.
   * @param message - The error message.
   * @param retryAfter - Seconds to wait before retrying.
   */
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429);
    this.name = 'VeniceRateLimitError';
    this.code = 'RATE_LIMIT_EXCEEDED';
    this.retryAfter = retryAfter;
    
    this.recoveryHints = [
      {
        action: 'wait_and_retry',
        description: retryAfter
          ? `Wait ${retryAfter} seconds before retrying`
          : 'Wait before retrying the request',
        code: retryAfter
          ? `await new Promise(resolve => setTimeout(resolve, ${retryAfter * 1000}));`
          : 'await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute',
        automated: true,
      },
      {
        action: 'implement_backoff',
        description: 'Implement exponential backoff for retries',
        code: `const client = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY,
  retry: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    retryableStatusCodes: [429, 500, 502, 503]
  }
});`,
        automated: false,
      },
      {
        action: 'use_rate_limiter',
        description: 'Configure built-in rate limiter to prevent future errors',
        code: `const client = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY,
  rateLimit: {
    maxRequestsPerMinute: 60,
    maxConcurrentRequests: 5
  }
});`,
        automated: false,
      },
      {
        action: 'upgrade_plan',
        description: 'Upgrade your API plan for higher rate limits',
        automated: false,
      },
    ];
    
    this.context = { retryAfter };
    
    Object.setPrototypeOf(this, VeniceRateLimitError.prototype);
  }
}

export default VeniceRateLimitError;