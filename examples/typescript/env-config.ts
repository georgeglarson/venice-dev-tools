// Shared environment configuration for TypeScript examples
// This file loads .env from examples/ directory

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from examples directory (one level up from typescript/)
config({ path: resolve(__dirname, '../.env') });

/**
 * Get required environment variable or exit with helpful message
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ Error: ${key} environment variable not set`);
    console.error('📝 Get your API key at: https://venice.ai/settings/api');
    console.error('💡 Option 1: Create examples/.env file (recommended)');
    console.error('   cp examples/.env.example examples/.env');
    console.error('   # Then edit examples/.env with your API key');
    console.error('💡 Option 2: Set it in your shell');
    console.error(`   export ${key}="your-value-here"`);
    process.exit(1);
  }
  return value;
}

/**
 * Get optional environment variable with default
 */
export function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}
