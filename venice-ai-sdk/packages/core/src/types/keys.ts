/**
 * Types for the API Keys endpoints
 */

/**
 * Rate limit log entry
 */
export interface RateLimitLogEntry {
  /**
   * The ID of the API key that exceeded the limit
   */
  apiKeyId: string;
  
  /**
   * The ID of the model that was used when the rate limit was exceeded
   */
  modelId: string;
  
  /**
   * The type of rate limit that was exceeded
   */
  rateLimitType: string;
  
  /**
   * The API tier of the rate limit
   */
  rateLimitTier: string;
  
  /**
   * The timestamp when the rate limit was exceeded
   */
  timestamp: string;
}

/**
 * Response from getting rate limit logs
 */
export interface ListRateLimitLogsResponse {
  /**
   * The type of object ("list")
   */
  object: string;
  
  /**
   * Array of rate limit log entries
   */
  data: RateLimitLogEntry[];
}

/**
 * Consumption limits for an API key
 */
export interface ApiKeyConsumptionLimits {
  /**
   * USD consumption limit
   */
  usd: number | null;

  /**
   * VCU consumption limit
   */
  vcu: number | null;

  /**
   * DIEM consumption limit (if provided by API)
   */
  diem?: number | null;
}

/**
 * Usage information for an API key
 */
export interface ApiKeyUsage {
  /**
   * Usage over the trailing seven days
   */
  trailingSevenDays?: {
    /**
     * USD usage as a string value
     */
    usd?: string;
    /**
     * VCU usage as a string value
     */
    vcu?: string;
    /**
     * DIEM usage as a string value (if provided)
     */
    diem?: string;
  };
}

/**
 * Represents an API key returned by the Venice API.
 * Includes both the current response fields and backward-compatible aliases.
 */
export interface ApiKey {
  /**
   * Unique identifier for the API key
   */
  id: string;

  /**
   * Human-readable description for the key
   */
  description: string;

  /**
   * API key type (ADMIN or INFERENCE)
   */
  apiKeyType: 'ADMIN' | 'INFERENCE';

  /**
   * Timestamp when the key was created (ISO 8601) or null when unavailable
   */
  createdAt: string | null;

  /**
   * Timestamp when the key expires (ISO 8601) or null if it never expires
   */
  expiresAt: string | null;

  /**
   * Timestamp when the key was last used (ISO 8601) or null if unused
   */
  lastUsedAt?: string | null;

  /**
   * Last six characters of the API key for display purposes
   */
  last6Chars?: string;

  /**
   * Consumption limits configured for the key
   */
  consumptionLimits?: ApiKeyConsumptionLimits | null;

  /**
   * Usage information for the key
   */
  usage?: ApiKeyUsage;

  /**
   * The raw API key value (only provided on creation responses)
   */
  apiKey?: string;

  /**
   * @deprecated Alias for `description`
   */
  name?: string;

  /**
   * @deprecated Alias for `createdAt`
   */
  created_at?: string | null;

  /**
   * @deprecated Alias for `expiresAt`
   */
  expires_at?: string | null;

  /**
   * @deprecated Alias for `lastUsedAt`
   */
  last_used_at?: string | null;

  /**
   * @deprecated Alias retained for compatibility (not provided by the API)
   */
  is_revoked?: boolean;

  /**
   * @deprecated Alias for `apiKey`
   */
  key?: string;
}

/**
 * Request to create a new API key
 */
export interface CreateApiKeyRequest {
  /**
   * Description for the new API key (alias: name)
   */
  description?: string;

  /**
   * API key type (defaults to INFERENCE)
   */
  apiKeyType?: 'ADMIN' | 'INFERENCE';

  /**
   * Expiration date (ISO 8601). Empty string removes expiration.
   */
  expiresAt?: string;

  /**
   * Consumption limits for the key
   */
  consumptionLimit?: ApiKeyConsumptionLimits;

  /**
   * @deprecated Alias for `description`
   */
  name?: string;

  /**
   * @deprecated Alias for `expiresAt`
   */
  expires_at?: string;
}

/**
 * Response from creating a new API key
 */
export interface CreateApiKeyResponse {
  /**
   * Indicates whether the operation succeeded
   */
  success: boolean;

  /**
   * The created API key object
   */
  api_key: ApiKey;
}

/**
 * Response from listing API keys
 */
export interface ListApiKeysResponse {
  /**
   * Object type (always "list")
   */
  object: string;

  /**
   * Array of API keys (modern field)
   */
  data: ApiKey[];

  /**
   * @deprecated Legacy alias for the API key list
   */
  api_keys: ApiKey[];
}

/**
 * Request to update an API key
 */
export interface UpdateApiKeyRequest {
  /**
   * Updated description for the key
   */
  description?: string;

  /**
   * Updated API key type
   */
  apiKeyType?: 'ADMIN' | 'INFERENCE';

  /**
   * Updated expiration date (ISO 8601). Empty string removes expiration.
   */
  expiresAt?: string;

  /**
   * Updated consumption limits for the key
   */
  consumptionLimit?: ApiKeyConsumptionLimits;

  /**
   * @deprecated Alias for `description`
   */
  name?: string;

  /**
   * @deprecated Alias for `expiresAt`
   */
  expires_at?: string;
}

/**
 * Response from updating an API key
 * (Currently the Venice API does not support updates,
 * but the type is retained for forward compatibility.)
 */
export interface UpdateApiKeyResponse {
  /**
   * The updated API key object
   */
  api_key: ApiKey;
}

/**
 * Response from generating a web3 token
 */
export interface GenerateWeb3TokenResponse {
  /**
   * The generated token to be signed with a wallet
   */
  token: string;
}

/**
 * Request to create an API key with web3 authentication
 */
export interface CreateWeb3ApiKeyRequest {
  /**
   * The wallet address
   */
  address: string;
  
  /**
   * The signature of the token
   */
  signature: string;
  
  /**
   * The token that was signed
   */
  token: string;
  
  /**
   * Description for the API key
   */
  description?: string;
  
  /**
   * Type of API key (ADMIN or INFERENCE)
   */
  apiKeyType?: 'ADMIN' | 'INFERENCE';
  
  /**
   * Expiration date for the key (ISO 8601 format)
   */
  expiresAt?: string;
  
  /**
   * Consumption limits for the key
   */
  consumptionLimit?: {
    /**
     * VCU consumption limit
     */
    vcu: number | null;
    
    /**
     * USD consumption limit
     */
    usd: number | null;
  };
}

/**
 * Response from creating an API key with web3 authentication
 */
export interface CreateWeb3ApiKeyResponse {
  /**
   * The created API key object
   */
  api_key: ApiKey;
}
