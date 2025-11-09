# Venice AI SDK Examples

Complete example suite demonstrating all features of the Venice AI SDK from beginner to advanced use cases.

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Venice AI API key ([get yours here](https://venice.ai/api))

### Installation

```bash
# Clone the repository
git clone https://github.com/georgeglarson/venice-dev-tools.git
cd venice-dev-tools

# Install dependencies
pnpm install

# Quick setup with script (interactive)
./scripts/setup-examples.sh

# OR manual setup
cp examples/.env.example examples/.env
# Edit examples/.env and add your API key
```

### Running Examples

**5-Minute Quickstart:**

```bash
# Start here for fastest path to success
cd examples/quickstart
cat README.md
```

**TypeScript Examples:**

```bash
# All TypeScript examples automatically load examples/.env

# Using tsx (recommended - works out of the box)
npx tsx examples/typescript/01-hello-world.ts

# Using Bun (alternative TypeScript runtime)
bun run examples/typescript/01-hello-world.ts
```

**JavaScript Examples:**

```bash
node examples/javascript/qwen-vision-example.js
```

**Shell Scripts:**

```bash
# Make executable
chmod +x examples/shell/venice-vision-stream-cli.sh

# Run
./examples/shell/venice-vision-stream-cli.sh
```

## Example Categories

### Quickstart

**New to the SDK? Start here:**

| Example | Description | Time |
|---------|-------------|------|
| [quickstart/](quickstart/README.md) | 5-minute getting started guide | 5 min |

The quickstart walks you through installation, setup, and your first API call with zero assumptions about prior knowledge.

### Beginner Examples

Perfect for getting started with the Venice AI SDK.

| Example | Description | Key Concepts |
|---------|-------------|--------------|
| [01-hello-world.ts](typescript/01-hello-world.ts) | Simplest possible SDK usage | Basic client initialization, text completion |
| [02-streaming-chat.ts](typescript/02-streaming-chat.ts) | Real-time streaming responses | Streaming API, async iteration |
| [03-error-handling.ts](typescript/03-error-handling.ts) | Comprehensive error handling | Try/catch, error types, recovery strategies |

### Core Features

Examples covering all major SDK capabilities.

| Example | Description | Key Concepts |
|---------|-------------|--------------|
| [04-configuration.ts](typescript/04-configuration.ts) | Advanced client configuration | Timeout, retry, rate limiting, logging |
| [05-image-generation.ts](typescript/05-image-generation.ts) | Text-to-image generation | Fluently XL, Flux Pro, image models |
| [06-image-upscaling.ts](typescript/06-image-upscaling.ts) | Image quality enhancement | Upscaling, image processing |
| [07-embeddings.ts](typescript/07-embeddings.ts) | Semantic search with embeddings | Vector embeddings, cosine similarity |
| [08-audio-speech.ts](typescript/08-audio-speech.ts) | Text-to-speech synthesis | Audio generation, voices |
| [09-models-list.ts](typescript/09-models-list.ts) | List and filter available models | Model discovery, capabilities |

### Advanced Examples

Production-ready patterns for experienced developers.

| Example | Description | Key Concepts |
|---------|-------------|--------------|
| [10-multi-turn-conversation.ts](typescript/10-multi-turn-conversation.ts) | Interactive chatbot with history | Message context, conversation state |
| [11-vision-multimodal.ts](typescript/11-vision-multimodal.ts) | Image analysis with vision models | Vision models, image URLs, multi-turn |
| [12-streaming-with-abort.ts](typescript/12-streaming-with-abort.ts) | Cancellable streaming requests | AbortController, cleanup, timeouts |
| [13-api-keys-management.ts](typescript/13-api-keys-management.ts) | Programmatic API key CRUD | Key management, metadata |
| [14-rate-limit-handling.ts](typescript/14-rate-limit-handling.ts) | Rate limit strategies | Queuing, backoff, batch processing |
| [15-custom-parameters.ts](typescript/15-custom-parameters.ts) | Venice-specific features | Web search, characters, parameters |

### Language-Specific Examples

Examples organized by language and runtime:

**JavaScript** (`examples/javascript/`)

| Example | Description |
|---------|-------------|
| [qwen-vision-example.js](javascript/qwen-vision-example.js) | Qwen vision model in JavaScript |

**Shell Scripts** (`examples/shell/`)

| Example | Description |
|---------|-------------|
| [qwen-vision-curl-example.sh](shell/qwen-vision-curl-example.sh) | Vision API via curl |
| [qwen-vision-curl.sh](shell/qwen-vision-curl.sh) | Qwen vision curl wrapper |
| [venice-vision-stream-cli.sh](shell/venice-vision-stream-cli.sh) | Streaming vision CLI |

## Environment Variables

All TypeScript examples automatically load `examples/.env`.

**Setup (one time):**

```bash
# Quick setup (interactive)
./scripts/setup-examples.sh

# OR manual setup
cp examples/.env.example examples/.env
nano examples/.env  # Edit with your API key
```

**Required:**

```bash
VENICE_API_KEY=your_api_key_here
```

**Optional:**

```bash
# Override default model
VENICE_MODEL=llama-3.3-70b

# Set log level (0=off, 1=info, 2=debug)
VENICE_LOG_LEVEL=1
```

**Never commit your `.env` file or hardcode API keys!**

## Common Use Cases

### Text Generation

```typescript
import { VeniceClient } from '@venice-dev-tools/core';

const client = new VeniceClient({ apiKey: process.env.VENICE_API_KEY });

const response = await client.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Hello!' }],
});

console.log(response.choices[0].message.content);
```

See: [01-hello-world.ts](typescript/01-hello-world.ts)

### Streaming Responses

```typescript
const stream = await client.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

See: [02-streaming-chat.ts](typescript/02-streaming-chat.ts)

### Image Generation

```typescript
const image = await client.images.generate({
  model: 'fluently-xl',
  prompt: 'A serene mountain landscape at sunset',
  width: 1024,
  height: 1024,
});

console.log('Image URL:', image.data[0].url);
```

See: [05-image-generation.ts](typescript/05-image-generation.ts)

### Vision / Multimodal

```typescript
const response = await client.chat.completions.create({
  model: 'llama-3.2-90b-vision',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'What do you see in this image?' },
      { type: 'image_url', image_url: { url: 'https://example.com/photo.jpg' } },
    ],
  }],
});
```

See: [11-vision-multimodal.ts](typescript/11-vision-multimodal.ts)

### Embeddings

```typescript
const response = await client.embeddings.create({
  model: 'text-embedding-004',
  input: 'The quick brown fox jumps over the lazy dog',
});

