/**
 * Real test for the file-upload functionality
 * 
 * This script tests the actual CLI command with a real file.
 * NOTE: This requires a valid VENICE_API_KEY environment variable.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create a temporary test file
function createTestFile(content, extension) {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const filePath = path.join(tempDir, `real-test-file${extension}`);
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

// Run the CLI command
function runCliCommand(args) {
  return new Promise((resolve, reject) => {
    console.log(`Running command: venice ${args.join(' ')}`);
    
    // Use the actual venice CLI command
    const child = spawn('npx', ['ts-node', path.resolve(__dirname, '../../src/cli.ts'), ...args], {
      env: process.env, // Use the environment variables, including VENICE_API_KEY
      stdio: 'inherit'  // Show output directly in the console
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

// Test the process-file command with a real file
async function testProcessFile() {
  console.log('\nTesting process-file command with a real file');
  console.log('===========================================');
  
  // Create a test file
  const content = 'This is a test file for the process-file command.\nIt contains multiple lines of text.\nThe command should process this file correctly.';
  const filePath = createTestFile(content, '.txt');
  
  try {
    console.log(`Created test file at: ${filePath}`);
    
    // Check if API key is set
    if (!process.env.VENICE_API_KEY) {
      console.error('Error: VENICE_API_KEY environment variable is required');
      console.error('Please set it before running this test:');
      console.error('  export VENICE_API_KEY=your-api-key');
      return false;
    }
    
    // Run the process-file command
    await runCliCommand(['process-file', filePath, '-p', 'Analyze this text file and tell me what it contains.']);
    
    console.log('\n✅ process-file command executed successfully');
    return true;
  } catch (error) {
    console.error('\n❌ Failed to execute process-file command:', error.message);
    return false;
  } finally {
    cleanup(filePath);
  }
}

// Test the chat command with --attach option
async function testChatAttach() {
  console.log('\nTesting chat command with --attach option');
  console.log('=======================================');
  
  // Create a test file
  const content = 'This is a test file for the chat --attach command.\nIt contains multiple lines of text.\nThe command should process this file correctly.';
  const filePath = createTestFile(content, '.txt');
  
  try {
    console.log(`Created test file at: ${filePath}`);
    
    // Check if API key is set
    if (!process.env.VENICE_API_KEY) {
      console.error('Error: VENICE_API_KEY environment variable is required');
      console.error('Please set it before running this test:');
      console.error('  export VENICE_API_KEY=your-api-key');
      return false;
    }
    
    // Run the chat command with --attach option
    await runCliCommand(['chat', 'What does this file contain?', '--attach', filePath]);
    
    console.log('\n✅ chat command with --attach option executed successfully');
    return true;
  } catch (error) {
    console.error('\n❌ Failed to execute chat command with --attach option:', error.message);
    return false;
  } finally {
    cleanup(filePath);
  }
}

// Run the tests
async function runTests() {
  console.log('Real tests for file-upload functionality');
  console.log('======================================');
  
  let passed = 0;
  let total = 2;
  
  if (await testProcessFile()) passed++;
  if (await testChatAttach()) passed++;
  
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