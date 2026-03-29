/**
 * DashboardV6 — Gamification V4 + design premium Harvey AI
 *
 * Pallete Harvey : blanc pur, grille #E5E5E5, texte #1A1A1A, accent orange #F97316
 * Pas de gradient, pas d'ombres lourdes, beaucoup d'espace blanc.
 * Design mobile-first (375px). Max-w-xl sur desktop.
 * Demo mode : données locales via mock-briefing-v4.ts, zéro appel API.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useSpring,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Flame,
  Clock,
  CheckCircle2,
  Mail,
  Paperclip,
  ChevronRight,
  Eye,
  PenLine,
  BookOpen,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EmailDrawer } from "@/components/EmailDrawer";
import { isDemo, getUserId } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import {
  v4Briefing,
  type V4BriefingData,
  type V4Email,
  type V4Dossier,
} from "@/lib/mock-briefing-v4";
import type { Email } from "@/hooks/useEmails";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PeriodFilter = "24h" | "7j" | "30j";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const hhmm = `${date.getHours()}h${String(date.getMinutes()).padStart(2, "0")}`;
    if (diffHours < 1) return `${Math.max(1, Math.floor(diffMs / 60_000))} min`;
    if (diffHours < 24 && date.getDate() === now.getDate())
      return `Aujourd'hui, ${hhmm}`;
    if (diffHours < 48) return `Hier, ${hhmm}`;
    const jours = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
    if (diffHours < 168) return `${jours[date.getDay()]}, ${hhmm}`;
    return format(date, "d MMM", { locale: fr });
  } catch {
    return "";
  }
}

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
    ...(e.pieces_jointes.length > 0
      ? {
          attachments: e.pieces_jointes.map((pj) => ({
            ...pj,
            storage_url: null,
          })),
        }
      : {}),
    ...(e.corps_original ? { corps_original: e.corps_original } : {}),
    ...(e.dossier_id
      ? { dossier_id: e.dossier_id, dossier_nom: e.dossier_nom }
      : {}),
  } as any;
}

// ---------------------------------------------------------------------------
// AnimatedNumber — compteur animé sobre
// ---------------------------------------------------------------------------

function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const spring = useSpring(motionValue, { stiffness: 100, damping: 22 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    motionValue.set(0);
    spring.set(0);
    const timeout = setTimeout(() => spring.set(value), 120);
    return () => clearTimeout(timeout);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return unsubscribe;
  }, [rounded]);

  return <span className={className}>{display}</span>;
}

// ---------------------------------------------------------------------------
// CircularProgress Harvey style — trait fin, noir sur gris clair
// ---------------------------------------------------------------------------

function CircularProgress({
  value,
  max,
  size = 72,
  stroke = 5,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max === 0 ? 0 : Math.min(value / max, 1);
  const dashOffset = circumference * (1 - pct);
  const complete = value >= max && max > 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)" }}
      aria-hidden="true"
    >
      {/* Track gris clair */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E5E5E5"
        strokeWidth={stroke}
      />
      {/* Progress — noir ou orange si complet */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={complete ? "#F97316" : "#1A1A1A"}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: dashOffset }}
        transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// HeroStatsCard — style Harvey : blanc, bordure fine, accent orange discret
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
      className="rounded-xl bg-white border border-[#E5E5E5] p-5 dark:bg-zinc-900 dark:border-zinc-700"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center gap-5">
        {/* Cercle de progression */}
        <div className="relative flex-shrink-0" aria-hidden="true">
          <CircularProgress value={treated} max={total} size={72} stroke={5} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold text-[#1A1A1A] leading-none dark:text-white tabular-nums">
              {treated}
            </span>
            <span className="text-[10px] text-[#6B7280] leading-none mt-0.5">
              /{total}
            </span>
          </div>
        </div>

        {/* Métriques */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Temps gagné */}
          <div>
            <p
              className="text-[10px] tracking-[0.12em] uppercase text-[#6B7280] mb-0.5"
              aria-label="Temps économisé aujourd'hui"
            >
              Temps économisé
            </p>
            <div className="flex items-baseline gap-1.5">
              <AnimatedNumber
                value={stats.temps_gagne_minutes}
                className="text-2xl font-semibold text-[#1A1A1A] tabular-nums leading-none dark:text-white"
              />
              <span className="text-sm text-[#6B7280]">min</span>
            </div>
          </div>

          {/* Métadonnées en ligne */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Emails traités */}
            <span
              className="inline-flex items-center gap-1 text-[11px] text-[#6B7280]"
              aria-label={`${treated} emails traités sur ${total}`}
            >
              <Mail className="w-3 h-3" aria-hidden="true" />
              {treated}/{total} traités
            </span>

            {/* Streak */}
            {stats.streak_jours >= 2 && (
              <span
                className="inline-flex items-center gap-1 text-[11px] text-[#F97316] font-medium"
                aria-label={`Série de ${stats.streak_jours} jours`}
              >
                <Flame className="w-3 h-3" aria-hidden="true" />
                {stats.streak_jours} jours
              </span>
            )}

            {/* Brouillons */}
            {stats.brouillons_generes > 0 && (
              <span
                className="inline-flex items-center gap-1 text-[11px] text-[#6B7280]"
                aria-label={`${stats.brouillons_generes} brouillons`}
              >
                <PenLine className="w-3 h-3" aria-hidden="true" />
                {stats.brouillons_generes} brouillon
                {stats.brouillons_generes > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// UrgencyDot — point coloré discret (6px)
// ---------------------------------------------------------------------------

function UrgencyDot({ urgency }: { urgency: V4Email["urgency"] }) {
  if (!urgency) return null;
  const map = {
    haute: "bg-red-500",
    moyenne: "bg-amber-400",
    basse: "bg-[#D1D5DB]",
  } as const;
  const label = {
    haute: "Urgence haute",
    moyenne: "Urgence moyenne",
    basse: "Urgence basse",
  } as const;
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[5px] ${map[urgency]}`}
      aria-label={label[urgency]}
      role="img"
    />
  );
}

// ---------------------------------------------------------------------------
// ActionCard — style Harvey : blanc, bordure fine, sans couleur latérale
// ---------------------------------------------------------------------------

interface ActionCardProps {
  email: V4Email;
  treated: boolean;
  onTreat: (id: string) => void;
  onView: (email: V4Email) => void;
  onDraft: (email: V4Email) => void;
  index: number;
}

function ActionCard({
  email,
  treated,
  onTreat,
  onView,
  onDraft,
  index,
}: ActionCardProps) {
  const [showCheck, setShowCheck] = useState(false);

  const handleTreat = () => {
    setShowCheck(true);
    setTimeout(() => {
      setShowCheck(false);
      onTreat(email.id);
    }, 500);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={
        treated ? { opacity: 0.4, scale: 0.985 } : { opacity: 1, y: 0, scale: 1 }
      }
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      className="relative rounded-xl bg-white border border-[#E5E5E5] overflow-hidden dark:bg-zinc-900 dark:border-zinc-700"
      aria-label={`Email de ${email.expediteur} : ${email.objet}`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-2 mb-2.5">
          <UrgencyDot urgency={email.urgency} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] text-[#6B7280] leading-tight truncate">
                {email.dossier_nom
                  ? `${email.dossier_nom} · ${email.expediteur}`
                  : email.expediteur}
              </p>
              <time
                className="text-[11px] text-[#6B7280] flex-shrink-0 whitespace-nowrap"
                dateTime={email.date}
              >
                {formatRelativeDate(email.date)}
              </time>
            </div>
            <h3 className="text-sm font-medium text-[#1A1A1A] leading-snug mt-0.5 line-clamp-2 dark:text-white">
              {email.objet}
            </h3>
          </div>
        </div>

        {/* Résumé */}
        <p className="text-[13px] text-[#6B7280] leading-relaxed line-clamp-3 mb-3.5">
          {email.resume}
        </p>

        {/* PJ — pills sobre */}
        {email.pieces_jointes.length > 0 && (
          <div
            className="flex flex-wrap gap-1.5 mb-3.5"
            role="list"
            aria-label="Pièces jointes"
          >
            {email.pieces_jointes.map((pj) => (
              <span
                key={pj.nom}
                role="listitem"
                className="inline-flex items-center gap-1 text-[11px] text-[#6B7280] bg-[#F5F5F5] rounded-full px-2.5 py-1 dark:bg-zinc-800 dark:text-zinc-400"
              >
                <Paperclip className="w-2.5 h-2.5" aria-hidden="true" />
                {pj.nom.length > 26 ? pj.nom.slice(0, 24) + "…" : pj.nom}
              </span>
            ))}
          </div>
        )}

        {/* Actions — boutons pill Harvey */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onView(email)}
            className="inline-flex items-center gap-1.5 text-xs text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-full px-3 py-1.5 font-medium hover:border-[#1A1A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] focus-visible:ring-offset-1 dark:bg-zinc-900 dark:text-white dark:border-zinc-600 dark:hover:border-white"
            aria-label={`Voir l'email : ${email.objet}`}
          >
            <Eye className="w-3 h-3" aria-hidden="true" />
            Voir
          </button>

          {email.brouillon_mock && (
            <button
              onClick={() => onDraft(email)}
              className="inline-flex items-center gap-1.5 text-xs text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-full px-3 py-1.5 font-medium hover:border-[#1A1A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] focus-visible:ring-offset-1 dark:bg-zinc-900 dark:text-white dark:border-zinc-600 dark:hover:border-white"
              aria-label={`Brouillon pour : ${email.objet}`}
            >
              <PenLine className="w-3 h-3" aria-hidden="true" />
              Brouillon
            </button>
          )}

          <button
            onClick={handleTreat}
            disabled={treated}
            className="ml-auto inline-flex items-center gap-1.5 text-xs text-white bg-[#1A1A1A] rounded-full px-3 py-1.5 font-medium hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] focus-visible:ring-offset-1 dark:bg-white dark:text-[#1A1A1A] dark:hover:bg-zinc-100"
            aria-label={
              treated
                ? "Email déjà traité"
                : `Marquer comme fait : ${email.objet}`
            }
          >
            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
            {treated ? "Fait ✓" : "Fait ✓"}
          </button>
        </div>
      </div>

      {/* Overlay traité — check élégant fade */}
      <AnimatePresence>
        {(showCheck || treated) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 flex items-center justify-center rounded-xl pointer-events-none"
            aria-hidden="true"
          >
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="inline-flex items-center gap-1.5 bg-white border border-[#E5E5E5] text-[#1A1A1A] rounded-full px-3 py-1.5 text-xs font-medium shadow-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
            >
              <Check className="w-3 h-3 text-[#F97316]" aria-hidden="true" />
              Fait ✓
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// ---------------------------------------------------------------------------
// TreatedByDonnaSection — collapsible sobre
// ---------------------------------------------------------------------------

function TreatedByDonnaSection({ emails }: { emails: V4Email[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? emails : emails.slice(0, 3);

  return (
    <section aria-labelledby="donna-traites-title">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 mb-3 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] focus-visible:ring-offset-1 rounded"
        aria-expanded={expanded}
        aria-controls="donna-traites-list"
      >
        <h2
          id="donna-traites-title"
          className="text-[11px] tracking-[0.15em] uppercase font-medium text-[#6B7280] flex-1"
        >
          Terminé
        </h2>
        <span
          className="text-[10px] text-[#6B7280] bg-[#F5F5F5] rounded-full px-2 py-0.5 dark:bg-zinc-800"
          aria-label={`${emails.length} emails classés automatiquement`}
        >
          {emails.length}
        </span>
        <ChevronRight
          className={`w-3.5 h-3.5 text-[#6B7280] transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id="donna-traites-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden dark:bg-zinc-900 dark:border-zinc-700">
              <ul
                className="divide-y divide-[#E5E5E5] dark:divide-zinc-700"
                role="list"
              >
                {visible.map((email, i) => (
                  <motion.li
                    key={email.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: i * 0.03 }}
                    className="flex items-start gap-3 px-4 py-3"
                    role="listitem"
                  >
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-[#D1D5DB] flex-shrink-0 mt-0.5 dark:text-zinc-600"
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#1A1A1A] truncate dark:text-white">
                        {email.expediteur}
                      </p>
                      <p className="text-[11px] text-[#6B7280] truncate">
                        {email.objet}
                      </p>
                    </div>
                    <time
                      className="text-[11px] text-[#6B7280] flex-shrink-0 mt-0.5"
                      dateTime={email.date}
                    >
                      {formatRelativeDate(email.date)}
                    </time>
                  </motion.li>
                ))}
              </ul>

              {emails.length > 3 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="w-full flex items-center justify-center gap-1 py-2.5 text-[11px] text-[#6B7280] font-medium border-t border-[#E5E5E5] hover:text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] focus-visible:ring-offset-1 rounded-b-xl dark:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  {expanded
                    ? "Réduire"
                    : `Voir les ${emails.length - 3} autres`}
                  <ChevronRight
                    className={`w-3 h-3 transition-transform duration-200 ${
                      expanded ? "rotate-90" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ---------------------------------------------------------------------------
// BadgesRow — texte simple, pas de badge coloré
// ---------------------------------------------------------------------------

function BadgesRow({ stats }: { stats: V4BriefingData["stats"] }) {
  const items = [
    stats.brief_lu && {
      icon: BookOpen,
      label: "Brief lu",
    },
    stats.brouillons_generes > 0 && {
      icon: PenLine,
      label: `${stats.brouillons_generes} brouillon${
        stats.brouillons_generes > 1 ? "s" : ""
      } prêt${stats.brouillons_generes > 1 ? "s" : ""}`,
    },
    stats.streak_jours >= 3 && {
      icon: Flame,
      label: `${stats.streak_jours} jours consécutifs`,
    },
  ].filter(Boolean) as { icon: any; label: string }[];

  if (items.length === 0) return null;

  return (
    <div
      className="flex flex-wrap gap-3"
      role="list"
      aria-label="Accomplissements du jour"
    >
      {items.map((item) => (
        <span
          key={item.label}
          role="listitem"
          className="inline-flex items-center gap-1.5 text-[11px] text-[#6B7280] dark:text-zinc-400"
        >
          <item.icon
            className="w-3 h-3 text-[#F97316]"
            aria-hidden="true"
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PeriodTabs — pills Harvey : bordure fine, rounded-full
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
      className="inline-flex gap-1"
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={period === tab}
          onClick={() => onChange(tab)}
          className={`px-3 py-1 text-xs font-medium rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] focus-visible:ring-offset-1 ${
            period === tab
              ? "bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-white dark:text-[#1A1A1A] dark:border-white"
              : "bg-white text-[#6B7280] border-[#E5E5E5] hover:border-[#1A1A1A] hover:text-[#1A1A1A] dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-700 dark:hover:border-white dark:hover:text-white"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AllDoneBanner — sobre, pas de gradient
// ---------------------------------------------------------------------------

function AllDoneBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] p-6 text-center dark:bg-zinc-900 dark:border-zinc-700"
      role="status"
      aria-live="polite"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
        className="w-10 h-10 rounded-full border-2 border-[#F97316] flex items-center justify-center mx-auto mb-3"
        aria-hidden="true"
      >
        <Check className="w-5 h-5 text-[#F97316]" />
      </motion.div>
      <p className="font-semibold text-[#1A1A1A] text-sm mb-1 dark:text-white">
        Tout est traité
      </p>
      <p className="text-[13px] text-[#6B7280]">
        Excellente session, Alexandra.
      </p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton — sobre
// ---------------------------------------------------------------------------

function SkeletonLine({ w, h = "h-4" }: { w: string; h?: string }) {
  return (
    <div
      className={`${h} ${w} bg-[#F5F5F5] rounded-lg animate-pulse dark:bg-zinc-800`}
    />
  );
}

// ---------------------------------------------------------------------------
// buildRealBriefing — construit un V4BriefingData depuis les données API brutes
// ---------------------------------------------------------------------------

function buildRealBriefing({
  nomAvocat,
  filteredEmails,
  allEmails,
  narrative,
  dossiers,
  period,
}: {
  nomAvocat: string;
  filteredEmails: any[];
  allEmails: any[];
  narrative: string | null;
  dossiers: V4Dossier[];
  period: PeriodFilter;
}): V4BriefingData {
  // Emails à traiter : pret_a_reviser dans la période
  // On inclut tous les emails pret_a_reviser — si needs_response/urgency sont vides,
  // on affiche quand même pour ne pas laisser la liste vide
  const readyEmails = filteredEmails.filter(
    (e) => e.pipeline_step === "pret_a_reviser"
  );

  // Priorité aux emails nécessitant une action, puis tous les prêts
  const actionCandidates = readyEmails.filter(
    (e) => e.needs_response === true || e.urgency === "high" || e.urgency === "medium"
  );
  const toDoRaw = actionCandidates.length > 0 ? actionCandidates : readyEmails;
  const toDoEmails: V4Email[] = toDoRaw.map(apiEmailToV4);

  // Emails ignorés par Donna dans la période
  const treatedEmails: V4Email[] = filteredEmails
    .filter((e) => e.pipeline_step === "ignore")
    .slice(0, 20)
    .map((e): V4Email => ({
      ...apiEmailToV4(e),
      urgency: "basse",
      email_type: "informatif",
      pieces_jointes: [],
      brouillon_mock: null,
      filtered_by_donna: true,
    }));

  return {
    nom_avocat: nomAvocat,
    date_briefing: new Date().toISOString(),
    narrative: buildNarrative(narrative, filteredEmails, period),
    emails_action: toDoEmails,
    emails_traites: treatedEmails,
    dossiers,
    stats: {
      total_analyses: allEmails.length,
      action_required: toDoEmails.length,
      auto_traites: treatedEmails.length,
      temps_gagne_minutes: Math.round(allEmails.length * 2.5),
      brouillons_generes: allEmails.filter((e) => e.brouillon).length,
      streak_jours: 0,
      brief_lu: true,
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers — parsing expediteur
// ---------------------------------------------------------------------------

/** Parse "Nom Prénom <email@domain.com>" → "Nom Prénom". Si absent, retourne l'email brut. */
function parseExpeditorName(raw: string): string {
  if (!raw) return "";
  const match = raw.match(/^([^<]+?)\s*</);
  if (match) return match[1].trim();
  // Pas de chevrons — retourner tel quel (peut être juste un email)
  return raw.trim();
}

/** Filtre les emails API selon la période choisie */
function filterByPeriod(emails: any[], period: PeriodFilter): any[] {
  const now = Date.now();
  const cutoffs: Record<PeriodFilter, number> = {
    "24h": 24 * 3600 * 1000,
    "7j": 7 * 24 * 3600 * 1000,
    "30j": 30 * 24 * 3600 * 1000,
  };
  const cutoff = cutoffs[period];
  return emails.filter((e) => {
    const ts = e.created_at ? new Date(e.created_at).getTime() : 0;
    return now - ts <= cutoff;
  });
}

/** Construit le narratif selon la période et le nombre d'emails */
function buildNarrative(
  briefNarrative: string | null,
  filteredEmails: any[],
  period: PeriodFilter
): string {
  if (briefNarrative && period === "24h") return briefNarrative;
  const count = filteredEmails.length;
  const actionCount = filteredEmails.filter(
    (e) => e.pipeline_step === "pret_a_reviser"
  ).length;
  const periodLabel =
    period === "24h"
      ? "Aujourd'hui"
      : period === "7j"
      ? "Cette semaine"
      : "Ce mois";
  if (count === 0)
    return `${periodLabel}, aucun email n'a été reçu. Votre boîte est à jour.`;
  return `${periodLabel}, Donna a analysé ${count} email${count > 1 ? "s" : ""}. ${
    actionCount > 0
      ? `${actionCount} requiert${actionCount > 1 ? "ent" : ""} votre attention.`
      : "Tout est traité."
  }`;
}

/** Convertit un email API brut en V4Email */
function apiEmailToV4(e: any): V4Email {
  return {
    id: e.id,
    expediteur: parseExpeditorName(e.expediteur ?? ""),
    email_from: e.expediteur ?? "",
    objet: e.objet ?? "",
    resume: e.resume ?? "",
    corps_original: e.metadata?.body ?? "",
    date: e.created_at ?? new Date().toISOString(),
    dossier_id: e.dossier_id ?? null,
    dossier_nom: e.dossier_nom ?? null,
    dossier_domaine: null,
    urgency:
      e.urgency === "high"
        ? "haute"
        : e.urgency === "medium"
        ? "moyenne"
        : "basse",
    email_type: e.classification?.email_type ?? "informatif",
    pieces_jointes: (e.attachments ?? []).map((a: any) => ({
      nom: a.nom_fichier ?? a.nom ?? "document",
      taille: "",
      type_mime: a.type ?? "",
      resume_ia: a.resume_ia ?? "",
    })),
    brouillon_mock: e.brouillon ?? null,
  };
}

// ---------------------------------------------------------------------------
// Main page — DashboardV6
// ---------------------------------------------------------------------------

export default function DashboardV6() {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState<V4BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodFilter>("24h");
  const [treatedIds, setTreatedIds] = useState<Set<string>>(new Set());
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [nomAvocat, setNomAvocat] = useState("Alexandra");

  // Données brutes API — stockées pour re-filtrer par période sans nouvel appel
  const [allApiEmails, setAllApiEmails] = useState<any[]>([]);
  const [briefNarrative, setBriefNarrative] = useState<string | null>(null);
  const [briefDossiers, setBriefDossiers] = useState<V4Dossier[]>([]);

  // Capture user_id depuis URL (mode réel post-OAuth)
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
        "/v6" + (newSearch ? `?${newSearch}` : "")
      );
    }
  }, []);

  // Chargement initial des données API
  useEffect(() => {
    const load = async () => {
      if (isDemo()) {
        await new Promise((r) => setTimeout(r, 300));
        setBriefing(v4Briefing);
        setNomAvocat(v4Briefing.nom_avocat);
        setLoading(false);
        return;
      }

      // --- Mode réel ---
      try {
        const [briefResult, emailsResult, configResult] = await Promise.allSettled([
          apiGet<any>("/api/briefs/today"),
          apiGet<any[]>("/api/emails"),
          apiGet<{ nom_avocat?: string }>("/api/config"),
        ]);

        // Nom de l'avocate
        if (configResult.status === "fulfilled" && configResult.value?.nom_avocat) {
          setNomAvocat(configResult.value.nom_avocat);
        }

        const apiEmails: any[] = emailsResult.status === "fulfilled"
          ? (emailsResult.value ?? [])
          : [];

        // Stocker les emails bruts pour le filtrage par période
        setAllApiEmails(apiEmails);

        // Narratif depuis le brief
        const briefContent = briefResult.status === "fulfilled"
          ? briefResult.value?.content
          : null;
        setBriefNarrative(briefContent?.executive_summary ?? null);

        // Dossiers depuis le brief
        const dossiers: V4Dossier[] = (briefContent?.dossiers ?? []).map((d: any) => ({
          id: d.dossier_id ?? d.id ?? "",
          nom: d.nom ?? d.name ?? "",
          domaine: d.domaine ?? "",
          urgency:
            d.urgency === "high" || d.urgency === "haute"
              ? "haute"
              : d.urgency === "medium" || d.urgency === "moyenne"
              ? "moyenne"
              : "basse",
          email_ids: [],
          resume_court: d.summary ?? d.resume_court ?? "",
          dates_cles: d.dates_cles ?? [],
        }));
        // Pas de fallback sur les mocks en mode réel — liste vide si pas encore de dossiers
        setBriefDossiers(dossiers);

        // Si 0 emails en mode réel → import non encore lancé, rediriger vers onboarding
        if (apiEmails.length === 0) {
          try {
            await apiGet<any>("/api/import/status");
          } catch {
            // ignore
          }
          navigate("/onboarding?import=started&user_id=" + getUserId());
          return;
        }

        // Construire le briefing initial (24h)
        const filtered24h = filterByPeriod(apiEmails, "24h");
        const realBriefing = buildRealBriefing({
          nomAvocat: configResult.status === "fulfilled"
            ? (configResult.value?.nom_avocat ?? "Alexandra")
            : "Alexandra",
          filteredEmails: filtered24h,
          allEmails: apiEmails,
          narrative: briefContent?.executive_summary ?? null,
          dossiers,
          period: "24h",
        });
        setBriefing(realBriefing);
      } catch (err) {
        console.error("DashboardV6 load error:", err);
        // En mode réel, état vide propre — pas de fallback sur les données mock
        const avocat = nomAvocat || "Alexandra";
        setBriefing({
          nom_avocat: avocat,
          date_briefing: new Date().toISOString(),
          narrative: "Aucun dossier actif trouvé. Connectez votre boîte mail pour commencer.",
          emails_action: [],
          emails_traites: [],
          dossiers: [],
          stats: {
            total_analyses: 0,
            action_required: 0,
            auto_traites: 0,
            temps_gagne_minutes: 0,
            streak_jours: 0,
            brouillons_generes: 0,
            brief_lu: false,
          },
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Re-calculer le briefing quand la période change (mode réel uniquement)
  useEffect(() => {
    if (isDemo() || allApiEmails.length === 0) return;
    const filtered = filterByPeriod(allApiEmails, period);
    const updated = buildRealBriefing({
      nomAvocat,
      filteredEmails: filtered,
      allEmails: allApiEmails,
      narrative: briefNarrative,
      dossiers: briefDossiers,
      period,
    });
    setBriefing(updated);
  }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTreat = (id: string) => {
    setTreatedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    toast.success("Fait ✓", {
      description: "Donna a mis à jour votre progression.",
      duration: 1800,
    });
  };

  const handleView = (email: V4Email) =>
    setSelectedEmail(v4EmailToDrawerEmail(email));
  const handleDraft = (email: V4Email) =>
    setSelectedEmail(v4EmailToDrawerEmail(email));
  const handleDossierNav = (dossierId: string) =>
    navigate(`/dossiers/${dossierId}`);

  const actionEmails = briefing?.emails_action ?? [];
  const treatedCount =
    actionEmails.filter((e) => treatedIds.has(e.id)).length +
    (briefing?.stats.auto_traites ?? 0);
  const totalEmails = briefing?.stats.total_analyses ?? 0;
  const allActionTreated =
    actionEmails.length > 0 &&
    actionEmails.every((e) => treatedIds.has(e.id));
  const pendingCount = actionEmails.filter((e) => !treatedIds.has(e.id)).length;

  const dateLabel = format(new Date(), "EEEE d MMMM", { locale: fr });
  const dateLabelCap =
    dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  // ---------------------------------------------------------------------------
  // Skeleton
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <DashboardLayout>
        <div
          className="mx-auto max-w-xl px-4 space-y-5 py-6"
          aria-busy="true"
          aria-label="Chargement du briefing"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <SkeletonLine w="w-40" h="h-6" />
              <SkeletonLine w="w-24" h="h-3.5" />
            </div>
            <SkeletonLine w="w-24" h="h-7" />
          </div>
          <SkeletonLine w="w-full" h="h-24" />
          <SkeletonLine w="w-full" h="h-16" />
          {[1, 2, 3].map((i) => (
            <SkeletonLine key={i} w="w-full" h="h-32" />
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
      {/* Fond page — blanc pur */}
      <div className="mx-auto max-w-xl pb-16">
        {/* ── En-tête ── */}
        <motion.header
          className="flex items-start justify-between gap-3 mb-6"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-2xl font-semibold text-[#1A1A1A] leading-tight dark:text-white">
              {nomAvocat}
            </h1>
            <p
              className="text-sm text-[#6B7280] mt-0.5 leading-none"
              aria-live="polite"
            >
              {dateLabelCap}
            </p>
          </div>
          <PeriodTabs period={period} onChange={setPeriod} />
        </motion.header>

        {/* ── Hero stats ── */}
        <div className="mb-6">
          <HeroStatsCard
            stats={{ ...briefing.stats, auto_traites: treatedCount }}
            treated={treatedCount}
            total={totalEmails}
          />
        </div>

        {/* ── Narratif Donna ── */}
        <motion.div
          className="rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] p-4 mb-6 dark:bg-zinc-900/60 dark:border-zinc-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          role="region"
          aria-label="Résumé de Donna"
        >
          <p className="text-[13px] text-[#1A1A1A] leading-relaxed dark:text-zinc-200">
            {briefing.narrative}
          </p>
        </motion.div>

        {/* ── Emails à traiter ── */}
        <AnimatePresence mode="wait">
          {allActionTreated ? (
            <motion.div
              key="all-done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <AllDoneBanner />
            </motion.div>
          ) : (
            <motion.section
              key="action-section"
              aria-labelledby="action-title"
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Label section */}
              <div className="flex items-center justify-between mb-3">
                <h2
                  id="action-title"
                  className="text-[11px] tracking-[0.15em] uppercase font-medium text-[#6B7280]"
                >
                  To-do list
                </h2>
                {pendingCount > 0 && (
                  <span
                    className="text-[10px] font-semibold text-[#F97316] tabular-nums"
                    aria-label={`${pendingCount} emails en attente`}
                  >
                    {pendingCount}
                  </span>
                )}
              </div>

              {/* Cartes */}
              <div
                className="space-y-3"
                role="list"
                aria-label="Emails nécessitant une action"
              >
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
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2
            id="dossiers-title"
            className="text-[11px] tracking-[0.15em] uppercase font-medium text-[#6B7280] mb-3"
          >
            Dossiers actifs
          </h2>

          <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden dark:bg-zinc-900 dark:border-zinc-700">
            <ul
              className="divide-y divide-[#E5E5E5] dark:divide-zinc-700"
              role="list"
            >
              {briefing.dossiers.map((dossier, i) => {
                const urgencyDot = {
                  haute: "bg-red-500",
                  moyenne: "bg-amber-400",
                  basse: "bg-[#D1D5DB]",
                } as const;

                return (
                  <motion.li
                    key={dossier.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.22 + i * 0.04 }}
                    role="listitem"
                  >
                    <button
                      onClick={() => handleDossierNav(dossier.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#FAFAFA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] focus-visible:ring-inset dark:hover:bg-zinc-800"
                      aria-label={`Ouvrir le dossier ${dossier.nom} — ${dossier.domaine}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${urgencyDot[dossier.urgency]}`}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate dark:text-white">
                          {dossier.nom}
                        </p>
                        <p className="text-[11px] text-[#6B7280] truncate">
                          {dossier.domaine}
                          {dossier.resume_court
                            ? ` · ${dossier.resume_court}`
                            : ""}
                        </p>
                      </div>
                      {dossier.dates_cles.length > 0 && (
                        <span className="text-[10px] text-[#6B7280] flex-shrink-0 hidden sm:block">
                          {dossier.dates_cles[0].replace(/^[^:]+:\s*/, "")}
                        </span>
                      )}
                      <ChevronRight
                        className="w-3.5 h-3.5 text-[#D1D5DB] flex-shrink-0"
                        aria-hidden="true"
                      />
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </motion.section>

        {/* ── Classés par Donna (collapsible) ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mb-6"
        >
          <TreatedByDonnaSection emails={briefing.emails_traites} />
        </motion.div>

        {/* ── Footer badges ── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.4 }}
          aria-label="Accomplissements du jour"
        >
          <BadgesRow stats={{ ...briefing.stats, brief_lu: true }} />
        </motion.footer>
      </div>

      {/* ── Email Drawer (non modifié) ── */}
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
