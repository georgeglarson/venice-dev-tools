import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KeysEndpoint } from './index';
import { VeniceValidationError } from '../../../errors/types/validation-error';

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------

function createMockApiKey(overrides: Record<string, unknown> = {}) {
  return {
    id: 'key-test-123',
    description: 'Test Key',
    apiKeyType: 'INFERENCE',
    createdAt: '2024-01-01T00:00:00Z',
    expiresAt: null,
    lastUsedAt: null,
    last6Chars: 'abc123',
    consumptionLimits: null,
    usage: undefined,
    apiKey: undefined,
    ...overrides,
  };
}

function createMockClient(overrides: Record<string, any> = {}) {
  const mockHttp = {
    post: vi.fn().mockResolvedValue({
      data: { success: true, data: createMockApiKey() },
      headers: {},
      status: 200,
    }),
    get: vi.fn().mockResolvedValue({
      data: { object: 'list', data: [createMockApiKey()] },
      headers: {},
      status: 200,
    }),
    delete: vi.fn().mockResolvedValue({
      data: { success: true },
      headers: {},
      status: 200,
    }),
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
    _mockHttp: mockHttp,
    _mockStreamingHttp: mockStreamingHttp,
    _mockLogger: mockLogger,
  } as any;
}

// ============================================================================
// KeysEndpoint
// ============================================================================

