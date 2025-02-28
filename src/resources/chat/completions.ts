/**
 * Chat Completions Resource
 * 
 * This module provides methods for interacting with the Chat Completions API.
 * It allows you to generate text responses in a chat-like format.
 * 
 * @example
 * ```typescript
 * import { VeniceAI } from 'venice-ai-sdk-apl';
 * 
 * const venice = new VeniceAI({
 *   apiKey: 'your-api-key',
 * });
 * 
 * // Generate a chat completion
 * const response = await venice.chat.completions.create({
 *   model: 'llama-3.3-70b',
 *   messages: [
 *     { role: 'system', content: 'You are a helpful assistant' },
 *     { role: 'user', content: 'Tell me about AI' }
 *   ],
 *   venice_parameters: {
 *     enable_web_search: 'on',
 *     include_venice_system_prompt: true
 *   }
 * });
 * 
 * console.log(response.choices[0].message.content);
 * ```
 */

import { BaseResource } from '../base-resource';
import { 
  CreateChatCompletionParams, 
  ChatCompletionResponse,
  ChatCompletionChunk
} from '../../types/chat';
import { ValidationError } from '../../errors/validation-error';
import { Logger } from '../../utils/logger';
import axios from 'axios';

/**
 * Chat Completions Resource
 */
export class ChatCompletionsResource extends BaseResource {
  /**
   * Creates a chat completion
   * 
   * @param params - Parameters for creating a chat completion
   * @returns Promise that resolves with the chat completion response
   * 
   * @example
   * ```typescript
   * const response = await venice.chat.completions.create({
   *   model: 'llama-3.3-70b',
   *   messages: [
   *     { role: 'system', content: 'You are a helpful assistant' },
   *     { role: 'user', content: 'Tell me about AI' }
   *   ]
   * });
   * ```
   */
  public async create(params: CreateChatCompletionParams): Promise<ChatCompletionResponse> {
    // Validate required parameters
    if (!params.model) {
      throw new ValidationError({
        message: 'Model is required',
        field: 'model',
      });
    }

    if (!params.messages || !Array.isArray(params.messages) || params.messages.length === 0) {
      throw new ValidationError({
        message: 'Messages are required and must be a non-empty array',
        field: 'messages',
      });
    }

    // Handle model feature suffix
    const modelParts = params.model.split(':');
    const baseModel = modelParts[0];
    const featureSuffix = modelParts.length > 1 ? modelParts.slice(1).join(':') : null;

    // If there's a feature suffix, parse it into venice_parameters
    if (featureSuffix) {
      params.venice_parameters = params.venice_parameters || {};
      
      // Parse feature suffix (format: param1=value1&param2=value2)
      const featurePairs = featureSuffix.split('&');
      
      for (const pair of featurePairs) {
        const [key, value] = pair.split('=');
        
        if (key && value) {
          // Convert string values to appropriate types
          let parsedValue: any = value;
          
          if (value === 'true') parsedValue = true;
          else if (value === 'false') parsedValue = false;
          else if (value === 'auto') parsedValue = 'auto';
          else if (!isNaN(Number(value))) parsedValue = Number(value);
          
          // @ts-ignore - Dynamic property assignment
          params.venice_parameters[key] = parsedValue;
        }
      }
      
      // Use the base model without the feature suffix
      params.model = baseModel;
    }

    // Handle streaming
    if (params.stream) {
      // Create a copy of params with stream explicitly set to true
      const streamParams = {
        ...params,
        stream: true as const
      };
      return this.createStream(streamParams) as unknown as ChatCompletionResponse;
    }

    return this.post<ChatCompletionResponse>('/chat/completions', params);
  }

  /**
   * Creates a streaming chat completion
   * 
   * @param params - Parameters for creating a chat completion
   * @returns Promise that resolves with a readable stream of chat completion chunks
   * 
   * @example
   * ```typescript
   * const stream = await venice.chat.completions.createStream({
   *   model: 'llama-3.3-70b',
   *   messages: [
   *     { role: 'system', content: 'You are a helpful assistant' },
   *     { role: 'user', content: 'Tell me about AI' }
   *   ],
   *   stream: true
   * });
   * 
   * for await (const chunk of stream) {
   *   process.stdout.write(chunk.choices[0]?.delta?.content || '');
   * }
   * ```
   */
  public async createStream(params: CreateChatCompletionParams & { stream: true }): Promise<AsyncIterable<ChatCompletionChunk>> {
    // Ensure stream is set to true
    params.stream = true;

    Logger.debug('Creating streaming chat completion', params);

    // Get the base URL and API key from the HTTP client
    const baseURL = this.http.getBaseURL();
    const apiKey = this.http.getApiKey();

    // Create a direct axios request to handle streaming properly
    const response = await axios({
      method: 'post',
      url: `${baseURL}/chat/completions`,
      data: params,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'text/event-stream',
        'User-Agent': 'Venice-AI-SDK-APL/0.1.0',
      },
      responseType: 'stream',
    });

    Logger.debug('Received streaming response', { 
      status: response.status,
      headers: response.headers
    });

    // Return an async iterable that yields chunks
    return {
      [Symbol.asyncIterator]: async function* () {
        try {
          const stream = response.data;
          let buffer = '';

          // Set up event handlers for the stream
          for await (const chunk of stream) {
            // Convert chunk to string if it's a Buffer
            const chunkStr = Buffer.isBuffer(chunk) ? chunk.toString() : chunk;
            
            Logger.debug('Received stream chunk', { 
              type: typeof chunkStr,
              length: chunkStr.length
            });
            
            buffer += chunkStr;
            
            // Split by lines and process each line
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
            
            for (const line of lines) {
              if (line.trim() === '') continue;
              
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  Logger.debug('Received [DONE] message');
                  return;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  Logger.debug('Parsed JSON chunk', { 
                    id: parsed.id,
                    choices: parsed.choices?.length
                  });
                  
                  yield parsed;
                } catch (e) {
                  Logger.warn('Error parsing JSON data', e);
                  // Ignore parsing errors for non-JSON data
                }
              }
            }
          }
          
          // Process any remaining data in the buffer
          if (buffer.trim() !== '') {
            if (buffer.startsWith('data: ')) {
              const data = buffer.slice(6);
              
              if (data !== '[DONE]') {
                try {
                  const parsed = JSON.parse(data);
                  Logger.debug('Parsed JSON from remaining buffer', { 
                    id: parsed.id,
                    choices: parsed.choices?.length
                  });
                  
                  yield parsed;
                } catch (e) {
                  Logger.warn('Error parsing JSON data from remaining buffer', e);
                  // Ignore parsing errors for non-JSON data
                }
              }
            }
          }
          
          Logger.debug('Stream completed');
        } catch (error) {
          Logger.error('Error in streaming response', error);
          throw error;
        }
      }
    };
  }
}