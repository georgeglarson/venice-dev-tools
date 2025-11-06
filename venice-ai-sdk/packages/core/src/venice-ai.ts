// venice-ai.ts
import { VeniceClient } from './client';
import { EndpointManager } from './api/registry/endpoint-manager';
import { ApiEndpoint } from './api/registry/endpoint';
import { VeniceClientConfig } from './types';

// Import endpoints
import { ChatEndpoint, ChatStreamEndpoint } from './api/endpoints/chat';
import { ModelsEndpoint } from './api/endpoints/models';
import {
  ImagesEndpoint,
  ImageGenerationEndpoint,
  ImageUpscaleEndpoint,
  ImageStylesEndpoint
} from './api/endpoints/images';
import { KeysEndpoint } from './api/endpoints/keys';
import { CharactersEndpoint } from './api/endpoints/characters';
import { EmbeddingsEndpoint } from './api/endpoints/embeddings';
import { BillingEndpoint } from './api/endpoints/billing';
import { AudioSpeechEndpoint } from './api/endpoints/audio';

/**
 * Main client for interacting with the Venice AI API.
 * 
 * This client provides access to all API endpoints and includes
 * utilities for authentication and configuration.
 */
export class VeniceAI extends VeniceClient {
  /**
   * The API endpoint manager.
   */
  private endpointManager: EndpointManager;
  
  /**
   * Create a new Venice AI client.
   * 
   * @param config - Configuration options for the client.
   */
  constructor(config: VeniceClientConfig = {}) {
    super(config);
    
    // Initialize the endpoint manager
    this.endpointManager = new EndpointManager(this);
    
    // Register all core endpoints
    this.registerCoreEndpoints();
  }
  
  /**
   * Register all core API endpoints with the manager.
   */
  private registerCoreEndpoints(): void {
    this.endpointManager
      // Register main endpoints
      .register('chat', ChatEndpoint)
      .register('models', ModelsEndpoint)
      .register('images', ImagesEndpoint)
      .register('keys', KeysEndpoint)
      .register('characters', CharactersEndpoint)
      .register('embeddings', EmbeddingsEndpoint)
      .register('billing', BillingEndpoint)
      .register('audio.speech', AudioSpeechEndpoint)
      
      // Register specialized chat endpoints
      .register('chat.stream', ChatStreamEndpoint)
      
      // Register specialized image endpoints
      .register('images.generation', ImageGenerationEndpoint)
      .register('images.upscale', ImageUpscaleEndpoint)
      .register('images.styles', ImageStylesEndpoint);
  }
  
  /**
   * Get an API endpoint by name.
   * 
   * @param name - The name of the endpoint to get.
   * @returns The endpoint instance.
   */
  public endpoint<T extends ApiEndpoint>(name: string): T {
    return this.endpointManager.get<T>(name);
  }

  /**
   * Register a custom API endpoint.
   * 
   * @param name - The name of the endpoint.
   * @param EndpointClass - The endpoint class constructor.
   * @returns This client instance.
   */
  public registerEndpoint(name: string, EndpointClass: any): this {
    this.endpointManager.register(name, EndpointClass);
    return this;
  }

  /**
   * Get a list of all registered endpoint names.
   * 
   * @returns The list of endpoint names.
   */
  public getRegisteredEndpoints(): string[] {
    return this.endpointManager.getRegisteredEndpoints();
  }
  
  /**
   * Get the chat API endpoint.
   *
   * @returns The chat endpoint.
   */
  public get chat(): ChatEndpoint {
    return this.endpoint<ChatEndpoint>('chat');
  }
  
  /**
   * Get the chat streaming API endpoint.
   *
   * @returns The chat streaming endpoint.
   */
  public get chatStream(): ChatStreamEndpoint {
    return this.endpoint<ChatStreamEndpoint>('chat.stream');
  }
  
  /**
   * Get the models API endpoint.
   *
   * @returns The models endpoint.
   */
  public get models(): ModelsEndpoint {
    return this.endpoint<ModelsEndpoint>('models');
  }
  
  /**
   * Get the images API endpoint.
   *
   * @returns The images endpoint.
   */
  public get images(): ImagesEndpoint {
    return this.endpoint<ImagesEndpoint>('images');
  }
  
  /**
   * Get the image generation API endpoint.
   *
   * @returns The image generation endpoint.
   */
  public get imageGeneration(): ImageGenerationEndpoint {
    return this.endpoint<ImageGenerationEndpoint>('images.generation');
  }
  
  /**
   * Get the image upscale API endpoint.
   *
   * @returns The image upscale endpoint.
   */
  public get imageUpscale(): ImageUpscaleEndpoint {
    return this.endpoint<ImageUpscaleEndpoint>('images.upscale');
  }
  
  /**
   * Get the image styles API endpoint.
   *
   * @returns The image styles endpoint.
   */
  public get imageStyles(): ImageStylesEndpoint {
    return this.endpoint<ImageStylesEndpoint>('images.styles');
  }
  
  /**
   * Get the keys API endpoint.
   *
   * @returns The keys endpoint.
   */
  public get keys(): KeysEndpoint {
    return this.endpoint<KeysEndpoint>('keys');
  }

  /**
   * Get the characters API endpoint.
   *
   * @returns The characters endpoint.
   */
  public get characters(): CharactersEndpoint {
    return this.endpoint<CharactersEndpoint>('characters');
  }

  /**
   * Get the embeddings API endpoint.
   *
   * @returns The embeddings endpoint.
   */
  public get embeddings(): EmbeddingsEndpoint {
    return this.endpoint<EmbeddingsEndpoint>('embeddings');
  }

  /**
   * Get the billing API endpoint.
   *
   * @returns The billing endpoint.
   */
  public get billing(): BillingEndpoint {
    return this.endpoint<BillingEndpoint>('billing');
  }

  /**
   * Get the audio API endpoint.
   *
   * @returns The audio endpoint.
   */
  public get audio(): { speech: AudioSpeechEndpoint } {
    return {
      speech: this.endpoint<AudioSpeechEndpoint>('audio.speech')
    };
  }
  
  /**
   * Get the current API key.
   *
   * @returns The current API key.
   * @throws VeniceAuthError if no API key is set.
   */
  public getApiKey(): string {
    const apiKey = super.getApiKey();
    if (!apiKey) {
      return this.configManager.getRequiredApiKey();
    }
    return apiKey;
  }
}

// Default export
export default VeniceAI;