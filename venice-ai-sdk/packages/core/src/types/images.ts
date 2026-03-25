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

  /**
   * Desired aspect ratio for the generated image, e.g. "1:1", "16:9".
   */
  aspect_ratio?: string;

  /**
   * Target resolution tier: "1K", "2K", or "4K".
   */
  resolution?: string;

  /**
   * When true, the model may use web search for up-to-date context.
   */
  enable_web_search?: boolean;
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
   * Request ID
   */
  id: string;
  
  /**
   * Array of generated images (base64 encoded strings)
   */
  images: string[];
  
  /**
   * Original request data
   */
  request?: Record<string, unknown>;
  
  /**
   * Timing information
   */
  timing?: {
    inferenceDuration?: number;
    inferencePreprocessingTime?: number;
    inferenceQueueTime?: number;
    total?: number;
  };
  
  /**
   * Legacy data field for backward compatibility
   * @deprecated Use images field instead
   */
  data?: GeneratedImageData | GeneratedImageData[];
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
  /** Text directions to edit the image (1-32768 chars) */
  prompt: string;
  /** Source image: file upload, base64 string, or URL */
  image: Blob | ArrayBuffer | string;
  /** Editor model ID */
  modelId?: string;
  /** Output aspect ratio */
  aspect_ratio?: 'auto' | '1:1' | '3:2' | '16:9' | '21:9' | '9:16' | '2:3' | '3:4' | '4:5';
}

export interface EditImageResponse {
  created: number;
  data: GeneratedImageData[];
}

export interface MultiEditImageRequest {
  /** Edit instructions (1-32768 chars) */
  prompt: string;
  /** Array of 1-3 images: base64 strings or HTTPS URLs. First is base, rest are layers */
  images: (Blob | ArrayBuffer | string)[];
  /** Editor model ID */
  modelId?: string;
}

export interface MultiEditImageResponse {
  created: number;
  data: GeneratedImageData[];
}

export interface RemoveBackgroundRequest {
  /** Image as file upload or base64 string (mutually exclusive with image_url) */
  image?: Blob | ArrayBuffer | string;
  /** HTTPS image URL (mutually exclusive with image) */
  image_url?: string;
}

export interface RemoveBackgroundResponse {
  created: number;
  data: GeneratedImageData[];
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

export type GenerateImageRequestLegacy = ImageRequest;

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

/**
 * Response from listing available image styles
 */
export interface ListImageStylesResponse {
  object: 'list';
  data: string[];
}

/**
 * @deprecated Use ListImageStylesResponse instead
 */
export interface ListImageStylesResponseLegacy {
  styles: {
    name: string;
    description: string;
    available: boolean;
  }[];
}
