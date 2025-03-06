#!/usr/bin/env node

/**
 * Example script for using the CLI wrapper
 * 
 * This script demonstrates how to use the CLI wrapper for testing
 * without using the 'venice' command.
 * 
 * Note: This requires building the project first with 'npm run build'
 * to generate the compiled module that the CLI wrapper uses.
 */

const path = require('path');
const CLIWrapper = require('../../test/utils/cli-wrapper');

// Set your API key
process.env.VENICE_API_KEY = process.env.VENICE_API_KEY || 'your-api-key-here';

async function main() {
  try {
    console.log('Using CLI wrapper for testing...');
    console.log('===============================');
    
    // Create a CLI wrapper instance
    const cli = new CLIWrapper({
      apiKey: process.env.VENICE_API_KEY
    });
    
    // Example 1: Process a file using the processFile command
    console.log('\nExample 1: Process a file');
    console.log('=========================');
    
    const filePath = process.argv[2] || path.resolve(__dirname, '../../test/sample.pdf');
    console.log(`Processing file: ${filePath}`);
    
    try {
      const result1 = await cli.commands.processFile(filePath, {
        model: 'qwen-2.5-vl',
        prompt: 'Analyze this file and provide a detailed summary'
      });
      
      console.log('\nResult:');
      console.log(result1);
    } catch (error) {
      console.error('Error processing file:', error.message);
      console.log('Note: You may need to build the project first with "npm run build"');
    }
    
    // Example 2: Chat with an attached file
    console.log('\n\nExample 2: Chat with an attached file');
    console.log('===================================');
    
    console.log(`Attaching file: ${filePath}`);
    
    try {
      const result2 = await cli.chat.completions.create({
        model: 'qwen-2.5-vl',
        messages: [
          { role: 'user', content: 'What is this file about?' }
        ],
        attach: filePath
      });
      
      console.log('\nResult:');
      console.log(result2);
    } catch (error) {
      console.error('Error chatting with attached file:', error.message);
      console.log('Note: You may need to build the project first with "npm run build"');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('Note: You may need to build the project first with "npm run build"');
  }
}

// Run the examples
main().catch(console.error);