import { VeniceValidationError } from '../../errors';

/**
 * Base validator class with common validation functions.
 */
export class BaseValidator {
  /**
   * Validate that a value is not undefined or null.
   * @param value - The value to validate.
   * @param fieldName - The name of the field being validated.
   * @throws VeniceValidationError if the value is undefined or null.
   */
  public validateRequired(value: any, fieldName: string): void {
    if (value === undefined || value === null) {
      throw new VeniceValidationError(`${fieldName} is required`);
    }
  }

  /**
   * Validate that a value is a non-empty string.
   * @param value - The value to validate.
   * @param fieldName - The name of the field being validated.
   * @throws VeniceValidationError if the value is not a non-empty string.
   */
  public validateString(value: any, fieldName: string): void {
    this.validateRequired(value, fieldName);
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new VeniceValidationError(`${fieldName} must be a non-empty string`);
    }
  }

  /**
   * Validate that a value is a number within the specified range.
   * @param value - The value to validate.
   * @param fieldName - The name of the field being validated.
   * @param min - The minimum allowed value (optional).
   * @param max - The maximum allowed value (optional).
   * @throws VeniceValidationError if the value is not a number or is outside the specified range.
   */
  public validateNumber(value: any, fieldName: string, min?: number, max?: number): void {
    this.validateRequired(value, fieldName);
    if (typeof value !== 'number' || isNaN(value)) {
      throw new VeniceValidationError(`${fieldName} must be a number`);
    }
    
    if (min !== undefined && value < min) {
      throw new VeniceValidationError(`${fieldName} must be at least ${min}`);
    }
    
    if (max !== undefined && value > max) {
      throw new VeniceValidationError(`${fieldName} must be at most ${max}`);
    }
  }

  /**
   * Validate that a value is one of the allowed values.
   * @param value - The value to validate.
   * @param fieldName - The name of the field being validated.
   * @param allowedValues - The allowed values.
   * @throws VeniceValidationError if the value is not one of the allowed values.
   */
  public validateEnum(value: any, fieldName: string, allowedValues: any[]): void {
    this.validateRequired(value, fieldName);
    if (!allowedValues.includes(value)) {
      throw new VeniceValidationError(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
    }
  }

  /**
   * Validate that a value is a non-empty array.
   * @param value - The value to validate.
   * @param fieldName - The name of the field being validated.
   * @throws VeniceValidationError if the value is not a non-empty array.
   */
  public validateNonEmptyArray(value: any, fieldName: string): void {
    this.validateRequired(value, fieldName);
    if (!Array.isArray(value)) {
      throw new VeniceValidationError(`${fieldName} must be an array`);
    }
    if (value.length === 0) {
      throw new VeniceValidationError(`${fieldName} cannot be empty`);
    }
  }

  /**
   * Validate that a value is an object.
   * @param value - The value to validate.
   * @param fieldName - The name of the field being validated.
   * @throws VeniceValidationError if the value is not an object.
   */
  public validateObject(value: any, fieldName: string): void {
    this.validateRequired(value, fieldName);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new VeniceValidationError(`${fieldName} must be an object`);
    }
  }

  /**
   * Validate that a value is a boolean.
   * @param value - The value to validate.
   * @param fieldName - The name of the field being validated.
   * @throws VeniceValidationError if the value is not a boolean.
   */
  public validateBoolean(value: any, fieldName: string): void {
    this.validateRequired(value, fieldName);
    if (typeof value !== 'boolean') {
      throw new VeniceValidationError(`${fieldName} must be a boolean`);
    }
  }

  /**
   * Validate that a value is a valid URL.
   * @param value - The value to validate.
   * @param fieldName - The name of the field being validated.
   * @throws VeniceValidationError if the value is not a valid URL.
   */
  public validateUrl(value: any, fieldName: string): void {
    this.validateString(value, fieldName);
    try {
      new URL(value);
    } catch (error) {
      throw new VeniceValidationError(`${fieldName} must be a valid URL`);
    }
  }
}

export default BaseValidator;