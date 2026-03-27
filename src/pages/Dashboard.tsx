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
import { Loader2, RefreshCw, FileText, Mail, Folder, CheckCircle, Filter, Paperclip } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EmailListInline } from "@/components/EmailListInline";
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
    { id: "todo-1", text: "Répondre à Jean-Pierre Martin sur les points de l'entretien préalable", dossier: "Martin · Droit du travail", dossier_id: "2", email_id: "e5", type: "reponse", done: false, date: hoursAgoTodo(2), hasDraft: true, draftPreview: "Maître,\n\nFaisant suite à votre email concernant le 2e entretien préalable de rupture conventionnelle, je vous confirme que les points suivants pourront être abordés :\n\n1. Indemnité supra-légale (proposition à 12 000 €)\n2. Clause de non-concurrence (levée demandée)\n3. Solde de tout compte et certificat de travail\n\nJe reste à votre disposition.\n\nCordialement,\nMe Alexandra Fernandez", attachmentSummary: null },
    { id: "todo-2", text: "Vérifier la mise en demeure reçue de BTP Pro", dossier: "Dupont · Litige commercial", dossier_id: "1", email_id: "e3", type: "lecture", done: false, date: hoursAgoTodo(5), hasDraft: false, draftPreview: null, attachmentSummary: "Mise en demeure de BTP Pro datée du 25 mars, contestation de la non-conformité des travaux, demande de paiement de 45 000 € sous 15 jours." },
    { id: "todo-3", text: "Relancer Claire Dubois pour les pièces manquantes", dossier: "Dubois · Litige immobilier", dossier_id: "5", email_id: "e20", type: "relance", done: false, date: hoursAgoTodo(8), hasDraft: true, draftPreview: "Madame Dubois,\n\nJe me permets de revenir vers vous concernant les documents que nous attendons pour compléter votre dossier avant l'audience du 15 avril :\n\n- PV de la dernière assemblée générale\n- Relevés de charges 2024-2025\n\nMerci de me les transmettre dès que possible.\n\nCordialement,\nMe Alexandra Fernandez", attachmentSummary: null },
    { id: "todo-4", text: "Consulter le rapport d'expertise Famille Roux", dossier: "Roux · Immobilier", dossier_id: "4", email_id: "e7", type: "lecture", done: true, date: daysAgoTodo(2), hasDraft: false, draftPreview: null, attachmentSummary: "Rapport d'expertise du 20 mars concluant à des malfaçons sur la toiture et l'étanchéité. Montant estimé des réparations : 28 000 €." },
    { id: "todo-5", text: "Répondre à Alice Bernard sur la procédure de divorce", dossier: "Bernard · Droit de la famille", dossier_id: "6", email_id: "e22", type: "reponse", done: true, date: daysAgoTodo(3), hasDraft: true, draftPreview: "Chère Madame Bernard,\n\nSuite à notre échange, je vous confirme que la requête en divorce a bien été déposée auprès du tribunal.\n\nCordialement,\nMe Alexandra Fernandez", attachmentSummary: null },
    { id: "todo-6", text: "Préparer les pièces pour l'audience TGI (Dubois)", dossier: "Dubois · Litige immobilier", dossier_id: "5", email_id: "e21", type: "action", done: true, date: daysAgoTodo(5), hasDraft: false, draftPreview: null, attachmentSummary: null },
    { id: "todo-7", text: "Analyser le contrat de travail de Jean-Pierre Martin", dossier: "Martin · Droit du travail", dossier_id: "2", email_id: "e13", type: "lecture", done: true, date: daysAgoTodo(12), hasDraft: false, draftPreview: null, attachmentSummary: "CDI signé le 15 mars 2019, clause de non-concurrence sur 12 mois, indemnité de 40% du salaire." },
    { id: "todo-8", text: "Envoyer la mise en demeure à TechCorp", dossier: "Martin · Droit du travail", dossier_id: "2", email_id: "e6", type: "reponse", done: true, date: daysAgoTodo(17), hasDraft: true, draftPreview: "Madame, Monsieur,\n\nPar la présente, je vous mets en demeure de procéder au paiement des heures supplémentaires dues à M. Martin.\n\nCordialement,\nMe Alexandra Fernandez", attachmentSummary: null },
    { id: "todo-9", text: "Répondre au courrier du notaire (Famille Roux)", dossier: "Roux · Immobilier", dossier_id: "4", email_id: "e18", type: "reponse", done: true, date: daysAgoTodo(22), hasDraft: true, draftPreview: "Maître,\n\nEn réponse à votre courrier du 1er mars concernant l'acte de vente, je vous confirme les réserves de mes clients.\n\nCordialement,\nMe Alexandra Fernandez", attachmentSummary: null },
    { id: "todo-10", text: "Vérifier la conformité du bail commercial (Dupont)", dossier: "Dupont · Litige commercial", dossier_id: "1", email_id: "e1", type: "lecture", done: true, date: daysAgoTodo(26), hasDraft: false, draftPreview: null, attachmentSummary: null },
  ]);
  const [expandedCard, setExpandedCard] = useState<"emails" | "pj" | null>(null);
  const dossiersRef = useRef<HTMLDivElement>(null);
  const [highlightDossierId, setHighlightDossierId] = useState<string | null>(null);

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

  /** Open EmailDrawer by mock email ID */
  const openEmailById = (emailId: string) => {
    const mockEmail = mockAllEmails.find((e) => e.id === emailId);
    if (!mockEmail) return;
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

  // Emails filtered by Donna (newsletters, spam, notifications — not linked to a dossier)
  const filteredEmails = isDemo()
    ? getEmailsForPeriod(period).filter((e) => e.dossier_id === null)
    : [];

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
        <motion.div {...fadeIn} className="pt-10 pb-6">
          <p className="text-2xl font-serif font-semibold text-foreground">
            {greeting}{nomAvocat ? ` ${nomAvocat}` : ""}
          </p>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{dateStr}</p>
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

        {adjustedStats && (
          <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="mb-10">
            <p className="text-xs text-muted-foreground mb-3">alexandra@cabinet-fernandez.fr</p>
            <div className="rounded-xl bg-muted/40 p-4 space-y-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <button
                    onClick={() => setExpandedCard(expandedCard === "emails" ? null : "emails")}
                    className={`font-semibold transition-colors cursor-pointer hover:underline ${expandedCard === "emails" ? "text-primary" : "text-foreground hover:text-primary"}`}
                  >
                    {adjustedStats.total} emails
                  </button>{" "}reçus
                </p>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{adjustedStats.dossier_emails}</span> traités par Donna · liés à vos dossiers
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{adjustedStats.general_emails}</span> filtrés · newsletters, notifications
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <button
                    onClick={() => setExpandedCard(expandedCard === "pj" ? null : "pj")}
                    className={`font-semibold transition-colors cursor-pointer hover:underline ${expandedCard === "pj" ? "text-primary" : "text-foreground hover:text-primary"}`}
                  >
                    {adjustedStats.attachments_count} {adjustedStats.attachments_count === 1 ? "pièce jointe" : "pièces jointes"}
                  </button>{" "}{adjustedStats.attachments_count === 1 ? "extraite et résumée" : "extraites et résumées"}
                </p>
              </div>
            </div>

            {/* Inline expandable list — toggled by clicking on "X emails" or "X pièces jointes" */}
            <AnimatePresence>
              {expandedCard && isDemo() && (
                <EmailListInline
                  emails={getEmailsForPeriod(period)}
                  mode={expandedCard}
                  onEmailClick={(mockEmail) => {
                    setExpandedCard(null);
                    setSelectedEmail({
                      id: mockEmail.id,
                      expediteur: `${mockEmail.expediteur} <${mockEmail.email}>`,
                      objet: mockEmail.objet,
                      resume: mockEmail.resume,
                      brouillon: mockEmail.brouillon_mock,
                      pipeline_step: mockEmail.dossier_id ? "pret_a_reviser" : "ignore",
                      contexte_choisi: "",
                      statut: mockEmail.dossier_id ? "traite" : "ignore",
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
                  }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          {/* Left — Dossiers actifs */}
          <div ref={dossiersRef}>
            {activeDossiers.length > 0 && (
              <motion.section {...fadeIn} transition={{ delay: 0.1 }}>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">
                  Dossiers actifs
                </h2>
                <div className="rounded-2xl border border-border/60 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-1">
                  {activeDossiers.map((d) => (
                    <DossierLine
                      key={d.dossier_id}
                      dossier={d}
                      dossierEmails={dossierEmailsMap[d.dossier_id] || []}
                      onClick={() => navigate(`/dossiers/${d.dossier_id}`)}
                      onEmailClick={(email) => handleEmailClick(d, email)}
                      onViewFull={() => navigate(`/dossiers/${d.dossier_id}`)}
                      highlighted={highlightDossierId === d.dossier_id}
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

            {/* Autres — emails filtrés par Donna */}
            {filteredEmails.length > 0 && (
              <motion.section {...fadeIn} transition={{ delay: 0.15 }} className="mt-8">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">
                  Autres ({filteredEmails.length})
                </h2>
                <div className="rounded-2xl border border-border/60 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] divide-y divide-border/20">
                  {filteredEmails.map((email) => {
                    const filterReason = email.category === "newsletter" ? "Newsletter" : email.category === "spam" ? "Publicité" : "Notification système";
                    const shortResume = email.resume.length > 90 ? email.resume.slice(0, 87) + "…" : email.resume;
                    return (
                      <button
                        key={email.id}
                        onClick={() => {
                          setSelectedEmail({
                            id: email.id,
                            expediteur: `${email.expediteur} <${email.email}>`,
                            objet: email.objet,
                            resume: email.resume,
                            brouillon: email.brouillon_mock,
                            pipeline_step: "ignore",
                            contexte_choisi: "",
                            statut: "ignore",
                            created_at: email.date,
                            updated_at: email.date,
                            contenu: email.corps_original,
                            email_type: email.email_type,
                            from_email: email.from_email,
                          } as any);
                        }}
                        className="w-full text-left px-5 py-3 hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold ${getAvatarColor(email.expediteur).bg} ${getAvatarColor(email.expediteur).text}`}>
                            {getInitial(email.expediteur)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-sm font-medium text-foreground truncate">{email.expediteur}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <TooltipProvider delayDuration={200}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-gray-50 text-gray-500 ring-1 ring-gray-200 cursor-default">
                                        Filtré par Donna
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                      <p className="text-xs">{filterReason} — pas lié à un dossier client</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <span className="text-xs text-muted-foreground">{formatMailDate(email.date)}</span>
                              </div>
                            </div>
                            <p className="text-sm text-foreground mt-0.5 truncate">{email.objet}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{shortResume}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </div>

          {/* Right — Todo list */}
          {isDemo() && (
            <div>
              <motion.section {...fadeIn} transition={{ delay: 0.12 }}>
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">To-do list</h2>
                  <span className="text-xs text-muted-foreground">{sortedTodos.filter((t) => !t.done).length} restantes</span>
                </div>
                <div className="rounded-2xl border border-border/60 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 divide-y divide-border/40">
                  {sortedTodos.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-5 text-center">Aucune tâche pour cette période</p>
                  ) : sortedTodos.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 py-3.5 transition-all duration-200 ${item.done ? "opacity-40" : ""}`}
                      onMouseEnter={() => setHighlightDossierId(item.dossier_id)}
                      onMouseLeave={() => setHighlightDossierId(null)}
                    >
                      <button
                        onClick={() => {
                          setTodoItems((prev) => prev.map((t) => t.id === item.id ? { ...t, done: !t.done } : t));
                          if (!item.done) toast.success("✓ Tâche complétée");
                        }}
                        className={`mt-0.5 h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${item.done ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground/30 hover:border-primary/50"}`}
                      >
                        {item.done && <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => openEmailById(item.email_id)}
                          className={`text-sm text-foreground leading-relaxed block text-left w-full ${item.done ? "line-through" : "hover:text-primary transition-colors"}`}
                        >
                          {item.text}
                        </button>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{item.dossier}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                            item.type === "reponse" ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200" :
                            item.type === "relance" ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" :
                            item.type === "action" ? "bg-red-50 text-red-700 ring-1 ring-red-200" :
                            "bg-gray-50 text-gray-600 ring-1 ring-gray-200"
                          }`}>{item.type === "reponse" ? "Réponse" : item.type === "relance" ? "Relance" : item.type === "action" ? "Action" : "À lire"}</span>
                        </div>
                      </div>
                      <Mail
                        className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => openEmailById(item.email_id)}
                      />
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>
          )}
        </div>

        {/* Temps gagné — footer discret */}
        {adjustedStats && (
          <motion.p {...fadeIn} transition={{ delay: 0.2 }} className="text-xs text-muted-foreground text-center py-8">
            Donna vous a fait économiser {adjustedStats.temps_gagne_minutes} minutes, soit environ {Math.round((adjustedStats.temps_gagne_minutes / 60) * 200)}€ à 200€/heure.
          </motion.p>
        )}

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
  highlighted,
}: {
  dossier: BriefingDossier;
  dossierEmails: DossierLineEmail[];
  onClick: () => void;
  onEmailClick: (email: DossierLineEmail) => void;
  onViewFull: () => void;
  highlighted?: boolean;
}) {
  const displayEmails = dossierEmails.slice(0, MAX_STACKED_EMAILS);
  const extraCount = dossierEmails.length - MAX_STACKED_EMAILS;

  return (
    <div className={`transition-colors duration-300 rounded-xl ${highlighted ? "bg-primary/5" : ""}`}>
      {/* Dossier header — grey background + colored left border + folder icon */}
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group border-l-[3px] border-primary/60"
      >
        <span className="text-sm text-foreground flex items-center gap-2">
          <Folder className="h-4 w-4 text-primary/70 shrink-0" />
          <span className="font-semibold">{getDossierName(d)}</span>
          <span className="text-muted-foreground">· {getDossierDomain(d)}</span>
        </span>
        <span className="text-xs text-muted-foreground shrink-0">{dossierEmails.length} email{dossierEmails.length > 1 ? 's' : ''}</span>
      </button>

      {/* Emails — indented with mail icon */}
      {displayEmails.length > 0 && (
        <div className="border-t border-border/20">
          {displayEmails.map((email, idx) => {
            const name = email.expediteur || "";
            const resume = email.resume || "";
            const shortResume = resume.length > 80 ? resume.slice(0, 77) + "…" : resume;
            return (
              <button
                key={email.id}
                onClick={() => onEmailClick(email)}
                className={`w-full text-left pl-6 pr-5 py-3 hover:bg-muted/30 transition-colors duration-200 cursor-pointer ${idx < displayEmails.length - 1 ? "border-b border-border/20" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold ${getAvatarColor(name).bg} ${getAvatarColor(name).text}`}>
                    {getInitial(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{formatMailDate(email.created_at)}</span>
                    </div>
                    <p className="text-sm text-foreground mt-0.5 truncate">{email.objet}</p>
                    {shortResume && <p className="text-xs text-muted-foreground mt-0.5 truncate">{shortResume}</p>}
                  </div>
                </div>
              </button>
            );
          })}
          {extraCount > 0 && (
            <button onClick={onViewFull} className="w-full text-left pl-6 pr-5 py-2 text-xs text-primary hover:underline">
              et {extraCount} autre{extraCount > 1 ? "s" : ""} → Voir le dossier
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
