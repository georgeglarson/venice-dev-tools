import { ApiEndpoint } from '../../../registry/endpoint';
import { 
  GenerateImageRequest, 
  GenerateImageResponse, 
  GenerateImageResponseHeaders 
} from '../../../../types';
import { ImageValidator } from '../../../../utils/validators/image-validator';

/**
 * API endpoint for image generation operations.
 */
export class ImageGenerationEndpoint extends ApiEndpoint {
  /**
   * The image validator
   */
  private validator: ImageValidator;

  /**
   * Constructor
   */
  constructor(client: any) {
    super(client);
    this.validator = new ImageValidator();
  }

  /**
   * Get the base endpoint path for image requests.
   * @returns The base endpoint path.
   */
  public getEndpointPath(): string {
    return '/image';
  }

  /**
   * Generate an image.
   * @param request - The image generation request.
   * @returns The generated image response.
   */
  public async generate(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    // Validate request parameters
    this.validator.validateGenerateImageRequest(request);

    // Emit a request event
    this.emit('request', { type: 'image.generate', data: request });

    // Make the API request
    const response = await this.http.post<GenerateImageResponse>(
      this.getPath('/generate'),
      request
    );

    // Extract special headers
    const headers: GenerateImageResponseHeaders = {};
    if ('x-venice-is-content-violation' in response.headers) {
      headers['x-venice-is-content-violation'] = 
        response.headers['x-venice-is-content-violation'] === 'true';
    }
    if ('x-venice-is-blurred' in response.headers) {
      headers['x-venice-is-blurred'] = 
        response.headers['x-venice-is-blurred'] === 'true';
    }

    // Emit a response event with headers
    this.emit('response', { 
      type: 'image.generate', 
      data: response.data,
      headers
    });

    return response.data;
  }
}

export default ImageGenerationEndpoint;