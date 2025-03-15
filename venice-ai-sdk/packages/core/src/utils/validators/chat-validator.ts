import { ChatCompletionRequest, ChatCompletionMessage } from '../../types/chat';
import { ContentItem } from '../../types/multimodal';
import { BaseValidator } from './base-validator';
import { VeniceValidationError } from '../../errors';

/**
 * Validator for chat-related requests.
 */
export class ChatValidator extends BaseValidator {
  /**
   * Validate a chat completion request.
   * @param request - The request to validate.
   * @throws VeniceValidationError if the request is invalid.
   */
  public validateChatCompletionRequest(request: ChatCompletionRequest): void {
    this.validateRequired(request, 'request');
    this.validateString(request.model, 'model');
    this.validateNonEmptyArray(request.messages, 'messages');
    
    // Validate each message
    request.messages.forEach((message, index) => {
      this.validateMessage(message, index);
    });
    
    // Validate optional parameters
    if (request.temperature !== undefined) {
      this.validateNumber(request.temperature, 'temperature', 0, 2);
    }
    
    if (request.max_tokens !== undefined) {
      this.validateNumber(request.max_tokens, 'max_tokens', 1);
    }

    if (request.top_p !== undefined) {
      this.validateNumber(request.top_p, 'top_p', 0, 1);
    }

    if (request.stream !== undefined) {
      this.validateBoolean(request.stream, 'stream');
    }
  }

  /**
   * Validate a chat message.
   * @param message - The message to validate.
   * @param index - The index of the message in the messages array.
   * @throws VeniceValidationError if the message is invalid.
   */
  private validateMessage(message: ChatCompletionMessage, index: number): void {
    this.validateEnum(message.role, `messages[${index}].role`, ['system', 'user', 'assistant']);
    
    if (typeof message.content === 'string') {
      this.validateString(message.content, `messages[${index}].content`);
    } else if (Array.isArray(message.content)) {
      this.validateNonEmptyArray(message.content, `messages[${index}].content`);
      
      // Validate each content item
      message.content.forEach((item: ContentItem, itemIndex: number) => {
        this.validateContentItem(item, index, itemIndex);
      });
    } else {
      throw new VeniceValidationError(`messages[${index}].content must be a string or an array`);
    }
  }

  /**
   * Validate a content item in a chat message.
   * @param item - The content item to validate.
   * @param messageIndex - The index of the parent message in the messages array.
   * @param itemIndex - The index of the content item in the content array.
   * @throws VeniceValidationError if the content item is invalid.
   */
  private validateContentItem(item: ContentItem, messageIndex: number, itemIndex: number): void {
    this.validateRequired(item.type, `messages[${messageIndex}].content[${itemIndex}].type`);
    this.validateEnum(item.type, `messages[${messageIndex}].content[${itemIndex}].type`, ['text', 'image_url']);
    
    if (item.type === 'text') {
      this.validateString(item.text, `messages[${messageIndex}].content[${itemIndex}].text`);
    } else if (item.type === 'image_url') {
      this.validateRequired(item.image_url, `messages[${messageIndex}].content[${itemIndex}].image_url`);
      this.validateString(item.image_url.url, `messages[${messageIndex}].content[${itemIndex}].image_url.url`);
    }
  }
}

export default ChatValidator;