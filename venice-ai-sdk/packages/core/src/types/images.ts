export interface GenerateImageRequest extends ImageRequest {
  /**
   * Prompt describing the desired image. Required for generation.
   */
  prompt: string;

  /**
   * Optional negative prompt to steer generation away from content.
   */
  negative_prompt?: string;

  /**
   * Venice style preset identifier.
   */
  style_preset?: string;

  /**
   * Optional explicit height for generated image.
   */
  height?: number;

  /**
   * Optional explicit width for generated image.
   */
  width?: number;

  /**
   * Number of inference steps to run.
   */
  steps?: number;

  /**
   * CFG scale parameter controlling adherence to the prompt.
   */
  cfg_scale?: number;

  /**
   * Random seed for deterministic outputs.
   */
  seed?: number;

  /**
   * LoRA strength, if applicable to the chosen model.
   */
  lora_strength?: number;

  /**
   * Enable safe-mode blurring for adult content.
   */
  safe_mode?: boolean;

  /**
   * Return binary data instead of base64 strings or data URLs.
   */
  return_binary?: boolean;

  /**
   * Hide the Venice watermark when supported by the model.
   */
  hide_watermark?: boolean;

  /**
   * Embed prompt metadata into the resulting image EXIF data.
   */
  embed_exif_metadata?: boolean;

  /**
   * Output format for generated image data.
   */
  format?: 'webp' | 'png' | 'jpeg';

  /**
   * Number of image variants to generate (typically 1).
   */
  variants?: number;
}

export type GeneratedImageData =
  | string
  | ArrayBuffer
  | {
      url?: string;
      b64_json?: string;
      revised_prompt?: string;
      prompt?: string;
      negative_prompt?: string;
      model?: string;
      [key: string]: unknown;
    };

export interface GenerateImageResponse {
  /**
   * Generated image payload. May be a single item or an array depending on API version.
   */
  data: GeneratedImageData | GeneratedImageData[];
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
