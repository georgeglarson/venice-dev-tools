# Testing the Venice AI SDK

This playbook explains the available test suites, required environment variables, and best practices for validating contributions before publishing a calendar release.

---

## Environment variables

| Variable | Required | Purpose |
| --- | :---: | --- |
| `VENICE_API_KEY` | ✅ | Standard access key for chat, images, embeddings, and models. |
| `VENICE_ADMIN_API_KEY` | ⚠️ optional | Required for billing, API-key management, and certain workflow tests. |

Place your keys in `.env` (ignored by git) or export them for the session:

```bash
export VENICE_API_KEY="sk-..."
export VENICE_ADMIN_API_KEY="sk-admin..."  # optional
```

The integration test harness (`src/__integration__/test-setup.ts`) automatically loads `venice-ai-sdk/.env`.

---

## Test matrix

### 1. Unit tests (fast, offline)

```bash
pnpm -C venice-ai-sdk/packages/core test
```

- Exercises validators, configuration helpers, logging, and the rate limiter.
- Uses Vitest with the `__integration__` directory excluded.

### 2. Integration tests (live Venice API)

```bash
pnpm -C venice-ai-sdk/packages/core test:integration -- --runInBand --reporter=verbose
```

- Hits real Venice endpoints for chat, images, audio, embeddings, billing, keys, and workflow scenarios.
- Runs serially to avoid API throttling (`--runInBand`).
- Logs friendly messages when Venice skips features (for example, ArrayBuffer media responses or unavailable Web3 tokens).

### 3. Full recursive checks

```bash
pnpm test
```

- Executes every workspace’s `test` script (currently dominated by the core package).
- Useful for verifying that the root package scripts remain healthy.

---

## Handling flaky Venice endpoints

The public Venice API changes quickly and sometimes:

- Returns **ArrayBuffer** payloads instead of URLs for image and audio models.
- Temporarily declines **Web3 token** generation.
- Allows unauthenticated access to `models.list` (the SDK tests now assert that either a result or a structured error is returned).

Mitigation strategies embedded in the test suite:

- Conditional `expect`s that treat “success without auth error” as acceptable when Venice allows open endpoints.
- Informational console logs (`console.log('Skipping ...')`) instead of hard failures when the upstream service omits optional artefacts.
- Cleanup sections wrapped in `try/catch` so that re-running the suite does not fail when a key has already been revoked.

When adding new tests, follow the same philosophy: prefer logging + skip over hard failures unless the behaviour is essential to the SDK contract.

---

## Re-running targeted suites

Vitest filters let you focus on a specific file or test name:

```bash
pnpm -C venice-ai-sdk/packages/core vitest run src/__integration__/billing.integration.test.ts
pnpm -C venice-ai-sdk/packages/core vitest run "error handling"
```

Hot tip: use `PVITEST_POOL=threads` to parallelise unit test runs locally (`vitest` picks this up automatically), but keep the integration suite serialised to avoid Venice rate limits.

---

## CI/CD recommendations

- Cache `pnpm store` and `node_modules` between runs for reproducibility.
- Run unit tests on every PR; schedule the full integration matrix nightly or before tagging a release to respect Venice’s rate ceilings.
- Mask secret environment variables in your CI logs. The SDK only reads them at runtime; they never appear in the codebase.

---

Happy testing! If you encounter new upstream behaviours, document them in `docs/technical/` and update the suites so the community benefits from your findings.
