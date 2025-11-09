# Getting Started with the Venice AI SDK

This guide walks you from a blank project to your first successful Venice.ai API call using the **@venice-dev-tools** packages. It applies to both Node.js servers and browser apps bundled with tools such as Vite, Next.js, or Webpack.

---

## 1. Prerequisites

- **Node.js 18+** (for local development and the CLI)
- **pnpm 8+** (recommended; npm and yarn also work)
- A **Venice API key** from [venice.ai/settings/api](https://venice.ai/settings/api)
- Optional: an **admin key** for billing and API-key management endpoints

Export your key(s) for the current shell session:

```bash
export VENICE_API_KEY="sk-your-key"
export VENICE_ADMIN_API_KEY="sk-your-admin-key"  # optional
```

> Tip: Add the exports to your shell profile or use a tool like direnv so your projects always load the keys locally.

---

## 2. Install the packages

```bash
pnpm add @venice-dev-tools/core
```

For CLI tooling or Node-only helpers add:

```bash
pnpm add -D @venice-dev-tools/node
```

Bundling for the browser? The web package re-exports the core SDK but ships a tree-shakeable entrypoint:

```bash
pnpm add -D @venice-dev-tools/web
```

---

## 3. Create a client instance

```ts
// src/venice.ts
import { VeniceAI } from '@venice-dev-tools/core';

export const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY!,
  timeout: 30_000,
  logLevel: 1 // INFO
});
```

> **Note:** `VeniceAI` is the recommended high-level client that provides full access to all endpoints. For lower-level HTTP control, use `VeniceClient`.

The client exposes namespaces for chat, images, embeddings, audio, billing, models, keys, and more. Each namespace mirrors Venice.ai endpoint names (for example `venice.chat.completions.create`, `venice.billing.getUsage`).

---

## 4. Make your first request

```ts
import { venice } from './venice';

const completion = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Summarise how Venice.ai protects user privacy.' }
  ]
});

console.log(completion.choices[0].message.content);
```

### Handling streaming responses

```ts
const stream = await venice.chat.completions.createStream({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Count from one to five.' }]
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
}
```

### Working with images

```ts
const image = await venice.imageGeneration.generate({
  model: 'hidream',
  prompt: 'A minimal Venice sunset poster',
  width: 1024,
  height: 1024
});

if (typeof image.data === 'string') {
  console.log('Image URL:', image.data);
} else {
  console.log('Binary payload received (ArrayBuffer)');
}
```

The live API may respond with either URLs or ArrayBuffers for media; plan to support both.

---

## 5. Configure logging & retries

```ts
import { VeniceAI, LogLevel } from '@venice-dev-tools/core';

const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY!,
  logLevel: LogLevel.DEBUG,
  maxConcurrent: 5,
  requestsPerMinute: 60
});
```

The SDK ships a smart rate limiter (`requestsPerMinute`, `maxConcurrent`) and an exponential backoff retry helper (`utils/retry`) for transient failures. Use DEBUG only while developing; production workloads typically run at INFO.

---

## 6. Validate your setup with tests

Run the unit suite:

```bash
pnpm -C venice-ai-sdk/packages/core test
```

Integration tests talk to the real Venice API:

```bash
pnpm -C venice-ai-sdk/packages/core test:integration -- --runInBand
```

Expect graceful skips when Venice returns ArrayBuffers for media or when Web3 endpoints require extra permissions.

See the [Testing Playbook](./testing.md) for a breakdown of all scripts.

---

## 7. Explore advanced workflows

- **API key management** – `venice.keys.list()`, `venice.keys.create({...})`, `venice.billing.getUsage()`
- **Multimodal prompts** – pass `ContentItem[]` with `text` and `image_url` entries to chat completions
- **Audio pipelines** – `venice.audio.speech.create` for TTS, integrate with your storage solution when the API returns binary payloads
- **Streaming** – both chat and image endpoints provide streaming variants for near-real-time updates

For deeper coverage read the technical notes in `docs/technical/` or the API research snapshots in `docs/venice-api/`.

---

## 8. Ship it

1. Pin the calendar version that matches the Venice API behaviour you tested (`package.json` → `2025.11.82`).
2. Capture any non-default environment variables in your deployment configuration.
3. Monitor rate-limit headers (`x-ratelimit-limit-requests`, `x-ratelimit-remaining-requests`) to adapt concurrency.
4. Follow Venice.ai’s published changelog and upgrade only when ready—each SDK release documents the API surface it was validated against.

Need more? Join the discussion via issues or pull requests in the main repository. We keep the SDK transparent so Venice adopters can iterate quickly.
