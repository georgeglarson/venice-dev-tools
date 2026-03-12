import { AudioSpeechEndpoint } from './speech/audio-speech-endpoint';
import { AudioTranscriptionEndpoint } from './transcription/audio-transcription-endpoint';

function createMockClient(overrides: Record<string, any> = {}) {
  const mockHttp = {
    post: vi.fn().mockResolvedValue({ data: {}, headers: {}, status: 200 }),
    get: vi.fn().mockResolvedValue({ data: {}, headers: {}, status: 200 }),
    delete: vi.fn().mockResolvedValue({ data: {}, headers: {}, status: 200 }),
    getBaseUrl: vi.fn().mockReturnValue('https://api.venice.ai/api/v1'),
    ...overrides.http,
  };
  const mockStreamingHttp = {
    stream: vi.fn(),
    ...overrides.streamingHttp,
  };
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    ...overrides.logger,
  };
  return {
    getStandardHttpClient: vi.fn().mockReturnValue(mockHttp),
    getStreamingHttpClient: vi.fn().mockReturnValue(mockStreamingHttp),
    getLogger: vi.fn().mockReturnValue(mockLogger),
    emit: vi.fn().mockReturnValue(true),
    getApiKey: vi.fn().mockReturnValue('test-api-key'),
    _mockHttp: mockHttp,
    _mockStreamingHttp: mockStreamingHttp,
    _mockLogger: mockLogger,
  } as any;
}

describe('AudioSpeechEndpoint', () => {
  let endpoint: AudioSpeechEndpoint;
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    endpoint = new AudioSpeechEndpoint(mockClient);
  });

  describe('getEndpointPath', () => {
    it('returns /audio/speech', () => {
      expect(endpoint.getEndpointPath()).toBe('/audio/speech');
    });
  });

  describe('create', () => {
    const validRequest = {
      input: 'Hello world',
      model: 'tts-kokoro',
      voice: 'af_sky',
    };

    it('calls http.post with /audio/speech', async () => {
      const buffer = new ArrayBuffer(16);
      mockClient._mockHttp.post.mockResolvedValue({ data: buffer, headers: {}, status: 200 });

      await endpoint.create(validRequest);

      expect(mockClient._mockHttp.post).toHaveBeenCalledWith(
        '/audio/speech',
        validRequest,
        { responseType: 'arraybuffer' }
      );
    });

    it('passes request body correctly', async () => {
      const request = {
        input: 'Test text',
        model: 'tts-kokoro',
        voice: 'am_adam',
        response_format: 'wav' as const,
        speed: 1.5,
      };
      const buffer = new ArrayBuffer(32);
      mockClient._mockHttp.post.mockResolvedValue({ data: buffer, headers: {}, status: 200 });

      await endpoint.create(request);

      expect(mockClient._mockHttp.post).toHaveBeenCalledWith(
        '/audio/speech',
        request,
        { responseType: 'arraybuffer' }
      );
    });

    it('uses responseType arraybuffer', async () => {
      const buffer = new ArrayBuffer(8);
      mockClient._mockHttp.post.mockResolvedValue({ data: buffer, headers: {}, status: 200 });

      await endpoint.create(validRequest);

      const callArgs = mockClient._mockHttp.post.mock.calls[0];
      expect(callArgs[2]).toEqual({ responseType: 'arraybuffer' });
    });

    it('returns response.data (ArrayBuffer)', async () => {
      const buffer = new ArrayBuffer(64);
      mockClient._mockHttp.post.mockResolvedValue({ data: buffer, headers: {}, status: 200 });

      const result = await endpoint.create(validRequest);

      expect(result).toBe(buffer);
    });

    it('throws for missing input', async () => {
      await expect(
        endpoint.create({ input: undefined as any, model: 'tts-kokoro', voice: 'af_sky' })
      ).rejects.toThrow();
    });

    it('throws for empty input string', async () => {
      await expect(
        endpoint.create({ input: '', model: 'tts-kokoro', voice: 'af_sky' })
      ).rejects.toThrow();
    });

    it('throws for input > 4096 chars', async () => {
      const longInput = 'a'.repeat(4097);
      await expect(
        endpoint.create({ input: longInput, model: 'tts-kokoro', voice: 'af_sky' })
      ).rejects.toThrow('4096');
    });

    it('allows input exactly 4096 chars', async () => {
      const input = 'a'.repeat(4096);
      const buffer = new ArrayBuffer(8);
      mockClient._mockHttp.post.mockResolvedValue({ data: buffer, headers: {}, status: 200 });

      const result = await endpoint.create({ input, model: 'tts-kokoro', voice: 'af_sky' });
      expect(result).toBe(buffer);
    });

    it('throws for missing model', async () => {
      await expect(
        endpoint.create({ input: 'Hello', model: undefined as any, voice: 'af_sky' })
      ).rejects.toThrow();
    });

    it('throws for empty model', async () => {
      await expect(
        endpoint.create({ input: 'Hello', model: '', voice: 'af_sky' })
      ).rejects.toThrow();
    });

    it('throws for missing voice', async () => {
      await expect(
        endpoint.create({ input: 'Hello', model: 'tts-kokoro', voice: undefined as any })
      ).rejects.toThrow();
    });

    it('throws for empty voice', async () => {
      await expect(
        endpoint.create({ input: 'Hello', model: 'tts-kokoro', voice: '' })
      ).rejects.toThrow();
    });

    it('throws for invalid response_format', async () => {
      await expect(
        endpoint.create({
          input: 'Hello',
          model: 'tts-kokoro',
          voice: 'af_sky',
          response_format: 'invalid' as any,
        })
      ).rejects.toThrow();
    });

    it('accepts valid response_format values', async () => {
      const formats = ['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm'] as const;
      const buffer = new ArrayBuffer(8);
      mockClient._mockHttp.post.mockResolvedValue({ data: buffer, headers: {}, status: 200 });

      for (const format of formats) {
        await expect(
          endpoint.create({ input: 'Hello', model: 'tts-kokoro', voice: 'af_sky', response_format: format })
        ).resolves.toBe(buffer);
      }
    });

    it('throws for speed below 0.25', async () => {
      await expect(
        endpoint.create({ input: 'Hello', model: 'tts-kokoro', voice: 'af_sky', speed: 0.1 })
      ).rejects.toThrow();
    });

    it('throws for speed above 4.0', async () => {
      await expect(
        endpoint.create({ input: 'Hello', model: 'tts-kokoro', voice: 'af_sky', speed: 5.0 })
      ).rejects.toThrow();
    });

    it('accepts speed at boundaries', async () => {
      const buffer = new ArrayBuffer(8);
      mockClient._mockHttp.post.mockResolvedValue({ data: buffer, headers: {}, status: 200 });

      await expect(
        endpoint.create({ input: 'Hello', model: 'tts-kokoro', voice: 'af_sky', speed: 0.25 })
      ).resolves.toBe(buffer);

      await expect(
        endpoint.create({ input: 'Hello', model: 'tts-kokoro', voice: 'af_sky', speed: 4.0 })
      ).resolves.toBe(buffer);
    });

    it('propagates http errors', async () => {
      mockClient._mockHttp.post.mockRejectedValue(new Error('Network error'));

      await expect(endpoint.create(validRequest)).rejects.toThrow('Network error');
    });
  });
});

