import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { kpiByPeriod, computeROI, activityFeed, type ActivityItem, type Period } from "@/lib/mock-data";
import { Mail, MailOpen, FileText, CheckCircle2, Clock, DollarSign, Copy, TrendingUp, Eye, Paperclip, User } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const periodLabels: Record<Period, string> = {
  jour: "Jour",
  semaine: "Semaine",
  mois: "Mois",
};

const statutLabels: Record<ActivityItem["statut"], string> = {
  brouillon_genere: "Brouillon prêt",
  en_attente: "En attente",
  valide: "Validé",
};

const statutColors: Record<ActivityItem["statut"], string> = {
  brouillon_genere: "bg-accent/15 text-accent border-accent/30",
  en_attente: "bg-muted text-muted-foreground border-border",
  valide: "bg-primary/10 text-primary border-primary/20",
};

const Dashboard = () => {
  const [period, setPeriod] = useState<Period>("jour");
  const data = kpiByPeriod[period];
  const roi = computeROI(data);

  const kpis = [
    { label: "Mails reçus", value: data.mailsRecus, icon: Mail, trend: "+12%", color: "bg-blue-50 text-blue-600 border-blue-100" },
    { label: "Mails ouverts", value: data.mailsOuverts, icon: MailOpen, trend: "+8%", color: "bg-violet-50 text-violet-600 border-violet-100" },
    { label: "Brouillons créés", value: data.brouillonsCrees, icon: FileText, trend: "+15%", color: "bg-amber-50 text-amber-600 border-amber-100" },
    { label: "Brouillons validés", value: data.brouillonsValides, icon: CheckCircle2, trend: "+10%", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  ];

  const handleCopy = (brouillon: string) => {
    navigator.clipboard.writeText(brouillon);
    toast.success("Brouillon copié dans le presse-papier");
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Period Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground">Tableau de bord</h1>
          <div className="flex items-center bg-card border border-border rounded-lg p-0.5">
            {(["jour", "semaine", "mois"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 sm:px-4 py-1.5 text-xs font-sans font-medium rounded-md transition-all ${
                  period === p
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <kpi.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-sans text-accent flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {kpi.trend}
                    </span>
                  </div>
                  <p className="text-3xl font-serif font-bold text-foreground">{kpi.value}</p>
                  <p className="text-xs font-sans text-muted-foreground mt-1">{kpi.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ROI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs font-sans text-muted-foreground">
                  Temps gagné — {periodLabels[period].toLowerCase()}
                </p>
                <p className="text-2xl font-serif font-bold text-foreground">
                  {roi.heures}h {roi.minutes}min
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs font-sans text-muted-foreground">
                  Économisé — {periodLabels[period].toLowerCase()}
                </p>
                <p className="text-2xl font-serif font-bold text-foreground">
                  {roi.argentGagne.toLocaleString("fr-FR")}€
                </p>
                <p className="text-xs text-muted-foreground font-sans">
                  Base : {data.tauxHoraire}€/h
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed — Mailbox style */}
        <div>
          <h2 className="text-lg font-serif font-semibold text-foreground mb-3">Boîte de réception</h2>
          <Card className="border-border bg-card overflow-hidden divide-y divide-border">
            {activityFeed.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-muted/40 transition-colors group"
              >
                <div className="flex items-start gap-3 w-full sm:w-auto">
                  {/* Avatar */}
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-sans font-semibold text-sm text-foreground truncate">
                        {item.expediteur}
                      </span>
                      <Badge variant="outline" className={`text-[10px] font-sans px-1.5 py-0 ${statutColors[item.statut]}`}>
                        {statutLabels[item.statut]}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-sans ml-auto shrink-0">
                        {item.heureReception}
                      </span>
                    </div>
                    <p className="text-sm font-sans font-medium text-foreground/80 truncate">{item.objet}</p>
                    <p className="text-xs font-sans text-muted-foreground line-clamp-1 mt-0.5">{item.resume}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-[11px] font-sans text-muted-foreground">📁 {item.dossier}</span>
                      {item.brouillon && (
                        <span className="text-[11px] font-sans text-muted-foreground flex items-center gap-1">
                          <Paperclip className="h-3 w-3" /> Brouillon disponible
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Draft popover */}
                {item.brouillon && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-xs font-sans text-accent hover:text-accent hover:bg-accent/10 w-full sm:w-auto"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Voir le brouillon
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-96 p-0">
                      <div className="p-4 border-b border-border">
                        <p className="text-xs font-sans font-semibold text-foreground mb-1">Brouillon généré par Donna</p>
                        <p className="text-[11px] font-sans text-muted-foreground">Re : {item.objet}</p>
                      </div>
                      <div className="p-4 max-h-60 overflow-auto">
                        <p className="text-sm font-sans text-foreground whitespace-pre-line leading-relaxed">
                          {item.brouillon}
                        </p>
                      </div>
                      <div className="p-3 border-t border-border bg-muted/30 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs font-sans flex-1"
                          onClick={() => handleCopy(item.brouillon)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copier
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs font-sans flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Vérifier & valider
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </motion.div>
            ))}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;