/**
 * API Key Rate Limits Example
 * 
 * This example demonstrates how to use the Venice AI API to view rate limits for your API keys.
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/api-keys/rate-limits.js
 */

const { VeniceAI } = require('../../dist');

// Initialize the client with your API key
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

async function main() {
  try {
    console.log('Fetching API key rate limits...');
    
    // Get API key rate limits
    const response = await venice.apiKeys.rateLimits();
    
    if (response.rate_limits && response.rate_limits.length > 0) {
      console.log(`\nAPI key tier: ${response.tier ? response.tier.toUpperCase() : 'Unknown'}\n`);
      
      // Display rate limits in a table format
      console.log('Model ID'.padEnd(30) + 'Model Name'.padEnd(30) + 'Req/Min'.padEnd(10) + 'Req/Day'.padEnd(10) + 'Tokens/Min');
      console.log('-'.repeat(90));
      
      response.rate_limits.forEach(limit => {
        console.log(
          (limit.model_id || 'Unknown').padEnd(30) + 
          (limit.model_name || 'Unknown').padEnd(30) + 
          String(limit.requests_per_minute || 'N/A').padEnd(10) + 
          String(limit.requests_per_day || 'N/A').padEnd(10) + 
          String(limit.tokens_per_minute || 'N/A')
        );
      });
    } else {
      console.log('\nNo rate limits found or endpoint not available.');
    }
    
    // Display rate limit information if available
    if (response._metadata?.rateLimit) {
      const rateLimit = response._metadata.rateLimit;
      console.log('\nRate Limit:');
      console.log(`  Remaining: ${rateLimit.remaining}/${rateLimit.limit}`);
      console.log(`  Resets at: ${new Date(rateLimit.reset * 1000).toLocaleString()}`);
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