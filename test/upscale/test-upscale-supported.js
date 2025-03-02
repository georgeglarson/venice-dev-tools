/**
 * Test script to verify that the Venice upscale API works correctly with supported scale values (2 and 4)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

// Check if API key is provided
if (!process.env.VENICE_API_KEY) {
  console.error('Please set the VENICE_API_KEY environment variable in the .env file');
  process.exit(1);
}

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
    
    try {
      // Use the curl command to upscale the image
      const outputPath = path.join(__dirname, `upscaled-${scale}x.jpg`);
      
      console.log(`Running curl command to upscale image...`);
      execSync(`curl --silent --location 'https://api.venice.ai/api/v1/image/upscale' --header 'Authorization: Bearer ${process.env.VENICE_API_KEY}' --form 'image=@"${testImagePath}"' --form 'scale="${scale}"' --output "${outputPath}"`, { stdio: 'inherit' });
      
      // Read the upscaled image
      const upscaledBuffer = fs.readFileSync(outputPath);
      const upscaledSize = upscaledBuffer.length;
      
      console.log(`✅ Successfully upscaled with scale=${scale}`);
      console.log(`Upscaled image size: ${upscaledSize} bytes`);
      console.log(`Size ratio: ${(upscaledSize / imageBuffer.length).toFixed(2)}x`);
      console.log(`Saved upscaled image to: ${outputPath}`);
      
      return {
        success: true,
        originalSize: imageBuffer.length,
        upscaledSize: upscaledSize,
        ratio: upscaledSize / imageBuffer.length
      };
    } catch (error) {
      console.error(`Error details:`, error);
      throw error;
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