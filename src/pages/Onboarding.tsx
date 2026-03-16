import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, AlertCircle, Loader2, FolderOpen, ArrowLeft, Zap, PenLine, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";

interface ImportStatus {
  processed: number;
  total: number;
  dossiers_created: number;
  status: string;
}

const ROTATING_SUBTITLES = [
  "Analyse de votre boîte mail en cours...",
  "Création de vos dossiers clients...",
  "Détection de votre signature...",
  "Préparation de votre tableau de bord...",
];

const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const isImporting = searchParams.get("import") === "started";

  // Store user_id from OAuth redirect
  useEffect(() => {
    const userId = searchParams.get("user_id");
    if (userId) {
      localStorage.setItem("donna_user_id", userId);
    }
  }, [searchParams]);

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
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  // Rotate subtitles every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSubtitleIndex((prev) => (prev + 1) % ROTATING_SUBTITLES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Poll import status every 3 seconds
  useEffect(() => {
    const poll = async () => {
      try {
        const data = await api.get<ImportStatus>('/api/import/status');
        setStatus(data);
        if (data.status === "completed" || data.status === "done" || data.status === "idle" || data.status === "error") {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch (error) {
        console.error('Error polling import status:', error);
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const progressPercent = status && status.total > 0
    ? Math.round((status.processed / status.total) * 100)
    : 0;

  const isDone = status?.status === "completed" || status?.status === "done" || status?.status === "idle";
  const isError = status?.status === "error";

  // Done state
  if (isDone && status) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <h2 className="text-2xl font-serif font-bold tracking-tight text-foreground">Donna</h2>

          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-serif font-bold text-foreground">C'est prêt !</h1>
            <p className="text-sm text-muted-foreground">
              Donna a analysé {status.processed} email{status.processed > 1 ? "s" : ""} et créé {status.dossiers_created} dossier{status.dossiers_created > 1 ? "s" : ""}.
            </p>
          </div>

          <Button
            size="lg"
            className="w-full min-h-[56px] rounded-xl"
            onClick={() => navigate("/dashboard")}
          >
            Accéder à mon tableau de bord →
          </Button>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <h2 className="text-2xl font-serif font-bold tracking-tight text-foreground">Donna</h2>

          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-serif font-bold text-foreground">Erreur d'import</h1>
            <p className="text-sm text-muted-foreground">
              Une erreur est survenue lors de l'import. Veuillez réessayer.
            </p>
          </div>

          <Button
            size="lg"
            variant="outline"
            className="w-full min-h-[56px] rounded-xl"
            onClick={() => navigate("/onboarding")}
          >
            Réessayer
          </Button>
        </motion.div>
      </div>
    );
  }

  // Loading/progress state
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center space-y-10"
      >
        {/* Logo */}
        <h2 className="text-2xl font-serif font-bold tracking-tight text-foreground">Donna</h2>

        {/* Pulse animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-xl font-serif font-bold text-foreground">Donna se met au travail...</h1>
          
          {/* Rotating subtitle */}
          <div className="h-6 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={subtitleIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-sm text-muted-foreground absolute inset-x-0"
              >
                {ROTATING_SUBTITLES[subtitleIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-3">
          <div className="w-full h-2 bg-muted rounded-lg overflow-hidden">
            <div
              className="h-full rounded-lg"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: "#6C63FF",
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {status
              ? `${status.processed} email${status.processed > 1 ? "s" : ""} analysé${status.processed > 1 ? "s" : ""}`
              : "Connexion en cours..."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Onboarding;
