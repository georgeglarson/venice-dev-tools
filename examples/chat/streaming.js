/**
 * Streaming Chat Example
 * 
 * This example demonstrates how to use the Venice AI API to generate a streaming chat completion.
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/chat/streaming.js
 */

const { VeniceAI } = require('../../dist');

// Initialize the client with your API key
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

async function main() {
  try {
    console.log('Generating streaming chat completion...');
    console.log('\nAssistant: ');
    
    // Generate a streaming chat completion
    const stream = await venice.chat.completions.create({
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
    
    // Process the stream
    let fullContent = '';
    
    // For async iterables
    if (Symbol.asyncIterator in stream) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content || '';
          process.stdout.write(content);
          fullContent += content;
        }
      } catch (error) {
        console.error('\nError processing stream:', error.message);
      }
    } 
    // For Node.js streams
    else if (typeof stream.on === 'function') {
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => {
          try {
            let data = chunk;
            
            // If chunk is a Buffer, convert to string
            if (Buffer.isBuffer(chunk)) {
              data = chunk.toString();
            }
            
            // If data is a string that might be SSE format, try to parse it
            if (typeof data === 'string') {
              // Check for SSE format: "data: {...}\n\n"
              if (data.startsWith('data: ')) {
                const jsonStr = data.slice(6).trim();
                if (jsonStr === '[DONE]') return;
                
                try {
                  data = JSON.parse(jsonStr);
                } catch (e) {
                  // Not valid JSON, use as is
                }
              }
            }
            
            // Extract content based on data type
            let content = '';
            if (typeof data === 'object' && data !== null) {
              content = data.choices?.[0]?.delta?.content || '';
            }
            
            process.stdout.write(content);
            fullContent += content;
          } catch (err) {
            console.error('\nError parsing chunk:', err.message);
          }
        });
        
        stream.on('end', () => {
          console.log('\n\nStream finished');
          resolve();
        });
        
        stream.on('error', (err) => {
          console.error('\nStream error:', err.message);
          reject(err);
        });
      });
    } else {
      console.log('\nUnexpected response format. Enable debug logging for more information.');
    }
    
    console.log('\n\nFull content length:', fullContent.length);
  } catch (error) {
    console.error('Error:', error.message);
    
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