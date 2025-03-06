/**
 * Unified File Upload Example
 *
 * This example demonstrates a unified approach to handling file uploads of any type:
 * - Text files: Included directly in the prompt
 * - Images: Converted to base64
 * - HTML: Processed as document content
 *
 * All files must be under the 4.5MB API limit.
 *
 * This provides a seamless experience similar to the paperclip upload in the UI.
 *
 * Usage:
 *   VENICE_API_KEY=your-api-key node -e "require('./examples/chat/unified-file-upload.js').processFile('./sample.html')"
 */

const fs = require('fs');
const path = require('path');
const { VeniceAI } = require('../../dist');
const { execSync } = require('child_process');
const os = require('os');

// Initialize the Venice AI client with the API key from environment variable
function getClient() {
  if (!process.env.VENICE_API_KEY) {
    console.error('Error: VENICE_API_KEY environment variable is required');
    process.exit(1);
  }
  
  return new VeniceAI({
    apiKey: process.env.VENICE_API_KEY,
    logLevel: 'debug', // Enable debug logging
  });
}

/**
 * Resize an image if it's too large
 * 
 * @param {string} imagePath - Path to the image file
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {Promise<string>} - Path to the resized image or original if small enough
 */
async function resizeImageIfNeeded(imagePath, maxSizeMB = 4) {
  // Get file size
  const stats = fs.statSync(imagePath);
  const fileSizeMB = stats.size / (1024 * 1024);
  
  // If file is small enough, return the original path
  if (fileSizeMB <= maxSizeMB) {
    console.log(`Image is already under ${maxSizeMB}MB (${fileSizeMB.toFixed(2)}MB), no resizing needed`);
    return imagePath;
  }
  
  console.log(`Image is ${fileSizeMB.toFixed(2)}MB, resizing to under ${maxSizeMB}MB...`);
  
  try {
    // Create a temporary file path for the resized image
    const tempDir = os.tmpdir();
    const originalFilename = path.basename(imagePath);
    const resizedFilename = `resized_${originalFilename}`;
    const outputPath = path.join(tempDir, resizedFilename);
    
    // Use ImageMagick to resize the image
    // Note: This requires ImageMagick to be installed on the system
    const quality = 85;
    const maxWidth = 1024;
    const maxHeight = 1024;
    
    const command = `convert "${imagePath}" -resize ${maxWidth}x${maxHeight}\\> -quality ${quality} "${outputPath}"`;
    
    console.log(`Executing: ${command}`);
    execSync(command);
    
    // Check new file size
    const newStats = fs.statSync(outputPath);
    const newFileSizeMB = newStats.size / (1024 * 1024);
    console.log(`Resized image saved to: ${outputPath} (${newFileSizeMB.toFixed(2)}MB)`);
    
    // If still too large, resize again with lower quality
    if (newFileSizeMB > maxSizeMB) {
      console.log(`Image is still larger than ${maxSizeMB}MB, resizing with lower quality...`);
      const lowerQualityFilename = `resized_lower_${originalFilename}`;
      const lowerQualityPath = path.join(tempDir, lowerQualityFilename);
      
      const lowerQualityCommand = `convert "${imagePath}" -resize 800x800\\> -quality 70 "${lowerQualityPath}"`;
      execSync(lowerQualityCommand);
      
      const finalStats = fs.statSync(lowerQualityPath);
      const finalFileSizeMB = finalStats.size / (1024 * 1024);
      console.log(`Final resized image saved to: ${lowerQualityPath} (${finalFileSizeMB.toFixed(2)}MB)`);
      
      // Clean up the first resized image
      fs.unlinkSync(outputPath);
      
      return lowerQualityPath;
    }
    
    return outputPath;
  } catch (error) {
    console.error('Error resizing image:', error.message);
    console.error('Make sure ImageMagick is installed (sudo apt-get install imagemagick on Ubuntu/Debian)');
    console.log('Continuing with original image...');
    return imagePath;
  }
}

/**
 * Process a file based on its type and send to the API
 *
 * @param {string} filePath - Path to the file
 * @param {Object} client - Venice AI client instance
 * @param {Object} options - Additional options
 * @param {string} options.customPrompt - Custom prompt to use instead of the default
 * @param {string} options.model - Model to use (defaults to qwen-2.5-vl)
 * @returns {Promise<string>} - API response content
 */
