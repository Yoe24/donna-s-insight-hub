// CalendarGrid — Monthly calendar grid view (GCal/Outlook style)
// V1: custom CSS Grid, no external lib. ~5kb.
import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  parseISO,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EventV1 } from "@/lib/api/v1-lab";
import { colorForClient } from "@/lib/dossierColors";
import { EventCard } from "./EventCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Color map by event type ──────────────────────────────────────────────────
// 5 types critiques pour avocat contentieux = couleurs vives
// "meeting" (RDV non critique) = gris désaturé pour le déprioriser

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  hearing:             { bg: "#fee2e2", text: "#b91c1c" }, // 🔴 Audience
  filing_deadline:     { bg: "#ffedd5", text: "#c2410c" }, // 🟠 Dépôt / Conclusions
  procedural_deadline: { bg: "#f3e8ff", text: "#7c3aed" }, // 🟣 Clôture / Procédure
  commercial_deadline: { bg: "#dcfce7", text: "#15803d" }, // 🟢 Échéance commerciale
  meeting:             { bg: "#f3f4f6", text: "#6b7280" }, // ⚪ RDV — déprioritisé (gris)
  unknown:             { bg: "#f3f4f6", text: "#4b5563" }, // À préciser
};

function getTypeColor(eventType: string) {
  return TYPE_COLORS[eventType] ?? TYPE_COLORS.unknown;
}

// Use the dossier color when the event matches a known dossier (by client/counterparty name).
// Falls back to the type color otherwise.
function getEventColor(
  ev: EventV1,
  dossiers: Array<{ nom_client: string }> | undefined
): { bg: string; text: string } {
  if (dossiers && dossiers.length > 0) {
    const dossierColor = colorForClient(ev.client, ev.counterparty, dossiers);
    if (dossierColor) return { bg: dossierColor.bg, text: dossierColor.text };
  }
  return getTypeColor(ev.event_type);
}

function cleanField(v: string | null | undefined): string | null {
  if (!v) return null;
  const t = v.trim();
  if (!t) return null;
  // LLM placeholders: ".", "/", "-", "—", "à préciser", "n/a"
  if (/^[.\-–—\/]+$/.test(t)) return null;
  if (/^(à préciser|n\/?a|inconnu|non renseigné|non précisé)$/i.test(t)) return null;
  return t;
}

function dossierLabel(ev: EventV1): string | null {
  const client = cleanField(ev.client);
  const counter = cleanField(ev.counterparty);
  if (client && counter) return `${client} c/ ${counter}`;
  if (client) return client;
  if (counter) return `c/ ${counter}`;
  return null;
}

// ─── DayEventsModal ───────────────────────────────────────────────────────────

interface DayEventsModalProps {
  date: Date | null;
  events: EventV1[];
  open: boolean;
  onClose: () => void;
  onSourceClick: (event: EventV1) => void;
  onActionDone: (id: string, action: "confirm" | "dismiss") => void;
}

