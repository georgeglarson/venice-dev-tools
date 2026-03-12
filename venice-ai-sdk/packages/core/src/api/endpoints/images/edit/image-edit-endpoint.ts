import { ApiEndpoint } from '../../../registry/endpoint';
import type { EditImageRequest, EditImageResponse } from '../../../../types/images';
import { ImageValidator } from '../../../../utils/validators/image-validator';
import type { VeniceClient } from '../../../../client';

/**
 * API endpoint for image editing operations.
 */
export class ImageEditEndpoint extends ApiEndpoint {
  private validator: ImageValidator;

  constructor(client: VeniceClient) {
    super(client);
    this.validator = new ImageValidator();
  }

  public getEndpointPath(): string {
    return '/images/edits';
  }

  /**
   * Edit an image using text directions.
   * @param request - The image edit request.
   * @returns The edited image response.
   */
  public async edit(request: EditImageRequest): Promise<EditImageResponse> {
    this.validator.validateEditImageRequest(request);
    this.emit('request', { type: 'image.edit', data: { ...request, image: '[binary]' } });

    const response = await this.http.post<EditImageResponse>(
      this.getEndpointPath(),
      request
    );

    this.emit('response', { type: 'image.edit', data: response.data });
    return response.data;
  }
}

export default ImageEditEndpoint;
