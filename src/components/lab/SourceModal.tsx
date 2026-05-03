// SourceModal — "Donna t'explique" narrative card for an event
// Shows the date prominently, what Donna understood, contextual details, source excerpt,
// and a discreet link to the original email.

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EventV1, EventSource } from "@/lib/api/v1-lab";
import { fetchEventSource } from "@/lib/api/v1-lab";

interface SourceModalProps {
  event: EventV1 | null;
  open: boolean;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  hearing: "Audience",
  filing_deadline: "Échéance de dépôt",
  meeting: "Rendez-vous",
  procedural_deadline: "Échéance procédurale",
  commercial_deadline: "Échéance commerciale",
  unknown: "Date à préciser",
};

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  hearing:             { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200" },
  filing_deadline:     { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  meeting:             { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  procedural_deadline: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  commercial_deadline: { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  unknown:             { bg: "bg-gray-50",   text: "text-gray-700",   border: "border-gray-200" },
};

function formatDateLabel(iso: string): string {
  try {
    return format(parseISO(iso), "EEEE d MMMM yyyy", { locale: fr });
  } catch {
    return iso;
  }
}

function formatTimeLabel(time: string | null): string | null {
  if (!time) return null;
  const hhmm = time.slice(0, 5);
  return hhmm.replace(":", "h");
}

function cleanField(v: string | null | undefined): string | null {
  if (!v) return null;
  const t = v.trim();
  if (!t) return null;
  if (/^[.\-–—\/:]+$/.test(t)) return null;
  if (/^(à préciser|n\/?a|inconnu|non renseigné|non précisé)$/i.test(t)) return null;
  return t.replace(/^[:\s]+/, "");
}

export function SourceModal({ event, open, onClose }: SourceModalProps) {
  const [source, setSource] = useState<EventSource | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !event) return;
    setSource(null);
    setLoading(true);
    fetchEventSource(event.id)
      .then((s) => setSource(s))
      .catch(() => { /* silent — we still show the event content */ })
      .finally(() => setLoading(false));
  }, [open, event]);

  if (!event) return null;

  const typeLabel = TYPE_LABELS[event.event_type] ?? "Événement";
  const typeColor = TYPE_COLORS[event.event_type] ?? TYPE_COLORS.unknown;
  const dateLabel = formatDateLabel(event.date);
  const timeLabel = formatTimeLabel(event.time);

  const gmailUrl =
    source?.kind === "email" ? source.gmail_thread_url ?? null : null;
  const attachmentUrl =
    source?.kind === "attachment" ? source.signed_url ?? null : null;
  const attachmentName =
    source?.kind === "attachment" ? source.filename ?? null : null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          {/* Type pill */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border w-fit mb-3 ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}
          >
            <Calendar className="h-3 w-3" />
            {typeLabel}
          </div>

          {/* Date in big */}
          <div className="text-2xl sm:text-3xl font-serif font-semibold capitalize tracking-tight leading-tight">
            {dateLabel}
            {timeLabel && (
              <span className="text-muted-foreground font-normal"> · {timeLabel}</span>
            )}
          </div>

          {/* Event title */}
          <DialogTitle className="text-base font-medium text-foreground/80 mt-2 leading-snug">
            {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* "Ce que Donna a compris" */}
          {event.description && (
            <div className="p-4 rounded-lg bg-muted/40 border border-muted">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Ce que Donna a compris
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {event.description}
              </p>
            </div>
          )}

          {/* Contextual details — only show fields with meaningful content */}
          {(() => {
            const cClient = cleanField(event.client);
            const cCounter = cleanField(event.counterparty);
            const cCourt = cleanField(event.court_or_context);
            const cRef = cleanField(event.case_ref);
            const hasAny = cClient || cCounter || cCourt || cRef;
            if (!hasAny) return null;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {cClient && (
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">Client</p>
                    <p>{cClient}</p>
                  </div>
                )}
                {cCounter && (
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">Partie adverse</p>
                    <p>{cCounter}</p>
                  </div>
                )}
                {cCourt && (
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">Lieu / Tribunal</p>
                    <p>{cCourt}</p>
                  </div>
                )}
                {cRef && (
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">Référence</p>
                    <p>{cRef}</p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Source excerpt */}
          {event.source_excerpt && (
            <div className="border-l-2 border-muted-foreground/20 pl-3 py-0.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Extrait de l'email source
              </p>
              <p className="text-xs italic text-muted-foreground leading-relaxed">
                « {event.source_excerpt} »
              </p>
            </div>
          )}

          {/* Discreet link to source */}
          <div className="pt-2 border-t flex items-center gap-3 text-xs text-muted-foreground">
            {loading ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Chargement de la source…
              </span>
            ) : gmailUrl ? (
              <button
                type="button"
                onClick={() => window.open(gmailUrl, "_blank")}
                className="hover:text-foreground inline-flex items-center gap-1 underline underline-offset-2"
              >
                Voir l'email d'origine
                <ExternalLink className="h-3 w-3" />
              </button>
            ) : attachmentUrl ? (
              <button
                type="button"
                onClick={() => window.open(attachmentUrl, "_blank")}
                className="hover:text-foreground inline-flex items-center gap-1 underline underline-offset-2"
              >
                Voir la pièce jointe{attachmentName ? ` (${attachmentName})` : ""}
                <ExternalLink className="h-3 w-3" />
              </button>
            ) : (
              <span className="opacity-60">Source non disponible</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
