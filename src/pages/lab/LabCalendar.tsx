/**
 * LabCalendar — /lab/calendar
 * Shows all extracted events for the connected user.
 * 3 sections: Header, CalendarTimeline (main), ToVerifyQueue (sidebar).
 */

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CalendarTimeline } from "@/components/lab/CalendarTimeline";
import { ToVerifyQueue } from "@/components/lab/ToVerifyQueue";
import { SourceModal } from "@/components/lab/SourceModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Calendar, AlertCircle } from "lucide-react";
import { fetchEvents, type EventV1 } from "@/lib/api/v1-lab";
import { toast } from "sonner";

// ─── Filter bar ───────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'auto' | 'to_verify';

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'Tous',
  auto: 'Confirmés auto',
  to_verify: 'A vérifier',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LabCalendar() {
  const [events, setEvents] = useState<EventV1[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Source modal state
  const [sourceEvent, setSourceEvent] = useState<EventV1 | null>(null);
  const [sourceOpen, setSourceOpen] = useState(false);

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

  function handleSourceClick(event: EventV1) {
    setSourceEvent(event);
    setSourceOpen(true);
  }

  function handleActionDone(id: string, action: 'confirm' | 'dismiss') {
    // Update in place: mark user_action so badge reflects immediately
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, user_action: action === 'confirm' ? 'confirmed' : 'dismissed' } : e
      )
    );
  }

  async function handleRescan() {
    toast.info("Re-scan non disponible depuis cette page — relancez un import depuis /lab.");
  }

  // Events split: timeline shows all, sidebar shows only to_verify
  const allToVerify = events.filter((e) => e.status === 'to_verify');

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
            {loading ? "Chargement..." : `${events.length} événement${events.length > 1 ? 's' : ''} extrait${events.length > 1 ? 's' : ''} de vos emails`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleRescan}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Re-scanner
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
    </DashboardLayout>
  );
}
