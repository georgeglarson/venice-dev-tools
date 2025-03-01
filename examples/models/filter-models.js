/**
 * Filter Models Example
 * 
 * This example demonstrates how to use the Venice AI API to list and filter models
 * by type (text, code, image).
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/models/filter-models.js
 */

const { VeniceAI } = require('../../dist');

// Initialize the client with your API key
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

// Enable debug logging to see detailed information
venice.enableDebugLogging();

async function filterModels() {
  try {
    console.log('Listing all models...');
    
    // Method 1: Using the CLI interface to list all models
    const allModelsResult = await venice.cli('list-models');
    console.log('All models count:', allModelsResult.total);
    
    // Method 2: Using the CLI interface to list only text models
    console.log('\nListing text models...');
    const textModelsResult = await venice.cli('list-models --type text');
    console.log('Text models count:', textModelsResult.filtered);
    
    // Method 3: Using the CLI interface to list only code models
    console.log('\nListing code models...');
    const codeModelsResult = await venice.cli('list-models --type code');
    console.log('Code models count:', codeModelsResult.filtered);
    
    // Method 4: Using the CLI interface to list only image models
    console.log('\nListing image models...');
    const imageModelsResult = await venice.cli('list-models --type image');
    console.log('Image models count:', imageModelsResult.filtered);
    
    // Method 5: Using the CLI interface to list models with a limit
    console.log('\nListing models with a limit of 5...');
    const limitedModelsResult = await venice.cli('list-models --limit 5');
    console.log('Limited models count:', limitedModelsResult.models.length);
    
    // Method 6: Using the programmatic interface
    try {
      console.log('\nUsing programmatic interface...');
      const programmaticResult = await venice.models.list();
      
      // Filter models by type
      const textModels = programmaticResult.data.filter(model =>
        model.type && model.type.toLowerCase() === 'text'
      );
      
      const codeModels = programmaticResult.data.filter(model =>
        model.type && model.type.toLowerCase() === 'code'
      );
      
      const imageModels = programmaticResult.data.filter(model =>
        model.type && model.type.toLowerCase() === 'image'
      );
      
      console.log('Programmatic API results:');
      console.log(`Total models: ${programmaticResult.data.length}`);
      console.log(`Text models: ${textModels.length}`);
      console.log(`Code models: ${codeModels.length}`);
      console.log(`Image models: ${imageModels.length}`);
    } catch (programmaticError) {
      console.log('Programmatic API error:', programmaticError.message);
      console.log('Note: Some API endpoints may require specific permissions or may not be available in all environments.');
      console.log('The CLI commands may still work even if the direct API calls do not.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the example
filterModels();