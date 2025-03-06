/**
 * Models API Tests
 * 
 * This file contains tests for the Models API.
 */

const { createClient, runTest, validateResponse, logTestResults } = require('../../utils/test-utils');

// Initialize the Venice client
const venice = createClient();

/**
 * Test listing all models
 */
async function testListModels() {
  // Test listing all models
  const response = await venice.models.list();
  
  // Validate response
  validateResponse(response, {
    models: 'array'
  });
  
  // Ensure we have at least one model
  if (response.models.length === 0) {
    throw new Error('No models returned');
  }
  
  // Validate model structure
  const model = response.models[0];
  validateResponse(model, {
    id: 'string',
    name: 'string'
  });
  
  console.log(`Found ${response.models.length} models`);
  console.log('First model:', model.id, model.name);
  
  return true;
}

/**
 * Test filtering models
 */
async function testFilterModels() {
  // Test filtering models by type
  const response = await venice.models.list({
    type: 'chat'
  });
  
  // Validate response
  validateResponse(response, {
    models: 'array'
  });
  
  console.log(`Found ${response.models.length} chat models`);
  
  // Check if all models are chat models
  for (const model of response.models) {
    if (!model.id.includes('llama') && !model.id.includes('qwen') && !model.id.includes('gpt')) {
      console.warn(`Model ${model.id} may not be a chat model`);
    }
  }
  
  return true;
}

/**
 * Test getting model details
 */
async function testGetModel() {
  // First get a list of models
  const listResponse = await venice.models.list();
  
  // Get the first model ID
  const modelId = listResponse.models[0].id;
  
  // Test getting model details
  const response = await venice.models.get(modelId);
  
  // Validate response
  validateResponse(response, {
    id: 'string',
    name: 'string'
  });
  
  console.log('Model details:', response);
  
  return true;
}

/**
 * Main test function
 */
async function main() {
  const results = {
    list: await runTest('Models - List All', testListModels, { retry: true, maxAttempts: 3, delay: 2000 }),
    filter: await runTest('Models - Filter', testFilterModels, { retry: true, maxAttempts: 3, delay: 2000 }),
    get: await runTest('Models - Get Details', testGetModel, { retry: true, maxAttempts: 3, delay: 2000 })
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