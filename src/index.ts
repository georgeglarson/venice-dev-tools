/**
 * Venice AI API SDK
 * 
 * A comprehensive SDK for the Venice AI API with educational examples for every endpoint.
 * This SDK follows APL (API Programming Library) principles to provide a simple, intuitive
 * interface for interacting with the Venice AI API.
 * 
 * @packageDocumentation
 */

import { VeniceAI } from './client';
import * as Types from './types';
import * as Errors from './errors';

// Export the main client
export { VeniceAI };

// Export types and errors for advanced usage
export { Types, Errors };

// Export default client as the main export
export default VeniceAI;