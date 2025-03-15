const { VeniceNode } = require('@venice-ai/node');

async function main() {
  // Initialize the Venice AI SDK
  const venice = new VeniceNode({
    apiKey: process.env.VENICE_API_KEY
  });

  try {
    // List characters
    console.log('Listing characters:');
    const characters = await venice.characters.list();
    
    // Print character information
    characters.data.forEach(character => {
      console.log(`Name: ${character.name}`);
      console.log(`Slug: ${character.slug}`);
      console.log(`Description: ${character.description || 'No description'}`);
      console.log(`Tags: ${character.tags.join(', ')}`);
      console.log('---');
    });
    
    // Show how to use a character in a chat completion
    console.log('\nUsing a character in a chat completion:');
    console.log('Example code:');
    console.log(`
const response = await venice.chat.createCompletion({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Tell me about yourself' }
  ],
  venice_parameters: {
    character_slug: '${characters.data[0]?.slug || 'example-character'}'
  }
});
    `);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();