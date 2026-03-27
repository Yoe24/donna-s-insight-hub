/**
 * Dashboard — Briefing page
 *
 * In demo mode, uses local mock data (no API calls).
 * In real mode, fetches from API using the active user_id.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RefreshCw, ChevronRight, FileText } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiGet, apiPost } from "@/lib/api";
import { BriefingDetailPanel, type DossierEmail } from "@/components/BriefingDetailPanel";
import type { BriefingData, BriefingDossier, BriefingDossierEmail, PeriodStats } from "@/lib/mock-briefing";
import { mockBriefing, mockDossierEmails, mockConfig, getEmailsForPeriod, mockAllEmails } from "@/lib/mock-briefing";
import { isDemo } from "@/lib/auth";
import { EmailDrawer } from "@/components/EmailDrawer";
import { AnimatePresence } from "framer-motion";
import { GuidedTour } from "@/components/GuidedTour";
import { isTourCompleted } from "@/lib/tour-state";
import type { Email } from "@/hooks/useEmails";

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

type PeriodFilter = "24h" | "7j" | "30j";

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  "24h": "24 heures",
  "7j": "7 jours",
  "30j": "30 jours",
};

/** Lightweight email type for dossier lines — normalized from API fields */
interface DossierLineEmail {
  id: string;
  expediteur: string;
  objet: string;
  resume: string | null;
  created_at: string;
}

/** Normalize a briefing email (API shape) to DossierLineEmail */
function normalizeBriefEmail(raw: BriefingDossierEmail, index: number): DossierLineEmail {
  return {
    id: raw.id || `brief-email-${index}`,
    expediteur: raw.from_name || raw.expediteur || "",
    objet: raw.subject || raw.objet || "",
    resume: raw.summary || raw.resume || null,
    created_at: raw.date || raw.created_at || "",
  };
}

/** Get display name for a briefing dossier (API may use `name` or `nom`) */
function getDossierName(d: BriefingDossier): string {
  return d.name || d.nom || "";
}

