import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Copy, FileText, Loader2, Mail, Paperclip, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Email } from "@/hooks/useEmails";
import { useUpdateEmailStatus } from "@/hooks/useEmails";
import { apiGet, apiPost } from "@/lib/api";

function senderInitial(expediteur: string): string {
  const match = expediteur.match(/^([^<]+)/);
  const name = match ? match[1].trim() : expediteur;
  return (name.replace(/[^a-zA-ZÀ-ÿ]/g, "")[0] || name[0] || "?").toUpperCase();
}

function senderColor(expediteur: string): string {
  let hash = 0;
  for (let i = 0; i < expediteur.length; i++) hash = expediteur.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 55%, 48%)`;
}

function SenderAvatar({ expediteur, size = 40 }: { expediteur: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-bold"
      style={{ width: size, height: size, backgroundColor: senderColor(expediteur), color: "white", fontSize: size * 0.4 }}
    >
      {senderInitial(expediteur)}
    </div>
  );
}

interface EmailDrawerProps {
  email: Email;
  onClose: () => void;
  showDossierLink?: boolean;
}

export function EmailDrawer({ email, onClose, showDossierLink = true }: EmailDrawerProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [draftText, setDraftText] = useState<string | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [dossierDocs, setDossierDocs] = useState<any[]>([]);
  const [dossierName, setDossierName] = useState<string | null>(null);
  const { updateStatus } = useUpdateEmailStatus();

  useEffect(() => {
    const dossierId = (email as any).dossier_id;
    if (!dossierId) {
      setDossierDocs([]);
      setDossierName(null);
      return;
    }
    apiGet(`/api/dossiers/${dossierId}`)
      .then((data: any) => {
        setDossierName(data?.nom_client || data?.nom || data?.name || null);
        const docs = data?.dossier_documents || [];
        setDossierDocs(docs.filter((doc: any) => doc.email_id === email.id));
      })
      .catch(() => { setDossierDocs([]); setDossierName(null); });
  }, [email]);

  const handleFeedback = async (action: "parfait" | "modifier" | "erreur") => {
    try {
      await updateStatus(email.id, action);
      setFeedbackGiven(action);
      toast.success("Feedback envoyé, merci");
    } catch {
      toast.error("Erreur lors de l'envoi du feedback");
    }
  };

  const handleGenerateDraft = async () => {
    setDraftLoading(true);
    try {
      const data = await apiPost<{ draft: string }>(`/api/emails/${email.id}/draft`);
      setDraftText(data.draft);
    } catch {
      toast.error("Erreur lors de la génération du brouillon");
    } finally {
      setDraftLoading(false);
    }
  };

  const handleCopyDraft = () => {
    if (!draftText) return;
    navigator.clipboard.writeText(draftText);
    toast.success("Réponse copiée !");
  };

  const handleFeedbackSelect = (value: string) => {
    const map: Record<string, "parfait" | "modifier" | "erreur"> = {
      parfait: "parfait", modifier: "modifier", erreur: "erreur",
    };
    if (map[value]) handleFeedback(map[value]);
  };

  const formattedDate = (() => {
    try { return format(new Date(email.created_at), "d MMMM yyyy, HH'h'mm", { locale: fr }); }
    catch { return ""; }
  })();

  // Extract sender email if available
  const emailMatch = email.expediteur.match(/<([^>]+)>/);
  const senderEmail = emailMatch ? emailMatch[1] : null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[55%] sm:max-w-[640px] bg-background shadow-2xl overflow-y-auto"
      >
        <div className="p-6 sm:p-8">
          {/* Close */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors sm:hidden"
            >
              ← Retour
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground ml-auto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mb-5">
            {(email as any).classification?.needs_response ? (
              <span className="inline-flex items-center rounded-full text-[10px] px-2.5 py-0.5 font-semibold bg-orange-100 text-orange-800">
                Action requise
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full text-[10px] px-2.5 py-0.5 font-semibold bg-muted text-muted-foreground">
                Informatif
              </span>
            )}
          </div>

          {/* Sender header */}
          <div className="flex items-start gap-3 mb-2">
            <SenderAvatar expediteur={email.expediteur} size={44} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">{email.expediteur.replace(/<[^>]+>/, "").trim()}</p>
              {senderEmail && (
                <p className="text-xs text-muted-foreground">{senderEmail}</p>
              )}
            </div>
          </div>

          {/* Subject */}
          <h2 className="text-lg font-semibold text-foreground leading-snug mt-4 mb-1">{email.objet}</h2>
          <p className="text-xs text-muted-foreground mb-6">{formattedDate}</p>

          <div className="h-px bg-border mb-6" />

          {/* Résumé Donna */}
          {email.resume && (
            <div className="mb-6">
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Résumé Donna</h3>
              <div className="rounded-xl bg-muted/40 p-5">
                <p className="text-sm text-foreground/85 whitespace-pre-line leading-relaxed">
                  {email.resume}
                </p>
              </div>
            </div>
          )}

          {/* Pièces jointes */}
          {dossierDocs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5" />
                Pièces jointes
              </h3>
              <div className="rounded-xl bg-muted/40 p-4 space-y-2.5">
                {dossierDocs.map((doc: any, idx: number) => {
                  const isPdf = doc.type?.toLowerCase()?.includes("pdf") || doc.nom_fichier?.endsWith(".pdf");
                  return (
                    <div key={idx} className="flex items-center gap-2.5">
                      <FileText className={`h-4 w-4 shrink-0 ${isPdf ? "text-destructive/70" : "text-primary/70"}`} />
                      <span className="text-sm text-foreground">{doc.nom_fichier}</span>
                      {doc.taille && (
                        <span className="text-[10px] text-muted-foreground ml-auto">{doc.taille}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dossier rattaché */}
          {showDossierLink && (email as any).dossier_id && (
            <div className="mb-6">
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Dossier rattaché</h3>
              <a
                href={`/dossiers/${(email as any).dossier_id}`}
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                {dossierName || `Dossier`}
                <ChevronRight className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Email original */}
          <div className="mb-6">
            <Collapsible open={showOriginal} onOpenChange={setShowOriginal}>
              <CollapsibleTrigger asChild>
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  {showOriginal ? "Masquer" : "Voir"} l'email original
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 rounded-xl bg-muted/30 border border-border p-4">
                  <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">
                    {(email as any).contenu || "Contenu non disponible."}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="h-px bg-border mb-6" />

          {/* Actions — bottom */}
          <div className="space-y-4">
            {/* Generate draft — ghost/outline */}
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-muted-foreground border-border hover:text-foreground"
              onClick={handleGenerateDraft}
              disabled={draftLoading}
            >
              {draftLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Donna rédige une réponse...
                </>
              ) : (
                <>
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  {draftText ? "Regénérer la réponse" : "Générer une réponse"}
                </>
              )}
            </Button>

            {draftText && (
              <div className="rounded-xl bg-muted/30 border border-border p-5 space-y-3">
                <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{draftText}</p>
                <Button variant="outline" size="sm" className="text-xs" onClick={handleCopyDraft}>
                  <Copy className="h-3 w-3 mr-1" /> Copier la réponse
                </Button>
              </div>
            )}

            {/* Feedback */}
            <div className="border-t border-border pt-4">
              {feedbackGiven ? (
                <p className="text-xs text-muted-foreground">✓ Feedback envoyé, merci</p>
              ) : (
                <Select onValueChange={handleFeedbackSelect}>
                  <SelectTrigger className="w-56 h-8 text-xs bg-muted/30 border-border">
                    <SelectValue placeholder="Donner un feedback..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parfait">Analyse pertinente</SelectItem>
                    <SelectItem value="modifier">Analyse à améliorer</SelectItem>
                    <SelectItem value="erreur">Analyse incorrecte</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Re-export for convenience
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
