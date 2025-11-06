import { VeniceError } from './base-error';

/**
 * Error for validation issues.
 */
export class VeniceValidationError extends VeniceError {
  /**
   * Additional validation details.
   */
  readonly details?: Record<string, any>;

  /**
   * Create a new validation error.
   * @param message - The error message.
   * @param details - Additional validation details.
   */
  constructor(message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'VeniceValidationError';
    this.code = 'VALIDATION_ERROR';
    this.details = details;
    this.context = details;
    
    this.recoveryHints = [
      {
        action: 'check_parameters',
        description: 'Review the request parameters against API documentation',
        automated: false,
      },
      {
        action: 'check_required_fields',
        description: 'Ensure all required fields are provided',
        automated: false,
      },
      {
        action: 'check_data_types',
        description: 'Verify all parameters have correct data types',
        automated: false,
      },
    ];

    if (details) {
      const invalidFields = Object.keys(details);
      if (invalidFields.length > 0) {
        this.recoveryHints.unshift({
          action: 'fix_invalid_fields',
          description: `Fix validation errors in fields: ${invalidFields.join(', ')}`,
          automated: false,
        });
      }
    }
    
    Object.setPrototypeOf(this, VeniceValidationError.prototype);
  }
}

export default VeniceValidationError;