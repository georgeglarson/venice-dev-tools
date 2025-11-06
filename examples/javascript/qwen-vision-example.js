// Example of using the Qwen Vision API with curl
// This demonstrates how to properly format a follow-up message with an image

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// Configuration
const API_KEY = process.env.VENICE_API_KEY;
if (!API_KEY) {
  console.error('Error: VENICE_API_KEY environment variable not set');
  console.error('Get your API key at: https://venice.ai/settings/api');
  console.error('\nSet it with: export VENICE_API_KEY="your-api-key-here"');
  process.exit(1);
}

const IMAGE_PATH = './venice-ai-sdk/sunset.png';
const INITIAL_PROMPT = 'Describe this image';
const FOLLOWUP_PROMPT = 'What colors do you see in this image?';

// Convert image to base64
const imageBuffer = fs.readFileSync(IMAGE_PATH);
const base64Image = imageBuffer.toString('base64');
const mimeType = path.extname(IMAGE_PATH).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
const dataUrl = `data:${mimeType};base64,${base64Image}`;

// Step 1: Initial request with image
console.log('Step 1: Sending initial request with image...');

const initialRequest = {
  model: 'qwen-2.5-vl',
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: INITIAL_PROMPT
        },
        {
          type: 'image_url',
          image_url: {
            url: dataUrl
          }
        }
      ]
    }
  ]
};

// Save initial request to file
fs.writeFileSync('request.json', JSON.stringify(initialRequest, null, 2));

// Execute curl command for initial request
const initialCurlCommand = `curl -s -X POST "https://api.venice.ai/api/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${API_KEY}" \\
  -d @request.json`;

exec(initialCurlCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }

  // Parse the response
  const initialResponse = JSON.parse(stdout);
  console.log('Initial response:');
  console.log(initialResponse.choices[0].message.content);
  console.log('\n');

  // Step 2: Follow-up request with image again
  console.log('Step 2: Sending follow-up request with image again...');

  const followupRequest = {
    model: 'qwen-2.5-vl',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: FOLLOWUP_PROMPT
          },
          {
            type: 'image_url',
            image_url: {
              url: dataUrl
            }
          }
        ]
      }
    ]
  };

  // Save follow-up request to file
  fs.writeFileSync('request.json', JSON.stringify(followupRequest, null, 2));

  // Execute curl command for follow-up request
  const followupCurlCommand = `curl -s -X POST "https://api.venice.ai/api/v1/chat/completions" \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer ${API_KEY}" \\
    -d @request.json`;

  exec(followupCurlCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }

    // Parse the response
    try {
      const followupResponse = JSON.parse(stdout);
      console.log('Follow-up response:');
      if (followupResponse.error) {
        console.log(`Error: ${followupResponse.error}`);
      } else {
        console.log(followupResponse.choices[0].message.content);
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log('Raw response:', stdout);
    }

    console.log('\nConclusion:');
    console.log('The API requires that any image must be in the last message of the conversation.');
    console.log('Workaround: For follow-up questions, send a new request with just the image and the new question.');
    console.log('This means you lose conversation history, but it allows you to ask follow-up questions about the same image.');
  });
});