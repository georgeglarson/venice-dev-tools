/**
 * Chat API types
 * 
 * This file contains type definitions for the Chat API.
 */

import { VeniceParameters } from './common';

/**
 * Role of a message in a chat conversation
 */
export type ChatRole = 'system' | 'user' | 'assistant' | 'function' | 'tool';

/**
 * A message in a chat conversation
 */
export interface ChatMessage {
  /**
   * Role of the message author
   */
  role: ChatRole;

  /**
   * Content of the message
   * Can be a string, null, or an array of content parts
   */
  content: string | null | ChatMessageContent[];

  /**
   * Name of the author (optional)
   */
  name?: string;

  /**
   * Function call (optional)
   */
  function_call?: {
    name: string;
    arguments: string;
  };

  /**
   * Tool calls (optional)
   */
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

/**
 * Content part of a chat message
 */
export type ChatMessageContent =
  | ChatMessageTextContent
  | ChatMessageImageContent
  | ChatMessageFileContent;

/**
 * Text content part of a chat message
 */
export interface ChatMessageTextContent {
  /**
   * Type of content
   */
  type: 'text';

  /**
   * Text content
   */
  text: string;
}

/**
 * Image content part of a chat message
 */
export interface ChatMessageImageContent {
  /**
   * Type of content
   */
  type: 'image_url';

  /**
   * Image URL information
   */
  image_url: {
    /**
     * URL of the image (can be a data URL or a remote URL)
     */
    url: string;
  };
}

/**
 * File content part of a chat message
 */
export interface ChatMessageFileContent {
  /**
   * Type of content
   */
  type: 'file';

  /**
   * File information
   */
  file: {
    /**
     * File data (base64 encoded)
     */
    data?: string;

    /**
     * File path (for local files)
     */
    path?: string;

    /**
     * File MIME type
     */
    mime_type?: string;

    /**
     * File name
     */
    name?: string;
  };
}

/**
 * Function definition for function calling
 */
export interface FunctionDefinition {
  /**
   * Name of the function
   */
  name: string;

  /**
   * Description of the function
   */
  description?: string;

  /**
   * Parameters schema in JSON Schema format
   */
  parameters: Record<string, any>;
}

/**
 * Tool definition for tool calling
 */
export interface ToolDefinition {
  /**
   * Type of the tool
   */
  type: 'function';

  /**
   * Function definition
   */
  function: FunctionDefinition;
}

/**
 * Parameters for creating a chat completion
 */
export interface CreateChatCompletionParams {
  /**
   * ID of the model to use
   */
  model: string;

  /**
   * Messages to generate chat completions for
   */
  messages: ChatMessage[];

  /**
   * Functions that the model may call
   * @deprecated Use tools instead
   */
  functions?: FunctionDefinition[];

  /**
   * Controls how the model calls functions
   * @deprecated Use tool_choice instead
   */
  function_call?: 'auto' | 'none' | { name: string };

  /**
   * Tools that the model may call
   */
  tools?: ToolDefinition[];

  /**
   * Controls how the model calls tools
   */
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };

  /**
   * Maximum number of tokens to generate
   */
  max_tokens?: number;

  /**
   * Maximum number of tokens to generate in the completion
   */
  max_completion_tokens?: number;

  /**
   * Sampling temperature (0-2)
   */
  temperature?: number;

  /**
   * Nucleus sampling parameter (0-1)
   */
  top_p?: number;

  /**
   * Number of chat completion choices to generate
   */
  n?: number;

  /**
   * Whether to stream the response
   */
  stream?: boolean;

  /**
   * Stop sequences that trigger early stopping
   */
  stop?: string | string[];

  /**
   * Presence penalty (-2 to 2)
   */
  presence_penalty?: number;

  /**
   * Frequency penalty (-2 to 2)
   */
  frequency_penalty?: number;

  /**
   * Logit bias
   */
  logit_bias?: Record<string, number>;

  /**
   * User identifier
   */
  user?: string;

  /**
   * Venice-specific parameters
   */
  venice_parameters?: VeniceParameters;
}

/**
 * Chat completion choice
 */
export interface ChatCompletionChoice {
  /**
   * Index of the choice
   */
  index: number;

  /**
   * Generated message
   */
  message: ChatMessage;

  /**
   * Reason the generation stopped
   */
  finish_reason: 'stop' | 'length' | 'function_call' | 'tool_calls' | 'content_filter';
}

/**
 * Usage statistics for a chat completion
 */
export interface ChatCompletionUsage {
  /**
   * Number of tokens in the prompt
   */
  prompt_tokens: number;

  /**
   * Number of tokens in the completion
   */
  completion_tokens: number;

  /**
   * Total number of tokens used
   */
  total_tokens: number;
}

/**
 * Response from creating a chat completion
 */
export interface ChatCompletionResponse {
  /**
   * Object type
   */
  object: 'chat.completion';

  /**
   * Unique identifier for the completion
   */
  id: string;

  /**
   * Unix timestamp of when the completion was created
   */
  created: number;

  /**
   * ID of the model used
   */
  model: string;

  /**
   * List of completion choices
   */
  choices: ChatCompletionChoice[];

  /**
   * Usage statistics
   */
  usage: ChatCompletionUsage;

  /**
   * System fingerprint
   */
  system_fingerprint?: string;

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
 * Delta in a streaming chat completion
 */
export interface ChatCompletionChunkDelta {
  /**
   * Role of the message author
   */
  role?: ChatRole;

  /**
   * Content of the message
   */
  content?: string;

  /**
   * Function call
   */
  function_call?: {
    name?: string;
    arguments?: string;
  };

  /**
   * Tool calls
   */
  tool_calls?: Array<{
    index?: number;
    id?: string;
    type?: 'function';
    function?: {
      name?: string;
      arguments?: string;
    };
  }>;
}

/**
 * Choice in a streaming chat completion
 */
export interface ChatCompletionChunkChoice {
  /**
   * Index of the choice
   */
  index: number;

  /**
   * Delta of the message
   */
  delta: ChatCompletionChunkDelta;

  /**
   * Reason the generation stopped
   */
  finish_reason: 'stop' | 'length' | 'function_call' | 'tool_calls' | 'content_filter' | null;
}

/**
 * Chunk in a streaming chat completion
 */
export interface ChatCompletionChunk {
  /**
   * Object type
   */
  object: 'chat.completion.chunk';

  /**
   * Unique identifier for the completion
   */
  id: string;

  /**
   * Unix timestamp of when the completion was created
   */
  created: number;

  /**
   * ID of the model used
   */
  model: string;

  /**
   * List of completion choices
   */
  choices: ChatCompletionChunkChoice[];

  /**
   * System fingerprint
   */
  system_fingerprint?: string;
}