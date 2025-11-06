/**
 * Image Generation - Create images with AI
 * 
 * This example demonstrates how to generate images using
 * Venice AI's image generation models.
 * 
 * Features:
 * - Text-to-image generation
 * - Custom sizes and styles
 * - Multiple image formats
 * 
 * Run with: npx tsx examples/typescript/05-image-generation.ts
 */

import { VeniceAI } from '@venice-dev-tools/core';
import fs from 'fs';
import path from 'path';

async function main() {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    console.error('❌ VENICE_API_KEY not set');
    process.exit(1);
  }

  const venice = new VeniceAI({ apiKey });

  console.log('🎨 Generating image with Venice AI...\n');

  try {
    // Generate an image
    const response = await venice.images.generate({
      prompt: 'A serene mountain landscape at sunset, with a crystal-clear lake reflecting the golden sky',
      n: 1,                    // Number of images to generate
      size: '1024x1024',       // Image dimensions
      // style: 'vivid',       // Optional: 'vivid' or 'natural'
      // quality: 'hd',        // Optional: 'standard' or 'hd'
    });

    console.log('✅ Image generated successfully!');
    console.log(`   Generated ${response.data.length} image(s)`);
    console.log('');

    // Process each generated image
    for (let i = 0; i < response.data.length; i++) {
      const imageData = response.data[i];
      
      console.log(`📷 Image ${i + 1}:`);
      
      // Check if URL or base64 data
      if (imageData.url) {
        console.log(`   URL: ${imageData.url}`);
        console.log('   💡 Tip: Download this URL to save the image');
      } else if (imageData.b64_json) {
        // Save base64 image to file
        const buffer = Buffer.from(imageData.b64_json, 'base64');
        const filename = `generated-image-${i + 1}-${Date.now()}.png`;
        const filepath = path.join(process.cwd(), filename);
        
        fs.writeFileSync(filepath, buffer);
        console.log(`   ✅ Saved to: ${filename}`);
        console.log(`   📁 Full path: ${filepath}`);
      }
      
      if (imageData.revised_prompt) {
        console.log(`   📝 Revised prompt: ${imageData.revised_prompt}`);
      }
      
      console.log('');
    }

    console.log('🎉 Image generation complete!');
    
  } catch (error: any) {
    console.error('❌ Error generating image:', error.message);
    
    // Handle specific errors
    if (error.statusCode === 400) {
      console.error('   💡 Check your prompt for prohibited content');
    } else if (error.statusCode === 429) {
      console.error('   💡 Rate limit exceeded, please wait and try again');
    }
    
    process.exit(1);
  }
}

main();
