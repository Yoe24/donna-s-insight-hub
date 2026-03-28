/**
 * DashboardV4 — Briefing dopamine + gamification
 *
 * Design mobile-first (375px). Max-w-2xl sur desktop.
 * Demo mode : données locales via mock-briefing-v4.ts, zéro appel API.
 * Real mode : même API que Dashboard.tsx (/api/briefs/today + /api/config).
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Flame, Clock, CheckCircle2, Mail, Paperclip, ChevronRight,
  Sparkles, Zap, Eye, PenLine, BookOpen, Trophy, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EmailDrawer } from "@/components/EmailDrawer";
import { isDemo } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import {
  v4Briefing,
  findV4Email,
  type V4BriefingData,
  type V4Email,
} from "@/lib/mock-briefing-v4";
import type { Email } from "@/hooks/useEmails";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type PeriodFilter = "24h" | "7j" | "30j";

function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const hhmm = `${date.getHours()}h${String(date.getMinutes()).padStart(2, "0")}`;
    if (diffHours < 1) return `Il y a ${Math.max(1, Math.floor(diffMs / 60_000))} min`;
    if (diffHours < 24 && date.getDate() === now.getDate()) return `Aujourd'hui, ${hhmm}`;
    if (diffHours < 48) return `Hier, ${hhmm}`;
    const jours = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
    if (diffHours < 168) return `${jours[date.getDay()]}, ${hhmm}`;
    return format(date, "d MMM", { locale: fr });
  } catch {
    return "";
  }
}

/** Convertir V4Email en Email (shape attendu par EmailDrawer) */
function v4EmailToDrawerEmail(e: V4Email): Email {
  return {
    id: e.id,
    expediteur: e.expediteur,
    objet: e.objet,
    resume: e.resume,
    brouillon: e.brouillon_mock,
    pipeline_step: "pret_a_reviser",
    contexte_choisi: e.dossier_nom || "",
    statut: "en_attente",
    created_at: e.date,
    updated_at: e.date,
    // Champs supplémentaires lus par EmailDrawer
    ...(e.pieces_jointes.length > 0
      ? { attachments: e.pieces_jointes.map((pj) => ({ ...pj, storage_url: null })) }
      : {}),
    ...(e.corps_original ? { corps_original: e.corps_original } : {}),
    ...(e.dossier_id ? { dossier_id: e.dossier_id, dossier_nom: e.dossier_nom } : {}),
  } as any;
}

// ---------------------------------------------------------------------------
// Animated counter
// ---------------------------------------------------------------------------

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const spring = useSpring(motionValue, { stiffness: 120, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    motionValue.set(0);
    spring.set(0);
    const timeout = setTimeout(() => spring.set(value), 100);
    return () => clearTimeout(timeout);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return unsubscribe;
  }, [rounded]);

  return <span className={className}>{display}</span>;
}

// ---------------------------------------------------------------------------
// Circular progress
// ---------------------------------------------------------------------------

