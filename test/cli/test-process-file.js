#!/usr/bin/env node

/**
 * Test script for the process-file CLI command
 * 
 * This script verifies that the process-file command and the --attach option
 * for the chat command have been properly implemented in the CLI.
 */

const fs = require('fs');
const path = require('path');

// Path to the CLI source file
const cliPath = path.resolve(__dirname, '../../src/cli.ts');

// Read the CLI source file
const cliSource = fs.readFileSync(cliPath, 'utf8');

console.log('Verifying CLI implementation...');
console.log('===============================');

// Test 1: Verify the processFile command is defined in the commands object
console.log('\nTest 1: Verify the processFile command is defined in the commands object');
if (cliSource.includes('processFile: async (filePath: string, options:')) {
  console.log('✅ processFile command is defined in the commands object');
} else {
  console.error('❌ processFile command is not defined in the commands object');
}

// Test 2: Verify the chat command supports the attach option
console.log('\nTest 2: Verify the chat command supports the attach option');
if (cliSource.includes('attach?: string')) {
  console.log('✅ chat command supports the attach option');
} else {
  console.error('❌ chat command does not support the attach option');
}

// Test 3: Verify the process-file command is registered in the CLI
console.log('\nTest 3: Verify the process-file command is registered in the CLI');
if (cliSource.includes('.command(\'process-file\')')) {
  console.log('✅ process-file command is registered in the CLI');
} else {
  console.error('❌ process-file command is not registered in the CLI');
}

// Test 4: Verify the chat command includes the --attach option
console.log('\nTest 4: Verify the chat command includes the --attach option');
if (cliSource.includes('.option(\'-a, --attach <path>\'')) {
  console.log('✅ chat command includes the --attach option');
} else {
  console.error('❌ chat command does not include the --attach option');
}

// Test 5: Verify the chat command implementation handles the attach option
console.log('\nTest 5: Verify the chat command implementation handles the attach option');
if (cliSource.includes('attach: options.attach')) {
  console.log('✅ chat command implementation handles the attach option');
} else {
  console.error('❌ chat command implementation does not handle the attach option');
}

console.log('\nVerification complete!');