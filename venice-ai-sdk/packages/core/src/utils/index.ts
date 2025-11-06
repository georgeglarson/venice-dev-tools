// utils/index.ts
/**
 * Safely parse JSON, returning undefined if parsing fails.
 * 
 * @param text - The JSON string to parse.
 * @returns The parsed object or undefined if parsing fails.
 */
export function safeJsonParse(text: string): any | undefined {
  try {
    return JSON.parse(text);
  } catch (e) {
    return undefined;
  }
}

/**
 * Check if a value is a plain object.
 * 
 * @param value - The value to check.
 * @returns Whether the value is a plain object.
 */
export function isPlainObject(value: any): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

/**
 * Deep merge two objects.
 * 
 * @param target - The target object.
 * @param source - The source object.
 * @returns The merged object.
 */
export function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const output = { ...target };
  
  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach(key => {
      if (isPlainObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

/**
 * Convert an object to query parameters for URL.
 * 
 * @param obj - The object to convert.
 * @returns The query string.
 */
export function objectToQueryString(obj?: Record<string, any>): string {
  if (!obj) return '';
  
  return Object.entries(obj)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(item => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
}

/**
 * Create a delay promise that resolves after a specified time.
 * 
 * @param ms - The number of milliseconds to delay.
 * @returns A promise that resolves after the delay.
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a readable stream from a string.
 * 
 * @param input - The input string.
 * @returns A readable stream containing the input.
 */
export function createReadableStreamFromString(input: string): ReadableStream {
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(input);
  
  return new ReadableStream({
    start(controller) {
      controller.enqueue(uint8Array);
      controller.close();
    }
  });
}

/**
 * Check if the environment is a browser.
 * 
 * @returns Whether the environment is a browser.
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

/**
 * Check if the environment is Node.js.
 * 
 * @returns Whether the environment is Node.js.
 */
export function isNode(): boolean {
  return typeof process !== 'undefined' && 
         process.versions != null && 
         process.versions.node != null;
}

/**
 * Format a date for API requests.
 * 
 * @param date - The date to format.
 * @returns The formatted date string.
 */
export function formatDateForApi(date: Date): string {
  return date.toISOString();
}

// Export validators
export * from './validators';
// Export stream parser
export * from "./stream-parser";

// Export retry utilities
export * from "./retry";
export * from "./retry-handler";

// Export security utilities
export * from "./security";
