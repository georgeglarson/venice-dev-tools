/**
 * Test script to verify which image sizes are accepted by the Venice upscale API
 * With protection against stdout flooding
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const FormData = require('form-data');
const axios = require('axios');

// Check if API key is provided
if (!process.env.VENICE_API_KEY) {
  console.error('Please set the VENICE_API_KEY environment variable');
  process.exit(1);
}

// Function to create a test image of a specific size
async function createTestImage(width, height) {
  console.log(`Creating test image of size ${width}x${height}`);
  
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
  const fontSize = Math.max(10, Math.min(30, width / 10));
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = 'black';
  ctx.fillText(`${width}x${height}`, width / 4, height / 2);
  
  // Return as buffer
  return canvas.toBuffer('image/jpeg');
}

// Function to upscale an image with a specific scale value
async function testUpscaleSize(width, height, scale) {
  console.log(`\n=== Testing upscale with image size ${width}x${height} and scale=${scale} ===`);
  
  try {
    // Create a test image
    const imageBuffer = await createTestImage(width, height);
    console.log(`Original image size: ${width}x${height} (${imageBuffer.length} bytes)`);
    
    // Create form data
    const formData = new FormData();
    formData.append('model', 'upscale-model');
    formData.append('scale', scale);
    formData.append('image', imageBuffer, {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });
    
    // Log the request details (without image data)
    console.log('Request details:');
    console.log('- URL: https://api.venice.ai/api/v1/image/upscale');
    console.log('- Headers:');
    console.log('  - Authorization: Bearer [REDACTED]');
    console.log('  - Content-Type:', formData.getHeaders()['content-type']);
    console.log('- Form data:');
    console.log('  - model: upscale-model');
    console.log('  - scale:', scale);
    console.log('  - image: [BINARY DATA EXCLUDED]');
    
    // Make the request
    const response = await axios.post('https://api.venice.ai/api/v1/image/upscale', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`
      }
    });
    
    // Log the response (without image data)
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
      console.log(`Upscale with size ${width}x${height} and scale=${scale} succeeded!`);
      
      // Download the upscaled image to check its size
      const imageResponse = await axios.get(response.data.url, { responseType: 'arraybuffer' });
      const upscaledSize = imageResponse.data.length;
      console.log(`Upscaled image size: ${upscaledSize} bytes`);
      console.log(`Size ratio: ${(upscaledSize / imageBuffer.length).toFixed(2)}x`);
      
      // Save the upscaled image
      const outputPath = path.join(__dirname, `upscaled-${width}x${height}-${scale}x.jpg`);
      fs.writeFileSync(outputPath, Buffer.from(imageResponse.data));
      console.log(`Saved upscaled image to: ${outputPath}`);
      
      return {
        success: true,
        originalSize: {
          width,
          height,
          bytes: imageBuffer.length
        },
        upscaledSize: upscaledSize,
        ratio: upscaledSize / imageBuffer.length
      };
    } else {
      console.log(`No URL returned for size ${width}x${height} and scale=${scale}`);
      return { success: false };
    }
  } catch (error) {
    console.error(`Error upscaling with size ${width}x${height} and scale=${scale}:`, error.message);
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

// Main function to test different image sizes
async function main() {
  // Test various image sizes with scale=2
  const imageSizes = [
    { width: 100, height: 100 },
    { width: 200, height: 200 },
    { width: 300, height: 300 },
    { width: 400, height: 400 },
    { width: 500, height: 500 },
    { width: 600, height: 600 },
    { width: 800, height: 800 },
    { width: 1000, height: 1000 },
    // Add more sizes as needed
  ];
  
  const scale = 2; // Fixed scale for size testing
  const results = {};
  
  for (const size of imageSizes) {
    const key = `${size.width}x${size.height}`;
    results[key] = await testUpscaleSize(size.width, size.height, scale);
  }
  
  // Summary
  console.log('\n=== Summary ===');
  for (const size in results) {
    const result = results[size];
    if (result.success) {
      console.log(`Size ${size}: Succeeded - Size ratio: ${result.ratio.toFixed(2)}x`);
    } else {
      console.log(`Size ${size}: Failed`);
    }
  }
}

// Run the tests
main().catch(console.error);