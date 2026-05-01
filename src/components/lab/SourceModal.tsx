// SourceModal — opens the original email thread or previews an attachment PDF
import { useEffect, useState } from "react";
import { ExternalLink, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { EventV1, EventSource } from "@/lib/api/v1-lab";
import { fetchEventSource } from "@/lib/api/v1-lab";

interface SourceModalProps {
  event: EventV1 | null;
  open: boolean;
  onClose: () => void;
}

export function SourceModal({ event, open, onClose }: SourceModalProps) {
  const [source, setSource] = useState<EventSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !event) return;
    setSource(null);
    setError(null);
    setLoading(true);

    fetchEventSource(event.id)
      .then((s) => { setSource(s); })
      .catch((err) => { setError(err.message ?? "Erreur inconnue"); })
      .finally(() => setLoading(false));
  }, [open, event]);

  const title = event?.title ?? "Source";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold line-clamp-2">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement de la source...
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 text-sm text-destructive bg-destructive/5 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {source && !loading && (
            <div className="space-y-4">
              {/* Source excerpt */}
              {source.source_excerpt && (
                <div className="p-3 bg-muted/50 rounded-md text-xs text-muted-foreground italic border-l-2 border-muted leading-relaxed">
                  "{source.source_excerpt}"
                </div>
              )}

              {/* Email source */}
              {source.kind === 'email' && (
                <div className="space-y-3">
                  {source.subject && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Objet : </span>
                      <span className="font-medium">{source.subject}</span>
                    </p>
                  )}
                  {source.gmail_thread_url ? (
                    <Button
                      className="gap-2"
                      onClick={() => window.open(source.gmail_thread_url!, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ouvrir dans Gmail
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {source.outlook_note ?? "Lien vers l'email non disponible."}
                    </p>
                  )}
                </div>
              )}

              {/* Attachment source */}
              {source.kind === 'attachment' && (
                <div className="space-y-3">
                  {source.filename && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Fichier : </span>
                      <span className="font-medium">{source.filename}</span>
                    </p>
                  )}
                  {source.signed_url ? (
                    <>
                      {source.mime_type === 'application/pdf' ? (
                        <iframe
                          src={source.signed_url}
                          title={source.filename ?? "Pièce jointe"}
                          className="w-full h-96 rounded border"
                        />
                      ) : (
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => window.open(source.signed_url!, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Télécharger la pièce jointe
                        </Button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {source.error ?? "URL de pièce jointe non disponible."}
                    </p>
                  )}
                </div>
              )}

              {source.kind === 'unknown' && (
                <p className="text-sm text-muted-foreground">
                  Source introuvable pour cet événement.
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
