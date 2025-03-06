export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function mergeHeaders(
  ...headers: (HeadersInit | undefined)[]
): HeadersInit {
  return headers.reduce<HeadersInit>((acc, header) => {
    if (!header) return acc;
    return { ...acc, ...header };
  }, {});
}