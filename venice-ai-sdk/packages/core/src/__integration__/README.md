# Integration Tests

This directory contains integration tests for the Venice AI SDK. These tests require valid API keys to run against the live Venice AI API.

## Environment Variables

To run the integration tests, you need to set the following environment variables:

### Required for most tests:
```bash
export VENICE_API_KEY="your-venice-api-key-here"
```

### Required for admin-only tests:
```bash
export VENICE_ADMIN_API_KEY="your-venice-admin-api-key-here"
```

### Optional variables:
```bash
export VENICE_BASE_URL="https://api.venice.ai"  # Custom base URL (optional)
export VENICE_LOG_LEVEL="4"                    # Log level (0-5, default: 4)
export VENICE_TIMEOUT="30000"                  # Request timeout in ms (default: 30000)
```

## Running Tests

### Run all integration tests:
```bash
pnpm test:integration
```

### Run specific test file:
```bash
pnpm vitest run src/__integration__/chat.integration.test.ts
```

### Run with coverage:
```bash
pnpm test:integration:coverage
```

## Test Categories

### Basic Tests (require `VENICE_API_KEY`):
- `chat.integration.test.ts` - Chat completion functionality
- `models.integration.test.ts` - Model listing and information
- `audio.integration.test.ts` - Text-to-speech generation
- `characters.integration.test.ts` - Character system integration
- `embeddings.integration.test.ts` - Text embeddings
- `images.integration.test.ts` - Image generation and upscaling
- `error-handling.integration.test.ts` - Error scenarios

### Admin Tests (require `VENICE_ADMIN_API_KEY`):
- `api-keys.integration.test.ts` - API key management
- `billing.integration.test.ts` - Billing and usage data
- `web3.integration.test.ts` - Web3 authentication

### Complex Workflows (require `VENICE_API_KEY`, optionally `VENICE_ADMIN_API_KEY`):
- `workflows.integration.test.ts` - Multi-step API workflows

## Test Configuration

The integration tests use a shared test configuration system (`test-config.ts`) that:

1. Validates required environment variables before running tests
2. Provides consistent error messages when variables are missing
3. Standardizes client configuration across all tests
4. Handles cleanup and resource management

## Expected Behavior

### When environment variables are missing:
- Tests will fail immediately with clear error messages
- No API calls will be made
- Cleanup errors are prevented

### When environment variables are present:
- Tests will run against the live Venice AI API
- Resources created during tests will be cleaned up
- Tests will validate real API responses

## Troubleshooting

### Tests fail with "environment variable is required" errors:
1. Ensure you've set the required environment variables
2. Check for typos in variable names
3. Verify your API keys are valid and active

### Tests fail with authentication errors:
1. Check that your API keys are valid
2. Ensure your account has the required permissions
3. Verify your admin key for admin-specific tests

### Tests timeout:
1. Increase the `VENICE_TIMEOUT` environment variable
2. Check your network connection
3. Verify API service status

## Development Notes

- Integration tests are designed to run against the live API
- Tests create real resources that may incur costs
- Always run tests with a test account when possible
- Tests include comprehensive cleanup to avoid resource leaks