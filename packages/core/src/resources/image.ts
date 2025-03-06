import { Resource } from './base';

export class ImageResource extends Resource {
  async generate(options: {
    prompt: string;
    n?: number;
    size?: string;
  }) {
    return this.request({
      method: 'POST',
      path: '/generations',
      body: options
    });
  }

  async edit(options: {
    image: string;
    mask?: string;
    prompt: string;
    n?: number;
    size?: string;
  }) {
    return this.request({
      method: 'POST',
      path: '/edits',
      body: options
    });
  }
}