import { Resource } from './base';

export class ChatResource extends Resource {
  async createCompletion(options: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    n?: number;
  }) {
    return this.request({
      method: 'POST',
      path: '/completions',
      body: options
    });
  }
}