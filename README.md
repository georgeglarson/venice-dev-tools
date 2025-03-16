# Venice Dev Tools Monorepo

[![npm version](https://img.shields.io/npm/v/@venice-dev-tools/node.svg)](https://www.npmjs.com/package/@venice-dev-tools/node)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

This is the monorepo for the unOfficial Venice AI SDK. It contains multiple packages that provide a simple, elegant, and type-safe way to integrate with Venice AI's API.

## 📦 Packages

This monorepo contains the following packages:

- **[@venice-dev-tools/core](venice-ai-sdk/packages/core)**: Core functionality and types
- **[@venice-dev-tools/node](venice-ai-sdk/packages/node)**: Node.js implementation with CLI
- **[@venice-dev-tools/web](venice-ai-sdk/packages/web)**: Browser implementation

## 🚀 Quick Start

For detailed usage and examples, see the [Venice Dev Tools README](venice-ai-sdk/README.md).

### Installation

```bash
# Node.js
npm install @venice-dev-tools/node

# Browser
npm install @venice-dev-tools/web
```

### Basic Usage

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

## 📚 Documentation

Visit our [documentation site](https://georgeglarson.github.io/venice-dev-tools/) for comprehensive guides, API references, and examples.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](venice-ai-sdk/LICENSE) file for details.

## 🔗 Links

- [Venice AI Official Website](https://venice.ai)
- [Venice AI API Documentation](https://api.venice.ai/doc/api/swagger.yaml)
- [GitHub Repository](https://github.com/georgeglarson/venice-dev-tools)
- [npm Package](https://www.npmjs.com/package/@venice-dev-tools/node)