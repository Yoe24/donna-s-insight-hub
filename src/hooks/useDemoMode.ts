import { useState, useCallback } from "react";

const STORAGE_KEY = "donna_demo_mode";

export function useDemoMode() {
  const [isDemo, setIsDemo] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Default to demo if no Gmail is connected
    return stored === null ? true : stored === "true";
  });

  const toggleMode = useCallback(() => {
    setIsDemo((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const setMode = useCallback((demo: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(demo));
    setIsDemo(demo);
  }, []);

  return { isDemo, toggleMode, setMode };
}

export function isDemoMode(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === null ? true : stored === "true";
}
