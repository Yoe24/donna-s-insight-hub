import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, File, CalendarDays, Mail, Paperclip, RefreshCw, Clock, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Email } from "@/hooks/useEmails";
import { apiGet } from "@/lib/api";
import { EmailDrawer } from "@/components/EmailDrawer";
import { isDemoMode } from "@/hooks/useDemoMode";
import { dossiers as mockDossiers } from "@/lib/mock-data";

interface DossierDetailData {
  id: string;
  nom_client: string;
  nom?: string;
  name?: string;
  client_name?: string;
  reference?: string;
  email_client: string;
  statut: string;
  domaine: string;
  resume_situation: string;
  dernier_echange_date: string;
  emails?: DossierEmail[];
  dossier_documents?: DossierDocument[];
}

interface DossierDocument {
  id: string;
  nom_fichier: string;
  nom?: string;
  type: string;
  contenu_extrait?: string;
  date_reception?: string;
  created_at: string;
  email_id?: string;
  expediteur?: string;
}

interface DossierEmail extends Email {
  contenu?: string;
  classification?: {
    needs_response?: boolean;
    key_dates?: { date: string; description: string }[];
    [key: string]: any;
  };
}

const statutBadge = (statut: string) => {
  switch (statut) {
    case "actif":
      return <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium">Actif</span>;
    case "en_attente":
      return <span className="inline-flex items-center rounded-full bg-orange-100 text-orange-800 text-xs px-2.5 py-1 font-medium">En attente</span>;
    case "archive":
    case "archivé":
      return <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-xs px-2.5 py-1 font-medium">Archivé</span>;
    default:
      return <Badge variant="outline" className="text-xs">{statut}</Badge>;
  }
};

const formatDateFr = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch { return dateStr; }
};

const getDocIcon = (type: string) => {
  const t = type?.toLowerCase() || "";
  if (t.includes("pdf")) return <FileText className="h-4 w-4 text-destructive/70 shrink-0" />;
  if (t.includes("word") || t.includes("doc")) return <File className="h-4 w-4 text-primary/70 shrink-0" />;
  return <FileText className="h-4 w-4 text-muted-foreground shrink-0" />;
};

function isWithin7Days(dateStr: string): boolean {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  } catch { return false; }
}

function daysSince(dateStr: string): number {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  } catch { return 0; }
}

const DossierDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [dossier, setDossier] = useState<DossierDetailData | null>(null);
  const [emails, setEmails] = useState<DossierEmail[]>([]);
  const [documents, setDocuments] = useState<DossierDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<DossierEmail | null>(null);
  const [error, setError] = useState(false);

  const isDemo = isDemoMode();

  const fetchDossier = useCallback(async () => {
    if (!id) return;

    if (isDemo) {
      const mock = mockDossiers.find((d) => d.id === id);
      if (mock) {
        setDossier({
          id: mock.id,
          nom_client: mock.nomClient,
          email_client: "",
          statut: mock.statut,
          domaine: mock.categorie,
          resume_situation: mock.resumeDonna,
          dernier_echange_date: mock.dernierMail,
          dossier_documents: mock.piecesRecues.map((p, i) => ({
            id: String(i),
            nom_fichier: p.nom,
            type: p.type,
            created_at: new Date().toISOString(),
          })),
        });
        // Convert mock timeline to emails
        setEmails(
          mock.timeline.map((t, i) => ({
            id: `mock-${i}`,
            expediteur: t.expediteur,
            objet: t.resume,
            resume: t.resume,
            brouillon: null,
            pipeline_step: "pret_a_reviser" as any,
            contexte_choisi: "",
            statut: "traite" as any,
            metadata: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            classification: {
              key_dates: mock.datesCles.map((dc) => ({ date: dc.date, description: dc.label })),
            },
            _type: t.type,
          })) as any
        );
        setDocuments(
          mock.piecesRecues.map((p, i) => ({
            id: String(i),
            nom_fichier: p.nom,
            type: p.type,
            created_at: new Date().toISOString(),
          }))
        );
      }
      setLoading(false);
      return;
    }

    try {
      const data = await apiGet<DossierDetailData>(`/api/dossiers/${id}`);
      setDossier(data);
      setDocuments(data.dossier_documents || []);
      if (data.emails && data.emails.length > 0) {
        setEmails(data.emails);
      } else {
        try {
          const emailData = await apiGet<DossierEmail[]>(`/api/emails?dossier_id=${id}`);
          setEmails(emailData || []);
        } catch { setEmails([]); }
      }
      setError(false);
    } catch (e) {
      console.error("Error fetching dossier:", e);
      setError(true);
      toast.error("Erreur lors du chargement du dossier");
    } finally {
      setLoading(false);
    }
  }, [id, isDemo]);

  useEffect(() => { fetchDossier(); }, [fetchDossier]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-8 space-y-6">
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
          <div className="h-48 bg-muted animate-pulse rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !dossier) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-lg font-serif text-foreground mb-2">Connexion impossible</p>
          <p className="text-sm text-muted-foreground mb-4">Impossible de charger ce dossier.</p>
          <Button variant="outline" onClick={fetchDossier} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!dossier) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-muted-foreground">Dossier introuvable.</p>
          <Link to="/dashboard" className="text-primary underline text-sm mt-2 inline-block">← Retour</Link>
        </div>
      </DashboardLayout>
    );
  }

  const sortedEmails = [...emails].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Extract key_dates
  const allKeyDates: { date: string; description: string }[] = [];
  sortedEmails.forEach((email) => {
    const kd = email.classification?.key_dates;
    if (kd && Array.isArray(kd)) kd.forEach((d) => allKeyDates.push(d));
  });

  // Timeline: emails + documents merged
  const timelineEvents = [
    ...sortedEmails.map((e) => ({
      type: (e as any)._type === "envoye" ? "sent" : "email" as string,
      date: e.created_at,
      title: e.objet,
      subtitle: e.expediteur,
      summary: e.resume || "",
      email: e,
    })),
    ...documents.map((d) => ({
      type: "document" as string,
      date: d.date_reception || d.created_at,
      title: d.nom_fichier || d.nom || "Document",
      subtitle: d.expediteur || "",
      summary: d.type || "",
      email: null as DossierEmail | null,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // "En attente" — look for mock data or API piecesManquantes
  const mockData = isDemo ? mockDossiers.find((d) => d.id === id) : null;
  const enAttente: { description: string; jours: number }[] = [];
  if (mockData) {
    mockData.piecesManquantes.forEach((piece) => {
      enAttente.push({ description: `${piece} — demandé(e), pas encore reçu(e)`, jours: Math.floor(Math.random() * 20 + 5) });
    });
  }

  const clientName = dossier.nom || dossier.name || dossier.nom_client;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-16">
        {/* Back */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main — 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start justify-between gap-4 mb-1">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-foreground">{clientName}</h1>
                  {dossier.email_client && (
                    <p className="text-sm text-muted-foreground mt-0.5">{dossier.email_client}</p>
                  )}
                </div>
                {statutBadge(dossier.statut)}
              </div>
              {dossier.domaine && (
                <span className="inline-flex items-center rounded-md bg-secondary text-secondary-foreground text-xs px-2.5 py-1 font-medium mt-2">
                  {dossier.domaine}
                </span>
              )}
            </motion.div>

            {/* Résumé */}
            {dossier.resume_situation && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className="rounded-xl bg-muted/40 border border-border p-5">
                  <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                    {dossier.resume_situation}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Dates clés */}
            {allKeyDates.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Dates clés</h2>
                <div className="space-y-2">
                  {allKeyDates.map((kd, i) => {
                    const urgent = isWithin7Days(kd.date);
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 border ${
                          urgent ? "bg-destructive/5 border-destructive/20" : "bg-card border-border"
                        }`}
                      >
                        <CalendarDays className={`h-4 w-4 shrink-0 ${urgent ? "text-destructive" : "text-muted-foreground"}`} />
                        <span className={`text-sm font-medium ${urgent ? "text-destructive" : "text-foreground"}`}>{kd.date}</span>
                        <span className="text-sm text-muted-foreground">{kd.description}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Chronologie */}
            {timelineEvents.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Chronologie</h2>
                <div className="relative">
                  <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-0">
                    {timelineEvents.map((event, i) => {
                      const EventIcon = event.type === "document" ? Paperclip
                        : event.type === "sent" ? Send
                        : Mail;
                      return (
                        <div
                          key={i}
                          className={`relative flex items-start gap-4 py-3 pl-10 pr-4 rounded-lg transition-colors ${
                            event.email ? "hover:bg-muted/50 cursor-pointer" : ""
                          }`}
                          onClick={() => { if (event.email) setSelectedEmail(event.email); }}
                        >
                          <div className="absolute left-2.5 top-3.5 z-10 h-7 w-7 rounded-full bg-background border border-border flex items-center justify-center">
                            <EventIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <span className="text-[11px] text-muted-foreground w-24 shrink-0 pt-0.5 tabular-nums">
                            {formatDateFr(event.date)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-foreground truncate block">{event.subtitle}</span>
                            <p className="text-sm text-foreground/80 truncate">{event.title}</p>
                            {event.summary && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{event.summary}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Documents reçus */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Documents reçus</h2>
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Aucun document détecté pour l'instant</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 rounded-lg bg-card border border-border px-4 py-3">
                      {getDocIcon(doc.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.nom_fichier || doc.nom}</p>
                        {doc.expediteur && <p className="text-xs text-muted-foreground">de {doc.expediteur}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDateFr(doc.date_reception || doc.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* En attente */}
            {enAttente.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">En attente</h2>
                <div className="space-y-2">
                  {enAttente.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg bg-card border border-border px-4 py-3">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground">
                        {item.description}
                        <span className="text-muted-foreground"> ({item.jours} jours)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar info — 1/3 */}
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Client" value={dossier.client_name || dossier.nom_client} />
                <InfoRow label="Domaine" value={dossier.domaine || "—"} />
                <InfoRow label="Dernier échange" value={dossier.dernier_echange_date ? formatDateFr(dossier.dernier_echange_date) : "—"} />
                <InfoRow label="Emails" value={`${emails.length}`} />
                <InfoRow label="Documents" value={`${documents.length}`} />
                <InfoRow label="Statut" value={dossier.statut} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedEmail && (
          <EmailDrawer email={selectedEmail} onClose={() => setSelectedEmail(null)} showDossierLink={false} />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

export default DossierDetailPage;
