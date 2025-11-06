import { VeniceError, VeniceRateLimitError, VeniceCapacityError, VeniceNetworkError, VeniceTimeoutError } from '../errors';
import { delay } from './index';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableErrors?: Array<new (...args: any[]) => Error>;
  onRetry?: (error: Error, attempt: number, delayMs: number) => void;
}

export interface RetryContext {
  attempt: number;
  lastError?: Error;
  totalDelay: number;
}

const DEFAULT_RETRYABLE_ERRORS = [
  VeniceRateLimitError,
  VeniceCapacityError,
  VeniceNetworkError,
  VeniceTimeoutError,
];

/**
 * Retry utility with exponential backoff for handling transient errors.
 * 
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   async () => await apiCall(),
 *   { maxRetries: 3, initialDelayMs: 1000 }
 * );
 * ```
 */
export class RetryManager {
  private options: Required<RetryOptions>;

  constructor(options: RetryOptions = {}) {
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      initialDelayMs: options.initialDelayMs ?? 1000,
      maxDelayMs: options.maxDelayMs ?? 30000,
      backoffMultiplier: options.backoffMultiplier ?? 2,
      retryableErrors: options.retryableErrors ?? DEFAULT_RETRYABLE_ERRORS,
      onRetry: options.onRetry ?? (() => {}),
    };
  }

  /**
   * Execute a function with retry logic and exponential backoff.
   * 
   * @param fn - The async function to execute
   * @returns A promise that resolves with the function result
   * @throws The last error if all retries are exhausted
   */
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    const context: RetryContext = {
      attempt: 0,
      totalDelay: 0,
    };

    while (true) {
      try {
        context.attempt++;
        return await fn();
      } catch (error) {
        context.lastError = error instanceof Error ? error : new Error(String(error));

        if (context.attempt >= this.options.maxRetries + 1 || !this.shouldRetry(context.lastError)) {
          throw context.lastError;
        }

        const delayMs = this.calculateDelay(context.attempt);
        context.totalDelay += delayMs;

        this.options.onRetry(context.lastError, context.attempt, delayMs);

        await delay(delayMs);
      }
    }
  }

  /**
   * Check if an error should trigger a retry.
   * 
   * @param error - The error to check
   * @returns Whether the error is retryable
   */
  private shouldRetry(error: Error): boolean {
    return this.options.retryableErrors.some(
      ErrorClass => error instanceof ErrorClass
    );
  }

  /**
   * Calculate the delay for the next retry using exponential backoff.
   * 
   * @param attempt - The current attempt number (1-based)
   * @returns The delay in milliseconds
   */
  private calculateDelay(attempt: number): number {
    const exponentialDelay = this.options.initialDelayMs * Math.pow(
      this.options.backoffMultiplier,
      attempt - 1
    );

    const jitter = Math.random() * 0.1 * exponentialDelay;

    const delayWithJitter = exponentialDelay + jitter;

    return Math.min(delayWithJitter, this.options.maxDelayMs);
  }
}

/**
 * Convenience function to retry an async operation with exponential backoff.
 * 
 * @param fn - The async function to execute
 * @param options - Retry options
 * @returns A promise that resolves with the function result
 * @throws The last error if all retries are exhausted
 * 
 * @example
 * ```typescript
 * const data = await retryWithBackoff(
 *   async () => await fetchData(),
 *   {
 *     maxRetries: 3,
 *     initialDelayMs: 1000,
 *     onRetry: (error, attempt, delay) => {
 *       console.log(`Retry attempt ${attempt} after ${delay}ms: ${error.message}`);
 *     }
 *   }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const manager = new RetryManager(options);
  return manager.execute(fn);
}

export default RetryManager;
