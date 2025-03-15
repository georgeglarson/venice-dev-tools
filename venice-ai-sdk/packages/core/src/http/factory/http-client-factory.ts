import { BaseHttpClient } from '../base/base-http-client';
import { StandardHttpClient } from '../standard/standard-http-client';
import { StreamingHttpClient } from '../streaming/streaming-http-client';
import { ErrorHandler } from '../error/error-handler';
import { RateLimiter } from '../../utils/rate-limiter';
import { Logger } from '../../utils/logger';

/**
 * Factory for creating HTTP client instances.
 */
export class HttpClientFactory {
  /**
   * The base URL for API requests.
   */
  private baseUrl: string;

  /**
   * Headers to include in API requests.
   */
  private headers: Record<string, string>;

  /**
   * Request timeout in milliseconds.
   */
  private timeout: number;

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
   * Create a new HTTP client factory.
   * @param baseUrl - The base URL for the API.
   * @param headers - Additional headers to include in requests.
   * @param timeout - Request timeout in milliseconds.
   * @param rateLimiter - Optional rate limiter for controlling request concurrency.
   * @param logger - Optional logger for logging events and errors.
   */
  constructor(
    baseUrl: string = 'https://api.venice.ai/api/v1',
    headers: Record<string, string> = {},
    timeout: number = 30000,
    rateLimiter?: RateLimiter,
    logger?: Logger
  ) {
    this.baseUrl = baseUrl;
    this.headers = headers;
    this.timeout = timeout;
    this.errorHandler = new ErrorHandler();
    this.rateLimiter = rateLimiter;
    this.logger = logger;
    
    if (this.logger) {
      this.logger.debug('Initializing HTTP client factory', {
        baseUrl,
        timeout
      });
    }
  }

  /**
   * Create a standard HTTP client.
   * @returns A new standard HTTP client.
   */
  public createStandardClient(): StandardHttpClient {
    if (this.logger) {
      this.logger.debug('Creating standard HTTP client');
    }
    
    return new StandardHttpClient(
      this.baseUrl,
      this.headers,
      this.timeout,
      this.errorHandler,
      this.rateLimiter,
      this.logger
    );
  }

  /**
   * Create a streaming HTTP client.
   * @returns A new streaming HTTP client.
   */
  public createStreamingClient(): StreamingHttpClient {
    if (this.logger) {
      this.logger.debug('Creating streaming HTTP client');
    }
    
    return new StreamingHttpClient(
      this.baseUrl,
      this.headers,
      this.timeout,
      this.errorHandler,
      this.rateLimiter,
      this.logger
    );
  }

  /**
   * Set the base URL for all created clients.
   * @param baseUrl - The base URL.
   */
  public setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  /**
   * Set headers for all created clients.
   * @param headers - The headers.
   */
  public setHeaders(headers: Record<string, string>): void {
    this.headers = headers;
  }

  /**
   * Set a specific header for all created clients.
   * @param name - The header name.
   * @param value - The header value.
   */
  public setHeader(name: string, value: string): void {
    this.headers[name] = value;
  }

  /**
   * Set the timeout for all created clients.
   * @param timeout - The timeout in milliseconds.
   */
  public setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  /**
   * Set the authorization token for all created clients.
   * @param token - The API key or token.
   */
  public setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }
}

export default HttpClientFactory;