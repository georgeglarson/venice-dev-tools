/**
 * Image API types
 * 
 * This file contains type definitions for the Image API.
 */

/**
 * Parameters for generating an image
 */
export interface GenerateImageParams {
  /**
   * ID of the model to use
   */
  model: string;

  /**
   * Text prompt to generate an image from
   */
  prompt: string;

  /**
   * Text prompt to avoid in the generated image
   */
  negative_prompt?: string;

  /**
   * Style preset to use for the image
   */
  style_preset?: string;

  /**
   * Height of the image in pixels
   */
  height?: number;

  /**
   * Width of the image in pixels
   */
  width?: number;

  /**
   * Number of diffusion steps
   */
  steps?: number;

  /**
   * Classifier-free guidance scale
   */
  cfg_scale?: number;

  /**
   * Random seed for reproducible results
   */
  seed?: number;

  /**
   * LoRA strength (0-100)
   */
  lora_strength?: number;

  /**
   * Whether to enable safe mode
   */
  safe_mode?: boolean;

  /**
   * Whether to return binary image data
   */
  return_binary?: boolean;

  /**
   * Whether to hide the watermark
   */
  hide_watermark?: boolean;
}

/**
 * Response from generating an image
 */
export interface GenerateImageResponse {
  /**
   * Array of generated images
   */
  images: Array<{
    /**
     * Base64-encoded image data
     */
    b64_json?: string;

    /**
     * URL to the generated image
     */
    url?: string;

    /**
     * Binary image data (if return_binary is true)
     */
    binary?: Buffer;
  }>;

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

    /**
     * Balance information
     */
    balance?: {
      /**
       * VCU balance
       */
      vcu: number;

      /**
       * USD balance
       */
      usd: number;
    };
  };
}

/**
 * Parameters for upscaling an image
 */
export interface UpscaleImageParams {
  /**
   * ID of the model to use (optional)
   */
  model?: string;

  /**
   * Base64-encoded image data
   */
  image: string;

  /**
   * Scale factor for upscaling
   */
  scale?: number;

  /**
   * Whether to return binary image data
   */
  return_binary?: boolean;
}

/**
 * Response from upscaling an image
 */
export interface UpscaleImageResponse {
  /**
   * Base64-encoded image data
   */
  b64_json?: string;

  /**
   * URL to the upscaled image
   */
  url?: string;

  /**
   * Binary image data (if return_binary is true)
   */
  binary?: Buffer;

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

    /**
     * Balance information
     */
    balance?: {
      /**
       * VCU balance
       */
      vcu: number;

      /**
       * USD balance
       */
      usd: number;
    };
  };
}

/**
 * Image style
 */
export interface ImageStyle {
  /**
   * ID of the style
   */
  id: string;

  /**
   * Name of the style
   */
  name: string;

  /**
   * Description of the style
   */
  description?: string;

  /**
   * URL to a preview image of the style
   */
  preview_url?: string;
}

/**
 * Response from listing image styles
 */
export interface ListImageStylesResponse {
  /**
   * Array of image styles
   */
  styles: ImageStyle[];

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