import { describe, it, expect, beforeAll } from 'vitest';
import { VeniceAI } from '../venice-ai';
import { getTestConfig, checkTestEnvironment } from './test-config';

describe('Models Integration Tests', () => {
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

  it('should list available models', async () => {
    const response = await venice.models.list();

    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
  }, 30000);

  it('should get model traits', async () => {
    const response = await venice.models.getTraits();

    expect(response).toBeDefined();
  }, 30000);

  it('should get compatibility mapping', async () => {
    const response = await venice.models.getCompatibilityMapping();

    expect(response).toBeDefined();
  }, 30000);
});
