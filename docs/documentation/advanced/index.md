---
layout: default
title: Advanced Topics - Venice Dev Tools
---

# Advanced Topics

This section covers advanced usage and concepts for the Venice Dev Tools SDK.

## Streaming Implementation {#streaming-implementation}

Streaming allows you to receive responses in real-time as they're generated, rather than waiting for the complete response.

### Chat Streaming

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function streamChatCompletion() {
  const stream = await venice.chat.createCompletionStream({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Write a short story about a robot' }
    ]
  });

  // Process the stream
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
}

streamChatCompletion();
```

### Handling Stream Errors

```javascript
try {
  const stream = await venice.chat.createCompletionStream({
    model: 'llama-3.3-70b',
    messages: [{ role: 'user', content: 'Hello' }]
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
} catch (error) {
  if (error instanceof venice.errors.StreamError) {
    console.error('Stream error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Error Handling {#error-handling}

The SDK provides specific error classes to help you handle different types of errors.

### Error Types

- `ApiError`: Base class for all API errors
- `AuthError`: Authentication errors (invalid API key)
- `ValidationError`: Invalid request parameters
- `RateLimitError`: Rate limit exceeded
- `CapacityError`: Service at capacity
- `NetworkError`: Network-related errors
- `TimeoutError`: Request timeout
- `StreamError`: Errors during streaming
- `PaymentRequiredError`: Account requires payment

### Example: Handling Different Error Types

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import { 
  AuthError, 
  ValidationError, 
  RateLimitError 
} from '@venice-dev-tools/node/errors';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function handleErrors() {
  try {
    const response = await venice.chat.createCompletion({
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'Hello' }]
    });
    
    console.log(response.choices[0].message.content);
  } catch (error) {
    if (error instanceof AuthError) {
      console.error('Authentication error. Check your API key.');
    } else if (error instanceof ValidationError) {
      console.error('Validation error:', error.message);
    } else if (error instanceof RateLimitError) {
      console.error('Rate limit exceeded. Try again later.');
      console.log('Reset at:', new Date(error.resetAt).toLocaleString());
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

handleErrors();
```

## Rate Limiting {#rate-limiting}

The SDK includes built-in rate limit handling to help you manage your API usage.

### Checking Rate Limits

```javascript
const rateLimits = await venice.keys.rateLimits();
console.log('Rate limits:', rateLimits);
```

### Implementing Retry Logic

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import { RateLimitError } from '@venice-dev-tools/node/errors';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function retryOnRateLimit(fn, maxRetries = 3) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof RateLimitError) {
        retries++;
        if (retries >= maxRetries) throw error;
        
        // Wait until rate limit resets
        const waitTime = error.resetAt - Date.now();
        console.log(`Rate limited. Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
}

// Usage
async function main() {
  try {
    const result = await retryOnRateLimit(() => 
      venice.chat.createCompletion({
        model: 'llama-3.3-70b',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    );
    
    console.log(result.choices[0].message.content);
  } catch (error) {
    console.error('Failed after retries:', error);
  }
}

main();
```

## Debug Logging {#debug-logging}

The SDK includes a configurable logging system to help with debugging.

### Setting Log Level

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
  logLevel: 'debug' // 'debug', 'info', 'warn', 'error', or 'none'
});
```

### Custom Logger

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

const customLogger = {
  debug: (...args) => console.debug('[VENICE DEBUG]', ...args),
  info: (...args) => console.info('[VENICE INFO]', ...args),
  warn: (...args) => console.warn('[VENICE WARN]', ...args),
  error: (...args) => console.error('[VENICE ERROR]', ...args)
};

const venice = new VeniceNode({
  apiKey: 'your-api-key',
  logger: customLogger
});
```

## Function Calling {#function-calling}

Function calling allows the model to call functions that you define.

### Defining and Using Functions

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

// Define functions
const functions = [
  {
    name: 'get_weather',
    description: 'Get the current weather in a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g., San Francisco, CA'
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'The unit of temperature'
        }
      },
      required: ['location']
    }
  }
];

// Function implementation
function getWeather(location, unit = 'celsius') {
  // In a real app, you would call a weather API here
  return {
    location,
    temperature: unit === 'celsius' ? 22 : 72,
    unit,
    condition: 'Sunny'
  };
}

async function functionCalling() {
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: "What's the weather like in San Francisco?" }
    ],
    functions,
    function_call: 'auto'
  });
  
  const message = response.choices[0].message;
  
  // Check if the model wants to call a function
  if (message.function_call) {
    const { name, arguments: args } = message.function_call;
    
    if (name === 'get_weather') {
      const parsedArgs = JSON.parse(args);
      const weatherData = getWeather(
        parsedArgs.location, 
        parsedArgs.unit
      );
      
      // Call the model again with the function result
      const secondResponse = await venice.chat.createCompletion({
        model: 'llama-3.3-70b',
        messages: [
          { role: 'user', content: "What's the weather like in San Francisco?" },
          message,
          {
            role: 'function',
            name: 'get_weather',
            content: JSON.stringify(weatherData)
          }
        ]
      });
      
      console.log(secondResponse.choices[0].message.content);
    }
  }
}

functionCalling();
```

## Vision Models {#vision-models}

Vision models can process both text and images.

### Sending Images to Vision Models

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function visionExample() {
  // Read an image file
  const imageBuffer = fs.readFileSync('image.jpg');
  const base64Image = imageBuffer.toString('base64');
  
  const response = await venice.chat.createCompletion({
    model: 'claude-3-opus', // Must be a vision-capable model
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What's in this image?' },
          { type: 'image', image: base64Image }
        ]
      }
    ]
  });
  
  console.log(response.choices[0].message.content);
}

visionExample();
```

## PDF Processing {#pdf-processing}

The SDK includes utilities for processing PDF documents in different modes to optimize for different types of content.

### PDF Processing Modes

The Venice Dev Tools SDK offers three modes for processing PDF files:

1. **Image Mode (Default)**: Processes the PDF as binary data, treating it as an image
2. **Text Mode**: Extracts and processes only the text content from the PDF
3. **Both Mode**: Processes the PDF as both text and binary data, providing the most comprehensive analysis

Each mode has specific use cases:
- **Image mode** is best for PDFs with complex layouts, charts, or diagrams
- **Text mode** is best for text-heavy documents like research papers or articles
- **Both mode** provides the most comprehensive analysis but uses more tokens

### Basic PDF Processing

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function processPdf() {
  // Process PDF with different modes
  // 1. As binary data (default)
  // Note: This doesn't convert the PDF to an image format, but sends it as binary data
  const imageContent = await venice.utils.processFile('./document.pdf');

  // 2. As extracted text
  const textContent = await venice.utils.processFile('./document.pdf', { pdfMode: 'text' });

  // 3. As both text and binary data
  const bothContent = await venice.utils.processFile('./document.pdf', { pdfMode: 'both' });
  
  // Use the processed content with a model
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'system', content: 'Summarize the following document' },
      { role: 'user', content: textContent.text }
    ]
  });
  
  console.log('Summary:', response.choices[0].message.content);
}

processPdf();
```

### CLI PDF Processing

```bash
# Process PDF as binary data (default mode)
venice chat completion --model llama-3.3-70b --attach document.pdf --prompt "Summarize this document"

# Process PDF as text
venice chat completion --model llama-3.3-70b --attach document.pdf --pdf-mode text --prompt "Summarize this document"

# Process PDF as both text and binary data
venice chat completion --model llama-3.3-70b --attach document.pdf --pdf-mode both --prompt "Summarize this document"
```

### Proper PDF-to-Image Conversion

For proper PDF-to-image conversion, you'll need to use external tools:

```javascript
// Using pdf-img-convert library (you'll need to install it first)
// npm install pdf-img-convert
const pdfImgConvert = require('pdf-img-convert');
const pdfImages = await pdfImgConvert.convert('./document.pdf', {
  width: 1024,  // output image width in pixels
  height: 1450  // output image height in pixels
});
// pdfImages is an array of Buffer objects, one for each page
// Save the first page as PNG
fs.writeFileSync('document-page-1.png', pdfImages[0]);
```

From the command line:
```bash
# Using ImageMagick (if installed)
convert -density 150 document.pdf -quality 90 document.png
# Then use the converted image
venice chat completion --model llama-3.3-70b --attach document.png --prompt "Summarize this image"
```

### Known Limitations and Workarounds

The current implementation may have some limitations:

1. **Text Extraction Issues**: You might encounter errors when trying to extract text from PDFs
2. **Image Processing Limitations**: The default image mode doesn't actually convert the PDF to an image format, but sends it as binary data

#### Alternative: Multiple File Attachments

If you encounter issues with PDF processing modes, you can achieve similar functionality by attaching multiple files of different types:

```javascript
// Extract text from PDF using an external tool
const extractedText = fs.readFileSync('document-text.txt', 'utf8');

// Convert PDF to image using an external tool
const imageBuffer = fs.readFileSync('document-image.png');

// Send both to the model
const response = await venice.chat.createCompletion({
  model: 'llama-3.3-70b',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this document: ' + extractedText },
        { type: 'image', image: imageBuffer.toString('base64') }
      ]
    }
  ]
});
```

From the command line:
```bash
# Attach both a text file and an image file
venice chat completion --model llama-3.3-70b --attach ./document.txt,./document.png --prompt "Analyze these files"
```

This approach allows the AI to analyze both textual content and visual elements, providing a comprehensive response.