import { describe, it, expect } from 'vitest';
import { BaseValidator } from './base-validator';
import { VeniceValidationError } from '../../errors';

class TestValidator extends BaseValidator {}

describe('BaseValidator', () => {
  const validator = new TestValidator();

  describe('validateRequired', () => {
    it('should throw error for null value', () => {
      expect(() => validator.validateRequired(null, 'testField')).toThrowError(
        'testField is required'
      );
    });

    it('should throw error for undefined value', () => {
      expect(() => validator.validateRequired(undefined, 'testField')).toThrowError(
        'testField is required'
      );
    });

    it('should not throw for valid values', () => {
      expect(() => validator.validateRequired('value', 'testField')).not.toThrow();
      expect(() => validator.validateRequired(0, 'testField')).not.toThrow();
      expect(() => validator.validateRequired(false, 'testField')).not.toThrow();
      expect(() => validator.validateRequired('', 'testField')).not.toThrow();
    });
  });

  describe('validateString', () => {
    it('should throw error for non-string values', () => {
      expect(() => validator.validateString(123 as any, 'testField')).toThrow(
        'testField must be a non-empty string'
      );
      expect(() => validator.validateString(null as any, 'testField')).toThrow();
      expect(() => validator.validateString(undefined as any, 'testField')).toThrow();
    });

    it('should throw error for empty string', () => {
      expect(() => validator.validateString('', 'testField')).toThrow(
        'testField must be a non-empty string'
      );
    });

    it('should throw error for whitespace-only string', () => {
      expect(() => validator.validateString('   ', 'testField')).toThrow(
        'testField must be a non-empty string'
      );
    });

    it('should not throw for valid strings', () => {
      expect(() => validator.validateString('value', 'testField')).not.toThrow();
      expect(() => validator.validateString('a', 'testField')).not.toThrow();
      expect(() => validator.validateString(' a ', 'testField')).not.toThrow();
    });
  });

  describe('validateNumber', () => {
    it('should throw error for non-number values', () => {
      expect(() => validator.validateNumber('123' as any, 'testField')).toThrow(
        'testField must be a number'
      );
      expect(() => validator.validateNumber(null as any, 'testField')).toThrow();
    });

    it('should validate minimum value', () => {
      expect(() => validator.validateNumber(5, 'testField', 0, 10)).not.toThrow();
      expect(() => validator.validateNumber(-1, 'testField', 0, 10)).toThrow(
        'testField must be at least 0'
      );
    });

    it('should validate maximum value', () => {
      expect(() => validator.validateNumber(5, 'testField', 0, 10)).not.toThrow();
      expect(() => validator.validateNumber(11, 'testField', 0, 10)).toThrow(
        'testField must be at most 10'
      );
    });

    it('should accept values at boundaries', () => {
      expect(() => validator.validateNumber(0, 'testField', 0, 10)).not.toThrow();
      expect(() => validator.validateNumber(10, 'testField', 0, 10)).not.toThrow();
    });

    it('should work without min/max constraints', () => {
      expect(() => validator.validateNumber(-1000, 'testField')).not.toThrow();
      expect(() => validator.validateNumber(1000, 'testField')).not.toThrow();
    });
  });

  describe('validateEnum', () => {
    it('should throw error for invalid enum value', () => {
      expect(() =>
        validator.validateEnum('invalid', 'testField', ['valid1', 'valid2'])
      ).toThrow('testField must be one of: valid1, valid2');
    });

    it('should not throw for valid enum value', () => {
      expect(() =>
        validator.validateEnum('valid1', 'testField', ['valid1', 'valid2'])
      ).not.toThrow();
      expect(() =>
        validator.validateEnum('valid2', 'testField', ['valid1', 'valid2'])
      ).not.toThrow();
    });

    it('should handle numeric enums', () => {
      expect(() => validator.validateEnum(1, 'testField', [1, 2, 3])).not.toThrow();
      expect(() => validator.validateEnum(4, 'testField', [1, 2, 3])).toThrow();
    });
  });

  describe('validateNonEmptyArray', () => {
    it('should throw error for non-array values', () => {
      expect(() =>
        validator.validateNonEmptyArray('not-array' as any, 'testField')
      ).toThrow('testField must be an array');
      expect(() =>
        validator.validateNonEmptyArray(null as any, 'testField')
      ).toThrow();
    });

    it('should throw error for empty array', () => {
      expect(() => validator.validateNonEmptyArray([], 'testField')).toThrow(
        'testField cannot be empty'
      );
    });

    it('should not throw for non-empty arrays', () => {
      expect(() =>
        validator.validateNonEmptyArray([1], 'testField')
      ).not.toThrow();
      expect(() =>
        validator.validateNonEmptyArray(['a', 'b'], 'testField')
      ).not.toThrow();
    });
  });

  describe('validateObject', () => {
    it('should throw error for non-object values', () => {
      expect(() => validator.validateObject('string' as any, 'testField')).toThrow(
        'testField must be an object'
      );
      expect(() => validator.validateObject(123 as any, 'testField')).toThrow();
      expect(() => validator.validateObject(null as any, 'testField')).toThrow();
    });

    it('should throw error for arrays', () => {
      expect(() => validator.validateObject([] as any, 'testField')).toThrow(
        'testField must be an object'
      );
    });

    it('should not throw for valid objects', () => {
      expect(() => validator.validateObject({}, 'testField')).not.toThrow();
      expect(() =>
        validator.validateObject({ key: 'value' }, 'testField')
      ).not.toThrow();
    });
  });

  describe('validateBoolean', () => {
    it('should throw error for non-boolean values', () => {
      expect(() => validator.validateBoolean('true' as any, 'testField')).toThrow(
        'testField must be a boolean'
      );
      expect(() => validator.validateBoolean(1 as any, 'testField')).toThrow();
      expect(() => validator.validateBoolean(null as any, 'testField')).toThrow();
    });

    it('should not throw for boolean values', () => {
      expect(() => validator.validateBoolean(true, 'testField')).not.toThrow();
      expect(() => validator.validateBoolean(false, 'testField')).not.toThrow();
    });
  });

  describe('validateUrl', () => {
    it('should throw error for invalid URLs', () => {
      expect(() => validator.validateUrl('not-a-url', 'testField')).toThrow(
        'testField must be a valid URL'
      );
      expect(() => validator.validateUrl('', 'testField')).toThrow();
    });

    it('should not throw for valid URLs', () => {
      expect(() =>
        validator.validateUrl('https://example.com', 'testField')
      ).not.toThrow();
      expect(() =>
        validator.validateUrl('http://localhost:3000', 'testField')
      ).not.toThrow();
      expect(() =>
        validator.validateUrl('https://api.venice.ai/v1/chat', 'testField')
      ).not.toThrow();
    });
  });
});
