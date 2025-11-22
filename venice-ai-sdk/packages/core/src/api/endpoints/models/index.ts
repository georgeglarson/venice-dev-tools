import { ApiEndpoint } from '../../registry/endpoint';
import {
  ListModelsParams,
  ListModelsResponse,
  ListModelTraitsResponse,
  ListModelCompatibilityResponse
} from '../../../types';
import { ModelRequest } from '../../../types/models';
import { ModelValidator } from '../../../utils/validators/model-validator';

/**
 * API endpoint for models.
 */
export class ModelsEndpoint extends ApiEndpoint {
  /**
   * The model validator
   */
  private validator: ModelValidator;

  /**
   * Constructor
   */
  constructor(client: any) {
    super(client);
    this.validator = new ModelValidator();
  }
  /**
   * Get the base endpoint path for models requests.
   * @returns The base endpoint path.
   */
  public getEndpointPath(): string {
    return '/models';
  }

  /**
   * List available models.
   * @param params - Optional parameters for listing models.
   * @returns The list of models.
   */
  public async list(params?: ListModelsParams): Promise<ListModelsResponse> {
    // Validate parameters if provided
    if (params) {
      this.validator.validateListModelsParams(params);
    }

    // Emit a request event
    this.emit('request', { type: 'models.list', data: params });

    // Make the API request
    const response = await this.http.get<ListModelsResponse>(
      this.getPath(),
      { query: params }
    );

    // Emit a response event
    this.emit('response', { type: 'models.list', data: response.data });

    return response.data;
  }

  /**
   * Get model traits.
   * @param type - Optional model type to filter traits.
   * @returns The model traits.
   */
  public async getTraits(type?: 'image' | 'text'): Promise<ListModelTraitsResponse> {
    // Validate type parameter if provided
    if (type) {
      this.validator.validateEnum(type, 'type', ['image', 'text']);
    }

    // Emit a request event
    this.emit('request', { type: 'models.traits', data: { type } });

    // Make the API request
    const response = await this.http.get<ListModelTraitsResponse>(
      this.getPath('/traits'),
      { query: type ? { type } : undefined }
    );

    // Emit a response event
    this.emit('response', { type: 'models.traits', data: response.data });

    return response.data;
  }

  /**
   * Get model compatibility mapping.
   * @param type - Optional model type to filter compatibility mapping.
   * @returns The model compatibility mapping.
   */
  public async getCompatibilityMapping(type?: 'image' | 'text'): Promise<ListModelCompatibilityResponse> {
    // Validate type parameter if provided
    if (type) {
      this.validator.validateEnum(type, 'type', ['image', 'text']);
    }

    // Emit a request event
    this.emit('request', { type: 'models.compatibility', data: { type } });

    // Make the API request
    const response = await this.http.get<ListModelCompatibilityResponse>(
      this.getPath('/compatibility_mapping'),
      { query: type ? { type } : undefined }
    );

    // Emit a response event
    this.emit('response', { type: 'models.compatibility', data: response.data });

    return response.data;
  }
  /**
   * List chat/LLM models only.
   * Convenience method to filter models suitable for chat completions.
   * @returns The list of chat models.
   */
  public async listChat(): Promise<ListModelsResponse> {
    const allModels = await this.list();
    
    // Filter for chat/LLM models (exclude image and embedding models)
    const chatModels = allModels.data?.filter(model => {
      const id = model.id.toLowerCase();
      return !id.includes('embedding') && 
             !id.includes('sd') && 
             !id.includes('fluently') &&
             !id.includes('dall-e');
    }) || [];
    
    return {
      ...allModels,
      data: chatModels
    };
  }

  /**
   * List image generation models only.
   * Convenience method to filter models suitable for image generation.
   * @returns The list of image models.
   */
  public async listImage(): Promise<ListModelsResponse> {
    const allModels = await this.list();
    
    // Filter for image models
    const imageModels = allModels.data?.filter(model => {
      const id = model.id.toLowerCase();
      return id.includes('sd') || 
             id.includes('fluently') || 
             id.includes('dall-e') ||
             id.includes('image');
    }) || [];
    
    return {
      ...allModels,
      data: imageModels
    };
  }

  /**
   * List embedding models only.
   * Convenience method to filter models suitable for embeddings.
   * @returns The list of embedding models.
   */
  public async listEmbedding(): Promise<ListModelsResponse> {
    const allModels = await this.list();
    
    // Filter for embedding models
    const embeddingModels = allModels.data?.filter(model => {
      const id = model.id.toLowerCase();
      return id.includes('embedding');
    }) || [];
    
    return {
      ...allModels,
      data: embeddingModels
    };
  }

  /**
   * Retrieve a specific model by ID.
   * @param modelId - The ID of the model to retrieve.
   * @returns The model details.
   */
  public async retrieve(modelId: string): Promise<any> {
    // Validate model ID
    if (!modelId || typeof modelId !== 'string') {
      throw new Error('Model ID must be a non-empty string');
    }

    // Emit a request event
    this.emit('request', { type: 'models.retrieve', data: { modelId } });

    // Make the API request
    const response = await this.http.get<any>(
      this.getPath(`/${modelId}`)
    );

    // Emit a response event
    this.emit('response', { type: 'models.retrieve', data: response.data });

    return response.data;
  }

  /**
   * Generate a model response.
   * @param request - The model generation request.
   * @returns The generated model response.
   */
  public async generate(request: ModelRequest): Promise<any> {
    // Validate request parameters
    this.validator.validateModelRequest(request);

    // Emit a request event
    this.emit('request', { type: 'models.generate', data: request });

    // Make the API request
    const response = await this.http.post<any>(
      this.getPath('/generate'),
      request
    );

    // Emit a response event
    this.emit('response', { type: 'models.generate', data: response.data });

    return response.data;
  }
}

// Default export
export default ModelsEndpoint;