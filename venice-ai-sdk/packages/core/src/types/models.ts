/**
 * Price tier with USD and DIEM values
 */
export interface ModelPriceTier {
  usd: number;
  diem: number;
}

/**
 * Text model pricing (per million tokens)
 */
export interface TextModelPricing {
  input: ModelPriceTier;
  output: ModelPriceTier;
  cache_input?: ModelPriceTier;
  cache_write?: ModelPriceTier;
  extended?: {
    context_token_threshold: number;
    input: ModelPriceTier;
    output: ModelPriceTier;
  };
}

/**
 * Image model pricing
 */
export interface ImageModelPricing {
  generation: ModelPriceTier;
  resolutions?: Record<string, ModelPriceTier>;
  upscale?: {
    '2x'?: ModelPriceTier;
    '4x'?: ModelPriceTier;
  };
}

/**
 * Audio/TTS model pricing
 */
export interface AudioModelPricing {
  input?: ModelPriceTier;
  per_audio_second?: ModelPriceTier;
  generation?: ModelPriceTier;
  per_second?: ModelPriceTier;
  durations?: Record<string, ModelPriceTier>;
  per_thousand_characters?: ModelPriceTier;
}

/**
 * Model pricing (varies by model type)
 */
export type ModelPricing = TextModelPricing | ImageModelPricing | AudioModelPricing | Record<string, unknown>;

/**
 * Model capabilities
 */
export interface ModelCapabilities {
  supportsFunctionCalling?: boolean;
  supportsResponseSchema?: boolean;
  supportsWebSearch?: boolean;
  supportsReasoning?: boolean;
  optimizedForCode?: boolean;
  supportsReasoningEffort?: boolean;
  supportsVision?: boolean;
  supportsMultipleImages?: boolean;
  maxImages?: number;
  supportsLogProbs?: boolean;
  supportsTeeAttestation?: boolean;
  supportsE2EE?: boolean;
  supportsXSearch?: boolean;
  quantization?: 'fp4' | 'fp8' | 'fp16' | 'bf16' | 'int8' | 'int4' | 'not-available';
}

/**
 * Interface representing a model specification.
 */
export interface ModelSpec {
  availableContextTokens?: number;
  maxCompletionTokens?: number;
  capabilities?: ModelCapabilities;
  traits?: string[];
  modelSource?: string;
  beta?: boolean;
  betaModel?: boolean;
  offline?: boolean;
  name?: string;
  description?: string;
  privacy?: 'private' | 'anonymized';
  deprecation?: { date: string };
  pricing?: ModelPricing;
  constraints?: Record<string, unknown>;
  /** Audio/music model fields */
  supports_lyrics?: boolean;
  lyrics_required?: boolean;
  supports_force_instrumental?: boolean;
  voices?: string[];
  default_voice?: string;
  supports_language_code?: boolean;
  supports_speed?: boolean;
  default_speed?: number;
  min_speed?: number;
  max_speed?: number;
  duration_options?: number[];
  min_duration?: number;
  max_duration?: number;
  default_duration?: number;
  supported_formats?: string[];
  default_format?: string;
  prompt_character_limit?: number;
  min_prompt_length?: number;
  lyrics_character_limit?: number;
}

/**
 * Interface representing a model in the API.
 */
export interface Model {
  id: string;
  type: 'asr' | 'embedding' | 'image' | 'music' | 'text' | 'tts' | 'upscale' | 'inpaint' | 'video';
  object: 'model';
  created: number;
  owned_by: string;
  model_spec: ModelSpec;
}

/**
 * Interface representing the response from listing models.
 */
export interface ListModelsResponse {
  object: 'list';
  type: 'asr' | 'embedding' | 'image' | 'music' | 'text' | 'tts' | 'upscale' | 'inpaint' | 'video' | 'all' | 'code';
  data: Model[];
}

/**
 * Interface representing the model traits.
 */
export interface ModelTraits {
  [trait: string]: string;
}

/**
 * Interface representing the response from listing model traits.
 */
export interface ListModelTraitsResponse {
  object: 'list';
  type: 'asr' | 'embedding' | 'image' | 'music' | 'text' | 'tts' | 'upscale' | 'inpaint' | 'video' | 'all' | 'code';
  data: ModelTraits;
}

/**
 * Interface representing the model compatibility mapping.
 */
export interface ModelCompatibility {
  [model: string]: string;
}

/**
 * Interface representing the response from listing model compatibility mappings.
 */
export interface ListModelCompatibilityResponse {
  object: 'list';
  type: 'asr' | 'embedding' | 'image' | 'music' | 'text' | 'tts' | 'upscale' | 'inpaint' | 'video' | 'all' | 'code';
  data: ModelCompatibility;
}

/**
 * Interface representing parameters for listing models.
 */
export interface ListModelsParams {
  type?: 'asr' | 'embedding' | 'image' | 'music' | 'text' | 'tts' | 'upscale' | 'inpaint' | 'video' | 'all' | 'code';
}

/**
 * Interface representing a model request.
 */
export interface ModelRequest {
  model: string;
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  logprobs?: number;
  echo?: boolean;
  stop?: string[];
  presence_penalty?: number;
  frequency_penalty?: number;
  best_of?: number;
  logit_bias?: { [token: string]: number };
  user?: string;
}