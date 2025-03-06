/**
 * Image Upscaling Example
 * 
 * This example demonstrates how to use the Venice AI API to upscale images.
 * The API has a strict 4.5MB post limit for file uploads.
 * 
 * Usage:
 *   VENICE_API_KEY=your-api-key node examples/image/upscale-image.js
 */

const fs = require('fs');
const path = require('path');
const { VeniceAI } = require('../../dist');
const https = require('https');

// Initialize the Venice AI client
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

/**
 * Upscale an image using the Venice AI API
 * 
 * @param {string} imagePath - Path to the image file
 * @param {number} scale - Scale factor (2 or 4)
 * @param {string} outputPath - Path to save the upscaled image
 * @returns {Promise<void>}
 */
async function upscaleImage(imagePath, scale = 2, outputPath = 'upscaled-image.jpg') {
  try {
    console.log(`Upscaling image: ${imagePath} with scale factor ${scale}`);
    
    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }
    
    // Check file size
    const stats = fs.statSync(imagePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    console.log(`Image size: ${fileSizeMB.toFixed(2)}MB`);
    
    // Verify file size is under the 4.5MB limit
    if (fileSizeMB > 4.5) {
      throw new Error(`Image file is too large (${fileSizeMB.toFixed(2)}MB). The Venice AI API has a strict 4.5MB limit.`);
    }
    
    // Read the image file and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Verify scale is either 2 or 4
    if (scale !== 2 && scale !== 4) {
      throw new Error('Scale must be either 2 or 4');
    }
    
    console.log('Sending upscale request to API...');
    
    // Call the upscale API
    const response = await venice.image.upscale({
      image: base64Image,
      scale: scale
    });
    
    console.log('Upscale request successful!');
    
    // Handle the response
    if (response.url) {
      // If the response contains a URL, download the image
      console.log(`Upscaled image URL: ${response.url}`);
      console.log(`Downloading upscaled image to ${outputPath}...`);
      
      // Download the image
      await downloadImage(response.url, outputPath);
      console.log(`Upscaled image saved to ${outputPath}`);
    } else if (response.b64_json) {
      // If the response contains base64 data, save it directly
      console.log('Received base64 image data');
      const imageData = Buffer.from(response.b64_json, 'base64');
      fs.writeFileSync(outputPath, imageData);
      console.log(`Upscaled image saved to ${outputPath}`);
    } else {
      console.log('Response:', response);
      throw new Error('No image data found in the response');
    }
  } catch (error) {
    console.error('Error upscaling image:', error.message);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
  }
}

/**
 * Download an image from a URL
 * 
 * @param {string} url - URL of the image
 * @param {string} outputPath - Path to save the image
 * @returns {Promise<void>}
 */
function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Delete the file if there's an error
      reject(err);
    });
  });
}

/**
 * Demonstrate different upscale options
 */
async function demonstrateUpscaling() {
  try {
    // Path to the test image
    const testImagePath = path.join(__dirname, '../../test/upscale/test-image.jpg');
    
    // Example 1: Upscale with scale factor 2
    console.log('\n=== Example 1: Upscale with scale factor 2 ===');
    await upscaleImage(testImagePath, 2, 'upscaled-2x.jpg');
    
    // Example 2: Upscale with scale factor 4
    console.log('\n=== Example 2: Upscale with scale factor 4 ===');
    await upscaleImage(testImagePath, 4, 'upscaled-4x.jpg');
    
    // Example 3: Using the CLI interface
    console.log('\n=== Example 3: Using the CLI interface ===');
    const cliResult = await venice.cli(`upscale-image ${testImagePath} --scale 2 --output upscaled-cli.jpg`);
    console.log('CLI Result:', cliResult);
    
    console.log('\nAll examples completed!');
  } catch (error) {
    console.error('Error in demonstration:', error.message);
  }
}

// Run the demonstration if this script is executed directly
if (require.main === module) {
  demonstrateUpscaling().catch(console.error);
}

// Export functions for use in other scripts
module.exports = {
  upscaleImage,
  downloadImage
};