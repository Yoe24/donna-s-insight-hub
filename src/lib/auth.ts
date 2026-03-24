const DEMO_USER_ID = "9082c497-0efe-401f-978a-e43cc149ff57";

export function getUserId(): string {
  return localStorage.getItem("donna_user_id") || DEMO_USER_ID;
}

export function setUserId(id: string) {
  localStorage.setItem("donna_user_id", id);
}

export function isDemo(): boolean {
  return getUserId() === DEMO_USER_ID;
}

export function logout() {
  localStorage.removeItem("donna_user_id");
  localStorage.removeItem("donna_demo_mode");
  localStorage.removeItem("donna_chat_history");
  window.location.href = "/login";
}

/**
 * Parse ?user_id= from current URL, store it, and clean URL.
 * Call this early on any page that may receive OAuth redirects.
 * Returns the active user_id.
 */
export function captureUserIdFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  const urlUserId = params.get("user_id");
  if (urlUserId) {
    setUserId(urlUserId);
    // If a real user connected, disable demo mode
    if (urlUserId !== DEMO_USER_ID) {
      localStorage.setItem("donna_demo_mode", "false");
    }
    // Clean URL
    params.delete("user_id");
    const newSearch = params.toString();
    const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash;
    window.history.replaceState({}, "", newUrl);
  }
  return getUserId();
}
