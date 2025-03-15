// Web-specific Venice AI client implementation
import { VeniceAI, VeniceClientConfig, GenerateImageResponse } from '@venice-dev-tools/core';

/**
 * Web implementation of the Venice AI client.
 * 
 * Extends the core VeniceAI client with web-specific functionality
 * such as browser storage and file handling.
 */
export class VeniceWeb extends VeniceAI {
  /**
   * Create a new Web Venice AI client.
   * 
   * @param config - Configuration options for the client.
   */
  constructor(config: VeniceClientConfig = {}) {
    // Try to load API key from localStorage if available in browser environment
    if (!config.apiKey && typeof localStorage !== 'undefined') {
      config.apiKey = localStorage.getItem('venice_api_key') || undefined;
    }
    
    super(config);
  }
  
  /**
   * Save the API key to local storage.
   * 
   * @param apiKey - The API key to save.
   * @param rememberMe - Whether to remember the API key (store in localStorage).
   */
  public saveApiKey(apiKey: string, rememberMe = true): void {
    // Set the API key in the client
    this.setApiKey(apiKey);
    
    // Save to localStorage if available and requested
    if (rememberMe && typeof localStorage !== 'undefined') {
      localStorage.setItem('venice_api_key', apiKey);
    } else if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('venice_api_key', apiKey);
    }
  }
  
  /**
   * Clear the stored API key.
   */
  public clearApiKey(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('venice_api_key');
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('venice_api_key');
    }
  }
  
  /**
   * Check if an API key is stored.
   * 
   * @returns Whether an API key is stored.
   */
  public hasStoredApiKey(): boolean {
    return (
      (typeof localStorage !== 'undefined' && localStorage.getItem('venice_api_key') !== null) ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('venice_api_key') !== null)
    );
  }
  
  /**
   * Generate an image and get it as a blob URL.
   * 
   * @param options - The image generation options.
   * @returns The image blob URL and generation response.
   */
  public async generateImageAsUrl(
    options: Parameters<VeniceAI['images']['generate']>[0]
  ): Promise<{ url: string; response: GenerateImageResponse }> {
    // Generate the image
    const response = await this.images.generate(options);
    
    // Convert the image to a blob URL
    if (response.data && response.data.url) {
      // If the response contains a URL, use it directly
      if (response.data.response_format === 'url') {
        return { url: response.data.url, response };
      }
      
      // If it's base64 data, convert it to a blob
      const base64Data = response.data.url;
      const blob = this.base64ToBlob(base64Data);
      const url = URL.createObjectURL(blob);
      
      return { url, response };
    }
    
    throw new Error('No images were generated');
  }
  
  /**
   * Convert a base64 string to a Blob.
   * 
   * @param base64Data - The base64 image data (can include or exclude data URI prefix).
   * @param mimeType - The MIME type of the image.
   * @returns The Blob object.
   */
  public base64ToBlob(base64Data: string, mimeType: string = 'image/png'): Blob {
    // Strip data URI prefix if present
    const base64 = base64Data.includes('base64,') 
      ? base64Data.split('base64,')[1] 
      : base64Data;
    
    // Convert base64 to array of bytes
    const byteString = atob(base64);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    
    // Create and return the blob
    return new Blob([uint8Array], { type: mimeType });
  }
  
  /**
   * Download a generated image.
   * 
   * @param base64Data - The base64 image data.
   * @param fileName - The name for the downloaded file.
   */
  public downloadImage(base64Data: string, fileName: string = 'venice-image.png'): void {
    // Convert to blob
    const blob = this.base64ToBlob(base64Data);
    
    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  /**
   * Read a local file as a base64 string.
   * 
   * @param file - The file to read.
   * @returns A promise resolving to the base64 string.
   */
  public async readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }
}

// Default export
export default VeniceWeb;