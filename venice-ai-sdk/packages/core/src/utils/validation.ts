// venice-ai-sdk/packages/core/src/utils/validation.ts

export function isValidString(value: any): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value);
}

export function isValidObject(value: any): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isValidArray(value: any): boolean {
  return Array.isArray(value);
}