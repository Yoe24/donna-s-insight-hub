import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FolderOpen, Mail, ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { api as apiClient } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

interface Dossier {
  id: string;
  nom_client: string;
  email_client: string;
  statut: string;
  domaine: string;
  dernier_echange_date: string;
}

const statutBadge = (statut: string) => {
  switch (statut) {
    case "actif":
      return <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs px-2 py-0.5 font-medium">Actif</span>;
    case "en_attente":
      return <span className="inline-flex items-center rounded-full bg-orange-100 text-orange-800 text-xs px-2 py-0.5 font-medium">En attente</span>;
    case "archive":
      return <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-xs px-2 py-0.5 font-medium">Archivé</span>;
    default:
      return <Badge variant="outline" className="text-xs">{statut}</Badge>;
  }
};

const Dossiers = () => {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-80 bg-muted animate-pulse rounded" />
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3 w-3" />
          Tableau de bord
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Dossiers</h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            Vos dossiers clients, organisés automatiquement par Donna.
          </p>
        </div>

        {dossiers.length === 0 ? (
          <Card className="p-12 text-center">
            <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-1">Aucun dossier pour l'instant</p>
            <p className="text-muted-foreground text-sm mb-6">
              Connectez votre boîte Gmail pour importer vos dossiers clients.
            </p>
            <Button asChild className="min-h-[48px]">
              <Link to="/onboarding">
                <Mail className="h-4 w-4 mr-2" />
                Connecter Gmail
              </Link>
            </Button>
          </Card>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Desktop table */}
            <div className="hidden sm:block">
              <Card className="border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-sans text-xs">Client</TableHead>
                      <TableHead className="font-sans text-xs">Email</TableHead>
                      <TableHead className="font-sans text-xs">Statut</TableHead>
                      <TableHead className="font-sans text-xs">Domaine</TableHead>
                      <TableHead className="font-sans text-xs text-right">Dernier échange</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dossiers.map((dossier) => (
                      <TableRow
                        key={dossier.id}
                        className="cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => navigate(`/dossiers/${dossier.id}`)}
                      >
                        <TableCell className="font-sans text-sm font-medium">{dossier.nom_client}</TableCell>
                        <TableCell className="font-sans text-sm text-muted-foreground">{dossier.email_client}</TableCell>
                        <TableCell>{statutBadge(dossier.statut)}</TableCell>
                        <TableCell className="font-sans text-sm text-muted-foreground">{dossier.domaine}</TableCell>
                        <TableCell className="font-sans text-sm text-muted-foreground text-right">
                          {dossier.dernier_echange_date
                            ? new Date(dossier.dernier_echange_date).toLocaleDateString('fr-FR')
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {dossiers.map((dossier) => (
                <Card
                  key={dossier.id}
                  className="cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => navigate(`/dossiers/${dossier.id}`)}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-sm font-medium text-foreground">{dossier.nom_client}</span>
                      {statutBadge(dossier.statut)}
                    </div>
                    <p className="font-sans text-xs text-muted-foreground">{dossier.email_client}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-sans">
                      <span>{dossier.domaine}</span>
                      <span>
                        {dossier.dernier_echange_date
                          ? new Date(dossier.dernier_echange_date).toLocaleDateString('fr-FR')
                          : "—"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dossiers;
