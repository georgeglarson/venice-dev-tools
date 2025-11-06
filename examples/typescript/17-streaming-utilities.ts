import { VeniceClient } from '@venice/core';
import {
  collectStream,
  mapStream,
  filterStream,
  takeStream,
  tapStream,
  bufferStream,
  textOnlyStream,
  streamToArray,
} from '@venice/core/utils';

async function streamingUtilitiesDemo() {
  const client = new VeniceClient({
    apiKey: process.env.VENICE_API_KEY,
  });

  console.log('🌊 Venice AI SDK - Enhanced Streaming Utilities Demo\n');

  console.log('1️⃣  Basic Stream Collection\n');

  const stream1 = await client.getStandardHttpClient().request('/chat/completions', {
    method: 'POST',
    body: {
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'Count from 1 to 5' }],
      stream: true,
    },
  });

  const fullResponse = await collectStream(stream1 as any, {
    onChunk: (chunk, index) => {
      if (index % 5 === 0) {
        process.stdout.write('.');
      }
    },
  });

  console.log(`\n   ✅ Collected response: "${fullResponse.trim()}"`);

  console.log('\n2️⃣  Text-Only Stream Extraction\n');

  const stream2 = await client.getStandardHttpClient().request('/chat/completions', {
    method: 'POST',
    body: {
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'Say "Hello, World!" three times' }],
      stream: true,
    },
  });

  console.log('   📝 Streaming text only:');
  process.stdout.write('   ');
  
  for await (const text of textOnlyStream(stream2 as any)) {
    process.stdout.write(text);
  }
  
  console.log('\n');

  console.log('3️⃣  Stream Mapping\n');

  const stream3 = await client.getStandardHttpClient().request('/chat/completions', {
    method: 'POST',
    body: {
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'List 3 colors' }],
      stream: true,
    },
  });

  const mappedStream = mapStream(textOnlyStream(stream3 as any), (text) => text.toUpperCase());

  console.log('   🔠 Streaming with uppercase mapping:');
  process.stdout.write('   ');
  
  for await (const upperText of mappedStream) {
    process.stdout.write(upperText);
  }
  
  console.log('\n');

  console.log('4️⃣  Stream Filtering\n');

  const stream4 = await client.getStandardHttpClient().request('/chat/completions', {
    method: 'POST',
    body: {
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'Write: one two three four five' }],
      stream: true,
    },
  });

  const filteredStream = filterStream(textOnlyStream(stream4 as any), (text) => text.trim().length > 0);

  const filteredChunks = await streamToArray(filteredStream);
  console.log(`   ✅ Filtered out empty chunks: ${filteredChunks.length} non-empty chunks`);

  console.log('\n5️⃣  Taking Limited Chunks\n');

  const stream5 = await client.getStandardHttpClient().request('/chat/completions', {
    method: 'POST',
    body: {
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'Count from 1 to 100' }],
      stream: true,
    },
  });

  const limitedStream = takeStream(textOnlyStream(stream5 as any), 10);

  console.log('   ⏸️  Taking only first 10 text chunks:');
  process.stdout.write('   ');
  
  for await (const text of limitedStream) {
    process.stdout.write(text);
  }
  
  console.log('\n');

  console.log('6️⃣  Stream Tapping (Side Effects)\n');

  let chunkCount = 0;
  let totalChars = 0;

  const stream6 = await client.getStandardHttpClient().request('/chat/completions', {
    method: 'POST',
    body: {
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'Write a haiku about code' }],
      stream: true,
    },
  });

  const tappedStream = tapStream(textOnlyStream(stream6 as any), (text) => {
    chunkCount++;
    totalChars += text.length;
  });

  console.log('   📊 Streaming with metrics tracking:');
  process.stdout.write('   ');
  
  for await (const text of tappedStream) {
    process.stdout.write(text);
  }
  
  console.log(`\n   📈 Metrics: ${chunkCount} chunks, ${totalChars} characters`);

  console.log('\n7️⃣  Stream Buffering\n');

  const stream7 = await client.getStandardHttpClient().request('/chat/completions', {
    method: 'POST',
    body: {
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'List 5 animals' }],
      stream: true,
    },
  });

  const bufferedStream = bufferStream(textOnlyStream(stream7 as any), 3);

  console.log('   📦 Streaming in batches of 3:');
  
  let batchNumber = 1;
  for await (const batch of bufferedStream) {
    console.log(`   Batch ${batchNumber++}: ${batch.length} chunks → "${batch.join('')}"`);
  }

  console.log('\n8️⃣  Real-time Token Counting\n');

  let tokenCount = 0;

  const stream8 = await client.getStandardHttpClient().request('/chat/completions', {
    method: 'POST',
    body: {
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'Explain TypeScript in one sentence' }],
      stream: true,
    },
  });

  const countingStream = tapStream(textOnlyStream(stream8 as any), (text) => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    tokenCount += words.length;
  });

  console.log('   🔢 Streaming with live token count:');
  process.stdout.write('   ');
  
  for await (const text of countingStream) {
    process.stdout.write(text);
  }
  
  console.log(`\n   📊 Approximate tokens: ${tokenCount}`);

  console.log('\n9️⃣  Stream to Array Conversion\n');

  const stream9 = await client.getStandardHttpClient().request('/chat/completions', {
    method: 'POST',
    body: {
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'Say: A B C D E' }],
      stream: true,
    },
  });

  const allChunks = await streamToArray(textOnlyStream(stream9 as any));
  console.log(`   ✅ Converted stream to array: ${allChunks.length} chunks`);
  console.log(`   📄 Full text: "${allChunks.join('')}"`);

  console.log('\n🔟 Complex Pipeline: Map → Filter → Take\n');

  const stream10 = await client.getStandardHttpClient().request('/chat/completions', {
    method: 'POST',
    body: {
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'Write numbers: 1 2 3 4 5 6 7 8 9 10' }],
      stream: true,
    },
  });

  const pipeline = takeStream(
    filterStream(
      mapStream(textOnlyStream(stream10 as any), (text) => text.trim()),
      (text) => text.length > 0
    ),
    15
  );

  console.log('   ⚙️  Pipeline: textOnly → map(trim) → filter(non-empty) → take(15)');
  process.stdout.write('   Result: ');
  
  const pipelineResult: string[] = [];
  for await (const text of pipeline) {
    pipelineResult.push(text);
    process.stdout.write(text);
  }
  
  console.log(`\n   ✅ Final: ${pipelineResult.length} chunks processed`);

  console.log('\n✨ Streaming Utilities Demo Complete!\n');
}

streamingUtilitiesDemo().catch(console.error);
