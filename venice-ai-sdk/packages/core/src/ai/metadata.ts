/**
 * AI-friendly SDK metadata and structured information.
 * This module exports machine-readable data about the SDK for AI agents.
 */

/**
 * SDK capabilities that AI agents can use.
 */
export interface SDKCapability {
  id: string;
  name: string;
  description: string;
  category: 'chat' | 'image' | 'audio' | 'embedding' | 'utility';
  example: string;
  parameters: Record<string, {
    type: string;
    required: boolean;
    description: string;
    default?: any;
  }>;
}

/**
 * Complete SDK metadata for AI agents.
 */
export interface SDKMetadata {
  version: string;
  capabilities: SDKCapability[];
  errorCodes: Record<string, {
    description: string;
    recoverable: boolean;
    automated: boolean;
  }>;
  models: {
    chat: string[];
    image: string[];
    audio: string[];
    embedding: string[];
  };
}

/**
 * Get AI-friendly SDK metadata.
 */
export function getSDKMetadata(): SDKMetadata {
  return {
    version: '2025.11.6',
    
    capabilities: [
      {
        id: 'chat_completion',
        name: 'Chat Completion',
        description: 'Generate text responses using chat models',
        category: 'chat',
        example: `await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: 'Hello!' }]
})`,
        parameters: {
          model: {
            type: 'string',
            required: true,
            description: 'Model ID to use',
          },
          messages: {
            type: 'array',
            required: true,
            description: 'Conversation messages',
          },
          temperature: {
            type: 'number',
            required: false,
            description: 'Sampling temperature (0-2)',
            default: 0.7,
          },
          max_tokens: {
            type: 'number',
            required: false,
            description: 'Maximum tokens to generate',
          },
          stream: {
            type: 'boolean',
            required: false,
            description: 'Enable streaming responses',
            default: false,
          },
        },
      },
      
      {
        id: 'image_generation',
        name: 'Image Generation',
        description: 'Generate images from text prompts',
        category: 'image',
        example: `await venice.images.generate({
  model: 'fluently-xl',
  prompt: 'A serene mountain landscape',
  width: 1024,
  height: 1024
})`,
        parameters: {
          model: {
            type: 'string',
            required: true,
            description: 'Image model ID',
          },
          prompt: {
            type: 'string',
            required: true,
            description: 'Text description of desired image',
          },
          width: {
            type: 'number',
            required: false,
            description: 'Image width in pixels',
            default: 1024,
          },
          height: {
            type: 'number',
            required: false,
            description: 'Image height in pixels',
            default: 1024,
          },
        },
      },
      
      {
        id: 'image_upscaling',
        name: 'Image Upscaling',
        description: 'Enhance image quality and resolution',
        category: 'image',
        example: `await venice.images.upscale({
  image: imageBuffer,
  scale: 2
})`,
        parameters: {
          image: {
            type: 'Buffer | File',
            required: true,
            description: 'Image to upscale',
          },
          scale: {
            type: 'number',
            required: false,
            description: 'Upscaling factor',
            default: 2,
          },
        },
      },
      
      {
        id: 'text_to_speech',
        name: 'Text to Speech',
        description: 'Convert text to natural-sounding speech',
        category: 'audio',
        example: `await venice.audio.speech.create({
  model: 'musicgen-stereo-small',
  input: 'Hello, world!',
  voice: 'alloy'
})`,
        parameters: {
          model: {
            type: 'string',
            required: true,
            description: 'TTS model ID',
          },
          input: {
            type: 'string',
            required: true,
            description: 'Text to convert to speech',
          },
          voice: {
            type: 'string',
            required: false,
            description: 'Voice to use',
            default: 'alloy',
          },
        },
      },
      
      {
        id: 'embeddings',
        name: 'Text Embeddings',
        description: 'Generate vector embeddings for semantic search',
        category: 'embedding',
        example: `await venice.embeddings.create({
  model: 'text-embedding-004',
  input: 'Text to embed'
})`,
        parameters: {
          model: {
            type: 'string',
            required: true,
            description: 'Embedding model ID',
          },
          input: {
            type: 'string | string[]',
            required: true,
            description: 'Text or texts to embed',
          },
        },
      },
      
      {
        id: 'list_models',
        name: 'List Models',
        description: 'Get available models and their capabilities',
        category: 'utility',
        example: `await venice.models.list()`,
        parameters: {},
      },
    ],
    
    errorCodes: {
      AUTH_ERROR: {
        description: 'Authentication failed - invalid or missing API key',
        recoverable: false,
        automated: false,
      },
      RATE_LIMIT_EXCEEDED: {
        description: 'Too many requests - wait before retrying',
        recoverable: true,
        automated: true,
      },
      VALIDATION_ERROR: {
        description: 'Invalid request parameters',
        recoverable: true,
        automated: false,
      },
      NETWORK_ERROR: {
        description: 'Network connectivity issue',
        recoverable: true,
        automated: true,
      },
      TIMEOUT_ERROR: {
        description: 'Request timed out',
        recoverable: true,
        automated: true,
      },
    },
    
    models: {
      chat: [
        'llama-3.3-70b',
        'llama-3.1-405b',
        'qwen-2.5-72b',
        'deepseek-v3',
      ],
      image: [
        'fluently-xl',
        'flux-pro',
        'flux-dev',
      ],
      audio: [
        'musicgen-stereo-small',
      ],
      embedding: [
        'text-embedding-004',
      ],
    },
  };
}

/**
 * Get capability by ID.
 */
export function getCapability(id: string): SDKCapability | undefined {
  const metadata = getSDKMetadata();
  return metadata.capabilities.find(c => c.id === id);
}

/**
 * Get capabilities by category.
 */
export function getCapabilitiesByCategory(
  category: SDKCapability['category']
): SDKCapability[] {
  const metadata = getSDKMetadata();
  return metadata.capabilities.filter(c => c.category === category);
}

/**
 * Export metadata as JSON for AI agents.
 */
export function exportMetadataJSON(): string {
  return JSON.stringify(getSDKMetadata(), null, 2);
}
