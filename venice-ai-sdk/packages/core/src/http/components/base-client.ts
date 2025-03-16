/**
 * Base HTTP client implementation
 * 
 * This module provides the core HTTP client functionality.
 */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { LogLevel } from '../../types';
import { Logger } from '../../utils/logger';
import { HttpClientConfig, IHttpClient } from './types';
import { createRequestInterceptor, createResponseInterceptor } from './interceptors';
import { handleRequestError } from './error-handler';
import { createStreamRequest } from './streaming';
import { HttpMethod, HttpRequestOptions, HttpResponse } from '../../types';

/**
 * HTTP client for making requests to the Venice AI API
 */
export class BaseHttpClient implements IHttpClient {
  /**
   * The Axios client instance
   */
  protected client: AxiosInstance;
  
  /**
   * The base URL for the API
   */
  protected baseUrl: string;
  
  /**
   * The logger instance
   */
  protected logger: Logger;
  
  /**
   * The request timeout in milliseconds
   */
  protected timeout: number;

  /**
   * Create a new HTTP client
   * @param config - Configuration options
   */
  constructor(config: HttpClientConfig = {}) {
    this.baseUrl = config.baseUrl || 'https://api.venice.ai/api/v1';
    this.timeout = config.timeout || 30000;
    this.logger = config.logger || new Logger({ level: LogLevel.INFO });
    
    this.logger.debug('Initializing HTTP client', {
      baseUrl: this.baseUrl,
      timeout: this.timeout
    });
    
    // Create the Axios client
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });
    
    // Add request interceptor for logging
    const requestInterceptor = createRequestInterceptor(this.logger);
    this.client.interceptors.request.use(
      requestInterceptor.onRequest,
      requestInterceptor.onRequestError
    );
    
    // Add response interceptor for logging
    const responseInterceptor = createResponseInterceptor(this.logger);
    this.client.interceptors.response.use(
      responseInterceptor.onResponse,
      responseInterceptor.onResponseError
    );
  }

  /**
   * Set an authorization header with a bearer token
   * @param token - The API key or token
   */
  public setAuthToken(token: string): void {
    this.logger.debug('Setting authorization token');
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Set a custom header for future requests
   * @param name - The header name
   * @param value - The header value
   */
  public setHeader(name: string, value: string): void {
    this.logger.debug(`Setting header: ${name}`);
    this.client.defaults.headers.common[name] = value;
  }

  /**
   * Get all headers currently set on the client
   * @returns The headers object
   */
  public getHeaders(): Record<string, string> {
    return this.client.defaults.headers.common as Record<string, string>;
  }

  /**
   * Make an HTTP request
   * @param path - The API path (will be appended to the base URL)
   * @param options - Request options
   * @returns The response data
   */
  public async request<T = any>(path: string, options: HttpRequestOptions = {}): Promise<HttpResponse<T>> {
    try {
      const {
        method = 'GET',
        headers = {},
        body,
        query,
        timeout,
        responseType = 'json',
        signal,
      } = options;

      const config: AxiosRequestConfig = {
        method: method,
        url: path,
        headers,
        params: query,
        data: body,
        responseType,
        signal,
      };

      if (timeout) {
        config.timeout = timeout;
      }

      const response = await this.client.request<T>(config);

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      return handleRequestError(error as any, this.logger, this.timeout);
    }
  }

  /**
   * Make a GET request
   * @param path - The API path
   * @param options - Request options
   * @returns The response data
   */
  public async get<T = any>(
    path: string, 
    options: Omit<HttpRequestOptions, 'method'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   * @param path - The API path
   * @param body - The request body
   * @param options - Additional request options
   * @returns The response data
   */
  public async post<T = any>(
    path: string,
    body?: any,
    options: Omit<HttpRequestOptions, 'method' | 'body'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  /**
   * Make a DELETE request
   * @param path - The API path
   * @param options - Request options
   * @returns The response data
   */
  public async delete<T = any>(
    path: string,
    options: Omit<HttpRequestOptions, 'method'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  /**
   * Create a new stream request
   * @param path - The API path
   * @param body - The request body
   * @param options - Additional request options
   * @returns A fetch response for streaming
   */
  public async stream(
    path: string,
    body?: any,
    options: Omit<HttpRequestOptions, 'method' | 'body'> = {}
  ): Promise<Response> {
    const authHeader = this.client.defaults.headers.common['Authorization'];
    const headers: Record<string, string> = {
      ...(authHeader ? { 'Authorization': authHeader as string } : {}),
      ...options.headers,
    };

    return createStreamRequest(
      this.baseUrl,
      path,
      body,
      {
        headers,
        signal: options.signal,
      },
      this.logger
    );
  }
}