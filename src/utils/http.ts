/**
 * HTTP client for making API requests
 * 
 * This module provides a wrapper around axios for making HTTP requests to the Venice AI API.
 * It handles authentication, error handling, and response parsing.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import FormData from 'form-data';
import { ClientConfig, RequestParams, RateLimitInfo, BalanceInfo } from '../types/common';
import { ApiError } from '../errors/api-error';
import { RateLimitError } from '../errors/rate-limit-error';
import { Logger } from './logger';

/**
 * HTTP client for making API requests
 */
export class HttpClient {
  /**
   * Axios instance for making HTTP requests
   */
  private client: AxiosInstance;

  /**
   * Client configuration
   */
  private config: ClientConfig;

  /**
   * Creates a new HTTP client
   * 
   * @param config - Client configuration
   */
  constructor(config: ClientConfig) {
    this.config = config;

    Logger.debug('Creating HTTP client', { baseUrl: config.baseUrl, timeout: config.timeout });

    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Venice-AI-SDK-APL/0.1.0',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      this.handleSuccess.bind(this),
      this.handleError.bind(this),
    );

    // Add request interceptor for logging
    this.client.interceptors.request.use((config) => {
      Logger.debug(`Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: this.sanitizeHeaders(config.headers || {}),
        params: config.params,
        data: this.sanitizeData(config.data),
      });
      return config;
    });
  }

  /**
   * Gets the base URL for API requests
   * 
   * @returns The base URL
   */
  public getBaseURL(): string {
    return this.config.baseUrl;
  }

  /**
   * Gets the API key for authentication
   * 
   * @returns The API key
   */
  public getApiKey(): string {
    return this.config.apiKey;
  }

  /**
   * Makes an HTTP request to the API
   * 
   * @param params - Request parameters
   * @returns Promise that resolves with the response data
   */
  public async request<T>(params: RequestParams): Promise<T> {
    const config: AxiosRequestConfig = {
      url: params.path,
      method: params.method,
      params: params.query,
      data: params.body,
      headers: params.headers,
      timeout: params.timeout || this.config.timeout,
    };

    // Handle form data
    if (params.formData) {
      const formData = new FormData();
      
      Object.entries(params.formData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      config.data = formData;
      config.headers = {
        ...config.headers,
        ...formData.getHeaders(),
      };
    }

    // Handle streaming
    if (params.stream) {
      config.responseType = 'stream';
    }

    try {
      Logger.debug(`Making ${params.method} request to ${params.path}`);
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      // This should be handled by the error interceptor,
      // but we'll catch any unexpected errors here
      if (error instanceof Error) {
        Logger.error(`Unexpected error in request: ${error.message}`, error);
        throw new ApiError({
          message: error.message,
          status: 500,
          code: 'UNKNOWN_ERROR',
        });
      }
      throw error;
    }
  }

  /**
   * Handles successful responses
   * 
   * @param response - Axios response
   * @returns Response data
   */
  private handleSuccess(response: AxiosResponse): AxiosResponse {
    Logger.debug(`Response: ${response.status} ${response.statusText}`, {
      headers: response.headers,
      data: this.sanitizeData(response.data),
    });

    // Extract rate limit information from headers
    const rateLimitInfo = this.extractRateLimitInfo(response);
    
    // Extract balance information from headers
    const balanceInfo = this.extractBalanceInfo(response);

    // Attach metadata to response
    response.data = {
      ...response.data,
      _metadata: {
        rateLimit: rateLimitInfo,
        balance: balanceInfo,
      },
    };

    return response;
  }

  /**
   * Handles error responses
   * 
   * @param error - Axios error
   * @throws ApiError or RateLimitError
   */
  private handleError(error: any): never {
    if (axios.isAxiosError(error) && error.response) {
      const { response } = error;
      const status = response.status;
      const data = response.data || {};
      
      Logger.error(`API Error: ${status} ${response.statusText}`, {
        url: error.config?.url,
        method: error.config?.method,
        status,
        data,
      });
      
      // Handle rate limit errors
      if (status === 429) {
        const rateLimitInfo = this.extractRateLimitInfo(response);
        throw new RateLimitError({
          message: data.message || 'Rate limit exceeded',
          status,
          code: data.code || 'RATE_LIMIT_EXCEEDED',
          rateLimitInfo,
        });
      }
      
      // Handle other API errors
      throw new ApiError({
        message: data.message || 'API request failed',
        status,
        code: data.code || 'API_ERROR',
        data: data,
      });
    }
    
    // Handle network errors
    if (axios.isAxiosError(error) && error.request) {
      Logger.error(`Network Error: ${error.message}`, {
        url: error.config?.url,
        method: error.config?.method,
      });
      
      throw new ApiError({
        message: 'Network error',
        status: 0,
        code: 'NETWORK_ERROR',
      });
    }
    
    // Handle other errors
    Logger.error(`Unknown Error: ${error.message || 'Unknown error'}`, error);
    throw error;
  }

  /**
   * Extracts rate limit information from response headers
   * 
   * @param response - Axios response
   * @returns Rate limit information
   */
  private extractRateLimitInfo(response: AxiosResponse): RateLimitInfo | undefined {
    const headers = response.headers;
    
    if (
      headers['x-ratelimit-limit-requests'] &&
      headers['x-ratelimit-remaining-requests'] &&
      headers['x-ratelimit-reset-requests']
    ) {
      return {
        limit: parseInt(headers['x-ratelimit-limit-requests'], 10),
        remaining: parseInt(headers['x-ratelimit-remaining-requests'], 10),
        reset: parseInt(headers['x-ratelimit-reset-requests'], 10),
        tokensUsed: headers['x-ratelimit-limit-tokens'] 
          ? parseInt(headers['x-ratelimit-limit-tokens'], 10) 
          : undefined,
        tokensRemaining: headers['x-ratelimit-remaining-tokens'] 
          ? parseInt(headers['x-ratelimit-remaining-tokens'], 10) 
          : undefined,
        tokensReset: headers['x-ratelimit-reset-tokens'] 
          ? parseInt(headers['x-ratelimit-reset-tokens'], 10) 
          : undefined,
      };
    }
    
    return undefined;
  }

  /**
   * Extracts balance information from response headers
   * 
   * @param response - Axios response
   * @returns Balance information
   */
  private extractBalanceInfo(response: AxiosResponse): BalanceInfo | undefined {
    const headers = response.headers;
    
    if (headers['x-venice-balance-vcu'] || headers['x-venice-balance-usd']) {
      return {
        vcu: headers['x-venice-balance-vcu'] 
          ? parseFloat(headers['x-venice-balance-vcu']) 
          : 0,
        usd: headers['x-venice-balance-usd'] 
          ? parseFloat(headers['x-venice-balance-usd']) 
          : 0,
      };
    }
    
    return undefined;
  }

  /**
   * Sanitizes headers for logging
   * 
   * @param headers - Headers to sanitize
   * @returns Sanitized headers
   */
  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitized = { ...headers };
    
    // Remove sensitive information
    if (sanitized.Authorization) {
      sanitized.Authorization = 'Bearer [REDACTED]';
    }
    
    return sanitized;
  }

  /**
   * Sanitizes data for logging
   *
   * @param data - Data to sanitize
   * @returns Sanitized data
   */
  private sanitizeData(data: any): any {
    if (!data) {
      return data;
    }
    
    // For simple types, check if it's a string that might be image data
    if (typeof data === 'string') {
      // Check if it's likely base64 encoded image data
      if (data.length > 1000 &&
          (data.startsWith('data:image') ||
           data.startsWith('/9j/') || // JPEG
           data.startsWith('iVBOR') || // PNG
           /^[A-Za-z0-9+/=]{1000,}$/.test(data))) {
        return '[IMAGE DATA EXCLUDED]';
      }
      return data;
    }
    
    // For FormData, return a placeholder
    if (data instanceof FormData) {
      return '[FormData]';
    }
    
    // For streams, return a placeholder
    if (typeof data.pipe === 'function') {
      return '[Stream]';
    }
    
    // For Buffer or ArrayBuffer, check if it might be image data
    if (data instanceof Buffer || data instanceof ArrayBuffer) {
      return '[BINARY DATA EXCLUDED]';
    }
    
    // For objects, create a copy and sanitize sensitive fields
    try {
      const sanitized = JSON.parse(JSON.stringify(data));
      
      // Sanitize API keys
      if (sanitized.apiKey) {
        sanitized.apiKey = '[REDACTED]';
      }
      
      // Sanitize authorization headers
      if (sanitized.headers && sanitized.headers.Authorization) {
        sanitized.headers.Authorization = 'Bearer [REDACTED]';
      }
      
      // Sanitize image data
      for (const key in sanitized) {
        if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
          // Check for common image field names
          if (['image', 'data', 'content', 'file', 'buffer', 'base64'].includes(key.toLowerCase())) {
            const value = sanitized[key];
            // Check if value is likely image data (string longer than 1000 chars)
            if (typeof value === 'string' && value.length > 1000) {
              sanitized[key] = '[IMAGE DATA EXCLUDED]';
            }
          } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            // Recursively sanitize nested objects
            sanitized[key] = this.sanitizeData(sanitized[key]);
          }
        }
      }
      
      return sanitized;
    } catch (error) {
      return '[Object could not be stringified]';
    }
  }
}