# Venice AI API Reference

Complete API documentation for the Venice AI platform.

## OpenAPI Schema

The Venice AI API follows the OpenAPI 3.0 specification.

**Latest Schema:** [openapi.yaml](openapi.yaml)

This schema is automatically updated weekly from the live Venice API to ensure accuracy.

### Using the Schema

**View in Swagger UI:**
```bash
npx swagger-ui-dist openapi.yaml
```

**Generate Client Code:**
```bash
# TypeScript
npx openapi-typescript openapi.yaml --output types.ts

# Python
openapi-generator generate -i openapi.yaml -g python -o ./client

# Go
openapi-generator generate -i openapi.yaml -g go -o ./client
```

**Validate Requests:**
```bash
npx openapi-validator validate openapi.yaml
```

## Updating the Schema

The schema is updated automatically via GitHub Actions, but you can also update manually:

```bash
# Fetch latest schema from Venice API
./scripts/update-api-schema.sh
```

This downloads the latest OpenAPI schema from `https://api.venice.ai/api/openapi.json` and saves it to this directory.

## API Endpoints

### Chat Completions

**Endpoint:** `POST /api/v1/chat/completions`

Generate text responses using chat models.

**Models:**
- `llama-3.3-70b` - Meta's latest Llama 3.3 70B
- `llama-3.1-405b` - Meta's largest Llama model
- `gemini-1.5-pro` - Google's Gemini 1.5 Pro
- `gpt-4o` - OpenAI GPT-4o
- See [models list](https://docs.venice.ai/models) for all available models

**Example:**
```typescript
const response = await client.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ],
  temperature: 0.7,
  max_tokens: 500
});
```

**Streaming:**
```typescript
const stream = await client.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

### Image Generation

**Endpoint:** `POST /api/v1/images/generations`

Generate images from text prompts.

**Models:**
- `fluently-xl` - High-quality photorealistic images
- `flux-pro` - Professional-grade image generation
- `stable-diffusion-xl` - Stable Diffusion XL

**Example:**
```typescript
const image = await client.images.generate({
  model: 'fluently-xl',
  prompt: 'A serene mountain landscape at sunset',
  width: 1024,
  height: 1024,
  num_images: 1
});

console.log('Image URL:', image.data[0].url);
```

### Image Upscaling

**Endpoint:** `POST /api/v1/images/upscale`

Enhance image resolution and quality.

**Example:**
```typescript
const upscaled = await client.images.upscale({
  image: fs.readFileSync('input.jpg'),
  scale: 4 // 1x, 2x, or 4x
});

fs.writeFileSync('output.jpg', Buffer.from(await upscaled.arrayBuffer()));
```

### Embeddings

**Endpoint:** `POST /api/v1/embeddings`

Generate vector embeddings for semantic search.

**Models:**
- `text-embedding-004` - Latest text embedding model
- `text-embedding-3-large` - OpenAI-compatible embeddings

**Example:**
```typescript
const response = await client.embeddings.create({
  model: 'text-embedding-004',
  input: 'The quick brown fox jumps over the lazy dog'
});

const vector = response.data[0].embedding;
console.log('Dimensions:', vector.length);
```

### Audio Speech

**Endpoint:** `POST /api/v1/audio/speech`

Convert text to speech audio.

**Models:**
- `musicgen-stereo-small` - Stereo audio generation
- `tts-1` - OpenAI-compatible TTS

**Voices:**
- `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`

**Example:**
```typescript
const audio = await client.audio.speech.create({
  model: 'musicgen-stereo-small',
  input: 'Hello, this is a test of the Venice AI text to speech system.',
  voice: 'alloy'
});

fs.writeFileSync('output.mp3', Buffer.from(await audio.arrayBuffer()));
```

### Models List

**Endpoint:** `GET /api/v1/models`

List all available models and their capabilities.

**Example:**
```typescript
const models = await client.models.list();

models.data.forEach(model => {
  console.log(`${model.id}: ${model.description}`);
  console.log(`  Max tokens: ${model.max_tokens}`);
  console.log(`  Capabilities: ${model.capabilities.join(', ')}`);
});
```

**Filter by capability:**
```typescript
const visionModels = models.data.filter(m => 
  m.capabilities.includes('vision')
);
```

### API Keys Management

**Endpoints:**
- `GET /api/v1/api-keys` - List API keys
- `POST /api/v1/api-keys` - Create API key
- `GET /api/v1/api-keys/{id}` - Get API key details
- `DELETE /api/v1/api-keys/{id}` - Revoke API key

**Example:**
```typescript
// Create key
const key = await client.apiKeys.create({
  name: 'Production Key',
  metadata: { environment: 'prod' }
});

// List keys
const keys = await client.apiKeys.list();

// Revoke key
await client.apiKeys.delete(key.id);
```

## Authentication

All API requests require an API key passed in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

**Get your API key:** https://venice.ai/api

**Security Best Practices:**
- Never hardcode API keys in source code
- Use environment variables: `process.env.VENICE_API_KEY`
- Rotate keys regularly
- Use separate keys for development and production
- Set appropriate key permissions and metadata

## Rate Limits

Venice AI implements rate limiting to ensure fair usage:

| Tier | Requests/Minute | Concurrent Requests |
|------|----------------|---------------------|
| Free | 20 | 2 |
| Pro | 100 | 10 |
| Enterprise | Custom | Custom |

**Rate limit headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699564800
```

**Handling rate limits:**
```typescript
import { VeniceRateLimitError } from '@venice-dev-tools/core/errors';

try {
  const response = await client.chat.completions.create({ /* ... */ });
} catch (error) {
  if (error instanceof VeniceRateLimitError) {
    const retryAfter = error.retryAfter;
    console.log(`Rate limited. Retry after ${retryAfter} seconds`);
    await sleep(retryAfter * 1000);
    // Retry request
  }
}
```

## Error Handling

The API returns structured error responses:

**Error Response Format:**
```json
{
  "error": {
    "type": "invalid_request_error",
    "code": "invalid_api_key",
    "message": "Invalid API key provided",
    "param": null
  }
}
```

**Error Types:**
- `invalid_request_error` - Invalid request parameters
- `authentication_error` - Invalid or missing API key
- `rate_limit_error` - Too many requests
- `server_error` - Internal server error
- `timeout_error` - Request timed out

**SDK Error Classes:**
```typescript
import {
  VeniceAPIError,
  VeniceAuthenticationError,
  VeniceRateLimitError,
  VeniceValidationError,
  VeniceNetworkError,
  VeniceTimeoutError
} from '@venice-dev-tools/core/errors';
```

## Versioning

The Venice AI API uses calendar versioning in the format `YYYY.MM.D`.

**Current Version:** 2025.11.6

**Version Header:**
```
Venice-Version: 2025.11.6
```

**Breaking Changes:**
Breaking changes are announced 30 days in advance via:
- Email notifications
- API changelog
- Discord announcements

**Migration Guides:**
See [Migration Guide](../../docs/migration-guide.md) for version-specific migration instructions.

## Additional Resources

- **API Docs:** https://docs.venice.ai
- **SDK Source:** https://github.com/venice-ai/sdk
- **Status Page:** https://status.venice.ai
- **Support:** support@venice.ai
- **Discord:** https://discord.gg/venice-ai

## Contributing

Found an error in the API schema? Please report it:
- GitHub Issues: https://github.com/venice-ai/sdk/issues
- Email: api-feedback@venice.ai

To update the schema locally:
```bash
./scripts/update-api-schema.sh
```
