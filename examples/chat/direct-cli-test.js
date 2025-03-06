#!/usr/bin/env node

/**
 * Direct CLI Test
 * 
 * This script directly uses the commands object from the CLI module
 * to test the process-file command and the chat command with --attach option.
 */

// Import the commands object directly from the CLI module
// We need to use ts-node to run TypeScript files
const { execSync } = require('child_process');
const path = require('path');

// Use ts-node to run a script that imports the commands object
const getCommands = () => {
  const script = `
    const { commands } = require('${path.resolve(__dirname, '../../src/cli.ts')}');
    console.log(JSON.stringify(Object.keys(commands)));
  `;
  
  const result = execSync(`npx ts-node -e "${script.replace(/"/g, '\\"')}"`).toString().trim();
  return JSON.parse(result);
};

// Check if the commands we need are available
const availableCommands = getCommands();
console.log('Available commands:', availableCommands);

if (!availableCommands.includes('processFile') || !availableCommands.includes('chat')) {
  console.error('Error: Required commands not available');
  process.exit(1);
}

// Set your API key
process.env.VENICE_API_KEY = process.env.VENICE_API_KEY || 'your-api-key-here';

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];
const filePath = args[1];
const prompt = args[2] || 'Analyze this file and provide a detailed summary';

// Display usage if no command is provided
if (!command || !filePath) {
  console.log('Usage: node direct-cli-test.js <command> <file-path> [prompt]');
  console.log('');
  console.log('Commands:');
  console.log('  process-file - Process a file using the universal file upload functionality');
  console.log('  chat-attach  - Chat with an attached file');
  console.log('');
  console.log('Examples:');
  console.log('  node direct-cli-test.js process-file test/sample.pdf "Extract key information"');
  console.log('  node direct-cli-test.js chat-attach test/sample.pdf "What is this file about?"');
  process.exit(0);
}

// Main function
function main() {
  try {
    if (command === 'process-file') {
      console.log(`Processing file: ${filePath}`);
      console.log(`Prompt: ${prompt}`);
      
      const script = `
        const { commands } = require('${path.resolve(__dirname, '../../src/cli.ts')}');
        
        async function run() {
          try {
            const result = await commands.processFile('${filePath.replace(/'/g, "\\'")}', {
              model: 'qwen-2.5-vl',
              prompt: '${prompt.replace(/'/g, "\\'")}'
            });
            console.log(JSON.stringify(result));
          } catch (error) {
            console.error('Error:', error);
            process.exit(1);
          }
        }
        
        run().catch(console.error);
      `;
      
      const result = execSync(`npx ts-node -e "${script.replace(/"/g, '\\"')}"`, {
        env: process.env
      }).toString().trim();
      
      console.log('\nResult:');
      try {
        console.log(JSON.parse(result));
      } catch (e) {
        console.log(result);
      }
      
    } else if (command === 'chat-attach') {
      console.log(`Chat with attached file: ${filePath}`);
      console.log(`Prompt: ${prompt}`);
      
      const script = `
        const { commands } = require('${path.resolve(__dirname, '../../src/cli.ts')}');
        
        async function run() {
          try {
            const result = await commands.chat('${prompt.replace(/'/g, "\\'")}', {
              model: 'qwen-2.5-vl',
              attach: '${filePath.replace(/'/g, "\\'")}'
            });
            console.log(JSON.stringify(result));
          } catch (error) {
            console.error('Error:', error);
            process.exit(1);
          }
        }
        
        run().catch(console.error);
      `;
      
      const result = execSync(`npx ts-node -e "${script.replace(/"/g, '\\"')}"`, {
        env: process.env
      }).toString().trim();
      
      console.log('\nResult:');
      try {
        console.log(JSON.parse(result));
      } catch (e) {
        console.log(result);
      }
      
    } else {
      console.error(`Unknown command: ${command}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();