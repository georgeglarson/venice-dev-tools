/**
 * Simple File Attachment Test
 *
 * This script tests the file attachment support for chat completions
 * by directly using the source files instead of the bundled version.
 *
 * This version exactly matches the SDK's implementation for file uploads,
 * using the multipart/form-data approach with the specific format expected by the API.
 *
 * Usage:
 *   VENICE_API_KEY=your-api-key node simple-file-test.js [path/to/pdf]
 *
 * If no PDF path is provided, it will use the default sample.pdf in the project root.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Check if API key is provided
if (!process.env.VENICE_API_KEY) {
  console.error('Error: VENICE_API_KEY environment variable is required');
  console.error('Usage: VENICE_API_KEY=your-api-key node simple-file-test.js');
  process.exit(1);
}

const API_KEY = process.env.VENICE_API_KEY;
const BASE_URL = 'https://api.venice.ai/api/v1';

async function testFileAttachment() {
  try {
    // Path to the PDF file - allow custom path from command line
    let pdfPath;
    if (process.argv.length > 2) {
      // Use the provided path
      pdfPath = process.argv[2];
      if (!path.isAbsolute(pdfPath)) {
        // Convert relative path to absolute
        pdfPath = path.resolve(process.cwd(), pdfPath);
      }
    } else {
      // Use the default sample.pdf
      pdfPath = path.join(__dirname, '../../sample.pdf');
    }
    
    // Check if the file exists
    if (!fs.existsSync(pdfPath)) {
      console.error(`Error: PDF file not found at ${pdfPath}`);
      console.error('Please provide a valid PDF file path or ensure sample.pdf exists in the project root.');
      process.exit(1);
    }
    
    console.log(`Testing file attachment with PDF: ${pdfPath}`);
    
    // Read the PDF file and convert to base64
    const fileBuffer = fs.readFileSync(pdfPath);
    const base64Pdf = fileBuffer.toString('base64');
    console.log(`PDF size: ${fileBuffer.length} bytes`);
    // Create a FormData instance
    const formData = new FormData();
    
    // Add the request parameters as JSON (exactly as SDK does)
    formData.append('request', JSON.stringify({
      model: 'qwen-2.5-vl', // Use a vision model that can process documents
      stream: false
    }));
    
    // Process messages to extract file attachments
    const fileKey = 'file_0';
    const processedMessages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Please analyze this PDF document and provide a brief summary of its contents.'
          },
          {
            type: 'file_ref',
            file_ref: {
              file_id: fileKey,
              mime_type: 'application/pdf',
              name: 'document.pdf'
            }
          }
        ]
      }
    ];
    
    // Add the processed messages to form data
    formData.append('messages', JSON.stringify(processedMessages));
    
    // Add the file buffer to form data
    formData.append(fileKey, fileBuffer, {
      filename: 'document.pdf',
      contentType: 'application/pdf'
    });
    
    console.log('Sending request to API...');
    
    // Log the request details
    console.log('Request URL:', `${BASE_URL}/chat/completions`);
    console.log('Request Headers:', {
      ...formData.getHeaders(),
      'Authorization': 'Bearer [REDACTED]',
      'User-Agent': 'Venice-AI-SDK-APL/0.1.0'
    });
    
    // Log the form data keys
    console.log('Form Data Keys:', Object.keys(formData).join(', '));
    
    // Make the API request
    console.log('\nSending API request...');
    const response = await axios.post(`${BASE_URL}/chat/completions`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'Venice-AI-SDK-APL/0.1.0'
      },
      validateStatus: status => true // Don't throw on error status codes
    });
    
    // Log the raw response for debugging
    console.log('\nAPI Response:');
    console.log('Status:', response.status);
    console.log('Headers:', JSON.stringify(response.headers, null, 2));
    
    // Check for error status codes
    if (response.status !== 200) {
      console.error(`Error: API returned status code ${response.status}`);
      if (response.data) {
        console.error('Response data:', response.data);
      } else {
        console.error('No response data received');
      }
      return false;
    }
    
    // Check if response data exists
    if (!response.data) {
      console.error('Error: No response data received from API');
      return false;
    }
    
    console.log('\nTest Result:');
    console.log('=============');
    
    // Check if we have the expected response structure
    if (response.data.id) {
      console.log('Response ID:', response.data.id);
    }
    
    if (response.data.model) {
      console.log('Model:', response.data.model);
    }
    
    // Check if choices array exists and has content
    if (response.data.choices &&
        response.data.choices.length > 0 &&
        response.data.choices[0].message &&
        response.data.choices[0].message.content) {
      console.log('Content:', response.data.choices[0].message.content);
    } else {
      console.log('Content: No content returned in response');
      console.log('Full response:', JSON.stringify(response.data, null, 2));
    }
    
    // Display additional response information if available
    if (response.data.usage) {
      console.log('\nUsage Information:');
      console.log('Prompt Tokens:', response.data.usage.prompt_tokens);
      console.log('Completion Tokens:', response.data.usage.completion_tokens);
      console.log('Total Tokens:', response.data.usage.total_tokens);
    }
    
    console.log('\nTest completed successfully!');
    return true;
  } catch (error) {
    console.error('\nTest failed with error:', error.message);
    
    if (error.response) {
      console.error('API Error:', error.response.data);
      console.error('Status Code:', error.response.status);
      
      // Provide more helpful information based on status code
      if (error.response.status === 401) {
        console.error('\nAuthentication Error: Your API key may be invalid or expired.');
        console.error('Please check your VENICE_API_KEY environment variable.');
      } else if (error.response.status === 400) {
        console.error('\nBad Request: The API request format may be incorrect.');
        console.error('Check if the model supports file attachments and the file format is supported.');
      } else if (error.response.status === 413) {
        console.error('\nPayload Too Large: The file may be too large for the API.');
        console.error('Try using a smaller file or compressing the current one.');
      }
    } else {
      console.error('Network or client error. Check your internet connection.');
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