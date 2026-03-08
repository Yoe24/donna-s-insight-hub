import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { kpiByPeriod, computeROI, activityFeed, type ActivityItem, type Period } from "@/lib/mock-data";
import { Mail, MailOpen, FileText, CheckCircle2, Clock, DollarSign, Copy, Eye, User, X, TrendingUp } from "lucide-react";
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

const Dashboard = () => {
  const [period, setPeriod] = useState<Period>("jour");
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
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Period Toggle — compact */}
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

        {/* ROI en évidence — hero cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            <Card className="border-border bg-card">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-sans text-muted-foreground leading-tight">Temps gagné</p>
                  <p className="text-lg sm:text-xl font-sans font-light tracking-tight text-foreground tabular-nums">
                    {roi.heures}h {roi.minutes}min
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <DollarSign className="h-4 w-4 text-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-sans text-muted-foreground leading-tight">Économisé</p>
                  <p className="text-lg sm:text-xl font-sans font-light tracking-tight text-foreground tabular-nums">
                    {roi.argentGagne.toLocaleString("fr-FR")}€
                  </p>
                  <p className="text-[9px] text-muted-foreground font-sans">{data.tauxHoraire}€/h</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* KPIs compacts + mini courbe — une seule ligne */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`kpi-${period}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-stretch gap-2 overflow-x-auto"
          >
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card min-w-fit"
              >
                <kpi.icon className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-sm font-sans font-light tabular-nums text-foreground">{kpi.value}</span>
                <span className="text-[10px] font-sans text-muted-foreground whitespace-nowrap">{kpi.label}</span>
              </div>
            ))}
            {/* Mini courbe inline */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-border bg-card min-w-[120px]">
              <TrendingUp className="h-3 w-3 text-muted-foreground shrink-0" />
              <div className="h-8 w-20">
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

        {/* Activity Feed */}
        <div className="pt-4 border-t border-border">
          <h2 className="text-sm font-serif font-semibold text-foreground mb-2">Boîte de réception</h2>
          <Card className="border-border bg-card overflow-hidden divide-y divide-border">
            {activityFeed.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.03 }}
                className="flex items-start gap-3 px-3 sm:px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="font-sans font-semibold text-xs text-foreground truncate">
                      {item.expediteur}
                    </span>
                    <Badge variant="outline" className="text-[9px] font-sans px-1 py-0 border-border text-muted-foreground h-4">
                      {statutLabels[item.statut]}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-sans ml-auto shrink-0">
                      {item.heureReception}
                    </span>
                  </div>
                  <p className="text-xs font-sans font-medium text-foreground/80 truncate">{item.objet}</p>
                  <p className="text-[11px] font-sans text-muted-foreground line-clamp-1 mt-0.5 hidden sm:block">{item.resume}</p>
                </div>

                {item.brouillon && (
                  <div className="flex items-center gap-1 shrink-0 self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[11px] font-sans h-7 px-2"
                      onClick={() => handleCopy(item.brouillon)}
                    >
                      <Copy className="h-3 w-3 sm:mr-1" />
                      <span className="hidden sm:inline">Copier</span>
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-96 p-0">
                        <div className="p-3 border-b border-border flex items-center justify-between">
                          <div>
                            <p className="text-xs font-sans font-semibold text-foreground">Brouillon Donna</p>
                            <p className="text-[10px] font-sans text-muted-foreground">Re : {item.objet}</p>
                          </div>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                              <X className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                        </div>
                        <div className="p-3 max-h-48 overflow-auto">
                          <p className="text-sm font-sans text-foreground whitespace-pre-line leading-relaxed">
                            {item.brouillon}
                          </p>
                        </div>
                        <div className="p-2 border-t border-border bg-muted/30 flex items-center gap-2">
                          <Button size="sm" variant="outline" className="text-[11px] font-sans flex-1 h-7" onClick={() => handleCopy(item.brouillon)}>
                            <Copy className="h-3 w-3 mr-1" /> Copier
                          </Button>
                          <Button size="sm" className="text-[11px] font-sans flex-1 h-7 bg-foreground text-background hover:bg-foreground/90">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Valider
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
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
