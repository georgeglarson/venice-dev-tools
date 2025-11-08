/**
 * HTTP error handling utilities
 * 
 * This module provides utilities for handling HTTP errors and transforming
 * them into appropriate SDK-specific error types.
 */
import { AxiosError } from 'axios';
import { Logger } from '../../utils/logger';
import { 
  VeniceApiError, 
  VeniceNetworkError, 
  VeniceTimeoutError,
  VeniceError
} from '../../errors';

/**
 * Handle API request errors and transform them into appropriate SDK errors
 * @param error - The Axios error
 * @param logger - The logger instance
 * @param timeout - The request timeout in milliseconds
 * @throws A transformed SDK-specific error
 */
export function handleRequestError(
  error: AxiosError, 
  logger: Logger,
  timeout: number
): never {
  if (error.response) {
    // The request was made and the server responded with a status code outside the range of 2xx
    const responseData = error.response.data as Record<string, any> || {};
    const errorMessage = responseData.error || 'API request failed';
    const details = responseData.details;
    
    logger.error(`API error: ${errorMessage}`, {
      status: error.response.status,
      details: details
    });
    
    throw new VeniceApiError(errorMessage, error.response.status, details);
  } else if (error.request) {
    // The request was made but no response was received
    if (error.code === 'ECONNABORTED') {
      logger.error(`Request timed out after ${timeout}ms`);
      throw new VeniceTimeoutError('Request timed out');
    }
    
    logger.error('Network error', {
      message: error.message,
      code: error.code
    });
    
    throw new VeniceNetworkError('Network error', { cause: error });
  } else {
    // Something happened in setting up the request that triggered an Error
    logger.error('Request setup error', { message: error.message });
    throw new VeniceError(error.message || 'Request setup error');
  }
}

/**
 * Handle streaming request errors
 * @param error - The error that occurred
 * @param logger - The logger instance
 * @param requestId - The request ID
 * @throws A transformed SDK-specific error
 */
export function handleStreamError(
  error: any,
  logger: Logger,
  requestId: string
): never {
  if (error instanceof VeniceApiError) {
    throw error;
  }

  if ((error as Error).name === 'AbortError') {
    logger.warn(`Stream request ${requestId} aborted`);
    throw new VeniceError('Request was aborted');
  }

  logger.error(`Stream request ${requestId} failed`, {
    error: (error as Error).message
  });
  
  throw new VeniceNetworkError('Stream request failed', { cause: error });
}