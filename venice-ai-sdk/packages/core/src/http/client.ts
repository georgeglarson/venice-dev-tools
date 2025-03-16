/**
 * HTTP client for making requests to the Venice AI API
 * 
 * This module provides the main HTTP client implementation that applications
 * will use to communicate with the Venice AI API.
 */
import { HttpRequestOptions, HttpResponse } from '../types';
import { BaseHttpClient, HttpClientConfig } from './components';

/**
 * HTTP client for making requests to the Venice AI API
 */
export class HttpClient extends BaseHttpClient {
  /**
   * Create a new HTTP client
   * @param baseUrl - The base URL for the API
   * @param headers - Additional headers to include in requests
   * @param timeout - Request timeout in milliseconds
   * @param logger - Optional logger instance
   */
  constructor(
    baseUrl: string = 'https://api.venice.ai/api/v1',
    headers: Record<string, string> = {},
    timeout: number = 30000,
    logger?: any
  ) {
    super({
      baseUrl,
      headers,
      timeout,
      logger
    });
  }

  /**
   * Get the headers currently set on the client
   * @returns The headers object
   */
  public getHeaders(): Record<string, string> {
    return super.getHeaders();
  }
}