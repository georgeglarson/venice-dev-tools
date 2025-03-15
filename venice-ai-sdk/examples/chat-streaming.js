/**
 * Venice AI SDK - Chat Streaming Example
 * 
 * This example demonstrates how to use the Venice AI SDK to create streaming chat completions.
 * Streaming allows you to receive and process the response as it's being generated.
 */

// Import the Venice AI SDK
const { VeniceNode } = require('@venice-ai/node');

// Create a new Venice client
// You can provide your API key here or set it as an environment variable: VENICE_API_KEY
const venice = new VeniceNode({
  apiKey: process.env.VENICE_API_KEY,
  // Optional configuration
  timeout: 60000, // 60 seconds
  maxConcurrent: 5, // Maximum concurrent requests
  requestsPerMinute: 60 // Rate limit
});

// Basic streaming example
async function basicStreamingExample() {
  console.log('Basic Streaming Example:');
  console.log('-----------------------');
  
  try {
    // Create a streaming chat completion
    const stream = venice.chatStream.streamCompletion({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Tell me a short story about a robot.' }
      ]
    });
    
    console.log('Response:');
    
    // Process the stream chunks as they arrive
    for await (const chunk of stream) {
      // Extract the content from the chunk
      const content = chunk.choices[0]?.delta?.content || '';
      // Print the content without adding a newline
      process.stdout.write(content);
    }
    
    console.log('\n\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Advanced streaming example with custom handling
async function advancedStreamingExample() {
  console.log('Advanced Streaming Example:');
  console.log('--------------------------');
  
  try {
    // Create a streaming chat completion with more options
    const stream = venice.chatStream.streamCompletion({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'system', content: 'You are a creative writing assistant.' },
        { role: 'user', content: 'Write a haiku about technology.' }
      ],
      temperature: 0.8,
      max_tokens: 100
    });
    
    console.log('Response:');
    
    let fullResponse = '';
    let tokenCount = 0;
    
    // Process the stream chunks with more detailed handling
    for await (const chunk of stream) {
      // Extract the content from the chunk
      const content = chunk.choices[0]?.delta?.content || '';
      
      // Add to the full response
      fullResponse += content;
      
      // Count tokens (this is a simple approximation)
      tokenCount += content.split(/\s+/).filter(Boolean).length;
      
      // Print the content without adding a newline
      process.stdout.write(content);
    }
    
    console.log('\n');
    console.log(`Total approximate tokens: ${tokenCount}`);
    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to demonstrate handling stream interruption
async function streamInterruptionExample() {
  console.log('Stream Interruption Example:');
  console.log('--------------------------');
  
  try {
    // Create an AbortController to allow interrupting the stream
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Create a streaming chat completion
    const stream = venice.chatStream.streamCompletion({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Explain quantum computing in detail.' }
      ],
      signal // Pass the abort signal
    });
    
    console.log('Response (will be interrupted after 3 seconds):');
    
    // Set a timeout to interrupt the stream after 3 seconds
    setTimeout(() => {
      console.log('\n\n[Stream interrupted by user]');
      controller.abort();
    }, 3000);
    
    try {
      // Process the stream chunks as they arrive
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        process.stdout.write(content);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('\nStream was successfully aborted.');
      } else {
        throw error;
      }
    }
    
    console.log('\n\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the examples
async function runExamples() {
  await basicStreamingExample();
  await advancedStreamingExample();
  await streamInterruptionExample();
}

runExamples().catch(console.error);