import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Coffee, Eye, User, Copy, ChevronDown, Archive, Check, Pencil, X, Sparkles, TrendingUp, Clock, AlertCircle, FileText } from "lucide-react";
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

type EmailCategorie = "client" | "prospect" | "other";

function getCategorie(email: Email): EmailCategorie {
  const cat = email.metadata?.filtre?.categorie;
  if (cat === "client") return "client";
  if (cat === "prospect") return "prospect";
  return "other";
}

const categorieConfig: Record<EmailCategorie, { label: string; icon: string; borderClass: string; bgClass: string; textClass: string; avatarBgClass: string; avatarTextClass: string; badgeBgClass: string; badgeTextClass: string }> = {
  client: {
    label: "Client",
    icon: "👤",
    borderClass: "border-l-client",
    bgClass: "bg-client-light",
    textClass: "text-client-foreground",
    avatarBgClass: "bg-client-light",
    avatarTextClass: "text-client",
    badgeBgClass: "bg-client-light",
    badgeTextClass: "text-client-foreground",
  },
  prospect: {
    label: "Prospect",
    icon: "🌱",
    borderClass: "border-l-prospect",
    bgClass: "bg-prospect-light",
    textClass: "text-prospect-foreground",
    avatarBgClass: "bg-prospect-light",
    avatarTextClass: "text-prospect",
    badgeBgClass: "bg-prospect-light",
    badgeTextClass: "text-prospect-foreground",
  },
  other: {
    label: "Autre",
    icon: "📨",
    borderClass: "border-l-other",
    bgClass: "bg-other-light",
    textClass: "text-other-foreground",
    avatarBgClass: "bg-other-light",
    avatarTextClass: "text-other",
    badgeBgClass: "bg-other-light",
    badgeTextClass: "text-other-foreground",
  },
};

