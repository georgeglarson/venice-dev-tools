/**
 * Audio Transcription - Speech to text
 *
 * This example demonstrates how to transcribe audio files to text
 * using Venice AI's audio transcription API.
 *
 * Features:
 * - Transcribing audio files to text
 * - Using different transcription models
 * - Requesting and parsing word/segment timestamps
 * - Language detection and specification
 *
 * Prerequisites:
 * - VENICE_API_KEY environment variable set
 * - An audio file to transcribe (WAV, FLAC, M4A, AAC, MP4, or MP3)
 *
 * Usage:
 *   npx tsx examples/typescript/24-audio-transcription.ts [path-to-audio-file]
 *
 * If no audio file is provided, the example creates a small synthetic
 * WAV file for demonstration purposes.
 *
 * Run with: npx tsx examples/typescript/24-audio-transcription.ts
 */

import { readFileSync } from 'fs';
import { VeniceAI } from '@venice-dev-tools/core';
import { requireEnv } from './env-config';

/**
 * Create a minimal valid WAV file (silence) for demonstration.
 * In production you would supply a real recording.
 */
function createSilentWav(durationSeconds: number = 1, sampleRate: number = 16000): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const numSamples = sampleRate * durationSeconds;
  const dataSize = numSamples * numChannels * bytesPerSample;
  const headerSize = 44;
  const buffer = Buffer.alloc(headerSize + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);           // chunk size
  buffer.writeUInt16LE(1, 20);            // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28);
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  // Samples are already zero (silence)

  return buffer;
}

async function main() {
  const apiKey = requireEnv('VENICE_API_KEY');
  const venice = new VeniceAI({ apiKey });

  console.log('🎤 Audio Transcription Demo\n');

  // Determine audio source
  const audioPath = process.argv[2];
  let audioBuffer: Buffer;
  let audioSource: string;

  if (audioPath) {
    console.log(`📁 Loading audio file: ${audioPath}`);
    try {
      audioBuffer = readFileSync(audioPath);
      audioSource = audioPath;
      console.log(`   Size: ${(audioBuffer.length / 1024).toFixed(1)} KB\n`);
    } catch (error: any) {
      console.error(`❌ Could not read file: ${error.message}`);
      console.log('   Please provide a valid audio file path.');
      console.log('   Supported formats: WAV, FLAC, M4A, AAC, MP4, MP3\n');
      return;
    }
  } else {
    console.log('ℹ️  No audio file provided — using synthetic silence for demo');
    console.log('   To transcribe a real file, run:');
    console.log('   npx tsx examples/typescript/24-audio-transcription.ts path/to/audio.wav\n');
    audioBuffer = createSilentWav(1);
    audioSource = '(synthetic silence)';
  }

  // Create a Blob from the buffer
  const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });

  // Example 1: Basic transcription
  console.log('📝 Example 1: Basic Transcription');
  console.log('═'.repeat(50));

  try {
    const result = await venice.audio.transcription.create({
      file: audioBlob,
      model: 'openai/whisper-large-v3',
      language: 'en',
    });

    console.log('✅ Transcription result:');
    console.log(`   Text: "${result.text}"`);

    if (result.duration !== undefined) {
      console.log(`   Duration: ${result.duration.toFixed(2)}s`);
    }

  } catch (error: any) {
    console.error('❌ Transcription error:', error.message);
    if (audioSource === '(synthetic silence)') {
      console.log('   ℹ️  This is expected with a silent audio file.');
      console.log('   Provide a real audio file for meaningful results.');
    }
  }

  // Example 2: Transcription with timestamps
  console.log('\n\n⏱️  Example 2: Transcription with Timestamps');
  console.log('═'.repeat(50));

  try {
    const result = await venice.audio.transcription.create({
      file: audioBlob,
      model: 'openai/whisper-large-v3',
      language: 'en',
      timestamps: true,
      response_format: 'json',
    });

    console.log('✅ Transcription with timestamps:');
    console.log(`   Text: "${result.text}"`);

    if (result.timestamps) {
      // Display segment-level timestamps
      if (result.timestamps.segment && result.timestamps.segment.length > 0) {
        console.log('\n   📍 Segments:');
        for (const seg of result.timestamps.segment) {
          const start = seg.start.toFixed(2);
          const end = seg.end.toFixed(2);
          console.log(`      [${start}s - ${end}s] ${seg.text}`);
        }
      }

      // Display word-level timestamps
      if (result.timestamps.word && result.timestamps.word.length > 0) {
        console.log('\n   📍 Words:');
        for (const word of result.timestamps.word) {
          const start = word.start.toFixed(2);
          const end = word.end.toFixed(2);
          console.log(`      [${start}s - ${end}s] "${word.word}"`);
        }
      }
    } else {
      console.log('   ℹ️  No timestamp data returned');
    }

  } catch (error: any) {
    console.error('❌ Transcription error:', error.message);
    if (audioSource === '(synthetic silence)') {
      console.log('   ℹ️  This is expected with a silent audio file.');
    }
  }

  // Example 3: Using the Nvidia Parakeet model
  console.log('\n\n🦜 Example 3: Nvidia Parakeet Model');
  console.log('═'.repeat(50));

  try {
    const result = await venice.audio.transcription.create({
      file: audioBlob,
      model: 'nvidia/parakeet-tdt-0.6b-v3',
    });

    console.log('✅ Parakeet transcription:');
    console.log(`   Text: "${result.text}"`);

    if (result.duration !== undefined) {
      console.log(`   Duration: ${result.duration.toFixed(2)}s`);
    }

  } catch (error: any) {
    console.error('❌ Parakeet transcription error:', error.message);
    if (audioSource === '(synthetic silence)') {
      console.log('   ℹ️  This is expected with a silent audio file.');
    }
  }

  // Summary
  console.log('\n\n💡 Audio Transcription Tips:');
  console.log('   • Supported formats: WAV, FLAC, M4A, AAC, MP4, MP3');
  console.log('   • Models: openai/whisper-large-v3, nvidia/parakeet-tdt-0.6b-v3');
  console.log('   • Set timestamps: true to get word/segment timing data');
  console.log('   • Specify language (ISO 639-1) for better accuracy, or omit for auto-detect');
  console.log('   • Use response_format: "json" for structured output with metadata');
  console.log('   • Use response_format: "text" for plain text only');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
