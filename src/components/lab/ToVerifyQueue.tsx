// ToVerifyQueue — sidebar showing events that need human review
import type { EventV1 } from "@/lib/api/v1-lab";
import { EventCard } from "./EventCard";
import { AlertCircle } from "lucide-react";

interface ToVerifyQueueProps {
  events: EventV1[];
  onSourceClick?: (event: EventV1) => void;
  onActionDone?: (id: string, action: 'confirm' | 'dismiss') => void;
}

export function ToVerifyQueue({ events, onSourceClick, onActionDone }: ToVerifyQueueProps) {
  const pending = events.filter(
    (e) => e.status === 'to_verify' && e.user_action !== 'confirmed' && e.user_action !== 'dismissed'
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <h2 className="text-sm font-semibold">A vérifier</h2>
        {pending.length > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            {pending.length}
          </span>
        )}
      </div>

      {pending.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Aucun événement à vérifier. Bonne journée.
        </p>
      ) : (
        <div className="space-y-3">
          {pending.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              compact
              onSourceClick={onSourceClick}
              onActionDone={onActionDone}
            />
          ))}
        </div>
      )}
    </div>
  );
}
