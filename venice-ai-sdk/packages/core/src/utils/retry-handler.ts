/**
 * Retry policy configuration for handling transient failures
 */
export interface RetryPolicy {
  /** Maximum number of retry attempts */
  maxRetries: number;
  
  /** Initial delay in milliseconds before first retry */
  initialDelayMs: number;
  
  /** Maximum delay in milliseconds between retries */
  maxDelayMs: number;
  
  /** Multiplier for exponential backoff (e.g., 2 = double each time) */
  backoffMultiplier: number;
  
  /** HTTP status codes that should trigger a retry */
  retryableStatusCodes: number[];
  
  /** Error type names that should trigger a retry */
  retryableErrorTypes: string[];
  
  /** Whether to add jitter to delay (reduces thundering herd) */
  jitter: boolean;
}

/**
 * Default retry policy with sensible defaults for most use cases
 */
export const defaultRetryPolicy: RetryPolicy = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableErrorTypes: ['VeniceNetworkError', 'VeniceTimeoutError', 'VeniceCapacityError'],
  jitter: true,
};

/**
 * Handles retry logic with exponential backoff for transient failures
 */
export class RetryHandler {
  private policy: RetryPolicy;

  constructor(policy: Partial<RetryPolicy> = {}) {
    this.policy = { ...defaultRetryPolicy, ...policy };
  }

  /**
   * Execute a function with retry logic
   * 
   * @param fn - The async function to execute
   * @param onRetry - Optional callback called before each retry
   * @returns Promise that resolves with the function result
   * @throws The last error if all retries are exhausted
   * 
   * @example
   * ```typescript
   * const handler = new RetryHandler();
   * const result = await handler.executeWithRetry(
   *   () => fetchData(),
   *   (attempt, delay) => console.log(`Retry ${attempt} after ${delay}ms`)
   * );
   * ```
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    onRetry?: (attempt: number, delay: number, error: Error) => void
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.policy.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry if this is the last attempt
        if (attempt === this.policy.maxRetries) {
          throw lastError;
        }

        // Don't retry if error is not retryable
        if (!this.isRetryable(lastError)) {
          throw lastError;
        }

        // Calculate delay and notify caller
        const delay = this.calculateDelay(attempt);
        if (onRetry) {
          onRetry(attempt + 1, delay, lastError);
        }

        // Wait before retry
        await this.sleep(delay);
      }
    }

    // This should never happen due to the loop logic, but TypeScript needs it
    throw lastError!;
  }

  /**
   * Determine if an error is retryable based on policy
   */
  private isRetryable(error: any): boolean {
    // Check HTTP status code
    if (error.statusCode && this.policy.retryableStatusCodes.includes(error.statusCode)) {
      return true;
    }

    // Check error type name
    const errorType = error.constructor?.name;
    if (errorType && this.policy.retryableErrorTypes.includes(errorType)) {
      return true;
    }

    // Check if error has retryable property
    if (error.retryable === true) {
      return true;
    }

    return false;
  }

  /**
   * Calculate delay for the next retry using exponential backoff
   */
  private calculateDelay(attempt: number): number {
    // Calculate exponential delay
    let delay = this.policy.initialDelayMs * Math.pow(this.policy.backoffMultiplier, attempt);

    // Cap at max delay
    delay = Math.min(delay, this.policy.maxDelayMs);

    // Add jitter if enabled (randomize by ±25%)
    if (this.policy.jitter) {
      const jitterRange = delay * 0.25;
      const jitter = (Math.random() - 0.5) * 2 * jitterRange;
      delay = delay + jitter;
    }

    return Math.floor(delay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get the current retry policy
   */
  getPolicy(): Readonly<RetryPolicy> {
    return { ...this.policy };
  }

  /**
   * Update the retry policy
   */
  updatePolicy(policy: Partial<RetryPolicy>): void {
    this.policy = { ...this.policy, ...policy };
  }
}
