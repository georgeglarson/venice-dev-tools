import { describe, it, expect } from 'vitest';
import { VideoValidator } from './video-validator';
import { VeniceValidationError } from '../../errors';

describe('VideoValidator', () => {
  const validator = new VideoValidator();

  const validRequest = {
    model: 'wan-2.5-preview-image-to-video',
    prompt: 'A cat walking through a garden',
  };

  describe('validate()', () => {
    it('should accept a valid request with all required fields', () => {
      expect(() => validator.validate(validRequest)).not.toThrow();
    });

    it('should accept a valid request with optional negative_prompt', () => {
      expect(() =>
        validator.validate({
          ...validRequest,
          negative_prompt: 'blurry, low quality',
        })
      ).not.toThrow();
    });

    it('should accept a valid request with optional seed', () => {
      expect(() =>
        validator.validate({ ...validRequest, seed: 12345 })
      ).not.toThrow();
    });

    it('should accept a valid request with all optional fields', () => {
      expect(() =>
        validator.validate({
          ...validRequest,
          negative_prompt: 'blurry',
          seed: 42,
        })
      ).not.toThrow();
    });

    // --- request-level validation ---

    it('should throw for null request', () => {
      expect(() => validator.validate(null as any)).toThrowError('request is required');
    });

    it('should throw for undefined request', () => {
      expect(() => validator.validate(undefined as any)).toThrowError('request is required');
    });

    it('should throw for non-object request (string)', () => {
      expect(() => validator.validate('bad' as any)).toThrowError('request must be an object');
    });

    it('should throw for non-object request (number)', () => {
      expect(() => validator.validate(123 as any)).toThrowError('request must be an object');
    });

    it('should throw for non-object request (boolean)', () => {
      expect(() => validator.validate(true as any)).toThrowError('request must be an object');
    });

    it('should throw for non-object request (array)', () => {
      expect(() => validator.validate([] as any)).toThrowError('request must be an object');
    });

    // --- model validation ---

    it('should throw for missing model', () => {
      const req = { prompt: 'A cat' } as any;
      expect(() => validator.validate(req)).toThrow();
    });

    it('should throw for empty model', () => {
      expect(() =>
        validator.validate({ ...validRequest, model: '' })
      ).toThrowError('model must be a non-empty string');
    });

    it('should throw for whitespace-only model', () => {
      expect(() =>
        validator.validate({ ...validRequest, model: '   ' })
      ).toThrowError('model must be a non-empty string');
    });

    it('should throw for non-string model', () => {
      expect(() =>
        validator.validate({ ...validRequest, model: 42 } as any)
      ).toThrow();
    });

    it('should throw for null model', () => {
      expect(() =>
        validator.validate({ ...validRequest, model: null } as any)
      ).toThrow();
    });

    // --- prompt validation ---

    it('should throw for missing prompt', () => {
      const req = { model: 'some-model' } as any;
      expect(() => validator.validate(req)).toThrow();
    });

    it('should throw for empty prompt', () => {
      expect(() =>
        validator.validate({ ...validRequest, prompt: '' })
      ).toThrowError('prompt must be a non-empty string');
    });

    it('should throw for whitespace-only prompt', () => {
      expect(() =>
        validator.validate({ ...validRequest, prompt: '   ' })
      ).toThrowError('prompt must be a non-empty string');
    });

    it('should throw for non-string prompt', () => {
      expect(() =>
        validator.validate({ ...validRequest, prompt: 999 } as any)
      ).toThrow();
    });

    it('should throw for null prompt', () => {
      expect(() =>
        validator.validate({ ...validRequest, prompt: null } as any)
      ).toThrow();
    });

    // --- prompt length validation ---

    it('should accept prompt of exactly 2500 characters', () => {
      const maxPrompt = 'a'.repeat(2500);
      expect(() =>
        validator.validate({ ...validRequest, prompt: maxPrompt })
      ).not.toThrow();
    });

    it('should throw for prompt of 2501 characters', () => {
      const tooLong = 'a'.repeat(2501);
      expect(() =>
        validator.validate({ ...validRequest, prompt: tooLong })
      ).toThrowError('prompt must be 2500 characters or less');
    });

    it('should throw for very long prompt', () => {
      const veryLong = 'x'.repeat(10000);
      expect(() =>
        validator.validate({ ...validRequest, prompt: veryLong })
      ).toThrowError('prompt must be 2500 characters or less');
    });

    it('should accept a short prompt', () => {
      expect(() =>
        validator.validate({ ...validRequest, prompt: 'a' })
      ).not.toThrow();
    });

    it('should accept prompt of 2499 characters', () => {
      const almostMax = 'b'.repeat(2499);
      expect(() =>
        validator.validate({ ...validRequest, prompt: almostMax })
      ).not.toThrow();
    });

    // --- error type ---

    it('should throw VeniceValidationError for null request', () => {
      expect(() => validator.validate(null as any)).toThrow(VeniceValidationError);
    });

    it('should throw VeniceValidationError for prompt too long', () => {
      const tooLong = 'a'.repeat(2501);
      expect(() =>
        validator.validate({ ...validRequest, prompt: tooLong })
      ).toThrow(VeniceValidationError);
    });

    it('should throw VeniceValidationError for empty model', () => {
      expect(() =>
        validator.validate({ ...validRequest, model: '' })
      ).toThrow(VeniceValidationError);
    });

    it('should throw VeniceValidationError for empty prompt', () => {
      expect(() =>
        validator.validate({ ...validRequest, prompt: '' })
      ).toThrow(VeniceValidationError);
    });

    // --- edge cases ---

    it('should accept an empty object with model and prompt only', () => {
      expect(() =>
        validator.validate({ model: 'm', prompt: 'p' })
      ).not.toThrow();
    });

    it('should ignore extra unknown fields', () => {
      expect(() =>
        validator.validate({ ...validRequest, unknown_field: 'whatever' } as any)
      ).not.toThrow();
    });
  });
});
