import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee, Loader2, RefreshCw, Mail, FileText, Image, Clock, ChevronRight, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { Email } from "@/hooks/useEmails";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiGet } from "@/lib/api";
import { EmailDrawer } from "@/components/EmailDrawer";
import { isDemoMode } from "@/hooks/useDemoMode";
import { activityFeed, dossiers as mockDossiers } from "@/lib/mock-data";
import { mockBriefing } from "@/lib/mock-briefing";

// ── Helpers ──

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
  { id: "emails", label: "Emails" },
  { id: "pj", label: "Pièces jointes" },
  { id: "relances", label: "Relances" },
];

// ── Mock data enrichment ──

interface FlatEmail {
  id: string;
  expediteur: string;
  objet: string;
  resume: string | null;
  brouillon: string | null;
  dossier_name: string | null;
  dossier_domaine: string | null;
  dossier_id: string | null;
  created_at: string;
  pipeline_step: string;
  statut: string;
  contexte_choisi: string;
  metadata?: any;
  updated_at: string;
}

interface FlatPJ {
  id: string;
  nom: string;
  dossier_name: string;
  date: string;
  type: "pdf" | "word" | "image";
}

interface FlatRelance {
  id: string;
  nom_client: string;
  description: string;
  jours: number;
}

function buildDemoEmails(): FlatEmail[] {
  const baseDate = new Date();
  return activityFeed.map((item, i) => {
    // Parse dossier name and domain from "Dupont - Litige commercial"
    const parts = item.dossier?.split(" - ") ?? [];
    const dossierName = parts[0] || null;
    const dossierDomaine = parts[1] || null;

    // Stagger times: first email = today minus 0h, last = today minus 48h spread
    const offsetHours = i * 5 + Math.floor(i * 1.7);
    const emailDate = new Date(baseDate.getTime() - offsetHours * 60 * 60 * 1000);

    return {
      id: item.id,
      expediteur: item.expediteur,
      objet: item.objet,
      resume: item.resume,
      brouillon: item.brouillon || null,
      dossier_name: dossierName,
      dossier_domaine: dossierDomaine,
      dossier_id: item.dossier ? item.id : null,
      created_at: emailDate.toISOString(),
      pipeline_step: "pret_a_reviser",
      statut: "traite",
      contexte_choisi: "",
      metadata: {},
      updated_at: emailDate.toISOString(),
    };
  });
}

