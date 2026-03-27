/**
 * FilActualite — Activity feed page
 *
 * In demo mode, uses local mock data (no API calls).
 * In real mode, fetches from API using the active user_id.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Coffee, RefreshCw, Mail, FileText, Image, Clock, ChevronRight, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { Email } from "@/hooks/useEmails";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiGet } from "@/lib/api";
import { isDemo } from "@/lib/auth";
import { mockBriefing, mockAllEmails } from "@/lib/mock-briefing";
import { EmailDrawer } from "@/components/EmailDrawer";

function formatEmailDateTime(created_at: string): string {
  try {
    const date = new Date(created_at);
    if (isNaN(date.getTime())) return "";
    return format(date, "d MMM, HH'h'mm", { locale: fr });
  } catch {
    return "";
  }
}

function formatShortDate(created_at: string): string {
  try {
    const date = new Date(created_at);
    if (isNaN(date.getTime())) return "";
    return format(date, "d MMM", { locale: fr });
  } catch {
    return "";
  }
}

type TabId = "tous" | "emails" | "pj" | "relances";

const TABS: { id: TabId; label: string }[] = [
  { id: "tous", label: "Tous" },
  { id: "emails", label: "Clients" },
  { id: "pj", label: "Pièces jointes" },
  { id: "relances", label: "Autre" },
];

interface ApiAttachment {
  id?: string;
  filename?: string;
  name?: string;
  type?: string;
  date?: string;
  created_at?: string;
}

interface ApiEmail {
  id: string;
  from_name?: string;
  from_email?: string;
  subject?: string;
  summary?: string | null;
  date?: string;
  dossier_id?: string | null;
  dossier_name?: string | null;
  dossier_domain?: string | null;
  gmail_link?: string | null;
  attachments?: ApiAttachment[];
  statut?: Email["statut"];
  pipeline_step?: Email["pipeline_step"];
  contexte_choisi?: string;
  updated_at?: string;
}

interface FlatEmail extends Email {
  from_email: string | null;
  gmail_link: string | null;
  attachments: ApiAttachment[];
  dossier_name: string | null;
  dossier_domaine: string | null;
  dossier_id: string | null;
}

interface FlatPJ {
  id: string;
  nom: string;
  dossier_name: string;
  date: string;
  type: string;
}

interface FlatRelance {
  id: string;
  nom_client: string;
  description: string;
  jours: number;
}

interface ApiBriefDossier {
  name?: string;
  nom?: string;
  attente?: {
    description?: string;
    jours?: number;
  };
}

const PAGE_SIZE = 15;

function buildSender(fromName?: string, fromEmail?: string): string {
  const safeName = fromName || "";
  const safeEmail = fromEmail || "";
  if (safeName && safeEmail) return `${safeName} <${safeEmail}>`;
  return safeName || safeEmail || "";
}

function normalizeEmail(email: ApiEmail): FlatEmail {
  return {
    id: email.id,
    expediteur: buildSender(email.from_name, email.from_email),
    objet: email.subject || "",
    resume: email.summary || "",
    brouillon: null,
    pipeline_step: email.pipeline_step || "pret_a_reviser",
    contexte_choisi: email.contexte_choisi || "",
    statut: email.statut || "traite",
    metadata: undefined,
    created_at: email.date || "",
    updated_at: email.updated_at || email.date || "",
    from_email: email.from_email || null,
    gmail_link: email.gmail_link || null,
    attachments: email.attachments || [],
    dossier_name: email.dossier_name || null,
    dossier_domaine: email.dossier_domain || null,
    dossier_id: email.dossier_id || null,
  };
}

function normalizeAttachment(email: FlatEmail, attachment: ApiAttachment, index: number): FlatPJ {
  return {
    id: attachment.id || `${email.id}-att-${index}`,
    nom: attachment.filename || attachment.name || "",
    dossier_name: email.dossier_name || "",
    date: attachment.date || attachment.created_at || email.created_at || "",
    type: attachment.type || "",
  };
}

const FilActualite = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [allEmails, setAllEmails] = useState<FlatEmail[]>([]);
  const [pjList, setPjList] = useState<FlatPJ[]>([]);
  const [relancesList, setRelancesList] = useState<FlatRelance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const rawTab = searchParams.get("tab");
  const activeTab: TabId = rawTab === "emails" || rawTab === "pj" || rawTab === "relances" ? rawTab : "tous";

  const setActiveTab = (tab: TabId) => {
    setSearchParams(tab === "tous" ? {} : { tab }, { replace: true });
    setVisibleCount(PAGE_SIZE);
  };

  useEffect(() => {
    const loadRelances = async () => {
      try {
        const brief = isDemo() ? mockBriefing : await apiGet<any>("/api/briefs/today");
        const dossiers: ApiBriefDossier[] = brief?.content?.dossiers || [];
        const relances: FlatRelance[] = dossiers
          .filter((dossier) => dossier.attente)
          .map((dossier, index) => ({
            id: `rel-${index}`,
            nom_client: dossier.name || dossier.nom || "",
            description: dossier.attente?.description || "",
            jours: dossier.attente?.jours || 0,
          }));
        setRelancesList(relances);
      } catch {
        // ignore
      }
    };
    loadRelances();
  }, []);

  const fetchEmails = useCallback(async () => {
    try {
      let normalized: FlatEmail[];
      if (isDemo()) {
        await new Promise((r) => setTimeout(r, 300));
        // Convert mockAllEmails to FlatEmail shape
        normalized = mockAllEmails.map((item) => ({
          id: item.id,
          expediteur: `${item.expediteur} <${item.email}>`,
          objet: item.objet,
          resume: item.resume,
          brouillon: item.brouillon_mock || null,
          pipeline_step: (item.category === "client" ? "pret_a_reviser" : "filtre_rejete") as any,
          contexte_choisi: "",
          statut: (item.category === "client" ? "traite" : "ignore") as FlatEmail["statut"],
          metadata: undefined,
          created_at: item.date,
          updated_at: item.date,
          from_email: item.email,
          email_type: item.email_type,
          gmail_link: null,
          attachments: item.pieces_jointes.map((pj, i) => ({
            id: `${item.id}-att-${i}`,
            filename: pj.nom,
            type: pj.type_mime.includes("pdf") ? "pdf" : pj.type_mime.includes("image") ? "image" : "other",
            date: item.date,
          })),
          dossier_name: item.dossier_nom ? `${item.dossier_nom} - ${item.dossier_domaine}` : null,
          dossier_domaine: item.dossier_domaine,
          dossier_id: item.dossier_id,
          contenu: item.corps_original,
          category: item.category,
        } as any));
      } else {
        const data = await apiGet<ApiEmail[]>("/api/emails");
        normalized = (data || []).map(normalizeEmail);
      }
      const sorted = normalized.sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

      setAllEmails(sorted);
      setPjList(
        sorted
          .flatMap((email) => (email.attachments || []).map((attachment, index) => normalizeAttachment(email, attachment, index)))
          .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      );
      setError(false);
    } catch (err) {
      console.error("Error fetching emails:", err);
      setError(true);
      toast.error("Erreur de connexion");
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

  const filteredEmails = useMemo(
    () =>
      allEmails.filter(
        (email) => email.statut !== "archive" && email.pipeline_step !== "importe"
      ),
    [allEmails]
  );

  const clientEmails = useMemo(() => filteredEmails.filter((e) => {
    const cat = (e as any).category;
    return cat ? cat === "client" : e.pipeline_step !== "filtre_rejete";
  }), [filteredEmails]);
  const nonClientEmails = useMemo(() => filteredEmails.filter((e) => {
    const cat = (e as any).category;
    return cat ? cat !== "client" : e.pipeline_step === "filtre_rejete";
  }), [filteredEmails]);

  const emailsToShow = activeTab === "tous" ? filteredEmails : activeTab === "emails" ? clientEmails : [];
  const pjToShow = activeTab === "pj" ? pjList : [];
  const relancesToShow = activeTab === "relances" ? nonClientEmails as any[] : [];

  const totalItems =
    activeTab === "pj" ? pjToShow.length : activeTab === "relances" ? relancesToShow.length : emailsToShow.length;

  const visibleEmails = emailsToShow.slice(0, visibleCount);
  const visiblePJ = pjToShow.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;

  const handleEmailClick = (email: FlatEmail) => {
    setSelectedEmail(email as Email);
  };

  const fileIcon = (type: string) => {
    if (type === "image") return <Image className="h-4 w-4 text-muted-foreground shrink-0" />;
    if (type === "word" || type === "doc") return <FileText className="h-4 w-4 text-blue-500 shrink-0" />;
    return <FileText className="h-4 w-4 text-red-500 shrink-0" />;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6 pt-8">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          <div className="flex gap-2 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 w-24 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (error && allEmails.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto text-center py-20">
          <p className="text-lg font-serif text-foreground mb-2">Erreur de chargement</p>
          <p className="text-sm text-muted-foreground mb-4">Impossible de charger vos emails.</p>
          <Button variant="outline" onClick={fetchEmails} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto pb-24">
        <div className="pt-8 pb-2">
          <h1 className="text-xl font-serif font-semibold text-foreground">Fil d'actualité</h1>
          <p className="text-sm text-muted-foreground mt-1">Tout ce que Donna a traité dans vos emails</p>
        </div>

        <div className="flex gap-1.5 mt-4 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-emerald text-emerald-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {(activeTab === "tous" || activeTab === "emails") && (
          <>
            {filteredEmails.length === 0 ? (
              <div className="text-center py-16">
                <Coffee className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Aucun email traité pour l'instant</p>
              </div>
            ) : (
              <div className="space-y-1">
                {visibleEmails.map((email, i) => (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <button
                      onClick={() => handleEmailClick(email)}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted/40 transition-colors group"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium text-foreground shrink-0 max-w-[160px] truncate">
                          {(email.expediteur || email.from_email || "").replace(/<[^>]+>/, "").trim()}
                        </span>
                        <span className="text-muted-foreground shrink-0">—</span>
                        <span className="text-sm text-foreground/70 truncate flex-1 min-w-0">"{email.objet || ""}"</span>
                        {(email as any).category && (email as any).category !== "client" && (
                          <span className="inline-flex items-center rounded-full text-[9px] px-2 py-0.5 bg-muted text-muted-foreground shrink-0">
                            Filtré
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto pl-2 whitespace-nowrap shrink-0">
                          {formatEmailDateTime(email.created_at)}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="ml-[22px] mt-0.5">
                        {email.dossier_name ? (
                          <span className="text-xs text-muted-foreground">
                            Dossier : {email.dossier_name}
                            {email.dossier_domaine ? ` · ${email.dossier_domaine}` : ""}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Non rattaché à un dossier</span>
                        )}
                      </div>
                      {email.resume ? <p className="text-xs text-muted-foreground mt-0.5 ml-[22px] line-clamp-1">→ {email.resume}</p> : null}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "pj" && (
          <>
            {pjToShow.length === 0 ? (
              <div className="text-center py-16">
                <Paperclip className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Aucune pièce jointe extraite</p>
              </div>
            ) : (
              <div className="space-y-1">
                {visiblePJ.map((pj, i) => (
                  <motion.div
                    key={pj.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer overflow-hidden">
                      {fileIcon(pj.type)}
                      <span className="text-sm text-foreground truncate flex-1 min-w-0">{pj.nom}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{pj.dossier_name ? `· ${pj.dossier_name}` : ""}</span>
                      <span className="text-xs text-muted-foreground ml-auto pl-2 whitespace-nowrap shrink-0">{formatShortDate(pj.date)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "relances" && (
          <>
            {relancesToShow.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Aucun email filtré</p>
              </div>
            ) : (
              <div className="space-y-1">
                {relancesToShow.map((email: any, i: number) => (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <div className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted/40 transition-colors opacity-60">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground shrink-0 max-w-[160px] truncate">
                          {(email.expediteur || "").replace(/<[^>]+>/, "").trim()}
                        </span>
                        <span className="text-muted-foreground shrink-0">—</span>
                        <span className="text-sm text-muted-foreground truncate flex-1 min-w-0">{email.objet || ""}</span>
                        <span className="inline-flex items-center rounded-full text-[9px] px-2 py-0.5 bg-muted text-muted-foreground shrink-0">
                          Filtré par Donna
                        </span>
                      </div>
                      {email.resume ? <p className="text-xs text-muted-foreground mt-0.5 ml-[22px] line-clamp-1">→ {email.resume}</p> : null}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {hasMore && (
          <div className="text-center pt-6">
            <Button variant="outline" size="sm" onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)} className="text-xs">
              Voir plus ({totalItems - visibleCount} restants)
            </Button>
          </div>
        )}

        {filteredEmails.length > 0 && (
          <p className="text-xs text-muted-foreground/50 text-center pt-10">
            {filteredEmails.length} emails traités · {Math.round(filteredEmails.length * 5)}min gagnées
          </p>
        )}
      </div>

      <AnimatePresence>
        {selectedEmail && <EmailDrawer email={selectedEmail} onClose={() => setSelectedEmail(null)} context="fil" />}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default FilActualite;
