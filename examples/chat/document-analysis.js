/**
 * Document Analysis Example
 * 
 * This example demonstrates how to use file attachments with chat completions
 * to analyze an HTML document.
 */

const fs = require('fs');
const path = require('path');
const { VeniceAI } = require('../../src/index');

// Initialize the Venice AI client
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

async function analyzeHtmlDocument() {
  try {
    // Path to the HTML file
    const htmlPath = path.join(__dirname, '../../sample-document.html');
    
    // Read the HTML file
    const htmlBuffer = fs.readFileSync(htmlPath);
    const base64Html = htmlBuffer.toString('base64');
    
    console.log(`Analyzing HTML document: ${htmlPath}`);
    
    // Create a chat completion with the HTML file attachment
    const response = await venice.chat.completions.create({
      model: 'qwen-2.5-vl', // Use a vision model that can process documents
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this HTML document and provide a summary of its contents.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:text/html;base64,${base64Html}`
              }
            }
          ]
        }
      ]
    });
    
    console.log('\nAnalysis Result:');
    console.log(response.choices[0].message.content);
    
  } catch (error) {
    console.error('Error analyzing HTML document:', error);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
  }
}

// Alternative method using a file path instead of base64 encoding
async function analyzeHtmlDocumentWithPath() {
  try {
    // Path to the HTML file
    const htmlPath = path.join(__dirname, '../../sample-document.html');
    
    console.log(`Analyzing HTML document using file path: ${htmlPath}`);
    
    // Create a chat completion with the HTML file attachment
    const response = await venice.chat.completions.create({
      model: 'qwen-2.5-vl', // Use a vision model that can process documents
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this HTML document and provide a summary of its contents.'
            },
            {
              type: 'file',
              file: {
                path: htmlPath,
                name: 'document.html'
              }
            }
          ]
        }
      ]
    });
    
    console.log('\nAnalysis Result:');
    console.log(response.choices[0].message.content);
    
  } catch (error) {
    console.error('Error analyzing HTML document:', error);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
  }
}

// Run the example
analyzeHtmlDocument()
  .then(() => {
    console.log('\n--- Using file path method ---\n');
    return analyzeHtmlDocumentWithPath();
  })
  .catch(console.error);