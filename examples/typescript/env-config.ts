// Shared environment configuration for TypeScript examples
// This file loads .env from examples/ directory

import { config } from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const moduleDir =
  typeof __dirname !== 'undefined'
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

const nodeEnv = process.env.NODE_ENV?.trim();
const envFilenames = Array.from(
  new Set(
    [
      '.env.local',
      nodeEnv ? `.env.${nodeEnv}` : undefined,
      '.env',
    ].filter(Boolean) as string[]
  )
);

const envSearchDirs = Array.from(
  new Set([
    moduleDir,
    resolve(moduleDir, '..'),
    resolve(moduleDir, '../..'),
    process.cwd(),
  ])
);

const envCandidates: string[] = [];
const loadedEnvFiles: string[] = [];

const customEnvFile = process.env.VENICE_ENV_FILE || process.env.DOTENV_CONFIG_PATH;
if (customEnvFile) {
  envCandidates.push(resolve(process.cwd(), customEnvFile));
}

envSearchDirs.forEach((dir) => {
  envFilenames.forEach((filename) => {
    envCandidates.push(resolve(dir, filename));
  });
});

const uniqueEnvCandidates = envCandidates.filter(
  (candidate, index) => envCandidates.indexOf(candidate) === index
);

uniqueEnvCandidates.forEach((envPath) => {
  if (existsSync(envPath)) {
    config({ path: envPath, override: false });
    loadedEnvFiles.push(envPath);
  }
});

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
    if (loadedEnvFiles.length > 0) {
      console.error('🔍 Loaded environment files:');
      loadedEnvFiles.forEach((file) => console.error(`   • ${file}`));
    } else {
      console.error('🔍 No .env files found in any of these locations:');
      uniqueEnvCandidates.forEach((file) => console.error(`   • ${file}`));
    }
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
