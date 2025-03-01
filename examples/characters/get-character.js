/**
 * Example: Get Character by Slug
 * 
 * This example demonstrates how to retrieve a specific character by its slug using the Venice AI API.
 */

const { VeniceAI } = require('../../dist');

// Initialize the client with the API key
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key-here'
});

// Enable debug logging to see the API requests and responses
venice.enableDebugLogging();

async function getCharacter(slug) {
  try {
    console.log(`Fetching character with slug: ${slug}...`);
    
    // Get a specific character by slug
    const response = await venice.characters.getCharacter(slug);
    
    // Display character information
    if (response.characters && response.characters.length > 0) {
      const character = response.characters[0];
      console.log('Character details:');
      console.log(`- ID: ${character.id}`);
      console.log(`- Slug: ${character.slug}`);
      console.log(`- Name: ${character.name}`);
      
      if (character.description) {
        console.log(`- Description: ${character.description}`);
      }
      
      if (character.avatar_url) {
        console.log(`- Avatar URL: ${character.avatar_url}`);
      }
      
      if (character.tags && character.tags.length > 0) {
        console.log(`- Tags: ${character.tags.join(', ')}`);
      }
      
      if (character.featured !== undefined) {
        console.log(`- Featured: ${character.featured ? 'Yes' : 'No'}`);
      }
      
      if (character.created_at) {
        console.log(`- Created: ${new Date(character.created_at).toLocaleString()}`);
      }
      
      if (character.updated_at) {
        console.log(`- Updated: ${new Date(character.updated_at).toLocaleString()}`);
      }
    } else {
      console.log(`No character found with slug: ${slug}`);
    }
    
    // Log rate limit information if available
    if (response._metadata?.rateLimit) {
      console.log('\nRate limit info:');
      console.log(`  Limit: ${response._metadata.rateLimit.limit}`);
      console.log(`  Remaining: ${response._metadata.rateLimit.remaining}`);
      console.log(`  Reset: ${new Date(response._metadata.rateLimit.reset * 1000).toLocaleString()}`);
    }
  } catch (error) {
    console.error('Error getting character:', error.message);
    if (error.status) {
      console.error(`Status: ${error.status}`);
    }
    if (error.code) {
      console.error(`Code: ${error.code}`);
    }
  }
}

// Get the character slug from command line arguments or use a default
const slug = process.argv[2] || 'assistant';

// Run the example
getCharacter(slug);