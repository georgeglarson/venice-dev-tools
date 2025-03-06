import { ChatResource } from './resources/chat';
import { ImageResource } from './resources/image';
import { ModelsResource } from './resources/models';
import { NodeHttpAdapter } from './http/client';

export class VeniceSDK {
  private resources: {
    chat?: ChatResource;
    image?: ImageResource;
    models?: ModelsResource;
  } = {};

  constructor(
    private config: {
      apiKey: string;
      baseUrl: string;
    },
    private httpAdapter: NodeHttpAdapter
  ) {}

  static create(
    config: { apiKey: string; baseUrl: string },
    httpAdapter: NodeHttpAdapter
  ): VeniceSDK {
    return new VeniceSDK(config, httpAdapter);
  }

  get chat() {
    if (!this.resources.chat) {
      this.resources.chat = new ChatResource(this.httpAdapter, 'chat');
    }
    return this.resources.chat;
  }

  get image() {
    if (!this.resources.image) {
      this.resources.image = new ImageResource(this.httpAdapter, 'image');
    }
    return this.resources.image;
  }

  get models() {
    if (!this.resources.models) {
      this.resources.models = new ModelsResource(this.httpAdapter, 'models');
    }
    return this.resources.models;
  }
}