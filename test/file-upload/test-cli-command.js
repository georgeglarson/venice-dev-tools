/**
 * Test script for the process-file CLI command
 * 
 * This script verifies that the process-file command has been properly
 * implemented in the CLI and can be executed.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the CLI script
const cliPath = path.resolve(__dirname, '../../src/cli.ts');

// Create a temporary test file
function createTestFile(content, extension) {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const filePath = path.join(tempDir, `test-file${extension}`);
  fs.writeFileSync(filePath, content);
  return filePath;
}

// Clean up temporary files
function cleanup(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  const tempDir = path.dirname(filePath);
  if (fs.existsSync(tempDir) && fs.readdirSync(tempDir).length === 0) {
    fs.rmdirSync(tempDir);
  }
}

// Run a CLI command
function runCommand(args) {
  return new Promise((resolve, reject) => {
    console.log(`Running command: npx ts-node ${cliPath} ${args.join(' ')}`);
    
    let stdout = '';
    let stderr = '';
    
    const child = spawn('npx', ['ts-node', cliPath, ...args], {
      env: { ...process.env, VENICE_API_KEY: 'mock-api-key' }
    });
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with exit code ${code}\nStderr: ${stderr}`));
      }
    });
  });
}

// Test the process-file command
async function testProcessFileCommand() {
  console.log('\nTest: Verify the process-file command can be executed');
  
  // Create a test file
  const content = 'This is a test file for the process-file command.';
  const filePath = createTestFile(content, '.txt');
  
  try {
    console.log(`Created test file at: ${filePath}`);
    
    // Run the command with --help to avoid actually processing the file
    // (which would require a real API key)
    const result = await runCommand(['process-file', '--help']);
    
    console.log('Command output:');
    console.log(result.stdout);
    
    if (result.stdout.includes('Process a file using the universal file upload functionality')) {
      console.log('✅ process-file command executed successfully');
      return true;
    } else {
      console.error('❌ process-file command did not return expected help text');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to execute process-file command:', error.message);
    return false;
  } finally {
    cleanup(filePath);
  }
}

// Test the chat command with --attach option
async function testChatAttachCommand() {
  console.log('\nTest: Verify the chat command with --attach option can be executed');
  
  // Create a test file
  const content = 'This is a test file for the chat --attach command.';
  const filePath = createTestFile(content, '.txt');
  
  try {
    console.log(`Created test file at: ${filePath}`);
    
    // Run the command with --help to avoid actually processing the file
    // (which would require a real API key)
    const result = await runCommand(['chat', '--help']);
    
    console.log('Command output:');
    console.log(result.stdout);
    
    if (result.stdout.includes('-a, --attach <path>')) {
      console.log('✅ chat command with --attach option is available');
      return true;
    } else {
      console.error('❌ chat command does not have --attach option in help text');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to execute chat command:', error.message);
    return false;
  } finally {
    cleanup(filePath);
  }
}

// Run all tests
async function runTests() {
  console.log('Testing CLI commands...');
  console.log('======================');
  
  let passed = 0;
  let total = 2;
  
  if (await testProcessFileCommand()) passed++;
  if (await testChatAttachCommand()) passed++;
  
  console.log('\nTest Results:');
  console.log(`Passed: ${passed}/${total} tests`);
  
  if (passed === total) {
    console.log('✅ All tests passed!');
    return 0;
  } else {
    console.log('❌ Some tests failed');
    return 1;
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  runTests().then(process.exit);
}