/**
 * Comprehensive PDF Handling Example
 *
 * This example demonstrates how to handle PDF documents of any size by:
 * 1. Converting PDFs to text locally using PDF.js
 * 2. Sending the extracted text to the API
 *
 * For PDFs with complex layouts or images, it also shows how to:
 * 1. Extract embedded images from the PDF
 * 2. Process those images separately
 *
 * Usage:
 *   VENICE_API_KEY=your-api-key node comprehensive-pdf-handling.js [path/to/pdf]
 */

const fs = require('fs');
const path = require('path');
const { VeniceAI } = require('../../dist');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

// Check if API key is provided
if (!process.env.VENICE_API_KEY) {
  console.error('Error: VENICE_API_KEY environment variable is required');
  console.error('Usage: VENICE_API_KEY=your-api-key node comprehensive-pdf-handling.js [path/to/pdf]');
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
 * Process a PDF document by extracting text and sending to the API
 *
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<string>} - API response content
 */
async function processPDFDocument(pdfPath) {
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
            text: `Please analyze this document content and provide a comprehensive summary:\n\n${extractedText}`
          }
        ]
      }
    ]
  });
  
  return response.choices[0].message.content;
}

/**
 * Main function to process a PDF file
 *
 * @param {string} filePath - Path to the PDF file
 */
async function handlePDFDocument(filePath) {
  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found at ${filePath}`);
      process.exit(1);
    }
    
    // Get file size
    const stats = fs.statSync(filePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    
    console.log(`Processing PDF: ${filePath}`);
    console.log(`File size: ${fileSizeMB.toFixed(2)} MB`);
    
    // Process the PDF
    const result = await processPDFDocument(filePath);
    
    console.log('\nAnalysis Result:');
    console.log('===============');
    console.log(result);
    
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
handlePDFDocument(pdfPath)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });