# Chat API

The Chat API provides functionality for handling chat-related operations.

## Methods

### validateChatMessage

```typescript
validateChatMessage(message: any): boolean
```

Validates a chat message object.

#### Parameters

- `message`: The chat message object to validate

#### Returns

A boolean indicating whether the chat message is valid.

### Example

```typescript
import { validateChatMessage } from '@venice-ai/core/utils/validators/chat';

const message = {
  content: 'Hello, Venice AI!',
  sender: 'user'
};

const isValid = validateChatMessage(message);
console.log(isValid); // true or false
```

### sendMessage

```typescript
sendMessage(message: any): Promise<any>
```

Sends a chat message to the Venice AI API.

#### Parameters

- `message`: The chat message object to send

#### Returns

A promise that resolves to the response from the API.

### Example

```typescript
import { sendMessage } from '@venice-ai/core/api/endpoints/chat';

const message = {
  content: 'Hello, Venice AI!',
  sender: 'user'
};

sendMessage(message)
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

### getChatHistory

```typescript
getChatHistory(chatId: string): Promise<any>
```

Retrieves chat history from the Venice AI API by its ID.

#### Parameters

- `chatId`: The ID of the chat to retrieve

#### Returns

A promise that resolves to the chat history data.

### Example

```typescript
import { getChatHistory } from '@venice-ai/core/api/endpoints/chat';

const chatId = '12345';

getChatHistory(chatId)
  .then(history => console.log(history))
  .catch(error => console.error(error));
```

### deleteChat

```typescript
deleteChat(chatId: string): Promise<any>
```

Deletes a chat from the Venice AI API by its ID.

#### Parameters

- `chatId`: The ID of the chat to delete

#### Returns

A promise that resolves to the response from the API.

### Example

```typescript
import { deleteChat } from '@venice-ai/core/api/endpoints/chat';

const chatId = '12345';

deleteChat(chatId)
  .then(response => console.log(response))
  .catch(error => console.error(error));