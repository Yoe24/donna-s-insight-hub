import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dossiers } from "@/lib/mock-data";
import { FolderOpen, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Dossiers = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Dossiers</h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            Vos dossiers clients, organisés automatiquement par Donna.
          </p>
        </div>

        <div className="grid gap-4">
          {dossiers.map((dossier, i) => (
            <motion.div
              key={dossier.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/dossiers/${dossier.id}`} className="block">
              <Card className="border-border bg-card hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-sans font-medium text-sm text-foreground">{dossier.nomClient}</p>
                        <p className="text-xs font-sans text-muted-foreground">{dossier.categorie}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs font-sans text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{dossier.nombreMails} mails</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{dossier.dernierMail}</span>
                      </div>
                      <Badge variant="outline" className="text-xs font-sans">
                        {dossier.retention}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs font-sans ${dossier.statut === "actif" ? "border-accent/30 text-accent" : "border-muted-foreground/30 text-muted-foreground"}`}
                      >
                        {dossier.statut === "actif" ? "Actif" : "Archivé"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dossiers;
