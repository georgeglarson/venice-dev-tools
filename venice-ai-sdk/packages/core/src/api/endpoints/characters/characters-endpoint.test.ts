import { CharactersEndpoint } from './index';

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

describe('CharactersEndpoint', () => {
  let endpoint: CharactersEndpoint;
  let mockClient: ReturnType<typeof createMockClient>;

  const mockCharactersResponse = {
    object: 'list' as const,
    data: [
      {
        name: 'Alice',
        description: 'A helpful assistant',
        slug: 'alice',
        shareUrl: 'https://venice.ai/characters/alice',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-06-01T00:00:00Z',
        webEnabled: true,
        adult: false,
        tags: ['assistant', 'helpful'],
        stats: { imports: 100 },
      },
      {
        name: 'Bob',
        description: null,
        slug: 'bob',
        shareUrl: null,
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-05-01T00:00:00Z',
        webEnabled: false,
        adult: false,
        tags: [],
        stats: { imports: 50 },
      },
    ],
  };

  beforeEach(() => {
    mockClient = createMockClient();
    endpoint = new CharactersEndpoint(mockClient);
  });

  describe('getEndpointPath', () => {
    it('returns /characters', () => {
      expect(endpoint.getEndpointPath()).toBe('/characters');
    });
  });

  describe('list', () => {
    it('calls http.get with /characters', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockCharactersResponse, headers: {}, status: 200 });

      await endpoint.list();

      expect(mockClient._mockHttp.get).toHaveBeenCalledWith('/characters');
    });

    it('returns response.data', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockCharactersResponse, headers: {}, status: 200 });

      const result = await endpoint.list();

      expect(result).toEqual(mockCharactersResponse);
    });

    it('returns the full characters list with all fields', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockCharactersResponse, headers: {}, status: 200 });

      const result = await endpoint.list();

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Alice');
      expect(result.data[0].slug).toBe('alice');
      expect(result.data[0].tags).toEqual(['assistant', 'helpful']);
      expect(result.data[1].name).toBe('Bob');
      expect(result.data[1].description).toBeNull();
    });

    it('emits request event', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockCharactersResponse, headers: {}, status: 200 });

      await endpoint.list();

      expect(mockClient.emit).toHaveBeenCalledWith('request', {
        type: 'characters.list',
      });
    });

    it('emits response event with count', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockCharactersResponse, headers: {}, status: 200 });

      await endpoint.list();

      expect(mockClient.emit).toHaveBeenCalledWith('response', {
        type: 'characters.list',
        data: { count: 2 },
      });
    });

    it('emits response event with correct count for empty list', async () => {
      const emptyResponse = { object: 'list', data: [] };
      mockClient._mockHttp.get.mockResolvedValue({ data: emptyResponse, headers: {}, status: 200 });

      await endpoint.list();

      expect(mockClient.emit).toHaveBeenCalledWith('response', {
        type: 'characters.list',
        data: { count: 0 },
      });
    });

    it('propagates http errors', async () => {
      mockClient._mockHttp.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(endpoint.list()).rejects.toThrow('Unauthorized');
    });

    it('emits request event before making http call', async () => {
      const callOrder: string[] = [];
      mockClient.emit.mockImplementation(() => {
        callOrder.push('emit');
        return true;
      });
      mockClient._mockHttp.get.mockImplementation(async () => {
        callOrder.push('get');
        return { data: mockCharactersResponse, headers: {}, status: 200 };
      });

      await endpoint.list();

      expect(callOrder[0]).toBe('emit');
      expect(callOrder[1]).toBe('get');
    });

    it('returns object type list', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockCharactersResponse, headers: {}, status: 200 });

      const result = await endpoint.list();

      expect(result.object).toBe('list');
    });
  });
});
