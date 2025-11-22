# Venice AI Models Reference

This document provides a comprehensive reference for all available models in the Venice AI platform.

## Quick Reference

Use `venice.models.list()` to get the latest available models programmatically:

```typescript
import { VeniceAI } from '@venice-dev-tools/core';

const venice = new VeniceAI({ apiKey: process.env.VENICE_API_KEY });
const models = await venice.models.list();

console.log(models.data);
```

## Model Categories

### Chat Models (LLMs)

These models are used for text generation, conversation, and completion tasks.

#### Llama 3.3 70B
- **Model ID**: `llama-3.3-70b`
- **Type**: Chat/Completion
- **Context Window**: 128K tokens
- **Best For**: General purpose, reasoning, coding
- **Example**:
  ```typescript
  const response = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [{ role: 'user', content: 'Explain quantum computing' }]
  });
  ```

#### Venice Uncensored
- **Model ID**: `venice-uncensored`
- **Type**: Chat/Completion
- **Context Window**: Varies
- **Best For**: Uncensored responses, creative writing
- **Example**:
  ```typescript
  const response = await venice.chat.completions.create({
    model: 'venice-uncensored',
    messages: [{ role: 'user', content: 'Write a story about...' }]
  });
  ```

#### Qwen 3 4B
- **Model ID**: `qwen3-4b`
- **Type**: Chat/Completion
- **Context Window**: 32K tokens
- **Best For**: Fast responses, lower cost
- **Example**:
  ```typescript
  const response = await venice.chat.completions.create({
    model: 'qwen3-4b',
    messages: [{ role: 'user', content: 'Quick question...' }]
  });
  ```

#### Mistral 3.1 24B
- **Model ID**: `mistral-31-24b`
- **Type**: Chat/Completion
- **Context Window**: 32K tokens
- **Best For**: Balanced performance and speed
- **Example**:
  ```typescript
  const response = await venice.chat.completions.create({
    model: 'mistral-31-24b',
    messages: [{ role: 'user', content: 'Analyze this data...' }]
  });
  ```

### Image Models

These models are used for image generation, editing, and upscaling.

#### Venice SD 3.5
- **Model ID**: `venice-sd35`
- **Type**: Image Generation
- **Resolutions**: 512x512, 768x768, 1024x1024
- **Best For**: General image generation
- **Example**:
  ```typescript
  const image = await venice.images.generate({
    model: 'venice-sd35',
    prompt: 'A serene mountain landscape at sunset',
    width: 1024,
    height: 1024
  });
  ```

#### Fluently XL
- **Model ID**: `fluently-xl`
- **Type**: Image Generation
- **Resolutions**: Custom
- **Best For**: High-quality artistic images
- **Example**:
  ```typescript
  const image = await venice.images.generate({
    model: 'fluently-xl',
    prompt: 'Abstract art with vibrant colors',
    width: 1024,
    height: 1024
  });
  ```

### Embedding Models

These models convert text into vector embeddings for semantic search and similarity.

#### Text Embedding 3 Small
- **Model ID**: `text-embedding-3-small`
- **Type**: Embeddings
- **Dimensions**: 1024
- **Best For**: Semantic search, clustering, recommendations
- **Example**:
  ```typescript
  const embeddings = await venice.embeddings.create({
    model: 'text-embedding-3-small',
    input: 'The quick brown fox jumps over the lazy dog'
  });
  
  console.log(embeddings.data[0].embedding.length); // 1024
  ```

#### Text Embedding 3 Large
- **Model ID**: `text-embedding-3-large`
- **Type**: Embeddings
- **Dimensions**: 3072
- **Best For**: High-precision semantic search
- **Example**:
  ```typescript
  const embeddings = await venice.embeddings.create({
    model: 'text-embedding-3-large',
    input: 'Complex technical documentation'
  });
  ```

### Audio Models

These models are used for text-to-speech synthesis.

