# Venice AI SDK Monorepo

> Also on [Codeberg](https://codeberg.org/georgelarson/venice-dev-tools)

**Calendar-versioned TypeScript & JavaScript tooling for the Venice.ai platform.**

[![npm version](https://img.shields.io/npm/v/@venice-dev-tools/core?style=flat-square)](https://www.npmjs.com/package/@venice-dev-tools/core)
[![Node.js Version](https://img.shields.io/node/v/@venice-dev-tools/core?style=flat-square)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

---

## Install

```bash
# Core runtime (Node.js & browser)
pnpm add @venice-dev-tools/core

# Optional: Node CLI helpers
pnpm add @venice-dev-tools/node

# Optional: Web bundler entry
pnpm add @venice-dev-tools/web
```

## Quick Start

```typescript
import { VeniceAI } from '@venice-dev-tools/core';

const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY!,
});

// Chat completions
const completion = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Summarise Venice.ai in one sentence.' }]
});
console.log(completion.choices[0].message.content);

// Responses API (Alpha)
const response = await venice.responses.create({
  model: 'llama-3.3-70b',
  input: 'What is Venice.ai?',
});
console.log(response.output);

// Image generation
const image = await venice.images.generate({
  model: 'fluently-xl',
  prompt: 'A canal in Venice at sunset',
});

// Audio generation (queue-based)
const job = await venice.audio.queue.queue({
  model: 'elevenlabs-music',
  prompt: 'A calm piano melody',
});

// Video generation (queue-based)
const video = await venice.video.queue.queue({
  model: 'wan-2.5-preview-image-to-video',
  prompt: 'Commerce in Venice, Italy',
  duration: '5s',
  image_url: 'https://example.com/image.png',
});
```

Need an API key? Visit [venice.ai/settings/api](https://venice.ai/settings/api).

---

## Workspace Layout

```
.
├── venice-ai-sdk/
│   └── packages/
│       ├── core/       # Shared runtime, types, HTTP stack
│       ├── node/       # CLI tooling + Node helpers
│       └── web/        # Browser bundle entry
├── docs/               # Guides, technical notes, API schema
└── examples/           # End-to-end usage scripts
```

---

## Testing

```bash
# Unit tests (no network)
pnpm test

# Integration tests (requires VENICE_API_KEY)
pnpm test:integration

# Coverage
pnpm test:coverage
```

---

## Calendar Versioning

Releases follow `YYYY.M.D` format, tracking the Venice API on that date.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

[MIT](LICENSE)
