# Venice.ai API Changes Analysis (2025)

## API Version
**Current:** `20251027.130203`  
**Base URL:** `https://api.venice.ai/api/v1`

## Major Changes & New Features

### 1. **New Endpoints Added**
- ✅ **Embeddings** (`/embeddings`) - NEW!
  - Create embeddings for text
  - Model: `text-embedding-bge-m3`
  - Returns vector embeddings with usage stats

- ✅ **Audio/Speech** (`/audio/speech`) - NEW!
  - Text-to-speech synthesis
  - Multiple output formats: AAC, FLAC, MP3, Opus, PCM, WAV
  - 60+ multilingual voices

- ✅ **Billing/Usage** (`/billing/usage`) - NEW! (Beta)
  - Get paginated billing usage data
  - Filter by currency (USD, VCU, DIEM)
  - CSV export support
  - Detailed inference tracking

### 2. **Enhanced Chat Completions**
- ✅ **Reasoning tokens** - NEW!
  - `reasoning_content` field in messages
  - `max_completion_tokens` parameter
  - Better for reasoning models

- ✅ **Log probabilities** - NEW!
  - `logprobs` boolean parameter
  - `top_logprobs` integer for top N probabilities

- ✅ **Dynamic temperature** - NEW!
  - `max_temp` parameter (0-2)
  - Better control over randomness

- ✅ **Tool calling** enhanced
  - `tool_calls` in assistant messages
  - Tool message type added
  - Better function calling support

- ✅ **Vision support** enhanced
  - Image URLs in message content
  - Base64 encoded images supported
  - Multi-modal conversations

### 3. **Image Generation Updates**
- ✅ **New models available**
  - More style options
  - Better quality controls
  - Uncensored image generation

- ✅ **Image operations**
  - Generate
  - Upscale
  - Edit

### 4. **Currency & Billing Changes** ⚠️ IMPORTANT
- **New currency system:**
  - USD (US Dollars)
  - **DIEM** (new primary token) 
  - VCU (legacy, being phased out)

- **Cost tracking:**
  - Per-token pricing for LLMs
  - Per-unit pricing for images
  - Detailed usage analytics

### 5. **Characters Endpoint**
- ✅ Character-based completions
- ✅ Personality templates
- ✅ Custom character support

## Breaking Changes

### ⚠️ Deprecated Parameters
- `max_tokens` → Use `max_completion_tokens` instead

### ⚠️ Currency Migration
- VCU is legacy → DIEM is new standard
- Need to handle both during transition

### ⚠️ New Error Codes
- **402**: Insufficient balance (USD or DIEM)
- **503**: Model at capacity (retry with backoff)
- More granular error responses

## SDK Updates Needed

### High Priority
1. **Add Embeddings Endpoint**
   - `venice.embeddings.create()`
   - Support for text-embedding-bge-m3

2. **Add Audio/Speech Endpoint**
   - `venice.audio.speech.create()`
   - Multiple format support

3. **Update Chat Completions**
   - Add `logprobs`, `top_logprobs` parameters
   - Add `max_completion_tokens` parameter
   - Add `max_temp` for dynamic temperature
   - Support `reasoning_content` in responses

4. **Add Billing Endpoint**
   - `venice.billing.usage()`
   - CSV export support

5. **Update Error Handling**
   - Handle 402 (insufficient balance)
   - Better 503 (capacity) retry logic
   - Parse DetailedError schema

### Medium Priority
6. **Update Types**
   - Add new message types (tool messages)
   - Add reasoning_content fields
   - Add logprobs response types

7. **Update Models List**
   - Sync with latest available models
   - Add embedding models
   - Add audio models

8. **Update Documentation**
   - New endpoints
   - New parameters
   - Currency changes

## Current SDK Coverage

### ✅ Already Supported
- Chat completions (basic)
- Image generation
- Models listing
- Characters
- Streaming

### ❌ Missing (New Features)
- Embeddings
- Audio/Speech TTS
- Billing/Usage tracking
- Log probabilities
- Reasoning tokens
- Tool/function calling (enhanced)

## Recommended Action Plan

### Phase 1: Core Updates (Critical)
1. Add Embeddings endpoint + types + tests
2. Add Audio/Speech endpoint + types + tests
3. Update ChatCompletionRequest type with new params
4. Update error handling for 402/503

### Phase 2: Enhanced Features
5. Add Billing/Usage endpoint
6. Add log probabilities support
7. Add reasoning token support
8. Update tool calling implementation

### Phase 3: Documentation & Examples
9. Update all examples
10. Add migration guide (VCU → DIEM)
11. Add new feature examples
12. Update README

## Business Model Changes

### Old Model (circa 2024)
- Basic API access
- VCU tokens
- Limited features

### New Model (2025)
- **Privacy-first AI platform**
- **Multiple currencies**: USD, DIEM, VCU
- **Expanded capabilities**:
  - Text generation
  - Image generation (uncensored)
  - Audio synthesis (60+ voices)
  - Embeddings
  - Tool calling
- **Usage tracking & billing API**
- **Character-based AI**
- Focus on uncensored, private inference

## Key Differentiators
- **Privacy**: Zero data retention
- **Uncensored**: No content restrictions
- **Permissionless API**: Open access
- **Multi-modal**: Text, images, audio
- **Competitive pricing**: Token-based with DIEM

## Next Steps for SDK
1. Review and update all endpoint implementations
2. Add missing endpoints (Embeddings, Audio)
3. Update types for new parameters
4. Update tests for new features
5. Add examples for new capabilities
6. Document currency migration path
