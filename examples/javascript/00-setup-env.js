#!/usr/bin/env node

/**
 * Environment Setup - Load API Configuration
 * 
 * Scans for .env files and displays loaded configuration.
 * This helps verify your environment is set up correctly before running examples.
 * 
 * Unlike the shell version, this is designed to be run (not sourced)
 * and serves as a validation/diagnostic tool.
 * 
 * It searches for .env files in:
 * 1. Current directory (examples/javascript/.env)
 * 2. Examples directory (examples/.env)
 * 3. Project root (../../.env)
 * 
 * What it does:
 * - Locates .env file with VENICE_API_KEY
 * - Validates the API key is set
 * - Shows partial key for confirmation
 * - Provides setup guidance if not found
 * 
 * Prerequisites:
 * - A .env file with VENICE_API_KEY=your-key-here
 * 
 * Run with: node 00-setup-env.js
 */

const fs = require('fs');
const path = require('path');

/**
 * Load environment variables from a file.
 * 
 * @param {string} envPath - Path to .env file
 * @returns {boolean} True if file was loaded
 */
function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return false;
  }
  
  console.log(`📄 Found .env file: ${envPath}`);
  
  const content = fs.readFileSync(envPath, 'utf-8');
  let loadedCount = 0;
  
  content.split('\n').forEach(line => {
    line = line.trim();
    
    // Skip comments and empty lines
    if (!line || line.startsWith('#')) return;
    
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Remove surrounding quotes
      value = value.replace(/^["'](.*)["']$/, '$1');
      
      // Set or override
      process.env[key] = value;
      console.log(`   ✓ Loaded: ${key}`);
      loadedCount++;
    }
  });
  
  if (loadedCount === 0) {
    console.log('   ⚠️  No variables found in file');
  }
  
  return true;
}

/**
 * Main setup function.
 */
function main() {
  console.log('🔧 Venice AI Environment Setup (JavaScript)\n');
  
  // Search paths for .env files (in order of priority)
  const envPaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', '..', '.env'),
  ];
  
  let found = false;
  
  for (const envPath of envPaths) {
    if (loadEnvFile(envPath)) {
      found = true;
      break;
    }
  }
  
  console.log('');
  
  if (!found) {
    console.log('⚠️  No .env file found\n');
    console.log('   Searched locations:');
    envPaths.forEach(p => console.log(`   • ${p}`));
    console.log('');
    console.log('💡 Create a .env file with:');
    console.log(`   echo 'VENICE_API_KEY=your-api-key-here' > ${path.join(__dirname, '.env')}`);
    console.log('');
    console.log('   Or copy the example:');
    console.log(`   cp ${path.join(__dirname, '.env.example')} ${path.join(__dirname, '.env')}`);
    console.log('   # Then edit .env and add your API key\n');
    process.exit(1);
  }
  
  // Validate VENICE_API_KEY
  if (!process.env.VENICE_API_KEY) {
    console.log('❌ VENICE_API_KEY not found in .env file\n');
    console.log('💡 Add to your .env file:');
    console.log('   VENICE_API_KEY=your-api-key-here\n');
    process.exit(1);
  }
  
  // Show partial key for confirmation
  const apiKey = process.env.VENICE_API_KEY;
  const partialKey = apiKey.substring(0, 7) + '...';
  
  console.log('✅ Environment configured successfully!\n');
  console.log(`   🔑 API Key: ${partialKey}`);
  
  // Show other loaded variables
  const otherVars = Object.keys(process.env).filter(key => 
    key.startsWith('VENICE_') && key !== 'VENICE_API_KEY'
  );
  
  if (otherVars.length > 0) {
    console.log('   📋 Other Venice variables:');
    otherVars.forEach(key => {
      console.log(`      • ${key}: ${process.env[key]}`);
    });
  }
  
  console.log('');
  console.log('💡 You can now run examples:');
  console.log('   node 01-hello-world.js');
  console.log('   node 02-streaming-chat.js');
  console.log('   node 11-vision-multimodal.js image.jpg\n');
  
  console.log('💡 Tip: All examples automatically load .env files');
  console.log('   You only need to run this script to verify your setup\n');
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { loadEnvFile };
