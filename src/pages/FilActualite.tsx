import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coffee, Loader2, RefreshCw, FolderOpen, Mail, Paperclip, CalendarDays, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { Email } from "@/hooks/useEmails";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiGet } from "@/lib/api";
import { EmailDrawer } from "@/components/EmailDrawer";
import { isDemoMode } from "@/hooks/useDemoMode";
import { activityFeed } from "@/lib/mock-data";

// ── Helpers ──

function formatEmailTime(created_at: string) {
  try {
    const date = new Date(created_at);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return format(date, "'Aujourd'hui à' HH'h'mm", { locale: fr });
    return format(date, "d MMM 'à' HH'h'mm", { locale: fr });
  } catch {
    return "";
  }
}

function senderInitial(expediteur: string): string {
  const match = expediteur.match(/^([^<]+)/);
  const name = match ? match[1].trim() : expediteur;
  return (name.replace(/[^a-zA-ZÀ-ÿ]/g, "")[0] || name[0] || "?").toUpperCase();
}

function senderColor(expediteur: string): string {
  let hash = 0;
  for (let i = 0; i < expediteur.length; i++) hash = expediteur.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 55%, 48%)`;
}

function SenderAvatar({ expediteur, size = 28 }: { expediteur: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-bold"
      style={{ width: size, height: size, backgroundColor: senderColor(expediteur), color: "white", fontSize: size * 0.4 }}
    >
      {senderInitial(expediteur)}
    </div>
  );
}

// ── Types ──

interface DossierGroup {
  dossier_id: string;
  dossier_name: string;
  domaine: string;
  emails: Email[];
  pieces: string[];
  dates: string[];
}

// ── Constants ──
const PAGE_SIZE = 10; // groups

// ── Main Component ──

const FilActualite = () => {
  const [searchParams] = useSearchParams();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [allEmails, setAllEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filterDossier, setFilterDossier] = useState("all");
  const [visibleGroupCount, setVisibleGroupCount] = useState(PAGE_SIZE);

  // Dossier name lookup
  const [dossierNames, setDossierNames] = useState<Record<string, { name: string; domaine: string }>>({});

  const isDemo = isDemoMode();

  const fetchEmails = useCallback(async () => {
    if (isDemo) {
      // Convert mock activity feed to Email-like objects
      const mockEmails: Email[] = activityFeed.map((item) => ({
        id: item.id,
        expediteur: item.expediteur,
        objet: item.objet,
        resume: item.resume,
        brouillon: item.brouillon || null,
        pipeline_step: "pret_a_reviser" as any,
        contexte_choisi: "",
        statut: "traite" as any,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        dossier_id: item.dossier,
      })) as any;
      setAllEmails(mockEmails);
      // Build dossier names from mock
      const names: Record<string, { name: string; domaine: string }> = {};
      activityFeed.forEach((item) => {
        if (item.dossier) names[item.dossier] = { name: item.dossier, domaine: "" };
      });
      setDossierNames(names);
      setLoading(false);
      return;
    }
    try {
      const data = await apiGet<Email[]>("/api/emails");
      const sorted = (data || []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAllEmails(sorted);
      setError(false);
    } catch (e) {
      console.error("Error fetching emails:", e);
      setError(true);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

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

  // Group emails by dossier
  const dossierGroups: DossierGroup[] = useMemo(() => {
    const grouped: Record<string, Email[]> = {};
    const ungrouped: Email[] = [];

    allEmails
      .filter((e) => e.statut !== "archive" && e.pipeline_step !== "importe" && e.pipeline_step !== "filtre_rejete")
      .forEach((email) => {
        const dossierId = (email as any).dossier_id;
        if (dossierId) {
          if (!grouped[dossierId]) grouped[dossierId] = [];
          grouped[dossierId].push(email);
        } else {
          ungrouped.push(email);
        }
      });

    const groups: DossierGroup[] = Object.entries(grouped).map(([id, emails]) => {
      const info = dossierNames[id];
      // Extract pieces from email classification
      const pieces: string[] = [];
      const dates: string[] = [];
      emails.forEach((e) => {
        const cls = (e as any).classification;
        if (cls?.attachments) pieces.push(...cls.attachments);
        if (cls?.key_dates) dates.push(...cls.key_dates.map((d: any) => typeof d === "string" ? d : `${d.date} — ${d.description}`));
      });

      return {
        dossier_id: id,
        dossier_name: info?.name || `Dossier #${id.slice(0, 8)}`,
        domaine: info?.domaine || "",
        emails,
        pieces: [...new Set(pieces)],
        dates: [...new Set(dates)],
      };
    });

    // Add ungrouped as a pseudo-dossier
    if (ungrouped.length > 0) {
      groups.push({
        dossier_id: "__unclassified__",
        dossier_name: "Emails non classés",
        domaine: "",
        emails: ungrouped,
        pieces: [],
        dates: [],
      });
    }

    // Sort: most recent email first
    groups.sort((a, b) => {
      const aDate = a.emails[0] ? new Date(a.emails[0].created_at).getTime() : 0;
      const bDate = b.emails[0] ? new Date(b.emails[0].created_at).getTime() : 0;
      return bDate - aDate;
    });

    return groups;
  }, [allEmails, dossierNames]);

  // Filter
  const filteredGroups = filterDossier === "all"
    ? dossierGroups
    : dossierGroups.filter((g) => g.dossier_id === filterDossier);

  const visibleGroups = filteredGroups.slice(0, visibleGroupCount);
  const hasMoreGroups = visibleGroupCount < filteredGroups.length;
  const totalEmails = allEmails.filter((e) => e.statut !== "archive" && e.pipeline_step !== "importe" && e.pipeline_step !== "filtre_rejete").length;
  const tempsMinutes = Math.round(totalEmails * 5);

  // ── Loading ──
  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6 pt-8">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-56 bg-muted animate-pulse rounded" />
              <div className="h-16 bg-muted animate-pulse rounded-xl" />
              <div className="h-16 bg-muted animate-pulse rounded-xl" />
            </div>
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
          <h1 className="text-lg font-serif font-semibold text-foreground">Activité de Donna</h1>
          <p className="text-sm text-muted-foreground mt-1">Tout ce que Donna a traité dans vos emails</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-6 mt-4">
          <Select value={filterDossier} onValueChange={(v) => { setFilterDossier(v); setVisibleGroupCount(PAGE_SIZE); }}>
            <SelectTrigger className="w-52 h-8 text-xs bg-card border-border">
              <SelectValue placeholder="Tous les dossiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les dossiers</SelectItem>
              {dossierGroups
                .filter((g) => g.dossier_id !== "__unclassified__")
                .map((g) => (
                  <SelectItem key={g.dossier_id} value={g.dossier_id}>
                    {g.dossier_name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">
            {filteredGroups.length} dossier{filteredGroups.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Empty state */}
        {dossierGroups.length === 0 ? (
          allEmails.length === 0 ? (
            <div className="text-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-serif text-foreground mb-1">Donna analyse vos emails...</p>
              <p className="text-sm text-muted-foreground">Revenez dans quelques minutes.</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Coffee className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">Rien de nouveau pour l'instant</p>
            </div>
          )
        ) : (
          <div className="space-y-6">
            {visibleGroups.map((group, gi) => (
              <motion.div
                key={group.dossier_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.05 }}
              >
                {/* Dossier header */}
                <div className="flex items-center gap-2 mb-3">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">{group.dossier_name}</span>
                  {group.domaine && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {group.domaine}
                    </span>
                  )}
                </div>

                {/* Emails in this dossier */}
                <div className="space-y-2 pl-6 border-l-2 border-border ml-2">
                  {group.emails.map((email) => (
                    <Card
                      key={email.id}
                      className="bg-card hover:shadow-sm transition-all cursor-pointer group"
                      onClick={() => setSelectedEmail(email)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground mt-1 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground truncate">{email.expediteur}</span>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {formatEmailTime(email.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/70 truncate mt-0.5">"{email.objet}"</p>
                            {email.resume && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1 leading-relaxed">
                                → {email.resume}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Pieces jointes for this dossier */}
                  {group.pieces.length > 0 && (
                    <div className="flex items-start gap-2 px-3 py-2">
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Pièces reçues : {group.pieces.join(", ")}
                      </p>
                    </div>
                  )}

                  {/* Dates détectées for this dossier */}
                  {group.dates.length > 0 && (
                    <div className="flex items-start gap-2 px-3 py-2">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="space-y-0.5">
                        {group.dates.map((date, di) => (
                          <p key={di} className="text-xs text-muted-foreground">{date}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Load more */}
            {hasMoreGroups && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleGroupCount((prev) => prev + PAGE_SIZE)}
                  className="text-xs"
                >
                  Voir plus de dossiers ({filteredGroups.length - visibleGroupCount} restants)
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Footer stats */}
        {totalEmails > 0 && (
          <p className="text-xs text-muted-foreground/50 text-center pt-10">
            {totalEmails} emails traités · {tempsMinutes}min gagnées
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
