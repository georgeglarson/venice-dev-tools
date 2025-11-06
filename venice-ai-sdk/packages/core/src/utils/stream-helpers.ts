/**
 * Enhanced streaming utilities for working with AI response streams.
 */

/**
 * Options for collecting stream chunks into a complete response.
 */
export interface CollectStreamOptions {
  onChunk?: (chunk: any, index: number) => void;
  signal?: AbortSignal;
  timeout?: number;
}

/**
 * Collect all chunks from a stream into a single response.
 * 
 * @param stream - Async iterable stream
 * @param options - Collection options
 * @returns Complete collected content
 */
export async function collectStream(
  stream: AsyncIterable<any>,
  options: CollectStreamOptions = {}
): Promise<string> {
  const { onChunk, signal, timeout } = options;
  const chunks: string[] = [];
  let index = 0;

  const timeoutPromise = timeout
    ? new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Stream collection timeout')), timeout)
      )
    : null;

  const collectPromise = async () => {
    for await (const chunk of stream) {
      if (signal?.aborted) {
        throw new Error('Stream collection aborted');
      }

      const content = chunk.choices?.[0]?.delta?.content || '';
      if (content) {
        chunks.push(content);
        if (onChunk) {
          onChunk(chunk, index);
        }
        index++;
      }
    }
    return chunks.join('');
  };

  if (timeoutPromise) {
    return Promise.race([collectPromise(), timeoutPromise]);
  }

  return collectPromise();
}

/**
 * Map each chunk in a stream to a new value.
 * 
 * @param stream - Source stream
 * @param mapper - Mapping function
 * @returns Mapped stream
 */
export async function* mapStream<T, R>(
  stream: AsyncIterable<T>,
  mapper: (chunk: T, index: number) => R | Promise<R>
): AsyncIterable<R> {
  let index = 0;
  for await (const chunk of stream) {
    yield await mapper(chunk, index++);
  }
}

/**
 * Filter chunks in a stream based on a predicate.
 * 
 * @param stream - Source stream
 * @param predicate - Filter predicate
 * @returns Filtered stream
 */
export async function* filterStream<T>(
  stream: AsyncIterable<T>,
  predicate: (chunk: T, index: number) => boolean | Promise<boolean>
): AsyncIterable<T> {
  let index = 0;
  for await (const chunk of stream) {
    if (await predicate(chunk, index++)) {
      yield chunk;
    }
  }
}

/**
 * Take only the first N chunks from a stream.
 * 
 * @param stream - Source stream
 * @param count - Number of chunks to take
 * @returns Limited stream
 */
export async function* takeStream<T>(
  stream: AsyncIterable<T>,
  count: number
): AsyncIterable<T> {
  let taken = 0;
  for await (const chunk of stream) {
    if (taken >= count) break;
    yield chunk;
    taken++;
  }
}

/**
 * Tap into a stream without modifying it (for side effects).
 * 
 * @param stream - Source stream
 * @param callback - Side effect callback
 * @returns Original stream
 */
export async function* tapStream<T>(
  stream: AsyncIterable<T>,
  callback: (chunk: T, index: number) => void | Promise<void>
): AsyncIterable<T> {
  let index = 0;
  for await (const chunk of stream) {
    await callback(chunk, index++);
    yield chunk;
  }
}

/**
 * Merge multiple streams into one.
 * 
 * @param streams - Streams to merge
 * @returns Merged stream
 */
export async function* mergeStreams<T>(
  ...streams: AsyncIterable<T>[]
): AsyncIterable<T> {
  for (const stream of streams) {
    for await (const chunk of stream) {
      yield chunk;
    }
  }
}

/**
 * Buffer stream chunks and yield them in batches.
 * 
 * @param stream - Source stream
 * @param size - Buffer size
 * @returns Buffered stream
 */
export async function* bufferStream<T>(
  stream: AsyncIterable<T>,
  size: number
): AsyncIterable<T[]> {
  let buffer: T[] = [];
  
  for await (const chunk of stream) {
    buffer.push(chunk);
    if (buffer.length >= size) {
      yield buffer;
      buffer = [];
    }
  }
  
  if (buffer.length > 0) {
    yield buffer;
  }
}

/**
 * Debounce stream chunks (only yield if no new chunk arrives within delay).
 * 
 * @param stream - Source stream
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced stream
 */
export async function* debounceStream<T>(
  stream: AsyncIterable<T>,
  delay: number
): AsyncIterable<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastChunk: T | null = null;
  let resolve: ((value: T | null) => void) | null = null;

  const emitChunk = () => {
    if (resolve && lastChunk !== null) {
      resolve(lastChunk);
      lastChunk = null;
      resolve = null;
    }
  };

  const iterator = stream[Symbol.asyncIterator]();
  
  while (true) {
    const waitForChunk = new Promise<T | null>((res) => {
      resolve = res;
    });

    const result = await iterator.next();
    
    if (result.done) {
      emitChunk();
      break;
    }

    lastChunk = result.value;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(emitChunk, delay);

    const chunk = await Promise.race([
      waitForChunk,
      new Promise<null>((res) => setTimeout(() => res(null), delay)),
    ]);

    if (chunk !== null) {
      yield chunk;
    }
  }
}

/**
 * Add timeout to individual stream chunks.
 * 
 * @param stream - Source stream
 * @param timeout - Timeout in milliseconds
 * @returns Stream with timeout
 */
export async function* timeoutStream<T>(
  stream: AsyncIterable<T>,
  timeout: number
): AsyncIterable<T> {
  const iterator = stream[Symbol.asyncIterator]();
  
  while (true) {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Stream chunk timeout')), timeout)
    );

    const result = await Promise.race([
      iterator.next(),
      timeoutPromise,
    ]);

    if (result.done) break;
    yield result.value;
  }
}

/**
 * Retry stream on error with exponential backoff.
 * 
 * @param streamFactory - Function that creates a new stream
 * @param options - Retry options
 * @returns Stream with retry logic
 */
export async function* retryStream<T>(
  streamFactory: () => AsyncIterable<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
  } = {}
): AsyncIterable<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = options;

  let attempt = 0;
  let delay = initialDelay;

  while (attempt <= maxRetries) {
    try {
      const stream = streamFactory();
      for await (const chunk of stream) {
        yield chunk;
      }
      return;
    } catch (error) {
      attempt++;
      if (attempt > maxRetries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }
}

/**
 * Convert a stream to an array.
 * 
 * @param stream - Source stream
 * @returns Array of all chunks
 */
export async function streamToArray<T>(stream: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const chunk of stream) {
    result.push(chunk);
  }
  return result;
}

/**
 * Convert an array to a stream.
 * 
 * @param array - Source array
 * @returns Stream of array items
 */
export async function* arrayToStream<T>(array: T[]): AsyncIterable<T> {
  for (const item of array) {
    yield item;
  }
}

/**
 * Extract only the text content from chat completion chunks.
 * 
 * @param stream - Chat completion stream
 * @returns Text-only stream
 */
export async function* textOnlyStream(
  stream: AsyncIterable<any>
): AsyncIterable<string> {
  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

/**
 * Count chunks in a stream (consumes the stream).
 * 
 * @param stream - Source stream
 * @returns Number of chunks
 */
export async function countStream<T>(stream: AsyncIterable<T>): Promise<number> {
  let count = 0;
  for await (const _ of stream) {
    count++;
  }
  return count;
}
