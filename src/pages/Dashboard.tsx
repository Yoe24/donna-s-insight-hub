/**
 * Dashboard — Briefing V1 (todo-list minimaliste)
 * Branche : ux/v1
 *
 * Style : Linear / Todoist. Mobile-first. Ultra clean.
 * En mode demo : donnees mock locales (mock-v1.ts), aucun appel API.
 */

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  FileText,
  Mail,
  Check,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiGet, apiPost } from "@/lib/api";
import { mockConfig } from "@/lib/mock-briefing";
import { mockV1Emails, getV1EmailsForPeriod, getV1Stats } from "@/lib/mock-v1";
import { isDemo } from "@/lib/auth";
import { EmailDrawer } from "@/components/EmailDrawer";
import { GuidedTour } from "@/components/GuidedTour";
import { isTourCompleted } from "@/lib/tour-state";
import type { Email } from "@/hooks/useEmails";

type PeriodFilter = "24h" | "7j" | "30j";
const PERIOD_LABELS: Record<PeriodFilter, string> = { "24h": "24 heures", "7j": "7 jours", "30j": "30 jours" };

interface TodoItem {
  id: string; text: string; dossier: string; dossier_id: string; email_id: string;
  type: "reponse" | "lecture" | "relance" | "action";
  done: boolean; date: string; urgency: "prioritaire" | "echeance" | null;
  hasDraft: boolean; draftPreview: string | null; attachmentSummary: string | null;
}

const fadeIn = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } };

function formatMailDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / 3600000;
    const diffDays = diffMs / 86400000;
    const hhmm = date.getHours() + "h" + String(date.getMinutes()).padStart(2, "0");
    if (diffHours < 1) return "Il y a " + Math.max(1, Math.floor(diffMs / 60000)) + " min";
    if (diffHours < 24 && date.getDate() === now.getDate()) return "Auj. " + hhmm;
    if (diffDays < 2) return "Hier " + hhmm;
    const mois = ["jan","fev","mars","avr","mai","juin","juil","aout","sept","oct","nov","dec"];
    return date.getDate() + " " + mois[date.getMonth()];
  } catch { return ""; }
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <span className="text-muted-foreground/60">{icon}</span>
      <span className="font-semibold text-foreground">{value}</span>
      <span>{label}</span>
    </div>
  );
}

