import { ApiEndpoint } from '../../../registry/endpoint';
import {
  ChatCompletionRequest,
  ChatCompletionResponse
} from '../../../../types';
import { ChatValidator } from '../../../../utils/validators/chat-validator';
import { parseSSEStream } from '../../../../utils/stream-parser';
import { VeniceStreamError } from '../../../../errors';

/**
 * API endpoint for standard (non-streaming) chat completions.
 *
 * This endpoint allows you to create chat completions using various models.
 * It handles validation, request formatting, and response parsing.
 *
 * @example
 * ```typescript
 * const response = await venice.chat.completions.create({
 *   model: 'llama-3.3-70b',
 *   messages: [
 *     { role: 'system', content: 'You are a helpful assistant.' },
 *     { role: 'user', content: 'What is the capital of France?' }
 *   ]
 * });
 *
 * console.log(response.choices[0].message.content);
 * // Output: Paris is the capital of France.
 * ```
 */
export class ChatEndpoint extends ApiEndpoint {
  /**
   * The chat validator for validating request parameters.
   */
  private validator: ChatValidator;

  /**
   * Creates a new ChatEndpoint instance.
   *
   * @param client - The Venice client instance
   */
  constructor(client: any) {
    super(client);
    this.validator = new ChatValidator();
  }

  /**
   * Standard chat completions namespace (OpenAI-compatible).
   */
  public get completions() {
    return {
      /**
       * Creates a chat completion using the specified model.
       *
       * @param request - The chat completion request parameters
       * @returns A promise resolving to the chat completion response, or an async generator if stream=true
       */
      create: (request: ChatCompletionRequest): Promise<ChatCompletionResponse> | AsyncGenerator<any, void, unknown> => {
        if (request.stream) {
          return this._stream(request);
        }
        return this._create(request);
      },

      /**
       * Creates a streaming chat completion using the specified model.
       *
       * @param request - The chat completion request parameters
       * @returns An async generator that yields completion chunks
       */
      createStream: (request: ChatCompletionRequest): AsyncGenerator<any, void, unknown> => {
        return this._stream(request);
      }
    };
  }

  /**
   * Gets the base endpoint path for chat requests.
   *
   * @returns The endpoint path ('/chat')
   */
  getEndpointPath(): string {
    return '/chat';
  }

  /**
   * Internal method for creating chat completions.
   * 
   * @param request - The chat completion request parameters
   * @returns A promise resolving to the chat completion response
   * @private
   */
  private async _create(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    this.validator.validateChatCompletionRequest(request);
    this.emit('request', { type: 'chat.completion', data: request });

    const response = await this.http.post<ChatCompletionResponse>(
      this.getPath('/completions'),
      request
    );

    this.emit('response', { type: 'chat.completion', data: response.data });
    return response.data;
  }

  /**
   * Internal method for streaming chat completions.
   * 
   * @param request - The chat completion request parameters
   * @returns An async generator that yields completion chunks
   * @private
   */
  private async *_stream(request: ChatCompletionRequest): AsyncGenerator<any, void, unknown> {
    const streamingRequest = { ...request, stream: true };
    this.validator.validateChatCompletionRequest(streamingRequest);
    this.emit('request', { type: 'chat.completion.stream', data: streamingRequest });

    const response = await this.streamingHttp.stream(
      this.getPath('/completions'),
      streamingRequest
    );

    try {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new VeniceStreamError('Stream response body is null');
      }

      for await (const chunk of parseSSEStream(reader, this.logger)) {
        yield chunk;
      }
    } finally {
      this.emit('response', { type: 'chat.completion.stream', data: { status: 'completed' } });
    }
  }

  /**
   * Creates a chat completion using the specified model.
   *
   * @deprecated Use `chat.completions.create()` instead for OpenAI compatibility.
   * @param request - The chat completion request parameters
   * @param request.model - The model to use (e.g., 'llama-3.3-70b')
   * @param request.messages - The conversation messages array
   * @param request.temperature - Controls randomness (0-1, default: 0.7)
   * @param request.max_tokens - Maximum tokens to generate (default: varies by model)
   * @param request.top_p - Controls diversity via nucleus sampling (0-1, default: 1)
   * @param request.frequency_penalty - Penalizes repeated tokens (-2 to 2, default: 0)
   * @param request.presence_penalty - Penalizes repeated topics (-2 to 2, default: 0)
   * @param request.stop - Array of sequences where the model should stop generating
   *
   * @returns A promise resolving to the chat completion response
   *
   * @throws {VeniceValidationError} If the request parameters are invalid
   * @throws {VeniceApiError} If the API returns an error
   * @throws {VeniceNetworkError} If there's a network issue
   * @throws {VeniceTimeoutError} If the request times out
   */
  public async createCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    this.logger.warn('[DEPRECATED] chat.createCompletion() is deprecated. Use chat.completions.create() instead.');
    return this._create(request);
  }

  /**
   * Streams chat completion chunks for the given request.
   *
   * @param request - The chat completion request parameters
   * @returns Async generator yielding stream payloads.
   */
  public createCompletionStream(request: ChatCompletionRequest): AsyncGenerator<any, void, unknown> {
    return this._stream(request);
  }
}

export default ChatEndpoint;
