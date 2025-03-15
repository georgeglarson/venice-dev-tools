/**
 * Venice AI SDK - Vision/Multimodal Example
 * 
 * This example demonstrates how to use the Venice AI SDK for multimodal interactions,
 * specifically for vision-based tasks where you can send both text and images to the model.
 */

// Import the Venice AI SDK
const { VeniceNode } = require('@venice-ai/node');
const fs = require('fs');
const path = require('path');

// Create a new Venice client
// You can provide your API key here or set it as an environment variable: VENICE_API_KEY
const venice = new VeniceNode({
  apiKey: process.env.VENICE_API_KEY,
  // Optional configuration
  timeout: 60000, // 60 seconds
  maxConcurrent: 5, // Maximum concurrent requests
  requestsPerMinute: 60 // Rate limit
});

// Basic image analysis example
async function basicVisionExample() {
  console.log('Basic Vision Example:');
  console.log('-------------------');
  
  try {
    // Path to a local image file
    const imagePath = path.join(__dirname, 'sample-image.jpg');
    console.log(`Using image from: ${imagePath} (simulated)`);
    
    // In a real application, you would read and encode the image:
    // const imageBuffer = fs.readFileSync(imagePath);
    // const base64Image = imageBuffer.toString('base64');
    
    // For this example, we'll use a placeholder URL
    const imageUrl = 'https://example.com/sample-image.jpg';
    
    // Create a multimodal chat completion
    const response = await venice.chat.createCompletion({
      model: 'qwen-2.5-vl', // Vision-capable model
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
                url: imageUrl
              }
            }
          ]
        }
      ]
    });
    
    console.log('Response:');
    console.log(response.choices[0].message.content);
    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Advanced vision example with detailed prompting
async function advancedVisionExample() {
  console.log('Advanced Vision Example:');
  console.log('----------------------');
  
  try {
    // For this example, we'll use placeholder URLs
    const imageUrl1 = 'https://example.com/chart.jpg';
    const imageUrl2 = 'https://example.com/diagram.jpg';
    
    // Create a multimodal chat completion with multiple images and detailed instructions
    const response = await venice.chat.createCompletion({
      model: 'qwen-2.5-vl',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that specializes in analyzing images and data visualizations. Provide detailed and accurate descriptions.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'I have two charts from my business report. Can you analyze them and tell me what trends you see? Also, are there any concerning patterns I should be aware of?'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl1
              }
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl2
              }
            }
          ]
        }
      ],
      temperature: 0.2, // Lower temperature for more factual responses
      max_tokens: 500 // Allow for a longer response
    });
    
    console.log('Response:');
    console.log(response.choices[0].message.content);
    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Multi-turn conversation with images
async function multiTurnVisionExample() {
  console.log('Multi-turn Vision Conversation Example:');
  console.log('------------------------------------');
  
  try {
    // For this example, we'll use a placeholder URL
    const imageUrl = 'https://example.com/product.jpg';
    
    // Create a multimodal chat completion with a conversation history
    const response = await venice.chat.createCompletion({
      model: 'qwen-2.5-vl',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful shopping assistant.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'What do you think of this product?'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        },
        {
          role: 'assistant',
          content: 'This appears to be a sleek smartphone with a modern design. It has a large display with minimal bezels and what looks like a multi-camera setup on the back. The build quality seems premium. Is there anything specific you'd like to know about this device?'
        },
        {
          role: 'user',
          content: 'Do you think it's worth buying? And what features can you identify from the image?'
        }
      ]
    });
    
    console.log('Response:');
    console.log(response.choices[0].message.content);
    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Image OCR (Optical Character Recognition) example
async function ocrVisionExample() {
  console.log('OCR Vision Example:');
  console.log('----------------');
  
  try {
    // For this example, we'll use a placeholder URL
    const imageUrl = 'https://example.com/document.jpg';
    
    // Create a multimodal chat completion focused on text extraction
    const response = await venice.chat.createCompletion({
      model: 'qwen-2.5-vl',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all the text from this image and format it properly. If there are tables, preserve their structure.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ]
    });
    
    console.log('Extracted Text:');
    console.log(response.choices[0].message.content);
    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the examples
async function runExamples() {
  await basicVisionExample();
  await advancedVisionExample();
  await multiTurnVisionExample();
  await ocrVisionExample();
}

runExamples().catch(console.error);