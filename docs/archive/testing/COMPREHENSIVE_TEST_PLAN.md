# Venice AI SDK Comprehensive Test Plan

## Overview

This document outlines a comprehensive testing strategy for the Venice AI SDK to ensure 100% test coverage of all functionality, with special focus on admin key features that are currently untested.

## Test Environment Setup

### Required Environment Variables

```bash
# Standard API key for regular operations
VENICE_API_KEY=your_standard_api_key

# Admin API key for management operations
VENICE_ADMIN_API_KEY=your_admin_api_key

# Optional: Custom base URL for testing
VENICE_BASE_URL=https://api.venice.ai
```

### Test Data Requirements

- Sample image files (PNG, JPEG)
- Sample audio files (MP3, WAV)
- Test documents for PDF processing
- Web3 wallet addresses for authentication tests

## Test Suite Structure

```
venice-ai-sdk/packages/core/src/__integration__/
├── chat.integration.test.ts          # ✅ Already exists
├── embeddings.integration.test.ts    # ✅ Already exists
├── models.integration.test.ts        # ✅ Already exists
├── api-keys.integration.test.ts      # 🆕 Admin key tests
├── billing.integration.test.ts       # 🆕 Admin key tests
├── characters.integration.test.ts    # 🆕 Character tests
├── images.integration.test.ts        # 🆕 Image generation tests
├── audio.integration.test.ts         # 🆕 Audio/speech tests
├── error-handling.integration.test.ts # 🆕 Error scenarios
├── web3.integration.test.ts          # 🆕 Web3 authentication
└── workflows.integration.test.ts     # 🆕 Complex workflows
```

## Detailed Test Plans

### 1. API Keys Management Tests (`api-keys.integration.test.ts`)

**Priority**: Critical (Requires admin key)

#### Test Cases:
- ✅ List all API keys
- ✅ Create a new API key
- ✅ Retrieve a specific API key by ID
- ✅ Update an API key (name, expiration)
- ✅ Delete/revoke an API key
- ✅ Get rate limits for API keys
- ✅ Get rate limit logs
- ✅ Generate Web3 token
- ✅ Create API key with Web3 authentication
- ✅ Validate API key permissions
- ✅ Test API key expiration handling

#### Test Structure:
```typescript
describe('API Keys Integration Tests', () => {
  let venice: VeniceAI;
  let createdKeyId: string;

  beforeAll(() => {
    venice = new VeniceAI({ 
      apiKey: process.env.VENICE_ADMIN_API_KEY,
      logLevel: 4 
    });
  });

  it('should list all API keys', async () => { ... });
  it('should create a new API key', async () => { ... });
  it('should retrieve a specific API key', async () => { ... });
  // ... more tests
});
```

### 2. Billing Tests (`billing.integration.test.ts`)

**Priority**: Critical (Requires admin key)

#### Test Cases:
- ✅ Get billing usage with default parameters
- ✅ Get billing usage with date range filter
- ✅ Get billing usage with currency filter
- ✅ Get billing usage with pagination
- ✅ Export billing usage as CSV
- ✅ Validate billing data structure
- ✅ Test billing with different time periods

#### Test Structure:
```typescript
describe('Billing Integration Tests', () => {
  let venice: VeniceAI;

  beforeAll(() => {
    venice = new VeniceAI({ 
      apiKey: process.env.VENICE_ADMIN_API_KEY 
    });
  });

  it('should get billing usage', async () => { ... });
  it('should filter billing usage by date range', async () => { ... });
  it('should export billing as CSV', async () => { ... });
  // ... more tests
});
```

### 3. Characters Tests (`characters.integration.test.ts`)

**Priority**: Medium

#### Test Cases:
- ✅ List all available characters
- ✅ Validate character data structure
- ✅ Test character usage in chat completion
- ✅ Filter characters by tags
- ✅ Test character descriptions

#### Test Structure:
```typescript
describe('Characters Integration Tests', () => {
  let venice: VeniceAI;

  beforeAll(() => {
    venice = new VeniceAI({ 
      apiKey: process.env.VENICE_API_KEY 
    });
  });

  it('should list characters', async () => { ... });
  it('should use character in chat completion', async () => { ... });
  // ... more tests
});
```

### 4. Image Generation Tests (`images.integration.test.ts`)

**Priority**: High

#### Test Cases:
- ✅ Generate basic image
- ✅ Generate image with custom parameters
- ✅ Generate multiple images
- ✅ List available image styles
- ✅ Upscale an image
- ✅ Test image generation with different models
- ✅ Validate image response structure
- ✅ Test content violation headers
- ✅ Test image blurring headers

#### Test Structure:
```typescript
describe('Images Integration Tests', () => {
  let venice: VeniceAI;
  let testImageBuffer: Buffer;

  beforeAll(async () => {
    venice = new VeniceAI({ 
      apiKey: process.env.VENICE_API_KEY,
      timeout: 120000 // Longer timeout for image generation
    });
    // Load test image for upscaling
    testImageBuffer = fs.readFileSync(path.join(__dirname, '../fixtures/test-image.png'));
  });

  it('should generate an image', async () => { ... });
  it('should list image styles', async () => { ... });
  it('should upscale an image', async () => { ... });
  // ... more tests
});
```

