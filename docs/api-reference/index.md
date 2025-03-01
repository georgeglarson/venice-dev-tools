---
layout: default
title: Venice AI SDK - API Reference
---

# API Reference

This section provides detailed documentation for all the API resources and endpoints available in the Venice AI SDK.

## Resources

- [Chat](#chat)
- [Image](#image)
- [Models](#models)
- [API Keys](#api-keys)
- [Characters](#characters)
- [VVV Token](#vvv-token)

## Chat

The Chat API allows you to generate text responses in a chat-like format.

### Chat Completions

```javascript
// Basic chat completion
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Tell me about AI' }
  ]
});

// With web search
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'What are the latest developments in AI?' }
  ],
  venice_parameters: {
    enable_web_search: 'on'
  }
});

// Streaming
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

[Detailed Chat API Documentation](chat.md)

## Image

The Image API allows you to generate and manipulate images.

### Generate Images

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

### Upscale Images

```javascript
const response = await venice.image.upscale({
  image: base64EncodedImage,
  scale: 2
});

console.log(response.url);
```

### List Image Styles

```javascript
const response = await venice.image.styles.list();

console.log(response.styles);
```

[Detailed Image API Documentation](image.md)

## Models

The Models API allows you to retrieve information about available models.

### List Models

```javascript
const response = await venice.models.list();

console.log(response.data);
```

### Get Model Traits

```javascript
const response = await venice.models.traits();

console.log(response.traits);
```

### Get Model Compatibility Mappings

```javascript
const response = await venice.models.compatibility();

console.log(response.mappings);
```

[Detailed Models API Documentation](models.md)

## API Keys

The API Keys API allows you to manage your API keys.

### List API Keys

```javascript
const response = await venice.apiKeys.list();

console.log(response.keys);
```

### Create API Key

```javascript
const response = await venice.apiKeys.create({
  name: 'My New API Key'
});

console.log(response.key);
```

### Delete API Key

```javascript
const response = await venice.apiKeys.delete({
  id: 'api-key-id'
});

console.log(response.success);
```

### Get API Key Rate Limits

```javascript
const response = await venice.apiKeys.rateLimits();

console.log(response.rate_limits);
```

[Detailed API Keys Documentation](api-keys.md)

## Characters

The Characters API allows you to interact with predefined AI personalities.

### List Characters

```javascript
const response = await venice.characters.list();

console.log(response.data);
```

### Chat with a Character

```javascript
const response = await venice.chat.completions.create({
  model: "default",
  messages: [
    { role: "user", content: "Tell me about yourself" }
  ],
  venice_parameters: {
    character_slug: "sophia-sophie-daniels"
  }
});

console.log(response.choices[0].message.content);
```

[Detailed Characters API Documentation](characters.md)

## VVV Token

The VVV Token API allows you to retrieve information about the VVV token.

### Get Circulating Supply

```javascript
const response = await venice.vvv.circulatingSupply();

console.log(response.supply);
```

### Get Network Utilization

```javascript
const response = await venice.vvv.utilization();

console.log(response.utilization);
```

### Get Staking Yield

```javascript
const response = await venice.vvv.stakingYield();

console.log(response.yield);
```

[Detailed VVV Token API Documentation](vvv.md)