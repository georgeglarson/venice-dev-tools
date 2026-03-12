import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageGenerationEndpoint } from './generation/image-generation-endpoint';
import { ImageUpscaleEndpoint } from './upscale/image-upscale-endpoint';
import { ImageStylesEndpoint } from './styles/image-styles-endpoint';
import { ImageEditEndpoint } from './edit/image-edit-endpoint';
import { ImageMultiEditEndpoint } from './multi-edit/image-multi-edit-endpoint';
import { ImageRemoveBackgroundEndpoint } from './remove-background/image-remove-background-endpoint';
import { ImagesEndpoint } from './index';
import { VeniceValidationError, VeniceApiError } from '../../../errors';

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------
function createMockClient(overrides: Record<string, any> = {}) {
  const mockHttp = {
    post: vi.fn().mockResolvedValue({ data: {}, headers: {}, status: 200 }),
    get: vi.fn().mockResolvedValue({ data: {}, headers: {}, status: 200 }),
    getBaseUrl: vi.fn().mockReturnValue('https://api.venice.ai/api/v1'),
    ...overrides.http,
  };
  const mockStreamingHttp = {
    stream: vi.fn(),
    ...overrides.streamingHttp,
  };
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    ...overrides.logger,
  };
  return {
    getStandardHttpClient: vi.fn().mockReturnValue(mockHttp),
    getStreamingHttpClient: vi.fn().mockReturnValue(mockStreamingHttp),
    getLogger: vi.fn().mockReturnValue(mockLogger),
    emit: vi.fn().mockReturnValue(true),
    getApiKey: vi.fn().mockReturnValue('test-api-key'),
    _mockHttp: mockHttp,
    _mockStreamingHttp: mockStreamingHttp,
    _mockLogger: mockLogger,
  } as any;
}

