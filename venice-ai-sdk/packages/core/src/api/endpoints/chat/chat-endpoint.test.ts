import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatEndpoint } from './standard/chat-endpoint';
import { ChatStreamEndpoint } from './stream/chat-stream-endpoint';
import { VeniceValidationError, VeniceStreamError } from '../../../errors';
import type { ChatCompletionRequest, ChatCompletionResponse } from '../../../types';

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------

function createMockResponse(overrides: Partial<ChatCompletionResponse> = {}): ChatCompletionResponse {
  return {
    id: 'chatcmpl-test-123',
    object: 'chat.completion',
    created: 1700000000,
    model: 'llama-3.3-70b',
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: 'Hello!' },
        finish_reason: 'stop',
      },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    ...overrides,
  };
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

function minimalRequest(overrides: Partial<ChatCompletionRequest> = {}): ChatCompletionRequest {
  return {
    model: 'llama-3.3-70b',
    messages: [{ role: 'user', content: 'Hello' }],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Helpers for simulating streaming
// ---------------------------------------------------------------------------

function createMockStreamResponse(chunks: string[], nullBody = false) {
  if (nullBody) {
    return { body: null };
  }
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
  return {
    body: {
      getReader: () => reader,
    },
  };
}

// ============================================================================
// ChatEndpoint
// ============================================================================

describe('ChatEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: ChatEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new ChatEndpoint(client);
  });

  // -------------------------------------------------------------------------
  // Basic structure
  // -------------------------------------------------------------------------

  describe('getEndpointPath()', () => {
    it('returns /chat', () => {
      expect(endpoint.getEndpointPath()).toBe('/chat');
    });
  });

  // -------------------------------------------------------------------------
  // completions.create() — standard (non-streaming)
  // -------------------------------------------------------------------------

  describe('completions.create()', () => {
    it('calls http.post with /chat/completions', async () => {
      await endpoint.completions.create(minimalRequest());
      expect(client._mockHttp.post).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({ model: 'llama-3.3-70b' }),
      );
    });

    it('passes model and messages in the body', async () => {
      const req = minimalRequest({
        messages: [
          { role: 'system', content: 'Be helpful' },
          { role: 'user', content: 'Hi' },
        ],
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.model).toBe('llama-3.3-70b');
      expect(body.messages).toHaveLength(2);
      expect(body.messages[0].role).toBe('system');
    });

    it('returns response.data', async () => {
      const result = await endpoint.completions.create(minimalRequest());
      expect(result).toHaveProperty('id', 'chatcmpl-test-123');
      expect(result).toHaveProperty('object', 'chat.completion');
      expect(result.choices).toHaveLength(1);
    });

    it('emits request event with type chat.completion', async () => {
      await endpoint.completions.create(minimalRequest());
      expect(client.emit).toHaveBeenCalledWith(
        'request',
        expect.objectContaining({ type: 'chat.completion' }),
      );
    });

    it('emits response event with type chat.completion', async () => {
      await endpoint.completions.create(minimalRequest());
      expect(client.emit).toHaveBeenCalledWith(
        'response',
        expect.objectContaining({ type: 'chat.completion' }),
      );
    });

    it('emits request before response', async () => {
      const order: string[] = [];
      client.emit.mockImplementation((event: string) => {
        order.push(event);
        return true;
      });
      await endpoint.completions.create(minimalRequest());
      expect(order).toEqual(['request', 'response']);
    });

    it('returns the full ChatCompletionResponse shape', async () => {
      const res = await endpoint.completions.create(minimalRequest());
      expect(res).toHaveProperty('id');
      expect(res).toHaveProperty('object');
      expect(res).toHaveProperty('created');
      expect(res).toHaveProperty('model');
      expect(res).toHaveProperty('choices');
      expect(res).toHaveProperty('usage');
      expect(res.usage).toHaveProperty('prompt_tokens');
      expect(res.usage).toHaveProperty('completion_tokens');
      expect(res.usage).toHaveProperty('total_tokens');
    });

    it('propagates http errors', async () => {
      client._mockHttp.post.mockRejectedValueOnce(new Error('Network failure'));
      await expect(endpoint.completions.create(minimalRequest())).rejects.toThrow('Network failure');
    });
  });

  // -------------------------------------------------------------------------
  // completions.create() with stream=true
  // -------------------------------------------------------------------------

  describe('completions.create() with stream=true', () => {
    it('returns an async generator when stream=true', () => {
      const streamResponse = createMockStreamResponse([
        'data: {"id":"c1","choices":[{"delta":{"content":"Hi"}}]}\n\n',
        'data: [DONE]\n\n',
      ]);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const result = endpoint.completions.create(minimalRequest({ stream: true }));
      // An async generator has Symbol.asyncIterator
      expect(Symbol.asyncIterator in Object(result)).toBe(true);
    });

    it('yields chunks from the stream', async () => {
      const streamResponse = createMockStreamResponse([
        'data: {"id":"c1","choices":[{"delta":{"content":"Hi"}}]}\n\n',
        'data: {"id":"c1","choices":[{"delta":{"content":" there"}}]}\n\n',
        'data: [DONE]\n\n',
      ]);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.completions.create(minimalRequest({ stream: true })) as AsyncGenerator;
      const chunks: any[] = [];
      for await (const chunk of gen) {
        chunks.push(chunk);
      }
      expect(chunks).toHaveLength(2);
      expect(chunks[0].id).toBe('c1');
    });
  });

  // -------------------------------------------------------------------------
  // completions.createStream()
  // -------------------------------------------------------------------------

  describe('completions.createStream()', () => {
    it('returns an async generator', () => {
      const streamResponse = createMockStreamResponse([
        'data: {"id":"c1","choices":[]}\n\n',
        'data: [DONE]\n\n',
      ]);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const result = endpoint.completions.createStream(minimalRequest());
      expect(Symbol.asyncIterator in Object(result)).toBe(true);
    });

    it('forces stream=true in the request body', async () => {
      const streamResponse = createMockStreamResponse(['data: [DONE]\n\n']);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.completions.createStream(minimalRequest());
      // consume to trigger the call
      for await (const _ of gen) { /* noop */ }

      const body = client._mockStreamingHttp.stream.mock.calls[0][1];
      expect(body.stream).toBe(true);
    });

    it('emits request event with type chat.completion.stream', async () => {
      const streamResponse = createMockStreamResponse(['data: [DONE]\n\n']);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.completions.createStream(minimalRequest());
      for await (const _ of gen) { /* noop */ }

      expect(client.emit).toHaveBeenCalledWith(
        'request',
        expect.objectContaining({ type: 'chat.completion.stream' }),
      );
    });

    it('emits response event with completed status when stream ends', async () => {
      const streamResponse = createMockStreamResponse(['data: [DONE]\n\n']);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.completions.createStream(minimalRequest());
      for await (const _ of gen) { /* noop */ }

      expect(client.emit).toHaveBeenCalledWith(
        'response',
        expect.objectContaining({
          type: 'chat.completion.stream',
          data: { status: 'completed' },
        }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Deprecated createCompletion()
  // -------------------------------------------------------------------------

  describe('createCompletion() (deprecated)', () => {
    it('logs a deprecation warning', async () => {
      await endpoint.createCompletion(minimalRequest());
      expect(client._mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('DEPRECATED'),
      );
    });

    it('delegates to _create and returns response data', async () => {
      const result = await endpoint.createCompletion(minimalRequest());
      expect(result).toHaveProperty('id', 'chatcmpl-test-123');
      expect(client._mockHttp.post).toHaveBeenCalled();
    });

    it('calls http.post with /chat/completions', async () => {
      await endpoint.createCompletion(minimalRequest());
      expect(client._mockHttp.post).toHaveBeenCalledWith(
        '/chat/completions',
        expect.anything(),
      );
    });
  });

  // -------------------------------------------------------------------------
  // createCompletionStream()
  // -------------------------------------------------------------------------

  describe('createCompletionStream()', () => {
    it('returns an async generator', () => {
      const streamResponse = createMockStreamResponse(['data: [DONE]\n\n']);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const result = endpoint.createCompletionStream(minimalRequest());
      expect(Symbol.asyncIterator in Object(result)).toBe(true);
    });

    it('delegates to _stream with stream=true in body', async () => {
      const streamResponse = createMockStreamResponse(['data: [DONE]\n\n']);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.createCompletionStream(minimalRequest());
      for await (const _ of gen) { /* noop */ }

      const body = client._mockStreamingHttp.stream.mock.calls[0][1];
      expect(body.stream).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Validation errors
  // -------------------------------------------------------------------------

  describe('validation', () => {
    it('throws on missing model', async () => {
      await expect(
        endpoint.completions.create({ model: '', messages: [{ role: 'user', content: 'hi' }] }),
      ).rejects.toThrow(VeniceValidationError);
    });

    it('throws on undefined model', async () => {
      await expect(
        endpoint.completions.create({ model: undefined as any, messages: [{ role: 'user', content: 'hi' }] }),
      ).rejects.toThrow(VeniceValidationError);
    });

    it('throws on missing messages', async () => {
      await expect(
        endpoint.completions.create({ model: 'test', messages: undefined as any }),
      ).rejects.toThrow(VeniceValidationError);
    });

    it('throws on empty messages array', async () => {
      await expect(
        endpoint.completions.create({ model: 'test', messages: [] }),
      ).rejects.toThrow(VeniceValidationError);
    });

    it('throws on invalid message role', async () => {
      await expect(
        endpoint.completions.create({
          model: 'test',
          messages: [{ role: 'invalid' as any, content: 'hi' }],
        }),
      ).rejects.toThrow(VeniceValidationError);
    });

    it('throws on missing message content', async () => {
      await expect(
        endpoint.completions.create({
          model: 'test',
          messages: [{ role: 'user', content: undefined as any }],
        }),
      ).rejects.toThrow(VeniceValidationError);
    });

    it('does not emit request event when validation fails', async () => {
      try {
        await endpoint.completions.create({ model: '', messages: [{ role: 'user', content: 'hi' }] });
      } catch { /* expected */ }
      expect(client.emit).not.toHaveBeenCalledWith('request', expect.anything());
    });

    it('validates before making streaming request', async () => {
      const streamResponse = createMockStreamResponse(['data: [DONE]\n\n']);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.completions.createStream({ model: '', messages: [{ role: 'user', content: 'hi' }] });
      await expect(async () => {
        for await (const _ of gen) { /* noop */ }
      }).rejects.toThrow(VeniceValidationError);

      expect(client._mockStreamingHttp.stream).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Stream error: null body
  // -------------------------------------------------------------------------

  describe('stream error handling', () => {
    it('throws VeniceStreamError if response body is null', async () => {
      const streamResponse = createMockStreamResponse([], true);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.completions.createStream(minimalRequest());
      await expect(async () => {
        for await (const _ of gen) { /* noop */ }
      }).rejects.toThrow(VeniceStreamError);
    });

    it('throws VeniceStreamError with descriptive message', async () => {
      const streamResponse = createMockStreamResponse([], true);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.completions.createStream(minimalRequest());
      await expect(async () => {
        for await (const _ of gen) { /* noop */ }
      }).rejects.toThrow('Stream response body is null');
    });

    it('emits response event even when stream throws', async () => {
      const streamResponse = createMockStreamResponse([], true);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.completions.createStream(minimalRequest());
      try {
        for await (const _ of gen) { /* noop */ }
      } catch { /* expected */ }

      expect(client.emit).toHaveBeenCalledWith(
        'response',
        expect.objectContaining({
          type: 'chat.completion.stream',
          data: { status: 'completed' },
        }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Request pass-through of all fields
  // -------------------------------------------------------------------------

  describe('request field pass-through', () => {
    it('passes temperature, top_p, max_tokens, stop', async () => {
      const req = minimalRequest({
        temperature: 0.5,
        top_p: 0.9,
        max_tokens: 100,
        stop: ['\n'],
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.temperature).toBe(0.5);
      expect(body.top_p).toBe(0.9);
      expect(body.max_tokens).toBe(100);
      expect(body.stop).toEqual(['\n']);
    });

    it('passes frequency_penalty and presence_penalty', async () => {
      const req = minimalRequest({
        frequency_penalty: 0.5,
        presence_penalty: -0.5,
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.frequency_penalty).toBe(0.5);
      expect(body.presence_penalty).toBe(-0.5);
    });

    it('passes venice_parameters', async () => {
      const req = minimalRequest({
        venice_parameters: {
          character_slug: 'my-char',
          enable_web_search: 'on',
          include_venice_system_prompt: false,
        },
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.venice_parameters.character_slug).toBe('my-char');
      expect(body.venice_parameters.enable_web_search).toBe('on');
      expect(body.venice_parameters.include_venice_system_prompt).toBe(false);
    });

    it('passes venice_parameters web scraping and citations', async () => {
      const req = minimalRequest({
        venice_parameters: {
          enable_web_scraping: true,
          enable_web_citations: true,
        },
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.venice_parameters.enable_web_scraping).toBe(true);
      expect(body.venice_parameters.enable_web_citations).toBe(true);
    });

    it('passes venice_parameters e2ee and x_search', async () => {
      const req = minimalRequest({
        venice_parameters: {
          enable_e2ee: true,
          enable_x_search: true,
        },
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.venice_parameters.enable_e2ee).toBe(true);
      expect(body.venice_parameters.enable_x_search).toBe(true);
    });

    it('passes stop_token_ids and user fields', async () => {
      const req = minimalRequest({
        stop_token_ids: [50256, 50257],
        user: 'test-user',
        store: true,
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.stop_token_ids).toEqual([50256, 50257]);
      expect(body.user).toBe('test-user');
      expect(body.store).toBe(true);
    });

    it('passes text verbosity and include fields', async () => {
      const req = minimalRequest({
        text: { verbosity: 'high' },
        include: ['usage', 'logprobs'],
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.text).toEqual({ verbosity: 'high' });
      expect(body.include).toEqual(['usage', 'logprobs']);
    });

    it('passes reasoning config', async () => {
      const req = minimalRequest({
        reasoning: { effort: 'high', summary: 'concise' },
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.reasoning).toEqual({ effort: 'high', summary: 'concise' });
    });

    it('passes reasoning_effort shorthand', async () => {
      const req = minimalRequest({ reasoning_effort: 'medium' });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.reasoning_effort).toBe('medium');
    });

    it('passes response_format json_schema', async () => {
      const req = minimalRequest({
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'my_schema',
            description: 'test schema',
            schema: { type: 'object', properties: { name: { type: 'string' } } },
            strict: true,
          },
        },
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.response_format.type).toBe('json_schema');
      expect(body.response_format.json_schema.name).toBe('my_schema');
      expect(body.response_format.json_schema.strict).toBe(true);
    });

    it('passes response_format json_object', async () => {
      const req = minimalRequest({
        response_format: { type: 'json_object' },
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.response_format.type).toBe('json_object');
    });

    it('passes tools array', async () => {
      const req = minimalRequest({
        tools: [
          {
            type: 'function',
            function: {
              name: 'get_weather',
              description: 'Get the weather',
              parameters: { type: 'object', properties: { city: { type: 'string' } } },
            },
          },
        ],
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.tools).toHaveLength(1);
      expect(body.tools[0].function.name).toBe('get_weather');
    });

    it('passes tool_choice auto', async () => {
      const req = minimalRequest({ tool_choice: 'auto' });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.tool_choice).toBe('auto');
    });

    it('passes tool_choice as function object', async () => {
      const req = minimalRequest({
        tool_choice: { type: 'function', function: { name: 'get_weather' } },
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.tool_choice).toEqual({ type: 'function', function: { name: 'get_weather' } });
    });

    it('passes stream_options', async () => {
      const streamResponse = createMockStreamResponse(['data: [DONE]\n\n']);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const req = minimalRequest({
        stream: true,
        stream_options: { include_usage: true },
      });
      const gen = endpoint.completions.create(req) as AsyncGenerator;
      for await (const _ of gen) { /* noop */ }

      const body = client._mockStreamingHttp.stream.mock.calls[0][1];
      expect(body.stream_options).toEqual({ include_usage: true });
    });

    it('passes metadata', async () => {
      const req = minimalRequest({
        metadata: { request_id: 'abc-123', user: 'test' },
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.metadata).toEqual({ request_id: 'abc-123', user: 'test' });
    });

    it('passes n, seed, logprobs, top_logprobs', async () => {
      const req = minimalRequest({
        n: 3,
        seed: 42,
        logprobs: true,
        top_logprobs: 5,
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.n).toBe(3);
      expect(body.seed).toBe(42);
      expect(body.logprobs).toBe(true);
      expect(body.top_logprobs).toBe(5);
    });

    it('passes max_completion_tokens', async () => {
      const req = minimalRequest({ max_completion_tokens: 4096 });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.max_completion_tokens).toBe(4096);
    });

    it('passes prompt_cache_key and prompt_cache_retention', async () => {
      const req = minimalRequest({
        prompt_cache_key: 'my-cache',
        prompt_cache_retention: 'extended',
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.prompt_cache_key).toBe('my-cache');
      expect(body.prompt_cache_retention).toBe('extended');
    });

    it('passes parallel_tool_calls', async () => {
      const req = minimalRequest({ parallel_tool_calls: true });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.parallel_tool_calls).toBe(true);
    });

    it('passes top_k, repetition_penalty, min_temp, max_temp, min_p', async () => {
      const req = minimalRequest({
        top_k: 50,
        repetition_penalty: 1.2,
        min_temp: 0.1,
        max_temp: 1.5,
        min_p: 0.05,
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.top_k).toBe(50);
      expect(body.repetition_penalty).toBe(1.2);
      expect(body.min_temp).toBe(0.1);
      expect(body.max_temp).toBe(1.5);
      expect(body.min_p).toBe(0.05);
    });
  });

  // -------------------------------------------------------------------------
  // Multimodal messages
  // -------------------------------------------------------------------------

  describe('multimodal content', () => {
    it('passes multimodal message content array', async () => {
      const req = minimalRequest({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'What is in this image?' },
              { type: 'image_url', image_url: { url: 'https://example.com/img.png' } },
            ],
          },
        ],
      });
      await endpoint.completions.create(req);
      const body = client._mockHttp.post.mock.calls[0][1];
      expect(body.messages[0].content).toHaveLength(2);
      expect(body.messages[0].content[0].type).toBe('text');
      expect(body.messages[0].content[1].type).toBe('image_url');
    });
  });
});

// ============================================================================
// ChatStreamEndpoint
// ============================================================================

describe('ChatStreamEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: ChatStreamEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new ChatStreamEndpoint(client);
  });

  describe('getEndpointPath()', () => {
    it('returns /chat', () => {
      expect(endpoint.getEndpointPath()).toBe('/chat');
    });
  });

  describe('streamCompletion()', () => {
    it('calls streamingHttp.stream with /chat/completions', async () => {
      const streamResponse = createMockStreamResponse(['data: [DONE]\n\n']);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.streamCompletion(minimalRequest());
      for await (const _ of gen) { /* noop */ }

      expect(client._mockStreamingHttp.stream).toHaveBeenCalledWith(
        '/chat/completions',
        expect.anything(),
      );
    });

    it('sets stream=true in request body', async () => {
      const streamResponse = createMockStreamResponse(['data: [DONE]\n\n']);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.streamCompletion(minimalRequest());
      for await (const _ of gen) { /* noop */ }

      const body = client._mockStreamingHttp.stream.mock.calls[0][1];
      expect(body.stream).toBe(true);
    });

    it('sets stream=true even when request has stream=false', async () => {
      const streamResponse = createMockStreamResponse(['data: [DONE]\n\n']);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.streamCompletion(minimalRequest({ stream: false }));
      for await (const _ of gen) { /* noop */ }

      const body = client._mockStreamingHttp.stream.mock.calls[0][1];
      expect(body.stream).toBe(true);
    });

    it('emits request event with type chat.completion.stream', async () => {
      const streamResponse = createMockStreamResponse(['data: [DONE]\n\n']);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.streamCompletion(minimalRequest());
      for await (const _ of gen) { /* noop */ }

      expect(client.emit).toHaveBeenCalledWith(
        'request',
        expect.objectContaining({ type: 'chat.completion.stream' }),
      );
    });

    it('emits response event when stream ends', async () => {
      const streamResponse = createMockStreamResponse(['data: [DONE]\n\n']);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.streamCompletion(minimalRequest());
      for await (const _ of gen) { /* noop */ }

      expect(client.emit).toHaveBeenCalledWith(
        'response',
        expect.objectContaining({
          type: 'chat.completion.stream',
          data: { status: 'completed' },
        }),
      );
    });

    it('yields parsed chunks', async () => {
      const streamResponse = createMockStreamResponse([
        'data: {"id":"s1","choices":[{"delta":{"content":"A"}}]}\n\n',
        'data: {"id":"s1","choices":[{"delta":{"content":"B"}}]}\n\n',
        'data: [DONE]\n\n',
      ]);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.streamCompletion(minimalRequest());
      const chunks: any[] = [];
      for await (const chunk of gen) {
        chunks.push(chunk);
      }
      expect(chunks).toHaveLength(2);
      expect(chunks[0].choices[0].delta.content).toBe('A');
      expect(chunks[1].choices[0].delta.content).toBe('B');
    });

    it('validates request before streaming', async () => {
      const gen = endpoint.streamCompletion({ model: '', messages: [{ role: 'user', content: 'hi' }] });
      await expect(async () => {
        for await (const _ of gen) { /* noop */ }
      }).rejects.toThrow(VeniceValidationError);

      expect(client._mockStreamingHttp.stream).not.toHaveBeenCalled();
    });

    it('throws VeniceStreamError if response body is null', async () => {
      const streamResponse = createMockStreamResponse([], true);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.streamCompletion(minimalRequest());
      await expect(async () => {
        for await (const _ of gen) { /* noop */ }
      }).rejects.toThrow(VeniceStreamError);
    });

    it('throws VeniceStreamError with correct message when body is null', async () => {
      const streamResponse = createMockStreamResponse([], true);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.streamCompletion(minimalRequest());
      await expect(async () => {
        for await (const _ of gen) { /* noop */ }
      }).rejects.toThrow('Stream response body is null');
    });

    it('emits response event even on stream error (finally block)', async () => {
      const streamResponse = createMockStreamResponse([], true);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.streamCompletion(minimalRequest());
      try {
        for await (const _ of gen) { /* noop */ }
      } catch { /* expected */ }

      expect(client.emit).toHaveBeenCalledWith(
        'response',
        expect.objectContaining({
          type: 'chat.completion.stream',
          data: { status: 'completed' },
        }),
      );
    });

    it('passes all request fields through to streaming http', async () => {
      const streamResponse = createMockStreamResponse(['data: [DONE]\n\n']);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const req = minimalRequest({
        temperature: 0.8,
        max_tokens: 200,
        venice_parameters: { character_slug: 'test-char' },
      });
      const gen = endpoint.streamCompletion(req);
      for await (const _ of gen) { /* noop */ }

      const body = client._mockStreamingHttp.stream.mock.calls[0][1];
      expect(body.temperature).toBe(0.8);
      expect(body.max_tokens).toBe(200);
      expect(body.venice_parameters.character_slug).toBe('test-char');
      expect(body.stream).toBe(true);
    });

    it('does not mutate the original request object', async () => {
      const streamResponse = createMockStreamResponse(['data: [DONE]\n\n']);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const req = minimalRequest();
      expect(req.stream).toBeUndefined();

      const gen = endpoint.streamCompletion(req);
      for await (const _ of gen) { /* noop */ }

      // Original request should not have been mutated
      expect(req.stream).toBeUndefined();
    });

    it('handles multiple chunks in a single SSE payload', async () => {
      const streamResponse = createMockStreamResponse([
        'data: {"id":"s1","choices":[{"delta":{"content":"X"}}]}\ndata: {"id":"s1","choices":[{"delta":{"content":"Y"}}]}\n\n',
        'data: [DONE]\n\n',
      ]);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.streamCompletion(minimalRequest());
      const chunks: any[] = [];
      for await (const chunk of gen) {
        chunks.push(chunk);
      }
      expect(chunks).toHaveLength(2);
    });

    it('handles empty stream (immediate DONE)', async () => {
      const streamResponse = createMockStreamResponse(['data: [DONE]\n\n']);
      client._mockStreamingHttp.stream.mockResolvedValue(streamResponse);

      const gen = endpoint.streamCompletion(minimalRequest());
      const chunks: any[] = [];
      for await (const chunk of gen) {
        chunks.push(chunk);
      }
      expect(chunks).toHaveLength(0);
    });
  });
});
