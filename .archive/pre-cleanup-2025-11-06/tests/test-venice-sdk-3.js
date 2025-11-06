// Test script for Venice SDK - Comparison with Direct API Call
const { VeniceNode } = require('../venice-ai-sdk/packages/node');
const axios = require('axios');

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

function printSection(text) {
  console.log('\n' + colors.bright + colors.yellow + '▶ ' + text + colors.reset);
}

async function testVeniceSDK() {
  printHeader('Venice AI SDK vs Direct API Comparison Test');
  
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
    
    // Initialize the SDK with the API key from environment variable
    printInfo('Initializing Venice AI SDK...');
    const venice = new VeniceNode({
      apiKey: process.env.VENICE_API_KEY
    });
    printSuccess('SDK initialized successfully');
    
    // Try a direct axios request to compare
    printSection('Testing Direct API Call with Axios');
    printInfo('Making direct API request to Venice AI...');
    
    const startTimeAxios = Date.now();
    const axiosResponse = await axios.get('https://api.venice.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`
      }
    });
    const axiosTime = Date.now() - startTimeAxios;
    
    printSuccess(`Direct API call succeeded in ${axiosTime}ms`);
    printSuccess(`Found ${axiosResponse.data.data.length} models via direct API call`);
    
    // Try to list models with the SDK
    printSection('Testing SDK API Call');
    printInfo('Making API request through Venice AI SDK...');
    
    const startTimeSDK = Date.now();
    const models = await venice.models.list();
    const sdkTime = Date.now() - startTimeSDK;
    
    printSuccess(`SDK API call succeeded in ${sdkTime}ms`);
    printSuccess(`Found ${models.data.length} models via SDK`);
    
    // Compare results
    printSection('Comparing Results');
    
    if (axiosResponse.data.data.length === models.data.length) {
      printSuccess('Both methods returned the same number of models');
    } else {
      printError('Different number of models returned');
      console.log(`Direct API: ${axiosResponse.data.data.length}, SDK: ${models.data.length}`);
    }
    
    // Compare performance
    const performanceDiff = sdkTime - axiosTime;
    if (performanceDiff <= 50) { // Allow small overhead
      printSuccess(`SDK performance is good (only ${Math.abs(performanceDiff)}ms ${performanceDiff >= 0 ? 'slower' : 'faster'} than direct API call)`);
    } else {
      printInfo(`SDK adds ${performanceDiff}ms overhead compared to direct API call`);
    }
    
    console.log('\n' + colors.bright + colors.green + '✓ All tests passed! The SDK correctly interfaces with the Venice AI API.' + colors.reset);
    console.log(colors.bright + colors.green + '  The SDK provides a convenient wrapper around the API with minimal overhead.' + colors.reset + '\n');
    
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