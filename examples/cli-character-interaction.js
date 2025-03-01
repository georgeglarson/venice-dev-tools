/**
 * Example: CLI Character Interaction
 * 
 * This example demonstrates how to interact with characters using the CLI-style interface.
 * It shows how to list characters, filter them, and use them in chat completions.
 */

const { VeniceAI } = require('./dist');

// Initialize the client with your API key
// You can also use the VENICE_API_KEY environment variable
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

// Enable debug logging to see detailed information
venice.enableDebugLogging();

async function interactWithCharacters() {
  try {
    console.log('=== List All Characters ===');
    // List all characters using the CLI-style interface
    const allCharacters = await venice.cli('list-characters');
    console.log(`Found ${allCharacters.total} characters`);
    
    console.log('\n=== List Characters with Limit ===');
    // List characters with a limit
    const limitedCharacters = await venice.cli('list-characters --limit 3');
    console.log(`Showing ${limitedCharacters.filtered} of ${limitedCharacters.total} characters`);
    console.log(limitedCharacters.characters.map(c => c.name).join(', '));
    
    console.log('\n=== Get Raw Character Data ===');
    // Get raw character data for scripting
    const rawCharacters = await venice.cli('list-characters --raw --limit 2');
    console.log(`First character slug: ${rawCharacters.data[0].slug}`);
    
    // Select a character to chat with
    const characterSlug = rawCharacters.data[0].slug;
    
    console.log(`\n=== Chat with Character: ${characterSlug} ===`);
    // Chat with a specific character
    // Note: This uses the character's slug in the model parameter with a special format
    const chatResponse = await venice.cli(`chat "Tell me about yourself" --model character:${characterSlug}`);
    console.log('Character response:');
    console.log(chatResponse);
    
    console.log('\n=== Using Object Arguments ===');
    // You can also use object arguments instead of string arguments
    const moreCharacters = await venice.cli('list-characters', {
      limit: 5,
      raw: true
    });
    console.log(`Found ${moreCharacters.data.length} characters with object arguments`);
    
    // Using the programmatic commands interface
    console.log('\n=== Using Programmatic Commands ===');
    const { commands } = require('./dist/cli');
    
    // List characters with the commands interface
    const programmaticCharacters = await commands.listCharacters({
      limit: 3
    });
    
    console.log(`Found ${programmaticCharacters.characters.length} characters with programmatic commands`);
    console.log(programmaticCharacters.characters.map(c => c.name).join(', '));
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the example
interactWithCharacters();