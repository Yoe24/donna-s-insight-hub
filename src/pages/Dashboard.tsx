/**
 * Dashboard — Briefing page
 *
 * In demo mode, uses local mock data (no API calls).
 * In real mode, fetches from API using the active user_id.
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
import type { BriefingData, BriefingDossier, BriefingDossierEmail, PeriodStats } from "@/lib/mock-briefing";
import { mockBriefing, mockDossierEmails, mockConfig, getEmailsForPeriod } from "@/lib/mock-briefing";
import { isDemo } from "@/lib/auth";
import type { Email } from "@/hooks/useEmails";

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

type PeriodFilter = "24h" | "7j" | "30j";

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  "24h": "24 heures",
  "7j": "7 jours",
  "30j": "30 jours",
};

/** Lightweight email type for dossier lines — normalized from API fields */
interface DossierLineEmail {
  id: string;
  expediteur: string;
  objet: string;
  resume: string | null;
  created_at: string;
}

/** Normalize a briefing email (API shape) to DossierLineEmail */
function normalizeBriefEmail(raw: BriefingDossierEmail, index: number): DossierLineEmail {
  return {
    id: raw.id || `brief-email-${index}`,
    expediteur: raw.from_name || raw.expediteur || "",
    objet: raw.subject || raw.objet || "",
    resume: raw.summary || raw.resume || null,
    created_at: raw.date || raw.created_at || "",
  };
}

/** Get display name for a briefing dossier (API may use `name` or `nom`) */
function getDossierName(d: BriefingDossier): string {
  return d.name || d.nom || "";
}

