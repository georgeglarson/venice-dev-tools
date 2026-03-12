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
