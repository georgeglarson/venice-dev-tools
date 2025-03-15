import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BaseHttpClient } from '../base/base-http-client';
import { ErrorHandler } from '../error/error-handler';
import { HttpMethod, HttpRequestOptions, HttpResponse } from '../../types';
import { RateLimiter } from '../../utils/rate-limiter';
import { Logger } from '../../utils/logger';

/**
 * HTTP client for making standard (non-streaming) requests to the Venice AI API.
 */
export class StandardHttpClient extends BaseHttpClient {
  /**
   * The Axios client instance.
   */
  private client: AxiosInstance;

  /**
   * The error handler.
   */
  private errorHandler: ErrorHandler;

  /**
   * The rate limiter for controlling request concurrency and rate limits.
   */
  private rateLimiter?: RateLimiter;

  /**
   * The logger for logging events and errors.
   */
  private logger?: Logger;

  /**
   * Create a new standard HTTP client.
   * @param baseUrl - The base URL for the API.
   * @param headers - Additional headers to include in requests.
   * @param timeout - Request timeout in milliseconds.
   * @param errorHandler - The error handler to use.
   * @param rateLimiter - Optional rate limiter for controlling request concurrency.
   * @param logger - Optional logger for logging events and errors.
   */
  constructor(
    baseUrl: string = 'https://api.venice.ai/api/v1',
    headers: Record<string, string> = {},
    timeout: number = 30000,
    errorHandler: ErrorHandler = new ErrorHandler(),
    rateLimiter?: RateLimiter,
    logger?: Logger
  ) {
    super(baseUrl, headers, timeout);
    
    this.errorHandler = errorHandler;
    this.rateLimiter = rateLimiter;
    this.logger = logger;
    
    if (this.logger) {
      this.logger.debug('Initializing standard HTTP client', {
        baseUrl,
        timeout
      });
    }
    
    this.client = axios.create({
      baseURL: baseUrl,
      timeout,
      headers: this.headers,
    });
  }

  /**
   * Set an authorization header with a bearer token.
   * @param token - The API key or token.
   */
  public setAuthToken(token: string): void {
    super.setAuthToken(token);
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Set a custom header for future requests.
   * @param name - The header name.
   * @param value - The header value.
   */
  public setHeader(name: string, value: string): void {
    super.setHeader(name, value);
    this.client.defaults.headers.common[name] = value;
  }

  /**
   * Make an HTTP request.
   * @param path - The API path (will be appended to the base URL).
   * @param options - Request options.
   * @returns The response data.
   */
  public async request<T = any>(path: string, options: HttpRequestOptions = {}): Promise<HttpResponse<T>> {
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

    if (this.logger) {
      this.logger.debug(`Preparing ${method} request to ${path}`, {
        params: query,
        headers: headers
      });
    }

    // Define the request function
    const makeRequest = async (): Promise<HttpResponse<T>> => {
      try {
        const response: AxiosResponse<T> = await this.client.request(config);

        if (this.logger) {
          this.logger.debug(`${method} request to ${path} succeeded`, {
            status: response.status
          });
        }

        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers as Record<string, string>,
        };
      } catch (error) {
        if (this.logger) {
          this.logger.error(`${method} request to ${path} failed`, {
            error: (error as any).message
          });
        }
        return this.errorHandler.handleRequestError(error as any);
      }
    };

    // Use rate limiter if available, otherwise make the request directly
    if (this.rateLimiter) {
      if (this.logger) {
        this.logger.debug(`Rate limiting ${method} request to ${path}`);
      }
      return this.rateLimiter.add(makeRequest);
    } else {
      return makeRequest();
    }
  }

  /**
   * Make a GET request.
   * @param path - The API path.
   * @param options - Request options.
   * @returns The response data.
   */
  public async get<T = any>(path: string, options: Omit<HttpRequestOptions, 'method'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request.
   * @param path - The API path.
   * @param body - The request body.
   * @param options - Additional request options.
   * @returns The response data.
   */
  public async post<T = any>(
    path: string,
    body?: any,
    options: Omit<HttpRequestOptions, 'method' | 'body'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  /**
   * Make a DELETE request.
   * @param path - The API path.
   * @param options - Request options.
   * @returns The response data.
   */
  public async delete<T = any>(
    path: string,
    options: Omit<HttpRequestOptions, 'method'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export default StandardHttpClient;