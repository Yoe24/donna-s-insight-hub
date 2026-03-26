import { X, ChevronRight, Paperclip, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import type { BriefingDossier } from "@/lib/mock-briefing";

export interface DossierEmail {
  id: string;
  expediteur: string;
  email: string;
  objet: string;
  date: string;
  resume: string;
  contenu?: string;
  pieces_jointes?: {
    nom: string;
    taille: string;
    resume: string;
  }[];
}

interface Props {
  dossier: BriefingDossier | null;
  emails: DossierEmail[];
  periodLabel: string;
  onClose: () => void;
}

export function BriefingDetailPanel({ dossier, emails, periodLabel, onClose }: Props) {
  const navigate = useNavigate();
  const safeEmails = emails || [];
  const lastEmail = safeEmails.length > 0 ? safeEmails[0] : null;

  return (
    <AnimatePresence>
      {dossier && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-background border-l border-border shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-2">
              <div className="min-w-0">
                <h2 className="text-lg font-serif font-semibold text-foreground truncate">
                  {dossier.nom}
                </h2>
                <span className="text-xs text-muted-foreground">{dossier.domaine}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <button
              onClick={() => { onClose(); navigate(`/dossiers/${dossier.dossier_id}`); }}
              className="mx-6 mb-4 text-xs text-emerald hover:underline text-left flex items-center gap-1"
            >
              Voir le dossier complet <ChevronRight className="h-3 w-3" />
            </button>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="px-6 py-4 space-y-6">
                {!lastEmail ? (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    Aucune activité sur ce dossier dans les dernières {periodLabel}.
                  </p>
                ) : (
                  <>
                    {/* Bloc 1 — Dernier email */}
                    <div className="rounded-lg border border-border bg-background pl-4 border-l-[3px] border-l-emerald">
                      <div className="p-4 space-y-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-xs text-muted-foreground">
                            De : {lastEmail.expediteur || "Expéditeur inconnu"}
                            {lastEmail.email && <span className="ml-1">({lastEmail.email})</span>}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{lastEmail.date || "—"}</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{lastEmail.objet || "Sans objet"}</p>
                        <p className="text-sm text-foreground/80 leading-relaxed">{lastEmail.resume || ""}</p>
                        <button className="text-xs text-emerald hover:underline flex items-center gap-1 pt-1">
                          Voir l'email complet <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Bloc 2 — Pièces jointes */}
                    {lastEmail.pieces_jointes && lastEmail.pieces_jointes.length > 0 && (
                      <div className="rounded-lg bg-muted/40 p-4 space-y-3">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          <Paperclip className="h-3.5 w-3.5" /> Pièces jointes
                        </p>
                        {lastEmail.pieces_jointes.map((pj, j) => (
                          <div key={j} className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2 min-w-0">
                              <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {pj.nom} <span className="text-xs text-muted-foreground font-normal">({pj.taille})</span>
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{pj.resume}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="text-xs h-7 px-3 shrink-0">
                              Ouvrir
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bloc 3 — Répondre */}
                    <div className="flex justify-center pt-2 pb-4">
                      <Button variant="outline" className="text-muted-foreground border-border">
                        Générer un brouillon de réponse
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
