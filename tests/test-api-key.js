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

// Test with the API key directly
async function testApiKey() {
  printHeader('Venice AI API Key Test');
  
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
  
  try {
    printInfo('Testing API key with direct API call...');
    printInfo('Connecting to Venice AI API...');
    
    const response = await axios.get('https://api.venice.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`
      }
    });
    
    printSuccess(`Connected to Venice AI API successfully (Status: ${response.status})`);
    printSuccess(`API key is valid and working`);
    printSuccess(`Found ${response.data.data.length} available models`);
    
    // Print model names
    console.log('\nAvailable models:');
    response.data.data.forEach(model => {
      console.log(`  - ${model.id}`);
    });
    
    console.log('\n' + colors.bright + colors.green + '✓ API key test passed! Your Venice AI API key is working correctly.' + colors.reset);
    console.log(colors.bright + colors.green + '  You are ready to start building with Venice AI!' + colors.reset + '\n');
    
  } catch (error) {
    printError('API key test failed');
    
    if (error.response && error.response.status === 401) {
      printError('Invalid API key. Please check your API key and try again.');
    } else if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.code === 'ENOTFOUND') {
      printError('Could not connect to the Venice AI API. Please check your internet connection.');
    } else {
      console.error('Error:', error.message);
    }
    
    process.exit(1);
  }
}

testApiKey();