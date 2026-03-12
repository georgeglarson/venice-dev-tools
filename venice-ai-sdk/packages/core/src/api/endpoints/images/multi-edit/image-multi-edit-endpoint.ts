import { ApiEndpoint } from '../../../registry/endpoint';
import type { MultiEditImageRequest, MultiEditImageResponse } from '../../../../types/images';
import { ImageValidator } from '../../../../utils/validators/image-validator';
import type { VeniceClient } from '../../../../client';

/**
 * API endpoint for multi-image editing operations.
 */
export class ImageMultiEditEndpoint extends ApiEndpoint {
  private validator: ImageValidator;

  constructor(client: VeniceClient) {
    super(client);
    this.validator = new ImageValidator();
  }

  public getEndpointPath(): string {
    return '/images/multi-edit';
  }

  /**
   * Edit multiple images with layered composition.
   * @param request - The multi-edit request (1-3 images).
   * @returns The edited image response.
   */
  public async edit(request: MultiEditImageRequest): Promise<MultiEditImageResponse> {
    this.validator.validateMultiEditImageRequest(request);
    this.emit('request', { type: 'image.multi-edit', data: { ...request, images: `[${request.images.length} images]` } });

    const response = await this.http.post<MultiEditImageResponse>(
      this.getEndpointPath(),
      request
    );

    this.emit('response', { type: 'image.multi-edit', data: response.data });
    return response.data;
  }
}

export default ImageMultiEditEndpoint;
