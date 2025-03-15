# Updated Testing Example for Venice AI SDK

This example shows how to implement unit tests for the Venice AI SDK, taking into account the actual class structure of the SDK.

## Understanding the Class Structure

The Venice AI SDK has two main client classes:

1. `VeniceClient` (in client.ts) - The base client class with core functionality
2. `VeniceAI` (in venice-ai.ts) - Extends VeniceClient and adds endpoint registry functionality

When writing tests, it's important to test the right class based on what functionality you're testing.

## VeniceClient Unit Test Example

Create file: `venice-ai-sdk/tests/unit/client.test.ts`

```typescript
import VeniceClient from '../../packages/core/src/client';

describe('VeniceClient', () => {
  let client: VeniceClient;
  
  beforeEach(() => {
    client = new VeniceClient({ apiKey: 'test-key' });
  });
  
  test('should set API key when provided', () => {
    expect(client.getApiKey()).toBe('test-key');
  });
  
  test('should initialize with default options', () => {
    const defaultClient = new VeniceClient();
    expect(defaultClient).toBeInstanceOf(VeniceClient);
  });
  
  test('should allow setting custom headers', () => {
    client.setHeader('X-Custom-Header', 'custom-value');
    // Note: We can't directly test the headers as they're private
    // In a real test, you might mock the HTTP client and verify the header was set
  });
});
```

## VeniceAI Unit Test Example

Create file: `venice-ai-sdk/tests/unit/venice-ai.test.ts`

```typescript
import { VeniceAI } from '../../packages/core/src/venice-ai';

describe('VeniceAI Client', () => {
  let client: VeniceAI;
  
  beforeEach(() => {
    client = new VeniceAI({ apiKey: 'test-key' });
  });
  
  test('should set API key when provided', () => {
    expect(client.getApiKey()).toBe('test-key');
  });
  
  test('should register all core endpoints', () => {
    const endpoints = client.getRegisteredEndpoints();
    expect(endpoints).toContain('chat');
    expect(endpoints).toContain('models');
    expect(endpoints).toContain('images');
    expect(endpoints).toContain('keys');
    expect(endpoints).toContain('characters');
  });
  
  test('should provide access to endpoints via getters', () => {
    expect(client.chat).toBeDefined();
    expect(client.models).toBeDefined();
    expect(client.images).toBeDefined();
    expect(client.keys).toBeDefined();
    expect(client.characters).toBeDefined();
  });
  
  test('should allow registering custom endpoints', () => {
    // Create a mock endpoint class
    class MockEndpoint {
      constructor(client: any) {
        // Endpoint initialization
      }
    }
    
    // Register the custom endpoint
    client.registerEndpoint('mock', MockEndpoint);
    
    // Verify it was registered
    const endpoints = client.getRegisteredEndpoints();
    expect(endpoints).toContain('mock');
  });
});
```

## HTTP Client Unit Test Example

Create file: `venice-ai-sdk/tests/unit/http-client.test.ts`

```typescript
import { HttpClient } from '../../packages/core/src/http/client';
// You might need to mock axios or other dependencies

describe('HttpClient', () => {
  let httpClient: HttpClient;
  
  beforeEach(() => {
    httpClient = new HttpClient('https://api.test.com', {}, 30000);
  });
  
  test('should initialize with the provided base URL', () => {
    expect(httpClient).toBeDefined();
    // Additional tests would typically mock axios and test request methods
  });
  
  // Additional tests would go here, but would likely require mocking
  // the underlying HTTP library (axios)
});
```

## Jest Configuration Example

Create file: `venice-ai-sdk/jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['packages/*/src/**/*.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.tsx$': 'ts-jest',
  },
};
```

## Package.json Test Scripts

Update `venice-ai-sdk/package.json`:

```json
"devDependencies": {
  "jest": "^29.7.0",
  "ts-jest": "^29.1.1",
  "@types/jest": "^29.5.11"
},
"scripts": {
  "test": "jest",
  "test:unit": "jest tests/unit",
  "test:integration": "jest tests/integration",
  "test:e2e": "jest tests/e2e",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

## Implementation Steps

1. Create test directory structure:
   ```bash
   mkdir -p venice-ai-sdk/tests/unit
   mkdir -p venice-ai-sdk/tests/integration
   mkdir -p venice-ai-sdk/tests/e2e
   ```

2. Install test dependencies:
   ```bash
   cd venice-ai-sdk
   npm install --save-dev jest ts-jest @types/jest
   ```

3. Create Jest configuration file as shown above

4. Create test files:
   - client.test.ts for testing VeniceClient
   - venice-ai.test.ts for testing VeniceAI
   - http-client.test.ts for testing HttpClient

5. Run the tests:
   ```bash
   cd venice-ai-sdk
   npm test
   ```

## Common Testing Issues and Solutions

1. **Import Error**: If you get an error about imports, make sure you're using the correct path and export name.
   
   ```typescript
   // Correct import for default export
   import VeniceClient from '../../packages/core/src/client';
   
   // Correct import for named export
   import { VeniceAI } from '../../packages/core/src/venice-ai';
   ```

2. **Method Not Found**: If a test fails with "method not found", verify you're testing the right class.
   
   ```typescript
   // This will fail if getRegisteredEndpoints() doesn't exist on VeniceClient
   const client = new VeniceClient();
   client.getRegisteredEndpoints(); // Error!
   
   // This will work because getRegisteredEndpoints() exists on VeniceAI
   const client = new VeniceAI();
   client.getRegisteredEndpoints(); // Works!
   ```

3. **TypeScript Errors**: Make sure your TypeScript types are correct.
   
   ```typescript
   // Correct typing
   let client: VeniceAI;
   client = new VeniceAI();
   ```

4. **Test Isolation**: Use beforeEach to create a fresh instance for each test.
   
   ```typescript
   let client: VeniceAI;
   
   beforeEach(() => {
     client = new VeniceAI({ apiKey: 'test-key' });
   });
   ```

5. **Running Tests**: Make sure you're in the correct directory.
   
   ```bash
   cd venice-ai-sdk
   npm test