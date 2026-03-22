import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Eye, ChevronDown, X, FileText, Loader2, AlertTriangle, Clock, Mail, EyeOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { Email } from "@/hooks/useEmails";
import { useUpdateEmailStatus } from "@/hooks/useEmails";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiGet, apiPost } from "@/lib/api";
import { EmailDrawer } from "@/components/EmailDrawer";

// ── Helpers ──

function formatEmailTime(created_at: string) {
  try {
    const date = new Date(created_at);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return `Aujourd'hui à ${format(date, "HH'h'mm", { locale: fr })}`;
    }
    return format(date, "d MMM 'à' HH'h'mm", { locale: fr });
  } catch {
    return "";
  }
}

function useAnimatedCounter(target: number, duration = 1000) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [target, duration]);

  return count;
}

function senderInitial(expediteur: string): string {
  const match = expediteur.match(/^([^<]+)/);
  const name = match ? match[1].trim() : expediteur;
  const firstChar = name.replace(/[^a-zA-ZÀ-ÿ]/g, "")[0] || name[0] || "?";
  return firstChar.toUpperCase();
}

function senderColor(expediteur: string): string {
  let hash = 0;
  for (let i = 0; i < expediteur.length; i++) {
    hash = expediteur.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

function SenderAvatar({ expediteur, size = 40 }: { expediteur: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 text-white font-bold"
      style={{
        width: size,
        height: size,
        backgroundColor: senderColor(expediteur),
        fontSize: size * 0.4,
      }}
    >
      {senderInitial(expediteur)}
    </div>
  );
}

type EmailCategorie = "client" | "prospect" | "other";

function getCategorie(email: Email): EmailCategorie {
  const cat = email.metadata?.filtre?.categorie;
  if (cat === "client") return "client";
  if (cat === "prospect") return "prospect";
  return "other";
}

function CategorieBadge({ email }: { email: Email }) {
  const cat = getCategorie(email);
  if (cat === "other") return null;

  if (cat === "client") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-client-light text-client-foreground text-[10px] px-2 py-0.5 font-semibold">
        👤 Client
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-prospect-light text-prospect-foreground text-[10px] px-2 py-0.5 font-semibold">
      🌱 Prospect
    </span>
  );
}

// EmailDetailOverlay removed — using shared EmailDrawer component

// ── Briefing Sections ──

function isUrgent(email: Email): boolean {
  if (email.pipeline_step === "pret_a_reviser") return true;
  const resume = (email.resume || email.brouillon || "").toLowerCase();
  const urgentKeywords = ["urgent", "délai", "deadline", "mise en demeure", "dernier délai", "expir", "prescription", "48h", "24h", "aujourd'hui"];
  return urgentKeywords.some(kw => resume.includes(kw));
}

function isATraiter(email: Email): boolean {
  return (
    email.statut === "en_attente" &&
    email.pipeline_step !== "filtre_rejete" &&
    email.pipeline_step !== "importe" &&
    !isUrgent(email)
  );
}

function isPourInfo(email: Email): boolean {
  if (email.pipeline_step !== "filtre_rejete") return false;
  const cat = email.metadata?.filtre?.categorie;
  return !!cat && cat !== "";
}

function isIgnore(email: Email): boolean {
  if (email.pipeline_step !== "filtre_rejete") return false;
  return !isPourInfo(email);
}

function getTimeSlot(date: Date): "matin" | "apres-midi" | "soir" {
  const h = date.getHours();
  if (h < 13) return "matin";
  if (h < 18) return "apres-midi";
  return "soir";
}

const timeSlotLabel: Record<string, string> = {
  "matin": "🌅 Briefing du matin",
  "apres-midi": "☀️ Mise à jour de l'après-midi",
  "soir": "🌙 Récap de la journée",
};

interface BriefingSectionProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  emails: Email[];
  variant: "urgent" | "atraiter" | "info" | "ignore";
  defaultOpen?: boolean;
  onSelectEmail?: (email: Email) => void;
}

