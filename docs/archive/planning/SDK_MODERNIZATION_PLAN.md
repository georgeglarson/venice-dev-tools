# SDK Gap Analysis & Modernization Plan

## Current SDK State

### ✅ Implemented Endpoints
- `/chat/completions` - Chat (standard + streaming)
- `/images/generations` - Image generation
- `/images/upscale` - Image upscaling  
- `/images/styles` - Image styles
- `/models` - List models
- `/characters` - List characters
- `/keys` - API key management

### ❌ Missing Endpoints (High Priority)
- `/embeddings` - **NEW** Text embeddings
- `/audio/speech` - **NEW** Text-to-speech
- `/billing/usage` - **NEW** Usage tracking

### ⚠️ Partially Implemented
- Chat completions missing new params:
  - `logprobs` / `top_logprobs`
  - `max_completion_tokens` (replaces `max_tokens`)
  - `max_temp` (dynamic temperature)
  - `reasoning_content` in responses

## Implementation Plan

### Phase 1: Add Missing Endpoints (2-3 hours)

#### 1.1 Embeddings Endpoint
**Files to create:**
- `src/api/endpoints/embeddings/embeddings-endpoint.ts`
- `src/api/endpoints/embeddings/index.ts`
- `src/types/embeddings.ts`
- `src/api/endpoints/embeddings/embeddings-endpoint.test.ts`

**New types needed:**
```typescript
interface CreateEmbeddingRequest {
  input: string | string[];
  model?: string;
  encoding_format?: 'float' | 'base64';
  dimensions?: number;
  user?: string;
}

interface CreateEmbeddingResponse {
  object: 'list';
  data: Array<{
    object: 'embedding';
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}
```

#### 1.2 Audio/Speech Endpoint  
**Files to create:**
- `src/api/endpoints/audio/speech/audio-speech-endpoint.ts`
- `src/api/endpoints/audio/index.ts`
- `src/types/audio.ts`
- `src/api/endpoints/audio/speech/audio-speech-endpoint.test.ts`

**New types needed:**
```typescript
interface CreateSpeechRequest {
  model: string;
  input: string;
  voice: string;
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
  speed?: number;
}
```

#### 1.3 Billing/Usage Endpoint
**Files to create:**
- `src/api/endpoints/billing/usage-endpoint.ts`
- `src/api/endpoints/billing/index.ts`
- `src/types/billing.ts`
- `src/api/endpoints/billing/usage-endpoint.test.ts`

**New types needed:**
```typescript
interface GetBillingUsageRequest {
  currency?: 'USD' | 'VCU' | 'DIEM';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

interface BillingUsageResponse {
  data: BillingUsageEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Phase 2: Update Existing Types (1 hour)

#### 2.1 Update ChatCompletionRequest
**File:** `src/types/chat.ts`

Add new optional parameters:
```typescript
interface ChatCompletionRequest {
  // ... existing fields ...
  
  // NEW FIELDS:
  logprobs?: boolean;
  top_logprobs?: number;
  max_completion_tokens?: number;
  max_temp?: number;
  
  // DEPRECATED (keep for backwards compat):
  max_tokens?: number; // Use max_completion_tokens instead
}
```

#### 2.2 Update ChatCompletionResponse
Add logprobs support:
```typescript
interface ChatCompletionChoice {
  // ... existing fields ...
  logprobs?: {
    content: Array<{
      token: string;
      logprob: number;
      top_logprobs: Array<{
        token: string;
        logprob: number;
      }>;
    }>;
  } | null;
}
```

#### 2.3 Add Reasoning Content Support
```typescript
interface AssistantMessage {
  role: 'assistant';
  content: string | null;
  reasoning_content?: string | null; // NEW
  tool_calls?: ToolCall[] | null;
}
```

### Phase 3: Update Error Handling (30 min)

#### 3.1 Add New Error Types
**File:** `src/errors/types/payment-required-error.ts`

Update to handle DIEM/VCU:
```typescript
export class VenicePaymentRequiredError extends VeniceError {
  public readonly currency?: 'USD' | 'DIEM' | 'VCU';
  
  constructor(message: string, details?: any) {
    super(message, 402, details);
    this.name = 'VenicePaymentRequiredError';
    this.currency = details?.currency;
  }
}
```

### Phase 4: Add Examples & Docs (1 hour)

#### 4.1 Create Examples
- `examples/embeddings.ts`
- `examples/text-to-speech.ts`
- `examples/billing-usage.ts`
- `examples/reasoning-tokens.ts`
- `examples/log-probabilities.ts`

#### 4.2 Update README
- Document new endpoints
- Add currency migration guide (VCU → DIEM)
- Update pricing information

### Phase 5: Testing (1 hour)

#### 5.1 Unit Tests
- Embeddings endpoint tests
- Audio endpoint tests
- Billing endpoint tests
- Updated chat completion tests

#### 5.2 Integration Tests
- End-to-end embeddings test
- End-to-end audio test
- Error handling tests (402, 503)

## Priority Order

### Must Have (Before Release)
1. ✅ Add Embeddings endpoint
2. ✅ Add Audio/Speech endpoint  
3. ✅ Update chat completion types (new params)
4. ✅ Update error handling (402)

### Should Have
5. ✅ Add Billing/Usage endpoint
6. ✅ Add reasoning content support
7. ✅ Add log probabilities support
8. ✅ Update examples & docs

### Nice to Have
9. Add tool calling examples
10. Add migration scripts
11. Add cost estimation utilities

## Breaking Changes Assessment

### ⚠️ Potential Breaking Changes
None if we maintain backwards compatibility!

- Keep `max_tokens` (mark as deprecated)
- Add new fields as optional
- Existing code continues to work

### Migration Path
1. Update SDK to latest version
2. Start using `max_completion_tokens` instead of `max_tokens`
3. Optionally add new features (logprobs, reasoning, etc.)
4. No breaking changes for existing users!

## Estimated Effort

| Task | Time | Complexity |
|------|------|------------|
| Embeddings endpoint | 1h | Low |
| Audio endpoint | 1h | Low |
| Billing endpoint | 1h | Medium |
| Update chat types | 30m | Low |
| Update error handling | 30m | Low |
| Add tests | 1h | Medium |
| Documentation | 1h | Low |
| **TOTAL** | **6 hours** | - |

## Success Criteria

✅ All new endpoints implemented  
✅ All new parameters supported  
✅ Backwards compatible  
✅ Comprehensive tests (80%+ coverage)  
✅ Updated documentation  
✅ Working examples for each feature  

---

## Next Actions

1. Implement Embeddings endpoint
2. Implement Audio/Speech endpoint
3. Update chat completion types
4. Add comprehensive tests
5. Update documentation

**Ready to start implementation?**
