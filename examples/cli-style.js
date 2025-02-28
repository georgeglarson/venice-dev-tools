/**
 * Example of using the CLI-style interface
 * 
 * This example demonstrates how to use the CLI-style interface that mirrors
 * the command-line syntax directly in your code.
 */

const { VeniceAI } = require('../dist');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Try to load API key from config file
const configPath = path.join(os.homedir(), '.venice-config.json');
let apiKey = process.env.VENICE_API_KEY;

if (!apiKey && fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    apiKey = config.apiKey;
  } catch (error) {
    console.error('Error reading config file:', error.message);
  }
}

async function main() {
  try {
    // Initialize the client
    const venice = new VeniceAI({
      apiKey: apiKey,
    });

    // Enable debug logging
    venice.enableDebugLogging();

    console.log('Using CLI-style interface with string arguments:');
    console.log('-----------------------------------------------');

    // List styles with string arguments (just like CLI)
    console.log('\nListing styles with limit:');
    const styles = await venice.cli('list-styles --limit 5');
    console.log(`Found ${styles.total} styles, showing ${styles.styles.length}:`);
    console.table(styles.styles);

    // List models with string arguments
    console.log('\nListing models with raw output:');
    const models = await venice.cli('list-models --raw');
    console.log(`Raw data contains ${models.data.length} models`);
    // console.log(JSON.stringify(models, null, 2)); // Uncomment to see full raw data

    // Chat with string arguments
    console.log('\nSending chat request:');
    const chatResponse = await venice.cli('chat "What are the top 3 programming languages in 2025?" --web-search');
    console.log('Response:');
    console.log(chatResponse);

    console.log('\nUsing CLI-style interface with object arguments:');
    console.log('-----------------------------------------------');

    // List styles with object arguments
    console.log('\nListing styles with object arguments:');
    const stylesObj = await venice.cli('list-styles', { limit: 3 });
    console.log(`Found ${stylesObj.total} styles, showing ${stylesObj.styles.length}:`);
    console.table(stylesObj.styles);

    // Generate image (commented out to avoid accidental API usage)
    /*
    console.log('\nGenerating an image:');
    const image = await venice.cli('generate-image "A beautiful sunset over mountains" --style Photographic --output sunset.png');
    console.log(`Image URL: ${image.url}`);
    if (image.savedTo) {
      console.log(`Image saved to: ${image.savedTo}`);
    }
    */

    // Rate limits
    console.log('\nGetting rate limits:');
    const rateLimits = await venice.cli('rate-limits');
    console.log('Rate limits retrieved successfully');
    // console.log(JSON.stringify(rateLimits, null, 2)); // Uncomment to see full data

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Check if API key is set
if (!apiKey) {
  console.error('Error: API key not found');
  console.error('Please set the VENICE_API_KEY environment variable or run "venice configure" to set up your API key');
  process.exit(1);
}

main();