#!/usr/bin/env node

/**
 * Streaming Chat - Real-time Token Streaming
 * 
 * Demonstrates how to stream chat completions in real-time using async iteration.
 * Tokens appear progressively as they're generated, providing a more interactive
 * user experience for longer responses.
 * 
 * This example shows:
 * - Enabling streaming mode with stream: true
 * - Using for await...of to iterate over chunks
 * - Extracting delta content from streaming chunks
 * - Real-time output with process.stdout.write
 * - Handling async iterables
 * 
 * Prerequisites:
 * - Node.js installed
 * - Venice AI SDK installed (@venice-dev-tools/core)
 * - VENICE_API_KEY environment variable set
 * 
 * Run with: node 02-streaming-chat.js
 */

const { VeniceAI } = require('@venice-dev-tools/core');
const { loadEnv, requireEnv, isAsyncIterable, formatError } = require('./utils');

/**
 * Main function.
 */
async function main() {
  // Load environment variables
  loadEnv();
  
  console.log('🤖 Streaming a chat response in real-time...\n');
  
  // Get API key from environment
  const apiKey = requireEnv('VENICE_API_KEY');
  
  // Initialize Venice AI client
  const venice = new VeniceAI({ apiKey });
  
  try {
    // Create streaming chat completion request
    const stream = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        {
          role: 'user',
          content: 'Explain what makes JavaScript async/await powerful in exactly three compelling points.'
        }
      ],
      stream: true,
      max_tokens: 300,
      temperature: 0.7
    });
    
    // Verify we got a stream
    if (!isAsyncIterable(stream)) {
      console.error('⚠️  Warning: Expected streaming response but got non-streaming');
      console.error('   💡 Tip: Ensure stream: true is set in request\n');
      process.exit(1);
    }
    
    console.log('✨ Response:\n');
    
    // Iterate over streaming chunks
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      
      if (delta) {
        process.stdout.write(delta);
      }
    }
    
    console.log('\n');
    console.log('✅ Streaming completed!\n');
    console.log('💡 Tip: Notice how the text appeared progressively, not all at once\n');
    
  } catch (error) {
    formatError(error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
