/**
 * Large PDF Extraction Example
 * 
 * This example demonstrates how to handle large PDF files (>4.5MB) by:
 * 1. Extracting text content locally using PDF.js
 * 2. Sending the extracted text to the API instead of the raw PDF
 * 
 * This approach works around the API's 4.5MB post limit for large documents.
 * 
 * Usage:
 *   VENICE_API_KEY=your-api-key node large-pdf-extraction.js [path/to/large.pdf]
 */

const fs = require('fs');
const path = require('path');
const { VeniceAI } = require('../../dist');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

// Check if API key is provided
if (!process.env.VENICE_API_KEY) {
  console.error('Error: VENICE_API_KEY environment variable is required');
  console.error('Usage: VENICE_API_KEY=your-api-key node large-pdf-extraction.js [path/to/large.pdf]');
  process.exit(1);
}

// Initialize the Venice AI client
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY,
  logLevel: 'debug', // Enable debug logging
});

/**
 * Extract text from a PDF file using PDF.js
 * 
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromPDF(pdfPath) {
  // Read the PDF file
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  
  // Load the PDF document
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDocument = await loadingTask.promise;
  
  console.log(`PDF loaded. Number of pages: ${pdfDocument.numPages}`);
  
  // Extract text from each page
  let extractedText = '';
  
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    
    // Concatenate the text items
    const pageText = textContent.items.map(item => item.str).join(' ');
    extractedText += `\n--- Page ${i} ---\n${pageText}\n`;
    
    console.log(`Extracted text from page ${i}/${pdfDocument.numPages}`);
  }
  
  return extractedText;
}

/**
 * Process a large PDF file and send the extracted text to the API
 * 
 * @param {string} pdfPath - Path to the PDF file
 */
async function processLargePDF(pdfPath) {
  try {
    // Check if the file exists
    if (!fs.existsSync(pdfPath)) {
      console.error(`Error: PDF file not found at ${pdfPath}`);
      process.exit(1);
    }
    
    // Get file size
    const stats = fs.statSync(pdfPath);
    const fileSizeMB = stats.size / (1024 * 1024);
    
    console.log(`Processing PDF: ${pdfPath}`);
    console.log(`File size: ${fileSizeMB.toFixed(2)} MB`);
    
    // Extract text from the PDF
    console.log('Extracting text from PDF...');
    const extractedText = await extractTextFromPDF(pdfPath);
    
    console.log(`Extracted ${extractedText.length} characters of text`);
    
    // Send the extracted text to the API
    console.log('Sending extracted text to API...');
    const response = await venice.chat.completions.create({
      model: 'qwen-2.5-vl', // Use a capable model
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `I've extracted text from a PDF document. Please analyze this content and provide a summary:\n\n${extractedText}`
            }
          ]
        }
      ]
    });
    
    console.log('\nAPI Response:');
    console.log('=============');
    console.log('Response ID:', response.id);
    console.log('Model:', response.model);
    console.log('Content:', response.choices[0].message.content);
    
    // For very large PDFs, you might need to process in chunks
    if (extractedText.length > 100000) {
      console.log('\nNote: For very large PDFs, you may need to split the text into chunks');
      console.log('and make multiple API calls, then combine the results.');
    }
    
    return true;
  } catch (error) {
    console.error('Error processing PDF:', error);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
    return false;
  }
}

// Get PDF path from command line or use default
const pdfPath = process.argv.length > 2 
  ? process.argv[2] 
  : path.join(__dirname, '../../sample.pdf');

// Process the PDF
processLargePDF(pdfPath)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });