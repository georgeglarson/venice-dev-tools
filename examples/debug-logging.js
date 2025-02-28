/**
 * Debug Logging Example
 * 
 * This example demonstrates how to use the debug logging functionality in the Venice AI SDK.
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/debug-logging.js
 */

const { VeniceAI } = require('../dist');

// LogLevel enum values:
// NONE = 0, ERROR = 1, WARN = 2, INFO = 3, DEBUG = 4, TRACE = 5

// Initialize the client with your API key and debug logging enabled
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
  logLevel: 4, // DEBUG level
});

async function main() {
  try {
    console.log('Making API requests with debug logging enabled...\n');
    
    // Make a request to list models
    console.log('Fetching models...');
    const models = await venice.models.list();
    console.log(`Found ${models.data.length} models\n`);
    
    // Make a request to generate a chat completion
    console.log('Generating chat completion...');
    const chatResponse = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello in one word.' }
      ],
      max_tokens: 10
    });
    console.log(`Chat response: ${chatResponse.choices[0].message.content}\n`);
    
    // Change log level during runtime
    console.log('Changing log level to TRACE...');
    venice.setLogLevel(5); // TRACE level
    
    // Make another request with trace logging
    console.log('Generating another chat completion with TRACE logging...');
    const anotherResponse = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say goodbye in one word.' }
      ],
      max_tokens: 10
    });
    console.log(`Chat response: ${anotherResponse.choices[0].message.content}\n`);
    
    // Disable logging
    console.log('Disabling logging...');
    venice.disableLogging(); // Sets to NONE (0)
    
    // Make a request with logging disabled
    console.log('Generating final chat completion with logging disabled...');
    const finalResponse = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say thank you in one word.' }
      ],
      max_tokens: 10
    });
    console.log(`Chat response: ${finalResponse.choices[0].message.content}\n`);
    
    console.log('Debug logging example completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
      console.error('Status:', error.status);
    }
  }
}

main();