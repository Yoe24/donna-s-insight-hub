import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coffee, Eye, Copy, ChevronDown, Archive, X, FileText, PenLine, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useEmails, useEmailStats, useUpdateEmailStatus } from "@/hooks/useEmails";
import type { Email } from "@/hooks/useEmails";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { parseDonnaAnalysis } from "@/lib/parseDonnaAnalysis";
import { api } from "@/lib/api";

function formatEmailTime(created_at: string) {
  try {
    const date = new Date(created_at);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return `Aujourd'hui à ${format(date, "HH'h'mm", { locale: fr })}`;
    }
    return format(date, "d MMM 'à' HH'h'mm", { locale: fr });
  } catch {
    return "";
  }
}

// ── Animated Counter Hook ──
function useAnimatedCounter(target: number, duration = 1000) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;
    const start = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [target, duration]);

  return count;
}

// ── Sender Avatar ──
function senderInitial(expediteur: string): string {
  // Extract name before email if format is "Name <email>"
  const match = expediteur.match(/^([^<]+)/);
  const name = match ? match[1].trim() : expediteur;
  // Get first letter, handle email-only case
  const firstChar = name.replace(/[^a-zA-ZÀ-ÿ]/g, "")[0] || name[0] || "?";
  return firstChar.toUpperCase();
}

