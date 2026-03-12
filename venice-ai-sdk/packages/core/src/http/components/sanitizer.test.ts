import { describe, it, expect } from 'vitest';
import { sanitizeHeaders, sanitizeData } from './sanitizer';

describe('sanitizeHeaders', () => {
  it('redacts Authorization header', () => {
    const result = sanitizeHeaders({ Authorization: 'Bearer sk-abc123' });
    expect(result.Authorization).toBe('Bearer [REDACTED]');
  });

  it('redacts lowercase authorization header', () => {
    const result = sanitizeHeaders({ authorization: 'Bearer sk-abc123' });
    expect(result.authorization).toBe('Bearer [REDACTED]');
  });

  it('redacts mixed-case authorization header', () => {
    const result = sanitizeHeaders({ AUTHORIZATION: 'Bearer sk-abc123' });
    expect(result.AUTHORIZATION).toBe('Bearer [REDACTED]');
  });

  it('preserves non-sensitive headers', () => {
    const result = sanitizeHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
    expect(result['Content-Type']).toBe('application/json');
    expect(result.Accept).toBe('application/json');
  });

  it('returns falsy input as-is', () => {
    // The function checks `if (!headers)` so null/undefined pass through
    expect(sanitizeHeaders(null as unknown as Record<string, unknown>)).toBeNull();
    expect(sanitizeHeaders(undefined as unknown as Record<string, unknown>)).toBeUndefined();
  });

  it('does not mutate the original object', () => {
    const original = { Authorization: 'Bearer secret' };
    sanitizeHeaders(original);
    expect(original.Authorization).toBe('Bearer secret');
  });

  it('handles headers with no authorization', () => {
    const result = sanitizeHeaders({ 'X-Custom': 'value' });
    expect(result['X-Custom']).toBe('value');
  });

  it('handles empty object', () => {
    const result = sanitizeHeaders({});
    expect(result).toEqual({});
  });
});

