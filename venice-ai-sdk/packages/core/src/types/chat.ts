/**
 * Types for the Chat API endpoints
 */
import { ContentItem } from './multimodal';

/**
 * The role of a message in a chat completion
 */
export type ChatCompletionRole = 'system' | 'user' | 'assistant';

/**
 * A single message in a chat completion
 */
export interface ChatCompletionMessage {
  /**
   * The role of the message author
   */
  role: ChatCompletionRole;
  
  /**
   * The content of the message
   * Can be a string for simple text messages or an array of content items for multimodal messages
   */
  content: string | ContentItem[];
}

/**
 * Request parameters for chat completion
 */
export interface ChatCompletionRequest {
  /**
   * The model to use for chat completion
   */
  model: string;
  
  /**
   * A list of messages to generate a completion for
   */
  messages: ChatCompletionMessage[];
  
  /**
   * The maximum number of tokens to generate
   */
  max_tokens?: number;
  
  /**
   * The temperature for sampling (0-1). Higher values mean more randomness.
   */
  temperature?: number;
  
  /**
   * The top-p sampling parameter (0-1)
   */
  top_p?: number;
  
  /**
   * Whether to stream the response
   */
  stream?: boolean;
}

/**
 * Chat completion choice object returned by the API
 */
export interface ChatCompletionChoice {
  /**
   * The index of the choice
   */
  index: number;
  
  /**
   * The completion message
   */
  message: ChatCompletionMessage;
  
  /**
   * The finish reason
   */
  finish_reason: string | null;
}

/**
 * Usage statistics for a chat completion
 */
export interface ChatCompletionUsage {
  /**
   * The number of prompt tokens used
   */
  prompt_tokens: number;
  
  /**
   * The number of completion tokens used
   */
  completion_tokens: number;
  
  /**
   * The total number of tokens used
   */
  total_tokens: number;
}

/**
 * Response from a chat completion request
 */
export interface ChatCompletionResponse {
  /**
   * The ID of the chat completion
   */
  id: string;
  
  /**
   * The type of object ("chat.completion")
   */
  object: string;
  
  /**
   * The timestamp of when the completion was created
   */
  created: number;
  
  /**
   * The model used for the completion
   */
  model: string;
  
  /**
   * The list of completion choices
   */
  choices: ChatCompletionChoice[];
  
  /**
   * Usage statistics
   */
  usage: ChatCompletionUsage;
}
