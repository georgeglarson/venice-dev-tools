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
    
    // List available models with limit
    console.log('\nListing available models (limited to 5)...');
    const models = await cli.commands.listModels({ limit: 5 });
    console.log(`Showing ${models.models.length} of ${models.total} models:`);
    console.table(models.models);
    
    // List available image styles with limit
    console.log('\nListing available image styles (limited to 5)...');
    const styles = await cli.commands.listStyles({ limit: 5 });
    console.log(`Showing ${styles.styles.length} of ${styles.total} styles:`);
    console.table(styles.styles);
    
    // Get raw response for models (useful for scripting)
    console.log('\nGetting raw model data for scripting...');
    const rawModels = await cli.commands.listModels({ raw: true });
    console.log(`Raw data contains ${rawModels.data.length} models`);
    // console.log(JSON.stringify(rawModels, null, 2)); // Uncomment to see full raw data
    
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