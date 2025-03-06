#!/usr/bin/env node

/**
 * Example script for using the process-file functionality programmatically
 * 
 * This script demonstrates how to use the universal file upload functionality
 * without using the 'venice' command.
 */

const path = require('path');
const { commands } = require('../../src/cli');

// Set your API key
process.env.VENICE_API_KEY = process.env.VENICE_API_KEY || 'your-api-key-here';

// Enable debug mode if needed
// process.env.DEBUG = 'true';

async function main() {
  try {
    // Example 1: Process a file using the processFile command
    console.log('Example 1: Process a file');
    console.log('=========================');
    
    const filePath = process.argv[2] || path.resolve(__dirname, '../../test/sample.pdf');
    console.log(`Processing file: ${filePath}`);
    
    const result1 = await commands.processFile(filePath, {
      model: 'qwen-2.5-vl',
      prompt: 'Analyze this file and provide a detailed summary'
    });
    
    console.log('\nResult:');
    console.log(result1);
    
    // Example 2: Chat with an attached file
    console.log('\n\nExample 2: Chat with an attached file');
    console.log('===================================');
    
    console.log(`Attaching file: ${filePath}`);
    
    const result2 = await commands.chat('What is this file about?', {
      model: 'qwen-2.5-vl',
      attach: filePath
    });
    
    console.log('\nResult:');
    console.log(result2);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the examples
main().catch(console.error);