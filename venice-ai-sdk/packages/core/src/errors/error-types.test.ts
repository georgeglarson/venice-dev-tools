import { describe, it, expect } from 'vitest';
import { VeniceError } from './types/base-error';
import { VeniceApiError } from './types/api-error';
import { VeniceAuthError } from './types/auth-error';
import { VeniceRateLimitError } from './types/rate-limit-error';
import { VeniceNetworkError } from './types/network-error';
import { VeniceTimeoutError } from './types/timeout-error';
import { VeniceValidationError } from './types/validation-error';
import { VeniceStreamError } from './types/stream-error';
import { VeniceCapacityError } from './types/capacity-error';
import { VenicePaymentRequiredError } from './types/payment-required-error';
import { VenicePermissionError } from './types/permission-error';
import { VeniceModelNotFoundError } from './types/model-not-found-error';

describe('VeniceError (base)', () => {
  it('sets message', () => {
    const err = new VeniceError('something broke');
    expect(err.message).toBe('something broke');
  });

  it('sets name to VeniceError', () => {
    const err = new VeniceError('msg');
    expect(err.name).toBe('VeniceError');
  });

  it('is instanceof Error and VeniceError', () => {
    const err = new VeniceError('msg');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(VeniceError);
  });

  it('defaults code to VENICE_ERROR', () => {
    const err = new VeniceError('msg');
    expect(err.code).toBe('VENICE_ERROR');
  });

  it('accepts custom code via options', () => {
    const err = new VeniceError('msg', { code: 'CUSTOM' });
    expect(err.code).toBe('CUSTOM');
  });

  it('adds default recovery hint when none provided', () => {
    const err = new VeniceError('msg');
    expect(err.recoveryHints).toHaveLength(1);
    expect(err.recoveryHints[0].action).toBe('check_logs');
  });

  it('uses provided recovery hints instead of default', () => {
    const hints = [{ action: 'do_thing', description: 'Do the thing' }];
    const err = new VeniceError('msg', { recoveryHints: hints });
    expect(err.recoveryHints).toEqual(hints);
  });

  it('stores context', () => {
    const ctx = { foo: 'bar' };
    const err = new VeniceError('msg', { context: ctx });
    expect(err.context).toEqual(ctx);
  });

  it('stores cause', () => {
    const cause = new Error('root cause');
    const err = new VeniceError('msg', { cause });
    expect(err.cause).toBe(cause);
  });

  it('has a stack trace', () => {
    const err = new VeniceError('msg');
    expect(err.stack).toBeDefined();
  });

  describe('toJSON', () => {
    it('returns a JSON representation', () => {
      const err = new VeniceError('msg', { code: 'TEST', context: { x: 1 } });
      const json = err.toJSON() as Record<string, unknown>;
      expect(json.name).toBe('VeniceError');
      expect(json.message).toBe('msg');
      expect(json.code).toBe('TEST');
      expect(json.context).toEqual({ x: 1 });
      expect(json.stack).toBeDefined();
      expect(json.recoveryHints).toBeDefined();
    });
  });
});

describe('VeniceApiError', () => {
  it('sets message, status, and name', () => {
    const err = new VeniceApiError('bad request', 400);
    expect(err.message).toBe('bad request');
    expect(err.status).toBe(400);
    expect(err.name).toBe('VeniceApiError');
  });

  it('is instanceof VeniceError, VeniceApiError, and Error', () => {
    const err = new VeniceApiError('err', 500);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(VeniceError);
    expect(err).toBeInstanceOf(VeniceApiError);
  });

  it('sets code based on status', () => {
    const err = new VeniceApiError('err', 404);
    expect(err.code).toBe('API_ERROR_404');
  });

  it('stores details', () => {
    const details = { field: 'name', issue: 'required' };
    const err = new VeniceApiError('err', 400, details);
    expect(err.details).toEqual(details);
  });

  it('includes context with status, details, and timestamp', () => {
    const err = new VeniceApiError('err', 500, { info: 'test' });
    expect(err.context).toBeDefined();
    expect(err.context!.status).toBe(500);
    expect(err.context!.details).toEqual({ info: 'test' });
    expect(err.context!.timestamp).toBeDefined();
  });

  it('adds retry recovery hint for 5xx errors', () => {
    const err = new VeniceApiError('server error', 500);
    const retryHint = err.recoveryHints.find(h => h.action === 'retry_request');
    expect(retryHint).toBeDefined();
    expect(retryHint!.automated).toBe(true);
  });

  it('does not add retry recovery hint for 4xx errors', () => {
    const err = new VeniceApiError('client error', 400);
    const retryHint = err.recoveryHints.find(h => h.action === 'retry_request');
    expect(retryHint).toBeUndefined();
  });
});

