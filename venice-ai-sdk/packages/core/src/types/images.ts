export interface GenerateImageRequest {
  /**
   * The model to use for image generation.
   */
  model: string;

  /**
   * The description for the image. Character limit is model specific
   * and is listed in the promptCharacterLimit setting in the model list endpoint.
   */
  prompt: string;

  /**
   * A description of what should not be in the image. Character limit
   * is model specific and is listed in the promptCharacterLimit
   * constraint in the model list endpoint.
   */
  negative_prompt?: string;

  /**
   * An image style to apply to the image. Visit
   * https://docs.venice.ai/api-reference/endpoint/image/styles for more
   * details.
   */
  style_preset?: string;

  /**
   * Height of the generated image. Each model has a specific height and
   * width divisor listed in the widthHeightDivisor constraint in the
   * model list endpoint.
   */
  height?: number;

  /**
   * Width of the generated image. Each model has a specific height and
   * width divisor listed in the widthHeightDivisor constraint in the
   * model list endpoint.
   */
  width?: number;

  /**
   * Number of inference steps. The following models have reduced max
   * steps from the global max: venice-sd35: 30 max steps, hidream: 50
   * max steps, lustify-sdxl: 50 max steps, lustify-v7: 50 max steps,
   * qwen-image: 8 max steps, wai-Illustrious: 30 max steps. These
   * constraints are exposed in the model list endpoint for each model.
   */
  steps?: number;

  /**
   * CFG scale parameter. Higher values lead to more adherence to the
   * prompt.
   */
  cfg_scale?: number;

  /**
   * Random seed for generation. If not provided, a random seed will be
   * used.
   */
  seed?: number;

  /**
   * Lora strength for the model. Only applies if the model uses
   * additional Loras.
   */
  lora_strength?: number;

  /**
   * Whether to use safe mode. If enabled, this will blur images that
   * are classified as having adult content.
   */
  safe_mode?: boolean;

  /**
   * Whether to return binary image data instead of base64.
   */
  return_binary?: boolean;

  /**
   * Whether to hide the Venice watermark. Venice may ignore this
   * parameter for certain generated content.
   */
  hide_watermark?: boolean;

  /**
   * Embed prompt generation information into the image's EXIF metadata.
   */
  embed_exif_metadata?: boolean;

  /**
   * The image format to return. WebP are smaller and optimized for web
   * use. PNG are higher quality but larger in file size.
   */
  format?: 'webp' | 'png' | 'jpeg';

  /**
   * Number of images to generate (1–4). Only supported when
   * return_binary is false.
   */
  variants?: number;
}

export interface GenerateImageResponse {
  data: string | ArrayBuffer;
}

export interface GenerateImageResponseHeaders {
  'x-venice-is-content-violation'?: boolean;
  'x-venice-is-blurred'?: boolean;
}

export interface UpscaleImageRequest {
  /**
   * The image to upscale. Can be either a file upload or a
   * base64-encoded string. Image dimensions must be at least 65536
   * pixels and final dimensions after scaling must not exceed 16777216
   * pixels.
   */
  image: Blob | ArrayBuffer | string;

  /**
   * The scale factor for upscaling the image. Must be a number between
   * 1 and 4. Scale of 1 requires enhance to be set true and will only
   * run enhancer. Scale must be > 1 if enhance is false. A scale of
   * 4 with large images will result in scale being dynamically set
   * to ensure final image stays within maximum size limits.
   */
  scale?: number;

  /**
   * Whether to enhance image using Venice's image engine during
   * upscaling. Must be true if scale is 1.
   */
  enhance?: boolean;

  /**
   * Higher values let enhancement AI change the image more. Setting
   * this to 1 effectively creates an entirely new image.
   */
  enhanceCreativity?: number;

  /**
   * The text to image style to apply during prompt enhancement. Does
   * best with short descriptive prompts, like gold, marble or angry,
   * menacing.
   */
  enhancePrompt?: string;

  /**
   * How strongly lines and noise in the base image are preserved.
   * Higher values are noisier but less plastic/AI
   * "generated"/hallucinated. Must be between 0 and 1.
   */
  replication?: number;
}

export interface UpscaleImageResponse {
  data: ArrayBuffer;
}

export interface EditImageRequest {
  /**
   * The text directions to edit or modify the image. Does best with
   * short but descriptive prompts. IE: "Change the color of", "remove
   * object", "change the sky to a sunrise", etc.
   */
  prompt: string;

  /**
   * The image to edit. Can be either a file upload, a
   * base64-encoded string, or a URL starting with http:// or https://. Image dimensions
   * must be at least 65536 pixels and must not exceed 33177600 pixels.
   * Image URLs must be less than 10MB.
   */
  image: Blob | ArrayBuffer | string;
}

export interface EditImageResponse {
  data: ArrayBuffer;
}

// Legacy interfaces for backward compatibility
export interface ImageRequest {
  model: string;
  n?: number;
  size?: number;
  response_format?: 'url' | 'b64_json';
  user?: string;
  prompt?: string;
  negative_prompt?: string;
  style?: string;
  quality?: 'standard' | 'high' | 'ultra';
  safety?: 'low' | 'medium' | 'high';
  copyright?: 'free' | 'commercial';
  watermark?: 'none' | 'low' | 'high';
  metadata?: { key: string; value: string }[];
}

export interface GenerateImageRequestLegacy extends ImageRequest {
  // Additional properties specific to legacy GenerateImageRequest can be added here
}

export interface GenerateImageResponseLegacy {
  data: {
    url: string;
    created_at: number;
    model: string;
    size: number;
    response_format: 'url' | 'b64_json';
    user: string;
    prompt: string;
    negative_prompt: string;
    style: string;
    quality: 'standard' | 'high' | 'ultra';
    safety: 'low' | 'medium' | 'high';
    copyright: 'free' | 'commercial';
    watermark: 'none' | 'low' | 'high';
    metadata: { key: string; value: string }[];
  };
}

export interface ListImageStylesResponse {
  styles: {
    name: string;
    description: string;
    available: boolean;
  }[];
}