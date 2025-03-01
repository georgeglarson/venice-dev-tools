/**
 * Example demonstrating how to use the VVV token information endpoints
 * 
 * This example shows how to:
 * 1. Get the circulating supply of VVV tokens
 * 2. Get the network utilization information
 * 3. Get the staking yield information
 */

import { VeniceAI } from '../../src/index.js';

// Initialize the client with your API key
// You can also use the VENICE_API_KEY environment variable
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

// Enable debug logging to see detailed information
venice.enableDebugLogging();

async function getVVVInfo() {
  try {
    // Get VVV circulating supply
    console.log('\n=== VVV Circulating Supply ===');
    const supplyResponse = await venice.vvv.circulatingSupply();
    
    if (supplyResponse.result) {
      // New format
      const circulatingSupply = parseFloat(supplyResponse.result);
      console.log(`Circulating Supply: ${circulatingSupply.toLocaleString()}`);
      console.log(`Raw Result: ${supplyResponse.result}`);
    } else if (supplyResponse.circulating_supply) {
      // Old format
      console.log(`Circulating Supply: ${supplyResponse.circulating_supply.toLocaleString()}`);
      console.log(`Total Supply: ${supplyResponse.total_supply.toLocaleString()}`);
      console.log(`Percentage Circulating: ${supplyResponse.percentage_circulating}%`);
    }
    
    // Get VVV network utilization
    console.log('\n=== VVV Network Utilization ===');
    const utilizationResponse = await venice.vvv.utilization();
    
    if (utilizationResponse.percentage !== undefined) {
      // New format
      console.log(`Utilization: ${(utilizationResponse.percentage * 100).toFixed(4)}%`);
    } else if (utilizationResponse.utilization_percentage !== undefined) {
      // Old format
      console.log(`Utilization: ${utilizationResponse.utilization_percentage}%`);
      console.log(`Capacity: ${utilizationResponse.capacity.toLocaleString()}`);
      console.log(`Usage: ${utilizationResponse.usage.toLocaleString()}`);
    }
    
    // Get VVV staking yield
    console.log('\n=== VVV Staking Yield ===');
    const yieldResponse = await venice.vvv.stakingYield();
    
    if (yieldResponse.stakingYield !== undefined && yieldResponse.totalStaked !== undefined) {
      // New format
      console.log(`Current APY: ${(parseFloat(yieldResponse.stakingYield) * 100).toFixed(4)}%`);
      console.log(`Total Staked: ${parseFloat(yieldResponse.totalStaked).toLocaleString()}`);
      
      if (yieldResponse.totalEmission) {
        console.log(`Total Emission: ${yieldResponse.totalEmission}`);
      }
      
      if (yieldResponse.stakerDistribution) {
        console.log(`Staker Distribution: ${yieldResponse.stakerDistribution}`);
      }
    } else if (yieldResponse.current_apy !== undefined && yieldResponse.total_staked !== undefined) {
      // Old format
      console.log(`Current APY: ${yieldResponse.current_apy}%`);
      console.log(`Total Staked: ${yieldResponse.total_staked.toLocaleString()}`);
      console.log(`Percentage Staked: ${yieldResponse.percentage_staked}%`);
    }
    
    // Using the CLI-style interface
    console.log('\n=== Using CLI-Style Interface ===');
    
    // Get VVV circulating supply
    const cliSupply = await venice.cli('vvv-supply');
    console.log('VVV Supply (CLI):', cliSupply.circulating_supply);
    
    // Get VVV network utilization
    const cliUtilization = await venice.cli('vvv-utilization');
    console.log('VVV Utilization (CLI):', cliUtilization.utilization_percentage);
    
    // Get VVV staking yield
    const cliYield = await venice.cli('vvv-yield');
    console.log('VVV Staking Yield (CLI):', cliYield.current_apy);
    
    // Get raw JSON output
    const rawYield = await venice.cli('vvv-yield --raw');
    
    if (rawYield.stakingYield) {
      // Format the APY as a percentage
      const apy = (parseFloat(rawYield.stakingYield) * 100).toFixed(4) + '%';
      console.log('Formatted APY:', apy);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the example
getVVVInfo();