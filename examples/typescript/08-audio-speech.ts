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

async function main() {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    console.error('❌ VENICE_API_KEY not set');
    process.exit(1);
  }

  const venice = new VeniceAI({ apiKey });

  const text = process.argv[2] || 'Hello! Welcome to Venice AI text to speech.';

  console.log('🎙️  Converting text to speech...');
  console.log(`   Text: "${text}"\n`);

  try {
    // Generate speech from text
    const response = await venice.audio.speech.create({
      model: 'tts-1',  // or 'tts-1-hd' for higher quality
      input: text,
      voice: 'alloy',  // Options: alloy, echo, fable, onyx, nova, shimmer
      // speed: 1.0,   // Optional: 0.25 to 4.0
    });

    console.log('✅ Speech generated successfully!\n');

    // Save audio to file
    const filename = `speech-${Date.now()}.mp3`;
    const filepath = path.join(process.cwd(), filename);

    // Response is audio data
    fs.writeFileSync(filepath, response);

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
    
    if (error.statusCode === 400) {
      console.error('   💡 Check that your text is under 4096 characters');
    }
    
    process.exit(1);
  }
}

main();
