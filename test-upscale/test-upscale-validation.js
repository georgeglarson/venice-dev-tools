/**
 * Test script to verify validation and error handling in the Venice upscale API
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
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

// Enable debug logging but exclude binary data
venice.enableDebugLogging({
  excludeBinaryData: true
});

// Path to test image
const testImagePath = path.join(__dirname, 'test-image.jpg');

// Function to create a test image in different formats
async function createTestImage(format = 'jpeg', width = 100, height = 100) {
  console.log(`Creating test image in ${format} format of size ${width}x${height}`);
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fill with a gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'blue');
  gradient.addColorStop(0.5, 'white');
  gradient.addColorStop(1, 'red');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add some text
  ctx.font = '20px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText('Test', 30, 50);
  
  // Return as buffer
  return canvas.toBuffer(`image/${format}`);
}

// Function to test scale validation
async function testScaleValidation() {
  console.log('\n=== Testing scale validation ===');
  
  const imageBuffer = fs.readFileSync(testImagePath);
  
  // Test invalid scale values
  const invalidScales = [0, 1, 1.5, 3, 5, -1, 'two'];
  
  for (const scale of invalidScales) {
    console.log(`\nTesting invalid scale value: ${scale}`);
    
    try {
      await venice.image.upscale({
        model: 'upscale-model',
        image: imageBuffer,
        scale: scale
      });
      
      console.log(`❌ Expected validation error for scale=${scale}, but request succeeded`);
    } catch (error) {
      if (error.name === 'ValidationError') {
        console.log(`✅ Correctly received ValidationError for scale=${scale}: ${error.message}`);
      } else {
        console.log(`❌ Expected ValidationError but got ${error.name}: ${error.message}`);
      }
    }
  }
  
  // Test valid scale values
  const validScales = [2, 4];
  
  for (const scale of validScales) {
    console.log(`\nTesting valid scale value: ${scale}`);
    
    try {
      const response = await venice.image.upscale({
        model: 'upscale-model',
        image: imageBuffer,
        scale: scale
      });
      
      if (response.url) {
        console.log(`✅ Correctly accepted scale=${scale}, got URL: ${response.url}`);
      } else {
        console.log(`❌ Request succeeded but no URL returned for scale=${scale}`);
      }
    } catch (error) {
      console.log(`❌ Unexpected error for scale=${scale}: ${error.message}`);
    }
  }
}

// Function to test different image formats
async function testImageFormats() {
  console.log('\n=== Testing different image formats ===');
  
  const formats = ['jpeg', 'png'];
  const scale = 2;
  
  for (const format of formats) {
    console.log(`\nTesting ${format} format`);
    
    try {
      const imageBuffer = await createTestImage(format);
      console.log(`Created ${format} image, size: ${imageBuffer.length} bytes`);
      
      const response = await venice.image.upscale({
        model: 'upscale-model',
        image: imageBuffer,
        scale: scale
      });
      
      if (response.url) {
        console.log(`✅ Successfully upscaled ${format} image, got URL: ${response.url}`);
        
        // Save the upscaled image
        const outputPath = path.join(__dirname, `upscaled-${format}-${scale}x.${format}`);
        
        // Download the image
        const axios = require('axios');
        const imageResponse = await axios.get(response.url, { responseType: 'arraybuffer' });
        fs.writeFileSync(outputPath, Buffer.from(imageResponse.data));
        console.log(`Saved upscaled image to: ${outputPath}`);
      } else {
        console.log(`❌ Request succeeded but no URL returned for ${format} format`);
      }
    } catch (error) {
      console.log(`❌ Error upscaling ${format} image: ${error.message}`);
    }
  }
}

// Function to test data URL prefixes
async function testDataUrlPrefixes() {
  console.log('\n=== Testing data URL prefixes ===');
  
  const imageBuffer = fs.readFileSync(testImagePath);
  const base64Image = imageBuffer.toString('base64');
  const scale = 2;
  
  // Test different data URL prefixes
  const prefixes = [
    '', // No prefix
    'data:image/jpeg;base64,',
    'data:image/png;base64,'
  ];
  
  for (const prefix of prefixes) {
    console.log(`\nTesting with prefix: ${prefix || '(none)'}`);
    
    try {
      const response = await venice.image.upscale({
        model: 'upscale-model',
        image: prefix + base64Image,
        scale: scale
      });
      
      if (response.url) {
        console.log(`✅ Successfully upscaled with prefix "${prefix}", got URL: ${response.url}`);
      } else {
        console.log(`❌ Request succeeded but no URL returned for prefix "${prefix}"`);
      }
    } catch (error) {
      console.log(`❌ Error upscaling with prefix "${prefix}": ${error.message}`);
    }
  }
}

// Function to test return_binary parameter
async function testReturnBinary() {
  console.log('\n=== Testing return_binary parameter ===');
  
  const imageBuffer = fs.readFileSync(testImagePath);
  const scale = 2;
  
  // Test with return_binary = true
  console.log('\nTesting with return_binary = true');
  
  try {
    const response = await venice.image.upscale({
      model: 'upscale-model',
      image: imageBuffer,
      scale: scale,
      return_binary: true
    });
    
    if (response.binary && Buffer.isBuffer(response.binary)) {
      console.log(`✅ Successfully received binary data, size: ${response.binary.length} bytes`);
      
      // Save the binary data
      const outputPath = path.join(__dirname, `upscaled-binary-${scale}x.jpg`);
      fs.writeFileSync(outputPath, response.binary);
      console.log(`Saved binary image to: ${outputPath}`);
    } else {
      console.log(`❌ Expected binary data but received: ${Object.keys(response).join(', ')}`);
    }
  } catch (error) {
    console.log(`❌ Error with return_binary=true: ${error.message}`);
  }
  
  // Test with return_binary = false
  console.log('\nTesting with return_binary = false');
  
  try {
    const response = await venice.image.upscale({
      model: 'upscale-model',
      image: imageBuffer,
      scale: scale,
      return_binary: false
    });
    
    if (response.url && !response.binary) {
      console.log(`✅ Successfully received URL without binary data: ${response.url}`);
    } else if (response.binary) {
      console.log(`❌ Expected no binary data but received ${response.binary.length} bytes`);
    } else {
      console.log(`❌ No URL or binary data received: ${Object.keys(response).join(', ')}`);
    }
  } catch (error) {
    console.log(`❌ Error with return_binary=false: ${error.message}`);
  }
}

// Function to test error handling
async function testErrorHandling() {
  console.log('\n=== Testing error handling ===');
  
  // Test with invalid API key
  console.log('\nTesting with invalid API key');
  
  const invalidClient = new VeniceAI({
    apiKey: 'invalid_api_key',
  });
  
  try {
    const imageBuffer = fs.readFileSync(testImagePath);
    
    await invalidClient.image.upscale({
      model: 'upscale-model',
      image: imageBuffer,
      scale: 2
    });
    
    console.log(`❌ Expected authentication error, but request succeeded`);
  } catch (error) {
    console.log(`✅ Correctly received error with invalid API key: ${error.message}`);
    if (error.status) {
      console.log(`Status code: ${error.status}`);
    }
  }
  
  // Test with invalid model
  console.log('\nTesting with invalid model');
  
  try {
    const imageBuffer = fs.readFileSync(testImagePath);
    
    await venice.image.upscale({
      model: 'non_existent_model',
      image: imageBuffer,
      scale: 2
    });
    
    console.log(`❌ Expected model error, but request succeeded`);
  } catch (error) {
    console.log(`✅ Correctly received error with invalid model: ${error.message}`);
    if (error.status) {
      console.log(`Status code: ${error.status}`);
    }
  }
  
  // Test with missing required parameters
  console.log('\nTesting with missing model parameter');
  
  try {
    const imageBuffer = fs.readFileSync(testImagePath);
    
    // @ts-ignore - Intentionally omitting required parameter
    await venice.image.upscale({
      image: imageBuffer,
      scale: 2
    });
    
    console.log(`❌ Expected validation error for missing model, but request succeeded`);
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.log(`✅ Correctly received ValidationError for missing model: ${error.message}`);
    } else {
      console.log(`❌ Expected ValidationError but got ${error.name}: ${error.message}`);
    }
  }
  
  console.log('\nTesting with missing image parameter');
  
  try {
    // @ts-ignore - Intentionally omitting required parameter
    await venice.image.upscale({
      model: 'upscale-model',
      scale: 2
    });
    
    console.log(`❌ Expected validation error for missing image, but request succeeded`);
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.log(`✅ Correctly received ValidationError for missing image: ${error.message}`);
    } else {
      console.log(`❌ Expected ValidationError but got ${error.name}: ${error.message}`);
    }
  }
}

// Main function to run all tests
async function main() {
  try {
    await testScaleValidation();
    await testImageFormats();
    await testDataUrlPrefixes();
    await testReturnBinary();
    await testErrorHandling();
    
    console.log('\n=== All tests completed ===');
  } catch (error) {
    console.error('Unexpected error during testing:', error);
  }
}

// Run the tests
main().catch(console.error);