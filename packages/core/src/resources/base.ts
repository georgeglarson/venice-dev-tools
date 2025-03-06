import { HttpAdapter } from '../http/client';

export abstract class Resource {
  constructor(
    protected httpAdapter: HttpAdapter,
    protected resourcePath: string
  ) {}

  protected async request<T>(options: {
    method: string;
    path: string;
    body?: any;
    query?: Record<string, any>;
  }): Promise<T> {
    const url = `${this.resourcePath}${options.path}`;
    return this.httpAdapter.request<T>({
      method: options.method,
      url,
      body: options.body,
      query: options.query
    });
  }
}