/**
 * LabCalendar — /lab/calendar
 * Shows all extracted events for the connected user.
 * 3 sections: Header, CalendarTimeline (main), ToVerifyQueue (sidebar).
 *
 * Phase 6: Re-scanner button triggers reset+import with confirmation modal.
 *          Polling on /process/status/:job_id shows progress spinner.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addDays,
  parseISO,
  isWithinInterval,
  format,
} from "date-fns";
import { fr } from "date-fns/locale";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CalendarGrid } from "@/components/lab/CalendarGrid";
import { SourceModal } from "@/components/lab/SourceModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { fetchEvents, startImport, getProcessStatus, type EventV1 } from "@/lib/api/v1-lab";
import { getUserId } from "@/lib/auth";
import { toast } from "sonner";
import { useDossiers } from "@/hooks/useDossiers";
import { colorForClient } from "@/lib/dossierColors";

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  hearing:             { bg: "#fee2e2", text: "#b91c1c" },
  filing_deadline:     { bg: "#ffedd5", text: "#c2410c" },
  procedural_deadline: { bg: "#f3e8ff", text: "#7c3aed" },
  commercial_deadline: { bg: "#dcfce7", text: "#15803d" },
  meeting:             { bg: "#f3f4f6", text: "#6b7280" },
  unknown:             { bg: "#f3f4f6", text: "#4b5563" },
};

// ─── Polling hook ─────────────────────────────────────────────────────────────

// Polls /process/status/:job_id every 3s until done or error.
function usePollJob(
  jobId: string | null,
  onDone: () => void,
  onError: (msg: string) => void
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!jobId) return;

    intervalRef.current = setInterval(async () => {
      try {
        const status = await getProcessStatus(jobId);
        if (status.status === 'done') {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onDone();
        } else if (status.status === 'error') {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onError(status.error_msg ?? 'Erreur de traitement');
        }
      } catch {
        // transient network error — keep polling
      }
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [jobId, onDone, onError]);
}

// ─── Component ────────────────────────────────────────────────────────────────

type TimeWindow = "24h" | "7d" | "30d";
const WINDOW_LABELS: Record<TimeWindow, string> = {
  "24h": "24h",
  "7d": "7 jours",
  "30d": "30 jours",
};

export default function LabCalendar() {
  const [events, setEvents] = useState<EventV1[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("7d");
  const { dossiers } = useDossiers();

  // Source modal state
  const [sourceEvent, setSourceEvent] = useState<EventV1 | null>(null);
  const [sourceOpen, setSourceOpen] = useState(false);

  // Re-scan modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rescanning, setRescanning] = useState(false);
  const [pollJobId, setPollJobId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEvents({
        from: '2026-01-01',
        to: '2027-12-31',
        status: 'all',
      });
      setEvents(result.events);
    } catch (err: any) {
      setError(err.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Polling: once a process job is running, poll until done then reload events
  usePollJob(
    pollJobId,
    useCallback(() => {
      setPollJobId(null);
      setRescanning(false);
      toast.success("Re-scan terminé. Événements mis à jour.");
      loadEvents();
    }, [loadEvents]),
    useCallback((msg: string) => {
      setPollJobId(null);
      setRescanning(false);
      toast.error(`Re-scan échoué : ${msg}`);
    }, [])
  );

  function handleSourceClick(event: EventV1) {
    setSourceEvent(event);
    setSourceOpen(true);
  }

  function handleActionDone(id: string, action: 'confirm' | 'dismiss') {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, user_action: action === 'confirm' ? 'confirmed' : 'dismissed' } : e
      )
    );
  }

  // Called when user clicks "Re-scanner"
  function handleRescanClick() {
    setConfirmOpen(true);
  }

  // Called when user confirms in modal
  async function handleRescanConfirm() {
    setConfirmOpen(false);
    setRescanning(true);
    setError(null);
    try {
      // startImport with reset=1: purges _v1 tables then re-ingests
      const importResult = await startImport('gmail', { reset: true });
      toast.info("Import lancé — traitement en cours...");

      // Now trigger process job
      const userId = getUserId();
      const processRes = await fetch(
        `https://api.donna-legal.com/api/v1/lab/process?user_id=${encodeURIComponent(userId)}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      );
      if (!processRes.ok) {
        throw new Error(`process failed (${processRes.status})`);
      }
      const processData = await processRes.json();
      setPollJobId(processData.job_id ?? null);

      if (!processData.job_id) {
        // No job_id means process already done synchronously (unlikely but handle)
        setRescanning(false);
        toast.success("Re-scan terminé.");
        loadEvents();
      }

      // suppress unused warning
      void importResult;
    } catch (err: any) {
      setRescanning(false);
      const msg = err.message ?? "Erreur lors du re-scan";
      setError(msg);
      toast.error(msg);
    }
  }

  const isProcessing = rescanning || !!pollJobId;

  const thisWeekEvents = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return events.filter((e) => {
      try {
        return isWithinInterval(parseISO(e.date), { start, end });
      } catch {
        return false;
      }
    });
  }, [events]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return (a.time ?? "").localeCompare(b.time ?? "");
    });
  }, [events]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const start = startOfDay(now);
    const end =
      timeWindow === "24h"
        ? endOfDay(addDays(now, 1))
        : timeWindow === "7d"
        ? endOfDay(addDays(now, 7))
        : endOfDay(addDays(now, 30));
    return sortedEvents.filter((e) => {
      try {
        return isWithinInterval(parseISO(e.date), { start, end });
      } catch {
        return false;
      }
    });
  }, [sortedEvents, timeWindow]);

  // Upcoming events (next 7 days) for "À venir cette semaine" card
  const upcoming = useMemo(() => {
    const now = new Date();
    const horizon = addDays(now, 7);
    return events
      .filter((ev) => {
        const d = parseISO(ev.date);
        return d >= startOfDay(now) && d <= endOfDay(horizon);
      })
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events]);

  return (
    <DashboardLayout>
      {/* ── Accroche ── */}
      <div className="mb-5">
        <h1 className="text-2xl font-serif font-semibold tracking-tight">Calendrier juridique</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Donna a analysé vos emails. Voici les dates clés à ne pas oublier.
        </p>
      </div>

      {/* ── À venir cette semaine ── */}
      {!loading && upcoming.length > 0 && (
        <div className="mb-6 rounded-2xl border border-border bg-gradient-to-br from-foreground/[0.02] to-transparent px-5 py-4">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              À venir cette semaine
            </h2>
            <span className="text-[11px] tabular-nums text-muted-foreground/70">
              {upcoming.length} échéance{upcoming.length > 1 ? "s" : ""}
            </span>
          </div>
          <ul className="divide-y divide-border/40">
            {upcoming.map((ev) => {
              const dateObj = parseISO(ev.date);
              const dateStr = format(dateObj, "EEE d MMM", { locale: fr });
              const daysUntil = Math.ceil((dateObj.getTime() - Date.now()) / 86400000);
              const dossierColor = colorForClient(ev.client, ev.counterparty, dossiers, ev.case_ref);
              const tone = dossierColor ?? TYPE_COLORS[ev.event_type] ?? TYPE_COLORS.unknown;
              const cClient = (ev.client || "").split(/\s+(SAS|SARL|SA|SCI|SASU|SNC|EURL|GIE)\b/i)[0].trim();
              const cCounter = (ev.counterparty || "").split(/\s+(SAS|SARL|SA|SCI|SASU|SNC|EURL|GIE)\b/i)[0].trim();
              const titleParts = cClient && cCounter ? `${cClient} c/ ${cCounter}` : cClient || cCounter || ev.title;
              return (
                <li key={ev.id}>
                  <button
                    type="button"
                    onClick={() => handleSourceClick(ev.id)}
                    className="w-full flex items-center gap-4 py-3 text-left hover:bg-foreground/[0.02] rounded-md px-2 -mx-2 transition-colors"
                  >
                    <span className="shrink-0 inline-block h-2.5 w-2.5 rounded-full" style={{ background: tone.text }} />
                    <span className="shrink-0 text-xs font-medium text-foreground tabular-nums w-24 capitalize">
                      {dateStr}
                    </span>
                    <span className="flex-1 min-w-0 text-sm text-foreground truncate">
                      <span className="font-semibold">{titleParts}</span>
                      <span className="text-muted-foreground"> — {ev.title}</span>
                    </span>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                      {daysUntil <= 0 ? "Aujourd'hui" : `J-${daysUntil}`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── Légende des 5 types critiques ── */}
      {!loading && events.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: '#fee2e2', borderColor: '#b91c1c', borderWidth: 1 }} />
            Audience
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: '#ffedd5', borderColor: '#c2410c', borderWidth: 1 }} />
            Dépôt / Conclusions
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: '#f3e8ff', borderColor: '#7c3aed', borderWidth: 1 }} />
            Clôture / Procédure
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: '#dcfce7', borderColor: '#15803d', borderWidth: 1 }} />
            Échéance commerciale
          </span>
          <span className="inline-flex items-center gap-1.5 opacity-60">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: '#f3f4f6', borderColor: '#6b7280', borderWidth: 1 }} />
            RDV
          </span>
        </div>
      )}

      {/* ── Error state ── */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-4 text-sm text-destructive bg-destructive/5 rounded-md border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Processing banner ── */}
      {isProcessing && (
        <div className="flex items-center gap-2 p-4 mb-4 text-sm text-blue-700 bg-blue-50 rounded-md border border-blue-200">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          Re-scan en cours — les événements seront mis à jour automatiquement à la fin du traitement.
        </div>
      )}

      {/* ── Calendar grid (full width, no right sidebar) ── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="min-w-0">
          <CalendarGrid
            events={events}
            dossiers={dossiers}
            onEventClick={handleSourceClick}
            onActionDone={handleActionDone}
          />
        </div>
      )}

      {/* ── Chronological list filtered by time window ── */}
      {!loading && sortedEvents.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              À venir
            </h2>
            <div className="inline-flex rounded-md border overflow-hidden text-xs">
              {(Object.keys(WINDOW_LABELS) as TimeWindow[]).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setTimeWindow(w)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    timeWindow === w
                      ? "bg-foreground text-background"
                      : "bg-background text-muted-foreground hover:text-foreground"
                  } ${w !== "24h" ? "border-l" : ""}`}
                >
                  {WINDOW_LABELS[w]}
                </button>
              ))}
            </div>
          </div>
          {filteredEvents.length === 0 ? (
            <div className="rounded-lg border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              Aucune date dans cette fenêtre.
            </div>
          ) : (
          <ul className="rounded-lg border divide-y bg-card">
            {filteredEvents.map((ev) => {
              const dateLabel = (() => {
                try {
                  return format(parseISO(ev.date), "EEE d MMM yyyy", { locale: fr });
                } catch {
                  return ev.date;
                }
              })();
              const cleanField = (v: string | null) => {
                if (!v) return null;
                const t = v.trim();
                if (!t) return null;
                if (/^[.\-–—\/]+$/.test(t)) return null;
                if (/^(à préciser|n\/?a|inconnu|non renseigné|non précisé)$/i.test(t)) return null;
                return t;
              };
              const cClient = cleanField(ev.client);
              const cCounter = cleanField(ev.counterparty);
              const dossier =
                cClient && cCounter
                  ? `${cClient} c/ ${cCounter}`
                  : cClient || (cCounter ? `c/ ${cCounter}` : null);
              const isMeeting = ev.event_type === "meeting" || ev.event_type === "unknown";
              const dossierColor = colorForClient(ev.client, ev.counterparty, dossiers, ev.case_ref);
              const lineColor = dossierColor
                ? { text: dossierColor.text }
                : (TYPE_COLORS[ev.event_type] ?? TYPE_COLORS.unknown);
              return (
                <li key={ev.id}>
                  <button
                    type="button"
                    onClick={() => handleSourceClick(ev)}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors ${isMeeting ? "opacity-70" : ""}`}
                  >
                    <span
                      className="shrink-0 w-1 h-7 rounded-full"
                      style={{ background: lineColor.text }}
                      aria-hidden
                    />
                    <span className="shrink-0 w-36 text-xs font-medium text-muted-foreground capitalize">
                      {dateLabel}
                    </span>
                    <span className="shrink-0 w-12 text-xs text-muted-foreground tabular-nums">
                      {ev.time ? ev.time.slice(0, 5) : ""}
                    </span>
                    <span className="text-sm truncate flex-1 font-medium">{ev.title}</span>
                    {dossier && (
                      <span className="shrink-0 max-w-[40%] truncate text-xs text-muted-foreground">
                        {dossier}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          )}
        </div>
      )}

      {/* ── Source modal ── */}
      <SourceModal
        event={sourceEvent}
        open={sourceOpen}
        onClose={() => setSourceOpen(false)}
      />

      {/* ── Confirm re-scan modal ── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Re-scanner depuis Gmail ?</DialogTitle>
            <DialogDescription>
              Cela va effacer tes{' '}
              <strong>{events.length} événement{events.length > 1 ? 's' : ''}</strong> actuels
              et re-importer depuis Gmail (60 derniers jours). Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleRescanConfirm}>
              Continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
