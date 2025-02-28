/**
 * Image Generation Example
 * 
 * This example demonstrates how to use the Venice AI API to generate an image.
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/image/generate-image.js
 */

const { VeniceAI } = require('../../dist');
const fs = require('fs');
const path = require('path');

// Initialize the client with your API key
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

async function main() {
  try {
    console.log('Generating image...');
    
    // Generate an image
    const response = await venice.image.generate({
      model: 'fluently-xl', // You can use any available image model
      prompt: 'A beautiful sunset over a mountain range with a lake in the foreground',
      negative_prompt: 'blurry, distorted, low quality',
      style_preset: '3D Model',
      height: 1024,
      width: 1024,
      steps: 30,
      cfg_scale: 7.5,
      seed: Math.floor(Math.random() * 1000000), // Random seed for variety
      return_binary: false // Set to true to get binary data instead of base64
    });
    
    console.log('Image generated successfully!');
    
    // Save the image to a file
    if (response.images && response.images.length > 0) {
      const image = response.images[0];
      
      if (image.b64_json) {
        // Save base64 image
        const buffer = Buffer.from(image.b64_json, 'base64');
        const outputPath = path.join(__dirname, 'generated-image.png');
        
        fs.writeFileSync(outputPath, buffer);
        console.log(`Image saved to: ${outputPath}`);
      } else if (image.url) {
        // Display URL
        console.log(`Image URL: ${image.url}`);
      }
    }
    
    // Display rate limit information if available
    if (response._metadata?.rateLimit) {
      const rateLimit = response._metadata.rateLimit;
      console.log('\nRate Limit:');
      console.log(`  Remaining: ${rateLimit.remaining}/${rateLimit.limit}`);
      console.log(`  Resets at: ${new Date(rateLimit.reset * 1000).toLocaleString()}`);
    }
    
    // Display balance information if available
    if (response._metadata?.balance) {
      const balance = response._metadata.balance;
      console.log('\nBalance:');
      console.log(`  VCU: ${balance.vcu}`);
      console.log(`  USD: ${balance.usd}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
      console.error('Status:', error.status);
    }
    
    if (error.rateLimitInfo) {
      console.error('Rate limit exceeded. Try again after:', 
        new Date(error.rateLimitInfo.reset * 1000).toLocaleString());
    }
  }
}

main();