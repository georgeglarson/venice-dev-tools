/**
 * List Models Example
 * 
 * This example demonstrates how to use the Venice AI API to list available models.
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/models/list-models.js
 */

const { VeniceAI } = require('../../dist');

// Initialize the client with your API key
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

async function main() {
  try {
    console.log('Fetching available models...');
    
    // List available models
    const response = await venice.models.list();
    
    if (response.data && response.data.length > 0) {
      console.log(`\nFound ${response.data.length} models:\n`);
      
      // Display models in a table format
      console.log('ID'.padEnd(30) + 'Created'.padEnd(15) + 'Owner'.padEnd(20) + 'Capabilities');
      console.log('-'.repeat(80));
      
      response.data.forEach(model => {
        const capabilities = [];
        
        if (model.capabilities) {
          if (model.capabilities.chat_completions) capabilities.push('Chat');
          if (model.capabilities.image_generation) capabilities.push('Image');
          if (model.capabilities.embeddings) capabilities.push('Embeddings');
          if (model.capabilities.fine_tuning) capabilities.push('Fine-tuning');
        }
        
        const created = model.created ? new Date(model.created * 1000).toLocaleDateString() : 'N/A';
        
        console.log(
          (model.id || 'Unknown').padEnd(30) + 
          created.padEnd(15) + 
          (model.owned_by || 'Unknown').padEnd(20) + 
          capabilities.join(', ')
        );
      });
    } else {
      console.log('\nNo models found or unexpected response format.');
    }
    
    // Display model traits if available
    console.log('\nFetching model traits...');
    
    try {
      const traitsResponse = await venice.models.traits();
      
      if (traitsResponse.traits && traitsResponse.traits.length > 0) {
        console.log(`\nFound ${traitsResponse.traits.length} model traits:\n`);
        
        traitsResponse.traits.forEach(trait => {
          console.log(`- ${trait.name}: ${trait.description}`);
          
          if (trait.possible_values) {
            console.log(`  Possible values: ${trait.possible_values.join(', ')}`);
          }
          
          if (trait.min_value !== undefined && trait.max_value !== undefined) {
            console.log(`  Range: ${trait.min_value} to ${trait.max_value}`);
          }
          
          console.log('');
        });
      } else {
        console.log('\nNo model traits found or endpoint not available.');
      }
    } catch (error) {
      console.log('\nCould not fetch model traits:', error.message);
    }
    
    // Display model compatibility mappings if available
    console.log('\nFetching model compatibility mappings...');
    
    try {
      const compatibilityResponse = await venice.models.compatibility();
      
      if (compatibilityResponse.mappings && compatibilityResponse.mappings.length > 0) {
        console.log(`\nFound ${compatibilityResponse.mappings.length} model compatibility mappings:\n`);
        
        compatibilityResponse.mappings.forEach(mapping => {
          console.log(`- ${mapping.source_model_id} → ${mapping.target_model_id}`);
          
          if (mapping.description) {
            console.log(`  ${mapping.description}`);
          }
          
          console.log('');
        });
      } else {
        console.log('\nNo model compatibility mappings found or endpoint not available.');
      }
    } catch (error) {
      console.log('\nCould not fetch model compatibility mappings:', error.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
      console.error('Status:', error.status);
    }
    
    if (error.rateLimitInfo) {
      console.error('Rate limit exceeded. Try again after:', 
        new Date(error.rateLimitInfo.reset * 1000).toLocaleString());
    }
  }
}

main();