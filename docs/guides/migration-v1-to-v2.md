# Migrating from Venice AI SDK v1 to Venice Dev Tools v2.1

This guide will help you migrate your code from Venice AI SDK v1 to Venice Dev Tools v2.1. The new version includes significant API changes and new features.

## Key Changes

### Package Name and Import Syntax

**Venice AI SDK v1:**
```javascript
import { VeniceAI } from 'venice-ai-sdk';
// or
const { VeniceAI } = require('venice-ai-sdk');
```

**Venice Dev Tools v2.1:**
```javascript
// For Node.js
import { VeniceNode } from '@venice-dev-tools/node';
// or
const { VeniceNode } = require('@venice-dev-tools/node');

// For browser
import { VeniceWeb } from '@venice-dev-tools/web';
```

### Class Names

**Venice AI SDK v1:**
```javascript
const venice = new VeniceAI({
  apiKey: 'your-api-key'
});
```

**Venice Dev Tools v2.1:**
```javascript
// For Node.js
const venice = new VeniceNode({
  apiKey: 'your-api-key'
});

// For browser
const venice = new VeniceWeb({
  apiKey: 'your-api-key'
});
```

### Method Names

**Venice AI SDK v1:**
```javascript
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
});
```

**Venice Dev Tools v2.1:**
```javascript
const response = await venice.chat.createCompletion({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
});
```

### Streaming API

**Venice AI SDK v1:**
```javascript
const stream = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Tell me a story.' }
  ],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

**Venice Dev Tools v2.1:**
```javascript
const streamGenerator = venice.chat.streamCompletion({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Tell me a story.' }
  ],
  stream: true
});

for await (const chunk of streamGenerator) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

### Image Generation

**Venice AI SDK v1:**
```javascript
const image = await venice.images.generations.create({
  model: 'stable-diffusion-3',
  prompt: 'A futuristic city',
  n: 1,
  size: 1024
});
```

**Venice Dev Tools v2.1:**
```javascript
const image = await venice.images.generate({
  model: 'stable-diffusion-3',
  prompt: 'A futuristic city',
  n: 1,
  size: 1024
});
```

### API Key Management

**Venice AI SDK v1:**
```javascript
const keys = await venice.apiKeys.list();
const newKey = await venice.apiKeys.create({ name: 'My API Key' });
```

**Venice Dev Tools v2.1:**
```javascript
const keys = await venice.keys.list();
const newKey = await venice.keys.create({ name: 'My API Key' });
```

## Package Structure Changes

Venice Dev Tools v2.1 is now a monorepo with separate packages:

- `@venice-dev-tools/core`: Core functionality and types
- `@venice-dev-tools/node`: Node.js-specific implementation
- `@venice-dev-tools/web`: Browser-specific implementation

This structure allows for better code organization and platform-specific optimizations.

## New Features in v2.1

### PDF Processing

Venice Dev Tools v2.1 introduces PDF processing capabilities:

```javascript
// Process a PDF file
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
```

### Vision/Multimodal Capabilities

Venice Dev Tools v2.1 supports vision and multimodal capabilities:

```javascript
const response = await venice.chat.createCompletion({
  model: 'qwen-2.5-vl',
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'What's in this image?'
        },
        {
          type: 'image_url',
          image_url: {
            url: 'https://example.com/image.jpg'
          }
        }
      ]
    }
  ]
});
```

### Web3 Key Management

Venice Dev Tools v2.1 introduces Web3 authentication for API key management:

```javascript
// Generate a token
const tokenResponse = await venice.keys.generateWeb3Token();
const token = tokenResponse.token;

// Sign the token with a Web3 wallet (example using ethers.js)
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send('eth_requestAccounts', []);
const signer = provider.getSigner();
const address = await signer.getAddress();
const signature = await signer.signMessage(token);

// Create an API key with Web3 authentication
const newKey = await venice.keys.createWithWeb3({
  address: address,
  signature: signature,
  token: token,
  description: 'My Web3 API Key',
  apiKeyType: 'INFERENCE',
  consumptionLimit: {
    vcu: 100,
    usd: 50
  }
});
```

## Migration Steps

1. Update your package dependencies:
   ```bash
   npm uninstall venice-ai-sdk
   npm install @venice-dev-tools/node  # or @venice-dev-tools/web for browser
   ```

2. Update your imports:
   ```javascript
   // From
   import { VeniceAI } from 'venice-ai-sdk';
   // To
   import { VeniceNode } from '@venice-dev-tools/node';
   ```

3. Update your client initialization:
   ```javascript
   // From
   const venice = new VeniceAI({ apiKey: 'your-api-key' });
   // To
   const venice = new VeniceNode({ apiKey: 'your-api-key' });
   ```

4. Update your method calls:
   ```javascript
   // From
   const response = await venice.chat.completions.create({...});
   // To
   const response = await venice.chat.createCompletion({...});
   ```

5. Update your error handling:
   ```javascript
   // From
   import { VeniceError } from 'venice-ai-sdk';
   // To
   import { VeniceApiError } from '@venice-dev-tools/core';
   ```

6. Update your streaming implementation:
   ```javascript
   // From
   const stream = await venice.chat.completions.create({ stream: true, ... });
   // To
   const streamGenerator = venice.chat.streamCompletion({ stream: true, ... });
   ```

## Troubleshooting Common Migration Issues

### Error: Cannot find module '@venice-dev-tools/node'

Make sure you've installed the new packages:
```bash
npm install @venice-dev-tools/node
```

### TypeError: venice.chat.completions.create is not a function

Update your method calls to use the new method names:
```javascript
// From
venice.chat.completions.create({...})
// To
venice.chat.createCompletion({...})
```

### TypeError: venice.images.generations.create is not a function

Update your image generation method calls:
```javascript
// From
venice.images.generations.create({...})
// To
venice.images.generate({...})
```

### TypeError: venice.apiKeys is undefined

Update your API key management calls:
```javascript
// From
venice.apiKeys.list()
// To
venice.keys.list()
```

## Need Help?

If you encounter any issues during migration, please:

1. Check the [API Documentation](../api/) for detailed information about all available methods
2. Visit our [GitHub repository](https://github.com/georgeglarson/venice-dev-tools) for the latest updates
3. Open an issue on GitHub if you encounter a bug or have a feature request
4. Join our [Discord community](https://discord.gg/venice-ai) for real-time support