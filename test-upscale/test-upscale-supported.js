/**
 * Test script to verify that the Venice upscale API works correctly with supported scale values (2 and 4)
 */

const fs = require('fs');
const path = require('path');
const { VeniceAI } = require('../dist');
require('dotenv').config();

// Check if API key is provided
if (!process.env.VENICE_API_KEY) {
  console.error('Please set the VENICE_API_KEY environment variable in the .env file');
  process.exit(1);
}

// Initialize the Venice client
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY,
});

// Path to test image
const testImagePath = path.join(__dirname, 'test-image.jpg');

// Function to upscale an image with a specific scale value
async function testUpscale(scale) {
  console.log(`\n=== Testing upscale with scale=${scale} ===`);
  
  try {
    // Read the test image
    const imageBuffer = fs.readFileSync(testImagePath);
    console.log(`Original image size: ${imageBuffer.length} bytes`);
    
    // Upscale the image
    console.log(`Upscaling with scale=${scale}...`);
    const response = await venice.image.upscale({
      model: 'upscale-model',
      image: imageBuffer,
      scale: scale,
      return_binary: true // Request binary data directly
    });
    
    // Check the response
    if (response.url) {
      console.log(`✅ Successfully upscaled with scale=${scale}`);
      console.log(`Upscaled image URL: ${response.url}`);
      
      // Download the upscaled image to check its size
      const axios = require('axios');
      const imageResponse = await axios.get(response.url, { responseType: 'arraybuffer' });
      const upscaledSize = imageResponse.data.length;
      console.log(`Upscaled image size: ${upscaledSize} bytes`);
      console.log(`Size ratio: ${(upscaledSize / imageBuffer.length).toFixed(2)}x`);
      
      // Save the upscaled image
      const outputPath = path.join(__dirname, `upscaled-${scale}x.jpg`);
      fs.writeFileSync(outputPath, Buffer.from(imageResponse.data));
      console.log(`Saved upscaled image to: ${outputPath}`);
      
      return {
        success: true,
        originalSize: imageBuffer.length,
        upscaledSize: upscaledSize,
        ratio: upscaledSize / imageBuffer.length
      };
    } else if (response.binary) {
      console.log(`✅ Successfully upscaled with scale=${scale} (received binary data)`);
      
      // Get the upscaled image size
      const upscaledSize = response.binary.length;
      console.log(`Upscaled image size: ${upscaledSize} bytes`);
      console.log(`Size ratio: ${(upscaledSize / imageBuffer.length).toFixed(2)}x`);
      
      // Save the upscaled image
      const outputPath = path.join(__dirname, `upscaled-${scale}x.jpg`);
      fs.writeFileSync(outputPath, response.binary);
      console.log(`Saved upscaled image to: ${outputPath}`);
      
      return {
        success: true,
        originalSize: imageBuffer.length,
        upscaledSize: upscaledSize,
        ratio: upscaledSize / imageBuffer.length
      };
    } else if (response.b64_json) {
      console.log(`✅ Successfully upscaled with scale=${scale} (received base64 data)`);
      
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(response.b64_json, 'base64');
      const upscaledSize = imageBuffer.length;
      console.log(`Upscaled image size: ${upscaledSize} bytes`);
      console.log(`Size ratio: ${(upscaledSize / imageBuffer.length).toFixed(2)}x`);
      
      // Save the upscaled image
      const outputPath = path.join(__dirname, `upscaled-${scale}x-from-base64.jpg`);
      fs.writeFileSync(outputPath, imageBuffer);
      console.log(`Saved upscaled image to: ${outputPath}`);
      
      return {
        success: true,
        originalSize: imageBuffer.length,
        upscaledSize: upscaledSize,
        ratio: upscaledSize / imageBuffer.length
      };
    } else {
      console.log(`❌ No valid response data for scale=${scale}`);
      console.log('Response:', JSON.stringify(response, null, 2));
      return { success: false };
    }
  } catch (error) {
    console.error(`❌ Error upscaling with scale=${scale}:`, error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
    return { success: false };
  }
}

// Main function to test supported scale values
async function main() {
  // Test only the officially supported scale values: 2 and 4
  const supportedScales = [2, 4];
  const results = {};
  
  for (const scale of supportedScales) {
    results[scale] = await testUpscale(scale);
  }
  
  // Summary
  console.log('\n=== Summary ===');
  for (const scale in results) {
    const result = results[scale];
    if (result.success) {
      console.log(`Scale ${scale}x: ✅ Succeeded - Size ratio: ${result.ratio.toFixed(2)}x`);
    } else {
      console.log(`Scale ${scale}x: ❌ Failed`);
    }
  }
  
  // Check if all supported scales worked
  const allSucceeded = Object.values(results).every(result => result.success);
  if (allSucceeded) {
    console.log('\n✅ All supported scale values (2x and 4x) work correctly!');
  } else {
    console.log('\n❌ Some supported scale values failed. Please check the logs for details.');
  }
}

// Run the tests
main().catch(console.error);