/**
 * Image Styles Example
 * 
 * This example demonstrates how to use the Venice AI API to list available image styles.
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/image/image-styles.js
 */

const { VeniceAI } = require('../../dist');

// Initialize the client with your API key
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

async function main() {
  try {
    console.log('Fetching available image styles...');
    
    // List available image styles
    const response = await venice.image.styles.list();
    
    if (response.styles && response.styles.length > 0) {
      console.log(`\nFound ${response.styles.length} image styles:\n`);
      
      // Display styles in a table format
      console.log('ID'.padEnd(30) + 'Name'.padEnd(30) + 'Description');
      console.log('-'.repeat(90));
      
      response.styles.forEach(style => {
        console.log(
          (style.id || 'Unknown').padEnd(30) + 
          (style.name || 'Unknown').padEnd(30) + 
          (style.description || '')
        );
      });
      
      if (response.styles[0].preview_url) {
        console.log('\nPreview URLs are available for styles.');
      }
    } else {
      console.log('\nNo image styles found or endpoint not available.');
    }
    
    // Display rate limit information if available
    if (response._metadata?.rateLimit) {
      const rateLimit = response._metadata.rateLimit;
      console.log('\nRate Limit:');
      console.log(`  Remaining: ${rateLimit.remaining}/${rateLimit.limit}`);
      console.log(`  Resets at: ${new Date(rateLimit.reset * 1000).toLocaleString()}`);
    }
    
    // Display balance information if available
    if (response._metadata?.balance) {
      const balance = response._metadata.balance;
      console.log('\nBalance:');
      console.log(`  VCU: ${balance.vcu}`);
      console.log(`  USD: ${balance.usd}`);
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