# Venice Client

The main client for interacting with the Venice AI API.

## VeniceNode Client

For Node.js environments.

### Constructor

```typescript
constructor(config: VeniceClientConfig = {})
```

Creates a new Venice Node client instance.

#### Parameters

- `config` (optional): Configuration options for the client
  - `apiKey`: Your Venice API key
  - `baseUrl`: API base URL (default: 'https://api.venice.ai/api/v1')
  - `timeout`: Request timeout in milliseconds (default: 30000)
  - `headers`: Additional headers to include in requests
  - `maxConcurrent`: Maximum concurrent requests (default: 10)
  - `requestsPerMinute`: Maximum requests per minute (default: 60)
  - `logLevel`: Log level for the client (default: LogLevel.INFO)

#### Example

```typescript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
  timeout: 60000
});
```

## VeniceWeb Client

For browser environments.

### Constructor

```typescript
constructor(config: VeniceClientConfig = {})
```

Creates a new Venice Web client instance.

#### Parameters

- `config` (optional): Configuration options for the client
  - `apiKey`: Your Venice API key
  - `baseUrl`: API base URL (default: 'https://api.venice.ai/api/v1')
  - `timeout`: Request timeout in milliseconds (default: 30000)
  - `headers`: Additional headers to include in requests
  - `maxConcurrent`: Maximum concurrent requests (default: 10)
  - `requestsPerMinute`: Maximum requests per minute (default: 60)
  - `logLevel`: Log level for the client (default: LogLevel.INFO)

#### Example

```typescript
import { VeniceWeb } from '@venice-dev-tools/web';

const venice = new VeniceWeb({
  apiKey: 'your-api-key',
  timeout: 60000
});
```

## Common Methods

The following methods are available on both VeniceNode and VeniceWeb clients.

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

### setLogLevel

```typescript
setLogLevel(level: LogLevel): void
```

Sets the log level for the client.

#### Parameters

- `level`: The log level (DEBUG, INFO, WARN, ERROR)

#### Example

```typescript
import { LogLevel } from '@venice-dev-tools/core';

venice.setLogLevel(LogLevel.DEBUG);
```

### getLogger

```typescript
getLogger(): Logger
```

Gets the logger instance for custom handling.

#### Returns

The logger instance.

#### Example

```typescript
const logger = venice.getLogger();
logger.addHandler((entry) => {
  console.log(`[CUSTOM] ${entry.level}: ${entry.message}`);
});
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