// Simple encryption using base64 + ROT13 for local profile storage
// Not cryptographically secure but sufficient for local storage

const ROT13_KEY = 'nopqrstuvwxyzabcdefghijklm';
const ROT13_MAP = 'abcdefghijklmnopqrstuvwxyz';

function rot13(str: string): string {
  return str.replace(/[a-z]/gi, (char) => {
    const isUpper = char === char.toUpperCase();
    const base = isUpper ? ROT13_MAP.toUpperCase() : ROT13_MAP;
    const index = base.indexOf(char.toLowerCase());
    return index === -1 ? char : isUpper ? ROT13_KEY.toUpperCase()[index] : ROT13_KEY[index];
  });
}

export function encryptProfile(data: Record<string, any>): string {
  const json = JSON.stringify(data);
  const rotated = rot13(json);
  return btoa(rotated); // base64 encode
}

export function decryptProfile(encrypted: string): Record<string, any> | null {
  try {
    const rotated = atob(encrypted); // base64 decode
    const json = rot13(rotated);
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to decrypt profile:', error);
    return null;
  }
}
