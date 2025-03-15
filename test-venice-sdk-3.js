// Test script for Venice SDK
const { VeniceNode } = require('./venice-ai-sdk/packages/node');
const axios = require('axios');

async function testVeniceSDK() {
  try {
    console.log('Testing Venice SDK...');
    
    // Check if API key is provided
    if (!process.env.VENICE_API_KEY) {
      console.error('Error: VENICE_API_KEY environment variable is required');
      process.exit(1);
    }
    
    // Initialize the SDK with the API key from environment variable
    const venice = new VeniceNode({
      apiKey: process.env.VENICE_API_KEY
    });
    
    // Explicitly set the API key
    console.log('Explicitly setting API key...');
    venice.setApiKey(process.env.VENICE_API_KEY);
    
    // Try a direct axios request to compare
    console.log('\nTrying direct axios request...');
    const axiosResponse = await axios.get('https://api.venice.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`
      }
    });
    console.log('Axios request succeeded! Models count:', axiosResponse.data.data.length);
    
    // Try to list models with the SDK
    console.log('\nTrying SDK request...');
    const models = await venice.models.list();
    
    console.log('SDK request succeeded! Models count:', models.data.length);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testVeniceSDK();