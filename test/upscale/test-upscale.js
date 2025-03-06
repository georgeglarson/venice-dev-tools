/**
 * Test script to verify which scale values are accepted by the Venice upscale API
 */

const fs = require('fs');
const path = require('path');
const { createClient, runTest, loadTestFile } = require('../utils/test-utils');

// Initialize the Venice client
const venice = createClient();

// Path to test image
const testImagePath = path.join(__dirname, 'test-image.jpg');

/**
 * Test upscaling an image with a specific scale value
 *
 * @param {number} scale - Scale value to test
 * @returns {Promise<boolean>} - Whether the upscale succeeded
 */
async function testUpscale(scale) {
  console.log(`\n=== Testing upscale with scale=${scale} ===`);
  
  try {
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
    
    console.log(`Original image size: ${imageBuffer.length} bytes`);
    
    // Create a FormData object
    const FormData = require('form-data');
    const axios = require('axios');
    const formData = new FormData();
    
    // Add the image to the form data
    formData.append('image', imageBuffer, 'image.jpg');
    
    // Add other parameters
    formData.append('model', 'upscale-model');
    formData.append('scale', scale.toString());
    
    // Get the API key from environment variables
    const apiKey = process.env.VENICE_API_KEY;
    if (!apiKey) {
      console.error('VENICE_API_KEY environment variable is not set');
      return false;
    }
    
    try {
      // Make the request directly with axios
      const response = await axios({
        method: 'post',
        url: 'https://api.venice.ai/api/v1/image/upscale',
        data: formData,
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'Venice-AI-SDK-APL/0.1.0'
        },
        responseType: 'arraybuffer'
      });
      
      // Save the response to a file
      const outputPath = path.join(__dirname, `upscaled-${scale}x.jpg`);
      fs.writeFileSync(outputPath, response.data);
      
      console.log(`Upscale with scale=${scale} succeeded! Saved to ${outputPath}`);
      return true;
    } catch (error) {
      console.error(`Error upscaling with scale=${scale}:`, error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        if (error.response.data) {
          try {
            // Try to parse the error data as JSON
            const errorData = JSON.parse(error.response.data.toString());
            console.error('Error data:', errorData);
          } catch (e) {
            // If it's not JSON, just log it as a string
            console.error('Error data:', error.response.data.toString());
          }
        }
      }
      return false;
    }
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
 * Handle the upscale response
 * 
 * @param {Object} response - The upscale response
 * @param {number} scale - The scale value used
 * @returns {boolean} - Whether the upscale succeeded
 */
function handleUpscaleResponse(response, scale) {
  // Save the upscaled image
  if (response.url) {
    console.log(`Upscaled image URL: ${response.url}`);
    console.log(`Upscale with scale=${scale} succeeded!`);
    
    // You could download the image here to check its size
    // For simplicity, we'll just report success
    return true;
  } else {
    console.log(`No URL returned for scale=${scale}`);
    return false;
  }
}

/**
 * Main test function
 */
async function main() {
  // Test scale values 2 and 4 (only supported values)
  const scaleValues = [2, 4];
  const results = {};
  
  for (const scale of scaleValues) {
    results[scale] = await testUpscale(scale);
  }
  
  // Summary
  console.log('\n=== Summary ===');
  for (const scale in results) {
    console.log(`Scale ${scale}: ${results[scale] ? '✅ Succeeded' : '❌ Failed'}`);
  }
  
  // Overall result
  const allPassed = Object.values(results).some(result => result);
  console.log(`\nOverall Result: ${allPassed ? '✅ At least one scale value worked' : '❌ All scale values failed'}`);
  
  // Exit with appropriate code - consider it a success if at least one scale value worked
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