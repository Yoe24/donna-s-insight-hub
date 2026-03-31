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
  FolderOpen,
  Filter,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EmailDrawer } from "@/components/EmailDrawer";
import { isDemo, getUserId } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
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
    email_type: e.email_type,
    ...(e.pieces_jointes.length > 0
      ? {
          attachments: e.pieces_jointes.map((pj) => ({
            ...pj,
            storage_url: null,
          })),
        }
      : {}),
    ...(e.corps_original ? { contenu: e.corps_original } : {}),
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
  emailsRecus,
  emailsDossiers,
  emailsBruit,
  actionsCreees,
  actionsValidees,
}: {
  emailsRecus: number;
  emailsDossiers: number;
  emailsBruit: number;
  actionsCreees: number;
  actionsValidees: number;
}) {
  return (
    <motion.div
      className="rounded-xl bg-white border border-[#E5E5E5] p-5 dark:bg-zinc-900 dark:border-zinc-700"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center gap-5">
        {/* Cercle de progression — actions validées / créées */}
        <div className="relative flex-shrink-0" aria-hidden="true">
          <CircularProgress value={actionsValidees} max={actionsCreees} size={72} stroke={5} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold text-[#1A1A1A] leading-none dark:text-white tabular-nums">
              {actionsValidees}
            </span>
            <span className="text-[10px] text-[#6B7280] leading-none mt-0.5">
              /{actionsCreees}
            </span>
          </div>
        </div>

        {/* Métriques clés */}
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-[10px] tracking-[0.12em] uppercase text-[#6B7280]">
            Aujourd'hui
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[12px] text-[#1A1A1A] font-medium dark:text-white">
              <Inbox className="w-3.5 h-3.5 text-[#6B7280]" />
              {emailsRecus} reçu{emailsRecus > 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-[#1A1A1A] font-medium dark:text-white">
              <FolderOpen className="w-3.5 h-3.5 text-[#6B7280]" />
              {emailsDossiers} dossier{emailsDossiers > 1 ? "s" : ""} actif{emailsDossiers > 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-[#6B7280]">
              <Filter className="w-3.5 h-3.5" />
              {emailsBruit} filtré{emailsBruit > 1 ? "s" : ""}
            </span>
          </div>
          {actionsValidees > 0 && (
            <p className="text-[11px] text-[#6B7280]">
              ~{actionsValidees * 15} min économisées
            </p>
          )}
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
            <h3 className="text-sm font-medium text-[#1A1A1A] leading-snug mt-0.5 line-clamp-2 break-words dark:text-white">
              {email.objet}
            </h3>
            {/* Badges urgence + brouillon */}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {email.urgency === "haute" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 rounded-full px-2 py-0.5 dark:bg-red-900/30 dark:text-red-400">
                  <Flame className="w-2.5 h-2.5" aria-hidden="true" />
                  Urgent
                </span>
              )}
              {email.urgency === "moyenne" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 dark:bg-amber-900/30 dark:text-amber-400">
                  <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                  Attention
                </span>
              )}
              {email.brouillon_mock && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <PenLine className="w-2.5 h-2.5" aria-hidden="true" />
                  Brouillon prêt
                </span>
              )}
            </div>
          </div>
        </div>

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
// NarrativeBlock — narratif Donna avec troncature et markdown bold stripped
// ---------------------------------------------------------------------------

const NARRATIVE_MAX = 500;

/** Supprime le markdown bold (**texte** → texte) du narratif API */
function stripMarkdownBold(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1");
}

function NarrativeBlock({ narrative }: { narrative: string }) {
  const [expanded, setExpanded] = useState(false);
  const cleaned = stripMarkdownBold(narrative);
  const isTruncatable = cleaned.length > NARRATIVE_MAX;
  const displayed =
    isTruncatable && !expanded ? cleaned.slice(0, NARRATIVE_MAX).trimEnd() + "…" : cleaned;

  return (
    <motion.div
      className="rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] p-4 mb-6 overflow-hidden dark:bg-zinc-900/60 dark:border-zinc-700"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.08 }}
      role="region"
      aria-label="Résumé de Donna"
    >
      <p className="text-[13px] text-[#1A1A1A] leading-relaxed dark:text-zinc-200 break-words">
        {displayed}
      </p>
      {isTruncatable && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-[12px] text-[#6B7280] underline underline-offset-2 hover:text-[#1A1A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] focus-visible:ring-offset-1 rounded dark:hover:text-white"
          aria-expanded={expanded}
        >
          {expanded ? "Voir moins" : "Voir plus"}
        </button>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// AllDoneBanner — sobre, pas de gradient
// ---------------------------------------------------------------------------

function AllDoneBanner({ nomAvocat }: { nomAvocat?: string }) {
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
        {nomAvocat ? `Excellente session, ${nomAvocat}.` : "Excellente session."}
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
  const readyInPeriod = filteredEmails.filter(
    (e) => e.pipeline_step === "pret_a_reviser"
  );

  // Fallback : si aucun email pret_a_reviser dans la période, chercher dans tous les emails
  const readyEmails = readyInPeriod.length > 0
    ? readyInPeriod
    : allEmails.filter((e) => e.pipeline_step === "pret_a_reviser").slice(0, 15);

  // Priorité aux emails nécessitant une action, puis tous les prêts
  const actionCandidates = readyEmails.filter(
    (e) => e.needs_response === true || e.urgency === "high" || e.urgency === "medium"
  );
  const toDoRaw = actionCandidates.length > 0 ? actionCandidates : readyEmails;

  // Grouper par dossier, max 2 par dossier (les plus urgents en premier)
  const urgencyOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const sorted = [...toDoRaw].sort((a, b) => (urgencyOrder[a.urgency] ?? 2) - (urgencyOrder[b.urgency] ?? 2));
  const perDossier = new Map<string, number>();
  const limitedToDo = sorted.filter((e) => {
    const key = e.dossier_id || "no-dossier";
    const count = perDossier.get(key) || 0;
    if (count >= 2) return false;
    perDossier.set(key, count + 1);
    return true;
  });
  const toDoEmails: V4Email[] = limitedToDo.map(apiEmailToV4);

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
    narrative: buildNarrative(narrative, filteredEmails, period, dossiers),
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
    const raw = e.created_at || e.date;
    const ts = raw ? new Date(raw).getTime() : 0;
    return now - ts <= cutoff;
  });
}

/** Construit le narratif selon la période et le nombre d'emails */
function buildNarrative(
  briefNarrative: string | null,
  filteredEmails: any[],
  period: PeriodFilter,
  dossiers: V4Dossier[] = []
): string {
  if (briefNarrative && period === "24h") return briefNarrative;

  const count = filteredEmails.length;
  const actionCount = filteredEmails.filter(
    (e) => e.pipeline_step === "pret_a_reviser"
  ).length;
  const ignoredCount = filteredEmails.filter(
    (e) => e.pipeline_step === "ignore"
  ).length;
  const withDraftCount = filteredEmails.filter((e) => e.brouillon).length;

  // Dossiers actifs touchés dans la période
  const dossierIds = new Set(
    filteredEmails.filter((e) => e.dossier_id).map((e) => e.dossier_id)
  );
  const activeDossierNames = dossiers
    .filter((d) => dossierIds.has(d.id))
    .map((d) => d.nom)
    .slice(0, 4);

  if (count === 0) {
    if (period === "24h") return "Aujourd'hui, aucun email n'a été reçu. Votre boîte est à jour.";
    if (period === "7j") return "Cette semaine, aucun email n'a été reçu. Profitez-en pour avancer sur vos dossiers.";
    return "Ce mois, aucun email n'a été traité par Donna. Vérifiez que votre boîte Gmail est bien connectée.";
  }

  if (period === "7j") {
    let text = `Cette semaine, Donna a analysé ${count} email${count > 1 ? "s" : ""} sur ${dossierIds.size} dossier${dossierIds.size > 1 ? "s" : ""}.`;
    if (actionCount > 0)
      text += ` ${actionCount} requièr${actionCount > 1 ? "ent" : "e"} votre attention.`;
    if (ignoredCount > 0)
      text += ` ${ignoredCount} email${ignoredCount > 1 ? "s" : ""} filtré${ignoredCount > 1 ? "s" : ""} automatiquement.`;
    if (withDraftCount > 0)
      text += ` ${withDraftCount} brouillon${withDraftCount > 1 ? "s" : ""} prêt${withDraftCount > 1 ? "s" : ""}.`;
    if (activeDossierNames.length > 0)
      text += ` Dossiers actifs : ${activeDossierNames.join(", ")}${activeDossierNames.length < dossierIds.size ? "…" : ""}.`;
    return text;
  }

  if (period === "30j") {
    let text = `Ce mois, Donna a traité ${count} email${count > 1 ? "s" : ""} répartis sur ${dossierIds.size} dossier${dossierIds.size > 1 ? "s" : ""}.`;
    if (actionCount > 0)
      text += ` ${actionCount} action${actionCount > 1 ? "s" : ""} en attente.`;
    else
      text += " Tous les emails ont été traités.";
    if (ignoredCount > 0)
      text += ` ${ignoredCount} email${ignoredCount > 1 ? "s ont été filtrés" : " a été filtré"} par Donna (spam, newsletters).`;
    const tempsGagne = Math.round(count * 2.5);
    text += ` Temps estimé gagné : ~${tempsGagne} min.`;
    if (activeDossierNames.length > 0)
      text += ` Dossiers actifs : ${activeDossierNames.join(", ")}${activeDossierNames.length < dossierIds.size ? "…" : ""}.`;
    return text;
  }

  // Fallback 24h sans briefNarrative
  return `Aujourd'hui, Donna a analysé ${count} email${count > 1 ? "s" : ""}. ${
    actionCount > 0
      ? `${actionCount} requièr${actionCount > 1 ? "ent" : "e"} votre attention.`
      : "Tout est traité."
  }`;
}

/** Convertit un email API brut en V4Email */
function apiEmailToV4(e: any): V4Email {
  // Support both API formats (transformed: subject/summary/from_name and raw: objet/resume/expediteur)
  const objet = e.objet ?? e.subject ?? "";
  const resume = e.resume ?? e.summary ?? "";
  const expediteur = e.expediteur ?? (e.from_name ? `${e.from_name} <${e.from_email ?? ""}>` : e.from_email ?? "");
  const brouillon = e.brouillon ?? e.draft ?? null;
  const createdAt = e.created_at ?? e.date ?? new Date().toISOString();
  const dossierNom = e.dossier_nom ?? e.dossier_name ?? null;
  const urgencyRaw = e.urgency ?? e.classification?.urgency ?? "low";

  return {
    id: e.id,
    expediteur: parseExpeditorName(expediteur),
    email_from: expediteur,
    objet,
    resume,
    corps_original: e.metadata?.body ?? "",
    date: createdAt,
    dossier_id: e.dossier_id ?? null,
    dossier_nom: dossierNom,
    dossier_domaine: e.dossier_domaine ?? e.dossier_domain ?? null,
    urgency:
      urgencyRaw === "high" || urgencyRaw === "haute"
        ? "haute"
        : urgencyRaw === "medium" || urgencyRaw === "moyenne"
        ? "moyenne"
        : "basse",
    email_type: e.classification?.email_type ?? "informatif",
    pieces_jointes: (e.attachments ?? []).map((a: any) => ({
      nom: a.nom_fichier ?? a.nom ?? "document",
      taille: "",
      type_mime: a.type ?? "",
      resume_ia: a.resume_ia ?? "",
    })),
    brouillon_mock: brouillon,
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
  const [nomAvocat, setNomAvocat] = useState("");
  const [userEmail, setUserEmail] = useState("");

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
        if (configResult.status === "fulfilled") {
          if (configResult.value?.nom_avocat) setNomAvocat(configResult.value.nom_avocat);
          if (configResult.value?.user_email) setUserEmail(configResult.value.user_email);
        }

        const apiEmails: any[] = emailsResult.status === "fulfilled"
          ? (emailsResult.value ?? [])
          : [];

        // Stocker les emails bruts pour le filtrage par période
        setAllApiEmails(apiEmails);

        // Restaurer les emails déjà traités (statut = 'traite' ou 'valide')
        const alreadyTreated = apiEmails
          .filter((e) => e.statut === "traite" || e.statut === "valide")
          .map((e) => e.id);
        if (alreadyTreated.length > 0) {
          setTreatedIds(new Set(alreadyTreated));
        }

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
        // Filter dossiers to only those with emails in the 24h period
        const activeDossierIds24h = new Set(
          filtered24h.filter((e) => e.dossier_id).map((e) => e.dossier_id)
        );
        const activeDossiers24h = dossiers.filter((d) => activeDossierIds24h.has(d.id));
        const realBriefing = buildRealBriefing({
          nomAvocat: configResult.status === "fulfilled"
            ? (configResult.value?.nom_avocat ?? "")
            : "",
          filteredEmails: filtered24h,
          allEmails: apiEmails,
          narrative: briefContent?.executive_summary ?? null,
          dossiers: activeDossiers24h,
          period: "24h",
        });
        setBriefing(realBriefing);
      } catch (err) {
        console.error("DashboardV6 load error:", err);
        // En mode réel, état vide propre — pas de fallback sur les données mock
        const avocat = nomAvocat || "";
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
    // Filter dossiers to only those with emails in the selected period
    const activeDossierIds = new Set(
      filtered.filter((e) => e.dossier_id).map((e) => e.dossier_id)
    );
    const activeDossiers = briefDossiers.filter((d) => activeDossierIds.has(d.id));
    const updated = buildRealBriefing({
      nomAvocat,
      filteredEmails: filtered,
      allEmails: allApiEmails,
      narrative: briefNarrative,
      dossiers: activeDossiers,
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
    // Persist in DB
    if (!isDemo()) {
      apiPost(`/api/emails/${id}/status`, { statut: 'traite' }).catch(() => {});
    }
    toast.success("Fait ✓", {
      description: "Donna a mis à jour votre progression.",
      duration: 1800,
    });
  };

  const handleUntreate = (id: string) => {
    setTreatedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (!isDemo()) {
      apiPost(`/api/emails/${id}/status`, { statut: 'en_attente' }).catch(() => {});
    }
    toast.success("Remis en to-do");
  };

  const [drawerMode, setDrawerMode] = useState<"view" | "draft">("view");
  const handleView = (email: V4Email) => {
    setDrawerMode("view");
    setSelectedEmail(v4EmailToDrawerEmail(email));
  };
  const handleDraft = (email: V4Email) => {
    setDrawerMode("draft");
    setSelectedEmail(v4EmailToDrawerEmail(email));
  };
  const handleDossierNav = (dossierId: string) =>
    navigate(`/dossiers/${dossierId}`);

  const actionEmails = briefing?.emails_action ?? [];
  const actionsValidees = actionEmails.filter((e) => treatedIds.has(e.id)).length;
  const actionsCreees = actionEmails.length;
  const emailsRecus = briefing?.stats.total_analyses ?? 0;
  const emailsBruit = briefing?.stats.auto_traites ?? 0;
  const emailsDossiers = briefing?.dossiers?.length ?? 0;
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
        {/* ── En-tête — chaleureux ── */}
        <motion.header
          className="mb-5"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-semibold text-[#1A1A1A] leading-tight dark:text-white">
            Bonjour{nomAvocat ? `, ${nomAvocat.split(" ")[0]}` : ""}
          </h1>
          <p className="text-[13px] text-[#6B7280] mt-1">
            {dateLabelCap}{userEmail ? <> · <span className="text-[#9CA3AF]">{userEmail}</span></> : null}
          </p>
        </motion.header>

        {/* ── 3 mini-cards stats ── */}
        <motion.div
          className="grid grid-cols-3 gap-3 mb-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          {/* Card 1 — Emails reçus */}
          <div className="rounded-xl border border-[#E5E5E5] bg-white p-3.5 dark:bg-zinc-900 dark:border-zinc-700">
            <p className="text-2xl font-semibold text-[#1A1A1A] dark:text-white tabular-nums">{emailsRecus}</p>
            <p className="text-[11px] text-[#6B7280] mt-0.5">emails reçus</p>
            <p className="text-[10px] text-[#9CA3AF] mt-1">{emailsDossiers} clients · {emailsBruit} filtrés</p>
          </div>

          {/* Card 2 — Dossiers actifs */}
          <div className="rounded-xl border border-[#E5E5E5] bg-white p-3.5 dark:bg-zinc-900 dark:border-zinc-700">
            <p className="text-2xl font-semibold text-[#1A1A1A] dark:text-white tabular-nums">{emailsDossiers}</p>
            <p className="text-[11px] text-[#6B7280] mt-0.5">dossiers actifs</p>
            <p className="text-[10px] text-[#9CA3AF] mt-1 truncate">
              {briefing.dossiers.slice(0, 2).map((d) => d.nom).join(" · ") || "—"}
            </p>
          </div>

          {/* Card 3 — Actions / progression */}
          <div className="rounded-xl border border-[#E5E5E5] bg-white p-3.5 dark:bg-zinc-900 dark:border-zinc-700 relative overflow-hidden">
            <p className="text-2xl font-semibold text-[#1A1A1A] dark:text-white tabular-nums">{actionsCreees}</p>
            <p className="text-[11px] text-[#6B7280] mt-0.5">brouillons prêts</p>
            <p className="text-[10px] mt-1">
              <span className={actionsValidees > 0 ? "text-emerald-600 font-medium" : "text-[#9CA3AF]"}>
                {actionsValidees}/{actionsCreees} validées
              </span>
            </p>
            {/* Progress bar subtle */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E5E5E5]">
              <div
                className="h-full bg-[#F97316] transition-all duration-500"
                style={{ width: `${actionsCreees > 0 ? (actionsValidees / actionsCreees) * 100 : 0}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Narratif Donna — court et actionnable ── */}
        <motion.div
          className="rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] p-4 mb-6 dark:bg-zinc-900/60 dark:border-zinc-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <p className="text-[13px] text-[#1A1A1A] leading-relaxed dark:text-zinc-200">
            {(() => {
              // Build a short, actionable narrative from the data
              const dossierNames = briefing.dossiers.map((d) => d.nom);
              const urgentCount = actionEmails.filter((e) => e.urgency === "haute").length;
              let narrative = `Donna a analysé vos ${emailsRecus} emails et préparé ${actionsCreees} brouillons de réponse.`;
              if (dossierNames.length > 0) {
                narrative += ` ${urgentCount > 0 ? urgentCount + " sujet" + (urgentCount > 1 ? "s" : "") + " urgent" + (urgentCount > 1 ? "s" : "") : actionsCreees + " action" + (actionsCreees > 1 ? "s" : "")} sur ${dossierNames.length} dossier${dossierNames.length > 1 ? "s" : ""} : ${dossierNames.join(", ")}.`;
              }
              if (emailsBruit > 0) {
                narrative += ` ${emailsBruit} email${emailsBruit > 1 ? "s" : ""} filtré${emailsBruit > 1 ? "s" : ""} automatiquement.`;
              }
              return narrative;
            })()}
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
              <AllDoneBanner nomAvocat={nomAvocat} />
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

        {/* ── Archivé — tâches validées ── */}
        {actionEmails.filter((e) => treatedIds.has(e.id)).length > 0 && (
          <motion.section
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <h2 className="text-[11px] tracking-[0.15em] uppercase font-medium text-[#6B7280] mb-3">
              Validées aujourd'hui
              <span className="ml-2 text-[#D1D5DB] tabular-nums">{actionEmails.filter((e) => treatedIds.has(e.id)).length}</span>
            </h2>
            <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden dark:bg-zinc-900 dark:border-zinc-700 divide-y divide-[#E5E5E5] dark:divide-zinc-700">
              {actionEmails.filter((e) => treatedIds.has(e.id)).map((email) => (
                <div key={email.id} className="flex items-center gap-3 px-4 py-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#6B7280] truncate line-through decoration-[#D1D5DB]">{email.objet}</p>
                    <p className="text-[10px] text-[#D1D5DB]">{email.dossier_nom}</p>
                  </div>
                  <button
                    onClick={() => handleUntreate(email.id)}
                    className="text-[10px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors px-2 py-1 rounded border border-[#E5E5E5] hover:border-[#1A1A1A] dark:hover:text-white dark:hover:border-white"
                  >
                    Remettre
                  </button>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Classés par Donna + badges supprimés — accessible via sidebar */}
      </div>

      {/* ── Email Drawer (non modifié) ── */}
      <AnimatePresence>
        {selectedEmail && (
          <EmailDrawer
            email={selectedEmail}
            onClose={() => setSelectedEmail(null)}
            showDossierLink
            context="briefing"
            initialMode={drawerMode}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
