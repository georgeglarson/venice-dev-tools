/**
 * Interface representing a model specification.
 */
export interface ModelSpec {
  availableContextTokens?: number;
  capabilities?: {
    supportsFunctionCalling?: boolean;
    supportsResponseSchema?: boolean;
    supportsWebSearch?: boolean;
    supportsReasoning?: boolean;
  };
  traits?: string[];
  modelSource?: string;
  beta?: boolean;
  offline?: boolean;
}

/**
 * Interface representing a model in the API.
 */
export interface Model {
  id: string;
  type: 'image' | 'text';
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
  type: 'text' | 'image' | 'all' | 'code';
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
  type: 'text' | 'image' | 'all' | 'code';
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
  type: 'text' | 'image' | 'all' | 'code';
  data: ModelCompatibility;
}

/**
 * Interface representing parameters for listing models.
 */
export interface ListModelsParams {
  type?: 'text' | 'image' | 'all' | 'code';
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