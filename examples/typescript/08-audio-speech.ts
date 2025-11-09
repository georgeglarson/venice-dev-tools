/**
 * Audio Speech - Text-to-Speech synthesis
 * 
 * This example demonstrates how to convert text to speech
 * using Venice AI's audio models.
 * 
 * Features:
 * - Multiple voice options
 * - Different speech models
 * - Save audio to file
 * 
 * Run with: npx tsx examples/typescript/08-audio-speech.ts
 */

import { VeniceAI } from '@venice-dev-tools/core';
import fs from 'fs';
import path from 'path';
import { requireEnv } from './env-config';

async function getAudioBuffer(payload: unknown): Promise<Buffer> {
  if (payload instanceof ArrayBuffer) {
    return Buffer.from(payload);
  }

  if (ArrayBuffer.isView(payload)) {
    return Buffer.from(payload.buffer, payload.byteOffset, payload.byteLength);
  }

  if (typeof Blob !== 'undefined' && payload instanceof Blob) {
    const arrayBuffer = await payload.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  if (typeof payload === 'string') {
    // Assume base64-encoded audio
    return Buffer.from(payload, 'base64');
  }

  if (payload instanceof Buffer) {
    return payload;
  }

  throw new Error('Unsupported audio payload type.');
}

async function main() {
  const apiKey = requireEnv('VENICE_API_KEY');

  const venice = new VeniceAI({ apiKey });

  const text = process.argv[2] || 'Hello! Welcome to Venice AI text to speech.';

  console.log('🎙️  Converting text to speech...');
  console.log(`   Text: "${text}"\n`);

  try {
    // Generate speech from text
    const response = await venice.audio.speech.create({
      model: 'tts-kokoro',
      input: text,
      voice: 'af_alloy',  // See VOICES constants for full list
      // speed: 1.0,   // Optional: 0.25 to 4.0
    });

    console.log('✅ Speech generated successfully!\n');

    // Save audio to file
    const filename = `speech-${Date.now()}.mp3`;
    const filepath = path.join(process.cwd(), filename);

    const audioBuffer = await getAudioBuffer(response);
    fs.writeFileSync(filepath, audioBuffer);

    console.log('💾 Audio saved:');
    console.log(`   ${filename}`);
    console.log(`   📁 ${filepath}`);
    console.log('');
    
    const fileSizeKB = (fs.statSync(filepath).size / 1024).toFixed(2);
    console.log(`📊 File size: ${fileSizeKB} KB`);
    console.log('');
    
    console.log('🎉 Text-to-speech conversion complete!');
    console.log('');
    console.log('💡 Available voices:');
    console.log('   • alloy   - Neutral and balanced');
    console.log('   • echo    - Clear and expressive');
    console.log('   • fable   - Warm and storytelling');
    console.log('   • onyx    - Deep and authoritative');
    console.log('   • nova    - Young and energetic');
    console.log('   • shimmer - Soft and pleasant');

  } catch (error: any) {
    console.error('❌ Error generating speech:', error.message);

    if (error.status || error.statusCode) {
      console.error(`   HTTP status: ${error.status ?? error.statusCode}`);
    }

    if (error.details) {
      console.error('   Details:', error.details);
    }

    if ((error.statusCode ?? error.status) === 400) {
      console.error('   💡 Check that your text is under 4096 characters and that the model/voice pair is valid.');
    }

    process.exit(1);
  }
}

main();
