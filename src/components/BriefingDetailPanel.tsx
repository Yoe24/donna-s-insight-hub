import { X, ChevronRight, Paperclip, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

  return (
    <AnimatePresence>
      {dossier && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-background border-l border-border shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4">
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

            <Separator />

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="px-6 py-4">
                {emails.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    Aucune activité sur ce dossier dans les dernières {periodLabel}.
                  </p>
                ) : (
                  <div className="space-y-0">
                    {emails.map((email, i) => (
                      <div key={email.id}>
                        {i > 0 && <Separator className="my-4" />}
                        <div className="space-y-2">
                          {/* Email header */}
                          <div className="flex items-start gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="min-w-0 space-y-0.5">
                              <p className="text-sm text-foreground">
                                <span className="text-muted-foreground">De : </span>
                                <span className="font-medium">{email.expediteur}</span>
                                <span className="text-muted-foreground text-xs ml-1">({email.email})</span>
                              </p>
                              <p className="text-sm text-foreground">
                                <span className="text-muted-foreground">Objet : </span>
                                "{email.objet}"
                              </p>
                              <p className="text-xs text-muted-foreground">{email.date}</p>
                            </div>
                          </div>

                          {/* Summary */}
                          <div className="ml-6">
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {email.resume}
                            </p>
                          </div>

                          {/* Attachments */}
                          {email.pieces_jointes && email.pieces_jointes.length > 0 && (
                            <div className="ml-6 mt-2 space-y-2">
                              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <Paperclip className="h-3 w-3" /> Pièces jointes
                              </p>
                              {email.pieces_jointes.map((pj, j) => (
                                <div
                                  key={j}
                                  className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-foreground">
                                      📄 {pj.nom} <span className="text-xs text-muted-foreground">({pj.taille})</span>
                                    </p>
                                    <Button variant="ghost" size="sm" className="text-xs h-6 px-2 text-emerald">
                                      Voir
                                    </Button>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {pj.resume}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
