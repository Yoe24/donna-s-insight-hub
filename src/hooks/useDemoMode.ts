import { useState, useCallback } from "react";
import { isDemo as isDemoCheck } from "@/lib/auth";

const STORAGE_KEY = "donna_demo_mode";

export function useDemoMode() {
  const [isDemo, setIsDemo] = useState(() => isDemoCheck());

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
  return isDemoCheck();
}
