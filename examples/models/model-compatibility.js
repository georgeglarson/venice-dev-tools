/**
 * Model Compatibility Example
 * 
 * This example demonstrates how to use the Venice AI API to list and filter model compatibility mappings.
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/models/model-compatibility.js
 */

const { VeniceAI } = require('../../dist');

// Initialize the client with your API key
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

// Enable debug logging to see detailed information
venice.enableDebugLogging();

async function modelCompatibility() {
  try {
    console.log('Listing all model compatibility mappings...');
    
    // Method 1: Using the CLI interface to list all compatibility mappings
    const allMappingsResult = await venice.cli('list-model-compatibility');
    console.log('All mappings count:', Object.keys(allMappingsResult.mappings).length);
    
    // Method 2: Using the CLI interface to filter by external model name
    console.log('\nFiltering by external model name (gpt-4)...');
    const gpt4MappingsResult = await venice.cli('list-model-compatibility --external gpt-4');
    
    // Method 3: Using the CLI interface to filter by Venice model name
    console.log('\nFiltering by Venice model name (llama)...');
    const llamaMappingsResult = await venice.cli('list-model-compatibility --venice llama');
    
    // Method 4: Using the programmatic interface
   try {
     console.log('\nUsing programmatic interface...');
     const programmaticResult = await venice.models.compatibility();
     
     // Filter mappings by external model
     const gpt4Mappings = Object.entries(programmaticResult.mappings)
       .filter(([key]) => key.toLowerCase().includes('gpt-4'))
       .reduce((obj, [key, value]) => {
         obj[key] = value;
         return obj;
       }, {});
     
     // Filter mappings by Venice model
     const llamaMappings = Object.entries(programmaticResult.mappings)
       .filter(([, value]) => String(value).toLowerCase().includes('llama'))
       .reduce((obj, [key, value]) => {
         obj[key] = value;
         return obj;
       }, {});
     
     console.log('Programmatic API results:');
     console.log(`Total mappings: ${Object.keys(programmaticResult.mappings).length}`);
     console.log(`GPT-4 mappings: ${Object.keys(gpt4Mappings).length}`);
     console.log(`Llama mappings: ${Object.keys(llamaMappings).length}`);
     
     // Display a few examples
     console.log('\nGPT-4 Mapping Examples:');
     Object.entries(gpt4Mappings).slice(0, 3).forEach(([key, value]) => {
       console.log(`${key} -> ${value}`);
     });
     
     console.log('\nLlama Mapping Examples:');
     Object.entries(llamaMappings).slice(0, 3).forEach(([key, value]) => {
       console.log(`${key} -> ${value}`);
     });
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
modelCompatibility();