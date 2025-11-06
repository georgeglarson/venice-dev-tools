import { HttpRequestOptions, HttpResponse } from '../types';

/**
 * Context for middleware request processing.
 */
export interface MiddlewareRequestContext {
  path: string;
  options: HttpRequestOptions;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Context for middleware response processing.
 */
export interface MiddlewareResponseContext<T = any> {
  path: string;
  options: HttpRequestOptions;
  response: HttpResponse<T>;
  timestamp: number;
  duration: number;
  metadata?: Record<string, any>;
}

/**
 * Context for middleware error processing.
 */
export interface MiddlewareErrorContext {
  path: string;
  options: HttpRequestOptions;
  error: Error;
  timestamp: number;
  duration: number;
  metadata?: Record<string, any>;
}

/**
 * Middleware function that can intercept and modify requests.
 */
export interface RequestMiddleware {
  (context: MiddlewareRequestContext): Promise<MiddlewareRequestContext> | MiddlewareRequestContext;
}

/**
 * Middleware function that can intercept and modify responses.
 */
export interface ResponseMiddleware {
  <T = any>(context: MiddlewareResponseContext<T>): Promise<MiddlewareResponseContext<T>> | MiddlewareResponseContext<T>;
}

/**
 * Middleware function that can handle errors.
 */
export interface ErrorMiddleware {
  (context: MiddlewareErrorContext): Promise<void> | void;
}

/**
 * Complete middleware with optional hooks for request, response, and error.
 */
export interface Middleware {
  name?: string;
  onRequest?: RequestMiddleware;
  onResponse?: ResponseMiddleware;
  onError?: ErrorMiddleware;
}
