# Logging Example for Venice AI SDK

This example shows how to implement logging for the Venice AI SDK.

## Logger Utility Example

Create file: `venice-ai-sdk/packages/core/src/utils/logger.ts`

```typescript
/**
 * Log levels for the logger.
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * A log entry.
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

/**
 * Options for the logger.
 */
export interface LoggerOptions {
  level?: LogLevel;
  handlers?: Array<(entry: LogEntry) => void>;
}

/**
 * Logger for the Venice AI SDK.
 * Provides logging functionality with different log levels.
 */
export class Logger {
  private level: LogLevel;
  private handlers: Array<(entry: LogEntry) => void>;
  
  /**
   * Creates a new logger.
   * 
   * @param options - Logger options
   */
  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.handlers = options.handlers ?? [this.defaultHandler.bind(this)];
  }
  
  /**
   * Sets the log level.
   * 
   * @param level - The log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  
  /**
   * Adds a log handler.
   * 
   * @param handler - The log handler
   */
  addHandler(handler: (entry: LogEntry) => void): void {
    this.handlers.push(handler);
  }
  
  /**
   * Logs a debug message.
   * 
   * @param message - The message to log
   * @param data - Additional data to log
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }
  
  /**
   * Logs an info message.
   * 
   * @param message - The message to log
   * @param data - Additional data to log
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }
  
  /**
   * Logs a warning message.
   * 
   * @param message - The message to log
   * @param data - Additional data to log
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }
  
  /**
   * Logs an error message.
   * 
   * @param message - The message to log
   * @param data - Additional data to log
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }
  
  /**
   * Logs a message at the specified level.
   * 
   * @param level - The log level
   * @param message - The message to log
   * @param data - Additional data to log
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (level < this.level) return;
    
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data
    };
    
    for (const handler of this.handlers) {
      handler(entry);
    }
  }
  
  /**
   * Default log handler.
   * 
   * @param entry - The log entry
   */
  private defaultHandler(entry: LogEntry): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const levelName = levelNames[entry.level] || 'UNKNOWN';
    
    let logMessage = `[${entry.timestamp}] ${levelName}: ${entry.message}`;
    
    if (entry.data !== undefined) {
      try {
        const dataStr = typeof entry.data === 'string' 
          ? entry.data 
          : JSON.stringify(entry.data, null, 2);
        logMessage += `\n${dataStr}`;
      } catch (e) {
        logMessage += '\n[Unable to stringify data]';
      }
    }
    
    // In Node.js environment
    if (typeof process !== 'undefined' && process.stdout) {
      const stream = entry.level >= LogLevel.ERROR ? process.stderr : process.stdout;
      stream.write(`${logMessage}\n`);
    } else {
      // In browser environment
      const method = entry.level >= LogLevel.ERROR 
        ? 'error' 
        : entry.level === LogLevel.WARN 
          ? 'warn' 
          : entry.level === LogLevel.INFO 
            ? 'info' 
            : 'debug';
      console[method](logMessage);
    }
  }
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
import { Logger, LogLevel } from './utils/logger';

export class VeniceClient {
  protected http: HttpClient;
  protected events: EventEmitter;
  protected config: VeniceClientConfig;
  protected rateLimiter: RateLimiter;
  protected logger: Logger;

  constructor(config: VeniceClientConfig = {}) {
    this.config = {
      baseUrl: 'https://api.venice.ai/api/v1',
      timeout: 30000,
      headers: {},
      maxConcurrent: 5,
      requestsPerMinute: 60,
      logLevel: LogLevel.INFO,
      ...config,
    };

    // Initialize logger
    this.logger = new Logger({
      level: this.config.logLevel
    });

    this.logger.info('Initializing Venice AI client', {
      baseUrl: this.config.baseUrl,
      timeout: this.config.timeout
    });

    this.http = new HttpClient(
      this.config.baseUrl,
      this.config.headers,
      this.config.timeout
    );

    if (this.config.apiKey) {
      this.setApiKey(this.config.apiKey);
      this.logger.debug('API key set from config');
    }

    this.events = new EventEmitter();
    
    // Initialize rate limiter
    this.rateLimiter = new RateLimiter(
      this.config.maxConcurrent,
      this.config.requestsPerMinute
    );
    
    this.logger.debug('Rate limiter initialized', {
      maxConcurrent: this.config.maxConcurrent,
      requestsPerMinute: this.config.requestsPerMinute
    });
  }

  /**
   * Set the API key for authentication.
   * @param apiKey - The Venice API key.
   */
  public setApiKey(apiKey: string): void {
    if (!apiKey) {
      this.logger.error('API key cannot be empty');
      throw new VeniceAuthError('API key cannot be empty');
    }
    this.config.apiKey = apiKey;
    this.http.setAuthToken(apiKey);
    this.logger.debug('API key set');
  }

  // ... other methods with logging ...

  /**
   * Get the logger instance.
   * @returns The logger instance.
   */
  public getLogger(): Logger {
    return this.logger;
  }

  /**
   * Set the log level.
   * @param level - The log level.
   */
  public setLogLevel(level: LogLevel): void {
    this.logger.setLevel(level);
    this.logger.info(`Log level set to ${LogLevel[level]}`);
  }
}
```

