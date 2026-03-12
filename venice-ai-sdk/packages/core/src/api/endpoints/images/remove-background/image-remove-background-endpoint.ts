import { ApiEndpoint } from '../../../registry/endpoint';
import type { RemoveBackgroundRequest, RemoveBackgroundResponse } from '../../../../types/images';
import { ImageValidator } from '../../../../utils/validators/image-validator';
import type { VeniceClient } from '../../../../client';

/**
 * API endpoint for image background removal.
 */
export class ImageRemoveBackgroundEndpoint extends ApiEndpoint {
  private validator: ImageValidator;

  constructor(client: VeniceClient) {
    super(client);
    this.validator = new ImageValidator();
  }

  public getEndpointPath(): string {
    return '/images/remove-background';
  }

  /**
   * Remove background from an image.
   * @param request - The background removal request.
   * @returns The image with background removed.
   */
  public async remove(request: RemoveBackgroundRequest): Promise<RemoveBackgroundResponse> {
    this.validator.validateRemoveBackgroundRequest(request);
    this.emit('request', { type: 'image.remove-background', data: request.image_url ? { image_url: request.image_url } : { image: '[binary]' } });

    const response = await this.http.post<RemoveBackgroundResponse>(
      this.getEndpointPath(),
      request
    );

    this.emit('response', { type: 'image.remove-background', data: response.data });
    return response.data;
  }
}

export default ImageRemoveBackgroundEndpoint;
