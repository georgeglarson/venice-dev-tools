# Rate Limiter Example for Venice AI SDK

This example shows how to implement rate limiting for the Venice AI SDK.

## Rate Limiter Utility Example

Create file: `venice-ai-sdk/packages/core/src/utils/rate-limiter.ts`

```typescript
import { VeniceRateLimitError } from '../errors';

/**
 * Rate limiter for API requests.
 * Manages request concurrency and rate limits.
 */
export class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private maxConcurrent: number;
  private requestsPerMinute: number;
  private requestTimestamps: number[] = [];

  /**
   * Creates a new rate limiter.
   * 
   * @param maxConcurrent - Maximum number of concurrent requests
   * @param requestsPerMinute - Maximum requests per minute
   */
  constructor(maxConcurrent = 5, requestsPerMinute = 60) {
    this.maxConcurrent = maxConcurrent;
    this.requestsPerMinute = requestsPerMinute;
  }

  /**
   * Adds a request to the rate limiter.
   * 
   * @param fn - The request function to execute
   * @returns A promise resolving to the request result
   * @throws {VeniceRateLimitError} If the rate limit is exceeded
   */
  async add<T>(fn: () => Promise<T>): Promise<T> {
    // Check rate limit
    this.enforceRateLimit();
    
    // Add to queue if at capacity
    if (this.running >= this.maxConcurrent) {
      return new Promise((resolve, reject) => {
        this.queue.push(async () => {
          try {
            const result = await fn();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
    }
    
    // Otherwise execute immediately
    this.running++;
    try {
      const result = await fn();
      this.recordRequest();
      return result;
    } finally {
      this.running--;
      this.processQueue();
    }
  }

  /**
   * Processes the next request in the queue.
   */
  private processQueue() {
    if (this.queue.length > 0 && this.running < this.maxConcurrent) {
      const next = this.queue.shift();
      if (next) {
        this.running++;
        next().finally(() => {
          this.running--;
          this.processQueue();
        });
      }
    }
  }

  /**
   * Records a request for rate limiting.
   */
  private recordRequest() {
    const now = Date.now();
    this.requestTimestamps.push(now);
    
    // Clean up old timestamps
    const oneMinuteAgo = now - 60000;
    this.requestTimestamps = this.requestTimestamps.filter(t => t > oneMinuteAgo);
  }

  /**
   * Enforces the rate limit.
   * 
   * @throws {VeniceRateLimitError} If the rate limit is exceeded
   */
  private enforceRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean up old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(t => t > oneMinuteAgo);
    
    // Check if we're over the limit
    if (this.requestTimestamps.length >= this.requestsPerMinute) {
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = 60000 - (now - oldestTimestamp);
      throw new VeniceRateLimitError(
        `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`
      );
    }
  }
}
```

## Client Configuration Update Example

Update file: `venice-ai-sdk/packages/core/src/types/common.ts`

```typescript
/**
 * Configuration options for the Venice AI client.
 */
export interface VeniceClientConfig {
  /**
   * The API key for authentication.
   */
  apiKey?: string;
  
  /**
   * The base URL for the API.
   */
  baseUrl?: string;
  
  /**
   * Request timeout in milliseconds.
   */
  timeout?: number;
  
  /**
   * Additional headers to include in requests.
   */
  headers?: Record<string, string>;
  
  /**
   * Maximum number of concurrent requests.
   */
  maxConcurrent?: number;
  
  /**
   * Maximum requests per minute.
   */
  requestsPerMinute?: number;
  
  /**
   * Log level for the client.
   */
  logLevel?: LogLevel;
}
```

## Client Integration Example

Update file: `venice-ai-sdk/packages/core/src/client.ts`

```typescript
import { EventEmitter } from 'eventemitter3';
import { HttpClient } from './http/client';
import { VeniceClientConfig } from './types';
import { VeniceAuthError } from './errors';
import { RateLimiter } from './utils/rate-limiter';

export class VeniceClient {
  protected http: HttpClient;
  protected events: EventEmitter;
  protected config: VeniceClientConfig;
  protected rateLimiter: RateLimiter;

  constructor(config: VeniceClientConfig = {}) {
    this.config = {
      baseUrl: 'https://api.venice.ai/api/v1',
      timeout: 30000,
      headers: {},
      maxConcurrent: 5,
      requestsPerMinute: 60,
      ...config,
    };

    this.http = new HttpClient(
      this.config.baseUrl,
      this.config.headers,
      this.config.timeout
    );

    if (this.config.apiKey) {
      this.setApiKey(this.config.apiKey);
    }

    this.events = new EventEmitter();
    
    // Initialize rate limiter
    this.rateLimiter = new RateLimiter(
      this.config.maxConcurrent,
      this.config.requestsPerMinute
    );
  }

  // ... existing methods ...

  /**
   * Executes a rate-limited API request.
   * 
   * @param fn - The request function to execute
   * @returns A promise resolving to the request result
   */
  protected async executeRateLimited<T>(fn: () => Promise<T>): Promise<T> {
    return this.rateLimiter.add(fn);
  }
}
```

## HTTP Client Integration Example

Update file: `venice-ai-sdk/packages/core/src/http/client.ts`

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { HttpMethod, HttpRequestOptions, HttpResponse } from '../types';
import { VeniceApiError, VeniceNetworkError, VeniceTimeoutError } from '../errors';
import { RateLimiter } from '../utils/rate-limiter';

export class HttpClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private rateLimiter: RateLimiter;

  constructor(
    baseUrl: string = 'https://api.venice.ai/api/v1',
    headers: Record<string, string> = {},
    timeout: number = 30000,
    maxConcurrent: number = 5,
    requestsPerMinute: number = 60
  ) {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    
    // Initialize rate limiter
    this.rateLimiter = new RateLimiter(maxConcurrent, requestsPerMinute);
  }

  // ... existing methods ...

  public async request<T = any>(path: string, options: HttpRequestOptions = {}): Promise<HttpResponse<T>> {
    return this.rateLimiter.add(async () => {
      try {
        const {
          method = 'GET',
          headers = {},
          body,
          query,
          timeout,
          responseType = 'json',
          signal,
        } = options;

        const config: AxiosRequestConfig = {
          method: method,
          url: path,
          headers,
          params: query,
          data: body,
          responseType,
          signal,
        };

        if (timeout) {
          config.timeout = timeout;
        }

        const response: AxiosResponse<T> = await this.client.request(config);

        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers as Record<string, string>,
        };
      } catch (error) {
        this.handleRequestError(error as AxiosError);
      }

      // This should never be reached, but required for TypeScript
      throw new Error('Unknown error occurred');
    });
  }

  // ... rest of the class ...
}
```

## Implementation Steps

1. Create the rate limiter utility file as shown above

2. Update the client configuration interface to include rate limiting options

3. Integrate the rate limiter with the client

4. Update the HTTP client to use rate limiting for all requests

5. Test the rate limiting functionality by sending many requests in quick succession and verifying that they are properly queued and rate-limited