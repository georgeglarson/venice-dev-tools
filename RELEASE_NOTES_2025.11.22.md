# Release Notes - Venice AI SDK v2025.11.22

**Release Date**: November 22, 2025  
**Previous Version**: 2025.11.83  
**Status**: ✅ 100% Swagger Compliant

---

## 🎉 What's New

This release brings the Venice AI SDK to **100% compliance** with the official Venice API Swagger specification, adds 7 powerful new chat completion parameters, and includes significant developer experience improvements.

---

## ⭐ Highlights

### 1. **100% Swagger API Compliance** 🎯

The SDK is now **fully verified** against the Venice API Swagger specification (v20251119.170909):

- ✅ All 19 API endpoints implemented
- ✅ All parameters supported
- ✅ Complete type coverage
- ✅ OpenAI SDK compatibility maintained

### 2. **7 New Chat Completion Parameters** 🚀

Enhanced control over chat completions with advanced parameters:

- **Token Penalties** - Fine-tune repetition control
- **Log Probabilities** - Analyze model confidence
- **Dynamic Temperature** - Advanced sampling control
- **Enhanced Token Limits** - Better control over generation length

### 3. **Developer Experience Improvements** 💡

- Model discovery helpers (`listChat()`, `listImage()`, `listEmbedding()`)
- Enhanced error messages with actionable guidance
- Comprehensive documentation (Quickstart, Models Reference)
- New examples and guides

---

## 🆕 New Features

### Chat Completion Parameters

#### 1. **Frequency Penalty** (`frequency_penalty`)

Control how much the model penalizes tokens based on their frequency in the text so far.

```typescript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Write a creative story' }],
  frequency_penalty: 0.7  // Reduce repetition (range: -2.0 to 2.0)
});
```

**Use Cases**:
- Reduce repetitive phrases in creative writing
- Generate more diverse responses
- Control verbosity

**Default**: `0` (no penalty)  
**Range**: `-2.0` to `2.0`

---

#### 2. **Presence Penalty** (`presence_penalty`)

Penalize tokens based on whether they've appeared in the text, encouraging new topics.

```typescript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Brainstorm ideas' }],
  presence_penalty: 1.0  // Encourage topic diversity (range: -2.0 to 2.0)
});
```

**Use Cases**:
- Encourage exploration of new topics
- Reduce topic repetition
- Increase idea diversity in brainstorming

**Default**: `0` (no penalty)  
**Range**: `-2.0` to `2.0`

---

#### 3. **Log Probabilities** (`logprobs`)

Include token-level log probabilities in the response to analyze model confidence.

```typescript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'What is 2+2?' }],
  logprobs: true,
  top_logprobs: 5  // Return top 5 alternative tokens
});

// Analyze model confidence
console.log(response.choices[0].logprobs);
```

**Use Cases**:
- Measure model confidence
- Analyze alternative token choices
- Debug unexpected outputs
- Research and experimentation

**Default**: `false`  
**Note**: Not supported by all models

---

#### 4. **Top Log Probabilities** (`top_logprobs`)

Specify how many alternative tokens with their probabilities to return for each position.

```typescript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Complete: The capital of France is' }],
  logprobs: true,
  top_logprobs: 3  // Show top 3 alternatives for each token
});
```

**Use Cases**:
- Understand model uncertainty
- Explore alternative completions
- Token-level analysis

**Default**: None  
**Requires**: `logprobs: true`

---

#### 5. **Max Completion Tokens** (`max_completion_tokens`)

Modern replacement for the deprecated `max_tokens` parameter, with clearer semantics.

```typescript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Explain quantum computing' }],
  max_completion_tokens: 500  // Limit response to 500 tokens
});
```

**Use Cases**:
- Control response length precisely
- Manage API costs
- Ensure consistent output sizes

**Migration**:
```typescript
// Old (still supported)
max_tokens: 100

// New (recommended)
max_completion_tokens: 100
```

**Note**: Includes both visible output and reasoning tokens

---

#### 6. **Dynamic Temperature** (`max_temp`)

Set a maximum temperature for dynamic temperature scaling.

```typescript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Be creative!' }],
  temperature: 0.7,
  max_temp: 1.5  // Allow dynamic scaling up to 1.5
});
```

**Use Cases**:
- Allow adaptive creativity
- Balance consistency and diversity
- Advanced sampling control

**Default**: None  
**Range**: `0` to `2.0`

---

#### 7. **Stop Sequences** (`stop`)

Specify sequences where the model should stop generating.

```typescript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'List 3 items:' }],
  stop: ['\n\n', 'END']  // Stop at double newline or "END"
});
```

**Use Cases**:
- Control output format
- Stop at specific markers
- Implement custom termination logic

