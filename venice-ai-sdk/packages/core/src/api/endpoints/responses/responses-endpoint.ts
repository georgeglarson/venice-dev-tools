import { ApiEndpoint } from '../../registry/endpoint';
import type { VeniceClient } from '../../../client';
import type { CreateResponseRequest, CreateResponseResponse } from '../../../types/responses';
import { parseSSEStream } from '../../../utils/stream-parser';
import { VeniceStreamError } from '../../../errors';

/**
 * API endpoint for the Responses API (Alpha).
 *
 * Provides a structured output format with typed blocks for reasoning,
 * messages, function calls, and web search results.
 *
 * Note: E2EE-capable models are not supported. Use chat completions instead.
 */
export class ResponsesEndpoint extends ApiEndpoint {
  constructor(client: VeniceClient) {
    super(client);
  }

  getEndpointPath(): string {
    return '/responses';
  }

  /**
   * Create a model response.
   *
   * @param request - The response request parameters
   * @returns A promise resolving to the response, or an async generator if stream=true
   */
  public create(request: CreateResponseRequest): Promise<CreateResponseResponse> | AsyncGenerator<unknown, void, unknown> {
    if (request.stream) {
      return this._stream(request);
    }
    return this._create(request);
  }

  private async _create(request: CreateResponseRequest): Promise<CreateResponseResponse> {
    this.emit('request', { type: 'responses.create', data: request });

    const response = await this.http.post<CreateResponseResponse>(
      this.getEndpointPath(),
      request
    );

    this.emit('response', { type: 'responses.create', data: response.data });
    return response.data;
  }

  private async *_stream(request: CreateResponseRequest): AsyncGenerator<unknown, void, unknown> {
    const streamingRequest = { ...request, stream: true };
    this.emit('request', { type: 'responses.create.stream', data: streamingRequest });

    const response = await this.streamingHttp.stream(
      this.getEndpointPath(),
      streamingRequest
    );

    try {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new VeniceStreamError('Stream response body is null');
      }

      for await (const chunk of parseSSEStream(reader, this.logger)) {
        yield chunk;
      }
    } finally {
      this.emit('response', { type: 'responses.create.stream', data: { status: 'completed' } });
    }
  }
}

export default ResponsesEndpoint;
