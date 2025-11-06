# Documentation Example for Venice AI SDK

This example shows how to implement documentation for the Venice AI SDK.

## JSDoc Comments Example

Update file: `venice-ai-sdk/packages/core/src/client.ts`

```typescript
/**
 * The base class for the Venice AI SDK client.
 * This provides core functionality shared by all platform-specific implementations.
 */
export class VeniceClient {
  /**
   * The HTTP client for making API requests.
   */
  protected http: HttpClient;

  /**
   * Event emitter for client events.
   */
  protected events: EventEmitter;

  /**
   * The client configuration.
   */
  protected config: VeniceClientConfig;

  /**
   * Create a new Venice API client.
   * @param config - The client configuration.
   */
  constructor(config: VeniceClientConfig = {}) {
    // ... implementation ...
  }

  /**
   * Set the API key for authentication.
   * @param apiKey - The Venice API key.
   * @throws {VeniceAuthError} If the API key is empty.
   */
  public setApiKey(apiKey: string): void {
    // ... implementation ...
  }

  /**
   * Get the current API key.
   * @returns The current API key or undefined if not set.
   */
  public getApiKey(): string | undefined {
    // ... implementation ...
  }

  /**
   * Set a custom header for API requests.
   * @param name - The header name.
   * @param value - The header value.
   */
  public setHeader(name: string, value: string): void {
    // ... implementation ...
  }

  /**
   * Subscribe to a client event.
   * @param event - The event name.
   * @param listener - The event listener.
   * @returns This client instance.
   */
  public on(event: string, listener: (...args: any[]) => void): this {
    // ... implementation ...
  }

  /**
   * Unsubscribe from a client event.
   * @param event - The event name.
   * @param listener - The event listener.
   * @returns This client instance.
   */
  public off(event: string, listener: (...args: any[]) => void): this {
    // ... implementation ...
  }

  /**
   * Emit a client event.
   * @param event - The event name.
   * @param args - The event arguments.
   * @returns Whether the event had listeners.
   */
  protected emit(event: string, ...args: any[]): boolean {
    // ... implementation ...
  }
}
```

## API Documentation Example

Create file: `venice-ai-sdk/docs/api/client.md`

```markdown
# VeniceAI Client

The main client for interacting with the Venice AI API.

## Constructor

```typescript
constructor(config: VeniceClientConfig = {})
```

Creates a new Venice AI client instance.

### Parameters

- `config` (optional): Configuration options for the client
  - `apiKey`: Your Venice API key
  - `baseUrl`: API base URL (default: 'https://api.venice.ai/api/v1')
  - `timeout`: Request timeout in milliseconds (default: 30000)
  - `headers`: Additional headers to include in requests

### Example

```typescript
import { VeniceAI } from '@venice-ai/core';

const venice = new VeniceAI({
  apiKey: 'your-api-key',
  timeout: 60000
});
```

## Methods

### setApiKey

```typescript
setApiKey(apiKey: string): void
```

Sets the API key for authentication.

#### Parameters

- `apiKey`: Your Venice API key

#### Example

```typescript
venice.setApiKey('your-new-api-key');
```

### getApiKey

```typescript
getApiKey(): string
```

Gets the current API key.

#### Returns

The current API key.

#### Throws

`VeniceAuthError` if no API key is set.

### setHeader

```typescript
setHeader(name: string, value: string): void
```

Sets a custom header for API requests.

#### Parameters

- `name`: The header name
- `value`: The header value

#### Example

```typescript
venice.setHeader('X-Custom-Header', 'custom-value');
```
```

## Getting Started Guide Example

Create file: `venice-ai-sdk/docs/guides/getting-started.md`

```markdown
# Getting Started with Venice AI SDK

This guide will help you get started with the Venice AI SDK.

## Installation

### Node.js

```bash
npm install @venice-ai/node
# or
yarn add @venice-ai/node
# or
pnpm add @venice-ai/node
```

### Browser

```bash
npm install @venice-ai/web
# or
yarn add @venice-ai/web
# or
pnpm add @venice-ai/web
```

## Basic Usage

### Node.js

```typescript
import { VeniceNode } from '@venice-ai/node';

// Create a new client
const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

// Generate a chat completion
async function chatExample() {
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'Tell me a joke about AI.' }
    ]
  });
  
  console.log(response.choices[0].message.content);
}

chatExample();
```

### Browser

```typescript
import { VeniceWeb } from '@venice-ai/web';

// Create a new client
const venice = new VeniceWeb({
  apiKey: 'your-api-key'
});

// Generate a chat completion
async function chatExample() {
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'Tell me a joke about AI.' }
    ]
  });
  
  document.getElementById('result').innerText = response.choices[0].message.content;
}

chatExample();
```
```

## Implementation Steps

1. Create documentation directory structure:
   ```bash
   mkdir -p venice-ai-sdk/docs/api
   mkdir -p venice-ai-sdk/docs/guides
   mkdir -p venice-ai-sdk/docs/examples
   ```

2. Add JSDoc comments to all public methods and classes

3. Create API documentation for each module

4. Create usage guides and examples

5. Consider using a documentation generator like TypeDoc to automatically generate API documentation from JSDoc comments