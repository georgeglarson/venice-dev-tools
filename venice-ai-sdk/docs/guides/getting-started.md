# Getting Started with Venice AI SDK

This guide will help you get started with the Venice AI SDK, a powerful client library for interacting with the Venice AI API.

## Installation

### Node.js

```bash
npm install @venice-ai/node
# or
yarn add @venice-ai/node
# or
pnpm add @venice-ai/node
```

### Browser

```bash
npm install @venice-ai/web
# or
yarn add @venice-ai/web
# or
pnpm add @venice-ai/web
```

## Basic Usage

### Node.js

```typescript
import { VeniceNode } from '@venice-ai/node';

// Create a new client
const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

// Generate a chat completion
async function chatExample() {
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'Tell me a joke about AI.' }
    ]
  });
  
  console.log(response.choices[0].message.content);
}

chatExample();
```

### Browser

```typescript
import { VeniceWeb } from '@venice-ai/web';

// Create a new client
const venice = new VeniceWeb({
  apiKey: 'your-api-key'
});

// Generate a chat completion
async function chatExample() {
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'Tell me a joke about AI.' }
    ]
  });
  
  document.getElementById('result').innerText = response.choices[0].message.content;
}

chatExample();
```

## API Key Management

### Node.js

You can provide your API key in several ways:

1. Pass it directly to the constructor:
   ```typescript
   const venice = new VeniceNode({ apiKey: 'your-api-key' });
   ```

2. Set it using an environment variable:
   ```bash
   export VENICE_API_KEY=your-api-key
   ```

3. Set it after creating the client:
   ```typescript
   const venice = new VeniceNode();
   venice.setApiKey('your-api-key');
   ```

### Browser

In browser environments, you can:

1. Pass it directly to the constructor:
   ```typescript
   const venice = new VeniceWeb({ apiKey: 'your-api-key' });
   ```

2. Set it after creating the client:
   ```typescript
   const venice = new VeniceWeb();
   venice.setApiKey('your-api-key');
   ```

## Chat Completions

### Basic Chat Completion

```typescript
const response = await venice.chat.createCompletion({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the capital of France?' }
  ]
});

console.log(response.choices[0].message.content);
```

### Streaming Chat Completion

```typescript
const streamGenerator = venice.chatStream.streamCompletion({
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

```typescript
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

## Image Generation

### Generate an Image

```typescript
const response = await venice.images.generate({
  model: 'stable-diffusion-3',
  prompt: 'A futuristic city with flying cars',
  n: 1,
  size: 1024
});

console.log(response.data[0].url);
```

### Upscale an Image

```typescript
const imageBlob = await fetch('https://example.com/image.jpg').then(r => r.blob());
const upscaledImage = await venice.images.upscale({
  image: imageBlob,
  scale: 4
});

// Use the upscaled image blob
```

## Models

### List Available Models

```typescript
const models = await venice.models.list();
console.log(models.data);
```

### Filter Models by Type

```typescript
const textModels = await venice.models.list({ type: 'text' });
console.log(textModels.data);
```

## Advanced Configuration

### Rate Limiting

```typescript
const venice = new VeniceNode({
  apiKey: 'your-api-key',
  maxConcurrent: 3,        // Maximum concurrent requests
  requestsPerMinute: 30    // Maximum requests per minute
});
```

### Logging

```typescript
import { LogLevel } from '@venice-ai/core';

// Set log level during initialization
const venice = new VeniceNode({
  apiKey: 'your-api-key',
  logLevel: LogLevel.DEBUG
});

// Or set it after initialization
venice.setLogLevel(LogLevel.DEBUG);

// Get the logger instance for custom handling
const logger = venice.getLogger();
logger.addHandler((entry) => {
  // Custom log handling
  console.log(`[CUSTOM] ${entry.level}: ${entry.message}`);
});
```

### Custom Headers

```typescript
venice.setHeader('X-Custom-Header', 'custom-value');
```

## Error Handling

The SDK provides specific error types for different error scenarios:

```typescript
import { 
  VeniceApiError, 
  VeniceAuthError,
  VeniceRateLimitError,
  VeniceValidationError,
  VeniceNetworkError
} from '@venice-ai/core';

try {
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'Hello!' }
    ]
  });
} catch (error) {
  if (error instanceof VeniceAuthError) {
    console.error('Authentication error:', error.message);
  } else if (error instanceof VeniceRateLimitError) {
    console.error('Rate limit exceeded:', error.message);
  } else if (error instanceof VeniceValidationError) {
    console.error('Validation error:', error.message);
  } else if (error instanceof VeniceApiError) {
    console.error('API error:', error.message, error.status);
  } else if (error instanceof VeniceNetworkError) {
    console.error('Network error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Event Handling

The SDK emits events for requests and responses:

```typescript
venice.on('request', (data) => {
  console.log('Request:', data);
});

venice.on('response', (data) => {
  console.log('Response:', data);
});
```

## API Key Management

You can manage your API keys programmatically using the SDK:

```typescript
// List all API keys
const keys = await venice.keys.list();
console.log(keys.api_keys);

// Create a new API key
const newKey = await venice.keys.create({
  name: 'My New API Key'
});
console.log(newKey.api_key);

// Delete an API key
await venice.keys.delete({ id: 'key-id' });
```

## Characters

Venice AI provides pre-defined characters that you can use in your chat completions:

```typescript
// List available characters
const characters = await venice.characters.list();
console.log(characters.data);

// Use a character in a chat completion
const response = await venice.chat.createCompletion({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Tell me about yourself' }
  ],
  venice_parameters: {
    character_slug: 'character-slug'
  }
});
```

## Next Steps

- Explore the [API Documentation](../api/client.md) for detailed information about all available methods
- Check out the [Chat API](../api/chat.md) for more chat completion options
- Learn about [Image Generation](../api/images.md) capabilities
- See the [Models API](../api/models.md) for working with different models
- Discover [PDF Processing](./pdf-processing.md) options for handling PDF documents
- Learn about [API Key Management](../api/api-keys.md) for managing your API keys
- Explore [Characters](../api/characters.md) for using pre-defined characters