/** Get display domain for a briefing dossier */
function getDossierDomain(d: BriefingDossier): string {
  return d.domain || d.domaine || "";
}

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
  // Cache of emails per dossier for inline display
  const [dossierEmailsMap, setDossierEmailsMap] = useState<Record<string, DossierLineEmail[]>>({});

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
    if (isDemo()) {
      setBriefing(mockBriefing);
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
    if (isDemo()) {
      setNomAvocat(mockConfig.nom_avocat);
    } else {
      apiGet<{ nom_avocat?: string }>("/api/config")
        .then((d) => { if (d?.nom_avocat) setNomAvocat(d.nom_avocat); })
        .catch(() => {});
    }
  }, [fetchBriefing]);

  // Build dossierEmailsMap from mock data (filtered by period) or API
  useEffect(() => {
    if (!briefing) return;
    const dossiers = briefing.content?.dossiers ?? [];

    if (isDemo()) {
      // In demo mode, filter emails by the selected period
      const periodEmails = getEmailsForPeriod(period);
      const newMap: Record<string, DossierLineEmail[]> = {};
      dossiers.forEach((d) => {
        const emails = periodEmails.filter((e) => e.dossier_id === d.dossier_id);
        if (emails.length > 0) {
          newMap[d.dossier_id] = emails.map((e, i) => normalizeBriefEmail({
            id: e.id,
            expediteur: e.expediteur,
            objet: e.objet,
            resume: e.resume,
            created_at: e.date,
          }, i));
        }
      });
      setDossierEmailsMap(newMap);
    } else {
      // Real mode: use inline emails or fetch from API
      dossiers.forEach((d) => {
        if (dossierEmailsMap[d.dossier_id]) return;
        const inlineEmails = d.emails || d.emails_recus || [];
        if (inlineEmails.length > 0) {
          const normalized = inlineEmails.map(normalizeBriefEmail);
          setDossierEmailsMap((prev) => ({ ...prev, [d.dossier_id]: normalized }));
        } else {
          apiGet<any[]>(`/api/emails?dossier_id=${d.dossier_id}`)
            .then((emails) => {
              const normalized = (emails || []).map((e: any, i: number) => normalizeBriefEmail(e, i));
              setDossierEmailsMap((prev) => ({ ...prev, [d.dossier_id]: normalized }));
            })
            .catch(() => {});
        }
      });
    }
  }, [briefing, period]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDossierClick = (d: BriefingDossier) => {
    setSelectedDossier(d);
    const cached = dossierEmailsMap[d.dossier_id];
    if (cached) {
      setPanelEmails(cached as any);
    } else if (isDemo()) {
      setPanelEmails((mockDossierEmails[d.dossier_id] || []) as any);
    } else {
      apiGet<DossierEmail[]>(`/api/emails?dossier_id=${d.dossier_id}`)
        .then((emails) => setPanelEmails(emails ?? []))
        .catch(() => setPanelEmails([]));
    }
  };

  /** Open panel with a specific email pre-selected */
  const handleEmailClick = (d: BriefingDossier, email: DossierLineEmail) => {
    setSelectedDossier(d);
    // Put the clicked email first so the panel shows it
    const cached = dossierEmailsMap[d.dossier_id] || [];
    const reordered = [email, ...cached.filter((e) => e.id !== email.id)] as any;
    setPanelEmails(reordered);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      if (isDemo()) {
        // Simulate a short delay for demo UX
        await new Promise((r) => setTimeout(r, 800));
        setBriefing(mockBriefing);
        setNotFound(false);
      } else {
        await apiPost("/api/briefs/generate");
      }
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

  const dossiers = briefing?.content?.dossiers ?? [];
  const attenteDossiers = (dossiers || []).filter((d) => d?.attente);
  const relancesCount = attenteDossiers.length;

  const periodKey = period === "24h" ? "last_24h" : period === "7j" ? "last_7d" : "last_30d";
  const activeDossierIds = briefing?.content?.emails_by_period?.[periodKey] ?? [];
  const activeDossiers = dossiers
    .filter((d) => {
      const inlineCount = (d.emails || d.emails_recus || []).length;
      return d.new_emails_count > 0 || inlineCount > 0;
    })
    .filter((d) => activeDossierIds.includes(d.dossier_id));

  const periodStats = briefing?.content?.stats?.[periodKey] as PeriodStats | undefined;
  const adjustedStats = periodStats ? {
    total: periodStats.total,
    dossier_emails: periodStats.dossier_emails,
    general_emails: periodStats.general_emails,
    attachments_count: periodStats.attachments_count,
    temps_gagne_minutes: Math.round(periodStats.total * 5),
  } : null;

  const periodLabel = period === "24h" ? "dans les dernières 24 heures" : period === "7j" ? "ces 7 derniers jours" : "ces 30 derniers jours";

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

        {/* ── Rapport Donna — 3 lignes distinctes ── */}
        {adjustedStats && (
          <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="rounded-xl bg-muted/50 px-5 py-4 mb-10">
            <div className="text-sm text-foreground/80 leading-relaxed space-y-1">
              <p>
                Vous avez reçu{" "}
                <a href="/fil?tab=emails" className="underline underline-offset-2 hover:text-foreground transition-colors">
                  <strong>{adjustedStats.total} emails</strong>
                </a>{" "}
                {periodLabel}.
              </p>
              <p>
                <strong>{adjustedStats.dossier_emails}</strong> liés à vos dossiers · <strong>{adjustedStats.general_emails}</strong> autres emails (newsletters, notifications…)
              </p>
              <p>
                <a href="/fil?tab=pj" className="underline underline-offset-2 hover:text-foreground transition-colors">
                  <strong>{adjustedStats.attachments_count} {adjustedStats.attachments_count === 1 ? "pièce jointe" : "pièces jointes"}</strong>
                </a>{" "}
                {adjustedStats.attachments_count === 1 ? "extraite" : "extraites"} ·{" "}
                <a href="/fil?tab=relances" className="underline underline-offset-2 hover:text-foreground transition-colors">
                  <strong>{relancesCount} {relancesCount === 1 ? "relance" : "relances"}</strong>
                </a>{" "}
                {relancesCount === 1 ? "détectée" : "détectées"}
              </p>
            </div>
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
                  dossierEmails={dossierEmailsMap[d.dossier_id] || []}
                  onClick={() => handleDossierClick(d)}
                  onEmailClick={(email) => handleEmailClick(d, email)}
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
                      <span className="font-medium">{getDossierName(d)}</span>
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

/* ── Single dossier line with clickable emails ── */

const MAX_STACKED_EMAILS = 5;

function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return format(d, "d MMM", { locale: fr });
  } catch { return ""; }
}

function DossierLine({
  dossier: d,
  dossierEmails,
  onClick,
  onEmailClick,
  onViewFull,
}: {
  dossier: BriefingDossier;
  dossierEmails: DossierLineEmail[];
  onClick: () => void;
  onEmailClick: (email: DossierLineEmail) => void;
  onViewFull: () => void;
}) {
  const hasEmails = dossierEmails.length > 0;
  const displayEmails = dossierEmails.slice(0, MAX_STACKED_EMAILS);
  const extraCount = dossierEmails.length - MAX_STACKED_EMAILS;

  // No fetched emails yet — show narrative fallback
  if (!hasEmails) {
    const narrativeText = d.emails_narrative || "";
    const narrative = narrativeText.length > 90 ? narrativeText.slice(0, 87) + "…" : narrativeText;

    return (
      <div
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors group"
      >
        <div className="flex-1 min-w-0 truncate">
          <span className="text-sm text-foreground">
            <span className="font-medium">{getDossierName(d)}</span>
            <span className="text-muted-foreground">{getDossierDomain(d) ? ` · ${getDossierDomain(d)}` : ""}</span>
            {narrative && (
              <>
                <span className="text-muted-foreground"> · </span>
                <span className="text-foreground/70">"{narrative}"</span>
              </>
            )}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  // Single email — compact
  if (dossierEmails.length === 1) {
    const email = dossierEmails[0];
    const resumeText = email.resume || email.objet || "";
    const shortResume = resumeText.length > 80 ? resumeText.slice(0, 77) + "…" : resumeText;

    return (
      <div className="rounded-lg hover:bg-muted/40 transition-colors">
        <div
          onClick={onClick}
          className="flex items-center gap-3 px-4 py-3 cursor-pointer group"
        >
          <div className="flex-1 min-w-0 truncate">
            <span className="text-sm text-foreground">
              <span className="font-medium">{getDossierName(d)}</span>
              <span className="text-muted-foreground">{getDossierDomain(d) ? ` · ${getDossierDomain(d)}` : ""}</span>
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="pl-8 pr-4 pb-3">
          <button
            onClick={(e) => { e.stopPropagation(); onEmailClick(email); }}
            className="text-xs text-muted-foreground leading-relaxed hover:text-foreground transition-colors cursor-pointer text-left"
          >
            <span className="text-foreground/50">→</span>{" "}
            <span className="text-foreground/70">"{shortResume}"</span>{" "}
            <span className="text-muted-foreground/60">({formatShortDate(email.created_at)})</span>
          </button>
        </div>
      </div>
    );
  }

  // Multiple emails — stacked with individually clickable rows
  return (
    <div className="rounded-lg hover:bg-muted/40 transition-colors">
      <div onClick={onClick} className="flex items-center gap-3 px-4 py-3 cursor-pointer group">
        <div className="flex-1 min-w-0">
          <span className="text-sm text-foreground">
            <span className="font-medium">{getDossierName(d)}</span>
            <span className="text-muted-foreground">{getDossierDomain(d) ? ` · ${getDossierDomain(d)}` : ""}</span>
          </span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{dossierEmails.length} emails</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="pl-8 pr-4 pb-3 space-y-1">
        {displayEmails.map((email) => {
          const resumeText = email.resume || email.objet || "";
          const shortResume = resumeText.length > 70 ? resumeText.slice(0, 67) + "…" : resumeText;
          return (
            <button
              key={email.id}
              onClick={(e) => { e.stopPropagation(); onEmailClick(email); }}
              className="block text-xs text-muted-foreground leading-relaxed hover:text-foreground transition-colors cursor-pointer text-left w-full"
            >
              <span className="text-foreground/50">→</span>{" "}
              <span className="text-foreground/70">"{shortResume}"</span>{" "}
              <span className="text-muted-foreground/60">({formatShortDate(email.created_at)})</span>
            </button>
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
