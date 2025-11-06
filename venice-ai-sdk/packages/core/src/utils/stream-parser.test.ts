import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StreamParser, parseSSEStream } from './stream-parser';
import { Logger, LogLevel } from './logger';

describe('StreamParser', () => {
  let parser: StreamParser;

  beforeEach(() => {
    parser = new StreamParser();
  });

  describe('processChunk', () => {
    it('should parse a simple SSE chunk', () => {
      const encoder = new TextEncoder();
      const chunk = encoder.encode('data: {"test": "value"}\n');
      
      const results = parser.processChunk(chunk);
      
      expect(results).toHaveLength(1);
      expect(results[0].data).toEqual({ test: 'value' });
      expect(results[0].isDone).toBe(false);
    });

    it('should handle multiple lines in one chunk', () => {
      const encoder = new TextEncoder();
      const chunk = encoder.encode('data: {"line": 1}\ndata: {"line": 2}\n');
      
      const results = parser.processChunk(chunk);
      
      expect(results).toHaveLength(2);
      expect(results[0].data).toEqual({ line: 1 });
      expect(results[1].data).toEqual({ line: 2 });
    });

    it('should handle [DONE] marker', () => {
      const encoder = new TextEncoder();
      const chunk = encoder.encode('data: [DONE]\n');
      
      const results = parser.processChunk(chunk);
      
      expect(results).toHaveLength(1);
      expect(results[0].isDone).toBe(true);
      expect(results[0].data).toBeNull();
    });

    it('should buffer incomplete lines', () => {
      const encoder = new TextEncoder();
      const chunk1 = encoder.encode('data: {"incom');
      const chunk2 = encoder.encode('plete": true}\n');
      
      const results1 = parser.processChunk(chunk1);
      expect(results1).toHaveLength(0);
      
      const results2 = parser.processChunk(chunk2);
      expect(results2).toHaveLength(1);
      expect(results2[0].data).toEqual({ incomplete: true });
    });

    it('should skip empty lines', () => {
      const encoder = new TextEncoder();
      const chunk = encoder.encode('\n\ndata: {"test": "value"}\n\n');
      
      const results = parser.processChunk(chunk);
      
      expect(results).toHaveLength(1);
      expect(results[0].data).toEqual({ test: 'value' });
    });

    it('should skip lines without data: prefix', () => {
      const encoder = new TextEncoder();
      const chunk = encoder.encode('comment: test\ndata: {"test": "value"}\n');
      
      const results = parser.processChunk(chunk);
      
      expect(results).toHaveLength(1);
      expect(results[0].data).toEqual({ test: 'value' });
    });

    it('should handle invalid JSON gracefully with logger', () => {
      const mockLogger = {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        setLevel: vi.fn(),
      };
      const parserWithLogger = new StreamParser({ logger: mockLogger });
      const encoder = new TextEncoder();
      const chunk = encoder.encode('data: {invalid json}\n');
      
      const results = parserWithLogger.processChunk(chunk);
      
      expect(results).toHaveLength(0);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error parsing stream data',
        expect.objectContaining({
          error: expect.any(String),
          data: expect.any(String),
        })
      );
    });

    it('should handle invalid JSON gracefully without logger', () => {
      const encoder = new TextEncoder();
      const chunk = encoder.encode('data: {invalid json}\n');
      
      const results = parser.processChunk(chunk);
      
      expect(results).toHaveLength(0);
    });
  });

  describe('flush', () => {
    it('should process remaining buffer data', () => {
      const encoder = new TextEncoder();
      const chunk = encoder.encode('data: {"test": "value"}');
      
      parser.processChunk(chunk);
      const results = parser.flush();
      
      expect(results).toHaveLength(1);
      expect(results[0].data).toEqual({ test: 'value' });
    });

    it('should return empty array if buffer is empty', () => {
      const results = parser.flush();
      expect(results).toHaveLength(0);
    });

    it('should handle multiple lines in buffer', () => {
      const encoder = new TextEncoder();
      const chunk = encoder.encode('data: {"line": 1}\ndata: {"line": 2}');
      
      parser.processChunk(chunk);
      const results = parser.flush();
      
      expect(results).toHaveLength(1);
      expect(results[0].data).toEqual({ line: 2 });
    });
  });

  describe('reset', () => {
    it('should clear the buffer', () => {
      const encoder = new TextEncoder();
      const chunk = encoder.encode('data: {"test": "value"}');
      
      parser.processChunk(chunk);
      parser.reset();
      const results = parser.flush();
      
      expect(results).toHaveLength(0);
    });
  });
});

describe('parseSSEStream', () => {
  it('should parse a complete stream', async () => {
    const encoder = new TextEncoder();
    const chunks = [
      encoder.encode('data: {"delta": 1}\n'),
      encoder.encode('data: {"delta": 2}\n'),
      encoder.encode('data: [DONE]\n'),
    ];

    let chunkIndex = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (chunkIndex < chunks.length) {
          return Promise.resolve({ done: false, value: chunks[chunkIndex++] });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
    } as any;

    const results = [];
    for await (const chunk of parseSSEStream(mockReader)) {
      results.push(chunk);
    }

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({ delta: 1 });
    expect(results[1]).toEqual({ delta: 2 });
  });

  it('should handle stream ending without [DONE]', async () => {
    const encoder = new TextEncoder();
    const chunks = [
      encoder.encode('data: {"delta": 1}\n'),
      encoder.encode('data: {"delta": 2}\n'),
    ];

    let chunkIndex = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (chunkIndex < chunks.length) {
          return Promise.resolve({ done: false, value: chunks[chunkIndex++] });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
    } as any;

    const results = [];
    for await (const chunk of parseSSEStream(mockReader)) {
      results.push(chunk);
    }

    expect(results).toHaveLength(2);
  });

  it('should handle chunks split across reads', async () => {
    const encoder = new TextEncoder();
    const chunks = [
      encoder.encode('data: {"del'),
      encoder.encode('ta": 1}\n'),
      encoder.encode('data: [DONE]\n'),
    ];

    let chunkIndex = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (chunkIndex < chunks.length) {
          return Promise.resolve({ done: false, value: chunks[chunkIndex++] });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
    } as any;

    const results = [];
    for await (const chunk of parseSSEStream(mockReader)) {
      results.push(chunk);
    }

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ delta: 1 });
  });

  it('should pass logger to StreamParser', async () => {
    const mockLogger = {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
      setLevel: vi.fn(),
    };

    const encoder = new TextEncoder();
    const chunks = [
      encoder.encode('data: {invalid}\n'),
      encoder.encode('data: [DONE]\n'),
    ];

    let chunkIndex = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (chunkIndex < chunks.length) {
          return Promise.resolve({ done: false, value: chunks[chunkIndex++] });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
    } as any;

    const results = [];
    for await (const chunk of parseSSEStream(mockReader, mockLogger)) {
      results.push(chunk);
    }

    expect(mockLogger.error).toHaveBeenCalled();
    expect(results).toHaveLength(0);
  });

  it('should handle empty stream', async () => {
    const mockReader = {
      read: vi.fn().mockResolvedValue({ done: true, value: undefined }),
    } as any;

    const results = [];
    for await (const chunk of parseSSEStream(mockReader)) {
      results.push(chunk);
    }

    expect(results).toHaveLength(0);
  });
});