describe('AudioTranscriptionEndpoint', () => {
  let endpoint: AudioTranscriptionEndpoint;
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    endpoint = new AudioTranscriptionEndpoint(mockClient);
  });

  describe('getEndpointPath', () => {
    it('returns /audio/transcriptions', () => {
      expect(endpoint.getEndpointPath()).toBe('/audio/transcriptions');
    });
  });

  describe('create', () => {
    const validRequest = {
      file: new ArrayBuffer(100),
    };

    it('calls http.post with /audio/transcriptions', async () => {
      const responseData = { text: 'Hello world' };
      mockClient._mockHttp.post.mockResolvedValue({ data: responseData, headers: {}, status: 200 });

      await endpoint.create(validRequest);

      expect(mockClient._mockHttp.post).toHaveBeenCalledWith(
        '/audio/transcriptions',
        validRequest
      );
    });

    it('passes request body with all options', async () => {
      const request = {
        file: new ArrayBuffer(100),
        model: 'openai/whisper-large-v3',
        response_format: 'json' as const,
        language: 'en',
        timestamps: true,
      };
      const responseData = { text: 'Hello' };
      mockClient._mockHttp.post.mockResolvedValue({ data: responseData, headers: {}, status: 200 });

      await endpoint.create(request);

      expect(mockClient._mockHttp.post).toHaveBeenCalledWith(
        '/audio/transcriptions',
        request
      );
    });

    it('returns response.data', async () => {
      const responseData = { text: 'Transcribed text', segments: [] };
      mockClient._mockHttp.post.mockResolvedValue({ data: responseData, headers: {}, status: 200 });

      const result = await endpoint.create(validRequest);

      expect(result).toEqual(responseData);
    });

    it('emits request event', async () => {
      const responseData = { text: 'Hello' };
      mockClient._mockHttp.post.mockResolvedValue({ data: responseData, headers: {}, status: 200 });

      await endpoint.create({ file: new ArrayBuffer(10), model: 'whisper', language: 'en' });

      expect(mockClient.emit).toHaveBeenCalledWith('request', {
        type: 'audio.transcription',
        data: { model: 'whisper', language: 'en' },
      });
    });

    it('emits response event', async () => {
      const responseData = { text: 'Hello world' };
      mockClient._mockHttp.post.mockResolvedValue({ data: responseData, headers: {}, status: 200 });

      await endpoint.create(validRequest);

      expect(mockClient.emit).toHaveBeenCalledWith('response', {
        type: 'audio.transcription',
        data: responseData,
      });
    });

    it('throws for missing file', async () => {
      await expect(
        endpoint.create({ file: undefined as any })
      ).rejects.toThrow();
    });

    it('throws for null file', async () => {
      await expect(
        endpoint.create({ file: null as any })
      ).rejects.toThrow();
    });

    it('throws for invalid response_format', async () => {
      await expect(
        endpoint.create({ file: new ArrayBuffer(10), response_format: 'xml' as any })
      ).rejects.toThrow();
    });

    it('accepts json response_format', async () => {
      const responseData = { text: 'Hi' };
      mockClient._mockHttp.post.mockResolvedValue({ data: responseData, headers: {}, status: 200 });

      await expect(
        endpoint.create({ file: new ArrayBuffer(10), response_format: 'json' })
      ).resolves.toEqual(responseData);
    });

    it('accepts text response_format', async () => {
      const responseData = { text: 'Hi' };
      mockClient._mockHttp.post.mockResolvedValue({ data: responseData, headers: {}, status: 200 });

      await expect(
        endpoint.create({ file: new ArrayBuffer(10), response_format: 'text' })
      ).resolves.toEqual(responseData);
    });

    it('propagates http errors', async () => {
      mockClient._mockHttp.post.mockRejectedValue(new Error('Server error'));

      await expect(endpoint.create(validRequest)).rejects.toThrow('Server error');
    });
  });
});
