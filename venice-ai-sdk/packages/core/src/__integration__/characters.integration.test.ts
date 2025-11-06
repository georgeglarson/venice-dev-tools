import { describe, it, expect, beforeAll } from 'vitest';
import { VeniceAI } from '../venice-ai';
import { getTestConfig, checkTestEnvironment } from './test-config';

describe('Characters Integration Tests', () => {
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

  it('should list characters', async () => {
    const response = await venice.characters.list();

    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
    
    // Validate structure of each character
    response.data.forEach(character => {
      expect(character).toHaveProperty('name');
      expect(character).toHaveProperty('slug');
      expect(character).toHaveProperty('description');
      expect(character).toHaveProperty('tags');
      expect(Array.isArray(character.tags)).toBe(true);
    });
  }, 30000);

  it('should validate character data structure', async () => {
    const response = await venice.characters.list();

    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    
    if (response.data.length > 0) {
      const character = response.data[0];
      
      // Validate required fields
      expect(character).toHaveProperty('name');
      expect(character).toHaveProperty('slug');
      expect(character).toHaveProperty('description');
      expect(character).toHaveProperty('tags');
      
      // Validate data types
      expect(typeof character.name).toBe('string');
      expect(typeof character.slug).toBe('string');
      expect(typeof character.description).toBe('string');
      expect(Array.isArray(character.tags)).toBe(true);
      
      // Validate tags are strings
      character.tags.forEach((tag: any) => {
        expect(typeof tag).toBe('string');
      });
      
      // Validate slug format (should be URL-friendly)
      expect(character.slug).toMatch(/^[a-z0-9-]+$/);
    }
  }, 30000);

  it('should use character in chat completion', async () => {
    // First get a character to use
    const charactersResponse = await venice.characters.list();
    
    if (charactersResponse.data.length === 0) {
      console.log('No characters available for chat completion test');
      return;
    }
    
    const character = charactersResponse.data[0];
    
    // Use the character in a chat completion
    const chatResponse = await venice.chat.createCompletion({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'user', content: 'Hello! Tell me about yourself.' }
      ],
      venice_parameters: {
        character_slug: character.slug
      }
    });

    expect(chatResponse).toBeDefined();
    expect(chatResponse.choices).toBeDefined();
    expect(chatResponse.choices.length).toBeGreaterThan(0);
    expect(chatResponse.choices[0].message.content).toBeDefined();
    expect(typeof chatResponse.choices[0].message.content).toBe('string');
    expect(chatResponse.choices[0].message.content.length).toBeGreaterThan(0);
  }, 30000);

  it('should handle character with different tags', async () => {
    const response = await venice.characters.list();

    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    
    if (response.data.length > 0) {
      // Find characters with different tag patterns
      const charactersWithTags = response.data.filter((char: any) => char.tags.length > 0);
      
      if (charactersWithTags.length > 0) {
        // Test that tags are properly formatted
        charactersWithTags.forEach((character: any) => {
          expect(Array.isArray(character.tags)).toBe(true);
          expect(character.tags.length).toBeGreaterThan(0);
          
          // Each tag should be a non-empty string
          character.tags.forEach((tag: any) => {
            expect(typeof tag).toBe('string');
            expect(tag.trim().length).toBeGreaterThan(0);
          });
        });
      }
    }
  }, 30000);

  it('should handle character descriptions', async () => {
    const response = await venice.characters.list();

    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    
    if (response.data.length > 0) {
      // Test characters with and without descriptions
      const withDescription = response.data.filter((char: any) => char.description);
      const withoutDescription = response.data.filter((char: any) => !char.description);
      
      // Characters with descriptions should have meaningful content
      withDescription.forEach((character: any) => {
        expect(typeof character.description).toBe('string');
        expect(character.description.trim().length).toBeGreaterThan(0);
      });
      
      // Characters without descriptions should handle null/undefined gracefully
      withoutDescription.forEach((character: any) => {
        expect(character.description === null || character.description === undefined || character.description === '').toBe(true);
      });
    }
  }, 30000);

  it('should handle character streaming with character', async () => {
    // First get a character to use
    const charactersResponse = await venice.characters.list();
    
    if (charactersResponse.data.length === 0) {
      console.log('No characters available for streaming test');
      return;
    }
    
    const character = charactersResponse.data[0];
    
    // Use the character in a streaming chat completion
    const stream = venice.chatStream.streamCompletion({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'user', content: 'Tell me a short story.' }
      ],
      venice_parameters: {
        character_slug: character.slug
      }
    });

    const chunks: any[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
    
    // Verify that we got content back
    const content = chunks
      .filter(chunk => chunk.choices[0]?.delta?.content)
      .map(chunk => chunk.choices[0].delta.content)
      .join('');
    
    expect(content.length).toBeGreaterThan(0);
  }, 30000);

  it('should handle invalid character slug gracefully', async () => {
    // Test with non-existent character slug
    await expect(
      venice.chat.createCompletion({
        model: 'llama-3.3-70b',
        messages: [
          { role: 'user', content: 'Hello!' }
        ],
        venice_parameters: {
          character_slug: 'non-existent-character-slug'
        }
      })
    ).rejects.toThrow();
  }, 30000);

  it('should filter characters by specific properties', async () => {
    const response = await venice.characters.list();

    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    
    if (response.data.length > 0) {
      // Test filtering by name
      const characterNames = response.data.map((char: any) => char.name);
      expect(characterNames.every((name: any) => typeof name === 'string' && name.length > 0)).toBe(true);
      
      // Test filtering by slug
      const characterSlugs = response.data.map((char: any) => char.slug);
      expect(characterSlugs.every((slug: any) => typeof slug === 'string' && slug.length > 0)).toBe(true);
      
      // Test that slugs are unique
      const uniqueSlugs = [...new Set(characterSlugs)];
      expect(uniqueSlugs.length).toBe(characterSlugs.length);
    }
  }, 30000);

  it('should handle character with system message', async () => {
    // First get a character to use
    const charactersResponse = await venice.characters.list();
    
    if (charactersResponse.data.length === 0) {
      console.log('No characters available for system message test');
      return;
    }
    
    const character = charactersResponse.data[0];
    
    // Use the character with a system message
    const chatResponse = await venice.chat.createCompletion({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'system', content: 'You are helpful assistant.' },
        { role: 'user', content: 'Introduce yourself briefly.' }
      ],
      venice_parameters: {
        character_slug: character.slug
      }
    });

    expect(chatResponse).toBeDefined();
    expect(chatResponse.choices).toBeDefined();
    expect(chatResponse.choices.length).toBeGreaterThan(0);
    expect(chatResponse.choices[0].message.content).toBeDefined();
  }, 30000);
});