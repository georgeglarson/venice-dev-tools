import { ApiEndpoint } from '../../../registry/endpoint';
import { ListImageStylesResponse } from '../../../../types';

/**
 * API endpoint for image styles operations.
 */
export class ImageStylesEndpoint extends ApiEndpoint {
  /**
   * Get the base endpoint path for image requests.
   * @returns The base endpoint path.
   */
  public getEndpointPath(): string {
    return '/image';
  }

  /**
   * List available image styles.
   * @returns The list of available image styles.
   */
  public async listStyles(): Promise<ListImageStylesResponse> {
    // Emit a request event
    this.emit('request', { type: 'image.styles' });

    // Make the API request
    const response = await this.http.get<ListImageStylesResponse>(
      this.getPath('/styles')
    );

    // Emit a response event
    this.emit('response', { type: 'image.styles', data: response.data });

    return response.data;
  }
}

export default ImageStylesEndpoint;