/**
 * Dashboard — Briefing page
 *
 * Always fetches from API using the active user_id (demo or real).
 * The API returns demo data when the demo user_id is used.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RefreshCw, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiGet, apiPost } from "@/lib/api";
import { BriefingDetailPanel, type DossierEmail } from "@/components/BriefingDetailPanel";
import type { BriefingData, BriefingDossier, PeriodStats } from "@/lib/mock-briefing";

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

type PeriodFilter = "24h" | "7j" | "30j";

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  "24h": "24 heures",
  "7j": "7 jours",
  "30j": "30 jours",
};

const Dashboard = () => {
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
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("user_id");
    if (userId) {
      import("@/lib/auth").then(({ setUserId }) => setUserId(userId));
      localStorage.setItem("donna_demo_mode", "false");
      params.delete("user_id");
      const newSearch = params.toString();
      window.history.replaceState({}, "", "/dashboard" + (newSearch ? `?${newSearch}` : ""));
    }
  }, []);

  const fetchBriefing = useCallback(async () => {
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
    apiGet<{ nom_avocat?: string }>("/api/config")
      .then((d) => { if (d?.nom_avocat) setNomAvocat(d.nom_avocat); })
      .catch(() => {});
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
    apiGet<DossierEmail[]>(`/api/emails?dossier_id=${d.dossier_id}`)
      .then((emails) => setPanelEmails(emails ?? []))
      .catch(() => setPanelEmails([]));
  };

  const now = new Date();
  const h = now.getHours();
  const greeting = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = format(now, "EEEE d MMMM yyyy", { locale: fr });

  const dossiers = briefing?.content?.dossiers ?? [];
  const attenteDossiers = (dossiers || []).filter((d) => d?.attente);
  const relancesCount = attenteDossiers.length;

  const periodKey = period === "24h" ? "last_24h" : period === "7j" ? "last_7d" : "last_30d";
  const activeDossierIds = briefing?.content?.emails_by_period?.[periodKey] ?? [];
  const activeDossiers = dossiers
    .filter((d) => d.new_emails_count > 0)
    .filter((d) => activeDossierIds.includes(d.dossier_id));

  const periodStats = briefing?.content?.stats?.[periodKey] as PeriodStats | undefined;
  const adjustedStats = periodStats ? {
    total: periodStats.total,
    dossier_emails: periodStats.dossier_emails,
    general_emails: periodStats.general_emails,
    attachments_count: periodStats.attachments_count,
    temps_gagne_minutes: Math.round(periodStats.total * 5),
  } : null;

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
        <motion.p {...fadeIn} className="pt-8 pb-4 text-lg font-serif text-foreground">
          {greeting}{nomAvocat ? ` ${nomAvocat}` : ""} — <span className="capitalize">{dateStr}</span>
        </motion.p>

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

        {adjustedStats && (
          <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="rounded-xl bg-muted/50 px-5 py-4 mb-10">
            <p className="text-sm text-foreground/80 leading-relaxed">
              Vous avez reçu{" "}
              <a href="/fil?tab=emails" className="underline underline-offset-2 hover:text-foreground transition-colors">
                <strong>{adjustedStats.total} emails</strong>
              </a>{" "}
              {period === "24h" ? "dans les dernières 24 heures" : period === "7j" ? "ces 7 derniers jours" : "ces 30 derniers jours"}.
              {" "}Donna a traité <strong>{adjustedStats.total}</strong>{" "}
              : <strong>{adjustedStats.dossier_emails}</strong> liés à vos dossiers · <strong>{adjustedStats.general_emails}</strong> autres emails (newsletters, notifications…)
              <br />
              <a href="/fil?tab=pj" className="underline underline-offset-2 hover:text-foreground transition-colors">
                <strong>{adjustedStats.attachments_count} pièces jointes</strong>
              </a>{" "}
              extraites ·{" "}
              <a href="/fil?tab=relances" className="underline underline-offset-2 hover:text-foreground transition-colors">
                <strong>{relancesCount} relances</strong>
              </a>{" "}
              détectées
            </p>
          </motion.div>
        )}

        {activeDossiers.length > 0 && (
          <motion.section {...fadeIn} transition={{ delay: 0.1 }} className="mb-10">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Dossiers actifs
            </h2>
            <div className="space-y-1">
              {activeDossiers.map((d) => (
                <DossierLine
                  key={d.dossier_id}
                  dossier={d}
                  periodEmails={[]}
                  onClick={() => handleDossierClick(d)}
                  onViewFull={() => navigate(`/dossiers/${d.dossier_id}`)}
                />
              ))}
            </div>
          </motion.section>
        )}

        {activeDossiers.length === 0 && (
          <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-10 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Aucune activité dans les {PERIOD_LABELS[period].startsWith("24") ? "dernières " : "derniers "}{PERIOD_LABELS[period]}.
            </p>
          </motion.div>
        )}

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

        {adjustedStats && (
          <motion.p {...fadeIn} transition={{ delay: 0.3 }} className="text-xs text-muted-foreground/50 text-center pt-8">
            {adjustedStats.total} emails traités · {adjustedStats.temps_gagne_minutes}min gagnées
          </motion.p>
        )}
      </div>

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
  periodEmails,
  onClick,
  onViewFull,
}: {
  dossier: BriefingDossier;
  periodEmails: DossierEmail[];
  onClick: () => void;
  onViewFull: () => void;
}) {
  const emailCount = periodEmails.length;
  const hasMultiple = emailCount > 1;
  const displayEmails = periodEmails.slice(0, 5);
  const extraCount = emailCount - 5;

  if (!hasMultiple) {
    const narrativeText = d.emails_narrative || "";
    const narrative = narrativeText.length > 90
      ? narrativeText.slice(0, 87) + "…"
      : narrativeText;

    return (
      <div
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors group"
      >
        <div className="flex-1 min-w-0 truncate">
          <span className="text-sm text-foreground">
            <span className="font-medium">{d.nom}</span>
            <span className="text-muted-foreground"> · {d.domaine}</span>
            <span className="text-muted-foreground"> · </span>
            <span className="text-foreground/70">"{narrative}"</span>
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  return (
    <div className="rounded-lg hover:bg-muted/40 transition-colors">
      <div onClick={onClick} className="flex items-center gap-3 px-4 py-3 cursor-pointer group">
        <div className="flex-1 min-w-0">
          <span className="text-sm text-foreground">
            <span className="font-medium">{d.nom}</span>
            <span className="text-muted-foreground"> · {d.domaine}</span>
          </span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{emailCount} emails</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="pl-8 pr-4 pb-3 space-y-1">
        {displayEmails.map((email) => {
          const resumeText = email.resume || "";
          const shortResume = resumeText.length > 70 ? resumeText.slice(0, 67) + "…" : resumeText;
          return (
            <div key={email.id} className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-foreground/50">→</span>{" "}
              <span className="text-foreground/70">"{shortResume}"</span>{" "}
              <span className="text-muted-foreground/60">({email.date})</span>
            </div>
          );
        })}
        {extraCount > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onViewFull(); }}
            className="text-xs text-emerald hover:underline"
          >
            et {extraCount} autre{extraCount > 1 ? "s" : ""} → Voir le dossier complet
          </button>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
