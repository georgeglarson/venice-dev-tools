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
    
    // Log the headers before setting the API key
    const httpClient = venice.getStandardHttpClient();
    console.log('Headers before explicitly setting API key:', httpClient.getHeaders());
    
    // Explicitly set the API key
    console.log('Explicitly setting API key...');
    venice.setApiKey(process.env.VENICE_API_KEY);
    
    // Log the headers after setting the API key
    console.log('Headers after explicitly setting API key:', httpClient.getHeaders());
    
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