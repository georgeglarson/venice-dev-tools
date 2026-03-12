// venice-ai-sdk/packages/core/src/utils/validation.ts
import { BaseValidator } from './validators/base-validator';

const sharedValidator = new BaseValidator();

export function isValidString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidNumber(value: unknown): boolean {
  return typeof value === 'number' && !isNaN(value);
}

export function isValidObject(value: unknown): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isValidArray(value: unknown): boolean {
  return Array.isArray(value);
}

export function validateRequired(value: unknown, fieldName: string): void {
  sharedValidator.validateRequired(value, fieldName);
}

export function validateString(value: unknown, fieldName: string): void {
  sharedValidator.validateString(value, fieldName);
}

export function validateNumber(value: unknown, fieldName: string, min?: number, max?: number): void {
  sharedValidator.validateNumber(value, fieldName, min, max);
}

export function validateEnum(value: unknown, fieldName: string, allowedValues: unknown[]): void {
  sharedValidator.validateEnum(value, fieldName, allowedValues);
}

export function validateNonEmptyArray(value: unknown, fieldName: string): void {
  sharedValidator.validateNonEmptyArray(value, fieldName);
}
