/**
 * LabCalendar — /lab/calendar
 * Shows all extracted events for the connected user.
 * 3 sections: Header, CalendarTimeline (main), ToVerifyQueue (sidebar).
 *
 * Phase 6: Re-scanner button triggers reset+import with confirmation modal.
 *          Polling on /process/status/:job_id shows progress spinner.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CalendarTimeline } from "@/components/lab/CalendarTimeline";
import { ToVerifyQueue } from "@/components/lab/ToVerifyQueue";
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
import { RefreshCw, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { fetchEvents, startImport, getProcessStatus, type EventV1 } from "@/lib/api/v1-lab";
import { getUserId } from "@/lib/auth";
import { toast } from "sonner";

// ─── Filter bar ───────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'auto' | 'to_verify';

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'Tous',
  auto: 'Confirmés auto',
  to_verify: 'A vérifier',
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

export default function LabCalendar() {
  const [events, setEvents] = useState<EventV1[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

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
        status: statusFilter,
      });
      setEvents(result.events);
    } catch (err: any) {
      setError(err.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

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

  const allToVerify = events.filter((e) => e.status === 'to_verify');
  const isProcessing = rescanning || !!pollJobId;

  return (
    <DashboardLayout>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Calendrier juridique</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading
              ? "Chargement..."
              : isProcessing
              ? "Re-scan en cours..."
              : `${events.length} événement${events.length > 1 ? 's' : ''} extrait${events.length > 1 ? 's' : ''} de vos emails`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleRescanClick}
          disabled={loading || isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isProcessing ? "Re-scan en cours..." : "Re-scanner"}
        </Button>
      </div>

      {/* ── Status filter tabs ── */}
      <div className="flex gap-1 mb-6 border-b pb-0">
        {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((key) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              statusFilter === key
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {STATUS_LABELS[key]}
            {key === 'to_verify' && allToVerify.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-xs bg-yellow-100 text-yellow-700">
                {allToVerify.length}
              </span>
            )}
          </button>
        ))}
      </div>

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

      {/* ── Main layout: timeline + sidebar ── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="flex gap-6 items-start">
          {/* Main timeline */}
          <div className="flex-1 min-w-0">
            <CalendarTimeline
              events={events}
              onSourceClick={handleSourceClick}
              onActionDone={handleActionDone}
            />
          </div>

          {/* Sidebar: "A vérifier" queue — only show when there are some */}
          {allToVerify.length > 0 && (
            <div className="w-72 shrink-0 border rounded-lg p-4 bg-card">
              <ToVerifyQueue
                events={events}
                onSourceClick={handleSourceClick}
                onActionDone={handleActionDone}
              />
            </div>
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
