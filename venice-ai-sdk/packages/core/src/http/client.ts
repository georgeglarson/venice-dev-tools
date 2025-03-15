import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { HttpMethod, HttpRequestOptions, HttpResponse, LogLevel } from '../types';
import { VeniceApiError, VeniceNetworkError, VeniceTimeoutError } from '../errors';
import { Logger } from '../utils/logger';

/**
 * HTTP client for making requests to the Venice AI API.
 */
export class HttpClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private logger: Logger;

  /**
   * Create a new HTTP client.
   * @param baseUrl - The base URL for the API.
   * @param headers - Additional headers to include in requests.
   * @param timeout - Request timeout in milliseconds.
   * @param logger - Optional logger instance.
   */
  constructor(
    baseUrl: string = 'https://api.venice.ai/api/v1',
    headers: Record<string, string> = {},
    timeout: number = 30000,
    logger?: Logger
  ) {
    this.baseUrl = baseUrl;
    this.logger = logger || new Logger({ level: LogLevel.INFO });
    
    this.logger.debug('Initializing HTTP client', {
      baseUrl,
      timeout
    });
    
    this.client = axios.create({
      baseURL: baseUrl,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    
    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        const requestId = Math.random().toString(36).substring(2, 15);
        config.headers['X-Request-ID'] = requestId;
        
        this.logger.debug(`Request ${requestId}: ${config.method?.toUpperCase()} ${config.url}`, {
          headers: this.sanitizeHeaders(config.headers),
          params: config.params,
          data: this.sanitizeData(config.data)
        });
        
        return config;
      },
      (error) => {
        this.logger.error('Request setup error', { error });
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        const requestId = response.config.headers['X-Request-ID'];
        
        this.logger.debug(`Response ${requestId}: ${response.status} ${response.statusText}`, {
          headers: this.sanitizeHeaders(response.headers),
          data: this.sanitizeData(response.data)
        });
        
        return response;
      },
      (error) => {
        const requestId = error.config?.headers?.['X-Request-ID'];
        
        if (error.response) {
          this.logger.error(`Response ${requestId}: ${error.response.status} ${error.response.statusText}`, {
            headers: this.sanitizeHeaders(error.response.headers),
            data: error.response.data
          });
        } else if (error.request) {
          this.logger.error(`Response ${requestId}: No response received`, {
            error: error.message
          });
        } else {
          this.logger.error(`Request ${requestId} error: ${error.message}`);
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Sanitize headers for logging by removing sensitive information.
   * @param headers - The headers to sanitize.
   * @returns The sanitized headers.
   */
  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    if (sanitized.Authorization) {
      sanitized.Authorization = 'Bearer [REDACTED]';
    }
    
    if (sanitized.authorization) {
      sanitized.authorization = 'Bearer [REDACTED]';
    }
    
    return sanitized;
  }
  
  /**
   * Sanitize request/response data for logging by removing sensitive information.
   * @param data - The data to sanitize.
   * @returns The sanitized data.
   */
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      
      if (sanitized.apiKey) {
        sanitized.apiKey = '[REDACTED]';
      }
      
      if (sanitized.api_key) {
        sanitized.api_key = '[REDACTED]';
      }
      
      if (sanitized.password) {
        sanitized.password = '[REDACTED]';
      }
      
      return sanitized;
    }
    
    return data;
  }

  /**
   * Set an authorization header with a bearer token.
   * @param token - The API key or token.
   */
  public setAuthToken(token: string): void {
    this.logger.debug('Setting authorization token');
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Set a custom header for future requests.
   * @param name - The header name.
   * @param value - The header value.
   */
  public setHeader(name: string, value: string): void {
    this.logger.debug(`Setting header: ${name}`);
    this.client.defaults.headers.common[name] = value;
  }

  /**
   * Make an HTTP request.
   * @param path - The API path (will be appended to the base URL).
   * @param options - Request options.
   * @returns The response data.
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

      const response: AxiosResponse<T> = await this.client.request(config);

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      this.handleRequestError(error as AxiosError);
    }

    // This should never be reached, but required for TypeScript
    throw new Error('Unknown error occurred');
  }

  /**
   * Handle API request errors and transform them into appropriate SDK errors.
   * @param error - The Axios error.
   */
  private handleRequestError(error: AxiosError) {
    if (error.response) {
      // The request was made and the server responded with a status code outside the range of 2xx
      const responseData = error.response.data as Record<string, any> || {};
      const errorMessage = responseData.error || 'API request failed';
      const details = responseData.details;
      
      this.logger.error(`API error: ${errorMessage}`, {
        status: error.response.status,
        details: details
      });
      
      throw new VeniceApiError(errorMessage, error.response.status, details);
    } else if (error.request) {
      // The request was made but no response was received
      if (error.code === 'ECONNABORTED') {
        this.logger.error(`Request timed out after ${this.client.defaults.timeout}ms`);
        throw new VeniceTimeoutError('Request timed out');
      }
      
      this.logger.error('Network error', {
        message: error.message,
        code: error.code
      });
      
      throw new VeniceNetworkError('Network error', { cause: error });
    } else {
      // Something happened in setting up the request that triggered an Error
      this.logger.error('Request setup error', { message: error.message });
      throw new Error(error.message || 'Request setup error');
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

  /**
   * Create a new stream request.
   * @param path - The API path.
   * @param body - The request body.
   * @param options - Additional request options.
   * @returns A fetch response for streaming.
   */
  public async stream(
    path: string,
    body?: any,
    options: Omit<HttpRequestOptions, 'method' | 'body'> = {}
  ): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const authHeader = this.client.defaults.headers.common['Authorization'];
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(authHeader ? { 'Authorization': authHeader as string } : {}),
      ...options.headers,
    };

    const requestId = Math.random().toString(36).substring(2, 15);
    
    this.logger.debug(`Stream request ${requestId}: POST ${path}`, {
      headers: this.sanitizeHeaders(headers),
      body: this.sanitizeData(body)
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: options.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
        
        this.logger.error(`Stream response ${requestId} error: ${response.status}`, {
          error: errorData.error,
          details: errorData.details
        });
        
        throw new VeniceApiError(errorData.error || 'Stream request failed', response.status, errorData.details);
      }

      this.logger.debug(`Stream response ${requestId}: ${response.status} ${response.statusText}`);
      
      return response;
    } catch (error) {
      if (error instanceof VeniceApiError) {
        throw error;
      }

      if ((error as Error).name === 'AbortError') {
        this.logger.warn(`Stream request ${requestId} aborted`);
        throw new Error('Request was aborted');
      }

      this.logger.error(`Stream request ${requestId} failed`, {
        error: (error as Error).message
      });
      
      throw new VeniceNetworkError('Stream request failed', { cause: error });
    }
  }
}