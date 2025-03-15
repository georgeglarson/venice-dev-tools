/**
 * Interface for API error responses.
 */
export interface ApiErrorResponse {
  error: string;
  details?: Record<string, any>;
}

/**
 * Log levels for the logger.
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * Interface for Venice API client configuration.
 */
export interface VeniceClientConfig {
  /**
   * The API key for authentication.
   */
  apiKey?: string;
  
  /**
   * The base URL for the API.
   */
  baseUrl?: string;
  
  /**
   * Request timeout in milliseconds.
   */
  timeout?: number;
  
  /**
   * Additional headers to include in requests.
   */
  headers?: Record<string, string>;
  
  /**
   * Maximum number of concurrent requests.
   */
  maxConcurrent?: number;
  
  /**
   * Maximum requests per minute.
   */
  requestsPerMinute?: number;
  
  /**
   * Log level for the client.
   */
  logLevel?: LogLevel;
}

/**
 * Interface for Venice-specific parameters for requests.
 */
export interface VeniceParameters {
  enable_web_search?: 'auto' | 'on' | 'off';
  include_venice_system_prompt?: boolean;
  character_slug?: string;
}

/**
 * Interface for character information.
 */
export interface Character {
  name: string;
  description: string | null;
  slug: string;
  shareUrl: string | null;
  createdAt: string;
  updatedAt: string;
  webEnabled: boolean;
  adult: boolean;
  tags: string[];
  stats: {
    imports: number;
  };
}

/**
 * Interface for the response from listing characters.
 */
export interface ListCharactersResponse {
  object: 'list';
  data: Character[];
}

/**
 * Type for HTTP methods.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Interface for HTTP request options.
 */
export interface HttpRequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, any>;
  timeout?: number;
  responseType?: 'json' | 'text' | 'arraybuffer' | 'blob' | 'stream';
  signal?: AbortSignal;
}

/**
 * Interface for HTTP response.
 */
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * Type for streaming response handlers.
 */
export type StreamHandler<T> = (chunk: T) => void | Promise<void>;