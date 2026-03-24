/**
 * Central user_id management.
 * Call captureUserIdFromUrl() early on app load to persist OAuth callback user_id.
 */

const DEMO_USER_ID = "9082c497-0efe-401f-978a-e43cc149ff57";

/** Parse ?user_id= from current URL, store it, and clean URL. */
export function captureUserIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const urlUserId = params.get("user_id");
  if (urlUserId) {
    localStorage.setItem("donna_user_id", urlUserId);
    // If a real user connected, disable demo mode
    if (urlUserId !== DEMO_USER_ID) {
      localStorage.setItem("donna_demo_mode", "false");
    }
    // Clean URL
    params.delete("user_id");
    const newSearch = params.toString();
    const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash;
    window.history.replaceState({}, "", newUrl);
    return urlUserId;
  }
  return localStorage.getItem("donna_user_id");
}

/** Get stored user_id. Returns null if none. */
export function getUserId(): string | null {
  return localStorage.getItem("donna_user_id");
}

/** Returns true only if demo mode is explicitly active AND no real user_id is set. */
export function isRealUser(): boolean {
  const userId = localStorage.getItem("donna_user_id");
  return !!userId && userId !== DEMO_USER_ID;
}
