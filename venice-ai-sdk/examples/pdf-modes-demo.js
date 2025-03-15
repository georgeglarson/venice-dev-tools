/**
 * PDF Processing Modes Demonstration
 * 
 * This script demonstrates the three PDF processing modes:
 * 1. Image mode (default): Send the PDF as an image
 * 2. Text mode: Extract text from the PDF and send as text
 * 3. Both mode: Extract both text and images, sending multiple content items
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Path to the test PDF file
const pdfPath = path.join(__dirname, 'test-document.pdf');

// Check if the PDF file exists
if (!fs.existsSync(pdfPath)) {
  console.error(`PDF file not found: ${pdfPath}`);
  process.exit(1);
}

/**
 * Process a file for inclusion in a multimodal message
 * 
 * @param {string} filePath - Path to the file
 * @param {Object} options - Options for processing the file
 * @returns {Promise<Object|Array>} A content item or content items representing the file
 */
async function processFile(filePath, options = {}) {
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Check file size (4.5MB limit)
  const stats = fs.statSync(filePath);
  const MAX_SIZE = 4.5 * 1024 * 1024; // 4.5MB
  if (stats.size > MAX_SIZE) {
    throw new Error(`File exceeds maximum size of 4.5MB: ${filePath}`);
  }

  // Determine file type based on extension
  const ext = path.extname(filePath).toLowerCase();
  
  // Handle PDF files with different modes
  if (ext === '.pdf') {
    const pdfMode = options.pdfMode || 'image';
    
    if (pdfMode === 'image') {
      // Process as image (default behavior)
      return processImageFile(filePath, 'application/pdf');
    } else if (pdfMode === 'text') {
      // Extract and return text only
      const text = await extractTextFromPdf(filePath);
      return {
        type: 'text',
        text: text
      };
    } else if (pdfMode === 'both') {
      // Extract both text and image
      const text = await extractTextFromPdf(filePath);
      const image = processImageFile(filePath, 'application/pdf');
      return [
        {
          type: 'text',
          text: `PDF Text Content:\n${text}`
        },
        image
      ];
    }
  } else {
    throw new Error(`File type not supported for this demo: ${ext}`);
  }
}

/**
 * Process an image file
 */
function processImageFile(filePath, mimeType) {
  const fileData = fs.readFileSync(filePath);
  const base64Data = fileData.toString('base64');
  
  return {
    type: 'image_url',
    image_url: {
      url: `data:${mimeType};base64,${base64Data}`
    }
  };
}

/**
 * Extract text from a PDF file
 */
async function extractTextFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  
  try {
    const data = await pdfParse(dataBuffer);
    return data.text || 'No text content found in PDF';
  } catch (error) {
    console.error(`Error extracting text from PDF: ${error.message}`);
    return 'Error extracting text from PDF';
  }
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
      const imageResult = await processFile(pdfPath);
      displayContentItem(imageResult, 'Result');
    } catch (error) {
      console.error(`Error processing PDF as image: ${error.message}`);
    }
    
    // 2. Process PDF as text
    console.log('\n\n2. PROCESSING PDF AS TEXT');
    console.log('-'.repeat(50));
    try {
      const textResult = await processFile(pdfPath, { pdfMode: 'text' });
      displayContentItem(textResult, 'Result');
    } catch (error) {
      console.error(`Error processing PDF as text: ${error.message}`);
    }
    
    // 3. Process PDF as both text and image
    console.log('\n\n3. PROCESSING PDF AS BOTH TEXT AND IMAGE');
    console.log('-'.repeat(50));
    try {
      const bothResult = await processFile(pdfPath, { pdfMode: 'both' });
      
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