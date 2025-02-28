/**
 * Validation Error class
 * 
 * This class represents validation errors that occur when validating
 * input parameters before making API requests.
 */

/**
 * Validation Error options
 */
export interface ValidationErrorOptions {
  /**
   * Error message
   */
  message: string;

  /**
   * Field that failed validation
   */
  field?: string;

  /**
   * Expected value or type
   */
  expected?: string;

  /**
   * Actual value or type
   */
  actual?: string;
}

/**
 * Validation Error class
 */
export class ValidationError extends Error {
  /**
   * Field that failed validation
   */
  public field?: string;

  /**
   * Expected value or type
   */
  public expected?: string;

  /**
   * Actual value or type
   */
  public actual?: string;

  /**
   * Creates a new validation error
   * 
   * @param options - Error options
   */
  constructor(options: ValidationErrorOptions) {
    super(options.message);
    this.name = 'ValidationError';
    this.field = options.field;
    this.expected = options.expected;
    this.actual = options.actual;

    // This is needed for proper instanceof checks in TypeScript
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Returns a string representation of the error
   */
  public toString(): string {
    let message = `${this.name}: ${this.message}`;
    
    if (this.field) {
      message += ` (field: ${this.field})`;
    }
    
    if (this.expected && this.actual) {
      message += ` - expected ${this.expected}, got ${this.actual}`;
    }
    
    return message;
  }
}