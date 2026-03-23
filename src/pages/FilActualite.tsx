import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coffee, Eye, ChevronDown, Archive, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { Email } from "@/hooks/useEmails";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiGet } from "@/lib/api";
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

function ImportArchives({ emails }: { emails: Email[] }) {
  const senderCounts: Record<string, number> = {};
  emails.forEach(e => {
    senderCounts[e.expediteur] = (senderCounts[e.expediteur] || 0) + 1;
  });
  const sortedSenders = Object.entries(senderCounts).sort((a, b) => b[1] - a[1]);
  const uniqueDossiers = new Set(emails.map(e => e.metadata?.filtre?.categorie)).size;

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group">
          <Archive className="h-3.5 w-3.5" />
          <span>Voir les archives d'import</span>
          <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-3 border-border bg-card">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-foreground">
              <span className="font-medium">{emails.length} emails importés</span>, répartis sur{" "}
              <span className="font-medium">{uniqueDossiers} catégories</span>
            </p>
            <div className="space-y-1.5">
              {sortedSenders.slice(0, 10).map(([sender, count]) => (
                <div key={sender} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate mr-4">{sender}</span>
                  <span className="text-foreground font-medium tabular-nums">{count} email{count > 1 ? "s" : ""}</span>
                </div>
              ))}
              {sortedSenders.length > 10 && (
                <p className="text-xs text-muted-foreground">… et {sortedSenders.length - 10} autres expéditeurs</p>
              )}
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ── Constants ──

const PAGE_SIZE = 20;

const PIPELINE_LABELS: Record<string, string> = {
  all: "Tous",
  pret_a_reviser: "Prêt à réviser",
  en_attente: "En attente",
  filtre_rejete: "Filtrés",
};

// ── Main Component ──

const FilActualite = () => {
  const [searchParams] = useSearchParams();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [allEmails, setAllEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters
  const [filterPipeline, setFilterPipeline] = useState("all");
  const [filterDossier, setFilterDossier] = useState("all");

  // Client-side pagination
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const fetchEmails = useCallback(async () => {
    try {
      const userId = localStorage.getItem("donna_user_id");
      if (!userId) return;
      const data = await apiGet<Email[]>("/api/emails");
      setAllEmails(
        (data || []).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
      setError(false);
    } catch (e) {
      console.error("Error fetching emails:", e);
      setError(true);
      toast.error("Erreur de connexion — impossible de charger les emails");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userId = searchParams.get("user_id");
    if (userId) {
      localStorage.setItem("donna_user_id", userId);
      window.history.replaceState({}, "", "/fil");
    }
  }, [searchParams]);

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 60000);
    return () => clearInterval(interval);
  }, [fetchEmails]);

  // Compute metrics from emails
  const traites = allEmails.filter(e => e.pipeline_step === "pret_a_reviser").length;
  const enAttenteCount = allEmails.filter(e => e.pipeline_step === "en_attente").length;
  const tempsMinutes = traites * 5;
  const economise = Math.round(traites * 5 * 75 / 60);
  const animatedTraites = useAnimatedCounter(traites, 1500);

  // Extract unique dossier IDs for filter
  const dossierIds = Array.from(
    new Set(allEmails.map(e => (e as any).dossier_id).filter(Boolean))
  ) as string[];

  // Apply filters
  const filteredEmails = allEmails
    .filter(e => {
      if (filterPipeline !== "all" && e.pipeline_step !== filterPipeline) return false;
      if (filterDossier !== "all" && (e as any).dossier_id !== filterDossier) return false;
      return true;
    })
    .filter(e => e.statut !== "archive" && e.pipeline_step !== "importe");

  // Sort: non-rejected first
  const sortedEmails = [...filteredEmails].sort((a, b) => {
    const aRej = a.pipeline_step === "filtre_rejete" ? 1 : 0;
    const bRej = b.pipeline_step === "filtre_rejete" ? 1 : 0;
    return aRej - bRej;
  });

  const visibleEmails = sortedEmails.slice(0, visibleCount);
  const hasMore = visibleCount < sortedEmails.length;
  const isInboxEmpty = sortedEmails.length === 0;
  const importedEmails = allEmails.filter(e => e.pipeline_step === "importe");

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filterPipeline, filterDossier]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="mt-8 mb-10 space-y-3">
            <div className="h-16 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-2.5 pt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg border border-border p-4 flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-full bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && allEmails.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-lg font-serif text-foreground mb-2">Connexion impossible</p>
          <p className="text-sm text-muted-foreground mb-4">Impossible de charger vos emails. Vérifiez votre connexion.</p>
          <Button variant="outline" onClick={fetchEmails} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">

        {/* Header metrics */}
        <div className="mt-8 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-baseline gap-3"
          >
            <span className="text-[4rem] font-extrabold leading-none tabular-nums text-foreground">
              {animatedTraites}
            </span>
            <span className="text-base font-normal text-muted-foreground">
              emails traités
            </span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-2 text-[0.9rem] text-muted-foreground"
          >
            ⏱ {tempsMinutes}min gagnées
          </motion.p>
          {enAttenteCount > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              className="mt-1.5 text-[0.85rem] text-destructive"
            >
              ⚡ {enAttenteCount} email{enAttenteCount > 1 ? "s" : ""} nécessite{enAttenteCount > 1 ? "nt" : ""} votre attention
            </motion.p>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Select value={filterPipeline} onValueChange={setFilterPipeline}>
            <SelectTrigger className="w-44 h-8 text-xs bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PIPELINE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {dossierIds.length > 0 && (
            <Select value={filterDossier} onValueChange={setFilterDossier}>
              <SelectTrigger className="w-44 h-8 text-xs bg-card border-border">
                <SelectValue placeholder="Tous les dossiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les dossiers</SelectItem>
                {dossierIds.map(id => (
                  <SelectItem key={id} value={id}>{id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <span className="text-xs text-muted-foreground ml-auto">
            {sortedEmails.length} email{sortedEmails.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Empty state */}
        {allEmails.length === 0 ? (
          <div className="text-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-serif text-foreground mb-1">Donna analyse vos emails...</p>
            <p className="text-sm text-muted-foreground">Revenez dans quelques minutes.</p>
          </div>
        ) : isInboxEmpty ? (
          <div className="space-y-6">
            <div className="text-center py-12">
              <Coffee className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">Rien de nouveau pour l'instant</p>
            </div>
            {importedEmails.length > 0 && <ImportArchives emails={importedEmails} />}
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {visibleEmails.map((email, i) => {
                const isRejected = email.pipeline_step === "filtre_rejete";

                return (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card
                      className={`bg-card hover:shadow-md transition-all cursor-pointer group ${isRejected ? "opacity-40" : ""}`}
                      onClick={() => {
                        if (!isRejected) setSelectedEmail(email);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <SenderAvatar expediteur={email.expediteur} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground truncate">{email.expediteur}</span>
                              {isRejected ? (
                                <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-[10px] px-2 py-0.5 font-medium">Filtré</span>
                              ) : (
                                <CategorieBadge email={email} />
                              )}
                              <span className="text-[11px] text-muted-foreground ml-auto shrink-0">{formatEmailTime(email.created_at)}</span>
                            </div>
                            <p className="text-sm text-foreground/80 mt-1 truncate">{email.objet}</p>
                            {!isRejected && email.resume && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{email.resume}</p>
                            )}
                          </div>
                          {!isRejected && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="shrink-0 mt-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEmail(email);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Load more */}
            {hasMore && (
              <div className="text-center pt-4 pb-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                  className="text-xs"
                >
                  Charger plus ({sortedEmails.length - visibleCount} restants)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedEmail && (
          <EmailDrawer
            email={selectedEmail}
            onClose={() => setSelectedEmail(null)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default FilActualite;
