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

The SDK includes utilities for processing PDF documents.

### Basic PDF Processing

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function processPdf() {
  // Read a PDF file
  const pdfBuffer = fs.readFileSync('document.pdf');
  const base64Pdf = pdfBuffer.toString('base64');
  
  // Process the PDF
  const result = await venice.pdf.process({
    pdf: base64Pdf,
    mode: 'text', // 'text', 'image', or 'both'
    pages: 'all'
  });
  
  console.log('Extracted text:', result.text);
  
  // Use the processed content with a model
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'system', content: 'Summarize the following document' },
      { role: 'user', content: result.text }
    ]
  });
  
  console.log('Summary:', response.choices[0].message.content);
}

processPdf();
```

### PDF Processing Modes

```javascript
// Text mode (extract text only)
const textResult = await venice.pdf.process({
  pdf: base64Pdf,
  mode: 'text',
  pages: '1-3'
});

// Image mode (convert pages to images)
const imageResult = await venice.pdf.process({
  pdf: base64Pdf,
  mode: 'image',
  pages: '1'
});

// Both modes (extract text and convert to images)
const bothResult = await venice.pdf.process({
  pdf: base64Pdf,
  mode: 'both',
  pages: 'all'
});