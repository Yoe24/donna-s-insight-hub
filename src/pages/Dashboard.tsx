import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { kpiByPeriod, computeROI, activityFeed, type ActivityItem, type PipelineStep, type Period } from "@/lib/mock-data";
import { Mail, MailOpen, FileText, CheckCircle2, Clock, DollarSign, Copy, Eye, User, X, TrendingUp, Search, FolderOpen, Scale, Activity, LayoutDashboard, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

const periodLabels: Record<Period, string> = {
  jour: "Jour",
  semaine: "Semaine",
  mois: "Mois",
};

const improvementData = [
  { name: "S1", crees: 10, valides: 3 },
  { name: "S2", crees: 14, valides: 6 },
  { name: "S3", crees: 18, valides: 11 },
  { name: "S4", crees: 22, valides: 16 },
  { name: "S5", crees: 25, valides: 21 },
  { name: "S6", crees: 28, valides: 25 },
];

const statutLabels: Record<ActivityItem["statut"], string> = {
  brouillon_genere: "Brouillon prêt",
  en_attente: "En attente",
  valide: "Validé",
};

const pipelineSteps: { key: PipelineStep; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "reception", label: "Réception", shortLabel: "Reçu", icon: Mail },
  { key: "extraction", label: "Extraction", shortLabel: "Extr.", icon: Search },
  { key: "classification", label: "Classification", shortLabel: "Class.", icon: FolderOpen },
  { key: "lecture_pj", label: "Lecture PJ", shortLabel: "PJ", icon: Paperclip },
  { key: "brouillon", label: "Brouillon", shortLabel: "Brouil.", icon: FileText },
  { key: "controle_juridique", label: "Contrôle juridique", shortLabel: "Ctrl.", icon: Scale },
  { key: "log_activite", label: "Log activité", shortLabel: "Log", icon: Activity },
  { key: "dashboard", label: "Dashboard", shortLabel: "Done", icon: LayoutDashboard },
];

const getStepIndex = (step: PipelineStep) => pipelineSteps.findIndex((s) => s.key === step);

