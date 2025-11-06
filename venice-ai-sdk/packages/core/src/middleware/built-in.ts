import { Middleware } from './types';
import { Logger } from '../utils/logger';

/**
 * Logging middleware that logs all requests, responses, and errors.
 * 
 * @param logger - Logger instance to use
 * @param options - Logging options
 * @returns Logging middleware
 */
export function loggingMiddleware(
  logger: Logger,
  options: {
    logHeaders?: boolean;
    logBody?: boolean;
    logResponse?: boolean;
  } = {}
): Middleware {
  const { logHeaders = false, logBody = false, logResponse = false } = options;

  return {
    name: 'logging',
    
    onRequest: (context) => {
      const logData: any = {
        path: context.path,
        method: context.options.method || 'GET',
      };

      if (logHeaders && context.options.headers) {
        logData.headers = context.options.headers;
      }

      if (logBody && context.options.body) {
        logData.body = context.options.body;
      }

      logger.info(`→ ${logData.method} ${context.path}`, logData);
      return context;
    },

    onResponse: (context) => {
      const logData: any = {
        path: context.path,
        status: context.response.status,
        duration: `${context.duration}ms`,
      };

      if (logResponse) {
        logData.response = context.response.data;
      }

      logger.info(`← ${context.response.status} ${context.path} (${context.duration}ms)`, logData);
      return context;
    },

    onError: (context) => {
      logger.error(`✗ ${context.path} failed (${context.duration}ms)`, {
        error: context.error.message,
        path: context.path,
        duration: `${context.duration}ms`,
      });
    },
  };
}

/**
 * Timing middleware that adds performance timing metadata.
 * 
 * @returns Timing middleware
 */
export function timingMiddleware(): Middleware {
  return {
    name: 'timing',
    
    onRequest: (context) => {
      context.metadata = context.metadata || {};
      context.metadata.startTime = Date.now();
      return context;
    },

    onResponse: (context) => {
      context.metadata = context.metadata || {};
      context.metadata.endTime = Date.now();
      context.metadata.totalDuration = context.duration;
      
      if (context.response.headers) {
        context.response.headers['X-Response-Time'] = `${context.duration}ms`;
      }
      
      return context;
    },
  };
}

/**
 * Headers middleware that injects custom headers into all requests.
 * 
 * @param headers - Headers to inject
 * @returns Headers middleware
 */
export function headersMiddleware(headers: Record<string, string>): Middleware {
  return {
    name: 'headers',
    
    onRequest: (context) => {
      context.options.headers = {
        ...context.options.headers,
        ...headers,
      };
      return context;
    },
  };
}

/**
 * Retry metadata middleware that tracks retry attempts.
 * 
 * @returns Retry tracking middleware
 */
export function retryMetadataMiddleware(): Middleware {
  return {
    name: 'retry-metadata',
    
    onRequest: (context) => {
      context.metadata = context.metadata || {};
      context.metadata.attemptNumber = (context.metadata.attemptNumber || 0) + 1;
      
      if (context.metadata.attemptNumber > 1) {
        context.options.headers = context.options.headers || {};
        context.options.headers['X-Retry-Attempt'] = String(context.metadata.attemptNumber);
      }
      
      return context;
    },
  };
}

/**
 * Request ID middleware that adds a unique ID to each request.
 * 
 * @param options - Options for request ID generation
 * @returns Request ID middleware
 */
export function requestIdMiddleware(
  options: {
    headerName?: string;
    generator?: () => string;
  } = {}
): Middleware {
  const { 
    headerName = 'X-Request-ID',
    generator = () => `req_${Date.now()}_${Math.random().toString(36).substring(7)}`
  } = options;

  return {
    name: 'request-id',
    
    onRequest: (context) => {
      const requestId = generator();
      
      context.options.headers = context.options.headers || {};
      context.options.headers[headerName] = requestId;
      
      context.metadata = context.metadata || {};
      context.metadata.requestId = requestId;
      
      return context;
    },
  };
}

/**
 * Response caching middleware (simple in-memory cache).
 * 
 * @param options - Caching options
 * @returns Caching middleware
 */
export function cachingMiddleware(
  options: {
    ttl?: number;
    maxSize?: number;
    shouldCache?: (context: any) => boolean;
  } = {}
): Middleware {
  const { 
    ttl = 60000, // 1 minute default
    maxSize = 100,
    shouldCache = (ctx) => ctx.options.method === 'GET'
  } = options;

  const cache = new Map<string, { data: any; timestamp: number }>();

  return {
    name: 'caching',
    
    onRequest: (context) => {
      if (!shouldCache(context)) {
        return context;
      }

      const cacheKey = `${context.path}:${JSON.stringify(context.options.query || {})}`;
      const cached = cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < ttl) {
        context.metadata = context.metadata || {};
        context.metadata.cacheHit = true;
        context.metadata.cachedData = cached.data;
      }

      return context;
    },

    onResponse: (context) => {
      if (!shouldCache(context) || context.metadata?.cacheHit) {
        return context;
      }

      const cacheKey = `${context.path}:${JSON.stringify(context.options.query || {})}`;
      
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) {
          cache.delete(firstKey);
        }
      }

      cache.set(cacheKey, {
        data: context.response.data,
        timestamp: Date.now(),
      });

      return context;
    },
  };
}
