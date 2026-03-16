import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';

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

export function useEmails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('donna_user_id');

  useEffect(() => {
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

    // Poll every 30s as a simple alternative to Supabase Realtime
    const interval = setInterval(fetchEmails, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return { emails, loading };
}

export function useEmailStats() {
  const [stats, setStats] = useState<EmailStats>({ recus: 0, traites: 0, valides: 0, en_attente: 0 });
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('donna_user_id');

  useEffect(() => {
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
  }, [userId]);

  return { stats, loading };
}

// Endpoint: POST /api/emails/:id/feedback
// Body: { action: "parfait" | "modifier" | "erreur" }
export function useUpdateEmailStatus() {
  const updateStatus = async (
    emailId: string,
    action: "parfait" | "modifier" | "erreur"
  ) => {
    await apiPost(`/api/emails/${emailId}/feedback`, { action });
  };

  return { updateStatus };
}
