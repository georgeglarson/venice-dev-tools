# Venice AI SDK Examples

This directory contains example code demonstrating how to use the Venice AI SDK for various tasks.

## Getting Started

To run these examples, you'll need:

1. Node.js installed on your system
2. The Venice AI SDK installed
3. A Venice AI API key

### Installation

```bash
# Install the Venice AI SDK
npm install @venice-ai/node
```

### Setting Your API Key

You can set your API key in two ways:

1. As an environment variable:
   ```bash
   export VENICE_API_KEY=your-api-key-here
   ```

2. Directly in the code (not recommended for production):
   ```javascript
   const venice = new VeniceNode({
     apiKey: 'your-api-key-here'
   });
   ```

## Running the Examples

Each example can be run directly with Node.js:

```bash
node chat-completion.js
node chat-streaming.js
node image-generation.js
node vision-multimodal.js
node pdf-processing.js
```

## Example Files

### Chat Completion (`chat-completion.js`)

Demonstrates how to use the Venice AI SDK to create chat completions, including:
- Basic chat completion
- Advanced chat completion with parameters
- Multi-turn conversation

### Chat Streaming (`chat-streaming.js`)

Shows how to use streaming for chat completions, including:
- Basic streaming
- Advanced streaming with custom handling
- Stream interruption

### Image Generation (`image-generation.js`)

Demonstrates image generation capabilities, including:
- Basic image generation
- Advanced image generation with parameters
- Image variations
- Image upscaling
### Vision/Multimodal (`vision-multimodal.js`)

Shows how to use multimodal capabilities for vision tasks, including:
- Basic image analysis
- Advanced vision with multiple images
- Multi-turn conversations with images
- OCR (Optical Character Recognition)

### PDF Processing (`pdf-processing.js`)

Demonstrates the PDF processing enhancement, including:
- Processing PDFs as images (default behavior)
- Extracting and using text from PDFs
- Using both text and image content from PDFs
- CLI examples for different PDF processing modes
- OCR (Optical Character Recognition)

### API Keys Management (`api-keys-management.js`)

Demonstrates how to use the Venice AI SDK to manage API keys, including:
- Listing API keys
- Creating API keys
- Getting rate limits
- Getting rate limit logs

### Characters List (`characters-list.js`)

Demonstrates how to use the Venice AI SDK to list characters and use them in chat completions:
- Listing available characters
- Getting character details
- Using characters in chat completions

## Configuration Options

All examples demonstrate various configuration options for the Venice AI SDK:

```javascript
const venice = new VeniceNode({
  apiKey: process.env.VENICE_API_KEY,
  timeout: 60000,           // Request timeout in milliseconds
  maxConcurrent: 5,         // Maximum concurrent requests
  requestsPerMinute: 60,    // Rate limit
  logLevel: LogLevel.DEBUG  // Logging level
});
```

## Error Handling

The examples include proper error handling patterns that you can use in your own applications:

```javascript
try {
  const response = await venice.chat.createCompletion({
    // request parameters
  });
  // handle response
} catch (error) {
  console.error('Error:', error.message);
  // handle specific error types if needed
}
```

## Additional Resources

- [Venice AI SDK Documentation](../docs/)
- [Getting Started Guide](../docs/guides/getting-started.md)
- [API Reference](../docs/api/)