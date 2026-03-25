/**
 * useDossiers — Data hook for dossier list
 *
 * DEMO vs API BOUNDARY:
 * - Demo mode (donna_demo_mode === "true"): returns hardcoded data from mock-data.ts, NO API calls
 * - Real mode (after Gmail OAuth): fetches from /api/dossiers, polls every 30s
 */

import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { isDemoMode } from "@/hooks/useDemoMode";
import { dossiers as mockDossiersList } from "@/lib/mock-data";

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

/** Convert mock-data format to Dossier interface */
function buildDemoDossiers(): Dossier[] {
  return mockDossiersList
    .filter((d) => d.statut === "actif")
    .map((d) => ({
      id: d.id,
      nom_client: d.nomClient,
      email_client: "",
      statut: d.statut,
      domaine: d.categorie,
      dernier_echange_date: d.dernierMail,
      nouveaux_emails: d.nombreMails,
    }));
}

export function useDossiers() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const isDemo = isDemoMode();

  const fetchDossiers = useCallback(async () => {
    // ── DEMO MODE: use local hardcoded data, no API call ──
    if (isDemo) {
      setDossiers(buildDemoDossiers());
      setLoading(false);
      return;
    }

    // ── REAL MODE: fetch from API ──
    try {
      const userId = localStorage.getItem("donna_user_id");
      if (!userId) return;
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
  }, [isDemo]);

  useEffect(() => {
    fetchDossiers();
    // Only poll in real mode
    if (!isDemo) {
      const interval = setInterval(fetchDossiers, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchDossiers, isDemo]);

  return { dossiers, loading, refetch: fetchDossiers };
}
