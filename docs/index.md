---
layout: default
title: Venice AI SDK Documentation
---

# Venice AI SDK Documentation

Welcome to the Venice AI SDK documentation. This SDK provides a simple, intuitive interface for interacting with the Venice AI API.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Resources](#api-resources)
  - [Chat](#chat)
  - [Image](#image)
  - [Models](#models)
  - [API Keys](#api-keys)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Advanced Usage](#advanced-usage)
- [Examples](#examples)

## Installation

Install the Venice AI SDK using npm:

```bash
npm install venice-ai-sdk-apl
```

## Getting Started

Here's a simple example to get you started:

```javascript
import { VeniceAI } from 'venice-ai-sdk-apl';

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
      enable_web_search: 'on',
      include_venice_system_prompt: true
    }
  });
  
  console.log(response.choices[0].message.content);
}

generateChatCompletion();
```

## Authentication

The Venice AI SDK requires an API key for authentication. You can obtain an API key from the [Venice AI website](https://venice.ai/settings/api).

```javascript
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});
```

## API Resources

The Venice AI SDK provides access to the following API resources:

### Chat

The Chat API allows you to generate text responses in a chat-like format.

```javascript
// Generate a chat completion
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Tell me about AI' }
  ]
});
```

#### Streaming

You can also stream the response:

```javascript
const stream = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Tell me about AI' }
  ],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

#### Web Search

Enable web search to get up-to-date information:

```javascript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'What are the latest developments in AI?' }
  ],
  venice_parameters: {
    enable_web_search: 'on'
  }
});
```

### Image

The Image API allows you to generate and manipulate images.

#### Generate Images

```javascript
const response = await venice.image.generate({
  model: 'fluently-xl',
  prompt: 'A beautiful sunset over a mountain range',
  negative_prompt: 'blurry, distorted, low quality',
  style_preset: '3D Model',
  height: 1024,
  width: 1024
});

console.log(response.images[0].url);
```

#### Upscale Images

```javascript
const response = await venice.image.upscale({
  model: 'upscale-model',
  image: base64EncodedImage,
  scale: 2
});

console.log(response.url);
```

#### List Image Styles

```javascript
const response = await venice.image.styles.list();

console.log(response.styles);
```

### Models

The Models API allows you to retrieve information about available models.

#### List Models

```javascript
const response = await venice.models.list();

console.log(response.data);
```

#### Get Model Traits

```javascript
const response = await venice.models.traits();

console.log(response.traits);
```

#### Get Model Compatibility Mappings

```javascript
const response = await venice.models.compatibility();

console.log(response.mappings);
```

### API Keys

The API Keys API allows you to manage your API keys.

#### List API Keys

```javascript
const response = await venice.apiKeys.list();

console.log(response.keys);
```

#### Create API Key

```javascript
const response = await venice.apiKeys.create({
  name: 'My New API Key'
});

console.log(response.key);
```

#### Delete API Key

```javascript
const response = await venice.apiKeys.delete({
  id: 'api-key-id'
});

console.log(response.success);
```

#### Get API Key Rate Limits

```javascript
const response = await venice.apiKeys.rateLimits();

console.log(response.rate_limits);
```

#### Generate API Key with Web3 Wallet

```javascript
// Get message to sign
const messageResponse = await venice.apiKeys.web3.getMessage({
  wallet_address: '0x1234567890abcdef1234567890abcdef12345678'
});

// Sign the message (using a Web3 wallet)
const signature = await web3.eth.personal.sign(
  messageResponse.message,
  '0x1234567890abcdef1234567890abcdef12345678',
  '' // Password
);

// Generate API key
const keyResponse = await venice.apiKeys.web3.generateKey({
  wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
  signature: signature,
  name: 'My Web3 API Key'
});

console.log(keyResponse.key);
```

## Error Handling

The Venice AI SDK provides detailed error information:

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

## Advanced Usage

### Model Feature Suffix

You can use model feature suffixes to enable features:

```javascript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b:enable_web_search=on&include_venice_system_prompt=false',
  messages: [
    { role: 'user', content: 'What are the latest developments in AI?' }
  ]
});
```

### Custom Configuration

You can customize the client configuration:

```javascript
const venice = new VeniceAI({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.venice.ai/api/v1',
  timeout: 60000, // 60 seconds
  maxRetries: 3
});
```

## Examples

For more examples, check out the examples directory:

- [Basic Chat](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/chat/basic-chat.js)
- [Streaming Chat](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/chat/streaming.js)
- [Web Search Chat](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/chat/web-search.js)
- [Generate Image](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/image/generate-image.js)
- [List Models](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/models/list-models.js)
- [Manage API Keys](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/api-keys/manage-keys.js)