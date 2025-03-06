/**
 * Core file processing logic for the universal file upload functionality
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as os from 'os';
import { VeniceAI } from '../../index';
import { FileProcessingOptions, ProcessedFileInfo } from './types';

/**
 * Resize an image if it's too large
 * 
 * @param imagePath - Path to the image file
 * @param maxSizeMB - Maximum size in MB
 * @returns Path to the resized image or original if small enough
 */
export async function resizeImageIfNeeded(imagePath: string, maxSizeMB: number = 4): Promise<string> {
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
    console.error('Error resizing image:', (error as Error).message);
    console.error('Make sure ImageMagick is installed (sudo apt-get install imagemagick on Ubuntu/Debian)');
    console.log('Continuing with original image...');
    return imagePath;
  }
}

/**
 * Process a file and prepare it for sending to the API
 * 
 * @param filePath - Path to the file
 * @param options - Processing options
 * @returns Information about the processed file
 */
export async function prepareFileForUpload(filePath: string, options: FileProcessingOptions = {}): Promise<ProcessedFileInfo> {
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
  const maxSizeMB = options.maxSizeMB || 4.5;
  if (fileSizeMB > maxSizeMB) {
    throw new Error(`File is too large (${fileSizeMB.toFixed(2)}MB). The Venice AI API has a strict ${maxSizeMB}MB limit.`);
  }
  
  // Determine file type and process accordingly
  let content: any[] = [];
  
  // Handle different file types
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
    // Image file - convert to base64 or resize if needed
    console.log('Detected image file');
    
    // Check if image needs resizing
    const processedImagePath = await resizeImageIfNeeded(filePath, maxSizeMB);
    
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
    
    content = [
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
    ];
  } else if (fileExt === '.html') {
    // HTML file - use vision model to process
    console.log('Detected HTML file');
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    const base64Html = Buffer.from(htmlContent).toString('base64');
    
    // Use custom prompt if provided, otherwise use default
    const promptText = options.customPrompt ||
      'I\'ve uploaded an HTML document. Please analyze this content and provide insights.';
    
    content = [
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
    ];
  } else if (['.txt', '.md', '.csv', '.json', '.xml', '.js', '.py', '.java', '.c', '.cpp', '.h', '.cs', '.php', '.rb', '.go', '.rs', '.ts', '.jsx', '.tsx'].includes(fileExt)) {
    // Text file - read content directly
    console.log('Detected text file, reading content...');
    const textContent = fs.readFileSync(filePath, 'utf8');
    
    // Use custom prompt if provided, otherwise use default
    const promptText = options.customPrompt ||
      `I've uploaded a ${fileExt.substring(1).toUpperCase()} file. Please analyze this content:`;
    
    content = [
      {
        type: 'text',
        text: `${promptText}\n\n${textContent}`
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
      
      content = [
        {
          type: 'text',
          text: `${promptText}\n\n${textContent}`
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
      
      content = [
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
      ];
    }
  }
  
  return {
    content,
    fileType: fileExt,
    fileSizeMB
  };
}

/**
 * Process a file and send it to the API
 * 
 * @param filePath - Path to the file
 * @param client - Venice AI client instance
 * @param options - Processing options
 * @returns API response content
 */
export async function processFile(
  filePath: string, 
  client: VeniceAI, 
  options: FileProcessingOptions = {}
): Promise<string> {
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at ${filePath}`);
  }
  
  // Prepare the file for upload
  const fileInfo = await prepareFileForUpload(filePath, options);
  
  // Send to API
  console.log('Sending to API...');
  const model = options.model || 'qwen-2.5-vl'; // Use provided model or default to qwen-2.5-vl
  const response = await client.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'user',
        content: fileInfo.content
      }
    ]
  });
  
  const content = response.choices[0].message.content;
  
  // Handle different content types
  if (typeof content === 'string') {
    return content;
  } else if (Array.isArray(content)) {
    // If content is an array, try to extract text parts
    return content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n') || '';
  }
  
  return '';
}

/**
 * Attach a file to a message
 * 
 * @param options - File attachment options
 * @returns Content array for the message
 */
export async function attachFileToMessage(options: {
  filePath: string;
  prompt: string;
  options?: FileProcessingOptions;
}): Promise<any[]> {
  const { filePath, prompt, options: processingOptions = {} } = options;
  
  // Prepare the file for upload
  const fileInfo = await prepareFileForUpload(filePath, processingOptions);
  
  // Create a new content array with the prompt as the first item
  const content = [...fileInfo.content];
  
  // Replace the first text item with the user's prompt
  if (content.length > 0 && content[0].type === 'text') {
    content[0].text = prompt;
  } else {
    // If there's no text item, add one at the beginning
    content.unshift({
      type: 'text',
      text: prompt
    });
  }
  
  return content;
}