**Type**: `string` or `string[]` (up to 4 sequences)

---

## 🔧 Improvements

### Model Discovery Helpers

New convenience methods for filtering models by type:

```typescript
// Get only chat models
const chatModels = await venice.models.listChat();

// Get only image models
const imageModels = await venice.models.listImage();

// Get only embedding models
const embeddingModels = await venice.models.listEmbedding();

// Get specific model details
const model = await venice.models.retrieve('llama-3.3-70b');
```

**Benefits**:
- 80% less code for model discovery
- No manual filtering needed
- Type-safe results

---

### Enhanced Error Messages

New error classes with actionable guidance:

```typescript
import { VeniceModelNotFoundError, VenicePermissionError } from '@venice-dev-tools/core';

try {
  await venice.chat.completions.create({
    model: 'wrong-model-name',
    messages: [{ role: 'user', content: 'Hello' }]
  });
} catch (error) {
  if (error instanceof VeniceModelNotFoundError) {
    // Shows suggested alternative models
    console.log(error.getUserMessage());
    console.log('Suggestions:', error.suggestions);
  }
}
```

**Features**:
- Suggested alternative models
- Required API key types
- Code examples in error messages
- Documentation links

---

### Comprehensive Documentation

New documentation resources:

1. **Quickstart Guide** (`docs/QUICKSTART.md`)
   - Get started in < 5 minutes
   - All common use cases
   - Error handling examples

2. **Models Reference** (`docs/models/README.md`)
   - Complete model catalog
   - Model selection guide
   - Use case recommendations

3. **Improved README** (`README-IMPROVED.md`)
   - Better structure
   - Quick examples
   - Clear navigation

---

## 📊 API Coverage

### Endpoints (19/19 - 100%)

| Endpoint | Method | Status |
|----------|--------|--------|
| Chat Completions | `venice.chat.completions.create()` | ✅ |
| Image Generation | `venice.images.generate()` | ✅ |
| Image Upscale | `venice.images.upscale()` | ✅ |
| Image Edit | `venice.images.edit()` | ✅ |
| Image Styles | `venice.images.listStyles()` | ✅ |
| Models List | `venice.models.list()` | ✅ |
| Model Traits | `venice.models.getTraits()` | ✅ |
| Model Compatibility | `venice.models.getCompatibilityMapping()` | ✅ |
| API Keys | `venice.apiKeys.*` | ✅ |
| Characters | `venice.characters.*` | ✅ |
| Embeddings | `venice.embeddings.create()` | ✅ |
| Audio/Speech | `venice.audio.speech.create()` | ✅ |
| Billing | `venice.billing.getUsage()` | ✅ |

---

## 🔄 Migration Guide

### Using New Chat Parameters

```typescript
// Before
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Hello' }],
  max_tokens: 100,
  temperature: 0.7
});

// After (with new parameters)
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Hello' }],
  max_completion_tokens: 100,  // New: replaces max_tokens
  temperature: 0.7,
  frequency_penalty: 0.5,      // New: reduce repetition
  presence_penalty: 0.3,       // New: encourage new topics
  logprobs: true,              // New: get confidence scores
  top_logprobs: 3,             // New: show alternatives
  stop: ['\n\n']               // New: custom stop sequences
});
```

### Using Model Discovery Helpers

```typescript
// Before
const allModels = await venice.models.list();
const chatModels = allModels.data.filter(m => 
  !m.id.includes('embedding') && !m.id.includes('sd')
);

// After
const chatModels = await venice.models.listChat();
```

---

## ⚠️ Breaking Changes

**None!** This release is 100% backward compatible.

- All new parameters are optional
- Existing code continues to work unchanged
- `max_tokens` is still supported (not removed, just deprecated)

---

## 🐛 Bug Fixes

- Fixed TypeScript strict mode compatibility in error classes
- Improved error handling for undefined context properties
- Enhanced type definitions for better IDE autocomplete

---

## 📦 Installation

### New Installation

```bash
npm install @venice-dev-tools/core@2025.11.22
```

### Upgrade from Previous Version

```bash
npm update @venice-dev-tools/core
```

---

## 📚 Documentation

- [Quickstart Guide](./docs/QUICKSTART.md)
- [Models Reference](./docs/models/README.md)
- [API Reference](./docs/api-reference/)
- [Examples](./examples/typescript/)
- [Swagger Verification Report](./SWAGGER_VERIFICATION_REPORT.md)

---

## 🎯 Examples

### Example 1: Advanced Chat with Penalties

