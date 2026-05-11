/**
 * MicrosoftIntegrations — Toggles for OneDrive sync and Outlook Calendar sync.
 *
 * Shown in the Configuration page for Outlook users.
 * Uses useIntegrations hook for API calls.
 */

import { Loader2, Cloud, Calendar, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useIntegrations } from "@/hooks/useIntegrations";
import { isDemoMode } from "@/hooks/useDemoMode";

export function MicrosoftIntegrations() {
  const isDemo = isDemoMode();
  const {
    status,
    loading,
    togglingOneDrive,
    togglingCalendar,
    toggleOneDrive,
    toggleOutlookCalendar,
  } = useIntegrations();

  const isOutlookUser = status.provider === "outlook" || !isDemo;

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement des intégrations Microsoft...
      </div>
    );
  }

  // Only show this component to Outlook users
  if (!isOutlookUser && !isDemo) return null;

  const handleToggleOneDrive = async () => {
    if (isDemo) {
      toast.info("Disponible avec Outlook connecté");
      return;
    }
    try {
      const next = !status.onedrive;
      await toggleOneDrive(next);
      toast.success(
        next
          ? "Synchronisation OneDrive activée — vos dossiers apparaissent dans OneDrive"
          : "Synchronisation OneDrive désactivée"
      );
    } catch {
      toast.error("Erreur lors de la modification de la synchronisation OneDrive");
    }
  };

  const handleToggleCalendar = async () => {
    if (isDemo) {
      toast.info("Disponible avec Outlook connecté");
      return;
    }
    try {
      const next = !status.outlook_calendar;
      await toggleOutlookCalendar(next);
      toast.success(
        next
          ? "Synchronisation Outlook Calendar activée — vos échéances apparaissent dans votre calendrier"
          : "Synchronisation Outlook Calendar désactivée"
      );
    } catch {
      toast.error("Erreur lors de la modification de la synchronisation Outlook Calendar");
    }
  };

  return (
    <div className="space-y-4">
      {/* OneDrive toggle */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
            <Cloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">OneDrive</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Synchronise vos dossiers et pièces jointes dans OneDrive
            </p>
            {status.onedrive && status.onedrive_root_folder_id && (
              <a
                href="https://onedrive.live.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Voir le dossier Donna sur OneDrive
              </a>
            )}
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={status.onedrive}
          onClick={handleToggleOneDrive}
          disabled={togglingOneDrive}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            status.onedrive ? "bg-blue-600" : "bg-input"
          }`}
        >
          {togglingOneDrive ? (
            <Loader2 className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
          ) : (
            <span
              className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                status.onedrive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          )}
        </button>
      </div>

      {/* Outlook Calendar toggle */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Outlook Calendar</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Exporte vos échéances et audiences dans votre calendrier Outlook
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={status.outlook_calendar}
          onClick={handleToggleCalendar}
          disabled={togglingCalendar}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            status.outlook_calendar ? "bg-blue-600" : "bg-input"
          }`}
        >
          {togglingCalendar ? (
            <Loader2 className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
          ) : (
            <span
              className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                status.outlook_calendar ? "translate-x-5" : "translate-x-0"
              }`}
            />
          )}
        </button>
      </div>
    </div>
  );
}
