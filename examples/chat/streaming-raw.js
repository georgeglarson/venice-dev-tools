/**
 * Raw Streaming Chat Example
 * 
 * This example demonstrates a low-level approach to streaming chat completions
 * by directly handling the HTTP response.
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/chat/streaming-raw.js
 */

const https = require('https');
const url = require('url');

// Get API key from environment variable
const apiKey = process.env.VENICE_API_KEY || 'your-api-key';

// Request data
const requestData = {
  model: 'llama-3.3-70b',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Write a short poem about artificial intelligence.' }
  ],
  temperature: 0.7,
  max_tokens: 500,
  stream: true,
  venice_parameters: {
    include_venice_system_prompt: true
  }
};

// Parse the API URL
const apiUrl = url.parse('https://api.venice.ai/api/v1/chat/completions');

// Set up the request options
const options = {
  hostname: apiUrl.hostname,
  path: apiUrl.path,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'User-Agent': 'Venice-AI-SDK-APL/0.1.0'
  }
};

console.log('Generating streaming chat completion...');
console.log('\nAssistant: ');

// Make the request
const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  // Handle the response
  let buffer = '';
  
  res.on('data', (chunk) => {
    // Convert chunk to string if it's a Buffer
    const chunkStr = Buffer.isBuffer(chunk) ? chunk.toString() : chunk;
    
    console.log('\nRaw chunk:', chunkStr);
    
    buffer += chunkStr;
    
    // Split by lines and process each line
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      console.log('Processing line:', line);
      
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        
        console.log('Data part:', data);
        
        if (data === '[DONE]') {
          console.log('Stream complete');
          return;
        }
        
        try {
          const parsed = JSON.parse(data);
          console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
          
          const content = parsed.choices?.[0]?.delta?.content || '';
          process.stdout.write(content);
        } catch (e) {
          console.log('Error parsing JSON:', e.message);
        }
      }
    }
  });
  
  res.on('end', () => {
    console.log('\n\nResponse ended');
    
    // Process any remaining data in the buffer
    if (buffer.trim() !== '') {
      console.log('Processing remaining buffer:', buffer);
      
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6);
        
        if (data !== '[DONE]') {
          try {
            const parsed = JSON.parse(data);
            console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
            
            const content = parsed.choices?.[0]?.delta?.content || '';
            process.stdout.write(content);
          } catch (e) {
            console.log('Error parsing JSON:', e.message);
          }
        }
      }
    }
    
    console.log('\n\nStream finished');
  });
});

// Handle request errors
req.on('error', (error) => {
  console.error('Request error:', error);
});

// Send the request data
req.write(JSON.stringify(requestData));
req.end();