---
layout: default
title: Examples - Venice Dev Tools
---

# Code Examples

This section provides practical code examples for common use cases with the Venice Dev Tools SDK.

## Basic Chat {#basic-chat}

### Simple Chat Completion

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function basicChat() {
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'Tell me about AI' }
    ]
  });
  
  console.log(response.choices[0].message.content);
}

basicChat();
```

### Chat with System Message

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function chatWithSystem() {
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that speaks like a pirate.' },
      { role: 'user', content: 'Tell me about the ocean' }
    ]
  });
  
  console.log(response.choices[0].message.content);
}

chatWithSystem();
```

### Multi-turn Conversation

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function multiTurnConversation() {
  // First message
  const response1 = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'What are the three laws of robotics?' }
    ]
  });
  
  const assistantResponse1 = response1.choices[0].message;
  console.log('Assistant:', assistantResponse1.content);
  
  // Follow-up message
  const response2 = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'What are the three laws of robotics?' },
      assistantResponse1,
      { role: 'user', content: 'Who created these laws?' }
    ]
  });
  
  console.log('Assistant:', response2.choices[0].message.content);
}

multiTurnConversation();
```

## Streaming Chat {#streaming-chat}

### Basic Streaming

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function basicStreaming() {
  const stream = await venice.chat.createCompletionStream({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'Write a short poem about technology' }
    ]
  });
  
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
}

basicStreaming();
```

### Streaming with Progress Tracking

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function streamingWithProgress() {
  const stream = await venice.chat.createCompletionStream({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'Write a short story about a robot' }
    ]
  });
  
  let fullResponse = '';
  let tokenCount = 0;
  
  process.stdout.write('Generating: ');
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    fullResponse += content;
    tokenCount++;
    
    process.stdout.write(content);
    
    // Update progress every 10 tokens
    if (tokenCount % 10 === 0) {
      process.stdout.write(`\n[${tokenCount} tokens generated so far]\n`);
    }
  }
  
  console.log(`\n\nComplete! Total tokens: ${tokenCount}`);
}

streamingWithProgress();
```

## Generate Image {#generate-image}

### Basic Image Generation

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function generateBasicImage() {
  const response = await venice.images.generate({
    model: 'sdxl',
    prompt: 'A serene mountain landscape at sunset',
    width: 1024,
    height: 1024
  });
  
  // Save the image
  const imageData = Buffer.from(response.image, 'base64');
  fs.writeFileSync('landscape.png', imageData);
  
  console.log('Image saved to landscape.png');
}

generateBasicImage();
```

### Image Generation with Style

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function generateStyledImage() {
  const response = await venice.images.generate({
    model: 'sdxl',
    prompt: 'A futuristic city with flying cars',
    style: 'digital-art',
    width: 1024,
    height: 768
  });
  
  // Save the image
  const imageData = Buffer.from(response.image, 'base64');
  fs.writeFileSync('futuristic-city.png', imageData);
  
  console.log('Image saved to futuristic-city.png');
}

generateStyledImage();
```

### Batch Image Generation

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';
import path from 'path';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function generateBatchImages() {
  const prompts = [
    'A serene mountain landscape at sunset',
    'A futuristic city with flying cars',
    'A cat wearing a space suit on the moon'
  ];
  
  // Create output directory
  const outputDir = 'generated-images';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  // Generate images in parallel
  const promises = prompts.map(async (prompt, index) => {
    try {
      const response = await venice.images.generate({
        model: 'sdxl',
        prompt,
        width: 1024,
        height: 1024
      });
      
      // Save the image
      const filename = `image-${index + 1}.png`;
      const filepath = path.join(outputDir, filename);
      const imageData = Buffer.from(response.image, 'base64');
      fs.writeFileSync(filepath, imageData);
      
      return { prompt, filepath, success: true };
    } catch (error) {
      return { prompt, error: error.message, success: false };
    }
  });
  
  const results = await Promise.all(promises);
  
  // Log results
  results.forEach(result => {
    if (result.success) {
      console.log(`Generated image for prompt: "${result.prompt}" at ${result.filepath}`);
    } else {
      console.error(`Failed to generate image for prompt: "${result.prompt}". Error: ${result.error}`);
    }
  });
}

generateBatchImages();
```

## Character Interaction {#character-interaction}

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
  
  console.log('Available characters:');
  characters.forEach(character => {
    console.log(`- ${character.name}: ${character.description}`);
  });
}

listCharacters();
```

### Character Comparison

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function compareCharacters() {
  const prompt = 'Explain what happiness means';
  const characters = ['Philosopher', 'Scientist', 'Creative Writer'];
  
  for (const character of characters) {
    console.log(`\n=== ${character}'s response ===\n`);
    
    const response = await venice.chat.createCompletion({
      model: 'llama-3.3-70b',
      character,
      messages: [
        { role: 'user', content: prompt }
      ]
    });
    
    console.log(response.choices[0].message.content);
  }
}

