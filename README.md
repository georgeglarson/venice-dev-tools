# Venice AI SDK APL

A comprehensive, fully-featured SDK for the Venice AI API following API Programming Library (APL) principles.

## Why Choose This SDK?

This SDK stands out with exceptional developer experience, robust error handling, streaming support done right, and production-ready features.

### Privacy-First Approach

[Venice AI](https://venice.ai/chat?ref=VB8W1j) offers unparalleled privacy advantages over other AI providers:

- **No Data Storage**: Your prompts, responses, and generated content are never saved on any Venice infrastructure
- **Local Storage Only**: Your conversation history lives in your local browser - clear your browser data, and those conversations are gone forever
- **Decentralized Processing**: Your requests are processed on decentralized GPUs without any identifying information
- **Transient Processing**: Once a prompt is processed, it is purged from the GPU - nothing persists
- **SSL Encryption**: All communication is secured using SSL encryption throughout the entire journey

As Venice states: **"You don't have to protect what you do not have."**

This SDK enhances these privacy features with sensitive data redaction in logs, configurable logging levels, and support for local processing configurations.

### Developer Experience That Delights

Our SDK excels in developer experience through:

- **Intuitive API Design**: The fluent, chainable API follows familiar patterns that developers already know
- **Progressive Disclosure**: Simple use cases are simple, while advanced features are available when needed
- **Comprehensive Examples**: Each feature has dedicated examples showing real-world usage

### Reliability & Robustness for Production Use

The SDK is built for production use with:

- **Graceful Error Handling**: Specific error classes with detailed information
- **Adaptive Implementation**: Handles different API response formats gracefully
- **Automatic Retries**: Built-in retry mechanism for transient failures
- **Rate Limit Handling**: Automatic extraction and exposure of rate limit information

## Features

- **Chat Completions**: Generate text responses with streaming support and web search
- **Image Generation**: Create images with various models and styles
- **Image Upscaling**: Enhance image resolution
- **Models Management**: List models, traits, and compatibility mappings
- **API Key Management**: Create, list, delete, and check rate limits for API keys
- **Web3 Integration**: Generate API keys using Web3 wallets
- **Command Line Interface**: Interact with the API directly from your terminal
- **Error Handling**: Comprehensive error handling with specific error classes
- **Rate Limiting**: Automatic rate limit tracking and handling
- **Debug Logging**: Robust logging system with multiple log levels and runtime configuration

## Installation

You can install the SDK using npm:

```bash
# Install as a dependency in your project
npm install veniceai-sdk

# Or install globally to use the CLI
npm install -g veniceai-sdk
```

For development:

1. Clone this repository
2. Build the SDK with `npm run build`
3. Link it to your project with `npm link`

## Authentication

The Venice AI SDK requires an API key for authentication. You can obtain an API key from the [Venice AI website](https://venice.ai/settings/api).

```javascript
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});
```

## Quick Start

First, [create a Venice AI account](https://venice.ai/chat?ref=VB8W1j) to get your API key.

```javascript
import { VeniceAI } from './path-to-sdk';

// Initialize the client
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

// Generate a chat completion
async function generateChatCompletion() {
  const response = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Tell me about AI' }
    ],
    venice_parameters: {
      enable_web_search: 'on',
      include_venice_system_prompt: true
    }
  });
  
  console.log(response.choices[0].message.content);
}

generateChatCompletion();
```

## Streaming Example

```javascript
// Generate a streaming chat completion
const stream = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Write a poem about AI' }
  ],
  stream: true
});

// Process the stream
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

## Image Generation Example

```javascript
// Generate an image
const response = await venice.image.generate({
  model: 'fluently-xl',
  prompt: 'A beautiful sunset over a mountain range',
  negative_prompt: 'blurry, distorted, low quality',
  style_preset: '3D Model',
  height: 1024,
  width: 1024
});

console.log(response.images[0].url);
```

## Debug Logging

The SDK includes a robust logging system to help with debugging:

```javascript
// Enable debug logging at initialization
const venice = new VeniceAI({
  apiKey: 'your-api-key',
  logLevel: 4 // DEBUG level (0=NONE, 1=ERROR, 2=WARN, 3=INFO, 4=DEBUG, 5=TRACE)
});

// Or enable it later
venice.setLogLevel(4); // DEBUG level

// Convenience methods
venice.enableDebugLogging(); // Sets to DEBUG level
venice.disableLogging(); // Sets to NONE level
```

## API Resources

### Chat

```javascript
// Basic chat completion
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Tell me about AI' }
  ]
});

