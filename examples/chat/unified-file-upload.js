/**
 * Unified File Upload Example
 *
 * This example demonstrates a unified approach to handling file uploads of any type:
 * - Text files: Included directly in the prompt
 * - Images: Converted to base64 or provided as URL
 * - PDFs: Converted to text and included in prompt
 *
 * This provides a seamless experience similar to the paperclip upload in the UI.
 *
 * Usage:
 *   VENICE_API_KEY=your-api-key node -e "require('./examples/chat/unified-file-upload.js').processFile('./sample.pdf')"
 */

const fs = require('fs');
const path = require('path');
const { VeniceAI } = require('../../dist');
const pdfjsLib = require('pdfjs-dist');
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
 * Extract text from a PDF file using PDF.js
 * 
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromPDF(pdfPath) {
  // Read the PDF file
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  
  // Load the PDF document
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDocument = await loadingTask.promise;
  
  console.log(`PDF loaded. Number of pages: ${pdfDocument.numPages}`);
  
  // Extract text from each page
  let extractedText = '';
  
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    
    // Concatenate the text items
    const pageText = textContent.items.map(item => item.str).join(' ');
    extractedText += `\n--- Page ${i} ---\n${pageText}\n`;
    
    console.log(`Extracted text from page ${i}/${pdfDocument.numPages}`);
  }
  
  return extractedText;
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
 * @returns {Promise<string>} - API response content
 */
async function processFile(filePath, client = null) {
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
  
  // Determine file type and process accordingly
  let messages = [];
  
  // Handle different file types
  if (fileExt === '.pdf') {
    // PDF file - extract text
    console.log('Detected PDF file, extracting text...');
    const extractedText = await extractTextFromPDF(filePath);
    
    messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `I've uploaded a PDF document. Please analyze this content and provide insights:\n\n${extractedText}`
          }
        ]
      }
    ];
  } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
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
    
    messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'I\'ve uploaded an image. Please analyze this image and describe what you see in detail.'
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
  } else if (['.txt', '.md', '.csv', '.json', '.html', '.xml', '.js', '.py', '.java', '.c', '.cpp', '.h', '.cs', '.php', '.rb', '.go', '.rs', '.ts', '.jsx', '.tsx'].includes(fileExt)) {
    // Text file - read content directly
    console.log('Detected text file, reading content...');
    const textContent = fs.readFileSync(filePath, 'utf8');
    
    messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `I've uploaded a ${fileExt.substring(1).toUpperCase()} file. Please analyze this content:\n\n${textContent}`
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
      
      messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `I've uploaded a file with extension ${fileExt}. Please analyze this content:\n\n${textContent}`
            }
          ]
        }
      ];
    } catch (error) {
      // If reading as text failed, it's probably binary
      console.log('File appears to be binary, treating as generic file');
      
      // For binary files under the size limit, try to send as base64
      if (fileSizeMB <= 4.5) {
        const fileBuffer = fs.readFileSync(filePath);
        const base64Data = fileBuffer.toString('base64');
        
        messages = [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `I've uploaded a binary file with extension ${fileExt}. Please analyze this if possible.`
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
      } else {
        throw new Error(`File is too large (${fileSizeMB.toFixed(2)}MB) and cannot be processed automatically. Please use a smaller file or process it manually.`);
      }
    }
  }
  
  // Send to API
  console.log('Sending to API...');
  const response = await venice.chat.completions.create({
    model: 'qwen-2.5-vl', // Use a vision model that can process various content
    messages: messages
  });
  
  return response.choices[0].message.content;
}

/**
 * Process a file with the unified approach
 *
 * @param {string} filePath - Path to the file to process
 * @returns {Promise<void>}
 */
async function processFileAndPrint(filePath) {
  try {
    const venice = getClient();
    
    console.log(`Processing file: ${filePath}`);
    
    // Process the file
    const result = await processFile(filePath, venice);
    
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

// Update the processFile function to accept the client as a parameter
async function processFile(filePath, client = null) {
  // Use provided client or create a new one
  const venice = client || getClient();
  
  // Rest of the function remains the same...
  // [existing implementation]
  
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
  
  // [rest of the existing implementation]
  
  // Send to API
  console.log('Sending to API...');
  const response = await venice.chat.completions.create({
    model: 'qwen-2.5-vl', // Use a vision model that can process various content
    messages: messages
  });
  
  return response.choices[0].message.content;
}

// Export the functions for use in other scripts
module.exports = {
  processFile,
  processFileAndPrint,
  extractTextFromPDF,
  resizeImageIfNeeded
};

// If this script is run directly, provide usage instructions
if (require.main === module) {
  console.log(`
Unified File Upload Example

This script provides functions for handling file uploads of any type.
It's designed to be imported and used in other scripts.

Example usage:
  VENICE_API_KEY=your-api-key node -e "require('./examples/chat/unified-file-upload.js').processFileAndPrint('./sample.pdf')"
  
Or import in your own script:
  const { processFile } = require('./examples/chat/unified-file-upload.js');
  
  async function myFunction() {
    const result = await processFile('./my-file.pdf');
    console.log(result);
  }
`);
}