function buildDemoPJ(): FlatPJ[] {
  const baseDate = new Date();
  const pjs: FlatPJ[] = [];
  let idx = 0;
  mockDossiers.forEach((d) => {
    d.piecesRecues.forEach((p) => {
      const offsetHours = idx * 8 + 2;
      const pjDate = new Date(baseDate.getTime() - offsetHours * 60 * 60 * 1000);
      pjs.push({
        id: `pj-${idx}`,
        nom: p.nom,
        dossier_name: d.nomClient,
        date: pjDate.toISOString(),
        type: p.type,
      });
      idx++;
    });
  });
  return pjs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function buildDemoRelances(): FlatRelance[] {
  return (mockBriefing.content.dossiers || [])
    .filter((d) => d.attente)
    .map((d, i) => ({
      id: `rel-${i}`,
      nom_client: d.nom,
      description: d.attente!.description,
      jours: d.attente!.jours,
    }));
}

// ── Constants ──
const PAGE_SIZE = 15;

// ── Main Component ──

const FilActualite = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [allEmails, setAllEmails] = useState<FlatEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Tab from URL or default
  const rawTab = searchParams.get("tab");
  const activeTab: TabId = (rawTab === "emails" || rawTab === "pj" || rawTab === "relances") ? rawTab : "tous";

  const setActiveTab = (tab: TabId) => {
    setSearchParams(tab === "tous" ? {} : { tab }, { replace: true });
    setVisibleCount(PAGE_SIZE);
  };

  // Dossier name lookup for live mode
  const [dossierNames, setDossierNames] = useState<Record<string, { name: string; domaine: string }>>({});

  const isDemo = isDemoMode();

  // Demo data
  const demoPJ = useMemo(() => isDemo ? buildDemoPJ() : [], [isDemo]);
  const demoRelances = useMemo(() => isDemo ? buildDemoRelances() : [], [isDemo]);

  const fetchEmails = useCallback(async () => {
    if (isDemo) {
      setAllEmails(buildDemoEmails());
      setLoading(false);
      return;
    }
    try {
      const data = await apiGet<Email[]>("/api/emails");
      const sorted = (data || []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      // Convert to FlatEmail with dossier info
      const flat: FlatEmail[] = sorted.map((e) => {
        const dossierId = (e as any).dossier_id;
        const info = dossierId ? dossierNames[dossierId] : null;
        return {
          ...e,
          dossier_name: info?.name || null,
          dossier_domaine: info?.domaine || null,
          dossier_id: dossierId || null,
        };
      });
      setAllEmails(flat);
      setError(false);
    } catch (err) {
      console.error("Error fetching emails:", err);
      setError(true);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }, [isDemo, dossierNames]);

  // Fetch dossier names for live mode
  useEffect(() => {
    if (isDemo) return;
    apiGet<any[]>("/api/dossiers")
      .then((dossiers) => {
        const map: Record<string, { name: string; domaine: string }> = {};
        (dossiers || []).forEach((d: any) => {
          map[d.id] = { name: d.nom_client || d.nom || d.id, domaine: d.domaine || "" };
        });
        setDossierNames(map);
      })
      .catch(() => {});
  }, [isDemo]);

  useEffect(() => {
    const userId = searchParams.get("user_id");
    if (userId) {
      localStorage.setItem("donna_user_id", userId);
      window.history.replaceState({}, "", "/fil");
    }
  }, [searchParams]);

  useEffect(() => {
    fetchEmails();
    if (!isDemo) {
      const interval = setInterval(fetchEmails, 60000);
      return () => clearInterval(interval);
    }
  }, [fetchEmails, isDemo]);

  // Filter emails (exclude archived/rejected)
  const filteredEmails = useMemo(
    () =>
      allEmails.filter(
        (e) => e.statut !== "archive" && e.pipeline_step !== "importe" && e.pipeline_step !== "filtre_rejete"
      ),
    [allEmails]
  );

  // Items for current tab
  const emailsToShow = activeTab === "tous" || activeTab === "emails" ? filteredEmails : [];
  const pjToShow = activeTab === "pj" ? demoPJ : [];
  const relancesToShow = activeTab === "relances" ? demoRelances : [];

  const totalItems =
    activeTab === "pj" ? pjToShow.length : activeTab === "relances" ? relancesToShow.length : emailsToShow.length;

  const visibleEmails = emailsToShow.slice(0, visibleCount);
  const visiblePJ = pjToShow.slice(0, visibleCount);
  const hasMore = visibleCount < totalItems;

  const handleEmailClick = (email: FlatEmail) => {
    // Cast to Email for the drawer
    setSelectedEmail(email as unknown as Email);
  };

  const fileIcon = (type: string) => {
    if (type === "image") return <Image className="h-4 w-4 text-muted-foreground shrink-0" />;
    if (type === "word") return <FileText className="h-4 w-4 text-blue-500 shrink-0" />;
    return <FileText className="h-4 w-4 text-red-500 shrink-0" />;
  };

  // ── Loading ──
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

  // ── Error ──
  if (error && allEmails.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto text-center py-20">
          <p className="text-lg font-serif text-foreground mb-2">Connexion impossible</p>
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
      <div className="max-w-3xl mx-auto pb-16">
        {/* Header */}
        <div className="pt-8 pb-2">
          <h1 className="text-lg font-serif font-semibold text-foreground">Fil d'actualité</h1>
          <p className="text-sm text-muted-foreground mt-1">Tout ce que Donna a traité dans vos emails</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mt-4 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Tous / Emails */}
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
                      {/* Line 1: sender + subject + date */}
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium text-foreground shrink-0 max-w-[160px] truncate">
                          {email.expediteur}
                        </span>
                        <span className="text-muted-foreground shrink-0">—</span>
                        <span className="text-sm text-foreground/70 truncate flex-1 min-w-0">
                          "{email.objet}"
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto pl-2 whitespace-nowrap shrink-0">
                          {formatEmailDateTime(email.created_at)}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {/* Line 2: dossier */}
                      <div className="ml-[22px] mt-0.5">
                        {email.dossier_name ? (
                          <span className="text-xs text-muted-foreground">
                            Dossier : {email.dossier_name}
                            {email.dossier_domaine && ` · ${email.dossier_domaine}`}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Non rattaché à un dossier
                          </span>
                        )}
                      </div>
                      {/* Line 3: summary */}
                      {email.resume && (
                        <p className="text-xs text-muted-foreground mt-0.5 ml-[22px] line-clamp-1">
                          → {email.resume}
                        </p>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab: Pièces jointes */}
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
                      <span className="text-xs text-muted-foreground shrink-0">· {pj.dossier_name}</span>
                      <span className="text-xs text-muted-foreground ml-auto pl-2 whitespace-nowrap shrink-0">
                        {formatShortDate(pj.date)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab: Relances */}
        {activeTab === "relances" && (
          <>
            {relancesToShow.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Aucune relance en attente</p>
              </div>
            ) : (
              <div className="space-y-1">
                {relancesToShow.map((rel, i) => (
                  <motion.div
                    key={rel.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-muted/40 transition-colors overflow-hidden">
                      <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="text-sm text-foreground font-medium shrink-0">{rel.nom_client}</span>
                      <span className="text-muted-foreground shrink-0">·</span>
                      <span className="text-sm text-foreground/70 truncate flex-1 min-w-0">{rel.description}</span>
                      <span className="text-xs text-amber-600 ml-auto pl-2 whitespace-nowrap shrink-0">
                        il y a {rel.jours} jours
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="text-center pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="text-xs"
            >
              Voir plus ({totalItems - visibleCount} restants)
            </Button>
          </div>
        )}

        {/* Footer stats */}
        {filteredEmails.length > 0 && (
          <p className="text-xs text-muted-foreground/50 text-center pt-10">
            {filteredEmails.length} emails traités · {Math.round(filteredEmails.length * 5)}min gagnées
          </p>
        )}
      </div>

      <AnimatePresence>
        {selectedEmail && (
          <EmailDrawer email={selectedEmail} onClose={() => setSelectedEmail(null)} />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default FilActualite;
