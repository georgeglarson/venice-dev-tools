import { VideoGenerationEndpoint } from './video-generation-endpoint';

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

describe('VideoGenerationEndpoint', () => {
  let endpoint: VideoGenerationEndpoint;
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    endpoint = new VideoGenerationEndpoint(mockClient);
  });

  describe('getEndpointPath', () => {
    it('returns /videos/generations', () => {
      expect(endpoint.getEndpointPath()).toBe('/videos/generations');
    });
  });

  describe('create', () => {
    const validRequest = {
      model: 'wan-2.5-preview',
      prompt: 'A sunset over the ocean',
    };

    const mockResponse = {
      id: 'video-123',
      object: 'video',
      created: 1234567890,
      status: 'queued' as const,
      model: 'wan-2.5-preview',
    };

    it('calls http.post with /videos/generations', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockResponse, headers: {}, status: 200 });

      await endpoint.create(validRequest);

      expect(mockClient._mockHttp.post).toHaveBeenCalledWith(
        '/videos/generations',
        validRequest
      );
    });

    it('passes request body with model and prompt', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockResponse, headers: {}, status: 200 });

      await endpoint.create(validRequest);

      const callArgs = mockClient._mockHttp.post.mock.calls[0];
      expect(callArgs[1]).toEqual(validRequest);
    });

    it('returns response.data', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockResponse, headers: {}, status: 200 });

      const result = await endpoint.create(validRequest);

      expect(result).toEqual(mockResponse);
    });

    it('emits request event', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockResponse, headers: {}, status: 200 });

      await endpoint.create(validRequest);

      expect(mockClient.emit).toHaveBeenCalledWith('request', {
        type: 'video.generation',
        data: validRequest,
      });
    });

    it('emits response event', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockResponse, headers: {}, status: 200 });

      await endpoint.create(validRequest);

      expect(mockClient.emit).toHaveBeenCalledWith('response', {
        type: 'video.generation',
        data: mockResponse,
      });
    });

    it('throws for missing model', async () => {
      await expect(
        endpoint.create({ model: undefined as any, prompt: 'test' })
      ).rejects.toThrow();
    });

    it('throws for empty model', async () => {
      await expect(
        endpoint.create({ model: '', prompt: 'test' })
      ).rejects.toThrow();
    });

    it('throws for missing prompt', async () => {
      await expect(
        endpoint.create({ model: 'wan-2.5-preview', prompt: undefined as any })
      ).rejects.toThrow();
    });

    it('throws for empty prompt', async () => {
      await expect(
        endpoint.create({ model: 'wan-2.5-preview', prompt: '' })
      ).rejects.toThrow();
    });

    it('throws for prompt > 2500 chars', async () => {
      const longPrompt = 'a'.repeat(2501);
      await expect(
        endpoint.create({ model: 'wan-2.5-preview', prompt: longPrompt })
      ).rejects.toThrow('2500');
    });

    it('allows prompt exactly 2500 chars', async () => {
      const prompt = 'a'.repeat(2500);
      mockClient._mockHttp.post.mockResolvedValue({ data: mockResponse, headers: {}, status: 200 });

      const result = await endpoint.create({ model: 'wan-2.5-preview', prompt });
      expect(result).toEqual(mockResponse);
    });

    it('passes optional negative_prompt', async () => {
      const request = {
        model: 'wan-2.5-preview',
        prompt: 'A sunset',
        negative_prompt: 'blurry, low quality',
      };
      mockClient._mockHttp.post.mockResolvedValue({ data: mockResponse, headers: {}, status: 200 });

      await endpoint.create(request);

      expect(mockClient._mockHttp.post).toHaveBeenCalledWith(
        '/videos/generations',
        request
      );
    });

    it('passes optional seed', async () => {
      const request = {
        model: 'wan-2.5-preview',
        prompt: 'A sunset',
        seed: 42,
      };
      mockClient._mockHttp.post.mockResolvedValue({ data: mockResponse, headers: {}, status: 200 });

      await endpoint.create(request);

      expect(mockClient._mockHttp.post).toHaveBeenCalledWith(
        '/videos/generations',
        request
      );
    });

    it('passes all optional fields together', async () => {
      const request = {
        model: 'wan-2.5-preview',
        prompt: 'A sunset',
        negative_prompt: 'blurry',
        seed: 123,
      };
      mockClient._mockHttp.post.mockResolvedValue({ data: mockResponse, headers: {}, status: 200 });

      await endpoint.create(request);

      expect(mockClient._mockHttp.post).toHaveBeenCalledWith(
        '/videos/generations',
        request
      );
    });

    it('propagates http errors', async () => {
      mockClient._mockHttp.post.mockRejectedValue(new Error('Timeout'));

      await expect(endpoint.create(validRequest)).rejects.toThrow('Timeout');
    });

    it('emits request event before making http call', async () => {
      const callOrder: string[] = [];
      mockClient.emit.mockImplementation(() => {
        callOrder.push('emit');
        return true;
      });
      mockClient._mockHttp.post.mockImplementation(async () => {
        callOrder.push('post');
        return { data: mockResponse, headers: {}, status: 200 };
      });

      await endpoint.create(validRequest);

      expect(callOrder[0]).toBe('emit');
      expect(callOrder[1]).toBe('post');
    });
  });
});
