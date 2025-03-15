# Contributing to Venice AI SDK

This document provides information for contributors to the Venice AI SDK project, including project structure, design principles, and implementation details.

## Project Structure

The Venice AI SDK follows a well-organized directory structure that adheres to the principles of API Programming Library (APL), small files, and Single Responsibility Principle (SRP).

```
venice-ai-sdk-apl/
├── src/
│   ├── index.js                     # Main entry point
│   ├── client.js                    # Core client implementation
│   ├── config.js                    # Configuration constants
│   ├── types/                       # Type definitions
│   │   ├── index.js                 # Type exports
│   │   ├── common.js                # Common types
│   │   ├── chat.js                  # Chat completion types
│   │   ├── image.js                 # Image generation types
│   │   ├── models.js                # Model types
│   │   └── api-keys.js              # API key types
│   ├── resources/                   # API resources
│   │   ├── index.js                 # Resource exports
│   │   ├── base-resource.js         # Base resource class
│   │   ├── chat/                    # Chat completions
│   │   │   ├── index.js             # Chat exports
│   │   │   └── completions.js       # Chat completions implementation
│   │   ├── image/                   # Image generation
│   │   │   ├── index.js             # Image exports
│   │   │   ├── generate.js          # Image generation implementation
│   │   │   ├── upscale.js           # Image upscaling implementation
│   │   │   └── styles.js            # Image styles implementation
│   │   ├── models/                  # Models
│   │   │   ├── index.js             # Models exports
│   │   │   ├── list.js              # List models implementation
│   │   │   ├── traits.js            # Model traits implementation
│   │   │   └── compatibility.js     # Model compatibility implementation
│   │   └── api-keys/                # API keys
│   │       ├── index.js             # API keys exports
│   │       ├── list.js              # List API keys implementation
│   │       ├── create.js            # Create API key implementation
│   │       ├── delete.js            # Delete API key implementation
│   │       ├── rate-limits.js       # API key rate limits implementation
│   │       └── web3/                # Web3 API key generation
│   │           ├── index.js         # Web3 exports
│   │           ├── get.js           # GET implementation
│   │           └── post.js          # POST implementation
│   ├── utils/                       # Utility functions
│   │   ├── index.js                 # Utility exports
│   │   ├── http.js                  # HTTP client
│   │   ├── error-handling.js        # Error handling utilities
│   │   ├── rate-limiting.js         # Rate limiting utilities
│   │   └── validation.js            # Input validation utilities
│   └── errors/                      # Error classes
│       ├── index.js                 # Error exports
│       ├── api-error.js             # API error class
│       ├── validation-error.js      # Validation error class
│       └── rate-limit-error.js      # Rate limit error class
├── examples/                        # Example code
│   ├── chat/                        # Chat examples
│   │   ├── basic-chat.js            # Basic chat example
│   │   ├── streaming.js             # Streaming example
│   │   └── web-search.js            # Web search example
│   ├── image/                       # Image examples
│   │   ├── generate-image.js        # Generate image example
│   │   ├── upscale-image.js         # Upscale image example
│   │   └── image-styles.js          # Image styles example
│   ├── models/                      # Models examples
│   │   ├── list-models.js           # List models example
│   │   └── model-traits.js          # Model traits example
│   └── api-keys/                    # API keys examples
│       ├── manage-keys.js           # Manage API keys example
│       └── web3-keys.js             # Web3 API keys example
├── docs/                            # Documentation
│   ├── index.md                     # Documentation home
│   ├── getting-started.md           # Getting started guide
│   ├── chat/                        # Chat documentation
│   ├── image/                       # Image documentation
│   ├── models/                      # Models documentation
│   ├── api-keys/                    # API keys documentation
│   └── advanced/                    # Advanced topics
├── tests/                           # Tests
│   ├── unit/                        # Unit tests
│   └── integration/                 # Integration tests
├── package.json                     # Package configuration
├── .gitignore                       # Git ignore file
├── .eslintrc.js                     # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── jest.config.js                   # Jest configuration
└── README.md                        # Project README
```

## APL Design Principles

This SDK follows these API Programming Library (APL) design principles:

1. **Consistency**: Maintain consistent patterns across all API resources
2. **Simplicity**: Make the API easy to use with sensible defaults
3. **Discoverability**: Design the API to be easily discoverable through IDE autocompletion
4. **Flexibility**: Allow advanced users to customize behavior
5. **Error Handling**: Provide clear, actionable error messages
6. **Documentation**: Include comprehensive documentation with examples
7. **Type Safety**: Provide type definitions for better developer experience
8. **Resource-Oriented**: Organize code around API resources
9. **Immutability**: Use immutable objects where appropriate
10. **Testability**: Design for easy testing

## Implementation Strategy

1. Start with core infrastructure (client, HTTP, errors)
2. Implement base resource class
3. Add individual API resources
4. Create comprehensive examples
5. Write documentation
6. Add tests

## Educational Focus

This SDK is designed to be educational for newcomers to APIs and APL. Each file includes:

- Clear comments explaining the purpose and functionality
- Links to relevant documentation
- Examples of usage
- Explanations of API concepts where appropriate

## Implementation Details

### Streaming Implementation

The Venice AI API uses Server-Sent Events (SSE) format for streaming responses. Each chunk is sent in the format:

```
data: {"id":"...","object":"chat.completion.chunk","choices":[{"delta":{"content":"..."}}]}
```

Our implementation correctly:
1. Makes a direct axios request with `responseType: 'stream'`
2. Parses the SSE format to extract the JSON chunks
3. Yields each chunk as it arrives
4. Handles the final `[DONE]` message

### Debug Logging

We've implemented a robust logging system with the following features:

1. **Multiple Log Levels**: ERROR, WARN, INFO, DEBUG, and TRACE levels for different verbosity needs.
2. **Runtime Configuration**: Users can change the log level during runtime using `client.setLogLevel()`.
3. **Convenience Methods**: `enableDebugLogging()` and `disableLogging()` for quick configuration.
4. **Request/Response Logging**: Detailed logging of HTTP requests and responses, with sensitive information automatically redacted.
5. **Custom Log Handlers**: Support for custom log handlers to integrate with existing logging systems.

Example usage:

```javascript
// Enable debug logging at initialization
const venice = new VeniceAI({
  apiKey: 'your-api-key',
  logLevel: 4 // DEBUG level
});

// Or enable it later
venice.enableDebugLogging();

// Make API requests with debug logging
const response = await venice.chat.completions.create({...});

// Disable logging when no longer needed
venice.disableLogging();
```

### Enhanced Resource Implementations

We've improved the implementations for several resources:

1. **Image Styles**: Added detailed logging, better error handling, and a method to get a specific style by ID.
2. **API Keys List**: Added detailed logging, better error handling, and a method to get a specific API key by ID.
3. **API Keys Rate Limits**: Added detailed logging, better error handling, and a method to get rate limits for a specific model.

## Recommendations for Future Development

1. **Add Unit Tests**: Implement comprehensive unit tests to ensure all parts of the SDK work correctly.
2. **Enhance Documentation**: Update documentation to include information about debug logging and how to troubleshoot common issues.
3. **Add More Examples**: Create more examples demonstrating the use of the enhanced resource implementations.

## SEO Considerations

To make the project SEO-appealing, we use these keywords and phrases consistently:

- Venice AI API
- API Programming Library (APL)
- AI model integration
- Chat completions API
- Image generation API
- API key management
- Rate limiting
- OpenAI compatibility
- AI SDK
- LLM integration