function TodoRow({ item, onToggle, onOpen }: { item: TodoItem; onToggle: () => void; onOpen: () => void }) {
  const [showDraft, setShowDraft] = useState(false);
  const typeConfig = {
    reponse: { label: "Reponse", color: "bg-orange-50 text-orange-700 ring-orange-200" },
    relance: { label: "Relance", color: "bg-amber-50 text-amber-700 ring-amber-200" },
    action:  { label: "Action",  color: "bg-red-50 text-red-700 ring-red-200" },
    lecture: { label: "A lire",  color: "bg-slate-50 text-slate-600 ring-slate-200" },
  };
  const cfg = typeConfig[item.type];

  return (
    <div className={"transition-all duration-200" + (item.done ? " opacity-40" : "")}>
      <div className="flex items-start gap-3 py-3.5 px-1">
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          aria-label={item.done ? "Marquer comme non fait" : "Marquer comme fait"}
          className={"mt-0.5 h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 " +
            (item.done ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground/30 hover:border-primary/60")}
        >
          {item.done && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <button onClick={onOpen} className={"text-sm leading-relaxed text-left transition-colors focus-visible:outline-none focus-visible:underline " + (item.done ? "line-through text-muted-foreground" : "text-foreground hover:text-primary")}>
              {item.text}
            </button>
            <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{formatMailDate(item.date)}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground">{item.dossier}</span>
            <span className={"text-[10px] px-1.5 py-0.5 rounded-full font-medium ring-1 " + cfg.color}>{cfg.label}</span>
            {item.urgency === "prioritaire" && !item.done && (
              <span className="flex items-center gap-0.5 text-[10px] text-red-600 font-medium"><AlertCircle className="h-3 w-3" />Prioritaire</span>
            )}
            {item.urgency === "echeance" && !item.done && (
              <span className="flex items-center gap-0.5 text-[10px] text-orange-600 font-medium"><Clock className="h-3 w-3" />Echeance proche</span>
            )}
            {item.hasDraft && !item.done && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-primary/10 text-primary ring-1 ring-primary/20 flex items-center gap-1">
                <FileText className="h-2.5 w-2.5" />Brouillon pret
              </span>
            )}
          </div>
          {item.attachmentSummary && !item.done && (
            <p className="text-xs text-muted-foreground mt-1.5 bg-muted/40 rounded-md px-2.5 py-1.5 leading-relaxed">{item.attachmentSummary}</p>
          )}
          {!item.done && (
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" variant="ghost" onClick={onOpen} className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 gap-1">
                <Mail className="h-3 w-3" />Voir
              </Button>
              {item.hasDraft && item.draftPreview && (
                <Button size="sm" variant="ghost" onClick={() => setShowDraft(v => !v)} aria-expanded={showDraft} className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 gap-1">
                  <FileText className="h-3 w-3" />Brouillon{showDraft ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              )}
            </div>
          )}
          <AnimatePresence>
            {showDraft && item.draftPreview && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                <div className="mt-2 rounded-lg border border-border/50 bg-muted/30 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">Brouillon Donna</p>
                  <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">{item.draftPreview}</pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [nomAvocat, setNomAvocat] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("24h");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [doneCollapsed, setDoneCollapsed] = useState(true);
  const n = Date.now();
  const h1 = (h: number) => new Date(n - h * 3600000).toISOString();
  const d1 = (d: number) => new Date(n - d * 86400000).toISOString();

  const [todoItems, setTodoItems] = useState<TodoItem[]>([
    { id:"t1", text:"Convocation JAF — audience le 15 avril (Dupont c/ Dupont)", dossier:"Dupont c/ Dupont · Famille", dossier_id:"d1", email_id:"v1-e3", type:"action", done:false, date:h1(5), urgency:"prioritaire", hasDraft:false, draftPreview:null, attachmentSummary:"Ordonnance JAF du 12 janvier 2026. Audience 15 avril a 10h00 salle 4A. Presence obligatoire des parties." },
    { id:"t2", text:"Envoyer mise en demeure — SCI Les Tilleuls, 3 mois de loyers impayes (9 450 EUR)", dossier:"SCI Les Tilleuls · Bail commercial", dossier_id:"d2", email_id:"v1-e4", type:"action", done:false, date:h1(2), urgency:"echeance", hasDraft:true, draftPreview:"Madame, Monsieur,\n\nPar la presente mise en demeure, je vous informe au nom de mon client la SCI Les Tilleuls que les loyers des mois de janvier, fevrier et mars 2026 demeurent impayes a ce jour, pour un montant total de 9 450 euros TTC.\n\nJe vous mets en demeure de proceder au reglement dans un delai de 8 jours, faute de quoi mon client saisira le Tribunal judiciaire.\n\nCordialement,\nMe Alexandra Fernandez", attachmentSummary:null },
    { id:"t3", text:"Relire document du notaire — estimation bien immobilier Deauville (485 000 EUR)", dossier:"Succession Martin · Droit successoral", dossier_id:"d3", email_id:"v1-e7", type:"lecture", done:false, date:h1(4), urgency:null, hasDraft:false, draftPreview:null, attachmentSummary:"Estimation Immoval : maison 180 m2 a Deauville, 485 000 EUR nets vendeur. Un heritier bloque la vente depuis 8 mois." },
    { id:"t4", text:"Repondre a Mme Roux — accuse reception lettre de licenciement", dossier:"Madame Roux · Prud'hommes", dossier_id:"d4", email_id:"v1-e10", type:"reponse", done:false, date:h1(6), urgency:"echeance", hasDraft:true, draftPreview:"Chere Madame Roux,\n\nJ'accuse reception de votre message et de votre lettre de licenciement.\n\nVous disposez de 12 mois pour saisir le Conseil de prud'hommes. Il est urgent que nous nous rencontrions cette semaine pour preparer votre dossier.\n\nCordialement,\nMe Alexandra Fernandez", attachmentSummary:null },
    { id:"t5", text:"Repondre a Dubois & Fils — 45 000 EUR impayes, debiteur propose echelonnement en 3 fois", dossier:"Dubois et Fils · Recouvrement", dossier_id:"d5", email_id:"v1-e13", type:"reponse", done:false, date:h1(8), urgency:null, hasDraft:true, draftPreview:"Monsieur Dubois,\n\nLa procedure d'injonction de payer est adaptee a votre situation.\n\nEtapes :\n1. Requete (8-15 jours pour obtenir l'ordonnance)\n2. Signification par huissier\n3. Si pas d'opposition : titre executoire, saisie possible\n\nJe vous transmets le projet de requete sous 48 heures.\n\nCordialement,\nMe Fernandez", attachmentSummary:null },
    { id:"t6", text:"Analyser statuts Association Horizon — depenses non autorisees du tresorier (8 200 EUR)", dossier:"Association Horizon · Associations", dossier_id:"d6", email_id:"v1-e16", type:"lecture", done:false, date:h1(10), urgency:null, hasDraft:false, draftPreview:null, attachmentSummary:"Statuts 2019 : depenses > 500 EUR necessitent validation du bureau. Releves : 8 200 EUR de depenses non justifiees jan-mars 2026." },
    { id:"t7", text:"Examiner conclusions en reponse de Me Laurent (Dupont c/ Dupont)", dossier:"Dupont c/ Dupont · Famille", dossier_id:"d1", email_id:"v1-e2", type:"lecture", done:true, date:d1(2), urgency:null, hasDraft:false, draftPreview:null, attachmentSummary:null },
    { id:"t8", text:"Verifier clause resolutoire bail commercial SCI Les Tilleuls", dossier:"SCI Les Tilleuls · Bail commercial", dossier_id:"d2", email_id:"v1-e5", type:"lecture", done:true, date:d1(3), urgency:null, hasDraft:false, draftPreview:null, attachmentSummary:null },
    { id:"t9", text:"Repondre au notaire Beaumont — partage successoral Martin", dossier:"Succession Martin · Droit successoral", dossier_id:"d3", email_id:"v1-e9", type:"reponse", done:true, date:d1(4), urgency:null, hasDraft:true, draftPreview:null, attachmentSummary:null },
    { id:"t10", text:"Examiner contrat de travail et evaluations Mme Roux", dossier:"Madame Roux · Prud'hommes", dossier_id:"d4", email_id:"v1-e12", type:"lecture", done:true, date:d1(5), urgency:null, hasDraft:false, draftPreview:null, attachmentSummary:null },
  ]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("user_id");
    if (userId) {
      import("@/lib/auth").then(({ setUserId }) => setUserId(userId));
      localStorage.setItem("donna_demo_mode", "false");
      params.delete("user_id");
      window.history.replaceState({}, "", "/dashboard" + (params.toString() ? "?" + params.toString() : ""));
    }
  }, []);

  const fetchBriefing = useCallback(async () => {
    if (isDemo()) { await new Promise(r => setTimeout(r, 350)); setNotFound(false); setLoading(false); return; }
    try { await apiGet("/api/briefs/today"); setNotFound(false); }
    catch (e: any) { if (e?.message?.includes("404")) setNotFound(true); else toast.error("Impossible de charger le briefing"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchBriefing().then(() => { if (isDemo() && !isTourCompleted()) setTimeout(() => setShowTour(true), 800); });
    if (isDemo()) setNomAvocat(mockConfig.nom_avocat);
    else apiGet<{ nom_avocat?: string }>("/api/config").then(d => { if (d?.nom_avocat) setNomAvocat(d.nom_avocat); }).catch(() => {});
  }, [fetchBriefing]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      if (isDemo()) { await new Promise(r => setTimeout(r, 800)); setNotFound(false); }
      else await apiPost("/api/briefs/generate");
      toast.success("Briefing genere");
      setLoading(true);
      await fetchBriefing();
    } catch { toast.error("Erreur lors de la generation"); }
    finally { setGenerating(false); }
  };

  const openEmailById = (emailId: string) => {
    const m = mockV1Emails.find(e => e.id === emailId);
    if (!m) return;
    setSelectedEmail({
      id: m.id, expediteur: m.expediteur + " <" + m.email + ">", objet: m.objet, resume: m.resume,
      brouillon: m.brouillon_mock, pipeline_step: "pret_a_reviser", contexte_choisi: "", statut: "traite",
      created_at: m.date, updated_at: m.date, contenu: m.corps_original, dossier_id: m.dossier_id,
      dossier_name: m.dossier_nom ? m.dossier_nom + " - " + m.dossier_domaine : null,
      from_email: m.email, email_type: m.email_type,
      attachments: m.pieces_jointes.map((pj, i) => ({
        id: m.id + "-att-" + i, filename: pj.nom,
        type: pj.type_mime.includes("pdf") ? "pdf" : pj.type_mime.includes("image") ? "image" : "other",
        size: pj.taille,
      })),
    } as any);
  };

  const now = new Date();
  const hh = now.getHours();
  const greeting = hh < 12 ? "Bonjour" : hh < 18 ? "Bon apres-midi" : "Bonsoir";
  const dateStr = format(now, "EEEE d MMMM", { locale: fr });
  const periodEmails = isDemo() ? getV1EmailsForPeriod(period) : [];
  const periodStats = isDemo() ? getV1Stats(periodEmails) : null;
  const tempsGagne = periodStats ? Math.round(periodStats.total * 5) : 0;

  const filteredTodos = todoItems.filter(t => {
    const td = new Date(t.date).getTime(); const nm = Date.now();
    if (period === "24h") return nm - td < 86400000;
    if (period === "7j") return nm - td < 7 * 86400000;
    return nm - td < 30 * 86400000;
  });

  const prio = (t: TodoItem) => {
    if (t.done) return 10;
    if (t.urgency === "prioritaire") return 0; if (t.urgency === "echeance") return 1;
    if (t.type === "reponse" && t.hasDraft) return 2; if (t.type === "reponse") return 3;
    if (t.type === "action") return 4; return 5;
  };
  const sorted = [...filteredTodos].sort((a, b) => { const p = prio(a) - prio(b); return p !== 0 ? p : new Date(b.date).getTime() - new Date(a.date).getTime(); });
  const pending = sorted.filter(t => !t.done);
  const done = sorted.filter(t => t.done);

  const toggleTodo = (id: string) => {
    setTodoItems(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nd = !t.done;
      if (nd) {
        const rem = pending.filter(p => p.id !== id).length;
        if (rem === 0) toast.success("Bravo, tout est traite ! Donna est fiere de vous.");
        else toast.success("Fait ! Plus que " + rem + " tache" + (rem > 1 ? "s" : "") + ".");
      }
      return { ...t, done: nd };
    }));
  };

  const summary = "Bonjour Maitre Fernandez. Ce matin, Donna a analyse 12 nouveaux emails. 3 necessitent votre attention immediate : convocation JAF dossier Dupont (audience 15 avril), mise en demeure a envoyer pour SCI Les Tilleuls, nouveau document du notaire dans la succession Martin. Les 9 autres emails ont ete classes dans vos dossiers. Donna vous a fait gagner environ 45 minutes ce matin.";

  if (loading) return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 space-y-5 pt-10">
        <Skeleton className="h-8 w-52" /><Skeleton className="h-4 w-36" /><Skeleton className="h-20 rounded-xl mt-4" />
        <div className="space-y-3 mt-6">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      </div>
    </DashboardLayout>
  );

  if (notFound && !isDemo()) return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 text-center py-24">
        <Loader2 className={"h-7 w-7 mx-auto mb-4 text-muted-foreground" + (generating ? " animate-spin" : "")} />
        <p className="text-lg font-serif text-foreground mb-1">Donna prepare votre briefing</p>
        <p className="text-sm text-muted-foreground mb-6">Votre resume sera pret dans quelques instants.</p>
        <Button onClick={handleGenerate} disabled={generating} variant="outline" className="gap-2">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Generer le briefing
        </Button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 pb-24" data-tour="briefing">

        <motion.div {...fadeIn} className="pt-8 pb-5">
          <h1 className="text-2xl font-serif font-semibold text-foreground">{greeting}{nomAvocat ? ", " + nomAvocat : ""}</h1>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">{dateStr}</p>
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.03 }} className="flex gap-1.5 mb-5" role="group" aria-label="Filtre de periode">
          {(["24h", "7j", "30j"] as PeriodFilter[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} aria-pressed={period === p}
              className={"px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 " +
                (period === p ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </motion.div>

        {isDemo() && (
          <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3.5 mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Donna — resume de la nuit</p>
            <p className="text-sm text-foreground leading-relaxed">{summary}</p>
          </motion.div>
        )}

        {periodStats && (
          <motion.div {...fadeIn} transition={{ delay: 0.07 }} className="flex flex-wrap gap-x-5 gap-y-1.5 mb-7 px-0.5">
            <StatPill icon={<Mail className="h-3.5 w-3.5" />} value={periodStats.total} label="emails analyses" />
            <StatPill icon={<Check className="h-3.5 w-3.5" />} value={periodStats.dossier_emails} label="classes" />
            <StatPill icon={<FileText className="h-3.5 w-3.5" />} value={periodStats.attachments_count} label={periodStats.attachments_count === 1 ? "piece jointe" : "pieces jointes"} />
            {tempsGagne > 0 && <StatPill icon={<Clock className="h-3.5 w-3.5" />} value={"~" + tempsGagne + " min"} label="economisees" />}
          </motion.div>
        )}

        <motion.section {...fadeIn} transition={{ delay: 0.09 }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">A traiter</h2>
            {pending.length > 0 && <Badge variant="outline" className="h-5 text-[10px] px-1.5 bg-red-50 text-red-700 border-red-200 font-semibold">{pending.length}</Badge>}
          </div>
          {pending.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-muted/20 py-10 text-center">
              <Check className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-medium text-foreground">Tout est traite !</p>
              <p className="text-xs text-muted-foreground mt-0.5">Donna reviendra avec de nouveaux elements.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-background divide-y divide-border/40">
              {pending.map(item => <div key={item.id} className="px-3"><TodoRow item={item} onToggle={() => toggleTodo(item.id)} onOpen={() => openEmailById(item.email_id)} /></div>)}
            </div>
          )}
        </motion.section>

        {done.length > 0 && (
          <motion.section {...fadeIn} transition={{ delay: 0.12 }} className="mt-8">
            <button onClick={() => setDoneCollapsed(v => !v)} aria-expanded={!doneCollapsed} className="flex items-center gap-2 mb-2 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Traites par Donna</h2>
              <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">{done.length}</span>
              {doneCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto" />}
            </button>
            <AnimatePresence>
              {!doneCollapsed && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="rounded-xl border border-border/40 bg-background divide-y divide-border/30">
                    {done.map(item => <div key={item.id} className="px-3"><TodoRow item={item} onToggle={() => toggleTodo(item.id)} onOpen={() => openEmailById(item.email_id)} /></div>)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {tempsGagne > 0 && (
          <motion.p {...fadeIn} transition={{ delay: 0.15 }} className="text-xs text-muted-foreground text-center py-10">
            Donna vous a fait economiser ~{tempsGagne} min, soit environ {Math.round((tempsGagne / 60) * 200)} EUR a 200 EUR/h.
          </motion.p>
        )}
      </div>

      <AnimatePresence>
        {selectedEmail && <EmailDrawer email={selectedEmail} onClose={() => setSelectedEmail(null)} />}
      </AnimatePresence>
      {showTour && <GuidedTour onComplete={() => setShowTour(false)} />}
    </DashboardLayout>
  );
};

export default Dashboard;