const vector = response.data[0].embedding;
console.log('Embedding dimensions:', vector.length);
```

See: [07-embeddings.ts](typescript/07-embeddings.ts)

### Text-to-Speech

```typescript
const audio = await client.audio.speech.create({
  model: 'musicgen-stereo-small',
  input: 'Hello, this is a test of the Venice AI text to speech system.',
  voice: 'alloy',
});

await fs.promises.writeFile('output.mp3', Buffer.from(await audio.arrayBuffer()));
```

See: [08-audio-speech.ts](typescript/08-audio-speech.ts)

## Error Handling

The SDK provides structured error types:

```typescript
import {
  VeniceAPIError,
  VeniceAuthenticationError,
  VeniceRateLimitError,
  VeniceValidationError,
  VeniceNetworkError,
} from '@venice-dev-tools/core';

try {
  const response = await client.chat.completions.create({ /* ... */ });
} catch (error) {
  if (error instanceof VeniceAuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof VeniceRateLimitError) {
    console.error('Rate limit exceeded, retry after:', error.retryAfter);
  } else if (error instanceof VeniceValidationError) {
    console.error('Invalid parameters:', error.message);
  } else if (error instanceof VeniceNetworkError) {
    console.error('Network error, retrying...');
  } else if (error instanceof VeniceAPIError) {
    console.error('API error:', error.statusCode, error.message);
  }
}
```

See: [03-error-handling.ts](typescript/03-error-handling.ts)

## Configuration Options

```typescript
const client = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY,
  
  // Timeout settings
  timeout: 60000, // 60 seconds
  
  // Retry configuration
  retry: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    retryableStatusCodes: [429, 500, 502, 503, 504],
    retryableErrorTypes: ['ECONNRESET', 'ETIMEDOUT'],
    jitter: true,
  },
  
  // Rate limiting
  rateLimit: {
    maxRequestsPerMinute: 60,
    maxConcurrentRequests: 5,
  },
  
  // Logging
  logLevel: 'info', // 'debug', 'info', 'warn', 'error', 'none'
});
```

See: [04-configuration.ts](typescript/04-configuration.ts)

## Troubleshooting

### "API key not found" Error

**Problem:** Missing or invalid API key

**Solution:**
```bash
# Check your .env file
cat examples/.env

