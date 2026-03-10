// Dossiers.tsx — Endpoint: GET /api/dossiers

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Mail, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

interface Dossier {
  id: string;
  nom: string;
  client: string;
  type_droit: string;
  nb_emails: number;
  created_at: string;
  statut: string;
}

const Dossiers = () => {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        const data = await api.get<Dossier[]>('/api/dossiers');
        setDossiers(data || []);
      } catch (error) {
        console.error('Error fetching dossiers:', error);
      }
      setLoading(false);
    };
    fetchDossiers();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Dossiers</h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            Vos dossiers clients, organisés automatiquement par Donna.
          </p>
        </div>

        {dossiers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-sm">Aucun dossier pour le moment</p>
          </Card>
        ) : (
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
                            <p className="font-sans font-medium text-sm text-foreground">{dossier.nom || dossier.client}</p>
                            <p className="text-xs font-sans text-muted-foreground">{dossier.type_droit}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-xs font-sans text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{dossier.nb_emails} mails</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{new Date(dossier.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs font-sans ${dossier.statut === "actif" ? "border-accent/30 text-accent" : "border-muted-foreground/30 text-muted-foreground"}`}
                          >
                            {dossier.statut === "actif" ? "Actif" : dossier.statut}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dossiers;
