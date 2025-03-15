# Chat API

The Chat API provides functionality for handling chat-related operations.

## Methods

### createCompletion

```typescript
createCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse>
```

Creates a chat completion with the specified options.

#### Parameters

- `options`: The chat completion options
  - `model`: The model to use for the completion
  - `messages`: An array of chat messages
  - `temperature`: Controls randomness (0-2, default: 1)
  - `max_tokens`: Maximum number of tokens to generate
  - `top_p`: Controls diversity via nucleus sampling (0-1, default: 1)
  - `frequency_penalty`: Reduces repetition of token sequences (0-2, default: 0)
  - `presence_penalty`: Reduces repetition of topics (0-2, default: 0)
  - `stop`: Up to 4 sequences where the API will stop generating
  - `stream`: Whether to stream the response (default: false)
  - `venice_parameters`: Additional Venice-specific parameters
    - `character_slug`: Slug of the character to use
    - `web_search`: Enable web search (default: false)

#### Returns

A promise that resolves to the chat completion response.

#### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

const response = await venice.chat.createCompletion({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the capital of France?' }
  ]
});

console.log(response.choices[0].message.content);
```

### streamCompletion

```typescript
streamCompletion(options: ChatCompletionOptions): AsyncGenerator<ChatCompletionChunk>
```

Creates a streaming chat completion with the specified options.

#### Parameters

- `options`: The chat completion options (same as createCompletion)
  - `stream` must be set to `true`

#### Returns

An async generator that yields chat completion chunks.

#### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

const streamGenerator = venice.chat.streamCompletion({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Tell me a story about a robot.' }
  ],
  stream: true
});

for await (const chunk of streamGenerator) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    process.stdout.write(content);
  }
}
```

### Multimodal Chat (Vision)

You can send both text and images to vision-capable models:

```typescript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

const response = await venice.chat.createCompletion({
  model: 'qwen-2.5-vl',
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'What's in this image?'
        },
        {
          type: 'image_url',
          image_url: {
            url: 'https://example.com/image.jpg'
          }
        }
      ]
    }
  ]
});

console.log(response.choices[0].message.content);
```

### PDF Processing

You can process PDF documents using the file processor utility:

```typescript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

// Process a PDF file
const pdfPath = './document.pdf';

// Default mode (image)
const imageContent = await venice.utils.processFile(pdfPath);

// Text mode
const textContent = await venice.utils.processFile(pdfPath, { pdfMode: 'text' });

// Both mode
const bothContent = await venice.utils.processFile(pdfPath, { pdfMode: 'both' });

// Use the processed content in a chat completion
const response = await venice.chat.createCompletion({
  model: 'llama-3.3-70b',
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Please analyze this PDF document.'
        },
        // Use one of the processed contents
        ...(Array.isArray(bothContent) ? bothContent : [bothContent])
      ]
    }
  ]
});

console.log(response.choices[0].message.content);
```

## Types

### ChatMessage

```typescript
interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string | ContentItem[];
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}
```

### ContentItem

```typescript
interface TextContentItem {
  type: 'text';
  text: string;
}

interface ImageUrlContentItem {
  type: 'image_url';
  image_url: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

type ContentItem = TextContentItem | ImageUrlContentItem;
```

### ChatCompletionOptions

```typescript
interface ChatCompletionOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  stream?: boolean;
  venice_parameters?: {
    character_slug?: string;
    web_search?: boolean;
  };
}
```

### ChatCompletionResponse

```typescript
interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
      function_call?: {
        name: string;
        arguments: string;
      };
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}