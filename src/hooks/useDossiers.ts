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
  /** Normalized client name — API may return `name` or `nom_client` */
  nom_client: string;
  email_client: string;
  statut: string;
  /** Normalized domain — API may return `domain` or `domaine` */
  domaine: string;
  dernier_echange_date: string;
  nouveaux_emails?: number;
  nouvelles_pieces?: number;
}

/** Raw shape returned by GET /api/dossiers */
interface ApiDossier {
  id: string;
  name?: string;
  nom_client?: string;
  email_client?: string;
  email?: string;
  status?: string;
  statut?: string;
  domain?: string;
  domaine?: string;
  summary?: string;
  email_count?: number;
  document_count?: number;
  dernier_echange_date?: string;
  updated_at?: string;
}

/** Normalize API dossier to frontend Dossier shape */
function normalizeDossier(raw: ApiDossier): Dossier {
  return {
    id: raw.id,
    nom_client: raw.name || raw.nom_client || "",
    email_client: raw.email_client || raw.email || "",
    statut: raw.status || raw.statut || "",
    domaine: raw.domain || raw.domaine || "",
    dernier_echange_date: raw.dernier_echange_date || raw.updated_at || "",
    nouveaux_emails: raw.email_count,
    nouvelles_pieces: raw.document_count,
  };
}

export function useDossiers() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDossiers = useCallback(async () => {
    try {
      const data = await apiGet<ApiDossier[]>("/api/dossiers");
      console.log("[useDossiers] Raw API response:", data);
      const normalized = (data || []).map(normalizeDossier);
      const sorted = normalized.sort(
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