/** Get display domain for a briefing dossier */
function getDossierDomain(d: BriefingDossier): string {
  return d.domain || d.domaine || "";
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [nomAvocat, setNomAvocat] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("24h");
  const [selectedDossier, setSelectedDossier] = useState<BriefingDossier | null>(null);
  const [panelEmails, setPanelEmails] = useState<DossierEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showTour, setShowTour] = useState(false);
  // Cache of emails per dossier for inline display
  const [dossierEmailsMap, setDossierEmailsMap] = useState<Record<string, DossierLineEmail[]>>({});

  const _now = Date.now();
  const hoursAgoTodo = (h: number) => new Date(_now - h * 3600000).toISOString();
  const daysAgoTodo = (d: number) => new Date(_now - d * 86400000).toISOString();

  const [todoItems, setTodoItems] = useState([
    { id: "todo-1", text: "Répondre à Jean-Pierre Martin sur les points de l'entretien préalable", dossier: "Martin · Droit du travail", dossier_id: "2", type: "reponse", done: false, date: hoursAgoTodo(2), hasDraft: true, draftPreview: "Maître,\n\nFaisant suite à votre email concernant le 2e entretien préalable de rupture conventionnelle, je vous confirme que les points suivants pourront être abordés :\n\n1. Indemnité supra-légale (proposition à 12 000 €)\n2. Clause de non-concurrence (levée demandée)\n3. Solde de tout compte et certificat de travail\n\nJe reste à votre disposition.\n\nCordialement,\nMe Alexandra Fernandez", attachmentSummary: null },
    { id: "todo-2", text: "Vérifier la mise en demeure reçue de BTP Pro", dossier: "Dupont · Litige commercial", dossier_id: "1", type: "lecture", done: false, date: hoursAgoTodo(5), hasDraft: false, draftPreview: null, attachmentSummary: "Mise en demeure de BTP Pro datée du 25 mars, contestation de la non-conformité des travaux, demande de paiement de 45 000 € sous 15 jours." },
    { id: "todo-3", text: "Relancer Claire Dubois pour les pièces manquantes", dossier: "Dubois · Litige immobilier", dossier_id: "5", type: "relance", done: false, date: hoursAgoTodo(8), hasDraft: true, draftPreview: "Madame Dubois,\n\nJe me permets de revenir vers vous concernant les documents que nous attendons pour compléter votre dossier avant l'audience du 15 avril :\n\n- PV de la dernière assemblée générale\n- Relevés de charges 2024-2025\n\nMerci de me les transmettre dès que possible.\n\nCordialement,\nMe Alexandra Fernandez", attachmentSummary: null },
    { id: "todo-4", text: "Consulter le rapport d'expertise Famille Roux", dossier: "Roux · Immobilier", dossier_id: "4", type: "lecture", done: true, date: daysAgoTodo(2), hasDraft: false, draftPreview: null, attachmentSummary: "Rapport d'expertise du 20 mars concluant à des malfaçons sur la toiture et l'étanchéité. Montant estimé des réparations : 28 000 €." },
    { id: "todo-5", text: "Répondre à Alice Bernard sur la procédure de divorce", dossier: "Bernard · Droit de la famille", dossier_id: "6", type: "reponse", done: true, date: daysAgoTodo(3), hasDraft: true, draftPreview: "Chère Madame Bernard,\n\nSuite à notre échange, je vous confirme que la requête en divorce a bien été déposée auprès du tribunal.\n\nCordialement,\nMe Alexandra Fernandez", attachmentSummary: null },
    { id: "todo-6", text: "Préparer les pièces pour l'audience TGI (Dubois)", dossier: "Dubois · Litige immobilier", dossier_id: "5", type: "action", done: true, date: daysAgoTodo(5), hasDraft: false, draftPreview: null, attachmentSummary: null },
    { id: "todo-7", text: "Analyser le contrat de travail de Jean-Pierre Martin", dossier: "Martin · Droit du travail", dossier_id: "2", type: "lecture", done: true, date: daysAgoTodo(12), hasDraft: false, draftPreview: null, attachmentSummary: "CDI signé le 15 mars 2019, clause de non-concurrence sur 12 mois, indemnité de 40% du salaire." },
    { id: "todo-8", text: "Envoyer la mise en demeure à TechCorp", dossier: "Martin · Droit du travail", dossier_id: "2", type: "reponse", done: true, date: daysAgoTodo(17), hasDraft: true, draftPreview: "Madame, Monsieur,\n\nPar la présente, je vous mets en demeure de procéder au paiement des heures supplémentaires dues à M. Martin.\n\nCordialement,\nMe Alexandra Fernandez", attachmentSummary: null },
    { id: "todo-9", text: "Répondre au courrier du notaire (Famille Roux)", dossier: "Roux · Immobilier", dossier_id: "4", type: "reponse", done: true, date: daysAgoTodo(22), hasDraft: true, draftPreview: "Maître,\n\nEn réponse à votre courrier du 1er mars concernant l'acte de vente, je vous confirme les réserves de mes clients.\n\nCordialement,\nMe Alexandra Fernandez", attachmentSummary: null },
    { id: "todo-10", text: "Vérifier la conformité du bail commercial (Dupont)", dossier: "Dupont · Litige commercial", dossier_id: "1", type: "lecture", done: true, date: daysAgoTodo(26), hasDraft: false, draftPreview: null, attachmentSummary: null },
  ]);
  const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);
  const [showPjList, setShowPjList] = useState(false);
  const dossiersRef = useRef<HTMLDivElement>(null);

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
      await new Promise((r) => setTimeout(r, 400));
      setBriefing(mockBriefing);
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
    fetchBriefing().then(() => {
      if (isDemo() && !isTourCompleted()) {
        setTimeout(() => setShowTour(true), 800);
      }
    });
    if (isDemo()) {
      setNomAvocat(mockConfig.nom_avocat);
    } else {
      apiGet<{ nom_avocat?: string }>("/api/config")
        .then((d) => { if (d?.nom_avocat) setNomAvocat(d.nom_avocat); })
        .catch(() => {});
    }
  }, [fetchBriefing]);

  // Build dossierEmailsMap from mock data (filtered by period) or API
  useEffect(() => {
    if (!briefing) return;
    const dossiers = briefing.content?.dossiers ?? [];

    if (isDemo()) {
      // In demo mode, filter emails by the selected period
      const periodEmails = getEmailsForPeriod(period);
      const newMap: Record<string, DossierLineEmail[]> = {};
      dossiers.forEach((d) => {
        const emails = periodEmails.filter((e) => e.dossier_id === d.dossier_id);
        if (emails.length > 0) {
          newMap[d.dossier_id] = emails.map((e, i) => normalizeBriefEmail({
            id: e.id,
            expediteur: e.expediteur,
            objet: e.objet,
            resume: e.resume,
            created_at: e.date,
          }, i));
        }
      });
      setDossierEmailsMap(newMap);
    } else {
      // Real mode: use inline emails or fetch from API
      dossiers.forEach((d) => {
        if (dossierEmailsMap[d.dossier_id]) return;
        const inlineEmails = d.emails || d.emails_recus || [];
        if (inlineEmails.length > 0) {
          const normalized = inlineEmails.map(normalizeBriefEmail);
          setDossierEmailsMap((prev) => ({ ...prev, [d.dossier_id]: normalized }));
        } else {
          apiGet<any[]>(`/api/emails?dossier_id=${d.dossier_id}`)
            .then((emails) => {
              const normalized = (emails || []).map((e: any, i: number) => normalizeBriefEmail(e, i));
              setDossierEmailsMap((prev) => ({ ...prev, [d.dossier_id]: normalized }));
            })
            .catch(() => {});
        }
      });
    }
  }, [briefing, period]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDossierClick = (d: BriefingDossier) => {
    setSelectedEmail(null);
    setSelectedDossier(d);
    const cached = dossierEmailsMap[d.dossier_id];
    if (cached) {
      setPanelEmails(cached as any);
    } else if (isDemo()) {
      setPanelEmails((mockDossierEmails[d.dossier_id] || []) as any);
    } else {
      apiGet<DossierEmail[]>(`/api/emails?dossier_id=${d.dossier_id}`)
        .then((emails) => setPanelEmails(emails ?? []))
        .catch(() => setPanelEmails([]));
    }
  };

  /** Open EmailDrawer with a specific email */
  const handleEmailClick = (_d: BriefingDossier, email: DossierLineEmail) => {
    // Close any open dossier panel first
    setSelectedDossier(null);

    if (isDemo()) {
      // Find the full mock email data by id
      const mockEmail = mockAllEmails.find((e) => e.id === email.id);
      if (mockEmail) {
        setSelectedEmail({
          id: mockEmail.id,
          expediteur: `${mockEmail.expediteur} <${mockEmail.email}>`,
          objet: mockEmail.objet,
          resume: mockEmail.resume,
          brouillon: mockEmail.brouillon_mock,
          pipeline_step: "pret_a_reviser",
          contexte_choisi: "",
          statut: "traite",
          created_at: mockEmail.date,
          updated_at: mockEmail.date,
          contenu: mockEmail.corps_original,
          dossier_id: mockEmail.dossier_id,
          dossier_name: mockEmail.dossier_nom ? `${mockEmail.dossier_nom} - ${mockEmail.dossier_domaine}` : null,
          from_email: mockEmail.email,
          email_type: mockEmail.email_type,
          attachments: mockEmail.pieces_jointes.map((pj, i) => ({
            id: `${mockEmail.id}-att-${i}`,
            filename: pj.nom,
            type: pj.type_mime.includes("pdf") ? "pdf" : pj.type_mime.includes("image") ? "image" : "other",
            size: pj.taille,
          })),
        } as any);
        return;
      }
    }
    // Fallback for real mode: open BriefingDetailPanel with clicked email first
    setSelectedDossier(_d);
    const cached = dossierEmailsMap[_d.dossier_id] || [];
    const reordered = [email, ...cached.filter((e) => e.id !== email.id)] as any;
    setPanelEmails(reordered);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      if (isDemo()) {
        // Simulate a short delay for demo UX
        await new Promise((r) => setTimeout(r, 800));
        setBriefing(mockBriefing);
        setNotFound(false);
      } else {
        await apiPost("/api/briefs/generate");
      }
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

  const dossiers = briefing?.content?.dossiers ?? [];
  const attenteDossiers = (dossiers || []).filter((d) => d?.attente);

  const periodKey = period === "24h" ? "last_24h" : period === "7j" ? "last_7d" : "last_30d";
  const activeDossierIds = briefing?.content?.emails_by_period?.[periodKey] ?? [];
  const activeDossiers = dossiers
    .filter((d) => {
      const inlineCount = (d.emails || d.emails_recus || []).length;
      return d.new_emails_count > 0 || inlineCount > 0;
    })
    .filter((d) => activeDossierIds.includes(d.dossier_id));

  const periodStats = briefing?.content?.stats?.[periodKey] as PeriodStats | undefined;
  const adjustedStats = periodStats ? {
    total: periodStats.total,
    dossier_emails: periodStats.dossier_emails,
    general_emails: periodStats.general_emails,
    attachments_count: periodStats.attachments_count,
    temps_gagne_minutes: Math.round(periodStats.total * 5),
  } : null;

  const periodLabel = period === "24h" ? "dans les dernières 24 heures" : period === "7j" ? "ces 7 derniers jours" : "ces 30 derniers jours";

  const filteredTodos = todoItems.filter((t) => {
    const todoDate = new Date(t.date).getTime();
    const now = Date.now();
    if (period === "24h") return now - todoDate < 24 * 3600000;
    if (period === "7j") return now - todoDate < 7 * 24 * 3600000;
    return now - todoDate < 30 * 24 * 3600000;
  });
  // Sort: undone first, then by date desc
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6 pt-8">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-20 rounded-xl mt-6" />
          <Skeleton className="h-4 w-32 mt-8" />
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
        </div>
      </DashboardLayout>
    );
  }

  if (notFound || !briefing) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto text-center py-24">
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
      <div className="max-w-5xl mx-auto pb-24" data-tour="briefing">
        <motion.div {...fadeIn} className="pt-8 pb-4">
          <p className="text-lg font-serif text-foreground">
            {greeting}{nomAvocat ? ` ${nomAvocat}` : ""} — <span className="capitalize">{dateStr}</span>
          </p>
          {adjustedStats && (
            <p className="text-sm text-muted-foreground mt-1">
              {adjustedStats.total} emails traités · {adjustedStats.temps_gagne_minutes}min gagnées
            </p>
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.03 }} className="flex gap-1.5 mb-6">
          {(["24h", "7j", "30j"] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? "bg-emerald text-emerald-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </motion.div>

        {/* ── Rapport Donna — 3 lignes distinctes ── */}
        {adjustedStats && (
          <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="rounded-2xl bg-muted/40 border border-border px-5 py-4 mb-10">
            <div className="text-sm text-foreground/80 leading-relaxed space-y-1">
              <p>
                Vous avez reçu{" "}
                <button onClick={() => dossiersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} className="underline underline-offset-2 hover:text-foreground transition-colors">
                  <strong>{adjustedStats.total} emails</strong>
                </button>{" "}
                {periodLabel}.
              </p>
              <p>
                <strong>{adjustedStats.dossier_emails}</strong> liés à vos dossiers · <strong>{adjustedStats.general_emails}</strong> autres emails (newsletters, notifications…)
              </p>
              <p>
                <button onClick={() => setShowPjList(!showPjList)} className="underline underline-offset-2 hover:text-foreground transition-colors">
                  <strong>{adjustedStats.attachments_count} {adjustedStats.attachments_count === 1 ? "pièce jointe" : "pièces jointes"}</strong>
                </button>{" "}
                {adjustedStats.attachments_count === 1 ? "extraite" : "extraites"}
              </p>
            </div>
          </motion.div>
        )}

        {showPjList && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-2xl border border-border bg-card shadow-sm p-5 mb-6 overflow-hidden">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Pièces jointes reçues</h3>
            <div className="space-y-3">
              {getEmailsForPeriod(period).filter(e => e.pieces_jointes.length > 0).flatMap(e => e.pieces_jointes.map((pj, i) => (
                <div key={`${e.id}-${i}`} className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-red-500/70 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{pj.nom}</p>
                    <p className="text-xs text-muted-foreground truncate">{pj.resume_ia}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{e.dossier_nom ? `Dossier : ${e.dossier_nom}` : ""}</p>
                  </div>
                </div>
              )))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Dossiers actifs */}
          <div ref={dossiersRef}>
            {activeDossiers.length > 0 && (
              <motion.section {...fadeIn} transition={{ delay: 0.1 }}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Dossiers actifs
                </h2>
                <div className="rounded-2xl border border-border bg-card shadow-sm p-5 space-y-1">
                  {activeDossiers.map((d) => (
                    <DossierLine
                      key={d.dossier_id}
                      dossier={d}
                      dossierEmails={dossierEmailsMap[d.dossier_id] || []}
                      onClick={() => handleDossierClick(d)}
                      onEmailClick={(email) => handleEmailClick(d, email)}
                      onViewFull={() => navigate(`/dossiers/${d.dossier_id}`)}
                    />
                  ))}
                </div>
              </motion.section>
            )}
            {activeDossiers.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Aucune activité dans les {PERIOD_LABELS[period].startsWith("24") ? "dernières " : "derniers "}{PERIOD_LABELS[period]}.
                </p>
              </div>
            )}
          </div>

          {/* Right — Todo list */}
          {isDemo() && (
            <div>
              <motion.section {...fadeIn} transition={{ delay: 0.12 }}>
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">To-do list</h2>
                  <span className="text-xs text-muted-foreground">{sortedTodos.filter((t) => !t.done).length} restantes</span>
                </div>
                <div className="rounded-2xl border border-border bg-card shadow-sm divide-y divide-border">
                  {sortedTodos.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-5 text-center">Aucune tâche pour cette période</p>
                  ) : sortedTodos.map((item) => (
                    <div key={item.id} className={`transition-all duration-200 ${item.done ? "opacity-40" : ""}`}>
                      <div className="flex items-start gap-3 px-5 py-3.5">
                        {/* Checkbox */}
                        <button
                          onClick={() => {
                            setTodoItems((prev) => prev.map((t) => t.id === item.id ? { ...t, done: !t.done } : t));
                            if (!item.done) { setExpandedTodoId(null); toast.success("Tâche complétée"); }
                          }}
                          className={`mt-0.5 h-[18px] w-[18px] rounded border flex items-center justify-center shrink-0 transition-colors ${item.done ? "bg-primary border-primary" : "border-muted-foreground/30 hover:border-primary/50"}`}
                        >
                          {item.done && <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </button>
                        {/* Text — clickable to expand */}
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => !item.done && setExpandedTodoId(expandedTodoId === item.id ? null : item.id)}
                            className={`text-sm text-foreground leading-relaxed text-left w-full ${item.done ? "line-through" : "hover:text-primary transition-colors cursor-pointer"}`}
                            disabled={item.done}
                          >
                            {item.text}
                            {item.hasDraft && !item.done && (
                              <span className="ml-2 inline-flex items-center bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-medium">Brouillon prêt</span>
                            )}
                          </button>
                          <div className="flex items-center gap-2 mt-1">
                            <a href={`/dossiers/${item.dossier_id}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">{item.dossier}</a>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                              item.type === "reponse" ? "bg-orange-100 text-orange-700" :
                              item.type === "relance" ? "bg-amber-100 text-amber-700" :
                              item.type === "action" ? "bg-red-100 text-red-700" :
                              "bg-muted text-muted-foreground"
                            }`}>{item.type === "reponse" ? "Réponse" : item.type === "relance" ? "Relance" : item.type === "action" ? "Action" : "À lire"}</span>
                          </div>
                        </div>
                      </div>
                      {/* Expanded detail panel */}
                      {expandedTodoId === item.id && !item.done && (
                        <div className="px-5 pb-4 pl-12">
                          <div className="rounded-xl bg-muted/30 p-4 space-y-3">
                            {item.hasDraft && item.draftPreview ? (
                              <>
                                <p className="text-xs font-medium text-muted-foreground">Brouillon proposé par Donna</p>
                                <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{item.draftPreview}</p>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => { navigator.clipboard.writeText(item.draftPreview || ""); toast.success("Copié !"); }} className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-2.5 py-1 transition-colors">Copier</button>
                                </div>
                              </>
                            ) : item.attachmentSummary ? (
                              <>
                                <p className="text-xs font-medium text-muted-foreground">Résumé de la pièce</p>
                                <p className="text-sm text-foreground/80 leading-relaxed">{item.attachmentSummary}</p>
                              </>
                            ) : (
                              <p className="text-xs text-muted-foreground">Cliquez sur le dossier pour travailler sur cette tâche.</p>
                            )}
                            <a href={`/dossiers/${item.dossier_id}`} className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                              Dossier : {item.dossier} →
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>
          )}
        </div>

      </div>

      <BriefingDetailPanel
        dossier={selectedDossier}
        emails={panelEmails}
        periodLabel={PERIOD_LABELS[period]}
        onClose={() => setSelectedDossier(null)}
      />

      <AnimatePresence>
        {selectedEmail && <EmailDrawer email={selectedEmail} onClose={() => setSelectedEmail(null)} />}
      </AnimatePresence>

      {showTour && <GuidedTour onComplete={() => setShowTour(false)} />}
    </DashboardLayout>
  );
};

/* ── Single dossier line with clickable emails ── */

const MAX_STACKED_EMAILS = 5;

function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return format(d, "d MMM", { locale: fr });
  } catch { return ""; }
}

function DossierLine({
  dossier: d,
  dossierEmails,
  onClick,
  onEmailClick,
  onViewFull,
}: {
  dossier: BriefingDossier;
  dossierEmails: DossierLineEmail[];
  onClick: () => void;
  onEmailClick: (email: DossierLineEmail) => void;
  onViewFull: () => void;
}) {
  const hasEmails = dossierEmails.length > 0;
  const displayEmails = dossierEmails.slice(0, MAX_STACKED_EMAILS);
  const extraCount = dossierEmails.length - MAX_STACKED_EMAILS;

  // No fetched emails yet — show narrative fallback
  if (!hasEmails) {
    const narrativeText = d.emails_narrative || "";
    const narrative = narrativeText.length > 90 ? narrativeText.slice(0, 87) + "…" : narrativeText;

    return (
      <div
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors group"
      >
        <div className="flex-1 min-w-0 truncate">
          <span className="text-sm text-foreground">
            <span className="font-medium">{getDossierName(d)}</span>
            <span className="text-muted-foreground">{getDossierDomain(d) ? ` · ${getDossierDomain(d)}` : ""}</span>
            {narrative && (
              <>
                <span className="text-muted-foreground"> · </span>
                <span className="text-foreground/70">"{narrative}"</span>
              </>
            )}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  // Single email — compact
  if (dossierEmails.length === 1) {
    const email = dossierEmails[0];
    const resumeText = email.resume || email.objet || "";
    const shortResume = resumeText.length > 80 ? resumeText.slice(0, 77) + "…" : resumeText;

    return (
      <div className="rounded-lg">
        <button
          onClick={onClick}
          className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer group text-left rounded-t-lg hover:bg-muted/40 transition-colors"
        >
          <div className="flex-1 min-w-0 truncate">
            <span className="text-sm text-foreground">
              <span className="font-medium">{getDossierName(d)}</span>
              <span className="text-muted-foreground">{getDossierDomain(d) ? ` · ${getDossierDomain(d)}` : ""}</span>
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button
          onClick={() => onEmailClick(email)}
          className="w-full text-left pl-8 pr-4 py-2 mb-1 rounded-b-lg hover:bg-primary/5 transition-colors cursor-pointer group/email"
        >
          <span className="text-xs text-muted-foreground leading-relaxed group-hover/email:text-foreground transition-colors">
            <span className="text-foreground/50">→</span>{" "}
            <span className="text-foreground/70">"{shortResume}"</span>{" "}
            <span className="text-muted-foreground/60">({formatShortDate(email.created_at)})</span>
          </span>
        </button>
      </div>
    );
  }

  // Multiple emails — stacked with individually clickable rows
  return (
    <div className="rounded-lg">
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer group text-left rounded-t-lg hover:bg-muted/40 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <span className="text-sm text-foreground">
            <span className="font-medium">{getDossierName(d)}</span>
            <span className="text-muted-foreground">{getDossierDomain(d) ? ` · ${getDossierDomain(d)}` : ""}</span>
          </span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{dossierEmails.length} emails</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      <div className="pl-4 pr-4 pb-1 space-y-0.5">
        {displayEmails.map((email) => {
          const resumeText = email.resume || email.objet || "";
          const shortResume = resumeText.length > 70 ? resumeText.slice(0, 67) + "…" : resumeText;
          return (
            <button
              key={email.id}
              onClick={() => onEmailClick(email)}
              className="block w-full text-left pl-4 pr-2 py-1.5 rounded-md hover:bg-primary/5 transition-colors cursor-pointer group/email"
            >
              <span className="text-xs text-muted-foreground leading-relaxed group-hover/email:text-foreground transition-colors">
                <span className="text-foreground/50">→</span>{" "}
                <span className="text-foreground/70">"{shortResume}"</span>{" "}
                <span className="text-muted-foreground/60">({formatShortDate(email.created_at)})</span>
              </span>
            </button>
          );
        })}
        {extraCount > 0 && (
          <button
            onClick={() => onViewFull()}
            className="block pl-4 py-1.5 text-xs text-emerald hover:underline"
          >
            et {extraCount} autre{extraCount > 1 ? "s" : ""} → Voir le dossier complet
          </button>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
