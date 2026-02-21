"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface UseFiltersOptions {
  storageKey?: string;
  syncToUrl?: boolean;
}

export function useFilters(initialFilters: string[] = [], options: UseFiltersOptions = {}) {
  const { storageKey, syncToUrl = false } = options;

  const [filters, setFiltersState] = useState<string[]>(() => {
    if (typeof window === "undefined") return initialFilters;

    if (syncToUrl) {
      const params = new URLSearchParams(window.location.search);
      const urlFilters = params.get("filters");
      if (urlFilters) return urlFilters.split(",").filter(Boolean);
    }

    if (storageKey) {
      try {
        const stored = localStorage.getItem(`filters-${storageKey}`);
        if (stored) return JSON.parse(stored);
      } catch { /* fall through */ }
    }

    return initialFilters;
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (storageKey && typeof window !== "undefined") {
      try {
        localStorage.setItem(`filters-${storageKey}`, JSON.stringify(filters));
      } catch { /* ignore */ }
    }

    if (syncToUrl && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (filters.length > 0) {
        url.searchParams.set("filters", filters.join(","));
      } else {
        url.searchParams.delete("filters");
      }
      window.history.replaceState({}, "", url.toString());
    }
  }, [filters, storageKey, syncToUrl]);

  const setFilters = useCallback((next: string[] | ((prev: string[]) => string[])) => {
    setFiltersState(next);
  }, []);

  const toggle = useCallback((filterId: string) => {
    setFiltersState((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId],
    );
  }, []);

  const clear = useCallback(() => {
    setFiltersState([]);
  }, []);

  const isActive = useCallback(
    (filterId: string) => filters.includes(filterId),
    [filters],
  );

  return { filters, setFilters, toggle, clear, isActive };
}
