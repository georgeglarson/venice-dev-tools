import { ImageGenerationEndpoint } from './generation/image-generation-endpoint';
import { ImageUpscaleEndpoint } from './upscale/image-upscale-endpoint';
import { ImageStylesEndpoint } from './styles/image-styles-endpoint';
import { ImageEditEndpoint } from './edit/image-edit-endpoint';
import { ImageMultiEditEndpoint } from './multi-edit/image-multi-edit-endpoint';
import { ImageRemoveBackgroundEndpoint } from './remove-background/image-remove-background-endpoint';
import { ApiEndpoint } from '../../registry/endpoint';
import { VeniceClient } from '../../../client';

/**
 * Combined API endpoint for all image-related operations.
 * This class provides backward compatibility with the original ImagesEndpoint.
 */
export class ImagesEndpoint extends ApiEndpoint {
  private generationEndpoint: ImageGenerationEndpoint;
  private upscaleEndpoint: ImageUpscaleEndpoint;
  private stylesEndpoint: ImageStylesEndpoint;
  private editEndpoint: ImageEditEndpoint;
  private multiEditEndpoint: ImageMultiEditEndpoint;
  private removeBackgroundEndpoint: ImageRemoveBackgroundEndpoint;

  /**
   * Create a new images endpoint.
   * @param client - The Venice client.
   */
  constructor(client: VeniceClient) {
    super(client);
    this.generationEndpoint = new ImageGenerationEndpoint(client);
    this.upscaleEndpoint = new ImageUpscaleEndpoint(client);
    this.stylesEndpoint = new ImageStylesEndpoint(client);
    this.editEndpoint = new ImageEditEndpoint(client);
    this.multiEditEndpoint = new ImageMultiEditEndpoint(client);
    this.removeBackgroundEndpoint = new ImageRemoveBackgroundEndpoint(client);
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
   * Delegates to the ImageGenerationEndpoint.
   */
  public async generate(...args: Parameters<ImageGenerationEndpoint['generate']>) {
    return this.generationEndpoint.generate(...args);
  }

  /**
   * Upscale an image.
   * Delegates to the ImageUpscaleEndpoint.
   */
  public async upscale(...args: Parameters<ImageUpscaleEndpoint['upscale']>) {
    return this.upscaleEndpoint.upscale(...args);
  }

  /**
   * List available image styles.
   * Delegates to the ImageStylesEndpoint.
   */
  public async listStyles(...args: Parameters<ImageStylesEndpoint['listStyles']>) {
    return this.stylesEndpoint.listStyles(...args);
  }

  /** Edit an image using text directions. */
  public async edit(...args: Parameters<ImageEditEndpoint['edit']>) {
    return this.editEndpoint.edit(...args);
  }

  /** Edit multiple images with layered composition. */
  public async multiEdit(...args: Parameters<ImageMultiEditEndpoint['edit']>) {
    return this.multiEditEndpoint.edit(...args);
  }

  /** Remove background from an image. */
  public async removeBackground(...args: Parameters<ImageRemoveBackgroundEndpoint['remove']>) {
    return this.removeBackgroundEndpoint.remove(...args);
  }
}

// Export individual endpoints
export { ImageGenerationEndpoint, ImageUpscaleEndpoint, ImageStylesEndpoint, ImageEditEndpoint, ImageMultiEditEndpoint, ImageRemoveBackgroundEndpoint };

// For backward compatibility, export ImagesEndpoint as default
export default ImagesEndpoint;