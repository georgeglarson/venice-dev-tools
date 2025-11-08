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

interface VeniceImageObject {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
  [key: string]: unknown;
}

interface ImageItem {
  buffer: Buffer | null;
  remoteUrl?: string;
  revisedPrompt?: string;
}

async function resolveImageModel(venice: VeniceAI, preferredModel = 'fluently-xl'): Promise<string> {
  try {
    const models = await venice.models.list({ type: 'image' });
    if (!models.data.length) {
      throw new Error('No image-capable models returned by the API.');
    }

    const preferred = models.data.find((model) => model.id === preferredModel);
    if (preferred) {
      return preferred.id;
    }

    // Fall back to the first available model.
    return models.data[0].id;
  } catch (error: any) {
    throw new Error(`Unable to determine an image model: ${error.message}`);
  }
}

function isVeniceImageObject(value: unknown): value is VeniceImageObject {
  return typeof value === 'object' && value !== null && (
    'url' in value || 'b64_json' in value || 'revised_prompt' in value
  );
}

function extractFromObject(payload: VeniceImageObject): ImageItem {
  const revisedPrompt = typeof payload.revised_prompt === 'string' ? payload.revised_prompt : undefined;

  if (typeof payload.b64_json === 'string') {
    return {
      buffer: Buffer.from(payload.b64_json, 'base64'),
      revisedPrompt
    };
  }

  if (typeof payload.url === 'string') {
    if (/^https?:\/\//i.test(payload.url)) {
      return {
        buffer: null,
        remoteUrl: payload.url,
        revisedPrompt
      };
    }

    const base64 = payload.url.includes(',') ? payload.url.split(',').pop() || '' : payload.url;
    return {
      buffer: Buffer.from(base64, 'base64'),
      revisedPrompt
    };
  }

  return { buffer: null, revisedPrompt };
}

function parseStringPayload(payload: string): ImageItem[] {
  const trimmed = payload.trim();

  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const parsed = JSON.parse(trimmed);
      return toImageItems(parsed);
    } catch {
      // Fall back to treating as base64/data URL
    }
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return [{ buffer: null, remoteUrl: trimmed }];
  }

  const base64 = trimmed.includes(',') ? trimmed.split(',').pop() || '' : trimmed;

  try {
    return [{ buffer: Buffer.from(base64, 'base64') }];
  } catch {
    return [{ buffer: null }];
  }
}

function toImageItems(payload: unknown): ImageItem[] {
  if (payload instanceof ArrayBuffer) {
    return [{ buffer: Buffer.from(payload) }];
  }

  if (typeof payload === 'string') {
    return parseStringPayload(payload);
  }

  if (Array.isArray(payload)) {
    return payload.flatMap((item) => toImageItems(item));
  }

  if (isVeniceImageObject(payload)) {
    return [extractFromObject(payload)];
  }

  if (payload && typeof payload === 'object') {
    const candidateKeys = ['data', 'image', 'images', 'result', 'results', 'output'];
    const aggregated: ImageItem[] = [];

    for (const key of candidateKeys) {
      if (key in (payload as Record<string, unknown>)) {
        aggregated.push(...toImageItems((payload as Record<string, unknown>)[key]));
      }
    }

    if (aggregated.length > 0) {
      return aggregated;
    }
  }

  return [];
}

function describePayload(payload: unknown): string {
  if (payload === null || payload === undefined) {
    return String(payload);
  }

  if (payload instanceof ArrayBuffer) {
    return `ArrayBuffer(byteLength=${payload.byteLength})`;
  }

  if (typeof payload === 'string') {
    const sample = payload.slice(0, 32);
    const suffix = payload.length > 32 ? '…' : '';
    return `string(length=${payload.length}, sample="${sample}${suffix}")`;
  }

  if (Array.isArray(payload)) {
    return `Array(length=${payload.length})`;
  }

  if (typeof payload === 'object') {
    const keys = Object.keys(payload as Record<string, unknown>);
    return `Object(keys=[${keys.join(', ')}])`;
  }

  return typeof payload;
}

function summarizeItems(items: ImageItem[], rawPayload: unknown): void {
  if (items.length === 0) {
    console.warn('⚠️  No image data returned by the API.');
    console.warn(`   Raw response shape: ${describePayload(rawPayload)}`);
  }
}

function saveImageItem(item: ImageItem, index: number): void {
  const imageNumber = index + 1;

  console.log(`📷 Image ${imageNumber}:`);

  if (item.buffer) {
    const filename = `generated-image-${imageNumber}-${Date.now()}.png`;
    const filepath = path.join(process.cwd(), filename);
    fs.writeFileSync(filepath, item.buffer);
    console.log(`   ✅ Saved to: ${filename}`);
    console.log(`   📁 Full path: ${filepath}`);
  } else if (item.remoteUrl) {
    console.log(`   🌐 Remote URL: ${item.remoteUrl}`);
    console.log('   💡 Download the image from this URL to save it locally.');
  } else {
    console.warn('   ⚠️ Unrecognized image payload; skipping save.');
  }

  if (item.revisedPrompt) {
    console.log(`   📝 Revised prompt: ${item.revisedPrompt}`);
  }

  console.log('');
}

async function main() {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    console.error('❌ VENICE_API_KEY not set');
    process.exit(1);
  }

  const venice = new VeniceAI({ apiKey });

  console.log('🎨 Generating image with Venice AI...\n');

  try {
    const modelId = await resolveImageModel(venice);
    console.log(`🧠 Using image model: ${modelId}`);

    // Generate an image
    const response = await venice.images.generate({
      model: modelId,
      prompt: 'A serene mountain landscape at sunset, with a crystal-clear lake reflecting the golden sky',
      width: 1024,
      height: 1024,
      format: 'png',
      // style: 'vivid',       // Optional: 'vivid' or 'natural'
      // quality: 'hd',        // Optional: 'standard' or 'hd'
    });

    console.log('✅ Image generated successfully!');

    const payload = (response && typeof response === 'object' && 'data' in response)
      ? (response as unknown as Record<string, unknown>)['data']
      : response;

    if (payload === response) {
      console.warn('ℹ️  Response did not include a top-level `data` field; attempting to parse entire payload.');
    }

    const items = toImageItems(payload);
    summarizeItems(items, payload);
    console.log(`   Generated ${items.length} image(s)`);
    console.log('');

    items.forEach(saveImageItem);

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
