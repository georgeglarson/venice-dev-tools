import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter } from './rate-limiter';
import { VeniceRateLimitError } from '../errors';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter(2, 10);
  });

  describe('constructor', () => {
    it('should use default values when not provided', () => {
      const limiter = new RateLimiter();
      expect(limiter).toBeDefined();
    });

    it('should accept custom configuration', () => {
      const limiter = new RateLimiter(5, 30);
      expect(limiter).toBeDefined();
    });
  });

  describe('concurrency limiting', () => {
    it('should allow requests up to max concurrent', async () => {
      const results: number[] = [];
      const fn1 = async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        results.push(1);
        return 1;
      };
      const fn2 = async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        results.push(2);
        return 2;
      };

      const promises = [rateLimiter.add(fn1), rateLimiter.add(fn2)];
      await Promise.all(promises);

      expect(results).toHaveLength(2);
      expect(results).toContain(1);
      expect(results).toContain(2);
    });

    it('should queue requests when at max concurrent', async () => {
      const executionOrder: number[] = [];

      const createTask = (id: number, delay: number) => async () => {
        executionOrder.push(id);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return id;
      };

      const promises = [
        rateLimiter.add(createTask(1, 100)),
        rateLimiter.add(createTask(2, 100)),
        rateLimiter.add(createTask(3, 10)),
      ];

      await Promise.all(promises);

      expect(executionOrder[0]).toBe(1);
      expect(executionOrder[1]).toBe(2);
      expect(executionOrder[2]).toBe(3);
    });

    it('should process queued requests after completion', async () => {
      const results: number[] = [];

      const createTask = (id: number) => async () => {
        results.push(id);
        await new Promise((resolve) => setTimeout(resolve, 50));
        return id;
      };

      await Promise.all([
        rateLimiter.add(createTask(1)),
        rateLimiter.add(createTask(2)),
        rateLimiter.add(createTask(3)),
        rateLimiter.add(createTask(4)),
      ]);

      expect(results).toHaveLength(4);
      expect(results).toContain(1);
      expect(results).toContain(2);
      expect(results).toContain(3);
      expect(results).toContain(4);
    });
  });

  describe('rate limiting', () => {
    it('should allow requests within rate limit', async () => {
      const results: number[] = [];

      for (let i = 0; i < 5; i++) {
        await rateLimiter.add(async () => {
          results.push(i);
          return i;
        });
      }

      expect(results).toHaveLength(5);
    });

    it('should throw error when exceeding requests per minute', async () => {
      const limiter = new RateLimiter(20, 3);

      const results: number[] = [];
      results.push(await limiter.add(async () => 1));
      results.push(await limiter.add(async () => 2));
      results.push(await limiter.add(async () => 3));

      expect(results).toEqual([1, 2, 3]);

      try {
        await limiter.add(async () => 4);
        expect.fail('Should have thrown VeniceRateLimitError');
      } catch (error: any) {
        expect(error.name).toBe('VeniceRateLimitError');
        expect(error.message).toContain('Rate limit exceeded');
      }
    });

    it('should reset rate limit after 60 seconds', async () => {
      const limiter = new RateLimiter(10, 2);

      vi.useFakeTimers();

      await limiter.add(async () => 1);
      await limiter.add(async () => 2);

      vi.advanceTimersByTime(61000);

      const result = await limiter.add(async () => 3);
      expect(result).toBe(3);

      vi.useRealTimers();
    });

    it('should count queued requests toward the rate limit window', async () => {
      const limiter = new RateLimiter(1, 2);

      const first = limiter.add(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return 1;
      });

      const second = limiter.add(async () => 2);

      await Promise.all([first, second]);

      await expect(
        limiter.add(async () => 3)
      ).rejects.toMatchObject({ name: 'VeniceRateLimitError' });
    });
  });

  describe('error handling', () => {
    it('should propagate errors from tasks', async () => {
      const error = new Error('Task failed');
      const failingTask = async () => {
        throw error;
      };

      await expect(rateLimiter.add(failingTask)).rejects.toThrow('Task failed');
    });

    it('should continue processing queue after task failure', async () => {
      const results: number[] = [];

      const task1 = async () => {
        throw new Error('Failed');
      };
      const task2 = async () => {
        results.push(2);
        return 2;
      };
      const task3 = async () => {
        results.push(3);
        return 3;
      };

      await expect(rateLimiter.add(task1)).rejects.toThrow();
      await rateLimiter.add(task2);
      await rateLimiter.add(task3);

      expect(results).toContain(2);
      expect(results).toContain(3);
    });
  });

  describe('return values', () => {
    it('should return task result', async () => {
      const result = await rateLimiter.add(async () => 'success');
      expect(result).toBe('success');
    });

    it('should preserve return types', async () => {
      const numberResult = await rateLimiter.add(async () => 42);
      const stringResult = await rateLimiter.add(async () => 'hello');
      const objectResult = await rateLimiter.add(async () => ({ key: 'value' }));

      expect(numberResult).toBe(42);
      expect(stringResult).toBe('hello');
      expect(objectResult).toEqual({ key: 'value' });
    });
  });
});
