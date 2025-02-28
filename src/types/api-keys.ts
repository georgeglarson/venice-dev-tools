/**
 * API Keys types
 * 
 * This file contains type definitions for the API Keys API.
 */

/**
 * API key object
 */
export interface ApiKey {
  /**
   * Unique identifier for the API key
   */
  id: string;

  /**
   * Description of the API key
   */
  description: string;

  /**
   * Last 6 characters of the API key
   */
  last6Chars: string;

  /**
   * ISO timestamp of when the API key was created
   */
  createdAt: string;

  /**
   * ISO timestamp of when the API key expires
   */
  expiresAt: string;

  /**
   * Type of API key (INFERENCE or ADMIN)
   */
  apiKeyType: 'INFERENCE' | 'ADMIN';

  /**
   * ISO timestamp of when the API key was last used
   */
  lastUsedAt?: string | null;

  /**
   * Usage information for the API key
   */
  usage?: {
    trailingSevenDays: {
      vcu: string;
      usd: string;
    };
  };
}

/**
 * Response from listing API keys
 */
export interface ListApiKeysResponse {
  /**
   * Array of API keys
   */
  keys: ApiKey[];

  /**
   * Object type (from original API response)
   */
  object?: string;

  /**
   * Original data array (from API response)
   */
  data?: ApiKey[];

  /**
   * Metadata about the response
   */
  _metadata?: {
    /**
     * Rate limit information
     */
    rateLimit?: {
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
    };
  };
}

/**
 * Parameters for creating an API key
 */
export interface CreateApiKeyParams {
  /**
   * Name of the API key
   */
  name: string;
}

/**
 * Response from creating an API key
 */
export interface CreateApiKeyResponse {
  /**
   * API key object
   */
  key: ApiKey & {
    /**
     * Full API key (only returned when creating a new key)
     */
    key: string;
  };

  /**
   * Metadata about the response
   */
  _metadata?: {
    /**
     * Rate limit information
     */
    rateLimit?: {
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
    };
  };
}

/**
 * Parameters for deleting an API key
 */
export interface DeleteApiKeyParams {
  /**
   * ID of the API key to delete
   */
  id: string;
}

/**
 * Response from deleting an API key
 */
export interface DeleteApiKeyResponse {
  /**
   * Whether the API key was successfully deleted
   */
  success: boolean;

  /**
   * Metadata about the response
   */
  _metadata?: {
    /**
     * Rate limit information
     */
    rateLimit?: {
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
    };
  };
}

/**
 * API key rate limit
 */
export interface ApiKeyRateLimit {
  /**
   * Model ID
   */
  model_id: string;

  /**
   * Model name
   */
  model_name: string;

  /**
   * Requests per minute
   */
  requests_per_minute: number;

  /**
   * Requests per day
   */
  requests_per_day: number;

  /**
   * Tokens per minute
   */
  tokens_per_minute: number;
}

/**
 * Response from getting API key rate limits
 */
export interface GetApiKeyRateLimitsResponse {
  /**
   * Array of API key rate limits
   */
  rate_limits: ApiKeyRateLimit[];

  /**
   * Tier of the API key
   */
  tier: 'explorer' | 'paid';

  /**
   * Metadata about the response
   */
  _metadata?: {
    /**
     * Rate limit information
     */
    rateLimit?: {
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
    };
  };
}

/**
 * Parameters for generating a Web3 API key (GET)
 */
export interface GenerateWeb3KeyGetParams {
  /**
   * Wallet address
   */
  wallet_address: string;
}

/**
 * Response from generating a Web3 API key (GET)
 */
export interface GenerateWeb3KeyGetResponse {
  /**
   * Message to sign
   */
  message: string;

  /**
   * Metadata about the response
   */
  _metadata?: {
    /**
     * Rate limit information
     */
    rateLimit?: {
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
    };
  };
}

/**
 * Parameters for generating a Web3 API key (POST)
 */
export interface GenerateWeb3KeyPostParams {
  /**
   * Wallet address
   */
  wallet_address: string;

  /**
   * Signed message
   */
  signature: string;

  /**
   * Name of the API key
   */
  name?: string;
}

/**
 * Response from generating a Web3 API key (POST)
 */
export interface GenerateWeb3KeyPostResponse {
  /**
   * API key object
   */
  key: ApiKey & {
    /**
     * Full API key (only returned when creating a new key)
     */
    key: string;
  };

  /**
   * Metadata about the response
   */
  _metadata?: {
    /**
     * Rate limit information
     */
    rateLimit?: {
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
    };
  };
}