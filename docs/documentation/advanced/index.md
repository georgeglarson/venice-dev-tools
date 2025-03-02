---
layout: default
title: Venice AI SDK - Advanced Topics
---

# Advanced Topics

This section covers advanced usage and concepts for the Venice AI SDK.

## Topics

- [Streaming Implementation](#streaming-implementation)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Debug Logging](#debug-logging)
- [Custom Configuration](#custom-configuration)
- [Model Feature Suffix](#model-feature-suffix)
- [Web Search](#web-search)
- [Function Calling](#function-calling)
- [Vision Models](#vision-models)

## Streaming Implementation

The Venice AI API uses Server-Sent Events (SSE) format for streaming responses. Each chunk is sent in the format:

```
data: {"id":"...","object":"chat.completion.chunk","choices":[{"delta":{"content":"..."}}]}
```

Our implementation correctly:
1. Makes a direct axios request with `responseType: 'stream'`
2. Parses the SSE format to extract the JSON chunks
3. Yields each chunk as it arrives
4. Handles the final `[DONE]` message

```javascript
// Generate a streaming chat completion
const stream = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Write a poem about AI' }
  ],
  stream: true
});

// Process the stream
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

[Detailed Streaming Documentation](streaming.md)

## Error Handling

The SDK provides detailed error information:

```javascript
try {
  const response = await venice.chat.completions.create({
    model: 'invalid-model',
    messages: [
      { role: 'user', content: 'Hello' }
    ]
  });
} catch (error) {
  console.error('Error:', error.message);
  console.error('Error code:', error.code);
  console.error('Status:', error.status);
  
  if (error.rateLimitInfo) {
    console.error('Rate limit exceeded. Try again after:', 
      new Date(error.rateLimitInfo.reset * 1000).toLocaleString());
  }
}
```

[Detailed Error Handling Documentation](error-handling.md)

## Rate Limiting

The Venice AI API has rate limits for different tiers:

- **Explorer Tier**: Limited requests per minute and day
- **Paid Tier**: Higher limits for paid users

The SDK automatically includes rate limit information in the response metadata:

```javascript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Hello' }
  ]
});

if (response._metadata?.rateLimit) {
  console.log('Rate limit:', response._metadata.rateLimit);
}
```

[Detailed Rate Limiting Documentation](rate-limiting.md)

## Debug Logging

The SDK includes a robust logging system with the following features:

1. **Multiple Log Levels**: ERROR, WARN, INFO, DEBUG, and TRACE levels for different verbosity needs.
2. **Runtime Configuration**: Users can change the log level during runtime using `client.setLogLevel()`.
3. **Convenience Methods**: `enableDebugLogging()` and `disableLogging()` for quick configuration.
4. **Request/Response Logging**: Detailed logging of HTTP requests and responses, with sensitive information automatically redacted.
5. **Custom Log Handlers**: Support for custom log handlers to integrate with existing logging systems.

```javascript
// Enable debug logging at initialization
const venice = new VeniceAI({
  apiKey: 'your-api-key',
  logLevel: 4 // DEBUG level (0=NONE, 1=ERROR, 2=WARN, 3=INFO, 4=DEBUG, 5=TRACE)
});

// Or enable it later
venice.setLogLevel(4); // DEBUG level

// Convenience methods
venice.enableDebugLogging(); // Sets to DEBUG level
venice.disableLogging(); // Sets to NONE level
```

[Detailed Debug Logging Documentation](debug-logging.md)

## Custom Configuration

You can customize the client configuration:

```javascript
const venice = new VeniceAI({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.venice.ai/api/v1',
  timeout: 60000, // 60 seconds
  logLevel: 4, // DEBUG level
  maxRetries: 3
});
```

[Detailed Configuration Documentation](configuration.md)

## Model Feature Suffix

You can use model feature suffixes to enable features in a more concise way:

```javascript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b:enable_web_search=on&include_venice_system_prompt=false',
  messages: [
    { role: 'user', content: 'What are the latest developments in AI?' }
  ]
});
```

This is equivalent to using the `venice_parameters` object but can be more convenient in some cases.

[Detailed Model Feature Suffix Documentation](model-feature-suffix.md)

## Web Search

Enable web search to get up-to-date information:

```javascript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'What are the latest developments in AI?' }
  ],
  venice_parameters: {
    enable_web_search: 'on'
  }
});
```

[Detailed Web Search Documentation](web-search.md)

## Function Calling

Function calling allows the model to call functions defined by you:

```javascript
const response = await venice.chat.completions.create({
  model: 'mistral-codestral-22b',
  messages: [
    { role: 'user', content: 'What\'s the weather in San Francisco?' }
  ],
  functions: [
    {
      name: "get_weather",
      description: "Get the current weather in a location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. San Francisco, CA"
          },
          unit: {
            type: "string",
            enum: ["celsius", "fahrenheit"],
            description: "The temperature unit to use"
          }
        },
        required: ["location"]
      }
    }
  ],
  function_call: 'auto'
});

console.log(response.choices[0].message.function_call);
```

[Detailed Function Calling Documentation](function-calling.md)

## Vision Models

Vision models can analyze images and HTML documents:

```javascript
const fs = require('fs');
const imageBuffer = fs.readFileSync('image.jpg');
const base64Image = imageBuffer.toString('base64');

const response = await venice.chat.completions.create({
  model: 'qwen-2.5-vl',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What\'s in this image?' },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
      ]
    }
  ]
});

console.log(response.choices[0].message.content);
```

[Detailed Vision Models Documentation](vision-models.md)