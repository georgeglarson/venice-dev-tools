// Test script for Venice SDK
const { VeniceNode } = require('../venice-ai-sdk/packages/node');

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
    
    // Log the headers that will be used
    const httpClient = venice.getStandardHttpClient();
    console.log('Headers:', httpClient.getHeaders());
    
    // Try to list models
    console.log('Listing models...');
    const models = await venice.models.list();
    
    console.log('Success! Models count:', models.data.length);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testVeniceSDK();