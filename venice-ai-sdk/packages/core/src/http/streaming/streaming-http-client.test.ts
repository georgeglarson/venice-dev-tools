import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StreamingHttpClient } from './streaming-http-client';
import { ErrorHandler } from '../error/error-handler';
import { RateLimiter } from '../../utils/rate-limiter';
import { Logger } from '../../utils/logger';

// ── Helpers ──────────────────────────────────────────────────────────────────

function createMockReadableStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index]));
        index++;
      } else {
        controller.close();
      }
    },
  });
}

function createMockResponse(
  status: number,
  body?: ReadableStream<Uint8Array> | null,
  headers?: Record<string, string>
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: new Headers(headers || {}),
    body: body === undefined ? null : body,
    json: vi.fn().mockResolvedValue({}),
    text: vi.fn().mockResolvedValue(''),
    blob: vi.fn(),
    clone: vi.fn(),
  } as unknown as Response;
}

/** Build a stream that delivers newline-delimited JSON objects. */
function createJsonStream(objects: any[]): ReadableStream<Uint8Array> {
  const lines = objects.map((o) => JSON.stringify(o) + '\n');
  return createMockReadableStream(lines);
}

// ── Global fetch mock ────────────────────────────────────────────────────────

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// ── Tests ────────────────────────────────────────────────────────────────────