## HTTP Client Logging Example

Update file: `venice-ai-sdk/packages/core/src/http/client.ts`

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { HttpMethod, HttpRequestOptions, HttpResponse } from '../types';
import { VeniceApiError, VeniceNetworkError, VeniceTimeoutError } from '../errors';
import { RateLimiter } from '../utils/rate-limiter';
import { Logger, LogLevel } from '../utils/logger';

export class HttpClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private rateLimiter: RateLimiter;
  private logger: Logger;

  constructor(
    baseUrl: string = 'https://api.venice.ai/api/v1',
    headers: Record<string, string> = {},
    timeout: number = 30000,
    maxConcurrent: number = 5,
    requestsPerMinute: number = 60,
    logger?: Logger
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
    
    // Use provided logger or create a new one
    this.logger = logger || new Logger({ level: LogLevel.INFO });
    
    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        const requestId = Math.random().toString(36).substring(2, 15);
        config.headers['X-Request-ID'] = requestId;
        
        this.logger.debug(`Request ${requestId}: ${config.method?.toUpperCase()} ${config.url}`, {
          headers: this.sanitizeHeaders(config.headers),
          params: config.params,
          data: this.sanitizeData(config.data)
        });
        
        return config;
      },
      (error) => {
        this.logger.error('Request setup error', { error });
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        const requestId = response.config.headers['X-Request-ID'];
        
        this.logger.debug(`Response ${requestId}: ${response.status} ${response.statusText}`, {
          headers: this.sanitizeHeaders(response.headers),
          data: this.sanitizeData(response.data)
        });
        
        return response;
      },
      (error) => {
        const requestId = error.config?.headers?.['X-Request-ID'];
        
        if (error.response) {
          this.logger.error(`Response ${requestId}: ${error.response.status} ${error.response.statusText}`, {
            headers: this.sanitizeHeaders(error.response.headers),
            data: error.response.data
          });
        } else if (error.request) {
          this.logger.error(`Response ${requestId}: No response received`, {
            error: error.message
          });
        } else {
          this.logger.error(`Request ${requestId} error: ${error.message}`);
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Sanitize headers for logging by removing sensitive information.
   */
  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    if (sanitized.Authorization) {
      sanitized.Authorization = 'Bearer [REDACTED]';
    }
    
    return sanitized;
  }
  
  /**
   * Sanitize request/response data for logging by removing sensitive information.
   */
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      
      if (sanitized.apiKey) {
        sanitized.apiKey = '[REDACTED]';
      }
      
      if (sanitized.api_key) {
        sanitized.api_key = '[REDACTED]';
      }
      
      return sanitized;
    }
    
    return data;
  }

  // ... rest of the class ...
}
```

## Chat Endpoint Logging Example

Update file: `venice-ai-sdk/packages/core/src/api/endpoints/chat/index.ts`

```typescript
import { ApiEndpoint } from '../../registry/endpoint';
import {
  ChatCompletionRequest,
  ChatCompletionResponse
} from '../../../types';
import { validateChatCompletionRequest } from '../../../utils/validators/chat';

export class ChatEndpoint extends ApiEndpoint {
  // ... existing code ...

  public async createCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    this.logger.debug('Creating chat completion', {
      model: request.model,
      messageCount: request.messages.length
    });

    // Validate request parameters
    try {
      validateChatCompletionRequest(request);
    } catch (error) {
      this.logger.error('Chat completion validation failed', { error });
      throw error;
    }

    // Emit a request event
    this.emit('request', { type: 'chat.completion', data: request });

    try {
      // Make the API request
      const response = await this.http.post<ChatCompletionResponse>(
        this.getPath('/completions'),
        request
      );

      this.logger.debug('Chat completion successful', {
        model: request.model,
        tokensUsed: response.data.usage?.total_tokens
      });

      // Emit a response event
      this.emit('response', { type: 'chat.completion', data: response.data });

      return response.data;
    } catch (error) {
      this.logger.error('Chat completion failed', { error });
      throw error;
    }
  }

  // ... rest of the class ...
}
```

## Implementation Steps

1. Create the logger utility file as shown above

2. Update the client configuration interface to include logging options

3. Integrate the logger with the client

4. Add request/response logging to the HTTP client

5. Add logging to all API endpoints

6. Test the logging functionality by setting different log levels and verifying that the appropriate messages are logged