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
  const [connectingGmail, setConnectingGmail] = useState(false);
  const navigate = useNavigate();

  const handleConnectGmail = async () => {
    setConnectingGmail(true);
    try {
      const res = await apiClient.get<{ auth_url: string }>("/api/import/gmail/auth");
      if (res.auth_url) window.location.href = res.auth_url;
    } catch {
      setConnectingGmail(false);
    }
  };

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
      <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 space-y-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3 w-3" />
          Tableau de bord
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Mes dossiers</h1>

        {dossiers.length === 0 ? (
          <div className="rounded-xl border-2 border-[#6C63FF]/30 bg-[#6C63FF]/[0.03] p-8 text-center space-y-4">
            <FolderOpen className="h-10 w-10 mx-auto text-[#6C63FF]" />
            <div className="space-y-1.5">
              <p className="text-lg font-semibold text-foreground">Connectez votre boîte Gmail</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Donna organisera automatiquement vos dossiers clients.
              </p>
            </div>
            <Button
              onClick={handleConnectGmail}
              disabled={connectingGmail}
              className="bg-[#6C63FF] hover:bg-[#5a52e0] text-white px-6"
            >
              {connectingGmail && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Connecter Gmail
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Desktop table */}
            <div className="hidden sm:block">
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                      <TableHead className="text-xs">Domaine</TableHead>
                      <TableHead className="text-xs text-right">Dernier échange</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dossiers.map((dossier) => (
                      <TableRow
                        key={dossier.id}
                        className="cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => navigate(`/dossiers/${dossier.id}`)}
                      >
                        <TableCell className="text-sm font-medium">{dossier.nom_client}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{dossier.email_client}</TableCell>
                        <TableCell>{statutBadge(dossier.statut)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{dossier.domaine}</TableCell>
                        <TableCell className="text-sm text-muted-foreground text-right">
                          {dossier.dernier_echange_date
                            ? new Date(dossier.dernier_echange_date).toLocaleDateString('fr-FR')
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
