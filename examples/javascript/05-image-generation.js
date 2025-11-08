#!/usr/bin/env node

/**
 * Image Generation - Create Images from Text Prompts
 * 
 * Demonstrates how to generate images using the Venice AI image generation API.
 * The SDK returns image data which can be saved to disk or processed further.
 * 
 * This example shows:
 * - Image generation with the SDK
 * - Handling base64-encoded image responses
 * - Saving images to files
 * - Command-line argument parsing
 * - URL vs base64 response handling
 * 
 * Prerequisites:
 * - Node.js installed
 * - Venice AI SDK installed (@venice-dev-tools/core)
 * - VENICE_API_KEY environment variable set
 * 
 * Run with: node 05-image-generation.js [prompt] [output_file]
 */

const { VeniceAI } = require('@venice-dev-tools/core');
const { loadEnv, requireEnv, saveFile, formatError } = require('./utils');
const fs = require('fs');
const path = require('path');

/**
 * Main function.
 */
async function main() {
  // Load environment variables
  loadEnv();
  
  // Parse command-line arguments
  const args = process.argv.slice(2);
  const prompt = args[0] || 'A majestic mountain landscape at sunset, with snow-capped peaks glowing in golden light, painted in the style of Albert Bierstadt';
  const outputFile = args[1] || 'generated-image.png';
  
  console.log('🎨 Generating image with Venice AI...\n');
  console.log(`   📝 Prompt: ${prompt}`);
  console.log(`   📁 Output: ${outputFile}\n`);
  
  // Get API key from environment
  const apiKey = requireEnv('VENICE_API_KEY');
  
  // Initialize Venice AI client
  const venice = new VeniceAI({ apiKey });
  
  try {
    console.log('🔧 Sending image generation request...\n');
    
    // Create image generation request
    const response = await venice.images.generate({
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json'
    });
    
    // Check response structure
    if (!response.data || response.data.length === 0) {
      console.error('❌ Error: No image data in response\n');
      console.error('   Response structure:', JSON.stringify(response, null, 2));
      process.exit(1);
    }
    
    const imageData = response.data[0];
    
    // Handle different response formats
    let imageBuffer;
    
    if (imageData.b64_json) {
      // Base64 format
      console.log('🔧 Decoding base64 image...\n');
      imageBuffer = Buffer.from(imageData.b64_json, 'base64');
    } else if (imageData.url) {
      // URL format (download needed)
      console.log('🔧 Downloading image from URL...\n');
      const fetch = require('node-fetch');
      const imageResponse = await fetch(imageData.url);
      imageBuffer = await imageResponse.buffer();
    } else {
      console.error('❌ Error: Unknown image data format\n');
      console.error('   Expected b64_json or url in response');
      process.exit(1);
    }
    
    // Save the image
    saveFile(outputFile, imageBuffer);
    
    console.log('✅ Image generated successfully!\n');
    
    // Display revised prompt if available
    if (imageData.revised_prompt && imageData.revised_prompt !== prompt) {
      console.log('🔄 Revised prompt:');
      console.log(`   ${imageData.revised_prompt}\n`);
    }
    
    console.log('💡 Tip: Open the image with:');
    console.log(`   - Linux: xdg-open ${outputFile}`);
    console.log(`   - macOS: open ${outputFile}`);
    console.log(`   - Windows: start ${outputFile}\n`);
    
  } catch (error) {
    formatError(error);
    process.exit(1);
  }
}

/**
 * Show help text.
 */
function showHelp() {
  console.log('Usage: node 05-image-generation.js [prompt] [output_file]\n');
  console.log('Arguments:');
  console.log('  prompt       Text description of the image (default: mountain landscape)');
  console.log('  output_file  Path to save the image (default: generated-image.png)\n');
  console.log('Examples:');
  console.log('  node 05-image-generation.js');
  console.log('  node 05-image-generation.js "A cyberpunk city at night"');
  console.log('  node 05-image-generation.js "A serene forest" forest.png\n');
}

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
