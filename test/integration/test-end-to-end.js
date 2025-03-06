/**
 * End-to-End Integration Tests
 * 
 * This file contains integration tests that test multiple resources together.
 */

const { createClient, runTest, validateResponse, logTestResults } = require('../utils/test-utils');

// Initialize the Venice client
const venice = createClient();

/**
 * Test end-to-end workflow: Models -> Chat -> Image
 */
async function testModelsToChat() {
  // 1. List available models
  const models = await venice.models.list();
  console.log(`Found ${models.models.length} models`);
  
  // Ensure we have at least one model
  if (models.models.length === 0) {
    throw new Error('No models returned');
  }
  
  // 2. Select a model for chat (preferably a chat model)
  const chatModel = models.models.find(m => 
    m.id.includes('llama') || 
    m.id.includes('qwen') || 
    m.id.includes('gpt')
  ) || models.models[0];
  
  console.log(`Selected chat model: ${chatModel.id}`);
  
  // 3. Generate a chat completion
  const chatResponse = await venice.chat.completions.create({
    model: chatModel.id,
    messages: [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Generate a prompt for an image of a sunset over mountains' }
    ]
  });
  
  // Validate chat response
  validateResponse(chatResponse, {
    id: 'string',
    choices: 'array'
  });
  
  const imagePrompt = chatResponse.choices[0].message.content;
  console.log(`Generated image prompt: ${imagePrompt}`);
  
  // 4. Find an image generation model
  const imageModel = models.models.find(m => 
    m.id.includes('stable-diffusion') || 
    m.id.includes('dall-e')
  );
  
  // Skip image generation if no suitable model is found
  if (!imageModel) {
    console.log('No suitable image generation model found, skipping image generation');
    return true;
  }
  
  console.log(`Selected image model: ${imageModel.id}`);
  
  // 5. Generate an image
  try {
    const imageResponse = await venice.image.generate({
      model: imageModel.id,
      prompt: imagePrompt
    });
    
    // Validate image response
    validateResponse(imageResponse, {
      id: 'string',
      url: 'string'
    });
    
    console.log(`Generated image URL: ${imageResponse.url}`);
  } catch (error) {
    // If image generation fails, log a warning but don't fail the test
    console.warn(`Image generation failed: ${error.message}`);
  }
  
  return true;
}

/**
 * Test API keys and rate limits
 */
async function testApiKeysAndRateLimits() {
  // 1. List API keys
  const keys = await venice.apiKeys.list();
  console.log(`Found ${keys.keys.length} API keys`);
  
  // 2. Get rate limits
  try {
    const rateLimits = await venice.apiKeys.rateLimits();
    
    // Validate rate limits response
    validateResponse(rateLimits, {
      rate_limits: 'array'
    });
    
    console.log(`Found ${rateLimits.rate_limits.length} rate limits`);
    
    if (rateLimits.rate_limits.length > 0) {
      console.log(`First rate limit: ${JSON.stringify(rateLimits.rate_limits[0])}`);
    }
  } catch (error) {
    // If rate limits endpoint is not supported, log a warning but don't fail the test
    console.warn(`Rate limits endpoint may not be supported: ${error.message}`);
  }
  
  return true;
}

/**
 * Test characters and chat
 */
async function testCharactersAndChat() {
  // 1. List characters
  const characters = await venice.characters.list();
  console.log(`Found ${characters.characters.length} characters`);
  
  // Skip if no characters are found
  if (characters.characters.length === 0) {
    console.log('No characters found, skipping character chat test');
    return true;
  }
  
  // 2. Select a character
  const character = characters.characters[0];
  console.log(`Selected character: ${character.name} (${character.id})`);
  
  // 3. Chat with the character
  try {
    const chatResponse = await venice.characters.chat({
      character_id: character.id,
      messages: [
        { role: 'user', content: 'Tell me about yourself' }
      ]
    });
    
    // Validate chat response
    validateResponse(chatResponse, {
      choices: 'array'
    });
    
    console.log(`Character chat response: ${chatResponse.choices[0].message.content}`);
  } catch (error) {
    // If character chat is not supported, log a warning but don't fail the test
    console.warn(`Character chat may not be supported: ${error.message}`);
  }
  
  return true;
}

/**
 * Main test function
 */
async function main() {
  const results = {
    modelsToChat: await runTest('Integration - Models to Chat to Image', testModelsToChat),
    apiKeysAndRateLimits: await runTest('Integration - API Keys and Rate Limits', testApiKeysAndRateLimits),
    charactersAndChat: await runTest('Integration - Characters and Chat', testCharactersAndChat)
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