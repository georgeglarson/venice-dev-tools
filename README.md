# Venice Dev Tools

A comprehensive, fully-featured SDK for the Venice AI API with CLI support, programmatic CLI usage, CLI-style interface, and an interactive live demo.

## Documentation

For comprehensive documentation, visit our [GitHub Pages documentation site](https://georgeglarson.github.io/venice-dev-tools/).

For the official Venice AI platform, visit [Venice AI](https://venice.ai/?ref=VB8W1j).

## CLI Quick Start

Get started with the Venice AI CLI in seconds:

```bash
# Install globally
npm install -g venice-dev-tools

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

For more CLI commands and options, see the [CLI Reference](https://georgeglarson.github.io/venice-dev-tools/cli).

## JavaScript Quick Start

First, [create a Venice AI account](https://venice.ai/sign-up?ref=VB8W1j) to get your API key.

```javascript
import { VeniceAI } from 'venice-dev-tools';

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

generateChatCompletion();
```

For more JavaScript examples, see the [Examples](https://georgeglarson.github.io/venice-dev-tools/documentation/examples/) section in the documentation.

## Installation

```bash
# Install as a dependency in your project
npm install venice-dev-tools

# Or install globally to use the CLI
npm install -g venice-dev-tools
```

## Live Demo

Try out the Venice AI SDK without an API key using our [interactive live demo](https://georgeglarson.github.io/venice-dev-tools/demo).

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

## Examples

For code examples covering all SDK features, see the [Examples](https://georgeglarson.github.io/venice-dev-tools/documentation/examples/) section in the documentation or check out the [examples](./examples) directory in this repository.

## Contact

For questions or feedback about this SDK, contact:
- Email: support@venice.ai
- Website: [venice.ai](https://venice.ai/contact?ref=VB8W1j)

## License

MIT