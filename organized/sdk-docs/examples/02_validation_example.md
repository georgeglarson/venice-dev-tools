# Input Validation Example for Venice AI SDK

This example shows how to implement input validation for the Venice AI SDK.

## Validation Utility Example

Create file: `venice-ai-sdk/packages/core/src/utils/validation.ts`

```typescript
import { VeniceValidationError } from '../errors';

/**
 * Validates that a value is not null or undefined
 */
export function validateRequired(value: any, fieldName: string): void {
  if (value === null || value === undefined) {
    throw new VeniceValidationError(`${fieldName} is required`);
  }
}

/**
 * Validates that a value is a non-empty string
 */
export function validateString(value: any, fieldName: string): void {
  validateRequired(value, fieldName);
  if (typeof value !== 'string' || value.trim() === '') {
    throw new VeniceValidationError(`${fieldName} must be a non-empty string`);
  }
}

/**
 * Validates that a value is a number within a specified range
 */
export function validateNumber(value: any, fieldName: string, min?: number, max?: number): void {
  validateRequired(value, fieldName);
  if (typeof value !== 'number' || isNaN(value)) {
    throw new VeniceValidationError(`${fieldName} must be a number`);
  }
  
  if (min !== undefined && value < min) {
    throw new VeniceValidationError(`${fieldName} must be at least ${min}`);
  }
  
  if (max !== undefined && value > max) {
    throw new VeniceValidationError(`${fieldName} must be at most ${max}`);
  }
}

/**
 * Validates that a value is an array with at least one item
 */
export function validateNonEmptyArray(value: any, fieldName: string): void {
  validateRequired(value, fieldName);
  if (!Array.isArray(value) || value.length === 0) {
    throw new VeniceValidationError(`${fieldName} must be a non-empty array`);
  }
}

/**
 * Validates that a value is one of the allowed values
 */
export function validateEnum(value: any, fieldName: string, allowedValues: any[]): void {
  validateRequired(value, fieldName);
  if (!allowedValues.includes(value)) {
    throw new VeniceValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`
    );
  }
}
```

## Chat Validation Example

Create file: `venice-ai-sdk/packages/core/src/utils/validators/chat.ts`

```typescript
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
```

## Integration with Chat Endpoint

Update file: `venice-ai-sdk/packages/core/src/api/endpoints/chat/index.ts`

```typescript
import { ApiEndpoint } from '../../registry/endpoint';
import {
  ChatCompletionRequest,
  ChatCompletionResponse
} from '../../../types';
import { validateChatCompletionRequest } from '../../../utils/validators/chat';

export class ChatEndpoint extends ApiEndpoint {
  // ... existing code ...

  public async createCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // Validate request parameters
    validateChatCompletionRequest(request);

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

  // ... rest of the class ...
}
```

## Implementation Steps

1. Create the validation utility file as shown above

2. Create the chat validator file as shown above

3. Update the chat endpoint to use the validator

4. Create similar validators for other endpoints (images, models, etc.)

5. Test the validation by sending invalid requests and ensuring they are rejected with appropriate error messages