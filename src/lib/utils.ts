// Tiny clsx-style class-name helper — no external dependency.

export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

/**
 * Merge conditional class names into a single space-separated string.
 * Falsy values are ignored; arrays and `{ class: boolean }` objects are supported.
 *
 *   cn('a', false && 'b', ['c', null], { d: true, e: false }) // -> "a c d"
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      out.push(String(input));
    } else if (Array.isArray(input)) {
      const inner = cn(...input);
      if (inner) out.push(inner);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) out.push(key);
      }
    }
  }

  return out.join(' ');
}
