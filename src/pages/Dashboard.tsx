import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, ChevronRight, CalendarDays, Clock, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format, differenceInDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { apiGet, apiPost } from "@/lib/api";
import { isDemoMode } from "@/hooks/useDemoMode";
import { mockBriefing, type BriefingData, type BriefingDossier } from "@/lib/mock-briefing";

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [nomAvocat, setNomAvocat] = useState("");

  useEffect(() => {
    const userId = searchParams.get("user_id");
    if (userId) {
      localStorage.setItem("donna_user_id", userId);
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  const fetchBriefing = useCallback(async () => {
    if (isDemoMode()) {
      setBriefing(mockBriefing);
      setNomAvocat("Alexandra");
      setNotFound(false);
      setLoading(false);
      return;
    }
    try {
      const data = await apiGet<BriefingData>("/api/briefs/today");
      setBriefing(data);
      setNotFound(false);
    } catch (e: any) {
      if (e?.message?.includes("404")) setNotFound(true);
      else { console.error(e); toast.error("Impossible de charger le briefing"); }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBriefing();
    if (!isDemoMode()) {
      apiGet<{ nom_avocat?: string }>("/api/config")
        .then((d) => { if (d?.nom_avocat) setNomAvocat(d.nom_avocat); })
        .catch(() => {});
    }
  }, [fetchBriefing]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await apiPost("/api/briefs/generate");
      toast.success("Briefing généré");
      setLoading(true);
      setNotFound(false);
      await fetchBriefing();
    } catch { toast.error("Erreur lors de la génération"); }
    finally { setGenerating(false); }
  };

  const now = new Date();
  const h = now.getHours();
  const greeting = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = format(now, "EEEE d MMMM yyyy", { locale: fr });

  const dossiers = briefing?.content.dossiers ?? [];
  const activeDossiers = dossiers.filter((d) => d.new_emails_count > 0 || d.needs_immediate_attention);
  const attenteDossiers = dossiers.filter((d) => d.attente);
  const stats = briefing?.content.stats;

  // ── Loading ──
  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6 pt-8">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-5 w-48 mt-8" />
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  // ── No briefing ──
  if (notFound || !briefing) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto text-center py-24">
          <Loader2 className={`h-7 w-7 mx-auto mb-4 text-muted-foreground ${generating ? "animate-spin" : ""}`} />
          <p className="text-lg font-serif text-foreground mb-1">Donna prépare votre briefing…</p>
          <p className="text-sm text-muted-foreground mb-6">Votre résumé de situation sera prêt dans quelques instants.</p>
          <Button onClick={handleGenerate} disabled={generating} variant="outline" className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Générer le briefing
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto pb-16">
        {/* ── Header ── */}
        <motion.p
          {...fadeIn}
          className="pt-8 pb-8 text-lg font-serif text-foreground"
        >
          {greeting}{nomAvocat ? ` ${nomAvocat}` : ""} — <span className="capitalize">{dateStr}</span>
        </motion.p>

        {/* ── Depuis votre dernière connexion ── */}
        {activeDossiers.length > 0 && (
          <motion.section {...fadeIn} transition={{ delay: 0.1 }} className="mb-10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Depuis votre dernière connexion
            </h2>
            <div className="space-y-4">
              {activeDossiers.map((d) => (
                <DossierBriefCard key={d.dossier_id} dossier={d} navigate={navigate} />
              ))}
            </div>
          </motion.section>
        )}

        {activeDossiers.length === 0 && (
          <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-10 text-center py-12">
            <p className="text-sm text-muted-foreground">Rien de nouveau depuis votre dernière connexion.</p>
          </motion.div>
        )}

        {/* ── En attente de réponse ── */}
        {attenteDossiers.length > 0 && (
          <motion.section {...fadeIn} transition={{ delay: 0.2 }} className="mb-10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              En attente de réponse
            </h2>
            <div className="space-y-2">
              {attenteDossiers.map((d) => (
                <div
                  key={`attente-${d.dossier_id}`}
                  onClick={() => navigate(`/dossiers/${d.dossier_id}`)}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:shadow-sm cursor-pointer transition-all group"
                >
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-foreground">
                      <span className="font-medium">{d.nom}</span>
                      {" — "}
                      {d.attente!.description}
                      <span className="text-muted-foreground"> ({d.attente!.jours} jours)</span>
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Footer stats ── */}
        {stats && (
          <motion.p
            {...fadeIn}
            transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground/60 text-center pt-8"
          >
            {stats.emails_analyzed} emails traités · {stats.temps_gagne_minutes ?? 0}min gagnées
          </motion.p>
        )}
      </div>
    </DashboardLayout>
  );
};

// ── Dossier briefing card ──

function DossierBriefCard({
  dossier: d,
  navigate,
}: {
  dossier: BriefingDossier;
  navigate: (path: string) => void;
}) {
  return (
    <Card
      className="bg-card border-border hover:shadow-sm transition-all cursor-pointer overflow-hidden"
      onClick={() => navigate(`/dossiers/${d.dossier_id}`)}
    >
      <div className="flex">
        {/* Left accent */}
        <div
          className={`w-1 shrink-0 ${d.needs_immediate_attention ? "bg-destructive" : "bg-muted"}`}
        />
        <CardContent className="p-5 flex-1 min-w-0 space-y-2.5">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm text-foreground">{d.nom}</h3>
            {d.domaine && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {d.domaine}
              </span>
            )}
            {d.deadline_days !== null && d.deadline_days <= 7 && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 border-destructive/40 text-destructive bg-destructive/5"
              >
                Deadline dans {d.deadline_days}j
              </Badge>
            )}
          </div>

          {/* Narrative: emails */}
          <p className="text-sm text-foreground/80 leading-relaxed">
            {d.emails_narrative}
          </p>

          {/* Narrative: pieces jointes */}
          {d.pieces_narrative && (
            <div className="flex items-start gap-1.5">
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">{d.pieces_narrative}</p>
            </div>
          )}

          {/* Dates clés */}
          {d.dates_cles.length > 0 && (
            <div className="flex items-start gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                {d.dates_cles.map((date, i) => (
                  <p key={i} className="text-xs text-muted-foreground">{date}</p>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        {/* Chevron */}
        <div className="flex items-center pr-4">
          <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
        </div>
      </div>
    </Card>
  );
}

export default Dashboard;
