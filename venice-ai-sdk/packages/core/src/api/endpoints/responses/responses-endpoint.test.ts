import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResponsesEndpoint } from './responses-endpoint';
import type { CreateResponseRequest, CreateResponseResponse } from '../../../types/responses';

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------

function createMockResponse(overrides: Partial<CreateResponseResponse> = {}): CreateResponseResponse {
  return {
    id: 'resp-test-123',
    object: 'response',
    created_at: 1700000000,
    model: 'llama-3.3-70b',
    output: [
      {
        type: 'message',
        id: 'msg-001',
        status: 'completed',
        role: 'assistant',
        content: [{ type: 'output_text', text: 'Hello!', annotations: [] }],
      },
    ],
    status: 'completed',
    usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 },
    ...overrides,
  } as CreateResponseResponse;
}

function createMockClient(overrides: Record<string, any> = {}) {
  const mockResponse = createMockResponse();
  const mockHttp = {
    post: vi.fn().mockResolvedValue({
      data: mockResponse,
      headers: {},
      status: 200,
    }),
    get: vi.fn().mockResolvedValue({ data: {}, headers: {}, status: 200 }),
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

function minimalRequest(overrides: Partial<CreateResponseRequest> = {}): CreateResponseRequest {
  return {
    model: 'llama-3.3-70b',
    input: 'Hello',
    ...overrides,
  };
}

// ============================================================================
// ResponsesEndpoint
// ============================================================================

describe('ResponsesEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: ResponsesEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new ResponsesEndpoint(client);
  });

  // -------------------------------------------------------------------------
  // Basic structure
  // -------------------------------------------------------------------------

  describe('getEndpointPath()', () => {
    it('returns /responses', () => {
      expect(endpoint.getEndpointPath()).toBe('/responses');
    });
  });

  // -------------------------------------------------------------------------
  // create() — standard (non-streaming)
  // -------------------------------------------------------------------------

  describe('create()', () => {
    it('calls http.post with /responses', async () => {
      await endpoint.create(minimalRequest());
      expect(client._mockHttp.post).toHaveBeenCalledWith(
        '/responses',
        expect.objectContaining({ model: 'llama-3.3-70b' }),
      );
    });

    it('passes model and input in the body', async () => {
      await endpoint.create(minimalRequest({ input: 'Tell me a joke' }));
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.model).toBe('llama-3.3-70b');
      expect(body.input).toBe('Tell me a joke');
    });

    it('returns response.data', async () => {
      const result = await endpoint.create(minimalRequest());
      expect(result).toHaveProperty('id', 'resp-test-123');
      expect(result).toHaveProperty('object', 'response');
      expect(result).toHaveProperty('status', 'completed');
    });

    it('emits request event with type responses.create', async () => {
      await endpoint.create(minimalRequest());
      expect(client.emit).toHaveBeenCalledWith(
        'request',
        expect.objectContaining({ type: 'responses.create' }),
      );
    });

    it('emits response event with type responses.create', async () => {
      await endpoint.create(minimalRequest());
      expect(client.emit).toHaveBeenCalledWith(
        'response',
        expect.objectContaining({ type: 'responses.create' }),
      );
    });

    it('emits request before response', async () => {
      const order: string[] = [];
      client.emit.mockImplementation((event: string) => {
        order.push(event);
        return true;
      });
      await endpoint.create(minimalRequest());
      expect(order).toEqual(['request', 'response']);
    });

    it('propagates http errors', async () => {
      client._mockHttp.post.mockRejectedValueOnce(new Error('Network failure'));
      await expect(endpoint.create(minimalRequest())).rejects.toThrow('Network failure');
    });
  });

  // -------------------------------------------------------------------------
  // Request field pass-through
  // -------------------------------------------------------------------------

  describe('request field pass-through', () => {
    it('passes temperature, top_p, max_output_tokens', async () => {
      const req = minimalRequest({
        temperature: 0.5,
        top_p: 0.9,
        max_output_tokens: 100,
      });
      await endpoint.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.temperature).toBe(0.5);
      expect(body.top_p).toBe(0.9);
      expect(body.max_output_tokens).toBe(100);
    });

    it('passes reasoning config', async () => {
      const req = minimalRequest({
        reasoning: { effort: 'high', summary: 'concise' },
      });
      await endpoint.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.reasoning).toEqual({ effort: 'high', summary: 'concise' });
    });

    it('passes include array', async () => {
      const req = minimalRequest({
        include: ['reasoning.encrypted_content', 'usage'],
      });
      await endpoint.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.include).toEqual(['reasoning.encrypted_content', 'usage']);
    });

    it('passes venice_parameters', async () => {
      const req = minimalRequest({
        venice_parameters: {
          enable_web_search: 'on',
          include_venice_system_prompt: false,
        },
      } as any);
      await endpoint.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.venice_parameters.enable_web_search).toBe('on');
      expect(body.venice_parameters.include_venice_system_prompt).toBe(false);
    });

    it('passes tools array', async () => {
      const req = minimalRequest({
        tools: [
          {
            type: 'function' as const,
            name: 'get_weather',
            description: 'Get the weather',
            parameters: { type: 'object', properties: { city: { type: 'string' } } },
          },
        ],
      });
      await endpoint.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.tools).toHaveLength(1);
      expect(body.tools[0].name).toBe('get_weather');
    });

    it('passes input as array of items', async () => {
      const req = minimalRequest({
        input: [
          { type: 'message', role: 'user', content: 'Hello' },
        ],
      });
      await endpoint.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.input).toHaveLength(1);
      expect(body.input[0].role).toBe('user');
    });
  });

  // -------------------------------------------------------------------------
  // create() with stream=true
  // -------------------------------------------------------------------------

  describe('create() with stream=true', () => {
    it('returns an async generator when stream=true', () => {
      const chunks = [
        'data: {"type":"response.created","response":{"id":"r1"}}\n\n',
        'data: [DONE]\n\n',
      ];
      let index = 0;
      const reader = {
        read: vi.fn().mockImplementation(async () => {
          if (index >= chunks.length) {
            return { done: true, value: undefined };
          }
          const value = new TextEncoder().encode(chunks[index]);
          index++;
          return { done: false, value };
        }),
      };
      client._mockStreamingHttp.stream.mockResolvedValue({
        body: { getReader: () => reader },
      });

      const result = endpoint.create(minimalRequest({ stream: true }));
      expect(Symbol.asyncIterator in Object(result)).toBe(true);
    });
  });
});
