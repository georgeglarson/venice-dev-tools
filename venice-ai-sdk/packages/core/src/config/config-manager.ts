import { VeniceClientConfig } from '../types';
import { VeniceAuthError } from '../errors';

/**
 * Manages configuration settings for the Venice AI SDK.
 * Handles API key management and other configuration options.
 */
export class ConfigManager {
  /**
   * The client configuration.
   */
  private config: VeniceClientConfig;

  /**
   * Create a new configuration manager.
   * @param initialConfig - The initial configuration.
   */
  constructor(initialConfig: VeniceClientConfig = {}) {
    this.config = {
      baseUrl: 'https://api.venice.ai/api/v1',
      timeout: 30000,
      headers: {},
      ...initialConfig,
    };
  }

  /**
   * Get the current configuration.
   * @returns The current configuration.
   */
  public getConfig(): VeniceClientConfig {
    return { ...this.config };
  }

  /**
   * Set the API key for authentication.
   * @param apiKey - The Venice API key.
   * @throws VeniceAuthError if the API key is empty.
   */
  public setApiKey(apiKey: string): void {
    if (!apiKey) {
      throw new VeniceAuthError('API key cannot be empty');
    }
    this.config.apiKey = apiKey;
  }

  /**
   * Get the current API key.
   * @returns The current API key or undefined if not set.
   */
  public getApiKey(): string | undefined {
    return this.config.apiKey;
  }

  /**
   * Get the current API key, throwing an error if not set.
   * @returns The current API key.
   * @throws VeniceAuthError if no API key is set.
   */
  public getRequiredApiKey(): string {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new VeniceAuthError('No API key set. Use setApiKey() to set your API key.');
    }
    return apiKey;
  }

  /**
   * Set a custom header for API requests.
   * @param name - The header name.
   * @param value - The header value.
   */
  public setHeader(name: string, value: string): void {
    if (this.config.headers) {
      this.config.headers[name] = value;
    } else {
      this.config.headers = { [name]: value };
    }
  }

  /**
   * Get the base URL for API requests.
   * @returns The base URL.
   */
  public getBaseUrl(): string {
    return this.config.baseUrl || 'https://api.venice.ai/api/v1';
  }

  /**
   * Get the request timeout in milliseconds.
   * @returns The timeout in milliseconds.
   */
  public getTimeout(): number {
    return this.config.timeout || 30000;
  }

  /**
   * Get the headers for API requests.
   * @returns The headers.
   */
  public getHeaders(): Record<string, string> {
    return this.config.headers || {};
  }
}

export default ConfigManager;