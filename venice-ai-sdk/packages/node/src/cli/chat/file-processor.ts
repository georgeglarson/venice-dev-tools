// File processing utilities for chat commands
import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import { ContentItem } from '@venice-dev-tools/core/src/types/multimodal';
import { processFile as originalProcessFile } from '../../utils';

/**
 * Options for processing files
 */
export interface FileProcessingOptions {
  pdfMode?: 'text' | 'image' | 'both';
}

/**
 * Process a list of files for attachment to a chat message
 * @param fileList - List of file paths to process
 * @param options - Processing options
 * @returns Array of processed content items
 */
export async function processFileList(
  fileList: string[],
  options: FileProcessingOptions = {}
): Promise<ContentItem[]> {
  try {
    // Process all files
    const processedFiles = await Promise.all(
      fileList.map(async (filePath: string) => {
        try {
          return await processFile(filePath, options);
        } catch (error) {
          console.error(
            chalk.red(`Error processing file ${filePath}: ${(error as Error).message}`)
          );
          throw error;
        }
      })
    );

    // Flatten the array if any processFile calls returned arrays
    return processedFiles.flat();
  } catch (error) {
    console.error(chalk.red(`Error processing files: ${(error as Error).message}`));
    throw error;
  }
}

/**
 * Process a single file for attachment to a chat message
 * @param filePath - Path to the file
 * @param options - Processing options
 * @returns Processed content item(s)
 */
export async function processFile(
  filePath: string,
  options: FileProcessingOptions = {}
): Promise<ContentItem | ContentItem[]> {
  // Validate file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Get file extension
  const ext = path.extname(filePath).toLowerCase();
  
  // Log file processing
  console.log(chalk.dim(`Processing ${ext} file: ${path.basename(filePath)}`));
  
  // Use the original processFile function from utils
  return originalProcessFile(filePath, options);
}

/**
 * Check if a file is an image based on its content type
 * @param file - Content item to check
 * @returns True if the file is an image
 */
export function isImageFile(file: ContentItem): boolean {
  return file.type === 'image_url';
}

/**
 * Extract image content items from an array of content items
 * @param contentItems - Array of content items
 * @returns Array of image content items
 */
export function extractImageItems(contentItems: ContentItem[]): ContentItem[] {
  return contentItems.filter(isImageFile);
}