# Venice AI SDK (Unofficial)

**A comprehensive, fully-featured TypeScript/JavaScript SDK for the Venice.ai API**

[![npm version](https://img.shields.io/npm/v/@venice-dev-tools/core)](https://www.npmjs.com/package/@venice-dev-tools/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Current Release**: v2025.11.83 (Calendar versioned - aligned with Venice API updates)

---

## ⚡ Quick Start

### Installation

```bash
npm install @venice-dev-tools/core
# or
pnpm add @venice-dev-tools/core
```

### Your First Request (30 seconds)

```typescript
import { VeniceAI } from '@venice-dev-tools/core';

const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY // Get from https://venice.ai/settings/api
});

const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Hello!' }]
});

console.log(response.choices[0].message.content);
```

**That's it!** 🎉 You just made your first Venice AI API call.

---

## 📚 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Examples](#-quick-examples)
- [Documentation](#-documentation)
- [Model Discovery](#-model-discovery)
- [Error Handling](#-error-handling)
- [Advanced Usage](#-advanced-usage)
- [Contributing](#-contributing)

---

## ✨ Features

### Core Capabilities
- ✅ **Chat Completions** - Text generation with streaming support
- ✅ **Image Generation** - Create images from text prompts
- ✅ **Embeddings** - Vector generation for semantic search
- ✅ **Audio/Speech** - Text-to-speech synthesis
- ✅ **Model Management** - Discover and manage available models
- ✅ **API Key Management** - Full admin API support

### Developer Experience
- 🎯 **TypeScript First** - Full type definitions and autocomplete
- 🔄 **OpenAI Compatible** - Drop-in replacement for OpenAI SDK
- 📦 **Monorepo Structure** - Separate packages for Node.js, browser, and core
- 🧪 **Well Tested** - 170+ integration tests against live API
- 📖 **Comprehensive Docs** - Guides, examples, and API reference
- 🔧 **Calendar Versioning** - Track SDK version with API updates

---

## 📦 Installation

### For Node.js Projects

```bash
# Using npm
npm install @venice-dev-tools/core

# Using pnpm (recommended)
pnpm add @venice-dev-tools/core

# Using yarn
yarn add @venice-dev-tools/core
```

### For Browser Projects

```bash
npm install @venice-dev-tools/web
```

### Get Your API Key

1. Visit [venice.ai/settings/api](https://venice.ai/settings/api)
2. Create a new API key (choose "Inference" for most use cases)
3. Set it as an environment variable:

```bash
export VENICE_API_KEY="your-api-key-here"
```

---

## 🚀 Quick Examples

### Chat Completion

```typescript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the capital of France?' }
  ],
  temperature: 0.7
});

console.log(response.choices[0].message.content);
```

### Streaming Chat

```typescript
// Method 1: OpenAI-compatible (recommended)
const stream = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true  // Enable streaming
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) process.stdout.write(content);
}

// Method 2: Using helper method
const stream2 = await venice.chat.completions.createStream({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Tell me a story' }]
});
```

### Image Generation

```typescript
const image = await venice.images.generate({
  model: 'venice-sd35',
  prompt: 'A serene mountain landscape at sunset',
  width: 1024,
  height: 1024
});

// Save the image
import fs from 'fs';
if (image.data[0].b64_json) {
  const buffer = Buffer.from(image.data[0].b64_json, 'base64');
  fs.writeFileSync('mountain.png', buffer);
}
```

### Embeddings

```typescript
const embeddings = await venice.embeddings.create({
  model: 'text-embedding-3-small',
  input: 'The quick brown fox jumps over the lazy dog'
});

console.log('Dimensions:', embeddings.data[0].embedding.length);
```

---

## 🔍 Model Discovery

### List All Models

```typescript
const models = await venice.models.list();
console.log(models.data.map(m => m.id));
```

### Filter by Model Type

```typescript
// Get only chat models
const chatModels = await venice.models.listChat();

// Get only image models
const imageModels = await venice.models.listImage();

// Get only embedding models
const embeddingModels = await venice.models.listEmbedding();
```

### Get Model Details

```typescript
const model = await venice.models.retrieve('llama-3.3-70b');
console.log(model);
```

**See [Model Reference](./docs/models/README.md) for all available models and their capabilities.**

---

## 🛡️ Error Handling

The SDK provides detailed error types with actionable suggestions:

```typescript
import { 
  VeniceApiError, 
  VeniceAuthError, 
  VeniceRateLimitError,
  VeniceModelNotFoundError,
  VenicePermissionError
} from '@venice-dev-tools/core';

try {
  const response = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [{ role: 'user', content: 'Hello!' }]
  });
} catch (error) {
  if (error instanceof VeniceModelNotFoundError) {
    // Provides suggestions for similar models
    console.error(error.getUserMessage());
    console.log('Suggestions:', error.suggestions);
  } else if (error instanceof VenicePermissionError) {
    // Tells you which API key type you need
    console.error(error.getUserMessage());
    console.log('Required:', error.requiredKeyType);
  } else if (error instanceof VeniceRateLimitError) {
    // Tells you when to retry
    console.log('Retry after:', error.retryAfter);
  } else if (error instanceof VeniceAuthError) {
    console.error('Check your API key');
  }
}
```

---

## 📖 Documentation

### Getting Started
- [Quickstart Guide](./docs/QUICKSTART.md) - Get up and running in 5 minutes
- [Installation](./docs/guides/getting-started.md) - Detailed installation instructions
- [Authentication](./docs/guides/getting-started.md#authentication) - API key setup

### API Reference
- [Chat Completions](./docs/api-reference/chat.md) - Text generation and conversation
- [Images](./docs/api-reference/images.md) - Image generation and editing
- [Embeddings](./docs/api-reference/embeddings.md) - Vector embeddings
- [Models](./docs/models/README.md) - Available models and capabilities
- [Audio](./docs/api-reference/audio.md) - Text-to-speech

### Guides
- [Streaming](./docs/guides/streaming.md) - Real-time response streaming
- [Error Handling](./docs/guides/error-handling.md) - Comprehensive error handling
- [Best Practices](./docs/guides/best-practices.md) - Production tips
- [Migration from OpenAI](./docs/migration/from-openai.md) - Switch from OpenAI SDK

### Examples
- [TypeScript Examples](./examples/typescript/) - 19+ comprehensive examples
- [JavaScript Examples](./examples/javascript/) - CommonJS and ES modules
- [Advanced Patterns](./examples/typescript/16-middleware-system.ts) - Custom middleware

---

## 🏗️ Advanced Usage

### Configuration

```typescript
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY,
  baseUrl: 'https://api.venice.ai/api/v1',  // Custom endpoint
  timeout: 30000,                            // Request timeout (ms)
  maxConcurrent: 5,                          // Max concurrent requests
  requestsPerMinute: 60,                     // Rate limit
  logLevel: 1                                // 0=NONE, 1=INFO, 2=DEBUG
});
```

### Multi-turn Conversations

```typescript
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is 15 + 27?' }
];

let response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages
});

// Add to conversation
messages.push(response.choices[0].message);
messages.push({ role: 'user', content: 'Now multiply that by 3' });

response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages
});
```

### Streaming with Abort Control

```typescript
const controller = new AbortController();

const stream = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Tell a long story' }],
  stream: true
});

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  for await (const chunk of stream) {
    if (controller.signal.aborted) break;
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('\nStream cancelled');
  }
}
```

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/georgeglarson/venice-dev-tools.git
cd venice-dev-tools

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run integration tests (requires API keys)
export VENICE_API_KEY="your-key"
export VENICE_ADMIN_API_KEY="your-admin-key"
pnpm test:integration
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for the [Venice.ai](https://venice.ai) platform
- Inspired by the OpenAI SDK structure
- Community-driven development

---

## 📞 Support

- 📖 [Documentation](./docs/)
- 💬 [GitHub Discussions](https://github.com/georgeglarson/venice-dev-tools/discussions)
- 🐛 [Report Issues](https://github.com/georgeglarson/venice-dev-tools/issues)
- 🌐 [Venice AI Support](https://venice.ai/support)

---

## ⭐ Star History

If you find this SDK helpful, please consider giving it a star on GitHub!

---

**Made with ❤️ by the Venice AI community**
