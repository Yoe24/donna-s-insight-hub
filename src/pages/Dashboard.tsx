import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Mail, MailOpen, CheckCircle2, Clock, Copy, Eye, User, X, UserCheck, UserX, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useEmails, useEmailStats, useUpdateEmailStatus } from "@/hooks/useEmails";
import type { Email, PipelineStep } from "@/hooks/useEmails";
import { kpiByPeriod, computeROI, type Period } from "@/lib/mock-data";

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

const Dashboard = () => {
  const [viewingBrouillon, setViewingBrouillon] = useState<Email | null>(null);
  const [period, setPeriod] = useState<Period>("jour");
  const { emails, loading } = useEmails();
  const { stats } = useEmailStats();

  const roi = computeROI(kpiByPeriod[period]);
  const periodLabels: Record<Period, string> = { jour: "Jour", semaine: "Semaine", mois: "Mois" };

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
          <p className="text-xs font-sans text-muted-foreground">Tableau de bord</p>
          <p className="text-xs font-sans text-muted-foreground">
            {emails.length} email{emails.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Reçus", value: stats.recus, icon: Mail },
            { label: "Traités", value: stats.traites, icon: MailOpen },
            { label: "Validés", value: stats.valides, icon: CheckCircle2 },
            { label: "En attente", value: stats.en_attente, icon: Clock },
          ].map((stat) => (
            <Card key={stat.label} className="border-border bg-card">
              <CardContent className="p-3 flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-lg font-light">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Email list */}
        <div className="pt-4 border-t border-border">
          <h2 className="text-sm font-serif font-semibold mb-3">Boîte de réception</h2>
          
          {emails.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground text-sm">Aucun email pour le moment</p>
              <p className="text-muted-foreground text-xs mt-1">
                Les emails apparaîtront ici automatiquement quand ils arriveront
              </p>
            </Card>
          ) : (
            <Card className="border-border bg-card overflow-hidden divide-y divide-border">
              {emails.map((item, i) => {
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
                          <Badge variant="outline" className="text-[9px]">
                            {statutLabels[item.statut] || item.statut}
                          </Badge>
                          <CategorieBadge email={item} />
                          {isRejected && (
                            <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-xs px-2 py-0.5">Ignoré</span>
                          )}
                        </div>
                        <p className="text-xs font-medium truncate">{item.objet}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {item.resume || "En cours d'analyse..."}
                        </p>
                        
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