async function processFile(filePath, client = null, options = {}) {
  // Use provided client or create a new one
  const venice = client || getClient();
  
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at ${filePath}`);
  }
  
  // Get file extension and size
  const fileExt = path.extname(filePath).toLowerCase();
  const stats = fs.statSync(filePath);
  const fileSizeMB = stats.size / (1024 * 1024);
  
  console.log(`Processing file: ${filePath}`);
  console.log(`File type: ${fileExt}, Size: ${fileSizeMB.toFixed(2)}MB`);
  
  // Check if file is too large for the API
  if (fileSizeMB > 4.5) {
    throw new Error(`File is too large (${fileSizeMB.toFixed(2)}MB). The Venice AI API has a strict 4.5MB limit.`);
  }
  
  // Determine file type and process accordingly
  let messages = [];
  
  // Handle different file types
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
    // Image file - convert to base64 or resize if needed
    console.log('Detected image file');
    
    // Check if image needs resizing
    const processedImagePath = await resizeImageIfNeeded(filePath);
    
    // Read the processed image file and convert to base64
    const imageBuffer = fs.readFileSync(processedImagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Clean up temporary file if we created one
    if (processedImagePath !== filePath && fs.existsSync(processedImagePath)) {
      fs.unlinkSync(processedImagePath);
      console.log(`Deleted temporary file: ${processedImagePath}`);
    }
    
    // Use custom prompt if provided, otherwise use default
    const promptText = options.customPrompt ||
      'I\'ve uploaded an image. Please analyze this image and describe what you see in detail.';
    
    messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: promptText
          },
          {
            type: 'file',
            file: {
              data: base64Image,
              mime_type: fileExt === '.png' ? 'image/png' :
                         fileExt === '.gif' ? 'image/gif' :
                         fileExt === '.webp' ? 'image/webp' : 'image/jpeg',
              name: path.basename(filePath)
            }
          }
        ]
      }
    ];
  } else if (fileExt === '.html') {
    // HTML file - use vision model to process
    console.log('Detected HTML file');
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    const base64Html = Buffer.from(htmlContent).toString('base64');
    
    // Use custom prompt if provided, otherwise use default
    const promptText = options.customPrompt ||
      'I\'ve uploaded an HTML document. Please analyze this content and provide insights.';
    
    messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: promptText
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:text/html;base64,${base64Html}`
            }
          }
        ]
      }
    ];
  } else if (['.txt', '.md', '.csv', '.json', '.xml', '.js', '.py', '.java', '.c', '.cpp', '.h', '.cs', '.php', '.rb', '.go', '.rs', '.ts', '.jsx', '.tsx'].includes(fileExt)) {
    // Text file - read content directly
    console.log('Detected text file, reading content...');
    const textContent = fs.readFileSync(filePath, 'utf8');
    
    // Use custom prompt if provided, otherwise use default
    const promptText = options.customPrompt ||
      `I've uploaded a ${fileExt.substring(1).toUpperCase()} file. Please analyze this content:`;
    
    messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `${promptText}\n\n${textContent}`
          }
        ]
      }
    ];
  } else {
    // Unknown file type - try to determine if it's text or binary
    console.log('Unknown file type, attempting to determine if it\'s text or binary...');
    
    try {
      // Try to read as text
      const textContent = fs.readFileSync(filePath, 'utf8');
      
      // If we got here, it's probably a text file
      console.log('File appears to be text-based');
      
      // Use custom prompt if provided, otherwise use default
      const promptText = options.customPrompt ||
        `I've uploaded a file with extension ${fileExt}. Please analyze this content:`;
      
      messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${promptText}\n\n${textContent}`
            }
          ]
        }
      ];
    } catch (error) {
      // If reading as text failed, it's probably binary
      console.log('File appears to be binary, treating as generic file');
      
      // For binary files under the size limit, try to send as base64
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');
      
      // Use custom prompt if provided, otherwise use default
      const promptText = options.customPrompt ||
        `I've uploaded a binary file with extension ${fileExt}. Please analyze this if possible.`;
      
      messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: promptText
            },
            {
              type: 'file',
              file: {
                data: base64Data,
                mime_type: 'application/octet-stream',
                name: path.basename(filePath)
              }
            }
          ]
        }
      ];
    }
  }
  
  // Send to API
  console.log('Sending to API...');
  const model = options.model || 'qwen-2.5-vl'; // Use provided model or default to qwen-2.5-vl
  const response = await venice.chat.completions.create({
    model: model,
    messages: messages
  });
  
  return response.choices[0].message.content;
}

/**
 * Process a file with the unified approach
 *
 * @param {string} filePath - Path to the file to process
 * @param {Object} options - Additional options
 * @param {string} options.customPrompt - Custom prompt to use instead of the default
 * @param {string} options.model - Model to use (defaults to qwen-2.5-vl)
 * @returns {Promise<boolean>} - Success status
 */
async function processFileAndPrint(filePath, options = {}) {
  try {
    const venice = getClient();
    
    console.log(`Processing file: ${filePath}`);
    
    // Process the file with options
    const result = await processFile(filePath, venice, options);
    
    // Display the result
    console.log('\nAPI Response:');
    console.log('=============');
    console.log(result);
    
    return true;
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

// Export the functions for use in other scripts
module.exports = {
  processFile,
  processFileAndPrint,
  resizeImageIfNeeded
};

// If this script is run directly, provide usage instructions
if (require.main === module) {
  console.log(`
Unified File Upload Example

This script provides functions for handling file uploads of any type.
All files must be under the 4.5MB API limit.

Example usage:
  VENICE_API_KEY=your-api-key node -e "require('./examples/chat/unified-file-upload.js').processFileAndPrint('./sample.html')"
  
  # With custom prompt:
  VENICE_API_KEY=your-api-key node -e "require('./examples/chat/unified-file-upload.js').processFileAndPrint('./sample.html', {customPrompt: 'Analyze this HTML and tell me about its structure.'})"
  
  # With custom model:
  VENICE_API_KEY=your-api-key node -e "require('./examples/chat/unified-file-upload.js').processFileAndPrint('./sample.jpg', {model: 'claude-3-opus-20240229'})"
  
Or import in your own script:
  const { processFile } = require('./examples/chat/unified-file-upload.js');
  
  async function myFunction() {
    // Basic usage
    const result = await processFile('./my-file.html');
    
    // With options
    const resultWithOptions = await processFile('./my-file.html', null, {
      customPrompt: 'Please analyze this HTML document and extract all links.',
      model: 'qwen-2.5-vl'
    });
    
    console.log(result);
  }
`);
}