import { VeniceClient } from '../../client';
import { ApiEndpoint } from './endpoint';

/**
 * Registry for API endpoints in the Venice AI SDK.
 * Manages the creation and retrieval of endpoint instances.
 */
export class EndpointRegistry {
  /**
   * Map of endpoint names to endpoint classes.
   */
  private endpointClasses: Map<string, new (client: VeniceClient) => ApiEndpoint> = new Map();

  /**
   * Map of endpoint instances by name.
   */
  private endpoints: Map<string, ApiEndpoint> = new Map();

  /**
   * The parent client that owns this registry.
   */
  private client: VeniceClient;

  /**
   * Create a new endpoint registry.
   * @param client - The Venice client that owns this registry.
   */
  constructor(client: VeniceClient) {
    this.client = client;
  }

  /**
   * Register a new endpoint type.
   * @param name - The name of the endpoint.
   * @param EndpointClass - The endpoint class.
   * @returns This registry instance.
   */
  public register<T extends ApiEndpoint>(
    name: string, 
    EndpointClass: new (client: VeniceClient) => T
  ): EndpointRegistry {
    this.endpointClasses.set(name, EndpointClass);
    return this;
  }

  /**
   * Get an endpoint instance by name.
   * @param name - The name of the endpoint.
   * @returns The endpoint instance.
   * @throws Error if the endpoint is not registered.
   */
  public get<T extends ApiEndpoint>(name: string): T {
    // Return cached instance if it exists
    if (this.endpoints.has(name)) {
      return this.endpoints.get(name) as T;
    }

    // Create a new instance if the endpoint class is registered
    const EndpointClass = this.endpointClasses.get(name);
    if (!EndpointClass) {
      throw new Error(`Endpoint '${name}' not registered`);
    }

    // Create and cache the endpoint instance
    const endpoint = new EndpointClass(this.client);
    this.endpoints.set(name, endpoint);

    return endpoint as T;
  }

  /**
   * Check if an endpoint is registered.
   * @param name - The name of the endpoint.
   * @returns Whether the endpoint is registered.
   */
  public has(name: string): boolean {
    return this.endpointClasses.has(name);
  }

  /**
   * Get a list of registered endpoint names.
   * @returns The list of registered endpoint names.
   */
  public getRegisteredEndpoints(): string[] {
    return Array.from(this.endpointClasses.keys());
  }

  /**
   * Remove an endpoint from the registry.
   * @param name - The name of the endpoint.
   * @returns Whether the endpoint was removed.
   */
  public unregister(name: string): boolean {
    this.endpoints.delete(name);
    return this.endpointClasses.delete(name);
  }

  /**
   * Clear all registered endpoints.
   */
  public clear(): void {
    this.endpoints.clear();
    this.endpointClasses.clear();
  }
}