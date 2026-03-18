import { ApiEndpoint } from '../../../registry/endpoint';
import type { VeniceClient } from '../../../../client';
import type {
  QueueAudioRequest,
  QueueAudioResponse,
  QuoteAudioRequest,
  QuoteAudioResponse,
  RetrieveAudioRequest,
  CompleteAudioRequest,
  CompleteAudioResponse,
} from '../../../../types/audio';

/**
 * Endpoint for async queue-based audio generation operations.
 */
export class AudioQueueEndpoint extends ApiEndpoint {
  constructor(client: VeniceClient) {
    super(client);
  }

  getEndpointPath(): string {
    return '/audio';
  }

  /**
   * Queue an audio generation request.
   */
  public async queue(request: QueueAudioRequest): Promise<QueueAudioResponse> {
    this.emit('request', { type: 'audio.queue', data: request });
    const response = await this.http.post<QueueAudioResponse>(
      this.getPath('/queue'),
      request
    );
    this.emit('response', { type: 'audio.queue', data: response.data });
    return response.data;
  }

  /**
   * Retrieve an audio generation result or status.
   */
  public async retrieve(request: RetrieveAudioRequest): Promise<unknown> {
    this.emit('request', { type: 'audio.retrieve', data: request });
    const response = await this.http.post<unknown>(
      this.getPath('/retrieve'),
      request
    );
    this.emit('response', { type: 'audio.retrieve', data: response.data });
    return response.data;
  }

  /**
   * Get a price quote for audio generation.
   */
  public async quote(request: QuoteAudioRequest): Promise<QuoteAudioResponse> {
    this.emit('request', { type: 'audio.quote', data: request });
    const response = await this.http.post<QuoteAudioResponse>(
      this.getPath('/quote'),
      request
    );
    this.emit('response', { type: 'audio.quote', data: response.data });
    return response.data;
  }

  /**
   * Mark an audio generation as complete and clean up storage.
   */
  public async complete(request: CompleteAudioRequest): Promise<CompleteAudioResponse> {
    this.emit('request', { type: 'audio.complete', data: request });
    const response = await this.http.post<CompleteAudioResponse>(
      this.getPath('/complete'),
      request
    );
    this.emit('response', { type: 'audio.complete', data: response.data });
    return response.data;
  }
}

export default AudioQueueEndpoint;
