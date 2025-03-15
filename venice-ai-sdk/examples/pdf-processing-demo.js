/**
 * Simple demonstration of PDF processing options in Venice AI SDK
 * 
 * This example shows the output of the different PDF processing modes
 * without making actual API calls.
 */
const { processFile } = require('../packages/node/src/utils');

// Path to the test PDF file
const pdfPath = './examples/test-document.pdf';

async function demonstratePdfProcessing() {
  console.log('PDF Processing Demo\n');
  
  try {
    // 1. Process PDF as image (default mode)
    console.log('1. Processing PDF as image (default mode):');
    const imageResult = await processFile(pdfPath);
    console.log('Result type:', imageResult.type);
    console.log('Data URL length:', imageResult.image_url.url.length);
    console.log('Data URL preview:', imageResult.image_url.url.substring(0, 50) + '...');
    console.log('\n');
    
    // 2. Process PDF as text
    console.log('2. Processing PDF as text:');
    const textResult = await processFile(pdfPath, { pdfMode: 'text' });
    console.log('Result type:', textResult.type);
    console.log('Text length:', textResult.text.length);
    console.log('Text preview:');
    console.log(textResult.text.substring(0, 300) + '...');
    console.log('\n');
    
    // 3. Process PDF as both text and image
    console.log('3. Processing PDF as both text and image:');
    const bothResult = await processFile(pdfPath, { pdfMode: 'both' });
    console.log('Result is array:', Array.isArray(bothResult));
    console.log('Number of items:', bothResult.length);
    
    // Show details of each item
    bothResult.forEach((item, index) => {
      console.log(`Item ${index + 1} type:`, item.type);
      if (item.type === 'text') {
        console.log('Text length:', item.text.length);
        console.log('Text preview:');
        console.log(item.text.substring(0, 200) + '...');
      } else if (item.type === 'image_url') {
        console.log('Data URL length:', item.image_url.url.length);
        console.log('Data URL preview:', item.image_url.url.substring(0, 50) + '...');
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the demonstration
demonstratePdfProcessing().catch(console.error);