// localStorage helpers that never throw (private windows and blocked storage just fall back).
import { useEffect, useState } from "react";

export function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: keep working in memory */
  }
}

/** useState that persists to localStorage under `key`. */
export function useStored<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => load(key, typeof initial === "function" ? (initial as () => T)() : initial));
  useEffect(() => save(key, value), [key, value]);
  return [value, setValue] as const;
}

export const uid = () => Math.random().toString(36).slice(2, 10);
