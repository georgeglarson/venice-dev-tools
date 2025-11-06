/**
 * Embeddings - Create text embeddings for semantic search
 * 
 * This example demonstrates how to generate embeddings from text,
 * which can be used for:
 * - Semantic search
 * - Text similarity comparison
 * - Clustering and classification
 * - Recommendation systems
 * 
 * Run with: npx tsx examples/typescript/07-embeddings.ts
 */

import { VeniceAI } from '@venice-dev-tools/core';

// Helper function to calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function main() {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    console.error('❌ VENICE_API_KEY not set');
    process.exit(1);
  }

  const venice = new VeniceAI({ apiKey });

  console.log('📊 Generating embeddings for semantic search...\n');

  // Sample texts to compare
  const documents = [
    'The quick brown fox jumps over the lazy dog',
    'A fast auburn canine leaps above a sleepy hound',
    'Python is a popular programming language',
    'JavaScript is widely used for web development',
    'The weather is sunny today',
  ];

  const query = 'A speedy red fox hops over a resting dog';

  try {
    // Generate embeddings for all documents
    console.log('🔄 Generating embeddings for documents...');
    const docEmbeddings = await venice.embeddings.create({
      input: documents,
      model: 'text-embedding-3-small', // or your preferred model
    });

    // Generate embedding for query
    console.log('🔄 Generating embedding for query...');
    const queryEmbedding = await venice.embeddings.create({
      input: query,
      model: 'text-embedding-3-small',
    });

    console.log('✅ Embeddings generated!\n');
    
    // Show embedding details
    const firstEmbedding = docEmbeddings.data[0].embedding;
    console.log('📏 Embedding dimensions:', firstEmbedding.length);
    console.log('📦 Total documents embedded:', docEmbeddings.data.length);
    console.log('');

    // Calculate similarities
    console.log('🔍 Similarity scores (query vs documents):\n');
    console.log(`Query: "${query}"\n`);

    const similarities = documents.map((doc, i) => ({
      text: doc,
      similarity: cosineSimilarity(
        queryEmbedding.data[0].embedding,
        docEmbeddings.data[i].embedding
      ),
    }));

    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Display results
    similarities.forEach((result, i) => {
      const percentage = (result.similarity * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(result.similarity * 20));
      
      console.log(`${i + 1}. [${percentage}%] ${bar}`);
      console.log(`   "${result.text}"`);
      console.log('');
    });

    console.log('💡 Use cases for embeddings:');
    console.log('   • Semantic search (find similar documents)');
    console.log('   • Question answering (match questions to answers)');
    console.log('   • Recommendations (find similar items)');
    console.log('   • Clustering (group similar content)');
    console.log('   • Anomaly detection (find outliers)');

  } catch (error: any) {
    console.error('❌ Error generating embeddings:', error.message);
    process.exit(1);
  }
}

main();
