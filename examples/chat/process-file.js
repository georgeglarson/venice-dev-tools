#!/usr/bin/env node

/**
 * Process File Script
 * 
 * A simple command-line script to process any file using the unified file upload module.
 * 
 * Usage:
 *   VENICE_API_KEY=your-api-key node process-file.js path/to/file
 */

// Import the unified file upload module
const { processFileAndPrint } = require('./unified-file-upload.js');

// Get the file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.error('Error: Please provide a file path');
  console.error('Usage: VENICE_API_KEY=your-api-key node process-file.js path/to/file');
  process.exit(1);
}

// Process the file
processFileAndPrint(filePath)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });