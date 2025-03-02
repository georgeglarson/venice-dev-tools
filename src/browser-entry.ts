/**
 * Venice AI API SDK - Browser Entry Point
 * 
 * A browser-compatible entry point for the Venice AI API SDK.
 * This file excludes CLI functionality which depends on Node.js modules.
 * 
 * @packageDocumentation
 */

import { VeniceAI } from './client';
import * as Types from './types';
import * as Errors from './errors';
import { isBrowser, loadBrowserResource } from './browser';

// Export the main client
export { VeniceAI };

// Export types and errors for advanced usage
export { Types, Errors };

// Export browser-specific utilities
export const browser = {
  isBrowser,
  loadResource: loadBrowserResource
};

// Export default client as the main export
export default VeniceAI;