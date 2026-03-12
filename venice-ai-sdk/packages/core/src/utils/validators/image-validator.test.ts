import { describe, it, expect } from 'vitest';
import { ImageValidator } from './image-validator';
import { VeniceValidationError } from '../../errors';

describe('ImageValidator', () => {
  const validator = new ImageValidator();

  // ---------------------------------------------------------------------------
  // validateImageRequest
  // ---------------------------------------------------------------------------
  describe('validateImageRequest', () => {
    it('should accept a valid minimal request', () => {
      expect(() => validator.validateImageRequest({ model: 'test-model' })).not.toThrow();
    });

    it('should accept a valid request with all optional fields', () => {
      expect(() =>
        validator.validateImageRequest({
          model: 'test-model',
          n: 5,
          size: 512,
          response_format: 'url',
          user: 'user-1',
          prompt: 'a sunset',
          negative_prompt: 'blurry',
          style: 'vivid',
          quality: 'high',
          safety: 'medium',
          copyright: 'free',
          watermark: 'none',
          metadata: [{ key: 'k', value: 'v' }],
        })
      ).not.toThrow();
    });

    // model
    it('should throw when model is missing', () => {
      expect(() => validator.validateImageRequest({} as any)).toThrow(VeniceValidationError);
      expect(() => validator.validateImageRequest({} as any)).toThrow('model');
    });

    it('should throw when model is empty string', () => {
      expect(() => validator.validateImageRequest({ model: '' })).toThrow(VeniceValidationError);
    });

    it('should throw when model is whitespace', () => {
      expect(() => validator.validateImageRequest({ model: '   ' })).toThrow(VeniceValidationError);
    });

    // n
    it('should accept n within range', () => {
      expect(() => validator.validateImageRequest({ model: 'm', n: 1 })).not.toThrow();
      expect(() => validator.validateImageRequest({ model: 'm', n: 10 })).not.toThrow();
      expect(() => validator.validateImageRequest({ model: 'm', n: 5 })).not.toThrow();
    });

    it('should throw when n is below minimum', () => {
      expect(() => validator.validateImageRequest({ model: 'm', n: 0 })).toThrow(VeniceValidationError);
      expect(() => validator.validateImageRequest({ model: 'm', n: 0 })).toThrow('n must be at least 1');
    });

    it('should throw when n is above maximum', () => {
      expect(() => validator.validateImageRequest({ model: 'm', n: 11 })).toThrow(VeniceValidationError);
      expect(() => validator.validateImageRequest({ model: 'm', n: 11 })).toThrow('n must be at most 10');
    });

    it('should throw when n is not a number', () => {
      expect(() => validator.validateImageRequest({ model: 'm', n: 'five' as any })).toThrow(VeniceValidationError);
    });

    // size
    it('should accept size within range', () => {
      expect(() => validator.validateImageRequest({ model: 'm', size: 256 })).not.toThrow();
      expect(() => validator.validateImageRequest({ model: 'm', size: 512 })).not.toThrow();
      expect(() => validator.validateImageRequest({ model: 'm', size: 1024 })).not.toThrow();
    });

    it('should throw when size is below minimum', () => {
      expect(() => validator.validateImageRequest({ model: 'm', size: 100 })).toThrow(VeniceValidationError);
      expect(() => validator.validateImageRequest({ model: 'm', size: 100 })).toThrow('size must be at least 256');
    });

    it('should throw when size is above maximum', () => {
      expect(() => validator.validateImageRequest({ model: 'm', size: 2048 })).toThrow(VeniceValidationError);
      expect(() => validator.validateImageRequest({ model: 'm', size: 2048 })).toThrow('size must be at most 1024');
    });

    // response_format
    it('should accept valid response_format values', () => {
      expect(() => validator.validateImageRequest({ model: 'm', response_format: 'url' })).not.toThrow();
      expect(() => validator.validateImageRequest({ model: 'm', response_format: 'b64_json' })).not.toThrow();
    });

    it('should throw for invalid response_format', () => {
      expect(() =>
        validator.validateImageRequest({ model: 'm', response_format: 'png' as any })
      ).toThrow(VeniceValidationError);
      expect(() =>
        validator.validateImageRequest({ model: 'm', response_format: 'png' as any })
      ).toThrow('response_format must be one of: url, b64_json');
    });

    // quality
    it('should accept valid quality values', () => {
      expect(() => validator.validateImageRequest({ model: 'm', quality: 'standard' })).not.toThrow();
      expect(() => validator.validateImageRequest({ model: 'm', quality: 'high' })).not.toThrow();
      expect(() => validator.validateImageRequest({ model: 'm', quality: 'ultra' })).not.toThrow();
    });

    it('should throw for invalid quality', () => {
      expect(() =>
        validator.validateImageRequest({ model: 'm', quality: 'low' as any })
      ).toThrow(VeniceValidationError);
      expect(() =>
        validator.validateImageRequest({ model: 'm', quality: 'low' as any })
      ).toThrow('quality must be one of: standard, high, ultra');
    });

    // safety
    it('should accept valid safety values', () => {
      expect(() => validator.validateImageRequest({ model: 'm', safety: 'low' })).not.toThrow();
      expect(() => validator.validateImageRequest({ model: 'm', safety: 'medium' })).not.toThrow();
      expect(() => validator.validateImageRequest({ model: 'm', safety: 'high' })).not.toThrow();
    });

    it('should throw for invalid safety', () => {
      expect(() =>
        validator.validateImageRequest({ model: 'm', safety: 'off' as any })
      ).toThrow(VeniceValidationError);
      expect(() =>
        validator.validateImageRequest({ model: 'm', safety: 'off' as any })
      ).toThrow('safety must be one of: low, medium, high');
    });

    // copyright
    it('should accept valid copyright values', () => {
      expect(() => validator.validateImageRequest({ model: 'm', copyright: 'free' })).not.toThrow();
      expect(() => validator.validateImageRequest({ model: 'm', copyright: 'commercial' })).not.toThrow();
    });

    it('should throw for invalid copyright', () => {
      expect(() =>
        validator.validateImageRequest({ model: 'm', copyright: 'open' as any })
      ).toThrow(VeniceValidationError);
      expect(() =>
        validator.validateImageRequest({ model: 'm', copyright: 'open' as any })
      ).toThrow('copyright must be one of: free, commercial');
    });

    // watermark
    it('should accept valid watermark values', () => {
      expect(() => validator.validateImageRequest({ model: 'm', watermark: 'none' })).not.toThrow();
      expect(() => validator.validateImageRequest({ model: 'm', watermark: 'low' })).not.toThrow();
      expect(() => validator.validateImageRequest({ model: 'm', watermark: 'high' })).not.toThrow();
    });

    it('should throw for invalid watermark', () => {
      expect(() =>
        validator.validateImageRequest({ model: 'm', watermark: 'medium' as any })
      ).toThrow(VeniceValidationError);
      expect(() =>
        validator.validateImageRequest({ model: 'm', watermark: 'medium' as any })
      ).toThrow('watermark must be one of: none, low, high');
    });

    // metadata
    it('should accept valid metadata', () => {
      expect(() =>
        validator.validateImageRequest({
          model: 'm',
          metadata: [{ key: 'author', value: 'alice' }],
        })
      ).not.toThrow();
    });

    it('should accept metadata with multiple items', () => {
      expect(() =>
        validator.validateImageRequest({
          model: 'm',
          metadata: [
            { key: 'a', value: 'b' },
            { key: 'c', value: 'd' },
          ],
        })
      ).not.toThrow();
    });

    it('should throw for empty metadata array', () => {
      expect(() =>
        validator.validateImageRequest({ model: 'm', metadata: [] })
      ).toThrow(VeniceValidationError);
    });

    it('should throw for metadata item with empty key', () => {
      expect(() =>
        validator.validateImageRequest({
          model: 'm',
          metadata: [{ key: '', value: 'v' }],
        })
      ).toThrow(VeniceValidationError);
    });

    it('should throw for metadata item with empty value', () => {
      expect(() =>
        validator.validateImageRequest({
          model: 'm',
          metadata: [{ key: 'k', value: '' }],
        })
      ).toThrow(VeniceValidationError);
    });

    it('should throw when request itself is null', () => {
      expect(() => validator.validateImageRequest(null as any)).toThrow(VeniceValidationError);
    });

    it('should throw when request itself is undefined', () => {
      expect(() => validator.validateImageRequest(undefined as any)).toThrow(VeniceValidationError);
    });
  });

  // ---------------------------------------------------------------------------
  // validateGenerateImageRequest
  // ---------------------------------------------------------------------------
  describe('validateGenerateImageRequest', () => {
    it('should accept a valid generate image request', () => {
      expect(() =>
        validator.validateGenerateImageRequest({
          model: 'test-model',
          prompt: 'a beautiful sunset',
        })
      ).not.toThrow();
    });

    it('should delegate validation to validateImageRequest', () => {
      // Missing model should still fail
      expect(() =>
        validator.validateGenerateImageRequest({ prompt: 'test' } as any)
      ).toThrow(VeniceValidationError);
    });

    it('should reject invalid enum values through delegation', () => {
      expect(() =>
        validator.validateGenerateImageRequest({
          model: 'test-model',
          prompt: 'test',
          quality: 'bad' as any,
        })
      ).toThrow(VeniceValidationError);
    });
  });

  // ---------------------------------------------------------------------------
  // validateUpscaleImageParams
  // ---------------------------------------------------------------------------
  describe('validateUpscaleImageParams', () => {
    it('should accept valid params with image only', () => {
      expect(() =>
        validator.validateUpscaleImageParams({ image: 'base64data' })
      ).not.toThrow();
    });

    it('should accept valid params with scale 2', () => {
      expect(() =>
        validator.validateUpscaleImageParams({ image: 'base64data', scale: 2 })
      ).not.toThrow();
    });

    it('should accept valid params with scale 4', () => {
      expect(() =>
        validator.validateUpscaleImageParams({ image: 'base64data', scale: 4 })
      ).not.toThrow();
    });

    it('should throw when params is null', () => {
      expect(() => validator.validateUpscaleImageParams(null as any)).toThrow(VeniceValidationError);
    });

    it('should throw when params is undefined', () => {
      expect(() => validator.validateUpscaleImageParams(undefined as any)).toThrow(VeniceValidationError);
    });

    it('should throw when image is missing', () => {
      expect(() => validator.validateUpscaleImageParams({} as any)).toThrow(VeniceValidationError);
      expect(() => validator.validateUpscaleImageParams({} as any)).toThrow('image is required');
    });

    it('should throw for invalid scale value', () => {
      expect(() =>
        validator.validateUpscaleImageParams({ image: 'data', scale: 3 as any })
      ).toThrow(VeniceValidationError);
      expect(() =>
        validator.validateUpscaleImageParams({ image: 'data', scale: 3 as any })
      ).toThrow('scale must be one of: 2, 4');
    });

    it('should throw for scale value of 1', () => {
      expect(() =>
        validator.validateUpscaleImageParams({ image: 'data', scale: 1 as any })
      ).toThrow(VeniceValidationError);
    });

    it('should accept Blob as image', () => {
      const blob = new Blob(['test']);
      expect(() =>
        validator.validateUpscaleImageParams({ image: blob })
      ).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // validateEditImageRequest
  // ---------------------------------------------------------------------------
  describe('validateEditImageRequest', () => {
    it('should accept a valid edit request', () => {
      expect(() =>
        validator.validateEditImageRequest({ prompt: 'make it blue', image: 'base64data' })
      ).not.toThrow();
    });

    it('should accept a valid edit request with aspect_ratio', () => {
      expect(() =>
        validator.validateEditImageRequest({
          prompt: 'make it blue',
          image: 'base64data',
          aspect_ratio: '16:9',
        })
      ).not.toThrow();
    });

    it('should accept all valid aspect_ratio values', () => {
      const validRatios: Array<'auto' | '1:1' | '3:2' | '16:9' | '21:9' | '9:16' | '2:3' | '3:4' | '4:5'> = [
        'auto', '1:1', '3:2', '16:9', '21:9', '9:16', '2:3', '3:4', '4:5',
      ];
      for (const ratio of validRatios) {
        expect(() =>
          validator.validateEditImageRequest({
            prompt: 'edit',
            image: 'data',
            aspect_ratio: ratio,
          })
        ).not.toThrow();
      }
    });

    it('should throw for invalid aspect_ratio', () => {
      expect(() =>
        validator.validateEditImageRequest({
          prompt: 'edit',
          image: 'data',
          aspect_ratio: '5:4' as any,
        })
      ).toThrow(VeniceValidationError);
      expect(() =>
        validator.validateEditImageRequest({
          prompt: 'edit',
          image: 'data',
          aspect_ratio: '5:4' as any,
        })
      ).toThrow('aspect_ratio must be one of');
    });

    it('should throw when prompt is missing', () => {
      expect(() =>
        validator.validateEditImageRequest({ image: 'data' } as any)
      ).toThrow(VeniceValidationError);
    });

    it('should throw when prompt is empty string', () => {
      expect(() =>
        validator.validateEditImageRequest({ prompt: '', image: 'data' })
      ).toThrow(VeniceValidationError);
    });

    it('should throw when prompt exceeds 32768 characters', () => {
      const longPrompt = 'a'.repeat(32769);
      expect(() =>
        validator.validateEditImageRequest({ prompt: longPrompt, image: 'data' })
      ).toThrow(VeniceValidationError);
      expect(() =>
        validator.validateEditImageRequest({ prompt: longPrompt, image: 'data' })
      ).toThrow('prompt must be 32768 characters or less');
    });

    it('should accept prompt at exactly 32768 characters', () => {
      const maxPrompt = 'a'.repeat(32768);
      expect(() =>
        validator.validateEditImageRequest({ prompt: maxPrompt, image: 'data' })
      ).not.toThrow();
    });

    it('should throw when image is missing', () => {
      expect(() =>
        validator.validateEditImageRequest({ prompt: 'edit' } as any)
      ).toThrow(VeniceValidationError);
      expect(() =>
        validator.validateEditImageRequest({ prompt: 'edit' } as any)
      ).toThrow('image is required');
    });

    it('should throw when request is null', () => {
      expect(() => validator.validateEditImageRequest(null as any)).toThrow(VeniceValidationError);
    });
  });

  // ---------------------------------------------------------------------------
  // validateMultiEditImageRequest
  // ---------------------------------------------------------------------------
  describe('validateMultiEditImageRequest', () => {
    it('should accept a valid request with 1 image', () => {
      expect(() =>
        validator.validateMultiEditImageRequest({ prompt: 'combine', images: ['img1'] })
      ).not.toThrow();
    });

    it('should accept a valid request with 2 images', () => {
      expect(() =>
        validator.validateMultiEditImageRequest({ prompt: 'combine', images: ['img1', 'img2'] })
      ).not.toThrow();
    });

    it('should accept a valid request with 3 images', () => {
      expect(() =>
        validator.validateMultiEditImageRequest({
          prompt: 'combine',
          images: ['img1', 'img2', 'img3'],
        })
      ).not.toThrow();
    });

    it('should throw when prompt is missing', () => {
      expect(() =>
        validator.validateMultiEditImageRequest({ images: ['img1'] } as any)
      ).toThrow(VeniceValidationError);
    });

    it('should throw when prompt is empty string', () => {
      expect(() =>
        validator.validateMultiEditImageRequest({ prompt: '', images: ['img1'] })
      ).toThrow(VeniceValidationError);
    });

    it('should throw when prompt exceeds 32768 characters', () => {
      const longPrompt = 'a'.repeat(32769);
      expect(() =>
        validator.validateMultiEditImageRequest({ prompt: longPrompt, images: ['img1'] })
      ).toThrow(VeniceValidationError);
      expect(() =>
        validator.validateMultiEditImageRequest({ prompt: longPrompt, images: ['img1'] })
      ).toThrow('prompt must be 32768 characters or less');
    });

    it('should accept prompt at exactly 32768 characters', () => {
      const maxPrompt = 'a'.repeat(32768);
      expect(() =>
        validator.validateMultiEditImageRequest({ prompt: maxPrompt, images: ['img1'] })
      ).not.toThrow();
    });

    it('should throw when images is missing', () => {
      expect(() =>
        validator.validateMultiEditImageRequest({ prompt: 'edit' } as any)
      ).toThrow(VeniceValidationError);
    });

    it('should throw when images is empty array', () => {
      expect(() =>
        validator.validateMultiEditImageRequest({ prompt: 'edit', images: [] })
      ).toThrow(VeniceValidationError);
    });

    it('should throw when images has more than 3 items', () => {
      expect(() =>
        validator.validateMultiEditImageRequest({
          prompt: 'edit',
          images: ['a', 'b', 'c', 'd'],
        })
      ).toThrow(VeniceValidationError);
      expect(() =>
        validator.validateMultiEditImageRequest({
          prompt: 'edit',
          images: ['a', 'b', 'c', 'd'],
        })
      ).toThrow('images must contain at most 3 items');
    });

    it('should throw when images is not an array', () => {
      expect(() =>
        validator.validateMultiEditImageRequest({ prompt: 'edit', images: 'img' } as any)
      ).toThrow(VeniceValidationError);
    });

    it('should throw when request is null', () => {
      expect(() => validator.validateMultiEditImageRequest(null as any)).toThrow(VeniceValidationError);
    });
  });

  // ---------------------------------------------------------------------------
  // validateRemoveBackgroundRequest
  // ---------------------------------------------------------------------------
  describe('validateRemoveBackgroundRequest', () => {
    it('should accept a valid request with image', () => {
      expect(() =>
        validator.validateRemoveBackgroundRequest({ image: 'base64data' })
      ).not.toThrow();
    });

    it('should accept a valid request with image_url', () => {
      expect(() =>
        validator.validateRemoveBackgroundRequest({ image_url: 'https://example.com/img.png' })
      ).not.toThrow();
    });

    it('should throw when both image and image_url are missing', () => {
      expect(() =>
        validator.validateRemoveBackgroundRequest({})
      ).toThrow(VeniceValidationError);
      expect(() =>
        validator.validateRemoveBackgroundRequest({})
      ).toThrow('Either image or image_url is required');
    });

    it('should throw when both image and image_url are provided', () => {
      expect(() =>
        validator.validateRemoveBackgroundRequest({
          image: 'data',
          image_url: 'https://example.com/img.png',
        })
      ).toThrow(VeniceValidationError);
      expect(() =>
        validator.validateRemoveBackgroundRequest({
          image: 'data',
          image_url: 'https://example.com/img.png',
        })
      ).toThrow('Only one of image or image_url should be provided');
    });

    it('should throw for invalid image_url', () => {
      expect(() =>
        validator.validateRemoveBackgroundRequest({ image_url: 'not-a-url' })
      ).toThrow(VeniceValidationError);
      expect(() =>
        validator.validateRemoveBackgroundRequest({ image_url: 'not-a-url' })
      ).toThrow('image_url must be a valid URL');
    });

    it('should throw for empty image_url', () => {
      expect(() =>
        validator.validateRemoveBackgroundRequest({ image_url: '' })
      ).toThrow(VeniceValidationError);
    });

    it('should accept a Blob as image', () => {
      const blob = new Blob(['test']);
      expect(() =>
        validator.validateRemoveBackgroundRequest({ image: blob })
      ).not.toThrow();
    });

    it('should throw when request is null', () => {
      expect(() => validator.validateRemoveBackgroundRequest(null as any)).toThrow(VeniceValidationError);
    });

    it('should throw when request is undefined', () => {
      expect(() => validator.validateRemoveBackgroundRequest(undefined as any)).toThrow(VeniceValidationError);
    });
  });
});