// With web search
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'What are the latest developments in AI?' }
  ],
  venice_parameters: {
    enable_web_search: 'on'
  }
});

// Using model feature suffix
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b:enable_web_search=on&include_venice_system_prompt=false',
  messages: [
    { role: 'user', content: 'What are the latest developments in AI?' }
  ]
});
```

### Image

```javascript
// Generate an image
const response = await venice.image.generate({
  model: 'fluently-xl',
  prompt: 'A beautiful sunset over a mountain range',
  negative_prompt: 'blurry, distorted, low quality',
  style_preset: '3D Model',
  height: 1024,
  width: 1024
});

// Upscale an image
const response = await venice.image.upscale({
  model: 'upscale-model',
  image: base64EncodedImage,
  scale: 2
});

// List image styles
const response = await venice.image.styles.list();
```

### Models

```javascript
// List models
const response = await venice.models.list();

// Get model traits
const response = await venice.models.traits();

// Get model compatibility mappings
const response = await venice.models.compatibility();
```

### API Keys

```javascript
// List API keys
const response = await venice.apiKeys.list();

// Create API key
const response = await venice.apiKeys.create({
  name: 'My New API Key'
});

// Delete API key
const response = await venice.apiKeys.delete({
  id: 'api-key-id'
});

// Get API key rate limits
const response = await venice.apiKeys.rateLimits();

// Get rate limits for a specific model
const modelLimits = await venice.apiKeys.getModelRateLimits('llama-3.3-70b');

// Generate API key with Web3 wallet
const messageResponse = await venice.apiKeys.web3.getMessage({
  wallet_address: '0x1234567890abcdef1234567890abcdef12345678'
});

const keyResponse = await venice.apiKeys.web3.generateKey({
  wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
  signature: 'signed-message',
  name: 'My Web3 API Key'
});
```

## Error Handling

The SDK provides detailed error information:

```javascript
try {
  const response = await venice.chat.completions.create({
    model: 'invalid-model',
    messages: [
      { role: 'user', content: 'Hello' }
    ]
  });
} catch (error) {
  console.error('Error:', error.message);
  console.error('Error code:', error.code);
  console.error('Status:', error.status);
  
  if (error.rateLimitInfo) {
    console.error('Rate limit exceeded. Try again after:', 
      new Date(error.rateLimitInfo.reset * 1000).toLocaleString());
  }
}
```

## Custom Configuration

You can customize the client configuration:

```javascript
const venice = new VeniceAI({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.venice.ai/api/v1',
  timeout: 60000, // 60 seconds
  logLevel: 4, // DEBUG level
  maxRetries: 3
});
```

## Rate Limiting

The Venice AI API has rate limits for different tiers:

- **Explorer Tier**: Limited requests per minute and day
- **Paid Tier**: Higher limits for paid users

The SDK automatically includes rate limit information in the response metadata:

```javascript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Hello' }
  ]
});

if (response._metadata?.rateLimit) {
  console.log('Rate limit:', response._metadata.rateLimit);
}
```

## Advanced Usage

### Model Feature Suffix

You can use model feature suffixes to enable features in a more concise way:

```javascript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b:enable_web_search=on&include_venice_system_prompt=false',
  messages: [
    { role: 'user', content: 'What are the latest developments in AI?' }
  ]
});
```

This is equivalent to using the `venice_parameters` object but can be more convenient in some cases.

## Command Line Interface (CLI)

The SDK includes a command-line interface that allows you to interact with the Venice AI API directly from your terminal:

```bash
# Install globally
npm install -g veniceai-sdk

