/**
 * EmailsAutres — Minimal list of unclassified emails (no dossier_id)
 */

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { RefreshCw, Mail, InboxIcon } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import type { Email } from "@/hooks/useEmails";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiGet } from "@/lib/api";
import { isDemo } from "@/lib/auth";
import { mockAllEmails } from "@/lib/mock-briefing";
import { EmailDrawer } from "@/components/EmailDrawer";

interface ApiEmail {
  id: string;
  from_name?: string;
  from_email?: string;
  subject?: string;
  summary?: string | null;
  date?: string;
  dossier_id?: string | null;
  updated_at?: string;
  statut?: Email["statut"];
  pipeline_step?: Email["pipeline_step"];
  contexte_choisi?: string;
}

function formatDate(d: string): string {
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return format(date, "d MMM, HH'h'mm", { locale: fr });
  } catch {
    return "";
  }
}

function senderName(fromName?: string, fromEmail?: string): string {
  return fromName || fromEmail || "Inconnu";
}

function toEmail(e: ApiEmail): Email {
  return {
    id: e.id,
    expediteur: e.from_name
      ? `${e.from_name}${e.from_email ? ` <${e.from_email}>` : ""}`
      : e.from_email || "",
    objet: e.subject || "",
    resume: e.summary || null,
    brouillon: null,
    pipeline_step: e.pipeline_step || "pret_a_reviser",
    contexte_choisi: e.contexte_choisi || "",
    statut: e.statut || "traite",
    metadata: undefined,
    created_at: e.date || "",
    updated_at: e.updated_at || e.date || "",
  };
}

const EmailsAutres = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchEmails = useCallback(async () => {
    try {
      let unclassified: Email[];
      if (isDemo()) {
        await new Promise((r) => setTimeout(r, 200));
        unclassified = mockAllEmails
          .filter((m) => !m.dossier_id)
          .map((m) => ({
            id: m.id,
            expediteur: `${m.expediteur} <${m.email}>`,
            objet: m.objet,
            resume: m.resume,
            brouillon: m.brouillon_mock || null,
            pipeline_step: "pret_a_reviser" as const,
            contexte_choisi: "",
            statut: "traite" as const,
            metadata: undefined,
            created_at: m.date,
            updated_at: m.date,
          }));
      } else {
        const data = await apiGet<ApiEmail[]>("/api/emails");
        unclassified = (data || [])
          .filter((e) => !e.dossier_id)
          .map(toEmail);
      }
      unclassified.sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      setEmails(unclassified);
      setError(false);
    } catch {
      setError(true);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto pt-8 space-y-4">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (error && emails.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <p className="text-lg font-serif text-foreground mb-2">Erreur de chargement</p>
          <p className="text-sm text-muted-foreground mb-4">Impossible de charger les emails.</p>
          <Button variant="outline" onClick={fetchEmails} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto pb-24">
        <div className="pt-8 pb-6">
          <h1 className="text-xl font-serif font-semibold text-foreground">Emails non classés</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {emails.length} email{emails.length !== 1 ? "s" : ""} sans dossier
          </p>
        </div>

        {emails.length === 0 ? (
          <div className="text-center py-16">
            <InboxIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucun email non classé</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {emails.map((email) => {
              const name = (email.expediteur || "").replace(/<[^>]+>/, "").trim();
              return (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className="w-full text-left px-3 py-3 hover:bg-muted/40 transition-colors flex items-center gap-3"
                >
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                        {name || "Inconnu"}
                      </span>
                      <span className="text-sm text-foreground/70 truncate flex-1 min-w-0">
                        {email.objet || "(sans objet)"}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {formatDate(email.created_at)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedEmail && (
          <EmailDrawer email={selectedEmail} onClose={() => setSelectedEmail(null)} context="fil" />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default EmailsAutres;
