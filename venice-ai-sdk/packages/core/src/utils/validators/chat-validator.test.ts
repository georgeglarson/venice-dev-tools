import { describe, it, expect } from 'vitest';
import { ChatValidator } from './chat-validator';
import { VeniceValidationError } from '../../errors';
import type { ChatCompletionRequest, ChatCompletionMessage } from '../../types/chat';

describe('ChatValidator', () => {
  const validator = new ChatValidator();

  // -------------------------------------------------------------------------
  // Helper
  // -------------------------------------------------------------------------

  function minimalRequest(overrides: Partial<ChatCompletionRequest> = {}): ChatCompletionRequest {
    return {
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: 'Hello' }],
      ...overrides,
    };
  }

  // =========================================================================
  // validateChatCompletionRequest — happy paths
  // =========================================================================

  describe('valid requests', () => {
    it('accepts a minimal valid request (model + messages)', () => {
      expect(() => validator.validateChatCompletionRequest(minimalRequest())).not.toThrow();
    });

    it('accepts a request with system + user messages', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            messages: [
              { role: 'system', content: 'You are helpful.' },
              { role: 'user', content: 'Hi' },
            ],
          }),
        ),
      ).not.toThrow();
    });

    it('accepts a request with assistant message', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            messages: [
              { role: 'user', content: 'Hi' },
              { role: 'assistant', content: 'Hello!' },
            ],
          }),
        ),
      ).not.toThrow();
    });

    it('accepts a request with all optional numeric fields', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            temperature: 1.0,
            top_p: 0.9,
            max_tokens: 512,
          }),
        ),
      ).not.toThrow();
    });

    it('accepts temperature at boundary 0', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ temperature: 0 })),
      ).not.toThrow();
    });

    it('accepts temperature at boundary 2', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ temperature: 2 })),
      ).not.toThrow();
    });

    it('accepts top_p at boundary 0', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ top_p: 0 })),
      ).not.toThrow();
    });

    it('accepts top_p at boundary 1', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ top_p: 1 })),
      ).not.toThrow();
    });

    it('accepts max_tokens at boundary 1', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ max_tokens: 1 })),
      ).not.toThrow();
    });

    it('accepts stream=true', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ stream: true })),
      ).not.toThrow();
    });

    it('accepts stream=false', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ stream: false })),
      ).not.toThrow();
    });

    it('accepts a request with all new optional fields without throwing', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            temperature: 0.7,
            top_p: 0.95,
            max_tokens: 1024,
            stream: false,
            reasoning: { effort: 'high', summary: 'concise' },
            reasoning_effort: 'medium',
            response_format: { type: 'json_object' },
            tools: [
              {
                type: 'function',
                function: { name: 'get_weather', parameters: { type: 'object' } },
              },
            ],
            tool_choice: 'auto',
            metadata: { key: 'value' },
            venice_parameters: { character_slug: 'test' },
          }),
        ),
      ).not.toThrow();
    });

    it('accepts a request with multimodal content', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Describe this image' },
                  { type: 'image_url', image_url: { url: 'https://example.com/img.png' } },
                ],
              },
            ],
          }),
        ),
      ).not.toThrow();
    });

    it('accepts a request with text-only content array', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            messages: [
              {
                role: 'user',
                content: [{ type: 'text', text: 'Hello' }],
              },
            ],
          }),
        ),
      ).not.toThrow();
    });
  });

  // =========================================================================
  // validateChatCompletionRequest — model validation
  // =========================================================================

  describe('model validation', () => {
    it('throws on missing model (undefined)', () => {
      expect(() =>
        validator.validateChatCompletionRequest({ model: undefined as any, messages: [{ role: 'user', content: 'hi' }] }),
      ).toThrow(VeniceValidationError);
    });

    it('throws on null model', () => {
      expect(() =>
        validator.validateChatCompletionRequest({ model: null as any, messages: [{ role: 'user', content: 'hi' }] }),
      ).toThrow(VeniceValidationError);
    });

    it('throws on empty string model', () => {
      expect(() =>
        validator.validateChatCompletionRequest({ model: '', messages: [{ role: 'user', content: 'hi' }] }),
      ).toThrow(VeniceValidationError);
    });

    it('throws on whitespace-only model', () => {
      expect(() =>
        validator.validateChatCompletionRequest({ model: '   ', messages: [{ role: 'user', content: 'hi' }] }),
      ).toThrow(VeniceValidationError);
    });

    it('error message mentions model', () => {
      expect(() =>
        validator.validateChatCompletionRequest({ model: '', messages: [{ role: 'user', content: 'hi' }] }),
      ).toThrow(/model/);
    });

    it('throws on non-string model (number)', () => {
      expect(() =>
        validator.validateChatCompletionRequest({ model: 123 as any, messages: [{ role: 'user', content: 'hi' }] }),
      ).toThrow(VeniceValidationError);
    });
  });

  // =========================================================================
  // validateChatCompletionRequest — messages validation
  // =========================================================================

  describe('messages validation', () => {
    it('throws on missing messages (undefined)', () => {
      expect(() =>
        validator.validateChatCompletionRequest({ model: 'test', messages: undefined as any }),
      ).toThrow(VeniceValidationError);
    });

    it('throws on null messages', () => {
      expect(() =>
        validator.validateChatCompletionRequest({ model: 'test', messages: null as any }),
      ).toThrow(VeniceValidationError);
    });

    it('throws on empty messages array', () => {
      expect(() =>
        validator.validateChatCompletionRequest({ model: 'test', messages: [] }),
      ).toThrow(VeniceValidationError);
    });

    it('error message mentions messages', () => {
      expect(() =>
        validator.validateChatCompletionRequest({ model: 'test', messages: [] }),
      ).toThrow(/messages/);
    });

    it('throws on non-array messages (string)', () => {
      expect(() =>
        validator.validateChatCompletionRequest({ model: 'test', messages: 'hello' as any }),
      ).toThrow(VeniceValidationError);
    });
  });

  // =========================================================================
  // validateChatCompletionRequest — message role validation
  // =========================================================================

  describe('message role validation', () => {
    it('throws on invalid message role', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({ messages: [{ role: 'invalid' as any, content: 'hi' }] }),
        ),
      ).toThrow(VeniceValidationError);
    });

    it('error message mentions the role field', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({ messages: [{ role: 'bad' as any, content: 'hi' }] }),
        ),
      ).toThrow(/role/);
    });

    it('throws on missing role (undefined)', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({ messages: [{ role: undefined as any, content: 'hi' }] }),
        ),
      ).toThrow(VeniceValidationError);
    });

    it('throws on null role', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({ messages: [{ role: null as any, content: 'hi' }] }),
        ),
      ).toThrow(VeniceValidationError);
    });

    it('throws on numeric role', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({ messages: [{ role: 42 as any, content: 'hi' }] }),
        ),
      ).toThrow(VeniceValidationError);
    });

    it('validates role for each message in the array', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            messages: [
              { role: 'user', content: 'hi' },
              { role: 'wrong' as any, content: 'hello' },
            ],
          }),
        ),
      ).toThrow(VeniceValidationError);
    });
  });

  // =========================================================================
  // validateChatCompletionRequest — message content validation
  // =========================================================================

  describe('message content validation', () => {
    it('throws on missing content (undefined)', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({ messages: [{ role: 'user', content: undefined as any }] }),
        ),
      ).toThrow(VeniceValidationError);
    });

    it('throws on null content', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({ messages: [{ role: 'user', content: null as any }] }),
        ),
      ).toThrow(VeniceValidationError);
    });

    it('throws on empty string content', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({ messages: [{ role: 'user', content: '' }] }),
        ),
      ).toThrow(VeniceValidationError);
    });

    it('throws on content that is neither string nor array (number)', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({ messages: [{ role: 'user', content: 42 as any }] }),
        ),
      ).toThrow(VeniceValidationError);
    });

    it('error message mentions content', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({ messages: [{ role: 'user', content: 42 as any }] }),
        ),
      ).toThrow(/content/);
    });

    it('throws on empty content array', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({ messages: [{ role: 'user', content: [] }] }),
        ),
      ).toThrow(VeniceValidationError);
    });
  });

  // =========================================================================
  // validateChatCompletionRequest — multimodal content item validation
  // =========================================================================

  describe('content item validation', () => {
    it('throws on content item with missing type', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            messages: [{ role: 'user', content: [{ text: 'hello' } as any] }],
          }),
        ),
      ).toThrow(VeniceValidationError);
    });

    it('throws on content item with invalid type', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            messages: [{ role: 'user', content: [{ type: 'video' as any, text: 'hello' }] }],
          }),
        ),
      ).toThrow(VeniceValidationError);
    });

    it('throws on text content item with missing text', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            messages: [{ role: 'user', content: [{ type: 'text', text: undefined as any }] }],
          }),
        ),
      ).toThrow(VeniceValidationError);
    });

    it('throws on text content item with empty text', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            messages: [{ role: 'user', content: [{ type: 'text', text: '' }] }],
          }),
        ),
      ).toThrow(VeniceValidationError);
    });

    it('throws on image_url content item with missing image_url object', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            messages: [{ role: 'user', content: [{ type: 'image_url' } as any] }],
          }),
        ),
      ).toThrow(VeniceValidationError);
    });

    it('throws on image_url content item with missing url', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            messages: [
              {
                role: 'user',
                content: [{ type: 'image_url', image_url: { url: '' } } as any],
              },
            ],
          }),
        ),
      ).toThrow(VeniceValidationError);
    });

    it('accepts valid image_url content item', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'image_url', image_url: { url: 'https://example.com/img.png' } },
                ],
              },
            ],
          }),
        ),
      ).not.toThrow();
    });

    it('accepts mixed text and image content items', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Look at this:' },
                  { type: 'image_url', image_url: { url: 'https://example.com/photo.jpg' } },
                ],
              },
            ],
          }),
        ),
      ).not.toThrow();
    });
  });

  // =========================================================================
  // validateChatCompletionRequest — temperature validation
  // =========================================================================

  describe('temperature validation', () => {
    it('throws on temperature below 0', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ temperature: -0.1 })),
      ).toThrow(VeniceValidationError);
    });

    it('throws on temperature above 2', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ temperature: 2.1 })),
      ).toThrow(VeniceValidationError);
    });

    it('error message mentions temperature', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ temperature: -1 })),
      ).toThrow(/temperature/);
    });

    it('throws on non-number temperature', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ temperature: 'hot' as any })),
      ).toThrow(VeniceValidationError);
    });

    it('throws on NaN temperature', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ temperature: NaN })),
      ).toThrow(VeniceValidationError);
    });

    it('accepts mid-range temperature', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ temperature: 1.0 })),
      ).not.toThrow();
    });
  });

  // =========================================================================
  // validateChatCompletionRequest — top_p validation
  // =========================================================================

  describe('top_p validation', () => {
    it('throws on top_p below 0', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ top_p: -0.01 })),
      ).toThrow(VeniceValidationError);
    });

    it('throws on top_p above 1', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ top_p: 1.01 })),
      ).toThrow(VeniceValidationError);
    });

    it('error message mentions top_p', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ top_p: 5 })),
      ).toThrow(/top_p/);
    });

    it('throws on non-number top_p', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ top_p: 'high' as any })),
      ).toThrow(VeniceValidationError);
    });
  });

  // =========================================================================
  // validateChatCompletionRequest — max_tokens validation
  // =========================================================================

  describe('max_tokens validation', () => {
    it('throws on max_tokens less than 1', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ max_tokens: 0 })),
      ).toThrow(VeniceValidationError);
    });

    it('throws on negative max_tokens', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ max_tokens: -10 })),
      ).toThrow(VeniceValidationError);
    });

    it('error message mentions max_tokens', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ max_tokens: 0 })),
      ).toThrow(/max_tokens/);
    });

    it('throws on non-number max_tokens', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ max_tokens: 'lots' as any })),
      ).toThrow(VeniceValidationError);
    });

    it('accepts large max_tokens', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ max_tokens: 100000 })),
      ).not.toThrow();
    });
  });

  // =========================================================================
  // validateChatCompletionRequest — stream validation
  // =========================================================================

  describe('stream validation', () => {
    it('throws on non-boolean stream (string)', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ stream: 'yes' as any })),
      ).toThrow(VeniceValidationError);
    });

    it('throws on non-boolean stream (number)', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ stream: 1 as any })),
      ).toThrow(VeniceValidationError);
    });

    it('error message mentions stream', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ stream: 'true' as any })),
      ).toThrow(/stream/);
    });
  });

  // =========================================================================
  // validateChatCompletionRequest — undefined optional fields are ignored
  // =========================================================================

  describe('undefined optional fields are ignored', () => {
    it('does not throw when temperature is undefined', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ temperature: undefined })),
      ).not.toThrow();
    });

    it('does not throw when top_p is undefined', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ top_p: undefined })),
      ).not.toThrow();
    });

    it('does not throw when max_tokens is undefined', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ max_tokens: undefined })),
      ).not.toThrow();
    });

    it('does not throw when stream is undefined', () => {
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ stream: undefined })),
      ).not.toThrow();
    });
  });

  // =========================================================================
  // validateChatCompletionRequest — request-level validation
  // =========================================================================

  describe('request-level validation', () => {
    it('throws on null request', () => {
      expect(() =>
        validator.validateChatCompletionRequest(null as any),
      ).toThrow(VeniceValidationError);
    });

    it('throws on undefined request', () => {
      expect(() =>
        validator.validateChatCompletionRequest(undefined as any),
      ).toThrow(VeniceValidationError);
    });
  });

  // =========================================================================
  // Edge cases
  // =========================================================================

  describe('edge cases', () => {
    it('validates all messages in the array (error in last message)', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            messages: [
              { role: 'user', content: 'hi' },
              { role: 'assistant', content: 'hello' },
              { role: 'user', content: '' }, // empty content
            ],
          }),
        ),
      ).toThrow(VeniceValidationError);
    });

    it('error includes index in message when role is invalid', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            messages: [
              { role: 'user', content: 'ok' },
              { role: 'unknown' as any, content: 'test' },
            ],
          }),
        ),
      ).toThrow(/messages\[1\]/);
    });

    it('error includes index in message when content is invalid', () => {
      expect(() =>
        validator.validateChatCompletionRequest(
          minimalRequest({
            messages: [
              { role: 'user', content: 'ok' },
              { role: 'user', content: 42 as any },
            ],
          }),
        ),
      ).toThrow(/messages\[1\]/);
    });

    it('accepts a very long messages array', () => {
      const messages: ChatCompletionMessage[] = [];
      for (let i = 0; i < 100; i++) {
        messages.push({ role: i % 2 === 0 ? 'user' : 'assistant', content: `Message ${i}` });
      }
      expect(() =>
        validator.validateChatCompletionRequest(minimalRequest({ messages })),
      ).not.toThrow();
    });
  });
});