# Verify the key is set
echo $VENICE_API_KEY

# Get a new key if needed
open https://venice.ai/api
```

### TypeScript Examples Not Running

**Problem:** `ts-node` or TypeScript not installed

**Solution:**
```bash
# Install ts-node globally
npm install -g ts-node typescript

# Or use Bun (recommended)
curl -fsSL https://bun.sh/install | bash
bun run examples/typescript/01-hello-world.ts
```

### Rate Limit Errors

**Problem:** Too many requests in a short time

**Solution:**
- Use the built-in rate limiter (see [04-configuration.ts](typescript/04-configuration.ts))
- Implement request queuing (see [14-rate-limit-handling.ts](typescript/14-rate-limit-handling.ts))
- Add delays between requests
- Upgrade your API plan for higher limits

### Network Timeouts

**Problem:** Requests timing out for large responses

**Solution:**
```typescript
const client = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY,
  timeout: 120000, // Increase to 120 seconds
});
```

### Import Errors

**Problem:** `Cannot find module '@venice-dev-tools/core'`

**Solution:**
```bash
# Reinstall to trigger the postinstall symlink fix
rm -rf node_modules package-lock.json
npm install

# Or with pnpm
pnpm install
```

> v2025.11.82+ automatically links the internal `@venice-dev-tools/*`
> packages during `npm install`, so a clean reinstall resolves the error.

### AbortController Not Working

**Problem:** Streams not cancelling

**Solution:**
- Ensure you're using Node.js 18+ (AbortController is built-in)
- Pass the signal correctly: `{ signal: controller.signal }`
- See [12-streaming-with-abort.ts](typescript/12-streaming-with-abort.ts) for proper implementation

## Best Practices

### 1. Always Use Environment Variables

```typescript
// ✅ Good
const client = new VeniceClient({ 
  apiKey: process.env.VENICE_API_KEY 
});

// ❌ Bad - never hardcode keys
const client = new VeniceClient({ 
  apiKey: 'sk-1234567890' 
});
```

### 2. Handle Errors Gracefully

```typescript
// ✅ Good - specific error handling
try {
  const response = await client.chat.completions.create({ /* ... */ });
} catch (error) {
  if (error instanceof VeniceRateLimitError) {
    await sleep(error.retryAfter * 1000);
    return retry();
  }
  throw error;
}

// ❌ Bad - swallowing all errors
try {
  const response = await client.chat.completions.create({ /* ... */ });
} catch (error) {
  console.log('Error occurred');
}
```

### 3. Use Streaming for Long Responses

```typescript
// ✅ Good - streaming for better UX
const stream = await client.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Write a long essay' }],
  stream: true,
});

// ❌ Bad - blocking for long responses
const response = await client.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Write a long essay' }],
});
```

### 4. Implement Proper Cleanup

```typescript
// ✅ Good - cleanup on exit
const controller = new AbortController();

process.on('SIGINT', () => {
  controller.abort();
  process.exit(0);
});

// ❌ Bad - no cleanup
const stream = await client.chat.completions.create({
  stream: true,
  /* ... */
});
```

### 5. Configure Retries for Production

```typescript
// ✅ Good - robust retry configuration
const client = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY,
  retry: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    jitter: true,
  },
});

// ❌ Bad - default retry may not suit production needs
const client = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY,
});
```

## Additional Resources

- [API Documentation](https://docs.venice.ai)
- [SDK Documentation](../docs/)
- [GitHub Repository](https://github.com/georgeglarson/venice-dev-tools)
- [Discord Community](https://discord.gg/venice-ai)
- [API Status](https://status.venice.ai)

## Support

- **Issues:** [GitHub Issues](https://github.com/georgeglarson/venice-dev-tools/issues)
- **Questions:** [GitHub Discussions](https://github.com/georgeglarson/venice-dev-tools/discussions)
- **Email:** support@venice.ai

## License

MIT License - see [LICENSE](../LICENSE) for details
