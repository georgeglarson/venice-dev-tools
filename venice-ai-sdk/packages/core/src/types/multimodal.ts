/**
 * Types for multimodal content
 */

/**
 * Cache control for prompt caching
 */
export interface CacheControl {
  type: 'ephemeral';
  ttl?: string;
}

/**
 * Text content type
 */
export interface TextContent {
  type: 'text';
  text: string;
  cache_control?: CacheControl;
}

/**
 * Image URL content type
 */
export interface ImageUrlContent {
  type: 'image_url';
  image_url: {
    url: string;
  };
  cache_control?: CacheControl;
}

/**
 * Audio input content type (base64-encoded audio data)
 */
export interface InputAudioContent {
  type: 'input_audio';
  input_audio: {
    data: string;
    format?: 'wav' | 'mp3' | 'aiff' | 'aac' | 'ogg' | 'flac' | 'm4a' | 'pcm16' | 'pcm24';
  };
  cache_control?: CacheControl;
}

/**
 * Video URL content type
 */
export interface VideoUrlContent {
  type: 'video_url';
  video_url: {
    url: string;
  };
  cache_control?: CacheControl;
}

/**
 * Union type for all content types
 */
export type ContentItem = TextContent | ImageUrlContent | InputAudioContent | VideoUrlContent;
