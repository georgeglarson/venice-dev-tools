import { describe, it, expect, beforeAll } from 'vitest';
import { VeniceAI } from '../venice-ai';
import { getTestConfig, checkTestEnvironment } from './test-config';

describe('Chat Integration Tests', () => {
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

  it('should create a basic chat completion', async () => {
    const response = await venice.chat.createCompletion({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'user', content: 'Say "Hello, World!" and nothing else.' },
      ],
    });

    expect(response).toBeDefined();
    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
  }, 30000);

  it('should handle system messages', async () => {
    const response = await venice.chat.createCompletion({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'system', content: 'You are helpful.' },
        { role: 'user', content: 'Hi' },
      ],
    });

    expect(response.choices[0].message.content).toBeDefined();
  }, 30000);

  it('should support temperature parameter', async () => {
    const response = await venice.chat.createCompletion({
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'Say hello' }],
      temperature: 0.7,
    });

    expect(response.choices[0].message.content).toBeDefined();
  }, 30000);

  it('should support max_tokens parameter', async () => {
    const response = await venice.chat.createCompletion({
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'Count to 100' }],
      max_tokens: 10,
    });

    expect(response.choices[0]).toBeDefined();
  }, 30000);

  it('should handle streaming', async () => {
    const stream = venice.chatStream.streamCompletion({
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'Count to 3' }],
    });

    const chunks: any[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
  }, 30000);
});
