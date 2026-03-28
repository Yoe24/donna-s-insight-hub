/**
 * Dashboard V2 — Briefing page
 * Style : cartes visuelles Notion, mobile-first.
 * En mode démo : données mock locales (mock-briefing-v2.ts), zéro appel API.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Loader2,
  RefreshCw,
  Paperclip,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Clock,
  Mail,
  FileCheck,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiGet, apiPost } from "@/lib/api";
import { isDemo } from "@/lib/auth";
import { EmailDrawer } from "@/components/EmailDrawer";
import { GuidedTour } from "@/components/GuidedTour";
import { isTourCompleted } from "@/lib/tour-state";
import type { Email } from "@/hooks/useEmails";

// V2 mocks
import {
  mockBriefingV2,
  v2EmailToDrawerEmail,
  type V2Email,
  type V2Dossier,
  type V2FilteredEmail,
  type V2UrgencyLevel,
} from "@/lib/mock-briefing-v2";

// Legacy mock imports for real-mode API fallback shape compatibility
import { mockConfig } from "@/lib/mock-briefing";

// ---------------------------------------------------------------------------
// Types (real-mode API shapes, simplified)
// ---------------------------------------------------------------------------

interface ApiBriefingDossier {
  dossier_id: string;
  nom?: string;
  name?: string;
  domaine?: string;
  domain?: string;
  needs_immediate_attention: boolean;
  new_emails_count: number;
  summary: string;
  emails_narrative: string;
  pieces_narrative: string | null;
  dates_cles: string[];
  deadline_days: number | null;
  emails?: { id: string; expediteur?: string; objet?: string; resume?: string | null; created_at?: string }[];
}

interface ApiBriefingData {
  content: {
    executive_summary: string;
    stats: {
      emails_analyzed: number;
      emails_dossiers: number;
      emails_generaux: number;
      temps_gagne_minutes: number;
      pieces_extraites: number;
    };
    dossiers: ApiBriefingDossier[];
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type PeriodFilter = "24h" | "7j" | "30j";

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  "24h": "24 heures",
  "7j": "7 jours",
  "30j": "30 jours",
};

const URGENCY_COLORS: Record<V2UrgencyLevel, string> = {
  urgent: "bg-red-500",
  a_traiter: "bg-amber-400",
  traite: "bg-emerald-500",
};

const URGENCY_LABELS: Record<V2UrgencyLevel, string> = {
  urgent: "Urgent",
  a_traiter: "À traiter",
  traite: "Traité",
};

const URGENCY_BADGE: Record<
  V2UrgencyLevel,
  { bg: string; text: string; ring: string }
> = {
  urgent: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" },
  a_traiter: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
  },
  traite: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
  },
};

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

// ---------------------------------------------------------------------------
// Helper: format relative date
// ---------------------------------------------------------------------------

function formatMailDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const hhmm = `${date.getHours()}h${String(date.getMinutes()).padStart(2, "0")}`;
    if (diffHours < 1)
      return `il y a ${Math.max(1, Math.floor(diffMs / 60000))} min`;
    if (diffHours < 24 && date.getDate() === now.getDate())
      return `aujourd'hui ${hhmm}`;
    if (diffDays < 2) return `hier ${hhmm}`;
    const jours = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
    if (diffDays < 7) return `${jours[date.getDay()]} ${hhmm}`;
    return format(date, "d MMM", { locale: fr });
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// Sub-component: DossierCard V2
// ---------------------------------------------------------------------------

interface DossierCardProps {
  dossier: V2Dossier;
  onEmailClick: (email: V2Email) => void;
  onViewDossier: () => void;
}

function DossierCard({ dossier, onEmailClick, onViewDossier }: DossierCardProps) {
  const ub = URGENCY_BADGE[dossier.urgency];
  const urgencyColor = URGENCY_COLORS[dossier.urgency];

  // Emails to show inline (max 2 on mobile, all on wider)
  const emailsToShow = dossier.emails.slice(0, 3);

  return (
    <article
      className="relative flex rounded-2xl bg-card shadow-sm border border-border/60 overflow-hidden transition-shadow hover:shadow-md"
      aria-label={`Dossier ${dossier.nom}`}
    >
      {/* Urgency strip on the left */}
      <div
        className={`w-1.5 shrink-0 ${urgencyColor}`}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0 p-4 sm:p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${ub.bg} ${ub.text} ${ub.ring} uppercase tracking-wide`}
              >
                {URGENCY_LABELS[dossier.urgency]}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0 h-5 font-normal text-muted-foreground"
              >
                {dossier.domaine}
              </Badge>
            </div>
            <h3 className="mt-1.5 text-base font-semibold text-foreground leading-tight">
              {dossier.nom}
            </h3>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDossier}
            className="shrink-0 h-8 text-xs text-muted-foreground hover:text-primary gap-1 -mr-1 mt-0.5"
            aria-label={`Voir le dossier ${dossier.nom}`}
          >
            Dossier
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>

        {/* Donna summary */}
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          {dossier.summary}
        </p>

        {/* Key dates */}
        {dossier.dates_cles.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" aria-hidden="true" />
            {dossier.dates_cles.map((d, i) => (
              <span
                key={i}
                className="text-xs text-amber-700 dark:text-amber-400 font-medium"
              >
                {d}
                {i < dossier.dates_cles.length - 1 ? " · " : ""}
              </span>
            ))}
          </div>
        )}

        <Separator className="my-3" />

        {/* Email list */}
        <div
          className="space-y-2"
          role="list"
          aria-label={`Emails du dossier ${dossier.nom}`}
        >
          {emailsToShow.map((email) => (
            <EmailRow
              key={email.id}
              email={email}
              onClick={() => onEmailClick(email)}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: EmailRow inside a DossierCard
// ---------------------------------------------------------------------------

interface EmailRowProps {
  email: V2Email;
  onClick: () => void;
}

function EmailRow({ email, onClick }: EmailRowProps) {
  return (
    <div
      role="listitem"
      className="group rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer p-3"
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      tabIndex={0}
      aria-label={`Email : ${email.objet}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Sender + date */}
          <div className="flex items-baseline gap-2 justify-between">
            <span className="text-xs font-semibold text-foreground truncate">
              {email.expediteur}
            </span>
            <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
              {formatMailDate(email.date)}
            </span>
          </div>

          {/* Subject */}
          <p className="text-xs text-foreground/80 mt-0.5 truncate font-medium">
            {email.objet}
          </p>

          {/* Donna summary — always visible */}
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
            {email.resume}
          </p>

          {/* Attachments */}
          {email.pieces_jointes.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {email.pieces_jointes.map((pj, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-background rounded-md px-1.5 py-0.5 border border-border/50"
                >
                  <Paperclip className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                  <span className="truncate max-w-[140px]">{pj.nom}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div
        className="flex items-center gap-2 mt-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs px-3 gap-1"
          onClick={onClick}
          aria-label={`Voir l'email : ${email.objet}`}
        >
          <Mail className="h-3 w-3" aria-hidden="true" />
          Voir
        </Button>
        {email.brouillon_mock && (
          <Button
            size="sm"
            variant="default"
            className="h-7 text-xs px-3 gap-1 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white"
            onClick={onClick}
            aria-label={`Brouillon prêt pour : ${email.objet}`}
          >
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Brouillon prêt
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Donna narrative card
// ---------------------------------------------------------------------------

interface NarrativeCardProps {
  text: string;
  stats: {
    total_emails: number;
    emails_dossiers: number;
    emails_filtres: number;
    pieces_jointes: number;
    temps_gagne_minutes: number;
  };
}

function NarrativeCard({ text, stats }: NarrativeCardProps) {
  return (
    <div className="rounded-2xl border border-[#1e3a5f]/20 bg-[#1e3a5f]/5 dark:bg-[#1e3a5f]/10 p-4 sm:p-5">
      {/* Donna header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-full bg-[#1e3a5f] flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-[#c9a84c]" aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold text-[#1e3a5f] dark:text-foreground">
          Donna
        </span>
      </div>

      {/* Narrative text */}
      <p className="text-sm text-foreground leading-relaxed">{text}</p>

      {/* Stats pills */}
      <div
        className="flex flex-wrap gap-2 mt-4"
        role="list"
        aria-label="Statistiques du briefing"
      >
        <StatPill
          icon={<Mail className="h-3 w-3" />}
          label={`${stats.total_emails} emails`}
        />
        <StatPill
          icon={<FileCheck className="h-3 w-3" />}
          label={`${stats.emails_dossiers} classés`}
        />
        <StatPill
          icon={<Filter className="h-3 w-3" />}
          label={`${stats.emails_filtres} filtrés`}
        />
        {stats.pieces_jointes > 0 && (
          <StatPill
            icon={<Paperclip className="h-3 w-3" />}
            label={`${stats.pieces_jointes} pièce${stats.pieces_jointes > 1 ? "s" : ""} jointe${stats.pieces_jointes > 1 ? "s" : ""}`}
          />
        )}
        <StatPill
          icon={<Clock className="h-3 w-3 text-[#c9a84c]" />}
          label={`${stats.temps_gagne_minutes} min gagnées`}
          highlight
        />
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      role="listitem"
      className={`inline-flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 ${
        highlight
          ? "bg-[#c9a84c]/10 text-[#c9a84c] font-medium ring-1 ring-[#c9a84c]/30"
          : "bg-background/80 text-muted-foreground border border-border/50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Filtered emails section (collapsed by default)
// ---------------------------------------------------------------------------

interface FilteredEmailsSectionProps {
  emails: V2FilteredEmail[];
}

function FilteredEmailsSection({ emails }: FilteredEmailsSectionProps) {
  const [open, setOpen] = useState(false);

  const reasonLabel: Record<V2FilteredEmail["reason"], string> = {
    newsletter: "Newsletter",
    spam: "Publicité",
    notification: "Notification",
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className="flex items-center gap-2 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        aria-label={`Traités par Donna, ${emails.length} emails`}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Traités par Donna
        </span>
        <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 font-medium">
          {emails.length}
        </span>
        {open ? (
          <ChevronDown
            className="h-3.5 w-3.5 text-muted-foreground ml-auto"
            aria-hidden="true"
          />
        ) : (
          <ChevronRight
            className="h-3.5 w-3.5 text-muted-foreground ml-auto"
            aria-hidden="true"
          />
        )}
      </CollapsibleTrigger>

      <CollapsibleContent>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-2"
            >
              <div
                className="rounded-2xl border border-border/50 bg-card divide-y divide-border/30"
                role="list"
                aria-label="Emails filtrés par Donna"
              >
                {emails.map((e) => (
                  <div
                    key={e.id}
                    role="listitem"
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-medium text-foreground truncate">
                          {e.expediteur}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatMailDate(e.date)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {e.objet}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">
                        {e.resume}
                      </p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-500 ring-1 ring-gray-200 dark:ring-gray-700 shrink-0">
                      {reasonLabel[e.reason]}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard component
// ---------------------------------------------------------------------------

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [nomAvocat, setNomAvocat] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("24h");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showTour, setShowTour] = useState(false);

  // Real-mode API data
  const [apiDossiers, setApiDossiers] = useState<ApiBriefingDossier[]>([]);
  const [apiNarrative, setApiNarrative] = useState("");
  const [apiStats, setApiStats] = useState<ApiBriefingData["content"]["stats"] | null>(null);

  // Handle user_id param (real mode)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("user_id");
    if (userId) {
      import("@/lib/auth").then(({ setUserId }) => setUserId(userId));
      localStorage.setItem("donna_demo_mode", "false");
      params.delete("user_id");
      const newSearch = params.toString();
      window.history.replaceState(
        {},
        "",
        "/dashboard" + (newSearch ? `?${newSearch}` : "")
      );
    }
  }, []);

  const fetchBriefing = useCallback(async () => {
    if (isDemo()) {
      await new Promise((r) => setTimeout(r, 350));
      setLoading(false);
      setNotFound(false);
      return;
    }
    try {
      const data = await apiGet<ApiBriefingData>("/api/briefs/today");
      if (data?.content?.dossiers) {
        setApiDossiers(data.content.dossiers);
        setApiNarrative(data.content.executive_summary ?? "");
        setApiStats(data.content.stats ?? null);
      }
      setNotFound(false);
    } catch (e: any) {
      if (e?.message?.includes("404")) setNotFound(true);
      else {
        console.error(e);
        toast.error("Impossible de charger le briefing");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBriefing().then(() => {
      if (isDemo() && !isTourCompleted()) {
        setTimeout(() => setShowTour(true), 800);
      }
    });
    if (isDemo()) {
      setNomAvocat(mockConfig.nom_avocat);
    } else {
      apiGet<{ nom_avocat?: string }>("/api/config")
        .then((d) => {
          if (d?.nom_avocat) setNomAvocat(d.nom_avocat);
        })
        .catch(() => {});
    }
  }, [fetchBriefing]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      if (!isDemo()) {
        await apiPost("/api/briefs/generate");
      }
      toast.success("Briefing généré");
      setLoading(true);
      setNotFound(false);
      await fetchBriefing();
    } catch {
      toast.error("Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  /** Open EmailDrawer from a V2Email */
  const handleEmailClick = (email: V2Email, dossier: V2Dossier) => {
    if (isDemo()) {
      setSelectedEmail(
        v2EmailToDrawerEmail(email, dossier.nom, dossier.domaine) as any
      );
    }
  };

  // Greeting
  const now = new Date();
  const h = now.getHours();
  const greeting = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = format(now, "EEEE d MMMM", { locale: fr });

  // Demo data
  const demoDossiers = mockBriefingV2.dossiers;
  const demoNarrative = mockBriefingV2.narrative;
  const demoStats = mockBriefingV2.stats;
  const demoFiltered = mockBriefingV2.filtered_emails;

  // Filter demo dossiers by period (simulate less data for 24h)
  const filteredDemoDossiers = isDemo()
    ? period === "24h"
      ? demoDossiers.filter((d) => d.urgency === "urgent" || d.deadline_days !== null && d.deadline_days <= 7)
      : period === "7j"
      ? demoDossiers.filter((d) => d.urgency !== "traite")
      : demoDossiers
    : [];

  // Urgency ordering: urgent first, then a_traiter
  const sortedDossiers = [...filteredDemoDossiers].sort((a, b) => {
    const order: Record<V2UrgencyLevel, number> = {
      urgent: 0,
      a_traiter: 1,
      traite: 2,
    };
    return order[a.urgency] - order[b.urgency];
  });

  const urgentCount = sortedDossiers.filter((d) => d.urgency === "urgent").length;
  const aTraiterCount = sortedDossiers.filter((d) => d.urgency === "a_traiter").length;
  const pendingCount = urgentCount + aTraiterCount;

  // ---------------------------------------------------------------------------
  // Render states
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4 pt-8 space-y-4" aria-label="Chargement du briefing">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-28 rounded-2xl mt-6" />
          <Skeleton className="h-4 w-24 mt-8" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (notFound || (!isDemo() && apiDossiers.length === 0 && !loading)) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4 text-center py-24">
          <Loader2
            className={`h-7 w-7 mx-auto mb-4 text-muted-foreground ${generating ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          <p className="text-lg font-serif text-foreground mb-1">
            Donna prépare votre briefing…
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Votre résumé sera prêt dans quelques instants.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            variant="outline"
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            )}
            Générer le briefing
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <DashboardLayout>
      <div
        className="max-w-2xl mx-auto px-4 pb-24"
        data-tour="briefing"
      >
        {/* ── Header ── */}
        <motion.div {...fadeIn} className="pt-8 pb-4">
          <p className="text-2xl font-serif font-semibold text-foreground">
            {greeting}
            {nomAvocat ? ` ${nomAvocat}` : ""}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">
            {dateStr}
          </p>
        </motion.div>

        {/* ── Period filter ── */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.05 }}
          className="flex gap-1.5 mb-5"
          role="group"
          aria-label="Filtrer par période"
        >
          {(["24h", "7j", "30j"] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                period === p
                  ? "bg-[#1e3a5f] text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </motion.div>

        {/* ── Donna narrative card ── */}
        <motion.div {...fadeIn} transition={{ delay: 0.08 }} className="mb-6">
          <NarrativeCard
            text={isDemo() ? demoNarrative : apiNarrative}
            stats={
              isDemo()
                ? demoStats
                : {
                    total_emails: apiStats?.emails_analyzed ?? 0,
                    emails_dossiers: apiStats?.emails_dossiers ?? 0,
                    emails_filtres: apiStats?.emails_generaux ?? 0,
                    pieces_jointes: apiStats?.pieces_extraites ?? 0,
                    temps_gagne_minutes: apiStats?.temps_gagne_minutes ?? 0,
                  }
            }
          />
        </motion.div>

        {/* ── Section header ── */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-3"
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            À traiter
          </h2>
          {pendingCount > 0 && (
            <Badge
              variant="outline"
              className="h-5 text-[10px] px-1.5 bg-red-50 text-red-700 border-red-200 font-semibold"
            >
              {pendingCount}
            </Badge>
          )}
        </motion.div>

        {/* ── Dossier cards ── */}
        {isDemo() ? (
          sortedDossiers.length === 0 ? (
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.12 }}
              className="rounded-2xl border border-border/50 bg-muted/20 py-12 text-center mb-6"
            >
              <p className="text-sm text-muted-foreground">
                Aucune activité dans les {PERIOD_LABELS[period].startsWith("24") ? "dernières " : "derniers "}{PERIOD_LABELS[period]}.
              </p>
            </motion.div>
          ) : (
            <div
              className="space-y-4 mb-8"
              role="list"
              aria-label="Dossiers à traiter"
            >
              {sortedDossiers.map((dossier, i) => (
                <motion.div
                  key={dossier.id}
                  role="listitem"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                >
                  <DossierCard
                    dossier={dossier}
                    onEmailClick={(email) => handleEmailClick(email, dossier)}
                    onViewDossier={() => navigate(`/dossiers/${dossier.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          )
        ) : (
          /* Real mode: display API dossiers (simplified) */
          <div className="space-y-4 mb-8" role="list" aria-label="Dossiers à traiter">
            {apiDossiers
              .filter((d) => d.needs_immediate_attention || (d.deadline_days ?? 999) <= 7)
              .map((d, i) => (
                <motion.div
                  key={d.dossier_id}
                  role="listitem"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="relative flex rounded-2xl bg-card shadow-sm border border-border/60 overflow-hidden"
                >
                  <div
                    className={`w-1.5 shrink-0 ${d.needs_immediate_attention ? "bg-red-500" : "bg-amber-400"}`}
                  />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 uppercase tracking-wide ${
                            d.needs_immediate_attention
                              ? "bg-red-50 text-red-700 ring-red-200"
                              : "bg-amber-50 text-amber-700 ring-amber-200"
                          }`}
                        >
                          {d.needs_immediate_attention ? "Urgent" : "À traiter"}
                        </span>
                        <h3 className="mt-1.5 text-base font-semibold text-foreground">
                          {d.nom ?? d.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {d.domaine ?? d.domain}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/dossiers/${d.dossier_id}`)}
                        className="shrink-0 h-8 text-xs text-muted-foreground hover:text-primary gap-1"
                      >
                        Dossier
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {d.summary}
                    </p>
                    {d.dates_cles.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs text-amber-700 font-medium">
                          {d.dates_cles[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        )}

        {/* ── Filtered emails (collapsed) ── */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="mt-2">
          {isDemo() ? (
            <FilteredEmailsSection emails={demoFiltered} />
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              {apiStats?.emails_generaux ?? 0} emails filtrés par Donna (newsletters, notifications)
            </p>
          )}
        </motion.div>

        {/* ── Footer ── */}
        {isDemo() && demoStats.temps_gagne_minutes > 0 && (
          <motion.p
            {...fadeIn}
            transition={{ delay: 0.25 }}
            className="text-xs text-muted-foreground text-center py-8"
            aria-label={`Temps économisé : environ ${demoStats.temps_gagne_minutes} minutes`}
          >
            Donna vous a fait économiser ~{demoStats.temps_gagne_minutes} min, soit environ{" "}
            {Math.round((demoStats.temps_gagne_minutes / 60) * 350)} € à 350 €/h.
          </motion.p>
        )}
      </div>

      {/* ── EmailDrawer ── */}
      <AnimatePresence>
        {selectedEmail && (
          <EmailDrawer
            email={selectedEmail}
            onClose={() => setSelectedEmail(null)}
          />
        )}
      </AnimatePresence>

      {showTour && <GuidedTour onComplete={() => setShowTour(false)} />}
    </DashboardLayout>
  );
};

export default Dashboard;
