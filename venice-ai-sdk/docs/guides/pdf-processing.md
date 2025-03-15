# PDF Processing in Venice Dev Tools

This guide explains how to use the PDF processing capabilities in the Venice Dev Tools v2.1.

## Overview

Venice Dev Tools v2.1 introduces powerful PDF processing capabilities that allow you to send PDF documents to AI models in three different ways:

1. **Image mode** (default): The PDF is sent to the model as an image, requiring the model to use its vision capabilities to interpret the content.
2. **Text mode**: Text is extracted from the PDF and sent as text content, allowing the model to process the textual information directly.
3. **Both mode**: Both text and images are extracted from the PDF, sending multiple content items to provide the model with both visual and textual information.

## Using PDF Processing in Code

### Basic Usage

```typescript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';
import path from 'path';

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

processPdf().catch(console.error);
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

// Use the content array in a chat completion
const response = await venice.chat.createCompletion({
  model: 'llama-3.3-70b',
  messages: [
    {
      role: 'user',
      content: contentArray
    }
  ]
});
```

### Processing Multiple PDFs

You can process multiple PDFs and combine them in a single request:

```typescript
async function processMultiplePdfs() {
  const pdfPath1 = './document1.pdf';
  const pdfPath2 = './document2.pdf';
  
  // Process both PDFs in text mode
  const textContent1 = await venice.utils.processFile(pdfPath1, { pdfMode: 'text' });
  const textContent2 = await venice.utils.processFile(pdfPath2, { pdfMode: 'text' });
  
  // Combine the processed content
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Compare these two PDF documents.'
          },
          textContent1,
          textContent2
        ]
      }
    ]
  });
  
  console.log(response.choices[0].message.content);
}
```

### Processing Specific Pages

You can process specific pages of a PDF by providing the `pages` option:

```typescript
// Process only pages 1, 2, and 5
const partialContent = await venice.utils.processFile(pdfPath, { 
  pdfMode: 'text',
  pages: [1, 2, 5]  // Page numbers are 1-based
});
```

### Processing with Custom Options

You can customize the PDF processing with additional options:

```typescript
const customContent = await venice.utils.processFile(pdfPath, { 
  pdfMode: 'both',
  imageQuality: 'high',  // 'low', 'medium', or 'high'
  imageFormat: 'png',    // 'jpeg' or 'png'
  textFormat: 'markdown' // 'plain' or 'markdown'
});
```

## Using PDF Processing in CLI

The Venice Dev Tools CLI provides a `--pdf-mode` option for the `chat completion` and `chat interactive` commands:

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

You can also specify pages to process:

```bash
# Process only pages 1-3 of the PDF
venice chat completion --model llama-3.3-70b --attach document.pdf --prompt "Analyze these pages" --pdf-mode text --pdf-pages 1-3

# Process specific pages
venice chat completion --model llama-3.3-70b --attach document.pdf --prompt "Analyze these pages" --pdf-mode text --pdf-pages 1,3,5-7
```

## When to Use Each Mode

### Image Mode (Default)

Best for:
- PDFs with complex layouts, charts, diagrams, or tables
- Documents where the visual appearance is important
- PDFs with non-textual elements like images or graphs
- Documents with mathematical equations or special symbols

Example use cases:
- Analyzing financial reports with charts and tables
- Reviewing scientific papers with diagrams and equations
- Examining design documents or presentations

### Text Mode

Best for:
- Text-heavy PDFs where the content is more important than the layout
- Documents where you want the model to focus on the textual information
- Large documents where token usage is a concern
- Documents where text extraction works well (clean, digital PDFs)

Example use cases:
- Analyzing research papers or articles
- Summarizing legal documents or contracts
- Processing large text reports or books

### Both Mode

Best for:
- Documents where both the textual content and visual appearance are important
- Cases where you're unsure which mode would work better
- Documents with mixed content types (text, images, tables)
- Situations where you want the most comprehensive analysis

Example use cases:
- Analyzing complex business reports with text and visuals
- Reviewing technical documentation with code samples and diagrams
- Processing educational materials with text explanations and visual examples