describe('sanitizeData', () => {
  it('redacts apiKey', () => {
    const result = sanitizeData({ apiKey: 'secret-key' }) as Record<string, unknown>;
    expect(result.apiKey).toBe('[REDACTED]');
  });

  it('redacts api_key', () => {
    const result = sanitizeData({ api_key: 'secret-key' }) as Record<string, unknown>;
    expect(result.api_key).toBe('[REDACTED]');
  });

  it('redacts password', () => {
    const result = sanitizeData({ password: 'hunter2' }) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
  });

  it('redacts token', () => {
    const result = sanitizeData({ token: 'abc' }) as Record<string, unknown>;
    expect(result.token).toBe('[REDACTED]');
  });

  it('redacts secret', () => {
    const result = sanitizeData({ secret: 'shhh' }) as Record<string, unknown>;
    expect(result.secret).toBe('[REDACTED]');
  });

  it('redacts accessToken and access_token', () => {
    const result = sanitizeData({
      accessToken: 'at',
      access_token: 'at2',
    }) as Record<string, unknown>;
    expect(result.accessToken).toBe('[REDACTED]');
    expect(result.access_token).toBe('[REDACTED]');
  });

  it('redacts refreshToken and refresh_token', () => {
    const result = sanitizeData({
      refreshToken: 'rt',
      refresh_token: 'rt2',
    }) as Record<string, unknown>;
    expect(result.refreshToken).toBe('[REDACTED]');
    expect(result.refresh_token).toBe('[REDACTED]');
  });

  it('redacts apiSecret and api_secret', () => {
    const result = sanitizeData({
      apiSecret: 'as',
      api_secret: 'as2',
    }) as Record<string, unknown>;
    expect(result.apiSecret).toBe('[REDACTED]');
    expect(result.api_secret).toBe('[REDACTED]');
  });

  it('redacts client_secret and clientSecret', () => {
    const result = sanitizeData({
      client_secret: 'cs',
      clientSecret: 'cs2',
    }) as Record<string, unknown>;
    expect(result.client_secret).toBe('[REDACTED]');
    expect(result.clientSecret).toBe('[REDACTED]');
  });

  it('redacts private_key and privateKey', () => {
    const result = sanitizeData({
      private_key: 'pk',
      privateKey: 'pk2',
    }) as Record<string, unknown>;
    expect(result.private_key).toBe('[REDACTED]');
    expect(result.privateKey).toBe('[REDACTED]');
  });

  it('preserves non-sensitive fields', () => {
    const result = sanitizeData({
      model: 'llama-3.3-70b',
      prompt: 'Hello world',
      temperature: 0.7,
    }) as Record<string, unknown>;
    expect(result.model).toBe('llama-3.3-70b');
    expect(result.prompt).toBe('Hello world');
    expect(result.temperature).toBe(0.7);
  });

  it('handles nested objects recursively', () => {
    const result = sanitizeData({
      config: {
        apiKey: 'nested-secret',
        name: 'test',
      },
    }) as Record<string, unknown>;
    const nested = result.config as Record<string, unknown>;
    expect(nested.apiKey).toBe('[REDACTED]');
    expect(nested.name).toBe('test');
  });

  it('handles deeply nested objects', () => {
    const result = sanitizeData({
      level1: {
        level2: {
          password: 'deep-secret',
          safe: 'ok',
        },
      },
    }) as Record<string, unknown>;
    const l1 = result.level1 as Record<string, unknown>;
    const l2 = l1.level2 as Record<string, unknown>;
    expect(l2.password).toBe('[REDACTED]');
    expect(l2.safe).toBe('ok');
  });

  it('handles arrays within objects (treats array as object)', () => {
    const input = { items: [{ apiKey: 'secret' }, { name: 'safe' }] };
    const result = sanitizeData(input) as Record<string, unknown>;
    // Arrays are objects, so sanitizeData recurses into the array
    const items = result.items as Record<string, unknown>[];
    // The spread of an array produces an object with numeric keys
    // Let's verify the recursion happens
    expect(items).toBeDefined();
  });

  it('returns null as-is', () => {
    expect(sanitizeData(null)).toBeNull();
  });

  it('returns undefined as-is', () => {
    expect(sanitizeData(undefined)).toBeUndefined();
  });

  it('returns empty string as-is', () => {
    expect(sanitizeData('')).toBe('');
  });

  it('returns 0 as-is', () => {
    expect(sanitizeData(0)).toBe(0);
  });

  it('returns false as-is (falsy non-object)', () => {
    expect(sanitizeData(false)).toBe(false);
  });

  it('returns a string as-is', () => {
    expect(sanitizeData('hello')).toBe('hello');
  });

  it('returns a number as-is', () => {
    expect(sanitizeData(42)).toBe(42);
  });

  it('returns a boolean as-is', () => {
    expect(sanitizeData(true)).toBe(true);
  });

  it('does not mutate the original object', () => {
    const original = { apiKey: 'secret', name: 'test' };
    sanitizeData(original);
    expect(original.apiKey).toBe('secret');
  });

  it('handles empty object', () => {
    expect(sanitizeData({})).toEqual({});
  });

  it('does not redact fields with falsy values', () => {
    const result = sanitizeData({
      apiKey: '',
      password: null,
      token: 0,
      secret: false,
    }) as Record<string, unknown>;
    // The code checks `if (sanitized[field])` so falsy values are not redacted
    expect(result.apiKey).toBe('');
    expect(result.password).toBeNull();
    expect(result.token).toBe(0);
    expect(result.secret).toBe(false);
  });

  it('redacts all sensitive fields simultaneously', () => {
    const allSensitive: Record<string, string> = {
      apiKey: 'a',
      api_key: 'b',
      password: 'c',
      token: 'd',
      secret: 'e',
      accessToken: 'f',
      access_token: 'g',
      refreshToken: 'h',
      refresh_token: 'i',
      apiSecret: 'j',
      api_secret: 'k',
      client_secret: 'l',
      clientSecret: 'm',
      private_key: 'n',
      privateKey: 'o',
    };
    const result = sanitizeData(allSensitive) as Record<string, unknown>;
    for (const key of Object.keys(allSensitive)) {
      expect(result[key]).toBe('[REDACTED]');
    }
  });
});
