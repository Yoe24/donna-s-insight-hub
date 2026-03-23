import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RefreshCw, Mail, FolderOpen, CalendarDays, Reply, ChevronRight } from "lucide-react";
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

// ── Animated counter ──

function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

// ── Dashboard ──

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [nomAvocat, setNomAvocat] = useState("");

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
      if (e?.message?.includes("404")) setNotFound(true);
      else { console.error(e); toast.error("Impossible de charger le brief"); }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrief();
    apiGet<{ nom_avocat?: string }>("/api/config")
      .then((d) => { if (d?.nom_avocat) setNomAvocat(d.nom_avocat); })
      .catch(() => {});
  }, [fetchBrief]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await apiPost("/api/briefs/generate");
      toast.success("Brief généré");
      setLoading(true);
      setNotFound(false);
      await fetchBrief();
    } catch { toast.error("Erreur lors de la génération"); }
    finally { setGenerating(false); }
  };

  const now = new Date();
  const h = now.getHours();
  const greeting = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = format(now, "EEEE d MMMM yyyy", { locale: fr });

  const stats = brief?.content.stats;
  const aEmails = useAnimatedCounter(stats?.emails_analyzed ?? 0);
  const aDossiers = useAnimatedCounter(stats?.dossiers_count ?? 0);
  const aDeadlines = useAnimatedCounter(stats?.deadline_soon_count ?? 0);
  const aResponses = useAnimatedCounter(stats?.needs_response_count ?? 0);

  const userId = localStorage.getItem("donna_user_id");
  const allDossiers = brief?.content.dossiers ?? [];
  const urgentDossiers = allDossiers.filter((d) => d.needs_immediate_attention);
  const visibleDossiers = allDossiers.slice(0, 5);
  const hasMore = allDossiers.length > 5;

  // ── Loading skeleton ──
  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6 pt-8">
          <Skeleton className="h-7 w-80" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-5 w-32 mt-6" />
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  // ── 404 — No brief ──
  if (notFound || !brief) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-24">
          <Loader2 className={`h-7 w-7 mx-auto mb-4 text-muted-foreground ${generating ? "animate-spin" : ""}`} />
          <p className="text-lg font-serif text-foreground mb-1">Donna prépare votre brief…</p>
          <p className="text-sm text-muted-foreground mb-6">Votre résumé quotidien sera prêt dans quelques instants.</p>
          <Button onClick={handleGenerate} disabled={generating} variant="outline" className="gap-2">
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

        {/* 1 — Header line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-8 pb-6 text-lg font-serif text-foreground"
        >
          {greeting}{nomAvocat ? ` ${nomAvocat}` : ""} — <span className="capitalize">{dateStr}</span>
        </motion.p>

        {/* 2 — KPI cards */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {[
            { icon: <Mail className="h-5 w-5 text-muted-foreground" />, value: aEmails, label: "emails traités", alert: false },
            { icon: <FolderOpen className="h-5 w-5 text-muted-foreground" />, value: aDossiers, label: "dossiers actifs", alert: false },
            { icon: <CalendarDays className="h-5 w-5 text-muted-foreground" />, value: aDeadlines, label: "deadline(s) proche(s)", alert: (stats?.deadline_soon_count ?? 0) > 0 },
            { icon: <Reply className="h-5 w-5 text-muted-foreground" />, value: aResponses, label: "en attente de réponse", alert: false },
          ].map((kpi, i) => (
            <Card key={i} className={`bg-card shadow-sm ${kpi.alert ? "border-destructive/40" : "border-border"}`}>
              <CardContent className="p-4 flex flex-col gap-1">
                {kpi.icon}
                <span className="text-2xl font-bold tabular-nums text-foreground">{kpi.value}</span>
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* 3 — À traiter (urgent only) */}
        {urgentDossiers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mb-10"
          >
            <h2 className="text-sm font-semibold text-foreground mb-3 tracking-wide uppercase">À traiter</h2>
            <div className="space-y-2">
              {urgentDossiers.map((d) => (
                <div
                  key={d.dossier_id}
                  onClick={() => navigate(`/dossiers/${d.dossier_id}${userId ? `?user_id=${userId}` : ""}`)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border hover:shadow-sm cursor-pointer transition-shadow group"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive shrink-0" />
                  <span className="font-medium text-sm text-foreground truncate">{d.nom}</span>
                  {d.dates_cles?.[0] && (
                    <span className="hidden sm:inline text-xs text-muted-foreground shrink-0">
                      {d.dates_cles[0]}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground truncate flex-1 hidden md:inline">
                    {d.summary}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 4 — Vos dossiers */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <h2 className="text-sm font-semibold text-foreground mb-3 tracking-wide uppercase">Vos dossiers</h2>

          {allDossiers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Aucun dossier actif aujourd'hui.</p>
          ) : (
            <>
              <div className="space-y-3">
                {visibleDossiers.map((d, i) => (
                  <Card
                    key={d.dossier_id}
                    className="bg-card border-border hover:shadow-sm transition-shadow cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/dossiers/${d.dossier_id}${userId ? `?user_id=${userId}` : ""}`)}
                  >
                    <div className="flex">
                      <div className={`w-1 shrink-0 ${d.needs_immediate_attention ? "bg-destructive" : "bg-muted"}`} />
                      <CardContent className="p-4 flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <h3 className="font-semibold text-sm text-foreground truncate">{d.nom}</h3>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {d.new_emails_count} email{d.new_emails_count > 1 ? "s" : ""} reçu{d.new_emails_count > 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{d.summary}</p>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>

              {hasMore && (
                <div className="mt-4 text-center">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate("/fil")}>
                    Voir tous les dossiers →
                  </Button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