describe('StreamingHttpClient', () => {
  let client: StreamingHttpClient;
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockFetch.mockReset();
    errorHandler = new ErrorHandler();
    // By default, handleResponseError does nothing for OK responses.
    vi.spyOn(errorHandler, 'handleResponseError').mockResolvedValue(undefined);
    vi.spyOn(errorHandler, 'handleStreamError');

    client = new StreamingHttpClient(
      'https://api.venice.ai/api/v1',
      { Authorization: 'Bearer test-key' },
      30000,
      errorHandler
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ────────────────────────────────────────────────────────────────────────
  // Constructor
  // ────────────────────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('creates an instance with default values', () => {
      const defaultClient = new StreamingHttpClient();
      expect(defaultClient.getBaseUrl()).toBe('https://api.venice.ai/api/v1');
      expect(defaultClient.getTimeout()).toBe(30000);
    });

    it('creates an instance with custom baseUrl, headers, and timeout', () => {
      const custom = new StreamingHttpClient(
        'https://custom.api/v2',
        { 'X-Custom': 'yes' },
        5000
      );
      expect(custom.getBaseUrl()).toBe('https://custom.api/v2');
      expect(custom.getTimeout()).toBe(5000);
      expect(custom.getHeaders()).toMatchObject({ 'X-Custom': 'yes' });
    });

    it('accepts an optional rate limiter', () => {
      const limiter = new RateLimiter();
      // Should not throw
      const c = new StreamingHttpClient(
        'https://api.venice.ai/api/v1',
        {},
        30000,
        new ErrorHandler(),
        limiter
      );
      expect(c).toBeInstanceOf(StreamingHttpClient);
    });

    it('accepts an optional logger and logs initialization', () => {
      const logger = new Logger({ level: 0 });
      const debugSpy = vi.spyOn(logger, 'debug');
      const c = new StreamingHttpClient(
        'https://api.venice.ai/api/v1',
        {},
        30000,
        new ErrorHandler(),
        undefined,
        logger
      );
      expect(c).toBeInstanceOf(StreamingHttpClient);
      expect(debugSpy).toHaveBeenCalledWith(
        'Initializing streaming HTTP client',
        expect.objectContaining({ baseUrl: 'https://api.venice.ai/api/v1', timeout: 30000 })
      );
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // stream() method
  // ────────────────────────────────────────────────────────────────────────

  describe('stream()', () => {
    it('makes a POST request to the correct URL', async () => {
      const resp = createMockResponse(200, createMockReadableStream([]));
      mockFetch.mockResolvedValue(resp);

      await client.stream('/chat/completions', { model: 'test' });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.venice.ai/api/v1/chat/completions');
    });

    it('includes Authorization header', async () => {
      const resp = createMockResponse(200, createMockReadableStream([]));
      mockFetch.mockResolvedValue(resp);

      await client.stream('/chat/completions');

      const [, opts] = mockFetch.mock.calls[0];
      expect(opts.headers['Authorization']).toBe('Bearer test-key');
    });

    it('includes Content-Type: application/json header', async () => {
      const resp = createMockResponse(200, createMockReadableStream([]));
      mockFetch.mockResolvedValue(resp);

      await client.stream('/chat/completions');

      const [, opts] = mockFetch.mock.calls[0];
      expect(opts.headers['Content-Type']).toBe('application/json');
    });

    it('includes custom headers from options', async () => {
      const resp = createMockResponse(200, createMockReadableStream([]));
      mockFetch.mockResolvedValue(resp);

      await client.stream('/chat/completions', {}, { headers: { 'X-Request-Id': '123' } });

      const [, opts] = mockFetch.mock.calls[0];
      expect(opts.headers['X-Request-Id']).toBe('123');
    });

    it('stringifies the body as JSON', async () => {
      const resp = createMockResponse(200, createMockReadableStream([]));
      mockFetch.mockResolvedValue(resp);

      const body = { model: 'llama-3.3-70b', messages: [{ role: 'user', content: 'hi' }] };
      await client.stream('/chat/completions', body);

      const [, opts] = mockFetch.mock.calls[0];
      expect(opts.body).toBe(JSON.stringify(body));
    });

    it('returns the response on success', async () => {
      const resp = createMockResponse(200, createMockReadableStream([]));
      mockFetch.mockResolvedValue(resp);

      const result = await client.stream('/chat/completions');
      expect(result).toBe(resp);
    });

    it('uses POST method', async () => {
      const resp = createMockResponse(200, createMockReadableStream([]));
      mockFetch.mockResolvedValue(resp);

      await client.stream('/chat/completions');

      const [, opts] = mockFetch.mock.calls[0];
      expect(opts.method).toBe('POST');
    });

    it('sets up AbortController with timeout', async () => {
      const resp = createMockResponse(200, createMockReadableStream([]));
      mockFetch.mockResolvedValue(resp);

      await client.stream('/chat/completions');

      const [, opts] = mockFetch.mock.calls[0];
      expect(opts.signal).toBeInstanceOf(AbortSignal);
    });

    it('clears timeout after successful response', async () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const resp = createMockResponse(200, createMockReadableStream([]));
      mockFetch.mockResolvedValue(resp);

      await client.stream('/chat/completions');

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('calls errorHandler.handleResponseError for non-OK responses', async () => {
      const errorResp = createMockResponse(401);
      const error = new Error('Unauthorized');
      (errorHandler.handleResponseError as ReturnType<typeof vi.fn>).mockRejectedValue(error);
      mockFetch.mockResolvedValue(errorResp);

      // handleResponseError throws, which is caught by the try/catch,
      // which then calls handleStreamError
      (errorHandler.handleStreamError as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw error;
      });

      await expect(client.stream('/chat/completions')).rejects.toThrow('Unauthorized');
      expect(errorHandler.handleResponseError).toHaveBeenCalledWith(errorResp);
    });

    it('catches fetch errors and calls errorHandler.handleStreamError', async () => {
      const networkError = new Error('Network failure');
      mockFetch.mockRejectedValue(networkError);

      (errorHandler.handleStreamError as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw networkError;
      });

      await expect(client.stream('/chat/completions')).rejects.toThrow('Network failure');
      expect(errorHandler.handleStreamError).toHaveBeenCalledWith(networkError);
    });

    it('uses rate limiter when available', async () => {
      const limiter = new RateLimiter();
      const addSpy = vi.spyOn(limiter, 'add').mockImplementation(async (fn) => fn());
      const resp = createMockResponse(200, createMockReadableStream([]));
      mockFetch.mockResolvedValue(resp);

      const rateLimitedClient = new StreamingHttpClient(
        'https://api.venice.ai/api/v1',
        { Authorization: 'Bearer test-key' },
        30000,
        errorHandler,
        limiter
      );

      await rateLimitedClient.stream('/chat/completions');
      expect(addSpy).toHaveBeenCalledTimes(1);
    });

    it('does not use rate limiter when not provided', async () => {
      const resp = createMockResponse(200, createMockReadableStream([]));
      mockFetch.mockResolvedValue(resp);

      // client was constructed without a rate limiter
      const result = await client.stream('/chat/completions');
      expect(result).toBe(resp);
    });

    it('logs debug messages when logger is provided', async () => {
      const logger = new Logger({ level: 0 });
      const debugSpy = vi.spyOn(logger, 'debug');
      const resp = createMockResponse(200, createMockReadableStream([]));
      mockFetch.mockResolvedValue(resp);

      const loggingClient = new StreamingHttpClient(
        'https://api.venice.ai/api/v1',
        { Authorization: 'Bearer test-key' },
        30000,
        errorHandler,
        undefined,
        logger
      );

      // Reset after constructor logging
      debugSpy.mockClear();

      await loggingClient.stream('/chat/completions');

      const messages = debugSpy.mock.calls.map((c) => c[0]);
      expect(messages).toContain('Preparing streaming request to /chat/completions');
      expect(messages).toContain('Sending streaming request to /chat/completions');
      expect(messages.some((m) => m.includes('received response'))).toBe(true);
    });

    it('logs error messages when stream request fails and logger is provided', async () => {
      const logger = new Logger({ level: 0 });
      const errorSpy = vi.spyOn(logger, 'error');
      const networkError = new Error('Connection refused');
      mockFetch.mockRejectedValue(networkError);

      (errorHandler.handleStreamError as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw networkError;
      });

      const loggingClient = new StreamingHttpClient(
        'https://api.venice.ai/api/v1',
        {},
        30000,
        errorHandler,
        undefined,
        logger
      );

      await expect(loggingClient.stream('/test')).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('failed'),
        expect.objectContaining({ error: 'Connection refused' })
      );
    });

    it('uses custom timeout from options', async () => {
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
      const resp = createMockResponse(200, createMockReadableStream([]));
      mockFetch.mockResolvedValue(resp);

      await client.stream('/chat/completions', {}, { timeout: 5000 });

      // Find the setTimeout call with our timeout value
      const timeoutCall = setTimeoutSpy.mock.calls.find((call) => call[1] === 5000);
      expect(timeoutCall).toBeDefined();
    });

    it('uses options.signal when provided', async () => {
      const abortController = new AbortController();
      const resp = createMockResponse(200, createMockReadableStream([]));
      mockFetch.mockResolvedValue(resp);

      await client.stream('/chat/completions', {}, { signal: abortController.signal });

      const [, opts] = mockFetch.mock.calls[0];
      expect(opts.signal).toBe(abortController.signal);
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // processStream() method
  // ────────────────────────────────────────────────────────────────────────

  describe('processStream()', () => {
    it('processes stream events correctly', async () => {
      const events = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const stream = createJsonStream(events);
      const response = createMockResponse(200, stream);

      const received: any[] = [];
      await client.processStream(response, (event) => received.push(event));

      expect(received).toEqual(events);
    });

    it('calls onEvent for each parsed event', async () => {
      const onEvent = vi.fn();
      const events = [{ a: 1 }, { b: 2 }];
      const stream = createJsonStream(events);
      const response = createMockResponse(200, stream);

      await client.processStream(response, onEvent);

      expect(onEvent).toHaveBeenCalledTimes(2);
      expect(onEvent).toHaveBeenCalledWith({ a: 1 });
      expect(onEvent).toHaveBeenCalledWith({ b: 2 });
    });

    it('calls onComplete when stream ends', async () => {
      const stream = createJsonStream([{ done: true }]);
      const response = createMockResponse(200, stream);
      const onComplete = vi.fn();

      await client.processStream(response, vi.fn(), onComplete);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('calls onError for JSON parse failures', async () => {
      const stream = createMockReadableStream(['not-valid-json\n']);
      const response = createMockResponse(200, stream);
      const onError = vi.fn();

      await client.processStream(response, vi.fn(), undefined, onError);

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(onError.mock.calls[0][0].message).toContain('Failed to parse event');
    });

    it('handles empty lines by skipping them', async () => {
      const stream = createMockReadableStream([
        '{"id":1}\n\n\n{"id":2}\n',
      ]);
      const response = createMockResponse(200, stream);
      const received: any[] = [];

      await client.processStream(response, (e) => received.push(e));

      expect(received).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('handles partial chunks across reads (buffering)', async () => {
      // Split a JSON object across two chunks
      const stream = createMockReadableStream([
        '{"partial":',
        '"value"}\n',
      ]);
      const response = createMockResponse(200, stream);
      const received: any[] = [];

      await client.processStream(response, (e) => received.push(e));

      expect(received).toEqual([{ partial: 'value' }]);
    });

    it('handles remaining buffer data at stream end', async () => {
      // Last chunk has no trailing newline
      const stream = createMockReadableStream(['{"final":true}']);
      const response = createMockResponse(200, stream);
      const received: any[] = [];

      await client.processStream(response, (e) => received.push(e));

      expect(received).toEqual([{ final: true }]);
    });

    it('releases reader lock on successful completion', async () => {
      const stream = createJsonStream([{ ok: true }]);
      const reader = stream.getReader();
      const releaseLockSpy = vi.spyOn(reader, 'releaseLock');

      // We need a response whose body.getReader() returns our spied reader
      const response = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: { getReader: () => reader },
        json: vi.fn(),
        text: vi.fn(),
        blob: vi.fn(),
        clone: vi.fn(),
      } as unknown as Response;

      // Consume the stream first so reader.read() yields what's already buffered
      // Actually we need to reconstruct -- let's use a fresh approach
      const freshStream = createJsonStream([{ ok: true }]);
      const freshReader = freshStream.getReader();
      const freshReleaseSpy = vi.spyOn(freshReader, 'releaseLock');

      const freshResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: { getReader: () => freshReader },
        json: vi.fn(),
        text: vi.fn(),
        blob: vi.fn(),
        clone: vi.fn(),
      } as unknown as Response;

      await client.processStream(freshResponse, vi.fn());
      expect(freshReleaseSpy).toHaveBeenCalled();
    });

    it('releases reader lock on error', async () => {
      const readMock = vi.fn()
        .mockRejectedValueOnce(new Error('Read failed'));
      const releaseLockMock = vi.fn();

      const response = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: {
          getReader: () => ({
            read: readMock,
            releaseLock: releaseLockMock,
          }),
        },
        json: vi.fn(),
        text: vi.fn(),
        blob: vi.fn(),
        clone: vi.fn(),
      } as unknown as Response;

      const onError = vi.fn();
      await client.processStream(response, vi.fn(), undefined, onError);

      expect(releaseLockMock).toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });

    it('releases reader lock when onEvent callback throws (newline-delimited path)', async () => {
      // When onEvent throws inside the inner try/catch (newline-delimited parsing),
      // the error is caught by the inner catch and reported as a parse error via onError.
      const stream = createJsonStream([{ id: 1 }]);
      const freshReader = stream.getReader();
      const releaseSpy = vi.spyOn(freshReader, 'releaseLock');

      const response = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: { getReader: () => freshReader },
        json: vi.fn(),
        text: vi.fn(),
        blob: vi.fn(),
        clone: vi.fn(),
      } as unknown as Response;

      const onError = vi.fn();
      await client.processStream(
        response,
        () => {
          throw new Error('Callback blew up');
        },
        undefined,
        onError
      );

      expect(releaseSpy).toHaveBeenCalled();
      // The inner catch catches the throw from onEvent and wraps it as a parse error
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('releases reader lock when onEvent callback throws from trailing buffer path', async () => {
      // Data without trailing newline -- parsed in the "remaining buffer" block at stream end.
      // That block's inner try/catch catches the onEvent throw silently.
      const stream = createMockReadableStream(['{"id":1}']);
      const freshReader = stream.getReader();
      const releaseSpy = vi.spyOn(freshReader, 'releaseLock');

      const response = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: { getReader: () => freshReader },
        json: vi.fn(),
        text: vi.fn(),
        blob: vi.fn(),
        clone: vi.fn(),
      } as unknown as Response;

      const callCount = { n: 0 };
      const onError = vi.fn();

      await client.processStream(
        response,
        () => {
          callCount.n++;
          throw new Error('Callback blew up in trailing buffer');
        },
        undefined,
        onError
      );

      expect(releaseSpy).toHaveBeenCalled();
      // The trailing-buffer path catches the error from onEvent in its own try/catch
      // so it does not propagate to the outer catch or call onError
      expect(callCount.n).toBe(1);
    });

    it('throws when response body is null', async () => {
      const response = createMockResponse(200, null);

      await expect(
        client.processStream(response, vi.fn())
      ).rejects.toThrow('Response body is not readable');
    });

    it('throws when response body is undefined (no body)', async () => {
      const response = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: undefined,
        json: vi.fn(),
        text: vi.fn(),
        blob: vi.fn(),
        clone: vi.fn(),
      } as unknown as Response;

      await expect(
        client.processStream(response, vi.fn())
      ).rejects.toThrow('Response body is not readable');
    });

    it('logs event count periodically (every 10 events)', async () => {
      const logger = new Logger({ level: 0 });
      const debugSpy = vi.spyOn(logger, 'debug');

      const loggingClient = new StreamingHttpClient(
        'https://api.venice.ai/api/v1',
        {},
        30000,
        errorHandler,
        undefined,
        logger
      );

      // Generate 25 events
      const events = Array.from({ length: 25 }, (_, i) => ({ i }));
      const stream = createJsonStream(events);
      const response = createMockResponse(200, stream);

      debugSpy.mockClear();
      await loggingClient.processStream(response, vi.fn());

      const periodicLogs = debugSpy.mock.calls
        .map((c) => c[0])
        .filter((msg: string) => msg.match(/Processed \d+ stream events/));

      // Should log at event 10 and 20
      expect(periodicLogs).toContain('Processed 10 stream events');
      expect(periodicLogs).toContain('Processed 20 stream events');
      expect(periodicLogs).toHaveLength(2);
    });

    it('logs completion with total event count', async () => {
      const logger = new Logger({ level: 0 });
      const debugSpy = vi.spyOn(logger, 'debug');

      const loggingClient = new StreamingHttpClient(
        'https://api.venice.ai/api/v1',
        {},
        30000,
        errorHandler,
        undefined,
        logger
      );

      const events = [{ a: 1 }, { b: 2 }, { c: 3 }];
      const stream = createJsonStream(events);
      const response = createMockResponse(200, stream);

      debugSpy.mockClear();
      await loggingClient.processStream(response, vi.fn());

      const completionLog = debugSpy.mock.calls
        .map((c) => c[0])
        .find((msg: string) => msg.includes('complete'));
      expect(completionLog).toBe('Stream processing complete, processed 3 events');
    });

    it('handles multiple JSON objects in a single chunk', async () => {
      const stream = createMockReadableStream([
        '{"a":1}\n{"b":2}\n{"c":3}\n',
      ]);
      const response = createMockResponse(200, stream);
      const received: any[] = [];

      await client.processStream(response, (e) => received.push(e));

      expect(received).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
    });

    it('handles stream with only empty lines', async () => {
      const stream = createMockReadableStream(['\n\n\n']);
      const response = createMockResponse(200, stream);
      const received: any[] = [];

      await client.processStream(response, (e) => received.push(e));

      expect(received).toEqual([]);
    });

    it('re-throws error when no onError callback is provided', async () => {
      const readMock = vi.fn()
        .mockRejectedValueOnce(new Error('Stream died'));
      const releaseLockMock = vi.fn();

      const response = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: {
          getReader: () => ({
            read: readMock,
            releaseLock: releaseLockMock,
          }),
        },
        json: vi.fn(),
        text: vi.fn(),
        blob: vi.fn(),
        clone: vi.fn(),
      } as unknown as Response;

      await expect(
        client.processStream(response, vi.fn())
      ).rejects.toThrow('Stream died');
      expect(releaseLockMock).toHaveBeenCalled();
    });

    it('converts non-Error objects to Error in catch block when onError is provided', async () => {
      const readMock = vi.fn().mockRejectedValueOnce('string-error');
      const releaseLockMock = vi.fn();

      const response = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: {
          getReader: () => ({
            read: readMock,
            releaseLock: releaseLockMock,
          }),
        },
        json: vi.fn(),
        text: vi.fn(),
        blob: vi.fn(),
        clone: vi.fn(),
      } as unknown as Response;

      const onError = vi.fn();
      await client.processStream(response, vi.fn(), undefined, onError);

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect(onError.mock.calls[0][0].message).toBe('string-error');
    });

    it('does not call onComplete when an error occurs', async () => {
      const readMock = vi.fn().mockRejectedValueOnce(new Error('Oops'));
      const releaseLockMock = vi.fn();

      const response = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: {
          getReader: () => ({
            read: readMock,
            releaseLock: releaseLockMock,
          }),
        },
        json: vi.fn(),
        text: vi.fn(),
        blob: vi.fn(),
        clone: vi.fn(),
      } as unknown as Response;

      const onComplete = vi.fn();
      const onError = vi.fn();
      await client.processStream(response, vi.fn(), onComplete, onError);

      expect(onComplete).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });

    it('handles incomplete JSON at stream end gracefully (no onError for trailing buffer)', async () => {
      // Trailing buffer that is not valid JSON -- processStream silently ignores it
      const stream = createMockReadableStream(['{"id":1}\n{"incomplete":']);
      const response = createMockResponse(200, stream);
      const received: any[] = [];
      const onError = vi.fn();

      await client.processStream(response, (e) => received.push(e), undefined, onError);

      // The first complete object is parsed; the incomplete trailing data is silently ignored
      expect(received).toEqual([{ id: 1 }]);
      // onError is NOT called for trailing buffer parse failures (they are silently ignored)
      expect(onError).not.toHaveBeenCalled();
    });

    it('handles empty stream (no data)', async () => {
      const stream = createMockReadableStream([]);
      const response = createMockResponse(200, stream);
      const onEvent = vi.fn();
      const onComplete = vi.fn();

      await client.processStream(response, onEvent, onComplete);

      expect(onEvent).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('continues processing after a parse error in the middle of the stream', async () => {
      const stream = createMockReadableStream([
        '{"id":1}\nnot-json\n{"id":2}\n',
      ]);
      const response = createMockResponse(200, stream);
      const received: any[] = [];
      const onError = vi.fn();

      await client.processStream(response, (e) => received.push(e), undefined, onError);

      expect(received).toEqual([{ id: 1 }, { id: 2 }]);
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('logs error message for stream processing error when logger is provided', async () => {
      const logger = new Logger({ level: 0 });
      const errorSpy = vi.spyOn(logger, 'error');

      const loggingClient = new StreamingHttpClient(
        'https://api.venice.ai/api/v1',
        {},
        30000,
        errorHandler,
        undefined,
        logger
      );

      const readMock = vi.fn().mockRejectedValueOnce(new Error('Boom'));
      const releaseLockMock = vi.fn();

      const response = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: {
          getReader: () => ({
            read: readMock,
            releaseLock: releaseLockMock,
          }),
        },
        json: vi.fn(),
        text: vi.fn(),
        blob: vi.fn(),
        clone: vi.fn(),
      } as unknown as Response;

      const onError = vi.fn();
      await loggingClient.processStream(response, vi.fn(), undefined, onError);

      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Boom'));
    });

    it('logs error when response body is not readable and logger is provided', async () => {
      const logger = new Logger({ level: 0 });
      const errorSpy = vi.spyOn(logger, 'error');

      const loggingClient = new StreamingHttpClient(
        'https://api.venice.ai/api/v1',
        {},
        30000,
        errorHandler,
        undefined,
        logger
      );

      const response = createMockResponse(200, null);

      await expect(
        loggingClient.processStream(response, vi.fn())
      ).rejects.toThrow('Response body is not readable');

      expect(errorSpy).toHaveBeenCalledWith('Response body is not readable');
    });

    it('handles releaseLock throwing without propagating', async () => {
      // The finally block wraps releaseLock in try/catch
      const readMock = vi.fn()
        .mockResolvedValueOnce({ done: true, value: undefined });
      const releaseLockMock = vi.fn().mockImplementation(() => {
        throw new Error('Already released');
      });

      const response = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: {
          getReader: () => ({
            read: readMock,
            releaseLock: releaseLockMock,
          }),
        },
        json: vi.fn(),
        text: vi.fn(),
        blob: vi.fn(),
        clone: vi.fn(),
      } as unknown as Response;

      // Should not throw even though releaseLock throws
      await expect(
        client.processStream(response, vi.fn())
      ).resolves.toBeUndefined();
      expect(releaseLockMock).toHaveBeenCalled();
    });

    it('logs parse errors for individual lines when logger is provided', async () => {
      const logger = new Logger({ level: 0 });
      const errorSpy = vi.spyOn(logger, 'error');

      const loggingClient = new StreamingHttpClient(
        'https://api.venice.ai/api/v1',
        {},
        30000,
        errorHandler,
        undefined,
        logger
      );

      const stream = createMockReadableStream(['bad-data\n']);
      const response = createMockResponse(200, stream);

      await loggingClient.processStream(response, vi.fn(), undefined, vi.fn());

      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to parse event'));
    });

    it('handles large number of events correctly', async () => {
      const count = 100;
      const events = Array.from({ length: count }, (_, i) => ({ index: i }));
      const stream = createJsonStream(events);
      const response = createMockResponse(200, stream);
      const received: any[] = [];

      await client.processStream(response, (e) => received.push(e));

      expect(received).toHaveLength(count);
      expect(received[0]).toEqual({ index: 0 });
      expect(received[99]).toEqual({ index: 99 });
    });

    it('processes events split across chunk boundaries with buffering', async () => {
      // Object: {"key":"longvalue"} split into 3 chunks
      const stream = createMockReadableStream([
        '{"ke',
        'y":"long',
        'value"}\n',
      ]);
      const response = createMockResponse(200, stream);
      const received: any[] = [];

      await client.processStream(response, (e) => received.push(e));

      expect(received).toEqual([{ key: 'longvalue' }]);
    });
  });
});
