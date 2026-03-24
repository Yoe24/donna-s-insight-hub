import { useState, useCallback } from "react";

const STORAGE_KEY = "donna_demo_mode";
const DEMO_USER_ID = "9082c497-0efe-401f-978a-e43cc149ff57";

export function useDemoMode() {
  const [isDemo, setIsDemo] = useState(() => {
    // If a real (non-demo) user_id exists, never be in demo mode
    const userId = localStorage.getItem("donna_user_id");
    if (userId && userId !== DEMO_USER_ID) return false;
    
    const stored = localStorage.getItem(STORAGE_KEY);
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
  const userId = localStorage.getItem("donna_user_id");
  if (userId && userId !== DEMO_USER_ID) return false;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === null ? true : stored === "true";
}
