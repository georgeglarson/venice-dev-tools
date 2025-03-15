---
layout: default
title: Code Examples - Venice Dev Tools
---

# Venice Dev Tools Code Examples

This page provides code examples for using the Venice Dev Tools SDK in your projects. These examples demonstrate the key features and capabilities of the SDK.

## Installation

Install the Venice Dev Tools using npm:

```bash
npm install venice-dev-tools
```

Or install globally to use the CLI:

```bash
npm install -g venice-dev-tools
```

## Chat Completion Examples

### Basic Chat Completion

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

// Initialize the client
const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

// Generate a chat completion
async function generateChatCompletion() {
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Tell me about AI' }
    ]
  });
  
  console.log(response.choices[0].message.content);
}

generateChatCompletion();
```

### Streaming Chat Completion

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

### Chat with Web Search

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function chatWithWebSearch() {
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    web_search: true,
    messages: [
      { role: 'user', content: 'What are the latest developments in AI?' }
    ]
  });
  
  console.log(response.choices[0].message.content);
}

chatWithWebSearch();
```

## Image Generation Examples

### Basic Image Generation

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function generateImage() {
  const response = await venice.images.generate({
    model: 'sdxl',
    prompt: 'A serene mountain landscape at sunset',
    style: 'photographic',
    width: 1024,
    height: 1024
  });
  
  // Save the image
  const imageData = Buffer.from(response.image, 'base64');
  fs.writeFileSync('landscape.png', imageData);
  
  console.log('Image saved to landscape.png');
}

generateImage();
```

### Image Upscaling

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function upscaleImage() {
  // Read an existing image
  const imageBuffer = fs.readFileSync('small-image.png');
  const base64Image = imageBuffer.toString('base64');
  
  const response = await venice.images.upscale({
    image: base64Image,
    scale: 2
  });
  
  // Save the upscaled image
  const upscaledImageData = Buffer.from(response.image, 'base64');
  fs.writeFileSync('upscaled-image.png', upscaledImageData);
  
  console.log('Upscaled image saved to upscaled-image.png');
}

upscaleImage();
```

## Character Interaction Examples

### Chat with a Character

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function chatWithCharacter() {
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    character: 'Scientist',
    messages: [
      { role: 'user', content: 'Explain quantum entanglement in simple terms' }
    ]
  });
  
  console.log(response.choices[0].message.content);
}

chatWithCharacter();
```

### List Available Characters

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function listCharacters() {
  const characters = await venice.characters.list();
  console.log(characters);
}

listCharacters();
```

## CLI Examples

### Basic Chat

```bash
# Configure your API key (first-time setup)
venice configure

# Generate a chat completion
venice chat "Tell me about AI"

# Use a specific model
venice chat --model llama-3.3-70b "What is quantum computing?"

# Add a system message
venice chat --system "You are a helpful assistant" "How do I learn JavaScript?"
```

### Image Generation

```bash
# Generate an image
venice image "A futuristic city with flying cars"

# Specify model and style
venice image --model sdxl --style digital-art "A futuristic city with flying cars"

# Save to a specific path
venice image --output city.png "A futuristic city with flying cars"
```

### Character Interaction

```bash
# Chat with a character
venice chat --character "Scientist" "Explain quantum entanglement"

# List available characters
venice characters list
```

## Advanced Examples

### PDF Processing

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
  
  // Use the processed content
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'system', content: 'Summarize the following document' },
      { role: 'user', content: result.text }
    ]
  });
  
  console.log(response.choices[0].message.content);
}

processPdf();
```

### Vision/Multimodal

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function visionMultimodal() {
  // Read an image
  const imageBuffer = fs.readFileSync('image.jpg');
  const base64Image = imageBuffer.toString('base64');
  
  // Send both text and image
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

visionMultimodal();
```

For more information, check out the [full documentation](/venice-dev-tools/).