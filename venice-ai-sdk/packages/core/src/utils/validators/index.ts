export { AudioValidator } from './audio-validator';
export { BaseValidator } from './base-validator';
export { ChatValidator } from './chat-validator';
export { EmbeddingsValidator } from './embeddings-validator';
export { ImageValidator } from './image-validator';
export { ModelValidator } from './model-validator';

// For backward compatibility
import { AudioValidator } from './audio-validator';
import { BaseValidator } from './base-validator';
import { ChatValidator } from './chat-validator';
import { EmbeddingsValidator } from './embeddings-validator';
import { ImageValidator } from './image-validator';
import { ModelValidator } from './model-validator';

import type { ChatCompletionRequest } from '../../types/chat';
import type { ImageRequest } from '../../types/images';
import type { ModelRequest } from '../../types/models';

// Module-level singleton instances for backward-compat shims
const baseValidator = new BaseValidator();
const chatValidator = new ChatValidator();
const imageValidator = new ImageValidator();
const modelValidator = new ModelValidator();

// Export validation functions from BaseValidator for backward compatibility
export const validateRequired = (value: unknown, fieldName: string): void => {
  baseValidator.validateRequired(value, fieldName);
};

export const validateString = (value: unknown, fieldName: string): void => {
  baseValidator.validateString(value, fieldName);
};

export const validateNumber = (value: unknown, fieldName: string, min?: number, max?: number): void => {
  baseValidator.validateNumber(value, fieldName, min, max);
};

export const validateEnum = (value: unknown, fieldName: string, allowedValues: unknown[]): void => {
  baseValidator.validateEnum(value, fieldName, allowedValues);
};

export const validateNonEmptyArray = (value: unknown, fieldName: string): void => {
  baseValidator.validateNonEmptyArray(value, fieldName);
};

export const validateObject = (value: unknown, fieldName: string): void => {
  baseValidator.validateObject(value, fieldName);
};

export const validateBoolean = (value: unknown, fieldName: string): void => {
  baseValidator.validateBoolean(value, fieldName);
};

export const validateUrl = (value: unknown, fieldName: string): void => {
  baseValidator.validateUrl(value, fieldName);
};

// Export validation functions from specific validators for backward compatibility
export const validateChatCompletionRequest = (request: ChatCompletionRequest): void => {
  chatValidator.validateChatCompletionRequest(request);
};

export const validateImageRequest = (request: ImageRequest): void => {
  imageValidator.validateImageRequest(request);
};

export const validateModelRequest = (request: ModelRequest): void => {
  modelValidator.validateModelRequest(request);
};

// Default export
export default {
  AudioValidator,
  BaseValidator,
  ChatValidator,
  EmbeddingsValidator,
  ImageValidator,
  ModelValidator,
  validateRequired,
  validateString,
  validateNumber,
  validateEnum,
  validateNonEmptyArray,
  validateObject,
  validateBoolean,
  validateUrl,
  validateChatCompletionRequest,
  validateImageRequest,
  validateModelRequest,
};