export function DayEventsModal({
  date,
  events,
  open,
  onClose,
  onSourceClick,
  onActionDone,
}: DayEventsModalProps) {
  const title = date
    ? format(date, "EEEE d MMMM yyyy", { locale: fr })
    : "";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="capitalize text-sm font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto space-y-3 pr-1">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucun événement ce jour.
            </p>
          ) : (
            events.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                onSourceClick={onSourceClick}
                onActionDone={onActionDone}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── DayCell ─────────────────────────────────────────────────────────────────

const MAX_VISIBLE = 2;

interface DayCellProps {
  date: Date;
  events: EventV1[];
  isCurrentMonth: boolean;
  dossiers?: Array<{ nom_client: string }>;
  onCellClick: (date: Date, events: EventV1[]) => void;
  onEventClick: (event: EventV1) => void;
}

function DayCell({
  date,
  events,
  isCurrentMonth,
  dossiers,
  onCellClick,
  onEventClick,
}: DayCellProps) {
  const today = isToday(date);
  const overflow = events.length - MAX_VISIBLE;
  const visible = events.slice(0, MAX_VISIBLE);

  return (
    <div
      className={`min-h-24 p-1.5 bg-white hover:bg-gray-50 cursor-pointer transition-colors border-0 flex flex-col ${
        !isCurrentMonth ? "opacity-40" : ""
      }`}
      onClick={() => onCellClick(date, events)}
    >
      {/* Day number */}
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1 self-start ${
          today
            ? "bg-foreground text-background font-bold"
            : "text-foreground"
        }`}
      >
        {format(date, "d")}
      </span>

      {/* Event chips — 2 lignes : affaire (gras) + raison (light) */}
      <div className="flex flex-col gap-1 flex-1">
        {visible.map((ev) => {
          const { bg, text } = getEventColor(ev, dossiers);
          const dossier = dossierLabel(ev);
          const primary = dossier ?? ev.title;
          const secondary = dossier ? ev.title : null;
          return (
            <button
              key={ev.id}
              className="w-full rounded px-1.5 py-1 text-xs text-left leading-tight"
              style={{ background: bg, color: text }}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(ev);
              }}
              title={dossier ? `${dossier} — ${ev.title}` : ev.title}
            >
              <div className="flex items-baseline gap-1">
                {ev.time && (
                  <span className="font-normal opacity-75 shrink-0">
                    {ev.time.slice(0, 5)}
                  </span>
                )}
                <span className="font-semibold truncate">{primary}</span>
              </div>
              {secondary && (
                <div className="truncate opacity-75 font-normal">{secondary}</div>
              )}
            </button>
          );
        })}

        {overflow > 0 && (
          <span className="text-xs text-muted-foreground pl-1">
            +{overflow} autre{overflow > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── CalendarGrid ─────────────────────────────────────────────────────────────

export interface CalendarGridProps {
  events: EventV1[];
  initialDate?: Date;
  dossiers?: Array<{ nom_client: string }>;
  onEventClick: (event: EventV1) => void;
  onActionDone: (id: string, action: "confirm" | "dismiss") => void;
}

export function CalendarGrid({
  events,
  initialDate,
  dossiers,
  onEventClick,
  onActionDone,
}: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(initialDate ?? new Date())
  );

  // Day events modal state
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [dayModalDate, setDayModalDate] = useState<Date | null>(null);
  const [dayModalEvents, setDayModalEvents] = useState<EventV1[]>([]);

  // Build the 35–42 day grid: Mon–Sun weeks covering the month
  const gridDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    // Start on Monday (weekStartsOn: 1)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  // Index events by ISO date string
  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventV1[]>();
    for (const ev of events) {
      const existing = map.get(ev.date) ?? [];
      existing.push(ev);
      map.set(ev.date, existing);
    }
    return map;
  }, [events]);

  function handleCellClick(date: Date, dayEvents: EventV1[]) {
    setDayModalDate(date);
    setDayModalEvents(dayEvents);
    setDayModalOpen(true);
  }

  const DAY_HEADERS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: fr });

  return (
    <div className="flex flex-col h-full">
      {/* ── Navigation header ── */}
      <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
        {/* Month navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            aria-label="Mois précédent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-base font-semibold capitalize min-w-32 text-center">
            {monthLabel}
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            aria-label="Mois suivant"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={() => setCurrentMonth(startOfMonth(new Date()))}
          >
            Aujourd'hui
          </Button>
        </div>

      </div>

      {/* ── Month grid ── */}
      <div className="rounded-lg border overflow-hidden bg-gray-200 grid grid-cols-1 gap-px flex-1">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {DAY_HEADERS.map((d) => (
              <div
                key={d}
                className="bg-white text-center text-xs font-medium text-muted-foreground py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells — split gridDays into weeks */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {gridDays.map((date) => {
              const key = format(date, "yyyy-MM-dd");
              const dayEvents = eventsByDay.get(key) ?? [];
              return (
                <DayCell
                  key={key}
                  date={date}
                  events={dayEvents}
                  isCurrentMonth={isSameMonth(date, currentMonth)}
                  dossiers={dossiers}
                  onCellClick={handleCellClick}
                  onEventClick={onEventClick}
                />
              );
            })}
          </div>
      </div>

      {/* ── Mobile fallback: list view below grid on small screens ── */}
      <div className="md:hidden mt-4 space-y-2">
        {/* Show events for the current month in a compact list on mobile */}
        {Array.from(eventsByDay.entries())
          .filter(([dateStr]) => {
            try {
              return isSameMonth(parseISO(dateStr), currentMonth);
            } catch {
              return false;
            }
          })
          .sort(([a], [b]) => a.localeCompare(b))
          .flatMap(([dateStr, evs]) =>
            evs.map((ev) => ({ dateStr, ev }))
          )
          .slice(0, 20)
          .map(({ dateStr, ev }) => {
            const { bg, text } = getEventColor(ev, dossiers);
            return (
              <button
                key={ev.id}
                className="w-full text-left px-3 py-2 rounded-md text-sm flex items-start gap-2"
                style={{ background: bg, color: text }}
                onClick={() => onEventClick(ev)}
              >
                <span className="font-medium shrink-0 text-xs mt-0.5">
                  {format(parseISO(dateStr), "d MMM", { locale: fr })}
                </span>
                <span className="truncate">{ev.title}</span>
              </button>
            );
          })}
      </div>

      {/* ── Day events modal ── */}
      <DayEventsModal
        date={dayModalDate}
        events={dayModalEvents}
        open={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        onSourceClick={onEventClick}
        onActionDone={onActionDone}
      />
    </div>
  );
}
