/**
 * Example: List Characters
 *
 * This example demonstrates how to list available characters using the Venice AI API.
 *
 * Usage:
 *   node list-characters.js [options]
 *
 * Options:
 *   --format=<format>    Output format: 'table', 'compact', or 'full' (default: 'table')
 *   --limit=<number>     Limit the number of characters displayed (default: 10)
 *   --page=<number>      Page number for pagination (default: 1)
 *   --filter=<string>    Filter characters by name or tag (case-insensitive)
 *   --featured           Show only featured characters
 *   --no-debug           Disable debug logging
 *
 * Examples:
 *   node list-characters.js --format=compact
 *   node list-characters.js --limit=5 --page=2
 *   node list-characters.js --filter=assistant
 *   node list-characters.js --featured --format=table
 */

const { VeniceAI } = require('../../dist');

// Parse command line arguments
const args = parseArgs(process.argv.slice(2));

// Initialize the client with the API key
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key-here'
});

// Enable debug logging if not disabled
if (!args['no-debug']) {
  venice.enableDebugLogging();
}

async function listCharacters() {
  try {
    console.log('Fetching characters...');
    
    // List all available characters
    const response = await venice.characters.list();
    
    // Apply filters
    let filteredCharacters = response.characters;
    
    // Filter by name or tag if specified
    if (args.filter) {
      const filterLower = args.filter.toLowerCase();
      filteredCharacters = filteredCharacters.filter(character =>
        character.name.toLowerCase().includes(filterLower) ||
        (character.tags && character.tags.some(tag => tag.toLowerCase().includes(filterLower)))
      );
    }
    
    // Filter featured characters if specified
    if (args.featured) {
      filteredCharacters = filteredCharacters.filter(character => character.featured);
    }
    
    // Apply pagination
    const limit = parseInt(args.limit || '10', 10);
    const page = parseInt(args.page || '1', 10);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCharacters = filteredCharacters.slice(startIndex, endIndex);
    
    // Display summary
    console.log(`Found ${filteredCharacters.length} characters (showing ${startIndex + 1}-${Math.min(endIndex, filteredCharacters.length)} on page ${page}):`);
    
    // Display character information based on format
    const format = args.format || 'table';
    
    if (format === 'table') {
      displayTableFormat(paginatedCharacters);
    } else if (format === 'compact') {
      displayCompactFormat(paginatedCharacters);
    } else {
      displayFullFormat(paginatedCharacters);
    }
    
    // Display pagination info if there are more pages
    const totalPages = Math.ceil(filteredCharacters.length / limit);
    if (totalPages > 1) {
      console.log(`\nPage ${page} of ${totalPages}`);
      if (page < totalPages) {
        console.log(`Use --page=${page + 1} to see the next page`);
      }
    }
    
    // Log rate limit information if available
    if (response._metadata?.rateLimit) {
      console.log('\nRate limit info:');
      console.log(`  Limit: ${response._metadata.rateLimit.limit}`);
      console.log(`  Remaining: ${response._metadata.rateLimit.remaining}`);
      console.log(`  Reset: ${new Date(response._metadata.rateLimit.reset * 1000).toLocaleString()}`);
    }
  } catch (error) {
    console.error('Error listing characters:', error.message);
    if (error.status) {
      console.error(`Status: ${error.status}`);
    }
    if (error.code) {
      console.error(`Code: ${error.code}`);
    }
  }
}

/**
 * Display characters in a table format
 */
function displayTableFormat(characters) {
  // Define column widths
  const nameWidth = 25;
  const slugWidth = 20;
  const tagsWidth = 30;
  
  // Print header
  console.log('\n' +
    'NAME'.padEnd(nameWidth) +
    'SLUG'.padEnd(slugWidth) +
    'TAGS'.padEnd(tagsWidth) +
    'FEATURED'
  );
  
  console.log('-'.repeat(nameWidth + slugWidth + tagsWidth + 8));
  
  // Print each character
  characters.forEach(character => {
    const name = character.name.length > nameWidth - 3
      ? character.name.substring(0, nameWidth - 3) + '...'
      : character.name;
    
    const slug = character.slug.length > slugWidth - 3
      ? character.slug.substring(0, slugWidth - 3) + '...'
      : character.slug;
    
    const tags = character.tags
      ? character.tags.join(', ').length > tagsWidth - 3
        ? character.tags.join(', ').substring(0, tagsWidth - 3) + '...'
        : character.tags.join(', ')
      : '';
    
    console.log(
      name.padEnd(nameWidth) +
      slug.padEnd(slugWidth) +
      tags.padEnd(tagsWidth) +
      (character.featured ? 'Yes' : 'No')
    );
  });
}

/**
 * Display characters in a compact format
 */
function displayCompactFormat(characters) {
  console.log('');
  characters.forEach(character => {
    console.log(`- ${character.name} (${character.slug})${character.featured ? ' [Featured]' : ''}`);
  });
}

/**
 * Display characters in full format with all details
 */
function displayFullFormat(characters) {
  console.log('');
  characters.forEach(character => {
    console.log(`- ${character.name} (${character.slug})`);
    if (character.description) {
      console.log(`  ${character.description}`);
    }
    if (character.tags && character.tags.length > 0) {
      console.log(`  Tags: ${character.tags.join(', ')}`);
    }
    if (character.featured !== undefined) {
      console.log(`  Featured: ${character.featured ? 'Yes' : 'No'}`);
    }
    console.log('');
  });
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const result = {};
  
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const parts = arg.substring(2).split('=');
      if (parts.length === 2) {
        result[parts[0]] = parts[1];
      } else {
        result[parts[0]] = true;
      }
    }
  });
  
  return result;
}

// Run the example
listCharacters();