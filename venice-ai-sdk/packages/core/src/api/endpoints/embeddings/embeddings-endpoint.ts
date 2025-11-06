import { ApiEndpoint } from '../../registry/endpoint';
import type {
  CreateEmbeddingRequest,
  CreateEmbeddingResponse,
} from '../../../types/embeddings';
import { EmbeddingsValidator } from '../../../utils/validators/embeddings-validator';
import type { VeniceClient } from '../../../client';

/**
 * Endpoint for creating embeddings
 */
export class EmbeddingsEndpoint extends ApiEndpoint {
  private validator: EmbeddingsValidator;

  constructor(client: VeniceClient) {
    super(client);
    this.validator = new EmbeddingsValidator();
  }

  /**
   * Get the endpoint path
   */
  getEndpointPath(): string {
    return '/embeddings';
  }

  /**
   * Create embeddings for the provided input
   * 
   * @param request - The embedding creation request
   * @returns Promise resolving to the embedding response
   * 
   * @example
   * ```typescript
   * const response = await venice.embeddings.create({
   *   input: "The food was delicious and the waiter...",
   *   model: "text-embedding-bge-m3"
   * });
   * 
   * console.log(response.data[0].embedding);
   * ```
   * 
   * @example
   * ```typescript
   * // Multiple inputs
   * const response = await venice.embeddings.create({
   *   input: [
   *     "Text 1",
   *     "Text 2",
   *     "Text 3"
   *   ]
   * });
   * 
   * response.data.forEach((embedding, i) => {
   *   console.log(`Embedding ${i}:`, embedding.embedding);
   * });
   * ```
   */
  public async create(
    request: CreateEmbeddingRequest
  ): Promise<CreateEmbeddingResponse> {
    this.validator.validate(request);

    const response = await this.http.post<CreateEmbeddingResponse>(
      this.getEndpointPath(),
      {
        ...request,
        model: request.model || 'text-embedding-bge-m3',
      }
    );

    return response.data;
  }
}
