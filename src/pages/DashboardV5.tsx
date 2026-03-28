/**
 * DashboardV5 — Briefing premium fintech (mobile-first)
 *
 * Design direction : Revolut / Mercury — données mises en valeur, typographie forte,
 * stats animées, contraste élevé, accent orange.
 *
 * Route : /v5 (ajoutée dans App.tsx)
 * En mode démo : mockBriefingV5 (zéro appel API)
 * En mode réel : même API que Dashboard (/api/briefs/today)
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ChevronRight,
  ChevronDown,
  Paperclip,
  AlertCircle,
  FileText,
  RefreshCw,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EmailDrawer } from "@/components/EmailDrawer";
import { isDemo } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import type { Email } from "@/hooks/useEmails";
import {
  mockBriefingV5,
  getV5EmailsForPeriod,
  v5EmailToHookEmail,
  type V5Email,
  type V5BriefingData,
  type V5WeekStats,
} from "@/lib/mock-briefing-v5";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PeriodFilter = "24h" | "7j" | "30j";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Animated counter for the hero stat */
function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayed}</span>;
}

/** Stat pill — compact metric chip */
function StatPill({
  value,
  label,
  accent = false,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center px-4 py-2.5 rounded-xl min-w-[72px] ${
        accent
          ? "bg-orange-50 dark:bg-orange-950/40 ring-1 ring-orange-200 dark:ring-orange-800"
          : "bg-zinc-100 dark:bg-zinc-800/70 ring-1 ring-zinc-200 dark:ring-zinc-700"
      }`}
    >
      <span
        className={`text-xl font-bold tabular-nums leading-tight ${
          accent ? "text-orange-600 dark:text-orange-400" : "text-zinc-900 dark:text-zinc-100"
        }`}
      >
        {value}
      </span>
      <span className="text-[10px] tracking-wide uppercase text-zinc-500 dark:text-zinc-400 mt-0.5 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

/** Priority dot indicator */
function PriorityDot({ priority }: { priority: V5Email["priority"] }) {
  if (priority === "urgent") {
    return (
      <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
    );
  }
  if (priority === "normal") {
    return (
      <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
  );
}

/** Domain badge */
function DomainBadge({ domaine }: { domaine: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800 leading-none">
      {domaine}
    </span>
  );
}

/** Relative time formatter */
function formatRelativeTime(iso: string): string {
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    const diffH = Math.floor(diffMs / 3_600_000);
    const diffD = Math.floor(diffMs / 86_400_000);
    const hhmm = `${date.getHours()}h${String(date.getMinutes()).padStart(2, "0")}`;
    if (diffMin < 60) return `Il y a ${Math.max(1, diffMin)} min`;
    if (diffH < 24 && date.getDate() === new Date().getDate())
      return `Auj. ${hhmm}`;
    if (diffD < 2) return `Hier ${hhmm}`;
    const jours = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
    return `${jours[date.getDay()]} ${hhmm}`;
  } catch {
    return "";
  }
}

/** Single email row */
function EmailRow({
  email,
  onOpen,
}: {
  email: V5Email;
  onOpen: (e: V5Email) => void;
}) {
  const [draftOpen, setDraftOpen] = useState(false);

  const isUrgent = email.priority === "urgent";
  const isTraite = email.priority === "traite";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative rounded-2xl border transition-colors duration-150 ${
        isUrgent
          ? "bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-900"
          : isTraite
          ? "bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-100 dark:border-emerald-900/40"
          : "bg-amber-50/50 dark:bg-amber-950/15 border-amber-100 dark:border-amber-900/40"
      }`}
    >
      <button
        className="w-full text-left px-4 pt-4 pb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 rounded-2xl"
        onClick={() => onOpen(email)}
        aria-label={`Ouvrir l'email : ${email.objet}`}
      >
        {/* Row 1 — sender + badge + time */}
        <div className="flex items-start gap-2 mb-1">
          <PriorityDot priority={email.priority} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {email.expediteur}
              </span>
              <DomainBadge domaine={email.dossier_domaine} />
            </div>
            {/* Row 2 — dossier + time */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {email.dossier_nom}
              </span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">·</span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 shrink-0">
                {formatRelativeTime(email.date)}
              </span>
            </div>
          </div>
        </div>

        {/* Row 3 — subject bold */}
        <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 leading-snug mt-2 ml-4">
          {email.objet}
        </p>

        {/* Row 4 — summary */}
        <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1 ml-4 line-clamp-2">
          {email.resume}
        </p>

        {/* Row 5 — PJ indicator */}
        {email.pieces_jointes.length > 0 && (
          <div className="flex items-center gap-1 mt-2 ml-4">
            <Paperclip className="w-3 h-3 text-zinc-400" />
            <span className="text-[11px] text-zinc-400">
              {email.pieces_jointes.length} pièce{email.pieces_jointes.length > 1 ? "s" : ""} jointe
              {email.pieces_jointes.length > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </button>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 px-4 pb-3">
        {email.brouillon_mock && (
          <button
            className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors duration-150 ${
              draftOpen
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 ring-1 ring-zinc-200 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
            }`}
            onClick={(ev) => {
              ev.stopPropagation();
              setDraftOpen((o) => !o);
            }}
            aria-expanded={draftOpen}
            aria-label="Voir le brouillon"
          >
            Brouillon
          </button>
        )}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors duration-150 shrink-0"
          onClick={() => onOpen(email)}
          aria-label="Voir le détail"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Draft accordion */}
      <AnimatePresence>
        {draftOpen && email.brouillon_mock && (
          <motion.div
            key="draft"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mx-4 mb-4 p-3 bg-white dark:bg-zinc-900 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-700">
              <p className="text-[10px] tracking-[0.12em] uppercase text-zinc-400 dark:text-zinc-500 mb-2">
                Brouillon Donna
              </p>
              <pre className="text-[12px] text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
                {email.brouillon_mock}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Week bar chart — CSS only, horizontal bars */
function WeekBarChart({ stats }: { stats: V5WeekStats }) {
  const days = [
    { label: "Lun", value: stats.lun },
    { label: "Mar", value: stats.mar },
    { label: "Mer", value: stats.mer },
    { label: "Jeu", value: stats.jeu },
    { label: "Ven", value: stats.ven },
  ];
  const max = Math.max(...days.map((d) => d.value));
  const total = days.reduce((a, d) => a + d.value, 0);
  const hours = Math.floor(total / 60);
  const mins = total % 60;

  return (
    <div className="space-y-2.5">
      {days.map((d) => {
        const pct = Math.round((d.value / max) * 100);
        return (
          <div key={d.label} className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 w-7 shrink-0">
              {d.label}
            </span>
            <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400"
              />
            </div>
            <span className="text-[11px] tabular-nums text-zinc-600 dark:text-zinc-300 w-12 text-right shrink-0">
              {d.value} min
            </span>
          </div>
        );
      })}
      <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Total cette semaine</span>
        <span className="text-[13px] font-bold text-orange-500">
          {hours}h{String(mins).padStart(2, "0")} gagnées
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section title
// ---------------------------------------------------------------------------
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] tracking-[0.15em] uppercase text-zinc-400 dark:text-zinc-500 font-medium">
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------
function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
      <div className="flex gap-3">
        <div className="h-16 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
        <div className="h-16 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
        <div className="h-16 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
      </div>
      <div className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-28 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const DashboardV5 = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<V5BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodFilter>("24h");
  const [treatedExpanded, setTreatedExpanded] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ---- Load data ----
  const loadData = useCallback(async () => {
    if (isDemo()) {
      // Small delay for perceived loading — feels snappier
      await new Promise((r) => setTimeout(r, 400));
      setData(mockBriefingV5);
      setLoading(false);
      return;
    }
    try {
      const res = await apiGet("/api/briefs/today");
      if (res?.content) {
        // Map API shape to V5BriefingData — minimal transform
        setData({
          nom_avocat: res.nom_avocat || "Alexandra",
          date_briefing: new Date().toISOString(),
          temps_gagne_minutes: res.content?.stats?.temps_gagne_minutes ?? 47,
          emails_count: res.content?.stats?.emails_analyzed ?? 0,
          classes_count: res.content?.stats?.emails_dossiers ?? 0,
          pj_count: res.content?.stats?.pieces_extraites ?? 0,
          narrative: res.content?.executive_summary ?? "",
          emails_prioritaires: [],
          emails_traites: [],
          week_stats: { lun: 0, mar: 0, mer: 0, jeu: 0, ven: 0 },
        });
      }
    } catch {
      // Fallback to mock on error
      setData(mockBriefingV5);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ---- Period filter ----
  const filteredEmails = data
    ? getV5EmailsForPeriod(period, data)
    : { prioritaires: [], traites: [] };

  // Stats for the current period
  const periodStats = data
    ? {
        total:
          filteredEmails.prioritaires.length + filteredEmails.traites.length,
        classes: filteredEmails.traites.length,
        pj: [...filteredEmails.prioritaires, ...filteredEmails.traites].reduce(
          (acc, e) => acc + e.pieces_jointes.length,
          0
        ),
      }
    : { total: 0, classes: 0, pj: 0 };

  // Date header
  const todayLabel = format(new Date(), "EEEE d MMMM", { locale: fr });

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-0 sm:px-2 pb-16">
        {/* ---------------------------------------------------------------- */}
        {/* HEADER                                                            */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
              {data ? `Bonjour, ${data.nom_avocat}` : "Bonjour"}
            </h1>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5 capitalize">
              {todayLabel}
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-150 disabled:opacity-40"
            aria-label="Actualiser"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* ---- Period filter tabs ---- */}
        <div className="flex gap-1.5 mb-6 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-xl w-fit">
          {(["24h", "7j", "30j"] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                period === p
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
              aria-pressed={period === p}
            >
              {p}
            </button>
          ))}
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : (
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* ------------------------------------------------------------ */}
            {/* HERO STAT                                                      */}
            {/* ------------------------------------------------------------ */}
            <div className="mb-5 bg-zinc-900 dark:bg-zinc-950 rounded-2xl px-6 py-6 relative overflow-hidden">
              {/* Background accent */}
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-orange-400 rounded-full blur-3xl" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-400 rounded-full blur-3xl" />
              </div>

              <div className="relative">
                <p className="text-[11px] tracking-[0.15em] uppercase text-zinc-400 mb-3">
                  Temps récupéré ce matin
                </p>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-[56px] font-black leading-none tracking-tight text-white">
                    <AnimatedNumber value={data?.temps_gagne_minutes ?? 0} />
                  </span>
                  <span className="text-[22px] font-bold text-zinc-300 mb-2 leading-none">
                    min
                  </span>
                </div>
                <p className="text-[13px] text-zinc-400">
                  économisées grâce à Donna
                </p>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* STAT PILLS                                                     */}
            {/* ------------------------------------------------------------ */}
            <div className="flex gap-2 mb-5">
              <StatPill value={periodStats.total} label="Emails" accent />
              <StatPill value={periodStats.classes} label="Classés" />
              <StatPill value={periodStats.pj} label="PJ" />
            </div>

            {/* ------------------------------------------------------------ */}
            {/* NARRATIVE DONNA                                                */}
            {/* ------------------------------------------------------------ */}
            {data?.narrative && (
              <div className="mb-6 px-4 py-3.5 bg-blue-50 dark:bg-blue-950/30 rounded-2xl ring-1 ring-blue-100 dark:ring-blue-900/50">
                <p className="text-[10px] tracking-[0.12em] uppercase text-blue-400 dark:text-blue-500 font-medium mb-1.5">
                  Donna
                </p>
                <p className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {data.narrative}
                </p>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* EMAILS PRIORITAIRES                                            */}
            {/* ------------------------------------------------------------ */}
            <div className="mb-2 flex items-center justify-between">
              <SectionTitle>
                Prioritaires · {filteredEmails.prioritaires.length}
              </SectionTitle>
              {filteredEmails.prioritaires.some((e) => e.priority === "urgent") && (
                <div className="flex items-center gap-1 text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">
                    Urgent
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2.5 mb-6">
              {filteredEmails.prioritaires.length === 0 ? (
                <div className="py-8 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 ring-1 ring-zinc-100 dark:ring-zinc-800">
                  <p className="text-[13px] text-zinc-400">
                    Aucun email prioritaire sur cette période
                  </p>
                </div>
              ) : (
                filteredEmails.prioritaires.map((email) => (
                  <EmailRow
                    key={email.id}
                    email={email}
                    onOpen={(e) => setSelectedEmail(v5EmailToHookEmail(e))}
                  />
                ))
              )}
            </div>

            {/* ------------------------------------------------------------ */}
            {/* EMAILS TRAITES — collapsible                                   */}
            {/* ------------------------------------------------------------ */}
            <button
              className="w-full flex items-center justify-between mb-2 group"
              onClick={() => setTreatedExpanded((o) => !o)}
              aria-expanded={treatedExpanded}
            >
              <SectionTitle>
                Traités · {filteredEmails.traites.length}
              </SectionTitle>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                  treatedExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {treatedExpanded && (
                <motion.div
                  key="treated"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pb-4">
                    {filteredEmails.traites.length === 0 ? (
                      <div className="py-8 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 ring-1 ring-zinc-100 dark:ring-zinc-800">
                        <p className="text-[13px] text-zinc-400">
                          Aucun email traité sur cette période
                        </p>
                      </div>
                    ) : (
                      filteredEmails.traites.map((email) => (
                        <EmailRow
                          key={email.id}
                          email={email}
                          onOpen={(e) => setSelectedEmail(v5EmailToHookEmail(e))}
                        />
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ------------------------------------------------------------ */}
            {/* WEEKLY CHART                                                   */}
            {/* ------------------------------------------------------------ */}
            <div className="mt-6 p-4 bg-white dark:bg-zinc-900 rounded-2xl ring-1 ring-zinc-100 dark:ring-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <SectionTitle>Cette semaine</SectionTitle>
                <FileText className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
              </div>
              {data?.week_stats && <WeekBarChart stats={data.week_stats} />}
            </div>
          </motion.div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* EMAIL DRAWER                                                      */}
        {/* ---------------------------------------------------------------- */}
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
      </div>
    </DashboardLayout>
  );
};

export default DashboardV5;
