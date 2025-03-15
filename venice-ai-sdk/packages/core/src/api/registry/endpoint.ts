import { VeniceClient } from '../../client';
import { StandardHttpClient } from '../../http/standard/standard-http-client';
import { StreamingHttpClient } from '../../http/streaming/streaming-http-client';

/**
 * Base class for all API endpoints in the Venice AI SDK.
 * Provides common functionality for interacting with the Venice AI API.
 */
export abstract class ApiEndpoint {
  /**
   * The standard HTTP client used for making API requests.
   */
  protected http: StandardHttpClient;

  /**
   * The streaming HTTP client used for making streaming API requests.
   */
  protected streamingHttp: StreamingHttpClient;

  /**
   * The parent client that owns this endpoint.
   */
  protected client: VeniceClient;

  /**
   * Create a new API endpoint.
   * @param client - The Venice client that owns this endpoint.
   */
  constructor(client: VeniceClient) {
    this.client = client;
    this.http = client.getStandardHttpClient();
    this.streamingHttp = client.getStreamingHttpClient();
  }

  /**
   * Get the endpoint path for the API request.
   * This should be implemented by each specific endpoint class.
   */
  abstract getEndpointPath(): string;

  /**
   * Get a complete API path by combining the endpoint path with a subpath.
   * @param subpath - The subpath to append to the endpoint path.
   * @returns The complete API path.
   */
  protected getPath(subpath: string = ''): string {
    const base = this.getEndpointPath();
    if (subpath && !subpath.startsWith('/')) {
      return `${base}/${subpath}`;
    }
    return `${base}${subpath}`;
  }

  /**
   * Emit an event via the parent client.
   * @param event - The event name.
   * @param args - The event arguments.
   */
  protected emit(event: string, ...args: any[]): boolean {
    return (this.client as any).emit(event, ...args);
  }
}

export default ApiEndpoint;