import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OnboardingBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-1">
                Bienvenue dans Donna !
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Voici votre <strong>briefing quotidien</strong> — chaque matin, Donna résume tout ce qui s'est passé dans vos dossiers.
                Utilisez la <strong>sidebar</strong> pour naviguer dans vos dossiers, le <strong>Fil d'actualité</strong> pour voir tous les emails traités,
                et <strong>Configurez-moi</strong> pour personnaliser Donna à votre façon de travailler.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-xs text-muted-foreground hover:text-foreground -mt-1 -mr-2"
              onClick={() => setVisible(false)}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Compris
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
