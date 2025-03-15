import { ApiEndpoint } from '../../../registry/endpoint';
import {
  ChatCompletionRequest,
  ChatCompletionResponse
} from '../../../../types';
import { ChatValidator } from '../../../../utils/validators/chat-validator';

/**
 * API endpoint for standard (non-streaming) chat completions.
 *
 * This endpoint allows you to create chat completions using various models.
 * It handles validation, request formatting, and response parsing.
 *
 * @example
 * ```typescript
 * const response = await venice.chat.createCompletion({
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
   * Gets the base endpoint path for chat requests.
   *
   * @returns The endpoint path ('/chat')
   */
  getEndpointPath(): string {
    return '/chat';
  }

  /**
   * Creates a chat completion using the specified model.
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
   * @returns A promise resolving to the chat completion response
   *
   * @throws {VeniceValidationError} If the request parameters are invalid
   * @throws {VeniceApiError} If the API returns an error
   * @throws {VeniceNetworkError} If there's a network issue
   * @throws {VeniceTimeoutError} If the request times out
   */
  public async createCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // Validate request parameters
    this.validator.validateChatCompletionRequest(request);

    // Emit a request event
    this.emit('request', { type: 'chat.completion', data: request });

    // Make the API request
    const response = await this.http.post<ChatCompletionResponse>(
      this.getPath('/completions'),
      request
    );

    // Emit a response event
    this.emit('response', { type: 'chat.completion', data: response.data });

    return response.data;
  }
}

export default ChatEndpoint;