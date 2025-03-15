// Test script for Venice SDK
const { VeniceNode } = require('../venice-ai-sdk/packages/node');

// Helper function for colored console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function printHeader(text) {
  console.log('\n' + colors.bright + colors.blue + '='.repeat(60) + colors.reset);
  console.log(colors.bright + colors.blue + ' ' + text + colors.reset);
  console.log(colors.bright + colors.blue + '='.repeat(60) + colors.reset + '\n');
}

function printSuccess(text) {
  console.log(colors.green + '✓ ' + text + colors.reset);
}

function printInfo(text) {
  console.log(colors.cyan + 'ℹ ' + text + colors.reset);
}

function printError(text) {
  console.log(colors.red + '✗ ' + text + colors.reset);
}

async function testVeniceSDK() {
  printHeader('Venice AI SDK Test');
  
  try {
    // Check if API key is provided
    if (!process.env.VENICE_API_KEY) {
      printError('VENICE_API_KEY environment variable is required');
      console.log('\nTo run this test, set the VENICE_API_KEY environment variable:');
      console.log('\n  # On Linux/macOS:');
      console.log('  export VENICE_API_KEY=your-api-key');
      console.log('\n  # On Windows Command Prompt:');
      console.log('  set VENICE_API_KEY=your-api-key');
      console.log('\n  # On Windows PowerShell:');
      console.log('  $env:VENICE_API_KEY="your-api-key"');
      console.log('\nThen run the test again.');
      process.exit(1);
    }
    
    printInfo('Initializing Venice AI SDK...');
    
    // Initialize the SDK with the API key from environment variable
    const venice = new VeniceNode({
      apiKey: process.env.VENICE_API_KEY
    });
    
    printSuccess('SDK initialized successfully');
    
    // Try to list models
    printInfo('Connecting to Venice AI API and fetching models...');
    const models = await venice.models.list();
    
    printSuccess(`Connected to Venice AI API successfully`);
    printSuccess(`Found ${models.data.length} available models`);
    
    // Print model names
    console.log('\nAvailable models:');
    models.data.forEach(model => {
      console.log(`  - ${model.id}`);
    });
    
    console.log('\n' + colors.bright + colors.green + '✓ All tests passed! Your Venice AI SDK installation is working correctly.' + colors.reset);
    console.log(colors.bright + colors.green + '  You are ready to start building with Venice AI!' + colors.reset + '\n');
    
  } catch (error) {
    printError('Test failed');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testVeniceSDK();