# Quickstart - Venice AI SDK

Get started with the Venice AI SDK in **under 5 minutes**.

## Installation

```bash
npm install @venice-dev-tools/core
```

## Hello World

Create a file `hello.js`:

```javascript
const { VeniceClient } = require('@venice-dev-tools/core');

// Initialize client
const client = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY  // Get yours at venice.ai/settings/api
});

// Make your first request
async function main() {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'Say hello in 3 languages!' }
    ]
  });

  console.log(response.choices[0].message.content);
}

main();
```

## Run It

```bash
export VENICE_API_KEY=your-api-key-here
node hello.js
```

## What's Next?

**Beginner?** Start with our TypeScript examples:
- `../typescript/01-hello-world.ts` - Simplest example
- `../typescript/02-streaming-chat.ts` - Real-time responses
- `../typescript/03-error-handling.ts` - Handle errors gracefully

**Need More?**
- [All Examples](../README.md) - Complete example list
- [Architecture Guide](../../docs/architecture.md) - How it works
- [API Reference](../../docs/api/) - Full API docs

## Common Patterns

### Streaming Responses

```javascript
const stream = await client.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

### With Middleware

```javascript
const { loggingMiddleware } = require('@venice-dev-tools/core/middleware');

client.use(loggingMiddleware(client.getLogger()));

// Now all requests are logged automatically
```

### Error Handling

```javascript
try {
  const response = await client.chat.completions.create({ /* ... */ });
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    console.log('Rate limited, retry after:', error.retryAfter);
  }
  console.error('Error:', error.message);
}
```

## Environment Variables

Create a `.env` file:

```bash
VENICE_API_KEY=your-key-here
VENICE_MODEL=llama-3.3-70b  # Optional: default model
```

## Get Help

- **Issues:** [GitHub Issues](https://github.com/georgeglarson/venice-dev-tools/issues)
- **Examples:** See `../typescript/` for 18 detailed examples
- **Docs:** Check `../../docs/` for guides

---

**That's it!** You're ready to build with Venice AI. 🚀
