import {
  Middleware,
  MiddlewareRequestContext,
  MiddlewareResponseContext,
  MiddlewareErrorContext,
} from './types';
import { HttpRequestOptions, HttpResponse } from '../types';

/**
 * Manages middleware execution pipeline for HTTP requests.
 */
export class MiddlewareManager {
  private middlewares: Middleware[] = [];

  /**
   * Register a middleware.
   * 
   * @param middleware - The middleware to register
   * @returns This manager for chaining
   */
  public use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Remove a middleware by name.
   * 
   * @param name - The middleware name
   * @returns True if removed, false if not found
   */
  public remove(name: string): boolean {
    const index = this.middlewares.findIndex(m => m.name === name);
    if (index !== -1) {
      this.middlewares.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clear all middlewares.
   */
  public clear(): void {
    this.middlewares = [];
  }

  /**
   * Get all registered middlewares.
   * 
   * @returns Array of middlewares
   */
  public getMiddlewares(): Middleware[] {
    return [...this.middlewares];
  }

  /**
   * Execute request middleware chain.
   * 
   * @param path - Request path
   * @param options - Request options
   * @returns Modified request context
   */
  public async executeRequest(
    path: string,
    options: HttpRequestOptions
  ): Promise<MiddlewareRequestContext> {
    let context: MiddlewareRequestContext = {
      path,
      options,
      timestamp: Date.now(),
      metadata: {},
    };

    for (const middleware of this.middlewares) {
      if (middleware.onRequest) {
        context = await middleware.onRequest(context);
      }
    }

    return context;
  }

  /**
   * Execute response middleware chain.
   * 
   * @param path - Request path
   * @param options - Request options
   * @param response - HTTP response
   * @param startTime - Request start timestamp
   * @param metadata - Request metadata
   * @returns Modified response context
   */
  public async executeResponse<T = any>(
    path: string,
    options: HttpRequestOptions,
    response: HttpResponse<T>,
    startTime: number,
    metadata?: Record<string, any>
  ): Promise<MiddlewareResponseContext<T>> {
    let context: MiddlewareResponseContext<T> = {
      path,
      options,
      response,
      timestamp: startTime,
      duration: Date.now() - startTime,
      metadata,
    };

    for (const middleware of this.middlewares) {
      if (middleware.onResponse) {
        context = await middleware.onResponse(context);
      }
    }

    return context;
  }

  /**
   * Execute error middleware chain.
   * 
   * @param path - Request path
   * @param options - Request options
   * @param error - Error that occurred
   * @param startTime - Request start timestamp
   * @param metadata - Request metadata
   */
  public async executeError(
    path: string,
    options: HttpRequestOptions,
    error: Error,
    startTime: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    const context: MiddlewareErrorContext = {
      path,
      options,
      error,
      timestamp: startTime,
      duration: Date.now() - startTime,
      metadata,
    };

    for (const middleware of this.middlewares) {
      if (middleware.onError) {
        await middleware.onError(context);
      }
    }
  }
}