describe('VeniceAuthError', () => {
  it('sets default message', () => {
    const err = new VeniceAuthError();
    expect(err.message).toBe('Authentication failed');
  });

  it('sets custom message', () => {
    const err = new VeniceAuthError('Invalid token');
    expect(err.message).toBe('Invalid token');
  });

  it('has name VeniceAuthError', () => {
    const err = new VeniceAuthError();
    expect(err.name).toBe('VeniceAuthError');
  });

  it('has status 401', () => {
    const err = new VeniceAuthError();
    expect(err.status).toBe(401);
  });

  it('has code AUTH_ERROR', () => {
    const err = new VeniceAuthError();
    expect(err.code).toBe('AUTH_ERROR');
  });

  it('is instanceof VeniceApiError and VeniceError', () => {
    const err = new VeniceAuthError();
    expect(err).toBeInstanceOf(VeniceApiError);
    expect(err).toBeInstanceOf(VeniceError);
    expect(err).toBeInstanceOf(VeniceAuthError);
  });

  it('has auth-specific recovery hints', () => {
    const err = new VeniceAuthError();
    const actions = err.recoveryHints.map(h => h.action);
    expect(actions).toContain('check_api_key');
    expect(actions).toContain('get_new_key');
    expect(actions).toContain('check_env_vars');
  });
});

