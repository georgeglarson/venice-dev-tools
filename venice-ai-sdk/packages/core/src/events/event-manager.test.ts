import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventManager } from './event-manager';

describe('EventManager', () => {
  let em: EventManager;

  beforeEach(() => {
    em = new EventManager();
  });

  describe('on', () => {
    it('subscribes to an event and receives emitted data', () => {
      const listener = vi.fn();
      em.on('test', listener);
      em.emit('test', 'hello');
      expect(listener).toHaveBeenCalledWith('hello');
    });

    it('returns this for chaining', () => {
      const result = em.on('test', () => {});
      expect(result).toBe(em);
    });

    it('fires listener on every emission', () => {
      const listener = vi.fn();
      em.on('test', listener);
      em.emit('test');
      em.emit('test');
      em.emit('test');
      expect(listener).toHaveBeenCalledTimes(3);
    });
  });

  describe('once', () => {
    it('fires listener only once', () => {
      const listener = vi.fn();
      em.once('test', listener);
      em.emit('test', 'a');
      em.emit('test', 'b');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('a');
    });

    it('returns this for chaining', () => {
      const result = em.once('test', () => {});
      expect(result).toBe(em);
    });
  });

  describe('off', () => {
    it('removes a specific listener', () => {
      const listener = vi.fn();
      em.on('test', listener);
      em.off('test', listener);
      em.emit('test');
      expect(listener).not.toHaveBeenCalled();
    });

    it('does not remove other listeners on the same event', () => {
      const listenerA = vi.fn();
      const listenerB = vi.fn();
      em.on('test', listenerA);
      em.on('test', listenerB);
      em.off('test', listenerA);
      em.emit('test');
      expect(listenerA).not.toHaveBeenCalled();
      expect(listenerB).toHaveBeenCalledTimes(1);
    });

    it('returns this for chaining', () => {
      const listener = () => {};
      em.on('test', listener);
      const result = em.off('test', listener);
      expect(result).toBe(em);
    });
  });

  describe('emit', () => {
    it('returns true when there are listeners', () => {
      em.on('test', () => {});
      expect(em.emit('test')).toBe(true);
    });

    it('returns false when there are no listeners', () => {
      expect(em.emit('no-listeners')).toBe(false);
    });

    it('passes multiple arguments to listeners', () => {
      const listener = vi.fn();
      em.on('test', listener);
      em.emit('test', 'arg1', 42, { key: 'val' });
      expect(listener).toHaveBeenCalledWith('arg1', 42, { key: 'val' });
    });

    it('emits to all listeners on the same event', () => {
      const listenerA = vi.fn();
      const listenerB = vi.fn();
      const listenerC = vi.fn();
      em.on('test', listenerA);
      em.on('test', listenerB);
      em.on('test', listenerC);
      em.emit('test', 'data');
      expect(listenerA).toHaveBeenCalledWith('data');
      expect(listenerB).toHaveBeenCalledWith('data');
      expect(listenerC).toHaveBeenCalledWith('data');
    });

    it('does not trigger listeners for different events', () => {
      const listener = vi.fn();
      em.on('eventA', listener);
      em.emit('eventB');
      expect(listener).not.toHaveBeenCalled();
    });

    it('works with no arguments', () => {
      const listener = vi.fn();
      em.on('test', listener);
      em.emit('test');
      expect(listener).toHaveBeenCalledWith();
    });
  });

  describe('removeAllListeners', () => {
    it('removes all listeners for a specific event', () => {
      const listenerA = vi.fn();
      const listenerB = vi.fn();
      em.on('test', listenerA);
      em.on('test', listenerB);
      em.removeAllListeners('test');
      em.emit('test');
      expect(listenerA).not.toHaveBeenCalled();
      expect(listenerB).not.toHaveBeenCalled();
    });

    it('does not affect listeners for other events', () => {
      const listenerA = vi.fn();
      const listenerB = vi.fn();
      em.on('eventA', listenerA);
      em.on('eventB', listenerB);
      em.removeAllListeners('eventA');
      em.emit('eventB');
      expect(listenerB).toHaveBeenCalledTimes(1);
    });

    it('removes all listeners when no event is specified', () => {
      const listenerA = vi.fn();
      const listenerB = vi.fn();
      em.on('eventA', listenerA);
      em.on('eventB', listenerB);
      em.removeAllListeners();
      em.emit('eventA');
      em.emit('eventB');
      expect(listenerA).not.toHaveBeenCalled();
      expect(listenerB).not.toHaveBeenCalled();
    });

    it('returns this for chaining', () => {
      const result = em.removeAllListeners('test');
      expect(result).toBe(em);
    });
  });

  describe('listenerCount', () => {
    it('returns 0 when no listeners are registered', () => {
      expect(em.listenerCount('test')).toBe(0);
    });

    it('returns the correct count after adding listeners', () => {
      em.on('test', () => {});
      em.on('test', () => {});
      em.on('test', () => {});
      expect(em.listenerCount('test')).toBe(3);
    });

    it('decrements after removing a listener', () => {
      const listener = () => {};
      em.on('test', listener);
      em.on('test', () => {});
      expect(em.listenerCount('test')).toBe(2);
      em.off('test', listener);
      expect(em.listenerCount('test')).toBe(1);
    });

    it('counts once listeners', () => {
      em.once('test', () => {});
      expect(em.listenerCount('test')).toBe(1);
    });

    it('decrements after once listener fires', () => {
      em.once('test', () => {});
      em.emit('test');
      expect(em.listenerCount('test')).toBe(0);
    });

    it('returns 0 after removeAllListeners', () => {
      em.on('test', () => {});
      em.on('test', () => {});
      em.removeAllListeners('test');
      expect(em.listenerCount('test')).toBe(0);
    });
  });

  describe('chaining', () => {
    it('supports method chaining across all chainable methods', () => {
      const listener = vi.fn();
      const result = em
        .on('a', listener)
        .once('b', () => {})
        .off('b', () => {})
        .removeAllListeners('b')
        .on('c', () => {});

      expect(result).toBe(em);
    });
  });
});
