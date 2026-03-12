import { ModelsEndpoint } from './index';

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

describe('ModelsEndpoint', () => {
  let endpoint: ModelsEndpoint;
  let mockClient: ReturnType<typeof createMockClient>;

  const mockModelsResponse = {
    object: 'list' as const,
    type: 'all' as const,
    data: [
      { id: 'llama-3.3-70b', type: 'text' as const, object: 'model' as const, created: 1000, owned_by: 'meta', model_spec: {} },
      { id: 'sd-3.5-large', type: 'image' as const, object: 'model' as const, created: 1001, owned_by: 'stability', model_spec: {} },
      { id: 'text-embedding-bge-m3', type: 'text' as const, object: 'model' as const, created: 1002, owned_by: 'bge', model_spec: {} },
      { id: 'fluently-xl', type: 'image' as const, object: 'model' as const, created: 1003, owned_by: 'fluently', model_spec: {} },
      { id: 'dall-e-3', type: 'image' as const, object: 'model' as const, created: 1004, owned_by: 'openai', model_spec: {} },
      { id: 'qwen-2.5-72b', type: 'text' as const, object: 'model' as const, created: 1005, owned_by: 'qwen', model_spec: {} },
    ],
  };

  beforeEach(() => {
    mockClient = createMockClient();
    endpoint = new ModelsEndpoint(mockClient);
  });

  describe('getEndpointPath', () => {
    it('returns /models', () => {
      expect(endpoint.getEndpointPath()).toBe('/models');
    });
  });

  describe('list', () => {
    it('calls http.get with /models', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockModelsResponse, headers: {}, status: 200 });

      await endpoint.list();

      expect(mockClient._mockHttp.get).toHaveBeenCalledWith('/models', { query: undefined });
    });

    it('passes query params', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockModelsResponse, headers: {}, status: 200 });

      await endpoint.list({ type: 'text' });

      expect(mockClient._mockHttp.get).toHaveBeenCalledWith('/models', { query: { type: 'text' } });
    });

    it('returns response.data', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockModelsResponse, headers: {}, status: 200 });

      const result = await endpoint.list();

      expect(result).toEqual(mockModelsResponse);
    });

    it('emits request event', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockModelsResponse, headers: {}, status: 200 });

      await endpoint.list({ type: 'image' });

      expect(mockClient.emit).toHaveBeenCalledWith('request', {
        type: 'models.list',
        data: { type: 'image' },
      });
    });

    it('emits response event', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockModelsResponse, headers: {}, status: 200 });

      await endpoint.list();

      expect(mockClient.emit).toHaveBeenCalledWith('response', {
        type: 'models.list',
        data: mockModelsResponse,
      });
    });

    it('emits request event with undefined data when no params', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockModelsResponse, headers: {}, status: 200 });

      await endpoint.list();

      expect(mockClient.emit).toHaveBeenCalledWith('request', {
        type: 'models.list',
        data: undefined,
      });
    });

    it('validates type enum if params provided', async () => {
      await expect(
        endpoint.list({ type: 'invalid' as any })
      ).rejects.toThrow();
    });

    it('accepts valid type values', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockModelsResponse, headers: {}, status: 200 });

      for (const type of ['text', 'image', 'all', 'code'] as const) {
        await expect(endpoint.list({ type })).resolves.toBeDefined();
      }
    });
  });

  describe('getTraits', () => {
    const mockTraitsResponse = { object: 'list', type: 'text', data: { reasoning: 'Can reason' } };

    it('calls http.get with /models/traits', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockTraitsResponse, headers: {}, status: 200 });

      await endpoint.getTraits();

      expect(mockClient._mockHttp.get).toHaveBeenCalledWith('/models/traits', { query: undefined });
    });

    it('passes type filter as query', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockTraitsResponse, headers: {}, status: 200 });

      await endpoint.getTraits('text');

      expect(mockClient._mockHttp.get).toHaveBeenCalledWith('/models/traits', { query: { type: 'text' } });
    });

    it('validates type enum', async () => {
      await expect(
        endpoint.getTraits('invalid' as any)
      ).rejects.toThrow();
    });

    it('accepts image type', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockTraitsResponse, headers: {}, status: 200 });

      await expect(endpoint.getTraits('image')).resolves.toBeDefined();
    });

    it('emits request and response events', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockTraitsResponse, headers: {}, status: 200 });

      await endpoint.getTraits('text');

      expect(mockClient.emit).toHaveBeenCalledWith('request', {
        type: 'models.traits',
        data: { type: 'text' },
      });
      expect(mockClient.emit).toHaveBeenCalledWith('response', {
        type: 'models.traits',
        data: mockTraitsResponse,
      });
    });

    it('returns response.data', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockTraitsResponse, headers: {}, status: 200 });

      const result = await endpoint.getTraits();

      expect(result).toEqual(mockTraitsResponse);
    });
  });

  describe('getCompatibilityMapping', () => {
    const mockCompatResponse = { object: 'list', type: 'text', data: { 'gpt-4': 'llama-3.3-70b' } };

    it('calls http.get with /models/compatibility_mapping', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockCompatResponse, headers: {}, status: 200 });

      await endpoint.getCompatibilityMapping();

      expect(mockClient._mockHttp.get).toHaveBeenCalledWith(
        '/models/compatibility_mapping',
        { query: undefined }
      );
    });

    it('passes type filter as query', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockCompatResponse, headers: {}, status: 200 });

      await endpoint.getCompatibilityMapping('image');

      expect(mockClient._mockHttp.get).toHaveBeenCalledWith(
        '/models/compatibility_mapping',
        { query: { type: 'image' } }
      );
    });

    it('validates type enum', async () => {
      await expect(
        endpoint.getCompatibilityMapping('bad' as any)
      ).rejects.toThrow();
    });

    it('emits request and response events', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockCompatResponse, headers: {}, status: 200 });

      await endpoint.getCompatibilityMapping();

      expect(mockClient.emit).toHaveBeenCalledWith('request', {
        type: 'models.compatibility',
        data: { type: undefined },
      });
      expect(mockClient.emit).toHaveBeenCalledWith('response', {
        type: 'models.compatibility',
        data: mockCompatResponse,
      });
    });

    it('returns response.data', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockCompatResponse, headers: {}, status: 200 });

      const result = await endpoint.getCompatibilityMapping();

      expect(result).toEqual(mockCompatResponse);
    });
  });

  describe('retrieve', () => {
    const mockModel = {
      id: 'llama-3.3-70b',
      type: 'text',
      object: 'model',
      created: 1000,
      owned_by: 'meta',
      model_spec: {},
    };

    it('calls http.get with /models/{id}', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockModel, headers: {}, status: 200 });

      await endpoint.retrieve('llama-3.3-70b');

      expect(mockClient._mockHttp.get).toHaveBeenCalledWith('/models/llama-3.3-70b');
    });

    it('throws for empty model ID', async () => {
      await expect(endpoint.retrieve('')).rejects.toThrow('Model ID must be a non-empty string');
    });

    it('throws for undefined model ID', async () => {
      await expect(endpoint.retrieve(undefined as any)).rejects.toThrow('Model ID must be a non-empty string');
    });

    it('throws for null model ID', async () => {
      await expect(endpoint.retrieve(null as any)).rejects.toThrow('Model ID must be a non-empty string');
    });

    it('throws for non-string model ID', async () => {
      await expect(endpoint.retrieve(123 as any)).rejects.toThrow('Model ID must be a non-empty string');
    });

    it('emits request and response events', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockModel, headers: {}, status: 200 });

      await endpoint.retrieve('llama-3.3-70b');

      expect(mockClient.emit).toHaveBeenCalledWith('request', {
        type: 'models.retrieve',
        data: { modelId: 'llama-3.3-70b' },
      });
      expect(mockClient.emit).toHaveBeenCalledWith('response', {
        type: 'models.retrieve',
        data: mockModel,
      });
    });

    it('returns response.data', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockModel, headers: {}, status: 200 });

      const result = await endpoint.retrieve('llama-3.3-70b');

      expect(result).toEqual(mockModel);
    });
  });

  describe('generate', () => {
    const validRequest = { model: 'llama-3.3-70b', prompt: 'Hello' };
    const mockGenerateResponse = { text: 'Hi there!' };

    it('calls http.post with /models/generate', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockGenerateResponse, headers: {}, status: 200 });

      await endpoint.generate(validRequest);

      expect(mockClient._mockHttp.post).toHaveBeenCalledWith('/models/generate', validRequest);
    });

    it('emits request and response events', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockGenerateResponse, headers: {}, status: 200 });

      await endpoint.generate(validRequest);

      expect(mockClient.emit).toHaveBeenCalledWith('request', {
        type: 'models.generate',
        data: validRequest,
      });
      expect(mockClient.emit).toHaveBeenCalledWith('response', {
        type: 'models.generate',
        data: mockGenerateResponse,
      });
    });

    it('returns response.data', async () => {
      mockClient._mockHttp.post.mockResolvedValue({ data: mockGenerateResponse, headers: {}, status: 200 });

      const result = await endpoint.generate(validRequest);

      expect(result).toEqual(mockGenerateResponse);
    });

    it('throws for missing model', async () => {
      await expect(
        endpoint.generate({ model: undefined as any, prompt: 'Hello' })
      ).rejects.toThrow();
    });

    it('throws for missing prompt', async () => {
      await expect(
        endpoint.generate({ model: 'llama-3.3-70b', prompt: undefined as any })
      ).rejects.toThrow();
    });

    it('validates optional temperature range', async () => {
      await expect(
        endpoint.generate({ model: 'llama-3.3-70b', prompt: 'Hi', temperature: 3 })
      ).rejects.toThrow();
    });

    it('validates optional top_p range', async () => {
      await expect(
        endpoint.generate({ model: 'llama-3.3-70b', prompt: 'Hi', top_p: 2 })
      ).rejects.toThrow();
    });
  });

  describe('listChat', () => {
    it('filters out image and embedding models', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockModelsResponse, headers: {}, status: 200 });

      const result = await endpoint.listChat();

      const ids = result.data.map(m => m.id);
      expect(ids).toContain('llama-3.3-70b');
      expect(ids).toContain('qwen-2.5-72b');
      expect(ids).not.toContain('sd-3.5-large');
      expect(ids).not.toContain('text-embedding-bge-m3');
      expect(ids).not.toContain('fluently-xl');
      expect(ids).not.toContain('dall-e-3');
    });

    it('preserves other response fields', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockModelsResponse, headers: {}, status: 200 });

      const result = await endpoint.listChat();

      expect(result.object).toBe('list');
      expect(result.type).toBe('all');
    });

    it('returns empty data array when no chat models', async () => {
      const imageOnlyResponse = {
        ...mockModelsResponse,
        data: [{ id: 'sd-3.5-large', type: 'image', object: 'model', created: 1001, owned_by: 'stability', model_spec: {} }],
      };
      mockClient._mockHttp.get.mockResolvedValue({ data: imageOnlyResponse, headers: {}, status: 200 });

      const result = await endpoint.listChat();

      expect(result.data).toEqual([]);
    });
  });

  describe('listImage', () => {
    it('returns only image models', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockModelsResponse, headers: {}, status: 200 });

      const result = await endpoint.listImage();

      const ids = result.data.map(m => m.id);
      expect(ids).toContain('sd-3.5-large');
      expect(ids).toContain('fluently-xl');
      expect(ids).toContain('dall-e-3');
      expect(ids).not.toContain('llama-3.3-70b');
      expect(ids).not.toContain('qwen-2.5-72b');
    });

    it('returns empty data when no image models', async () => {
      const textOnlyResponse = {
        ...mockModelsResponse,
        data: [{ id: 'llama-3.3-70b', type: 'text', object: 'model', created: 1000, owned_by: 'meta', model_spec: {} }],
      };
      mockClient._mockHttp.get.mockResolvedValue({ data: textOnlyResponse, headers: {}, status: 200 });

      const result = await endpoint.listImage();

      expect(result.data).toEqual([]);
    });
  });

  describe('listEmbedding', () => {
    it('returns only embedding models', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockModelsResponse, headers: {}, status: 200 });

      const result = await endpoint.listEmbedding();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('text-embedding-bge-m3');
    });

    it('returns empty data when no embedding models', async () => {
      const noEmbeddingResponse = {
        ...mockModelsResponse,
        data: [{ id: 'llama-3.3-70b', type: 'text', object: 'model', created: 1000, owned_by: 'meta', model_spec: {} }],
      };
      mockClient._mockHttp.get.mockResolvedValue({ data: noEmbeddingResponse, headers: {}, status: 200 });

      const result = await endpoint.listEmbedding();

      expect(result.data).toEqual([]);
    });
  });
});
