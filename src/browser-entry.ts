/**
 * Venice AI API SDK - Browser Entry Point
 *
 * A browser-compatible entry point for the Venice AI API SDK.
 * This file excludes CLI functionality which depends on Node.js modules
 * and provides browser-compatible alternatives.
 *
 * @packageDocumentation
 */

import { VeniceAI } from './client';
import * as Types from './types';
import * as Errors from './errors';
import {
  isBrowser,
  loadBrowserResource,
  fs,
  path,
  EventEmitter,
  process
} from './browser';

// Export the main client
export { VeniceAI };

// Export types and errors for advanced usage
export { Types, Errors };

// Export browser-compatible alternatives to Node.js modules
export const browser = {
  // Environment detection
  isBrowser,
  
  // Resource loading
  loadResource: loadBrowserResource,
  
  // File system operations (browser-compatible)
  fs,
  
  // Path operations (browser-compatible)
  path,
  
  // Event emitter (browser-compatible)
  EventEmitter,
  
  // Process information (browser-compatible)
  process
};

/**
 * Create a new Venice AI client instance
 * @param config Client configuration
 * @returns Venice AI client instance
 */
export function createClient(config: Partial<Types.ClientConfig>) {
  return new VeniceAI(config);
}

// Export default client as the main export
export default VeniceAI;