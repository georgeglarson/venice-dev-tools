/**
 * Rate Limit Error class
 * 
 * This class represents rate limit errors returned by the Venice AI API.
 * It includes information about the rate limit such as the limit, remaining,
 * and reset time.
 */

import { ApiError, ApiErrorOptions } from './api-error';
import { RateLimitInfo } from '../types/common';

/**
 * Rate Limit Error options
 */
export interface RateLimitErrorOptions extends ApiErrorOptions {
  /**
   * Rate limit information
   */
  rateLimitInfo?: RateLimitInfo;
}

/**
 * Rate Limit Error class
 */
export class RateLimitError extends ApiError {
  /**
   * Rate limit information
   */
  public rateLimitInfo?: RateLimitInfo;

  /**
   * Creates a new rate limit error
   * 
   * @param options - Error options
   */
  constructor(options: RateLimitErrorOptions) {
    super(options);
    this.name = 'RateLimitError';
    this.rateLimitInfo = options.rateLimitInfo;

    // This is needed for proper instanceof checks in TypeScript
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }

  /**
   * Returns a string representation of the error
   */
  public toString(): string {
    let message = `${this.name}: [${this.code}] ${this.message} (${this.status})`;
    
    if (this.rateLimitInfo) {
      const { limit, remaining, reset } = this.rateLimitInfo;
      const resetDate = new Date(reset * 1000).toISOString();
      message += `\nRate limit: ${remaining}/${limit}, resets at ${resetDate}`;
    }
    
    return message;
  }

  /**
   * Returns the time in milliseconds until the rate limit resets
   */
  public getRetryAfterMs(): number {
    if (this.rateLimitInfo?.reset) {
      const now = Math.floor(Date.now() / 1000);
      const resetTime = this.rateLimitInfo.reset;
      return Math.max(0, resetTime - now) * 1000;
    }
    
    // Default to 60 seconds if no reset time is available
    return 60 * 1000;
  }
}