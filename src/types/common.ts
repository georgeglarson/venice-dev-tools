/**
 * Common types used throughout the SDK
 * 
 * This file contains type definitions that are used across multiple parts of the SDK.
 */

import { LogLevel } from '../utils/logger';

/**
 * Client configuration options
 */
export interface ClientConfig {
  /**
   * Your Venice AI API key
   */
  apiKey: string;

  /**
   * Base URL for API requests
   * @default 'https://api.venice.ai/api/v1'
   */
  baseUrl: string;

  /**
   * Request timeout in milliseconds
   * @default 30000 (30 seconds)
   */
  timeout: number;

  /**
   * Maximum number of retries for failed requests
   * @default 3
   */
  maxRetries?: number;

  /**
   * Whether to include Venice's system prompts
   * @default true
   */
  includeVeniceSystemPrompt?: boolean;

  /**
   * Log level for debugging
   * @default LogLevel.NONE
   */
  logLevel?: LogLevel;
}

/**
 * Common parameters for all API requests
 */
export interface RequestParams {
  /**
   * Path to append to the base URL
   */
  path: string;

  /**
   * HTTP method
   */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';

  /**
   * Query parameters
   */
  query?: Record<string, string | number | boolean | undefined>;

  /**
   * Request body
   */
  body?: any;

  /**
   * Request headers
   */
  headers?: Record<string, string>;

  /**
   * Whether to stream the response
   */
  stream?: boolean;

  /**
   * Form data (for multipart/form-data requests)
   */
  formData?: any;

  /**
   * Request timeout in milliseconds (overrides client timeout)
   */
  timeout?: number;

  /**
   * Response type (e.g., 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream')
   */
  responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
}

/**
 * API response with pagination
 */
export interface PaginatedResponse<T> {
  /**
   * Array of items
   */
  data: T[];

  /**
   * Pagination metadata
   */
  pagination: {
    /**
     * Total number of items
     */
    total: number;

    /**
     * Number of items per page
     */
    limit: number;

    /**
     * Current page number
     */
    page: number;

    /**
     * Total number of pages
     */
    pages: number;
  };
}

/**
 * Venice-specific parameters that can be passed to API requests
 */
export interface VeniceParameters {
  /**
   * Whether to include Venice's system prompts
   * @default true
   */
  include_venice_system_prompt?: boolean;

  /**
   * Whether to enable web search
   * @default 'off'
   */
  enable_web_search?: 'on' | 'off' | 'auto';

  /**
   * Character slug to use for responses
   */
  character_slug?: string;
}

/**
 * Rate limit information returned in API responses
 */
export interface RateLimitInfo {
  /**
   * Number of requests made in the current period
   */
  limit: number;

  /**
   * Number of requests remaining in the current period
   */
  remaining: number;

  /**
   * Timestamp when the rate limit will reset
   */
  reset: number;

  /**
   * Number of tokens used in the current period
   */
  tokensUsed?: number;

  /**
   * Number of tokens remaining in the current period
   */
  tokensRemaining?: number;

  /**
   * Timestamp when the token rate limit will reset
   */
  tokensReset?: number;
}

/**
 * Balance information returned in API responses
 */
export interface BalanceInfo {
  /**
   * VCU balance
   */
  vcu: number;

  /**
   * USD balance
   */
  usd: number;
}