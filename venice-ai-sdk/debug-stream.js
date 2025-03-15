// Debug script to capture raw streaming responses from the Venice API
const fs = require('fs');
const path = require('path');
const { VeniceAI } = require('./packages/core/dist');

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

// Monkey patch the stream method to log raw responses
const originalStream = venice.http.stream;
venice.http.stream = async function(path, body, options = {}) {
  console.log('Request URL:', `${this.baseUrl}${path}`);
  console.log('Request Body:', JSON.stringify(body, null, 2));
  
  const response = await originalStream.call(this, path, body, options);
  
  // Clone the response to avoid consuming it
  const clonedResponse = response.clone();
  
  // Log the response status
  console.log('Response Status:', clonedResponse.status);
  console.log('Response Headers:', JSON.stringify(Object.fromEntries([...clonedResponse.headers]), null, 2));
  
  // Create a log file for the raw response
  const logStream = fs.createWriteStream('stream-debug.log');
  
  // Get the reader from the cloned response body
  const reader = clonedResponse.body.getReader();
  
  // Read chunks from the stream and log them
  console.log('Starting to read response stream...');
  logStream.write('=== RAW STREAM DATA ===\n');
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Convert the chunk to text and log it
      const chunkText = new TextDecoder().decode(value);
      logStream.write(chunkText);
      logStream.write('\n--- CHUNK BOUNDARY ---\n');
      
      // Also log to console for debugging
      console.log('Chunk:', chunkText);
    }
  } catch (error) {
    console.error('Error reading stream:', error);
    logStream.write(`\nERROR: ${error.message}\n`);
  } finally {
    logStream.end();
    console.log('Stream data saved to stream-debug.log');
  }
  
  return response;
};

// Test multimodal streaming
async function testMultimodalStreaming() {
  try {
    console.log('Testing multimodal streaming...');
    
    // Get image as base64 data URL
    const imageUrl = getBase64DataUrl('./sunset.png');
    
    // Create a streaming request with multimodal content
    const streamGenerator = venice.chat.streamCompletion({
      model: 'qwen-2.5-vl',
      stream: true,
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
    
    console.log('Processing stream response...');
    
    // Process the stream
    for await (const chunk of streamGenerator) {
      try {
        console.log('Parsed Chunk:', JSON.stringify(chunk, null, 2));
      } catch (error) {
        console.error('Error processing chunk:', error);
      }
    }
    
    console.log('Stream completed');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testMultimodalStreaming();