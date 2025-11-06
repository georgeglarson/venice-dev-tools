# Venice AI SDK Monorepo

**Calendar-versioned TypeScript & JavaScript tooling for the Venice.ai platform.**  
Release `v2025.11.5` aligns with the Venice API updates published on **2025‑11‑05**.

[![npm version](https://img.shields.io/npm/v/@venice-dev-tools/core?style=flat-square)](https://www.npmjs.com/package/@venice-dev-tools/core)
[![Node.js Version](https://img.shields.io/node/v/@venice-dev-tools/core?style=flat-square)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square)](https://www.typescriptlang.org/)
[![CI Status](https://img.shields.io/github/actions/workflow/status/georgeglarson/venice-dev-tools/validate-examples.yml?style=flat-square&label=CI)](https://github.com/georgeglarson/venice-dev-tools/actions)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

---

## Why teams ship with this SDK

- **Full-stack coverage** – shared core package with dedicated Node.js and browser builds.
- **Production hardening** – rate limiting, retries, streaming, and granular logging out of the box.
- **Privacy-forward defaults** – client-side redaction helpers and zero-retention request pipeline.
- **Battle-tested** – 170+ automated unit, integration, and workflow tests executed against the live Venice API.
- **Docs that convert** – task-oriented guides, API references, and archived research for audits.

> **New:** Calendar versioning (`YYYY.MM.D`) keeps releases in step with Venice’s platform cadence. The `2025.11.5` tag represents the 2025‑11‑05 drop.

---

## Install in your project

```bash
# Core runtime (Node.js & browser friendly)
pnpm add @venice-dev-tools/core

# Optional: Node CLI helpers
pnpm add -D @venice-dev-tools/node

# Optional: Web bundler entry
pnpm add -D @venice-dev-tools/web
```

Minimal initialisation:

```typescript
import { VeniceClient } from '@venice-dev-tools/core';

const venice = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY!,
  logLevel: 1 // INFO
});

const completion = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Summarise Venice.ai in one sentence.' }]
});

console.log(completion.choices[0].message.content);
```

Need an API key? Visit [venice.ai/settings/api](https://venice.ai/settings/api), generate a token, and export it:  
`export VENICE_API_KEY="your-key"`

---

## Documentation map

- **Quickstarts & patterns:** `docs/guides/`
- **In-depth reference:** `docs/technical/`
- **Venice API field notes:** `docs/venice-api/`
- **Historical reports:** `docs/archive/` (testing analyses & legacy decision logs)

The package-level README files (`venice-ai-sdk/README.md`, `packages/*/README.md`) dive into environment-specific details.

---

## Calendar versioning & support policy

- Releases follow the format `YYYY.MM.D`.  
  Example: `2025.11.5` → 2025 (year) . 11 (month) . 5 (day).
- Each drop tracks the public Venice API behaviour on that date.  
  Breaking API changes trigger a new calendar release.
- We publish hotfixes as needed using an additional patch suffix (`2025.11.5-1`, `2025.11.5-2`, …).
- The previous two calendar releases remain in “active fix” status; older calendars are archived in `docs/archive/`.

---

## Workspace layout

```
.
├── package.json                # Monorepo metadata (calendar-versioned)
├── docs/
│   ├── archive/                # Legacy analyses & decision logs
│   ├── guides/                 # Task-first tutorials
│   ├── technical/              # Architecture & API reference
│   └── venice-api/             # Endpoint research & changelog diffs
├── examples/                   # End-to-end scripts by scenario
├── organized/                  # Curated request/response captures
├── tests/                      # CLI smoke suites for release validation
└── venice-ai-sdk/
    ├── packages/
    │   ├── core/               # Shared runtime, typings, and HTTP stack
    │   ├── node/               # CLI tooling + Node-flavoured helpers
    │   └── web/                # Browser-friendly bundle entry
    ├── bin/                    # CLI launcher
    ├── CHANGELOG.md            # Calendar release notes
    └── README.md               # Package-level usage guide
```

---

## Testing matrix

```bash
# Fast unit suite (no network calls)
pnpm -C venice-ai-sdk/packages/core test

# Core integration tests (require VENICE_API_KEY / VENICE_ADMIN_API_KEY)
pnpm -C venice-ai-sdk/packages/core test:integration

# Full workflow matrix with live Venice endpoints
pnpm -C venice-ai-sdk/packages/core vitest run src/__integration__/workflows.integration.test.ts
```

Integration suites will gracefully skip Web3 or media flows when the live API does not return usable assets—look for informative log lines in test output.

---

## Contributing

1. Fork & clone the repo.
2. Run `pnpm install` at the root.
3. Export `VENICE_API_KEY` (and `VENICE_ADMIN_API_KEY` for admin features).
4. Use `pnpm -r test` before opening a PR.

Please read the [contribution guidelines](CONTRIBUTING.md) for coding standards, commit conventions, and security disclosures.

---

## SEO-friendly quick answers

- **What is the Venice AI SDK?** A TypeScript/JavaScript client for the Venice.ai API with Node.js and browser targets.
- **Does it support streaming chat completions?** Yes—use `venice.chat.completions.createStream`.
- **How do I handle billing and usage?** Call `venice.billing.getUsage` and `venice.billing.exportCSV` with calendar-aware rate limiting baked in.
- **Where are past test plans?** Under `docs/archive/testing`.

Need something else? Open an issue or discuss it in your next PR.
