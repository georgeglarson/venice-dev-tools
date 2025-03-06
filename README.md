# Venice Dev Tools

A comprehensive, fully-featured SDK for the Venice AI API with CLI support, programmatic CLI usage, CLI-style interface, and an interactive live demo.

## Documentation

For comprehensive documentation, visit our [GitHub Pages documentation site](https://georgeglarson.github.io/venice-dev-tools/).

For the official Venice AI platform, visit [Venice AI](https://venice.ai/?ref=VB8W1j).

## CLI Quick Start

Get started with the Venice AI CLI in seconds:

```bash
# Install globally
npm install -g venice-dev-tools

# Configure your API key
venice configure

# Generate a chat completion
venice chat "Tell me about AI"

# Generate an image
venice generate-image "A beautiful sunset" --output sunset.png

# List available models
venice list-models

# List and interact with characters
venice list-characters
venice chat "Tell me about yourself" --model character:sophia-sophie-daniels
```

### Key CLI Commands

| Command | Description |
|---------|-------------|
| `venice configure` | Configure your Venice API key |
| `venice chat <prompt>` | Generate a chat completion |
| `venice generate-image <prompt>` | Generate an image |
| `venice list-models` | List available models |
| `venice list-styles` | List available image styles |
| `venice list-characters` | List available AI characters |
| `venice chat <prompt> --model character:<slug>` | Chat with a specific character |
| `venice list-keys` | List your API keys |

For more CLI commands and options, see the [CLI Reference](https://georgeglarson.github.io/venice-dev-tools/cli).

## JavaScript Quick Start

First, [create a Venice AI account](https://venice.ai/sign-up?ref=VB8W1j) to get your API key.

```javascript
import { VeniceAI } from 'venice-dev-tools';

// Initialize the client
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

// Generate a chat completion
async function generateChatCompletion() {
  const response = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Tell me about AI' }
    ],
    venice_parameters: {
      enable_web_search: 'on'
    }
  });
  
  console.log(response.choices[0].message.content);
}

// Analyze a PDF document
async function analyzePdfDocument() {
  const fs = require('fs');
  const path = require('path');
  
  // Read the PDF file
  const pdfPath = path.join(__dirname, 'document.pdf');
  const pdfBuffer = fs.readFileSync(pdfPath);
  const base64Pdf = pdfBuffer.toString('base64');
  
  const response = await venice.chat.completions.create({
    model: 'qwen-2.5-vl', // Use a vision model that can process documents
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Please analyze this PDF document and provide a summary.'
          },
          {
            type: 'file',
            file: {
              data: base64Pdf,
              mime_type: 'application/pdf',
              name: 'document.pdf'
            }
          }
        ]
      }
    ]
  });
  
  console.log(response.choices[0].message.content);
}

generateChatCompletion();
// analyzePdfDocument();

// Handle a large PDF file (>4.5MB)
async function handleLargePDF() {
  const fs = require('fs');
  const path = require('path');
  const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
  
  // Path to the large PDF file
  const pdfPath = path.join(__dirname, 'large-document.pdf');
  
  // Extract text locally
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDocument = await loadingTask.promise;
  
  let extractedText = '';
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    extractedText += `\n--- Page ${i} ---\n${pageText}\n`;
  }
  
  // Send extracted text to API
  const response = await venice.chat.completions.create({
    model: 'qwen-2.5-vl',
    messages: [
      {
        role: 'user',
        content: `Please analyze this document content and provide a summary:\n\n${extractedText}`
      }
    ]
  });
  
  console.log(response.choices[0].message.content);
}
```

For more JavaScript examples, see the [Examples](https://georgeglarson.github.io/venice-dev-tools/documentation/examples/) section in the documentation.

## Installation

```bash
# Install as a dependency in your project
npm install venice-dev-tools

# Or install globally to use the CLI
npm install -g venice-dev-tools
```

## Live Demo

Try out the Venice AI SDK without an API key using our [interactive live demo](https://georgeglarson.github.io/venice-dev-tools/demo).

## Features

- **Chat Completions**: Generate text responses with streaming support, web search, and file attachment support
- **Document Analysis**: Analyze PDF documents and other file types using AI, with support for handling large files (>4.5MB)
- **Image Generation**: Create images with various models and styles
- **Image Upscaling**: Enhance image resolution
- **Models Management**: List models, traits, and compatibility mappings
- **Character Management**: List and interact with pre-defined AI characters
- **API Key Management**: Create, list, delete, and check rate limits for API keys
- **VVV Token Information**: Get circulating supply, network utilization, and staking yield
- **Web3 Integration**: Generate API keys using Web3 wallets
- **Command Line Interface**: Interact with the API directly from your terminal
- **Error Handling**: Comprehensive error handling with specific error classes
- **Rate Limiting**: Automatic rate limit tracking and handling
- **Debug Logging**: Robust logging system with multiple log levels and runtime configuration

## Why Choose This SDK?

This SDK stands out with exceptional developer experience, robust error handling, streaming support done right, and production-ready features.

### Privacy-First Approach

[Venice AI](https://venice.ai/sign-up?ref=VB8W1j) offers unparalleled privacy advantages over other AI providers:

- **No Data Storage**: Your prompts, responses, and generated content are never saved on any Venice infrastructure
- **Local Storage Only**: Your conversation history lives in your local browser - clear your browser data, and those conversations are gone forever
- **Decentralized Processing**: Your requests are processed on decentralized GPUs without any identifying information
- **Transient Processing**: Once a prompt is processed, it is purged from the GPU - nothing persists
- **SSL Encryption**: All communication is secured using SSL encryption throughout the entire journey

As Venice states: **"You don't have to protect what you do not have."**

## Examples

For code examples covering all SDK features, see the [Examples](https://georgeglarson.github.io/venice-dev-tools/documentation/examples/) section in the documentation or check out the [examples](./examples) directory in this repository.

### Handling Large Files

The Venice AI API has a 4.5MB post limit for file uploads. For files larger than this limit, we provide several approaches:

1. **Local Extraction**: Extract content locally before sending to the API
2. **File Resizing**: Resize or compress files locally
3. **Comprehensive PDF Handling**: Extract text from PDFs of any size
4. **URL-Based Approach**: Upload files to cloud storage and provide URLs

Check out these examples:
- [Unified File Upload](./examples/chat/unified-file-upload.js) - Handles any file type automatically
- [Large PDF Extraction](./examples/chat/large-pdf-extraction.js) - Extracts text from PDFs locally
- [Large Image Processing](./examples/chat/large-image-processing.js) - Resizes images to fit within limits
- [Comprehensive PDF Handling](./examples/chat/comprehensive-pdf-handling.js) - Advanced PDF processing

For detailed documentation, see [Handling Large Files](./docs/examples/large-file-handling.md).

## Contact

For questions or feedback about this SDK, contact:
- Email: support@venice.ai
- Website: [venice.ai](https://venice.ai/contact?ref=VB8W1j)

## License

MIT