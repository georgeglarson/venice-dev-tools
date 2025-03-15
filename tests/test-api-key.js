const axios = require('axios');

// Test with the API key directly
async function testApiKey() {
  // Check if API key is provided
  if (!process.env.VENICE_API_KEY) {
    console.error('Error: VENICE_API_KEY environment variable is required');
    console.error('\nTo run this test, set the VENICE_API_KEY environment variable:');
    console.error('\n  # On Linux/macOS:');
    console.error('  export VENICE_API_KEY=your-api-key');
    console.error('\n  # On Windows Command Prompt:');
    console.error('  set VENICE_API_KEY=your-api-key');
    console.error('\n  # On Windows PowerShell:');
    console.error('  $env:VENICE_API_KEY="your-api-key"');
    console.error('\nThen run the test again.');
    process.exit(1);
  }
  
  try {
    console.log('Testing API key with axios...');
    const response = await axios.get('https://api.venice.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`
      }
    });
    
    console.log('Success! Response status:', response.status);
    console.log('Models count:', response.data.data.length);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testApiKey();