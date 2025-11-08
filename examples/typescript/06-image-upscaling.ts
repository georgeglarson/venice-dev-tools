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

async function toBufferFromUpscalePayload(payload: unknown): Promise<Buffer | null> {
  if (payload instanceof ArrayBuffer) {
    return Buffer.from(payload);
  }

  if (typeof Blob !== 'undefined' && payload instanceof Blob) {
    const arrayBuffer = await payload.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const buffer = await toBufferFromUpscalePayload(item);
      if (buffer) {
        return buffer;
      }
    }
    return null;
  }

  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (!trimmed) {
      return null;
    }

    const base64Segment = trimmed.includes(',')
      ? trimmed.split(',').pop() || ''
      : trimmed;

    try {
      return Buffer.from(base64Segment, 'base64');
    } catch {
      return null;
    }
  }

  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;

    if ('data' in obj) {
      return toBufferFromUpscalePayload(obj.data);
    }

    if (typeof obj.b64_json === 'string') {
      return Buffer.from(obj.b64_json, 'base64');
    }

    if (typeof obj.url === 'string') {
      return toBufferFromUpscalePayload(obj.url);
    }
  }

  return null;
}

function describeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return String(value);
  }

  if (value instanceof ArrayBuffer) {
    return `ArrayBuffer(byteLength=${value.byteLength})`;
  }

  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return `Blob(size=${value.size}, type=${value.type || 'unknown'})`;
  }

  if (Array.isArray(value)) {
    return `Array(length=${value.length})`;
  }

  if (typeof value === 'string') {
    const sample = value.slice(0, 32);
    const suffix = value.length > 32 ? '…' : '';
    return `string(length=${value.length}, sample="${sample}${suffix}")`;
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>);
    return `Object(keys=[${keys.join(', ')}])`;
  }

  return typeof value;
}

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
  const veniceInternal = venice as any;
  if (veniceInternal && !veniceInternal.config) {
    const baseUrl =
      veniceInternal.configManager?.getBaseUrl?.() ??
      'https://api.venice.ai/api/v1';
    veniceInternal.config = { baseUrl };
  }

  console.log('🔍 Upscaling image...');
  console.log(`   Input: ${imagePath}\n`);

  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    const imageArrayBuffer = imageBuffer.buffer.slice(
      imageBuffer.byteOffset,
      imageBuffer.byteOffset + imageBuffer.byteLength
    ) as ArrayBuffer;

    // Upscale the image
    const response = await venice.images.upscale({
      image: imageArrayBuffer,
      scale: 2,
    });

    console.log('✅ Image upscaled successfully!\n');

    const buffer = await toBufferFromUpscalePayload(response);

    if (buffer) {
      const filename = path.basename(imagePath, path.extname(imagePath)) + '-upscaled.png';
      const outputPath = path.join(path.dirname(imagePath), filename);

      fs.writeFileSync(outputPath, buffer);

      console.log('💾 Saved upscaled image:');
      console.log(`   ${outputPath}`);
      console.log('');

      const originalSize = fs.statSync(imagePath).size;
      const upscaledSize = fs.statSync(outputPath).size;

      console.log('📊 Size comparison:');
      console.log(`   Original:  ${(originalSize / 1024).toFixed(2)} KB`);
      console.log(`   Upscaled:  ${(upscaledSize / 1024).toFixed(2)} KB`);
      console.log(`   Ratio:     ${(upscaledSize / originalSize).toFixed(2)}x`);
    } else {
      console.warn('⚠️  No upscaled image data detected in response.');
      console.warn(`   Response shape: ${describeValue(response)}`);
    }

    console.log('\n🎉 Upscaling complete!');
    
  } catch (error: any) {
    console.error('\n❌ Error upscaling image:', error.message);
    
    if (error.status) {
      console.error(`   HTTP status: ${error.status}`);
    } else if (error.statusCode) {
      console.error(`   HTTP status: ${error.statusCode}`);
    }

    if (error.details) {
      console.error('   Details:', error.details);
    }

    if (error.statusCode === 400 || error.status === 400) {
      console.error('   💡 Make sure the image format is supported (JPEG, PNG) and that scale is 2 or 4.');
    } else if (error.statusCode === 413 || error.status === 413) {
      console.error('   💡 Image file too large, try a smaller file');
    }
    
    process.exit(1);
  }
}

main();
