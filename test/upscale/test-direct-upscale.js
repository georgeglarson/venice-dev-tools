/**
 * Test script to directly test the upscale functionality with axios
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Path to test image
const testImagePath = path.join(__dirname, 'test-image.jpg');

/**
 * Test upscaling an image with a specific scale value
 * 
 * @param {number} scale - Scale value to test
 * @returns {Promise<boolean>} - Whether the upscale succeeded
 */
async function testDirectUpscale(scale) {
  console.log(`\n=== Testing direct upscale with scale=${scale} ===`);
  
  try {
    // Read the test image
    let imageBuffer;
    try {
      imageBuffer = fs.readFileSync(testImagePath);
      console.log(`Original image size: ${imageBuffer.length} bytes`);
    } catch (error) {
      console.error(`Error loading test image: ${error.message}`);
      return false;
    }
    
    // Create a FormData object
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
    const outputPath = path.join(__dirname, `upscaled-direct-${scale}x.jpg`);
    fs.writeFileSync(outputPath, response.data);
    
    console.log(`Upscale with scale=${scale} succeeded! Saved to ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Error upscaling with scale=${scale}:`, error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data.toString());
    }
    return false;
  }
}

/**
 * Main test function
 */
async function main() {
  // Test scale values 1, 2, 3, and 4
  const scaleValues = [1, 2, 3, 4];
  const results = {};
  
  for (const scale of scaleValues) {
    results[scale] = await testDirectUpscale(scale);
  }
  
  // Summary
  console.log('\n=== Summary ===');
  for (const scale in results) {
    console.log(`Scale ${scale}: ${results[scale] ? '✅ Succeeded' : '❌ Failed'}`);
  }
  
  // Overall result
  const allPassed = Object.values(results).some(result => result);
  console.log(`\nOverall Result: ${allPassed ? '✅ At least one scale value worked' : '❌ All scale values failed'}`);
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}