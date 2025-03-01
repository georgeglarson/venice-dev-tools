// Browser-specific implementations
export const isBrowser = true;

// Browser-specific utilities
export function loadBrowserResource(url: string): Promise<string> {
    return fetch(url).then(response => response.text());
}