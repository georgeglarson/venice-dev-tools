/**
 * Example of using the CLI commands programmatically
 * 
 * This example demonstrates how to use the CLI commands directly in your code
 * without having to learn the full SDK API.
 */

const { cli } = require('../dist');

// Enable debug mode (optional)
cli.commands.enableDebug();

async function main() {
  try {
    // Chat with the AI
    console.log('Sending chat request...');
    const response = await cli.commands.chat('What are the top 3 programming languages in 2025?', {
      model: 'llama-3.3-70b',
      webSearch: true
    });
    console.log('\nResponse:');
    console.log(response);
    
    // List available models
    console.log('\nListing available models...');
    const models = await cli.commands.listModels();
    console.log('Available models:');
    console.table(models.models.slice(0, 5)); // Show first 5 models
    
    // List available image styles
    console.log('\nListing available image styles...');
    const styles = await cli.commands.listStyles();
    console.log('Available styles:');
    console.table(styles.styles.slice(0, 5)); // Show first 5 styles
    
    // Generate an image (commented out to avoid accidental API usage)
    /*
    console.log('\nGenerating an image...');
    const image = await cli.commands.generateImage('A beautiful sunset over mountains', {
      style: 'Photographic',
      outputPath: 'sunset.png'
    });
    console.log(`Image URL: ${image.url}`);
    if (image.savedTo) {
      console.log(`Image saved to: ${image.savedTo}`);
    }
    */
    
    // List API keys (commented out for security)
    /*
    console.log('\nListing API keys...');
    const keys = await cli.commands.listKeys();
    console.log('API Keys:');
    console.table(keys.keys);
    */
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();