# Venice AI SDK Architecture

This document describes the architecture and design decisions of the Venice AI SDK.

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Project Structure](#project-structure)
4. [Key Components](#key-components)
5. [Request Flow](#request-flow)
6. [Extension Points](#extension-points)
7. [Design Patterns](#design-patterns)
8. [Performance Considerations](#performance-considerations)

## Overview

The Venice AI SDK is a TypeScript-first SDK for interacting with the Venice AI API. It provides:

- **OpenAI-compatible API** for easy migration
- **Middleware system** for request/response interception
- **Streaming utilities** for advanced stream processing
- **Error recovery hints** for intelligent error handling
- **Type safety** with 81+ TypeScript type definitions
- **Tree-shakeable** builds (ESM + CJS)
- **Calendar versioning** aligned with API releases

## Core Principles

### 1. Developer Experience First

The SDK prioritizes ease of use:

```typescript
// Simple hello world
const client = new VeniceClient({ apiKey: process.env.VENICE_API_KEY });
const response = await client.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### 2. Type Safety

All public APIs are fully typed with TypeScript:

- 81+ type definitions
- Full IntelliSense support
- Compile-time error checking
- Generic type parameters for flexibility

### 3. Backward Compatibility

Deprecated APIs remain functional with warnings:

```typescript
// Old API (deprecated but works)
client.chat.createCompletion({ ... });

// New API (recommended)
client.chat.completions.create({ ... });
```

### 4. Extensibility

Multiple extension points:

- **Middleware**: Request/response interception
- **Endpoint Registry**: Custom endpoint registration
- **Event System**: Subscribe to SDK events
- **Validators**: Custom validation logic

## Project Structure

```
venice-ai-sdk/
├── packages/
│   └── core/                    # Core SDK package
│       ├── src/
│       │   ├── api/             # API endpoints
│       │   │   ├── endpoints/   # Endpoint implementations
│       │   │   │   ├── chat/    # Chat completions
│       │   │   │   ├── images/  # Image generation
│       │   │   │   ├── audio/   # Text-to-speech
│       │   │   │   ├── models/  # Model listing
│       │   │   │   └── ...      # Other endpoints
│       │   │   └── registry/    # Endpoint registration
│       │   ├── client.ts        # Base client
│       │   ├── config/          # Configuration management
│       │   ├── errors/          # Error types
│       │   ├── events/          # Event system
│       │   ├── http/            # HTTP clients
│       │   ├── middleware/      # Middleware system
│       │   ├── types/           # TypeScript types
│       │   ├── utils/           # Utilities
│       │   └── venice-ai.ts     # Main client
│       ├── dist/                # Built files (CJS + ESM)
│       └── package.json
└── examples/                    # Example code
    ├── typescript/              # TypeScript examples
    └── README.md                # Examples guide
```

## Key Components

### VeniceClient (Base Class)

The foundation of the SDK:

```typescript
export class VeniceClient {
  protected configManager: ConfigManager;
  protected eventManager: EventManager;
  protected httpClientFactory: HttpClientFactory;
  protected standardHttpClient: StandardHttpClient;
  protected streamingHttpClient: StreamingHttpClient;
  protected rateLimiter: RateLimiter;
  protected logger: Logger;
}
```

**Responsibilities:**
- Configuration management
- HTTP client initialization
- Event emission
- Rate limiting
- Logging

### VeniceAI (Main Client)

Extends `VeniceClient` with endpoint access:

```typescript
export class VeniceAI extends VeniceClient {
  private endpointManager: EndpointManager;
  
  public get chat(): ChatEndpoint { ... }
  public get images(): ImagesEndpoint { ... }
  // ... other endpoints
}
```

**Responsibilities:**
- Endpoint registration
- Public API surface
- Endpoint access methods

### Endpoint Registry

Dynamic endpoint management:

```typescript
class EndpointManager {
  register(name: string, EndpointClass: any): this;
  get<T>(name: string): T;
  getRegisteredEndpoints(): string[];
}
```

**Pattern:** Registry pattern for extensibility

### HTTP Clients

Two specialized clients:

1. **StandardHttpClient**: Regular requests
   - Middleware execution
   - Rate limiting
   - Retry logic
   - Error handling

2. **StreamingHttpClient**: Streaming requests
   - SSE parsing
   - Stream management
   - Chunk processing

### Middleware System

Request/response/error interception:

```typescript
interface Middleware {
  name?: string;
  onRequest?: (ctx: MiddlewareRequestContext) => Promise<MiddlewareRequestContext>;
  onResponse?: (ctx: MiddlewareResponseContext) => Promise<MiddlewareResponseContext>;
  onError?: (ctx: MiddlewareErrorContext) => Promise<void>;
}
```

**Execution order:**
1. Request middleware (modify request)
2. HTTP request
3. Response middleware (modify response) OR Error middleware (handle errors)

### Error System

Hierarchical error types with recovery hints:

```
VeniceError (base)
├── VeniceAPIError
│   ├── VeniceAuthError (401)
│   ├── VeniceRateLimitError (429)
│   └── ...
├── VeniceValidationError
├── VeniceNetworkError
└── ...
```

Each error includes:
- Machine-readable `code`
- Human-readable `message`
- Recovery hints (`RecoveryHint[]`)
- Context data

## Request Flow

### Standard Request

```
User Code
  ↓
venice.chat.completions.create()
  ↓
ChatEndpoint._create()
  ↓
StandardHttpClient.request()
  ↓
┌─────────────────────────┐
│ Middleware: onRequest   │ (modify request)
└─────────────────────────┘
  ↓
RateLimiter.add()
  ↓
axios.request()
  ↓
┌─────────────────────────┐
│ Middleware: onResponse  │ (modify response)
└─────────────────────────┘
  ↓
Return to user
```

### Streaming Request

```
User Code
  ↓
venice.chat.completions.create({ stream: true })
  ↓
ChatEndpoint._stream()
  ↓
StreamingHttpClient.stream()
  ↓
RateLimiter.add()
  ↓
axios.request() → ReadableStream
  ↓
parseSSEStream()
  ↓
for await (const chunk of stream)
  ↓
Yield to user
```

## Extension Points

### 1. Custom Middleware

```typescript
const customMiddleware: Middleware = {
  name: 'my-middleware',
  onRequest: async (ctx) => {
    // Modify request
    ctx.options.headers['X-Custom'] = 'value';
    return ctx;
  },
  onResponse: async (ctx) => {
    // Modify response
    console.log('Response received in', ctx.duration, 'ms');
    return ctx;
  },
};

client.use(customMiddleware);
```

### 2. Custom Endpoints

```typescript
class CustomEndpoint extends ApiEndpoint {
  getEndpointPath(): string {
    return '/custom';
  }
  
  public async doSomething() {
    return this.http.get(this.getPath('/action'));
  }
}

venice.registerEndpoint('custom', CustomEndpoint);
const custom = venice.endpoint<CustomEndpoint>('custom');
```

### 3. Event Subscribers

```typescript
client.on('request', (event) => {
  console.log('Request:', event.type, event.data);
});

client.on('response', (event) => {
  console.log('Response:', event.type, event.data);
});
```

### 4. Custom Validators

```typescript
class CustomValidator extends BaseValidator {
  public validateCustomRequest(request: any): void {
    this.validateRequired(request, 'request');
    this.validateString(request.field, 'field');
  }
}
```

## Design Patterns

### 1. Builder Pattern

Fluent configuration:

```typescript
client
  .use(loggingMiddleware(logger))
  .use(timingMiddleware())
  .use(customMiddleware);
```

### 2. Factory Pattern

HTTP client creation:

```typescript
class HttpClientFactory {
  createStandardClient(): StandardHttpClient;
  createStreamingClient(): StreamingHttpClient;
}
```

### 3. Registry Pattern

Endpoint management:

```typescript
endpointManager
  .register('chat', ChatEndpoint)
  .register('images', ImagesEndpoint);
```

### 4. Chain of Responsibility

Middleware execution:

```typescript
// Each middleware can modify context and pass to next
middleware1 → middleware2 → middleware3 → HTTP request
```

### 5. Strategy Pattern

Retry strategies:

```typescript
const retryPolicy: RetryPolicy = {
  maxRetries: 3,
  backoffMultiplier: 2,
  retryableStatusCodes: [429, 500, 502, 503],
};
```

## Performance Considerations

### 1. Tree-Shaking

Build configuration for optimal bundle size:

```typescript
// tsup.config.ts
export default defineConfig({
  format: ['cjs', 'esm'],
  splitting: true,
  treeshake: true,
});
```

Only import what you use:

```typescript
// ✅ Tree-shakeable
import { VeniceClient } from '@venice/core';

// ❌ Imports everything
import * as Venice from '@venice/core';
```

### 2. Rate Limiting

Automatic concurrency control:

```typescript
const client = new VeniceClient({
  rateLimit: {
    maxRequestsPerMinute: 60,
    maxConcurrentRequests: 5,
  },
});
```

**Queue management:**
- Requests queued when limits hit
- Automatic retry with backoff
- Prevents 429 errors

### 3. Streaming

Efficient memory usage:

```typescript
// ✅ Memory-efficient streaming
for await (const chunk of stream) {
  process(chunk); // Process one chunk at a time
}

// ❌ Loads entire response into memory
const fullResponse = await collectStream(stream);
```

### 4. Connection Reuse

Axios connection pooling:

```typescript
// Single axios instance reused for all requests
this.client = axios.create({
  baseURL: baseUrl,
  timeout,
});
```

### 5. Retry with Exponential Backoff

Minimize redundant requests:

```typescript
const retryHandler = new RetryHandler({
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffMultiplier: 2,
  jitter: true, // Adds randomness to prevent thundering herd
});
```

### 6. Lazy Loading

Endpoints created on-demand:

```typescript
// Endpoint only created when first accessed
public get chat(): ChatEndpoint {
  return this.endpoint<ChatEndpoint>('chat');
}
```

## Error Handling Best Practices

### Structured Error Handling

```typescript
try {
  const response = await client.chat.completions.create({ ... });
} catch (error) {
  if (error instanceof VeniceRateLimitError) {
    // Automated recovery possible
    const automated = error.recoveryHints.filter(h => h.automated);
    if (automated.length > 0 && error.retryAfter) {
      await sleep(error.retryAfter * 1000);
      return retry();
    }
  } else if (error instanceof VeniceAuthError) {
    // Manual intervention needed
    console.error('Please check your API key');
    error.recoveryHints.forEach(hint => {
      console.log(`- ${hint.description}`);
    });
  } else if (error instanceof VeniceValidationError) {
    // Fix request parameters
    console.error('Invalid parameters:', error.details);
  }
}
```

### AI-Friendly Error Processing

```typescript
function processForAI(error: VeniceError) {
  return {
    code: error.code,
    canAutoRecover: error.recoveryHints.some(h => h.automated),
    automatedActions: error.recoveryHints
      .filter(h => h.automated)
      .map(h => ({ action: h.action, code: h.code })),
    manualSteps: error.recoveryHints
      .filter(h => !h.automated)
      .map(h => h.description),
  };
}
```

## Security Considerations

### 1. API Key Management

```typescript
// ✅ Environment variables
const client = new VeniceClient({
  apiKey: process.env.VENICE_API_KEY,
});

// ❌ Hardcoded (NEVER do this)
const client = new VeniceClient({
  apiKey: 'sk-123456789',
});
```

### 2. Request Sanitization

All user input is validated:

```typescript
validator.validateChatCompletionRequest(request);
```

### 3. Error Messages

Never expose sensitive data in error messages:

```typescript
// ✅ Safe error message
throw new VeniceAuthError('Authentication failed');

// ❌ Exposes API key
throw new Error(`Invalid API key: ${apiKey}`);
```

## Testing Strategy

### Unit Tests

- 177 tests covering core functionality
- 100% coverage for new features
- Vitest test runner

### Integration Tests

- 11 integration tests against live API
- Real-world usage patterns
- Error scenario testing

### Example-Based Testing

- 18 runnable TypeScript examples
- Serve as both documentation and tests
- Cover all SDK features

## Versioning

**Calendar Versioning:** `YYYY.MM.D[-patch]`

- `2025.11.5` - Major release on 2025-11-05
- `2025.11.5-1` - Patch release

Benefits:
- Clear release timeline
- Easy to identify API version compatibility
- Predictable release schedule

## Future Considerations

### Planned Enhancements

1. **Batch Request API** - Send multiple requests in one call
2. **Request Caching** - Built-in response caching
3. **WebSocket Support** - Real-time bidirectional communication
4. **Function Calling** - Enhanced support for tool use
5. **Prompt Templates** - Reusable prompt management

### Extension Opportunities

- Browser-specific builds
- React hooks package
- CLI tool
- Deno support
- Edge runtime compatibility
