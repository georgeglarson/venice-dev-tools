/**
 * Types for Venice.ai Video API
 */

/**
 * Request to generate a video
 */
export interface CreateVideoRequest {
  /** Video generation model (e.g., "wan-2.5-preview-image-to-video") */
  model: string;
  /** Scene description (1-2500 chars) */
  prompt: string;
  /** What to exclude from the video */
  negative_prompt?: string;
  /** Seed for reproducibility */
  seed?: number;
}

/**
 * Video data in the response
 */
export interface VideoData {
  /** Video URL (streaming or final) */
  url?: string;
}

/**
 * Response from video generation API
 */
export interface CreateVideoResponse {
  /** Video generation job ID */
  id: string;
  /** Object type */
  object: string;
  /** Creation timestamp */
  created: number;
  /** Job status */
  status: 'queued' | 'processing' | 'completed' | 'failed';
  /** Model used */
  model: string;
  /** Video data */
  video?: VideoData;
}

/**
 * Request to queue a video generation job
 */
export interface QueueVideoRequest {
  /** Video generation model */
  model: string;
  /** Scene description (1-2500 chars) */
  prompt: string;
  /** What to exclude */
  negative_prompt?: string;
  /** Video duration */
  duration: '5s' | '10s';
  /** Aspect ratio (e.g. "16:9") */
  aspect_ratio?: string;
  /** Video resolution */
  resolution?: '1080p' | '720p' | '480p';
  /** Whether to generate audio */
  audio?: boolean;
  /** Reference image URL or data URL (required for image-to-video models) */
  image_url?: string;
  /** Optional end frame image URL or data URL */
  end_image_url?: string;
  /** Audio file URL or data URL (WAV/MP3, max 30s, max 15MB) */
  audio_url?: string;
  /** Reference video URL or data URL (MP4/MOV/WebM) */
  video_url?: string;
  /** Up to 4 reference image URLs for character/style consistency */
  reference_image_urls?: string[];
  /** Up to 4 elements defining characters/objects (Kling O3 R2V) */
  elements?: Array<{
    frontal_image_url?: string;
    reference_image_urls?: string[];
    video_url?: string;
  }>;
  /** Up to 4 scene reference image URLs */
  scene_image_urls?: string[];
}

/**
 * Response from queuing a video generation job
 */
export interface QueueVideoResponse {
  /** Model used */
  model: string;
  /** Queue job ID */
  queue_id: string;
}

/**
 * Request for a video generation price quote
 */
export interface QuoteVideoRequest {
  /** Model to quote */
  model: string;
  /** Video duration */
  duration: '5s' | '10s';
  /** Aspect ratio */
  aspect_ratio?: string | null;
  /** Resolution */
  resolution?: '1080p' | '720p' | '480p';
  /** Whether audio will be generated */
  audio?: boolean | null;
}

/**
 * Video price quote response
 */
export interface QuoteVideoResponse {
  /** Price in USD */
  quote: number;
}

/**
 * Request to retrieve a video generation result
 */
export interface RetrieveVideoRequest {
  /** Model used */
  model: string;
  /** Queue job ID */
  queue_id: string;
  /** Delete media from storage after retrieval */
  delete_media_on_completion?: boolean;
}

/**
 * Video retrieval response (when still processing)
 */
export interface RetrieveVideoProcessingResponse {
  /** Processing status */
  status: 'PROCESSING';
  /** Estimated execution time (ms, P80) */
  average_execution_time: number;
  /** Current duration (ms) */
  execution_duration: number;
}

/**
 * Request to mark a video generation as complete
 */
export interface CompleteVideoRequest {
  /** Model used */
  model: string;
  /** Queue job ID */
  queue_id: string;
}

/**
 * Video completion response
 */
export interface CompleteVideoResponse {
  /** Whether cleanup was successful */
  success: boolean;
}

/**
 * Request to transcribe a video
 */
export interface CreateVideoTranscriptionRequest {
  /** Publicly accessible video URL */
  url: string;
  /** Output format */
  response_format?: 'json' | 'text';
}
