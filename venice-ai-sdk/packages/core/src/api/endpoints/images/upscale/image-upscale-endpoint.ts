import { ApiEndpoint } from '../../../registry/endpoint';
import { UpscaleImageRequest } from '../../../../types';
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
  public async upscale(params: UpscaleImageRequest): Promise<Blob> {
    // Validate parameters
    this.validator.validateUpscaleImageParams(params);
    
    // Emit a request event
    this.emit('request', { type: 'image.upscale', data: params });

    const formData = new FormData();
    formData.append('image', this.createImageBlob(params.image));

    if (params.scale) {
      formData.append('scale', params.scale.toString());
    }

    // Make the API request with a custom client to handle FormData
    // We can't use the standard http client as it expects JSON
    const url = `${this.http.getBaseUrl()}${this.getPath('/upscale')}`;
    
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

  /**
   * Normalize supported image input types to a Blob for multipart upload.
   * @param image - The provided image payload.
   * @returns A Blob containing the image data.
   */
  private createImageBlob(image: UpscaleImageRequest['image']): Blob {
    if (image instanceof Blob) {
      return image;
    }

    if (image instanceof ArrayBuffer) {
      return new Blob([image]);
    }

    if (typeof image === 'string') {
      if (image.startsWith('data:')) {
        const [metadata, base64Data] = image.split(',');
        const mimeMatch = metadata.match(/data:(.*?);base64/);
        const mimeType = mimeMatch?.[1] || 'application/octet-stream';
        const arrayBuffer = this.decodeBase64(base64Data);
        return new Blob([arrayBuffer], { type: mimeType });
      }

      try {
        const arrayBuffer = this.decodeBase64(image);
        return new Blob([arrayBuffer]);
      } catch {
        return new Blob([image]);
      }
    }

    return new Blob([]);
  }

  /**
   * Decode a base64 string into a Uint8Array, supporting both browser and Node environments.
   * @param base64 - The base64 encoded string.
   */
  private decodeBase64(base64: string): ArrayBuffer {
    if (typeof atob === 'function') {
      const binary = atob(base64);
      const length = binary.length;
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer.slice(0);
    }

    const globalBuffer = typeof globalThis !== 'undefined' ? (globalThis as any).Buffer : undefined;
    if (globalBuffer && typeof globalBuffer.from === 'function') {
      const buffer = globalBuffer.from(base64, 'base64');
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      return arrayBuffer;
    }

    throw new Error('Base64 decoding is not supported in this environment.');
  }
}

export default ImageUpscaleEndpoint;
