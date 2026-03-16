import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, AlertCircle, Loader2, FolderOpen, ArrowLeft, Zap, PenLine, Check } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useEffect, useRef } from "react";

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

  return <ChooseMode />;
};

function ChooseMode() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleConnectGmail = async () => {
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="max-w-2xl w-full mb-4">
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Tableau de bord
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold text-foreground">Comment souhaitez-vous configurer Donna ?</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Choisissez la méthode qui vous convient le mieux.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1 — Automatic */}
            <Card className="relative border-primary/30 bg-primary/[0.02] hover:border-primary/50 transition-colors">
              <div className="absolute top-3 right-3">
                <Badge className="text-[10px] bg-primary text-primary-foreground">Recommandé</Badge>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-semibold text-foreground">Connexion Gmail</h2>
                  <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                    Donna analyse votre boîte mail et configure tout automatiquement
                  </p>
                </div>
                <ul className="space-y-1.5">
                  {["Dossiers clients créés", "Configuration pré-remplie", "Style de rédaction appris"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-foreground">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button onClick={handleConnectGmail} disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Connecter ma boîte Gmail
                </Button>
              </CardContent>
            </Card>

            {/* Card 2 — Manual */}
            <Card className="border-border hover:border-muted-foreground/30 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <PenLine className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-semibold text-foreground">Configuration manuelle</h2>
                  <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                    Remplissez vous-même les informations de votre cabinet
                  </p>
                </div>
                <ul className="space-y-1.5">
                  {["Contrôle total", "Pas d'accès Gmail requis", "~10 minutes"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-foreground">
                      <Check className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" onClick={() => navigate("/configuration")} className="w-full">
                  <PenLine className="h-4 w-4 mr-2" />
                  Configurer manuellement
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

function ImportProgress() {
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [searchParams] = useSearchParams();

  // Handle token verification from OAuth redirect
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      import("@/lib/supabase").then(({ supabase }) => {
        supabase.auth.verifyOtp({ token_hash: token, type: "magiclink" }).catch((err) => {
          console.warn("Token verification failed (continuing in degraded mode):", err);
        });
      });
    }
  }, [searchParams]);

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
