/**
 * List API Keys Example
 * 
 * This example demonstrates how to use the Venice AI API to list your API keys.
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/api-keys/list-keys.js
 */

const { VeniceAI } = require('../../dist');

// Get API key from command line argument or environment variable
const apiKey = process.argv[2] || process.env.VENICE_API_KEY || 'your-api-key';

console.log('Using API key:', apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 4));

// Initialize the client with your API key and enable debug logging
const venice = new VeniceAI({
  apiKey: apiKey,
  logLevel: 'debug' // Enable debug logging
});

// Alternatively, you can enable debug logging after initialization
// venice.enableDebugLogging();

async function main() {
  try {
    console.log('Fetching API keys...');
    
    // List API keys
    const response = await venice.apiKeys.list();
    
    // The SDK now handles both response structures (data or keys array)
    // and normalizes them to the keys property
    if (response.keys && response.keys.length > 0) {
      console.log(`\nFound ${response.keys.length} API keys:\n`);
      
      // Display keys in a table format
      const idWidth = 38;
      const descWidth = 25;
      const last6Width = 10;
      const createdWidth = 25;
      
      console.log(
        'ID'.padEnd(idWidth) +
        'Description'.padEnd(descWidth) +
        'Last 6'.padEnd(last6Width) +
        'Created'.padEnd(createdWidth) +
        'Status'
      );
      console.log('-'.repeat(idWidth + descWidth + last6Width + createdWidth + 15));
      
      response.keys.forEach(key => {
        // Convert ISO date string to localized date string
        const created = key.createdAt ? new Date(key.createdAt).toLocaleString() : 'N/A';
        
        // Determine status based on expiresAt date
        const now = new Date();
        const expiresAt = key.expiresAt ? new Date(key.expiresAt) : null;
        const isActive = expiresAt ? now < expiresAt : false;
        const status = isActive ? 'Active' : 'Inactive';
        
        // Determine if it's an admin key
        const isAdmin = key.apiKeyType === 'ADMIN';
        const typeLabel = isAdmin ? ' (Admin)' : '';
        
        console.log(
          (key.id || 'Unknown').padEnd(idWidth) +
          (key.description || 'Unknown').padEnd(descWidth) +
          (key.last6Chars || 'N/A').padEnd(last6Width) +
          created.padEnd(createdWidth) +
          status + typeLabel
        );
      });
    } else {
      console.log('\nNo API keys found or endpoint not available.');
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