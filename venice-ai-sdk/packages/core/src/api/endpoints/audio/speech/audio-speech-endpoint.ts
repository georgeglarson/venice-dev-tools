import { ApiEndpoint } from '../../../registry/endpoint';
import type { CreateSpeechRequest } from '../../../../types/audio';
import { AudioValidator } from '../../../../utils/validators/audio-validator';
import type { VeniceClient } from '../../../../client';

/**
 * Endpoint for generating speech from text
 */
export class AudioSpeechEndpoint extends ApiEndpoint {
  private validator: AudioValidator;

  constructor(client: VeniceClient) {
    super(client);
    this.validator = new AudioValidator();
  }

  /**
   * Get the endpoint path
   */
  getEndpointPath(): string {
    return '/audio/speech';
  }

  /**
   * Generate audio from text using text-to-speech
   * 
   * @param request - The speech generation request
   * @returns Promise resolving to audio data as ArrayBuffer
   * 
   * @example
   * ```typescript
   * const audioBuffer = await venice.audio.speech.create({
   *   model: "tts-1",
   *   voice: "alloy",
   *   input: "Hello! This is a test of the text to speech system."
   * });
   * 
   * // Save to file or play directly
   * const fs = require('fs');
   * fs.writeFileSync('speech.mp3', Buffer.from(audioBuffer));
   * ```
   * 
   * @example
   * ```typescript
   * // Generate with custom voice and format
   * const audioBuffer = await venice.audio.speech.create({
   *   model: "tts-1-hd",
   *   voice: "nova",
   *   input: "The quick brown fox jumps over the lazy dog.",
   *   response_format: "wav",
   *   speed: 1.25
   * });
   * ```
   */
  public async create(request: CreateSpeechRequest): Promise<ArrayBuffer> {
    this.validator.validate(request);

    const response = await this.http.post<ArrayBuffer>(
      this.getEndpointPath(),
      request,
      {
        responseType: 'arraybuffer',
      }
    );

    return response;
  }
}
