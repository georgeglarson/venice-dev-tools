import { describe, it, expect, beforeAll } from 'vitest';
import { VeniceAI } from '../venice-ai';
import { getTestConfig, checkTestEnvironment } from './test-config';

describe('Embeddings Integration Tests', () => {
  let venice: VeniceAI;

  beforeAll(() => {
    // Check environment first
    const env = checkTestEnvironment(false); // require regular API key
    if (env.skipTests) {
      throw new Error(env.skipReason);
    }

    const config = getTestConfig();
    venice = new VeniceAI({
      apiKey: config.apiKey!,
      logLevel: config.logLevel
    });
  });

  it('should create embeddings for a single input', async () => {
    const response = await venice.embeddings.create({
      input: 'The quick brown fox jumps over the lazy dog',
    });

    expect(response).toBeDefined();
    expect(response.object).toBe('list');
    expect(response.data).toHaveLength(1);
    expect(response.data[0].embedding).toBeInstanceOf(Array);
    expect(response.data[0].embedding.length).toBeGreaterThan(0);
    expect(response.data[0].index).toBe(0);
    expect(response.model).toBeDefined();
    expect(response.usage.prompt_tokens).toBeGreaterThan(0);
    expect(response.usage.total_tokens).toBeGreaterThan(0);
  }, 30000);

  it('should create embeddings for multiple inputs', async () => {
    const response = await venice.embeddings.create({
      input: [
        'First sentence to embed',
        'Second sentence to embed',
        'Third sentence to embed',
      ],
    });

    expect(response.data).toHaveLength(3);
    expect(response.data[0].index).toBe(0);
    expect(response.data[1].index).toBe(1);
    expect(response.data[2].index).toBe(2);
    
    response.data.forEach(embedding => {
      expect(embedding.embedding).toBeInstanceOf(Array);
      expect(embedding.embedding.length).toBeGreaterThan(0);
    });
  }, 30000);

  it('should use the default model', async () => {
    const response = await venice.embeddings.create({
      input: 'Test with default model',
    });

    expect(response.model).toBe('text-embedding-bge-m3');
  }, 30000);

  it('should handle empty input gracefully', async () => {
    await expect(
      venice.embeddings.create({
        input: '',
      })
    ).rejects.toThrow();
  });

  it('should create embeddings with consistent dimensions', async () => {
    const response = await venice.embeddings.create({
      input: ['First', 'Second'],
    });

    const firstLength = response.data[0].embedding.length;
    const secondLength = response.data[1].embedding.length;

    expect(firstLength).toBe(secondLength);
  }, 30000);
});
