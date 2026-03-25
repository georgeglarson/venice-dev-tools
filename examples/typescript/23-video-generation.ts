/**
 * Video Generation - Queue-based video workflow
 *
 * This example demonstrates Venice AI's asynchronous video generation
 * using the queue-based workflow: queue, poll, retrieve, and complete.
 *
 * Features:
 * - Queuing a video generation job
 * - Polling for job completion with backoff
 * - Retrieving the generated video
 * - Cleaning up with the complete endpoint
 * - Proper error handling throughout the pipeline
 *
 * Prerequisites:
 * - VENICE_API_KEY environment variable set
 * - Sufficient account balance for video generation
 *
 * Run with: npx tsx examples/typescript/23-video-generation.ts
 */

import { VeniceAI } from '@venice-dev-tools/core';
import { requireEnv } from './env-config';

/** Sleep helper for polling intervals */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const apiKey = requireEnv('VENICE_API_KEY');
  const venice = new VeniceAI({ apiKey });

  const model = 'wan-2.5-preview-t2v';
  const prompt = 'A serene mountain lake at sunrise with mist rising from the water, cinematic quality';

  console.log('🎬 Video Generation Demo\n');
  console.log(`Model:  ${model}`);
  console.log(`Prompt: "${prompt}"\n`);

  // Step 1: Get a price quote (optional but recommended)
  console.log('💰 Step 1: Getting price quote');
  console.log('═'.repeat(50));

  try {
    const quote = await venice.video.queue.quote({
      model,
      duration: '5s',
      resolution: '720p',
    });
    console.log(`✅ Estimated cost: $${quote.quote.toFixed(4)}\n`);
  } catch (error: any) {
    console.warn(`⚠️  Could not get price quote: ${error.message}`);
    console.log('   Continuing with video generation...\n');
  }

  // Step 2: Queue the video generation job
  console.log('📤 Step 2: Queuing video generation');
  console.log('═'.repeat(50));

  let queueId: string;
  try {
    const queueResponse = await venice.video.queue.queue({
      model,
      prompt,
      duration: '5s',
      resolution: '720p',
    });

    queueId = queueResponse.queue_id;
    console.log(`✅ Video queued successfully`);
    console.log(`   Queue ID: ${queueId}`);
    console.log(`   Model:    ${queueResponse.model}\n`);
  } catch (error: any) {
    console.error('❌ Failed to queue video:', error.message);
    console.log('\n💡 Common issues:');
    console.log('   • Insufficient account balance');
    console.log('   • Invalid model name');
    console.log('   • Rate limiting');
    return;
  }

  // Step 3: Poll for completion
  console.log('⏳ Step 3: Polling for completion');
  console.log('═'.repeat(50));

  const maxAttempts = 60;       // Max polling attempts
  const pollIntervalMs = 5000;  // 5 seconds between polls
  let videoReady = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const status = await venice.video.queue.retrieve({
        model,
        queue_id: queueId,
      });

      // If the response is a Blob, the video is ready
      if (status instanceof Blob) {
        console.log(`\n✅ Video is ready! (attempt ${attempt})`);
        console.log(`   Size: ${(status.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Type: ${status.type}`);
        videoReady = true;
        break;
      }

      // Still processing — show progress
      const processingStatus = status as { status: string; average_execution_time: number; execution_duration: number };
      const avgTime = (processingStatus.average_execution_time / 1000).toFixed(1);
      const elapsed = (processingStatus.execution_duration / 1000).toFixed(1);
      const progress = Math.min(100, Math.round((processingStatus.execution_duration / processingStatus.average_execution_time) * 100));

      process.stdout.write(
        `\r   🔄 Status: ${processingStatus.status} | Elapsed: ${elapsed}s / ~${avgTime}s (est. ${progress}%) [attempt ${attempt}/${maxAttempts}]`
      );

    } catch (error: any) {
      console.error(`\n⚠️  Poll error (attempt ${attempt}): ${error.message}`);
    }

    await sleep(pollIntervalMs);
  }

  if (!videoReady) {
    console.log('\n⏰ Timed out waiting for video generation.');
    console.log(`   You can retrieve it later with queue_id: ${queueId}`);
  }

  // Step 4: Mark the job as complete (cleanup storage)
  console.log('\n\n🧹 Step 4: Completing job (cleanup)');
  console.log('═'.repeat(50));

  try {
    const completeResponse = await venice.video.queue.complete({
      model,
      queue_id: queueId,
    });
    console.log(`✅ Cleanup ${completeResponse.success ? 'successful' : 'reported unsuccessful'}`);
  } catch (error: any) {
    console.warn(`⚠️  Cleanup warning: ${error.message}`);
  }

  // Summary
  console.log('\n💡 Video Generation Tips:');
  console.log('   • Always call complete() after retrieving to free storage');
  console.log('   • Use quote() first to check pricing before generating');
  console.log('   • Typical generation takes 30s-5min depending on model/duration');
  console.log('   • Available durations: "5s" or "10s"');
  console.log('   • Available resolutions: "480p", "720p", "1080p"');
  console.log('   • Use delete_media_on_completion in retrieve() to auto-cleanup');
  console.log(`   • Queue ID for this job: ${queueId}`);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
