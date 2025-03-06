/**
 * Document Analysis Example
 * 
 * This example demonstrates how to use file attachments with chat completions
 * to analyze a PDF document.
 */

const fs = require('fs');
const path = require('path');
const { VeniceAI } = require('../../src/index');

// Initialize the Venice AI client
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

async function analyzePdfDocument() {
  try {
    // Path to the PDF file
    const pdfPath = path.join(__dirname, '../../sample.pdf');
    
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);
    const base64Pdf = pdfBuffer.toString('base64');
    
    console.log(`Analyzing PDF document: ${pdfPath}`);
    
    // Create a chat completion with the PDF file attachment
    const response = await venice.chat.completions.create({
      model: 'qwen-2.5-vl', // Use a vision model that can process documents
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this PDF document and provide a summary of its contents.'
            },
            {
              type: 'file',
              file: {
                data: base64Pdf,
                mime_type: 'application/pdf',
                name: 'document.pdf'
              }
            }
          ]
        }
      ]
    });
    
    console.log('\nAnalysis Result:');
    console.log(response.choices[0].message.content);
    
  } catch (error) {
    console.error('Error analyzing PDF document:', error);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
  }
}

// Alternative method using a file path instead of base64 encoding
async function analyzePdfDocumentWithPath() {
  try {
    // Path to the PDF file
    const pdfPath = path.join(__dirname, '../../sample.pdf');
    
    console.log(`Analyzing PDF document using file path: ${pdfPath}`);
    
    // Create a chat completion with the PDF file attachment
    const response = await venice.chat.completions.create({
      model: 'qwen-2.5-vl', // Use a vision model that can process documents
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this PDF document and provide a summary of its contents.'
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
    
    console.log('\nAnalysis Result:');
    console.log(response.choices[0].message.content);
    
  } catch (error) {
    console.error('Error analyzing PDF document:', error);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
  }
}

// Run the example
analyzePdfDocument()
  .then(() => {
    console.log('\n--- Using file path method ---\n');
    return analyzePdfDocumentWithPath();
  })
  .catch(console.error);