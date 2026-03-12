import { EmbeddingsEndpoint } from './embeddings-endpoint';

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

describe('EmbeddingsEndpoint', () => {
  let endpoint: EmbeddingsEndpoint;
  let mockClient: ReturnType<typeof createMockClient>;

  const mockEmbeddingResponse = {
    object: 'list' as const,
    data: [{ object: 'embedding' as const, embedding: [0.1, 0.2, 0.3], index: 0 }],
    model: 'text-embedding-bge-m3',
    usage: { prompt_tokens: 5, total_tokens: 5 },
  };

  beforeEach(() => {
    mockClient = createMockClient();
    endpoint = new EmbeddingsEndpoint(mockClient);
  });

  describe('getEndpointPath', () => {
    it('returns /embeddings', () => {
      expect(endpoint.getEndpointPath()).toBe('/embeddings');
    });
  });

  describe('create', () => {
    it('calls http.post with /embeddings', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockEmbeddingResponse, headers: {}, status: 200 });

      await endpoint.create({ input: 'Hello world' });

      expect(mockClient._mockHttp.post).toHaveBeenCalledWith(
        '/embeddings',
        expect.objectContaining({ input: 'Hello world' })
      );
    });

    it('uses default model text-embedding-bge-m3 when not specified', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockEmbeddingResponse, headers: {}, status: 200 });

      await endpoint.create({ input: 'Hello world' });

      expect(mockClient._mockHttp.post).toHaveBeenCalledWith(
        '/embeddings',
        { input: 'Hello world', model: 'text-embedding-bge-m3' }
      );
    });

    it('uses provided model when specified', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockEmbeddingResponse, headers: {}, status: 200 });

      await endpoint.create({ input: 'Hello', model: 'custom-model' });

      expect(mockClient._mockHttp.post).toHaveBeenCalledWith(
        '/embeddings',
        { input: 'Hello', model: 'custom-model' }
      );
    });

    it('returns response.data', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockEmbeddingResponse, headers: {}, status: 200 });

      const result = await endpoint.create({ input: 'Hello world' });

      expect(result).toEqual(mockEmbeddingResponse);
    });

    it('accepts string input', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockEmbeddingResponse, headers: {}, status: 200 });

      await expect(endpoint.create({ input: 'Single text' })).resolves.toBeDefined();
    });

    it('accepts array of strings input', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockEmbeddingResponse, headers: {}, status: 200 });

      await expect(endpoint.create({ input: ['Text 1', 'Text 2'] })).resolves.toBeDefined();
    });

    it('throws for missing input', async () => {
      await expect(
        endpoint.create({ input: undefined as any })
      ).rejects.toThrow();
    });

    it('throws for empty string input', async () => {
      await expect(
        endpoint.create({ input: '' })
      ).rejects.toThrow();
    });

    it('throws for empty array input', async () => {
      await expect(
        endpoint.create({ input: [] })
      ).rejects.toThrow();
    });

    it('throws for non-string/non-array input', async () => {
      await expect(
        endpoint.create({ input: 123 as any })
      ).rejects.toThrow();
    });

    it('throws for array with empty strings', async () => {
      await expect(
        endpoint.create({ input: ['valid', ''] })
      ).rejects.toThrow();
    });

    it('throws for invalid encoding_format', async () => {
      await expect(
        endpoint.create({ input: 'Hello', encoding_format: 'binary' as any })
      ).rejects.toThrow();
    });

    it('accepts float encoding_format', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockEmbeddingResponse, headers: {}, status: 200 });

      await expect(
        endpoint.create({ input: 'Hello', encoding_format: 'float' })
      ).resolves.toBeDefined();
    });

    it('accepts base64 encoding_format', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockEmbeddingResponse, headers: {}, status: 200 });

      await expect(
        endpoint.create({ input: 'Hello', encoding_format: 'base64' })
      ).resolves.toBeDefined();
    });

    it('throws for invalid dimensions (< 1)', async () => {
      await expect(
        endpoint.create({ input: 'Hello', dimensions: 0 })
      ).rejects.toThrow();
    });

    it('accepts valid dimensions', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockEmbeddingResponse, headers: {}, status: 200 });

      await expect(
        endpoint.create({ input: 'Hello', dimensions: 512 })
      ).resolves.toBeDefined();
    });

    it('passes all optional fields in the request', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockEmbeddingResponse, headers: {}, status: 200 });

      await endpoint.create({
        input: 'Hello',
        model: 'custom-model',
        encoding_format: 'float',
        dimensions: 256,
        user: 'user-123',
      });

      expect(mockClient._mockHttp.post).toHaveBeenCalledWith(
        '/embeddings',
        {
          input: 'Hello',
          model: 'custom-model',
          encoding_format: 'float',
          dimensions: 256,
          user: 'user-123',
        }
      );
    });

    it('throws for empty user string', async () => {
      await expect(
        endpoint.create({ input: 'Hello', user: '' })
      ).rejects.toThrow();
    });

    it('propagates http errors', async () => {
      mockClient._mockHttp.post.mockRejectedValue(new Error('Service unavailable'));

      await expect(endpoint.create({ input: 'Hello' })).rejects.toThrow('Service unavailable');
    });
  });
});
