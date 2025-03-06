/**
 * Image Upscale API Tests
 * 
 * This file contains tests for the Image Upscale API.
 * It verifies which scale values are accepted by the Venice upscale API.
 */

const fs = require('fs');
const path = require('path');
const { createClient, runTest, loadTestFile, validateResponse, logTestResults } = require('../../utils/test-utils');

// Initialize the Venice client
const venice = createClient();

// Path to test image
const testImagePath = path.join(__dirname, '../../upscale/test-image.jpg');

/**
 * Test upscaling an image with a specific scale value
 * 
 * @param {number} scale - Scale value to test
 * @returns {Promise<boolean>} - Whether the upscale succeeded
 */
async function testUpscale(scale) {
  // Read the test image
  let imageBuffer;
  try {
    imageBuffer = fs.existsSync(testImagePath) 
      ? fs.readFileSync(testImagePath)
      : loadTestFile('test/upscale/test-image.jpg');
  } catch (error) {
    console.error(`Error loading test image: ${error.message}`);
    console.error('Using a placeholder image for testing');
    // Create a small placeholder image if the test image is not found
    imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  }
  
  const base64Image = imageBuffer.toString('base64');
  
  console.log(`Original image size: ${imageBuffer.length} bytes`);
  
  try {
    // Upscale the image
    const response = await venice.image.upscale({
      model: 'upscale-model',
      image: base64Image,
      scale: scale
    });
    
    // Validate response
    validateResponse(response, {
      id: 'string',
      url: 'string'
    });
    
    console.log(`Upscaled image URL: ${response.url}`);
    console.log(`Upscale with scale=${scale} succeeded!`);
    
    return true;
  } catch (error) {
    console.error(`Error upscaling with scale=${scale}:`, error.message);
    if (error.code) {
      console.error('Error code:', error.code);
      console.error('Status:', error.status);
    }
    return false;
  }
}

/**
 * Test upscaling with scale 2x
 */
async function testUpscale2x() {
  return await testUpscale(2);
}

/**
 * Test upscaling with scale 4x
 */
async function testUpscale4x() {
  return await testUpscale(4);
}

/**
 * Test upscaling with various scales
 */
async function testMultipleScales() {
  // Test scale values 1, 2, 3, and 4
  const scaleValues = [1, 2, 3, 4];
  const results = {};
  
  for (const scale of scaleValues) {
    results[`scale_${scale}`] = await testUpscale(scale);
  }
  
  // Consider it a success if at least one scale value worked
  return Object.values(results).some(result => result);
}

/**
 * Main test function
 */
async function main() {
  const results = {
    upscale2x: await runTest('Image Upscale - 2x', testUpscale2x),
    upscale4x: await runTest('Image Upscale - 4x', testUpscale4x),
    multipleScales: await runTest('Image Upscale - Multiple Scales', testMultipleScales)
  };
  
  // Log test results
  const allPassed = logTestResults(results);
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
} else {
  // Export for use in other test scripts
  module.exports = {
    testUpscale
  };
}