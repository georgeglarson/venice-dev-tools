/**
 * Simple demonstration of PDF processing options in Venice AI SDK
 * 
 * This example shows the output of the different PDF processing modes
 * without making actual API calls.
 */
const fs = require('fs');
const path = require('path');

// Import the file processor directly
const fileProcessor = require('../packages/node/src/utils/file-processor');

// Path to the test PDF file
const pdfPath = path.join(__dirname, 'test-document.pdf');

// Check if the PDF file exists
if (!fs.existsSync(pdfPath)) {
  console.error(`PDF file not found: ${pdfPath}`);
  process.exit(1);
}

// Function to display content item information
function displayContentItem(item, label) {
  console.log(`\n${label}:`);
  console.log(`Type: ${item.type}`);
  
  if (item.type === 'text') {
    console.log(`Text length: ${item.text.length} characters`);
    console.log(`Text preview: ${item.text.substring(0, 200)}...`);
  } else if (item.type === 'image_url') {
    console.log(`Image URL length: ${item.image_url.url.length} characters`);
    console.log(`Image URL preview: ${item.image_url.url.substring(0, 50)}...`);
  }
}

// Demonstrate the different PDF processing modes
async function demonstratePdfProcessing() {
  try {
    console.log(`\nProcessing PDF file: ${pdfPath}\n`);
    console.log('='.repeat(50));
    
    // 1. Process PDF as image (default mode)
    console.log('\n1. PROCESSING PDF AS IMAGE (DEFAULT MODE)');
    console.log('-'.repeat(50));
    try {
      const imageResult = await fileProcessor.processFile(pdfPath);
      displayContentItem(imageResult, 'Result');
    } catch (error) {
      console.error(`Error processing PDF as image: ${error.message}`);
    }
    
    // 2. Process PDF as text
    console.log('\n\n2. PROCESSING PDF AS TEXT');
    console.log('-'.repeat(50));
    try {
      const textResult = await fileProcessor.processFile(pdfPath, { pdfMode: 'text' });
      displayContentItem(textResult, 'Result');
    } catch (error) {
      console.error(`Error processing PDF as text: ${error.message}`);
    }
    
    // 3. Process PDF as both text and image
    console.log('\n\n3. PROCESSING PDF AS BOTH TEXT AND IMAGE');
    console.log('-'.repeat(50));
    try {
      const bothResult = await fileProcessor.processFile(pdfPath, { pdfMode: 'both' });
      
      if (Array.isArray(bothResult)) {
        console.log(`\nResult is an array with ${bothResult.length} items`);
        
        bothResult.forEach((item, index) => {
          displayContentItem(item, `Item ${index + 1}`);
        });
      } else {
        console.log('\nResult is not an array as expected');
        displayContentItem(bothResult, 'Result');
      }
    } catch (error) {
      console.error(`Error processing PDF as both: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('\nPDF processing demonstration complete!');
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Run the demonstration
demonstratePdfProcessing().catch(console.error);