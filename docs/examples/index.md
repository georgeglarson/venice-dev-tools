---
layout: default
title: Venice AI SDK - Examples
---

# Examples

This section provides code examples for common use cases with the Venice AI SDK.

## Basic Examples

- [Basic Chat](#basic-chat)
- [Streaming Chat](#streaming-chat)
- [Web Search Chat](#web-search-chat)
- [Generate Image](#generate-image)
- [List Models](#list-models)

## Advanced Examples

- [Character Interaction](#character-interaction)
- [Function Calling](#function-calling)
- [Vision Models](#vision-models)
- [Image Upscaling](#image-upscaling)
- [Inpainting](#inpainting)
- [CLI Usage](#cli-usage)

## Basic Chat

```javascript
const { VeniceAI } = require('venice-dev-tools');

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
    ]
  });
  
  console.log(response.choices[0].message.content);
}

generateChatCompletion();
```

## Streaming Chat

```javascript
const { VeniceAI } = require('venice-dev-tools');

// Initialize the client
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

// Generate a streaming chat completion
async function streamingChat() {
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
  console.log(); // Add a newline at the end
}

streamingChat();
```

## Web Search Chat

```javascript
const { VeniceAI } = require('venice-dev-tools');

// Initialize the client
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

// Generate a chat completion with web search
async function webSearchChat() {
  const response = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'What are the latest developments in AI?' }
    ],
    venice_parameters: {
      enable_web_search: 'on'
    }
  });
  
  console.log(response.choices[0].message.content);
}

webSearchChat();
```

## Generate Image

```javascript
const { VeniceAI } = require('venice-dev-tools');
const fs = require('fs');
const https = require('https');

// Initialize the client
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

// Generate an image
async function generateImage() {
  const response = await venice.image.generate({
    model: 'fluently-xl',
    prompt: 'A beautiful sunset over a mountain range',
    negative_prompt: 'blurry, distorted, low quality',
    style_preset: '3D Model',
    height: 1024,
    width: 1024
  });
  
  console.log(response.images[0].url);
  
  // Download the image
  const imageUrl = response.images[0].url;
  const file = fs.createWriteStream('sunset.png');
  
  https.get(imageUrl, function(response) {
    response.pipe(file);
    file.on('finish', () => {
      console.log('Image saved to sunset.png');
    });
  }).on('error', (err) => {
    console.error('Error downloading image:', err.message);
  });
}

generateImage();
```

## List Models

```javascript
const { VeniceAI } = require('venice-dev-tools');

// Initialize the client
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

// List available models
async function listModels() {
  const response = await venice.models.list();
  
  console.log(`Total models: ${response.data.length}`);
  
  // Filter models by type
  const textModels = response.data.filter(model => model.type === 'text');
  const imageModels = response.data.filter(model => model.type === 'image');
  
  console.log(`Text models: ${textModels.length}`);
  console.log(`Image models: ${imageModels.length}`);
  
  // Print model details
  console.log('\nText Models:');
  textModels.forEach(model => {
    console.log(`- ${model.id}: ${model.description || 'No description'}`);
  });
  
  console.log('\nImage Models:');
  imageModels.forEach(model => {
    console.log(`- ${model.id}: ${model.description || 'No description'}`);
  });
}

listModels();
```

## Character Interaction

```javascript
const { VeniceAI } = require('venice-dev-tools');

// Initialize the client
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

// List characters and chat with one
async function characterInteraction() {
  // List available characters
  const characters = await venice.characters.list();
  
  console.log(`Total characters: ${characters.data.length}`);
  
  // Get the first character
  const character = characters.data[0];
  console.log(`Selected character: ${character.name} (${character.slug})`);
  
  // Chat with the character
  const response = await venice.chat.completions.create({
    model: 'default',
    messages: [
      { role: 'user', content: 'Tell me about yourself' }
    ],
    venice_parameters: {
      character_slug: character.slug
    }
  });
  
  console.log('\nCharacter response:');
  console.log(response.choices[0].message.content);
}

characterInteraction();
```

## Function Calling

```javascript
const { VeniceAI } = require('venice-dev-tools');

// Initialize the client
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

// Function calling example
async function functionCalling() {
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
  
  if (response.choices[0].message.function_call) {
    const functionCall = response.choices[0].message.function_call;
    console.log(`Function: ${functionCall.name}`);
    console.log(`Arguments: ${functionCall.arguments}`);
    
    // Parse the arguments
    const args = JSON.parse(functionCall.arguments);
    console.log(`Location: ${args.location}`);
    console.log(`Unit: ${args.unit || 'Not specified'}`);
    
    // In a real application, you would call your actual function here
    // const weatherData = await getWeather(args.location, args.unit);
    
    // For this example, we'll simulate a response
    const weatherData = {
      location: args.location,
      temperature: 72,
      unit: args.unit || 'fahrenheit',
      condition: 'Sunny',
      humidity: 45
    };
    
    // Send the function result back to the model
    const finalResponse = await venice.chat.completions.create({
      model: 'mistral-codestral-22b',
      messages: [
        { role: 'user', content: 'What\'s the weather in San Francisco?' },
        { 
          role: 'assistant',
          content: null,
          function_call: functionCall
        },
        {
          role: 'function',
          name: 'get_weather',
          content: JSON.stringify(weatherData)
        }
      ]
    });
    
    console.log('\nFinal response:');
    console.log(finalResponse.choices[0].message.content);
  } else {
    console.log(response.choices[0].message.content);
  }
}

functionCalling();
```

## Vision Models

```javascript
const { VeniceAI } = require('venice-dev-tools');
const fs = require('fs');

// Initialize the client
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

// Vision model example
async function visionModel() {
  // Read an image file
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
  
  console.log('Vision model response:');
  console.log(response.choices[0].message.content);
}

visionModel();
```

## Image Upscaling

```javascript
const { VeniceAI } = require('venice-dev-tools');
const fs = require('fs');

// Initialize the client
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

// Upscale an image
async function upscaleImage() {
  // Read an image file
  const imageBuffer = fs.readFileSync('image.jpg');
  const base64Image = imageBuffer.toString('base64');
  
  const response = await venice.image.upscale({
    image: base64Image,
    scale: 2
  });
  
  // If the response contains a URL
  if (response.url) {
    console.log(`Upscaled image URL: ${response.url}`);
    
    // Download the image (implementation not shown)
  }
  
  // If the response contains base64 data
  if (response.b64_json) {
    const imageData = Buffer.from(response.b64_json, 'base64');
    fs.writeFileSync('upscaled-image.jpg', imageData);
    console.log('Upscaled image saved to upscaled-image.jpg');
  }
}

upscaleImage();
```

## Inpainting

```javascript
const { VeniceAI } = require('venice-dev-tools');
const fs = require('fs');

// Initialize the client
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

// Inpaint an image
async function inpaintImage() {
  // Read an image file
  const imageBuffer = fs.readFileSync('image.jpg');
  const base64Image = imageBuffer.toString('base64');
  
  // Read a mask file (optional)
  const maskBuffer = fs.readFileSync('mask.png');
  const base64Mask = maskBuffer.toString('base64');
  
  const response = await venice.image.generate({
    model: 'fluently-xl',
    prompt: 'A beautiful sunset',
    image: base64Image,
    mask: base64Mask
  });
  
  console.log(`Inpainted image URL: ${response.images[0].url}`);
  
  // Download the image (implementation not shown)
}

inpaintImage();
```

## CLI Usage

```javascript
const { VeniceAI } = require('venice-dev-tools');

// Initialize the client
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

// Use the CLI-style interface
async function cliUsage() {
  try {
    // List models
    const models = await venice.cli('list-models --limit 5');
    console.log(`Found ${models.total} models`);
    
    // Generate a chat completion
    const chatResponse = await venice.cli('chat "Tell me about AI" --web-search');
    console.log('Chat response:', chatResponse);
    
    // Generate an image
    const imageResponse = await venice.cli('generate-image "A beautiful sunset" --style Photographic --output sunset.png');
    console.log(`Image saved to: ${imageResponse.savedTo}`);
    
    // List characters
    const characters = await venice.cli('list-characters', {
      limit: 3,
      raw: true
    });
    console.log(`Found ${characters.data.length} characters`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

cliUsage();
```

For more examples, check out the [examples directory](https://github.com/georgeglarson/venice-dev-tools/tree/main/examples) in the GitHub repository.