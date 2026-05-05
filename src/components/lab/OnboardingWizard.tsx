/**
 * OnboardingWizard
 *
 * Overlay full-screen affiché pendant que Donna analyse la boîte mail.
 * 5 étapes séquentielles, déclenchées au refresh ou à la connexion Gmail :
 *   1. Connexion Gmail
 *   2. Analyse des 90 derniers jours
 *   3. Détection des dossiers actifs
 *   4. Identification des dates critiques
 *   5. Calendrier prêt
 *
 * Le composant joue les 5 étapes en ~30s. L'animation est dissociée du job
 * réel : la cinématique tourne pendant que le pipeline s'exécute en arrière-
 * plan. Quand le job réel termine, on accélère pour atterrir sur l'étape 5.
 */

import { useEffect, useState } from "react";
import { Check, Loader2, Mail, Folder, CalendarClock, Sparkles } from "lucide-react";

interface Step {
  id: string;
  label: string;
  detail: string;
  icon: typeof Mail;
}

const STEPS: Step[] = [
  { id: "connect",  label: "Connexion à votre boîte mail",      detail: "Lecture sécurisée via OAuth Google",                            icon: Mail },
  { id: "analyze",  label: "Analyse des 90 derniers jours",     detail: "Audiences, conclusions, ordonnances, échéances commerciales",   icon: Sparkles },
  { id: "dossiers", label: "Détection des dossiers actifs",     detail: "Regroupement automatique des échanges par affaire",             icon: Folder },
  { id: "dates",    label: "Identification des dates critiques", detail: "Une seule date pivot retenue par dossier — pas de bruit",       icon: CalendarClock },
  { id: "ready",    label: "Calendrier prêt",                    detail: "Vos prochaines échéances sont chargées",                        icon: Check },
];

interface Props {
  open: boolean;
  onComplete?: () => void;
  /** ms par étape (sauf dernière qui reste affichée jusqu'à onComplete) */
  stepDurationMs?: number;
}

export function OnboardingWizard({ open, onComplete, stepDurationMs = 5500 }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!open) {
      setActiveIdx(0);
      return;
    }
    if (activeIdx >= STEPS.length - 1) return;
    const timer = setTimeout(() => setActiveIdx((i) => Math.min(i + 1, STEPS.length - 1)), stepDurationMs);
    return () => clearTimeout(timer);
  }, [open, activeIdx, stepDurationMs]);

  useEffect(() => {
    if (!open) return;
    if (activeIdx === STEPS.length - 1) {
      const timer = setTimeout(() => onComplete?.(), 1800);
      return () => clearTimeout(timer);
    }
  }, [open, activeIdx, onComplete]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-xl px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif text-foreground tracking-tight">Donna analyse votre cabinet</h2>
          <p className="text-sm text-muted-foreground mt-2">Cela prend une trentaine de secondes la première fois.</p>
        </div>

        <ol className="space-y-3">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < activeIdx;
            const isActive = idx === activeIdx;
            const isPending = idx > activeIdx;

            return (
              <li
                key={step.id}
                className={`flex items-start gap-4 rounded-xl border px-4 py-3.5 transition-all duration-500 ${
                  isActive
                    ? "border-foreground/30 bg-foreground/[0.03] scale-[1.01]"
                    : isDone
                    ? "border-emerald-200/60 bg-emerald-50/40"
                    : "border-border/50 bg-transparent opacity-50"
                }`}
              >
                <div
                  className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center transition-colors ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isActive
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-tight ${isPending ? "text-muted-foreground" : "text-foreground"}`}>
                    {step.label}
                  </p>
                  <p className={`text-xs mt-1 leading-relaxed ${isPending ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
                    {step.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="h-1 w-48 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-foreground transition-all duration-700 ease-out"
              style={{ width: `${((activeIdx + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-muted-foreground ml-2">
            {Math.round(((activeIdx + 1) / STEPS.length) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
