import { ChatCompletionRequest } from '../../types';
import { 
  validateRequired, 
  validateString, 
  validateNumber, 
  validateNonEmptyArray,
  validateEnum
} from '../validation';
import { VeniceValidationError } from '../../errors';

/**
 * Validates a chat completion request
 */
export function validateChatCompletionRequest(request: ChatCompletionRequest): void {
  validateRequired(request, 'request');
  validateString(request.model, 'model');
  validateNonEmptyArray(request.messages, 'messages');
  
  // Validate each message
  request.messages.forEach((message, index) => {
    validateEnum(message.role, `messages[${index}].role`, ['system', 'user', 'assistant']);
    
    if (typeof message.content === 'string') {
      validateString(message.content, `messages[${index}].content`);
    } else if (Array.isArray(message.content)) {
      validateNonEmptyArray(message.content, `messages[${index}].content`);
      
      // Validate each content item
      message.content.forEach((item, itemIndex) => {
        validateRequired(item.type, `messages[${index}].content[${itemIndex}].type`);
        validateEnum(item.type, `messages[${index}].content[${itemIndex}].type`, ['text', 'image_url']);
        
        if (item.type === 'text') {
          validateString(item.text, `messages[${index}].content[${itemIndex}].text`);
        } else if (item.type === 'image_url') {
          validateRequired(item.image_url, `messages[${index}].content[${itemIndex}].image_url`);
          validateString(item.image_url.url, `messages[${index}].content[${itemIndex}].image_url.url`);
        }
      });
    } else {
      throw new VeniceValidationError(`messages[${index}].content must be a string or an array`);
    }
  });
  
  // Validate optional parameters
  if (request.temperature !== undefined) {
    validateNumber(request.temperature, 'temperature', 0, 2);
  }
  
  if (request.max_tokens !== undefined) {
    validateNumber(request.max_tokens, 'max_tokens', 1);
  }
}