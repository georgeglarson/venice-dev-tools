/**
 * SDK File Attachment Test
 * 
 * This script tests the file attachment support for chat completions
 * using the SDK directly.
 */

const fs = require('fs');
const path = require('path');
const { VeniceAI } = require('../../dist');

// Check if API key is provided
if (!process.env.VENICE_API_KEY) {
  console.error('Error: VENICE_API_KEY environment variable is required');
  console.error('Usage: VENICE_API_KEY=your-api-key node sdk-file-test.js');
  process.exit(1);
}

// Initialize the Venice AI client
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY,
  logLevel: 'debug', // Enable debug logging
});

async function testFileAttachment() {
  try {
    // Path to the PDF file
    const pdfPath = path.join(__dirname, '../../sample.pdf');
    
    // Check if the file exists
    if (!fs.existsSync(pdfPath)) {
      console.error(`Error: PDF file not found at ${pdfPath}`);
      process.exit(1);
    }
    
    console.log(`Testing file attachment with PDF: ${pdfPath}`);
    
    // Create a chat completion with the PDF file attachment
    const response = await venice.chat.completions.create({
      model: 'qwen-2.5-vl', // Use a vision model that can process documents
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this PDF document and provide a brief summary of its contents.'
            },
            {
              type: 'file',
              file: {
                path: pdfPath,
                name: 'document.pdf'
              }
            }
          ]
        }
      ]
    });
    
    console.log('\nTest Result:');
    console.log('=============');
    console.log('Response ID:', response.id);
    console.log('Model:', response.model);
    console.log('Content:', response.choices[0].message.content);
    
    console.log('\nTest completed successfully!');
    return true;
  } catch (error) {
    console.error('Test failed with error:', error);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
    return false;
  }
}

// Run the test
testFileAttachment()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });