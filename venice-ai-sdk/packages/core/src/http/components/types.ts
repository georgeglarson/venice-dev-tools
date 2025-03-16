/**
 * HTTP module type definitions
 */
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { HttpMethod, HttpRequestOptions, HttpResponse } from '../../types';
import { Logger } from '../../utils/logger';

/**
 * Configuration options for HTTP client
 */
export interface HttpClientConfig {
  /**
   * Base URL for API requests
   */
  baseUrl?: string;
  
  /**
   * Default headers to include in all requests
   */
  headers?: Record<string, string>;
  
  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
  
  /**
   * Logger instance
   */
  logger?: Logger;
}

/**
 * HTTP client interface
 */
export interface IHttpClient {
  /**
   * Set an authorization header with a bearer token
   * @param token - The API key or token
   */
  setAuthToken(token: string): void;
  
  /**
   * Set a custom header for future requests
   * @param name - The header name
   * @param value - The header value
   */
  setHeader(name: string, value: string): void;
  
  /**
   * Make an HTTP request
   * @param path - The API path (will be appended to the base URL)
   * @param options - Request options
   * @returns The response data
   */
  request<T = any>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
  
  /**
   * Make a GET request
   * @param path - The API path
   * @param options - Request options
   * @returns The response data
   */
  get<T = any>(path: string, options?: Omit<HttpRequestOptions, 'method'>): Promise<HttpResponse<T>>;
  
  /**
   * Make a POST request
   * @param path - The API path
   * @param body - The request body
   * @param options - Additional request options
   * @returns The response data
   */
  post<T = any>(
    path: string,
    body?: any,
    options?: Omit<HttpRequestOptions, 'method' | 'body'>
  ): Promise<HttpResponse<T>>;
  
  /**
   * Make a DELETE request
   * @param path - The API path
   * @param options - Request options
   * @returns The response data
   */
  delete<T = any>(
    path: string,
    options?: Omit<HttpRequestOptions, 'method'>
  ): Promise<HttpResponse<T>>;
  
  /**
   * Create a new stream request
   * @param path - The API path
   * @param body - The request body
   * @param options - Additional request options
   * @returns A fetch response for streaming
   */
  stream(
    path: string,
    body?: any,
    options?: Omit<HttpRequestOptions, 'method' | 'body'>
  ): Promise<Response>;
}