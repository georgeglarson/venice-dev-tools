/**
 * Types for Venice.ai Responses API (Alpha)
 */

/**
 * Reasoning effort levels
 */
export type ReasoningEffort = 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max';

/**
 * Reasoning summary format
 */
export type ReasoningSummary = 'auto' | 'concise' | 'detailed';

/**
 * Input text content
 */
export interface InputTextContent {
  type: 'input_text';
  text: string;
}

/**
 * Input image content
 */
export interface InputImageContent {
  type: 'input_image';
  image_url: {
    url: string;
    detail?: 'auto' | 'low' | 'high';
  };
}

/**
 * Output text content (for history)
 */
export interface OutputTextContent {
  type: 'output_text';
  text: string;
  annotations?: unknown[];
}

/**
 * Input message
 */
export interface ResponseInputMessage {
  type: 'message';
  role: 'user' | 'assistant' | 'system' | 'developer';
  content: string | (InputTextContent | InputImageContent | OutputTextContent)[];
  id?: string;
  status?: 'completed' | 'in_progress';
}

/**
 * Reasoning input item
 */
export interface ResponseInputReasoning {
  type: 'reasoning';
  id?: string | null;
  summary?: string[] | null;
  content?: string | unknown[] | null;
  encrypted_content?: string | null;
  status?: 'completed' | 'in_progress' | null;
}

/**
 * Function call input item
 */
export interface ResponseInputFunctionCall {
  type: 'function_call';
  id?: string;
  call_id: string;
  name: string;
  arguments: string;
  status?: 'completed' | 'in_progress';
}

/**
 * Function call output input item
 */
export interface ResponseInputFunctionCallOutput {
  type: 'function_call_output';
  call_id: string;
  output: string | unknown[] | Record<string, unknown> | number | boolean | null;
}

/**
 * Item reference input
 */
export interface ResponseInputItemReference {
  type: 'item_reference';
  id: string;
}

/**
 * All possible input items
 */
export type ResponseInputItem =
  | ResponseInputMessage
  | ResponseInputReasoning
  | ResponseInputFunctionCall
  | ResponseInputFunctionCallOutput
  | ResponseInputItemReference;

/**
 * Function tool definition
 */
export interface ResponseFunctionTool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
    strict?: boolean;
  };
}

/**
 * Web search tool definition
 */
export interface ResponseWebSearchTool {
  type: 'web_search';
  search_context_size?: 'low' | 'medium' | 'high';
  user_location?: {
    type: 'approximate';
    city?: string;
    region?: string;
    country?: string;
    timezone?: string;
  };
}

/**
 * X/Twitter search tool definition
 */
export interface ResponseXSearchTool {
  type: 'x_search';
  allowed_x_handles?: string[];
  excluded_x_handles?: string[];
  from_date?: string;
  to_date?: string;
  enable_image_understanding?: boolean;
  enable_video_understanding?: boolean;
}

/**
 * Code interpreter tool definition
 */
export interface ResponseCodeInterpreterTool {
  type: 'code_interpreter';
  container?: { image?: string };
}

/**
 * File search tool definition
 */
export interface ResponseFileSearchTool {
  type: 'file_search';
  vector_store_ids?: string[];
  max_num_results?: number;
  ranking_options?: { ranker?: string; score_threshold?: number };
}

/**
 * Computer use tool definition (preview)
 */
export interface ResponseComputerUseTool {
  type: 'computer_use_preview';
  display_width?: number;
  display_height?: number;
  environment?: string;
}

/**
 * Tool definitions for Responses API
 */
export type ResponseTool =
  | ResponseFunctionTool
  | ResponseWebSearchTool
  | ResponseXSearchTool
  | ResponseCodeInterpreterTool
  | ResponseFileSearchTool
  | ResponseComputerUseTool
  | { type: string; [key: string]: unknown };

/**
 * Tool choice for Responses API
 */
export type ResponseToolChoice = 'auto' | 'none' | 'required' | {
  type: 'function';
  function: { name: string };
};

/**
 * Venice-specific parameters
 */
export interface ResponseVeniceParameters {
  character_slug?: string;
  enable_e2ee?: boolean;
  [key: string]: unknown;
}

/**
 * Request for the Responses API
 */
export interface CreateResponseRequest {
  /** The model to use */
  model: string;
  /** Input: a string or array of input items */
  input: string | ResponseInputItem[];
  /** Additional response fields to include */
  include?: string[];
  /** Maximum output tokens */
  max_output_tokens?: number;
  /** Sampling temperature (0-2) */
  temperature?: number;
  /** Nucleus sampling parameter (0-1) */
  top_p?: number;
  /** Reasoning configuration */
  reasoning?: {
    effort?: ReasoningEffort;
    summary?: ReasoningSummary;
  } | null;
  /** Tools the model may call */
  tools?: ResponseTool[];
  /** Controls which tool is called */
  tool_choice?: ResponseToolChoice;
  /** Enable web search */
  web_search?: boolean;
  /** Stream partial progress */
  stream?: boolean;
  /** Venice-specific parameters */
  venice_parameters?: ResponseVeniceParameters;
}

/**
 * URL citation annotation
 */
export interface URLCitationAnnotation {
  type: 'url_citation';
  url: string;
  title?: string;
  start_index: number;
  end_index: number;
}

/**
 * Response output text
 */
export interface ResponseOutputText {
  type: 'output_text';
  text: string;
  annotations?: URLCitationAnnotation[];
}

/**
 * Reasoning output item
 */
export interface ResponseOutputReasoning {
  type: 'reasoning';
  id: string;
  summary?: string[];
  encrypted_content?: string;
}

/**
 * Message output item
 */
export interface ResponseOutputMessage {
  type: 'message';
  id: string;
  status: 'completed' | 'in_progress' | 'failed';
  role: 'assistant';
  content: ResponseOutputText[];
}

/**
 * Function call output item
 */
export interface ResponseOutputFunctionCall {
  type: 'function_call';
  id: string;
  call_id: string;
  name: string;
  arguments: string;
  status: 'completed' | 'in_progress';
}

/**
 * Web search call output item
 */
export interface ResponseOutputWebSearchCall {
  type: 'web_search_call';
  id: string;
  status: 'completed';
}

/**
 * All possible output items
 */
export type ResponseOutputItem =
  | ResponseOutputReasoning
  | ResponseOutputMessage
  | ResponseOutputFunctionCall
  | ResponseOutputWebSearchCall;

/**
 * Usage statistics
 */
export interface ResponseUsage {
  input_tokens: number;
  input_tokens_details?: {
    cached_tokens?: number;
  };
  output_tokens: number;
  output_tokens_details?: {
    reasoning_tokens?: number;
  };
  total_tokens: number;
}

/**
 * Response from the Responses API
 */
export interface CreateResponseResponse {
  /** Unique response ID */
  id: string;
  /** Object type */
  object: 'response';
  /** Creation timestamp */
  created_at: number;
  /** Model used */
  model: string;
  /** Response status */
  status: 'completed' | 'failed' | 'in_progress' | 'cancelled';
  /** Output items */
  output: ResponseOutputItem[];
  /** Token usage */
  usage?: ResponseUsage;
  /** Error info if failed */
  error?: {
    code: string;
    message: string;
  };
}
