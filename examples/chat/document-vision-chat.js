/**
 * Document Vision Chat Example
 * 
 * This example demonstrates how to use the Venice AI API to chat with HTML documents.
 * The example shows how to use both the CLI interface and programmatic API.
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/chat/document-vision-chat.js
 */

const { VeniceAI } = require('../../dist');
const fs = require('fs');
const path = require('path');

// Initialize the client with your API key
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

// Enable debug logging to see detailed information
venice.enableDebugLogging();

async function documentChat() {
  try {
    console.log('Demonstrating document vision chat...\n');
    
    // Create a simple HTML file for demonstration
    const sampleHtmlPath = path.join(__dirname, '../../sample-document.html');
    const sampleHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sample Document for Venice AI</title>
      </head>
      <body>
        <h1>Venice AI Sample Document</h1>
        <p>This is a sample document created for testing the Venice AI document chat functionality.</p>
        
        <h2>About Venice AI</h2>
        <p>Venice AI is a powerful AI platform that provides various capabilities including:</p>
        <ul>
          <li>Text generation and chat</li>
          <li>Image generation</li>
          <li>Document understanding</li>
          <li>Function calling</li>
        </ul>
        
        <h2>Sample Data</h2>
        <p>Here is some sample data to test extraction capabilities:</p>
        <table border="1">
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Stock</th>
          </tr>
          <tr>
            <td>Widget A</td>
            <td>$19.99</td>
            <td>42</td>
          </tr>
          <tr>
            <td>Gadget B</td>
            <td>$24.95</td>
            <td>15</td>
          </tr>
          <tr>
            <td>Tool C</td>
            <td>$34.50</td>
            <td>7</td>
          </tr>
        </table>
        
        <h2>Contact Information</h2>
        <p>For more information, contact:</p>
        <p>Email: example@venice.ai</p>
        <p>Phone: (555) 123-4567</p>
      </body>
      </html>
    `;
    
    fs.writeFileSync(sampleHtmlPath, sampleHtmlContent);
    console.log(`Created sample HTML document at: ${sampleHtmlPath}`);
    
    // Step 1: Chat with document using CLI interface
    try {
      console.log('\nStep 1: Chatting with document using CLI interface');
      console.log('Prompt: "What information is in this document?"');
      
      const chatResult = await venice.cli(
        `vision-chat "What information is in this document?" -i ${sampleHtmlPath} -m qwen-2.5-vl`
      );
      
      console.log('\nResponse:');
      console.log(chatResult);
    } catch (error) {
      console.log('Error with document chat:', error.message);
      console.log('Vision models may not be available in your environment or with your API key permissions.');
    }
    
    // Step 2: Extract specific information
    try {
      console.log('\nStep 2: Extracting specific information');
      console.log('Prompt: "What products are listed in the table and what are their prices?"');
      
      const extractResult = await venice.cli(
        `vision-chat "What products are listed in the table and what are their prices?" -i ${sampleHtmlPath} -m qwen-2.5-vl`
      );
      
      console.log('\nResponse:');
      console.log(extractResult);
    } catch (error) {
      console.log('Error extracting information:', error.message);
    }
    
    // Step 3: Using programmatic API
    try {
      console.log('\nStep 3: Using programmatic API');
      
      // Read the HTML file
      const htmlBuffer = fs.readFileSync(sampleHtmlPath);
      const base64Html = htmlBuffer.toString('base64');
      
      // Create the message with document content
      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'What is the contact email and phone number mentioned in this document?'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:text/html;base64,${base64Html}`
              }
            }
          ]
        }
      ];
      
      const programmaticResult = await venice.chat.completions.create({
        model: 'qwen-2.5-vl',
        messages: messages
      });
      
      console.log('\nProgrammatic response:');
      console.log(programmaticResult.choices[0].message.content);
    } catch (error) {
      console.log('Error with programmatic API:', error.message);
      console.log('Direct API calls may require specific permissions or may not be available in all environments.');
    }
    
    console.log('\nDocument chat demo completed!');
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the example
documentChat();