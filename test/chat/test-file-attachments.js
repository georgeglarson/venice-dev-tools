/**
 * Test File Attachments
 * 
 * This script tests the file attachment support for chat completions.
 * It sends a PDF file to be analyzed by the AI model.
 */

const fs = require('fs');
const path = require('path');
const { createClient, runTest, loadTestFile } = require('../utils/test-utils');

// Initialize the Venice AI client
const venice = createClient();

/**
 * Test file attachment functionality with a PDF
 */
async function testPdfAttachment() {
  // Path to the PDF file
  const pdfPath = path.join(__dirname, '../../sample.pdf');
  
  // Check if the file exists and load it
  let pdfBuffer;
  try {
    pdfBuffer = fs.existsSync(pdfPath) 
      ? fs.readFileSync(pdfPath)
      : loadTestFile('sample.pdf');
  } catch (error) {
    console.log(`Error loading PDF file: ${error.message}`);
    console.log('Creating a simple test PDF for testing');
    
    // Create a simple PDF-like buffer for testing
    // This is not a valid PDF, but it's enough for testing the API call
    pdfBuffer = Buffer.from('%PDF-1.5\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000010 00000 n\n0000000059 00000 n\n0000000118 00000 n\n0000000217 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n307\n%%EOF');
  }
  
  const base64Pdf = pdfBuffer.toString('base64');
  
  console.log(`Testing file attachment with PDF`);
  console.log(`PDF size: ${pdfBuffer.length} bytes`);
  
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
              data: base64Pdf,
              mime_type: 'application/pdf',
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
  
  return true;
}

/**
 * Main test function
 */
async function main() {
  const success = await runTest('PDF File Attachment', testPdfAttachment);
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Run the test
if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}