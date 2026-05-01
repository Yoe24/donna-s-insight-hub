// CalendarTimeline — grouped-by-date list view of events
// V1: no heavy calendar lib. Simple date groups with type color coding.
import { useState } from "react";
import { format, parseISO, isToday, isTomorrow, isThisWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { EventV1 } from "@/lib/api/v1-lab";
import { EventCard } from "./EventCard";

interface CalendarTimelineProps {
  events: EventV1[];
  onSourceClick?: (event: EventV1) => void;
  onActionDone?: (id: string, action: 'confirm' | 'dismiss') => void;
}

// Group events by date (YYYY-MM-DD)
function groupByDate(events: EventV1[]): Map<string, EventV1[]> {
  const map = new Map<string, EventV1[]>();
  for (const ev of events) {
    const existing = map.get(ev.date) ?? [];
    existing.push(ev);
    map.set(ev.date, existing);
  }
  return map;
}

function formatDateLabel(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Aujourd'hui";
    if (isTomorrow(d)) return "Demain";
    if (isThisWeek(d, { locale: fr })) {
      return format(d, "EEEE d MMM", { locale: fr });
    }
    return format(d, "EEEE d MMM yyyy", { locale: fr });
  } catch {
    return dateStr;
  }
}

function DateGroup({
  date,
  events,
  onSourceClick,
  onActionDone,
}: {
  date: string;
  events: EventV1[];
  onSourceClick?: (event: EventV1) => void;
  onActionDone?: (id: string, action: 'confirm' | 'dismiss') => void;
}) {
  const [open, setOpen] = useState(true);
  const label = formatDateLabel(date);
  const toVerifyCount = events.filter((e) => e.status === 'to_verify').length;

  return (
    <div className="mb-4">
      <button
        className="flex items-center gap-2 w-full text-left py-2 group"
        onClick={() => setOpen(!open)}
      >
        <span className="text-xs text-muted-foreground">
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </span>
        <span className="text-sm font-semibold text-foreground capitalize">{label}</span>
        <span className="text-xs text-muted-foreground ml-1">
          {events.length} événement{events.length > 1 ? 's' : ''}
        </span>
        {toVerifyCount > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
            {toVerifyCount} à vérifier
          </span>
        )}
      </button>

      {open && (
        <div className="space-y-2 pl-5">
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onSourceClick={onSourceClick}
              onActionDone={onActionDone}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CalendarTimeline({ events, onSourceClick, onActionDone }: CalendarTimelineProps) {
  const grouped = groupByDate(events);
  const sortedDates = Array.from(grouped.keys()).sort();

  if (sortedDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground text-sm">Aucun événement sur cette période.</p>
      </div>
    );
  }

  return (
    <div>
      {sortedDates.map((date) => (
        <DateGroup
          key={date}
          date={date}
          events={grouped.get(date)!}
          onSourceClick={onSourceClick}
          onActionDone={onActionDone}
        />
      ))}
    </div>
  );
}
