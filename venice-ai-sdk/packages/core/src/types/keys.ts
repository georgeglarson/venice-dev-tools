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
 * An API key object
 */
export interface ApiKey {
  /**
   * The API key ID
   */
  id: string;
  
  /**
   * The API key value (only shown once on creation)
   */
  key?: string;
  
  /**
   * The name of the API key
   */
  name: string;
  
  /**
   * The timestamp when the key was created
   */
  created_at: string;
  
  /**
   * The timestamp when the key was last used
   */
  last_used_at?: string;
  
  /**
   * The expiration date of the key (if any)
   */
  expires_at?: string;
  
  /**
   * Whether the key has been revoked
   */
  is_revoked?: boolean;
}

/**
 * Request to create a new API key
 */
export interface CreateApiKeyRequest {
  /**
   * The name to assign to the new API key
   */
  name: string;
  
  /**
   * Optional expiration date for the key (ISO 8601 format)
   */
  expires_at?: string;
}

/**
 * Response from creating a new API key
 */
export interface CreateApiKeyResponse {
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
   * Array of API keys
   */
  api_keys: ApiKey[];
}

/**
 * Request to update an API key
 */
export interface UpdateApiKeyRequest {
  /**
   * New name for the API key (optional)
   */
  name?: string;
  
  /**
   * New expiration date for the key (ISO 8601 format, optional)
   */
  expires_at?: string;
}

/**
 * Response from updating an API key
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
