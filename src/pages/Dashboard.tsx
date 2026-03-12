import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Mail, MailOpen, CheckCircle2, Clock, Copy, Eye, User, X, UserCheck, UserX, TrendingUp, Lightbulb, ChevronDown, Archive } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useEmails, useEmailStats, useUpdateEmailStatus } from "@/hooks/useEmails";
import type { Email, PipelineStep } from "@/hooks/useEmails";
import { kpiByPeriod, computeROI, type Period } from "@/lib/mock-data";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statutLabels: Record<string, string> = {
  en_attente: "En attente",
  traite: "Traité",
  valide: "Validé",
  erreur: "Erreur",
  archive: "Archivé",
  ignore: "Ignoré",
};

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

function BrouillonContent({ brouillon }: { brouillon: string }) {
  if (brouillon.startsWith("📎")) {
    const lines = brouillon.split("\n");
    const sourcesEnd = lines.findIndex((l, i) => i > 0 && l.trim() === "");
    const sourcesLines = sourcesEnd > 0 ? lines.slice(0, sourcesEnd) : [lines[0]];
    const bodyLines = sourcesEnd > 0 ? lines.slice(sourcesEnd + 1) : lines.slice(1);

    return (
      <div className="space-y-3">
        <div className="bg-accent/10 border border-accent/20 rounded-md p-3">
          <p className="text-xs font-semibold text-accent mb-1">Sources</p>
          {sourcesLines.map((line, i) => (
            <p key={i} className="text-xs text-muted-foreground">{line}</p>
          ))}
        </div>
        <p className="text-sm whitespace-pre-wrap">{bodyLines.join("\n")}</p>
      </div>
    );
  }

  return <p className="text-sm whitespace-pre-wrap">{brouillon}</p>;
}

function formatEmailTime(created_at: string) {
  try {
    const date = new Date(created_at);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return format(date, "HH'h'mm", { locale: fr });
    }
    return format(date, "'Le' d MMM 'à' HH'h'mm", { locale: fr });
  } catch {
    return "";
  }
}

function DonnaRecommendation({ resume }: { resume: string }) {
  return (
    <div className="mt-2 rounded-lg bg-primary/5 border border-primary/10 p-3 flex gap-2">
      <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <p className="text-xs italic text-foreground/80 leading-relaxed">{resume}</p>
    </div>
  );
}

function ImportArchives({ emails }: { emails: Email[] }) {
  // Compute sender stats from imported emails
  const importedEmails = emails.filter(e => e.pipeline_step === "filtre_rejete" || e.statut === "ignore");
  const allEmails = emails;
  
  const senderCounts: Record<string, number> = {};
  allEmails.forEach(e => {
    senderCounts[e.expediteur] = (senderCounts[e.expediteur] || 0) + 1;
  });

  const sortedSenders = Object.entries(senderCounts).sort((a, b) => b[1] - a[1]);
  const uniqueDossiers = new Set(allEmails.map(e => e.metadata?.filtre?.categorie)).size;

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
              <span className="font-medium">{allEmails.length} emails importés</span>, répartis sur{" "}
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
  const [period, setPeriod] = useState<Period>("jour");
  const { emails, loading } = useEmails();
  const { stats } = useEmailStats();

  const roi = computeROI(kpiByPeriod[period]);
  const periodLabels: Record<Period, string> = { jour: "Jour", semaine: "Semaine", mois: "Mois" };

  // Active emails = not just imported
  const activeEmails = emails.filter(e => e.pipeline_step !== "filtre_rejete" && e.statut !== "ignore");
  const isInboxEmpty = activeEmails.length === 0;

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
              {/* Donna's calm message */}
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

              {/* Import archives */}
              {emails.length > 0 && <ImportArchives emails={emails} />}
            </div>
          ) : (
            <Card className="border-border bg-card overflow-hidden divide-y divide-border">
              {activeEmails.map((item, i) => {
                const isRejected = item.pipeline_step === "filtre_rejete";

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
                        
                        {/* Donna recommendation instead of raw resume */}
                        {item.resume && item.pipeline_step === "pret_a_reviser" && (
                          <DonnaRecommendation resume={item.resume} />
                        )}
                        
                        {/* For non-ready emails, show basic resume */}
                        {item.resume && item.pipeline_step !== "pret_a_reviser" && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {item.resume}
                          </p>
                        )}
                        
                        {!item.resume && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            En cours d'analyse...
                          </p>
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
          <DialogTitle className="text-sm font-serif">Brouillon généré</DialogTitle>
          {viewingBrouillon && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Sujet : {viewingBrouillon.objet}</p>
                <BrouillonContent brouillon={viewingBrouillon.brouillon || ""} />
              </div>
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
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Dashboard;
