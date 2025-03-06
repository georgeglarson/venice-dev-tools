/**
 * Test Improvements Script
 * 
 * This script tests the improved implementations for Image Styles, API Keys List,
 * and API Keys Rate Limits resources.
 * 
 * To run this script:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node test/api-features/test-improvements.js
 */

const { createClient, runTest } = require('../utils/test-utils');

// Initialize the client with the utility function
const venice = createClient();

async function testImageStyles() {
  try {
    console.log('Listing image styles...');
    const styles = await venice.image.styles.list();
    
    console.log(`Found ${styles.styles.length} image styles`);
    
    if (styles.styles.length > 0) {
      const firstStyle = styles.styles[0];
      console.log(`First style: ${firstStyle.name} (${firstStyle.id})`);
      
      console.log(`\nGetting style details for: ${firstStyle.id}`);
      try {
        const styleDetails = await venice.image.styles.getStyle(firstStyle.id);
        console.log(`Style details: ${JSON.stringify(styleDetails, null, 2)}`);
      } catch (error) {
        console.log(`Error getting style details: ${error.message}`);
      }
    }
    
    console.log('\nImage Styles test completed successfully!');
  } catch (error) {
    console.error('Error testing Image Styles:', error.message);
    throw error; // Re-throw to be caught by runTest
  }
}

async function testApiKeysList() {
  try {
    console.log('Listing API keys...');
    const keys = await venice.apiKeys.list();
    
    console.log(`Found ${keys.keys.length} API keys`);
    
    if (keys.keys.length > 0) {
      const firstKey = keys.keys[0];
      console.log(`First key: ${firstKey.name || firstKey.description} (${firstKey.id})`);
      
      console.log(`\nGetting key details for: ${firstKey.id}`);
      try {
        const keyDetails = await venice.apiKeys.list.getKey(firstKey.id);
        console.log(`Key details: ${JSON.stringify(keyDetails, null, 2)}`);
      } catch (error) {
        console.log(`Error getting key details: ${error.message}`);
      }
    }
    
    console.log('\nAPI Keys List test completed successfully!');
  } catch (error) {
    console.error('Error testing API Keys List:', error.message);
    throw error; // Re-throw to be caught by runTest
  }
}

async function testApiKeysRateLimits() {
  try {
    console.log('Getting API key rate limits...');
    const rateLimits = await venice.apiKeys.rateLimits();
    
    console.log(`Found ${rateLimits.rate_limits.length} rate limits`);
    console.log(`Tier: ${rateLimits.tier}`);
    
    if (rateLimits.rate_limits.length > 0) {
      const firstLimit = rateLimits.rate_limits[0];
      console.log(`First limit: ${firstLimit.model_name} (${firstLimit.model_id})`);
      
      console.log(`\nGetting rate limits for model: ${firstLimit.model_id}`);
      try {
        const modelLimits = await venice.apiKeys.getModelRateLimits(firstLimit.model_id);
        console.log(`Model limits: ${JSON.stringify(modelLimits, null, 2)}`);
      } catch (error) {
        console.log(`Error getting model rate limits: ${error.message}`);
      }
    }
    
    console.log('\nAPI Keys Rate Limits test completed successfully!');
  } catch (error) {
    console.error('Error testing API Keys Rate Limits:', error.message);
    throw error; // Re-throw to be caught by runTest
  }
}

async function main() {
  console.log('Testing improved implementations...\n');
  
  // Run each test using the runTest utility
  const results = {
    imageStyles: await runTest('Image Styles', testImageStyles),
    apiKeysList: await runTest('API Keys List', testApiKeysList),
    apiKeysRateLimits: await runTest('API Keys Rate Limits', testApiKeysRateLimits)
  };
  
  // Summary
  console.log('\n=== Test Summary ===');
  for (const [test, success] of Object.entries(results)) {
    console.log(`${test}: ${success ? '✅ Passed' : '❌ Failed'}`);
  }
  
  // Overall result
  const allPassed = Object.values(results).every(result => result);
  console.log(`\nOverall Result: ${allPassed ? '✅ All tests passed' : '❌ Some tests failed'}`);
  
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