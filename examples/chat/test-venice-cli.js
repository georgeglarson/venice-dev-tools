#!/usr/bin/env node

/**
 * Test script for using the Venice CLI directly
 * 
 * This script allows testing the CLI commands without using the 'venice' command
 */

const path = require('path');
const { execSync } = require('child_process');

// Set your API key here or export it before running this script
process.env.VENICE_API_KEY = process.env.VENICE_API_KEY || 'your-api-key-here';

// Build the project if needed
try {
  console.log('Building the project...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build complete!');
} catch (error) {
  console.error('Error building the project:', error.message);
  process.exit(1);
}

// Get the command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node test-venice-cli.js <command> [options]');
  console.log('');
  console.log('Examples:');
  console.log('  node test-venice-cli.js process-file test/sample.pdf');
  console.log('  node test-venice-cli.js chat "Analyze this file for me" --attach test/sample.pdf');
  process.exit(0);
}

// Path to the compiled CLI
const cliPath = path.resolve(__dirname, '../../dist/cli.js');

// Run the CLI command
try {
  console.log(`Running command: node ${cliPath} ${args.join(' ')}`);
  execSync(`node ${cliPath} ${args.join(' ')}`, { 
    stdio: 'inherit',
    env: process.env
  });
} catch (error) {
  console.error('Error running command:', error.message);
  process.exit(1);
}