const PipelineIndicator = ({ currentStep }: { currentStep: PipelineStep }) => {
  const currentIndex = getStepIndex(currentStep);
  return (
    <div className="flex items-center gap-0.5">
      {pipelineSteps.map((step, i) => {
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step.key} className="flex items-center gap-0.5 group relative">
            <div
              className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all ${
                isCurrent
                  ? "bg-foreground ring-2 ring-foreground/20"
                  : isCompleted
                  ? "bg-foreground/60"
                  : "bg-border"
              }`}
            />
            {/* Tooltip on hover */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block z-20">
              <span className="text-[8px] font-sans bg-foreground text-background px-1.5 py-0.5 rounded whitespace-nowrap">
                {step.label}
              </span>
            </div>
            {i < pipelineSteps.length - 1 && (
              <div className={`h-px w-1 sm:w-1.5 ${i < currentIndex ? "bg-foreground/40" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const Dashboard = () => {
  const [period, setPeriod] = useState<Period>("jour");
  const [viewingBrouillon, setViewingBrouillon] = useState<ActivityItem | null>(null);
  const data = kpiByPeriod[period];
  const roi = computeROI(data);

  const kpis = [
    { label: "Reçus", value: data.mailsRecus, icon: Mail },
    { label: "Ouverts", value: data.mailsOuverts, icon: MailOpen },
    { label: "Brouillons", value: data.brouillonsCrees, icon: FileText },
    { label: "Validés", value: data.brouillonsValides, icon: CheckCircle2 },
  ];

  const handleCopy = (brouillon: string) => {
    navigator.clipboard.writeText(brouillon);
    toast.success("Brouillon copié dans le presse-papier");
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-3 sm:space-y-4">
        {/* Period Toggle */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-sans text-muted-foreground hidden sm:block">Tableau de bord</p>
          <div className="flex items-center bg-card border border-border rounded-lg p-0.5 ml-auto">
            {(["jour", "semaine", "mois"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`relative px-3 py-1 text-[11px] font-sans font-medium rounded-md transition-all ${
                  period === p
                    ? "text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {period === p && (
                  <motion.div
                    layoutId="period-pill"
                    className="absolute inset-0 bg-foreground rounded-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{periodLabels[p]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ROI hero cards — subtle accent colors */}
        <AnimatePresence mode="wait">
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-2 sm:gap-3"
          >
            <Card className="border-border" style={{ background: `hsl(var(--roi-time))` }}>
              <CardContent className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `hsl(var(--roi-time-accent) / 0.12)` }}>
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: `hsl(var(--roi-time-accent))` }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-sans leading-tight" style={{ color: `hsl(var(--roi-time-accent))` }}>Temps gagné</p>
                  <p className="text-base sm:text-xl font-sans font-light tracking-tight text-foreground tabular-nums">
                    {roi.heures}h {roi.minutes}min
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border" style={{ background: `hsl(var(--roi-money))` }}>
              <CardContent className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `hsl(var(--roi-money-accent) / 0.12)` }}>
                  <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: `hsl(var(--roi-money-accent))` }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-sans leading-tight" style={{ color: `hsl(var(--roi-money-accent))` }}>Économisé</p>
                  <p className="text-base sm:text-xl font-sans font-light tracking-tight text-foreground tabular-nums">
                    {roi.argentGagne.toLocaleString("fr-FR")}€
                  </p>
                  <p className="text-[8px] sm:text-[9px] font-sans" style={{ color: `hsl(var(--roi-money-accent) / 0.7)` }}>{data.tauxHoraire}€/h</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* KPIs compacts + mini courbe */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`kpi-${period}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-stretch gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mb-1"
          >
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border border-border bg-card min-w-fit"
              >
                <kpi.icon className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-xs sm:text-sm font-sans font-light tabular-nums text-foreground">{kpi.value}</span>
                <span className="text-[9px] sm:text-[10px] font-sans text-muted-foreground whitespace-nowrap">{kpi.label}</span>
              </div>
            ))}
            {/* Mini courbe inline */}
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-lg border border-border bg-card min-w-[100px] sm:min-w-[120px]">
              <TrendingUp className="h-3 w-3 text-muted-foreground shrink-0" />
              <div className="h-7 sm:h-8 w-16 sm:w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={improvementData}>
                    <Line type="monotone" dataKey="crees" stroke="hsl(0, 0%, 75%)" strokeWidth={1} dot={false} />
                    <Line type="monotone" dataKey="valides" stroke="hsl(0, 0%, 8%)" strokeWidth={1.5} dot={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 9, borderRadius: 4, border: '1px solid hsl(0,0%,90%)', padding: '2px 6px' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Activity Feed with Pipeline */}
        <div className="pt-3 sm:pt-4 border-t border-border">
          <h2 className="text-sm font-serif font-semibold text-foreground mb-2">Boîte de réception</h2>
          <Card className="border-border bg-card overflow-hidden divide-y divide-border">
            {activityFeed.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.03 }}
                className="px-2.5 sm:px-4 py-2.5 sm:py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="font-sans font-semibold text-[11px] sm:text-xs text-foreground truncate">
                        {item.expediteur}
                      </span>
                      <Badge variant="outline" className="text-[8px] sm:text-[9px] font-sans px-1 py-0 border-border text-muted-foreground h-3.5 sm:h-4">
                        {statutLabels[item.statut]}
                      </Badge>
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground font-sans ml-auto shrink-0">
                        {item.heureReception}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-sans font-medium text-foreground/80 truncate">{item.objet}</p>
                    <p className="text-[10px] sm:text-[11px] font-sans text-muted-foreground line-clamp-1 mt-0.5 hidden sm:block">{item.resume}</p>
                    {/* Pipeline indicator */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <PipelineIndicator currentStep={item.pipelineStep} />
                      <span className="text-[8px] sm:text-[9px] font-sans text-muted-foreground">
                        {pipelineSteps[getStepIndex(item.pipelineStep)]?.label}
                      </span>
                    </div>
                  </div>

                  {item.brouillon && (
                    <div className="flex items-center gap-1 shrink-0 self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] sm:text-[11px] font-sans h-6 sm:h-7 px-1.5 sm:px-2"
                        onClick={() => handleCopy(item.brouillon)}
                      >
                        <Copy className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Copier</span>
                      </Button>
                      <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => setViewingBrouillon(item)}
                        >
                          <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </Card>
        </div>
      </div>

      {/* Brouillon Dialog — fixe au centre */}
      <Dialog open={!!viewingBrouillon} onOpenChange={(open) => !open && setViewingBrouillon(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md p-0 gap-0">
          <DialogTitle className="sr-only">Brouillon Donna</DialogTitle>
          {viewingBrouillon && (
            <>
              <div className="p-4 border-b border-border">
                <p className="text-xs font-sans font-semibold text-foreground">Brouillon Donna</p>
                <p className="text-[10px] font-sans text-muted-foreground mt-0.5">Re : {viewingBrouillon.objet}</p>
              </div>
              <div className="p-4 max-h-60 overflow-auto">
                <p className="text-sm font-sans text-foreground whitespace-pre-line leading-relaxed">
                  {viewingBrouillon.brouillon}
                </p>
              </div>
              <div className="p-3 border-t border-border bg-muted/30 flex items-center gap-2">
                <Button size="sm" variant="outline" className="text-[11px] font-sans flex-1 h-7" onClick={() => handleCopy(viewingBrouillon.brouillon)}>
                  <Copy className="h-3 w-3 mr-1" /> Copier
                </Button>
                <Button size="sm" className="text-[11px] font-sans flex-1 h-7 bg-foreground text-background hover:bg-foreground/90">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Valider
                </Button>
                <Button size="sm" variant="ghost" className="text-[11px] font-sans h-7 px-3 text-muted-foreground" onClick={() => setViewingBrouillon(null)}>
                  Fermer
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Dashboard;
