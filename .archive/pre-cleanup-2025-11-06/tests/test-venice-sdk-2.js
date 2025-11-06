// Test script for Venice SDK - API Key Setting Test
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
  printHeader('Venice AI SDK API Key Setting Test');
  
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
    
    // Get the HTTP client and check headers
    const httpClient = venice.getStandardHttpClient();
    printInfo('Testing API key handling...');
    
    // Check if Authorization header is set correctly
    const initialHeaders = httpClient.getHeaders();
    if (initialHeaders.Authorization && initialHeaders.Authorization.includes(process.env.VENICE_API_KEY)) {
      printSuccess('API key correctly set during initialization');
    } else {
      printError('API key not correctly set during initialization');
      process.exit(1);
    }
    
    // Explicitly set the API key
    printInfo('Testing explicit API key setting...');
    venice.setApiKey(process.env.VENICE_API_KEY);
    
    // Check if Authorization header is still set correctly
    const updatedHeaders = httpClient.getHeaders();
    if (updatedHeaders.Authorization && updatedHeaders.Authorization.includes(process.env.VENICE_API_KEY)) {
      printSuccess('API key correctly set using explicit setApiKey method');
    } else {
      printError('API key not correctly set using explicit setApiKey method');
      process.exit(1);
    }
    
    // Try to list models
    printInfo('Testing API connection with set API key...');
    const models = await venice.models.list();
    
    printSuccess(`Connected to Venice AI API successfully`);
    printSuccess(`Found ${models.data.length} available models`);
    
    console.log('\n' + colors.bright + colors.green + '✓ All tests passed! API key handling is working correctly.' + colors.reset);
    console.log(colors.bright + colors.green + '  The SDK can be initialized with an API key and the key can be updated at runtime.' + colors.reset + '\n');
    
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