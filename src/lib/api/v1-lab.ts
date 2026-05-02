// V1 Lab API client — typed wrappers around /api/v1/lab/* endpoints
import { getUserId } from '@/lib/auth';

const BASE_URL = 'https://api.donna-legal.com';

function buildUrl(path: string, params: Record<string, string> = {}): string {
  const userId = getUserId();
  const sp = new URLSearchParams({ user_id: userId, ...params });
  return `${BASE_URL}${path}?${sp.toString()}`;
}

async function safeFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => 'unknown error');
    throw new Error(`${url} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventType =
  | 'hearing'
  | 'filing_deadline'
  | 'meeting'
  | 'procedural_deadline'
  | 'commercial_deadline'
  | 'unknown';

export type EventStatus = 'auto' | 'to_verify' | 'dismissed';

export type SourceType = 'email_body' | 'attachment_pdf' | 'attachment_docx';

export interface EventV1 {
  id: string;
  event_type: EventType;
  date: string;
  time: string | null;
  timezone: string;
  title: string;
  description: string | null;
  court_or_context: string | null;
  client: string | null;
  counterparty: string | null;
  case_ref: string | null;
  confidence: number;
  status: EventStatus;
  source_message_id: string | null;
  source_attachment_id: string | null;
  source_type: SourceType;
  source_excerpt: string | null;
  user_action: 'confirmed' | 'edited' | 'dismissed' | null;
  created_at: string;
}

export interface FetchEventsResult {
  events: EventV1[];
  count: number;
}

export interface EventSourceEmail {
  kind: 'email';
  subject: string | null;
  gmail_thread_url: string | null;
  source_excerpt: string | null;
  outlook_note?: string;
}

export interface EventSourceAttachment {
  kind: 'attachment';
  filename: string | null;
  mime_type: string | null;
  signed_url: string | null;
  source_excerpt: string | null;
  error?: string;
}

export interface EventSourceUnknown {
  kind: 'unknown';
  source_excerpt: string | null;
}

export type EventSource = EventSourceEmail | EventSourceAttachment | EventSourceUnknown;

export interface ImportJobResult {
  job_id: string;
  status: string;
}

export interface ResetResult {
  deleted_events: number;
  deleted_attachments: number;
  deleted_messages: number;
}

// ─── API functions ─────────────────────────────────────────────────────────────

export interface FetchEventsFilters {
  from?: string;
  to?: string;
  status?: 'auto' | 'to_verify' | 'all';
  type?: EventType;
  count_only?: boolean;
}

export async function fetchEvents(filters: FetchEventsFilters = {}): Promise<FetchEventsResult> {
  const params: Record<string, string> = {};
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  if (filters.status) params.status = filters.status;
  if (filters.type) params.type = filters.type;
  if (filters.count_only) params.count_only = 'true';

  return safeFetch<FetchEventsResult>(buildUrl('/api/v1/lab/events', params));
}

export async function fetchEventSource(eventId: string): Promise<EventSource> {
  return safeFetch<EventSource>(buildUrl(`/api/v1/lab/events/${eventId}/source`));
}

export async function patchEvent(
  eventId: string,
  action: 'confirm' | 'edit' | 'dismiss',
  edits?: Partial<Pick<EventV1, 'title' | 'date' | 'time' | 'description' | 'court_or_context' | 'client' | 'counterparty' | 'case_ref' | 'event_type'>>
): Promise<void> {
  const userId = getUserId();
  const url = `${BASE_URL}/api/v1/lab/events/${eventId}?user_id=${encodeURIComponent(userId)}`;
  await safeFetch<unknown>(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...(edits ? { edits } : {}) }),
  });
}

export async function startImport(
  provider: 'gmail' | 'outlook',
  opts?: { reset?: boolean }
): Promise<ImportJobResult> {
  const userId = getUserId();
  const resetParam = opts?.reset ? '&reset=1' : '';
  const url = `${BASE_URL}/api/v1/lab/import?user_id=${encodeURIComponent(userId)}${resetParam}`;
  return safeFetch<ImportJobResult>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider }),
  });
}

export async function resetLabSession(): Promise<ResetResult> {
  const userId = getUserId();
  const url = `${BASE_URL}/api/v1/lab/reset?user_id=${encodeURIComponent(userId)}`;
  return safeFetch<ResetResult>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function getImportStatus(job_id: string): Promise<unknown> {
  return safeFetch<unknown>(buildUrl(`/api/v1/lab/import/status/${job_id}`));
}

export async function getProcessStatus(job_id: string): Promise<{
  job_id: string;
  status: 'processing' | 'done' | 'error';
  counts?: {
    classified: number;
    with_actionable: number;
    events_extracted: number;
    events_inserted: number;
    errors: number;
  };
  error_msg?: string;
  finished_at: string | null;
}> {
  return safeFetch(buildUrl(`/api/v1/lab/process/status/${job_id}`));
}
