/**
 * Web Search Chat Example
 * 
 * This example demonstrates how to use the Venice AI API to generate a chat completion
 * with web search enabled.
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/chat/web-search.js
 */

const { VeniceAI } = require('../../dist');
const readline = require('readline');

// Initialize the client with your API key
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    console.log('Web Search Chat Example\n');
    console.log('This example demonstrates using the Venice AI API with web search enabled.');
    console.log('Ask a question that might require up-to-date information from the web.\n');
    
    // Get user query
    const userQuery = await prompt('Enter your question: ');
    
    console.log('\nGenerating response with web search...');
    
    // Generate a chat completion with web search enabled
    const response = await venice.chat.completions.create({
      model: 'llama-3.3-70b', // You can use any available model
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant with access to web search. When answering questions, use web search to provide accurate and up-to-date information. Always cite your sources.' 
        },
        { role: 'user', content: userQuery }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      venice_parameters: {
        enable_web_search: 'on', // Enable web search
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
    
    // Alternative: Using model feature suffix
    console.log('\nYou can also enable web search using the model feature suffix:');
    console.log('  model: "llama-3.3-70b:enable_web_search=on"');
    
    rl.close();
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
    
    rl.close();
  }
}

main();