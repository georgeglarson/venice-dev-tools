/**
 * Utility for processing files for multimodal messages
 */
import * as fs from 'fs';
import * as path from 'path';
import { ContentItem } from '@venice-dev-tools/core/src/types/multimodal';
// Import pdf-parse lazily to avoid loading it when not needed
// import pdfParse from 'pdf-parse';

/**
 * Process a file for inclusion in a multimodal message
 * 
 * @param filePath - Path to the file
 * @param options - Options for processing the file
 * @returns A content item or content items representing the file
 */
export async function processFile(filePath: string, options: { pdfMode?: 'image' | 'text' | 'both' } = {}): Promise<ContentItem | ContentItem[]> {
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Check file size (4.5MB limit)
  const stats = fs.statSync(filePath);
  const MAX_SIZE = 4.5 * 1024 * 1024; // 4.5MB
  if (stats.size > MAX_SIZE) {
    throw new Error(`File exceeds maximum size of 4.5MB: ${filePath}`);
  }

  // Determine file type based on extension
  const ext = path.extname(filePath).toLowerCase();
  
  // Handle different file types
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
    // Handle image files
    return processImageFile(filePath, getMimeType(ext));
  } else if (['.txt', '.md', '.html', '.htm'].includes(ext)) {
    // Handle text files
    return processTextFile(filePath, getMimeType(ext));
  } else if (ext === '.pdf') {
    const pdfMode = options.pdfMode || 'image';
    
    if (pdfMode === 'image') {
      // Current behavior
      return processImageFile(filePath, 'application/pdf');
    } else if (pdfMode === 'text') {
      // Extract and return text only
      const text = await extractTextFromPdf(filePath);
      return {
        type: 'text',
        text: text
      };
    } else if (pdfMode === 'both') {
      // Extract both text and image
      const text = await extractTextFromPdf(filePath);
      const image = processImageFile(filePath, 'application/pdf');
      return [
        {
          type: 'text',
          text: `PDF Text Content:\n${text}`
        },
        image
      ];
    }
  } else {
    // For unknown types, default to binary/image handling
    return processImageFile(filePath, 'application/octet-stream');
  }

  // Explicit return statement to ensure all code paths return a value
  return processImageFile(filePath, 'application/octet-stream');
}

/**
 * Process an image file
 */
function processImageFile(filePath: string, mimeType: string): ContentItem {
  const fileData = fs.readFileSync(filePath);
  const base64Data = fileData.toString('base64');
  
  return {
    type: 'image_url',
    image_url: {
      url: `data:${mimeType};base64,${base64Data}`
    }
  };
}

/**
 * Process a text file
 */
function processTextFile(filePath: string, mimeType: string): ContentItem {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  return {
    type: 'text',
    text: content
  };
}

/**
 * Get MIME type from file extension
 */
function getMimeType(ext: string): string {
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.html': 'text/html',
    '.htm': 'text/html'
  };
  
  return mimeMap[ext] || 'application/octet-stream';
}

/**
 * Extract text from a PDF file
 */
async function extractTextFromPdf(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  
  try {
    // Dynamically import pdf-parse only when needed
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(dataBuffer);
    return data.text || 'No text content found in PDF';
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error extracting text from PDF: ${error.message}`);
    } else {
      console.error('Error extracting text from PDF: Unknown error');
    }
    return 'Error extracting text from PDF';
  }
}