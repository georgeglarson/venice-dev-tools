/**
 * Types for the file upload functionality
 */

import { VeniceAI } from '../../index';

/**
 * Options for processing a file
 */
export interface FileProcessingOptions {
  /**
   * Custom prompt to use instead of the default
   */
  customPrompt?: string;
  
  /**
   * Model to use (defaults to qwen-2.5-vl)
   */
  model?: string;
  
  /**
   * Maximum file size in MB (defaults to 4.5)
   */
  maxSizeMB?: number;
}

/**
 * Result of processing a file
 */
export interface FileProcessingResult {
  /**
   * The content of the API response
   */
  content: string;
}

/**
 * Options for attaching a file to a message
 */
export interface FileAttachmentOptions {
  /**
   * Path to the file to attach
   */
  filePath: string;
  
  /**
   * Venice AI client instance
   */
  client?: VeniceAI;
  
  /**
   * Processing options
   */
  options?: FileProcessingOptions;
}

/**
 * Information about a processed file
 */
export interface ProcessedFileInfo {
  /**
   * The content to be added to the message
   */
  content: any[];
  
  /**
   * The file type
   */
  fileType: string;
  
  /**
   * The file size in MB
   */
  fileSizeMB: number;
}