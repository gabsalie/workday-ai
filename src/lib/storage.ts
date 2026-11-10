import { useSyncExternalStore } from "react";

import {
  DEFAULT_MEETING_OPTIONS,
  DEFAULT_RESEARCH_OPTIONS,
  type MeetingOptions,
  type ResearchOptions,
} from "@/lib/tools";

type Listener = () => void;

export type Store<T> = {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: Listener) => () => void;
  fallback: T;
};

/** A tiny localStorage-backed store that is safe during SSR and hydration. */
export function createLocalStore<T>(key: string, fallback: T): Store<T> {
  let cache: T | undefined;
  const listeners = new Set<Listener>();

  const read = (): T => {
    if (typeof window === "undefined") return fallback;
    if (cache !== undefined) return cache;
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw ? mergeWithFallback(fallback, JSON.parse(raw)) : fallback;
    } catch {
      cache = fallback;
    }
    return cache;
  };

  const store: Store<T> = {
    fallback,
    get: read,
    set: (next) => {
      const value = typeof next === "function" ? (next as (p: T) => T)(read()) : next;
      cache = value;
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* storage full or unavailable — keep in memory */
      }
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) {
          cache = undefined;
          listener();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
  return store;
}

// Merge objects with defaults so newly added preference fields get sensible values.
function mergeWithFallback<T>(fallback: T, parsed: unknown): T {
  const isObj = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null && !Array.isArray(v);
  if (Array.isArray(fallback)) return (Array.isArray(parsed) ? parsed : fallback) as T;
  if (isObj(fallback) && isObj(parsed)) {
    const out: Record<string, unknown> = { ...fallback };
    for (const [k, v] of Object.entries(parsed)) {
      out[k] = isObj(fallback[k]) && isObj(v) ? { ...fallback[k], ...v } : v;
    }
    return out as T;
  }
  return (parsed ?? fallback) as T;
}

export function useLocalStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, () => store.fallback);
}

/* ---------- Preferences ---------- */

export type Preferences = {
  name: string;
  meeting: MeetingOptions;
  research: ResearchOptions;
};

export const prefsStore = createLocalStore<Preferences>("wpa:prefs", {
  name: "",
  meeting: DEFAULT_MEETING_OPTIONS,
  research: DEFAULT_RESEARCH_OPTIONS,
});

/* ---------- Activity history ---------- */

export type HistoryTool = "meeting" | "research" | "chat";

export type HistoryEntry = {
  id: string;
  tool: HistoryTool;
  title: string;
  input: string;
  output: string;
  demo: boolean;
  updatedAt: number;
};

const MAX_HISTORY = 30;

export const historyStore = createLocalStore<HistoryEntry[]>("wpa:history", []);

export function upsertHistory(entry: HistoryEntry) {
  historyStore.set((prev) =>
    [entry, ...prev.filter((e) => e.id !== entry.id)].slice(0, MAX_HISTORY),
  );
}

export function removeHistory(id: string) {
  historyStore.set((prev) => prev.filter((e) => e.id !== id));
}

export function makeTitle(text: string, max = 64) {
  const firstLine = text.trim().split("\n").find((l) => l.trim()) ?? "Untitled";
  const clean = firstLine.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

export function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/* ---------- Chat conversation ---------- */

export const CHAT_STORAGE_KEY = "wpa:chat";
