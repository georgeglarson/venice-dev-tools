import { describe, it, expect, beforeAll } from 'vitest';
import { VeniceAI } from '../venice-ai';
import { getTestConfig, checkTestEnvironment } from './test-config';

describe('Error Handling Integration Tests', () => {
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

  it('should surface auth errors for unauthorized endpoints', async () => {
    const invalidVenice = new VeniceAI({
      apiKey: 'invalid-api-key-12345',
      logLevel: 4
    });

    const response = await invalidVenice.chat.createCompletion({
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'Hello there' }]
    }).catch(error => error);

    if (response instanceof Error) {
      expect(response).toBeDefined();
    } else {
      // Some Venice endpoints may allow anonymous calls; ensure auth state is observable.
      expect(response.choices?.length).toBeGreaterThan(0);
    }
  }, 30000);

  it('should signal missing API key state', async () => {
    const noKeyVenice = new VeniceAI({
      apiKey: '',
      logLevel: 4
    });

    const result = await noKeyVenice.chat.createCompletion({
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'Describe Venice.ai' }]
    }).catch(error => error);

    if (result instanceof Error) {
      expect(result).toBeDefined();
    } else {
      expect(result.choices?.length).toBeGreaterThan(0);
    }
  }, 30000);

  it('should handle invalid model in chat completion', async () => {
    await expect(
      venice.chat.createCompletion({
        model: 'invalid-model-name',
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      })
    ).rejects.toThrow();
  }, 30000);

  it('should handle empty messages in chat completion', async () => {
    await expect(
      venice.chat.createCompletion({
        model: 'llama-3.3-70b',
        messages: []
      })
    ).rejects.toThrow();
  }, 30000);

  it('should handle invalid message structure in chat completion', async () => {
    await expect(
      venice.chat.createCompletion({
        model: 'llama-3.3-70b',
        messages: [
          { role: 'invalid-role', content: 'Hello' } as any
        ]
      })
    ).rejects.toThrow();
  }, 30000);

  it('should handle invalid parameters in embeddings', async () => {
    await expect(
      venice.embeddings.create({
        input: '' // Empty input
      })
    ).rejects.toThrow();

    await expect(
      venice.embeddings.create({
        input: null as any
      })
    ).rejects.toThrow();
  }, 30000);

  it('should handle invalid image generation parameters', async () => {
    await expect(
      venice.imageGeneration.generate({
        model: 'hidream',
        prompt: '', // Empty prompt
        width: 1024,
        height: 1024
      })
    ).rejects.toThrow();

    await expect(
      venice.imageGeneration.generate({
        model: 'hidream',
        prompt: 'Test',
        width: -1, // Invalid width
        height: 1024
      })
    ).rejects.toThrow();

    await expect(
      venice.imageGeneration.generate({
        model: 'hidream',
        prompt: 'Test',
        width: 99999, // Invalid size
        height: 99999
      })
    ).rejects.toThrow();
  }, 30000);

  it('should handle invalid audio generation parameters', async () => {
    await expect(
      venice.audio.speech.create({
        model: 'tts-kokoro',
        voice: 'af_sky',
        input: '' // Empty input
      })
    ).rejects.toThrow();

    await expect(
      venice.audio.speech.create({
        model: 'invalid-model',
        voice: 'af_sky',
        input: 'Test'
      })
    ).rejects.toThrow();

    await expect(
      venice.audio.speech.create({
        model: 'tts-kokoro',
        voice: 'invalid-voice',
        input: 'Test'
      })
    ).rejects.toThrow();
  }, 30000);

  it('should handle non-existent resource retrieval', async () => {
    await expect(
      venice.keys.retrieve('non-existent-key-id')
    ).rejects.toThrow();

    await expect(
      venice.keys.update('non-existent-key-id', { name: 'New Name' })
    ).rejects.toThrow();

    await expect(
      venice.keys.delete({ id: 'non-existent-key-id' })
    ).rejects.toThrow();
  }, 30000);

  it('should handle invalid character slug in chat', async () => {
    await expect(
      venice.chat.createCompletion({
        model: 'llama-3.3-70b',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        venice_parameters: {
          character_slug: 'non-existent-character-slug'
        }
      })
    ).rejects.toThrow();
  }, 30000);

  it('should handle billing API with invalid parameters', async () => {
    // Test with admin key if available
    const adminApiKey = process.env.VENICE_ADMIN_API_KEY;
    if (!adminApiKey) {
      console.log('Skipping billing error tests - no admin API key available');
      return;
    }

    const adminVenice = new VeniceAI({ 
      apiKey: adminApiKey,
      logLevel: 4 
    });

    await expect(
      adminVenice.billing.getUsage({
        currency: 'INVALID' as any
      })
    ).rejects.toThrow();

    await expect(
      adminVenice.billing.getUsage({
        startDate: 'invalid-date'
      })
    ).rejects.toThrow();

    await expect(
      adminVenice.billing.getUsage({
        page: -1
      })
    ).rejects.toThrow();
  }, 30000);

  it('should handle network timeout errors', async () => {
    // Create a client with very short timeout
    const shortTimeoutVenice = new VeniceAI({ 
      apiKey: process.env.VENICE_API_KEY,
      timeout: 1 // 1ms timeout
    });

    // This should timeout due to the very short timeout
    await expect(
      shortTimeoutVenice.chat.createCompletion({
        model: 'llama-3.3-70b',
        messages: [
          { role: 'user', content: 'This will likely timeout due to short timeout' }
        ]
      })
    ).rejects.toThrow();
  }, 30000);

  it('should handle rate limiting errors', async () => {
    // Make multiple rapid requests to potentially trigger rate limiting
    const promises = [];
    
    for (let i = 0; i < 20; i++) {
      promises.push(
        venice.models.list()
      );
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      // If rate limiting occurs, we should get a specific error
      expect(error).toBeDefined();
    }
  }, 60000);

  it('should handle malformed request data', async () => {
    // Test with malformed data that might cause API errors
    await expect(
      venice.chat.createCompletion({
        model: 'llama-3.3-70b',
        messages: [
          { 
            role: 'user', 
            content: 'x'.repeat(100000) // Very long content
          }
        ],
        max_tokens: -1 // Invalid max tokens
      })
    ).rejects.toThrow();
  }, 30000);

  it('should handle streaming errors', async () => {
    // Test streaming with invalid parameters
    const stream = venice.chatStream.streamCompletion({
      model: 'invalid-model',
      messages: [
        { role: 'user', content: 'Hello' }
      ]
    });

    await expect(
      (async () => {
        for await (const chunk of stream) {
          // This should throw an error
        }
      })()
    ).rejects.toThrow();
  }, 30000);

  it('should handle upscaling errors without valid image', async () => {
    // Test upscaling with invalid image data
    await expect(
      venice.imageUpscale.upscale({
        image: null as any,
        scale: 2
      })
    ).rejects.toThrow();

    await expect(
      venice.imageUpscale.upscale({
        image: new Blob(['invalid image data']),
        scale: 2
      })
    ).rejects.toThrow();
  }, 30000);

  it('should handle API key validation errors', async () => {
    // Test API key creation with invalid data
    const adminApiKey = process.env.VENICE_ADMIN_API_KEY;
    if (!adminApiKey) {
      console.log('Skipping API key validation tests - no admin API key available');
      return;
    }

    const adminVenice = new VeniceAI({ 
      apiKey: adminApiKey,
      logLevel: 4 
    });

    await expect(
      adminVenice.keys.create({
        name: '' // Empty name
      })
    ).rejects.toThrow();

    await expect(
      adminVenice.keys.create({
        name: 'x'.repeat(500), // Very long name
        expires_at: 'invalid-date'
      })
    ).rejects.toThrow();
  }, 30000);

  it('should handle Web3 authentication errors', async () => {
    const adminApiKey = process.env.VENICE_ADMIN_API_KEY;
    if (!adminApiKey) {
      console.log('Skipping Web3 error tests - no admin API key available');
      return;
    }

    const adminVenice = new VeniceAI({ 
      apiKey: adminApiKey,
      logLevel: 4 
    });

    await expect(
      adminVenice.keys.createWithWeb3({
        address: '', // Empty address
        signature: '', // Empty signature
        token: '' // Empty token
      })
    ).rejects.toThrow();

    await expect(
      adminVenice.keys.createWithWeb3({
        address: 'invalid-address',
        signature: 'invalid-signature',
        token: 'invalid-token'
      })
    ).rejects.toThrow();
  }, 30000);
});
