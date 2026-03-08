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
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const periodLabels: Record<Period, string> = {
  jour: "Jour",
  semaine: "Semaine",
  mois: "Mois",
};

const miniChartData: Record<Period, { name: string; value: number }[]> = {
  jour: [
    { name: "8h", value: 3 }, { name: "9h", value: 8 }, { name: "10h", value: 12 },
    { name: "11h", value: 7 }, { name: "12h", value: 4 }, { name: "13h", value: 2 },
    { name: "14h", value: 6 }, { name: "15h", value: 5 },
  ],
  semaine: [
    { name: "Lun", value: 32 }, { name: "Mar", value: 45 }, { name: "Mer", value: 38 },
    { name: "Jeu", value: 52 }, { name: "Ven", value: 47 },
  ],
  mois: [
    { name: "S1", value: 180 }, { name: "S2", value: 214 }, { name: "S3", value: 195 },
    { name: "S4", value: 254 },
  ],
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
        {/* Period Toggle — simple, top right */}
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
              <Card className={`border ${kpi.color.split(' ')[2]} ${kpi.color.split(' ')[0]}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${kpi.color.split(' ')[0]} ${kpi.color.split(' ')[1]}`}>
                      <kpi.icon className="h-3.5 w-3.5" />
                    </div>
                    <span className={`text-[11px] font-sans ${kpi.color.split(' ')[1]} flex items-center gap-0.5`}>
                      <TrendingUp className="h-2.5 w-2.5" />
                      {kpi.trend}
                    </span>
                  </div>
                  <p className="text-2xl font-serif font-bold text-foreground">{kpi.value}</p>
                  <p className="text-[11px] font-sans text-muted-foreground mt-0.5">{kpi.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mini chart */}
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-sans font-medium text-muted-foreground">
                Mails traités — {periodLabels[period].toLowerCase()}
              </p>
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
            </div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={miniChartData[period]}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(152, 45%, 45%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(152, 45%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(0, 0%, 45%)' }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(0,0%,90%)' }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(152, 45%, 45%)" strokeWidth={2} fill="url(#chartGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="border-blue-100 bg-gradient-to-br from-blue-50/80 to-background">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-sans text-muted-foreground">
                  Temps gagné — {periodLabels[period].toLowerCase()}
                </p>
                <p className="text-xl font-serif font-bold text-foreground">
                  {roi.heures}h {roi.minutes}min
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-background">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] font-sans text-muted-foreground">
                  Économisé — {periodLabels[period].toLowerCase()}
                </p>
                <p className="text-xl font-serif font-bold text-foreground">
                  {roi.argentGagne.toLocaleString("fr-FR")}€
                </p>
                <p className="text-[10px] text-muted-foreground font-sans">
                  Base : {data.tauxHoraire}€/h
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed — Mailbox style */}
        <div className="mt-8 pt-6 border-t border-border">
          <h2 className="text-base font-serif font-semibold text-foreground mb-3">📬 Votre boîte de réception</h2>
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