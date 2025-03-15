// Test script for multimodal messaging
const { VeniceAI } = require('./packages/core/dist');
const fs = require('fs');
const path = require('path');

// Get API key from environment variable or use a default for testing
const apiKey = process.env.VENICE_API_KEY || 'YOUR_API_KEY_HERE';

// Create a new Venice AI client with your API key
const venice = new VeniceAI({
  apiKey
});

// Function to get base64 data URL for an image
function getBase64DataUrl(filePath) {
  const fileData = fs.readFileSync(filePath);
  const base64Data = fileData.toString('base64');
  const mimeType = path.extname(filePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mimeType};base64,${base64Data}`;
}

// Test multimodal messaging
async function testMultimodal() {
  try {
    console.log('Step 1: Sending multimodal message with image...');
    
    // Get image as base64 data URL
    const imageUrl = getBase64DataUrl('./sunset.png');
    
    // First message with image
    const response1 = await venice.chat.createCompletion({
      model: 'qwen-2.5-vl',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this image'
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
    
    console.log('Response 1:');
    console.log(response1.choices[0].message.content);
    console.log('\n');
    
    // Store the assistant's response
    const assistantResponse = response1.choices[0].message;
    
    console.log('Step 2: Sending follow-up text message...');
    
    // Let's try a different approach - only include the image in the first message
    // For the second message, we'll just include the text and the assistant's response
    console.log('Assistant response type:', typeof assistantResponse.content);
    
    // Convert the assistant's response to a string if it's not already
    const assistantContent = typeof assistantResponse.content === 'string'
      ? assistantResponse.content
      : JSON.stringify(assistantResponse.content);
    
    // Second message - follow-up text only
    const response2 = await venice.chat.createCompletion({
      model: 'qwen-2.5-vl',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this image'
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
          content: assistantContent
        },
        {
          role: 'user',
          content: 'What colors do you see in the image?'
        }
      ]
    });
    
    console.log('Response 2:');
    console.log(response2.choices[0].message.content);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testMultimodal();