import { useSyncExternalStore } from "react";

/**
 * A tiny `useSyncExternalStore`-compatible store backed by localStorage.
 *
 * Why not `useState` + `useEffect`? Reading localStorage in an effect and
 * calling setState is a cascading render (React's `set-state-in-effect` rule
 * flags it), and it makes the "have we loaded yet" state everyone's problem.
 * localStorage is an external store, so modelling it as one is both the
 * idiomatic fix and what gets cross-tab sync for free.
 *
 * `getServerSnapshot` is what the server and the hydrating client render, so it
 * must never touch `window`.
 */
export function createLocalStore<T>({
  key,
  parse,
  serverValue,
}: {
  key: string;
  /** Turns the raw stored string (or null, when absent) into state. */
  parse: (raw: string | null) => T;
  /** Rendered on the server and during hydration. */
  serverValue: T;
}) {
  /*
   * getSnapshot must return a referentially equal value when nothing changed,
   * or React re-renders forever. We therefore cache the parsed value against
   * the exact raw string it came from. `undefined` is the "not read yet"
   * sentinel — distinct from `null`, which is a real "key absent".
   */
  let cachedRaw: string | null | undefined;
  let cached: T = serverValue;

  /*
   * Set once a write has failed — blocked site data, private mode, a quota
   * ceiling, an extension that stubs out setItem.
   *
   * From then on `getSnapshot` stops consulting storage and serves the
   * in-memory value instead. Without this the store contradicts itself: `set`
   * caches optimistically, the next snapshot reads back the *absent* key, sees
   * it differs from the cache, and resets to empty — so an add appears to work
   * for one frame and then vanishes, with nothing logged. Degrading to a
   * session-only store keeps the page usable; the cart simply does not survive
   * a reload, which is the documented intent.
   */
  let memoryOnly = false;

  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());

  const readRaw = () => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      // Storage blocked (private mode, embedded webview) — behave as if empty.
      return null;
    }
  };

  const handleStorage = (event: StorageEvent) => {
    // Nothing to sync to once this tab has stopped trusting storage, and
    // re-parsing would clobber the in-memory value with a stale read.
    if (memoryOnly) return;
    // event.key is null when the whole store is cleared.
    if (event.key !== null && event.key !== key) return;
    cachedRaw = undefined; // Force a re-parse on the next snapshot.
    emit();
  };

  return {
    subscribe(listener: () => void) {
      // The window listener is attached with the first subscriber and removed
      // with the last, so an unmounted tree leaves nothing behind.
      if (listeners.size === 0) {
        window.addEventListener("storage", handleStorage);
      }
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          window.removeEventListener("storage", handleStorage);
        }
      };
    },

    getSnapshot(): T {
      if (memoryOnly) return cached;

      const raw = readRaw();
      if (raw !== cachedRaw) {
        cachedRaw = raw;
        cached = parse(raw);
      }
      return cached;
    },

    getServerSnapshot: () => serverValue,

    set(next: T) {
      const raw = JSON.stringify(next);
      try {
        window.localStorage.setItem(key, raw);
      } catch {
        // Quota exceeded or storage blocked. Serve from memory for the rest of
        // the session so the current visit behaves; it just won't survive a
        // reload. See `memoryOnly` above for why the flag is required rather
        // than merely nice — without it this catch loses the write entirely.
        memoryOnly = true;
      }
      cachedRaw = raw;
      cached = next;
      emit();
    },

    /** True when a write has failed and the cart is session-only. */
    isMemoryOnly: () => memoryOnly,
  };
}

/* A subscribe that never fires. Module-level so the reference stays stable. */
const neverChanges = () => () => {};

/**
 * True once running in the browser, false on the server and during the
 * hydrating render — the lint-clean replacement for a `useState(false)` +
 * `useEffect(() => setMounted(true))` pair.
 */
export const useIsClient = () =>
  useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
