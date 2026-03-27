import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Copy, FileText, Loader2, Paperclip, Pencil, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Email } from "@/hooks/useEmails";
import { useUpdateEmailStatus } from "@/hooks/useEmails";
import { apiGet, apiPost } from "@/lib/api";
import { isDemo } from "@/lib/auth";
import { mockAllEmails } from "@/lib/mock-briefing";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

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
  const [draftEditable, setDraftEditable] = useState(false);
  const [dossierDocs, setDossierDocs] = useState<any[]>([]);
  const [dossierName, setDossierName] = useState<string | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);
  const { updateStatus } = useUpdateEmailStatus();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const emailAttachments = Array.isArray((email as any).attachments) ? (email as any).attachments : [];

    if (emailAttachments.length > 0) {
      const mockEmail = isDemo() ? mockAllEmails.find((e) => e.id === email.id) : null;
      setDossierDocs(
        emailAttachments.map((attachment: any, index: number) => {
          const mockPj = mockEmail?.pieces_jointes?.[index];
          return {
            id: attachment.id || `${email.id}-att-${index}`,
            nom_fichier: attachment.filename || attachment.name || mockPj?.nom || "",
            type: attachment.type || "",
            taille: attachment.size || mockPj?.taille || "",
            resume_ia: mockPj?.resume_ia || "",
          };
        })
      );
    } else {
      setDossierDocs([]);
    }

    const dossierId = (email as any).dossier_id;
    if (!dossierId) { setDossierName(null); return; }
    if (isDemo()) { setDossierName((email as any).dossier_name || null); return; }
    apiGet(`/api/dossiers/${dossierId}`)
      .then((data: any) => {
        setDossierName(data?.name || null);
        if (emailAttachments.length === 0) {
          setDossierDocs(
            (data?.documents || [])
              .filter((doc: any) => !doc.email_id || doc.email_id === email.id)
              .map((doc: any, i: number) => ({
                id: doc.id || `${email.id}-doc-${i}`,
                nom_fichier: doc.filename || "",
                type: doc.type || "",
                taille: doc.size || "",
              }))
          );
        }
      })
      .catch(() => setDossierName(null));
  }, [email]);

  const handleFeedback = async (action: "parfait" | "modifier" | "erreur") => {
    if (isDemo()) { setFeedbackGiven(action); toast.success("Feedback envoyé"); return; }
    try { await updateStatus(email.id, action); setFeedbackGiven(action); toast.success("Feedback envoyé"); }
    catch { toast.error("Erreur lors de l'envoi du feedback"); }
  };

  const handleGenerateDraft = async () => {
    if (isDemo()) {
      const mockDraft = (email as any).brouillon || (email as any).brouillon_mock;
      if (mockDraft) {
        setDraftLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        setDraftText(mockDraft);
        setDraftLoading(false);
      } else { toast.info("Disponible avec Gmail connecté"); }
      return;
    }
    setDraftLoading(true); setDraftEditable(false);
    try { const data = await apiPost<{ draft: string }>(`/api/emails/${email.id}/draft`); setDraftText(data.draft); }
    catch { toast.error("Erreur lors de la génération"); }
    finally { setDraftLoading(false); }
  };

  const formattedDate = (() => {
    try { return format(new Date(email.created_at), "d MMMM yyyy, HH'h'mm", { locale: fr }); }
    catch { return ""; }
  })();

  const senderName = (email.expediteur || "Expéditeur inconnu").replace(/<[^>]+>/, "").trim();
  const emailMatch = (email.expediteur || "").match(/<([^>]+)>/);
  const senderEmail = emailMatch ? emailMatch[1] : null;

  // Badge
  const emailType = (email as any).email_type || ((email as any).classification?.needs_response ? "demande" : "informatif");
  const badges: Record<string, { label: string; className: string }> = {
    demande: { label: "Action requise", className: "bg-orange-100 text-orange-800" },
    relance: { label: "Relance", className: "bg-amber-100 text-amber-800" },
    convocation: { label: "Convocation", className: "bg-purple-100 text-purple-800" },
    piece_jointe: { label: "Document reçu", className: "bg-emerald-100 text-emerald-800" },
    informatif: { label: "Informatif", className: "bg-muted text-muted-foreground" },
  };
  const badge = badges[emailType] || badges.informatif;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/30"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        role="dialog" aria-modal="true" aria-label={`Email : ${email.objet || "Sans objet"}`}
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-md bg-background shadow-xl rounded-l-2xl overflow-y-auto"
      >
        <div className="p-6">
          <h1 className="sr-only">Détail de l'email : {email.objet || "Sans objet"}</h1>

          {/* Close */}
          <div className="flex justify-end mb-6">
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center rounded-full text-[10px] px-2.5 py-0.5 font-semibold ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          {/* Sender */}
          <p className="text-base font-medium text-foreground">{senderName}</p>
          {senderEmail && <p className="text-xs text-muted-foreground mt-0.5">{senderEmail}</p>}

          {/* Subject + date */}
          <h2 className="text-lg font-semibold text-foreground leading-snug mt-4 mb-0.5">{email.objet || "Sans objet"}</h2>
          <p className="text-xs text-muted-foreground mb-6">{formattedDate}</p>

          <div className="border-t border-border mb-6" />

          {/* Résumé Donna */}
          {email.resume && (
            <div className="mb-6">
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Résumé Donna</h3>
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-sm text-foreground/85 whitespace-pre-line leading-relaxed">{email.resume}</p>
              </div>
            </div>
          )}

          {/* Pièces jointes */}
          {dossierDocs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5" /> Pièces jointes
              </h3>
              <div className="space-y-1.5">
                {dossierDocs.map((doc: any, idx: number) => {
                  const isPdf = doc.type?.toLowerCase()?.includes("pdf") || doc.nom_fichier?.endsWith(".pdf");
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedAttachment(doc)}
                      className="flex items-center gap-2.5 w-full text-left rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
                    >
                      <FileText className={`h-4 w-4 shrink-0 ${isPdf ? "text-red-500/70" : "text-blue-500/70"}`} />
                      <span className="text-sm text-foreground truncate flex-1">{doc.nom_fichier}</span>
                      {doc.taille && <span className="text-[10px] text-muted-foreground shrink-0">{doc.taille}</span>}
                    </button>
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
                className="text-sm text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                {dossierName || "Dossier"}
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </a>
            </div>
          )}

          <div className="border-t border-border mb-6" />

          {/* Generate draft — primary action */}
          <Button
            className="w-full mb-3"
            onClick={handleGenerateDraft}
            disabled={draftLoading || (!!draftText && !draftLoading)}
          >
            {draftLoading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Génération en cours…</>
            ) : draftText ? (
              "Réponse générée ✓"
            ) : (
              "Générer une réponse"
            )}
          </Button>

          {/* Draft response */}
          {draftText && !draftLoading && (
            <div className="rounded-xl bg-muted/30 p-4 mb-4 space-y-3">
              {draftEditable ? (
                <Textarea
                  ref={textareaRef}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  className="min-h-[180px] text-sm leading-relaxed bg-background border-border"
                />
              ) : (
                <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{draftText}</p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => { navigator.clipboard.writeText(draftText); toast.success("Copié !"); }}>
                  <Copy className="h-3 w-3 mr-1" /> Copier
                </Button>
                {!draftEditable && (
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => { setDraftEditable(true); setTimeout(() => textareaRef.current?.focus(), 50); }}>
                    <Pencil className="h-3 w-3 mr-1" /> Modifier
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Email original — simple text link */}
          <Collapsible open={showOriginal} onOpenChange={setShowOriginal}>
            <CollapsibleTrigger asChild>
              <button className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors mb-4 block">
                {showOriginal ? "Masquer" : "Voir"} l'email original
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="rounded-xl bg-muted/20 border border-border p-4 mb-4">
                <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">
                  {(email as any).contenu || email.resume || "Contenu non disponible."}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Feedback — very discreet */}
          <div className="border-t border-border pt-4">
            {feedbackGiven ? (
              <p className="text-xs text-muted-foreground">✓ Feedback envoyé</p>
            ) : (
              <Select onValueChange={(v) => { const m: Record<string, "parfait" | "modifier" | "erreur"> = { parfait: "parfait", modifier: "modifier", erreur: "erreur" }; if (m[v]) handleFeedback(m[v]); }}>
                <SelectTrigger className="w-48 h-7 text-[11px] bg-transparent border-border text-muted-foreground">
                  <SelectValue placeholder="Feedback…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parfait">Analyse pertinente</SelectItem>
                  <SelectItem value="modifier">À améliorer</SelectItem>
                  <SelectItem value="erreur">Incorrecte</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </motion.div>

      {/* PJ Detail Dialog */}
      <Dialog open={!!selectedAttachment} onOpenChange={(open) => !open && setSelectedAttachment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {selectedAttachment?.nom_fichier}
            </DialogTitle>
            {selectedAttachment?.taille && <DialogDescription>{selectedAttachment.taille}</DialogDescription>}
          </DialogHeader>
          {selectedAttachment?.resume_ia && (
            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Résumé Donna</p>
              <p className="text-sm text-foreground/85 leading-relaxed">{selectedAttachment.resume_ia}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center pt-2">Téléchargement disponible après connexion Gmail</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
