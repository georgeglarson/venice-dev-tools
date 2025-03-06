import { Resource } from './base';

export class ModelsResource extends Resource {
  async list() {
    return this.request({
      method: 'GET',
      path: '/'
    });
  }

  async get(modelId: string) {
    return this.request({
      method: 'GET',
      path: `/${modelId}`
    });
  }

  async filter(options: {
    capability?: string;
    status?: string;
  }) {
    return this.request({
      method: 'POST',
      path: '/filter',
      body: options
    });
  }
}