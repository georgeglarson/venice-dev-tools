/**
 * Streaming Chat Debug Example
 * 
 * This example demonstrates how to debug streaming chat completions.
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/chat/streaming-debug.js
 */

const { VeniceAI } = require('../../dist');

// Initialize the client with your API key and debug logging enabled
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
  logLevel: 5, // TRACE level for maximum debugging
});

async function main() {
  try {
    console.log('Generating streaming chat completion with debug logging...');
    console.log('\nAssistant: ');
    
    // Generate a streaming chat completion
    const response = await venice.chat.completions.create({
      model: 'llama-3.3-70b', // You can use any available model
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Write a short poem about artificial intelligence.' }
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: true, // Enable streaming
      venice_parameters: {
        include_venice_system_prompt: true
      }
    });
    
    // Log the response type for debugging
    console.log('\nResponse type:', typeof response);
    console.log('Response has asyncIterator:', Symbol.asyncIterator in response);
    console.log('Response has on method:', typeof response.on === 'function');
    
    if (typeof response === 'object') {
      console.log('Response keys:', Object.keys(response));
      
      // If response is a readable stream
      if (typeof response.on === 'function') {
        console.log('\nTreating response as a Node.js stream');
        
        // Set up event handlers
        response.on('data', (chunk) => {
          console.log('\nReceived chunk type:', typeof chunk);
          
          try {
            // Try to parse the chunk as JSON
            if (Buffer.isBuffer(chunk)) {
              const text = chunk.toString();
              console.log('Chunk as text:', text);
              
              // Try to extract content from SSE format
              if (text.startsWith('data: ')) {
                const data = text.slice(6);
                console.log('Data part:', data);
                
                if (data !== '[DONE]') {
                  try {
                    const parsed = JSON.parse(data);
                    console.log('Parsed JSON delta:', parsed.choices?.[0]?.delta);
                    
                    const content = parsed.choices?.[0]?.delta?.content || '';
                    process.stdout.write(content);
                  } catch (e) {
                    console.log('Error parsing JSON:', e.message);
                  }
                }
              }
            } else if (typeof chunk === 'string') {
              console.log('Chunk is a string:', chunk);
            } else if (typeof chunk === 'object') {
              console.log('Chunk is an object with keys:', Object.keys(chunk));
              
              const content = chunk.choices?.[0]?.delta?.content || '';
              process.stdout.write(content);
            }
          } catch (err) {
            console.error('Error processing chunk:', err);
          }
        });
        
        response.on('end', () => {
          console.log('\n\nStream ended');
        });
        
        response.on('error', (err) => {
          console.error('\nStream error:', err);
        });
      } 
      // If response is an async iterable
      else if (Symbol.asyncIterator in response) {
        console.log('\nTreating response as an async iterable');
        
        try {
          for await (const chunk of response) {
            console.log('\nReceived chunk type:', typeof chunk);
            
            if (typeof chunk === 'object') {
              console.log('Chunk keys:', Object.keys(chunk));
              
              if (chunk.choices && chunk.choices.length > 0) {
                console.log('Delta:', chunk.choices[0].delta);
                
                const content = chunk.choices[0]?.delta?.content || '';
                process.stdout.write(content);
              }
            } else if (typeof chunk === 'string') {
              console.log('Chunk string (first 100 chars):', chunk.substring(0, 100));
              
              // Try to parse as JSON if it's a string
              try {
                if (chunk.startsWith('data: ')) {
                  const data = chunk.slice(6);
                  console.log('Data part:', data);
                  
                  if (data !== '[DONE]') {
                    const parsed = JSON.parse(data);
                    console.log('Parsed JSON delta:', parsed.choices?.[0]?.delta);
                    
                    const content = parsed.choices?.[0]?.delta?.content || '';
                    process.stdout.write(content);
                  }
                } else {
                  const parsed = JSON.parse(chunk);
                  console.log('Parsed JSON delta:', parsed.choices?.[0]?.delta);
                  
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  process.stdout.write(content);
                }
              } catch (e) {
                console.log('Error parsing JSON string:', e.message);
                // Just output the raw string if we can't parse it
                process.stdout.write(chunk);
              }
            } else {
              console.log('Unknown chunk type:', typeof chunk);
            }
          }
          console.log('\n\nAsync iteration completed');
        } catch (error) {
          console.error('\nError during async iteration:', error);
        }
      }
      // If response is something else
      else {
        console.log('\nUnknown response format');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.code) {
      console.error('Error code:', error.code);
      console.error('Status:', error.status);
    }
    
    if (error.rateLimitInfo) {
      console.error('Rate limit exceeded. Try again after:', 
        new Date(error.rateLimitInfo.reset * 1000).toLocaleString());
    }
  }
}

main();