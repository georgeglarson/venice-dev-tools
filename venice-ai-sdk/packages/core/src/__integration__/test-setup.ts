/**
 * Test setup file for integration tests
 * Loads environment variables from .env file
 */

import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../../../../.env');
console.log('Loading .env from:', envPath);
config({ path: envPath });

// Log that environment has been loaded (for debugging)
if (process.env.VENICE_API_KEY) {
  console.log('✓ VENICE_API_KEY loaded from environment');
} else {
  console.warn('⚠ VENICE_API_KEY not found in environment');
}

if (process.env.VENICE_ADMIN_API_KEY) {
  console.log('✓ VENICE_ADMIN_API_KEY loaded from environment');
} else {
  console.warn('⚠ VENICE_ADMIN_API_KEY not found in environment');
}