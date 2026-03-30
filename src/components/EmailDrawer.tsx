import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, FileText, Loader2, Paperclip, Pencil, ChevronRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
// Select removed — feedback uses inline buttons now
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
  context?: "briefing" | "fil" | "dossier";
}

export function EmailDrawer({ email, onClose, showDossierLink = true, context = "briefing" }: EmailDrawerProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  // Pre-fill draft if already generated (from backend pipeline or mock)
  const preExistingDraft = (email as any).brouillon || null;
  const [draftText, setDraftText] = useState<string | null>(null);
  const [draftPreLoaded, setDraftPreLoaded] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftEditable, setDraftEditable] = useState(false);
  const [dossierDocs, setDossierDocs] = useState<any[]>([]);
  const [dossierName, setDossierName] = useState<string | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);
  const { updateStatus } = useUpdateEmailStatus();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [displayedDraft, setDisplayedDraft] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // Resolve mock email for metadata
  const mockEmail = isDemo() ? mockAllEmails.find((e) => e.id === email.id) : null;

  useEffect(() => {
    const emailAttachments = Array.isArray((email as any).attachments) ? (email as any).attachments : [];

    if (emailAttachments.length > 0) {
      setDossierDocs(
        emailAttachments.map((attachment: any, index: number) => {
          const mockPj = mockEmail?.pieces_jointes?.[index];
          return {
            id: attachment.id || `${email.id}-att-${index}`,
            nom_fichier: attachment.filename || attachment.name || attachment.nom_fichier || mockPj?.nom || "",
            type: attachment.type || "",
            taille: attachment.size || attachment.taille || mockPj?.taille || "",
            resume_ia: attachment.resume_ia || mockPj?.resume_ia || "",
            storage_url: attachment.storage_url || attachment.url || null,
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
                nom_fichier: doc.filename || doc.nom_fichier || "",
                type: doc.type || "",
                taille: doc.size || doc.taille || "",
                storage_url: doc.storage_url || doc.url || null,
                resume_ia: doc.resume_ia || "",
              }))
          );
        }
      })
      .catch(() => setDossierName(null));
  }, [email]);

  const handleFeedback = async (action: "parfait" | "modifier" | "erreur") => {
    if (isDemo()) { setFeedbackGiven(action); toast.success("Merci pour votre retour"); return; }
    try { await updateStatus(email.id, action); setFeedbackGiven(action); toast.success("Merci pour votre retour"); }
    catch { toast.error("Erreur lors de l'envoi du feedback"); }
  };

  const handleGenerateDraft = async () => {
    // If a pre-existing draft from pipeline/mock exists, show it instantly
    if (preExistingDraft && !draftPreLoaded) {
      setDraftPreLoaded(true);
      setDraftText(preExistingDraft);
      return;
    }

    if (isDemo()) {
      const mockDraft = (email as any).brouillon || (email as any).brouillon_mock;
      if (mockDraft) {
        setDraftLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        setDraftLoading(false);
        setIsStreaming(true);
        setDisplayedDraft("");
        let idx = 0;
        const interval = setInterval(() => {
          const chunk = Math.floor(Math.random() * 3) + 3;
          idx += chunk;
          if (idx >= mockDraft.length) {
            setDisplayedDraft(mockDraft);
            setDraftText(mockDraft);
            setIsStreaming(false);
            clearInterval(interval);
          } else {
            setDisplayedDraft(mockDraft.substring(0, idx));
          }
        }, 20);
      } else { toast.info("Disponible avec Gmail connecté"); }
      return;
    }
    setDraftLoading(true); setDraftEditable(false);
    try { const data = await apiPost<{ draft: string }>(`/api/emails/${email.id}/draft`); setDraftText(data.draft); }
    catch { toast.error("Erreur lors de la génération"); }
    finally { setDraftLoading(false); }
  };

  // Date formatting — Gmail style "27 mars 2026 à 14:32"
  const formattedDate = (() => {
    try { return format(new Date(email.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr }); }
    catch { return ""; }
  })();

  // Email metadata — from mock or parsed from expediteur
  const fromEmail = mockEmail?.from_email || (() => {
    const name = (email.expediteur || "Expéditeur inconnu").replace(/<[^>]+>/, "").trim();
    const match = (email.expediteur || "").match(/<([^>]+)>/);
    return match ? `${name} <${match[1]}>` : name;
  })();
  const toEmail = mockEmail?.to_email || "alexandra@cabinet-fernandez.fr";
  const ccEmail = mockEmail?.cc_email || (email as any).cc_email || null;

  // Sender name for subject area
  const senderName = (email.expediteur || "Expéditeur inconnu").replace(/<[^>]+>/, "").trim();

  // Badge
  const emailType = (email as any).email_type || ((email as any).classification?.needs_response ? "demande" : "informatif");
  const badges: Record<string, { label: string; className: string }> = {
    demande: { label: "Action requise", className: "bg-orange-50 text-orange-700 ring-1 ring-orange-200" },
    relance: { label: "Relance", className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
    convocation: { label: "Convocation", className: "bg-purple-50 text-purple-700 ring-1 ring-purple-200" },
    piece_jointe: { label: "Document reçu", className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
    informatif: { label: "Informatif", className: "bg-gray-50 text-gray-600 ring-1 ring-gray-200" },
  };
  const badge = badges[emailType] || badges.informatif;

  return (
    <>
      {/* Full-screen overlay */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-background"
        role="dialog" aria-modal="true" aria-label={`Email : ${email.objet || "Sans objet"}`}
      >
        <div className="h-full flex flex-col">
          {/* Top bar — Back button */}
          <div className="border-b border-border/60 px-4 sm:px-8 py-3 flex items-center gap-4 shrink-0">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <div className="flex-1" />
            <span className={`inline-flex items-center rounded-full text-[10px] px-2.5 py-0.5 font-semibold ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6">
              <h1 className="sr-only">Détail de l'email : {email.objet || "Sans objet"}</h1>

              {/* Subject */}
              <h2 className="text-xl font-semibold text-foreground leading-snug mb-4 line-clamp-2 break-words">{email.objet || "Sans objet"}</h2>

              {/* Gmail-style email metadata header */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium text-muted-foreground">De : </span>
                      {fromEmail}
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="font-medium text-muted-foreground">À : </span>
                      {toEmail}
                    </p>
                    {ccEmail && (
                      <p className="text-sm text-foreground">
                        <span className="font-medium text-muted-foreground">CC : </span>
                        {ccEmail}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">{formattedDate}</p>
                  </div>
                </div>
              </div>

              {/* Résumé Donna — visually distinct from the metadata block */}
              {email.resume && (
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">Résumé Donna</h3>
                  <div className="rounded-xl bg-muted/30 p-4">
                    <p className="text-sm text-foreground/85 whitespace-pre-line leading-relaxed break-words">{email.resume}</p>
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

              {/* Generate draft */}
              <Button
                className={context === "fil" ? "mb-3" : "w-full mb-3"}
                variant={context === "fil" ? "outline" : "default"}
                onClick={handleGenerateDraft}
                disabled={draftLoading || isStreaming || (!!draftText && !draftLoading)}
              >
                {draftLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Génération en cours…</>
                ) : draftText ? (
                  "Réponse générée ✓"
                ) : preExistingDraft && !draftPreLoaded ? (
                  "Brouillon prêt — Voir"
                ) : (
                  "Générer une réponse"
                )}
              </Button>
              {context === "dossier" && !draftText && (
                <p className="text-xs text-muted-foreground mb-3">Donna rédige dans votre style avec votre signature</p>
              )}
              {context === "fil" && (email as any).dossier_id && (
                <a href={`/dossiers/${(email as any).dossier_id}`} className="text-xs text-muted-foreground hover:text-primary transition-colors mb-3 block">
                  → Ouvrir le dossier pour travailler sur cet email
                </a>
              )}

              {/* Draft response */}
              {(draftText || isStreaming) && !draftLoading && (
                <div className="rounded-xl bg-muted/30 p-4 mb-4 space-y-3">
                  {draftEditable ? (
                    <Textarea
                      ref={textareaRef}
                      value={draftText || ""}
                      onChange={(e) => setDraftText(e.target.value)}
                      className="min-h-[180px] text-sm leading-relaxed bg-background border-border"
                    />
                  ) : (
                    <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed break-words">
                      {isStreaming ? displayedDraft : draftText}
                      {isStreaming && <span className="animate-pulse text-primary">▌</span>}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => { navigator.clipboard.writeText(draftText || ""); toast.success("Copié !"); }} disabled={isStreaming}>
                      <Copy className="h-3 w-3 mr-1" /> Copier
                    </Button>
                    {!draftEditable && (
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => { setDraftEditable(true); setTimeout(() => textareaRef.current?.focus(), 50); }} disabled={isStreaming}>
                        <Pencil className="h-3 w-3 mr-1" /> Modifier
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Email original */}
              <Collapsible open={showOriginal} onOpenChange={setShowOriginal}>
                <CollapsibleTrigger asChild>
                  <button className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors mb-4 block">
                    {showOriginal ? "Masquer" : "Voir"} l'email original
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="rounded-xl bg-muted/20 border border-border p-4 mb-4">
                    <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed break-words">
                      {(email as any).contenu || email.resume || "Contenu non disponible."}
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Feedback */}
              <div className="border-t border-border pt-4">
                {feedbackGiven ? (
                  <p className="text-xs text-muted-foreground">Merci pour votre retour</p>
                ) : (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Ce résumé est-il utile ?</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleFeedback("parfait")} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors">
                        Parfait
                      </button>
                      <button onClick={() => handleFeedback("modifier")} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors">
                        À améliorer
                      </button>
                      <button onClick={() => handleFeedback("erreur")} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors">
                        Incorrect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
          {!isDemo() && selectedAttachment?.storage_url ? (
            <a
              href={selectedAttachment.storage_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full text-xs font-medium text-foreground underline underline-offset-2 hover:text-primary transition-colors pt-2"
              download={selectedAttachment?.nom_fichier}
            >
              Télécharger le fichier
            </a>
          ) : (
            <p className="text-xs text-muted-foreground text-center pt-2">
              {isDemo() ? "Téléchargement disponible après connexion Gmail" : "Fichier non disponible"}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
