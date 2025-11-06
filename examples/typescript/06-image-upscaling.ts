/**
 * Image Upscaling - Enhance image quality
 * 
 * This example shows how to upscale images to improve
 * quality and resolution.
 * 
 * Use cases:
 * - Enhance low-resolution images
 * - Improve image quality for printing
 * - Restore old photos
 * 
 * Run with: npx tsx examples/typescript/06-image-upscaling.ts
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

  // Path to image you want to upscale
  const imagePath = process.argv[2];
  if (!imagePath) {
    console.error('❌ Please provide an image path');
    console.error('   Usage: npx tsx examples/typescript/06-image-upscaling.ts <image-path>');
    console.error('   Example: npx tsx examples/typescript/06-image-upscaling.ts ./my-photo.jpg');
    process.exit(1);
  }

  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Image not found: ${imagePath}`);
    process.exit(1);
  }

  const venice = new VeniceAI({ apiKey });

  console.log('🔍 Upscaling image...');
  console.log(`   Input: ${imagePath}\n`);

  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Detect image type
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

    // Upscale the image
    const response = await venice.images.upscale({
      image: base64Image,
      // scale: 2,  // Optional: upscale factor (2x, 4x, etc.)
    });

    console.log('✅ Image upscaled successfully!\n');

    // Save the upscaled image
    if (response.data && response.data.length > 0) {
      const upscaledData = response.data[0];
      
      if (upscaledData.b64_json) {
        const buffer = Buffer.from(upscaledData.b64_json, 'base64');
        const filename = path.basename(imagePath, path.extname(imagePath)) + '-upscaled.png';
        const outputPath = path.join(path.dirname(imagePath), filename);
        
        fs.writeFileSync(outputPath, buffer);
        
        console.log('💾 Saved upscaled image:');
        console.log(`   ${outputPath}`);
        console.log('');
        
        // Show file sizes
        const originalSize = fs.statSync(imagePath).size;
        const upscaledSize = fs.statSync(outputPath).size;
        
        console.log('📊 Size comparison:');
        console.log(`   Original:  ${(originalSize / 1024).toFixed(2)} KB`);
        console.log(`   Upscaled:  ${(upscaledSize / 1024).toFixed(2)} KB`);
        console.log(`   Ratio:     ${(upscaledSize / originalSize).toFixed(2)}x`);
      } else if (upscaledData.url) {
        console.log('🔗 Upscaled image URL:');
        console.log(`   ${upscaledData.url}`);
      }
    }

    console.log('\n🎉 Upscaling complete!');
    
  } catch (error: any) {
    console.error('\n❌ Error upscaling image:', error.message);
    
    if (error.statusCode === 400) {
      console.error('   💡 Make sure the image format is supported (JPEG, PNG)');
    } else if (error.statusCode === 413) {
      console.error('   💡 Image file too large, try a smaller file');
    }
    
    process.exit(1);
  }
}

main();
