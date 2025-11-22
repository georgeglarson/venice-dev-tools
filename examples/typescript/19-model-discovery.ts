/**
 * Model Discovery - Finding the right model for your task
 * 
 * This example demonstrates how to discover and filter available models
 * using the Venice AI SDK's model discovery helpers.
 * 
 * Prerequisites:
 * - Node.js 18+ installed
 * - VENICE_API_KEY in examples/.env file OR set as environment variable
 * 
 * Run with: npx tsx examples/typescript/19-model-discovery.ts
 */

import { VeniceAI } from '@venice-dev-tools/core';
import { requireEnv } from './env-config';

async function main() {
  // Get API key from environment
  const apiKey = requireEnv('VENICE_API_KEY');

  // Initialize the Venice AI client
  const venice = new VeniceAI({ apiKey });

  console.log('🔍 Venice AI Model Discovery\n');
  console.log('='.repeat(60));

  // 1. List all available models
  console.log('\n📋 All Available Models:');
  console.log('='.repeat(60));
  
  const allModels = await venice.models.list();
  console.log(`Found ${allModels.data?.length || 0} total models\n`);
  
  allModels.data?.forEach((model, index) => {
    console.log(`${index + 1}. ${model.id}`);
  });

  // 2. List chat/LLM models only
  console.log('\n\n💬 Chat/LLM Models:');
  console.log('='.repeat(60));
  
  const chatModels = await venice.models.listChat();
  console.log(`Found ${chatModels.data?.length || 0} chat models\n`);
  
  chatModels.data?.forEach((model, index) => {
    console.log(`${index + 1}. ${model.id}`);
  });

  // 3. List image generation models only
  console.log('\n\n🎨 Image Generation Models:');
  console.log('='.repeat(60));
  
  const imageModels = await venice.models.listImage();
  console.log(`Found ${imageModels.data?.length || 0} image models\n`);
  
  imageModels.data?.forEach((model, index) => {
    console.log(`${index + 1}. ${model.id}`);
  });

  // 4. List embedding models only
  console.log('\n\n📊 Embedding Models:');
  console.log('='.repeat(60));
  
  const embeddingModels = await venice.models.listEmbedding();
  console.log(`Found ${embeddingModels.data?.length || 0} embedding models\n`);
  
  embeddingModels.data?.forEach((model, index) => {
    console.log(`${index + 1}. ${model.id}`);
  });

  // 5. Retrieve specific model details
  console.log('\n\n🔎 Model Details Example:');
  console.log('='.repeat(60));
  
  if (chatModels.data && chatModels.data.length > 0) {
    const firstChatModel = chatModels.data[0];
    console.log(`\nRetrieving details for: ${firstChatModel.id}`);
    
    try {
      const modelDetails = await venice.models.retrieve(firstChatModel.id);
      console.log('\nModel Details:');
      console.log(JSON.stringify(modelDetails, null, 2));
    } catch (error: any) {
      console.log(`Note: Model details endpoint may not be available for all models`);
      console.log(`Basic info: ${JSON.stringify(firstChatModel, null, 2)}`);
    }
  }

  // 6. Practical example: Choose the right model for a task
  console.log('\n\n💡 Model Selection Guide:');
  console.log('='.repeat(60));
  
  console.log('\nFor Chat/Completion Tasks:');
  const recommendedChat = chatModels.data?.find(m => m.id.includes('llama-3.3-70b'));
  if (recommendedChat) {
    console.log(`✅ Recommended: ${recommendedChat.id}`);
    console.log('   Best for: General conversation, reasoning, coding');
  }
  
  console.log('\nFor Image Generation:');
  const recommendedImage = imageModels.data?.find(m => m.id.includes('sd35'));
  if (recommendedImage) {
    console.log(`✅ Recommended: ${recommendedImage.id}`);
    console.log('   Best for: General image generation, fast results');
  }
  
  console.log('\nFor Embeddings:');
  const recommendedEmbedding = embeddingModels.data?.find(m => m.id.includes('small'));
  if (recommendedEmbedding) {
    console.log(`✅ Recommended: ${recommendedEmbedding.id}`);
    console.log('   Best for: Semantic search, good balance of speed and quality');
  }

  // 7. Test a model with a simple request
  console.log('\n\n🧪 Testing Recommended Chat Model:');
  console.log('='.repeat(60));
  
  if (recommendedChat) {
    console.log(`\nUsing model: ${recommendedChat.id}`);
    console.log('Sending test message...\n');
    
    const response = await venice.chat.completions.create({
      model: recommendedChat.id,
      messages: [
        { role: 'user', content: 'In one sentence, what makes you special?' }
      ],
      max_tokens: 100
    });
    
    console.log('Response:', response.choices[0].message.content);
  }

  console.log('\n\n✅ Model Discovery Complete!');
  console.log('='.repeat(60));
  console.log('\n💡 Tips:');
  console.log('   • Use venice.models.listChat() for chat models');
  console.log('   • Use venice.models.listImage() for image models');
  console.log('   • Use venice.models.listEmbedding() for embedding models');
  console.log('   • Use venice.models.retrieve(id) for specific model details');
  console.log('\n📚 See docs/models/README.md for detailed model information');
}

// Run the example
main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
