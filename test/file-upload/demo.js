/**
 * Demo script for the file-upload module
 * 
 * This script demonstrates the file-upload module with a real file.
 * It uses a mock API client to avoid making actual API calls.
 */

const path = require('path');
const fs = require('fs');

// Create a mock VeniceAI client
class MockVeniceAI {
  constructor() {
    this.chat = {
      completions: {
        create: async (params) => {
          console.log('\nAPI Request:');
          console.log('============');
          console.log(JSON.stringify(params, null, 2));
          
          return {
            choices: [
              {
                message: {
                  content: "This is a mock response from the API. I've analyzed your file and here's what I found..."
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
  
  const filePath = path.join(tempDir, `demo-file${extension}`);
  fs.writeFileSync(filePath, content);
  console.log(`Created test file at: ${filePath}`);
  console.log(`Content: ${content}`);
  return filePath;
}

// Clean up temporary files
function cleanup(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted test file: ${filePath}`);
  }
}

// Run the demo
async function runDemo() {
  console.log('File Upload Module Demo');
  console.log('======================');
  
  // Create a test file
  const content = 'This is a test file for the file-upload module demo.\nIt contains multiple lines of text.\nThe module should process this file correctly.';
  const filePath = createTestFile(content, '.txt');
  
  try {
    // Import the module (using require with ts-node)
    const { processFile } = require('../../src/resources/file-upload/index.ts');
    
    console.log('\nProcessing file...');
    
    // Create a mock client
    const client = new MockVeniceAI();
    
    // Process the file
    const result = await processFile(filePath, client, {
      customPrompt: 'This is a custom prompt for the demo.',
      model: 'demo-model'
    });
    
    console.log('\nAPI Response:');
    console.log('=============');
    console.log(result);
    
    console.log('\nDemo completed successfully!');
  } catch (error) {
    console.error('\nError:', error.message);
  } finally {
    cleanup(filePath);
  }
}

// Run the demo if this script is executed directly
if (require.main === module) {
  // Use ts-node to run this script
  runDemo().catch(console.error);
}