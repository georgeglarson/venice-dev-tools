export interface ImageRequest {
  model: string;
  n?: number;
  size?: number;
  response_format?: 'url' | 'b64_json';
  user?: string;
  prompt?: string;
  negative_prompt?: string;
  style?: string;
  quality?: 'standard' | 'high' | 'ultra';
  safety?: 'low' | 'medium' | 'high';
  copyright?: 'free' | 'commercial';
  watermark?: 'none' | 'low' | 'high';
  metadata?: { key: string; value: string }[];
}

export interface GenerateImageRequest extends ImageRequest {
  // Additional properties specific to GenerateImageRequest can be added here
}

export interface GenerateImageResponse {
  data: {
    url: string;
    created_at: number;
    model: string;
    size: number;
    response_format: 'url' | 'b64_json';
    user: string;
    prompt: string;
    negative_prompt: string;
    style: string;
    quality: 'standard' | 'high' | 'ultra';
    safety: 'low' | 'medium' | 'high';
    copyright: 'free' | 'commercial';
    watermark: 'none' | 'low' | 'high';
    metadata: { key: string; value: string }[];
  };
}

export interface GenerateImageResponseHeaders {
  'x-venice-is-content-violation'?: boolean;
  'x-venice-is-blurred'?: boolean;
}

export interface UpscaleImageParams {
  image: Blob | ArrayBuffer | string;
  scale?: 2 | 4;
}

export interface ListImageStylesResponse {
  styles: {
    name: string;
    description: string;
    available: boolean;
  }[];
}