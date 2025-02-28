/**
 * Venice AI API Client
 * 
 * This is the main client class for interacting with the Venice AI API.
 * It provides access to all API resources and handles configuration.
 * 
 * @example
 * ```typescript
 * import { VeniceAI } from 'venice-ai-sdk-apl';
 * 
 * const venice = new VeniceAI({
 *   apiKey: 'your-api-key',
 * });
 * 
 * // Now you can use the client to access API resources
 * const models = await venice.models.list();
 * ```
 */

import { ChatResource } from './resources/chat';
import { ImageResource } from './resources/image';
import { ModelsResource } from './resources/models';
import { ApiKeysResource } from './resources/api-keys';
import { ClientConfig } from './types/common';
import { HttpClient } from './utils/http';
import { Logger, LogLevel } from './utils/logger';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Partial<ClientConfig> = {
  baseUrl: 'https://api.venice.ai/api/v1',
  timeout: 30000, // 30 seconds
  logLevel: LogLevel.NONE,
};

/**
 * Main Venice AI API client class
 */
export class VeniceAI {
  /**
   * The configuration for this client instance
   */
  private config: ClientConfig;

  /**
   * HTTP client for making API requests
   */
  private httpClient: HttpClient;

  /**
   * Chat completions resource
   */
  public chat: ChatResource;

  /**
   * Image generation resource
   */
  public image: ImageResource;

  /**
   * Models resource
   */
  public models: ModelsResource;

  /**
   * API keys resource
   */
  public apiKeys: ApiKeysResource;

  /**
   * Creates a new Venice AI API client
   * 
   * @param config - Client configuration
   */
  constructor(config: Partial<ClientConfig>) {
    // Merge provided config with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    } as ClientConfig;

    // Validate required config
    if (!this.config.apiKey) {
      throw new Error('API key is required');
    }

    // Configure logger
    if (this.config.logLevel !== undefined) {
      Logger.setLevel(this.config.logLevel);
    }

    // Initialize HTTP client
    this.httpClient = new HttpClient(this.config);

    // Initialize resources
    this.chat = new ChatResource(this.httpClient);
    this.image = new ImageResource(this.httpClient);
    this.models = new ModelsResource(this.httpClient);
    this.apiKeys = new ApiKeysResource(this.httpClient);
  }

  /**
   * Get the current configuration
   */
  public getConfig(): ClientConfig {
    return { ...this.config };
  }

  /**
   * Set the log level
   * 
   * @param level - Log level
   */
  public setLogLevel(level: LogLevel): void {
    this.config.logLevel = level;
    Logger.setLevel(level);
  }

  /**
   * Enable debug logging
   */
  public enableDebugLogging(): void {
    this.setLogLevel(LogLevel.DEBUG);
  }

  /**
   * Disable logging
   */
  public disableLogging(): void {
    this.setLogLevel(LogLevel.NONE);
  }
}

// Export LogLevel enum
export { LogLevel };