#### TTS Models
- **Available Voices**: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`
- **Formats**: MP3, WAV, AAC, FLAC
- **Example**:
  ```typescript
  const audio = await venice.audio.speech.create({
    input: 'Hello from Venice AI!',
    voice: 'alloy',
    response_format: 'mp3'
  });
  ```

## Model Discovery Helpers

### List All Models

```typescript
const models = await venice.models.list();
console.log(models.data);
```

### Filter Models by Type

```typescript
const models = await venice.models.list();

// Chat models
const chatModels = models.data.filter(m => 
  m.id.includes('llama') || 
  m.id.includes('qwen') || 
  m.id.includes('mistral')
);

// Image models
const imageModels = models.data.filter(m => 
  m.id.includes('sd') || 
  m.id.includes('fluently')
);

// Embedding models
const embeddingModels = models.data.filter(m => 
  m.id.includes('embedding')
);
```

### Get Model Details

```typescript
const model = await venice.models.retrieve('llama-3.3-70b');
console.log(model);
```

## Model Selection Guide

### For Chat/Completion Tasks

| Use Case | Recommended Model | Why |
|----------|------------------|-----|
| General conversation | `llama-3.3-70b` | Best overall performance |
| Fast responses | `qwen3-4b` | Lower latency, good quality |
| Creative writing | `venice-uncensored` | No content filters |
| Code generation | `llama-3.3-70b` | Strong reasoning abilities |
| Long context | `llama-3.3-70b` | 128K token window |

### For Image Generation

| Use Case | Recommended Model | Why |
|----------|------------------|-----|
| General images | `venice-sd35` | Reliable, fast |
| Artistic images | `fluently-xl` | Higher quality |
| Quick previews | `venice-sd35` | Faster generation |

### For Embeddings

| Use Case | Recommended Model | Why |
|----------|------------------|-----|
| Semantic search | `text-embedding-3-small` | Good balance |
| High precision | `text-embedding-3-large` | More dimensions |
| Large datasets | `text-embedding-3-small` | Faster, smaller |

## Common Model Parameters

### Chat Models

```typescript
{
  model: 'llama-3.3-70b',
  messages: [...],
  temperature: 0.7,        // 0-1, controls randomness
  max_tokens: 1000,        // Maximum response length
  top_p: 1.0,             // Nucleus sampling
  frequency_penalty: 0,    // -2 to 2, penalize repetition
  presence_penalty: 0,     // -2 to 2, encourage new topics
  stop: ['END'],          // Stop sequences
  stream: false           // Enable streaming
}
```

### Image Models

```typescript
{
  model: 'venice-sd35',
  prompt: 'A beautiful landscape',
  width: 1024,
  height: 1024,
  num_inference_steps: 50,
  guidance_scale: 7.5
}
```

### Embedding Models

```typescript
{
  model: 'text-embedding-3-small',
  input: 'Text to embed',
  encoding_format: 'float'  // or 'base64'
}
```

## Model Availability

To check if a model is currently available:

```typescript
try {
  const model = await venice.models.retrieve('model-name');
  console.log('Model is available:', model.id);
} catch (error) {
  console.error('Model not found');
}
```

## Model Updates

Models are regularly updated. Use calendar versioning to track changes:

- SDK version `2025.11.83` corresponds to Venice API state on Nov 8, 2025
- Check the [CHANGELOG](../../CHANGELOG.md) for model additions/changes
- Use `venice.models.list()` to get the latest available models

## Troubleshooting

### Model Not Found (404)

If you get a 404 error:

1. Check the model name spelling
2. Verify the model exists: `await venice.models.list()`
3. Ensure you're using the latest SDK version
4. Check the [Venice AI documentation](https://docs.venice.ai)

### Wrong Model Type

If you get unexpected results:

1. Verify you're using the correct endpoint for the model type
2. Chat models → `venice.chat.completions.create()`
3. Image models → `venice.images.generate()`
4. Embedding models → `venice.embeddings.create()`

## Additional Resources

- [Venice AI Official Docs](https://docs.venice.ai)
- [SDK API Reference](../api-reference/)
- [Examples](../../examples/)
- [Model Pricing](https://venice.ai/pricing)
