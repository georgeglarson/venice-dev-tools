/**
 * Types for multimodal content
 */

/**
 * Text content type
 */
export interface TextContent {
  type: 'text';
  text: string;
}

/**
 * Image URL content type
 */
export interface ImageUrlContent {
  type: 'image_url';
  image_url: {
    url: string;
  };
}

/**
 * Union type for all content types
 */
export type ContentItem = TextContent | ImageUrlContent;