#!/usr/bin/env node

/**
 * Hello World - Basic Chat Completion
 * 
 * The simplest possible example of using the Venice AI SDK in JavaScript.
 * Demonstrates basic client initialization, sending a chat message, and
 * receiving a response.
 * 
 * This example shows:
 * - SDK initialization with API key
 * - Basic chat completion request
 * - Response parsing and display
 * - Error handling with try/catch
 * 
 * Prerequisites:
 * - Node.js installed
 * - Venice AI SDK installed (@venice-dev-tools/core)
 * - VENICE_API_KEY environment variable set
 * 
 * Run with: node 01-hello-world.js
 */

const { VeniceAI } = require('@venice-dev-tools/core');
const { loadEnv, requireEnv, ensureChatCompletionResponse, displayUsage, formatError } = require('./utils');

/**
 * Main function.
 */
async function main() {
  // Load environment variables
  loadEnv();
  
  console.log('🤖 Sending a simple chat message to Venice AI...\n');
  
  // Get API key from environment
  const apiKey = requireEnv('VENICE_API_KEY');
  
  // Initialize Venice AI client
  const venice = new VeniceAI({ apiKey });
  
  try {
    // Create chat completion request
    const result = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        {
          role: 'user',
          content: 'Write a haiku about JavaScript and async/await'
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    });
    
    // Ensure we got a non-streaming response
    const response = ensureChatCompletionResponse(result, 'chat completion');
    
    // Display the response
    console.log('✨ Response:\n');
    console.log(response.choices[0].message.content);
    console.log('');
    
    // Display usage statistics
    displayUsage(response);
    
    console.log('✅ Request completed successfully!\n');
    console.log('💡 Tip: Try changing the prompt or model in the script to experiment\n');
    
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
