/**
 * Large Image Processing Example
 * 
 * This example demonstrates how to handle large image files by:
 * 1. Resizing them locally to reduce file size
 * 2. Converting to Base64 or providing a URL
 * 
 * This approach works around the API's 4.5MB post limit for large files.
 * 
 * Usage:
 *   VENICE_API_KEY=your-api-key node large-image-processing.js [path/to/large-image.jpg]
 */

const fs = require('fs');
const path = require('path');
const { VeniceAI } = require('../../dist');
const { execSync } = require('child_process');
const os = require('os');

// Check if API key is provided
if (!process.env.VENICE_API_KEY) {
  console.error('Error: VENICE_API_KEY environment variable is required');
  console.error('Usage: VENICE_API_KEY=your-api-key node large-image-processing.js [path/to/large-image.jpg]');
  process.exit(1);
}

// Initialize the Venice AI client
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY,
  logLevel: 'debug', // Enable debug logging
});

/**
 * Resize an image using ImageMagick (requires 'convert' command)
 * 
 * @param {string} imagePath - Path to the original image
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @param {number} quality - JPEG quality (1-100)
 * @returns {string} - Path to the resized image
 */
function resizeImage(imagePath, maxWidth = 1024, maxHeight = 1024, quality = 85) {
  try {
    // Create a temporary file path for the resized image
    const tempDir = os.tmpdir();
    const originalFilename = path.basename(imagePath);
    const resizedFilename = `resized_${originalFilename}`;
    const outputPath = path.join(tempDir, resizedFilename);
    
    // Use ImageMagick to resize the image
    // Note: This requires ImageMagick to be installed on the system
    const command = `convert "${imagePath}" -resize ${maxWidth}x${maxHeight}\\> -quality ${quality} "${outputPath}"`;
    
    console.log(`Executing: ${command}`);
    execSync(command);
    
    console.log(`Resized image saved to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error resizing image:', error.message);
    console.error('Make sure ImageMagick is installed (sudo apt-get install imagemagick on Ubuntu/Debian)');
    throw error;
  }
}

/**
 * Process a large image file and send it to the API
 * 
 * @param {string} imagePath - Path to the image file
 */
async function processLargeImage(imagePath) {
  try {
    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      console.error(`Error: Image file not found at ${imagePath}`);
      process.exit(1);
    }
    
    // Get file size
    const stats = fs.statSync(imagePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    
    console.log(`Processing image: ${imagePath}`);
    console.log(`Original file size: ${fileSizeMB.toFixed(2)} MB`);
    
    let processedImagePath = imagePath;
    
    // If the image is larger than 4MB, resize it
    if (fileSizeMB > 4) {
      console.log('Image is larger than 4MB, resizing...');
      processedImagePath = resizeImage(imagePath);
      
      // Get new file size
      const newStats = fs.statSync(processedImagePath);
      const newFileSizeMB = newStats.size / (1024 * 1024);
      console.log(`Resized file size: ${newFileSizeMB.toFixed(2)} MB`);
      
      // If still too large, resize again with lower quality
      if (newFileSizeMB > 4) {
        console.log('Image is still larger than 4MB, resizing with lower quality...');
        processedImagePath = resizeImage(imagePath, 800, 800, 70);
        
        const finalStats = fs.statSync(processedImagePath);
        const finalFileSizeMB = finalStats.size / (1024 * 1024);
        console.log(`Final resized file size: ${finalFileSizeMB.toFixed(2)} MB`);
      }
    }
    
    // Read the processed image file and convert to base64
    const imageBuffer = fs.readFileSync(processedImagePath);
    const base64Image = imageBuffer.toString('base64');
    
    console.log('Sending image to API...');
    const response = await venice.chat.completions.create({
      model: 'qwen-2.5-vl', // Use a vision model
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please describe what you see in this image in detail.'
            },
            {
              type: 'file',
              file: {
                data: base64Image,
                mime_type: path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg',
                name: path.basename(imagePath)
              }
            }
          ]
        }
      ]
    });
    
    console.log('\nAPI Response:');
    console.log('=============');
    console.log('Response ID:', response.id);
    console.log('Model:', response.model);
    console.log('Content:', response.choices[0].message.content);
    
    // Clean up temporary file if we created one
    if (processedImagePath !== imagePath && fs.existsSync(processedImagePath)) {
      fs.unlinkSync(processedImagePath);
      console.log(`Deleted temporary file: ${processedImagePath}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error processing image:', error);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
    return false;
  }
}

/**
 * Alternative approach: Upload image to a temporary URL and provide the URL to the API
 * This is useful for very large images that would be too large even after resizing
 * 
 * @param {string} imagePath - Path to the image file
 */
async function processImageWithURL(imagePath) {
  console.log('Note: This function is a placeholder for demonstrating the URL approach.');
  console.log('In a real implementation, you would:');
  console.log('1. Upload the image to a cloud storage service (AWS S3, Google Cloud Storage, etc.)');
  console.log('2. Get a public or signed URL for the uploaded image');
  console.log('3. Pass that URL to the API instead of the base64 data');
  console.log('\nExample implementation would look like:');
  console.log(`
  // Upload image to cloud storage (pseudocode)
  const imageUrl = await uploadToCloudStorage(imagePath);
  
  // Send URL to API
  const response = await venice.chat.completions.create({
    model: 'qwen-2.5-vl',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Please describe what you see in this image in detail.'
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl
            }
          }
        ]
      }
    ]
  });
  `);
}

// Get image path from command line or use a default
const imagePath = process.argv.length > 2 
  ? process.argv[2] 
  : path.join(__dirname, '../../test/upscale/test-image.jpg');

// Process the image
processLargeImage(imagePath)
  .then(success => {
    // Show the URL approach as an alternative
    console.log('\nAlternative Approach:');
    console.log('===================');
    processImageWithURL(imagePath);
    
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });