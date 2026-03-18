import { describe, it, expect, beforeEach } from 'vitest';
import { VeniceAI } from './venice-ai';
import { ApiEndpoint } from './api/registry/endpoint';
import { VeniceClient } from './client';
import { LogLevel } from './types/common';

// Import endpoint classes for instanceof checks
import { ChatEndpoint, ChatStreamEndpoint } from './api/endpoints/chat';
import { ModelsEndpoint } from './api/endpoints/models';
import {
  ImagesEndpoint,
  ImageGenerationEndpoint,
  ImageUpscaleEndpoint,
  ImageStylesEndpoint,
  ImageEditEndpoint,
  ImageMultiEditEndpoint,
  ImageRemoveBackgroundEndpoint,
} from './api/endpoints/images';
import { KeysEndpoint } from './api/endpoints/keys';
import { CharactersEndpoint } from './api/endpoints/characters';
import { EmbeddingsEndpoint } from './api/endpoints/embeddings';
import { BillingEndpoint } from './api/endpoints/billing';
import { AudioSpeechEndpoint, AudioTranscriptionEndpoint } from './api/endpoints/audio';
import { VideoGenerationEndpoint } from './api/endpoints/video';

// Suppress all logging during tests
const SILENT = { logLevel: LogLevel.NONE };

// --- Helpers ---

class CustomEndpoint extends ApiEndpoint {
  getEndpointPath(): string {
    return '/custom';
  }
}

class AnotherCustomEndpoint extends ApiEndpoint {
  getEndpointPath(): string {
    return '/another-custom';
  }
}

// --- Tests ---

