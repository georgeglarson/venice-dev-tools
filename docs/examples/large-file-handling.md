# Handling Files with Venice AI API

The Venice AI API has a strict 4.5MB post limit for file uploads. This document explains approaches for handling different file types while respecting this limit.

## Overview

When working with the Venice AI API, you may encounter situations where you need to process large files such as:

- Large PDF documents (>4.5MB)
- High-resolution images
- Large audio or video files

Since the API has a 4.5MB post limit, you'll need to use alternative approaches to process these files.

## Unified File Upload Approach

For a seamless experience similar to the paperclip upload in the UI, you can use a unified approach that automatically handles different file types while respecting the 4.5MB limit:

```javascript
async function processFile(filePath) {
  // Get file extension and size
  const fileExt = path.extname(filePath).toLowerCase();
  const stats = fs.statSync(filePath);
  const fileSizeMB = stats.size / (1024 * 1024);
  
  // Handle different file types
  if (fileExt === '.pdf') {
    // PDF file - extract text locally
    const extractedText = await extractTextFromPDF(filePath);
    // Send extracted text to API
  } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
    // Image file - resize if needed to stay under 4.5MB
    const processedImagePath = await resizeImageIfNeeded(filePath);
    // Convert to base64 and send to API
  } else if (['.txt', '.md', '.csv', '.json', '.html', '.xml', '.js', '.py'].includes(fileExt)) {
    // Text file - read content directly
    const textContent = fs.readFileSync(filePath, 'utf8');
    // Send text content to API
  }
}
```

See the full example in [examples/chat/unified-file-upload.js](../../examples/chat/unified-file-upload.js).

## Approaches for Handling Files That Exceed the 4.5MB Limit

### 1. Local Extraction and Processing

For large files, the recommended approach is to extract and process the content locally before sending it to the API.

#### For PDF Documents

Use a PDF processing library like `pdfjs-dist` to extract text content from the PDF locally, then send only the extracted text to the API.

```javascript
// Example using pdfjs-dist
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function extractTextFromPDF(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDocument = await loadingTask.promise;
  
  let extractedText = '';
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    extractedText += `\n--- Page ${i} ---\n${pageText}\n`;
  }
  
  return extractedText;
}
```

See the full example in [examples/chat/large-pdf-extraction.js](../../examples/chat/large-pdf-extraction.js).

#### For Images

Resize or compress images locally before sending them to the API.

```javascript
// Example using ImageMagick (requires the 'convert' command)
function resizeImage(imagePath, maxWidth = 1024, maxHeight = 1024, quality = 85) {
  const tempDir = os.tmpdir();
  const originalFilename = path.basename(imagePath);
  const resizedFilename = `resized_${originalFilename}`;
  const outputPath = path.join(tempDir, resizedFilename);
  
  const command = `convert "${imagePath}" -resize ${maxWidth}x${maxHeight}\\> -quality ${quality} "${outputPath}"`;
  execSync(command);
  
  return outputPath;
}
```

See the full example in [examples/chat/large-image-processing.js](../../examples/chat/large-image-processing.js).

### 2. URL-Based Approach

Instead of sending the file directly, upload it to a cloud storage service and provide the URL to the API.

```javascript
// Pseudocode for URL-based approach
async function processWithURL(filePath) {
  // 1. Upload file to cloud storage (AWS S3, Google Cloud Storage, etc.)
  const fileUrl = await uploadToCloudStorage(filePath);
  
  // 2. Send URL to API
  const response = await venice.chat.completions.create({
    model: 'qwen-2.5-vl',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Please analyze this content.'
          },
          {
            type: 'image_url',  // or appropriate type for your file
            image_url: {
              url: fileUrl
            }
          }
        ]
      }
    ]
  });
  
  return response;
}
```

### 3. Comprehensive PDF Handling

For PDFs of any size, extract the text content locally and send it to the API:

```javascript
async function handlePDFDocument(pdfPath) {
  // Extract text from the PDF
  const extractedText = await extractTextFromPDF(pdfPath);
  
  // Send the extracted text to the API
  const response = await venice.chat.completions.create({
    model: 'qwen-2.5-vl',
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
```

## Unified File Upload Approach

For a seamless experience similar to the paperclip upload in the UI, you can use the unified file upload module that automatically handles different file types:

```javascript
// Import the unified file upload module
const { processFile } = require('./unified-file-upload.js');

// Process any file type
async function handleFile(filePath) {
  try {
    // The module automatically detects the file type and processes it accordingly
    const result = await processFile(filePath);
    console.log('API Response:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example usage
handleFile('document.pdf');    // Extracts text from PDF
handleFile('image.jpg');       // Resizes image if needed
handleFile('data.json');       // Reads text content directly
```

The unified approach:
1. Automatically detects file type based on extension
2. Processes each file type appropriately:
   - PDFs: Extracts text locally
   - Images: Resizes if needed and converts to base64
   - Text files: Reads content directly
   - Unknown files: Attempts to determine if text or binary
3. Ensures all files stay under the 4.5MB limit
4. Formats the content appropriately for the API

See the [Unified File Upload Example](../../examples/chat/unified-file-upload.js) for the complete implementation.

## Best Practices

1. **Check file size before uploading**: Always check the file size before attempting to upload it to the API.

2. **Use appropriate processing for each file type**:
   - For PDFs: Extract text locally
   - For images: Resize or compress to stay under 4.5MB
   - For text files: Include content directly in the prompt
   - For binary files: Convert to base64 if under 4.5MB

3. **Consider privacy and security**: When using URL-based approaches, ensure the URLs are secure and temporary if the content is sensitive.

4. **Handle errors gracefully**: Implement proper error handling for cases where file processing fails.

## Examples

The Venice AI SDK includes examples for handling files:

- [Unified File Upload](../../examples/chat/unified-file-upload.js) - Handles any file type automatically
- [Large PDF Extraction](../../examples/chat/large-pdf-extraction.js) - Extracts text from PDFs
- [Large Image Processing](../../examples/chat/large-image-processing.js) - Resizes images to fit within limits
- [Using Unified Upload](../../examples/chat/use-unified-upload.js) - Example of using the unified module

## Additional Resources

- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [ImageMagick Documentation](https://imagemagick.org/script/command-line-processing.php)
- [Venice AI API Documentation](https://docs.venice.ai)