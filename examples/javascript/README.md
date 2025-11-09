# Venice AI JavaScript Examples

Modern JavaScript examples demonstrating the Venice AI SDK using async/await and contemporary Node.js patterns. These examples show you how to use the SDK without TypeScript—no build step required!

## Why JavaScript Examples?

**When to use JavaScript vs TypeScript vs Shell:**

| Use Case | Recommended |
|----------|-------------|
| **Quick prototypes** | JavaScript |
| **Production apps with type safety** | TypeScript |
| **System automation & DevOps** | Shell |
| **Learning the API** | JavaScript (simpler syntax) |
| **Browser applications** | TypeScript (bundle with types) |
| **CI/CD integration** | Shell (minimal dependencies) |

## Prerequisites

- **Node.js 18+** (for built-in fetch, AbortController, etc.)
- **Venice AI SDK** installed via npm/yarn/pnpm
- **Venice API key** from [venice.ai](https://venice.ai/settings/api)

### Installation

```bash
# From the SDK root directory
cd examples/javascript

# Install dependencies (if not already done at root)
cd ../.. && npm install
```

## Quick Start

### 1. Setup Environment

Create a `.env` file with your API key:

```bash
# Option A: Copy the example
cp .env.example .env
# Then edit .env and add your key

# Option B: Create directly
echo 'VENICE_API_KEY=your-api-key-here' > .env

# Verify setup
node 00-setup-env.js
```

### 2. Run Your First Example

```bash
node 01-hello-world.js
```

That's it! The examples automatically load `.env` files.

## Examples

### 00 - Environment Setup
**Diagnostic tool for validating configuration**

```bash
node 00-setup-env.js
```

**What it does:**
- Searches for `.env` files in multiple locations
- Loads and validates `VENICE_API_KEY`
- Shows what's configured
- Provides setup guidance if missing

**Locations searched (in order):**
1. `examples/javascript/.env`
2. `examples/.env`
3. Project root `.env`

---

### 01 - Hello World
**Basic chat completion**

The simplest SDK usage—send a message, get a response.

```bash
node 01-hello-world.js
```

**What you'll learn:**
- SDK initialization with `new VeniceAI({ apiKey })`
- Creating basic chat completions
- Response parsing
- Error handling with try/catch

**Code snippet:**
```javascript
const { VeniceAI } = require('@venice-dev-tools/core');

const venice = new VeniceAI({ apiKey: process.env.VENICE_API_KEY });

const result = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Hello!' }]
});

console.log(result.choices[0].message.content);
```

---

### 02 - Streaming Chat
**Real-time token streaming**

Stream responses progressively using async iteration.

```bash
node 02-streaming-chat.js
```

**What you'll learn:**
- Enabling streaming with `stream: true`
- Using `for await...of` to iterate chunks
- Extracting delta content
- Real-time output with `process.stdout.write()`

**Code snippet:**
```javascript
const stream = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

---

### 05 - Image Generation
**Create images from text prompts**

Generate images and save them to disk.

```bash
# Default prompt
node 05-image-generation.js

# Custom prompt
node 05-image-generation.js "A cyberpunk city at night"

# Custom output file
node 05-image-generation.js "A serene forest" forest.png
```

**What you'll learn:**
- Image generation API
- Base64 decoding
- File I/O with Node.js
- Command-line argument handling

**Code snippet:**
```javascript
const response = await venice.images.generate({
  prompt: 'A mountain landscape',
  n: 1,
  size: '1024x1024',
  response_format: 'b64_json'
});

const imageBuffer = Buffer.from(response.data[0].b64_json, 'base64');
fs.writeFileSync('image.png', imageBuffer);
```

---

### 11 - Vision Multimodal
**Image analysis with AI vision models**

Analyze images with vision models using the SDK.

```bash
node 11-vision-multimodal.js photo.jpg
node 11-vision-multimodal.js photo.jpg "What colors do you see?"
```

**What you'll learn:**
- Vision model usage (`qwen-2.5-vl`)
- Image encoding to base64 data URLs
- Multimodal message structure (text + image)
- MIME type detection

**Code snippet:**
```javascript
const imageBuffer = fs.readFileSync('photo.jpg');
const base64Image = imageBuffer.toString('base64');
const dataURL = `data:image/jpeg;base64,${base64Image}`;

const result = await venice.chat.completions.create({
  model: 'qwen-2.5-vl',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Describe this image' },
      { type: 'image_url', image_url: { url: dataURL } }
    ]
  }]
});
```

---

### Legacy: Raw HTTP Vision Example

**Educational reference (not for production)**

`raw-http-vision-example.js` shows raw HTTP/curl usage without the SDK. Use this to understand what happens "under the hood," but prefer SDK-based examples for actual development.

---

## Shared Utilities

All examples use `utils.js`, a shared library providing:

### Environment Management
```javascript
const { loadEnv, requireEnv, getEnv } = require('./utils');

