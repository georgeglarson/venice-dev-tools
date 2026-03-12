import { ApiEndpoint } from '../../../registry/endpoint';
import type { CreateTranscriptionRequest, CreateTranscriptionResponse } from '../../../../types/audio';
import { AudioValidator } from '../../../../utils/validators/audio-validator';
import type { VeniceClient } from '../../../../client';

/**
 * Endpoint for transcribing audio to text
 */
export class AudioTranscriptionEndpoint extends ApiEndpoint {
  private validator: AudioValidator;

  constructor(client: VeniceClient) {
    super(client);
    this.validator = new AudioValidator();
  }

  getEndpointPath(): string {
    return '/audio/transcriptions';
  }

  /**
   * Transcribe audio to text
   *
   * @param request - The transcription request
   * @returns Promise resolving to transcription result
   */
  public async create(request: CreateTranscriptionRequest): Promise<CreateTranscriptionResponse> {
    this.validator.validateTranscription(request);
    this.emit('request', { type: 'audio.transcription', data: { model: request.model, language: request.language } });

    const response = await this.http.post<CreateTranscriptionResponse>(
      this.getEndpointPath(),
      request
    );

    this.emit('response', { type: 'audio.transcription', data: response.data });
    return response.data;
  }
}
