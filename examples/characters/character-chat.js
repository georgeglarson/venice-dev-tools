/**
 * Character Chat Example
 * 
 * This example demonstrates how to interact with Venice AI characters
 * using both the CLI interface and programmatic API.
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/characters/character-chat.js
 */

const { VeniceAI } = require('../../dist');

// Initialize the client with your API key
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

// Enable debug logging to see detailed information
venice.enableDebugLogging();

async function characterInteraction() {
  try {
    console.log('Demonstrating character interaction...\n');
    
    // Step 1: List available characters
    try {
      console.log('Step 1: Listing available characters');
      const charactersResult = await venice.cli('list-characters --limit 5');
      
      if (!charactersResult.characters || charactersResult.characters.length === 0) {
        console.log('No characters available. Please check your API key permissions.');
        return;
      }
      
      // Display available characters
      console.log('\nAvailable Characters:');
      charactersResult.characters.forEach((character, index) => {
        console.log(`${index + 1}. ${character.name} (slug: ${character.slug})`);
      });
      
      // Select a character for demonstration (using the first one)
      const demoCharacter = charactersResult.characters[0];
      console.log(`\nSelected character for demo: ${demoCharacter.name} (${demoCharacter.slug})`);
      console.log(`Description: ${demoCharacter.description}`);
      
      // Step 2: Chat with character using CLI interface
      console.log('\nStep 2: Chatting with character using CLI interface');
      console.log(`Prompt: "Hello, can you introduce yourself?"`);
      
      try {
        // Method 1: Using --character parameter
        const chatResult1 = await venice.cli(
          `chat "Hello, can you introduce yourself?" --character ${demoCharacter.slug}`
        );
        console.log('\nResponse using --character parameter:');
        console.log(chatResult1);
      } catch (error) {
        console.log('Error with character parameter method:', error.message);
      }
      
      try {
        // Method 2: Using character:slug format in model parameter
        const chatResult2 = await venice.cli(
          `chat "What can you help me with today?" -m character:${demoCharacter.slug}`
        );
        console.log('\nResponse using character:slug format:');
        console.log(chatResult2);
      } catch (error) {
        console.log('Error with character:slug format method:', error.message);
      }
      
      // Step 3: Chat with character using programmatic API
      console.log('\nStep 3: Chatting with character using programmatic API');
      
      try {
        // Method 1: Using venice_parameters.character_slug
        const programmaticResult1 = await venice.chat.completions.create({
          model: 'default', // Use default model when specifying character
          messages: [
            { role: 'user', content: 'Tell me a short story about space exploration.' }
          ],
          venice_parameters: {
            character_slug: demoCharacter.slug
          }
        });
        
        console.log('\nProgrammatic response using venice_parameters:');
        console.log(programmaticResult1.choices[0].message.content);
      } catch (error) {
        console.log('Error with programmatic API (venice_parameters):', error.message);
        console.log('Note: Direct API calls may require specific permissions or may not be available in all environments.');
      }
      
      try {
        // Method 2: Using the commands.chat helper
        const programmaticResult2 = await venice.cli('chat "What\'s your favorite food?" --character ' + demoCharacter.slug, true);
        
        console.log('\nProgrammatic response using commands.chat:');
        console.log(programmaticResult2);
      } catch (error) {
        console.log('Error with commands.chat helper:', error.message);
      }
    } catch (error) {
      console.log('Error listing characters:', error.message);
      console.log('Character functionality may not be available in your environment or with your API key permissions.');
    }
    
    console.log('\nCharacter interaction demo completed!');
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the example
characterInteraction();