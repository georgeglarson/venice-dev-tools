// index.ts
// Main SDK export file

// Export core client
export { VeniceAI } from './venice-ai';
export { VeniceClient } from './client';

// Export managers
export { ConfigManager } from './config';
export { EventManager } from './events';

// Export types
export * from './types';

// Export errors
export * from './errors';

// Export HTTP utilities
export * from './http';

// Export API utilities and endpoints
export * from './api';

// Default export for convenience
import { VeniceAI } from './venice-ai';
export default VeniceAI;