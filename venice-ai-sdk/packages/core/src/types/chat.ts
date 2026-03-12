/**
 * Types for the Chat API endpoints
 */
import { ContentItem } from './multimodal';

/**
 * The role of a message in a chat completion
 */
export type ChatCompletionRole = 'system' | 'user' | 'assistant' | 'developer' | 'tool';

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
  /** The character slug to use for the chat completion */
  character_slug?: string;
  /** Strip thinking/reasoning content from response */
  strip_thinking_response?: boolean;
  /** Disable thinking/reasoning entirely */
  disable_thinking?: boolean;
  /** Control Venice web search integration behavior */
  enable_web_search?: 'on' | 'off' | 'auto';
  /** Enable web page scraping for context */
  enable_web_scraping?: boolean;
  /** Enable web citation annotations in response */
  enable_web_citations?: boolean;
  /** Include search results in the stream */
  include_search_results_in_stream?: boolean;
  /** Return search results as document objects */
  return_search_results_as_documents?: boolean;
  /** Include Venice's default system prompt */
  include_venice_system_prompt?: boolean;
}

/**
 * Reasoning configuration for models that support it
 */
export interface ReasoningConfig {
  /** Reasoning effort level */
  effort: 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max';
  /** Summary verbosity */
  summary?: 'auto' | 'concise' | 'detailed';
}

/**
 * JSON Schema response format
 */
export interface ResponseFormatJsonSchema {
  type: 'json_schema';
  json_schema: {
    name: string;
    description?: string;
    schema: Record<string, unknown>;
    strict?: boolean;
  };
}

/**
 * JSON object response format
 */
export interface ResponseFormatJsonObject {
  type: 'json_object';
}

/**
 * Text response format
 */
export interface ResponseFormatText {
  type: 'text';
}

/** Supported response format types */
export type ResponseFormat = ResponseFormatJsonSchema | ResponseFormatJsonObject | ResponseFormatText;

/**
 * Tool/function definition for chat completions
 */
export interface ChatCompletionTool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
    strict?: boolean;
  };
}

/**
 * Stream options for chat completions
 */
export interface StreamOptions {
  /** Include usage statistics in stream */
  include_usage?: boolean;
}

/**
 * Request parameters for chat completion
 */
export interface ChatCompletionRequest {
  /** The model to use for chat completion */
  model: string;
  /** A list of messages to generate a completion for */
  messages: ChatCompletionMessage[];
  /** The maximum number of tokens to generate (deprecated, use max_completion_tokens) */
  max_tokens?: number;
  /** The temperature for sampling (0-2) */
  temperature?: number;
  /** The top-p sampling parameter (0-1) */
  top_p?: number;
  /** Top-k token filtering */
  top_k?: number;
  /** Frequency penalty (-2.0 to 2.0) */
  frequency_penalty?: number;
  /** Presence penalty (-2.0 to 2.0) */
  presence_penalty?: number;
  /** Repetition penalty (≥0, default 1.0) */
  repetition_penalty?: number;
  /** Whether to include log probabilities */
  logprobs?: boolean;
  /** Highest probability tokens per position (requires logprobs=true) */
  top_logprobs?: number;
  /** Upper bound for generated tokens including reasoning tokens */
  max_completion_tokens?: number;
  /** Dynamic temperature minimum (0-2) */
  min_temp?: number;
  /** Dynamic temperature maximum (0-2) */
  max_temp?: number;
  /** Minimum probability threshold (0-1) */
  min_p?: number;
  /** Up to 4 stop sequences */
  stop?: string | string[];
  /** Whether to stream the response */
  stream?: boolean;
  /** Stream configuration options */
  stream_options?: StreamOptions;
  /** Number of completion choices to generate */
  n?: number;
  /** Seed for deterministic outputs */
  seed?: number;
  /** Reasoning configuration for thinking models */
  reasoning?: ReasoningConfig;
  /** OpenAI-compatible reasoning effort shorthand */
  reasoning_effort?: 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max';
  /** Response format (structured output, JSON mode, or text) */
  response_format?: ResponseFormat;
  /** Available tools/functions */
  tools?: ChatCompletionTool[];
  /** Tool selection control */
  tool_choice?: 'auto' | 'none' | 'required' | { type: 'function'; function: { name: string } };
  /** Allow parallel tool calls */
  parallel_tool_calls?: boolean;
  /** Prompt cache key for optimization */
  prompt_cache_key?: string;
  /** Prompt cache retention policy */
  prompt_cache_retention?: 'default' | 'extended' | '24h';
  /** Request tracking metadata */
  metadata?: Record<string, string>;
  /** Venice-specific parameters */
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
  /** The number of prompt tokens used */
  prompt_tokens: number;
  /** The number of completion tokens used */
  completion_tokens: number;
  /** The total number of tokens used */
  total_tokens: number;
  /** Input tokens (alias for prompt_tokens) */
  input_tokens?: number;
  /** Output tokens (alias for completion_tokens) */
  output_tokens?: number;
}

/**
 * A single chunk from a streaming chat completion response
 */
export interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }[];
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
