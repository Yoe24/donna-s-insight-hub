import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RefreshCw, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiGet, apiPost } from "@/lib/api";
import { isDemoMode } from "@/hooks/useDemoMode";
import { mockBriefing, type BriefingData, type BriefingDossier } from "@/lib/mock-briefing";

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
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

  const fetchBriefing = useCallback(async () => {
    if (isDemoMode()) {
      setBriefing(mockBriefing);
      setNomAvocat("Alexandra");
      setNotFound(false);
      setLoading(false);
      return;
    }
    try {
      const data = await apiGet<BriefingData>("/api/briefs/today");
      setBriefing(data);
      setNotFound(false);
    } catch (e: any) {
      if (e?.message?.includes("404")) setNotFound(true);
      else { console.error(e); toast.error("Impossible de charger le briefing"); }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBriefing();
    if (!isDemoMode()) {
      apiGet<{ nom_avocat?: string }>("/api/config")
        .then((d) => { if (d?.nom_avocat) setNomAvocat(d.nom_avocat); })
        .catch(() => {});
    }
  }, [fetchBriefing]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await apiPost("/api/briefs/generate");
      toast.success("Briefing généré");
      setLoading(true);
      setNotFound(false);
      await fetchBriefing();
    } catch { toast.error("Erreur lors de la génération"); }
    finally { setGenerating(false); }
  };

  const now = new Date();
  const h = now.getHours();
  const greeting = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = format(now, "EEEE d MMMM yyyy", { locale: fr });

  const dossiers = briefing?.content.dossiers ?? [];
  const activeDossiers = dossiers.filter((d) => d.new_emails_count > 0);
  const attenteDossiers = dossiers.filter((d) => d.attente);
  const stats = briefing?.content.stats;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6 pt-8">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-20 rounded-xl mt-6" />
          <Skeleton className="h-4 w-32 mt-8" />
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
        </div>
      </DashboardLayout>
    );
  }

  if (notFound || !briefing) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto text-center py-24">
          <Loader2 className={`h-7 w-7 mx-auto mb-4 text-muted-foreground ${generating ? "animate-spin" : ""}`} />
          <p className="text-lg font-serif text-foreground mb-1">Donna prépare votre briefing…</p>
          <p className="text-sm text-muted-foreground mb-6">Votre résumé de situation sera prêt dans quelques instants.</p>
          <Button onClick={handleGenerate} disabled={generating} variant="outline" className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Générer le briefing
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto pb-16">
        {/* Header */}
        <motion.p
          {...fadeIn}
          className="pt-8 pb-6 text-lg font-serif text-foreground"
        >
          {greeting}{nomAvocat ? ` ${nomAvocat}` : ""} — <span className="capitalize">{dateStr}</span>
        </motion.p>

        {/* Rapport Donna */}
        {stats && (
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.05 }}
            className="rounded-xl bg-muted/50 px-5 py-4 mb-10"
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Donna a traité <strong>{stats.emails_analyzed} emails</strong> depuis hier soir.
              <br />
              <strong>{stats.emails_dossiers ?? stats.emails_analyzed}</strong> emails liés à vos dossiers · <strong>{stats.emails_generaux ?? 0}</strong> emails généraux
              <br />
              <strong>{stats.pieces_extraites ?? 0}</strong> pièces jointes extraites · <strong>{stats.dates_detectees ?? 0}</strong> dates importantes détectées
            </p>
          </motion.div>
        )}

        {/* Dossiers actifs */}
        {activeDossiers.length > 0 && (
          <motion.section {...fadeIn} transition={{ delay: 0.1 }} className="mb-10">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Dossiers actifs
            </h2>
            <div className="space-y-1">
              {activeDossiers.map((d) => (
                <DossierLine key={d.dossier_id} dossier={d} navigate={navigate} />
              ))}
            </div>
          </motion.section>
        )}

        {activeDossiers.length === 0 && (
          <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-10 py-10 text-center">
            <p className="text-sm text-muted-foreground">Aucune activité détectée depuis votre dernière connexion.</p>
          </motion.div>
        )}

        {/* En attente */}
        {attenteDossiers.length > 0 && (
          <motion.section {...fadeIn} transition={{ delay: 0.2 }} className="mb-10">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              En attente
            </h2>
            <div className="space-y-1">
              {attenteDossiers.map((d) => (
                <div
                  key={`attente-${d.dossier_id}`}
                  onClick={() => navigate(`/dossiers/${d.dossier_id}`)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-foreground">
                      <span className="font-medium">{d.nom}</span>
                      <span className="text-muted-foreground"> · {d.attente!.description} ({d.attente!.jours} jours)</span>
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Stats footer */}
        {stats && (
          <motion.p
            {...fadeIn}
            transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground/50 text-center pt-8"
          >
            {stats.emails_analyzed} emails traités · {stats.temps_gagne_minutes ?? 0}min gagnées
          </motion.p>
        )}
      </div>
    </DashboardLayout>
  );
};

/* ── Single dossier line ── */

function DossierLine({
  dossier: d,
  navigate,
}: {
  dossier: BriefingDossier;
  navigate: (path: string) => void;
}) {
  const isUrgent = d.deadline_days !== null && d.deadline_days <= 7;
  const narrative = d.emails_narrative.length > 90
    ? d.emails_narrative.slice(0, 87) + "…"
    : d.emails_narrative;

  return (
    <div
      onClick={() => navigate(`/dossiers/${d.dossier_id}`)}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors group"
    >
      {/* Urgency dot */}
      <span className="shrink-0 w-2 h-2 rounded-full" style={{
        backgroundColor: isUrgent ? 'hsl(var(--destructive))' : 'transparent',
      }} />

      {/* Content */}
      <div className="flex-1 min-w-0 truncate">
        <span className="text-sm text-foreground">
          <span className="font-medium">{d.nom}</span>
          <span className="text-muted-foreground"> · {d.domaine}</span>
          <span className="text-muted-foreground"> · </span>
          <span className="text-foreground/70">"{narrative}"</span>
        </span>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export default Dashboard;
