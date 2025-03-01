/**
 * Characters API types
 * 
 * This file contains type definitions for the Characters API.
 */

/**
 * Character information
 */
export interface Character {
  /**
   * Name of the character
   */
  name: string;

  /**
   * Description of the character
   */
  description?: string;

  /**
   * Slug for the character (used in API requests)
   */
  slug: string;

  /**
   * Share URL for the character
   */
  shareUrl?: string;

  /**
   * Creation timestamp
   */
  createdAt?: string;

  /**
   * Last update timestamp
   */
  updatedAt?: string;

  /**
   * Model ID associated with the character
   */
  modelId?: string;

  /**
   * Whether the character is web-enabled
   */
  webEnabled?: boolean;

  /**
   * Whether the character is adult-oriented
   */
  adult?: boolean;

  /**
   * Tags associated with the character
   */
  tags?: string[];

  /**
   * Character statistics
   */
  stats?: {
    /**
     * Number of imports
     */
    imports?: number;
  };
}

/**
 * Response from listing characters
 */
export interface ListCharactersResponse {
  /**
   * Object type
   */
  object: string;

  /**
   * Array of characters
   */
  data: Character[];

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