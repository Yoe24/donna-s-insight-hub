/**
 * useEmails — Data hook for email list and stats
 *
 * DEMO vs API BOUNDARY:
 * - Demo mode (donna_demo_mode === "true"): returns hardcoded data from mock-data.ts, NO API calls
 * - Real mode (after Gmail OAuth): fetches from /api/emails, polls every 30s
 */

import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { isDemoMode } from '@/hooks/useDemoMode';
import { activityFeed } from '@/lib/mock-data';

export type PipelineStep = 
  | "en_attente"
  | "extraction_en_cours" 
  | "recherche_contexte"
  | "redaction_brouillon"
  | "pret_a_reviser"
  | "filtre_rejete"
  | "importe";

export interface Email {
  id: string;
  expediteur: string;
  objet: string;
  resume: string | null;
  brouillon: string | null;
  pipeline_step: PipelineStep;
  contexte_choisi: string;
  statut: "en_attente" | "traite" | "valide" | "erreur" | "archive" | "ignore";
  metadata?: { filtre?: { categorie?: string } };
  created_at: string;
  updated_at: string;
}

export interface EmailStats {
  recus: number;
  traites: number;
  valides: number;
  en_attente: number;
}

/** Convert mock activityFeed to Email interface */
function buildDemoEmails(): Email[] {
  const baseDate = new Date();
  return activityFeed.map((item, i) => {
    const offsetHours = i * 5 + Math.floor(i * 1.7);
    const emailDate = new Date(baseDate.getTime() - offsetHours * 60 * 60 * 1000);
    return {
      id: item.id,
      expediteur: `${item.expediteur} <${item.email}>`,
      objet: item.objet,
      resume: item.resume,
      brouillon: item.brouillon || null,
      pipeline_step: "pret_a_reviser" as PipelineStep,
      contexte_choisi: "",
      statut: "traite" as const,
      metadata: {},
      created_at: emailDate.toISOString(),
      updated_at: emailDate.toISOString(),
    };
  });
}

export function useEmails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const isDemo = isDemoMode();
  const userId = localStorage.getItem('donna_user_id');

  useEffect(() => {
    // ── DEMO MODE: use local hardcoded data, no API call ──
    if (isDemo) {
      setEmails(buildDemoEmails());
      setLoading(false);
      return;
    }

    // ── REAL MODE: fetch from API ──
    if (!userId) return;

    const fetchEmails = async () => {
      try {
        const data = await apiGet<Email[]>('/api/emails');
        setEmails(data || []);
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
      setLoading(false);
    };

    fetchEmails();
    const interval = setInterval(fetchEmails, 30000);
    return () => clearInterval(interval);
  }, [userId, isDemo]);

  return { emails, loading };
}

export function useEmailStats() {
  const [stats, setStats] = useState<EmailStats>({ recus: 0, traites: 0, valides: 0, en_attente: 0 });
  const [loading, setLoading] = useState(true);
  const isDemo = isDemoMode();
  const userId = localStorage.getItem('donna_user_id');

  useEffect(() => {
    // ── DEMO MODE: compute from local data ──
    if (isDemo) {
      const demoEmails = buildDemoEmails();
      setStats({
        recus: demoEmails.length,
        traites: demoEmails.filter(e => e.statut === "traite").length,
        valides: demoEmails.filter(e => e.statut === "valide").length,
        en_attente: demoEmails.filter(e => e.statut === "en_attente").length,
      });
      setLoading(false);
      return;
    }

    // ── REAL MODE: fetch from API ──
    if (!userId) return;

    const fetchStats = async () => {
      try {
        const data = await apiGet<EmailStats>('/api/emails/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching email stats:', error);
      }
      setLoading(false);
    };

    fetchStats();
  }, [userId, isDemo]);

  return { stats, loading };
}

// Endpoint: POST /api/emails/:id/feedback
// Body: { action: "parfait" | "modifier" | "erreur" }
export function useUpdateEmailStatus() {
  const updateStatus = async (
    emailId: string,
    action: "parfait" | "modifier" | "erreur"
  ) => {
    // ── DEMO MODE: simulate success ──
    if (isDemoMode()) return;
    // ── REAL MODE: call API ──
    await apiPost(`/api/emails/${emailId}/feedback`, { action });
  };

  return { updateStatus };
}