describe('KeysEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: KeysEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new KeysEndpoint(client);
  });

  // -------------------------------------------------------------------------
  // Basic structure
  // -------------------------------------------------------------------------

  describe('getEndpointPath()', () => {
    it('returns /api_keys', () => {
      expect(endpoint.getEndpointPath()).toBe('/api_keys');
    });
  });

  // -------------------------------------------------------------------------
  // list()
  // -------------------------------------------------------------------------

  describe('list()', () => {
    it('calls http.get with /api_keys', async () => {
      await endpoint.list();
      expect(client._mockHttp.get).toHaveBeenCalledWith('/api_keys');
    });

    it('returns normalized API keys', async () => {
      const result = await endpoint.list();
      expect(result).toHaveProperty('object', 'list');
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('id', 'key-test-123');
    });

    it('includes api_keys backward compatibility field', async () => {
      const result = await endpoint.list();
      expect(result.api_keys).toHaveLength(1);
      expect(result.api_keys[0]).toHaveProperty('id', 'key-test-123');
    });

    it('emits request event with type keys.list', async () => {
      await endpoint.list();
      expect(client.emit).toHaveBeenCalledWith(
        'request',
        expect.objectContaining({ type: 'keys.list' }),
      );
    });

    it('emits response event with type keys.list', async () => {
      await endpoint.list();
      expect(client.emit).toHaveBeenCalledWith(
        'response',
        expect.objectContaining({ type: 'keys.list' }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // create()
  // -------------------------------------------------------------------------

  describe('create()', () => {
    it('calls http.post with /api_keys', async () => {
      await endpoint.create({ description: 'New Key' });
      expect(client._mockHttp.post).toHaveBeenCalledWith(
        '/api_keys',
        expect.objectContaining({ description: 'New Key' }),
      );
    });

    it('returns the created API key', async () => {
      const result = await endpoint.create({ description: 'New Key' });
      expect(result).toHaveProperty('success', true);
      expect(result.api_key).toHaveProperty('id', 'key-test-123');
    });

    it('emits request event with type keys.create', async () => {
      await endpoint.create({ description: 'New Key' });
      expect(client.emit).toHaveBeenCalledWith(
        'request',
        expect.objectContaining({ type: 'keys.create' }),
      );
    });

    it('emits response event with type keys.create', async () => {
      await endpoint.create({ description: 'New Key' });
      expect(client.emit).toHaveBeenCalledWith(
        'response',
        expect.objectContaining({ type: 'keys.create' }),
      );
    });

    it('throws VeniceValidationError when description is missing', async () => {
      await expect(
        endpoint.create({} as any),
      ).rejects.toThrow(VeniceValidationError);
    });

    it('accepts name as alias for description', async () => {
      await endpoint.create({ name: 'Legacy Name' } as any);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.description).toBe('Legacy Name');
    });

    it('passes apiKeyType in payload', async () => {
      await endpoint.create({ description: 'Key', apiKeyType: 'INFERENCE' });
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.apiKeyType).toBe('INFERENCE');
    });
  });

  // -------------------------------------------------------------------------
  // retrieve()
  // -------------------------------------------------------------------------

  describe('retrieve()', () => {
    it('calls http.get with /api_keys/{id}', async () => {
      client._mockHttp.get.mockResolvedValueOnce({
        data: { data: createMockApiKey() },
        headers: {},
        status: 200,
      });
      await endpoint.retrieve('key-test-123');
      expect(client._mockHttp.get).toHaveBeenCalledWith('/api_keys/key-test-123');
    });

    it('returns the API key', async () => {
      client._mockHttp.get.mockResolvedValueOnce({
        data: { data: createMockApiKey() },
        headers: {},
        status: 200,
      });
      const result = await endpoint.retrieve('key-test-123');
      expect(result.api_key).toHaveProperty('id', 'key-test-123');
    });

    it('throws VeniceValidationError when id is empty', async () => {
      await expect(endpoint.retrieve('')).rejects.toThrow(VeniceValidationError);
    });

    it('emits request event with type keys.retrieve', async () => {
      client._mockHttp.get.mockResolvedValueOnce({
        data: { data: createMockApiKey() },
        headers: {},
        status: 200,
      });
      await endpoint.retrieve('key-test-123');
      expect(client.emit).toHaveBeenCalledWith(
        'request',
        expect.objectContaining({ type: 'keys.retrieve' }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // delete()
  // -------------------------------------------------------------------------

  describe('delete()', () => {
    it('calls http.delete with /api_keys and query param', async () => {
      await endpoint.delete({ id: 'key-test-123' });
      expect(client._mockHttp.delete).toHaveBeenCalledWith(
        '/api_keys',
        { query: { id: 'key-test-123' } },
      );
    });

    it('returns success response', async () => {
      const result = await endpoint.delete({ id: 'key-test-123' });
      expect(result).toHaveProperty('success', true);
    });

    it('throws VeniceValidationError when id is empty', async () => {
      await expect(endpoint.delete({ id: '' })).rejects.toThrow(VeniceValidationError);
    });

    it('emits request event with type keys.delete', async () => {
      await endpoint.delete({ id: 'key-test-123' });
      expect(client.emit).toHaveBeenCalledWith(
        'request',
        expect.objectContaining({ type: 'keys.delete' }),
      );
    });

    it('emits response event with type keys.delete', async () => {
      await endpoint.delete({ id: 'key-test-123' });
      expect(client.emit).toHaveBeenCalledWith(
        'response',
        expect.objectContaining({ type: 'keys.delete' }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // revoke()
  // -------------------------------------------------------------------------

  describe('revoke()', () => {
    it('calls http.delete with /api_keys and query param', async () => {
      await endpoint.revoke('key-test-123');
      expect(client._mockHttp.delete).toHaveBeenCalledWith(
        '/api_keys',
        { query: { id: 'key-test-123' } },
      );
    });

    it('throws VeniceValidationError when id is empty', async () => {
      await expect(endpoint.revoke('')).rejects.toThrow(VeniceValidationError);
    });
  });

  // -------------------------------------------------------------------------
  // update() — currently unsupported
  // -------------------------------------------------------------------------

  describe('update()', () => {
    it('throws VeniceValidationError when id is empty', async () => {
      await expect(endpoint.update('', {})).rejects.toThrow(VeniceValidationError);
    });

    it('throws VeniceValidationError because update is not supported', async () => {
      await expect(endpoint.update('key-test-123', {})).rejects.toThrow(VeniceValidationError);
    });
  });

  // -------------------------------------------------------------------------
  // getRateLimits()
  // -------------------------------------------------------------------------

  describe('getRateLimits()', () => {
    it('calls http.get with /api_keys/rate_limits', async () => {
      await endpoint.getRateLimits();
      expect(client._mockHttp.get).toHaveBeenCalledWith('/api_keys/rate_limits');
    });

    it('emits request event with type keys.rateLimits', async () => {
      await endpoint.getRateLimits();
      expect(client.emit).toHaveBeenCalledWith(
        'request',
        expect.objectContaining({ type: 'keys.rateLimits' }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // getRateLimitLogs()
  // -------------------------------------------------------------------------

  describe('getRateLimitLogs()', () => {
    it('calls http.get with /api_keys/rate_limits/log', async () => {
      client._mockHttp.get.mockResolvedValueOnce({
        data: { data: [] },
        headers: {},
        status: 200,
      });
      await endpoint.getRateLimitLogs();
      expect(client._mockHttp.get).toHaveBeenCalledWith('/api_keys/rate_limits/log');
    });
  });

  // -------------------------------------------------------------------------
  // generateWeb3Token()
  // -------------------------------------------------------------------------

  describe('generateWeb3Token()', () => {
    it('calls http.get with /api_keys/generate_web3_key', async () => {
      client._mockHttp.get.mockResolvedValueOnce({
        data: { success: true, data: { token: 'web3-token-abc' } },
        headers: {},
        status: 200,
      });
      await endpoint.generateWeb3Token();
      expect(client._mockHttp.get).toHaveBeenCalledWith('/api_keys/generate_web3_key');
    });

    it('returns the token', async () => {
      client._mockHttp.get.mockResolvedValueOnce({
        data: { success: true, data: { token: 'web3-token-abc' } },
        headers: {},
        status: 200,
      });
      const result = await endpoint.generateWeb3Token();
      expect(result).toHaveProperty('token', 'web3-token-abc');
    });
  });

  // -------------------------------------------------------------------------
  // createWithWeb3()
  // -------------------------------------------------------------------------

  describe('createWithWeb3()', () => {
    const validWeb3Params = {
      address: '0x1234567890abcdef',
      signature: 'sig-abc',
      token: 'tok-123',
    };

    it('calls http.post with /api_keys/generate_web3_key', async () => {
      client._mockHttp.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            ...createMockApiKey(),
            apiKey: 'new-key-value',
          },
        },
        headers: {},
        status: 200,
      });
      await endpoint.createWithWeb3(validWeb3Params);
      expect(client._mockHttp.post).toHaveBeenCalledWith(
        '/api_keys/generate_web3_key',
        expect.objectContaining({
          address: '0x1234567890abcdef',
          signature: 'sig-abc',
          token: 'tok-123',
        }),
      );
    });

    it('throws VeniceValidationError when address is missing', async () => {
      await expect(
        endpoint.createWithWeb3({ ...validWeb3Params, address: '' }),
      ).rejects.toThrow(VeniceValidationError);
    });

    it('throws VeniceValidationError when signature is missing', async () => {
      await expect(
        endpoint.createWithWeb3({ ...validWeb3Params, signature: '' }),
      ).rejects.toThrow(VeniceValidationError);
    });

    it('throws VeniceValidationError when token is missing', async () => {
      await expect(
        endpoint.createWithWeb3({ ...validWeb3Params, token: '' }),
      ).rejects.toThrow(VeniceValidationError);
    });

    it('emits request event with type keys.createWithWeb3', async () => {
      client._mockHttp.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            ...createMockApiKey(),
            apiKey: 'new-key-value',
          },
        },
        headers: {},
        status: 200,
      });
      await endpoint.createWithWeb3(validWeb3Params);
      expect(client.emit).toHaveBeenCalledWith(
        'request',
        expect.objectContaining({ type: 'keys.createWithWeb3' }),
      );
    });
  });
});
