/**
 * LabHome — /lab
 * Entry point for the V1 calendar feature.
 * If user already has events, redirects to /lab/calendar.
 * Otherwise shows import options (Gmail / Outlook).
 *
 * Phase 6: If user already has events and tries to re-import,
 * ask Replace (reset=1) or Append (reset=0).
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Mail, Calendar } from "lucide-react";
import { fetchEvents, startImport } from "@/lib/api/v1-lab";
import { toast } from "sonner";

type ImportState = 'idle' | 'checking' | 'importing' | 'error';

export default function LabHome() {
  const navigate = useNavigate();
  const [state, setState] = useState<ImportState>('checking');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Existing events count (if user comes back to /lab manually)
  const [existingCount, setExistingCount] = useState<number>(0);

  // Confirmation dialog: shown when user has existing events and clicks import
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<'gmail' | 'outlook' | null>(null);

  // On mount: check if user already has events
  useEffect(() => {
    fetchEvents({ count_only: true })
      .then((result) => {
        if (result.count > 0) {
          // User has events — they can still reach this page via direct URL.
          // Store count so the confirmation dialog can display it.
          setExistingCount(result.count);
          // Auto-redirect only if they have events (normal flow)
          navigate('/lab/calendar', { replace: true });
        } else {
          setState('idle');
        }
      })
      .catch(() => {
        // If check fails, show import UI anyway
        setState('idle');
      });
  }, [navigate]);

  async function runImport(provider: 'gmail' | 'outlook', reset: boolean) {
    setState('importing');
    setErrorMsg(null);
    try {
      await startImport(provider, { reset });
      toast.success("Import lancé. Traitement en cours...");
      navigate('/lab/calendar', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message ?? "Erreur lors du lancement de l'import");
      setState('error');
    }
  }

  function handleImportClick(provider: 'gmail' | 'outlook') {
    if (existingCount > 0) {
      // Already has events — ask Replace or Append
      setPendingProvider(provider);
      setConfirmOpen(true);
    } else {
      runImport(provider, false);
    }
  }

  function handleReplace() {
    setConfirmOpen(false);
    if (pendingProvider) runImport(pendingProvider, true);
  }

  function handleAppend() {
    setConfirmOpen(false);
    if (pendingProvider) runImport(pendingProvider, false);
  }

  if (state === 'checking') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Vérification en cours...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto pt-16 text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-muted mb-4">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Calendrier juridique</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Donna analyse vos emails pour extraire automatiquement vos audiences, dépôts,
          RDV et échéances procédurales. Connectez votre boite mail pour commencer.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/5 rounded-md border border-destructive/20 text-left">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={() => handleImportClick('gmail')}
            disabled={state === 'importing'}
          >
            {state === 'importing' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {state === 'importing' ? 'Import en cours...' : 'Connecter Gmail'}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full gap-2"
            onClick={() => handleImportClick('outlook')}
            disabled={state === 'importing'}
          >
            <Mail className="h-4 w-4" />
            Connecter Outlook
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          L'analyse porte sur les 60 derniers jours d'emails. Durée : 2 à 3 minutes.
        </p>
      </div>

      {/* ── Replace / Append dialog ── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tu as déjà {existingCount} événement{existingCount > 1 ? 's' : ''}</DialogTitle>
            <DialogDescription>
              Tu veux remplacer les événements existants (re-import complet depuis zéro)
              ou les conserver et ajouter les nouveaux ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="sm:order-first">
              Annuler
            </Button>
            <Button variant="outline" onClick={handleAppend}>
              Ajouter
            </Button>
            <Button variant="destructive" onClick={handleReplace}>
              Remplacer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
