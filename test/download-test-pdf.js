/**
 * Download a real PDF from the web for testing
 * 
 * This script downloads a PDF from a public URL and saves it to the test directory.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// URL of a public PDF document (Mozilla PDF.js sample)
const PDF_URL = 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf';
const OUTPUT_PATH = path.join(__dirname, 'real-sample.pdf');

console.log(`Downloading PDF from ${PDF_URL}...`);

// Download the PDF
https.get(PDF_URL, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download PDF: ${response.statusCode} ${response.statusMessage}`);
    process.exit(1);
  }

  // Create a write stream to save the PDF
  const fileStream = fs.createWriteStream(OUTPUT_PATH);
  
  // Pipe the response to the file
  response.pipe(fileStream);
  
  // Handle completion
  fileStream.on('finish', () => {
    fileStream.close();
    
    // Get file size
    const stats = fs.statSync(OUTPUT_PATH);
    const fileSizeInBytes = stats.size;
    const fileSizeInKB = fileSizeInBytes / 1024;
    
    console.log(`PDF downloaded successfully to ${OUTPUT_PATH}`);
    console.log(`File size: ${fileSizeInKB.toFixed(2)} KB`);
  });
  
  // Handle errors
  fileStream.on('error', (err) => {
    console.error(`Error writing file: ${err.message}`);
    fs.unlinkSync(OUTPUT_PATH); // Clean up partial file
    process.exit(1);
  });
}).on('error', (err) => {
  console.error(`Error downloading PDF: ${err.message}`);
  process.exit(1);
});