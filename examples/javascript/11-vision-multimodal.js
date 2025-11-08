#!/usr/bin/env node

/**
 * Vision Multimodal - Image Analysis with AI
 * 
 * Demonstrates comprehensive vision capabilities using the Venice AI SDK.
 * Supports image analysis with both local files and URLs, using the modern
 * SDK interface instead of raw HTTP requests.
 * 
 * This example shows:
 * - Vision model usage with the SDK
 * - Image file reading and base64 encoding
 * - Multimodal message structure (text + image)
 * - Error handling for vision requests
 * - Command-line argument parsing
 * 
 * Prerequisites:
 * - Node.js installed
 * - Venice AI SDK installed (@venice-dev-tools/core)
 * - VENICE_API_KEY environment variable set
 * - An image file to analyze
 * 
 * Run with: node 11-vision-multimodal.js <image_file> [prompt]
 */

const { VeniceAI } = require('@venice-dev-tools/core');
const { loadEnv, requireEnv, ensureChatCompletionResponse, displayUsage, formatError } = require('./utils');
const fs = require('fs');
const path = require('path');

/**
 * Encode image file to base64 data URL.
 * 
 * @param {string} imagePath - Path to image file
 * @returns {string} Base64-encoded data URL
 */
function encodeImageToDataURL(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  
  // Detect MIME type from extension
  const ext = path.extname(imagePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  
  const mimeType = mimeTypes[ext] || 'image/jpeg';
  
  return `data:${mimeType};base64,${base64Image}`;
}

/**
 * Main function.
 */
async function main() {
  // Load environment variables
  loadEnv();
  
  // Parse command-line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node 11-vision-multimodal.js <image_file> [prompt]\n');
    console.log('Arguments:');
    console.log('  image_file  Path to image file (jpg, png, gif, webp)');
    console.log('  prompt      Optional prompt (default: "Describe this image in detail")\n');
    console.log('Examples:');
    console.log('  node 11-vision-multimodal.js photo.jpg');
    console.log('  node 11-vision-multimodal.js photo.jpg "What objects do you see?"');
    console.log('  node 11-vision-multimodal.js sunset.png "Describe the colors"\n');
    process.exit(1);
  }
  
  const imageFile = args[0];
  const prompt = args[1] || 'Describe this image in detail';
  
  // Validate image file exists
  if (!fs.existsSync(imageFile)) {
    console.error(`❌ Error: Image file not found: ${imageFile}\n`);
    process.exit(1);
  }
  
  console.log('🔍 Analyzing image with Venice AI Vision...\n');
  console.log(`   📷 Image: ${imageFile}`);
  console.log(`   🤖 Model: qwen-2.5-vl`);
  console.log(`   📝 Prompt: ${prompt}\n`);
  
  // Get API key from environment
  const apiKey = requireEnv('VENICE_API_KEY');
  
  // Initialize Venice AI client
  const venice = new VeniceAI({ apiKey });
  
  try {
    console.log('🔧 Encoding image...\n');
    
    // Encode image to base64 data URL
    const imageDataURL = encodeImageToDataURL(imageFile);
    
    console.log('🔧 Requesting vision analysis...\n');
    
    // Create vision request with multimodal content
    const result = await venice.chat.completions.create({
      model: 'qwen-2.5-vl',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataURL
              }
            }
          ]
        }
      ]
    });
    
    // Ensure we got a non-streaming response
    const response = ensureChatCompletionResponse(result, 'vision analysis');
    
    // Display the response
    console.log('✨ Response:\n');
    console.log(response.choices[0].message.content);
    console.log('');
    
    // Display usage statistics
    displayUsage(response);
    
    console.log('✅ Analysis completed successfully!\n');
    console.log('💡 Tips:');
    console.log('   • Try different prompts to extract specific information');
    console.log('   • Use follow-up questions by including previous context');
    console.log('   • The qwen-2.5-vl model excels at detailed visual analysis\n');
    
  } catch (error) {
    formatError(error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main, encodeImageToDataURL };
