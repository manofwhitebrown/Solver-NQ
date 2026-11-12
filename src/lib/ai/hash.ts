import type { Mode, Subject } from '@/types';

export function normaliseQuestion(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** cyrb53: small, fast, sync, good enough for a cache key (not for security). */
function cyrb53(str: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

export function questionHash(text: string, subject: Subject, mode: Mode): string {
  return cyrb53(`${subject}|${mode}|${normaliseQuestion(text)}`);
}
