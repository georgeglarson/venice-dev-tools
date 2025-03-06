/**
 * Chat Completions API Tests
 * 
 * This file contains tests for the Chat Completions API.
 */

const { createClient, runTest, validateResponse, logTestResults } = require('../../utils/test-utils');

// Initialize the Venice client
const venice = createClient();

/**
 * Test basic chat completion
 */
async function testBasicChatCompletion() {
  // Test basic chat completion
  const response = await venice.chat.completions.create({
    model: 'llama-3.3-70b', // Use an appropriate model
    messages: [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Hello, how are you?' }
    ]
  });
  
  // Validate response
  validateResponse(response, {
    id: 'string',
    object: 'string',
    created: 'number',
    model: 'string',
    choices: 'array'
  });
  
  // Validate choices
  const choice = response.choices[0];
  validateResponse(choice, {
    message: 'object',
    index: 'number',
    finish_reason: 'string'
  });
  
  // Validate message
  validateResponse(choice.message, {
    role: 'string',
    content: 'string'
  });
  
  console.log('Chat completion response:', choice.message.content.substring(0, 100) + '...');
  
  return true;
}

/**
 * Test chat completion with parameters
 */
async function testChatCompletionWithParameters() {
  // Test chat completion with parameters
  const response = await venice.chat.completions.create({
    model: 'llama-3.3-70b', // Use an appropriate model
    messages: [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Write a short poem about AI' }
    ],
    max_tokens: 100,
    temperature: 0.7
  });
  
  // Validate response
  validateResponse(response, {
    id: 'string',
    object: 'string',
    created: 'number',
    model: 'string',
    choices: 'array'
  });
  
  console.log('Chat completion with parameters response:', response.choices[0].message.content);
  
  return true;
}

/**
 * Test chat completion with system message
 */
async function testChatCompletionWithSystemMessage() {
  // Test chat completion with system message
  const response = await venice.chat.completions.create({
    model: 'llama-3.3-70b', // Use an appropriate model
    messages: [
      { role: 'system', content: 'You are a helpful assistant that speaks like a pirate' },
      { role: 'user', content: 'Tell me about the weather' }
    ]
  });
  
  // Validate response
  validateResponse(response, {
    id: 'string',
    object: 'string',
    created: 'number',
    model: 'string',
    choices: 'array'
  });
  
  console.log('Chat completion with system message response:', response.choices[0].message.content);
  
  return true;
}

/**
 * Main test function
 */
async function main() {
  const results = {
    basic: await runTest('Chat Completions - Basic', testBasicChatCompletion),
    withParams: await runTest('Chat Completions - With Parameters', testChatCompletionWithParameters),
    withSystem: await runTest('Chat Completions - With System Message', testChatCompletionWithSystemMessage)
  };
  
  // Log test results
  const allPassed = logTestResults(results);
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}