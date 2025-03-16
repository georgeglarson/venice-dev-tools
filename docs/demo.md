---
layout: default
title: Code Examples - Venice Dev Tools | SDK Implementation Samples
description: "Practical code examples for using the Venice Dev Tools SDK. Learn how to implement chat completions, image generation, PDF processing, character interactions, and more."
keywords: "Venice Dev Tools examples, Venice AI SDK code, chat completion examples, image generation examples, PDF processing examples"
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

### PDF Processing with Different Modes

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function processPdfWithDifferentModes() {
  // Process PDF with different modes
  console.log('Processing PDF with different modes...');
  
  // 1. As binary data (default)
  console.log('\n1. Processing as binary data (default):');
  const imageContent = await venice.utils.processFile('./document.pdf');
  console.log(`Type: ${imageContent.type}`);
  console.log(`MIME Type: ${imageContent.mimeType}`);
  console.log(`Data size: ${imageContent.data.length} bytes`);
  
  // 2. As extracted text
  console.log('\n2. Processing as text:');
  const textContent = await venice.utils.processFile('./document.pdf', { pdfMode: 'text' });
  console.log(`Type: ${textContent.type}`);
  console.log(`Text length: ${textContent.text.length} characters`);
  console.log(`Text preview: ${textContent.text.substring(0, 100)}...`);
  
  // 3. As both text and binary data
  console.log('\n3. Processing as both text and binary data:');
  const bothContent = await venice.utils.processFile('./document.pdf', { pdfMode: 'both' });
  console.log(`Result is array: ${Array.isArray(bothContent)}`);
  console.log(`Number of items: ${bothContent.length}`);
  
  // Use the processed content with a model
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'system', content: 'Summarize the following document' },
      { role: 'user', content: textContent.text }
    ]
  });
  
  console.log('\nSummary:', response.choices[0].message.content);
}

processPdfWithDifferentModes();
```

### PDF-to-Image Conversion

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function convertPdfToImage() {
  // Using pdf-img-convert library (you'll need to install it first)
  // npm install pdf-img-convert
  const pdfImgConvert = require('pdf-img-convert');
  
  console.log('Converting PDF to images...');
  const pdfImages = await pdfImgConvert.convert('./document.pdf', {
    width: 1024,  // output image width in pixels
    height: 1450  // output image height in pixels
  });
  
  console.log(`Converted ${pdfImages.length} pages to images`);
  
  // Save the images
  for (let i = 0; i < pdfImages.length; i++) {
    const outputPath = `document-page-${i+1}.png`;
    fs.writeFileSync(outputPath, pdfImages[i]);
    console.log(`Saved page ${i+1} to ${outputPath}`);
  }
  
  // Use the first image with a vision model
  if (pdfImages.length > 0) {
    const base64Image = pdfImages[0].toString('base64');
    
    const response = await venice.chat.createCompletion({
      model: 'claude-3-opus', // Must be a vision-capable model
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this document and tell me what it contains.' },
            { type: 'image', image: base64Image }
          ]
        }
      ]
    });
    
    console.log('\nImage analysis:', response.choices[0].message.content);
  }
}

convertPdfToImage();
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