#!/usr/bin/env node

/**
 * Example script for running the CLI directly
 * 
 * This script demonstrates how to run the CLI directly using Node.js
 * without using the 'venice' command.
 */

const path = require('path');
const { spawn } = require('child_process');

// Path to the CLI script
const cliPath = path.resolve(__dirname, '../../src/cli.ts');

// Set your API key
process.env.VENICE_API_KEY = process.env.VENICE_API_KEY || 'your-api-key-here';

/**
 * Run a CLI command
 * @param {string[]} args - Command line arguments
 * @returns {Promise<string>} - Command output
 */
function runCommand(args) {
  return new Promise((resolve, reject) => {
    console.log(`> npx ts-node ${cliPath} ${args.join(' ')}`);
    
    const child = spawn('npx', ['ts-node', cliPath, ...args], {
      env: process.env,
      stdio: ['inherit', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      process.stdout.write(chunk);
    });
    
    child.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      process.stderr.write(chunk);
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with exit code ${code}\n${stderr}`));
      }
    });
  });
}

async function main() {
  try {
    // Example 1: Show help for process-file command
    console.log('\nExample 1: Show help for process-file command');
    console.log('===========================================');
    await runCommand(['process-file', '--help']);
    
    // Example 2: Show help for chat command (should include --attach option)
    console.log('\nExample 2: Show help for chat command');
    console.log('===================================');
    await runCommand(['chat', '--help']);
    
    // Example 3: Process a file (uncomment to run with your API key)
    /*
    console.log('\nExample 3: Process a file');
    console.log('=======================');
    const filePath = process.argv[2] || path.resolve(__dirname, '../../test/sample.pdf');
    await runCommand(['process-file', filePath, '-p', 'Analyze this file and provide a detailed summary']);
    */
    
    // Example 4: Chat with attached file (uncomment to run with your API key)
    /*
    console.log('\nExample 4: Chat with attached file');
    console.log('===============================');
    const filePath = process.argv[2] || path.resolve(__dirname, '../../test/sample.pdf');
    await runCommand(['chat', 'What is this file about?', '--attach', filePath]);
    */
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the examples
main().catch(console.error);