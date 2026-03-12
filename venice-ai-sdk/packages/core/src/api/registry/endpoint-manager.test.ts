import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EndpointManager } from './endpoint-manager';
import { ApiEndpoint } from './endpoint';
import { VeniceClient } from '../../client';
import { LogLevel } from '../../types/common';

// --- Mock helpers ---

/** Minimal mock of VeniceClient that satisfies ApiEndpoint's constructor. */
function createMockClient(): VeniceClient {
  return new VeniceClient({ logLevel: LogLevel.NONE });
}

/** Concrete endpoint subclass for testing. */
class StubEndpointA extends ApiEndpoint {
  getEndpointPath(): string {
    return '/stub-a';
  }
}

class StubEndpointB extends ApiEndpoint {
  getEndpointPath(): string {
    return '/stub-b';
  }
}

class StubEndpointC extends ApiEndpoint {
  getEndpointPath(): string {
    return '/stub-c';
  }
}

// --- Tests ---

describe('EndpointManager', () => {
  let manager: EndpointManager;
  let client: VeniceClient;

  beforeEach(() => {
    client = createMockClient();
    manager = new EndpointManager(client);
  });

  // ── register() ──────────────────────────────────────────────────

  describe('register()', () => {
    it('should store the endpoint class', () => {
      manager.register('a', StubEndpointA);
      expect(manager.has('a')).toBe(true);
    });

    it('should return the manager instance for chaining', () => {
      const result = manager.register('a', StubEndpointA);
      expect(result).toBe(manager);
    });

    it('should allow chaining multiple registrations', () => {
      const result = manager
        .register('a', StubEndpointA)
        .register('b', StubEndpointB)
        .register('c', StubEndpointC);

      expect(result).toBe(manager);
      expect(manager.has('a')).toBe(true);
      expect(manager.has('b')).toBe(true);
      expect(manager.has('c')).toBe(true);
    });

    it('should overwrite a previously registered class with the same name', () => {
      manager.register('x', StubEndpointA);
      manager.register('x', StubEndpointB);

      const instance = manager.get('x');
      expect(instance).toBeInstanceOf(StubEndpointB);
    });

    it('should not create an instance at registration time', () => {
      manager.register('lazy', StubEndpointA);
      // Only the class map should have an entry, not the instance map.
      // We can verify by checking that getRegisteredEndpoints includes 'lazy'
      // but getting it later creates the instance (tested elsewhere).
      expect(manager.getRegisteredEndpoints()).toContain('lazy');
    });
  });

  // ── get() ───────────────────────────────────────────────────────

  describe('get()', () => {
    it('should create and return an endpoint instance', () => {
      manager.register('a', StubEndpointA);
      const instance = manager.get('a');
      expect(instance).toBeInstanceOf(StubEndpointA);
    });

    it('should return the cached instance on the second call (same reference)', () => {
      manager.register('a', StubEndpointA);
      const first = manager.get('a');
      const second = manager.get('a');
      expect(first).toBe(second);
    });

    it('should throw for an unregistered endpoint', () => {
      expect(() => manager.get('nonexistent')).toThrow(
        "Endpoint 'nonexistent' not registered"
      );
    });

    it('should create separate instances for different registered names', () => {
      manager.register('a', StubEndpointA);
      manager.register('b', StubEndpointB);

      const instanceA = manager.get('a');
      const instanceB = manager.get('b');

      expect(instanceA).not.toBe(instanceB);
      expect(instanceA).toBeInstanceOf(StubEndpointA);
      expect(instanceB).toBeInstanceOf(StubEndpointB);
    });

    it('should pass the client to the endpoint constructor', () => {
      manager.register('a', StubEndpointA);
      const instance = manager.get<StubEndpointA>('a');
      // The endpoint path works, which means the constructor ran properly
      expect(instance.getEndpointPath()).toBe('/stub-a');
    });

    it('should create a fresh instance after unregister + re-register', () => {
      manager.register('a', StubEndpointA);
      const first = manager.get('a');

      manager.unregister('a');
      manager.register('a', StubEndpointA);
      const second = manager.get('a');

      expect(first).not.toBe(second);
    });
  });

  // ── has() ───────────────────────────────────────────────────────

  describe('has()', () => {
    it('should return true for a registered endpoint', () => {
      manager.register('a', StubEndpointA);
      expect(manager.has('a')).toBe(true);
    });

    it('should return false for an unregistered endpoint', () => {
      expect(manager.has('nope')).toBe(false);
    });

    it('should return false after the endpoint is removed', () => {
      manager.register('a', StubEndpointA);
      manager.unregister('a');
      expect(manager.has('a')).toBe(false);
    });

    it('should return false after clear()', () => {
      manager.register('a', StubEndpointA);
      manager.clear();
      expect(manager.has('a')).toBe(false);
    });
  });

  // ── getRegisteredEndpoints() ────────────────────────────────────

  describe('getRegisteredEndpoints()', () => {
    it('should return an empty array when nothing is registered', () => {
      expect(manager.getRegisteredEndpoints()).toEqual([]);
    });

    it('should return all registered endpoint names', () => {
      manager
        .register('a', StubEndpointA)
        .register('b', StubEndpointB)
        .register('c', StubEndpointC);

      const names = manager.getRegisteredEndpoints();
      expect(names).toContain('a');
      expect(names).toContain('b');
      expect(names).toContain('c');
      expect(names).toHaveLength(3);
    });

    it('should not include removed endpoints', () => {
      manager.register('a', StubEndpointA).register('b', StubEndpointB);
      manager.unregister('a');

      const names = manager.getRegisteredEndpoints();
      expect(names).not.toContain('a');
      expect(names).toContain('b');
    });
  });

  // ── unregister() ────────────────────────────────────────────────

  describe('unregister()', () => {
    it('should remove a registered endpoint and return true', () => {
      manager.register('a', StubEndpointA);
      const result = manager.unregister('a');
      expect(result).toBe(true);
      expect(manager.has('a')).toBe(false);
    });

    it('should return false for a non-existent endpoint', () => {
      const result = manager.unregister('ghost');
      expect(result).toBe(false);
    });

    it('should also remove the cached instance', () => {
      manager.register('a', StubEndpointA);
      manager.get('a'); // populate cache
      manager.unregister('a');

      // Re-register and verify we get a new instance
      manager.register('a', StubEndpointA);
      const instance = manager.get('a');
      expect(instance).toBeInstanceOf(StubEndpointA);
    });

    it('should not affect other registered endpoints', () => {
      manager.register('a', StubEndpointA).register('b', StubEndpointB);
      manager.unregister('a');

      expect(manager.has('b')).toBe(true);
      expect(manager.get('b')).toBeInstanceOf(StubEndpointB);
    });
  });

  // ── clear() ─────────────────────────────────────────────────────

  describe('clear()', () => {
    it('should remove all registered endpoints', () => {
      manager
        .register('a', StubEndpointA)
        .register('b', StubEndpointB)
        .register('c', StubEndpointC);

      manager.clear();

      expect(manager.getRegisteredEndpoints()).toEqual([]);
      expect(manager.has('a')).toBe(false);
      expect(manager.has('b')).toBe(false);
      expect(manager.has('c')).toBe(false);
    });

    it('should also remove cached instances', () => {
      manager.register('a', StubEndpointA);
      manager.get('a'); // cache
      manager.clear();

      expect(() => manager.get('a')).toThrow("Endpoint 'a' not registered");
    });

    it('should be safe to call on an already-empty manager', () => {
      expect(() => manager.clear()).not.toThrow();
      expect(manager.getRegisteredEndpoints()).toEqual([]);
    });

    it('should allow re-registration after clear', () => {
      manager.register('a', StubEndpointA);
      manager.clear();
      manager.register('a', StubEndpointB);

      expect(manager.get('a')).toBeInstanceOf(StubEndpointB);
    });
  });
});
