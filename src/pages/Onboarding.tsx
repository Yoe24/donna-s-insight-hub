import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, AlertCircle, Loader2, Zap, PenLine, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiGet, apiPublicGet } from "@/lib/api";
import { captureUserIdFromUrl } from "@/lib/userSession";
import { DashboardLayout } from "@/components/DashboardLayout";

interface ImportStatus {
  status: "processing" | "done" | "error";
  progress: number;
  total: number;
  processed: number;
  dossiers_created: number;
  attachments_count?: number;
}

const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isImporting = searchParams.get("import") === "started";
  const isDemo = searchParams.get("demo") === "true";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Capture user_id from OAuth callback URL
    captureUserIdFromUrl();
    const incomingUserId = searchParams.get("user_id") || localStorage.getItem("donna_user_id");

    if (isImporting && incomingUserId && localStorage.getItem("donna_user_id") === incomingUserId) {
      // Already processed this user, check if import is done
    }

    if (isImporting || isDemo) {
      if (isDemo) {
        setReady(true);
        return;
      }
      apiGet<ImportStatus>("/api/import/status")
        .then((data) => {
          if (data?.status === "done") {
            navigate("/dashboard", { replace: true });
          } else {
            setReady(true);
          }
        })
        .catch(() => setReady(true));
      return;
    }

    setReady(true);
  }, [isImporting, isDemo, navigate, searchParams]);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      import("@/lib/supabase").then(({ supabase }) => {
        supabase.auth.verifyOtp({ token_hash: token, type: "magiclink" }).catch((err) => {
          console.warn("Token verification failed:", err);
        });
      });
    }
  }, [searchParams]);

  if (!ready) return null;
  if (isDemo) return <DemoScanScreen />;
  if (isImporting) return <ScanScreen />;
  return <ChooseMode />;
};

// ── Scan Screen ──

const SCAN_MESSAGES_BASE = ["Donna analyse vos emails..."];

function ScanScreen() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const startTimeRef = useRef(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dynamicMessages = useCallback(() => {
    const msgs = [...SCAN_MESSAGES_BASE];
    if (status && status.processed > 0) {
      msgs.push(`${status.processed} emails détectés`);
    }
    if (status && status.dossiers_created > 0) {
      msgs.push(
        `${status.dossiers_created} dossier${status.dossiers_created > 1 ? "s" : ""} identifié${status.dossiers_created > 1 ? "s" : ""}`
      );
    }
    if (status && (status.attachments_count ?? 0) > 0) {
      msgs.push(`${status.attachments_count} pièces jointes extraites`);
    }
    if (status?.status === "done") {
      msgs.push("Votre briefing est prêt");
    }
    return msgs;
  }, [status]);

  // Rotate messages every 1.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => {
        const msgs = dynamicMessages();
        return (prev + 1) % msgs.length;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [dynamicMessages]);

  // Poll every 3s
  useEffect(() => {
    const poll = async () => {
      try {
        const data = await apiGet<ImportStatus>("/api/import/status");
        setStatus(data);
        if (data.status === "done" || data.status === "error") {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch (e) {
        console.error("Poll error:", e);
      }
    };
    poll();
    intervalRef.current = setInterval(poll, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Min 5s display
  useEffect(() => {
    if (status?.status === "done") {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 5000 - elapsed);
      const timer = setTimeout(() => setCanProceed(true), remaining);
      return () => clearTimeout(timer);
    }
  }, [status?.status]);

  const isDone = status?.status === "done";
  const isError = status?.status === "error";
  const progress = status?.progress ?? 0;
  const messages = dynamicMessages();
  const currentMessage = messages[messageIndex % messages.length];

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-sm w-full text-center space-y-8">
          <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground">Donna</h2>
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-serif font-bold text-foreground">Erreur d'import</h1>
            <p className="text-sm text-muted-foreground">Une erreur est survenue. Veuillez réessayer.</p>
          </div>
          <Button variant="outline" className="w-full rounded-xl" onClick={() => navigate("/onboarding")}>
            Réessayer
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm w-full text-center space-y-10"
      >
        <motion.h2
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-3xl font-serif font-bold tracking-tight text-foreground"
        >
          Donna
        </motion.h2>

        <div className="h-8 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="text-sm text-muted-foreground absolute inset-x-0"
            >
              {currentMessage}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <AnimatePresence>
          {isDone && canProceed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                size="lg"
                className="w-full rounded-xl"
                onClick={() => {
                  const uid = localStorage.getItem("donna_user_id");
                  navigate(uid ? `/dashboard?user_id=${uid}` : "/dashboard");
                }}
              >
                Voir mon briefing →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── Demo Scan Screen ──

const DEMO_MESSAGES = [
  "Donna analyse vos emails...",
  "42 emails détectés",
  "7 dossiers identifiés",
  "12 pièces jointes extraites",
  "Votre briefing est prêt",
];

function DemoScanScreen() {
  const navigate = useNavigate();
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [canProceed, setCanProceed] = useState(false);

  // Animate progress over 6 seconds
  useEffect(() => {
    const duration = 6000;
    const interval = 50;
    const steps = duration / interval;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setProgress(Math.min(100, (step / steps) * 100));
      if (step >= steps) {
        clearInterval(timer);
        setCanProceed(true);
      }
    }, interval);
    return () => clearInterval(timer);
  }, []);

  // Rotate messages
  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => Math.min(prev + 1, DEMO_MESSAGES.length - 1));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const currentMessage = DEMO_MESSAGES[messageIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm w-full text-center space-y-10"
      >
        <motion.h2
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-3xl font-serif font-bold tracking-tight text-foreground"
        >
          Donna
        </motion.h2>

        <div className="h-8 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="text-sm text-muted-foreground absolute inset-x-0"
            >
              {currentMessage}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence>
          {canProceed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                size="lg"
                className="w-full rounded-xl"
                onClick={() => navigate("/dashboard")}
              >
                Voir mon briefing →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── Choose Mode ──

function ChooseMode() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleConnectGmail = async () => {
    setLoading(true);
    try {
      const data = await apiPublicGet<{ auth_url: string }>("/api/import/gmail/auth");
      if (data?.auth_url) window.location.href = data.auth_url;
    } catch (error) {
      console.error("Error getting auth URL:", error);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="max-w-2xl w-full mb-4">
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Briefing
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold text-foreground">Comment souhaitez-vous configurer Donna ?</h1>
            <p className="text-muted-foreground text-sm mt-2">Choisissez la méthode qui vous convient le mieux.</p>
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
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
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

export default Onboarding;
