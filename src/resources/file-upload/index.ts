/**
 * Universal file upload functionality
 * 
 * This module provides a unified approach to handling file uploads of any type:
 * - Text files: Included directly in the prompt
 * - Images: Converted to base64
 * - HTML: Processed as document content
 * 
 * All files must be under the 4.5MB API limit.
 */

import { VeniceAI } from '../../index';
import { 
  FileProcessingOptions, 
  FileProcessingResult,
  FileAttachmentOptions,
  ProcessedFileInfo
} from './types';
import { 
  processFile, 
  prepareFileForUpload, 
  resizeImageIfNeeded,
  attachFileToMessage
} from './processor';

/**
 * Process a file and send it to the API
 * 
 * @param filePath - Path to the file
 * @param client - Venice AI client instance (optional)
 * @param options - Processing options
 * @returns API response content
 */
export async function processFileWithClient(
  filePath: string,
  client: VeniceAI,
  options: FileProcessingOptions = {}
): Promise<string> {
  return processFile(filePath, client, options);
}

/**
 * Prepare a file for upload
 * 
 * @param filePath - Path to the file
 * @param options - Processing options
 * @returns Information about the processed file
 */
export async function prepareFile(
  filePath: string,
  options: FileProcessingOptions = {}
): Promise<ProcessedFileInfo> {
  return prepareFileForUpload(filePath, options);
}

/**
 * Resize an image if it's too large
 * 
 * @param imagePath - Path to the image file
 * @param maxSizeMB - Maximum size in MB
 * @returns Path to the resized image or original if small enough
 */
export async function resizeImage(
  imagePath: string,
  maxSizeMB: number = 4
): Promise<string> {
  return resizeImageIfNeeded(imagePath, maxSizeMB);
}

/**
 * Attach a file to a message
 * 
 * @param options - File attachment options
 * @returns Content array for the message
 */
export async function attachFile(options: {
  filePath: string;
  prompt: string;
  options?: FileProcessingOptions;
}): Promise<any[]> {
  return attachFileToMessage(options);
}

// Export types
export {
  FileProcessingOptions,
  FileProcessingResult,
  FileAttachmentOptions,
  ProcessedFileInfo
};

// Export all functions directly
export {
  processFile,
  prepareFileForUpload,
  resizeImageIfNeeded,
  attachFileToMessage
};