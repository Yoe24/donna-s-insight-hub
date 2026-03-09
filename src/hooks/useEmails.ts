import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type PipelineStep = 
  | "en_attente"
  | "extraction_en_cours" 
  | "recherche_contexte"
  | "redaction_brouillon"
  | "pret_a_reviser";

export interface Email {
  id: string;
  expediteur: string;
  objet: string;
  resume: string | null;
  brouillon: string | null;
  pipeline_step: PipelineStep;
  contexte_choisi: string;
  statut: "en_attente" | "approuvé" | "modifié" | "rejeté";
  created_at: string;
  updated_at: string;
}

export function useEmails() {
  const { user } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Chargement initial
    const fetchEmails = async () => {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching emails:', error);
      } else {
        setEmails(data || []);
      }
      setLoading(false);
    };

    fetchEmails();

    // Abonnement Realtime
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
          if (payload.eventType === 'INSERT') {
            setEmails((prev) => [payload.new as Email, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setEmails((prev) =>
              prev.map((email) =>
                email.id === payload.new.id ? (payload.new as Email) : email
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

// Hook pour mettre à jour le statut (feedback)
export function useUpdateEmailStatus() {
  const updateStatus = async (
    emailId: string,
    statut: "approuvé" | "modifié" | "rejeté",
    brouillonModifie?: string
  ) => {
    const updateData: any = { statut };
    
    if (brouillonModifie && statut === "modifié") {
      updateData.brouillon = brouillonModifie;
    }

    const { error } = await supabase
      .from('emails')
      .update(updateData)
      .eq('id', emailId);

    if (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  };

  return { updateStatus };
}
