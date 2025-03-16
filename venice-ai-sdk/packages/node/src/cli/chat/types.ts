// Chat module type definitions
import type { ChatCompletionRequest as BaseChatCompletionRequest, ChatCompletionResponse as BaseChatCompletionResponse } from '@venice-dev-tools/core';
import type { ContentItem } from '@venice-dev-tools/core/src/types/multimodal';

/**
 * Chat message interface
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ContentItem[];
}

/**
 * Extended chat completion request with Venice-specific parameters
 */
export interface ChatCompletionRequest extends BaseChatCompletionRequest {
  venice_parameters?: {
    enable_web_search?: 'auto' | 'on' | 'off';
    character_slug?: string;
    include_venice_system_prompt?: boolean;
  };
}

/**
 * Extended chat completion response with Venice-specific parameters
 */
export interface ChatCompletionResponse extends BaseChatCompletionResponse {
  venice_parameters?: {
    web_search_citations?: Array<{
      title: string;
      url: string;
    }>;
  };
}

/**
 * Options for chat commands
 */
export interface ChatCommandOptions {
  model?: string;
  prompt?: string;
  system?: string;
  temperature?: string;
  maxTokens?: string;
  stream?: boolean;
  webSearch?: boolean;
  character?: string;
  attach?: string;
  pdfMode?: string;
  raw?: boolean;
  json?: boolean;
}

/**
 * JSON output format for chat responses
 */
export interface ChatJsonOutput {
  prompt: string;
  response: string;
  model: string;
  stream?: boolean;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  web_search_citations?: Array<{
    title: string;
    url: string;
  }>;
  files?: string[];
}