loadEnv();  // Auto-loads .env from multiple locations
const apiKey = requireEnv('VENICE_API_KEY');  // Exits with helpful message if missing
const model = getEnv('VENICE_MODEL', 'llama-3.3-70b');  // Optional with default
```

### Type Checking
```javascript
const { isAsyncIterable, isChatCompletionResponse } = require('./utils');

if (isAsyncIterable(result)) {
  // Handle streaming response
} else if (isChatCompletionResponse(result)) {
  // Handle non-streaming response
}
```

### Response Validation
```javascript
const { ensureChatCompletionResponse } = require('./utils');

// Throws helpful error if result is not a valid non-streaming response
const response = ensureChatCompletionResponse(result, 'chat completion');
```

### Error Formatting
```javascript
const { formatError } = require('./utils');

try {
  // SDK call
} catch (error) {
  formatError(error);  // Pretty, user-friendly error messages
  process.exit(1);
}
```

---

## JavaScript vs TypeScript

### What You Give Up (No TypeScript)
- ❌ Compile-time type checking
- ❌ IntelliSense/autocomplete (in some editors)
- ❌ Interface definitions
- ❌ Refactoring safety

### What You Gain (JavaScript)
- ✅ No build step—just run with `node`
- ✅ Simpler syntax (no type annotations)
- ✅ Faster iteration (no compilation)
- ✅ Easier for beginners
- ✅ Works everywhere Node.js runs

### The SDK Works in Both!

The SDK is written in TypeScript but compiles to JavaScript with `.d.ts` type definitions. This means:

```javascript
// JavaScript - works perfectly!
const { VeniceAI } = require('@venice-dev-tools/core');

// TypeScript - same import, with types
import { VeniceAI } from '@venice-dev-tools/core';
```

**Both get the exact same runtime code.**

---

## Best Practices

### 1. Always Use Environment Variables

```javascript
// ✅ Good
const venice = new VeniceAI({ 
  apiKey: process.env.VENICE_API_KEY 
});

// ❌ Bad - never hardcode
const venice = new VeniceAI({ 
  apiKey: 'sk-1234...' 
});
```

### 2. Handle Errors Gracefully

```javascript
// ✅ Good
try {
  const result = await venice.chat.completions.create({...});
} catch (error) {
  if (error.constructor.name === 'VeniceRateLimitError') {
    console.error('Rate limited, wait and retry');
  }
  throw error;
}

// ❌ Bad - silent failures
try {
  const result = await venice.chat.completions.create({...});
} catch (error) {
  // Nothing
}
```

### 3. Use Async/Await, Not Callbacks

```javascript
// ✅ Good - modern async/await
async function main() {
  const result = await venice.chat.completions.create({...});
  console.log(result);
}

