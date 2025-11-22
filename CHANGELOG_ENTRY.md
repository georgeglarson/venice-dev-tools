# Changelog Entry for v2025.11.22

Add this to your CHANGELOG.md file:

---

## [2025.11.22] - 2025-11-22

### 🎉 Highlights
- **100% Swagger API Compliance** - Verified against Venice API Swagger v20251119.170909
- **7 New Chat Parameters** - Enhanced control over chat completions
- **Developer Experience** - Model discovery helpers and enhanced error messages

### Added
- **Chat Completion Parameters**:
  - `frequency_penalty` - Penalize token repetition (-2.0 to 2.0)
  - `presence_penalty` - Encourage topic diversity (-2.0 to 2.0)
  - `logprobs` - Include log probabilities in response
  - `top_logprobs` - Number of top probability tokens to return
  - `max_completion_tokens` - Modern replacement for `max_tokens`
  - `max_temp` - Dynamic temperature scaling (0 to 2.0)
  - `stop` - Custom stop sequences (string or array)

- **Model Discovery Helpers**:
  - `venice.models.listChat()` - Filter chat/LLM models
  - `venice.models.listImage()` - Filter image generation models
  - `venice.models.listEmbedding()` - Filter embedding models
  - `venice.models.retrieve(id)` - Get specific model details

- **Enhanced Error Classes**:
  - `VeniceModelNotFoundError` - With model suggestions
  - `VenicePermissionError` - With required key type guidance

- **Documentation**:
  - Quickstart guide (`docs/QUICKSTART.md`)
  - Models reference (`docs/models/README.md`)
  - Improved main README (`README-IMPROVED.md`)
  - Model discovery example (`examples/typescript/19-model-discovery.ts`)
  - Swagger verification report

### Changed
- Version updated from 2025.11.83 to 2025.11.22
- Enhanced `ChatCompletionRequest` type with new parameters
- Improved error messages with actionable guidance
- Updated all package.json files across monorepo

### Fixed
- TypeScript strict mode compatibility in error classes
- Error handling for undefined context properties
- Type definitions for better IDE autocomplete

### Deprecated
- `max_tokens` parameter (use `max_completion_tokens` instead)
  - Note: Still supported for backward compatibility

### Technical
- **Swagger Compliance**: 100% (19/19 endpoints)
- **Build Status**: All passing (CJS, ESM, DTS)
- **TypeScript**: 5.9.3
- **OpenAPI Version**: 3.0.0

### Migration Notes
All changes are backward compatible. New parameters are optional. Existing code continues to work without modifications.

```typescript
// Example: Using new parameters (all optional)
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Hello' }],
  max_completion_tokens: 100,  // New: replaces max_tokens
  frequency_penalty: 0.5,      // New: reduce repetition
  presence_penalty: 0.3,       // New: encourage diversity
  logprobs: true,              // New: get confidence scores
  top_logprobs: 5,             // New: show alternatives
  stop: ['\n\n']               // New: custom stop sequences
});
```

---

## [2025.11.83] - 2025-11-08

Previous release...
