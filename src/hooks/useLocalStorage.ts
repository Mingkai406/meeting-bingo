import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

interface Options<T> {
  /** Sanitize/transform a value loaded from storage before it becomes state. */
  parse?: (stored: T) => T;
}

/**
 * State synced to localStorage. SSR/private-mode safe (falls back to in-memory
 * if storage is unavailable). `parse` lets the caller sanitize restored data.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T | (() => T),
  options: Options<T> = {},
): [T, Dispatch<SetStateAction<T>>] {
  const parseRef = useRef(options.parse);
  parseRef.current = options.parse;

  const [value, setValue] = useState<T>(() => {
    const fallback = () => (typeof initial === 'function' ? (initial as () => T)() : initial);
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      if (raw === null) return fallback();
      const parsed = JSON.parse(raw) as T;
      return parseRef.current ? parseRef.current(parsed) : parsed;
    } catch {
      return fallback();
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable (private mode / quota) — keep going in memory
    }
  }, [key, value]);

  return [value, setValue];
}
