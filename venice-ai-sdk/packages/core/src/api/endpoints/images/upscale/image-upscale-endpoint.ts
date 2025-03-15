import { ApiEndpoint } from '../../../registry/endpoint';
import { UpscaleImageParams } from '../../../../types';
import { ImageValidator } from '../../../../utils/validators/image-validator';
import { VeniceApiError } from '../../../../errors';

/**
 * API endpoint for image upscaling operations.
 */
export class ImageUpscaleEndpoint extends ApiEndpoint {
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
   * Upscale an image.
   * @param params - The upscale parameters.
   * @returns The upscaled image as a blob.
   */
  public async upscale(params: UpscaleImageParams): Promise<Blob> {
    // Validate parameters
    this.validator.validateUpscaleImageParams(params);
    
    // Emit a request event
    this.emit('request', { type: 'image.upscale', data: params });

    // Create a FormData object to send the image
    const formData = new FormData();
    formData.append('image', params.image instanceof Blob ? params.image : new Blob([params.image]));
    
    if (params.scale) {
      formData.append('scale', params.scale.toString());
    }

    // Make the API request with a custom client to handle FormData
    // We can't use the standard http client as it expects JSON
    const url = `${(this.client as any).config.baseUrl}${this.getPath('/upscale')}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${(this.client as any).getApiKey()}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
      throw new VeniceApiError(
        errorData.error || `Upscale failed with status ${response.status}`,
        response.status,
        errorData.details
      );
    }

    // Get the image blob
    const blob = await response.blob();

    // Emit a response event
    this.emit('response', { 
      type: 'image.upscale', 
      data: { size: blob.size, type: blob.type }
    });

    return blob;
  }
}

export default ImageUpscaleEndpoint;