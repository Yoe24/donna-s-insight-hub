import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { dossiers } from "@/lib/mock-data";
import { ArrowLeft, Sparkles, AlertTriangle, Mail, Send, StickyNote, FileText, FileWarning, Search, Calendar, Eye, FileIcon } from "lucide-react";
import { motion } from "framer-motion";

const timelineIcons = {
  recu: Mail,
  envoye: Send,
  note: StickyNote,
};

const timelineLabels = {
  recu: "Reçu",
  envoye: "Envoyé",
  note: "Note",
};

const fileTypeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  word: FileIcon,
  image: FileIcon,
};

const DossierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dossier = dossiers.find((d) => d.id === id);

  if (!dossier) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto py-12 text-center">
          <p className="text-muted-foreground">Dossier introuvable.</p>
          <Link to="/dossiers">
            <Button variant="ghost" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux dossiers
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const progressPercent = dossier.piecesTotal > 0 ? Math.round((dossier.piecesCollectees / dossier.piecesTotal) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Link to="/dossiers">
            <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" /> Dossiers
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">{dossier.titre}</h1>
              <p className="text-sm text-muted-foreground font-sans mt-1">{dossier.nomClient} · {dossier.categorie}</p>
            </div>
            <Badge variant="outline" className="self-start text-sm font-sans px-3 py-1 border-accent/30 text-accent">
              {dossier.statutDossier}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-sans text-muted-foreground">
              Pièces collectées : {dossier.piecesCollectees}/{dossier.piecesTotal}
            </span>
            <Progress value={progressPercent} className="flex-1 h-2 max-w-xs" />
          </div>
        </motion.div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Résumé Donna */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card className="border-accent/20 bg-accent/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-sans">
                    <Sparkles className="h-5 w-5 text-accent" />
                    Résumé par Donna
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-sans text-foreground leading-relaxed">{dossier.resumeDonna}</p>
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    Dernière mise à jour par Donna à la réception du dernier email.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Anticipation */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-amber-300/50 dark:border-amber-700/50 bg-amber-50/50 dark:bg-amber-950/20 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-sans">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <span className="text-amber-900 dark:text-amber-200">Anticipation & Prochaine Action</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-sans text-amber-800 dark:text-amber-200/80 leading-relaxed">
                    {dossier.anticipation.texte}
                  </p>
                  {dossier.anticipation.echeance !== "—" && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-sans font-medium">
                      Échéance : {dossier.anticipation.echeance}
                    </p>
                  )}
                  {dossier.anticipation.brouillon && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="mt-4 bg-amber-600 hover:bg-amber-700 text-white">
                          <Eye className="h-4 w-4 mr-1" /> Voir le brouillon
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="font-serif">Brouillon préparé par Donna</DialogTitle>
                        </DialogHeader>
                        <pre className="whitespace-pre-wrap text-sm font-sans text-foreground bg-muted/50 p-4 rounded-md">
                          {dossier.anticipation.brouillon}
                        </pre>
                        <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(dossier.anticipation.brouillon)}>
                          Copier le brouillon
                        </Button>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Timeline */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-sans">Fil de conversation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
                    <div className="space-y-5">
                      {dossier.timeline.map((item, i) => {
                        const Icon = timelineIcons[item.type];
                        return (
                          <div key={i} className="flex gap-4 relative">
                            <div className="relative z-10 h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-sans font-medium text-foreground">{item.expediteur}</span>
                                <Badge variant="outline" className="text-[10px] font-sans px-1.5 py-0">
                                  {timelineLabels[item.type]}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-sans">{item.date}</span>
                              </div>
                              <p className="text-sm text-muted-foreground font-sans mt-0.5">{item.resume}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Dates clés */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-sans flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Dates Clés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dossier.datesCles.length === 0 ? (
                    <p className="text-xs text-muted-foreground font-sans">Aucune échéance à venir.</p>
                  ) : (
                    <ul className="space-y-3">
                      {dossier.datesCles.map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-accent mt-1.5 shrink-0" />
                          <div>
                            <p className="text-sm font-sans font-medium text-foreground">{d.label}</p>
                            <p className="text-xs text-muted-foreground font-sans">{d.date}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Documents */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-sans">Documents & Pièces</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pièces reçues */}
                  <div>
                    <p className="text-xs font-sans font-medium text-muted-foreground uppercase tracking-wide mb-2">Pièces reçues</p>
                    {dossier.piecesRecues.length === 0 ? (
                      <p className="text-xs text-muted-foreground font-sans">Aucune pièce reçue.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {dossier.piecesRecues.map((p, i) => {
                          const PIcon = fileTypeIcons[p.type] || FileText;
                          return (
                            <li key={i} className="flex items-center gap-2 text-sm font-sans text-foreground">
                              <PIcon className="h-4 w-4 text-accent shrink-0" />
                              <span className="truncate">{p.nom}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* Pièces manquantes */}
                  {dossier.piecesManquantes.length > 0 && (
                    <div>
                      <p className="text-xs font-sans font-medium text-muted-foreground uppercase tracking-wide mb-2">Pièces manquantes</p>
                      <ul className="space-y-1.5">
                        {dossier.piecesManquantes.map((p, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm font-sans text-amber-700 dark:text-amber-400">
                            <FileWarning className="h-4 w-4 shrink-0" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Rechercher */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Button variant="outline" className="w-full font-sans">
                <Search className="h-4 w-4 mr-2" /> Rechercher dans ce dossier
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DossierDetail;
