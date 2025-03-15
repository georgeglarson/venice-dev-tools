// Export error types
export { VeniceError, ErrorOptions } from './types/base-error';
export { VeniceApiError } from './types/api-error';
export { VeniceAuthError } from './types/auth-error';
export { VenicePaymentRequiredError } from './types/payment-required-error';
export { VeniceRateLimitError } from './types/rate-limit-error';
export { VeniceCapacityError } from './types/capacity-error';
export { VeniceNetworkError } from './types/network-error';
export { VeniceTimeoutError } from './types/timeout-error';
export { VeniceValidationError } from './types/validation-error';
export { VeniceStreamError } from './types/stream-error';

// Export error factory
export { ErrorFactory } from './factory/error-factory';

// Import for utility functions
import { VeniceError } from './types/base-error';
import { ErrorFactory } from './factory/error-factory';

// Create a singleton instance of the error factory
const errorFactory = new ErrorFactory();

/**
 * Check if an error is a Venice SDK error.
 * @param error - The error to check.
 * @returns Whether the error is a Venice SDK error.
 */
export function isVeniceError(error: unknown): error is VeniceError {
  return error instanceof VeniceError;
}

/**
 * Handle an error and convert it to a Venice SDK error if it's not already one.
 * @param error - The error to handle.
 * @returns A Venice SDK error.
 */
export function handleError(error: unknown): VeniceError {
  return errorFactory.createFromError(error);
}

// Default export
export default {
  isVeniceError,
  handleError,
  errorFactory,
};