function senderColor(expediteur: string): string {
  let hash = 0;
  for (let i = 0; i < expediteur.length; i++) {
    hash = expediteur.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

function SenderAvatar({ expediteur, size = 40 }: { expediteur: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 text-white font-bold"
      style={{
        width: size,
        height: size,
        backgroundColor: senderColor(expediteur),
        fontSize: size * 0.4,
      }}
    >
      {senderInitial(expediteur)}
    </div>
  );
}

// ── Category logic ──
type EmailCategorie = "client" | "prospect" | "other";

function getCategorie(email: Email): EmailCategorie {
  const cat = email.metadata?.filtre?.categorie;
  if (cat === "client") return "client";
  if (cat === "prospect") return "prospect";
  return "other";
}

// Only show badge for client/prospect. For "other", return null.
function CategorieBadge({ email }: { email: Email }) {
  const cat = getCategorie(email);
  if (cat === "other") return null;

  if (cat === "client") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-client-light text-client-foreground text-[10px] px-2 py-0.5 font-semibold">
        👤 Client
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-prospect-light text-prospect-foreground text-[10px] px-2 py-0.5 font-semibold">
      🌱 Prospect
    </span>
  );
}

function ImportArchives({ emails }: { emails: Email[] }) {
  const senderCounts: Record<string, number> = {};
  emails.forEach(e => {
    senderCounts[e.expediteur] = (senderCounts[e.expediteur] || 0) + 1;
  });
  const sortedSenders = Object.entries(senderCounts).sort((a, b) => b[1] - a[1]);
  const uniqueDossiers = new Set(emails.map(e => e.metadata?.filtre?.categorie)).size;

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group">
          <Archive className="h-3.5 w-3.5" />
          <span>Voir les archives d'import</span>
          <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-3 border-border bg-card">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-foreground">
              <span className="font-medium">{emails.length} emails importés</span>, répartis sur{" "}
              <span className="font-medium">{uniqueDossiers} catégories</span>
            </p>
            <div className="space-y-1.5">
              {sortedSenders.slice(0, 10).map(([sender, count]) => (
                <div key={sender} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate mr-4">{sender}</span>
                  <span className="text-foreground font-medium tabular-nums">{count} email{count > 1 ? "s" : ""}</span>
                </div>
              ))}
              {sortedSenders.length > 10 && (
                <p className="text-xs text-muted-foreground">… et {sortedSenders.length - 10} autres expéditeurs</p>
              )}
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ── Email Detail Overlay ──
function EmailDetailOverlay({
  email,
  onClose,
}: {
  email: Email;
  onClose: () => void;
}) {
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [draftText, setDraftText] = useState<string | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [dossierDocs, setDossierDocs] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const { updateStatus } = useUpdateEmailStatus();

  const analysis = parseDonnaAnalysis(email.brouillon);

  useEffect(() => {
    if (!(email as any).dossier_id) {
      setDossierDocs([]);
      return;
    }
    setDocsLoading(true);
    api.get(`/api/dossiers/${(email as any).dossier_id}`)
      .then((data: any) => {
        const docs = data?.dossier_documents || [];
        const filtered = docs.filter((doc: any) => {
          if (doc.email_id) return doc.email_id === email.id;
          if (!doc.created_at) return true;
          const docDate = new Date(doc.created_at);
          const emailDate = new Date(email.created_at);
          return Math.abs(docDate.getTime() - emailDate.getTime()) <= 86400000;
        });
        setDossierDocs(filtered);
      })
      .catch(() => setDossierDocs([]))
      .finally(() => setDocsLoading(false));
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
      const data = await api.post<{ draft: string }>(`/api/emails/${email.id}/draft`);
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
      parfait: "parfait",
      modifier: "modifier",
      erreur: "erreur",
    };
    if (map[value]) handleFeedback(map[value]);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8 sm:py-12 px-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-[700px] bg-background rounded-none sm:rounded-2xl p-6 sm:p-8 shadow-2xl"
        >
          {/* SECTION 1 — En-tête */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              ← Retour
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <SenderAvatar expediteur={email.expediteur} size={36} />
              <span className="font-semibold text-foreground">{email.expediteur}</span>
              <CategorieBadge email={email} />
              <span className="text-xs text-muted-foreground ml-auto">{formatEmailTime(email.created_at)}</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground leading-tight">{email.objet}</h2>
          </div>

          <div className="h-px bg-border mb-6" />

          {/* SECTION 2 — Résumé du mail */}
          {analysis.resume && (
            <div className="mb-6">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs">📋</span>
                <span className="text-xs font-medium text-muted-foreground">Résumé du mail</span>
              </div>
              <div className="rounded-xl bg-[hsl(210,20%,98%)] p-5">
                <p className="text-sm text-foreground/85 whitespace-pre-line" style={{ lineHeight: 1.7 }}>
                  {analysis.resume}
                </p>
              </div>
            </div>
          )}

          {/* SECTION 3 — Pièces jointes analysées */}
          {dossierDocs.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-xs">📎</span>
                <span className="text-xs font-medium text-muted-foreground">Pièces jointes analysées par Donna</span>
              </div>
              <div className="rounded-xl bg-[hsl(210,20%,98%)] p-5 space-y-4">
                {dossierDocs.map((doc: any, idx: number) => {
                  const isPdf = doc.type?.toLowerCase()?.includes("pdf") || doc.nom_fichier?.endsWith(".pdf");
                  const isWord = doc.type?.toLowerCase()?.includes("word") || doc.nom_fichier?.endsWith(".docx") || doc.nom_fichier?.endsWith(".doc");
                  const preview = !doc.resume && doc.contenu_extrait
                    ? doc.contenu_extrait.slice(0, 200) + (doc.contenu_extrait.length > 200 ? "…" : "")
                    : null;

                  return (
                    <Collapsible key={idx}>
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2.5">
                          <FileText className={`h-4 w-4 shrink-0 mt-0.5 ${isPdf ? "text-red-500" : isWord ? "text-blue-500" : "text-muted-foreground"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{doc.nom_fichier}</p>
                            {doc.resume && (
                              <p className="text-sm text-foreground/70 mt-1 leading-relaxed">{doc.resume}</p>
                            )}
                            {preview && (
                              <p className="text-sm text-foreground/70 mt-1 leading-relaxed">{preview}</p>
                            )}
                          </div>
                        </div>
                        {doc.contenu_extrait && (
                          <>
                            <CollapsibleTrigger asChild>
                              <button className="text-[11px] text-primary font-medium hover:underline ml-6">
                                Voir l'extrait complet ›
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="mt-2 ml-6 rounded-lg bg-background border border-border p-3 text-xs text-foreground/70 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                                {doc.contenu_extrait}
                              </div>
                            </CollapsibleContent>
                          </>
                        )}
                      </div>
                      {idx < dossierDocs.length - 1 && <div className="h-px bg-border/50 mt-4" />}
                    </Collapsible>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4 — Générer une réponse */}
          <div className="mb-6 space-y-3">
            <Button
              variant="outline"
              className="text-sm border-border hover:border-primary/50 transition-colors"
              onClick={handleGenerateDraft}
              disabled={draftLoading}
            >
              {draftLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Donna rédige une réponse...
                </>
              ) : (
                draftText ? "✉️ Regénérer la réponse" : "✉️ Générer une réponse"
              )}
            </Button>

            {draftText && (
              <div className="rounded-xl bg-[hsl(213,100%,97%)] border border-[hsl(213,90%,90%)] p-5 space-y-3">
                <p className="text-sm font-mono text-foreground/80 whitespace-pre-line leading-relaxed">{draftText}</p>
                <Button variant="outline" size="sm" className="text-xs" onClick={handleCopyDraft}>
                  <Copy className="h-3 w-3 mr-1" />Copier la réponse
                </Button>
              </div>
            )}
          </div>

          {/* SECTION 5 — Email original (replié) */}
          <div className="mb-6">
            <Collapsible open={showOriginal} onOpenChange={setShowOriginal}>
              <CollapsibleTrigger asChild>
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {showOriginal ? "Masquer" : "Voir"} l'email original ›
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 rounded-xl bg-muted/40 border border-border p-4">
                  <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">
                    {(email as any).contenu || "Contenu non disponible."}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* SECTION 6 — Feedback */}
          <div className="border-t border-border pt-5">
            {feedbackGiven ? (
              <p className="text-xs text-muted-foreground">✓ Feedback envoyé, merci</p>
            ) : (
              <Select onValueChange={handleFeedbackSelect}>
                <SelectTrigger className="w-56 h-8 text-xs bg-muted/40 border-border">
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Dashboard ──
const Dashboard = () => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [nomAvocat, setNomAvocat] = useState<string>("");
  const { emails, loading } = useEmails();
  const { stats } = useEmailStats();

  useEffect(() => {
    api.get<{ nom_avocat?: string }>("/api/config")
      .then(data => {
        if (data?.nom_avocat) setNomAvocat(data.nom_avocat);
      })
      .catch(() => {});
  }, []);

  const activeEmails = emails.filter(e => e.statut !== "archive" && e.statut !== "ignore" && e.pipeline_step !== "importe");
  const isInboxEmpty = activeEmails.length === 0;

  const tempsMinutes = stats.traites * 5;
  const economise = Math.round(stats.traites * 5 * 75 / 60);
  const animatedTraites = useAnimatedCounter(stats.traites, 1500);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="mt-8 mb-10 space-y-3">
            <div className="h-16 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-2.5 pt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg border border-border p-4 flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-full bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Hero Score Header */}
        <div className="mt-8 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-baseline gap-3"
          >
            <span className="text-[4rem] font-extrabold leading-none tabular-nums text-foreground">
              {animatedTraites}
            </span>
            <span className="text-base font-normal text-muted-foreground">
              emails traités
            </span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-2 text-[0.9rem] text-[hsl(220,9%,64%)]"
          >
            ⏱ {tempsMinutes}min gagnées{" "}
            <span className="text-[hsl(220,9%,78%)]">·</span>{" "}
            💰 {economise}€ économisés
          </motion.p>
          {stats.en_attente > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              className="mt-1.5 text-[0.85rem] text-[hsl(38,92%,50%)]"
            >
              ⚡ {stats.en_attente} email{stats.en_attente > 1 ? "s" : ""} nécessite{stats.en_attente > 1 ? "nt" : ""} votre attention
            </motion.p>
          )}
        </div>

        {/* Email list */}
        {isInboxEmpty ? (
          <div className="space-y-6">
            <div className="text-center py-12">
              <Coffee className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">Rien de nouveau pour l'instant</p>
            </div>
            {emails.length > 0 && <ImportArchives emails={emails} />}
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {activeEmails.map((email, i) => {
                const isRejected = email.pipeline_step === "filtre_rejete";
                const analysis = parseDonnaAnalysis(email.brouillon);

                return (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card
                      className={`bg-card hover:shadow-md transition-all cursor-pointer group ${isRejected ? "opacity-40" : ""}`}
                      onClick={() => {
                        if (!isRejected) setSelectedEmail(email);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <SenderAvatar expediteur={email.expediteur} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground truncate">{email.expediteur}</span>
                              {isRejected ? (
                                <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-[10px] px-2 py-0.5 font-medium">Filtré</span>
                              ) : (
                                <CategorieBadge email={email} />
                              )}
                              <span className="text-[11px] text-muted-foreground ml-auto shrink-0">{formatEmailTime(email.created_at)}</span>
                            </div>
                            <p className="text-sm text-foreground/80 mt-1 truncate">{email.objet}</p>
                            {!isRejected && analysis.resume && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{analysis.resume}</p>
                            )}
                          </div>
                          {!isRejected && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="shrink-0 mt-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEmail(email);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Email detail overlay */}
      {selectedEmail && (
        <EmailDetailOverlay
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
