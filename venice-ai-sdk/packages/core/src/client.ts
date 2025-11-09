import { ConfigManager } from './config/config-manager';
import { EventManager } from './events/event-manager';
import { HttpClientFactory, StandardHttpClient, StreamingHttpClient } from './http';
import { VeniceClientConfig } from './types';
import { LogLevel } from './types/common';
import { RateLimiter } from './utils/rate-limiter';
import { Logger } from './utils/logger';
import { Middleware } from './middleware';

/**
 * The base class for the Venice AI SDK client.
 * This provides core functionality shared by all platform-specific implementations.
 */
export class VeniceClient {
  /**
   * The configuration manager.
   */
  protected configManager: ConfigManager;

  /**
   * The event manager.
   */
  protected eventManager: EventManager;

  /**
   * The HTTP client factory.
   */
  protected httpClientFactory: HttpClientFactory;

  /**
   * The standard HTTP client for making API requests.
   */
  protected standardHttpClient: StandardHttpClient;

  /**
   * The streaming HTTP client for making streaming API requests.
   */
  protected streamingHttpClient: StreamingHttpClient;

  /**
   * The rate limiter for controlling request concurrency and rate limits.
   */
  protected rateLimiter: RateLimiter;

  /**
   * The logger for logging events and errors.
   */
  protected logger: Logger;

  /**
   * Create a new Venice API client.
   * @param config - The client configuration.
   */
  constructor(config: VeniceClientConfig = {}) {
    // Initialize managers
    this.configManager = new ConfigManager(config);
    this.eventManager = new EventManager();
    
    // Initialize logger
    this.logger = new Logger({
      level: config.logLevel !== undefined ? config.logLevel : LogLevel.INFO
    });
    
    // Only log initialization info if log level is not NONE
    if (config.logLevel !== LogLevel.NONE) {
      this.logger.info('Initializing Venice AI client', {
        baseUrl: config.baseUrl || 'https://api.venice.ai/api/v1',
        timeout: config.timeout || 30000
      });
    }
    
    // Initialize rate limiter
    this.rateLimiter = new RateLimiter(
      config.maxConcurrent || 5,
      config.requestsPerMinute || 60
    );
    
    this.logger.debug('Rate limiter initialized', {
      maxConcurrent: config.maxConcurrent || 5,
      requestsPerMinute: config.requestsPerMinute || 60
    });
    
    // Initialize HTTP clients
    this.httpClientFactory = new HttpClientFactory(
      this.configManager.getBaseUrl(),
      this.configManager.getHeaders(),
      this.configManager.getTimeout(),
      this.rateLimiter,
      this.logger
    );
    
    // Create HTTP clients
    this.standardHttpClient = this.httpClientFactory.createStandardClient();
    this.streamingHttpClient = this.httpClientFactory.createStreamingClient();

    // Set API key if provided
    const apiKey = this.configManager.getApiKey();
    if (apiKey) {
      this.setApiKey(apiKey);
      this.logger.debug('API key set from config');
    }
  }

  /**
   * Set the API key for authentication.
   * @param apiKey - The Venice API key.
   */
  public setApiKey(apiKey: string): void {
    this.logger.debug('Setting API key');
    try {
      this.configManager.setApiKey(apiKey);
      this.httpClientFactory.setAuthToken(apiKey);
      
      // Also set the API key in the already created HTTP clients
      this.standardHttpClient.setAuthToken(apiKey);
      this.streamingHttpClient.setAuthToken(apiKey);
      
      this.logger.debug('API key set successfully');
    } catch (error) {
      this.logger.error('Failed to set API key', { error });
      throw error;
    }
  }

  /**
   * Get the current API key.
   * @returns The current API key or undefined if not set.
   */
  public getApiKey(): string | undefined {
    return this.configManager.getApiKey();
  }

  /**
   * Set a custom header for API requests.
   * @param name - The header name.
   * @param value - The header value.
   */
  public setHeader(name: string, value: string): void {
    this.logger.debug(`Setting header: ${name}`);
    this.configManager.setHeader(name, value);
    this.httpClientFactory.setHeader(name, value);
    this.logger.debug(`Header set: ${name}`);
  }

  /**
   * Get the standard HTTP client for making API requests.
   * @returns The standard HTTP client.
   */
  public getStandardHttpClient(): StandardHttpClient {
    return this.standardHttpClient;
  }

  /**
   * Get the streaming HTTP client for making streaming API requests.
   * @returns The streaming HTTP client.
   */
  public getStreamingHttpClient(): StreamingHttpClient {
    return this.streamingHttpClient;
  }

  /**
   * Subscribe to a client event.
   * @param event - The event name.
   * @param listener - The event listener.
   * @returns This client instance.
   */
  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  /**
   * Unsubscribe from a client event.
   * @param event - The event name.
   * @param listener - The event listener.
   * @returns This client instance.
   */
  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  /**
   * Emit a client event.
   * @param event - The event name.
   * @param args - The event arguments.
   * @returns Whether the event had listeners.
   */
  protected emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  /**
   * Get the logger instance.
   * @returns The logger instance.
   */
  public getLogger(): Logger {
    return this.logger;
  }

  /**
   * Register a middleware for request/response interception.
   * 
   * @param middleware - The middleware to register
   * @returns This client instance for chaining
   */
  public use(middleware: Middleware): this {
    this.standardHttpClient.getMiddlewareManager().use(middleware);
    this.logger.debug('Middleware registered', { name: middleware.name });
    return this;
  }

  /**
   * Remove a middleware by name.
   * 
   * @param name - The middleware name
   * @returns True if removed, false if not found
   */
  public removeMiddleware(name: string): boolean {
    const removed = this.standardHttpClient.getMiddlewareManager().remove(name);
    if (removed) {
      this.logger.debug('Middleware removed', { name });
    }
    return removed;
  }

  /**
   * Clear all middlewares.
   */
  public clearMiddlewares(): void {
    this.standardHttpClient.getMiddlewareManager().clear();
    this.logger.debug('All middlewares cleared');
  }

  /**
   * Set the log level.
   * @param level - The log level.
   */
  public setLogLevel(level: LogLevel): void {
    this.logger.setLevel(level);
    this.logger.info(`Log level set to ${LogLevel[level]}`);
  }

  /**
   * Executes a rate-limited API request.
   *
   * @param fn - The request function to execute
   * @returns A promise resolving to the request result
   * @throws {VeniceRateLimitError} If the rate limit is exceeded
   */
  protected async executeRateLimited<T>(fn: () => Promise<T>): Promise<T> {
    try {
      this.logger.debug('Executing rate-limited request');
      const result = await this.rateLimiter.add(fn);
      this.logger.debug('Rate-limited request completed successfully');
      return result;
    } catch (error) {
      this.logger.error('Rate-limited request failed', { error });
      throw error;
    }
  }
}

/**
 * Default export of the VeniceClient class.
 */
export default VeniceClient;