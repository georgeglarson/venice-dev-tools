import { describe, it, expect } from 'vitest';
import { AudioValidator } from './audio-validator';
import { VeniceValidationError } from '../../errors';

describe('AudioValidator', () => {
  const validator = new AudioValidator();

  const validSpeechRequest = {
    input: 'Hello, world!',
    model: 'tts-kokoro',
    voice: 'af_sky',
  };

  describe('validate() - speech creation', () => {
    it('should accept a valid request with all required fields', () => {
      expect(() => validator.validate(validSpeechRequest)).not.toThrow();
    });

    it('should accept a valid request with all optional fields', () => {
      expect(() =>
        validator.validate({
          ...validSpeechRequest,
          response_format: 'mp3',
          speed: 1.0,
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
      expect(() => validator.validate(42 as any)).toThrowError('request must be an object');
    });

    it('should throw for non-object request (array)', () => {
      expect(() => validator.validate([] as any)).toThrowError('request must be an object');
    });

    // --- input validation ---

    it('should throw for missing input', () => {
      const req = { model: 'tts-kokoro', voice: 'af_sky' } as any;
      expect(() => validator.validate(req)).toThrow();
    });

    it('should throw for empty input', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, input: '' })
      ).toThrowError('input must be a non-empty string');
    });

    it('should throw for whitespace-only input', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, input: '   ' })
      ).toThrowError('input must be a non-empty string');
    });

    it('should throw for input exceeding 4096 characters', () => {
      const longInput = 'a'.repeat(4097);
      expect(() =>
        validator.validate({ ...validSpeechRequest, input: longInput })
      ).toThrowError('input must be 4096 characters or less');
    });

    it('should accept input of exactly 4096 characters', () => {
      const maxInput = 'a'.repeat(4096);
      expect(() =>
        validator.validate({ ...validSpeechRequest, input: maxInput })
      ).not.toThrow();
    });

    it('should accept a short valid input', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, input: 'a' })
      ).not.toThrow();
    });

    it('should throw for non-string input', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, input: 123 } as any)
      ).toThrow();
    });

    // --- model validation ---

    it('should throw for missing model', () => {
      const req = { input: 'hello', voice: 'af_sky' } as any;
      expect(() => validator.validate(req)).toThrow();
    });

    it('should throw for empty model', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, model: '' })
      ).toThrowError('model must be a non-empty string');
    });

    it('should throw for whitespace-only model', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, model: '  ' })
      ).toThrowError('model must be a non-empty string');
    });

    // --- voice validation ---

    it('should throw for missing voice', () => {
      const req = { input: 'hello', model: 'tts-kokoro' } as any;
      expect(() => validator.validate(req)).toThrow();
    });

    it('should throw for empty voice', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, voice: '' })
      ).toThrowError('voice must be a non-empty string');
    });

    it('should throw for whitespace-only voice', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, voice: '  ' })
      ).toThrowError('voice must be a non-empty string');
    });

    // --- response_format validation ---

    it.each(['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm'] as const)(
      'should accept valid response_format "%s"',
      (format) => {
        expect(() =>
          validator.validate({ ...validSpeechRequest, response_format: format })
        ).not.toThrow();
      }
    );

    it('should throw for invalid response_format', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, response_format: 'ogg' as any })
      ).toThrowError('response_format must be one of: mp3, opus, aac, flac, wav, pcm');
    });

    it('should accept request without response_format (optional)', () => {
      const { response_format, ...req } = { ...validSpeechRequest, response_format: undefined };
      expect(() => validator.validate(req as any)).not.toThrow();
    });

    // --- speed validation ---

    it('should accept speed of 0.25 (minimum boundary)', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, speed: 0.25 })
      ).not.toThrow();
    });

    it('should accept speed of 1.0 (default)', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, speed: 1.0 })
      ).not.toThrow();
    });

    it('should accept speed of 4.0 (maximum boundary)', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, speed: 4.0 })
      ).not.toThrow();
    });

    it('should accept speed of 2.5 (mid-range)', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, speed: 2.5 })
      ).not.toThrow();
    });

    it('should throw for speed below 0.25', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, speed: 0.24 })
      ).toThrowError('speed must be at least 0.25');
    });

    it('should throw for speed of 0', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, speed: 0 })
      ).toThrowError('speed must be at least 0.25');
    });

    it('should throw for negative speed', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, speed: -1 })
      ).toThrowError('speed must be at least 0.25');
    });

    it('should throw for speed above 4.0', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, speed: 4.01 })
      ).toThrowError('speed must be at most 4');
    });

    it('should throw for speed of 100', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, speed: 100 })
      ).toThrowError('speed must be at most 4');
    });

    it('should throw for non-number speed', () => {
      expect(() =>
        validator.validate({ ...validSpeechRequest, speed: 'fast' as any })
      ).toThrowError('speed must be a number');
    });

    it('should accept request without speed (optional)', () => {
      expect(() => validator.validate(validSpeechRequest)).not.toThrow();
    });

    // --- error type ---

    it('should throw VeniceValidationError instances', () => {
      expect(() => validator.validate(null as any)).toThrow(VeniceValidationError);
    });

    it('should throw VeniceValidationError for input too long', () => {
      const longInput = 'a'.repeat(4097);
      expect(() =>
        validator.validate({ ...validSpeechRequest, input: longInput })
      ).toThrow(VeniceValidationError);
    });
  });

  describe('validateTranscription()', () => {
    const validTranscriptionRequest = {
      file: new Blob(['audio data'], { type: 'audio/wav' }),
    };

    it('should accept a valid request with file only', () => {
      expect(() =>
        validator.validateTranscription(validTranscriptionRequest)
      ).not.toThrow();
    });

    it('should accept a valid request with all optional fields', () => {
      expect(() =>
        validator.validateTranscription({
          ...validTranscriptionRequest,
          response_format: 'json',
          language: 'en',
        })
      ).not.toThrow();
    });

    // --- request-level validation ---

    it('should throw for null request', () => {
      expect(() =>
        validator.validateTranscription(null as any)
      ).toThrowError('request is required');
    });

    it('should throw for undefined request', () => {
      expect(() =>
        validator.validateTranscription(undefined as any)
      ).toThrowError('request is required');
    });

    it('should throw for non-object request (string)', () => {
      expect(() =>
        validator.validateTranscription('bad' as any)
      ).toThrowError('request must be an object');
    });

    it('should throw for non-object request (number)', () => {
      expect(() =>
        validator.validateTranscription(42 as any)
      ).toThrowError('request must be an object');
    });

    it('should throw for non-object request (array)', () => {
      expect(() =>
        validator.validateTranscription([] as any)
      ).toThrowError('request must be an object');
    });

    // --- file validation ---

    it('should throw for missing file (undefined)', () => {
      expect(() =>
        validator.validateTranscription({} as any)
      ).toThrowError('file is required');
    });

    it('should throw for null file', () => {
      expect(() =>
        validator.validateTranscription({ file: null } as any)
      ).toThrowError('file is required');
    });

    it('should accept an ArrayBuffer as file', () => {
      expect(() =>
        validator.validateTranscription({ file: new ArrayBuffer(8) })
      ).not.toThrow();
    });

    // --- response_format validation ---

    it('should accept response_format "json"', () => {
      expect(() =>
        validator.validateTranscription({
          ...validTranscriptionRequest,
          response_format: 'json',
        })
      ).not.toThrow();
    });

    it('should accept response_format "text"', () => {
      expect(() =>
        validator.validateTranscription({
          ...validTranscriptionRequest,
          response_format: 'text',
        })
      ).not.toThrow();
    });

    it('should throw for invalid response_format', () => {
      expect(() =>
        validator.validateTranscription({
          ...validTranscriptionRequest,
          response_format: 'xml' as any,
        })
      ).toThrowError('response_format must be one of: json, text');
    });

    it('should accept request without response_format (optional)', () => {
      expect(() =>
        validator.validateTranscription(validTranscriptionRequest)
      ).not.toThrow();
    });

    // --- language validation ---

    it('should accept a valid language string', () => {
      expect(() =>
        validator.validateTranscription({
          ...validTranscriptionRequest,
          language: 'en',
        })
      ).not.toThrow();
    });

    it('should accept a longer language string', () => {
      expect(() =>
        validator.validateTranscription({
          ...validTranscriptionRequest,
          language: 'zh-CN',
        })
      ).not.toThrow();
    });

    it('should throw for empty language string', () => {
      expect(() =>
        validator.validateTranscription({
          ...validTranscriptionRequest,
          language: '',
        })
      ).toThrowError('language must be a non-empty string');
    });

    it('should throw for whitespace-only language string', () => {
      expect(() =>
        validator.validateTranscription({
          ...validTranscriptionRequest,
          language: '   ',
        })
      ).toThrowError('language must be a non-empty string');
    });

    it('should accept request without language (optional)', () => {
      expect(() =>
        validator.validateTranscription(validTranscriptionRequest)
      ).not.toThrow();
    });

    // --- error type ---

    it('should throw VeniceValidationError instances', () => {
      expect(() =>
        validator.validateTranscription(null as any)
      ).toThrow(VeniceValidationError);
    });
  });
});
