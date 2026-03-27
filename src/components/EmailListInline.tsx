import { motion } from "framer-motion";
import { Paperclip } from "lucide-react";
import type { MockEmail } from "@/lib/mock-briefing";

const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitial(name: string): string {
  return (name || "?").charAt(0).toUpperCase();
}

function formatMailDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const hhmm = `${date.getHours()}h${String(date.getMinutes()).padStart(2, '0')}`;
    if (diffHours < 1) return `Il y a ${Math.max(1, Math.floor(diffMs / 60000))} min`;
    if (diffHours < 24 && date.getDate() === now.getDate()) return `Aujourd'hui, ${hhmm}`;
    if (diffDays < 2) return `Hier, ${hhmm}`;
    if (diffDays < 7) {
      const jours = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
      return `${jours[date.getDay()]}, ${hhmm}`;
    }
    const mois = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    return `${date.getDate()} ${mois[date.getMonth()]}, ${hhmm}`;
  } catch { return ""; }
}

interface EmailListInlineProps {
  emails: MockEmail[];
  onEmailClick: (email: MockEmail) => void;
  mode: "emails" | "pj" | "dossiers";
}

export function EmailListInline({ emails, onEmailClick, mode }: EmailListInlineProps) {
  if (mode === "pj") {
    const emailsWithPj = emails.filter((e) => e.pieces_jointes.length > 0);
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="rounded-2xl border border-border/60 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden mt-4"
      >
        <div className="px-5 py-3 border-b border-border/20">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Pièces jointes reçues
          </h3>
        </div>
        <div className="divide-y divide-border/20">
          {emailsWithPj.flatMap((email) =>
            email.pieces_jointes.map((pj, i) => (
              <button
                key={`${email.id}-pj-${i}`}
                onClick={() => onEmailClick(email)}
                className="w-full text-left px-5 py-3 hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-start gap-2.5">
                  <Paperclip className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{pj.nom}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{pj.taille}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{pj.resume_ia}</p>
                    {email.dossier_nom && (
                      <span className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600 ring-1 ring-blue-200 mt-1">
                        {email.dossier_nom}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>
    );
  }

  // mode "emails" or "dossiers" — show all emails, grouped or flat
  const displayEmails = mode === "dossiers"
    ? emails.filter((e) => e.dossier_id !== null)
    : emails;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-2xl border border-border/60 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden mt-4"
    >
      <div className="px-5 py-3 border-b border-border/20">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {mode === "dossiers" ? "Emails liés à vos dossiers" : "Tous les emails reçus"}
        </h3>
      </div>
      <div className="divide-y divide-border/20">
        {displayEmails.map((email) => {
          const shortResume = email.resume.length > 90 ? email.resume.slice(0, 87) + "…" : email.resume;
          return (
            <button
              key={email.id}
              onClick={() => onEmailClick(email)}
              className="w-full text-left px-5 py-3 hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold ${getAvatarColor(email.expediteur).bg} ${getAvatarColor(email.expediteur).text}`}>
                  {getInitial(email.expediteur)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{email.expediteur}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{formatMailDate(email.date)}</span>
                  </div>
                  <p className="text-sm text-foreground mt-0.5 truncate">{email.objet}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{shortResume}</p>
                  {email.dossier_nom && (
                    <span className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600 ring-1 ring-blue-200 mt-1">
                      {email.dossier_nom}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