describe('VeniceRateLimitError', () => {
  it('sets default message', () => {
    const err = new VeniceRateLimitError();
    expect(err.message).toBe('Rate limit exceeded');
  });

  it('sets custom message', () => {
    const err = new VeniceRateLimitError('Too fast');
    expect(err.message).toBe('Too fast');
  });

  it('has name VeniceRateLimitError', () => {
    const err = new VeniceRateLimitError();
    expect(err.name).toBe('VeniceRateLimitError');
  });

  it('has status 429', () => {
    const err = new VeniceRateLimitError();
    expect(err.status).toBe(429);
  });

  it('has code RATE_LIMIT_EXCEEDED', () => {
    const err = new VeniceRateLimitError();
    expect(err.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('stores retryAfter', () => {
    const err = new VeniceRateLimitError('msg', 30);
    expect(err.retryAfter).toBe(30);
  });

  it('retryAfter is undefined when not provided', () => {
    const err = new VeniceRateLimitError();
    expect(err.retryAfter).toBeUndefined();
  });

  it('includes retryAfter in context', () => {
    const err = new VeniceRateLimitError('msg', 60);
    expect(err.context).toEqual({ retryAfter: 60 });
  });

  it('is instanceof VeniceApiError and VeniceRateLimitError', () => {
    const err = new VeniceRateLimitError();
    expect(err).toBeInstanceOf(VeniceApiError);
    expect(err).toBeInstanceOf(VeniceRateLimitError);
  });

  it('has rate-limit-specific recovery hints', () => {
    const err = new VeniceRateLimitError();
    const actions = err.recoveryHints.map(h => h.action);
    expect(actions).toContain('wait_and_retry');
    expect(actions).toContain('implement_backoff');
  });

  it('includes retryAfter in wait_and_retry hint description', () => {
    const err = new VeniceRateLimitError('msg', 30);
    const hint = err.recoveryHints.find(h => h.action === 'wait_and_retry');
    expect(hint!.description).toContain('30');
  });
});

describe('VeniceNetworkError', () => {
  it('sets default message', () => {
    const err = new VeniceNetworkError();
    expect(err.message).toBe('Network error occurred');
  });

  it('sets custom message', () => {
    const err = new VeniceNetworkError('Connection refused');
    expect(err.message).toBe('Connection refused');
  });

  it('has name VeniceNetworkError and code NETWORK_ERROR', () => {
    const err = new VeniceNetworkError();
    expect(err.name).toBe('VeniceNetworkError');
    expect(err.code).toBe('NETWORK_ERROR');
  });

  it('is instanceof VeniceError and VeniceNetworkError', () => {
    const err = new VeniceNetworkError();
    expect(err).toBeInstanceOf(VeniceError);
    expect(err).toBeInstanceOf(VeniceNetworkError);
  });

  it('accepts options with cause', () => {
    const cause = new Error('underlying');
    const err = new VeniceNetworkError('msg', { cause });
    expect(err.cause).toBe(cause);
  });

  it('has network-specific recovery hints', () => {
    const err = new VeniceNetworkError();
    const actions = err.recoveryHints.map(h => h.action);
    expect(actions).toContain('check_connection');
    expect(actions).toContain('retry_request');
    expect(actions).toContain('check_firewall');
  });
});

describe('VeniceTimeoutError', () => {
  it('sets default message', () => {
    const err = new VeniceTimeoutError();
    expect(err.message).toBe('Request timed out');
  });

  it('sets custom message', () => {
    const err = new VeniceTimeoutError('Took too long');
    expect(err.message).toBe('Took too long');
  });

  it('has name VeniceTimeoutError', () => {
    const err = new VeniceTimeoutError();
    expect(err.name).toBe('VeniceTimeoutError');
  });

  it('is instanceof VeniceError and VeniceTimeoutError', () => {
    const err = new VeniceTimeoutError();
    expect(err).toBeInstanceOf(VeniceError);
    expect(err).toBeInstanceOf(VeniceTimeoutError);
  });
});

describe('VeniceValidationError', () => {
  it('sets message', () => {
    const err = new VeniceValidationError('Invalid input');
    expect(err.message).toBe('Invalid input');
  });

  it('has name VeniceValidationError and code VALIDATION_ERROR', () => {
    const err = new VeniceValidationError('msg');
    expect(err.name).toBe('VeniceValidationError');
    expect(err.code).toBe('VALIDATION_ERROR');
  });

  it('stores details', () => {
    const details = { field: 'email', reason: 'invalid format' };
    const err = new VeniceValidationError('msg', details);
    expect(err.details).toEqual(details);
  });

  it('sets context from details', () => {
    const details = { field: 'name' };
    const err = new VeniceValidationError('msg', details);
    expect(err.context).toEqual(details);
  });

  it('is instanceof VeniceError and VeniceValidationError', () => {
    const err = new VeniceValidationError('msg');
    expect(err).toBeInstanceOf(VeniceError);
    expect(err).toBeInstanceOf(VeniceValidationError);
  });

  it('has validation-specific recovery hints', () => {
    const err = new VeniceValidationError('msg');
    const actions = err.recoveryHints.map(h => h.action);
    expect(actions).toContain('check_parameters');
    expect(actions).toContain('check_required_fields');
    expect(actions).toContain('check_data_types');
  });

  it('adds fix_invalid_fields hint when details are provided', () => {
    const err = new VeniceValidationError('msg', { email: 'bad', name: 'missing' });
    const hint = err.recoveryHints.find(h => h.action === 'fix_invalid_fields');
    expect(hint).toBeDefined();
    expect(hint!.description).toContain('email');
    expect(hint!.description).toContain('name');
  });

  it('does not add fix_invalid_fields hint when no details', () => {
    const err = new VeniceValidationError('msg');
    const hint = err.recoveryHints.find(h => h.action === 'fix_invalid_fields');
    expect(hint).toBeUndefined();
  });
});

describe('VeniceStreamError', () => {
  it('sets default message', () => {
    const err = new VeniceStreamError();
    expect(err.message).toBe('Stream processing error');
  });

  it('sets custom message', () => {
    const err = new VeniceStreamError('Stream broken');
    expect(err.message).toBe('Stream broken');
  });

  it('has name VeniceStreamError', () => {
    const err = new VeniceStreamError();
    expect(err.name).toBe('VeniceStreamError');
  });

  it('is instanceof VeniceError and VeniceStreamError', () => {
    const err = new VeniceStreamError();
    expect(err).toBeInstanceOf(VeniceError);
    expect(err).toBeInstanceOf(VeniceStreamError);
  });

  it('accepts options with cause', () => {
    const cause = new Error('stream died');
    const err = new VeniceStreamError('msg', { cause });
    expect(err.cause).toBe(cause);
  });
});

describe('VeniceCapacityError', () => {
  it('sets default message', () => {
    const err = new VeniceCapacityError();
    expect(err.message).toBe('The model is at capacity. Please try again later.');
  });

  it('sets custom message', () => {
    const err = new VeniceCapacityError('Overloaded');
    expect(err.message).toBe('Overloaded');
  });

  it('has name VeniceCapacityError and status 503', () => {
    const err = new VeniceCapacityError();
    expect(err.name).toBe('VeniceCapacityError');
    expect(err.status).toBe(503);
  });

  it('is instanceof VeniceApiError and VeniceCapacityError', () => {
    const err = new VeniceCapacityError();
    expect(err).toBeInstanceOf(VeniceApiError);
    expect(err).toBeInstanceOf(VeniceCapacityError);
  });
});

describe('VenicePaymentRequiredError', () => {
  it('sets default message', () => {
    const err = new VenicePaymentRequiredError();
    expect(err.message).toBe('Insufficient USD or VCU balance to complete request');
  });

  it('sets custom message', () => {
    const err = new VenicePaymentRequiredError('No funds');
    expect(err.message).toBe('No funds');
  });

  it('has name VenicePaymentRequiredError and status 402', () => {
    const err = new VenicePaymentRequiredError();
    expect(err.name).toBe('VenicePaymentRequiredError');
    expect(err.status).toBe(402);
  });

  it('is instanceof VeniceApiError and VenicePaymentRequiredError', () => {
    const err = new VenicePaymentRequiredError();
    expect(err).toBeInstanceOf(VeniceApiError);
    expect(err).toBeInstanceOf(VenicePaymentRequiredError);
  });
});

describe('VenicePermissionError', () => {
  it('constructs with operation and requiredKeyType', () => {
    const err = new VenicePermissionError('listKeys', 'ADMIN');
    expect(err.name).toBe('VenicePermissionError');
    expect(err.requiredKeyType).toBe('ADMIN');
    expect(err.status).toBe(401);
  });

  it('stores currentKeyType', () => {
    const err = new VenicePermissionError('listKeys', 'ADMIN', 'INFERENCE');
    expect(err.currentKeyType).toBe('INFERENCE');
  });

  it('includes operation in message', () => {
    const err = new VenicePermissionError('deleteKey', 'ADMIN');
    expect(err.message).toContain('deleteKey');
    expect(err.message).toContain('ADMIN');
  });

  it('includes current key info when provided', () => {
    const err = new VenicePermissionError('op', 'ADMIN', 'INFERENCE');
    expect(err.message).toContain('INFERENCE');
  });

  it('is instanceof VeniceApiError and VenicePermissionError', () => {
    const err = new VenicePermissionError('op', 'ADMIN');
    expect(err).toBeInstanceOf(VeniceApiError);
    expect(err).toBeInstanceOf(VenicePermissionError);
  });

  it('stores details with operation, requiredKeyType, helpUrl', () => {
    const err = new VenicePermissionError('op', 'ADMIN', 'INFERENCE');
    expect(err.details).toBeDefined();
    expect(err.details!.operation).toBe('op');
    expect(err.details!.requiredKeyType).toBe('ADMIN');
    expect(err.details!.helpUrl).toBe('https://venice.ai/settings/api');
  });

  describe('getUserMessage', () => {
    it('returns a user-friendly message', () => {
      const err = new VenicePermissionError('op', 'ADMIN', 'INFERENCE');
      const msg = err.getUserMessage();
      expect(msg).toContain('Permission Error');
      expect(msg).toContain('ADMIN');
      expect(msg).toContain('INFERENCE');
    });

    it('omits current key info when UNKNOWN', () => {
      const err = new VenicePermissionError('op', 'ADMIN', 'UNKNOWN');
      const msg = err.getUserMessage();
      expect(msg).not.toContain('You are currently using');
    });

    it('omits current key info when not provided', () => {
      const err = new VenicePermissionError('op', 'ADMIN');
      const msg = err.getUserMessage();
      expect(msg).not.toContain('You are currently using');
    });
  });
});

describe('VeniceModelNotFoundError', () => {
  it('constructs with modelId', () => {
    const err = new VeniceModelNotFoundError('llama-99b');
    expect(err.name).toBe('VeniceModelNotFoundError');
    expect(err.modelId).toBe('llama-99b');
    expect(err.status).toBe(404);
  });

  it('includes model name in message', () => {
    const err = new VeniceModelNotFoundError('gpt-5');
    expect(err.message).toContain('gpt-5');
    expect(err.message).toContain('not found');
  });

  it('stores suggestions', () => {
    const err = new VeniceModelNotFoundError('llam', ['llama-3.3-70b', 'llama-2-7b']);
    expect(err.suggestions).toEqual(['llama-3.3-70b', 'llama-2-7b']);
  });

  it('includes suggestions in message', () => {
    const err = new VeniceModelNotFoundError('llam', ['llama-3.3-70b']);
    expect(err.message).toContain('llama-3.3-70b');
  });

  it('is instanceof VeniceApiError and VeniceModelNotFoundError', () => {
    const err = new VeniceModelNotFoundError('x');
    expect(err).toBeInstanceOf(VeniceApiError);
    expect(err).toBeInstanceOf(VeniceModelNotFoundError);
  });

  it('stores details with modelId, suggestions, helpUrl', () => {
    const err = new VeniceModelNotFoundError('x', ['y']);
    expect(err.details).toBeDefined();
    expect(err.details!.modelId).toBe('x');
    expect(err.details!.suggestions).toEqual(['y']);
  });

  describe('getUserMessage', () => {
    it('returns message with suggestions', () => {
      const err = new VeniceModelNotFoundError('x', ['y', 'z']);
      const msg = err.getUserMessage();
      expect(msg).toContain('x');
      expect(msg).toContain('y');
      expect(msg).toContain('z');
      expect(msg).toContain('Did you mean');
    });

    it('returns message without suggestions when none given', () => {
      const err = new VeniceModelNotFoundError('x');
      const msg = err.getUserMessage();
      expect(msg).toContain('x');
      expect(msg).not.toContain('Did you mean');
    });
  });
});
