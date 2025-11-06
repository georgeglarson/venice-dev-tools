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
# Contributing Examples

Guidelines for writing high-quality examples for the Venice AI SDK.

## Philosophy

Examples should be:
1. **Self-contained** - Run independently without external dependencies
2. **Well-documented** - Explain what, why, and how
3. **Production-ready** - Demonstrate best practices, not shortcuts
4. **Progressive** - Start simple, build complexity gradually
5. **Tested** - All examples must run successfully

## Directory Structure

```
examples/
├── quickstart/           # 5-minute getting started
│   └── README.md
├── typescript/           # Numbered TypeScript examples
│   ├── 01-hello-world.ts
│   ├── 02-streaming-chat.ts
│   └── ...
├── javascript/           # JavaScript examples
│   └── qwen-vision-example.js
├── shell/               # Shell script examples
│   ├── qwen-vision-curl-example.sh
│   └── venice-vision-stream-cli.sh
└── README.md            # Example catalog
```

## Naming Conventions

### TypeScript Examples

Use numbered prefixes to indicate progression:

```
01-03: Beginner (hello world, basic concepts)
04-09: Core features (images, embeddings, audio, models)
10-15: Advanced patterns (multi-turn, vision, abort, rate limits)
16+:   Professional/Production (monitoring, scaling, edge cases)
```

**Format:** `NN-descriptive-name.ts`

**Examples:**
- ✅ `01-hello-world.ts`
- ✅ `11-vision-multimodal.ts`
- ❌ `hello-world.ts` (missing number)
- ❌ `1-hello-world.ts` (single digit)

### JavaScript Examples

Use descriptive names without numbers:

**Format:** `feature-description-example.js`

**Examples:**
- ✅ `qwen-vision-example.js`
- ✅ `streaming-chat-example.js`
- ❌ `example.js` (too generic)

### Shell Scripts

Use descriptive names with technology/model:

**Format:** `model-feature-tool.sh`

**Examples:**
- ✅ `qwen-vision-curl.sh`
- ✅ `venice-vision-stream-cli.sh`
- ❌ `test.sh` (too generic)

## Code Style

### TypeScript

```typescript
// ✅ Good Example Structure

/**
 * Example: Vision Multimodal Chat
 * 
 * Demonstrates how to:
 * - Use vision-capable models
 * - Send images via URLs
 * - Analyze image content
 * - Handle multimodal responses
 * 
 * Prerequisites:
 * - VENICE_API_KEY environment variable
 * - Image URL (local or remote)
 */

import { VeniceClient } from '@venice-dev-tools/core';
import { VeniceAPIError } from '@venice-dev-tools/core/errors';

// Configuration
const API_KEY = process.env.VENICE_API_KEY;
if (!API_KEY) {
  throw new Error('VENICE_API_KEY environment variable required');
}

// Initialize client
const client = new VeniceClient({ apiKey: API_KEY });

// Main function
async function main() {
  try {
    // Your example code here
    
  } catch (error) {
    // Proper error handling
    if (error instanceof VeniceAPIError) {
      console.error('API Error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    process.exit(1);
  }
}

// Run
main();
```

**Key Points:**
- Document purpose and prerequisites at top
- Validate environment variables
- Use proper error handling
- Exit with non-zero code on failure
- Use async/await, not callbacks
- Include type annotations where helpful

### JavaScript

```javascript
// ✅ Good Example Structure

/**
 * Example: Qwen Vision
 * 
 * Demonstrates vision API using plain JavaScript.
 * 
 * Prerequisites:
 * - Node.js 18+
 * - VENICE_API_KEY environment variable
 */

const { VeniceClient } = require('@venice-dev-tools/core');

// Configuration
const API_KEY = process.env.VENICE_API_KEY;
if (!API_KEY) {
  console.error('Error: VENICE_API_KEY environment variable required');
  process.exit(1);
}

// Initialize client
const client = new VeniceClient({ apiKey: API_KEY });

// Main function
async function main() {
  try {
    // Your example code here
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run
main();
```

### Shell Scripts

```bash
#!/bin/bash
# Example: Venice Vision Stream CLI
#
# Demonstrates streaming vision API using curl.
#
# Prerequisites:
# - curl installed
# - jq installed (for JSON parsing)
# - VENICE_API_KEY environment variable

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration
API_KEY="${VENICE_API_KEY:-}"
if [ -z "$API_KEY" ]; then
    echo "Error: VENICE_API_KEY environment variable required" >&2
    exit 1
fi

# Your example code here
```

**Key Points:**
- Use `#!/bin/bash` shebang
- Document purpose and prerequisites
- Use `set -e` and `set -u` for safety
- Validate environment variables
- Use descriptive variable names (UPPER_CASE)

## Documentation Standards

### Example Header

Every example must start with a clear header:

```typescript
/**
 * Example: [Descriptive Title]
 * 
 * [2-3 sentence description of what this example demonstrates]
 * 
 * Demonstrates how to:
 * - [Key concept 1]
 * - [Key concept 2]
 * - [Key concept 3]
 * 
 * Prerequisites:
 * - [Requirement 1]
 * - [Requirement 2]
 * 
 * Usage:
 *   bun run examples/typescript/XX-example-name.ts
 */
```

### Inline Comments

Use comments to explain **why**, not **what**:

```typescript
// ✅ Good - explains why
// Use streaming to provide immediate feedback to users
const stream = await client.chat.completions.create({ stream: true });

// ❌ Bad - states the obvious
// Create a streaming request
const stream = await client.chat.completions.create({ stream: true });
```

**When to comment:**
- Non-obvious design decisions
- Performance considerations
- Security implications
- Edge cases or workarounds

**When NOT to comment:**
- Self-explanatory code
- Variable declarations
- Simple function calls

