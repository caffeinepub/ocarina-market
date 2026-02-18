/**
 * Encodes a Uint8Array item ID to a URL-safe base64 string
 */
export function encodeItemId(id: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...id));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Decodes a URL-safe base64 string back to a Uint8Array item ID
 */
export function decodeItemId(encoded: string): Uint8Array {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const decoded = atob(base64 + padding);
  return new Uint8Array(decoded.split('').map(c => c.charCodeAt(0)));
}
