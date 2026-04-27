import { apiGet } from '@/lib/api';

export type CalendarEvent = {
  id: string;
  dossier_id: string | null;
  user_id: string;
  date_start: string;           // ISO 8601
  date_end: string | null;
  title: string;
  description: string | null;
  source_type: 'email' | 'attachment';
  source_id: string | null;
  source_filename: string | null;
  confidence: number;
  created_at: string;
};

export async function fetchCalendarEvents(params?: {
  since?: string;
  until?: string;
  dossier_id?: string;
}): Promise<CalendarEvent[]> {
  try {
    const qs = new URLSearchParams();
    if (params?.since) qs.set('since', params.since);
    if (params?.until) qs.set('until', params.until);
    if (params?.dossier_id) qs.set('dossier_id', params.dossier_id);
    const queryString = qs.toString();
    const query = queryString ? `?${queryString}` : '';
    return await apiGet<CalendarEvent[]>(`/api/calendar-events${query}`);
  } catch (err) {
    console.error('[calendar-events] fetch failed:', err);
    return [];
  }
}