describe('VeniceAI', () => {
  let venice: VeniceAI;

  beforeEach(() => {
    venice = new VeniceAI(SILENT);
  });

  // ── Constructor ─────────────────────────────────────────────────

  describe('constructor', () => {
    it('should create an instance without error', () => {
      expect(venice).toBeInstanceOf(VeniceAI);
    });

    it('should extend VeniceClient', () => {
      expect(venice).toBeInstanceOf(VeniceClient);
    });

    it('should accept an empty config', () => {
      const v = new VeniceAI({ logLevel: LogLevel.NONE });
      expect(v).toBeInstanceOf(VeniceAI);
    });

    it('should accept an API key in config', () => {
      const v = new VeniceAI({ apiKey: 'test-key', logLevel: LogLevel.NONE });
      expect(v.getApiKey()).toBe('test-key');
    });
  });

  // ── Core endpoint registration ──────────────────────────────────

  describe('core endpoint registration', () => {
    const EXPECTED_ENDPOINTS = [
      'chat',
      'models',
      'images',
      'keys',
      'characters',
      'embeddings',
      'billing',
      'audio.speech',
      'audio.transcription',
      'video.generation',
      'video.queue',
      'audio.queue',
      'responses',
      'chat.stream',
      'images.generation',
      'images.upscale',
      'images.styles',
      'images.edit',
      'images.multiEdit',
      'images.removeBackground',
    ];

    it('should register all core endpoints', () => {
      const registered = venice.getRegisteredEndpoints();
      for (const name of EXPECTED_ENDPOINTS) {
        expect(registered).toContain(name);
      }
    });

    it('should have exactly the expected number of core endpoints', () => {
      const registered = venice.getRegisteredEndpoints();
      expect(registered.length).toBe(EXPECTED_ENDPOINTS.length);
    });
  });

  // ── Endpoint getters returning correct types ────────────────────

  describe('endpoint getters', () => {
    it('getter chat returns ChatEndpoint instance', () => {
      expect(venice.chat).toBeInstanceOf(ChatEndpoint);
    });

    it('getter chatStream returns ChatStreamEndpoint instance', () => {
      expect(venice.chatStream).toBeInstanceOf(ChatStreamEndpoint);
    });

    it('getter models returns ModelsEndpoint instance', () => {
      expect(venice.models).toBeInstanceOf(ModelsEndpoint);
    });

    it('getter images returns ImagesEndpoint instance', () => {
      expect(venice.images).toBeInstanceOf(ImagesEndpoint);
    });

    it('getter imageGeneration returns ImageGenerationEndpoint instance', () => {
      expect(venice.imageGeneration).toBeInstanceOf(ImageGenerationEndpoint);
    });

    it('getter imageUpscale returns ImageUpscaleEndpoint instance', () => {
      expect(venice.imageUpscale).toBeInstanceOf(ImageUpscaleEndpoint);
    });

    it('getter imageStyles returns ImageStylesEndpoint instance', () => {
      expect(venice.imageStyles).toBeInstanceOf(ImageStylesEndpoint);
    });

    it('getter keys returns KeysEndpoint instance', () => {
      expect(venice.keys).toBeInstanceOf(KeysEndpoint);
    });

    it('getter apiKeys returns the same instance as keys', () => {
      expect(venice.apiKeys).toBe(venice.keys);
    });

    it('getter characters returns CharactersEndpoint instance', () => {
      expect(venice.characters).toBeInstanceOf(CharactersEndpoint);
    });

    it('getter embeddings returns EmbeddingsEndpoint instance', () => {
      expect(venice.embeddings).toBeInstanceOf(EmbeddingsEndpoint);
    });

    it('getter billing returns BillingEndpoint instance', () => {
      expect(venice.billing).toBeInstanceOf(BillingEndpoint);
    });

    it('getter audio returns object with speech and transcription', () => {
      const audio = venice.audio;
      expect(audio).toHaveProperty('speech');
      expect(audio).toHaveProperty('transcription');
      expect(audio.speech).toBeInstanceOf(AudioSpeechEndpoint);
      expect(audio.transcription).toBeInstanceOf(AudioTranscriptionEndpoint);
    });

    it('getter video returns object with generation', () => {
      const video = venice.video;
      expect(video).toHaveProperty('generation');
      expect(video.generation).toBeInstanceOf(VideoGenerationEndpoint);
    });
  });

  // ── Endpoint caching ────────────────────────────────────────────

  describe('endpoint caching', () => {
    it('should return the same chat instance on repeated access', () => {
      expect(venice.chat).toBe(venice.chat);
    });

    it('should return the same models instance on repeated access', () => {
      expect(venice.models).toBe(venice.models);
    });

    it('should return the same images instance on repeated access', () => {
      expect(venice.images).toBe(venice.images);
    });

    it('should return the same keys instance on repeated access', () => {
      expect(venice.keys).toBe(venice.keys);
    });

    it('should return the same characters instance on repeated access', () => {
      expect(venice.characters).toBe(venice.characters);
    });

    it('should return the same embeddings instance on repeated access', () => {
      expect(venice.embeddings).toBe(venice.embeddings);
    });

    it('should return the same billing instance on repeated access', () => {
      expect(venice.billing).toBe(venice.billing);
    });
  });

  // ── registerEndpoint() ─────────────────────────────────────────

  describe('registerEndpoint()', () => {
    it('should register a custom endpoint and return this', () => {
      const result = venice.registerEndpoint('custom', CustomEndpoint);
      expect(result).toBe(venice);
    });

    it('should make the custom endpoint retrievable via endpoint()', () => {
      venice.registerEndpoint('custom', CustomEndpoint);
      const instance = venice.endpoint('custom');
      expect(instance).toBeInstanceOf(CustomEndpoint);
    });

    it('should include custom endpoint in getRegisteredEndpoints()', () => {
      venice.registerEndpoint('custom', CustomEndpoint);
      expect(venice.getRegisteredEndpoints()).toContain('custom');
    });

    it('should allow chaining registerEndpoint calls', () => {
      const result = venice
        .registerEndpoint('custom1', CustomEndpoint)
        .registerEndpoint('custom2', AnotherCustomEndpoint);

      expect(result).toBe(venice);
      expect(venice.endpoint('custom1')).toBeInstanceOf(CustomEndpoint);
      expect(venice.endpoint('custom2')).toBeInstanceOf(AnotherCustomEndpoint);
    });

    it('should not affect existing core endpoints', () => {
      venice.registerEndpoint('custom', CustomEndpoint);
      expect(venice.chat).toBeInstanceOf(ChatEndpoint);
      expect(venice.models).toBeInstanceOf(ModelsEndpoint);
    });
  });

  // ── endpoint() ─────────────────────────────────────────────────

  describe('endpoint()', () => {
    it('should throw for an unregistered endpoint name', () => {
      expect(() => venice.endpoint('nonexistent')).toThrow(
        "Endpoint 'nonexistent' not registered"
      );
    });

    it('should retrieve a core endpoint by name', () => {
      const chatEndpoint = venice.endpoint('chat');
      expect(chatEndpoint).toBeInstanceOf(ChatEndpoint);
    });

    it('should return cached instance on repeated calls', () => {
      const first = venice.endpoint('chat');
      const second = venice.endpoint('chat');
      expect(first).toBe(second);
    });
  });

  // ── getRegisteredEndpoints() ────────────────────────────────────

  describe('getRegisteredEndpoints()', () => {
    it('should return an array of strings', () => {
      const endpoints = venice.getRegisteredEndpoints();
      expect(Array.isArray(endpoints)).toBe(true);
      for (const name of endpoints) {
        expect(typeof name).toBe('string');
      }
    });

    it('should include both core and custom endpoints after registration', () => {
      venice.registerEndpoint('custom', CustomEndpoint);
      const endpoints = venice.getRegisteredEndpoints();
      expect(endpoints).toContain('chat');
      expect(endpoints).toContain('custom');
    });
  });
});
