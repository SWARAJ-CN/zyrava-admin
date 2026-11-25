import { useEffect, useRef, useState } from "react";
import { api } from "./api";

const DEFAULT_REFRESH_MS = 5_000;

/**
 * Loads an admin endpoint and keeps it fresh.
 *
 * The first load (and a manual `refresh()`) shows the loading state. Background
 * polls update the data silently every `refreshMs`, pause while the tab is
 * hidden, and never leave a stale request running after params change.
 */
export function useApi(path, { params, enabled = true, refreshMs = DEFAULT_REFRESH_MS } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);
  const key = JSON.stringify(params ?? {});
  const dataRef = useRef(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (!enabled || !path) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    let timer = null;
    let current = null;

    async function load(background) {
      if (!active) return;
      current?.abort();
      current = new AbortController();
      if (!background) setLoading(true);

      try {
        const value = await api.get(path, { params, signal: current.signal });
        if (!active) return;
        setData(value);
        setError(null);
      } catch (err) {
        if (!active || err?.name === "AbortError") return;
        // Keep showing the last good snapshot during a transient poll failure.
        if (!background || !dataRef.current) {
          setError(err?.message || "Could not load this data.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load(false);

    if (refreshMs > 0) {
      timer = window.setInterval(() => {
        if (!document.hidden) void load(true);
      }, refreshMs);
    }

    function onVisible() {
      if (!document.hidden) void load(true);
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key, enabled, version, refreshMs]);

  return {
    data,
    loading,
    error,
    refresh: () => setVersion((value) => value + 1),
  };
}

export function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