// =========================================================================
// ImageGenerationEndpoint
// =========================================================================
describe('ImageGenerationEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: ImageGenerationEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new ImageGenerationEndpoint(client);
  });

  it('getEndpointPath() returns /image', () => {
    expect(endpoint.getEndpointPath()).toBe('/image');
  });

  it('generate() calls http.post with /image/generate', async () => {
    const request = { model: 'test-model', prompt: 'a cat' };
    client._mockHttp.post.mockResolvedValue({
      data: { id: '1', images: ['base64data'] },
      headers: {},
      status: 200,
    });

    await endpoint.generate(request);

    expect(client._mockHttp.post).toHaveBeenCalledWith('/image/generate', request);
  });

  it('generate() passes the full request body to http.post', async () => {
    const request = {
      model: 'flux',
      prompt: 'sunset over ocean',
      negative_prompt: 'blurry',
      width: 512,
      height: 512,
      steps: 30,
      cfg_scale: 7,
      seed: 42,
    };
    client._mockHttp.post.mockResolvedValue({
      data: { id: '1', images: ['img'] },
      headers: {},
      status: 200,
    });

    await endpoint.generate(request);

    expect(client._mockHttp.post).toHaveBeenCalledWith('/image/generate', request);
  });

  it('generate() returns response.data', async () => {
    const responseData = { id: 'abc', images: ['img1', 'img2'] };
    client._mockHttp.post.mockResolvedValue({
      data: responseData,
      headers: {},
      status: 200,
    });

    const result = await endpoint.generate({ model: 'm', prompt: 'p' });

    expect(result.id).toBe('abc');
    expect(result.images).toEqual(['img1', 'img2']);
  });

  it('generate() maps single image to data field for backward compatibility', async () => {
    client._mockHttp.post.mockResolvedValue({
      data: { id: '1', images: ['only-image'] },
      headers: {},
      status: 200,
    });

    const result = await endpoint.generate({ model: 'm', prompt: 'p' });

    expect(result.data).toBe('only-image');
  });

  it('generate() maps multiple images to data array for backward compatibility', async () => {
    client._mockHttp.post.mockResolvedValue({
      data: { id: '1', images: ['img1', 'img2', 'img3'] },
      headers: {},
      status: 200,
    });

    const result = await endpoint.generate({ model: 'm', prompt: 'p' });

    expect(result.data).toEqual(['img1', 'img2', 'img3']);
  });

  it('generate() does not overwrite existing data field', async () => {
    client._mockHttp.post.mockResolvedValue({
      data: { id: '1', images: ['img1'], data: 'already-set' },
      headers: {},
      status: 200,
    });

    const result = await endpoint.generate({ model: 'm', prompt: 'p' });

    expect(result.data).toBe('already-set');
  });

  it('generate() extracts x-venice-is-content-violation header', async () => {
    const emitSpy = client.emit;
    client._mockHttp.post.mockResolvedValue({
      data: { id: '1', images: [] },
      headers: { 'x-venice-is-content-violation': 'true' },
      status: 200,
    });

    await endpoint.generate({ model: 'm', prompt: 'p' });

    const responseEvent = emitSpy.mock.calls.find(
      (c: any[]) => c[0] === 'response'
    );
    expect(responseEvent).toBeDefined();
    expect(responseEvent![1].headers['x-venice-is-content-violation']).toBe(true);
  });

  it('generate() extracts x-venice-is-blurred header', async () => {
    const emitSpy = client.emit;
    client._mockHttp.post.mockResolvedValue({
      data: { id: '1', images: [] },
      headers: { 'x-venice-is-blurred': 'true' },
      status: 200,
    });

    await endpoint.generate({ model: 'm', prompt: 'p' });

    const responseEvent = emitSpy.mock.calls.find(
      (c: any[]) => c[0] === 'response'
    );
    expect(responseEvent![1].headers['x-venice-is-blurred']).toBe(true);
  });

  it('generate() sets header booleans to false when header value is not "true"', async () => {
    client._mockHttp.post.mockResolvedValue({
      data: { id: '1', images: [] },
      headers: {
        'x-venice-is-content-violation': 'false',
        'x-venice-is-blurred': 'false',
      },
      status: 200,
    });

    await endpoint.generate({ model: 'm', prompt: 'p' });

    const responseEvent = client.emit.mock.calls.find(
      (c: any[]) => c[0] === 'response'
    );
    expect(responseEvent![1].headers['x-venice-is-content-violation']).toBe(false);
    expect(responseEvent![1].headers['x-venice-is-blurred']).toBe(false);
  });

  it('generate() returns empty headers object when no special headers present', async () => {
    client._mockHttp.post.mockResolvedValue({
      data: { id: '1', images: [] },
      headers: { 'content-type': 'application/json' },
      status: 200,
    });

    await endpoint.generate({ model: 'm', prompt: 'p' });

    const responseEvent = client.emit.mock.calls.find(
      (c: any[]) => c[0] === 'response'
    );
    expect(responseEvent![1].headers).toEqual({});
  });

  it('generate() emits request event with type image.generate', async () => {
    client._mockHttp.post.mockResolvedValue({
      data: { id: '1', images: [] },
      headers: {},
      status: 200,
    });
    const request = { model: 'm', prompt: 'p' };

    await endpoint.generate(request);

    const requestEvent = client.emit.mock.calls.find(
      (c: any[]) => c[0] === 'request'
    );
    expect(requestEvent).toBeDefined();
    expect(requestEvent![1].type).toBe('image.generate');
    expect(requestEvent![1].data).toEqual(request);
  });

  it('generate() emits response event with type image.generate', async () => {
    const responseData = { id: '1', images: ['img'] };
    client._mockHttp.post.mockResolvedValue({
      data: responseData,
      headers: {},
      status: 200,
    });

    await endpoint.generate({ model: 'm', prompt: 'p' });

    const responseEvent = client.emit.mock.calls.find(
      (c: any[]) => c[0] === 'response'
    );
    expect(responseEvent).toBeDefined();
    expect(responseEvent![1].type).toBe('image.generate');
  });

  it('generate() throws VeniceValidationError when model is missing', async () => {
    await expect(
      endpoint.generate({ model: '', prompt: 'p' })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('generate() throws VeniceValidationError for invalid response_format', async () => {
    await expect(
      endpoint.generate({ model: 'x', prompt: 'p', response_format: 'invalid' as any })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('generate() throws VeniceValidationError for null request', async () => {
    await expect(
      endpoint.generate(null as any)
    ).rejects.toThrow(VeniceValidationError);
  });
});

// =========================================================================
// ImageEditEndpoint
// =========================================================================
describe('ImageEditEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: ImageEditEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new ImageEditEndpoint(client);
  });

  it('getEndpointPath() returns /images/edits', () => {
    expect(endpoint.getEndpointPath()).toBe('/images/edits');
  });

  it('edit() calls http.post with correct path', async () => {
    const request = { prompt: 'make it blue', image: 'base64data' };
    client._mockHttp.post.mockResolvedValue({
      data: { created: 123, data: [] },
      headers: {},
      status: 200,
    });

    await endpoint.edit(request);

    expect(client._mockHttp.post).toHaveBeenCalledWith('/images/edits', request);
  });

  it('edit() passes the full request body to http.post', async () => {
    const request = {
      prompt: 'add sunglasses',
      image: 'imgdata',
      modelId: 'editor-v2',
      aspect_ratio: '16:9' as const,
    };
    client._mockHttp.post.mockResolvedValue({
      data: { created: 1, data: [] },
      headers: {},
      status: 200,
    });

    await endpoint.edit(request);

    expect(client._mockHttp.post).toHaveBeenCalledWith('/images/edits', request);
  });

  it('edit() returns response.data', async () => {
    const responseData = { created: 999, data: [{ url: 'http://img' }] };
    client._mockHttp.post.mockResolvedValue({
      data: responseData,
      headers: {},
      status: 200,
    });

    const result = await endpoint.edit({ prompt: 'test', image: 'data' });

    expect(result).toEqual(responseData);
  });

  it('edit() emits request event with image redacted to [binary]', async () => {
    client._mockHttp.post.mockResolvedValue({
      data: { created: 1, data: [] },
      headers: {},
      status: 200,
    });

    await endpoint.edit({ prompt: 'test', image: 'secret-image-data' });

    const requestEvent = client.emit.mock.calls.find(
      (c: any[]) => c[0] === 'request'
    );
    expect(requestEvent).toBeDefined();
    expect(requestEvent![1].type).toBe('image.edit');
    expect(requestEvent![1].data.image).toBe('[binary]');
    expect(requestEvent![1].data.prompt).toBe('test');
  });

  it('edit() emits response event with type image.edit', async () => {
    const responseData = { created: 1, data: [] };
    client._mockHttp.post.mockResolvedValue({
      data: responseData,
      headers: {},
      status: 200,
    });

    await endpoint.edit({ prompt: 'test', image: 'data' });

    const responseEvent = client.emit.mock.calls.find(
      (c: any[]) => c[0] === 'response'
    );
    expect(responseEvent).toBeDefined();
    expect(responseEvent![1].type).toBe('image.edit');
    expect(responseEvent![1].data).toEqual(responseData);
  });

  it('edit() throws VeniceValidationError for missing prompt', async () => {
    await expect(
      endpoint.edit({ prompt: '', image: 'data' })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('edit() throws VeniceValidationError for missing image', async () => {
    await expect(
      endpoint.edit({ prompt: 'hello', image: null as any })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('edit() throws VeniceValidationError for prompt > 32768 chars', async () => {
    const longPrompt = 'x'.repeat(32769);
    await expect(
      endpoint.edit({ prompt: longPrompt, image: 'data' })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('edit() accepts prompt at exactly 32768 chars', async () => {
    const maxPrompt = 'x'.repeat(32768);
    client._mockHttp.post.mockResolvedValue({
      data: { created: 1, data: [] },
      headers: {},
      status: 200,
    });

    await expect(
      endpoint.edit({ prompt: maxPrompt, image: 'data' })
    ).resolves.toBeDefined();
  });

  it('edit() throws VeniceValidationError for invalid aspect_ratio', async () => {
    await expect(
      endpoint.edit({ prompt: 'test', image: 'data', aspect_ratio: '5:3' as any })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('edit() throws VeniceValidationError for null request', async () => {
    await expect(
      endpoint.edit(null as any)
    ).rejects.toThrow(VeniceValidationError);
  });
});

// =========================================================================
// ImageMultiEditEndpoint
// =========================================================================
describe('ImageMultiEditEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: ImageMultiEditEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new ImageMultiEditEndpoint(client);
  });

  it('getEndpointPath() returns /images/multi-edit', () => {
    expect(endpoint.getEndpointPath()).toBe('/images/multi-edit');
  });

  it('edit() calls http.post with correct path', async () => {
    const request = { prompt: 'merge them', images: ['img1'] };
    client._mockHttp.post.mockResolvedValue({
      data: { created: 1, data: [] },
      headers: {},
      status: 200,
    });

    await endpoint.edit(request);

    expect(client._mockHttp.post).toHaveBeenCalledWith('/images/multi-edit', request);
  });

  it('edit() returns response.data', async () => {
    const responseData = { created: 42, data: [{ url: 'http://result' }] };
    client._mockHttp.post.mockResolvedValue({
      data: responseData,
      headers: {},
      status: 200,
    });

    const result = await endpoint.edit({ prompt: 'combine', images: ['a'] });

    expect(result).toEqual(responseData);
  });

  it('edit() emits request event with image count instead of binary data', async () => {
    client._mockHttp.post.mockResolvedValue({
      data: { created: 1, data: [] },
      headers: {},
      status: 200,
    });

    await endpoint.edit({ prompt: 'test', images: ['a', 'b'] });

    const requestEvent = client.emit.mock.calls.find(
      (c: any[]) => c[0] === 'request'
    );
    expect(requestEvent).toBeDefined();
    expect(requestEvent![1].type).toBe('image.multi-edit');
    expect(requestEvent![1].data.images).toBe('[2 images]');
  });

  it('edit() emits response event', async () => {
    const responseData = { created: 1, data: [] };
    client._mockHttp.post.mockResolvedValue({
      data: responseData,
      headers: {},
      status: 200,
    });

    await endpoint.edit({ prompt: 'test', images: ['a'] });

    const responseEvent = client.emit.mock.calls.find(
      (c: any[]) => c[0] === 'response'
    );
    expect(responseEvent).toBeDefined();
    expect(responseEvent![1].type).toBe('image.multi-edit');
    expect(responseEvent![1].data).toEqual(responseData);
  });

  it('edit() throws VeniceValidationError for missing prompt', async () => {
    await expect(
      endpoint.edit({ prompt: '', images: ['a'] })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('edit() throws VeniceValidationError for missing images', async () => {
    await expect(
      endpoint.edit({ prompt: 'test', images: null as any })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('edit() throws VeniceValidationError for empty images array', async () => {
    await expect(
      endpoint.edit({ prompt: 'test', images: [] })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('edit() throws VeniceValidationError for > 3 images', async () => {
    await expect(
      endpoint.edit({ prompt: 'test', images: ['a', 'b', 'c', 'd'] })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('edit() accepts exactly 3 images', async () => {
    client._mockHttp.post.mockResolvedValue({
      data: { created: 1, data: [] },
      headers: {},
      status: 200,
    });

    await expect(
      endpoint.edit({ prompt: 'test', images: ['a', 'b', 'c'] })
    ).resolves.toBeDefined();
  });

  it('edit() throws VeniceValidationError for prompt > 32768 chars', async () => {
    const longPrompt = 'a'.repeat(32769);
    await expect(
      endpoint.edit({ prompt: longPrompt, images: ['a'] })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('edit() throws VeniceValidationError for null request', async () => {
    await expect(
      endpoint.edit(null as any)
    ).rejects.toThrow(VeniceValidationError);
  });
});

// =========================================================================
// ImageRemoveBackgroundEndpoint
// =========================================================================
describe('ImageRemoveBackgroundEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: ImageRemoveBackgroundEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new ImageRemoveBackgroundEndpoint(client);
  });

  it('getEndpointPath() returns /images/remove-background', () => {
    expect(endpoint.getEndpointPath()).toBe('/images/remove-background');
  });

  it('remove() calls http.post with correct path', async () => {
    const request = { image: 'base64data' };
    client._mockHttp.post.mockResolvedValue({
      data: { created: 1, data: [] },
      headers: {},
      status: 200,
    });

    await endpoint.remove(request);

    expect(client._mockHttp.post).toHaveBeenCalledWith('/images/remove-background', request);
  });

  it('remove() works with image parameter', async () => {
    client._mockHttp.post.mockResolvedValue({
      data: { created: 1, data: [{ b64_json: 'result' }] },
      headers: {},
      status: 200,
    });

    const result = await endpoint.remove({ image: 'base64data' });

    expect(result.created).toBe(1);
  });

  it('remove() works with image_url parameter', async () => {
    client._mockHttp.post.mockResolvedValue({
      data: { created: 1, data: [{ url: 'http://result' }] },
      headers: {},
      status: 200,
    });

    const result = await endpoint.remove({ image_url: 'https://example.com/img.png' });

    expect(result.created).toBe(1);
    expect(client._mockHttp.post).toHaveBeenCalledWith(
      '/images/remove-background',
      { image_url: 'https://example.com/img.png' }
    );
  });

  it('remove() returns response.data', async () => {
    const responseData = { created: 100, data: [{ b64_json: 'abc' }] };
    client._mockHttp.post.mockResolvedValue({
      data: responseData,
      headers: {},
      status: 200,
    });

    const result = await endpoint.remove({ image: 'data' });

    expect(result).toEqual(responseData);
  });

  it('remove() emits request event with image redacted when using image', async () => {
    client._mockHttp.post.mockResolvedValue({
      data: { created: 1, data: [] },
      headers: {},
      status: 200,
    });

    await endpoint.remove({ image: 'secret-binary' });

    const requestEvent = client.emit.mock.calls.find(
      (c: any[]) => c[0] === 'request'
    );
    expect(requestEvent).toBeDefined();
    expect(requestEvent![1].type).toBe('image.remove-background');
    expect(requestEvent![1].data).toEqual({ image: '[binary]' });
  });

  it('remove() emits request event with image_url when using image_url', async () => {
    client._mockHttp.post.mockResolvedValue({
      data: { created: 1, data: [] },
      headers: {},
      status: 200,
    });

    await endpoint.remove({ image_url: 'https://example.com/img.png' });

    const requestEvent = client.emit.mock.calls.find(
      (c: any[]) => c[0] === 'request'
    );
    expect(requestEvent![1].data).toEqual({ image_url: 'https://example.com/img.png' });
  });

  it('remove() emits response event', async () => {
    const responseData = { created: 1, data: [] };
    client._mockHttp.post.mockResolvedValue({
      data: responseData,
      headers: {},
      status: 200,
    });

    await endpoint.remove({ image: 'data' });

    const responseEvent = client.emit.mock.calls.find(
      (c: any[]) => c[0] === 'response'
    );
    expect(responseEvent).toBeDefined();
    expect(responseEvent![1].type).toBe('image.remove-background');
    expect(responseEvent![1].data).toEqual(responseData);
  });

  it('remove() throws VeniceValidationError when neither image nor image_url provided', async () => {
    await expect(
      endpoint.remove({})
    ).rejects.toThrow(VeniceValidationError);
  });

  it('remove() throws VeniceValidationError when both image and image_url provided', async () => {
    await expect(
      endpoint.remove({ image: 'data', image_url: 'https://example.com/img.png' })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('remove() throws VeniceValidationError for invalid image_url', async () => {
    await expect(
      endpoint.remove({ image_url: 'not-a-url' })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('remove() throws VeniceValidationError for null request', async () => {
    await expect(
      endpoint.remove(null as any)
    ).rejects.toThrow(VeniceValidationError);
  });
});

// =========================================================================
// ImageUpscaleEndpoint
// =========================================================================
describe('ImageUpscaleEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: ImageUpscaleEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new ImageUpscaleEndpoint(client);
  });

  it('getEndpointPath() returns /image', () => {
    expect(endpoint.getEndpointPath()).toBe('/image');
  });

  it('upscale() constructs the correct URL using base URL and path', async () => {
    const mockBlob = new Blob(['result'], { type: 'image/png' });
    const mockResponse = {
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    await endpoint.upscale({ image: new Blob(['test']) });

    expect(fetch).toHaveBeenCalledWith(
      'https://api.venice.ai/api/v1/image/upscale',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer test-api-key' },
      })
    );

    vi.unstubAllGlobals();
  });

  it('upscale() sends FormData with image blob', async () => {
    const mockBlob = new Blob(['result'], { type: 'image/png' });
    const mockResponse = {
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    await endpoint.upscale({ image: new Blob(['img-data'], { type: 'image/jpeg' }) });

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    expect(fetchCall[1]!.body).toBeInstanceOf(FormData);

    vi.unstubAllGlobals();
  });

  it('upscale() appends scale to FormData when provided', async () => {
    const mockBlob = new Blob(['result']);
    const mockResponse = {
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const appendSpy = vi.spyOn(FormData.prototype, 'append');

    await endpoint.upscale({ image: new Blob(['test']), scale: 4 });

    const scaleCall = appendSpy.mock.calls.find((c) => c[0] === 'scale');
    expect(scaleCall).toBeDefined();
    expect(scaleCall![1]).toBe('4');

    appendSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('upscale() does not append scale when not provided', async () => {
    const mockBlob = new Blob(['result']);
    const mockResponse = {
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const appendSpy = vi.spyOn(FormData.prototype, 'append');

    await endpoint.upscale({ image: new Blob(['test']) });

    const scaleCall = appendSpy.mock.calls.find((c) => c[0] === 'scale');
    expect(scaleCall).toBeUndefined();

    appendSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('upscale() returns the response blob', async () => {
    const mockBlob = new Blob(['upscaled-image'], { type: 'image/png' });
    const mockResponse = {
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const result = await endpoint.upscale({ image: new Blob(['test']) });

    expect(result).toBe(mockBlob);

    vi.unstubAllGlobals();
  });

  it('upscale() emits request event', async () => {
    const mockBlob = new Blob(['result']);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    }));

    const params = { image: new Blob(['test']), scale: 2 };
    await endpoint.upscale(params);

    const requestEvent = client.emit.mock.calls.find(
      (c: any[]) => c[0] === 'request'
    );
    expect(requestEvent).toBeDefined();
    expect(requestEvent![1].type).toBe('image.upscale');

    vi.unstubAllGlobals();
  });

  it('upscale() emits response event with blob size and type', async () => {
    const mockBlob = new Blob(['upscaled-image-data'], { type: 'image/png' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    }));

    await endpoint.upscale({ image: new Blob(['test']) });

    const responseEvent = client.emit.mock.calls.find(
      (c: any[]) => c[0] === 'response'
    );
    expect(responseEvent).toBeDefined();
    expect(responseEvent![1].type).toBe('image.upscale');
    expect(responseEvent![1].data.size).toBe(mockBlob.size);
    expect(responseEvent![1].data.type).toBe('image/png');

    vi.unstubAllGlobals();
  });

  it('upscale() throws VeniceApiError on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ error: 'Internal Server Error' }),
    }));

    await expect(
      endpoint.upscale({ image: new Blob(['test']) })
    ).rejects.toThrow(VeniceApiError);

    vi.unstubAllGlobals();
  });

  it('upscale() throws VeniceApiError with status from response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 413,
      json: vi.fn().mockResolvedValue({ error: 'Image too large' }),
    }));

    try {
      await endpoint.upscale({ image: new Blob(['test']) });
      expect.fail('Should have thrown');
    } catch (err: any) {
      expect(err).toBeInstanceOf(VeniceApiError);
      expect(err.status).toBe(413);
    }

    vi.unstubAllGlobals();
  });

  it('upscale() handles non-JSON error response gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: vi.fn().mockRejectedValue(new Error('not json')),
    }));

    await expect(
      endpoint.upscale({ image: new Blob(['test']) })
    ).rejects.toThrow(VeniceApiError);

    vi.unstubAllGlobals();
  });

  it('upscale() throws VeniceValidationError for missing image', async () => {
    await expect(
      endpoint.upscale({ image: null as any })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('upscale() throws VeniceValidationError for null params', async () => {
    await expect(
      endpoint.upscale(null as any)
    ).rejects.toThrow(VeniceValidationError);
  });

  it('upscale() converts base64 string image to Blob', async () => {
    const mockBlob = new Blob(['result']);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    }));

    const appendSpy = vi.spyOn(FormData.prototype, 'append');

    await endpoint.upscale({ image: 'aGVsbG8=' }); // "hello" in base64

    const imageCall = appendSpy.mock.calls.find((c) => c[0] === 'image');
    expect(imageCall).toBeDefined();
    expect(imageCall![1]).toBeInstanceOf(Blob);

    appendSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('upscale() converts data URI string to Blob with correct MIME type', async () => {
    const mockBlob = new Blob(['result']);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    }));

    const appendSpy = vi.spyOn(FormData.prototype, 'append');

    await endpoint.upscale({ image: 'data:image/png;base64,aGVsbG8=' });

    const imageCall = appendSpy.mock.calls.find((c) => c[0] === 'image');
    expect(imageCall).toBeDefined();
    const blob = imageCall![1] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');

    appendSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('upscale() converts ArrayBuffer to Blob', async () => {
    const mockBlob = new Blob(['result']);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    }));

    const appendSpy = vi.spyOn(FormData.prototype, 'append');
    const buffer = new ArrayBuffer(8);

    await endpoint.upscale({ image: buffer });

    const imageCall = appendSpy.mock.calls.find((c) => c[0] === 'image');
    expect(imageCall![1]).toBeInstanceOf(Blob);

    appendSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});

// =========================================================================
// ImageStylesEndpoint
// =========================================================================
describe('ImageStylesEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: ImageStylesEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new ImageStylesEndpoint(client);
  });

  it('getEndpointPath() returns /image', () => {
    expect(endpoint.getEndpointPath()).toBe('/image');
  });

  it('listStyles() calls http.get with /image/styles', async () => {
    const stylesData = {
      styles: [{ name: 'anime', description: 'Anime style', available: true }],
    };
    client._mockHttp.get.mockResolvedValue({
      data: stylesData,
      headers: {},
      status: 200,
    });

    await endpoint.listStyles();

    expect(client._mockHttp.get).toHaveBeenCalledWith('/image/styles');
  });

  it('listStyles() returns response.data', async () => {
    const stylesData = {
      styles: [
        { name: 'realistic', description: 'Photorealistic', available: true },
        { name: 'cartoon', description: 'Cartoon style', available: false },
      ],
    };
    client._mockHttp.get.mockResolvedValue({
      data: stylesData,
      headers: {},
      status: 200,
    });

    const result = await endpoint.listStyles();

    expect(result).toEqual(stylesData);
    expect(result.styles).toHaveLength(2);
  });

  it('listStyles() emits request event with type image.styles', async () => {
    client._mockHttp.get.mockResolvedValue({
      data: { styles: [] },
      headers: {},
      status: 200,
    });

    await endpoint.listStyles();

    const requestEvent = client.emit.mock.calls.find(
      (c: any[]) => c[0] === 'request'
    );
    expect(requestEvent).toBeDefined();
    expect(requestEvent![1].type).toBe('image.styles');
  });

  it('listStyles() emits response event with type image.styles', async () => {
    const stylesData = { styles: [] };
    client._mockHttp.get.mockResolvedValue({
      data: stylesData,
      headers: {},
      status: 200,
    });

    await endpoint.listStyles();

    const responseEvent = client.emit.mock.calls.find(
      (c: any[]) => c[0] === 'response'
    );
    expect(responseEvent).toBeDefined();
    expect(responseEvent![1].type).toBe('image.styles');
    expect(responseEvent![1].data).toEqual(stylesData);
  });
});

// =========================================================================
// ImagesEndpoint (facade)
// =========================================================================
describe('ImagesEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let facade: ImagesEndpoint;

  beforeEach(() => {
    client = createMockClient();
    facade = new ImagesEndpoint(client);
  });

  it('getEndpointPath() returns /image', () => {
    expect(facade.getEndpointPath()).toBe('/image');
  });

  it('delegates generate() to ImageGenerationEndpoint', async () => {
    const responseData = { id: '1', images: ['img'] };
    client._mockHttp.post.mockResolvedValue({
      data: responseData,
      headers: {},
      status: 200,
    });

    const result = await facade.generate({ model: 'm', prompt: 'p' });

    expect(result.id).toBe('1');
    expect(client._mockHttp.post).toHaveBeenCalledWith('/image/generate', { model: 'm', prompt: 'p' });
  });

  it('delegates upscale() to ImageUpscaleEndpoint', async () => {
    const mockBlob = new Blob(['result'], { type: 'image/png' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    }));

    const result = await facade.upscale({ image: new Blob(['test']) });

    expect(result).toBe(mockBlob);

    vi.unstubAllGlobals();
  });

  it('delegates edit() to ImageEditEndpoint', async () => {
    client._mockHttp.post.mockResolvedValue({
      data: { created: 1, data: [] },
      headers: {},
      status: 200,
    });

    const result = await facade.edit({ prompt: 'test', image: 'data' });

    expect(result.created).toBe(1);
    expect(client._mockHttp.post).toHaveBeenCalledWith('/images/edits', { prompt: 'test', image: 'data' });
  });

  it('delegates multiEdit() to ImageMultiEditEndpoint', async () => {
    client._mockHttp.post.mockResolvedValue({
      data: { created: 2, data: [] },
      headers: {},
      status: 200,
    });

    const result = await facade.multiEdit({ prompt: 'merge', images: ['a', 'b'] });

    expect(result.created).toBe(2);
    expect(client._mockHttp.post).toHaveBeenCalledWith('/images/multi-edit', { prompt: 'merge', images: ['a', 'b'] });
  });

  it('delegates removeBackground() to ImageRemoveBackgroundEndpoint', async () => {
    client._mockHttp.post.mockResolvedValue({
      data: { created: 3, data: [] },
      headers: {},
      status: 200,
    });

    const result = await facade.removeBackground({ image: 'data' });

    expect(result.created).toBe(3);
    expect(client._mockHttp.post).toHaveBeenCalledWith('/images/remove-background', { image: 'data' });
  });

  it('delegates listStyles() to ImageStylesEndpoint', async () => {
    const stylesData = {
      styles: [{ name: 'oil', description: 'Oil painting', available: true }],
    };
    client._mockHttp.get.mockResolvedValue({
      data: stylesData,
      headers: {},
      status: 200,
    });

    const result = await facade.listStyles();

    expect(result).toEqual(stylesData);
    expect(client._mockHttp.get).toHaveBeenCalledWith('/image/styles');
  });

  it('facade propagates validation errors from delegated endpoints', async () => {
    await expect(
      facade.generate({ model: '', prompt: 'p' })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('facade propagates validation errors from edit delegation', async () => {
    await expect(
      facade.edit({ prompt: '', image: 'data' })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('facade propagates validation errors from multiEdit delegation', async () => {
    await expect(
      facade.multiEdit({ prompt: 'test', images: [] })
    ).rejects.toThrow(VeniceValidationError);
  });

  it('facade propagates validation errors from removeBackground delegation', async () => {
    await expect(
      facade.removeBackground({})
    ).rejects.toThrow(VeniceValidationError);
  });
});
