/**
 * Comprehensive SDK Test
 * Tests various features of the Venice AI SDK
 */

import { VeniceAI } from '@venice-dev-tools/core';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.VENICE_API_KEY;
const adminApiKey = process.env.VENICE_ADMIN_API_KEY;

if (!apiKey) {
  throw new Error('VENICE_API_KEY not found in environment');
}

async function testChatCompletion(venice: VeniceAI) {
  console.log('\n=== Testing Chat Completion ===');
  try {
    const result = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'user', content: 'What is 2+2? Answer in one sentence.' }
      ],
      max_tokens: 50
    });
    
    console.log('✅ Chat completion successful');
    console.log('Response:', result.choices[0].message.content);
    return true;
  } catch (error: any) {
    console.error('❌ Chat completion failed:', error.message);
    return false;
  }
}

async function testStreamingChat(venice: VeniceAI) {
  console.log('\n=== Testing Streaming Chat ===');
  try {
    const stream = await venice.chat.completions.createStream({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'user', content: 'Count from 1 to 5.' }
      ],
      max_tokens: 50
    });
    
    let chunks = 0;
    let content = '';
    
    for await (const chunk of stream) {
      if (chunk.choices?.[0]?.delta?.content) {
        content += chunk.choices[0].delta.content;
        chunks++;
      }
    }
    
    console.log('✅ Streaming successful');
    console.log(`Received ${chunks} chunks`);
    console.log('Content:', content);
    return true;
  } catch (error: any) {
    console.error('❌ Streaming failed:', error.message);
    return false;
  }
}

async function testModelsList(venice: VeniceAI) {
  console.log('\n=== Testing Models List ===');
  try {
    const models = await venice.models.list();
    console.log('✅ Models list successful');
    console.log(`Found ${models.data?.length || 0} models`);
    if (models.data && models.data.length > 0) {
      console.log('Sample models:', models.data.slice(0, 3).map((m: any) => m.id).join(', '));
    }
    return true;
  } catch (error: any) {
    console.error('❌ Models list failed:', error.message);
    return false;
  }
}

async function testEmbeddings(venice: VeniceAI) {
  console.log('\n=== Testing Embeddings ===');
  try {
    const result = await venice.embeddings.create({
      model: 'text-embedding-004',
      input: 'Hello world'
    });
    
    console.log('✅ Embeddings successful');
    console.log(`Embedding dimensions: ${result.data?.[0]?.embedding?.length || 0}`);
    return true;
  } catch (error: any) {
    console.error('❌ Embeddings failed:', error.message);
    return false;
  }
}

async function testImageGeneration(venice: VeniceAI) {
  console.log('\n=== Testing Image Generation ===');
  try {
    const result = await venice.images.generate({
      prompt: 'A simple red circle',
      model: 'fluently-xl',
      width: 512,
      height: 512
    });
    
    console.log('✅ Image generation successful');
    console.log('Image data received:', !!result.data?.[0]);
    return true;
  } catch (error: any) {
    console.error('❌ Image generation failed:', error.message);
    return false;
  }
}

async function testBillingUsage(venice: VeniceAI) {
  console.log('\n=== Testing Billing/Usage ===');
  try {
    const usage = await venice.billing.getUsage();
    console.log('✅ Billing usage successful');
    console.log('Usage data:', JSON.stringify(usage, null, 2));
    return true;
  } catch (error: any) {
    console.error('❌ Billing usage failed:', error.message);
    return false;
  }
}

async function testAPIKeysManagement(venice: VeniceAI) {
  console.log('\n=== Testing API Keys Management (Admin) ===');
  if (!adminApiKey) {
    console.log('⚠️  Skipping - VENICE_ADMIN_API_KEY not provided');
    return null;
  }
  
  try {
    const adminVenice = new VeniceAI({ apiKey: adminApiKey });
    const keys = await adminVenice.apiKeys.list();
    console.log('✅ API keys list successful');
    console.log(`Found ${keys.data?.length || 0} API keys`);
    return true;
  } catch (error: any) {
    console.error('❌ API keys management failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Venice AI SDK Comprehensive Test');
  console.log('API Key:', apiKey?.substring(0, 10) + '...');
  console.log('Admin Key:', adminApiKey ? adminApiKey.substring(0, 10) + '...' : 'Not provided');
  
  const venice = new VeniceAI({ 
    apiKey,
    logLevel: 1 // INFO
  });
  
  const results = {
    chatCompletion: await testChatCompletion(venice),
    streamingChat: await testStreamingChat(venice),
    modelsList: await testModelsList(venice),
    embeddings: await testEmbeddings(venice),
    imageGeneration: await testImageGeneration(venice),
    billingUsage: await testBillingUsage(venice),
    apiKeysManagement: await testAPIKeysManagement(venice)
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  const passed = Object.values(results).filter(r => r === true).length;
  const failed = Object.values(results).filter(r => r === false).length;
  const skipped = Object.values(results).filter(r => r === null).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const icon = result === true ? '✅' : result === false ? '❌' : '⚠️';
    const status = result === true ? 'PASS' : result === false ? 'FAIL' : 'SKIP';
    console.log(`${icon} ${test}: ${status}`);
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  console.log('='.repeat(50));
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
