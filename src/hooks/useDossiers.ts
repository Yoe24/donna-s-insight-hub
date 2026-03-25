/**
 * useDossiers — Data hook for dossier list
 *
 * Always fetches from API using the active user_id (demo or real).
 * In demo mode, getUserId() returns the demo UUID — the API serves demo data.
 */

import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";

export interface Dossier {
  id: string;
  nom_client: string;
  email_client: string;
  statut: string;
  domaine: string;
  dernier_echange_date: string;
  nouveaux_emails?: number;
  nouvelles_pieces?: number;
}

export function useDossiers() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDossiers = useCallback(async () => {
    try {
      const data = await apiGet<Dossier[]>("/api/dossiers");
      const sorted = (data || []).sort(
        (a, b) =>
          new Date(b.dernier_echange_date || 0).getTime() -
          new Date(a.dernier_echange_date || 0).getTime()
      );
      setDossiers(sorted);
    } catch (e) {
      console.error("Error fetching dossiers:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDossiers();
    const interval = setInterval(fetchDossiers, 30000);
    return () => clearInterval(interval);
  }, [fetchDossiers]);

  return { dossiers, loading, refetch: fetchDossiers };
}
