/**
 * useIntegrations — fetch and mutate OneDrive / Outlook Calendar sync flags.
 *
 * Calls GET /api/integrations/status to read current state.
 * Calls POST /api/integrations/{onedrive|outlook-calendar}/{enable|disable} to toggle.
 */

import { useState, useEffect, useCallback } from "react";
import { isDemo } from "@/lib/auth";
import { getUserId } from "@/lib/auth";

const BASE_URL = "https://api.donna-legal.com";

interface IntegrationsStatus {
  google_drive: boolean;
  onedrive: boolean;
  onedrive_root_folder_id: string | null;
  outlook_calendar: boolean;
  gmail_calendar: boolean;
  provider: string;
}

const DEFAULT_STATUS: IntegrationsStatus = {
  google_drive: false,
  onedrive: false,
  onedrive_root_folder_id: null,
  outlook_calendar: false,
  gmail_calendar: false,
  provider: "gmail",
};

async function fetchWithUserId(endpoint: string, method = "GET", body?: object): Promise<any> {
  const userId = getUserId();
  const url = `${BASE_URL}${endpoint}` + (endpoint.includes("?") ? "&" : "?") + `user_id=${encodeURIComponent(userId)}`;
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${endpoint} failed (${res.status}): ${text.substring(0, 200)}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return {};
}

export function useIntegrations() {
  const demo = isDemo();

  const [status, setStatus] = useState<IntegrationsStatus>(DEFAULT_STATUS);
  const [loading, setLoading] = useState(!demo);
  const [togglingOneDrive, setTogglingOneDrive] = useState(false);
  const [togglingCalendar, setTogglingCalendar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (demo) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWithUserId("/api/integrations/status");
      setStatus(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [demo]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleOneDrive = useCallback(
    async (enable: boolean) => {
      if (demo) return;
      setTogglingOneDrive(true);
      try {
        const endpoint = enable ? "/api/integrations/onedrive/enable" : "/api/integrations/onedrive/disable";
        const result = await fetchWithUserId(endpoint, "POST");
        setStatus((prev) => ({ ...prev, onedrive: result.onedrive_sync_enabled ?? enable }));
      } catch (e: any) {
        setError(e.message);
        throw e;
      } finally {
        setTogglingOneDrive(false);
      }
    },
    [demo],
  );

  const toggleOutlookCalendar = useCallback(
    async (enable: boolean) => {
      if (demo) return;
      setTogglingCalendar(true);
      try {
        const endpoint = enable
          ? "/api/integrations/outlook-calendar/enable"
          : "/api/integrations/outlook-calendar/disable";
        const result = await fetchWithUserId(endpoint, "POST");
        setStatus((prev) => ({ ...prev, outlook_calendar: result.outlook_calendar_sync_enabled ?? enable }));
      } catch (e: any) {
        setError(e.message);
        throw e;
      } finally {
        setTogglingCalendar(false);
      }
    },
    [demo],
  );

  return {
    status,
    loading,
    error,
    togglingOneDrive,
    togglingCalendar,
    toggleOneDrive,
    toggleOutlookCalendar,
    refresh,
  };
}
