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
  ChatCompletionChunk,
  ChatMessageContent,
  ChatMessageFileContent
} from '../../types/chat';
import { ValidationError } from '../../errors/validation-error';
import { Logger } from '../../utils/logger';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

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

    // Check if any messages contain file attachments
    const hasFileAttachments = this.hasFileAttachments(params.messages);

    if (hasFileAttachments) {
      // Handle file attachments using multipart form data
      return this.createWithFileAttachments(params);
    }

    // Standard JSON request
    return this.post<ChatCompletionResponse>('/chat/completions', params);
  }

  /**
   * Checks if any messages contain file attachments
   *
   * @param messages - Array of chat messages
   * @returns True if any message contains file attachments
   */
  private hasFileAttachments(messages: any[]): boolean {
    for (const message of messages) {
      if (Array.isArray(message.content)) {
        for (const contentPart of message.content) {
          if (contentPart.type === 'file') {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Creates a chat completion with file attachments
   *
   * @param params - Parameters for creating a chat completion
   * @returns Promise that resolves with the chat completion response
   */
  private async createWithFileAttachments(params: CreateChatCompletionParams): Promise<ChatCompletionResponse> {
    Logger.debug('Creating chat completion with file attachments', params);

    // Create a copy of the params to avoid modifying the original
    const formDataParams = { ...params };
    const formData: Record<string, any> = {};
    
    // Add all non-file parameters as JSON
    formData['request'] = JSON.stringify({
      model: formDataParams.model,
      max_tokens: formDataParams.max_tokens,
      temperature: formDataParams.temperature,
      top_p: formDataParams.top_p,
      n: formDataParams.n,
      stop: formDataParams.stop,
      presence_penalty: formDataParams.presence_penalty,
      frequency_penalty: formDataParams.frequency_penalty,
      logit_bias: formDataParams.logit_bias,
      user: formDataParams.user,
      venice_parameters: formDataParams.venice_parameters,
      functions: formDataParams.functions,
      function_call: formDataParams.function_call,
      tools: formDataParams.tools,
      tool_choice: formDataParams.tool_choice,
    });

    // Process messages and extract file attachments
    const processedMessages = await this.processMessagesWithFiles(formDataParams.messages, formData);
    formData['messages'] = JSON.stringify(processedMessages);

    // Make the request with formData
    return this.post<ChatCompletionResponse>('/chat/completions', null, {
      formData,
    });
  }

  /**
   * Processes messages with file attachments
   *
   * @param messages - Array of chat messages
   * @param formData - Form data object to add files to
   * @returns Processed messages with file references
   */
  private async processMessagesWithFiles(messages: any[], formData: Record<string, any>): Promise<any[]> {
    const processedMessages = [];
    let fileIndex = 0;

    for (const message of messages) {
      const processedMessage = { ...message };
      
      if (Array.isArray(message.content)) {
        const processedContent = [];
        
        for (const contentPart of message.content) {
          if (contentPart.type === 'file') {
            const fileContent = contentPart as ChatMessageFileContent;
            const fileKey = `file_${fileIndex}`;
            fileIndex++;
            
            // Add file to form data
            if (fileContent.file.data) {
              // Handle base64 data
              const buffer = Buffer.from(fileContent.file.data, 'base64');
              formData[fileKey] = buffer;
            } else if (fileContent.file.path) {
              // Handle file path
              const filePath = fileContent.file.path;
              const fileBuffer = fs.readFileSync(filePath);
              formData[fileKey] = fileBuffer;
            } else {
              throw new ValidationError({
                message: 'File must have either data or path',
                field: 'content',
              });
            }
            
            // Add file reference to content
            processedContent.push({
              type: 'file_ref',
              file_ref: {
                file_id: fileKey,
                mime_type: fileContent.file.mime_type || this.getMimeType(fileContent.file.name || ''),
                name: fileContent.file.name || path.basename(fileContent.file.path || ''),
              },
            });
          } else {
            // Keep other content types as is
            processedContent.push(contentPart);
          }
        }
        
        processedMessage.content = processedContent;
      }
      
      processedMessages.push(processedMessage);
    }
    
    return processedMessages;
  }

  /**
   * Gets the MIME type for a file based on its extension
   *
   * @param filename - Name of the file
   * @returns MIME type
   */
  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    
    switch (ext) {
      case '.pdf':
        return 'application/pdf';
      case '.txt':
        return 'text/plain';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.webp':
        return 'image/webp';
      case '.doc':
        return 'application/msword';
      case '.docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case '.xls':
        return 'application/vnd.ms-excel';
      case '.xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case '.ppt':
        return 'application/vnd.ms-powerpoint';
      case '.pptx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      default:
        return 'application/octet-stream';
    }
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

    // Check if any messages contain file attachments
    const hasFileAttachments = this.hasFileAttachments(params.messages);

    if (hasFileAttachments) {
      // Handle file attachments for streaming
      return this.createStreamWithFileAttachments(params);
    }

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

  /**
   * Creates a streaming chat completion with file attachments
   * 
   * @param params - Parameters for creating a streaming chat completion
   * @returns Promise that resolves with a readable stream of chat completion chunks
   */
  private async createStreamWithFileAttachments(params: CreateChatCompletionParams & { stream: true }): Promise<AsyncIterable<ChatCompletionChunk>> {
    Logger.debug('Creating streaming chat completion with file attachments', params);

    // Create a copy of the params to avoid modifying the original
    const formDataParams = { ...params };
    const formData: Record<string, any> = {};
    
    // Add all non-file parameters as JSON
    formData['request'] = JSON.stringify({
      model: formDataParams.model,
      max_tokens: formDataParams.max_tokens,
      temperature: formDataParams.temperature,
      top_p: formDataParams.top_p,
      n: formDataParams.n,
      stop: formDataParams.stop,
      presence_penalty: formDataParams.presence_penalty,
      frequency_penalty: formDataParams.frequency_penalty,
      logit_bias: formDataParams.logit_bias,
      user: formDataParams.user,
      venice_parameters: formDataParams.venice_parameters,
      functions: formDataParams.functions,
      function_call: formDataParams.function_call,
      tools: formDataParams.tools,
      tool_choice: formDataParams.tool_choice,
      stream: true,
    });

    // Process messages and extract file attachments
    const processedMessages = await this.processMessagesWithFiles(formDataParams.messages, formData);
    formData['messages'] = JSON.stringify(processedMessages);

    // Get the base URL and API key from the HTTP client
    const baseURL = this.http.getBaseURL();
    const apiKey = this.http.getApiKey();

    // Create a multipart form data request
    const formDataEntries = Object.entries(formData);
    const boundary = `----WebKitFormBoundary${Math.random().toString(16).substr(2)}`;
    let requestBody = '';

    // Add text fields
    for (const [key, value] of formDataEntries) {
      if (!Buffer.isBuffer(value)) {
        requestBody += `--${boundary}\r\n`;
        requestBody += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
        requestBody += `${value}\r\n`;
      }
    }

    // Add file fields
    for (const [key, value] of formDataEntries) {
      if (Buffer.isBuffer(value)) {
        const fileName = key;
        const contentType = 'application/octet-stream';
        
        requestBody += `--${boundary}\r\n`;
        requestBody += `Content-Disposition: form-data; name="${key}"; filename="${fileName}"\r\n`;
        requestBody += `Content-Type: ${contentType}\r\n\r\n`;
        
        // We'll append the binary data later
      }
    }

    // Create the request body as a Buffer
    const textParts = Buffer.from(requestBody, 'utf8');
    const bufferParts: Buffer[] = [textParts];

    // Add file buffers
    for (const [key, value] of formDataEntries) {
      if (Buffer.isBuffer(value)) {
        bufferParts.push(value);
        bufferParts.push(Buffer.from(`\r\n`, 'utf8'));
      }
    }

    // Add closing boundary
    bufferParts.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));

    // Combine all parts into a single buffer
    const requestBodyBuffer = Buffer.concat(bufferParts);

    // Create a direct axios request to handle streaming properly
    const response = await axios({
      method: 'post',
      url: `${baseURL}/chat/completions`,
      data: requestBodyBuffer,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'text/event-stream',
        'User-Agent': 'Venice-AI-SDK-APL/0.1.0',
        'Content-Length': requestBodyBuffer.length.toString(),
      },
      responseType: 'stream',
    });

    Logger.debug('Received streaming response with file attachments', { 
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