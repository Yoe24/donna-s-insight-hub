/**
 * Dashboard V3 — Briefing conversationnel style ChatGPT
 *
 * Donna "parle" dans un flux de bulles/messages.
 * Mobile-first (375px). Dark mode supporté.
 * En mode démo : mocks locaux V3 (mock-briefing-v3.ts), zéro appel API.
 * En mode réel : API /api/briefs/today + données réelles.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  RefreshCw,
  Mail,
  Paperclip,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiGet, apiPost } from "@/lib/api";
import { isDemo } from "@/lib/auth";
import { EmailDrawer } from "@/components/EmailDrawer";
import type { Email } from "@/hooks/useEmails";
import {
  getV3Stats,
  getV3ActiveDossiers,
  getV3FilteredForPeriod,
  type V3Dossier,
  type V3Email,
  type V3Stats,
} from "@/lib/mock-briefing-v3";
import {
  mockConfig,
  type BriefingData,
  type BriefingDossier,
  type PeriodStats,
} from "@/lib/mock-briefing";
import {
  BriefingDetailPanel,
  type DossierEmail,
} from "@/components/BriefingDetailPanel";
import { GuidedTour } from "@/components/GuidedTour";
import { isTourCompleted } from "@/lib/tour-state";

type PeriodFilter = "24h" | "7j" | "30j";

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  "24h": "24h",
  "7j": "7 jours",
  "30j": "30 jours",
};

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: "easeOut" as const },
};

function stagger(i: number) {
  return { ...fadeUp, transition: { ...fadeUp.transition, delay: i * 0.07 } };
}

function formatMailDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const hhmm = `${date.getHours()}h${String(date.getMinutes()).padStart(2, "0")}`;
    if (diffHours < 1) return `il y a ${Math.max(1, Math.floor(diffMs / 60000))} min`;
    if (diffHours < 24 && date.getDate() === now.getDate()) return `aujourd'hui ${hhmm}`;
    if (diffHours < 48) return `hier ${hhmm}`;
    return format(date, "d MMM", { locale: fr });
  } catch { return ""; }
}

function urgenceDot(u: "haute" | "moyenne" | "basse") {
  if (u === "haute") return "bg-red-500";
  if (u === "moyenne") return "bg-amber-400";
  return "bg-emerald-400";
}

function urgenceBadgeClass(u: "haute" | "moyenne" | "basse") {
  if (u === "haute") return "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800 border-0";
  if (u === "moyenne") return "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800 border-0";
  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800 border-0";
}

function urgenceLabel(u: "haute" | "moyenne" | "basse") {
  if (u === "haute") return "Urgent";
  if (u === "moyenne") return "À traiter";
  return "Pour info";
}

function convertV3EmailToDrawer(email: V3Email): Email {
  return {
    id: email.id,
    expediteur: `${email.expediteur} <${email.email_from}>`,
    objet: email.objet,
    resume: email.resume,
    brouillon: email.brouillon_mock,
    pipeline_step: email.dossier_id ? "pret_a_reviser" : "ignore",
    contexte_choisi: "",
    statut: email.dossier_id ? "traite" : "ignore",
    created_at: email.date,
    updated_at: email.date,
    contenu: email.corps_original,
    dossier_id: email.dossier_id,
    dossier_name: email.dossier_nom ? `${email.dossier_nom} — ${email.dossier_domaine}` : null,
    from_email: email.email_from,
    email_type: email.email_type,
    attachments: email.pieces_jointes.map((pj, i) => ({
      id: `${email.id}-att-${i}`,
      filename: pj.nom,
      type: pj.type_mime.includes("pdf") ? "pdf" : pj.type_mime.includes("image") ? "image" : "other",
      size: pj.taille,
    })),
  } as unknown as Email;
}

function DonnaAvatar({ size = "sm" }: { size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-9 h-9 text-sm font-semibold" : "w-7 h-7 text-xs font-semibold";
  return (
    <div className={`${cls} rounded-full bg-[#1e3a5f] text-white flex items-center justify-center shrink-0 select-none`} aria-hidden="true">
      D
    </div>
  );
}

function BubbleCard({ children, className = "", dashed = false }: { children: React.ReactNode; className?: string; dashed?: boolean }) {
  return (
    <div className={`rounded-2xl bg-muted/40 dark:bg-muted/15 border ${dashed ? "border-dashed border-border/50" : "border-border/40"} px-4 py-4 w-full ${className}`}>
      {children}
    </div>
  );
}

function BubbleHeader({ label = "Donna" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.14em]" aria-hidden="true">{label}</span>
    </div>
  );
}

function PjChip({ nom, resume_ia, onClick }: { nom: string; resume_ia?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} title={resume_ia} className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-background border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors" aria-label={`Pièce jointe : ${nom}`}>
      <Paperclip className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="truncate max-w-[160px]">{nom}</span>
    </button>
  );
}

function StatsBubble({ stats, nomAvocat, period }: { stats: V3Stats; nomAvocat: string; period: PeriodFilter }) {
  const h = new Date().getHours();
  const greeting = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  const periodLabel = period === "24h" ? "dans les dernières 24 heures" : period === "7j" ? "ces 7 derniers jours" : "ces 30 derniers jours";
  const urgentsLabel = stats.dossiers_urgents > 0 ? `${stats.dossiers_urgents} dossier${stats.dossiers_urgents > 1 ? "s nécessitent" : " nécessite"} votre attention.` : "Rien d'urgent, vous pouvez traiter à votre rythme.";

  return (
    <motion.div {...stagger(0)} className="flex gap-3 w-full">
      <DonnaAvatar />
      <div className="flex-1 min-w-0">
        <BubbleCard>
          <BubbleHeader />
          <p className="text-sm font-medium text-foreground leading-relaxed">{greeting}{nomAvocat ? ` ${nomAvocat}` : ""},</p>
          <p className="text-sm text-foreground leading-relaxed mt-2">
            J'ai analysé <span className="font-semibold">{stats.total} email{stats.total > 1 ? "s" : ""}</span> {periodLabel}. {stats.dossier_emails} concernent vos dossiers, {stats.filtered_emails} ont été filtrés automatiquement.{" "}
            {stats.pieces_jointes_count > 0 && <>J'ai extrait et résumé <span className="font-semibold">{stats.pieces_jointes_count} pièce{stats.pieces_jointes_count > 1 ? "s jointes" : " jointe"}</span>. </>}
            {urgentsLabel}
          </p>
          {stats.temps_gagne_minutes > 0 && (
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Environ <span className="font-medium text-foreground">{stats.temps_gagne_minutes} min</span> économisées</span>
            </div>
          )}
        </BubbleCard>
      </div>
    </motion.div>
  );
}

function DossierBubble({ dossier, index, onEmailClick, onDraftClick, onViewDossier }: { dossier: V3Dossier; index: number; onEmailClick: (email: V3Email) => void; onDraftClick: (email: V3Email) => void; onViewDossier: (dossierId: string) => void }) {
  const [emailsExpanded, setEmailsExpanded] = useState(false);
  const firstEmail = dossier.emails[0] ?? null;
  const allPj = dossier.emails.flatMap((e) => e.pieces_jointes);
  const draftEmail = dossier.emails.find((e) => e.brouillon_mock !== null) ?? null;

  return (
    <motion.div {...stagger(index + 1)} className="flex gap-3 w-full">
      <DonnaAvatar />
      <div className="flex-1 min-w-0">
        <BubbleCard>
          <div className="flex items-start gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full mt-[5px] shrink-0 ${urgenceDot(dossier.urgence)}`} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground leading-snug">{dossier.nom}</span>
                <Badge className={`text-[10px] px-2 py-0.5 ${urgenceBadgeClass(dossier.urgence)}`}>{urgenceLabel(dossier.urgence)}</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{dossier.domaine}</p>
            </div>
          </div>

          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{dossier.message_donna}</p>

          {allPj.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3" aria-label="Pièces jointes">
              {allPj.map((pj, i) => <PjChip key={i} nom={pj.nom} resume_ia={pj.resume_ia} />)}
            </div>
          )}

          {dossier.emails.length > 0 && (
            <div className="mt-4">
              <button onClick={() => setEmailsExpanded(!emailsExpanded)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors" aria-expanded={emailsExpanded} aria-controls={`emails-${dossier.id}`}>
                {emailsExpanded ? <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {dossier.emails.length} email{dossier.emails.length > 1 ? "s reçus" : " reçu"}
              </button>
              <AnimatePresence>
                {emailsExpanded && (
                  <motion.div id={`emails-${dossier.id}`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="mt-2 divide-y divide-border/30 border border-border/40 rounded-xl overflow-hidden">
                      {dossier.emails.map((email) => (
                        <button key={email.id} onClick={() => onEmailClick(email)} className="w-full text-left px-3.5 py-2.5 hover:bg-background/70 transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-foreground truncate">{email.expediteur}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">{formatMailDate(email.date)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{email.objet}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border/40">
            {firstEmail && (
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => onEmailClick(firstEmail)}>
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                Voir l'email
              </Button>
            )}
            {draftEmail && (
              <Button size="sm" className="h-8 text-xs gap-1.5 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white dark:bg-[#1e3a5f] dark:hover:bg-[#1e3a5f]/80" onClick={() => onDraftClick(draftEmail)}>
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Brouillon prêt
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground ml-auto" onClick={() => onViewDossier(dossier.id)}>
              Dossier complet
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Button>
          </div>
        </BubbleCard>
        {firstEmail && <p className="text-[10px] text-muted-foreground mt-1 ml-1" aria-hidden="true">Dernier email {formatMailDate(firstEmail.date)}</p>}
      </div>
    </motion.div>
  );
}

function FilteredBubble({ emails, index, onEmailClick }: { emails: V3Email[]; index: number; onEmailClick: (email: V3Email) => void }) {
  const [expanded, setExpanded] = useState(false);
  if (emails.length === 0) return null;

  const categoryLabel = (cat: V3Email["category"]) => {
    if (cat === "newsletter") return "Newsletter";
    if (cat === "spam") return "Pub";
    return "Notification";
  };

  return (
    <motion.div {...stagger(index)} className="flex gap-3 w-full">
      <DonnaAvatar />
      <div className="flex-1 min-w-0">
        <BubbleCard dashed>
          <BubbleHeader label="Donna — filtrage" />
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-foreground leading-relaxed">
              J'ai classé <span className="font-semibold">{emails.length} email{emails.length > 1 ? "s" : ""}</span> sans intérêt pour vos dossiers — newsletters, notifications, publicités. Rien à faire de votre côté.
            </p>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-3" aria-expanded={expanded}>
            {expanded ? <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
            Voir les {emails.length} emails filtrés
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="mt-2 divide-y divide-border/30 border border-border/40 rounded-xl overflow-hidden">
                  {emails.map((email) => (
                    <button key={email.id} onClick={() => onEmailClick(email)} className="w-full text-left px-3.5 py-2 hover:bg-background/70 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-foreground truncate">{email.expediteur}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">{categoryLabel(email.category)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{email.objet}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </BubbleCard>
      </div>
    </motion.div>
  );
}

function EmptyBubble({ period }: { period: PeriodFilter }) {
  const label = period === "24h" ? "les dernières 24 heures" : period === "7j" ? "les 7 derniers jours" : "les 30 derniers jours";
  return (
    <motion.div {...fadeUp} className="flex gap-3 w-full">
      <DonnaAvatar />
      <div className="flex-1 min-w-0">
        <BubbleCard>
          <BubbleHeader />
          <p className="text-sm text-muted-foreground">Aucun email reçu sur <span className="font-medium text-foreground">{label}</span>. Tout est calme.</p>
        </BubbleCard>
      </div>
    </motion.div>
  );
}

function LoadingBubbles() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="w-7 h-7 rounded-full shrink-0" />
          <div className="flex-1"><Skeleton className="rounded-2xl" style={{ height: i === 0 ? 96 : 140 }} /></div>
        </div>
      ))}
    </div>
  );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [nomAvocat, setNomAvocat] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("24h");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [selectedDossier, setSelectedDossier] = useState<BriefingDossier | null>(null);
  const [panelEmails, setPanelEmails] = useState<DossierEmail[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("user_id");
    if (userId) {
      import("@/lib/auth").then(({ setUserId }) => setUserId(userId));
      localStorage.setItem("donna_demo_mode", "false");
      params.delete("user_id");
      const newSearch = params.toString();
      window.history.replaceState({}, "", "/dashboard" + (newSearch ? `?${newSearch}` : ""));
    }
  }, []);

  const fetchBriefing = useCallback(async () => {
    if (isDemo()) {
      await new Promise((r) => setTimeout(r, 350));
      setNotFound(false);
      setLoading(false);
      return;
    }
    try {
      const data = await apiGet<BriefingData>("/api/briefs/today");
      setBriefing(data);
      setNotFound(false);
    } catch (e: unknown) {
      const err = e as { message?: string };
      if (err?.message?.includes("404")) setNotFound(true);
      else { console.error(e); toast.error("Impossible de charger le briefing"); }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBriefing().then(() => {
      if (isDemo() && !isTourCompleted()) setTimeout(() => setShowTour(true), 900);
    });
    if (isDemo()) {
      setNomAvocat(mockConfig.nom_avocat);
    } else {
      apiGet<{ nom_avocat?: string }>("/api/config").then((d) => { if (d?.nom_avocat) setNomAvocat(d.nom_avocat); }).catch(() => {});
    }
  }, [fetchBriefing]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      if (isDemo()) { await new Promise((r) => setTimeout(r, 800)); setNotFound(false); }
      else { await apiPost("/api/briefs/generate"); await fetchBriefing(); }
      toast.success("Briefing généré");
    } catch { toast.error("Erreur lors de la génération"); }
    finally { setGenerating(false); }
  };

  const openV3Email = (email: V3Email) => setSelectedEmail(convertV3EmailToDrawer(email));
  const goToDossier = (dossierId: string) => navigate(`/dossiers/${dossierId}`);

  const handleRealDossierClick = (d: BriefingDossier) => {
    setSelectedDossier(d);
    const inlineEmails = d.emails || d.emails_recus || [];
    if (inlineEmails.length > 0) {
      setPanelEmails(inlineEmails as unknown as DossierEmail[]);
    } else {
      apiGet<DossierEmail[]>(`/api/emails?dossier_id=${d.dossier_id}`).then((emails) => setPanelEmails(emails ?? [])).catch(() => setPanelEmails([]));
    }
  };

  const demoStats = isDemo() ? getV3Stats(period) : null;
  const demoActiveDossiers = isDemo() ? getV3ActiveDossiers(period) : [];
  const demoFilteredEmails = isDemo() ? getV3FilteredForPeriod(period) : [];

  const periodKey = period === "24h" ? "last_24h" : period === "7j" ? "last_7d" : "last_30d";
  const realDossiers = briefing?.content?.dossiers ?? [];
  const realActiveDossierIds = briefing?.content?.emails_by_period?.[periodKey] ?? [];
  const realActiveDossiers = realDossiers.filter((d) => { const c = (d.emails || d.emails_recus || []).length; return d.new_emails_count > 0 || c > 0; }).filter((d) => realActiveDossierIds.includes(d.dossier_id));
  const realPeriodStats = briefing?.content?.stats?.[periodKey] as PeriodStats | undefined;

  const dateStr = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-24 space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <div className="pt-2"><LoadingBubbles /></div>
        </div>
      </DashboardLayout>
    );
  }

  if (notFound || (!isDemo() && !briefing)) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4 text-center py-24">
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
      <div className="max-w-2xl mx-auto px-4 pb-24" data-tour="briefing">

        <motion.div {...fadeUp} className="pt-8 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-foreground leading-tight">Donna</p>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">{dateStr}</p>
            </div>
            <div className="flex rounded-lg border border-border/60 overflow-hidden text-xs shrink-0" role="group" aria-label="Filtrer par période">
              {(["24h", "7j", "30j"] as PeriodFilter[]).map((p) => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${period === p ? "bg-[#1e3a5f] text-white" : "text-muted-foreground hover:bg-muted/60"}`} aria-pressed={period === p}>
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="space-y-4" role="feed" aria-label="Briefing Donna">
          {isDemo() && demoStats && (
            <>
              <StatsBubble stats={demoStats} nomAvocat={nomAvocat} period={period} />
              {demoActiveDossiers.length === 0 ? (
                <EmptyBubble period={period} />
              ) : (
                demoActiveDossiers.map((dossier, i) => (
                  <DossierBubble key={dossier.id} dossier={dossier} index={i} onEmailClick={openV3Email} onDraftClick={openV3Email} onViewDossier={goToDossier} />
                ))
              )}
              <FilteredBubble emails={demoFilteredEmails} index={demoActiveDossiers.length + 1} onEmailClick={openV3Email} />
            </>
          )}

          {!isDemo() && briefing && (
            <>
              {realPeriodStats && (
                <motion.div {...stagger(0)} className="flex gap-3 w-full">
                  <DonnaAvatar />
                  <div className="flex-1 min-w-0">
                    <BubbleCard>
                      <BubbleHeader />
                      <p className="text-sm text-foreground leading-relaxed">
                        {briefing.content.executive_summary || `J'ai analysé ${realPeriodStats.total} emails — ${realPeriodStats.dossier_emails} liés à vos dossiers, ${realPeriodStats.general_emails} filtrés.`}
                      </p>
                      {realPeriodStats.attachments_count > 0 && (
                        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                          <Paperclip className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span><span className="font-medium text-foreground">{realPeriodStats.attachments_count}</span> pièce{realPeriodStats.attachments_count > 1 ? "s jointes extraites" : " jointe extraite"}</span>
                        </div>
                      )}
                    </BubbleCard>
                  </div>
                </motion.div>
              )}
              {realActiveDossiers.length === 0 ? (
                <EmptyBubble period={period} />
              ) : (
                realActiveDossiers.map((d, i) => (
                  <motion.div key={d.dossier_id} {...stagger(i + 1)} className="flex gap-3 w-full">
                    <DonnaAvatar />
                    <div className="flex-1 min-w-0">
                      <BubbleCard>
                        <div className="flex items-start gap-2 mb-3">
                          <div className={`w-2 h-2 rounded-full mt-[5px] shrink-0 ${d.needs_immediate_attention ? "bg-red-500" : "bg-amber-400"}`} aria-hidden="true" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-foreground">{d.name || d.nom}</span>
                              {d.needs_immediate_attention && <Badge className="text-[10px] px-2 py-0.5 bg-red-50 text-red-700 ring-1 ring-red-200 border-0">Urgent</Badge>}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{d.domain || d.domaine}</p>
                          </div>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{d.emails_narrative || d.summary}</p>
                        <div className="flex gap-2 mt-4 pt-3 border-t border-border/40">
                          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => handleRealDossierClick(d)}>
                            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                            Voir les emails
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground ml-auto" onClick={() => navigate(`/dossiers/${d.dossier_id}`)}>
                            Dossier complet
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </Button>
                        </div>
                      </BubbleCard>
                    </div>
                  </motion.div>
                ))
              )}
            </>
          )}
        </div>

        <motion.div {...fadeUp} transition={{ delay: 0.6 }} className="flex justify-center pt-10 pb-4">
          <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40" aria-label="Rafraîchir le briefing">
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
            {generating ? "Mise à jour…" : "Rafraîchir"}
          </button>
        </motion.div>
      </div>

      {!isDemo() && (
        <BriefingDetailPanel dossier={selectedDossier} emails={panelEmails} periodLabel={PERIOD_LABELS[period]} onClose={() => setSelectedDossier(null)} />
      )}

      <AnimatePresence>
        {selectedEmail && <EmailDrawer email={selectedEmail} onClose={() => setSelectedEmail(null)} />}
      </AnimatePresence>

      {showTour && <GuidedTour onComplete={() => setShowTour(false)} />}
    </DashboardLayout>
  );
};

export default Dashboard;
