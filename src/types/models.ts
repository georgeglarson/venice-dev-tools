/**
 * Models API types
 * 
 * This file contains type definitions for the Models API.
 */

/**
 * Model object
 */
export interface Model {
  /**
   * Unique identifier for the model
   */
  id: string;

  /**
   * Object type
   */
  object: 'model';

  /**
   * Unix timestamp of when the model was created
   */
  created: number;

  /**
   * Organization that owns the model
   */
  owned_by: string;

  /**
   * Model capabilities
   */
  capabilities?: {
    /**
     * Whether the model supports chat completions
     */
    chat_completions?: boolean;

    /**
     * Whether the model supports image generation
     */
    image_generation?: boolean;

    /**
     * Whether the model supports embeddings
     */
    embeddings?: boolean;

    /**
     * Whether the model supports fine-tuning
     */
    fine_tuning?: boolean;
  };

  /**
   * Model traits
   */
  traits?: {
    /**
     * Maximum context length
     */
    context_length?: number;

    /**
     * Whether the model supports function calling
     */
    function_calling?: boolean;

    /**
     * Whether the model supports vision
     */
    vision?: boolean;

    /**
     * Whether the model supports JSON mode
     */
    json_mode?: boolean;
  };
}

/**
 * Response from listing models
 */
export interface ListModelsResponse {
  /**
   * Object type
   */
  object: 'list';

  /**
   * Array of models
   */
  data: Model[];

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
 * Model trait
 */
export interface ModelTrait {
  /**
   * ID of the trait
   */
  id: string;

  /**
   * Name of the trait
   */
  name: string;

  /**
   * Description of the trait
   */
  description: string;

  /**
   * Type of the trait
   */
  type: 'boolean' | 'number' | 'string';

  /**
   * Default value of the trait
   */
  default_value?: boolean | number | string;

  /**
   * Possible values for the trait (for string type)
   */
  possible_values?: string[];

  /**
   * Minimum value (for number type)
   */
  min_value?: number;

  /**
   * Maximum value (for number type)
   */
  max_value?: number;
}

/**
 * Response from listing model traits
 */
export interface ListModelTraitsResponse {
  /**
   * Array of model traits
   */
  traits: ModelTrait[];

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
 * Model compatibility mapping
 */
export interface ModelCompatibilityMapping {
  /**
   * Source model ID
   */
  source_model_id: string;

  /**
   * Target model ID
   */
  target_model_id: string;

  /**
   * Description of the mapping
   */
  description?: string;
}

/**
 * Response from listing model compatibility mappings
 */
export interface ListModelCompatibilityMappingsResponse {
  /**
   * Array of model compatibility mappings
   */
  mappings: ModelCompatibilityMapping[];

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