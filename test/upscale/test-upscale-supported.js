/**
 * Test script to verify which scale values are supported by the Venice upscale API
 * 
 * This test focuses specifically on the officially supported scale values (2 and 4)
 */

const { createClient, runTest } = require('../utils/test-utils');
const { testUpscale } = require('./test-upscale');

// Initialize the Venice client
const venice = createClient();

/**
 * Test officially supported scale values
 */
async function testSupportedScaleValues() {
  // Test the officially supported scale values: 2 and 4
  const supportedScales = [2, 4];
  const results = {};
  
  console.log('Testing officially supported scale values: 2 and 4');
  
  for (const scale of supportedScales) {
    results[scale] = await testUpscale(scale);
  }
  
  // Summary
  console.log('\n=== Supported Scales Summary ===');
  for (const scale in results) {
    console.log(`Scale ${scale}: ${results[scale] ? '✅ Succeeded' : '❌ Failed'}`);
  }
  
  // Check if at least one supported scale passed
  const anyPassed = Object.values(results).some(result => result);
  if (!anyPassed) {
    throw new Error('All supported scale values failed');
  }
  
  return true;
}

/**
 * Main test function
 */
async function main() {
  const success = await runTest('Supported Scale Values', testSupportedScaleValues);
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Run the tests
if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}