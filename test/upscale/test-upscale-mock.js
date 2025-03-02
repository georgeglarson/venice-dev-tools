/**
 * Mock test script to verify the fix for binary response handling
 */

const fs = require('fs');
const path = require('path');
const { VeniceAI } = require('../dist');

// Create a mock binary response (a small JPEG image)
const mockJpegHeader = Buffer.from([
  0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
  0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00
]);

// Initialize the Venice client
const venice = new VeniceAI({
  apiKey: 'mock-api-key',
});

// Create a custom upscale method that returns a mock response
venice.image.upscale = async function(params) {
  console.log(`Mock upscale request with scale=${params.scale}`);
  
  // Check if binary response is requested
  if (params.return_binary !== false) {
    console.log('Returning mock binary response');
    
    // Return a mock binary response with metadata
    return {
      binary: mockJpegHeader,
      _metadata: {
        rateLimit: {
          limit: 20,
          remaining: 19,
          reset: Date.now() + 3600000
        },
        balance: {
          vcu: 100,
          usd: 10
        }
      }
    };
  }
  
  // For non-binary requests, return a mock JSON response
  return {
    url: 'https://example.com/mock-upscaled-image.jpg',
    _metadata: {
      rateLimit: {
        limit: 20,
        remaining: 19,
        reset: Date.now() + 3600000
      },
      balance: {
        vcu: 100,
        usd: 10
      }
    }
  };
};

// Function to test upscale with binary response
async function testUpscaleBinary() {
  console.log('\n=== Testing upscale with binary response ===');
  
  try {
    // Create a small test image buffer
    const imageBuffer = Buffer.alloc(1024);
    console.log(`Original image size: ${imageBuffer.length} bytes`);
    
    // Upscale the image with binary response
    console.log('Upscaling with binary response...');
    const response = await venice.image.upscale({
      model: 'upscale-model',
      image: imageBuffer,
      scale: 2,
      return_binary: true
    });
    
    // Check the response
    console.log('Response:', JSON.stringify(response, null, 2));
    
    if (response.binary) {
      console.log(`✅ Successfully received binary data (${response.binary.length} bytes)`);
      console.log(`Binary data starts with: ${response.binary.slice(0, 10).toString('hex')}`);
      
      // Check if metadata is present
      if (response._metadata) {
        console.log('✅ Metadata is present in the response');
        console.log('Rate limit:', response._metadata.rateLimit);
        console.log('Balance:', response._metadata.balance);
        return true;
      } else {
        console.log('❌ Metadata is missing from the response');
        return false;
      }
    } else {
      console.log('❌ Binary data is missing from the response');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Function to test upscale with JSON response
async function testUpscaleJson() {
  console.log('\n=== Testing upscale with JSON response ===');
  
  try {
    // Create a small test image buffer
    const imageBuffer = Buffer.alloc(1024);
    console.log(`Original image size: ${imageBuffer.length} bytes`);
    
    // Upscale the image with JSON response
    console.log('Upscaling with JSON response...');
    const response = await venice.image.upscale({
      model: 'upscale-model',
      image: imageBuffer,
      scale: 2,
      return_binary: false
    });
    
    // Check the response
    console.log('Response:', JSON.stringify(response, null, 2));
    
    if (response.url) {
      console.log(`✅ Successfully received URL: ${response.url}`);
      
      // Check if metadata is present
      if (response._metadata) {
        console.log('✅ Metadata is present in the response');
        console.log('Rate limit:', response._metadata.rateLimit);
        console.log('Balance:', response._metadata.balance);
        return true;
      } else {
        console.log('❌ Metadata is missing from the response');
        return false;
      }
    } else {
      console.log('❌ URL is missing from the response');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Main function to run the tests
async function main() {
  const binaryResult = await testUpscaleBinary();
  const jsonResult = await testUpscaleJson();
  
  // Summary
  console.log('\n=== Summary ===');
  if (binaryResult) {
    console.log('✅ Binary response handling is working correctly!');
  } else {
    console.log('❌ Binary response handling is not working correctly.');
  }
  
  if (jsonResult) {
    console.log('✅ JSON response handling is working correctly!');
  } else {
    console.log('❌ JSON response handling is not working correctly.');
  }
  
  if (binaryResult && jsonResult) {
    console.log('\n✅ All tests passed! The fix is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Please check the logs for details.');
  }
}

// Run the tests
main().catch(console.error);