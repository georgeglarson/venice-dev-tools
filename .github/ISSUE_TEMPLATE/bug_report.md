---
name: Bug Report
about: Report a bug or unexpected behavior in the Venice AI SDK
title: '[Bug] '
labels: ['bug', 'needs-triage']
assignees: ''
---

## Bug Description

<!-- A clear and concise description of the bug -->

## Steps to Reproduce

1. 
2. 
3. 

## Expected Behavior

<!-- What you expected to happen -->

## Actual Behavior

<!-- What actually happened -->

## Code Sample

```typescript
// Minimal code to reproduce the issue
import { VeniceClient } from '@venice-dev-tools/core';

const client = new VeniceClient({ apiKey: process.env.VENICE_API_KEY });

// Your code here
```

## Error Output

```
Paste any error messages or stack traces here
```

## Environment

- **SDK Version:** <!-- e.g., 2025.11.6 -->
- **Node.js Version:** <!-- Run: node --version -->
- **Runtime:** <!-- Node.js / Bun / Browser -->
- **Operating System:** <!-- e.g., macOS 14.0, Ubuntu 22.04, Windows 11 -->
- **Package Manager:** <!-- pnpm / npm / yarn / bun -->

## Additional Context

<!-- Any other information that might be relevant -->

## Checklist

- [ ] I have searched existing issues to ensure this isn't a duplicate
- [ ] I am using the latest SDK version (or have noted my version above)
- [ ] I have included a minimal code sample that reproduces the issue
- [ ] I have checked that my API key is valid and has appropriate permissions
