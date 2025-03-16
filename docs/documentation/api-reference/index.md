---
layout: default
title: API Reference - Venice Dev Tools | Complete SDK Documentation
description: "Comprehensive API reference for Venice Dev Tools SDK. Detailed documentation for Chat API, Image API, Models API, API Keys, Characters, and more."
keywords: "Venice Dev Tools API, Venice AI SDK, Chat API, Image API, Models API, API Keys, Characters, VVV Token"
---

# API Reference

This section provides detailed documentation for all API resources and endpoints available in the Venice Dev Tools SDK.

## Chat API {#chat}

The Chat API allows you to generate text responses using Venice AI models.

### Methods

#### `createCompletion(options)`

Generate a text completion.

```javascript
const response = await venice.chat.createCompletion({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Tell me about AI' }
  ]
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | The model to use (e.g., 'llama-3.3-70b', 'claude-3-opus') |
| messages | array | Yes | Array of message objects with 'role' and 'content' |
| character | string | No | Character to use for the response (e.g., 'Scientist') |
| web_search | boolean | No | Whether to enable web search capability |
| temperature | number | No | Controls randomness (0.0 to 1.0) |
| max_tokens | number | No | Maximum number of tokens to generate |

**Response:**

```javascript
{
  id: 'chat-123456789',
  object: 'chat.completion',
  created: 1741905763,
  model: 'llama-3.3-70b',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: 'AI, or Artificial Intelligence, refers to...'
      },
      finish_reason: 'stop'
    }
  ],
  usage: {
    prompt_tokens: 25,
    completion_tokens: 150,
    total_tokens: 175
  }
}
```

#### `createCompletionStream(options)`

Generate a streaming text completion.

```javascript
const stream = await venice.chat.createCompletionStream({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Tell me about AI' }
  ]
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

**Parameters:** Same as `createCompletion`

**Response:** Stream of delta objects

## Image API {#image}

The Image API allows you to generate and manipulate images.

### Methods

#### `generate(options)`

Generate an image based on a text prompt.

```javascript
const response = await venice.images.generate({
  model: 'sdxl',
  prompt: 'A serene mountain landscape at sunset',
  style: 'photographic',
  width: 1024,
  height: 1024
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | The model to use (e.g., 'sdxl', 'dalle3') |
| prompt | string | Yes | Text description of the desired image |
| style | string | No | Style to apply (e.g., 'photographic', 'digital-art') |
| width | number | No | Width of the generated image |
| height | number | No | Height of the generated image |

**Response:**

```javascript
{
  id: 'img-123456789',
  created: 1741905763,
  model: 'sdxl',
  image: 'base64-encoded-image-data'
}
```

#### `upscale(options)`

Upscale an existing image.

```javascript
const response = await venice.images.upscale({
  image: 'base64-encoded-image-data',
  scale: 2
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| image | string | Yes | Base64-encoded image data |
| scale | number | Yes | Scale factor (1.5, 2, or 4) |

**Response:**

```javascript
{
  id: 'upscale-123456789',
  created: 1741905763,
  image: 'base64-encoded-upscaled-image-data'
}
```

## Models API {#models}

The Models API provides information about available models.

### Methods

#### `list()`

List all available models.

```javascript
const models = await venice.models.list();
```

**Response:**

```javascript
{
  models: [
    {
      id: 'llama-3.3-70b',
      name: 'Llama 3.3 70B',
      capabilities: ['chat', 'function-calling'],
      context_length: 128000
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      capabilities: ['chat', 'vision'],
      context_length: 200000
    }
    // More models...
  ]
}
```

## API Keys {#api-keys}

The API Keys API allows you to manage your Venice AI API keys.

### Methods

#### `list()`

List all your API keys.

```javascript
const keys = await venice.apiKeys.list();
```

#### `create(options)`

Create a new API key.

```javascript
const key = await venice.apiKeys.create({
  name: 'My New API Key',
  expiration: '30d'
});
```

#### `delete(keyId)`

Delete an API key.

```javascript
await venice.apiKeys.delete('key-123456789');
```

#### `rateLimits()`

Get rate limit information for your API keys.

```javascript
const limits = await venice.apiKeys.rateLimits();
```

> **Note:** The API Keys endpoint can be accessed via both `venice.apiKeys` and `venice.keys` for backward compatibility, but `venice.apiKeys` is the recommended approach.

## Characters {#characters}

The Characters API allows you to interact with predefined AI characters.

### Methods

#### `list()`

List all available characters.

```javascript
const characters = await venice.characters.list();
```

**Response:**

```javascript
{
  characters: [
    {
      id: 'scientist',
      name: 'Scientist',
      description: 'An expert in scientific fields'
    },
    {
      id: 'creative-writer',
      name: 'Creative Writer',
      description: 'Skilled at generating creative content'
    }
    // More characters...
  ]
}
```

## VVV Token {#vvv-token}

The VVV Token API provides information about the Venice VVV token.

### Methods

#### `info()`

Get information about the VVV token.

```javascript
const tokenInfo = await venice.token.info();
```

**Response:**

```javascript
{
  circulatingSupply: 1000000000,
  totalSupply: 2000000000,
  networkUtilization: 0.75,
  stakingYield: 0.05
}