import { AxiosError } from 'axios';
import { VeniceError } from '../types/base-error';
import { VeniceApiError } from '../types/api-error';
import { VeniceAuthError } from '../types/auth-error';
import { VenicePaymentRequiredError } from '../types/payment-required-error';
import { VeniceRateLimitError } from '../types/rate-limit-error';
import { VeniceCapacityError } from '../types/capacity-error';
import { VeniceNetworkError } from '../types/network-error';
import { VeniceTimeoutError } from '../types/timeout-error';
import { VeniceValidationError } from '../types/validation-error';
import { VeniceStreamError } from '../types/stream-error';

/**
 * Factory for creating Venice SDK errors.
 */
export class ErrorFactory {
  /**
   * Create an error from an API response.
   * @param status - The HTTP status code.
   * @param message - The error message.
   * @param details - Additional error details.
   * @returns A Venice SDK error.
   */
  public createFromResponse(status: number, message: string, details?: Record<string, any>): VeniceError {
    switch (status) {
      case 401:
        return new VeniceAuthError(message);
      case 402:
        return new VenicePaymentRequiredError(message);
      case 429:
        return new VeniceRateLimitError(message);
      case 503:
        return new VeniceCapacityError(message);
      default:
        return new VeniceApiError(message, status, details);
    }
  }

  /**
   * Create an error from an Axios error.
   * @param error - The Axios error.
   * @returns A Venice SDK error.
   */
  public createFromAxiosError(error: AxiosError): VeniceError {
    if (error.response) {
      // The request was made and the server responded with a status code outside the range of 2xx
      const responseData = error.response.data as Record<string, any> || {};
      const errorMessage = responseData.error || 'API request failed';
      const details = responseData.details;
      return this.createFromResponse(error.response.status, errorMessage, details);
    } else if (error.request) {
      // The request was made but no response was received
      if (error.code === 'ECONNABORTED') {
        return new VeniceTimeoutError('Request timed out');
      }
      return new VeniceNetworkError('Network error', { cause: error });
    } else {
      // Something happened in setting up the request that triggered an Error
      return new VeniceError(error.message || 'Request setup error', { cause: error });
    }
  }

  /**
   * Create an error from a fetch response.
   * @param response - The fetch response.
   * @returns A promise that resolves to a Venice SDK error.
   */
  public async createFromFetchResponse(response: Response): Promise<VeniceError> {
    try {
      const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
      return this.createFromResponse(
        response.status,
        errorData.error || 'API request failed',
        errorData.details
      );
    } catch (error) {
      return new VeniceApiError(`HTTP error ${response.status}`, response.status);
    }
  }

  /**
   * Create an error from a stream error.
   * @param error - The error that occurred during streaming.
   * @returns A Venice SDK error.
   */
  public createFromStreamError(error: unknown): VeniceError {
    if (error instanceof VeniceError) {
      return error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      return new VeniceError('Request was aborted', { cause: error });
    }

    return new VeniceStreamError('Stream request failed', { cause: error });
  }

  /**
   * Create a validation error.
   * @param message - The error message.
   * @param details - Additional validation details.
   * @returns A Venice validation error.
   */
  public createValidationError(message: string, details?: Record<string, any>): VeniceValidationError {
    return new VeniceValidationError(message, details);
  }

  /**
   * Create a generic error from any error.
   * @param error - The error to convert.
   * @returns A Venice SDK error.
   */
  public createFromError(error: unknown): VeniceError {
    if (error instanceof VeniceError) {
      return error;
    }

    if (error instanceof Error) {
      return new VeniceError(error.message, { cause: error });
    }

    return new VeniceError(String(error));
  }
}

export default ErrorFactory;