# Configure your API key
venice configure

# Generate a chat completion
venice chat "Tell me about AI"

# Generate an image
venice generate-image "A beautiful sunset over a mountain range" -o sunset.png

# List available models
venice list-models

# Manage API keys
venice list-keys
venice create-key --name "My New Key"
venice delete-key --id "key-id"
```

### Available Commands

| Command | Description |
|---------|-------------|
| `venice configure` | Configure your Venice API key |
| `venice chat <prompt>` | Generate a chat completion |
| `venice generate-image <prompt>` | Generate an image |
| `venice list-models` | List available models |
| `venice list-styles` | List available image styles |
| `venice list-keys` | List your API keys |
| `venice create-key` | Create a new API key |
| `venice delete-key` | Delete an API key |
| `venice rate-limits` | Get rate limits for your API key |

### CLI Options

```bash
# Chat with web search enabled
venice chat "What are the latest developments in AI?" --web-search

# Generate an image with specific parameters
venice generate-image "A beautiful sunset" --model fluently-xl --style "3D Model" --width 1024 --height 768 --output sunset.png

# Get help for any command
venice --help
venice chat --help
```

## Examples

For more examples, check out the [examples](./examples) directory:

- [Basic Chat](./examples/chat/basic-chat.js)
- [Streaming Chat](./examples/chat/streaming.js)
- [Web Search Chat](./examples/chat/web-search.js)
- [Generate Image](./examples/image/generate-image.js)
- [List Models](./examples/models/list-models.js)
- [Manage API Keys](./examples/api-keys/manage-keys.js)
- [Debug Logging](./examples/debug-logging.js)

## Implementation Details

### Streaming Implementation

The Venice AI API uses Server-Sent Events (SSE) format for streaming responses. Each chunk is sent in the format:

```
data: {"id":"...","object":"chat.completion.chunk","choices":[{"delta":{"content":"..."}}]}
```

Our implementation correctly:
1. Makes a direct axios request with `responseType: 'stream'`
2. Parses the SSE format to extract the JSON chunks
3. Yields each chunk as it arrives
4. Handles the final `[DONE]` message

### Debug Logging

We've implemented a robust logging system with the following features:

1. **Multiple Log Levels**: ERROR, WARN, INFO, DEBUG, and TRACE levels for different verbosity needs.
2. **Runtime Configuration**: Users can change the log level during runtime using `client.setLogLevel()`.
3. **Convenience Methods**: `enableDebugLogging()` and `disableLogging()` for quick configuration.
4. **Request/Response Logging**: Detailed logging of HTTP requests and responses, with sensitive information automatically redacted.
5. **Custom Log Handlers**: Support for custom log handlers to integrate with existing logging systems.

### Enhanced Resource Implementations

We've improved the implementations for several resources:

1. **Image Styles**: Added detailed logging, better error handling, and a method to get a specific style by ID.
2. **API Keys List**: Added detailed logging, better error handling, and a method to get a specific API key by ID.
3. **API Keys Rate Limits**: Added detailed logging, better error handling, and a method to get rate limits for a specific model.

## Development Status

All features are now working correctly:

| Feature | Status | Notes |
|---------|--------|-------|
| Basic Chat Completions | ✅ Working | Successfully generates responses with proper metadata |
| Streaming Chat | ✅ Working | Successfully streams responses in real-time |
| Web Search in Chat | ✅ Working | Successfully searches the web for information |
| Image Generation | ✅ Working | Successfully generates images with specified parameters |
| Models Listing | ✅ Working | Successfully retrieves and displays available models |
| Image Styles | ✅ Working | Successfully retrieves and formats style information |
| API Key Management | ✅ Working | Successfully lists, creates, and deletes API keys |
| API Key Rate Limits | ✅ Working | Successfully retrieves rate limits for all models and specific models |

## Contact

For questions or feedback about this SDK, contact:
- Email: george.g.larson@gmail.com
- Twitter: [@g3ologic](https://x.com/@g3ologic)

## License

MIT