function CategorieBadge({ email }: { email: Email }) {
  const cat = getCategorie(email);
  const config = categorieConfig[cat];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${config.badgeBgClass} ${config.badgeTextClass} text-[10px] px-2 py-0.5 font-semibold`}>
      <span>{config.icon}</span>
      {config.label}
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

function AttentionText({ text }: { text: string }) {
  const parts = text.split(/(\[À VÉRIFIER\])/gi);
  return (
    <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
      {parts.map((part, i) =>
        part.match(/\[À VÉRIFIER\]/i) ? (
          <span key={i} className="text-orange-600 font-semibold bg-orange-100 px-1 rounded">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

const Dashboard = () => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [nomAvocat, setNomAvocat] = useState<string>("");
  const [dossierDocs, setDossierDocs] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const { emails, loading } = useEmails();
  const { stats } = useEmailStats();
  const { updateStatus } = useUpdateEmailStatus();

  // Fetch dossier documents when an email with dossier_id is selected
  useEffect(() => {
    if (!selectedEmail || !(selectedEmail as any).dossier_id) {
      setDossierDocs([]);
      return;
    }
    setDocsLoading(true);
    api.get(`/api/dossiers/${(selectedEmail as any).dossier_id}`)
      .then((data: any) => {
        const docs = data?.dossier_documents || [];
        // Filter docs within ±1 day of the email
        const emailDate = new Date(selectedEmail.created_at);
        const filtered = docs.filter((doc: any) => {
          if (!doc.created_at) return true; // include if no date
          const docDate = new Date(doc.created_at);
          return Math.abs(docDate.getTime() - emailDate.getTime()) <= 86400000;
        });
        setDossierDocs(filtered);
      })
      .catch(() => setDossierDocs([]))
      .finally(() => setDocsLoading(false));
  }, [selectedEmail]);

  useEffect(() => {
    api.get<{ nom_avocat?: string }>("/api/config")
      .then(data => {
        if (data?.nom_avocat) setNomAvocat(data.nom_avocat);
      })
      .catch(() => {});
  }, []);

  const activeEmails = emails.filter(e => e.statut !== "archive" && e.statut !== "ignore" && e.pipeline_step !== "importe");
  const isInboxEmpty = activeEmails.length === 0;

  const clientCount = activeEmails.filter(e => getCategorie(e) === "client").length;
  const prospectCount = activeEmails.filter(e => getCategorie(e) === "prospect").length;
  const otherCount = activeEmails.filter(e => getCategorie(e) === "other").length;

  const tempsMinutes = stats.traites * 5;
  const heures = Math.floor(tempsMinutes / 60);
  const minutes = tempsMinutes % 60;
  const tempsStr = heures > 0 ? `${heures}h${minutes.toString().padStart(2, "0")}min` : `${minutes}min`;

  const prenom = nomAvocat ? nomAvocat.split(" ")[0] : "";

  const handleFeedback = async (action: "parfait" | "modifier" | "erreur") => {
    if (!selectedEmail) return;
    try {
      await updateStatus(selectedEmail.id, action);
      setFeedbackGiven(action);
      toast.success("Feedback envoyé, merci !");
    } catch {
      toast.error("Erreur lors de l'envoi du feedback");
    }
  };

  const handleCopyResume = () => {
    if (!selectedEmail) return;
    const analysis = parseDonnaAnalysis(selectedEmail.brouillon);
    const text = [analysis.resume, analysis.recommandation].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Résumé copié !");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <Sparkles className="h-6 w-6 text-donna animate-pulse" />
            <p className="text-sm text-muted-foreground">Donna prépare votre briefing…</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Donna Briefing Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Greeting + briefing text */}
          <div className="rounded-xl border border-donna/15 bg-gradient-to-br from-donna-light to-background p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🟣</span>
                <h2 className="font-serif text-lg font-bold text-foreground tracking-tight">
                  {prenom ? `Bonjour ${prenom}` : "Bonjour"}, c'est Donna — votre employée numérique 24/7
                </h2>
              </div>
              <p className="text-xs text-muted-foreground pl-8 italic">
                Je lis, je trie et je résume tous vos emails pour vous.
              </p>
              <p className="text-sm text-foreground/70 leading-relaxed pl-8">
                {isInboxEmpty ? (
                  "Tout est calme pour le moment. Je surveille votre boîte mail et vous préviendrai dès qu'un email arrive."
                ) : (
                  <>
                    Voilà ce que j'ai fait aujourd'hui : vous avez reçu <span className="font-semibold text-foreground">{stats.recus} email{stats.recus > 1 ? "s" : ""}</span>.
                    {" "}J'en ai analysé <span className="font-semibold text-foreground">{stats.traites}</span>
                    {stats.valides > 0 && <> et validé <span className="font-semibold text-foreground">{stats.valides}</span></>}.
                    {otherCount > 0 && (
                      <> J'ai filtré <span className="font-semibold text-foreground">{otherCount} newsletter{otherCount > 1 ? "s" : ""}/autre{otherCount > 1 ? "s" : ""}</span>.</>
                    )}
                    {clientCount > 0 && (
                      <> <span className="font-semibold text-client">{clientCount} de vos client{clientCount > 1 ? "s" : ""}</span> vous ont écrit.</>
                    )}
                    {prospectCount > 0 && (
                      <> <span className="font-semibold text-prospect">{prospectCount} prospect{prospectCount > 1 ? "s" : ""}</span> à traiter.</>
                    )}
                    {stats.en_attente > 0 && (
                      <> <span className="font-semibold text-orange-600">{stats.en_attente} email{stats.en_attente > 1 ? "s" : ""}</span> {stats.en_attente > 1 ? "nécessitent" : "nécessite"} votre attention.</>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          {!isInboxEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-2 gap-3"
            >
              <Card className="border-border bg-card shadow-sm">
                <CardContent className="p-4 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-medium uppercase tracking-wider">Temps gagné</span>
                  </div>
                  <p className="text-2xl font-serif font-bold text-foreground">{tempsStr}</p>
                  <p className="text-[10px] text-muted-foreground">estimé aujourd'hui</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card shadow-sm">
                <CardContent className="p-4 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-medium uppercase tracking-wider">Économisé</span>
                  </div>
                  <p className="text-2xl font-serif font-bold text-foreground">{Math.round(tempsMinutes * 1.25)}€</p>
                  <p className="text-[10px] text-muted-foreground">estimé aujourd'hui</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Category breakdown pills */}
          {!isInboxEmpty && (clientCount > 0 || prospectCount > 0 || otherCount > 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap gap-2"
            >
              {clientCount > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-client-light px-3 py-1.5 text-xs">
                  <span>👤</span>
                  <span className="font-semibold text-client-foreground">{clientCount} client{clientCount > 1 ? "s" : ""}</span>
                </div>
              )}
              {prospectCount > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-prospect-light px-3 py-1.5 text-xs">
                  <span>🌱</span>
                  <span className="font-semibold text-prospect-foreground">{prospectCount} prospect{prospectCount > 1 ? "s" : ""}</span>
                </div>
              )}
              {otherCount > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-other-light px-3 py-1.5 text-xs">
                  <span>📨</span>
                  <span className="font-semibold text-other-foreground">{otherCount} filtré{otherCount > 1 ? "s" : ""}</span>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

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
                const cat = getCategorie(email);
                const config = categorieConfig[cat];

                return (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card
                      className={`border-l-4 ${isRejected ? "border-l-other opacity-40" : config.borderClass} bg-card hover:shadow-md transition-all cursor-pointer group`}
                      onClick={() => {
                        if (!isRejected) {
                          setSelectedEmail(email);
                          setFeedbackGiven(null);
                          setShowOriginal(false);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`h-9 w-9 rounded-full ${isRejected ? "bg-other-light" : config.avatarBgClass} flex items-center justify-center shrink-0 mt-0.5 text-base`}>
                            {isRejected ? "📨" : config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground truncate">{email.expediteur}</span>
                              {isRejected ? (
                                <span className="inline-flex items-center rounded-full bg-other-light text-other-foreground text-[10px] px-2 py-0.5 font-medium">Ignoré</span>
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
                                setFeedbackGiven(null);
                                setShowOriginal(false);
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

      {/* Detail slide-over */}
      <Sheet open={!!selectedEmail} onOpenChange={(open) => { if (!open) setSelectedEmail(null); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedEmail && (() => {
            const analysis = parseDonnaAnalysis(selectedEmail.brouillon);
            const cat = getCategorie(selectedEmail);
            const config = categorieConfig[cat];
            return (
              <>
                <SheetHeader className="pb-4 border-b border-border">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`h-7 w-7 rounded-full ${config.avatarBgClass} flex items-center justify-center text-sm`}>
                      {config.icon}
                    </div>
                    <span className="font-semibold text-sm">{selectedEmail.expediteur}</span>
                    <CategorieBadge email={selectedEmail} />
                    <span className="text-xs text-muted-foreground ml-auto">{formatEmailTime(selectedEmail.created_at)}</span>
                  </div>
                  <SheetTitle className="text-base font-semibold mt-1">{selectedEmail.objet}</SheetTitle>
                </SheetHeader>

                <div className="space-y-5 py-6">
                  {analysis.resume && (
                    <div className="rounded-lg bg-muted/60 border border-border p-4">
                      <p className="text-xs font-semibold text-foreground mb-2">📋 Résumé</p>
                      <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{analysis.resume}</p>
                    </div>
                  )}


                  {/* Pièces jointes */}
                  {dossierDocs.length > 0 && (
                    <div className="rounded-lg bg-muted/40 border border-border p-4 space-y-3">
                      <p className="text-xs font-semibold text-foreground">📎 Pièces jointes ({dossierDocs.length})</p>
                      {dossierDocs.map((doc: any, idx: number) => {
                        const isPdf = doc.type?.toLowerCase()?.includes("pdf") || doc.nom_fichier?.endsWith(".pdf");
                        return (
                          <Collapsible key={idx}>
                            <div className="rounded-md bg-card border border-border p-3 space-y-2">
                              <div className="flex items-start gap-2.5">
                                <FileText className={`h-4 w-4 shrink-0 mt-0.5 ${isPdf ? "text-red-500" : "text-blue-500"}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate">{doc.nom_fichier}</p>
                                  {doc.resume && (
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-4">{doc.resume}</p>
                                  )}
                                </div>
                              </div>
                              {doc.contenu_extrait && (
                                <>
                                  <CollapsibleTrigger asChild>
                                    <button className="text-[11px] text-donna font-medium hover:underline">
                                      Voir l'extrait complet
                                    </button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className="mt-2 rounded bg-muted/60 p-3 text-xs text-foreground/70 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                                      {doc.contenu_extrait}
                                    </div>
                                  </CollapsibleContent>
                                </>
                              )}
                            </div>
                          </Collapsible>
                        );
                      })}
                    </div>
                  )}

                  {analysis.attention && (
                    <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
                      <p className="text-xs font-semibold text-orange-600 mb-2">💡 Points d'attention</p>
                      <AttentionText text={analysis.attention} />
                    </div>
                  )}

                  {!analysis.resume && !analysis.recommandation && !analysis.attention && selectedEmail.brouillon && (
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm whitespace-pre-wrap">{selectedEmail.brouillon}</p>
                    </div>
                  )}

                  <Collapsible open={showOriginal} onOpenChange={setShowOriginal}>
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronDown className={`h-3 w-3 transition-transform ${showOriginal ? "rotate-180" : ""}`} />
                        Voir l'email original
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-3 rounded-lg bg-muted/40 border border-border p-4">
                        <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">
                          {(selectedEmail as any).contenu || "Contenu non disponible."}
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="border-t border-border pt-5 space-y-3">
                    <p className="text-xs text-muted-foreground">Comment Donna a-t-elle travaillé sur cet email ?</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs transition-all ${feedbackGiven === "parfait" ? "border-prospect bg-prospect-light text-prospect-foreground scale-105" : "text-prospect-foreground border-prospect/30 hover:bg-prospect-light"}`}
                        onClick={() => handleFeedback("parfait")}
                        disabled={!!feedbackGiven}
                      >
                        <Check className="h-3 w-3 mr-1" />Très bien analysé
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs transition-all ${feedbackGiven === "modifier" ? "border-amber-500 bg-amber-50 text-amber-700 scale-105" : "text-amber-700 border-amber-200 hover:bg-amber-50"}`}
                        onClick={() => handleFeedback("modifier")}
                        disabled={!!feedbackGiven}
                      >
                        <Pencil className="h-3 w-3 mr-1" />À améliorer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs transition-all ${feedbackGiven === "erreur" ? "border-destructive bg-destructive/10 text-destructive scale-105" : "text-destructive border-destructive/30 hover:bg-destructive/10"}`}
                        onClick={() => handleFeedback("erreur")}
                        disabled={!!feedbackGiven}
                      >
                        <X className="h-3 w-3 mr-1" />Incorrecte
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs" onClick={handleCopyResume}>
                      <Copy className="h-3 w-3 mr-1" />Copier le résumé
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default Dashboard;
