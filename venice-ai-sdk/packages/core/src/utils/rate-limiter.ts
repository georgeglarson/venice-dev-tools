import { VeniceRateLimitError } from '../errors';

/**
 * Rate limiter for API requests.
 * Manages request concurrency and rate limits.
 */
export class RateLimiter {
  /**
   * Queue of pending requests.
   */
  private queue: Array<() => void> = [];
  
  /**
   * Number of currently running requests.
   */
  private running = 0;
  
  /**
   * Maximum number of concurrent requests.
   */
  private maxConcurrent: number;
  
  /**
   * Maximum requests per minute.
   */
  private requestsPerMinute: number;
  
  /**
   * Timestamps of recent requests for rate limiting.
   */
  private requestTimestamps: number[] = [];

  /**
   * Creates a new rate limiter.
   * 
   * @param maxConcurrent - Maximum number of concurrent requests
   * @param requestsPerMinute - Maximum requests per minute
   */
  constructor(maxConcurrent = 5, requestsPerMinute = 60) {
    this.maxConcurrent = maxConcurrent;
    this.requestsPerMinute = requestsPerMinute;
  }

  /**
   * Adds a request to the rate limiter.
   * 
   * @param fn - The request function to execute
   * @returns A promise resolving to the request result
   * @throws {VeniceRateLimitError} If the rate limit is exceeded
   */
  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const execute = () => {
        try {
          this.enforceRateLimit();
        } catch (error) {
          reject(error);
          this.processQueue();
          return;
        }

        this.running++;
        Promise.resolve()
          .then(fn)
          .then((result) => {
            this.recordRequest();
            resolve(result);
          })
          .catch((error) => {
            reject(error);
          })
          .finally(() => {
            this.running--;
            this.processQueue();
          });
      };

      if (this.running < this.maxConcurrent) {
        execute();
      } else {
        this.queue.push(execute);
      }
    });
  }

  /**
   * Processes the next request in the queue.
   */
  private processQueue() {
    while (this.queue.length > 0 && this.running < this.maxConcurrent) {
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }

  /**
   * Records a request for rate limiting.
   */
  private recordRequest() {
    const now = Date.now();
    this.requestTimestamps.push(now);
    
    // Clean up old timestamps
    const oneMinuteAgo = now - 60000;
    this.requestTimestamps = this.requestTimestamps.filter(t => t > oneMinuteAgo);
  }

  /**
   * Enforces the rate limit.
   * 
   * @throws {VeniceRateLimitError} If the rate limit is exceeded
   */
  private enforceRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean up old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(t => t > oneMinuteAgo);
    
    // Check if we're over the limit
    if (this.requestTimestamps.length >= this.requestsPerMinute) {
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = 60000 - (now - oldestTimestamp);
      throw new VeniceRateLimitError(
        `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`
      );
    }
  }
}

export default RateLimiter;
