import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { kpiByPeriod, computeROI, activityFeed, type ActivityItem, type Period } from "@/lib/mock-data";
import { Mail, MailOpen, FileText, CheckCircle2, Clock, DollarSign, Copy, Eye, User, X, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const periodLabels: Record<Period, string> = {
  jour: "Jour",
  semaine: "Semaine",
  mois: "Mois",
};

// Courbe d'amélioration du modèle : brouillons créés vs validés directement
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
    { label: "Mails reçus", value: data.mailsRecus, icon: Mail },
    { label: "Mails ouverts", value: data.mailsOuverts, icon: MailOpen },
    { label: "Brouillons créés", value: data.brouillonsCrees, icon: FileText },
    { label: "Brouillons validés", value: data.brouillonsValides, icon: CheckCircle2 },
  ];

  const handleCopy = (brouillon: string) => {
    navigator.clipboard.writeText(brouillon);
    toast.success("Brouillon copié dans le presse-papier");
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Period Toggle */}
        <div className="flex items-center justify-end">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                      <kpi.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-2xl font-sans font-light tracking-tight text-foreground tabular-nums">{kpi.value}</p>
                  <p className="text-[11px] font-sans text-muted-foreground mt-0.5">{kpi.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ROI + Mini improvement chart side by side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="border-border bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-[11px] font-sans text-muted-foreground">
                  Temps gagné — {periodLabels[period].toLowerCase()}
                </p>
                <p className="text-xl font-sans font-light tracking-tight text-foreground tabular-nums">
                  {roi.heures}h {roi.minutes}min
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-[11px] font-sans text-muted-foreground">
                  Économisé — {periodLabels[period].toLowerCase()}
                </p>
                <p className="text-xl font-sans font-light tracking-tight text-foreground tabular-nums">
                  {roi.argentGagne.toLocaleString("fr-FR")}€
                </p>
                <p className="text-[10px] text-muted-foreground font-sans">
                  Base : {data.tauxHoraire}€/h
                </p>
              </div>
            </CardContent>
          </Card>
          {/* Mini improvement curve */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <p className="text-[11px] font-sans text-muted-foreground">Précision Donna</p>
              </div>
              <div className="h-14">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={improvementData}>
                    <Line type="monotone" dataKey="crees" stroke="hsl(0, 0%, 70%)" strokeWidth={1} dot={false} />
                    <Line type="monotone" dataKey="valides" stroke="hsl(0, 0%, 8%)" strokeWidth={1.5} dot={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 10, borderRadius: 6, border: '1px solid hsl(0,0%,90%)', padding: '4px 8px' }}
                      labelStyle={{ fontWeight: 600, fontSize: 10 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-[9px] font-sans text-muted-foreground">
                  <span className="w-3 h-px bg-muted-foreground inline-block" /> Créés
                </span>
                <span className="flex items-center gap-1 text-[9px] font-sans text-foreground">
                  <span className="w-3 h-px bg-foreground inline-block" /> Validés
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div className="mt-8 pt-6 border-t border-border">
          <h2 className="text-base font-serif font-semibold text-foreground mb-3">Votre boîte de réception</h2>
          <Card className="border-border bg-card overflow-hidden divide-y divide-border">
            {activityFeed.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-muted/40 transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-sans font-semibold text-sm text-foreground truncate">
                      {item.expediteur}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-sans px-1.5 py-0 border-border text-muted-foreground">
                      {statutLabels[item.statut]}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-sans ml-auto shrink-0">
                      {item.heureReception}
                    </span>
                  </div>
                  <p className="text-sm font-sans font-medium text-foreground/80 truncate">{item.objet}</p>
                  <p className="text-xs font-sans text-muted-foreground line-clamp-1 mt-0.5">{item.resume}</p>
                  <span className="text-[11px] font-sans text-muted-foreground mt-1 inline-block">{item.dossier}</span>
                </div>

                {/* Action buttons — always visible */}
                {item.brouillon && (
                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-sans h-8 px-3"
                      onClick={() => handleCopy(item.brouillon)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copier
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-sans h-8 px-2 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-96 p-0">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                          <div>
                            <p className="text-xs font-sans font-semibold text-foreground mb-1">Brouillon généré par Donna</p>
                            <p className="text-[11px] font-sans text-muted-foreground">Re : {item.objet}</p>
                          </div>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </PopoverTrigger>
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
                            className="text-xs font-sans flex-1 bg-foreground text-background hover:bg-foreground/90"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Valider
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
