# Venice Dev Tools Monorepo

**Unofficial TypeScript / JavaScript SDK for the Venice.ai API**  
Current release: **v2025.11.5** (calendar version aligned with the 2025‑11‑05 Venice platform update).

---

## Packages in this workspace

| Package | npm | Purpose |
| --- | --- | --- |
| `@venice-dev-tools/core` | [![npm](https://img.shields.io/npm/v/@venice-dev-tools/core?style=flat-square)](https://www.npmjs.com/package/@venice-dev-tools/core) | Shared runtime, HTTP stack, typings, and endpoint registry that work in both Node.js and browser builds. |
| `@venice-dev-tools/node` | [![npm](https://img.shields.io/npm/v/@venice-dev-tools/node?style=flat-square)](https://www.npmjs.com/package/@venice-dev-tools/node) | Node-focused helpers and the `venice` CLI. |
| `@venice-dev-tools/web` | [![npm](https://img.shields.io/npm/v/@venice-dev-tools/web?style=flat-square)](https://www.npmjs.com/package/@venice-dev-tools/web) | Browser-friendly bundle entry that re-exports the core client. |

Each package ships the same calendar version so downstream users can map SDK behaviour to Venice API changelog entries at a glance.

---

## Quick start (Node.js)

```bash
pnpm add @venice-dev-tools/core
```

```ts
import { VeniceClient } from '@venice-dev-tools/core';

const venice = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY!,
  logLevel: 1 // INFO
});

const completion = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Explain the Venice AI API in one sentence.' }]
});

console.log(completion.choices[0].message.content);
```

Need a key? Visit [venice.ai/settings/api](https://venice.ai/settings/api) and export it:

```bash
export VENICE_API_KEY="sk-..."
```

> Installation tip: `npm install venice-dev-tools` now creates the internal
> `@venice-dev-tools/*` links automatically. If you previously worked around this
> manually, delete `node_modules` and reinstall to pick up the fix.
>
> Looking for web bundler or CLI usage? Start with the [Getting Started guide](../docs/guides/getting-started.md).

---

## Repository layout

```
venice-ai-sdk/
├── packages/
│   ├── core/        # Source of truth for HTTP, endpoints, types, tests
│   ├── node/        # CLI entry points, Node-specific helpers
│   └── web/         # Browser bundle wrapper
├── docs/            # Guides, technical notes, API research, legacy archive
├── examples/        # Scenario-based samples
└── tests/           # Legacy CLI smoke scripts
```

Active documentation lives under `docs/guides/` and `docs/technical/`. Long-form historical analyses and sunset plans are preserved in `docs/archive/`.

---

## Development workflow

```bash
# Install dependencies (requires pnpm 8+)
pnpm install

# Build every workspace
pnpm build

# Unit tests (no network access required)
pnpm -C packages/core test

# Integration matrix (requires VENICE_API_KEY + VENICE_ADMIN_API_KEY)
pnpm -C packages/core test:integration -- --runInBand

# Optional hygiene
pnpm lint
pnpm format
```

Integration suites degrade gracefully when Venice returns ArrayBuffers instead of URLs (image/audio) or when Web3 endpoints decline token generation. Watch the test output for informative `skipping ...` messages.

---

## Calendar versioning & release checklist

1. Update every `package.json` to the new calendar stamp (`YYYY.MM.D`).
2. Document the release in `venice-ai-sdk/CHANGELOG.md`.
3. Run `pnpm -r test` and the targeted integration commands above.
4. Tag the commit (`git tag vYYYY.MM.D`) and publish each workspace (`pnpm -r publish --filter ...`).

Hotfixes append an integer suffix (`2025.11.5-1`, `2025.11.5-2`, ...). We keep the latest two calendars in “active fix” status; older releases move to `docs/archive/` for posterity.

---

## Documentation index

- [Getting Started](../docs/guides/getting-started.md)
- [Testing Playbook](../docs/guides/testing.md)
- [Calendar Versioning FAQ](../docs/guides/calendar-versioning.md)
- [Technical Notes](../docs/technical/)
- [Venice API Research](../docs/venice-api/)

For coding standards, commit conventions, and security contacts, see the root [CONTRIBUTING.md](../CONTRIBUTING.md).
