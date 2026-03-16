import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchEmails = async () => {
      try {
        const { data, error } = await supabase
          .from('emails')
          .select('*')
          .eq('user_id', user.id)
          .not('pipeline_step', 'eq', 'importe')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEmails((data as Email[]) || []);
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
      setLoading(false);
    };

    fetchEmails();

    const subscription = supabase
      .channel('emails_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emails',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newEmail = payload.new as Email;
          // Skip imported emails
          if (newEmail.pipeline_step === 'importe') return;

          if (payload.eventType === 'INSERT') {
            setEmails((prev) => [newEmail, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setEmails((prev) =>
              prev.map((email) =>
                email.id === newEmail.id ? newEmail : email
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { emails, loading };
}

export function useEmailStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<EmailStats>({ recus: 0, traites: 0, valides: 0, en_attente: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

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
