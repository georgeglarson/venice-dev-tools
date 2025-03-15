# Testing Example for Venice AI SDK

This example shows how to implement unit tests for the Venice AI SDK client.

## Client Unit Test Example

Create file: `venice-ai-sdk/tests/unit/client.test.ts`

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
});
```

## Jest Configuration Example

Create file: `venice-ai-sdk/jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!**/node_modules/**',
    '!**/dist/**'
  ]
};
```

## Package.json Test Scripts

Update `venice-ai-sdk/package.json`:

```json
"devDependencies": {
  "jest": "^29.5.0",
  "ts-jest": "^29.1.0",
  "@types/jest": "^29.5.0"
},
"scripts": {
  "test": "jest",
  "test:unit": "jest tests/unit",
  "test:integration": "jest tests/integration",
  "test:e2e": "jest tests/e2e"
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

4. Create client unit test file as shown above

5. Run the tests:
   ```bash
   npm test