### Console Output

Provide helpful output:

```typescript
// ✅ Good - informative output
console.log('Starting vision analysis...');
console.log(`Model: ${response.model}`);
console.log(`Tokens used: ${response.usage.total_tokens}`);
console.log('\nResponse:');
console.log(response.choices[0].message.content);

// ❌ Bad - unclear output
console.log(response);
```

## Environment Variables

### Required Variables

Always validate required environment variables:

```typescript
const API_KEY = process.env.VENICE_API_KEY;
if (!API_KEY) {
  throw new Error('VENICE_API_KEY environment variable required');
}
```

### Optional Variables

Provide sensible defaults:

```typescript
const MODEL = process.env.MODEL || 'llama-3.3-70b';
const TIMEOUT = parseInt(process.env.TIMEOUT || '60000', 10);
```

### .env.example

Update `examples/.env.example` when adding new variables:

```bash
# Required
VENICE_API_KEY=your_api_key_here

# Optional (for specific examples)
MODEL=llama-3.3-70b
IMAGE_URL=https://example.com/image.jpg
AUDIO_OUTPUT_PATH=/path/to/output.mp3
```

## Error Handling

### Always Handle Errors

```typescript
// ✅ Good - specific error handling
try {
  const response = await client.chat.completions.create({ /* ... */ });
} catch (error) {
  if (error instanceof VeniceAuthenticationError) {
    console.error('Invalid API key. Get yours at https://venice.ai/api');
  } else if (error instanceof VeniceRateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter}s`);
  } else if (error instanceof VeniceAPIError) {
    console.error(`API Error: ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
  process.exit(1);
}

// ❌ Bad - generic error handling
try {
  const response = await client.chat.completions.create({ /* ... */ });
} catch (error) {
  console.error('Error occurred');
}
```

### Exit Codes

Use proper exit codes:

```typescript
// Success
process.exit(0);

// Failure
process.exit(1);
```

## Testing Examples

### Validation Script

All examples are tested via `scripts/validate-examples.sh`:

```bash
# Run validation
./scripts/validate-examples.sh

# TypeScript examples must compile
# JavaScript examples must have valid syntax
# Shell scripts must pass shellcheck
```

### Manual Testing

Before submitting, test your example:

```bash
# TypeScript
bun run examples/typescript/XX-your-example.ts

# JavaScript
node examples/javascript/your-example.js

# Shell
chmod +x examples/shell/your-example.sh
./examples/shell/your-example.sh
```

### CI/CD

Examples are automatically tested on:
- Pull requests
- Commits to main branch
- Weekly scheduled runs

See `.github/workflows/validate-examples.yml`

## Adding New Examples

### Step 1: Choose Category

Determine where your example belongs:

- **Quickstart** - First-time users (README only)
- **TypeScript Beginner (01-03)** - Hello world, streaming, errors
- **TypeScript Core (04-09)** - Config, images, embeddings, audio, models
- **TypeScript Advanced (10-15)** - Multi-turn, vision, abort, rate limits
- **TypeScript Pro (16+)** - Production patterns
- **JavaScript** - Pure JS examples
- **Shell** - CLI/curl examples

### Step 2: Create File

Use the appropriate naming convention:

```bash
# TypeScript
touch examples/typescript/XX-descriptive-name.ts

# JavaScript
touch examples/javascript/descriptive-name-example.js

# Shell
touch examples/shell/model-feature-tool.sh
chmod +x examples/shell/model-feature-tool.sh
```

### Step 3: Write Code

Follow the code style guidelines above.

### Step 4: Test

```bash
# Run your example
bun run examples/typescript/XX-your-example.ts

# Validate all examples
./scripts/validate-examples.sh
```

### Step 5: Update Catalog

Add your example to `examples/README.md`:

```markdown
## Example Categories

### Advanced Examples

| Example | Description | Key Concepts |
|---------|-------------|--------------|
| [16-your-example.ts](typescript/16-your-example.ts) | Your description | Key concept 1, Key concept 2 |
```

### Step 6: Submit PR

```bash
git checkout -b add-example-your-feature
git add examples/
git commit -m "docs: add example for [feature]"
git push -u origin add-example-your-feature

# Create PR on GitHub
gh pr create --title "Add example: [feature]" --body "Description of example"
```

## Review Checklist

Before submitting, verify:

- [ ] Example follows naming conventions
- [ ] Code includes header documentation
- [ ] Environment variables are validated
- [ ] Errors are handled properly
- [ ] Example runs successfully
- [ ] `examples/README.md` is updated
- [ ] Code style is consistent
- [ ] No hardcoded secrets or API keys
- [ ] Console output is helpful
- [ ] Example is self-contained

## Common Mistakes

### ❌ Hardcoded API Keys

```typescript
// NEVER do this
const client = new VeniceClient({ apiKey: 'sk-1234567890' });
```

### ❌ Missing Error Handling

```typescript
// NEVER do this
const response = await client.chat.completions.create({ /* ... */ });
console.log(response);
```

### ❌ Generic Console Output

```typescript
// NEVER do this
console.log(response);
```

### ❌ Missing Documentation

```typescript
// NEVER do this
import { VeniceClient } from '@venice-dev-tools/core';
const client = new VeniceClient({ apiKey: process.env.VENICE_API_KEY });
// ... rest of code
```

## Resources

- [Example Catalog](../../examples/README.md)
- [Validation Script](../../scripts/validate-examples.sh)
- [SDK Documentation](../README.md)
- [API Reference](../api/README.md)

## Questions?

- GitHub Discussions: https://github.com/venice-ai/sdk/discussions
- Discord: https://discord.gg/venice-ai
- Email: sdk-feedback@venice.ai
