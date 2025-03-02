/**
 * Test script to verify which scale values are accepted by the Venice upscale API
 */

const fs = require('fs');
const path = require('path');
const { VeniceAI } = require('../dist');

// Check if API key is provided
if (!process.env.VENICE_API_KEY) {
  console.error('Please set the VENICE_API_KEY environment variable');
  process.exit(1);
}

// Initialize the Venice client
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY,
});

// Enable debug logging
venice.enableDebugLogging();

// Path to test image
const testImagePath = path.join(__dirname, 'test-image.jpg');

// Function to upscale an image with a specific scale value
async function testUpscale(scale) {
  console.log(`\n=== Testing upscale with scale=${scale} ===`);
  
  try {
    // Read the test image
    const imageBuffer = fs.readFileSync(testImagePath);
    const base64Image = imageBuffer.toString('base64');
    
    console.log(`Original image size: ${imageBuffer.length} bytes`);
    
    // Upscale the image
    const response = await venice.image.upscale({
      model: 'upscale-model',
      image: base64Image,
      scale: scale
    });
    
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
  } catch (error) {
    console.error(`Error upscaling with scale=${scale}:`, error.message);
    if (error.code) {
      console.error('Error code:', error.code);
      console.error('Status:', error.status);
    }
    return false;
  }
}

// Main function to test different scale values
async function main() {
  // Test scale values 1, 2, 3, and 4
  const scaleValues = [1, 2, 3, 4];
  const results = {};
  
  for (const scale of scaleValues) {
    results[scale] = await testUpscale(scale);
  }
  
  // Summary
  console.log('\n=== Summary ===');
  for (const scale in results) {
    console.log(`Scale ${scale}: ${results[scale] ? 'Succeeded' : 'Failed'}`);
  }
}

// Run the tests
main().catch(console.error);