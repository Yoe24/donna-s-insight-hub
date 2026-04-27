import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BG,
  TEXT,
  TEXT_MUTED,
  TEXT_LIGHT,
  SIDEBAR_BG,
  ACCENT_BG,
  DOSSIER_COLORS,
} from '@/lib/donna-theme';
import { fetchCalendarEvents, type CalendarEvent } from '@/lib/calendar-events';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** djb2 hash — stable, non-cryptographic, maps arbitrary strings to int32 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // coerce to 32-bit integer
  }
  return hash;
}

const palette = Object.values(DOSSIER_COLORS);

/** Maps any dossier UUID to a palette colour via stable hash */
function colorFor(id: string | null): string {
  if (!id) return '#A0A0A0';
  const idx = Math.abs(hashString(id)) % palette.length;
  return palette[idx] ?? '#A0A0A0';
}

/** Build a local YYYY-MM-DD key from a Date (avoids UTC shift from toISOString) */
function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Take the date portion of an ISO string without timezone conversion */
function eventDateKey(iso: string): string {
  return iso.substring(0, 10);
}

function todayKey(): string {
  return formatDateKey(new Date());
}

/** Format an ISO date string to French-style "mar. 15 nov. · 14:30" */
function formatEventDate(iso: string): string {
  const date = new Date(iso);
  const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date);
  const dayMonth = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(date);
  const time = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
  return `${weekday} ${dayMonth} · ${time}`;
}

// ── DayContent types ──────────────────────────────────────────────────────────
// react-day-picker's DayContent component receives at least { date, displayMonth }.
// We only use `date`; extra props are intentionally ignored.
interface DayContentPropsLocal {
  date: Date;
  displayMonth: Date;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: () => fetchCalendarEvents(),
    staleTime: 60_000,
  });

  /** date string (YYYY-MM-DD) → array of colours for that day's events */
  const eventsByDate = useMemo<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    for (const ev of events) {
      const key = eventDateKey(ev.date_start);
      if (!map[key]) map[key] = [];
      map[key].push(colorFor(ev.dossier_id));
    }
    return map;
  }, [events]);

  /** Events from today onwards, sorted ASC by date_start */
  const sortedEvents = useMemo<CalendarEvent[]>(() => {
    const today = todayKey();
    return [...events]
      .filter(ev => eventDateKey(ev.date_start) >= today)
      .sort((a, b) => a.date_start.localeCompare(b.date_start));
  }, [events]);

  /**
   * Custom DayContent renderer — shows the day number plus coloured dots
   * (max 3) beneath for each event on that day.
   */
  const DayContent = useCallback(
    ({ date }: DayContentPropsLocal) => {
      const key = formatDateKey(date);
      const colors = eventsByDate[key] ?? [];
      return (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span>{date.getDate()}</span>
          {colors.length > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: -6,
                display: 'flex',
                gap: 2,
              }}
            >
              {colors.slice(0, 3).map((color, i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: color,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      );
    },
    [eventsByDate],
  );

  function handleEventClick(ev: CalendarEvent): void {
    if (!ev.dossier_id) return;
    const hash = ev.source_id ? `#email-${ev.source_id}` : '';
    navigate(`/dossiers/${ev.dossier_id}${hash}`);
  }

  return (
    <DashboardLayout>
      <div style={{ color: TEXT }}>
        {/* ── Header ── */}
        <div
          style={{
            backgroundColor: SIDEBAR_BG,
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: TEXT_MUTED,
                marginBottom: 4,
                margin: '0 0 4px',
              }}
            >
              CALENDRIER
            </p>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: TEXT, margin: 0 }}>
              Calendar
            </h1>
          </div>

          <Button
            disabled
            variant="outline"
            onClick={() => alert('Bientôt')}
            style={{
              borderColor: '#E5E5E5',
              color: TEXT,
              backgroundColor: ACCENT_BG,
              opacity: 1, // override disabled dimming — button is visible but non-functional
            }}
          >
            Connecter Google Calendar
          </Button>
        </div>

        {/* ── Two-column body ── */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left (2/3) — month calendar with event dots */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <div
              style={{
                borderRadius: 16,
                border: '1px solid #E5E5E5',
                backgroundColor: BG,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- DayContent prop type varies across react-day-picker minor versions */}
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                components={{ DayContent: DayContent as any }}
                className="w-full"
              />
            </div>
          </motion.div>

          {/* Right (1/3) — chronological agenda */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1], delay: 0.1 }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: TEXT_MUTED,
                marginBottom: 16,
              }}
            >
              À VENIR
            </p>

            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                ))}
              </div>
            ) : sortedEvents.length === 0 ? (
              <p
                style={{
                  color: TEXT_LIGHT,
                  fontStyle: 'italic',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                Aucun event extrait pour l&apos;instant. Les dates trouvées dans tes emails
                apparaîtront ici.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedEvents.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                    role={ev.dossier_id ? 'button' : undefined}
                    tabIndex={ev.dossier_id ? 0 : undefined}
                    onClick={() => handleEventClick(ev)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') handleEventClick(ev);
                    }}
                    style={{
                      borderRadius: 12,
                      padding: '12px 16px',
                      border: '1px solid #E5E5E5',
                      backgroundColor: BG,
                      cursor: ev.dossier_id ? 'pointer' : 'default',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* colour indicator square */}
                    <span
                      style={{
                        display: 'block',
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        backgroundColor: colorFor(ev.dossier_id),
                        marginTop: 5,
                        flexShrink: 0,
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 500,
                          fontSize: 14,
                          color: TEXT,
                          margin: '0 0 2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ev.title}
                      </p>
                      <p style={{ fontSize: 12, color: TEXT_MUTED, margin: '0 0 4px' }}>
                        {formatEventDate(ev.date_start)}
                      </p>
                      <span style={{ fontSize: 11, color: TEXT_LIGHT }}>
                        {ev.source_type === 'email' ? '📧 email' : '📎 attachment'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
