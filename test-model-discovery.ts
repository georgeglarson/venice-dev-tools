import { VeniceAI } from './venice-ai-sdk/packages/core/src/index';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const apiKey = process.env.VENICE_API_KEY!;
const venice = new VeniceAI({ apiKey });

async function main() {
  console.log('🔍 Testing Model Discovery Helpers\n');
  
  // Test listChat
  console.log('📋 Chat Models:');
  const chatModels = await venice.models.listChat();
  console.log(`Found ${chatModels.data?.length || 0} chat models`);
  chatModels.data?.forEach(m => console.log(`  - ${m.id}`));
  
  // Test listImage
  console.log('\n🎨 Image Models:');
  const imageModels = await venice.models.listImage();
  console.log(`Found ${imageModels.data?.length || 0} image models`);
  imageModels.data?.forEach(m => console.log(`  - ${m.id}`));
  
  // Test listEmbedding
  console.log('\n📊 Embedding Models:');
  const embeddingModels = await venice.models.listEmbedding();
  console.log(`Found ${embeddingModels.data?.length || 0} embedding models`);
  embeddingModels.data?.forEach(m => console.log(`  - ${m.id}`));
  
  console.log('\n✅ All model discovery helpers working!');
}

main().catch(console.error);
