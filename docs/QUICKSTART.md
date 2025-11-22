# Venice AI SDK - Quickstart Guide

Get started with the Venice AI SDK in less than 5 minutes!

## Installation

```bash
# Using npm
npm install @venice-dev-tools/core

# Using pnpm (recommended)
pnpm add @venice-dev-tools/core

# Using yarn
yarn add @venice-dev-tools/core
```

## Get Your API Key

1. Visit [venice.ai/settings/api](https://venice.ai/settings/api)
2. Click "Create New API Key"
3. Choose key type:
   - **Inference** - For chat, images, embeddings (most common)
   - **Admin** - For API key management and billing
4. Copy your API key

## Set Up Environment

Create a `.env` file in your project root:

```bash
VENICE_API_KEY=your-api-key-here
```

**Security Note**: Never commit your `.env` file to version control!

## Your First Request

### Option 1: TypeScript (Recommended)

```typescript
import { VeniceAI } from '@venice-dev-tools/core';

const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY
});

const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Hello! What can you help me with?' }
  ]
});

console.log(response.choices[0].message.content);
```

### Option 2: JavaScript (ES Modules)

```javascript
import { VeniceAI } from '@venice-dev-tools/core';
import dotenv from 'dotenv';

dotenv.config();

const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY
});

const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Hello! What can you help me with?' }
  ]
});

console.log(response.choices[0].message.content);
```

### Option 3: JavaScript (CommonJS)

```javascript
const { VeniceAI } = require('@venice-dev-tools/core');
require('dotenv').config();

const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY
});

async function main() {
  const response = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'Hello! What can you help me with?' }
    ]
  });

  console.log(response.choices[0].message.content);
}

main();
```

## Run Your Code

```bash
# TypeScript
npx tsx your-file.ts

# JavaScript (ES Modules)
node your-file.js

# JavaScript (CommonJS)
node your-file.js
```

## Common Use Cases

### 1. Chat Completion

```typescript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the capital of France?' }
  ],
  temperature: 0.7,
  max_tokens: 100
});

console.log(response.choices[0].message.content);
```

### 2. Streaming Chat

**Method 1: Using `stream: true` (OpenAI-compatible)**

```typescript
const stream = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true  // Enable streaming
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    process.stdout.write(content);
  }
}
```

**Method 2: Using `createStream()` helper**

```typescript
const stream = await venice.chat.completions.createStream({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Tell me a story' }]
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    process.stdout.write(content);
  }
}
```

### 3. Image Generation

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
  console.log('Image saved to mountain.png');
}
```

### 4. Embeddings

```typescript
const embeddings = await venice.embeddings.create({
  model: 'text-embedding-3-small',
  input: 'The quick brown fox jumps over the lazy dog'
});

console.log('Embedding dimensions:', embeddings.data[0].embedding.length);
console.log('First 5 values:', embeddings.data[0].embedding.slice(0, 5));
```

### 5. List Available Models

```typescript
const models = await venice.models.list();

console.log('Available models:');
models.data.forEach(model => {
  console.log(`- ${model.id}`);
});
```

### 6. Multi-turn Conversation

```typescript
const messages = [
  { role: 'system', content: 'You are a helpful math tutor.' },
  { role: 'user', content: 'What is 15 + 27?' }
];

// First response
let response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages
});

console.log('AI:', response.choices[0].message.content);

// Add to conversation history
messages.push(response.choices[0].message);
messages.push({ role: 'user', content: 'Now multiply that by 3' });

// Second response
response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages
});

console.log('AI:', response.choices[0].message.content);
```

## Configuration Options

```typescript
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY,
  
  // Optional configurations
  baseUrl: 'https://api.venice.ai/api/v1',  // Custom API endpoint
  timeout: 30000,                            // Request timeout (ms)
  maxConcurrent: 5,                          // Max concurrent requests
  requestsPerMinute: 60,                     // Rate limit
  logLevel: 1                                // 0=NONE, 1=INFO, 2=DEBUG, 3=VERBOSE
});
```

## Error Handling

```typescript
import { 
  VeniceApiError, 
  VeniceAuthError, 
  VeniceRateLimitError,
  VeniceNetworkError 
} from '@venice-dev-tools/core';

try {
  const response = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [{ role: 'user', content: 'Hello!' }]
  });
  
  console.log(response.choices[0].message.content);
  
} catch (error) {
  if (error instanceof VeniceAuthError) {
    console.error('Authentication failed. Check your API key.');
  } else if (error instanceof VeniceRateLimitError) {
    console.error('Rate limit exceeded. Please wait and retry.');
  } else if (error instanceof VeniceNetworkError) {
    console.error('Network error. Check your connection.');
  } else if (error instanceof VeniceApiError) {
    console.error('API error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Next Steps

### Explore Examples

Check out the [examples directory](../examples/) for more advanced use cases:

- [Streaming with abort control](../examples/typescript/12-streaming-with-abort.ts)
- [Vision/multimodal](../examples/typescript/11-vision-multimodal.ts)
- [Error recovery](../examples/typescript/18-error-recovery.ts)
- [Rate limit handling](../examples/typescript/14-rate-limit-handling.ts)
- [Custom middleware](../examples/typescript/16-middleware-system.ts)

### Read the Documentation

- [API Reference](./api-reference/) - Detailed API documentation
- [Models Guide](./models/) - Available models and their capabilities
- [Error Handling](./guides/error-handling.md) - Comprehensive error handling
- [Best Practices](./guides/best-practices.md) - Production tips

### Join the Community

- [GitHub Issues](https://github.com/georgeglarson/venice-dev-tools/issues) - Report bugs or request features
- [Venice AI Discord](https://discord.gg/venice-ai) - Community support
- [Venice AI Docs](https://docs.venice.ai) - Official Venice AI documentation

## Common Issues

### "API key not found"

Make sure you've set the `VENICE_API_KEY` environment variable:

```bash
export VENICE_API_KEY=your-key-here
```

Or pass it directly:

```typescript
const venice = new VeniceAI({ apiKey: 'your-key-here' });
```

### "Model not found" (404)

Check available models:

```typescript
const models = await venice.models.list();
console.log(models.data.map(m => m.id));
```

See [Models Reference](./models/) for valid model names.

### "Rate limit exceeded" (429)

You're making too many requests. Either:
- Wait before retrying
- Reduce request frequency
- Upgrade your Venice AI plan

### TypeScript errors

Make sure you have TypeScript installed:

```bash
npm install -D typescript @types/node
```

And create a `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true
  }
}
```

## Tips for Success

1. **Start Simple** - Begin with basic chat completions before trying advanced features
2. **Use TypeScript** - Get autocomplete and type safety
3. **Handle Errors** - Always wrap API calls in try-catch blocks
4. **Check Models** - Use `venice.models.list()` to see available models
5. **Read Examples** - The examples directory has solutions for common use cases
6. **Monitor Usage** - Track your API usage to avoid unexpected costs

## Need Help?

- 📖 [Full Documentation](./README.md)
- 💬 [GitHub Discussions](https://github.com/georgeglarson/venice-dev-tools/discussions)
- 🐛 [Report Issues](https://github.com/georgeglarson/venice-dev-tools/issues)
- 🌐 [Venice AI Support](https://venice.ai/support)

Happy coding! 🚀
