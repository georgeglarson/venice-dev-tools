/**
 * Example script demonstrating the new features added to the Venice AI SDK
 * 
 * This script shows how to use the Characters API and VVV API resources.
 * 
 * To run this example:
 * node examples/new-features.js
 */

const { VeniceAI } = require('../');

// Initialize the Venice AI client
// You can set your API key as an environment variable: VENICE_API_KEY
// Or pass it directly to the constructor
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key-here',
  baseUrl: 'https://api.venice.ai/api/v1', // Explicitly set the API version
});

// Enable debug logging to see detailed API requests and responses
venice.enableDebugLogging();

// Function to demonstrate the Characters API
async function demonstrateCharactersAPI() {
  console.log('\n=== Characters API ===\n');
  
  try {
    // List all available characters
    console.log('Listing all characters...');
    const characters = await venice.characters.list();
    
    console.log(`Found ${characters.characters.length} characters:`);
    characters.characters.forEach(character => {
      console.log(`- ${character.name} (${character.slug}): ${character.description || 'No description'}`);
    });
    
    // If there are characters available, get details for the first one
    if (characters.characters.length > 0) {
      const firstCharacter = characters.characters[0];
      console.log(`\nGetting details for character: ${firstCharacter.name}`);
      
      const characterDetails = await venice.characters.getCharacter(firstCharacter.slug);
      console.log('Character details:', JSON.stringify(characterDetails, null, 2));
    }
  } catch (error) {
    console.error('Error demonstrating Characters API:', error.message);
  }
}

// Function to demonstrate the VVV API
async function demonstrateVVVAPI() {
  console.log('\n=== VVV API ===\n');
  
  try {
    // Get VVV circulating supply
    console.log('Getting VVV circulating supply...');
    const supply = await venice.vvv.circulatingSupply();
    
    console.log('Circulating Supply:', supply.circulating_supply.toLocaleString());
    console.log('Total Supply:', supply.total_supply.toLocaleString());
    
    const percentCirculating = supply.percentage_circulating || 
      (supply.circulating_supply / supply.total_supply * 100).toFixed(2);
    
    console.log(`Percentage Circulating: ${percentCirculating}%`);
    console.log(`Timestamp: ${new Date(supply.timestamp).toLocaleString()}`);
    
    // Get VVV network utilization
    console.log('\nGetting VVV network utilization...');
    const utilization = await venice.vvv.utilization();
    
    console.log(`Utilization: ${utilization.utilization_percentage}%`);
    console.log(`Capacity: ${utilization.capacity.toLocaleString()}`);
    console.log(`Usage: ${utilization.usage.toLocaleString()}`);
    console.log(`Timestamp: ${new Date(utilization.timestamp).toLocaleString()}`);
    
    if (utilization.historical_data && utilization.historical_data.length > 0) {
      console.log('\nHistorical Utilization Data:');
      utilization.historical_data.forEach(data => {
        console.log(`- ${new Date(data.timestamp).toLocaleString()}: ${data.utilization_percentage}%`);
      });
    }
    
    // Get VVV staking yield
    console.log('\nGetting VVV staking yield...');
    const stakingYield = await venice.vvv.stakingYield();
    
    console.log(`Current APY: ${stakingYield.current_apy}%`);
    console.log(`Total Staked: ${stakingYield.total_staked.toLocaleString()}`);
    console.log(`Percentage Staked: ${stakingYield.percentage_staked}%`);
    console.log(`Timestamp: ${new Date(stakingYield.timestamp).toLocaleString()}`);
    
    if (stakingYield.historical_data && stakingYield.historical_data.length > 0) {
      console.log('\nHistorical Yield Data:');
      stakingYield.historical_data.forEach(data => {
        console.log(`- ${new Date(data.timestamp).toLocaleString()}: ${data.apy}%`);
      });
    }
  } catch (error) {
    console.error('Error demonstrating VVV API:', error.message);
  }
}

// Main function to run all demonstrations
async function main() {
  console.log('Venice AI SDK - New Features Demo\n');
  
  try {
    // Demonstrate the Characters API
    await demonstrateCharactersAPI();
    
    // Demonstrate the VVV API
    await demonstrateVVVAPI();
    
    console.log('\nDemo completed successfully!');
  } catch (error) {
    console.error('Error running demo:', error.message);
  }
}

// Run the main function
main().catch(console.error);