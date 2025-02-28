/**
 * API Error class
 * 
 * This class represents errors returned by the Venice AI API.
 * It includes information about the error such as the status code,
 * error code, and message.
 */

/**
 * API Error options
 */
export interface ApiErrorOptions {
  /**
   * Error message
   */
  message: string;

  /**
   * HTTP status code
   */
  status: number;

  /**
   * Error code
   */
  code: string;

  /**
   * Additional error data
   */
  data?: any;
}

/**
 * API Error class
 */
export class ApiError extends Error {
  /**
   * HTTP status code
   */
  public status: number;

  /**
   * Error code
   */
  public code: string;

  /**
   * Additional error data
   */
  public data?: any;

  /**
   * Creates a new API error
   * 
   * @param options - Error options
   */
  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.data = options.data;

    // This is needed for proper instanceof checks in TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Returns a string representation of the error
   */
  public toString(): string {
    return `${this.name}: [${this.code}] ${this.message} (${this.status})`;
  }
}