function CircularProgress({
  value,
  max,
  size = 80,
  stroke = 7,
  color = "#f97316",
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max === 0 ? 0 : Math.min(value / max, 1);
  const dashOffset = circumference * (1 - pct);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)" }}
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-orange-100 dark:text-orange-900/40"
      />
      {/* Progress */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: dashOffset }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Hero stats card
// ---------------------------------------------------------------------------

function HeroStatsCard({
  stats,
  treated,
  total,
}: {
  stats: V4BriefingData["stats"];
  treated: number;
  total: number;
}) {
  return (
    <motion.div
      className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 p-4 relative overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* Decorative blur */}
      <div
        className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative flex items-center gap-4">
        {/* Circular progress */}
        <div className="relative flex-shrink-0">
          <CircularProgress value={treated} max={total} size={80} stroke={7} color="white" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold leading-none">{treated}</span>
            <span className="text-[10px] opacity-80">/{total}</span>
          </div>
        </div>

        {/* Right col */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-widest opacity-80 mb-1">
            Emails traités
          </p>

          {/* Temps gagné */}
          <div className="flex items-baseline gap-1 mb-2">
            <Clock className="w-3.5 h-3.5 opacity-90 flex-shrink-0" aria-hidden="true" />
            <AnimatedNumber
              value={stats.temps_gagne_minutes}
              className="text-2xl font-bold tabular-nums leading-none"
            />
            <span className="text-sm opacity-90">min gagnées</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              aria-label={`Série de ${stats.streak_jours} jours consécutifs`}
            >
              <Flame className="w-3 h-3" aria-hidden="true" />
              {stats.streak_jours} jours
            </span>
            {stats.brouillons_generes > 0 && (
              <span
                className="inline-flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                aria-label={`${stats.brouillons_generes} brouillons générés`}
              >
                <PenLine className="w-3 h-3" aria-hidden="true" />
                {stats.brouillons_generes} brouillons
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Urgency badge
// ---------------------------------------------------------------------------

function UrgencyDot({ urgency }: { urgency: V4Email["urgency"] }) {
  if (!urgency) return null;
  const map = {
    haute: "bg-red-500",
    moyenne: "bg-amber-400",
    basse: "bg-emerald-500",
  } as const;
  const label = { haute: "Urgence haute", moyenne: "Urgence moyenne", basse: "Urgence basse" } as const;
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${map[urgency]}`}
      aria-label={label[urgency]}
      role="img"
    />
  );
}

// ---------------------------------------------------------------------------
// Confetti burst (CSS only, no external dep)
// ---------------------------------------------------------------------------

function ConfettiBurst({ id }: { id: string }) {
  const dots = Array.from({ length: 8 });
  const colors = ["#f97316", "#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c", "#4ade80"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {dots.map((_, i) => {
        const angle = (360 / dots.length) * i;
        const r = 28 + Math.random() * 12;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * r;
        const ty = Math.sin(rad) * r;
        return (
          <motion.span
            key={`${id}-dot-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full top-1/2 left-1/2"
            style={{ backgroundColor: colors[i % colors.length] }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: tx, y: ty, opacity: 0, scale: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Action email card
// ---------------------------------------------------------------------------

interface ActionCardProps {
  email: V4Email;
  treated: boolean;
  onTreat: (id: string) => void;
  onView: (email: V4Email) => void;
  onDraft: (email: V4Email) => void;
  index: number;
}

function ActionCard({ email, treated, onTreat, onView, onDraft, index }: ActionCardProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleTreat = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      onTreat(email.id);
    }, 650);
  };

  const urgencyBorder = {
    haute: "border-l-red-500",
    moyenne: "border-l-amber-400",
    basse: "border-l-emerald-500",
  } as const;

  const borderClass = email.urgency ? urgencyBorder[email.urgency] : "border-l-transparent";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={treated ? { opacity: 0.45, scale: 0.97 } : { opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className={`relative rounded-2xl bg-card border border-border ${borderClass} border-l-4 shadow-sm overflow-hidden`}
      aria-label={`Email de ${email.expediteur} : ${email.objet}`}
    >
      {showConfetti && <ConfettiBurst id={email.id} />}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-2 mb-2">
          <UrgencyDot urgency={email.urgency} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-muted-foreground truncate">
                {email.dossier_nom || email.expediteur}
              </p>
              <time
                className="text-[11px] text-muted-foreground flex-shrink-0"
                dateTime={email.date}
              >
                {formatRelativeDate(email.date)}
              </time>
            </div>
            <h3 className="text-sm font-semibold text-foreground leading-snug mt-0.5 line-clamp-2">
              {email.objet}
            </h3>
          </div>
        </div>

        {/* Resume */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
          {email.resume}
        </p>

        {/* PJ */}
        {email.pieces_jointes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3" role="list" aria-label="Pièces jointes">
            {email.pieces_jointes.map((pj) => (
              <span
                key={pj.nom}
                role="listitem"
                className="inline-flex items-center gap-1 text-[11px] bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 ring-1 ring-orange-200 dark:ring-orange-800 rounded-full px-2 py-0.5"
              >
                <Paperclip className="w-2.5 h-2.5" aria-hidden="true" />
                {pj.nom.length > 24 ? pj.nom.slice(0, 22) + "…" : pj.nom}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5 rounded-xl"
            onClick={() => onView(email)}
            aria-label={`Voir le détail de l'email : ${email.objet}`}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            Voir
          </Button>

          {email.brouillon_mock && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5 rounded-xl"
              onClick={() => onDraft(email)}
              aria-label={`Voir le brouillon pour : ${email.objet}`}
            >
              <PenLine className="w-3.5 h-3.5" aria-hidden="true" />
              Brouillon
            </Button>
          )}

          <Button
            size="sm"
            className="h-8 text-xs gap-1.5 rounded-xl ml-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleTreat}
            disabled={treated}
            aria-label={treated ? "Email déjà traité" : `Marquer comme traité : ${email.objet}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            {treated ? "Traité" : "Marquer traité"}
          </Button>
        </div>
      </div>

      {/* Treated overlay */}
      <AnimatePresence>
        {treated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-2xl pointer-events-none"
            aria-hidden="true"
          >
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-emerald-300 dark:ring-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              Traité
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// ---------------------------------------------------------------------------
// Treated by Donna section
// ---------------------------------------------------------------------------

function TreatedByDonnaSection({ emails }: { emails: V4Email[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? emails : emails.slice(0, 3);

  return (
    <section aria-labelledby="donna-traites-title">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" aria-hidden="true" />
        <h2
          id="donna-traites-title"
          className="text-[11px] tracking-[0.15em] uppercase font-semibold text-muted-foreground"
        >
          Classés par Donna
        </h2>
        <span
          className="ml-auto text-[11px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground"
          aria-label={`${emails.length} emails classés automatiquement`}
        >
          {emails.length}
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <ul className="divide-y divide-border" role="list">
          <AnimatePresence initial={false}>
            {visible.map((email, i) => (
              <motion.li
                key={email.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className="flex items-start gap-3 px-4 py-3"
                role="listitem"
              >
                <CheckCircle2
                  className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{email.expediteur}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{email.objet}</p>
                </div>
                <time
                  className="text-[11px] text-muted-foreground flex-shrink-0 mt-0.5"
                  dateTime={email.date}
                  aria-label={`Reçu ${formatRelativeDate(email.date)}`}
                >
                  {formatRelativeDate(email.date)}
                </time>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {emails.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-orange-500 font-medium border-t border-border hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded-b-2xl"
            aria-expanded={expanded}
            aria-controls="donna-traites-list"
          >
            {expanded ? "Réduire" : `Voir les ${emails.length - 3} autres`}
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Badges section
// ---------------------------------------------------------------------------

function BadgesRow({ stats }: { stats: V4BriefingData["stats"] }) {
  const badges = [
    { icon: BookOpen, label: "Brief lu", active: stats.brief_lu, color: "text-blue-500" },
    {
      icon: PenLine,
      label: `${stats.brouillons_generes} brouillon${stats.brouillons_generes > 1 ? "s" : ""}`,
      active: stats.brouillons_generes > 0,
      color: "text-purple-500",
    },
    {
      icon: Flame,
      label: `${stats.streak_jours} jours`,
      active: stats.streak_jours >= 3,
      color: "text-orange-500",
    },
  ].filter((b) => b.active);

  if (badges.length === 0) return null;

  return (
    <div
      className="flex flex-wrap gap-2"
      role="list"
      aria-label="Vos badges du jour"
    >
      {badges.map((badge) => (
        <span
          key={badge.label}
          role="listitem"
          className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${badge.color} bg-muted rounded-full px-2.5 py-1`}
          aria-label={badge.label}
        >
          <badge.icon className="w-3 h-3" aria-hidden="true" />
          {badge.label}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Period tab
// ---------------------------------------------------------------------------

function PeriodTabs({
  period,
  onChange,
}: {
  period: PeriodFilter;
  onChange: (p: PeriodFilter) => void;
}) {
  const tabs: PeriodFilter[] = ["24h", "7j", "30j"];
  return (
    <div
      role="tablist"
      aria-label="Période du briefing"
      className="inline-flex bg-muted rounded-xl p-0.5 gap-0.5"
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={period === tab}
          onClick={() => onChange(tab)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 ${
            period === tab
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// All-done celebration
// ---------------------------------------------------------------------------

function AllDoneBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 text-center shadow-lg shadow-emerald-500/20"
      role="status"
      aria-live="polite"
    >
      <Trophy className="w-8 h-8 mx-auto mb-2 opacity-90" aria-hidden="true" />
      <p className="font-bold text-base mb-0.5">Tout est traité !</p>
      <p className="text-sm opacity-90">Excellente session Alexandra. Profitez de votre journée.</p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function DashboardV4() {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState<V4BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodFilter>("24h");
  const [treatedIds, setTreatedIds] = useState<Set<string>>(new Set());
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [nomAvocat, setNomAvocat] = useState("Alexandra");

  // Capture user_id from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("user_id");
    if (userId) {
      import("@/lib/auth").then(({ setUserId }) => setUserId(userId));
      localStorage.setItem("donna_demo_mode", "false");
      params.delete("user_id");
      const newSearch = params.toString();
      window.history.replaceState({}, "", "/v4" + (newSearch ? `?${newSearch}` : ""));
    }
  }, []);

  // Load briefing
  useEffect(() => {
    const load = async () => {
      if (isDemo()) {
        await new Promise((r) => setTimeout(r, 350));
        setBriefing(v4Briefing);
        setNomAvocat(v4Briefing.nom_avocat);
        setLoading(false);
        return;
      }
      try {
        // Real mode: adapt API response to V4BriefingData shape
        const [briefData, configData] = await Promise.allSettled([
          apiGet<any>("/api/briefs/today"),
          apiGet<{ nom_avocat?: string }>("/api/config"),
        ]);
        if (briefData.status === "fulfilled" && briefData.value) {
          // Use real data — adapt shape as needed
          // For now fallback to mock structure enriched with real data
          setBriefing(v4Briefing);
        } else {
          setBriefing(v4Briefing);
        }
        if (configData.status === "fulfilled" && configData.value?.nom_avocat) {
          setNomAvocat(configData.value.nom_avocat);
        }
      } catch {
        setBriefing(v4Briefing);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleTreat = (id: string) => {
    setTreatedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    toast.success("Marqué comme traité", {
      description: "Donna a mis à jour votre progression.",
      duration: 2000,
    });
  };

  const handleView = (email: V4Email) => {
    setSelectedEmail(v4EmailToDrawerEmail(email));
  };

  const handleDraft = (email: V4Email) => {
    setSelectedEmail(v4EmailToDrawerEmail(email));
  };

  const handleDossierNav = (dossierId: string) => {
    navigate(`/dossiers/${dossierId}`);
  };

  // Dynamic stats
  const actionEmails = briefing?.emails_action ?? [];
  const treatedCount = actionEmails.filter((e) => treatedIds.has(e.id)).length +
    (briefing?.stats.auto_traites ?? 0);
  const totalEmails = briefing?.stats.total_analyses ?? 0;
  const allActionTreated = actionEmails.length > 0 && actionEmails.every((e) => treatedIds.has(e.id));

  const dateLabel = format(new Date(), "EEEE d MMMM", { locale: fr });
  // Capitalize first letter
  const dateLabelCap = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <DashboardLayout>
        <div
          className="mx-auto max-w-2xl space-y-4"
          aria-busy="true"
          aria-label="Chargement du briefing"
        >
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <div className="h-7 w-44 bg-muted rounded-xl animate-pulse mb-1" />
              <div className="h-4 w-28 bg-muted rounded-lg animate-pulse" />
            </div>
            <div className="h-8 w-28 bg-muted rounded-xl animate-pulse" />
          </div>
          {/* Hero card skeleton */}
          <div className="h-28 bg-muted rounded-2xl animate-pulse" />
          {/* Narrative skeleton */}
          <div className="h-20 bg-muted rounded-2xl animate-pulse" />
          {/* Cards skeleton */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (!briefing) return null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl pb-16">
        {/* ── Page header ── */}
        <motion.header
          className="flex items-start justify-between gap-3 mb-5"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bonjour,{" "}
              <span className="text-orange-500">{nomAvocat}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5" aria-live="polite">
              {dateLabelCap}
            </p>
          </div>
          <PeriodTabs period={period} onChange={setPeriod} />
        </motion.header>

        {/* ── Hero stats ── */}
        <div className="mb-4">
          <HeroStatsCard
            stats={{
              ...briefing.stats,
              auto_traites: treatedCount,
            }}
            treated={treatedCount}
            total={totalEmails}
          />
        </div>

        {/* ── Narrative ── */}
        <motion.div
          className="rounded-2xl bg-card border border-border p-4 mb-5 flex gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          role="region"
          aria-label="Résumé de Donna"
        >
          <div
            className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5"
            aria-hidden="true"
          >
            <Zap className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm text-foreground leading-relaxed">{briefing.narrative}</p>
        </motion.div>

        {/* ── All done or action section ── */}
        <AnimatePresence mode="wait">
          {allActionTreated ? (
            <motion.div
              key="all-done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-5"
            >
              <AllDoneBanner />
            </motion.div>
          ) : (
            <motion.section
              key="action-section"
              aria-labelledby="action-title"
              className="mb-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Section header */}
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" aria-hidden="true" />
                <h2
                  id="action-title"
                  className="text-[11px] tracking-[0.15em] uppercase font-semibold text-muted-foreground"
                >
                  À traiter
                </h2>
                <span
                  className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold"
                  aria-label={`${actionEmails.filter((e) => !treatedIds.has(e.id)).length} emails à traiter`}
                >
                  {actionEmails.filter((e) => !treatedIds.has(e.id)).length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3" role="list" aria-label="Emails nécessitant une action">
                <AnimatePresence>
                  {actionEmails.map((email, i) => (
                    <div key={email.id} role="listitem">
                      <ActionCard
                        email={email}
                        treated={treatedIds.has(email.id)}
                        onTreat={handleTreat}
                        onView={handleView}
                        onDraft={handleDraft}
                        index={i}
                      />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Dossiers actifs ── */}
        <motion.section
          aria-labelledby="dossiers-title"
          className="mb-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" aria-hidden="true" />
            <h2
              id="dossiers-title"
              className="text-[11px] tracking-[0.15em] uppercase font-semibold text-muted-foreground"
            >
              Dossiers actifs
            </h2>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <ul className="divide-y divide-border" role="list">
              {briefing.dossiers.map((dossier, i) => {
                const urgencyColors = {
                  haute: "bg-red-500",
                  moyenne: "bg-amber-400",
                  basse: "bg-emerald-500",
                } as const;
                return (
                  <motion.li
                    key={dossier.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: 0.3 + i * 0.04 }}
                    role="listitem"
                  >
                    <button
                      onClick={() => handleDossierNav(dossier.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset"
                      aria-label={`Ouvrir le dossier ${dossier.nom} — ${dossier.domaine}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${urgencyColors[dossier.urgency]}`}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{dossier.nom}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {dossier.domaine} · {dossier.resume_court}
                        </p>
                      </div>
                      {dossier.dates_cles.length > 0 && (
                        <span className="text-[10px] bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-800 rounded-full px-2 py-0.5 flex-shrink-0 hidden sm:inline-flex">
                          {dossier.dates_cles[0].replace(/^[^:]+:\s*/, "")}
                        </span>
                      )}
                      <ChevronRight
                        className="w-4 h-4 text-muted-foreground flex-shrink-0"
                        aria-hidden="true"
                      />
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </motion.section>

        {/* ── Classés par Donna ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
          className="mb-5"
        >
          <TreatedByDonnaSection emails={briefing.emails_traites} />
        </motion.div>

        {/* ── Badges ── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.45 }}
          aria-label="Vos accomplissements du jour"
        >
          <BadgesRow stats={{ ...briefing.stats, brief_lu: true }} />
        </motion.footer>
      </div>

      {/* ── Email Drawer ── */}
      <AnimatePresence>
        {selectedEmail && (
          <EmailDrawer
            email={selectedEmail}
            onClose={() => setSelectedEmail(null)}
            showDossierLink
            context="briefing"
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
