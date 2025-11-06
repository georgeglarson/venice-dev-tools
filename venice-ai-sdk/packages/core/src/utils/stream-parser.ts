import { Logger } from './logger';

export interface StreamParserOptions {
  logger?: Logger;
}

export interface ParsedLine {
  data: any;
  isDone: boolean;
}

/**
 * Utility class for parsing Server-Sent Events (SSE) streams.
 * Handles buffering, line parsing, and JSON deserialization.
 */
export class StreamParser {
  private logger?: Logger;
  private decoder: TextDecoder;
  private buffer: string;

  constructor(options: StreamParserOptions = {}) {
    this.logger = options.logger;
    this.decoder = new TextDecoder();
    this.buffer = '';
  }

  /**
   * Process a chunk of data from the stream.
   * 
   * @param value - The chunk of data to process
   * @returns An array of parsed data objects
   */
  public processChunk(value: Uint8Array): ParsedLine[] {
    this.buffer += this.decoder.decode(value, { stream: true });
    return this.extractLines();
  }

  /**
   * Process any remaining data in the buffer.
   * Call this when the stream has ended.
   * 
   * @returns An array of parsed data objects
   */
  public flush(): ParsedLine[] {
    if (!this.buffer.trim()) {
      return [];
    }

    const lines = this.buffer.split('\n');
    this.buffer = '';
    return this.parseLines(lines);
  }

  /**
   * Extract and parse complete lines from the buffer.
   * 
   * @returns An array of parsed data objects
   */
  private extractLines(): ParsedLine[] {
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';
    return this.parseLines(lines);
  }

  /**
   * Parse an array of lines into data objects.
   * 
   * @param lines - The lines to parse
   * @returns An array of parsed data objects
   */
  private parseLines(lines: string[]): ParsedLine[] {
    const results: ParsedLine[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine.startsWith('data: ')) {
        const data = trimmedLine.substring(6);
        
        if (data === '[DONE]') {
          results.push({ data: null, isDone: true });
          break;
        }

        try {
          const parsed = JSON.parse(data);
          results.push({ data: parsed, isDone: false });
        } catch (error) {
          this.logger?.error('Error parsing stream data', {
            error: error instanceof Error ? error.message : String(error),
            data: data.substring(0, 100),
          });
        }
      }
    }

    return results;
  }

  /**
   * Reset the parser state.
   */
  public reset(): void {
    this.buffer = '';
  }
}

/**
 * Parse SSE stream data from a ReadableStreamDefaultReader.
 * 
 * @param reader - The stream reader
 * @param logger - Optional logger for error reporting
 * @returns An async generator yielding parsed data
 */
export async function* parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  logger?: Logger
): AsyncGenerator<any, void, unknown> {
  const parser = new StreamParser({ logger });

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const parsedLines = parser.processChunk(value);
      for (const { data, isDone } of parsedLines) {
        if (isDone) return;
        if (data !== null) yield data;
      }
    }

    const remaining = parser.flush();
    for (const { data, isDone } of remaining) {
      if (isDone) return;
      if (data !== null) yield data;
    }
  } finally {
    parser.reset();
  }
}

export default StreamParser;
