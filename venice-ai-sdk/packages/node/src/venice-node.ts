// Node.js specific Venice AI client implementation
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { VeniceAI, VeniceClientConfig, GenerateImageResponse } from '@venice-dev-tools/core';

/**
 * Node.js specific implementation of the Venice AI client.
 * 
 * Extends the core VeniceAI client with Node-specific functionality
 * such as file handling and configuration loading.
 */
export class VeniceNode extends VeniceAI {
  /**
   * Create a new Node.js Venice AI client.
   * 
   * @param config - Configuration options for the client.
   */
  constructor(config: VeniceClientConfig = {}) {
    // If no API key is provided, try to load it from environment variables
    if (!config.apiKey) {
      config.apiKey = process.env.VENICE_API_KEY;
    }
    
    super(config);
  }
  
  /**
   * Get the current API key.
   * 
   * @returns The current API key.
   * @throws Error with a user-friendly message if no API key is set.
   */
  public getApiKey(): string {
    const apiKey = super.getApiKey();
    if (!apiKey) {
      // Provide a more user-friendly error message for CLI users
      const error = new Error(
        'No API key found. Please provide an API key using one of these methods:\n' +
        '1. Use the --api-key or -k option: venice -k YOUR_API_KEY ...\n' +
        '2. Set the VENICE_API_KEY environment variable\n' +
        '3. Save your API key using: venice set-key YOUR_API_KEY'
      );
      error.name = 'VeniceAuthError';
      throw error;
    }
    return apiKey;
  }
  
  /**
   * Load configuration from a JSON file.
   * 
   * @param filePath - Path to the configuration file.
   * @returns This client instance.
   */
  public loadConfigFromFile(filePath: string): this {
    try {
      const configData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (configData.apiKey) {
        this.setApiKey(configData.apiKey);
      }
      
      return this;
    } catch (error) {
      throw new Error(`Failed to load configuration: ${(error as Error).message}`);
    }
  }
  
  /**
   * Save an image from a base64 string to a file.
   * 
   * @param base64Data - The base64 image data (can include or exclude data URI prefix).
   * @param outputPath - Path where the image should be saved.
   * @returns The absolute path to the saved file.
   */
  public saveImageToFile(base64Data: string, outputPath: string): string {
    // Strip data URI prefix if present
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    
    // Create the directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the image to file
    fs.writeFileSync(outputPath, Buffer.from(base64Image, 'base64'));
    
    return path.resolve(outputPath);
  }
  
  /**
   * Generate an image and save it directly to a file.
   * 
   * @param options - The image generation options with additional save options.
   * @param outputPath - Path where the image should be saved.
   * @returns The image generation response and the saved file path.
   */
  public async generateImageToFile(
    options: Parameters<VeniceAI['images']['generate']>[0],
    outputPath: string
  ): Promise<{ response: GenerateImageResponse; filePath: string }> {
    // Generate the image
    const response = await this.images.generate(options);
    
    // Save the image to the file
    if (response.data && response.data.url) {
      // If it's a URL or base64 data, save it to file
      const filePath = this.saveImageToFile(response.data.url, outputPath);
      return { response, filePath };
    }
    
    throw new Error('No images were generated');
  }
  
  /**
   * Load an image file as a base64 string.
   * 
   * @param filePath - Path to the image file.
   * @param includeDataUri - Whether to include the data URI prefix.
   * @returns The base64 encoded image string.
   */
  public loadImageAsBase64(filePath: string, includeDataUri = false): string {
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Convert to base64
    const base64Data = fileBuffer.toString('base64');
    
    if (includeDataUri) {
      // Determine MIME type based on file extension
      const extension = path.extname(filePath).toLowerCase();
      let mimeType = 'image/png';  // Default to PNG
      
      if (extension === '.jpg' || extension === '.jpeg') {
        mimeType = 'image/jpeg';
      } else if (extension === '.webp') {
        mimeType = 'image/webp';
      } else if (extension === '.gif') {
        mimeType = 'image/gif';
      }
      
      return `data:${mimeType};base64,${base64Data}`;
    }
    
    return base64Data;
  }
  
  /**
   * Read an image file as a Buffer.
   * 
   * @param filePath - Path to the image file.
   * @returns The image buffer.
   */
  public readImageFile(filePath: string): Buffer {
    return fs.readFileSync(filePath);
  }
  
  /**
   * Create a temporary file with a unique name.
   * 
   * @param extension - File extension (without the dot).
   * @param prefix - Optional file name prefix.
   * @returns The path to the temporary file.
   */
  public createTempFilePath(extension: string = 'png', prefix: string = 'venice-'): string {
    const tempDir = os.tmpdir();
    const fileName = `${prefix}${crypto.randomBytes(16).toString('hex')}.${extension}`;
    return path.join(tempDir, fileName);
  }
  
  /**
   * Save the API key to a configuration file.
   * 
   * @param apiKey - The API key to save.
   * @param filePath - Path to the configuration file.
   */
  public saveApiKey(apiKey: string, filePath: string): void {
    // Make sure the directory exists
    const configDir = path.dirname(filePath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Read existing config if it exists
    let config = {};
    if (fs.existsSync(filePath)) {
      try {
        config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (error) {
        // If the file exists but is not valid JSON, we'll just overwrite it
      }
    }
    
    // Update the API key
    config = { ...config, apiKey };
    
    // Write the configuration
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
  }
}

// Default export
export default VeniceNode;