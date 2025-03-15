/**
 * Example demonstrating PDF processing options in Venice AI SDK
 *
 * This example shows how to use the different PDF processing modes:
 * - image: Send the PDF as an image (default)
 * - text: Extract text from the PDF and send as text
 * - both: Extract both text and images, sending multiple content items
 */
// For running directly from the repository
const { VeniceNode } = require('../packages/node/src/venice-node');

// Initialize the Venice AI client
const venice = new VeniceNode({
  apiKey: process.env.VENICE_API_KEY
});

async function processPdfExample() {
  // Path to a PDF file
  const pdfPath = './examples/test-document.pdf';
  
  console.log('Example 1: Processing PDF as image (default mode)');
  try {
    const response1 = await venice.chat.createCompletion({
      model: 'llama-3.3-70b',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this PDF document.'
            },
            // The PDF will be processed as an image by default
            await require('../packages/node/src/utils/file-processor').processFile(pdfPath)
          ]
        }
      ]
    });
    console.log('Response (image mode):', response1.choices[0].message.content);
  } catch (error) {
    console.error('Error in image mode:', error.message);
  }

  console.log('\nExample 2: Processing PDF as text');
  try {
    const response2 = await venice.chat.createCompletion({
      model: 'llama-3.3-70b',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this PDF document.'
            },
            // Process the PDF as text
            await require('../packages/node/src/utils/file-processor').processFile(pdfPath, { pdfMode: 'text' })
          ]
        }
      ]
    });
    console.log('Response (text mode):', response2.choices[0].message.content);
  } catch (error) {
    console.error('Error in text mode:', error.message);
  }

  console.log('\nExample 3: Processing PDF as both text and image');
  try {
    const response3 = await venice.chat.createCompletion({
      model: 'llama-3.3-70b',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this PDF document.'
            },
            // Process the PDF as both text and image
            ...(await require('../packages/node/src/utils/file-processor').processFile(pdfPath, { pdfMode: 'both' }))
          ]
        }
      ]
    });
    console.log('Response (both mode):', response3.choices[0].message.content);
  } catch (error) {
    console.error('Error in both mode:', error.message);
  }
}

// Run the example
processPdfExample().catch(console.error);

/**
 * CLI Examples:
 * 
 * # Process PDF as image (default)
 * venice chat completion --model llama-3.3-70b --attach examples/test-document.pdf
 *
 * # Process PDF as text
 * venice chat completion --model llama-3.3-70b --attach examples/test-document.pdf --pdf-mode text
 *
 * # Process PDF as both text and image
 * venice chat completion --model llama-3.3-70b --attach examples/test-document.pdf --pdf-mode both
 * 
 * # Interactive chat with PDF processing options
 * venice chat interactive --pdf-mode text
 */