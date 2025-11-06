import { describe, it, expect } from 'vitest';
import {
  collectStream,
  mapStream,
  filterStream,
  takeStream,
  tapStream,
  bufferStream,
  textOnlyStream,
  streamToArray,
  arrayToStream,
  countStream,
} from './stream-helpers';

async function* createTestStream<T>(items: T[]): AsyncIterable<T> {
  for (const item of items) {
    yield item;
  }
}

async function* createChatStream(texts: string[]): AsyncIterable<any> {
  for (const text of texts) {
    yield {
      choices: [
        {
          delta: {
            content: text,
          },
        },
      ],
    };
  }
}

describe('Stream Helpers', () => {
  describe('collectStream', () => {
    it('should collect all chunks into a single string', async () => {
      const stream = createChatStream(['Hello', ' ', 'World', '!']);
      const result = await collectStream(stream);
      expect(result).toBe('Hello World!');
    });

    it('should handle empty stream', async () => {
      const stream = createChatStream([]);
      const result = await collectStream(stream);
      expect(result).toBe('');
    });

    it('should call onChunk callback for each chunk', async () => {
      const chunks: string[] = [];
      const stream = createChatStream(['a', 'b', 'c']);
      
      await collectStream(stream, {
        onChunk: (chunk, index) => {
          chunks.push(`${index}:${chunk.choices[0].delta.content}`);
        },
      });

      expect(chunks).toEqual(['0:a', '1:b', '2:c']);
    });

    it('should abort on signal', async () => {
      const controller = new AbortController();
      
      async function* slowStream() {
        for (let i = 0; i < 10; i++) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          yield { choices: [{ delta: { content: String(i) } }] };
        }
      }

      setTimeout(() => controller.abort(), 25);

      await expect(
        collectStream(slowStream(), { signal: controller.signal })
      ).rejects.toThrow('Stream collection aborted');
    });

    it('should timeout if specified', async () => {
      async function* slowStream() {
        yield { choices: [{ delta: { content: 'slow' } }] };
        await new Promise((resolve) => setTimeout(resolve, 1000));
        yield { choices: [{ delta: { content: 'data' } }] };
      }

      await expect(
        collectStream(slowStream(), { timeout: 100 })
      ).rejects.toThrow('Stream collection timeout');
    });

    it('should skip empty content', async () => {
      const stream = async function* () {
        yield { choices: [{ delta: { content: 'Hello' } }] };
        yield { choices: [{ delta: {} }] };
        yield { choices: [{ delta: { content: ' World' } }] };
      };

      const result = await collectStream(stream());
      expect(result).toBe('Hello World');
    });
  });

  describe('mapStream', () => {
    it('should map each item', async () => {
      const stream = createTestStream([1, 2, 3]);
      const mapped = mapStream(stream, (x) => x * 2);
      
      const result = await streamToArray(mapped);
      expect(result).toEqual([2, 4, 6]);
    });

    it('should support async mapper', async () => {
      const stream = createTestStream([1, 2, 3]);
      const mapped = mapStream(stream, async (x) => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        return x * 2;
      });

      const result = await streamToArray(mapped);
      expect(result).toEqual([2, 4, 6]);
    });

    it('should pass index to mapper', async () => {
      const stream = createTestStream(['a', 'b', 'c']);
      const mapped = mapStream(stream, (x, i) => `${i}:${x}`);

      const result = await streamToArray(mapped);
      expect(result).toEqual(['0:a', '1:b', '2:c']);
    });

    it('should handle empty stream', async () => {
      const stream = createTestStream([]);
      const mapped = mapStream(stream, (x) => x);

      const result = await streamToArray(mapped);
      expect(result).toEqual([]);
    });
  });

  describe('filterStream', () => {
    it('should filter items by predicate', async () => {
      const stream = createTestStream([1, 2, 3, 4, 5]);
      const filtered = filterStream(stream, (x) => x % 2 === 0);

      const result = await streamToArray(filtered);
      expect(result).toEqual([2, 4]);
    });

    it('should support async predicate', async () => {
      const stream = createTestStream([1, 2, 3, 4, 5]);
      const filtered = filterStream(stream, async (x) => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        return x > 3;
      });

      const result = await streamToArray(filtered);
      expect(result).toEqual([4, 5]);
    });

    it('should pass index to predicate', async () => {
      const stream = createTestStream(['a', 'b', 'c', 'd']);
      const filtered = filterStream(stream, (_, i) => i % 2 === 0);

      const result = await streamToArray(filtered);
      expect(result).toEqual(['a', 'c']);
    });

    it('should handle all items filtered out', async () => {
      const stream = createTestStream([1, 2, 3]);
      const filtered = filterStream(stream, () => false);

      const result = await streamToArray(filtered);
      expect(result).toEqual([]);
    });
  });

  describe('takeStream', () => {
    it('should take specified number of items', async () => {
      const stream = createTestStream([1, 2, 3, 4, 5]);
      const taken = takeStream(stream, 3);

      const result = await streamToArray(taken);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should take all items if count is greater than stream length', async () => {
      const stream = createTestStream([1, 2, 3]);
      const taken = takeStream(stream, 10);

      const result = await streamToArray(taken);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle zero count', async () => {
      const stream = createTestStream([1, 2, 3]);
      const taken = takeStream(stream, 0);

      const result = await streamToArray(taken);
      expect(result).toEqual([]);
    });

    it('should stop iteration early', async () => {
      let iterations = 0;
      async function* countingStream() {
        for (let i = 1; i <= 10; i++) {
          iterations++;
          yield i;
        }
      }

      const taken = takeStream(countingStream(), 3);
      await streamToArray(taken);

      // takeStream reads exactly what it needs
      expect(iterations).toBeLessThanOrEqual(4); // May read 1 extra to check for end
    });
  });

  describe('tapStream', () => {
    it('should execute callback without modifying stream', async () => {
      const sideEffects: number[] = [];
      const stream = createTestStream([1, 2, 3]);
      const tapped = tapStream(stream, (x) => {
        sideEffects.push(x * 2);
      });

      const result = await streamToArray(tapped);
      expect(result).toEqual([1, 2, 3]);
      expect(sideEffects).toEqual([2, 4, 6]);
    });

    it('should support async callback', async () => {
      const sideEffects: number[] = [];
      const stream = createTestStream([1, 2, 3]);
      const tapped = tapStream(stream, async (x) => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        sideEffects.push(x);
      });

      await streamToArray(tapped);
      expect(sideEffects).toEqual([1, 2, 3]);
    });

    it('should pass index to callback', async () => {
      const indices: number[] = [];
      const stream = createTestStream(['a', 'b', 'c']);
      const tapped = tapStream(stream, (_, i) => {
        indices.push(i);
      });

      await streamToArray(tapped);
      expect(indices).toEqual([0, 1, 2]);
    });
  });

  describe('bufferStream', () => {
    it('should buffer items into batches', async () => {
      const stream = createTestStream([1, 2, 3, 4, 5, 6, 7]);
      const buffered = bufferStream(stream, 3);

      const result = await streamToArray(buffered);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    it('should handle exact multiples', async () => {
      const stream = createTestStream([1, 2, 3, 4, 5, 6]);
      const buffered = bufferStream(stream, 2);

      const result = await streamToArray(buffered);
      expect(result).toEqual([[1, 2], [3, 4], [5, 6]]);
    });

    it('should handle buffer size larger than stream', async () => {
      const stream = createTestStream([1, 2]);
      const buffered = bufferStream(stream, 10);

      const result = await streamToArray(buffered);
      expect(result).toEqual([[1, 2]]);
    });

    it('should handle buffer size of 1', async () => {
      const stream = createTestStream([1, 2, 3]);
      const buffered = bufferStream(stream, 1);

      const result = await streamToArray(buffered);
      expect(result).toEqual([[1], [2], [3]]);
    });
  });

  describe('textOnlyStream', () => {
    it('should extract text content from chat chunks', async () => {
      const stream = createChatStream(['Hello', ' ', 'World']);
      const textStream = textOnlyStream(stream);

      const result = await streamToArray(textStream);
      expect(result).toEqual(['Hello', ' ', 'World']);
    });

    it('should skip chunks without content', async () => {
      const stream = async function* () {
        yield { choices: [{ delta: { content: 'Hello' } }] };
        yield { choices: [{ delta: {} }] };
        yield { choices: [{ delta: { content: 'World' } }] };
      };

      const textStream = textOnlyStream(stream());
      const result = await streamToArray(textStream);
      expect(result).toEqual(['Hello', 'World']);
    });

    it('should handle empty stream', async () => {
      const stream = createChatStream([]);
      const textStream = textOnlyStream(stream);

      const result = await streamToArray(textStream);
      expect(result).toEqual([]);
    });
  });

  describe('streamToArray', () => {
    it('should convert stream to array', async () => {
      const stream = createTestStream([1, 2, 3, 4, 5]);
      const result = await streamToArray(stream);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle empty stream', async () => {
      const stream = createTestStream([]);
      const result = await streamToArray(stream);
      expect(result).toEqual([]);
    });
  });

  describe('arrayToStream', () => {
    it('should convert array to stream', async () => {
      const stream = arrayToStream([1, 2, 3, 4, 5]);
      const result = await streamToArray(stream);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle empty array', async () => {
      const stream = arrayToStream([]);
      const result = await streamToArray(stream);
      expect(result).toEqual([]);
    });
  });

  describe('countStream', () => {
    it('should count items in stream', async () => {
      const stream = createTestStream([1, 2, 3, 4, 5]);
      const count = await countStream(stream);
      expect(count).toBe(5);
    });

    it('should handle empty stream', async () => {
      const stream = createTestStream([]);
      const count = await countStream(stream);
      expect(count).toBe(0);
    });

    it('should consume the stream', async () => {
      const stream = createTestStream([1, 2, 3]);
      const count = await countStream(stream);
      
      // Stream is consumed, can't iterate again
      expect(count).toBe(3);
    });
  });

  describe('stream composition', () => {
    it('should compose multiple operations', async () => {
      const stream = createTestStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      
      const result = await streamToArray(
        takeStream(
          filterStream(
            mapStream(stream, (x) => x * 2),
            (x) => x > 5
          ),
          3
        )
      );

      expect(result).toEqual([6, 8, 10]);
    });

    it('should handle complex pipeline', async () => {
      const sideEffects: string[] = [];
      const stream = createTestStream([1, 2, 3, 4, 5]);

      const pipeline = bufferStream(
        tapStream(
          filterStream(
            mapStream(stream, (x) => x * 2),
            (x) => x >= 4
          ),
          (x) => sideEffects.push(`processed:${x}`)
        ),
        2
      );

      const result = await streamToArray(pipeline);
      expect(result).toEqual([[4, 6], [8, 10]]);
      expect(sideEffects).toEqual(['processed:4', 'processed:6', 'processed:8', 'processed:10']);
    });
  });
});
