# Migration Guide

This guide helps you migrate to the latest version of the Venice AI SDK.

## Table of Contents

- [v2025.11.5 Migration (Latest)](#v202511-5-migration-latest)
- [Benefits of Upgrading](#benefits-of-upgrading)
- [Breaking Changes](#breaking-changes)
- [Deprecated APIs](#deprecated-apis)
- [New Features](#new-features)
- [Step-by-Step Migration](#step-by-step-migration)

## v2025.11.5 Migration (Latest)

### Overview

Version 2025.11.5 introduces OpenAI-compatible APIs, middleware system, enhanced streaming, and intelligent error handling while maintaining backward compatibility with existing code.

### Benefits of Upgrading

1. **OpenAI Compatibility** - Easy migration from OpenAI SDK
2. **Middleware System** - Request/response interception
3. **Enhanced Streaming** - 15+ stream helper utilities
4. **Error Recovery Hints** - Self-documenting errors
5. **ESM Support** - Modern module system with tree-shaking
6. **Better TypeScript** - Improved type safety and IntelliSense

### Breaking Changes

#### None! 🎉

All changes are backward compatible. Deprecated APIs continue to work with console warnings.

### Deprecated APIs

#### 1. Chat Completions

**Old API (Deprecated):**
```typescript
const response = await venice.chat.createCompletion({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

**New API (Recommended):**
```typescript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

**Migration:**
- Replace `chat.createCompletion()` with `chat.completions.create()`
- All parameters remain the same
- Returns the same response type

#### 2. Streaming Chat

**Old API (Deprecated):**
```typescript
const stream = venice.chatStream.streamCompletion({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Tell me a story' }],
});
```

**New API (Recommended):**
```typescript
const stream = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,  // Add stream: true
});
```

**Migration:**
- Replace `chatStream.streamCompletion()` with `chat.completions.create({ stream: true })`
- Add `stream: true` to request options
- Stream iteration remains the same

#### 3. Image Endpoint Access

**Old API (Deprecated):**
```typescript
const image = await venice.imageGeneration.generate({ ... });
const upscaled = await venice.imageUpscale.upscale({ ... });
const styles = await venice.imageStyles.listStyles();
```

**New API (Recommended):**
```typescript
const image = await venice.images.generate({ ... });
const upscaled = await venice.images.upscale({ ... });
const styles = await venice.images.listStyles();
```

**Migration:**
- Replace `imageGeneration` with `images`
- Replace `imageUpscale` with `images`
- Replace `imageStyles` with `images`
- All method names remain the same

### New Features

#### 1. Middleware System

Add request/response interception:

```typescript
import { loggingMiddleware, timingMiddleware } from '@venice/core/middleware';

const client = new VeniceClient({ apiKey: process.env.VENICE_API_KEY });

// Add logging
client.use(loggingMiddleware(client.getLogger(), {
  logHeaders: true,
  logResponse: false,
}));

// Add timing
client.use(timingMiddleware());

// Custom middleware
client.use({
  name: 'custom',
  onRequest: (ctx) => {
    ctx.options.headers['X-Custom'] = 'value';
    return ctx;
  },
});
```

#### 2. Enhanced Streaming Utilities

Process streams with functional utilities:

```typescript
import {
  collectStream,
  mapStream,
  filterStream,
  takeStream,
  textOnlyStream,
} from '@venice/core/utils';

// Collect entire stream
const fullText = await collectStream(stream);

// Transform stream
const upperStream = mapStream(textOnlyStream(stream), text => text.toUpperCase());

// Complex pipeline
const pipeline = takeStream(
  filterStream(
    mapStream(stream, transform),
    predicate
  ),
  10
);
```

#### 3. Error Recovery Hints

Intelligent error handling:

```typescript
try {
  const response = await client.chat.completions.create({ ... });
} catch (error) {
  if (error instanceof VeniceRateLimitError) {
    console.log('Error code:', error.code); // 'RATE_LIMIT_EXCEEDED'
    console.log('Retry after:', error.retryAfter, 'seconds');
    
    // Get recovery hints
    error.recoveryHints.forEach(hint => {
      console.log(`- ${hint.description}`);
      if (hint.code) {
        console.log(`  Code: ${hint.code}`);
      }
      if (hint.automated) {
        console.log('  ✅ Can be automated');
      }
    });
  }
}
```

#### 4. ESM Support

Modern module imports:

```typescript
// ESM
import { VeniceClient } from '@venice/core';

// Tree-shakeable subpaths
import { loggingMiddleware } from '@venice/core/middleware';
import { VeniceAuthError } from '@venice/core/errors';
import { collectStream } from '@venice/core/utils';
```

#### 5. Retry Configuration

Built-in retry with exponential backoff:

```typescript
const client = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY,
  retry: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    retryableStatusCodes: [429, 500, 502, 503, 504],
    retryableErrorTypes: ['ECONNRESET', 'ETIMEDOUT'],
    jitter: true,
  },
});
```

## Step-by-Step Migration

### Step 1: Update Package

```bash
npm install @venice/ai@latest
# or
pnpm update @venice-dev-tools/core
```

### Step 2: Update Imports (Optional for ESM)

**Before:**
```typescript
const VeniceAI = require('@venice/ai');
```

**After (ESM):**
```typescript
import { VeniceClient } from '@venice/core';
```

**After (CJS - still supported):**
```typescript
const { VeniceClient } = require('@venice/core');
```

### Step 3: Update Chat API Calls

**Search and replace:**
```typescript
// Find: venice.chat.createCompletion(
// Replace: venice.chat.completions.create(

// Find: venice.chatStream.streamCompletion(
// Replace: venice.chat.completions.create(
// And add: stream: true
```

### Step 4: Update Image Endpoint Access

**Search and replace:**
```typescript
// Find: venice.imageGeneration.
// Replace: venice.images.

// Find: venice.imageUpscale.
// Replace: venice.images.

// Find: venice.imageStyles.
// Replace: venice.images.
```

### Step 5: Test Your Code

```bash
npm test
```

Check console for deprecation warnings and update accordingly.

### Step 6: Add New Features (Optional)

#### Add Middleware
```typescript
import { loggingMiddleware } from '@venice/core/middleware';
client.use(loggingMiddleware(client.getLogger()));
```

#### Use Stream Helpers
```typescript
import { collectStream } from '@venice/core/utils';
const fullText = await collectStream(stream);
```

#### Handle Errors Better
```typescript
if (error instanceof VeniceRateLimitError) {
  console.log('Recovery hints:', error.recoveryHints);
}
```

## Common Migration Scenarios

### Scenario 1: OpenAI SDK Migration

**From OpenAI SDK:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

**To Venice SDK:**
```typescript
import { VeniceClient } from '@venice/core';

const venice = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY,
});

const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',  // Different model
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

**Changes:**
1. Replace `OpenAI` with `VeniceClient`
2. Update model name
3. Everything else is identical!

### Scenario 2: Adding Retry Logic

**Before:**
```typescript
async function makeRequestWithRetry() {
  for (let i = 0; i < 3; i++) {
    try {
      return await venice.chat.createCompletion({ ... });
    } catch (error) {
      if (i === 2) throw error;
      await sleep(1000 * Math.pow(2, i));
    }
  }
}
```

**After:**
```typescript
// Built-in retry
const client = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY,
  retry: {
    maxRetries: 3,
    initialDelayMs: 1000,
    backoffMultiplier: 2,
  },
});

// Just make the request - retries automatically
const response = await client.chat.completions.create({ ... });
```

### Scenario 3: Adding Request Logging

**Before:**
```typescript
async function loggedRequest() {
  console.log('Making request...');
  const start = Date.now();
  try {
    const response = await venice.chat.createCompletion({ ... });
    console.log(`Success in ${Date.now() - start}ms`);
    return response;
  } catch (error) {
    console.error(`Failed in ${Date.now() - start}ms:`, error);
    throw error;
  }
}
```

**After:**
```typescript
import { loggingMiddleware, timingMiddleware } from '@venice/core/middleware';

client
  .use(loggingMiddleware(client.getLogger()))
  .use(timingMiddleware());

// All requests automatically logged
const response = await client.chat.completions.create({ ... });
```

### Scenario 4: Stream Processing

**Before:**
```typescript
const stream = venice.chatStream.streamCompletion({ ... });
const chunks = [];
for await (const chunk of stream) {
  const content = chunk.choices?.[0]?.delta?.content || '';
  chunks.push(content);
}
const fullText = chunks.join('');
```

**After:**
```typescript
import { collectStream } from '@venice/core/utils';

const stream = await venice.chat.completions.create({ ..., stream: true });
const fullText = await collectStream(stream);
```

## Troubleshooting

### "Property 'completions' does not exist"

**Cause:** Using old import or TypeScript version

**Solution:**
```bash
npm install @venice/core@latest typescript@latest
```

### Deprecation Warnings in Console

**Cause:** Using old API methods

**Solution:** Follow the warnings' suggestions:
```
[Venice AI SDK] Warning: chat.createCompletion() is deprecated. 
Use chat.completions.create() instead.
```

### Import Errors with ESM

**Cause:** Incorrect import syntax

**Solution:**
```typescript
// ✅ Correct
import { VeniceClient } from '@venice/core';

// ❌ Incorrect
import VeniceClient from '@venice/core';
```

### Type Errors After Update

**Cause:** Cached TypeScript definitions

**Solution:**
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
rm -rf dist
npm install
```

## Getting Help

- **Examples:** See [examples/README.md](../examples/README.md)
- **Architecture:** See [docs/architecture.md](./architecture.md)
- **Issues:** [GitHub Issues](https://github.com/venice-ai/sdk/issues)
- **Discord:** [Venice AI Community](https://discord.gg/venice-ai)

## Feedback

We'd love to hear about your migration experience! Please:

1. Report issues on GitHub
2. Share success stories in Discord
3. Suggest improvements via pull requests

Thank you for using the Venice AI SDK! 🚀
