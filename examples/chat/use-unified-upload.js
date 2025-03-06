/**
 * Example of using the unified file upload module
 * 
 * This script demonstrates how to use the unified file upload module
 * to process different types of files. All files must be under the 4.5MB API limit.
 * 
 * Usage:
 *   VENICE_API_KEY=your-api-key node examples/chat/use-unified-upload.js
 */

// Import the unified file upload module
const { processFile } = require('./unified-file-upload.js');

// Define the main function
async function main() {
  try {
    // Process an HTML file
    console.log('\n=== Processing HTML file ===\n');
    const htmlResult = await processFile('../../sample-document.html');
    console.log('HTML Result:', htmlResult);
    
    // Process a text file
    console.log('\n=== Processing text file ===\n');
    const textResult = await processFile('../../package.json');
    console.log('Text File Result:', textResult);
    
    // Process an image file
    console.log('\n=== Processing image file ===\n');
    const imageResult = await processFile('../../test/upscale/test-image.jpg');
    console.log('Image Result:', imageResult);
    
    console.log('\nAll files processed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}