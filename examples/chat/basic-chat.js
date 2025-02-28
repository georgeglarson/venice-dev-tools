/**
 * Basic Chat Example
 * 
 * This example demonstrates how to use the Venice AI API to generate a chat completion.
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/chat/basic-chat.js
 */

const { VeniceAI } = require('../../dist');

// Initialize the client with your API key
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

async function main() {
  try {
    console.log('Generating chat completion...');
    
    // Generate a chat completion
    const response = await venice.chat.completions.create({
      model: 'llama-3.3-70b', // You can use any available model
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Tell me about the Venice AI API in 3 sentences.' }
      ],
      temperature: 0.7,
      max_tokens: 500,
      venice_parameters: {
        include_venice_system_prompt: true
      }
    });
    
    // Extract and display the response
    const message = response.choices[0].message;
    console.log('\nAssistant:', message.content);
    
    // Display usage information
    console.log('\nUsage:');
    console.log(`  Prompt tokens: ${response.usage.prompt_tokens}`);
    console.log(`  Completion tokens: ${response.usage.completion_tokens}`);
    console.log(`  Total tokens: ${response.usage.total_tokens}`);
    
    // Display rate limit information if available
    if (response._metadata?.rateLimit) {
      const rateLimit = response._metadata.rateLimit;
      console.log('\nRate Limit:');
      console.log(`  Remaining: ${rateLimit.remaining}/${rateLimit.limit}`);
      console.log(`  Resets at: ${new Date(rateLimit.reset * 1000).toLocaleString()}`);
    }
    
    // Display balance information if available
    if (response._metadata?.balance) {
      const balance = response._metadata.balance;
      console.log('\nBalance:');
      console.log(`  VCU: ${balance.vcu}`);
      console.log(`  USD: ${balance.usd}`);
    }
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