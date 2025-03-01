/**
 * Test script to measure performance of the Venice upscale API
 * with different image sizes and scale factors
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

// Function to measure upscale performance
async function measureUpscalePerformance(width, height, scale) {
  console.log(`\n=== Testing upscale performance with image size ${width}x${height} and scale=${scale} ===`);
  
  try {
    // Create a test image
    console.log(`Creating test image of size ${width}x${height}...`);
    const startImageCreation = Date.now();
    const imageBuffer = await createTestImage(width, height);
    const imageCreationTime = Date.now() - startImageCreation;
    console.log(`Image creation time: ${imageCreationTime}ms`);
    console.log(`Original image size: ${width}x${height} (${imageBuffer.length} bytes)`);
    
    // Create form data
    const formData = new FormData();
    formData.append('model', 'upscale-model');
    formData.append('scale', scale);
    formData.append('image', imageBuffer, {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });
    
    // Measure API request time
    console.log('Sending upscale request...');
    const startRequest = Date.now();
    
    const response = await axios.post('https://api.venice.ai/api/v1/image/upscale', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`
      }
    });
    
    const requestTime = Date.now() - startRequest;
    console.log(`API request time: ${requestTime}ms`);
    
    // Check the response
    if (response.data && response.data.url) {
      console.log(`Upscaled image URL: ${response.data.url}`);
      
      // Measure download time
      console.log('Downloading upscaled image...');
      const startDownload = Date.now();
      const imageResponse = await axios.get(response.data.url, { responseType: 'arraybuffer' });
      const downloadTime = Date.now() - startDownload;
      console.log(`Download time: ${downloadTime}ms`);
      
      const upscaledSize = imageResponse.data.length;
      console.log(`Upscaled image size: ${upscaledSize} bytes`);
      console.log(`Size ratio: ${(upscaledSize / imageBuffer.length).toFixed(2)}x`);
      
      // Save the upscaled image
      const outputPath = path.join(__dirname, `upscaled-perf-${width}x${height}-${scale}x.jpg`);
      fs.writeFileSync(outputPath, Buffer.from(imageResponse.data));
      
      // Total time
      const totalTime = imageCreationTime + requestTime + downloadTime;
      console.log(`Total processing time: ${totalTime}ms`);
      
      return {
        success: true,
        originalSize: {
          width,
          height,
          bytes: imageBuffer.length
        },
        upscaledSize: upscaledSize,
        timing: {
          imageCreation: imageCreationTime,
          apiRequest: requestTime,
          download: downloadTime,
          total: totalTime
        }
      };
    } else {
      console.log(`No URL returned for size ${width}x${height} and scale=${scale}`);
      return { success: false };
    }
  } catch (error) {
    console.error(`Error upscaling with size ${width}x${height} and scale=${scale}:`, error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
    return { success: false };
  }
}

// Function to format time in ms for display
function formatTime(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}

// Main function to test performance with different image sizes and scales
async function main() {
  // Test various image sizes with different scale factors
  const testCases = [
    // Small images
    { width: 100, height: 100, scale: 2 },
    { width: 100, height: 100, scale: 4 },
    
    // Medium images
    { width: 300, height: 300, scale: 2 },
    { width: 300, height: 300, scale: 4 },
    
    // Large images
    { width: 600, height: 600, scale: 2 },
    { width: 600, height: 600, scale: 4 },
    
    // Very large images
    { width: 1000, height: 1000, scale: 2 },
    { width: 1000, height: 1000, scale: 4 },
    
    // Different aspect ratios
    { width: 400, height: 300, scale: 2 }, // 4:3
    { width: 400, height: 225, scale: 2 }, // 16:9
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    const { width, height, scale } = testCase;
    const result = await measureUpscalePerformance(width, height, scale);
    if (result.success) {
      results.push({
        width,
        height,
        scale,
        originalBytes: result.originalSize.bytes,
        upscaledBytes: result.upscaledSize,
        timing: result.timing
      });
    }
  }
  
  // Summary
  console.log('\n=== Performance Summary ===');
  console.log('Image Size | Scale | Original Size | Upscaled Size | API Request Time | Total Time');
  console.log('-----------|-------|--------------|---------------|------------------|------------');
  
  for (const result of results) {
    const originalKB = (result.originalBytes / 1024).toFixed(1);
    const upscaledKB = (result.upscaledBytes / 1024).toFixed(1);
    
    console.log(
      `${result.width}x${result.height} | ${result.scale}x | ${originalKB} KB | ${upscaledKB} KB | ${formatTime(result.timing.apiRequest)} | ${formatTime(result.timing.total)}`
    );
  }
  
  // Performance analysis
  if (results.length > 0) {
    console.log('\n=== Performance Analysis ===');
    
    // Average API request time
    const avgRequestTime = results.reduce((sum, r) => sum + r.timing.apiRequest, 0) / results.length;
    console.log(`Average API request time: ${formatTime(avgRequestTime)}`);
    
    // Fastest and slowest cases
    const sortedByRequestTime = [...results].sort((a, b) => a.timing.apiRequest - b.timing.apiRequest);
    const fastest = sortedByRequestTime[0];
    const slowest = sortedByRequestTime[sortedByRequestTime.length - 1];
    
    console.log(`Fastest API request: ${fastest.width}x${fastest.height} at scale ${fastest.scale}x (${formatTime(fastest.timing.apiRequest)})`);
    console.log(`Slowest API request: ${slowest.width}x${slowest.height} at scale ${slowest.scale}x (${formatTime(slowest.timing.apiRequest)})`);
    
    // Correlation between image size and processing time
    console.log('\nCorrelation between image size and processing time:');
    const pixelCounts = results.map(r => r.width * r.height);
    const requestTimes = results.map(r => r.timing.apiRequest);
    
    // Simple correlation calculation
    const avgPixels = pixelCounts.reduce((sum, p) => sum + p, 0) / pixelCounts.length;
    const avgTime = requestTimes.reduce((sum, t) => sum + t, 0) / requestTimes.length;
    
    let numerator = 0;
    let denomPixels = 0;
    let denomTime = 0;
    
    for (let i = 0; i < pixelCounts.length; i++) {
      const pixelDiff = pixelCounts[i] - avgPixels;
      const timeDiff = requestTimes[i] - avgTime;
      numerator += pixelDiff * timeDiff;
      denomPixels += pixelDiff * pixelDiff;
      denomTime += timeDiff * timeDiff;
    }
    
    const correlation = numerator / (Math.sqrt(denomPixels) * Math.sqrt(denomTime));
    console.log(`Correlation coefficient: ${correlation.toFixed(2)} (1.0 means perfect correlation)`);
    
    if (correlation > 0.7) {
      console.log('There is a strong positive correlation between image size and processing time.');
    } else if (correlation > 0.3) {
      console.log('There is a moderate positive correlation between image size and processing time.');
    } else {
      console.log('There is a weak correlation between image size and processing time.');
    }
    
    // Scale factor impact
    console.log('\nImpact of scale factor on processing time:');
    const scale2Results = results.filter(r => r.scale === 2);
    const scale4Results = results.filter(r => r.scale === 4);
    
    if (scale2Results.length > 0 && scale4Results.length > 0) {
      const avgScale2Time = scale2Results.reduce((sum, r) => sum + r.timing.apiRequest, 0) / scale2Results.length;
      const avgScale4Time = scale4Results.reduce((sum, r) => sum + r.timing.apiRequest, 0) / scale4Results.length;
      
      console.log(`Average processing time for scale 2x: ${formatTime(avgScale2Time)}`);
      console.log(`Average processing time for scale 4x: ${formatTime(avgScale4Time)}`);
      console.log(`Ratio of 4x to 2x processing time: ${(avgScale4Time / avgScale2Time).toFixed(2)}x`);
    }
  }
}

// Run the tests
main().catch(console.error);