const { VeniceNode } = require('@venice-ai/node');

async function main() {
  // Initialize the Venice AI SDK
  const venice = new VeniceNode({
    apiKey: process.env.VENICE_API_KEY
  });

  try {
    // List API keys
    console.log('Listing API keys:');
    const keys = await venice.keys.list();
    console.log(keys);

    // Get rate limits
    console.log('\nGetting rate limits:');
    const rateLimits = await venice.keys.getRateLimits();
    console.log(rateLimits);

    // Create API key (uncomment to run)
    /*
    console.log('\nCreating a new API key:');
    const newKey = await venice.keys.create({
      name: 'Example API Key'
    });
    console.log(newKey);
    */

    // Get rate limit logs
    console.log('\nGetting rate limit logs:');
    const rateLimitLogs = await venice.keys.getRateLimitLogs();
    console.log(rateLimitLogs);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();