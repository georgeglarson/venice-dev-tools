/**
 * Venice AI SDK - Chat Completion Example
 * 
 * This example demonstrates how to use the Venice AI SDK to create a chat completion.
 * It shows both basic usage and more advanced options.
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

// Basic chat completion example
async function basicChatExample() {
  console.log('Basic Chat Example:');
  console.log('-----------------');
  
  try {
    const response = await venice.chat.createCompletion({
      model: 'llama-3.3-70b', // Specify the model to use
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is the capital of France?' }
      ]
    });
    
    console.log('Response:');
    console.log(response.choices[0].message.content);
    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Advanced chat completion example with more options
async function advancedChatExample() {
  console.log('Advanced Chat Example:');
  console.log('--------------------');
  
  try {
    const response = await venice.chat.createCompletion({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'system', content: 'You are a creative writing assistant.' },
        { role: 'user', content: 'Write a short poem about artificial intelligence.' }
      ],
      // Additional parameters
      temperature: 0.8, // Higher temperature for more creative responses
      max_tokens: 150, // Limit the response length
      top_p: 0.9, // Nucleus sampling
      frequency_penalty: 0.5, // Reduce repetition
      presence_penalty: 0.5, // Encourage diversity
      stop: ['###'] // Stop sequence
    });
    
    console.log('Response:');
    console.log(response.choices[0].message.content);
    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Multi-turn conversation example
async function conversationExample() {
  console.log('Conversation Example:');
  console.log('-------------------');
  
  try {
    const response = await venice.chat.createCompletion({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, how are you today?' },
        { role: 'assistant', content: 'I\'m doing well, thank you for asking! How can I help you today?' },
        { role: 'user', content: 'Can you explain what machine learning is in simple terms?' }
      ]
    });
    
    console.log('Response:');
    console.log(response.choices[0].message.content);
    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the examples
async function runExamples() {
  await basicChatExample();
  await advancedChatExample();
  await conversationExample();
}

runExamples().catch(console.error);