/**
 * LabCalendar — /lab/calendar
 * Shows all extracted events for the connected user.
 * 3 sections: Header, CalendarTimeline (main), ToVerifyQueue (sidebar).
 *
 * Phase 6: Re-scanner button triggers reset+import with confirmation modal.
 *          Polling on /process/status/:job_id shows progress spinner.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { startOfWeek, endOfWeek, parseISO, isWithinInterval, format } from "date-fns";
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

export default function LabCalendar() {
  const [events, setEvents] = useState<EventV1[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <DashboardLayout>
      {/* ── Accroche + Re-scanner ── */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight">Calendrier juridique</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Donna a analysé vos emails. Voici les dates clés à ne pas oublier.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground shrink-0"
          onClick={handleRescanClick}
          disabled={loading || isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          <span className="text-xs">{isProcessing ? "Re-scan…" : "Re-scanner"}</span>
        </Button>
      </div>

      {/* ── Banner this week ── */}
      {!loading && events.length > 0 && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-900">
            Cette semaine,{' '}
            <strong className="font-semibold">{thisWeekEvents.length}</strong>{' '}
            {thisWeekEvents.length > 1 ? 'dates clés' : thisWeekEvents.length === 1 ? 'date clé' : 'date clé'}{' '}
            à retenir.
          </p>
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
            onEventClick={handleSourceClick}
            onActionDone={handleActionDone}
          />
        </div>
      )}

      {/* ── Chronological list of all dates, clickable ── */}
      {!loading && sortedEvents.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Toutes les dates ({sortedEvents.length})
          </h2>
          <ul className="rounded-lg border divide-y bg-card">
            {sortedEvents.map((ev) => {
              const dateLabel = (() => {
                try {
                  return format(parseISO(ev.date), "EEE d MMM yyyy", { locale: fr });
                } catch {
                  return ev.date;
                }
              })();
              return (
                <li key={ev.id}>
                  <button
                    type="button"
                    onClick={() => handleSourceClick(ev)}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="shrink-0 w-36 text-xs font-medium text-muted-foreground capitalize">
                      {dateLabel}
                    </span>
                    {ev.time && (
                      <span className="shrink-0 w-12 text-xs text-muted-foreground tabular-nums">
                        {ev.time.slice(0, 5)}
                      </span>
                    )}
                    <span className="text-sm truncate flex-1">{ev.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
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
