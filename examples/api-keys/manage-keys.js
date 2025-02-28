/**
 * Manage API Keys Example
 * 
 * This example demonstrates how to use the Venice AI API to manage API keys.
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/api-keys/manage-keys.js
 */

const { VeniceAI } = require('../../dist');
const readline = require('readline');

// Initialize the client with your API key
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    console.log('API Key Management Example\n');
    
    // Display menu
    console.log('1. List API keys');
    console.log('2. Create new API key');
    console.log('3. Delete API key');
    console.log('4. View API key rate limits');
    console.log('5. Exit');
    
    const choice = await prompt('\nEnter your choice (1-5): ');
    
    switch (choice) {
      case '1':
        await listApiKeys();
        break;
      case '2':
        await createApiKey();
        break;
      case '3':
        await deleteApiKey();
        break;
      case '4':
        await viewRateLimits();
        break;
      case '5':
        console.log('Exiting...');
        break;
      default:
        console.log('Invalid choice. Please try again.');
        break;
    }
    
    rl.close();
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
      console.error('Status:', error.status);
    }
    
    rl.close();
  }
}

async function listApiKeys() {
  console.log('\nFetching API keys...');
  
  const response = await venice.apiKeys.list();
  
  console.log(`\nFound ${response.keys.length} API keys:\n`);
  
  // Display keys in a table format
  console.log('ID'.padEnd(25) + 'Name'.padEnd(30) + 'Last 4'.padEnd(10) + 'Created'.padEnd(20) + 'Status');
  console.log('-'.repeat(95));
  
  response.keys.forEach(key => {
    const created = new Date(key.created_at * 1000).toLocaleString();
    const status = key.is_active ? 'Active' : 'Inactive';
    const primary = key.is_primary ? ' (Primary)' : '';
    
    console.log(
      key.id.padEnd(25) + 
      key.name.padEnd(30) + 
      key.last4.padEnd(10) + 
      created.padEnd(20) + 
      status + primary
    );
  });
}

async function createApiKey() {
  const name = await prompt('\nEnter a name for the new API key: ');
  
  console.log(`\nCreating new API key "${name}"...`);
  
  const response = await venice.apiKeys.create({ name });
  
  console.log('\nAPI key created successfully!');
  console.log(`Name: ${response.key.name}`);
  console.log(`Key: ${response.key.key}`);
  console.log('\nIMPORTANT: Save this API key now. You won\'t be able to see it again!');
}

async function deleteApiKey() {
  // First, list the keys
  await listApiKeys();
  
  const id = await prompt('\nEnter the ID of the API key to delete: ');
  
  // Confirm deletion
  const confirm = await prompt(`\nAre you sure you want to delete API key "${id}"? (y/n): `);
  
  if (confirm.toLowerCase() !== 'y') {
    console.log('Deletion cancelled.');
    return;
  }
  
  console.log(`\nDeleting API key "${id}"...`);
  
  const response = await venice.apiKeys.delete({ id });
  
  if (response.success) {
    console.log('\nAPI key deleted successfully!');
  } else {
    console.log('\nFailed to delete API key.');
  }
}

async function viewRateLimits() {
  console.log('\nFetching API key rate limits...');
  
  const response = await venice.apiKeys.rateLimits();
  
  console.log(`\nAPI key tier: ${response.tier.toUpperCase()}\n`);
  
  // Display rate limits in a table format
  console.log('Model ID'.padEnd(30) + 'Model Name'.padEnd(30) + 'Req/Min'.padEnd(10) + 'Req/Day'.padEnd(10) + 'Tokens/Min');
  console.log('-'.repeat(90));
  
  response.rate_limits.forEach(limit => {
    console.log(
      limit.model_id.padEnd(30) + 
      limit.model_name.padEnd(30) + 
      String(limit.requests_per_minute).padEnd(10) + 
      String(limit.requests_per_day).padEnd(10) + 
      String(limit.tokens_per_minute)
    );
  });
}

main();