### 5. Audio/Speech Tests (`audio.integration.test.ts`)

**Priority**: Medium

#### Test Cases:
- ✅ Generate speech from text
- ✅ Test different voice options
- ✅ Test different audio formats
- ✅ Test speech speed adjustment
- ✅ Validate audio response structure
- ✅ Test with long text input

#### Test Structure:
```typescript
describe('Audio Integration Tests', () => {
  let venice: VeniceAI;

  beforeAll(() => {
    venice = new VeniceAI({ 
      apiKey: process.env.VENICE_API_KEY,
      timeout: 60000 // Timeout for audio generation
    });
  });

  it('should generate speech from text', async () => { ... });
  it('should support different voices', async () => { ... });
  it('should support different formats', async () => { ... });
  // ... more tests
});
```

### 6. Error Handling Tests (`error-handling.integration.test.ts`)

**Priority**: High

#### Test Cases:
- ✅ Invalid API key authentication
- ✅ Rate limiting errors
- ✅ Invalid request parameters
- ✅ Network timeout errors
- ✅ Payment required errors
- ✅ Model not found errors
- ✅ Content policy violations
- ✅ File upload errors

#### Test Structure:
```typescript
describe('Error Handling Integration Tests', () => {
  let venice: VeniceAI;

  it('should handle invalid API key', async () => { ... });
  it('should handle rate limiting', async () => { ... });
  it('should handle validation errors', async () => { ... });
  // ... more tests
});
```

### 7. Web3 Authentication Tests (`web3.integration.test.ts`)

**Priority**: Medium

#### Test Cases:
- ✅ Generate Web3 token
- ✅ Create API key with Web3 authentication
- ✅ Test Web3 signature validation
- ✅ Test Web3 with different wallet types
- ✅ Test Web3 API key permissions

#### Test Structure:
```typescript
describe('Web3 Integration Tests', () => {
  let venice: VeniceAI;

  beforeAll(() => {
    venice = new VeniceAI({ 
      apiKey: process.env.VENICE_ADMIN_API_KEY 
    });
  });

  it('should generate Web3 token', async () => { ... });
  it('should create API key with Web3', async () => { ... });
  // ... more tests
});
```

### 8. Complex Workflows Tests (`workflows.integration.test.ts`)

**Priority**: Medium

#### Test Cases:
- ✅ Create API key → Use key for chat → Delete key
- ✅ Generate image → Use image in vision chat
- ✅ Create character → Use character in chat
- ✅ Get billing usage → Export to CSV
- ✅ Rate limit monitoring → Adjust usage

#### Test Structure:
```typescript
describe('Workflow Integration Tests', () => {
  let venice: VeniceAI;

  it('should complete API key lifecycle', async () => { ... });
  it('should use generated image in chat', async () => { ... });
  // ... more tests
});
```

## Test Implementation Strategy

### Phase 1: Critical Admin Key Tests
1. API Keys Management
2. Billing Endpoint
3. Basic Error Handling

### Phase 2: Feature Tests
1. Image Generation
2. Audio/Speech
3. Characters

### Phase 3: Advanced Tests
1. Web3 Authentication
2. Complex Workflows
3. Comprehensive Error Scenarios

## Test Data Management

### Fixtures Directory Structure
```
venice-ai-sdk/packages/core/src/__integration__/fixtures/
├── images/
│   ├── test-image.png
│   ├── test-image.jpg
│   └── test-small-image.png
├── audio/
│   ├── test-audio.mp3
│   └── test-audio.wav
└── documents/
    ├── test-document.pdf
    └── test-document.txt
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Integration Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:integration
      env:
        VENICE_API_KEY: ${{ secrets.VENICE_API_KEY }}
        VENICE_ADMIN_API_KEY: ${{ secrets.VENICE_ADMIN_API_KEY }}
```

## Test Execution Commands

```bash
# Run all integration tests
npm run test:integration

# Run specific test suite
npm run test:integration -- api-keys

# Run with coverage
npm run test:integration -- --coverage

# Run in watch mode
npm run test:integration -- --watch
```

## Success Criteria

1. **100% Endpoint Coverage**: All SDK endpoints tested
2. **Admin Key Testing**: All admin features tested with proper credentials
3. **Error Scenarios**: Comprehensive error handling validation
4. **Integration Workflows**: Multi-step operations tested
5. **Documentation**: All test cases documented with examples

## Timeline

- **Week 1**: Implement admin key tests (API keys, billing)
- **Week 2**: Implement feature tests (images, audio, characters)
- **Week 3**: Implement advanced tests (Web3, workflows, errors)
- **Week 4**: Documentation, CI setup, and final validation

This comprehensive test plan ensures that every function of the Venice AI SDK is properly tested, with special attention to the admin key functionality that is currently missing from the test suite.