## Performance Considerations

- **Image mode** may struggle with extracting accurate text from dense documents but preserves layout and visual elements.
- **Text mode** loses all formatting, images, charts, and tables but is more token-efficient and better for text-focused analysis.
- **Both mode** provides the most comprehensive analysis but uses more tokens and may be more expensive.

## Error Handling

When processing PDFs, you may encounter various errors. Here's how to handle them:

```typescript
try {
  const content = await venice.utils.processFile(pdfPath, { pdfMode: 'text' });
  // Use the content...
} catch (error) {
  if (error.message.includes('File not found')) {
    console.error('The PDF file does not exist:', pdfPath);
  } else if (error.message.includes('Invalid PDF')) {
    console.error('The file is not a valid PDF document');
  } else if (error.message.includes('Text extraction failed')) {
    console.error('Failed to extract text from the PDF, try using image mode instead');
  } else {
    console.error('An error occurred while processing the PDF:', error.message);
  }
}
```

## Advanced Use Cases

### PDF Question Answering

Create a PDF question-answering system:

```typescript
async function askPdfQuestion(pdfPath, question) {
  // Process the PDF in both modes for comprehensive analysis
  const pdfContent = await venice.utils.processFile(pdfPath, { pdfMode: 'both' });
  
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that answers questions about PDF documents. ' +
                 'Provide accurate, concise answers based on the document content.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Please answer the following question about the attached PDF document: ${question}`
          },
          ...(Array.isArray(pdfContent) ? pdfContent : [pdfContent])
        ]
      }
    ]
  });
  
  return response.choices[0].message.content;
}

// Example usage
const answer = await askPdfQuestion('./research-paper.pdf', 'What are the main findings of this research?');
console.log(answer);
```

### PDF Summarization

Create a PDF summarization system:

```typescript
async function summarizePdf(pdfPath, length = 'medium') {
  // Process the PDF in text mode for summarization
  const pdfContent = await venice.utils.processFile(pdfPath, { pdfMode: 'text' });
  
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that summarizes PDF documents. ' +
                 'Provide clear, concise summaries that capture the key points.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Please provide a ${length} summary of the attached PDF document.`
          },
          pdfContent
        ]
      }
    ]
  });
  
  return response.choices[0].message.content;
}

// Example usage
const summary = await summarizePdf('./business-report.pdf', 'short');
console.log(summary);
```

### PDF Data Extraction

Extract structured data from PDFs:

```typescript
async function extractDataFromPdf(pdfPath, dataType) {
  // Process the PDF in both modes for comprehensive analysis
  const pdfContent = await venice.utils.processFile(pdfPath, { pdfMode: 'both' });
  
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that extracts structured data from PDF documents. ' +
                 'Provide the extracted data in JSON format.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Please extract the following data from the attached PDF document: ${dataType}. Respond with JSON only.`
          },
          ...(Array.isArray(pdfContent) ? pdfContent : [pdfContent])
        ]
      }
    ],
    temperature: 0.1 // Lower temperature for more structured output
  });
  
  // Parse the JSON response
  try {
    const jsonStart = response.choices[0].message.content.indexOf('{');
    const jsonEnd = response.choices[0].message.content.lastIndexOf('}') + 1;
    const jsonString = response.choices[0].message.content.substring(jsonStart, jsonEnd);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    return response.choices[0].message.content;
  }
}

// Example usage
const contactData = await extractDataFromPdf('./invoice.pdf', 'contact information, invoice items, and total amount');
console.log(contactData);
```

## Examples

See the [PDF Processing Examples](../../examples/pdf-processing.js) for complete demonstrations of all three PDF processing modes.

## Conclusion

The PDF processing capabilities in Venice Dev Tools v2.1 provide flexible options for working with PDF documents. By choosing the appropriate processing mode for your specific use case, you can optimize for both accuracy and token efficiency.

For most general use cases, the default image mode works well. For text-heavy documents, text mode can be more efficient. For the most comprehensive analysis, both mode provides the best results at the cost of higher token usage.