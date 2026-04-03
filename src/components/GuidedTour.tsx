import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { completeTour } from "@/lib/tour-state";

interface Step {
  target: string | null; // data-tour attribute value, or null for centered
  title: string;
  text: string;
}

const DEFAULT_STEPS: Step[] = [
  {
    target: "briefing",
    title: "Votre briefing",
    text: "Chaque matin, Donna résume vos dossiers et prépare votre to-do list. Les brouillons sont déjà prêts — vous relisez et envoyez.",
  },
  {
    target: "dossiers",
    title: "Vos dossiers",
    text: "Échanges, documents, échéances — tout est visible d'un coup. Cliquez sur un email pour voir l'analyse de Donna.",
  },
  {
    target: null,
    title: "5 minutes au lieu de 2h30",
    text: "Parcourez votre briefing, cochez vos tâches, générez vos réponses. Donna fait le travail, vous gardez le contrôle.",
  },
];

interface GuidedTourProps {
  onComplete: () => void;
  steps?: Step[];
  onStepComplete?: () => void;
}

export function GuidedTour({ onComplete, steps, onStepComplete }: GuidedTourProps) {
  const STEPS = steps || DEFAULT_STEPS;
  const [step, setStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  const currentStep = STEPS[step];

  const positionTooltip = useCallback(() => {
    if (!currentStep.target) {
      setTooltipPos(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${currentStep.target}"]`);
    if (!el) { setTooltipPos(null); return; }
    const rect = el.getBoundingClientRect();
    const left = Math.min(rect.right + 16, window.innerWidth - 380);
    const top = Math.max(rect.top, 60);
    setTooltipPos({ top, left });
  }, [currentStep]);

  useEffect(() => {
    positionTooltip();
    window.addEventListener("resize", positionTooltip);
    return () => window.removeEventListener("resize", positionTooltip);
  }, [positionTooltip]);

  useEffect(() => {
    if (!currentStep.target) return;
    const el = document.querySelector(`[data-tour="${currentStep.target}"]`);
    if (!el) return;
    el.classList.add("relative", "z-[60]", "ring-4", "ring-white/20", "rounded-xl");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    return () => {
      el.classList.remove("relative", "z-[60]", "ring-4", "ring-white/20", "rounded-xl");
    };
  }, [currentStep]);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      onStepComplete?.();
    } else {
      if (!steps) completeTour();
      onComplete();
    }
  };

  const handleSkip = () => {
    if (!steps) completeTour();
    onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60"
        onClick={handleSkip}
      />

      <motion.div
        key={`tooltip-${step}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25 }}
        className="fixed z-[60] bg-background rounded-2xl shadow-2xl p-6 max-w-sm border border-border"
        style={tooltipPos ? { top: tooltipPos.top, left: tooltipPos.left } : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Donna avatar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
            D
          </div>
          <span className="text-xs text-muted-foreground">Donna vous fait visiter</span>
        </div>

        <h3 className="text-base font-semibold text-foreground mb-2">{currentStep.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{currentStep.text}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 w-1.5 rounded-full transition-colors ${i === step ? "bg-primary" : "bg-muted-foreground/30"}`} />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSkip} className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors">
              Passer
            </button>
            <Button size="sm" onClick={handleNext}>
              {step < STEPS.length - 1 ? "Suivant →" : "C'est parti !"}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
