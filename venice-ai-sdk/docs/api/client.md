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
getApiKey(): string | undefined
```

Gets the current API key.

#### Returns

The current API key or undefined if not set.

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

### on

```typescript
on(event: string, listener: (...args: any[]) => void): this
```

Subscribe to a client event.

#### Parameters

- `event`: The event name
- `listener`: The event listener

#### Returns

This client instance.

### off

```typescript
off(event: string, listener: (...args: any[]) => void): this
```

Unsubscribe from a client event.

#### Parameters

- `event`: The event name
- `listener`: The event listener

#### Returns

This client instance.

### emit

```typescript
emit(event: string, ...args: any[]): boolean
```

Emit a client event.

#### Parameters

- `event`: The event name
- `args`: The event arguments

#### Returns

Whether the event had listeners.