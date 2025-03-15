# PDF Processing in Venice AI SDK

This guide explains how to use the PDF processing capabilities in the Venice AI SDK.

## Overview

In Venice AI SDK v2.1, PDFs can be processed in three different ways:

1. **Image mode** (default): The PDF is sent to the model as an image, requiring the model to use its vision capabilities to interpret the content.
2. **Text mode**: Text is extracted from the PDF and sent as text content, allowing the model to process the textual information directly.
3. **Both mode**: Both text and images are extracted from the PDF, sending multiple content items to provide the model with both visual and textual information.

## Using PDF Processing in Code

### Basic Usage

```typescript
import { VeniceNode } from '@venice-ai/node';

const venice = new VeniceNode({
  apiKey: process.env.VENICE_API_KEY
});

// Process a PDF file with different modes
async function processPdf() {
  const pdfPath = './document.pdf';
  
  // Default mode (image)
  const imageContent = await venice.utils.processFile(pdfPath);
  
  // Text mode
  const textContent = await venice.utils.processFile(pdfPath, { pdfMode: 'text' });
  
  // Both mode
  const bothContent = await venice.utils.processFile(pdfPath, { pdfMode: 'both' });
  
  // Use the processed content in a chat completion
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Please analyze this PDF document.'
          },
          // Use one of the processed contents
          ...(Array.isArray(bothContent) ? bothContent : [bothContent])
        ]
      }
    ]
  });
  
  console.log(response.choices[0].message.content);
}
```

### Handling Different Return Types

The `processFile` function returns different types based on the PDF mode:

- **Image mode**: Returns a single `ContentItem` with `type: 'image_url'`
- **Text mode**: Returns a single `ContentItem` with `type: 'text'`
- **Both mode**: Returns an array of `ContentItem` objects (one text, one image)

Always check if the result is an array and handle it accordingly:

```typescript
const processedContent = await venice.utils.processFile(pdfPath, { pdfMode: 'both' });

const contentArray = [
  {
    type: 'text',
    text: 'Please analyze this document.'
  }
];

// Add the processed content to the array
if (Array.isArray(processedContent)) {
  contentArray.push(...processedContent);
} else {
  contentArray.push(processedContent);
}
```

## Using PDF Processing in CLI

The Venice AI SDK CLI provides a `--pdf-mode` option for the `chat completion` and `chat interactive` commands:

```bash
# Process PDF as image (default)
venice chat completion --model llama-3.3-70b --attach document.pdf --prompt "Analyze this document"

# Process PDF as text
venice chat completion --model llama-3.3-70b --attach document.pdf --prompt "Analyze this document" --pdf-mode text

# Process PDF as both text and image
venice chat completion --model llama-3.3-70b --attach document.pdf --prompt "Analyze this document" --pdf-mode both

# Interactive chat with PDF processing options
venice chat interactive --pdf-mode text
```

## When to Use Each Mode

- **Image mode**: Best for PDFs with complex layouts, charts, diagrams, or when the visual appearance is important.
- **Text mode**: Best for text-heavy PDFs where the content is more important than the layout, such as research papers, articles, or reports.
- **Both mode**: Best when both the textual content and visual appearance are important, or when you're unsure which mode would work better.

## Performance Considerations

- **Image mode** may struggle with extracting accurate text from dense documents.
- **Text mode** loses all formatting, images, charts, and tables.
- **Both mode** provides the most comprehensive analysis but uses more tokens.

## Example

See the [PDF Processing Example](../../examples/pdf-processing.js) for a complete demonstration of all three PDF processing modes.