import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { ErrorFactory } from './error-factory';
import { VeniceError } from '../types/base-error';
import { VeniceApiError } from '../types/api-error';
import { VeniceAuthError } from '../types/auth-error';
import { VenicePaymentRequiredError } from '../types/payment-required-error';
import { VeniceRateLimitError } from '../types/rate-limit-error';
import { VeniceCapacityError } from '../types/capacity-error';
import { VeniceNetworkError } from '../types/network-error';
import { VeniceTimeoutError } from '../types/timeout-error';
import { VeniceValidationError } from '../types/validation-error';
import { VeniceStreamError } from '../types/stream-error';

describe('ErrorFactory', () => {
  const factory = new ErrorFactory();

  describe('createFromResponse', () => {
    it('returns VeniceAuthError for 401', () => {
      const err = factory.createFromResponse(401, 'Unauthorized');
      expect(err).toBeInstanceOf(VeniceAuthError);
      expect(err.message).toBe('Unauthorized');
    });

    it('returns VenicePaymentRequiredError for 402', () => {
      const err = factory.createFromResponse(402, 'Payment required');
      expect(err).toBeInstanceOf(VenicePaymentRequiredError);
      expect(err.message).toBe('Payment required');
    });

    it('returns VeniceRateLimitError for 429', () => {
      const err = factory.createFromResponse(429, 'Too many requests');
      expect(err).toBeInstanceOf(VeniceRateLimitError);
      expect(err.message).toBe('Too many requests');
    });

    it('returns VeniceCapacityError for 503', () => {
      const err = factory.createFromResponse(503, 'At capacity');
      expect(err).toBeInstanceOf(VeniceCapacityError);
      expect(err.message).toBe('At capacity');
    });

    it('returns VeniceApiError for 400', () => {
      const err = factory.createFromResponse(400, 'Bad request');
      expect(err).toBeInstanceOf(VeniceApiError);
      expect((err as VeniceApiError).status).toBe(400);
    });

    it('returns VeniceApiError for 403', () => {
      const err = factory.createFromResponse(403, 'Forbidden');
      expect(err).toBeInstanceOf(VeniceApiError);
      expect((err as VeniceApiError).status).toBe(403);
    });

    it('returns VeniceApiError for 404', () => {
      const err = factory.createFromResponse(404, 'Not found');
      expect(err).toBeInstanceOf(VeniceApiError);
      expect((err as VeniceApiError).status).toBe(404);
    });

    it('returns VeniceApiError for 500', () => {
      const err = factory.createFromResponse(500, 'Server error');
      expect(err).toBeInstanceOf(VeniceApiError);
      expect((err as VeniceApiError).status).toBe(500);
    });

    it('passes details to VeniceApiError for unknown status codes', () => {
      const details = { extra: 'info' };
      const err = factory.createFromResponse(418, 'I am a teapot', details);
      expect(err).toBeInstanceOf(VeniceApiError);
      expect((err as VeniceApiError).details).toEqual(details);
    });
  });

  describe('createFromAxiosError', () => {
    function makeAxiosError(opts: {
      response?: { status: number; data: unknown };
      request?: boolean;
      code?: string;
      message?: string;
    }): AxiosError {
      const error = new AxiosError(
        opts.message || 'Axios error',
        opts.code,
        undefined,
        opts.request ? {} : undefined,
        opts.response
          ? {
              status: opts.response.status,
              data: opts.response.data,
              statusText: 'Error',
              headers: {},
              config: { headers: new AxiosHeaders() },
            }
          : undefined
      );
      if (opts.request && !opts.response) {
        error.request = {};
      }
      return error;
    }

    it('creates error from response with status 401', () => {
      const err = factory.createFromAxiosError(
        makeAxiosError({ response: { status: 401, data: { error: 'Invalid key' } } })
      );
      expect(err).toBeInstanceOf(VeniceAuthError);
      expect(err.message).toBe('Invalid key');
    });

    it('creates error from response with status 429', () => {
      const err = factory.createFromAxiosError(
        makeAxiosError({ response: { status: 429, data: { error: 'Slow down' } } })
      );
      expect(err).toBeInstanceOf(VeniceRateLimitError);
    });

    it('uses fallback message when response data has no error field', () => {
      const err = factory.createFromAxiosError(
        makeAxiosError({ response: { status: 500, data: {} } })
      );
      expect(err.message).toBe('API request failed');
    });

    it('handles null response data', () => {
      const err = factory.createFromAxiosError(
        makeAxiosError({ response: { status: 500, data: null } })
      );
      expect(err.message).toBe('API request failed');
    });

    it('passes details from response data', () => {
      const err = factory.createFromAxiosError(
        makeAxiosError({
          response: {
            status: 400,
            data: { error: 'Bad', details: { field: 'name' } },
          },
        })
      );
      expect(err).toBeInstanceOf(VeniceApiError);
      expect((err as VeniceApiError).details).toEqual({ field: 'name' });
    });

    it('creates VeniceTimeoutError for ECONNABORTED with request but no response', () => {
      const err = factory.createFromAxiosError(
        makeAxiosError({ request: true, code: 'ECONNABORTED' })
      );
      expect(err).toBeInstanceOf(VeniceTimeoutError);
      expect(err.message).toBe('Request timed out');
    });

    it('creates VeniceNetworkError for request with no response (non-timeout)', () => {
      const err = factory.createFromAxiosError(
        makeAxiosError({ request: true, code: 'ECONNREFUSED' })
      );
      expect(err).toBeInstanceOf(VeniceNetworkError);
      expect(err.message).toBe('Network error');
    });

    it('creates VeniceError for setup errors (no request, no response)', () => {
      const axErr = new AxiosError('Config problem');
      const err = factory.createFromAxiosError(axErr);
      expect(err).toBeInstanceOf(VeniceError);
      expect(err.message).toBe('Config problem');
    });

    it('uses fallback message for setup errors with no message', () => {
      const axErr = new AxiosError('');
      const err = factory.createFromAxiosError(axErr);
      expect(err.message).toBe('Request setup error');
    });
  });

  describe('createFromFetchResponse', () => {
    it('creates error from JSON response body', async () => {
      const response = new Response(
        JSON.stringify({ error: 'Unauthorized', details: { reason: 'expired' } }),
        { status: 401 }
      );
      const err = await factory.createFromFetchResponse(response);
      expect(err).toBeInstanceOf(VeniceAuthError);
      expect(err.message).toBe('Unauthorized');
    });

    it('uses fallback message when JSON has no error field', async () => {
      const response = new Response(JSON.stringify({}), { status: 500 });
      const err = await factory.createFromFetchResponse(response);
      expect(err.message).toBe('API request failed');
    });

    it('falls back when response body is not JSON', async () => {
      const response = new Response('not json', { status: 404 });
      // json() will fail, then the catch inside createFromFetchResponse handles it
      const err = await factory.createFromFetchResponse(response);
      // The inner .catch returns { error: 'HTTP error 404' }, so this goes through createFromResponse
      expect(err).toBeInstanceOf(VeniceApiError);
      expect(err.message).toContain('404');
    });

    it('handles 503 status', async () => {
      const response = new Response(JSON.stringify({ error: 'Overloaded' }), { status: 503 });
      const err = await factory.createFromFetchResponse(response);
      expect(err).toBeInstanceOf(VeniceCapacityError);
    });
  });

  describe('createFromStreamError', () => {
    it('returns the same VeniceError if already a VeniceError', () => {
      const original = new VeniceAuthError('already venice');
      const err = factory.createFromStreamError(original);
      expect(err).toBe(original);
    });

    it('creates VeniceError for AbortError', () => {
      const abortErr = new Error('The operation was aborted');
      abortErr.name = 'AbortError';
      const err = factory.createFromStreamError(abortErr);
      expect(err).toBeInstanceOf(VeniceError);
      expect(err.message).toBe('Request was aborted');
      expect(err.cause).toBe(abortErr);
    });

    it('creates VeniceStreamError for generic errors', () => {
      const err = factory.createFromStreamError(new Error('stream broke'));
      expect(err).toBeInstanceOf(VeniceStreamError);
      expect(err.message).toBe('Stream request failed');
    });

    it('creates VeniceStreamError for non-Error values', () => {
      const err = factory.createFromStreamError('string error');
      expect(err).toBeInstanceOf(VeniceStreamError);
      expect(err.message).toBe('Stream request failed');
    });

    it('creates VeniceStreamError for null', () => {
      const err = factory.createFromStreamError(null);
      expect(err).toBeInstanceOf(VeniceStreamError);
    });
  });

  describe('createValidationError', () => {
    it('creates a VeniceValidationError', () => {
      const err = factory.createValidationError('Invalid param');
      expect(err).toBeInstanceOf(VeniceValidationError);
      expect(err.message).toBe('Invalid param');
    });

    it('passes details', () => {
      const details = { field: 'model', reason: 'required' };
      const err = factory.createValidationError('Bad input', details);
      expect(err.details).toEqual(details);
    });
  });

  describe('createFromError', () => {
    it('returns the same VeniceError if already a VeniceError', () => {
      const original = new VeniceApiError('test', 400);
      const err = factory.createFromError(original);
      expect(err).toBe(original);
    });

    it('wraps a generic Error', () => {
      const generic = new Error('something');
      const err = factory.createFromError(generic);
      expect(err).toBeInstanceOf(VeniceError);
      expect(err.message).toBe('something');
      expect(err.cause).toBe(generic);
    });

    it('wraps a string', () => {
      const err = factory.createFromError('oops');
      expect(err).toBeInstanceOf(VeniceError);
      expect(err.message).toBe('oops');
    });

    it('wraps a number', () => {
      const err = factory.createFromError(42);
      expect(err).toBeInstanceOf(VeniceError);
      expect(err.message).toBe('42');
    });

    it('wraps null', () => {
      const err = factory.createFromError(null);
      expect(err).toBeInstanceOf(VeniceError);
      expect(err.message).toBe('null');
    });

    it('wraps undefined', () => {
      const err = factory.createFromError(undefined);
      expect(err).toBeInstanceOf(VeniceError);
      expect(err.message).toBe('undefined');
    });
  });
});
