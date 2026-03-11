import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mail, CheckCircle2, AlertCircle, Loader2, FolderOpen, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

interface ImportStatus {
  processed: number;
  total: number;
  dossiers_created: number;
  status: string;
}

const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const isImporting = searchParams.get("import") === "started";

  if (isImporting) {
    return <ImportProgress />;
  }

  return <ConnectGmail />;
};

function ConnectGmail() {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ auth_url: string }>('/api/import/gmail/auth');
      if (data?.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (error) {
      console.error('Error getting auth URL:', error);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <Card className="border-border bg-card text-center">
            <CardContent className="p-10 space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground">Bienvenue sur Donna</h1>
                <p className="text-muted-foreground text-sm mt-2">
                  Connectez votre boîte Gmail pour que Donna analyse votre cabinet.
                </p>
              </div>
              <Button onClick={handleConnect} disabled={loading} size="lg" className="w-full">
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Connecter ma boîte Gmail
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

function ImportProgress() {
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await api.get<ImportStatus>('/api/import/status');
        setStatus(data);
        if (data.status === "done" || data.status === "error") {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch (error) {
        console.error('Error polling import status:', error);
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const progressPercent = status && status.total > 0
    ? Math.round((status.processed / status.total) * 100)
    : 0;

  // Done state
  if (status?.status === "done") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
            <Card className="border-border bg-card text-center">
              <CardContent className="p-10 space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold text-foreground">Import terminé !</h1>
                  <p className="text-muted-foreground text-sm mt-2">
                    {status.dossiers_created} dossier{status.dossiers_created > 1 ? "s" : ""} créé{status.dossiers_created > 1 ? "s" : ""}
                  </p>
                </div>
                <Button asChild size="lg" className="w-full">
                  <Link to="/dossiers">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Voir mes dossiers
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (status?.status === "error") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md w-full">
            <Card className="border-border bg-card text-center">
              <CardContent className="p-10 space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold text-foreground">Erreur d'import</h1>
                  <p className="text-muted-foreground text-sm mt-2">
                    Une erreur est survenue lors de l'import. Veuillez réessayer.
                  </p>
                </div>
                <Button asChild size="lg" variant="outline" className="w-full">
                  <Link to="/onboarding">Réessayer</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // Loading / in-progress state
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <Card className="border-border bg-card text-center">
            <CardContent className="p-10 space-y-6">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <div>
                <h1 className="text-xl font-serif font-bold text-foreground">Donna analyse votre cabinet...</h1>
                <p className="text-muted-foreground text-sm mt-2">
                  {status
                    ? `${status.processed} / ${status.total} emails traités • ${status.dossiers_created} dossiers créés`
                    : "Connexion en cours..."}
                </p>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default Onboarding;
