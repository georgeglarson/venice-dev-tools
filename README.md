# Venice Dev Tools

[![npm version](https://img.shields.io/npm/v/@venice-dev-tools/node.svg)](https://www.npmjs.com/package/@venice-dev-tools/node)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

The unOfficial SDK for the [Venice AI](https://venice.ai) platform. This SDK provides a simple, elegant, and type-safe way to integrate with Venice AI's API for chat completions, image generation, PDF processing, and more.

<div align="center">
  <img src="sunset.png" alt="Venice AI Generated Image" width="400"/>
</div>

## 🚀 Quick Start

### Installation

```bash
# Install the complete SDK (includes all packages)
npm install venice-dev-tools

# Or install individual packages
# Node.js only
npm install @venice-dev-tools/node

# Browser only
npm install @venice-dev-tools/web

# Core functionality only
npm install @venice-dev-tools/core
```

### Chat Completion Example

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

// Initialize with your API key
const venice = new VeniceNode({ apiKey: 'your-api-key' });

// Generate a chat completion
const response = await venice.chat.createCompletion({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Explain quantum computing in simple terms' }]
});

console.log(response.choices[0].message.content);
```

### Image Generation Example

```javascript
// Generate an image
const response = await venice.images.generate({
  model: 'fluently-xl',
  prompt: 'A beautiful sunset over Venice, Italy',
  width: 1024,
  height: 1024
});

// Save the image (Node.js only)
venice.saveImageToFile(response.images[0], 'venice-sunset.png');
```

### CLI Usage

```bash
# Install globally
npm install -g @venice-dev-tools/node

# Set your API key
venice set-key YOUR_API_KEY --global

# Start an interactive chat session
venice chat interactive

# Generate an image
venice images generate --prompt "A beautiful sunset over Venice" --output sunset.png
```

## ✨ Features

- **🤖 Advanced AI Models**: Access to Venice AI's powerful LLMs including Llama 3.3, Claude, and more
- **🖼️ Image Generation**: Create stunning images with models like Fluently XL
- **📄 PDF Processing**: Extract, analyze, and chat with PDF documents
- **🔄 Streaming Support**: Real-time streaming for chat completions
- **🌐 Cross-Platform**: Works in Node.js and browser environments
- **⚙️ CLI Tools**: Powerful command-line interface for all API functionality
- **🔒 Type Safety**: Full TypeScript support with comprehensive type definitions
- **🧩 Extensible**: Register custom endpoints to extend functionality

## 📚 Documentation

### Comprehensive Guides

Visit our [documentation site](https://georgeglarson.github.io/venice-dev-tools/) for comprehensive guides, API references, and examples.

- [Getting Started Guide](https://georgeglarson.github.io/venice-dev-tools/guides/getting-started.html)
- [API Reference](https://georgeglarson.github.io/venice-dev-tools/api/client.html)
- [PDF Processing Guide](https://georgeglarson.github.io/venice-dev-tools/guides/pdf-processing.html)
- [Migration Guide (v1 to v2)](https://georgeglarson.github.io/venice-dev-tools/guides/migration-v1-to-v2.html)

### Code Examples

#### Streaming Chat Completions

```javascript
const stream = await venice.chat.createCompletionStream({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Write a short poem about AI' }]
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

#### PDF Processing

```javascript
// Process a PDF file
const pdfResponse = await venice.pdf.process({
  file: './document.pdf',
  mode: 'extract'  // 'extract', 'analyze', or 'chat'
});

console.log(pdfResponse.content);

// Chat with a PDF
const chatResponse = await venice.pdf.chat({
  file: './document.pdf',
  query: 'Summarize the main points of this document'
});

console.log(chatResponse.answer);

// Process PDF with different modes
// 1. As image (default)
const imageContent = await venice.utils.processFile('./document.pdf');

// 2. As text
const textContent = await venice.utils.processFile('./document.pdf', { pdfMode: 'text' });

// 3. As both text and image
const bothContent = await venice.utils.processFile('./document.pdf', { pdfMode: 'both' });
```

#### CLI PDF Processing

```bash
# Process PDF as image (default mode)
venice chat completion --model llama-3.3-70b --attach document.pdf --prompt "Summarize this document"

# Process PDF as text
venice chat completion --model llama-3.3-70b --attach document.pdf --pdf-mode text --prompt "Summarize this document"

# Process PDF as both text and image
venice chat completion --model llama-3.3-70b --attach document.pdf --pdf-mode both --prompt "Summarize this document"

# Interactive chat with PDF processing as both text and image
venice chat interactive --attach document.pdf --pdf-mode both
```

#### API Key Management

```javascript
// List all API keys
const keys = await venice.apiKeys.list();
console.log(keys);

// Create a new API key
const newKey = await venice.apiKeys.create({
  name: 'My New API Key',
  expiresAt: '2025-12-31'
});
```

## 🧰 Packages

This SDK is organized into multiple packages:

- **[@venice-dev-tools/core](https://www.npmjs.com/package/@venice-dev-tools/core)**: Core functionality and types
- **[@venice-dev-tools/node](https://www.npmjs.com/package/@venice-dev-tools/node)**: Node.js implementation with CLI
- **[@venice-dev-tools/web](https://www.npmjs.com/package/@venice-dev-tools/web)**: Browser implementation

## 🛠️ Development

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
```

## 📋 Requirements

- Node.js 18.0.0 or later
- A Venice AI API key ([Get one here](https://venice.ai))

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Venice AI Official Website](https://venice.ai)
- [Venice AI API Documentation](https://api.venice.ai/doc/api/swagger.yaml)
- [GitHub Repository](https://github.com/georgeglarson/venice-dev-tools)
- [npm Package](https://www.npmjs.com/package/@venice-dev-tools/node)

## 🙏 Acknowledgements

This SDK is not officially affiliated with Venice AI. It is maintained by the community for the community.
