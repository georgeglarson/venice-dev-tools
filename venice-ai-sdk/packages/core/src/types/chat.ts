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
 * Venice-specific parameters for chat completion
 */
export interface VeniceParameters {
  /**
   * The character slug to use for the chat completion
   */
  character_slug?: string;

  /**
   * Control Venice web search integration behavior
   */
  enable_web_search?: 'on' | 'off' | 'auto';

  /**
   * Include Venice's default system prompt
   */
  include_venice_system_prompt?: boolean;
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
   * Number between -2.0 and 2.0. Positive values penalize new tokens based on their
   * existing frequency in the text so far.
   */
  frequency_penalty?: number;
  
  /**
   * Number between -2.0 and 2.0. Positive values penalize new tokens based on whether
   * they appear in the text so far.
   */
  presence_penalty?: number;
  
  /**
   * Whether to include log probabilities in the response.
   * Not supported by all models.
   */
  logprobs?: boolean;
  
  /**
   * The number of highest probability tokens to return for each token position.
   * Requires logprobs to be true.
   */
  top_logprobs?: number;
  
  /**
   * An upper bound for the number of tokens that can be generated for a completion,
   * including visible output tokens and reasoning tokens.
   * Replaces the deprecated max_tokens parameter.
   */
  max_completion_tokens?: number;
  
  /**
   * Maximum temperature value for dynamic temperature scaling.
   * Must be between 0 and 2.
   */
  max_temp?: number;
  
  /**
   * Up to 4 sequences where the API will stop generating further tokens.
   */
  stop?: string | string[];
  
  /**
   * Whether to stream the response
   */
  stream?: boolean;
  
  /**
   * Venice-specific parameters
   */
  venice_parameters?: VeniceParameters;
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
