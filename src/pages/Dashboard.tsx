import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { kpiData, computeROI, activityFeed, type ActivityItem } from "@/lib/mock-data";
import { Mail, MailOpen, FileText, CheckCircle2, Clock, DollarSign, Copy, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const kpis = [
  { label: "Mails reçus", value: kpiData.mailsRecus, icon: Mail, trend: "+12%" },
  { label: "Mails ouverts", value: kpiData.mailsOuverts, icon: MailOpen, trend: "+8%" },
  { label: "Brouillons créés", value: kpiData.brouillonsCrees, icon: FileText, trend: "+15%" },
  { label: "Brouillons validés", value: kpiData.brouillonsValides, icon: CheckCircle2, trend: "+10%" },
];

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
  const roi = computeROI(kpiData);

  const handleCopy = (brouillon: string) => {
    navigator.clipboard.writeText(brouillon);
    toast.success("Brouillon copié dans le presse-papier");
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
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
                <p className="text-xs font-sans text-muted-foreground">Temps gagné aujourd'hui</p>
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
                <p className="text-xs font-sans text-muted-foreground">Économisé aujourd'hui</p>
                <p className="text-2xl font-serif font-bold text-foreground">
                  {roi.argentGagne}€
                </p>
                <p className="text-xs text-muted-foreground font-sans">
                  Base : {kpiData.tauxHoraire}€/h
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div>
          <h2 className="text-xl font-serif font-semibold text-foreground mb-4">Flux d'activité</h2>
          <div className="space-y-3">
            {activityFeed.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                <Card className="border-border bg-card hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-sans font-medium text-sm text-foreground">{item.expediteur}</span>
                          <span className="text-xs text-muted-foreground font-sans">{item.heureReception}</span>
                          <Badge variant="outline" className={`text-xs font-sans ${statutColors[item.statut]}`}>
                            {statutLabels[item.statut]}
                          </Badge>
                        </div>
                        <p className="text-sm font-sans font-medium text-foreground/80 mb-1">{item.objet}</p>
                        <p className="text-sm font-sans text-muted-foreground leading-relaxed">{item.resume}</p>
                        <p className="text-xs font-sans text-muted-foreground mt-2">
                          📁 {item.dossier}
                        </p>
                      </div>
                      {item.brouillon && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(item.brouillon)}
                          className="shrink-0 font-sans text-xs border-accent/30 text-accent hover:bg-accent/10 hover:text-accent"
                        >
                          <Copy className="h-3.5 w-3.5 mr-1.5" />
                          Copier le brouillon
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
