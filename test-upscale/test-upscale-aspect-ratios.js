/**
 * Test script to verify how the Venice upscale API handles different image aspect ratios
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

// Function to create a test image with a specific aspect ratio
async function createTestImage(width, height) {
  console.log(`Creating test image with aspect ratio ${width}:${height} (${width}x${height} pixels)`);
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fill with a gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'blue');
  gradient.addColorStop(0.5, 'white');
  gradient.addColorStop(1, 'red');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add grid lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 1;
  
  // Vertical lines
  for (let x = 0; x < width; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 0; y < height; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Add text showing dimensions
  const fontSize = Math.max(10, Math.min(20, Math.min(width, height) / 8));
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${width}x${height}`, width / 2, height / 2);
  
  // Return as buffer
  return canvas.toBuffer('image/jpeg');
}

// Function to upscale an image with a specific scale value
async function testUpscaleAspectRatio(width, height, scale) {
  const aspectRatio = width / height;
  console.log(`\n=== Testing upscale with aspect ratio ${aspectRatio.toFixed(2)} (${width}x${height}) and scale=${scale} ===`);
  
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
    
    // Make the request
    const response = await axios.post('https://api.venice.ai/api/v1/image/upscale', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`
      }
    });
    
    // Log the response (without image data)
    console.log('Response status:', response.status);
    
    // Check the response
    if (response.data && response.data.url) {
      console.log(`Upscaled image URL: ${response.data.url}`);
      console.log(`Upscale with aspect ratio ${aspectRatio.toFixed(2)} and scale=${scale} succeeded!`);
      
      // Download the upscaled image to check its size
      const imageResponse = await axios.get(response.data.url, { responseType: 'arraybuffer' });
      const upscaledSize = imageResponse.data.length;
      console.log(`Upscaled image size: ${upscaledSize} bytes`);
      
      // Save the upscaled image
      const outputPath = path.join(__dirname, `upscaled-${width}x${height}-${scale}x.jpg`);
      fs.writeFileSync(outputPath, Buffer.from(imageResponse.data));
      console.log(`Saved upscaled image to: ${outputPath}`);
      
      // Get dimensions of upscaled image
      const { createCanvas, loadImage } = require('canvas');
      const tempPath = path.join(__dirname, `temp-${width}x${height}.jpg`);
      fs.writeFileSync(tempPath, Buffer.from(imageResponse.data));
      
      try {
        const image = await loadImage(tempPath);
        const upscaledWidth = image.width;
        const upscaledHeight = image.height;
        const upscaledAspectRatio = upscaledWidth / upscaledHeight;
        
        console.log(`Upscaled dimensions: ${upscaledWidth}x${upscaledHeight}`);
        console.log(`Upscaled aspect ratio: ${upscaledAspectRatio.toFixed(2)}`);
        console.log(`Aspect ratio preserved: ${Math.abs(aspectRatio - upscaledAspectRatio) < 0.01 ? 'Yes' : 'No'}`);
        
        // Clean up temp file
        fs.unlinkSync(tempPath);
        
        return {
          success: true,
          originalSize: {
            width,
            height,
            aspectRatio
          },
          upscaledSize: {
            width: upscaledWidth,
            height: upscaledHeight,
            aspectRatio: upscaledAspectRatio
          },
          aspectRatioPreserved: Math.abs(aspectRatio - upscaledAspectRatio) < 0.01
        };
      } catch (err) {
        console.error('Error getting upscaled image dimensions:', err.message);
        // Clean up temp file if it exists
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
        
        return {
          success: true,
          originalSize: {
            width,
            height,
            aspectRatio
          },
          upscaledSize: {
            bytes: upscaledSize
          },
          aspectRatioPreserved: null
        };
      }
    } else {
      console.log(`No URL returned for aspect ratio ${aspectRatio.toFixed(2)} and scale=${scale}`);
      return { success: false };
    }
  } catch (error) {
    console.error(`Error upscaling with aspect ratio ${aspectRatio.toFixed(2)} and scale=${scale}:`, error.message);
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

// Main function to test different aspect ratios
async function main() {
  // Test various aspect ratios with scale=2
  const aspectRatios = [
    { width: 100, height: 100 },    // 1:1 (square)
    { width: 200, height: 100 },    // 2:1 (landscape)
    { width: 100, height: 200 },    // 1:2 (portrait)
    { width: 300, height: 100 },    // 3:1 (wide landscape)
    { width: 100, height: 300 },    // 1:3 (tall portrait)
    { width: 320, height: 240 },    // 4:3 (standard)
    { width: 240, height: 320 },    // 3:4 (standard portrait)
    { width: 400, height: 225 },    // 16:9 (widescreen)
    { width: 225, height: 400 },    // 9:16 (vertical video)
    { width: 300, height: 125 },    // 12:5 (ultrawide)
  ];
  
  const scale = 2; // Fixed scale for aspect ratio testing
  const results = {};
  
  for (const size of aspectRatios) {
    const key = `${size.width}x${size.height}`;
    results[key] = await testUpscaleAspectRatio(size.width, size.height, scale);
  }
  
  // Summary
  console.log('\n=== Summary ===');
  console.log('Aspect Ratio | Original Size | Upscaled Size | Ratio Preserved');
  console.log('-------------|---------------|---------------|----------------');
  
  for (const size in results) {
    const result = results[size];
    if (result.success && result.upscaledSize.width) {
      const originalAspect = result.originalSize.aspectRatio.toFixed(2);
      const upscaledAspect = result.upscaledSize.aspectRatio.toFixed(2);
      const preserved = result.aspectRatioPreserved ? 'Yes' : 'No';
      
      console.log(`${originalAspect} | ${result.originalSize.width}x${result.originalSize.height} | ${result.upscaledSize.width}x${result.upscaledSize.height} | ${preserved}`);
    } else if (result.success) {
      console.log(`${size}: Succeeded but couldn't determine dimensions`);
    } else {
      console.log(`${size}: Failed`);
    }
  }
}

// Run the tests
main().catch(console.error);