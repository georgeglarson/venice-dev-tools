/**
 * Test script to verify which scale values are accepted by the Venice upscale API
 * With detailed error logging
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Check if API key is provided
if (!process.env.VENICE_API_KEY) {
  console.error('Please set the VENICE_API_KEY environment variable');
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
    
    // Create form data
    const formData = new FormData();
    formData.append('model', 'upscale-model');
    formData.append('scale', scale);
    formData.append('image', imageBuffer, {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });
    
    // Log the request details
    console.log('Request details:');
    console.log('- URL: https://api.venice.ai/api/v1/image/upscale');
    console.log('- Headers:');
    console.log('  - Authorization: Bearer [REDACTED]');
    console.log('  - Content-Type:', formData.getHeaders()['content-type']);
    console.log('- Form data:');
    console.log('  - model: upscale-model');
    console.log('  - scale:', scale);
    console.log('  - image: [Binary data]');
    
    // Make the request
    const response = await axios.post('https://api.venice.ai/api/v1/image/upscale', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`
      }
    });
    
    // Log the response
    console.log('Response status:', response.status);
    
    // Log response data without image binary content
    if (response.data) {
      const sanitizedData = { ...response.data };
      // Remove any potential binary data fields
      if (sanitizedData.image) sanitizedData.image = '[IMAGE DATA EXCLUDED]';
      if (sanitizedData.data) sanitizedData.data = '[IMAGE DATA EXCLUDED]';
      console.log('Response data:', JSON.stringify(sanitizedData, null, 2));
    }
    
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
        
        // Log detailed error information
        if (sanitizedErrorData.details) {
          const sanitizedDetails = { ...sanitizedErrorData.details };
          if (sanitizedDetails.image) sanitizedDetails.image = '[IMAGE DATA EXCLUDED]';
          if (sanitizedDetails.data) sanitizedDetails.data = '[IMAGE DATA EXCLUDED]';
          console.error('Error details:', JSON.stringify(sanitizedDetails, null, 2));
        }
      }
    }
    return { success: false };
  }
}

// Main function to test different scale values
async function main() {
  // Test scale values 1, 1.5, 2, 2.5, 3, 3.5, 4
  const scaleValues = [1, 1.5, 2, 2.5, 3, 3.5, 4];
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