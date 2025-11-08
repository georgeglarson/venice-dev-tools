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
import { ensureChatCompletionResponse } from './utils';
import { requireEnv } from './env-config';

async function resolveVisionModel(venice: VeniceAI, fallbackModel = 'qwen-2.5-vl'): Promise<string> {
  try {
    const [imageModels, textModels] = await Promise.all([
      venice.models.list({ type: 'image' }),
      venice.models.list({ type: 'text' })
    ]);

    const combined = [...imageModels.data, ...textModels.data];
    if (!combined.length) {
      throw new Error('No models returned by API.');
    }

    const supportsVision = combined.filter((model) => {
      const capabilities = model.model_spec?.capabilities as Record<string, unknown> | undefined;
      return Boolean(capabilities && 'supportsVision' in capabilities && capabilities.supportsVision);
    });

    if (supportsVision.length) {
      const preferredVision = supportsVision.find((model) => model.id === fallbackModel);
      if (preferredVision) {
        return preferredVision.id;
      }

      const defaultVision = supportsVision.find((model) => {
        const traits = model.model_spec?.traits as string[] | undefined;
        return traits?.includes?.('default_vision');
      });
      if (defaultVision) {
        return defaultVision.id;
      }

      return supportsVision[0].id;
    }

    const preferred = combined.find((model) => model.id === fallbackModel);
    if (preferred) {
      return preferred.id;
    }

    const visionTraitModel = combined.find((model) =>
      model.model_spec?.traits?.includes?.('vision')
    );
    if (visionTraitModel) {
      return visionTraitModel.id;
    }

    return combined[0].id;
  } catch (error: any) {
    throw new Error(`Unable to determine a vision model: ${error.message}`);
  }
}

async function main() {
  const apiKey = requireEnv('VENICE_API_KEY');

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
  const visionModel = await resolveVisionModel(venice, 'qwen-2.5-vl');

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
    console.log(`   Using model: ${visionModel}\n`);

    const rawResponse = await venice.chat.completions.create({
      model: visionModel,
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
    const response = ensureChatCompletionResponse(rawResponse, 'Vision analysis response');

    console.log('✅ Analysis complete!\n');
    console.log('📝 Description:');
    console.log(response.choices[0].message.content);
    console.log('');

    // Follow-up question
    console.log('🔍 Asking follow-up question...\n');

    const rawFollowUp = await venice.chat.completions.create({
      model: visionModel,
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
    const followUp = ensureChatCompletionResponse(rawFollowUp, 'Vision follow-up response');

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
