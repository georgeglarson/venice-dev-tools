export interface HttpAdapter {
  request<T>(options: {
    method: string;
    url: string;
    body?: any;
    query?: Record<string, any>;
  }): Promise<T>;
}

export class NodeHttpAdapter implements HttpAdapter {
  async request<T>(options: {
    method: string;
    url: string;
    body?: any;
    query?: Record<string, any>;
  }): Promise<T> {
    const response = await fetch(options.url, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}