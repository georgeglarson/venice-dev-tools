# Venice AI SDK Tests

This directory contains tests for the Venice AI SDK. The tests are organized by resource and can be run individually or all together.

## Test Structure

The test directory is organized as follows:

```
test/
├── README.md                 # This file
├── .env.sample               # Sample environment variables
├── run-all-tests.sh          # Script to run all tests
├── testing-refactoring-plan.md # Refactoring plan documentation
├── utils/                    # Test utilities
│   └── test-utils.js         # Shared test utility functions
├── resources/                # Tests organized by resource
│   ├── chat/                 # Chat API tests
│   │   └── test-completions.js
│   ├── image/                # Image API tests
│   │   └── test-generate.js
│   ├── models/               # Models API tests
│   │   └── test-list.js
│   ├── api-keys/             # API Keys tests
│   │   └── test-list.js
│   ├── characters/           # Characters API tests
│   │   └── test-list.js
│   └── vvv/                  # VVV API tests
│       └── test-info.js
├── integration/              # Cross-resource integration tests
│   └── test-end-to-end.js
├── chat/                     # Legacy chat tests
│   └── test-file-attachments.js
└── upscale/                  # Legacy upscale tests
    ├── run-tests.sh
    └── test-upscale.js
```

## Running Tests

### Prerequisites

1. Node.js 14 or higher
2. A Venice AI API key

### Setup

1. Copy the sample environment file and add your API key:

```bash
cp .env.sample .env
# Edit .env to add your API key
```

### Using Real SDK vs. Mocks

The tests can run in two modes:

1. **Mock Mode (Default)**: Uses mock implementations of the SDK for testing without making real API calls.
2. **Real SDK Mode**: Uses the actual SDK implementation and makes real API calls.

To use the real SDK:

1. Build the SDK first:
   ```bash
   npm run build
   ```

2. Set the `USE_REAL_SDK` environment variable to `true` in your `.env` file:
   ```
   USE_REAL_SDK=true
   ```

3. Make sure you have a valid API key in your `.env` file.

> **Note**: The real SDK mode is currently under development. There are known issues with using the CLI commands programmatically. For now, the mock mode is the recommended approach for running tests.

#### Implementation Details

The test utilities support both mock and real SDK implementations:

1. **Mock Implementation**: A custom mock implementation that mimics the SDK interface without making real API calls.
2. **CLI Wrapper**: A wrapper around the CLI commands for using the real SDK programmatically.

The implementation to use is determined by the `USE_REAL_SDK` environment variable in the `.env` file.

### Running All Tests

To run all tests:

```bash
# From the project root
npm test

# Or directly
./test/run-all-tests.sh
```

### Running Specific Test Categories

To run tests for a specific category:

```bash
# Chat API tests
./test/run-all-tests.sh chat

# Image API tests
./test/run-all-tests.sh image

# Models API tests
./test/run-all-tests.sh models

# API Keys tests
./test/run-all-tests.sh api-keys

# Characters API tests
./test/run-all-tests.sh characters

# VVV API tests
./test/run-all-tests.sh vvv

# Integration tests
./test/run-all-tests.sh integration

# Legacy upscale tests
./test/run-all-tests.sh upscale
```

### Running Individual Tests

To run an individual test file:

```bash
# Run a specific test file
node test/resources/chat/test-completions.js
```

## Test Utilities

The `test/utils/test-utils.js` file provides common utilities for tests:

- `createClient()`: Creates a Venice AI client with consistent configuration (real or mock)
- `runTest()`: Runs a test function and handles errors consistently
- `loadTestFile()`: Loads a test file from the project
- `validateResponse()`: Validates API responses against expected schemas
- `compareObjects()`: Compares two objects for deep equality
- `setupTestEnvironment()`: Sets up the test environment
- `cleanupTestEnvironment()`: Cleans up the test environment
- `logTestResults()`: Logs test results in a consistent format
- `wait()`: Waits for a specified amount of time
- `retry()`: Retries a function until it succeeds or reaches max attempts

## Adding New Tests

When adding new tests:

1. Place them in the appropriate resource directory under `test/resources/`
2. Use the test utilities for consistent client initialization and error handling
3. Follow the existing patterns for test structure
4. Make sure the test file is runnable individually
5. Ensure tests work with both mock and real SDK implementations

## Test Conventions

- Each test file should be runnable individually
- Tests should clean up after themselves
- Tests should provide clear output about what they're testing
- Tests should exit with code 0 for success and non-zero for failure
- Tests should validate responses against expected schemas
- Tests should handle errors gracefully and provide helpful error messages
- Tests should work with both mock and real SDK implementations