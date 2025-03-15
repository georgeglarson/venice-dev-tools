import { BaseHttpClient } from '../base/base-http-client';
import { ErrorHandler } from '../error/error-handler';
import { HttpRequestOptions } from '../../types';
import { RateLimiter } from '../../utils/rate-limiter';
import { Logger } from '../../utils/logger';

/**
 * HTTP client for making streaming requests to the Venice AI API.
 */
export class StreamingHttpClient extends BaseHttpClient {
  /**
   * The error handler.
   */
  private errorHandler: ErrorHandler;

  /**
   * The rate limiter for controlling request concurrency and rate limits.
   */
  private rateLimiter?: RateLimiter;

  /**
   * The logger for logging events and errors.
   */
  private logger?: Logger;

  /**
   * Create a new streaming HTTP client.
   * @param baseUrl - The base URL for the API.
   * @param headers - Additional headers to include in requests.
   * @param timeout - Request timeout in milliseconds.
   * @param errorHandler - The error handler to use.
   * @param rateLimiter - Optional rate limiter for controlling request concurrency.
   * @param logger - Optional logger for logging events and errors.
   */
  constructor(
    baseUrl: string = 'https://api.venice.ai/api/v1',
    headers: Record<string, string> = {},
    timeout: number = 30000,
    errorHandler: ErrorHandler = new ErrorHandler(),
    rateLimiter?: RateLimiter,
    logger?: Logger
  ) {
    super(baseUrl, headers, timeout);
    this.errorHandler = errorHandler;
    this.rateLimiter = rateLimiter;
    this.logger = logger;
    
    if (this.logger) {
      this.logger.debug('Initializing streaming HTTP client', {
        baseUrl,
        timeout
      });
    }
  }

  /**
   * Create a new stream request.
   * @param path - The API path.
   * @param body - The request body.
   * @param options - Additional request options.
   * @returns A fetch response for streaming.
   */
  public async stream(
    path: string,
    body?: any,
    options: Omit<HttpRequestOptions, 'method' | 'body'> = {}
  ): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const authHeader = this.headers['Authorization'];
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...this.headers,
      ...options.headers,
    };

    if (this.logger) {
      this.logger.debug(`Preparing streaming request to ${path}`, {
        headers: { ...headers, Authorization: authHeader ? 'Bearer [REDACTED]' : undefined }
      });
    }

    // Define the request function
    const makeRequest = async (): Promise<Response> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.timeout);

        if (this.logger) {
          this.logger.debug(`Sending streaming request to ${path}`);
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: options.signal || controller.signal,
        });

        clearTimeout(timeoutId);

        if (this.logger) {
          this.logger.debug(`Streaming request to ${path} received response`, {
            status: response.status,
            statusText: response.statusText
          });
        }

        await this.errorHandler.handleResponseError(response);
        return response;
      } catch (error) {
        if (this.logger) {
          this.logger.error(`Streaming request to ${path} failed`, {
            error: (error as any).message
          });
        }
        return this.errorHandler.handleStreamError(error);
      }
    };

    // Use rate limiter if available, otherwise make the request directly
    if (this.rateLimiter) {
      if (this.logger) {
        this.logger.debug(`Rate limiting streaming request to ${path}`);
      }
      return this.rateLimiter.add(makeRequest);
    } else {
      return makeRequest();
    }
  }

  /**
   * Process a stream response as a readable stream of events.
   * @param response - The fetch response.
   * @param onEvent - Callback for each event.
   * @param onComplete - Callback when the stream completes.
   * @param onError - Callback when an error occurs.
   */
  public async processStream(
    response: Response,
    onEvent: (event: any) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (this.logger) {
      this.logger.debug('Processing stream response');
    }
    
    try {
      const reader = response.body?.getReader();
      if (!reader) {
        const errorMsg = 'Response body is not readable';
        if (this.logger) {
          this.logger.error(errorMsg);
        }
        throw new Error(errorMsg);
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let eventCount = 0;

      if (this.logger) {
        this.logger.debug('Starting to read stream');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Process any remaining data in the buffer
          if (buffer.trim()) {
            try {
              const event = JSON.parse(buffer);
              onEvent(event);
              eventCount++;
            } catch (e) {
              // Ignore parsing errors for incomplete data
              if (this.logger) {
                this.logger.debug('Ignoring parsing error for incomplete data at stream end');
              }
            }
          }
          break;
        }

        // Decode the chunk and add it to our buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete JSON objects from the buffer
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (line) {
            try {
              const event = JSON.parse(line);
              onEvent(event);
              eventCount++;
              
              if (this.logger && eventCount % 10 === 0) {
                this.logger.debug(`Processed ${eventCount} stream events`);
              }
            } catch (e) {
              const errorMsg = `Failed to parse event: ${line}`;
              if (this.logger) {
                this.logger.error(errorMsg);
              }
              if (onError) {
                onError(new Error(errorMsg));
              }
            }
          }
        }
      }

      if (this.logger) {
        this.logger.debug(`Stream processing complete, processed ${eventCount} events`);
      }
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      if (this.logger) {
        this.logger.error(`Stream processing error: ${errorMsg}`);
      }
      
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      } else {
        throw error;
      }
    }
  }
}

export default StreamingHttpClient;