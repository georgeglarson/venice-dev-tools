/**
 * Vision Multimodal - Process images in chat
 * 
 * This example demonstrates how to use vision-enabled models
 * to analyze images and answer questions about them.
 * 
 * Use cases:
 * - Image description and analysis
 * - Visual question answering
 * - OCR and text extraction
 * - Object detection
 * 
 * Run with: npx tsx examples/typescript/11-vision-multimodal.ts <image-path>
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

  const imagePath = process.argv[2];
  if (!imagePath) {
    console.error('❌ Please provide an image path');
    console.error('   Usage: npx tsx examples/typescript/11-vision-multimodal.ts <image-path>');
    process.exit(1);
  }

  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Image not found: ${imagePath}`);
    process.exit(1);
  }

  const venice = new VeniceAI({ apiKey });

  console.log('👁️  Analyzing image with vision model...');
  console.log(`   Image: ${imagePath}\n`);

  try {
    // Read and encode image
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Analyze image
    const response = await venice.chat.completions.create({
      model: 'qwen-2.5-vl', // Vision-enabled model
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this image in detail. What do you see?'
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ]
    });

    console.log('✅ Analysis complete!\n');
    console.log('📝 Description:');
    console.log(response.choices[0].message.content);
    console.log('');

    // Follow-up question
    console.log('🔍 Asking follow-up question...\n');

    const followUp = await venice.chat.completions.create({
      model: 'qwen-2.5-vl',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'What colors are prominent in this image?'
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ]
    });

    console.log('🎨 Color analysis:');
    console.log(followUp.choices[0].message.content);
    console.log('');

    console.log('💡 Vision model capabilities:');
    console.log('   • Image description and captioning');
    console.log('   • Object detection and counting');
    console.log('   • Text recognition (OCR)');
    console.log('   • Visual question answering');
    console.log('   • Scene understanding');

  } catch (error: any) {
    console.error('❌ Error analyzing image:', error.message);
    process.exit(1);
  }
}

main();
