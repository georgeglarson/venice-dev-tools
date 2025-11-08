import { describe, it, expect } from 'vitest';
import { VeniceError } from './types/base-error';
import { VeniceAuthError } from './types/auth-error';
import { VeniceRateLimitError } from './types/rate-limit-error';
import { VeniceValidationError } from './types/validation-error';
import { VeniceNetworkError } from './types/network-error';

describe('Error Recovery Hints', () => {
  describe('VeniceError', () => {
    it('should create error with recovery hints', () => {
      const error = new VeniceError('Test error', {
        code: 'TEST_ERROR',
        recoveryHints: [
          {
            action: 'test_action',
            description: 'Test recovery action',
            automated: false,
          },
        ],
        context: { detail: 'test' },
      });

      expect(error.code).toBe('TEST_ERROR');
      expect(error.recoveryHints).toHaveLength(1);
      expect(error.recoveryHints[0].action).toBe('test_action');
      expect(error.context).toEqual({ detail: 'test' });
    });

    it('should serialize to JSON', () => {
      const error = new VeniceError('Test error', {
        code: 'TEST_ERROR',
        recoveryHints: [{ action: 'test', description: 'Test', automated: false }],
      });

      const json = error.toJSON();
      expect(json).toHaveProperty('name', 'VeniceError');
      expect(json).toHaveProperty('message', 'Test error');
      expect(json).toHaveProperty('code', 'TEST_ERROR');
      expect(json).toHaveProperty('recoveryHints');
      expect(json).toHaveProperty('stack');
    });

    it('should have default recovery hints', () => {
      const error = new VeniceError('Test error');
      expect(error.recoveryHints).toHaveLength(1);
      expect(error.recoveryHints[0].action).toBe('check_logs');
      expect(error.recoveryHints[0].description).toContain('error logs');
    });

    it('should support error cause', () => {
      const cause = new Error('Root cause');
      const error = new VeniceError('Test error', { cause });
      
      expect(error.cause).toBe(cause);
    });
  });

  describe('VeniceAuthError', () => {
    it('should have AUTH_ERROR code', () => {
      const error = new VeniceAuthError();
      expect(error.code).toBe('AUTH_ERROR');
    });

    it('should have authentication recovery hints', () => {
      const error = new VeniceAuthError();
      
      expect(error.recoveryHints.length).toBeGreaterThan(0);
      
      const actions = error.recoveryHints.map(h => h.action);
      expect(actions).toContain('check_api_key');
      expect(actions).toContain('get_new_key');
      expect(actions).toContain('check_env_vars');
    });

    it('should include code examples in hints', () => {
      const error = new VeniceAuthError();
      
      const hintsWithCode = error.recoveryHints.filter(h => h.code);
      expect(hintsWithCode.length).toBeGreaterThan(0);
      
      const apiKeyHint = error.recoveryHints.find(h => h.action === 'check_api_key');
      expect(apiKeyHint?.code).toContain('VeniceClient');
      expect(apiKeyHint?.code).toContain('apiKey');
    });

    it('should have default error message', () => {
      const error = new VeniceAuthError();
      expect(error.message).toBe('Authentication failed');
    });

    it('should allow custom error message', () => {
      const error = new VeniceAuthError('Invalid API key provided');
      expect(error.message).toBe('Invalid API key provided');
    });

    it('should not have automated recovery', () => {
      const error = new VeniceAuthError();
      const automated = error.recoveryHints.filter(h => h.automated);
      expect(automated).toHaveLength(0);
    });
  });

  describe('VeniceRateLimitError', () => {
    it('should have RATE_LIMIT_EXCEEDED code', () => {
      const error = new VeniceRateLimitError();
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should store retryAfter value', () => {
      const error = new VeniceRateLimitError('Rate limit exceeded', 60);
      expect(error.retryAfter).toBe(60);
    });

    it('should include retryAfter in context', () => {
      const error = new VeniceRateLimitError('Rate limit exceeded', 30);
      expect(error.context).toEqual({ retryAfter: 30 });
    });

    it('should have automated recovery hint', () => {
      const error = new VeniceRateLimitError('Rate limit exceeded', 60);
      
      const automated = error.recoveryHints.filter(h => h.automated);
      expect(automated.length).toBeGreaterThan(0);
      
      const waitHint = automated[0];
      expect(waitHint.action).toBe('wait_and_retry');
      expect(waitHint.description).toContain('60 seconds');
    });

    it('should include retry configuration hints', () => {
      const error = new VeniceRateLimitError();
      
      const actions = error.recoveryHints.map(h => h.action);
      expect(actions).toContain('implement_backoff');
      expect(actions).toContain('use_rate_limiter');
      expect(actions).toContain('upgrade_plan');
    });

    it('should generate code with correct delay', () => {
      const error = new VeniceRateLimitError('Rate limit exceeded', 45);
      
      const waitHint = error.recoveryHints.find(h => h.action === 'wait_and_retry');
      expect(waitHint?.code).toContain('45000');
    });

    it('should have default retryAfter hint when not specified', () => {
      const error = new VeniceRateLimitError();
      
      const waitHint = error.recoveryHints.find(h => h.action === 'wait_and_retry');
      expect(waitHint?.description).toBe('Wait before retrying the request');
      expect(waitHint?.code).toContain('60000');
    });
  });

  describe('VeniceValidationError', () => {
    it('should have VALIDATION_ERROR code', () => {
      const error = new VeniceValidationError('Validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should store validation details', () => {
      const details = {
        model: 'Model is required',
        max_tokens: 'Must be between 1 and 4096',
      };
      
      const error = new VeniceValidationError('Validation failed', details);
      expect(error.details).toEqual(details);
      expect(error.context).toEqual(details);
    });

    it('should add specific hint for invalid fields', () => {
      const details = {
        model: 'Model is required',
        temperature: 'Must be between 0 and 2',
      };
      
      const error = new VeniceValidationError('Validation failed', details);
      
      const fieldHint = error.recoveryHints.find(h => h.action === 'fix_invalid_fields');
      expect(fieldHint).toBeDefined();
      expect(fieldHint?.description).toContain('model');
      expect(fieldHint?.description).toContain('temperature');
    });

    it('should have generic validation recovery hints', () => {
      const error = new VeniceValidationError('Validation failed');
      
      const actions = error.recoveryHints.map(h => h.action);
      expect(actions).toContain('check_parameters');
      expect(actions).toContain('check_required_fields');
      expect(actions).toContain('check_data_types');
    });

    it('should work without details', () => {
      const error = new VeniceValidationError('Validation failed');
      
      expect(error.details).toBeUndefined();
      expect(error.recoveryHints.length).toBeGreaterThan(0);
    });

    it('should not have automated recovery', () => {
      const error = new VeniceValidationError('Validation failed', {
        field: 'error',
      });
      
      const automated = error.recoveryHints.filter(h => h.automated);
      expect(automated).toHaveLength(0);
    });
  });

  describe('VeniceNetworkError', () => {
    it('should have NETWORK_ERROR code', () => {
      const error = new VeniceNetworkError();
      expect(error.code).toBe('NETWORK_ERROR');
    });

    it('should have automated retry hint', () => {
      const error = new VeniceNetworkError();
      
      const automated = error.recoveryHints.filter(h => h.automated);
      expect(automated.length).toBeGreaterThan(0);
      
      const retryHint = automated.find(h => h.action === 'retry_request');
      expect(retryHint).toBeDefined();
    });

    it('should have network troubleshooting hints', () => {
      const error = new VeniceNetworkError();
      
      const actions = error.recoveryHints.map(h => h.action);
      expect(actions).toContain('check_connection');
      expect(actions).toContain('check_firewall');
      expect(actions).toContain('configure_retry');
    });

    it('should include retry configuration code', () => {
      const error = new VeniceNetworkError();
      
      const configHint = error.recoveryHints.find(h => h.action === 'configure_retry');
      expect(configHint?.code).toContain('retryableErrorTypes');
      expect(configHint?.code).toContain('ECONNRESET');
      expect(configHint?.code).toContain('ETIMEDOUT');
    });

    it('should have default error message', () => {
      const error = new VeniceNetworkError();
      expect(error.message).toBe('Network error occurred');
    });

    it('should allow custom error message', () => {
      const error = new VeniceNetworkError('Connection timeout');
      expect(error.message).toBe('Connection timeout');
    });

    it('should support error cause', () => {
      const cause = new Error('ECONNRESET');
      const error = new VeniceNetworkError('Network error', { cause });
      
      expect(error.cause).toBe(cause);
    });
  });

  describe('Recovery hint structure', () => {
    it('should have required fields', () => {
      const error = new VeniceAuthError();
      
      error.recoveryHints.forEach((hint) => {
        expect(hint).toHaveProperty('action');
        expect(hint).toHaveProperty('description');
        expect(hint).toHaveProperty('automated');
        
        expect(typeof hint.action).toBe('string');
        expect(typeof hint.description).toBe('string');
        expect(typeof hint.automated).toBe('boolean');
      });
    });

    it('should have optional code field', () => {
      const error = new VeniceRateLimitError();
      
      const hintsWithCode = error.recoveryHints.filter(h => h.code);
      expect(hintsWithCode.length).toBeGreaterThan(0);
      
      hintsWithCode.forEach((hint) => {
        expect(typeof hint.code).toBe('string');
        expect(hint.code!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error instanceof checks', () => {
    it('should work with instanceof', () => {
      const authError = new VeniceAuthError();
      const rateLimitError = new VeniceRateLimitError();
      const validationError = new VeniceValidationError('test');
      const networkError = new VeniceNetworkError();

      expect(authError instanceof VeniceError).toBe(true);
      expect(rateLimitError instanceof VeniceError).toBe(true);
      expect(validationError instanceof VeniceError).toBe(true);
      expect(networkError instanceof VeniceError).toBe(true);

      expect(authError instanceof Error).toBe(true);
      expect(rateLimitError instanceof Error).toBe(true);
      expect(validationError instanceof Error).toBe(true);
      expect(networkError instanceof Error).toBe(true);
    });
  });

  describe('Error serialization', () => {
    it('should serialize all error types', () => {
      const errors = [
        new VeniceAuthError('Auth failed'),
        new VeniceRateLimitError('Rate limit', 60),
        new VeniceValidationError('Validation failed', { field: 'error' }),
        new VeniceNetworkError('Network error'),
      ];

      errors.forEach((error) => {
        const json = error.toJSON();
        
        expect(json).toHaveProperty('name');
        expect(json).toHaveProperty('message');
        expect(json).toHaveProperty('code');
        expect(json).toHaveProperty('recoveryHints');
        
        expect(Array.isArray((json as any).recoveryHints)).toBe(true);
      });
    });

    it('should include context in serialization', () => {
      const rateLimitError = new VeniceRateLimitError('Rate limit', 30);
      const json = rateLimitError.toJSON();
      
      expect((json as any).context).toEqual({ retryAfter: 30 });
    });
  });
});
