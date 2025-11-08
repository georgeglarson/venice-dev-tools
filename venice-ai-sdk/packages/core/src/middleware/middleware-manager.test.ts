import { describe, it, expect, beforeEach } from 'vitest';
import { MiddlewareManager } from '../middleware/middleware-manager';
import type { Middleware, MiddlewareRequestContext, MiddlewareResponseContext } from '../middleware/types';

describe('MiddlewareManager', () => {
  let manager: MiddlewareManager;

  beforeEach(() => {
    manager = new MiddlewareManager();
  });

  describe('middleware registration', () => {
    it('should register middleware', () => {
      const middleware: Middleware = {
        name: 'test',
        onRequest: (ctx) => ctx,
      };

      manager.use(middleware);
      expect(manager.getMiddlewares()).toHaveLength(1);
      expect(manager.getMiddlewares()[0].name).toBe('test');
    });

    it('should register multiple middlewares', () => {
      const mw1: Middleware = { name: 'first' };
      const mw2: Middleware = { name: 'second' };

      manager.use(mw1).use(mw2);
      expect(manager.getMiddlewares()).toHaveLength(2);
    });

    it('should remove middleware by name', () => {
      const middleware: Middleware = { name: 'removable' };
      
      manager.use(middleware);
      expect(manager.getMiddlewares()).toHaveLength(1);
      
      const removed = manager.remove('removable');
      expect(removed).toBe(true);
      expect(manager.getMiddlewares()).toHaveLength(0);
    });

    it('should return false when removing non-existent middleware', () => {
      const removed = manager.remove('non-existent');
      expect(removed).toBe(false);
    });

    it('should clear all middlewares', () => {
      manager.use({ name: 'first' }).use({ name: 'second' });
      expect(manager.getMiddlewares()).toHaveLength(2);
      
      manager.clear();
      expect(manager.getMiddlewares()).toHaveLength(0);
    });
  });

  describe('request middleware execution', () => {
    it('should execute request middleware', async () => {
      let executed = false;
      
      manager.use({
        name: 'test',
        onRequest: (ctx) => {
          executed = true;
          return ctx;
        },
      });

      await manager.executeRequest('/test', { method: 'GET' });
      expect(executed).toBe(true);
    });

    it('should pass context through middleware chain', async () => {
      manager
        .use({
          name: 'first',
          onRequest: (ctx) => {
            ctx.metadata = { ...ctx.metadata, first: true };
            return ctx;
          },
        })
        .use({
          name: 'second',
          onRequest: (ctx) => {
            ctx.metadata = { ...ctx.metadata, second: true };
            return ctx;
          },
        });

      const result = await manager.executeRequest('/test', { method: 'GET' });
      expect(result.metadata).toEqual({ first: true, second: true });
    });

    it('should allow middleware to modify request path', async () => {
      manager.use({
        name: 'path-modifier',
        onRequest: (ctx) => {
          ctx.path = '/modified';
          return ctx;
        },
      });

      const result = await manager.executeRequest('/original', { method: 'GET' });
      expect(result.path).toBe('/modified');
    });

    it('should allow middleware to add headers', async () => {
      manager.use({
        name: 'header-adder',
        onRequest: (ctx) => {
          ctx.options.headers = {
            ...ctx.options.headers,
            'X-Custom': 'value',
          };
          return ctx;
        },
      });

      const result = await manager.executeRequest('/test', { method: 'GET' });
      expect(result.options.headers).toEqual({ 'X-Custom': 'value' });
    });

    it('should support async middleware', async () => {
      manager.use({
        name: 'async-middleware',
        onRequest: async (ctx) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          ctx.metadata = { async: true };
          return ctx;
        },
      });

      const result = await manager.executeRequest('/test', { method: 'GET' });
      expect(result.metadata).toEqual({ async: true });
    });
  });

  describe('response middleware execution', () => {
    it('should execute response middleware', async () => {
      let executed = false;
      
      manager.use({
        name: 'test',
        onResponse: (ctx) => {
          executed = true;
          return ctx;
        },
      });

      await manager.executeResponse(
        '/test',
        { method: 'GET' },
        { data: {}, status: 200, statusText: 'OK', headers: {} },
        Date.now()
      );
      
      expect(executed).toBe(true);
    });

    it('should calculate duration correctly', async () => {
      const startTime = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 60));

      const result = await manager.executeResponse(
        '/test',
        { method: 'GET' },
        { data: {}, status: 200, statusText: 'OK', headers: {} },
        startTime
      );

      expect(result.duration).toBeGreaterThanOrEqual(55);
    });

    it('should allow middleware to modify response', async () => {
      manager.use({
        name: 'response-modifier',
        onResponse: (ctx) => {
          ctx.response.data = { modified: true };
          return ctx;
        },
      });

      const result = await manager.executeResponse(
        '/test',
        { method: 'GET' },
        { data: { original: true }, status: 200, statusText: 'OK', headers: {} },
        Date.now()
      );

      expect(result.response.data).toEqual({ modified: true });
    });

    it('should pass metadata from request to response', async () => {
      const result = await manager.executeResponse(
        '/test',
        { method: 'GET' },
        { data: {}, status: 200, statusText: 'OK', headers: {} },
        Date.now(),
        { requestId: '123' }
      );

      expect(result.metadata).toEqual({ requestId: '123' });
    });
  });

  describe('error middleware execution', () => {
    it('should execute error middleware', async () => {
      let executed = false;
      
      manager.use({
        name: 'test',
        onError: () => {
          executed = true;
        },
      });

      await manager.executeError(
        '/test',
        { method: 'GET' },
        new Error('Test error'),
        Date.now()
      );

      expect(executed).toBe(true);
    });

    it('should execute all error middlewares', async () => {
      const executions: string[] = [];

      manager
        .use({
          name: 'first',
          onError: () => {
            executions.push('first');
          },
        })
        .use({
          name: 'second',
          onError: () => {
            executions.push('second');
          },
        });

      await manager.executeError(
        '/test',
        { method: 'GET' },
        new Error('Test error'),
        Date.now()
      );

      expect(executions).toEqual(['first', 'second']);
    });

    it('should include error context', async () => {
      let capturedContext: any;

      manager.use({
        name: 'error-capturer',
        onError: (ctx) => {
          capturedContext = ctx;
        },
      });

      const error = new Error('Test error');
      const startTime = Date.now();

      await new Promise((resolve) => setTimeout(resolve, 10));
      await manager.executeError('/test', { method: 'GET' }, error, startTime);

      expect(capturedContext.error).toBe(error);
      expect(capturedContext.path).toBe('/test');
      expect(capturedContext.duration).toBeGreaterThanOrEqual(10);
    });
  });

  describe('middleware execution order', () => {
    it('should execute middlewares in registration order', async () => {
      const order: number[] = [];

      manager
        .use({
          name: 'first',
          onRequest: (ctx) => {
            order.push(1);
            return ctx;
          },
        })
        .use({
          name: 'second',
          onRequest: (ctx) => {
            order.push(2);
            return ctx;
          },
        })
        .use({
          name: 'third',
          onRequest: (ctx) => {
            order.push(3);
            return ctx;
          },
        });

      await manager.executeRequest('/test', { method: 'GET' });
      expect(order).toEqual([1, 2, 3]);
    });

    it('should execute all lifecycle hooks in order', async () => {
      const hooks: string[] = [];

      const middleware: Middleware = {
        name: 'lifecycle',
        onRequest: (ctx) => {
          hooks.push('request');
          return ctx;
        },
        onResponse: (ctx) => {
          hooks.push('response');
          return ctx;
        },
        onError: () => {
          hooks.push('error');
        },
      };

      manager.use(middleware);

      await manager.executeRequest('/test', { method: 'GET' });
      await manager.executeResponse(
        '/test',
        { method: 'GET' },
        { data: {}, status: 200, statusText: 'OK', headers: {} },
        Date.now()
      );
      await manager.executeError('/test', { method: 'GET' }, new Error(), Date.now());

      expect(hooks).toEqual(['request', 'response', 'error']);
    });
  });

  describe('edge cases', () => {
    it('should handle middleware with no hooks', async () => {
      manager.use({ name: 'empty' });

      const result = await manager.executeRequest('/test', { method: 'GET' });
      expect(result.path).toBe('/test');
    });

    it('should handle empty middleware list', async () => {
      const result = await manager.executeRequest('/test', { method: 'GET' });
      expect(result.path).toBe('/test');
      expect(result.options.method).toBe('GET');
    });

    it('should preserve timestamp in context', async () => {
      const result = await manager.executeRequest('/test', { method: 'GET' });
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.timestamp).toBeLessThanOrEqual(Date.now());
    });
  });
});
