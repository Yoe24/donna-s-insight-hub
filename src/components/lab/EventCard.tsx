// EventCard — displays a single calendar event with badge, metadata and action buttons
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { ExternalLink, FileText, CheckCircle, X, Edit3, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EventV1 } from "@/lib/api/v1-lab";
import { patchEvent } from "@/lib/api/v1-lab";
import { toast } from "sonner";

// ─── Type badge configuration ──────────────────────────────────────────────────

interface TypeConfig {
  label: string;
  className: string;
}

const TYPE_CONFIG: Record<string, TypeConfig> = {
  hearing:               { label: "Audience",             className: "bg-red-100 text-red-700 border-red-200" },
  filing_deadline:       { label: "Dépôt",                className: "bg-orange-100 text-orange-700 border-orange-200" },
  meeting:               { label: "RDV",                  className: "bg-blue-100 text-blue-700 border-blue-200" },
  procedural_deadline:   { label: "Échéance procédurale", className: "bg-purple-100 text-purple-700 border-purple-200" },
  commercial_deadline:   { label: "Échéance commerciale", className: "bg-green-100 text-green-700 border-green-200" },
  unknown:               { label: "À préciser",           className: "bg-gray-100 text-gray-600 border-gray-200" },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface EventCardProps {
  event: EventV1;
  onSourceClick?: (event: EventV1) => void;
  onActionDone?: (id: string, action: 'confirm' | 'dismiss') => void;
  compact?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EventCard({ event, onSourceClick, onActionDone, compact = false }: EventCardProps) {
  const [loading, setLoading] = useState<'confirm' | 'dismiss' | null>(null);
  const [expanded, setExpanded] = useState(false);

  const typeConf = TYPE_CONFIG[event.event_type] ?? TYPE_CONFIG.unknown;

  const dateLabel = (() => {
    try {
      const d = parseISO(event.date);
      return format(d, "EEE d MMM yyyy", { locale: fr });
    } catch {
      return event.date;
    }
  })();

  const timeLabel = event.time ? event.time.slice(0, 5) : null;

  async function handleAction(action: 'confirm' | 'dismiss') {
    setLoading(action);
    try {
      await patchEvent(event.id, action);
      toast.success(action === 'confirm' ? "Confirmé" : "Ignoré");
      onActionDone?.(event.id, action);
    } catch (err: any) {
      toast.error("Erreur : " + (err.message ?? "inconnue"));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className={`rounded-lg border bg-card text-card-foreground ${compact ? 'p-3' : 'p-4'}`}>
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${typeConf.className}`}>
              {typeConf.label}
            </span>
            {event.status === 'to_verify' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                A vérifier
              </span>
            )}
            {event.user_action === 'confirmed' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                <CheckCircle className="h-3 w-3" /> Confirmé
              </span>
            )}
          </div>
          <p className="font-medium text-sm text-foreground leading-snug">{event.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {dateLabel}{timeLabel ? ` · ${timeLabel}` : ''}
            {event.court_or_context ? ` · ${event.court_or_context}` : ''}
          </p>
          {event.client && (
            <p className="text-xs text-muted-foreground">Client : {event.client}</p>
          )}
        </div>

        {/* Expand toggle (non-compact) */}
        {!compact && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
            aria-label="Voir plus"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Expandable details */}
      {(expanded || compact) && (
        <div className="mt-2 space-y-1">
          {event.source_excerpt && (
            <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2 leading-snug">
              "{event.source_excerpt.slice(0, 200)}"
            </p>
          )}
          {event.counterparty && (
            <p className="text-xs text-muted-foreground">Adverse : {event.counterparty}</p>
          )}
          {event.case_ref && (
            <p className="text-xs text-muted-foreground">Réf : {event.case_ref}</p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-3">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1"
          onClick={() => onSourceClick?.(event)}
        >
          <FileText className="h-3 w-3" />
          Voir la source
        </Button>
        {event.user_action !== 'confirmed' && event.user_action !== 'dismissed' && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 text-green-700 border-green-200 hover:bg-green-50"
              onClick={() => handleAction('confirm')}
              disabled={loading !== null}
            >
              <CheckCircle className="h-3 w-3" />
              {loading === 'confirm' ? '...' : 'Confirmer'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1 text-muted-foreground hover:text-destructive"
              onClick={() => handleAction('dismiss')}
              disabled={loading !== null}
            >
              <X className="h-3 w-3" />
              {loading === 'dismiss' ? '...' : 'Ignorer'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
