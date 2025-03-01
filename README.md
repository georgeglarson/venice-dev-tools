# Venice Dev Tools

A comprehensive, fully-featured SDK for the Venice AI API with CLI support, programmatic CLI usage, CLI-style interface, and an interactive live demo.

## Documentation

For comprehensive documentation, visit our [GitHub Pages documentation site](https://venice-ai.github.io/venice-ai-sdk-apl/).

For the official Venice AI platform, visit [Venice AI](https://venice.ai/).

## CLI Quick Start

Get started with the Venice AI CLI in seconds:

```bash
# Install globally
npm install -g venice-ai-sdk-apl

# Configure your API key
venice configure

# Generate a chat completion
venice chat "Tell me about AI"

# Generate an image
venice generate-image "A beautiful sunset" --output sunset.png

# List available models
venice list-models

# List and interact with characters
venice list-characters
venice chat "Tell me about yourself" --model character:sophia-sophie-daniels
```

### Key CLI Commands

| Command | Description |
|---------|-------------|
| `venice configure` | Configure your Venice API key |
| `venice chat <prompt>` | Generate a chat completion |
| `venice generate-image <prompt>` | Generate an image |
| `venice list-models` | List available models |
| `venice list-styles` | List available image styles |
| `venice list-characters` | List available AI characters |
| `venice chat <prompt> --model character:<slug>` | Chat with a specific character |
| `venice list-keys` | List your API keys |

### Advanced CLI Options

```bash
# Chat with web search enabled
venice chat "What's happening in the world today?" --web-search

# Chat with a specific character
venice chat "Tell me about philosophy" --model character:alan-watts

# Generate an image with specific parameters
venice generate-image "A futuristic city" --model fluently-xl --style "3D Model" --width 1024 --height 768

# Get raw JSON output (useful for scripting)
venice list-models --raw > models.json
venice chat "Hello" --raw | jq .choices[0].message.content
venice list-characters --raw | jq '.data[0].slug'
```

## JavaScript Quick Start

First, [create a Venice AI account](https://venice.ai/sign-up?ref=VB8W1j) to get your API key.

```javascript
import { VeniceAI } from 'venice-ai-sdk-apl';

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
      enable_web_search: 'on'
    }
  });
  
  console.log(response.choices[0].message.content);
}

// Chat with a character
async function chatWithCharacter() {
  // Option 1: Using character_slug parameter
  const response = await venice.chat.completions.create({
    model: 'default',
    messages: [
      { role: 'user', content: 'Tell me about philosophy' }
    ],
    venice_parameters: {
      character_slug: 'alan-watts'
    }
  });
  
  // Option 2: Using model parameter with character: prefix
  const response2 = await venice.chat.completions.create({
    model: 'character:alan-watts',
    messages: [
      { role: 'user', content: 'Tell me about philosophy' }
    ]
  });
  
  console.log(response.choices[0].message.content);
}

generateChatCompletion();
```

## Installation

```bash
# Install as a dependency in your project
npm install venice-dev-tools

# Or install globally to use the CLI
npm install -g venice-ai-sdk-apl
```

## Live Demo

Try out the Venice AI SDK without an API key using our [interactive live demo](https://venice-ai.github.io/venice-ai-sdk-apl/).

## Features

- **Chat Completions**: Generate text responses with streaming support and web search
- **Image Generation**: Create images with various models and styles
- **Image Upscaling**: Enhance image resolution
- **Models Management**: List models, traits, and compatibility mappings
- **Character Management**: List and interact with pre-defined AI characters
- **API Key Management**: Create, list, delete, and check rate limits for API keys
- **VVV Token Information**: Get circulating supply, network utilization, and staking yield
- **Web3 Integration**: Generate API keys using Web3 wallets
- **Command Line Interface**: Interact with the API directly from your terminal
- **Error Handling**: Comprehensive error handling with specific error classes
- **Rate Limiting**: Automatic rate limit tracking and handling
- **Debug Logging**: Robust logging system with multiple log levels and runtime configuration

## Why Choose This SDK?

This SDK stands out with exceptional developer experience, robust error handling, streaming support done right, and production-ready features.

### Privacy-First Approach

[Venice AI](https://venice.ai/sign-up?ref=VB8W1j) offers unparalleled privacy advantages over other AI providers:

- **No Data Storage**: Your prompts, responses, and generated content are never saved on any Venice infrastructure
- **Local Storage Only**: Your conversation history lives in your local browser - clear your browser data, and those conversations are gone forever
- **Decentralized Processing**: Your requests are processed on decentralized GPUs without any identifying information
- **Transient Processing**: Once a prompt is processed, it is purged from the GPU - nothing persists
- **SSL Encryption**: All communication is secured using SSL encryption throughout the entire journey

As Venice states: **"You don't have to protect what you do not have."**

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
npm install -g venice-dev-tools

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

# Enable debug output for any command
venice list-keys --debug
venice chat "Hello" --debug

# Get raw JSON output (useful for scripting)
venice list-styles --raw
venice list-models --raw > models.json
venice chat "Hello" --raw | jq .choices[0].message.content

# Get help for any command
venice --help
venice chat --help
```

### Debugging

The CLI includes a global `--debug` flag that can be used with any command to enable detailed debug output. This is useful for troubleshooting issues or understanding the API responses in detail:

```bash
# Show detailed debug information for API key listing
venice list-keys --debug

# Debug a chat completion request and response
venice chat "Hello" --debug
```

When debug mode is enabled, the CLI will:
1. Enable debug logging in the SDK
2. Show detailed request and response information
3. Display raw API responses and metadata

### Programmatic CLI Usage

The SDK provides two ways to use CLI commands in your code:

#### 1. CLI-Style Interface (Recommended)

The most intuitive approach that mirrors the CLI syntax exactly:

```javascript
import { VeniceAI } from 'venice-ai-sdk-apl';

const venice = new VeniceAI({ apiKey: 'your-api-key' });

// Use the exact same commands as the CLI
async function main() {
  try {
    // CLI-style with string arguments (just like the terminal)
    const styles = await venice.cli('list-styles --limit 5');
    console.log(`Found ${styles.total} styles`);
    
    // Chat with web search
    const response = await venice.cli('chat "Tell me about AI" --web-search');
    console.log(response);
    
    // Generate an image
    const image = await venice.cli('generate-image "A beautiful sunset" --style Photographic --output sunset.png');
    console.log(`Image saved to: ${image.savedTo}`);
    
    // You can also use object arguments instead of string arguments
    const models = await venice.cli('list-models', {
      limit: 5,
      raw: true
    });
    console.log(`Found ${models.data.length} models`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

#### 2. Command Object Interface

An alternative approach using the command object:

```javascript
import { cli } from 'venice-ai-sdk-apl';

// Use the commands object
async function main() {
  try {
    // Configure your API key
    cli.commands.configure('your-api-key');
    
    // Enable debug mode (optional)
    cli.commands.enableDebug();
    
    // Chat with the AI
    const response = await cli.commands.chat('Tell me about AI', {
      model: 'llama-3.3-70b',
      webSearch: true
    });
    console.log(response);
    
    // List API keys with options
    const keys = await cli.commands.listKeys({
      limit: 10,     // Only return 10 keys
      type: 'ADMIN'  // Filter by key type
    });
    console.log(`Showing ${keys.keys.length} of ${keys.total} keys`);
    
    // Get raw API response
    const rawStyles = await cli.commands.listStyles({ raw: true });
    console.log(`Found ${rawStyles.styles.length} styles`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

These approaches allow developers to:
1. Use the same commands they're familiar with from the CLI
2. Avoid learning the full SDK API for simple use cases
3. Control output format and limits programmatically
4. Get raw API responses when needed
5. Easily integrate Venice AI capabilities into their applications

## Examples

For more examples, check out the [examples](./examples) directory:

- [Basic Chat](https://github.com/venice-ai/venice-ai-sdk-apl/blob/main/examples/chat/basic-chat.js)
- [Streaming Chat](https://github.com/venice-ai/venice-ai-sdk-apl/blob/main/examples/chat/streaming.js)
- [Web Search Chat](https://github.com/venice-ai/venice-ai-sdk-apl/blob/main/examples/chat/web-search.js)
- [Document Vision Chat](https://github.com/venice-ai/venice-ai-sdk-apl/blob/main/examples/chat/document-vision-chat.js)
- [Generate Image](https://github.com/venice-ai/venice-ai-sdk-apl/blob/main/examples/image/generate-image.js)
- [Advanced Image Generation](https://github.com/venice-ai/venice-ai-sdk-apl/blob/main/examples/image/advanced-image-generation.js)
- [List Models](https://github.com/venice-ai/venice-ai-sdk-apl/blob/main/examples/models/list-models.js)
- [Model Compatibility](https://github.com/venice-ai/venice-ai-sdk-apl/blob/main/examples/models/model-compatibility.js)
- [Manage API Keys](https://github.com/venice-ai/venice-ai-sdk-apl/blob/main/examples/api-keys/manage-keys.js)
- [VVV Token Information](https://github.com/venice-ai/venice-ai-sdk-apl/blob/main/examples/vvv/vvv-info.js)
- [Character Interaction](https://github.com/venice-ai/venice-ai-sdk-apl/blob/main/examples/characters/character-chat.js)
- [CLI Character Interaction](https://github.com/venice-ai/venice-ai-sdk-apl/blob/main/examples/cli-character-interaction.js)
- [Debug Logging](https://github.com/venice-ai/venice-ai-sdk-apl/blob/main/examples/debug-logging.js)
- [CLI-Style Interface](https://github.com/venice-ai/venice-ai-sdk-apl/blob/main/examples/cli-style.js)
- [Programmatic CLI Usage](https://github.com/venice-ai/venice-ai-sdk-apl/blob/main/examples/cli-programmatic.js)

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
| VVV Token Information | ✅ Working | Successfully retrieves circulating supply, network utilization, and staking yield |
| Character Management | ✅ Working | Successfully lists and retrieves character information |

## Contact

For questions or feedback about this SDK, contact:
- Email: support@venice.ai
- Website: [venice.ai](https://venice.ai/contact)

## License

MIT