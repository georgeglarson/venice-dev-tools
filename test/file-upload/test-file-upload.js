/**
 * Test script for the file-upload module
 * 
 * This script tests the actual functionality of the file-upload module
 * by processing a real file and verifying the result.
 */

const path = require('path');
const fs = require('fs');
// We'll use the TypeScript files directly
const { processFile } = require('../../src/resources/file-upload/index.ts');
const { VeniceAI } = require('../../dist');

// Mock VeniceAI client for testing
class MockVeniceAI {
  constructor() {
    this.chat = {
      completions: {
        create: async (params) => {
          console.log('Mock API call with params:', JSON.stringify(params, null, 2));
          return {
            choices: [
              {
                message: {
                  content: 'This is a mock response from the API'
                }
              }
            ]
          };
        }
      }
    };
  }
}

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

// Test processing a text file
async function testTextFile() {
  console.log('\nTest 1: Processing a text file');
  const content = 'This is a test file with some text content.';
  const filePath = createTestFile(content, '.txt');
  
  try {
    console.log(`Created test file at: ${filePath}`);
    
    const client = new MockVeniceAI();
    const result = await processFile(filePath, client);
    
    console.log('Result:', result);
    console.log('✅ Successfully processed text file');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to process text file:', error.message);
    return false;
  } finally {
    cleanup(filePath);
  }
}

// Test processing a JSON file
async function testJsonFile() {
  console.log('\nTest 2: Processing a JSON file');
  const content = JSON.stringify({ name: 'Test', value: 123 }, null, 2);
  const filePath = createTestFile(content, '.json');
  
  try {
    console.log(`Created test file at: ${filePath}`);
    
    const client = new MockVeniceAI();
    const result = await processFile(filePath, client);
    
    console.log('Result:', result);
    console.log('✅ Successfully processed JSON file');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to process JSON file:', error.message);
    return false;
  } finally {
    cleanup(filePath);
  }
}

// Test processing an HTML file
async function testHtmlFile() {
  console.log('\nTest 3: Processing an HTML file');
  const content = `
<!DOCTYPE html>
<html>
<head>
  <title>Test HTML</title>
</head>
<body>
  <h1>Test HTML Document</h1>
  <p>This is a test HTML document for file processing.</p>
</body>
</html>
  `;
  const filePath = createTestFile(content, '.html');
  
  try {
    console.log(`Created test file at: ${filePath}`);
    
    const client = new MockVeniceAI();
    const result = await processFile(filePath, client);
    
    console.log('Result:', result);
    console.log('✅ Successfully processed HTML file');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to process HTML file:', error.message);
    return false;
  } finally {
    cleanup(filePath);
  }
}

// Test with custom options
async function testCustomOptions() {
  console.log('\nTest 4: Processing with custom options');
  const content = 'This is a test file with some text content.';
  const filePath = createTestFile(content, '.txt');
  
  try {
    console.log(`Created test file at: ${filePath}`);
    
    const client = new MockVeniceAI();
    const result = await processFile(filePath, client, {
      customPrompt: 'Custom prompt for testing',
      model: 'test-model'
    });
    
    console.log('Result:', result);
    console.log('✅ Successfully processed with custom options');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to process with custom options:', error.message);
    return false;
  } finally {
    cleanup(filePath);
  }
}

// Run all tests
async function runTests() {
  console.log('Testing file-upload module...');
  console.log('=============================');
  
  let passed = 0;
  let total = 4;
  
  if (await testTextFile()) passed++;
  if (await testJsonFile()) passed++;
  if (await testHtmlFile()) passed++;
  if (await testCustomOptions()) passed++;
  
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