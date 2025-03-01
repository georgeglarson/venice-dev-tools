/**
 * Test script to verify which scale values are accepted by the Venice upscale API
 * Using multipart/form-data format
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Load environment variables from .env file
const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
  console.error('Error loading .env file:', result.error.message);
  process.exit(1);
}

// Check if API key is provided
if (!process.env.VENICE_API_KEY) {
  console.error('Please set the VENICE_API_KEY environment variable in the .env file');
  process.exit(1);
}

console.log('Using Venice API key from .env file');

// Path to test image
const testImagePath = path.join(__dirname, 'test-image.jpg');

// Function to upscale an image with a specific scale value
async function testUpscale(scale) {
  console.log(`\n=== Testing upscale with scale=${scale} ===`);
  
  try {
    // Read the test image
    const imageBuffer = fs.readFileSync(testImagePath);
    console.log(`Original image size: ${imageBuffer.length} bytes`);
    
    // Create form data
    const formData = new FormData();
    formData.append('model', 'upscale-model');
    formData.append('scale', scale);
    formData.append('image', imageBuffer, {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });
    
    // Make the request
    const response = await axios.post('https://api.venice.ai/api/v1/image/upscale', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`
      }
    });
    
    // Log the response status and headers
    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify(response.headers, null, 2));
    
    // Log the full response data
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Check the response
    if (response.data && response.data.url) {
      console.log(`Upscaled image URL: ${response.data.url}`);
      console.log(`Upscale with scale=${scale} succeeded!`);
      
      // Download the upscaled image to check its size
      const imageResponse = await axios.get(response.data.url, { responseType: 'arraybuffer' });
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
    } else {
      console.log(`No URL returned for scale=${scale}`);
      if (response.data && response.data.b64_json) {
        console.log('Found b64_json in response instead of URL');
        
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(response.data.b64_json, 'base64');
        const upscaledSize = imageBuffer.length;
        console.log(`Upscaled image size: ${upscaledSize} bytes`);
        
        // Save the upscaled image
        const outputPath = path.join(__dirname, `upscaled-${scale}x-from-base64.jpg`);
        fs.writeFileSync(outputPath, imageBuffer);
        console.log(`Saved upscaled image to: ${outputPath}`);
        
        return {
          success: true,
          originalSize: imageBuffer.length,
          upscaledSize: upscaledSize,
          ratio: upscaledSize / imageBuffer.length,
          note: 'Used b64_json instead of URL'
        };
      }
      return { success: false };
    }
  } catch (error) {
    console.error(`Error upscaling with scale=${scale}:`, error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      
      // Sanitize error response data to exclude image binary content
      if (error.response.data) {
        const sanitizedErrorData = { ...error.response.data };
        // Remove any potential binary data fields
        if (sanitizedErrorData.image) sanitizedErrorData.image = '[IMAGE DATA EXCLUDED]';
        if (sanitizedErrorData.data) sanitizedErrorData.data = '[IMAGE DATA EXCLUDED]';
        console.error('Response data:', JSON.stringify(sanitizedErrorData, null, 2));
      }
    }
    return { success: false };
  }
}

// Main function to test different scale values
async function main() {
  // Test only the officially supported scale values: 2 and 4
  const scaleValues = [2, 4];
  const results = {};
  
  for (const scale of scaleValues) {
    results[scale] = await testUpscale(scale);
  }
  
  // Summary
  console.log('\n=== Summary ===');
  for (const scale in results) {
    const result = results[scale];
    if (result.success) {
      console.log(`Scale ${scale}: Succeeded - Size ratio: ${result.ratio.toFixed(2)}x`);
    } else {
      console.log(`Scale ${scale}: Failed`);
    }
  }
}

// Run the tests
main().catch(console.error);