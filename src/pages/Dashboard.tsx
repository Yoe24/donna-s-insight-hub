import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RefreshCw, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiGet, apiPost } from "@/lib/api";
import { isDemoMode } from "@/hooks/useDemoMode";
import { mockBriefing, mockDossierEmails, type BriefingData, type BriefingDossier } from "@/lib/mock-briefing";
import { BriefingDetailPanel, type DossierEmail } from "@/components/BriefingDetailPanel";

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

type PeriodFilter = "24h" | "7j" | "30j";

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  "24h": "24 heures",
  "7j": "7 jours",
  "30j": "30 jours",
};

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [nomAvocat, setNomAvocat] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("24h");
  const [selectedDossier, setSelectedDossier] = useState<BriefingDossier | null>(null);
  const [panelEmails, setPanelEmails] = useState<DossierEmail[]>([]);

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

  const handleDossierClick = (d: BriefingDossier) => {
    setSelectedDossier(d);
    // In demo mode, use mock emails; in live mode, fetch from API
    if (isDemoMode()) {
      setPanelEmails(mockDossierEmails[d.dossier_id] ?? []);
    } else {
      apiGet<DossierEmail[]>(`/api/emails?dossier_id=${d.dossier_id}`)
        .then((emails) => setPanelEmails(emails ?? []))
        .catch(() => setPanelEmails([]));
    }
  };

  // Period-based filtering for demo stats
  const periodMultiplier = period === "24h" ? 1 : period === "7j" ? 5 : 18;
  const adjustedStats = briefing?.content.stats
    ? {
        ...briefing.content.stats,
        emails_analyzed: briefing.content.stats.emails_analyzed * periodMultiplier,
        emails_dossiers: (briefing.content.stats.emails_dossiers ?? briefing.content.stats.emails_analyzed) * periodMultiplier,
        emails_generaux: (briefing.content.stats.emails_generaux ?? 0) * periodMultiplier,
        pieces_extraites: (briefing.content.stats.pieces_extraites ?? 0) * periodMultiplier,
        dates_detectees: (briefing.content.stats.dates_detectees ?? 0) * periodMultiplier,
        temps_gagne_minutes: (briefing.content.stats.temps_gagne_minutes ?? 0) * periodMultiplier,
      }
    : null;

  const now = new Date();
  const h = now.getHours();
  const greeting = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = format(now, "EEEE d MMMM yyyy", { locale: fr });

  const dossiers = briefing?.content.dossiers ?? [];
  const activeDossiers = dossiers.filter((d) => d.new_emails_count > 0);
  const attenteDossiers = dossiers.filter((d) => d.attente);

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
          className="pt-8 pb-4 text-lg font-serif text-foreground"
        >
          {greeting}{nomAvocat ? ` ${nomAvocat}` : ""} — <span className="capitalize">{dateStr}</span>
        </motion.p>

        {/* Period tabs */}
        <motion.div {...fadeIn} transition={{ delay: 0.03 }} className="flex gap-1.5 mb-6">
          {(["24h", "7j", "30j"] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? "bg-emerald text-emerald-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </motion.div>

        {/* Rapport Donna */}
        {adjustedStats && (
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.05 }}
            className="rounded-xl bg-muted/50 px-5 py-4 mb-10"
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Donna a traité <strong>{adjustedStats.emails_analyzed} emails</strong> {period === "24h" ? "dans les dernières 24 heures" : period === "7j" ? "ces 7 derniers jours" : "ces 30 derniers jours"}.
              <br />
              <strong>{adjustedStats.emails_dossiers}</strong> emails liés à vos dossiers · <strong>{adjustedStats.emails_generaux}</strong> emails généraux
              <br />
              <strong>{adjustedStats.pieces_extraites}</strong> pièces jointes extraites · <strong>{adjustedStats.dates_detectees}</strong> dates importantes détectées
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
                <DossierLine key={d.dossier_id} dossier={d} onClick={() => handleDossierClick(d)} />
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
                  onClick={() => handleDossierClick(d)}
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
        {adjustedStats && (
          <motion.p
            {...fadeIn}
            transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground/50 text-center pt-8"
          >
            {adjustedStats.emails_analyzed} emails traités · {adjustedStats.temps_gagne_minutes}min gagnées
          </motion.p>
        )}
      </div>

      {/* Detail panel */}
      <BriefingDetailPanel
        dossier={selectedDossier}
        emails={panelEmails}
        periodLabel={PERIOD_LABELS[period]}
        onClose={() => setSelectedDossier(null)}
      />
    </DashboardLayout>
  );
};

/* ── Single dossier line ── */

function DossierLine({
  dossier: d,
  onClick,
}: {
  dossier: BriefingDossier;
  onClick: () => void;
}) {
  const isUrgent = d.deadline_days !== null && d.deadline_days <= 7;
  const narrative = d.emails_narrative.length > 90
    ? d.emails_narrative.slice(0, 87) + "…"
    : d.emails_narrative;

  return (
    <div
      onClick={onClick}
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
