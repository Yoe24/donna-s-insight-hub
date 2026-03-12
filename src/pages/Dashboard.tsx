import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Mail, MailOpen, CheckCircle2, Clock, Copy, Eye, User, X, UserCheck, UserX, TrendingUp, Lightbulb, ChevronDown, Archive, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useEmails, useEmailStats, useUpdateEmailStatus } from "@/hooks/useEmails";
import type { Email, PipelineStep } from "@/hooks/useEmails";
import { kpiByPeriod, computeROI, type Period } from "@/lib/mock-data";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { parseDonnaAnalysis } from "@/lib/parseDonnaAnalysis";

const pipelineSteps: { key: PipelineStep; label: string }[] = [
  { key: "en_attente", label: "En attente" },
  { key: "extraction_en_cours", label: "Extraction" },
  { key: "recherche_contexte", label: "Contexte" },
  { key: "redaction_brouillon", label: "Rédaction" },
  { key: "pret_a_reviser", label: "Prêt" },
];

const getStepIndex = (step: PipelineStep) => pipelineSteps.findIndex((s) => s.key === step);

const PipelineIndicator = ({ currentStep }: { currentStep: PipelineStep }) => {
  if (currentStep === "filtre_rejete") return null;
  const currentIndex = getStepIndex(currentStep);
  return (
    <div className="flex items-center gap-1">
      {pipelineSteps.map((step, i) => {
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step.key} className="flex items-center gap-0.5">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                isCurrent ? "bg-foreground ring-2 ring-foreground/20" : isCompleted ? "bg-foreground/60" : "bg-border"
              }`}
            />
            {i < pipelineSteps.length - 1 && (
              <div className={`h-px w-1 ${i < currentIndex ? "bg-foreground/40" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

function CategorieBadge({ email }: { email: Email }) {
  const categorie = email.metadata?.filtre?.categorie;
  if (categorie === "client") {
    return <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 text-xs px-2 py-0.5">Client</span>;
  }
  if (categorie === "prospect") {
    return <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs px-2 py-0.5">Prospect</span>;
  }
  return null;
}

function FeedbackButtons({ emailId, brouillon }: { emailId: string; brouillon: string }) {
  const { updateStatus } = useUpdateEmailStatus();
  const [isLoading, setIsLoading] = useState(false);

  const handleFeedback = async (action: "parfait" | "modifier" | "erreur") => {
    setIsLoading(true);
    try {
      await updateStatus(emailId, action);
      toast.success(`Feedback envoyé : ${action}`);
    } catch (error) {
      toast.error("Erreur lors de l'envoi du feedback");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(brouillon);
    toast.success("Brouillon copié");
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <Button size="sm" variant="outline" onClick={() => { handleCopy(); handleFeedback("parfait"); }} disabled={isLoading} className="text-xs">
        <UserCheck className="h-3 w-3 mr-1" />Parfait
      </Button>
      <Button size="sm" variant="outline" onClick={() => handleFeedback("modifier")} disabled={isLoading} className="text-xs">
        <Copy className="h-3 w-3 mr-1" />Modifier
      </Button>
      <Button size="sm" variant="outline" onClick={() => handleFeedback("erreur")} disabled={isLoading} className="text-xs text-destructive">
        <UserX className="h-3 w-3 mr-1" />Erreur
      </Button>
    </div>
  );
}

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

function DonnaResume({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="mt-2 rounded-lg bg-muted/60 border border-border p-3">
      <p className="text-xs text-foreground/80 leading-relaxed">{text}</p>
    </div>
  );
}

function DonnaRecommendation({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="mt-2 rounded-lg bg-primary/5 border border-primary/10 p-3 flex gap-2">
      <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <p className="text-xs italic text-foreground/80 leading-relaxed">{text}</p>
    </div>
  );
}

function DonnaAttention({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="mt-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30 p-3 flex gap-2">
      <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
      <p className="text-xs text-foreground/80 leading-relaxed">{text}</p>
    </div>
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

const Dashboard = () => {
  const [viewingBrouillon, setViewingBrouillon] = useState<Email | null>(null);
  const [expandedAttention, setExpandedAttention] = useState<Set<string>>(new Set());
  const [period, setPeriod] = useState<Period>("jour");
  const { emails, loading } = useEmails();
  const { stats } = useEmailStats();

  const roi = computeROI(kpiByPeriod[period]);
  const periodLabels: Record<Period, string> = { jour: "Jour", semaine: "Semaine", mois: "Mois" };

  // Active emails = not archived, not ignored
  const activeEmails = emails.filter(e => e.statut !== "archive" && e.statut !== "ignore");
  const isInboxEmpty = activeEmails.length === 0;

  const toggleAttention = (id: string) => {
    setExpandedAttention(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-sans text-muted-foreground">Rapport de Donna</p>
          <p className="text-xs font-sans text-muted-foreground">
            {activeEmails.length} email{activeEmails.length > 1 ? "s" : ""} actif{activeEmails.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* ROI Widget */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-serif font-semibold text-foreground">Rentabilité Donna</h2>
              <div className="flex gap-1 bg-muted rounded-full p-0.5">
                {(["jour", "semaine", "mois"] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`text-[11px] px-3 py-1 rounded-full font-sans transition-colors ${
                      period === p
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {periodLabels[p]}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-light text-foreground">{roi.heures}h {roi.minutes.toString().padStart(2, '0')}min</p>
                  <p className="text-[10px] text-muted-foreground">Temps gagné</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-light text-foreground">{roi.argentGagne.toLocaleString("fr-FR")} €</p>
                  <p className="text-[10px] text-muted-foreground">Économisé</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MailOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-light text-foreground">{stats.traites}</p>
                  <p className="text-[10px] text-muted-foreground">Emails traités aujourd'hui</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-light text-foreground">{stats.en_attente}</p>
                  <p className="text-[10px] text-muted-foreground">Actions requises</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email list */}
        <div className="pt-4 border-t border-border">
          <h2 className="text-sm font-serif font-semibold mb-3">Boîte de réception</h2>
          
          {isInboxEmpty ? (
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardContent className="p-8 text-center space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    Tout est calme pour le moment.
                  </p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Je surveille votre boîte mail et vous préviendrai dès qu'un email nécessite votre attention.
                  </p>
                </CardContent>
              </Card>
              {emails.length > 0 && <ImportArchives emails={emails} />}
            </div>
          ) : (
            <Card className="border-border bg-card overflow-hidden divide-y divide-border">
              {activeEmails.map((item, i) => {
                const isRejected = item.pipeline_step === "filtre_rejete";
                const analysis = parseDonnaAnalysis(item.brouillon);
                const hasAnalysis = analysis.resume || analysis.recommandation;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`px-4 py-3 hover:bg-muted/40 transition-colors ${isRejected ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-sans font-semibold text-xs truncate">{item.expediteur}</span>
                          <span className="text-[10px] text-muted-foreground">{formatEmailTime(item.created_at)}</span>
                          <CategorieBadge email={item} />
                          {isRejected && (
                            <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-xs px-2 py-0.5">Ignoré</span>
                          )}
                        </div>
                        <p className="text-xs font-medium truncate">{item.objet}</p>
                        
                        {/* Parsed brouillon sections */}
                        {hasAnalysis ? (
                          <>
                            <DonnaResume text={analysis.resume} />
                            <DonnaRecommendation text={analysis.recommandation} />
                            {analysis.attention && (
                              <>
                                <button
                                  onClick={() => toggleAttention(item.id)}
                                  className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                                >
                                  <ChevronDown className={`h-3 w-3 transition-transform ${expandedAttention.has(item.id) ? "rotate-180" : ""}`} />
                                  Voir le détail
                                </button>
                                {expandedAttention.has(item.id) && (
                                  <DonnaAttention text={analysis.attention} />
                                )}
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {item.resume && item.pipeline_step === "pret_a_reviser" && (
                              <DonnaRecommendation text={item.resume} />
                            )}
                            {item.resume && item.pipeline_step !== "pret_a_reviser" && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{item.resume}</p>
                            )}
                            {!item.resume && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">En cours d'analyse...</p>
                            )}
                          </>
                        )}
                        
                        {!isRejected && (
                          <div className="mt-2 flex items-center gap-2">
                            <PipelineIndicator currentStep={item.pipeline_step} />
                            <span className="text-[9px] text-muted-foreground">
                              {pipelineSteps[getStepIndex(item.pipeline_step)]?.label}
                            </span>
                          </div>
                        )}

                        {item.brouillon && item.pipeline_step === "pret_a_reviser" && (
                          <FeedbackButtons emailId={item.id} brouillon={item.brouillon} />
                        )}
                      </div>

                      {item.brouillon && (
                        <Button size="sm" variant="ghost" onClick={() => setViewingBrouillon(item)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </Card>
          )}
        </div>
      </div>

      {/* Brouillon modal */}
      <Dialog open={!!viewingBrouillon} onOpenChange={() => setViewingBrouillon(null)}>
        <DialogContent className="max-w-lg">
          <DialogTitle className="text-sm font-serif">Analyse Donna</DialogTitle>
          {viewingBrouillon && (() => {
            const analysis = parseDonnaAnalysis(viewingBrouillon.brouillon);
            return (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">Sujet : {viewingBrouillon.objet}</p>
                {analysis.resume && (
                  <div className="bg-muted/60 border border-border rounded-lg p-4">
                    <p className="text-xs font-semibold text-foreground mb-1">📋 Résumé de la situation</p>
                    <p className="text-sm text-foreground/80 whitespace-pre-line">{analysis.resume}</p>
                  </div>
                )}
                {analysis.recommandation && (
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                    <p className="text-xs font-semibold text-primary mb-1">🎯 Recommandation Donna</p>
                    <p className="text-sm text-foreground/80 whitespace-pre-line">{analysis.recommandation}</p>
                  </div>
                )}
                {analysis.attention && (
                  <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30 rounded-lg p-4">
                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">💡 Points d'attention</p>
                    <p className="text-sm text-foreground/80 whitespace-pre-line">{analysis.attention}</p>
                  </div>
                )}
                {!analysis.resume && !analysis.recommandation && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{viewingBrouillon.brouillon}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(viewingBrouillon.brouillon || "");
                      toast.success("Copié !");
                    }}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />Copier
                  </Button>
                  <Button variant="outline" onClick={() => setViewingBrouillon(null)}>
                    <X className="h-4 w-4 mr-2" />Fermer
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Dashboard;
