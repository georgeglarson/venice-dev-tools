/**
 * HTTP client interceptors
 * 
 * This module provides request and response interceptors for the HTTP client.
 * Interceptors are used for logging, adding request IDs, and other cross-cutting concerns.
 */
import { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Logger } from '../../utils/logger';
import { sanitizeHeaders, sanitizeData } from './sanitizer';

/**
 * Generate a random request ID
 * @returns A random string to use as a request ID
 */
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Create a request interceptor
 * @param logger - The logger instance
 * @returns An object with request and error handlers
 */
export function createRequestInterceptor(logger: Logger) {
  return {
    /**
     * Handle outgoing requests
     * @param config - The Axios request config
     * @returns The modified config
     */
    onRequest: (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      // Generate a unique request ID
      const requestId = generateRequestId();
      config.headers = config.headers || {};
      config.headers['X-Request-ID'] = requestId;
      
      // Log the request details
      logger.debug(`Request ${requestId}: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: sanitizeHeaders(config.headers),
        params: config.params,
        data: sanitizeData(config.data)
      });
      
      return config;
    },
    
    /**
     * Handle request errors
     * @param error - The error that occurred
     * @returns A rejected promise with the error
     */
    onRequestError: (error: AxiosError): Promise<AxiosError> => {
      logger.error('Request setup error', { error: error.message });
      return Promise.reject(error);
    }
  };
}

/**
 * Create a response interceptor
 * @param logger - The logger instance
 * @returns An object with response and error handlers
 */
export function createResponseInterceptor(logger: Logger) {
  return {
    /**
     * Handle successful responses
     * @param response - The Axios response
     * @returns The response
     */
    onResponse: (response: AxiosResponse): AxiosResponse => {
      const requestId = response.config.headers?.['X-Request-ID'] || 'unknown';
      
      logger.debug(`Response ${requestId}: ${response.status} ${response.statusText}`, {
        headers: sanitizeHeaders(response.headers),
        data: sanitizeData(response.data)
      });
      
      return response;
    },
    
    /**
     * Handle response errors
     * @param error - The error that occurred
     * @returns A rejected promise with the error
     */
    onResponseError: (error: AxiosError): Promise<AxiosError> => {
      const requestId = error.config?.headers?.['X-Request-ID'] || 'unknown';
      
      if (error.response) {
        // The request was made and the server responded with a status code outside the range of 2xx
        logger.error(`Response ${requestId}: ${error.response.status} ${error.response.statusText}`, {
          headers: sanitizeHeaders(error.response.headers),
          data: sanitizeData(error.response.data)
        });
      } else if (error.request) {
        // The request was made but no response was received
        logger.error(`Response ${requestId}: No response received`, {
          error: error.message
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        logger.error(`Request ${requestId} error: ${error.message}`);
      }
      
      return Promise.reject(error);
    }
  };
}