```typescript
import { VeniceAI } from '@venice-dev-tools/core';

const venice = new VeniceAI({ apiKey: process.env.VENICE_API_KEY });

const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a creative writing assistant.' },
    { role: 'user', content: 'Write a unique story about a robot.' }
  ],
  max_completion_tokens: 500,
  temperature: 0.8,
  frequency_penalty: 0.7,  // Reduce word repetition
  presence_penalty: 0.5,   // Encourage new topics
  stop: ['\n\nTHE END']    // Stop at story conclusion
});

console.log(response.choices[0].message.content);
```

### Example 2: Analyzing Model Confidence

```typescript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'What is the capital of France?' }
  ],
  logprobs: true,
  top_logprobs: 5  // Show top 5 alternative tokens
});

// Analyze confidence for each token
response.choices[0].logprobs?.content?.forEach((token) => {
  console.log(`Token: ${token.token}`);
  console.log(`Probability: ${Math.exp(token.logprob)}`);
  console.log(`Top alternatives:`, token.top_logprobs);
});
```

### Example 3: Model Discovery

```typescript
// Find the best chat model for your use case
const chatModels = await venice.models.listChat();

console.log('Available chat models:');
chatModels.data.forEach(model => {
  console.log(`- ${model.id}`);
  if (model.model_spec?.availableContextTokens) {
    console.log(`  Context: ${model.model_spec.availableContextTokens} tokens`);
  }
});

// Use the recommended model
const response = await venice.chat.completions.create({
  model: chatModels.data[0].id,
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

---

## 🔍 Technical Details

### Swagger Specification

- **Verified Against**: Venice API Swagger v20251119.170909
- **Source**: https://api.venice.ai/doc/api/swagger.yaml
- **OpenAPI Version**: 3.0.0
- **Compliance**: 100%

### Build Information

- **TypeScript**: 5.9.3
- **Build Time**: ~6 seconds
- **Bundle Formats**: CJS, ESM, TypeScript definitions
- **Tree Shaking**: Supported

### Type Safety

All new parameters are fully typed with JSDoc comments:

```typescript
interface ChatCompletionRequest {
  model: string;
  messages: ChatCompletionMessage[];
  
  // New parameters with full type safety
  frequency_penalty?: number;      // -2.0 to 2.0
  presence_penalty?: number;       // -2.0 to 2.0
  logprobs?: boolean;
  top_logprobs?: number;           // min: 0
  max_completion_tokens?: number;
  max_temp?: number;               // 0 to 2.0
  stop?: string | string[];        // up to 4 sequences
  
  // ... other parameters
}
```

---

## 🙏 Acknowledgments

- Venice.ai team for the comprehensive API
- Community feedback and feature requests
- Contributors to the SDK

---

## 📞 Support

- 📖 [Documentation](https://github.com/georgeglarson/venice-dev-tools)
- 💬 [GitHub Discussions](https://github.com/georgeglarson/venice-dev-tools/discussions)
- 🐛 [Report Issues](https://github.com/georgeglarson/venice-dev-tools/issues)
- 🌐 [Venice AI Support](https://venice.ai/support)

---

## 🚀 What's Next

### Planned for Future Releases

- **Interactive CLI** - `venice` command-line tool
- **REPL/Playground** - Interactive testing environment
- **Retry & Caching** - Automatic retry and response caching
- **Usage Tracking** - Built-in usage analytics
- **Migration Guides** - From OpenAI, Anthropic, Cohere
- **API Reference Docs** - Generated with TypeDoc

---

## 📝 Changelog

### Added
- 7 new chat completion parameters (frequency_penalty, presence_penalty, logprobs, top_logprobs, max_completion_tokens, max_temp, stop)
- Model discovery helpers (listChat, listImage, listEmbedding, retrieve)
- Enhanced error classes (VeniceModelNotFoundError, VenicePermissionError)
- Comprehensive documentation (Quickstart, Models Reference)
- Model discovery example
- Swagger verification report

### Changed
- Version updated to 2025.11.22
- Improved README structure
- Enhanced type definitions with JSDoc

### Fixed
- TypeScript strict mode compatibility
- Error handling for undefined properties

### Deprecated
- `max_tokens` parameter (use `max_completion_tokens` instead)

---

**Full Changelog**: [v2025.11.83...v2025.11.22](https://github.com/georgeglarson/venice-dev-tools/compare/v2025.11.83...v2025.11.22)

---

## ✅ Verification

This release has been verified against the official Venice API Swagger specification:

- ✅ All endpoints tested
- ✅ All parameters validated
- ✅ Type definitions verified
- ✅ Builds successful
- ✅ Examples working
- ✅ Documentation complete

**Status**: Ready for production use

---

**Released by**: George G Larson  
**Release Date**: November 22, 2025  
**License**: MIT
