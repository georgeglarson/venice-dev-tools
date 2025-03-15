# Venice Dev Tools

The unOfficial SDK for the [Venice AI](https://venice.ai) platform. This SDK provides a simple and elegant way to integrate with Venice AI's API for chat completions, image generation, and more.

## Features

- 🚀 **Comprehensive API Coverage**: Access all Venice AI's API endpoints including chat, models, images, and API key management
- 🔌 **Platform-Specific Implementations**: Dedicated packages for Node.js and web environments
- 🛠️ **Powerful CLI**: Command-line interface for all API functionality
- ⚡ **Streaming Support**: Real-time streaming for chat completions
- 🧩 **Extensible Architecture**: Register custom endpoints to extend functionality

## Installation

### Node.js

```bash
npm install @venice-dev-tools/node
# or
yarn add @venice-dev-tools/node
# or
pnpm add @venice-dev-tools/node
```

### Browser

```bash
npm install @venice-dev-tools/web
# or
yarn add @venice-dev-tools/web
# or
pnpm add @venice-dev-tools/web
```

## Quick Start

### Node.js

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

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

// Generate an image
async function imageExample() {
  const response = await venice.images.generate({
    model: 'fluently-xl',
    prompt: 'A beautiful sunset over a calm ocean',
    width: 1024,
    height: 1024
  });
  
  // Save the image to a file
  venice.saveImageToFile(response.images[0], 'sunset.png');
}
```

### Browser

```javascript
import { VeniceWeb } from '@venice-dev-tools/web';

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

// Generate an image
async function imageExample() {
  const { url } = await venice.generateImageAsUrl({
    model: 'fluently-xl',
    prompt: 'A beautiful sunset over a calm ocean',
    width: 1024,
    height: 1024
  });
  
  document.getElementById('image').src = url;
}
```

## CLI Usage

```bash
# Set your API key
venice set-key YOUR_API_KEY --global

# Chat with an AI model
venice chat completion --model llama-3.3-70b --prompt "Tell me a joke about AI"

# Start an interactive chat session
venice chat interactive

# Generate an image
venice images generate --prompt "A beautiful sunset over a calm ocean" --output sunset.png

# List available models
venice models list
```

## API Documentation

For detailed API documentation, please see the [Venice AI API documentation](https://api.venice.ai/doc/api/swagger.yaml).

## License

MIT
