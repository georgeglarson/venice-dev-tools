/**
 * Browser-specific implementations and utilities
 *
 * This file provides browser-compatible alternatives to Node.js modules
 * that are commonly used in the SDK.
 */

// Environment detection
export const isBrowser = typeof window !== 'undefined';

// Browser-compatible file system operations
export const fs = {
  /**
   * Read a file using fetch API (browser-compatible alternative to fs.readFile)
   * @param url URL of the file to read
   * @returns Promise that resolves with the file contents
   */
  readFile: async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to read file: ${response.statusText}`);
    }
    return response.text();
  },
  
  /**
   * Write data to browser storage (browser-compatible alternative to fs.writeFile)
   * @param key Storage key
   * @param data Data to write
   */
  writeFile: (key: string, data: string): void => {
    try {
      localStorage.setItem(key, data);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      throw error;
    }
  }
};

// Browser-compatible path operations
export const path = {
  /**
   * Join path segments (browser-compatible alternative to path.join)
   * @param segments Path segments to join
   * @returns Joined path
   */
  join: (...segments: string[]): string => {
    return segments.join('/').replace(/\/+/g, '/');
  },
  
  /**
   * Get the base name of a path (browser-compatible alternative to path.basename)
   * @param path Path to get the base name from
   * @returns Base name
   */
  basename: (path: string): string => {
    return path.split('/').pop() || '';
  },
  
  /**
   * Get the directory name of a path (browser-compatible alternative to path.dirname)
   * @param path Path to get the directory name from
   * @returns Directory name
   */
  dirname: (path: string): string => {
    return path.split('/').slice(0, -1).join('/') || '.';
  }
};

// Browser-compatible resource loading
export function loadBrowserResource(url: string): Promise<string> {
  return fetch(url).then(response => {
    if (!response.ok) {
      throw new Error(`Failed to load resource: ${response.statusText}`);
    }
    return response.text();
  });
}

// Browser-compatible event emitter (simplified)
export class EventEmitter {
  private listeners: Record<string, Array<(...args: any[]) => void>> = {};

  on(event: string, listener: (...args: any[]) => void): this {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
    return this;
  }

  off(event: string, listener: (...args: any[]) => void): this {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(...args));
      return true;
    }
    return false;
  }
}

// Browser-compatible process information
export const process = {
  env: {
    NODE_ENV: 'production',
    // Add any other environment variables needed
  }
};