import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Mail, FolderOpen, CalendarDays, Reply } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiGet, apiPost } from "@/lib/api";

// ── Types ──

interface BriefDossier {
  dossier_id: string;
  nom: string;
  new_emails_count: number;
  summary: string;
  dates_cles: string[];
  emails_recus: string[];
  needs_immediate_attention: boolean;
}

interface BriefData {
  content: {
    executive_summary: string;
    stats: {
      emails_analyzed: number;
      dossiers_count: number;
      deadline_soon_count: number;
      needs_response_count: number;
    };
    dossiers: BriefDossier[];
  };
}

// ── Helpers ──

function useAnimatedCounter(target: number, duration = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

// ── Main Dashboard ──

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [nomAvocat, setNomAvocat] = useState<string>("");

  // Capture user_id from URL
  useEffect(() => {
    const userId = searchParams.get("user_id");
    if (userId) {
      localStorage.setItem("donna_user_id", userId);
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  const fetchBrief = useCallback(async () => {
    try {
      const data = await apiGet<BriefData>("/api/briefs/today");
      setBrief(data);
      setNotFound(false);
    } catch (e: any) {
      if (e?.message?.includes("404")) {
        setNotFound(true);
      } else {
        console.error("Error fetching brief:", e);
        toast.error("Impossible de charger le brief");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrief();
    apiGet<{ nom_avocat?: string }>("/api/config")
      .then(data => { if (data?.nom_avocat) setNomAvocat(data.nom_avocat); })
      .catch(() => {});
  }, [fetchBrief]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await apiPost("/api/briefs/generate");
      toast.success("Brief généré avec succès");
      setLoading(true);
      setNotFound(false);
      await fetchBrief();
    } catch {
      toast.error("Erreur lors de la génération du brief");
    } finally {
      setGenerating(false);
    }
  };

  const now = new Date();
  const currentHour = now.getHours();
  const greeting = currentHour < 12 ? "Bonjour" : currentHour < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = format(now, "EEEE d MMMM yyyy", { locale: fr });

  const stats = brief?.content.stats;
  const animatedEmails = useAnimatedCounter(stats?.emails_analyzed ?? 0, 1500);
  const animatedDossiers = useAnimatedCounter(stats?.dossiers_count ?? 0, 1500);
  const animatedUrgent = useAnimatedCounter(stats?.urgent_count ?? 0, 1500);
  const animatedResponses = useAnimatedCounter(stats?.needs_response_count ?? 0, 1500);

  const sortedDossiers = brief?.content.dossiers
    ? [...brief.content.dossiers].sort((a, b) => (urgencyOrder[a.urgency] ?? 2) - (urgencyOrder[b.urgency] ?? 2))
    : [];

  const userId = localStorage.getItem("donna_user_id");

  // ── Loading state ──
  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="mt-8 mb-10 space-y-3">
            <div className="h-8 w-72 bg-muted animate-pulse rounded" />
            <div className="h-5 w-48 bg-muted animate-pulse rounded" />
            <div className="h-24 w-full bg-muted animate-pulse rounded-xl mt-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  // ── 404: No brief yet ──
  if (notFound || !brief) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <Loader2 className={`h-8 w-8 mx-auto mb-4 text-muted-foreground ${generating ? "animate-spin" : ""}`} />
          <p className="text-xl font-serif text-foreground mb-2">Donna prépare votre brief…</p>
          <p className="text-sm text-gray-600 mb-6">Votre résumé quotidien sera prêt dans quelques instants.</p>
          <Button onClick={handleGenerate} disabled={generating} className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Générer le brief
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Brief loaded ──
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-12">

        {/* SECTION 1 — Résumé exécutif */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-8 mb-8 rounded-xl bg-accent/40 border border-accent p-6"
        >
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
            <h1 className="text-2xl font-serif font-bold text-foreground">
              {greeting}{nomAvocat ? ` ${nomAvocat}` : ""}
            </h1>
            <span className="text-sm text-gray-600 capitalize">{dateStr}</span>
          </div>
          <p className="text-base sm:text-lg leading-relaxed text-foreground/90">
            {brief.content.executive_summary}
          </p>
        </motion.div>

        {/* SECTION 2 — KPI cards */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {[
            { icon: <Mail className="h-4 w-4 text-primary" />, value: animatedEmails, label: "emails analysés" },
            { icon: <FolderOpen className="h-4 w-4 text-primary" />, value: animatedDossiers, label: "dossiers actifs" },
            { icon: <AlertTriangle className="h-4 w-4 text-destructive" />, value: animatedUrgent, label: "urgences" },
            { icon: <Reply className="h-4 w-4 text-primary" />, value: animatedResponses, label: "réponses attendues" },
          ].map((kpi, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                {kpi.icon}
                <span className="text-2xl font-extrabold tabular-nums text-foreground">{kpi.value}</span>
                <span className="text-xs text-gray-600">{kpi.label}</span>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* SECTION 3 — Dossiers par priorité */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <h2 className="text-lg font-serif font-semibold text-foreground mb-4">Vos dossiers</h2>

          {sortedDossiers.length === 0 ? (
            <p className="text-sm text-gray-600 py-8 text-center">Aucun dossier actif pour aujourd'hui.</p>
          ) : (
            <div className="space-y-4">
              {sortedDossiers.map((dossier, i) => (
                <motion.div
                  key={dossier.dossier_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.07, duration: 0.3 }}
                >
                  <Card
                    className="bg-card border-border hover:shadow-md transition-shadow cursor-pointer group overflow-hidden"
                    onClick={() => navigate(`/dossiers/${dossier.dossier_id}${userId ? `?user_id=${userId}` : ""}`)}
                  >
                    <div className="flex">
                      {/* Urgency indicator bar */}
                      <div className={`w-1.5 shrink-0 ${urgencyColor[dossier.urgency] ?? "bg-muted"}`} />

                      <CardContent className="p-5 flex-1">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {dossier.nom}
                            </h3>
                            <span className="text-xs text-gray-600">
                              {dossier.new_emails_count} nouveau{dossier.new_emails_count > 1 ? "x" : ""} email{dossier.new_emails_count > 1 ? "s" : ""}
                            </span>
                          </div>
                          {dossier.needs_immediate_attention && (
                            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive text-[11px] font-semibold px-2 py-0.5">
                              ⚡ Urgent
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3 mb-3">
                          {dossier.summary}
                        </p>

                        {dossier.suggested_actions.length > 0 && (
                          <ul className="space-y-1.5">
                            {dossier.suggested_actions.map((action, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                                <Circle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