// ❌ Bad - callback hell (old style)
venice.chat.completions.create({...}, (err, result) => {
  if (err) { /* ... */ }
  console.log(result);
});
```

### 4. Check Response Types

```javascript
// ✅ Good - validate response structure
const result = await venice.chat.completions.create({...});

if (isAsyncIterable(result)) {
  for await (const chunk of result) { /* ... */ }
} else {
  const response = ensureChatCompletionResponse(result);
  console.log(response.choices[0].message.content);
}

// ❌ Bad - assume structure
const content = result.choices[0].message.content;  // Might crash!
```

### 5. Use Utility Functions

```javascript
// ✅ Good - DRY with shared utilities
const { loadEnv, requireEnv, formatError } = require('./utils');

loadEnv();
const apiKey = requireEnv('VENICE_API_KEY');

// ❌ Bad - duplicate validation everywhere
if (!process.env.VENICE_API_KEY) {
  console.error('Missing API key');
  process.exit(1);
}
```

---

## Common Patterns

### Multi-turn Conversation

```javascript
const messages = [
  { role: 'user', content: 'What is 2+2?' }
];

const result1 = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages
});

messages.push({ role: 'assistant', content: result1.choices[0].message.content });
messages.push({ role: 'user', content: 'What is that number squared?' });

const result2 = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages
});
```

### Abort Streaming

```javascript
const controller = new AbortController();

setTimeout(() => controller.abort(), 5000);  // Cancel after 5 seconds

try {
  const stream = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [{...}],
    stream: true,
    signal: controller.signal
  });
  
  for await (const chunk of stream) {
    console.log(chunk);
  }
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Stream cancelled');
  }
}
```

### Retry with Backoff

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, i) * 1000;  // Exponential backoff
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

const result = await retryWithBackoff(() => 
  venice.chat.completions.create({...})
);
```

---

## Troubleshooting

### "Cannot find module '@venice-dev-tools/core'"

**Solution:**
```bash
# Clean install to re-run the postinstall linker
rm -rf node_modules package-lock.json
npm install

# pnpm users
pnpm install
```

> The installer now wires up the scoped `@venice-dev-tools/*` packages
> automatically. Reinstalling ensures those links are created.

### "VENICE_API_KEY environment variable is not set"

**Solution:**
```bash
# Create .env file
echo 'VENICE_API_KEY=your-key' > .env

# Or export directly
export VENICE_API_KEY='your-key'
```

### "Expected non-streaming response but got async iterable"

**Solution:**
```javascript
// Make sure stream is false or omitted
const result = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{...}],
  stream: false  // or just omit this line
});
```

### Streaming Not Working

**Solution:**
```javascript
// Ensure Node.js 18+ for async iteration support
// Check that you're actually iterating the stream:

const stream = await venice.chat.completions.create({
  stream: true,
  // ...
});

// ✅ Correct
for await (const chunk of stream) {
  console.log(chunk);
}

// ❌ Wrong
console.log(stream);  // Just prints object info
```

---

## Extending the Examples

Want to add your own example? Use this template:

```javascript
#!/usr/bin/env node

/**
 * Example Name - Brief Description
 * 
 * Detailed explanation...
 * 
 * Prerequisites:
 * - List prerequisites
 * 
 * Run with: node your-example.js
 */

const { VeniceAI } = require('@venice-dev-tools/core');
const { loadEnv, requireEnv, formatError } = require('./utils');

async function main() {
  loadEnv();
  
  const apiKey = requireEnv('VENICE_API_KEY');
  const venice = new VeniceAI({ apiKey });
  
  try {
    // Your code here
    
  } catch (error) {
    formatError(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
```

---

## Additional Resources

- **TypeScript Examples:** `../typescript/` - Full SDK features with types
- **Shell Examples:** `../shell/` - curl-based examples for DevOps
- **API Documentation:** https://docs.venice.ai
- **SDK Source:** See `../../venice-ai-sdk/`

---

*JavaScript: no build step, just pure async/await goodness.* 🚀
