import { ApiEndpoint } from '../../registry/endpoint';
import type { CreateVideoRequest, CreateVideoResponse } from '../../../types/video';
import { VideoValidator } from '../../../utils/validators/video-validator';
import type { VeniceClient } from '../../../client';

/**
 * Endpoint for generating videos
 */
export class VideoGenerationEndpoint extends ApiEndpoint {
  private validator: VideoValidator;

  constructor(client: VeniceClient) {
    super(client);
    this.validator = new VideoValidator();
  }

  getEndpointPath(): string {
    return '/videos/generations';
  }

  /**
   * Generate a video from a text prompt
   *
   * @param request - The video generation request
   * @returns Promise resolving to the video generation job
   */
  public async create(request: CreateVideoRequest): Promise<CreateVideoResponse> {
    this.validator.validate(request);
    this.emit('request', { type: 'video.generation', data: request });

    const response = await this.http.post<CreateVideoResponse>(
      this.getEndpointPath(),
      request
    );

    this.emit('response', { type: 'video.generation', data: response.data });
    return response.data;
  }
}

export default VideoGenerationEndpoint;