function BriefingSection({ title, icon, count, emails, variant, defaultOpen = true, onSelectEmail }: BriefingSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (count === 0) return null;

  const borderClass = variant === "urgent" ? "border-l-4 border-l-destructive" : variant === "atraiter" ? "border-l-4 border-l-primary" : "";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`bg-card ${borderClass}`}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left p-4 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-t-lg">
            <div className="flex items-center gap-2.5">
              {icon}
              <span className="font-semibold text-sm text-foreground">{title}</span>
              <span className={`inline-flex items-center justify-center h-5 min-w-[20px] rounded-full text-[11px] font-bold px-1.5 ${
                variant === "urgent" ? "bg-destructive text-destructive-foreground" :
                variant === "atraiter" ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {count}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-2">
            {emails.map((email) => {
              const resumeText = email.resume || "";
              const hasDraft = !!email.brouillon;

              if (variant === "info") {
                return (
                  <div key={email.id} className="flex items-center gap-3 py-2 opacity-60">
                    <SenderAvatar expediteur={email.expediteur} size={28} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground truncate">{email.expediteur}</span>
                        <span className="text-[10px] text-muted-foreground">{formatEmailTime(email.created_at)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{email.objet}</p>
                    </div>
                  </div>
                );
              }

              if (variant === "ignore") {
                return (
                  <div key={email.id} className="flex items-center gap-2 py-1 opacity-50">
                    <span className="text-xs text-muted-foreground truncate">{email.expediteur}</span>
                    <span className="text-[10px] text-muted-foreground/60">—</span>
                    <span className="text-xs text-muted-foreground truncate flex-1">{email.objet}</span>
                  </div>
                );
              }

              return (
                <Card
                  key={email.id}
                  className="bg-background hover:shadow-sm transition-all cursor-pointer group border-border"
                  onClick={() => onSelectEmail?.(email)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <SenderAvatar expediteur={email.expediteur} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground truncate">{email.expediteur}</span>
                          <CategorieBadge email={email} />
                          <span className="text-[11px] text-muted-foreground ml-auto shrink-0">{formatEmailTime(email.created_at)}</span>
                        </div>
                        <p className="text-sm text-foreground/80 mt-0.5 truncate">{email.objet}</p>
                        {analysis.resume && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{analysis.resume}</p>
                        )}
                        {hasDraft && variant === "atraiter" && (
                          <p className="text-xs text-primary mt-1.5 font-medium">✉️ Brouillon prêt — Cliquer pour réviser</p>
                        )}
                        {variant === "urgent" && (
                          <p className="text-xs text-destructive mt-1.5 font-medium">⚡ Action requise aujourd'hui</p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="shrink-0 mt-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEmail?.(email);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ── Main Dashboard (Briefing) ──

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [nomAvocat, setNomAvocat] = useState<string>("");
  const { emails, loading } = useEmails();
  const { stats } = useEmailStats();

  useEffect(() => {
    const userId = searchParams.get("user_id");
    if (userId) {
      localStorage.setItem("donna_user_id", userId);
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  useEffect(() => {
    apiGet<{ nom_avocat?: string }>("/api/config")
      .then(data => {
        if (data?.nom_avocat) setNomAvocat(data.nom_avocat);
      })
      .catch(() => {});
  }, []);

  const now = new Date();
  const currentHour = now.getHours();
  const greeting = currentHour < 12 ? "Bonjour" : currentHour < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = format(now, "d MMMM yyyy, HH'h'mm", { locale: fr });

  // Classify emails
  const urgentEmails = emails.filter(e => e.statut !== "archive" && e.statut !== "ignore" && isUrgent(e));
  const aTraiterEmails = emails.filter(e => e.statut !== "archive" && e.statut !== "ignore" && isATraiter(e));
  const pourInfoEmails = emails.filter(e => e.statut !== "archive" && e.statut !== "ignore" && isPourInfo(e));
  const ignoreEmails = emails.filter(e => e.statut !== "archive" && e.statut !== "ignore" && isIgnore(e));

  const tempsMinutes = stats.traites * 5;
  const tempsHeures = Math.floor(tempsMinutes / 60);
  const tempsMinutesRestantes = tempsMinutes % 60;
  const isHours = tempsMinutes >= 60;
  const economise = Math.round(stats.traites * 5 * 75 / 60);
  const animatedTraites = useAnimatedCounter(stats.traites, 1500);
  const animatedHeures = useAnimatedCounter(tempsHeures, 1500);
  const animatedMinutesRestantes = useAnimatedCounter(isHours ? tempsMinutesRestantes : tempsMinutes, 1500);
  const animatedEco = useAnimatedCounter(economise, 1500);

  // Group emails by time slot for the feed
  const todayEmails = emails.filter(e => {
    const d = new Date(e.created_at);
    return d.toDateString() === now.toDateString();
  });
  const timeSlots = new Map<string, Email[]>();
  todayEmails.forEach(e => {
    const slot = getTimeSlot(new Date(e.created_at));
    if (!timeSlots.has(slot)) timeSlots.set(slot, []);
    timeSlots.get(slot)!.push(e);
  });




  // Evening recap
  const showEveningRecap = currentHour >= 17;
  const responsesEnvoyees = emails.filter(e => e.statut === "valide" && new Date(e.updated_at).toDateString() === now.toDateString()).length;
  const enAttenteRestant = aTraiterEmails.length + urgentEmails.length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="mt-8 mb-10 space-y-3">
            <div className="h-8 w-72 bg-muted animate-pulse rounded" />
            <div className="h-5 w-48 bg-muted animate-pulse rounded" />
            <div className="h-16 w-full bg-muted animate-pulse rounded-xl mt-4" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4 space-y-3">
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              <div className="h-16 w-full bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-12">



        {/* Briefing Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-8 mb-8"
        >
          <h1 className="text-2xl font-serif font-bold text-foreground">
            {greeting}{nomAvocat ? ` ${nomAvocat}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Briefing du {dateStr}
          </p>
        </motion.div>

        {/* Dopamine Counter */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mb-10 rounded-xl bg-card border border-border p-5"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-3xl font-extrabold tabular-nums text-foreground">{animatedTraites}</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">emails traités</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <span className="text-3xl font-extrabold tabular-nums text-foreground">
                  {isHours ? (
                    <>{animatedHeures}<span className="text-lg font-bold">h</span>{animatedMinutesRestantes > 0 && <>{animatedMinutesRestantes}<span className="text-lg font-bold">min</span></>}</>
                  ) : (
                    <>{animatedMinutesRestantes}<span className="text-lg font-bold">min</span></>
                  )}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">gagnées</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <span className="text-3xl font-extrabold tabular-nums text-foreground">{animatedEco}<span className="text-lg font-bold">€</span></span>
                <p className="text-[11px] text-muted-foreground mt-0.5">économisés <span className="text-muted-foreground/70">(taux : 75€/h)</span></p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Briefing Sections */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
          >
            <BriefingSection
              title="Urgent"
              icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
              count={urgentEmails.length}
              emails={urgentEmails}
              variant="urgent"
              defaultOpen={true}
              onSelectEmail={setSelectedEmail}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
          >
            <BriefingSection
              title="À traiter"
              icon={<Clock className="h-4 w-4 text-primary" />}
              count={aTraiterEmails.length}
              emails={aTraiterEmails}
              variant="atraiter"
              defaultOpen={true}
              onSelectEmail={setSelectedEmail}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.3 }}
          >
            <BriefingSection
              title="Pour info"
              icon={<Mail className="h-4 w-4 text-muted-foreground" />}
              count={pourInfoEmails.length}
              emails={pourInfoEmails}
              variant="info"
              defaultOpen={true}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.3 }}
          >
            <BriefingSection
              title="Ignoré"
              icon={<EyeOff className="h-4 w-4 text-muted-foreground" />}
              count={ignoreEmails.length}
              emails={ignoreEmails}
              variant="ignore"
              defaultOpen={false}
            />
          </motion.div>
        </div>

        {/* Evening Recap */}
        {showEveningRecap && stats.traites > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.3 }}
            className="mt-8"
          >
            <Card className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">🌙</span>
                  <span className="text-sm font-semibold text-foreground">Récap de la journée</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Donna a traité <span className="font-semibold">{stats.traites} emails</span> aujourd'hui.{" "}
                  {responsesEnvoyees > 0 && (
                    <><span className="font-semibold">{responsesEnvoyees} réponse{responsesEnvoyees > 1 ? "s" : ""}</span> envoyée{responsesEnvoyees > 1 ? "s" : ""} (avec votre validation). </>
                  )}
                  {enAttenteRestant > 0 && (
                    <><span className="font-semibold">{enAttenteRestant} action{enAttenteRestant > 1 ? "s" : ""}</span> reste{enAttenteRestant > 1 ? "nt" : ""} en attente pour demain. </>
                  )}
                  Temps gagné : <span className="font-semibold">{Math.floor(tempsMinutes / 60)}h{String(tempsMinutes % 60).padStart(2, "0")}</span>.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty state */}
        {urgentEmails.length === 0 && aTraiterEmails.length === 0 && pourInfoEmails.length === 0 && ignoreEmails.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <p className="text-lg font-serif text-foreground mb-1">Tout est sous contrôle ☕</p>
            <p className="text-sm text-muted-foreground">Aucun email en attente. Donna veille pour vous.</p>
          </motion.div>
        )}
      </div>

      {selectedEmail && (
        <EmailDetailOverlay
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
