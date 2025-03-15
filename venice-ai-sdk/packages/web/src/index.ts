// Web implementation index file
import { VeniceWeb } from './venice-web';
import { VeniceAI, VeniceClient } from '@venice-ai/core';

// Re-export everything from core
export * from '@venice-ai/core';

// Export Web-specific implementations
export { VeniceWeb };

// Default export for convenience
export default VeniceWeb;