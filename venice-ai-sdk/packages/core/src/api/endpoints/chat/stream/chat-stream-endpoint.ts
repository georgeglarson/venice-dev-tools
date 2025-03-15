import { ApiEndpoint } from '../../../registry/endpoint';
import { ChatCompletionRequest } from '../../../../types';
import { ChatValidator } from '../../../../utils/validators/chat-validator';

/**
 * API endpoint for streaming chat completions.
 *
 * This endpoint allows you to create streaming chat completions using various models.
 * It returns an async generator that yields completion chunks as they become available.
 *
 * @example
 * ```typescript
 * const stream = venice.chatStream.streamCompletion({
 *   model: 'llama-3.3-70b',
 *   messages: [
 *     { role: 'system', content: 'You are a helpful assistant.' },
 *     { role: 'user', content: 'Write a short poem about AI.' }
 *   ]
 * });
 *
 * // Process the stream chunks as they arrive
 * for await (const chunk of stream) {
 *   const content = chunk.choices[0]?.delta?.content || '';
 *   process.stdout.write(content);
 * }
 * ```
 */
export class ChatStreamEndpoint extends ApiEndpoint {
  /**
   * The chat validator for validating request parameters.
   */
  private validator: ChatValidator;

  /**
   * Creates a new ChatStreamEndpoint instance.
   *
   * @param client - The Venice client instance
   */
  constructor(client: any) {
    super(client);
    this.validator = new ChatValidator();
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
   * Streams a chat completion using the specified model.
   *
   * This method returns an async generator that yields completion chunks
   * as they become available from the API. The request will automatically
   * have `stream: true` set regardless of what's provided in the request.
   *
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
   * @returns An async generator that yields completion chunks
   *
   * @throws {VeniceValidationError} If the request parameters are invalid
   * @throws {VeniceApiError} If the API returns an error
   * @throws {VeniceNetworkError} If there's a network issue
   * @throws {VeniceTimeoutError} If the request times out
   * @throws {VeniceStreamError} If there's an error processing the stream
   */
  public async *streamCompletion(request: ChatCompletionRequest): AsyncGenerator<any, void, unknown> {
    // Set stream to true
    const streamingRequest = { ...request, stream: true };

    // Validate request parameters
    this.validator.validateChatCompletionRequest(streamingRequest);

    // Emit a request event
    this.emit('request', { type: 'chat.completion.stream', data: streamingRequest });

    // Make the API request
    const response = await this.streamingHttp.stream(
      this.getPath('/completions'),
      streamingRequest
    );

    try {
      // Get the reader from the response body
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Stream response body is null');
      }
      
      // Read chunks from the stream
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk and add it to our buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines from the buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last (potentially incomplete) line in the buffer
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.substring(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              yield parsed;
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
      
      // Process any remaining data in the buffer
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.substring(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              yield parsed;
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } finally {
      // Emit a response event when the stream ends
      this.emit('response', { type: 'chat.completion.stream', data: { status: 'completed' } });
    }
  }
}

export default ChatStreamEndpoint;