compareCharacters();
```

## Function Calling {#function-calling}

### Weather Function Example

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

// Define functions
const functions = [
  {
    name: 'get_weather',
    description: 'Get the current weather in a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g., San Francisco, CA'
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'The unit of temperature'
        }
      },
      required: ['location']
    }
  }
];

// Function implementation
function getWeather(location, unit = 'celsius') {
  // In a real app, you would call a weather API here
  const weatherData = {
    location,
    temperature: unit === 'celsius' ? 22 : 72,
    unit,
    condition: 'Sunny',
    humidity: 45,
    wind_speed: 10
  };
  
  return weatherData;
}

async function weatherFunctionExample() {
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: "What's the weather like in San Francisco?" }
    ],
    functions,
    function_call: 'auto'
  });
  
  const message = response.choices[0].message;
  
  // Check if the model wants to call a function
  if (message.function_call) {
    const { name, arguments: args } = message.function_call;
    console.log(`Model wants to call function: ${name}`);
    console.log(`With arguments: ${args}`);
    
    if (name === 'get_weather') {
      const parsedArgs = JSON.parse(args);
      const weatherData = getWeather(
        parsedArgs.location, 
        parsedArgs.unit
      );
      
      console.log('Weather data:', weatherData);
      
      // Call the model again with the function result
      const secondResponse = await venice.chat.createCompletion({
        model: 'llama-3.3-70b',
        messages: [
          { role: 'user', content: "What's the weather like in San Francisco?" },
          message,
          {
            role: 'function',
            name: 'get_weather',
            content: JSON.stringify(weatherData)
          }
        ]
      });
      
      console.log('Final response:', secondResponse.choices[0].message.content);
    }
  } else {
    console.log('Model responded directly:', message.content);
  }
}

weatherFunctionExample();
```

## PDF Processing {#pdf-processing}

### Basic PDF Processing

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
    mode: 'text',
    pages: 'all'
  });
  
  console.log('Extracted text:', result.text.substring(0, 500) + '...');
  
  // Use the processed content with a model
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'system', content: 'Summarize the following document in 3-5 bullet points' },
      { role: 'user', content: result.text }
    ]
  });
  
  console.log('Summary:', response.choices[0].message.content);
}

processPdf();
```

### PDF Question Answering

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';
import readline from 'readline';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function pdfQuestionAnswering() {
  // Read a PDF file
  const pdfBuffer = fs.readFileSync('document.pdf');
  const base64Pdf = pdfBuffer.toString('base64');
  
  // Process the PDF
  const result = await venice.pdf.process({
    pdf: base64Pdf,
    mode: 'text',
    pages: 'all'
  });
  
  console.log('PDF processed. You can now ask questions about it.');
  
  // Create readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Function to ask a question
  const askQuestion = async (question) => {
    const response = await venice.chat.createCompletion({
      model: 'llama-3.3-70b',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant that answers questions based on the provided document.' 
        },
        { 
          role: 'user', 
          content: `Document content:\n${result.text}\n\nQuestion: ${question}` 
        }
      ]
    });
    
    return response.choices[0].message.content;
  };
  
  // Interactive loop
  const promptUser = () => {
    rl.question('\nAsk a question about the document (or type "exit" to quit): ', async (question) => {
      if (question.toLowerCase() === 'exit') {
        rl.close();
        return;
      }
      
      console.log('\nThinking...');
      const answer = await askQuestion(question);
      console.log('\nAnswer:', answer);
      
      promptUser();
    });
  };
  
  promptUser();
}

pdfQuestionAnswering();
```

## Vision & Multimodal {#vision-multimodal}

### Image Analysis

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function analyzeImage() {
  // Read an image file
  const imageBuffer = fs.readFileSync('image.jpg');
  const base64Image = imageBuffer.toString('base64');
  
  const response = await venice.chat.createCompletion({
    model: 'claude-3-opus', // Must be a vision-capable model
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Describe this image in detail.' },
          { type: 'image', image: base64Image }
        ]
      }
    ]
  });
  
  console.log('Image analysis:', response.choices[0].message.content);
}

analyzeImage();
```

### Multiple Images

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function compareImages() {
  // Read image files
  const image1Buffer = fs.readFileSync('image1.jpg');
  const image2Buffer = fs.readFileSync('image2.jpg');
  
  const base64Image1 = image1Buffer.toString('base64');
  const base64Image2 = image2Buffer.toString('base64');
  
  const response = await venice.chat.createCompletion({
    model: 'claude-3-opus', // Must be a vision-capable model
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Compare these two images and tell me the differences.' },
          { type: 'image', image: base64Image1 },
          { type: 'image', image: base64Image2 }
        ]
      }
    ]
  });
  
  console.log('Comparison:', response.choices[0].message.content);
}

compareImages();
```

### Image and Text Interaction

```javascript
import { VeniceNode } from '@venice-dev-tools/node';
import fs from 'fs';

const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

async function imageTextInteraction() {
  // Read an image file
  const imageBuffer = fs.readFileSync('code_screenshot.jpg');
  const base64Image = imageBuffer.toString('base64');
  
  const response = await venice.chat.createCompletion({
    model: 'claude-3-opus', // Must be a vision-capable model
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'This is a screenshot of some code. Can you explain what it does and suggest any improvements?' },
          { type: 'image', image: base64Image }
        ]
      }
    ]
  });
  
  console.log('Code analysis:', response.choices[0].message.content);
}

imageTextInteraction();