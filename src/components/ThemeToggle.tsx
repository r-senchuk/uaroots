"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";

const STORAGE_KEY = "color-scheme";

type Scheme = "light" | "dark";

function systemScheme(): Scheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredScheme(): Scheme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function applyScheme(stored: Scheme | null) {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (meta) {
    meta.content = stored ?? "light dark";
  }
  if (stored) {
    document.documentElement.dataset.theme = stored;
  } else {
    delete document.documentElement.dataset.theme;
  }
}

/**
 * Two-state theme switcher backed by <meta name="color-scheme"> and CSS light-dark().
 * Stores only explicit overrides in localStorage; reverting to system preference clears storage.
 */
export function ThemeToggle() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function syncFromStorage() {
      applyScheme(readStoredScheme());
    }

    function onStorage(event: StorageEvent) {
      if (event.key === null || event.key === STORAGE_KEY) {
        syncFromStorage();
      }
    }

    function onSystemChange() {
      // Never erase an explicit stored override when OS switches by time of day.
      if (!readStoredScheme()) {
        applyScheme(null);
      }
    }

    syncFromStorage();
    window.addEventListener("storage", onStorage);
    media.addEventListener("change", onSystemChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      media.removeEventListener("change", onSystemChange);
    };
  }, []);

  function toggle() {
    const system = systemScheme();
    const stored = readStoredScheme();
    const rendered: Scheme = stored ?? system;
    const target: Scheme = rendered === "dark" ? "light" : "dark";
    const nextStored: Scheme | null = target === system ? null : target;

    try {
      if (nextStored) {
        window.localStorage.setItem(STORAGE_KEY, nextStored);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* Storage may be blocked; still apply for this session. */
    }

    applyScheme(nextStored);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="relative inline-flex size-11 shrink-0 items-center justify-center overflow-hidden border border-border-strong bg-surface/75 text-foreground transition-colors hover:bg-secondary"
    >
      <span className="theme-toggle-to-dark items-center justify-center">
        <Moon aria-hidden className="size-4.5" strokeWidth={1.65} />
        <span className="sr-only">Увімкнути темну тему</span>
      </span>
      <span className="theme-toggle-to-light items-center justify-center">
        <Sun aria-hidden className="size-4.5" strokeWidth={1.65} />
        <span className="sr-only">Увімкнути світлу тему</span>
      </span>
    </button>
  );
}
