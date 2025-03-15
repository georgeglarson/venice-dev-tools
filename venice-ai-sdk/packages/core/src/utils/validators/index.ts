export { BaseValidator } from './base-validator';
export { ChatValidator } from './chat-validator';
export { ImageValidator } from './image-validator';
export { ModelValidator } from './model-validator';

// For backward compatibility
import { BaseValidator } from './base-validator';
import { ChatValidator } from './chat-validator';
import { ImageValidator } from './image-validator';
import { ModelValidator } from './model-validator';

// Export validation functions from BaseValidator for backward compatibility
export const validateRequired = (value: any, fieldName: string): void => {
  const validator = new BaseValidator();
  validator.validateRequired(value, fieldName);
};

export const validateString = (value: any, fieldName: string): void => {
  const validator = new BaseValidator();
  validator.validateString(value, fieldName);
};

export const validateNumber = (value: any, fieldName: string, min?: number, max?: number): void => {
  const validator = new BaseValidator();
  validator.validateNumber(value, fieldName, min, max);
};

export const validateEnum = (value: any, fieldName: string, allowedValues: any[]): void => {
  const validator = new BaseValidator();
  validator.validateEnum(value, fieldName, allowedValues);
};

export const validateNonEmptyArray = (value: any, fieldName: string): void => {
  const validator = new BaseValidator();
  validator.validateNonEmptyArray(value, fieldName);
};

export const validateObject = (value: any, fieldName: string): void => {
  const validator = new BaseValidator();
  validator.validateObject(value, fieldName);
};

export const validateBoolean = (value: any, fieldName: string): void => {
  const validator = new BaseValidator();
  validator.validateBoolean(value, fieldName);
};

export const validateUrl = (value: any, fieldName: string): void => {
  const validator = new BaseValidator();
  validator.validateUrl(value, fieldName);
};

// Export validation functions from specific validators for backward compatibility
export const validateChatCompletionRequest = (request: any): void => {
  const validator = new ChatValidator();
  validator.validateChatCompletionRequest(request);
};

export const validateImageRequest = (request: any): void => {
  const validator = new ImageValidator();
  validator.validateImageRequest(request);
};

export const validateModelRequest = (request: any): void => {
  const validator = new ModelValidator();
  validator.validateModelRequest(request);
};

// Default export
export default {
  BaseValidator,
  ChatValidator,
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