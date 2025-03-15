/**
 * Base abstract class for HTTP clients in the Venice AI SDK.
 * Provides common functionality for making API requests.
 */
export abstract class BaseHttpClient {
  /**
   * The base URL for API requests.
   */
  protected baseUrl: string;

  /**
   * Headers to include in API requests.
   */
  protected headers: Record<string, string>;

  /**
   * Request timeout in milliseconds.
   */
  protected timeout: number;

  /**
   * Create a new HTTP client.
   * @param baseUrl - The base URL for the API.
   * @param headers - Additional headers to include in requests.
   * @param timeout - Request timeout in milliseconds.
   */
  constructor(
    baseUrl: string = 'https://api.venice.ai/api/v1',
    headers: Record<string, string> = {},
    timeout: number = 30000
  ) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers,
    };
    this.timeout = timeout;
  }

  /**
   * Set an authorization header with a bearer token.
   * @param token - The API key or token.
   */
  public setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Set a custom header for future requests.
   * @param name - The header name.
   * @param value - The header value.
   */
  public setHeader(name: string, value: string): void {
    this.headers[name] = value;
  }

  /**
   * Get the current headers.
   * @returns The current headers.
   */
  public getHeaders(): Record<string, string> {
    return { ...this.headers };
  }

  /**
   * Get the base URL.
   * @returns The base URL.
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get the timeout.
   * @returns The timeout in milliseconds.
   */
  public getTimeout(): number {
    return this.timeout;
  }

  /**
   * Set the timeout.
   * @param timeout - The timeout in milliseconds.
   */
  public setTimeout(timeout: number): void {
    this.timeout = timeout;
  }
}

export default BaseHttpClient;