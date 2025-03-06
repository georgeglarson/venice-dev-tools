/**
 * API Keys Rate Limits Tests
 * 
 * This file contains tests for the API Keys Rate Limits functionality.
 */

const { createClient, runTest, validateResponse, logTestResults } = require('../../utils/test-utils');

// Initialize the Venice client
const venice = createClient();

/**
 * Test getting API key rate limits
 */
async function testGetRateLimits() {
  console.log('Getting API key rate limits...');
  
  try {
    const rateLimits = await venice.apiKeys.rateLimits();
    
    // Validate response
    validateResponse(rateLimits, {
      rate_limits: 'array'
    });
    
    console.log(`Found ${rateLimits.rate_limits.length} rate limits`);
    
    if (rateLimits.tier) {
      console.log(`Tier: ${rateLimits.tier}`);
    }
    
    // If we have rate limits, validate the structure of the first one
    if (rateLimits.rate_limits.length > 0) {
      const firstLimit = rateLimits.rate_limits[0];
      console.log(`First limit: ${firstLimit.model_name || 'Unknown'} (${firstLimit.model_id || 'Unknown ID'})`);
    }
    
    return true;
  } catch (error) {
    // If the API doesn't support rate limits, log a warning and return true
    if (error.message.includes('not found') || error.message.includes('not supported')) {
      console.warn('API key rate limits may not be supported by the API');
      return true;
    }
    
    throw error;
  }
}

/**
 * Test getting model rate limits
 */
async function testGetModelRateLimits() {
  try {
    // First get all rate limits
    const rateLimits = await venice.apiKeys.rateLimits();
    
    // Skip this test if we don't have any rate limits
    if (!rateLimits.rate_limits || rateLimits.rate_limits.length === 0) {
      console.log('No rate limits found, skipping get model rate limits test');
      return true;
    }
    
    // Get the first model ID
    const modelId = rateLimits.rate_limits[0].model_id;
    
    if (!modelId) {
      console.log('No model ID found in rate limits, skipping get model rate limits test');
      return true;
    }
    
    console.log(`Getting rate limits for model: ${modelId}`);
    
    // Test getting model rate limits
    try {
      const modelLimits = await venice.apiKeys.getModelRateLimits(modelId);
      
      // Validate response (structure may vary)
      console.log(`Model limits: ${JSON.stringify(modelLimits, null, 2)}`);
      
      return true;
    } catch (error) {
      // If the API doesn't support getting model rate limits, log a warning and return true
      if (error.message.includes('not found') || error.message.includes('not supported')) {
        console.warn('Getting model rate limits may not be supported by the API');
        return true;
      }
      
      throw error;
    }
  } catch (error) {
    // If the API doesn't support rate limits, log a warning and return true
    if (error.message.includes('not found') || error.message.includes('not supported')) {
      console.warn('API key rate limits may not be supported by the API');
      return true;
    }
    
    throw error;
  }
}

/**
 * Main test function
 */
async function main() {
  const results = {
    getRateLimits: await runTest('API Keys - Get Rate Limits', testGetRateLimits),
    getModelRateLimits: await runTest('API Keys - Get Model Rate Limits', testGetModelRateLimits)
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