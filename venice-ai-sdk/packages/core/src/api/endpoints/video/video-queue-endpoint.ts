import { ApiEndpoint } from '../../registry/endpoint';
import type { VeniceClient } from '../../../client';
import type {
  QueueVideoRequest,
  QueueVideoResponse,
  QuoteVideoRequest,
  QuoteVideoResponse,
  RetrieveVideoRequest,
  RetrieveVideoProcessingResponse,
  CompleteVideoRequest,
  CompleteVideoResponse,
  CreateVideoTranscriptionRequest,
} from '../../../types/video';

/**
 * Endpoint for async queue-based video operations.
 *
 * Supports queuing, retrieving, quoting, completing, and transcribing videos.
 */
export class VideoQueueEndpoint extends ApiEndpoint {
  constructor(client: VeniceClient) {
    super(client);
  }

  getEndpointPath(): string {
    return '/video';
  }

  /**
   * Queue a video generation request.
   */
  public async queue(request: QueueVideoRequest): Promise<QueueVideoResponse> {
    this.emit('request', { type: 'video.queue', data: request });
    const response = await this.http.post<QueueVideoResponse>(
      this.getPath('/queue'),
      request
    );
    this.emit('response', { type: 'video.queue', data: response.data });
    return response.data;
  }

  /**
   * Retrieve a video generation result or status.
   */
  public async retrieve(request: RetrieveVideoRequest): Promise<RetrieveVideoProcessingResponse | Blob> {
    this.emit('request', { type: 'video.retrieve', data: request });
    const response = await this.http.post<RetrieveVideoProcessingResponse>(
      this.getPath('/retrieve'),
      request
    );
    this.emit('response', { type: 'video.retrieve', data: response.data });
    return response.data;
  }

  /**
   * Get a price quote for video generation.
   */
  public async quote(request: QuoteVideoRequest): Promise<QuoteVideoResponse> {
    this.emit('request', { type: 'video.quote', data: request });
    const response = await this.http.post<QuoteVideoResponse>(
      this.getPath('/quote'),
      request
    );
    this.emit('response', { type: 'video.quote', data: response.data });
    return response.data;
  }

  /**
   * Mark a video generation as complete and clean up storage.
   */
  public async complete(request: CompleteVideoRequest): Promise<CompleteVideoResponse> {
    this.emit('request', { type: 'video.complete', data: request });
    const response = await this.http.post<CompleteVideoResponse>(
      this.getPath('/complete'),
      request
    );
    this.emit('response', { type: 'video.complete', data: response.data });
    return response.data;
  }

  /**
   * Transcribe a video from a URL.
   */
  public async transcribe(request: CreateVideoTranscriptionRequest): Promise<{ text: string }> {
    this.emit('request', { type: 'video.transcription', data: request });
    const response = await this.http.post<{ text: string }>(
      this.getPath('/transcriptions'),
      request
    );
    this.emit('response', { type: 'video.transcription', data: response.data });
    return response.data;
  }
}

export default VideoQueueEndpoint;
