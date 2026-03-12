import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Loader2, FileText, ArrowDownLeft, ArrowUpRight, ChevronDown, ChevronUp, File } from "lucide-react";
import { motion } from "framer-motion";
import type { Email } from "@/hooks/useEmails";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DossierDetailData {
  id: string;
  nom_client: string;
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
}

interface DossierEmail extends Email {
  contenu?: string;
}

const statutBadge = (statut: string) => {
  switch (statut) {
    case "actif":
      return <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs px-2.5 py-1 font-medium">Actif</span>;
    case "en_attente":
      return <span className="inline-flex items-center rounded-full bg-orange-100 text-orange-800 text-xs px-2.5 py-1 font-medium">En attente</span>;
    case "archive":
      return <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-xs px-2.5 py-1 font-medium">Archivé</span>;
    default:
      return <Badge variant="outline" className="text-xs">{statut}</Badge>;
  }
};

const formatDateFr = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const getDocIcon = (type: string) => {
  const t = type?.toLowerCase() || "";
  if (t.includes("pdf")) return <FileText className="h-5 w-5 text-red-500 shrink-0" />;
  if (t.includes("word") || t.includes("doc")) return <File className="h-5 w-5 text-blue-500 shrink-0" />;
  return <FileText className="h-5 w-5 text-muted-foreground shrink-0" />;
};

const isClientEmail = (expediteur: string, clientName: string) => {
  const expLower = expediteur?.toLowerCase() || "";
  const clientLower = clientName?.toLowerCase() || "";
  // Heuristic: if sender name overlaps with client name, it's incoming
  const clientParts = clientLower.split(" ").filter(p => p.length > 2);
  return clientParts.some(part => expLower.includes(part));
};

// Collapsible email content
const EmailContentBlock = ({ content, maxLines = 5 }: { content: string; maxLines?: number }) => {
  const lines = content.split("\n");
  const needsTruncate = lines.length > maxLines;
  const [expanded, setExpanded] = useState(false);

  if (!needsTruncate) return <p className="text-sm text-muted-foreground whitespace-pre-line">{content}</p>;

  return (
    <div>
      <p className="text-sm text-muted-foreground whitespace-pre-line">
        {expanded ? content : lines.slice(0, maxLines).join("\n") + "…"}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-primary font-medium mt-1 hover:underline inline-flex items-center gap-1"
      >
        {expanded ? (<>Voir moins <ChevronUp className="h-3 w-3" /></>) : (<>Voir plus <ChevronDown className="h-3 w-3" /></>)}
      </button>
    </div>
  );
};

const DossierDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [dossier, setDossier] = useState<DossierDetailData | null>(null);
  const [emails, setEmails] = useState<DossierEmail[]>([]);
  const [documents, setDocuments] = useState<DossierDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchAll = async () => {
      try {
        const [dossierData, emailsData, docsData] = await Promise.all([
          api.get<DossierDetailData>(`/api/dossiers/${id}`),
          api.get<DossierEmail[]>(`/api/dossiers/${id}/emails`).catch(() => []),
          api.get<DossierDocument[]>(`/api/dossiers/${id}/documents`).catch(() => []),
        ]);
        setDossier(dossierData);
        setEmails(emailsData || []);
        setDocuments(docsData || []);
      } catch (error) {
        console.error('Error fetching dossier:', error);
      }
      setLoading(false);
    };
    fetchAll();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!dossier) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-muted-foreground">Dossier introuvable.</p>
          <Link to="/dossiers" className="text-primary underline text-sm mt-2 inline-block">
            ← Retour aux dossiers
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const sortedEmails = [...emails].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <Link
          to="/dossiers"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour aux dossiers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content — 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* SECTION 1: Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h1 className="text-2xl font-serif font-bold text-foreground">{dossier.nom_client}</h1>
                    <p className="text-sm text-muted-foreground font-sans mt-1">{dossier.email_client}</p>
                  </div>
                  {statutBadge(dossier.statut)}
                </div>
                <div className="inline-flex items-center rounded-md bg-secondary text-secondary-foreground text-xs px-2.5 py-1 font-medium mb-4">
                  {dossier.domaine}
                </div>
                {dossier.resume_situation && (
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-foreground leading-relaxed">{dossier.resume_situation}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECTION 2: Timeline */}
            <div>
              <h2 className="text-lg font-serif font-semibold mb-4">Chronologie des échanges</h2>
              {sortedEmails.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground text-sm">Aucun email dans ce dossier</p>
                </Card>
              ) : (
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                  <div className="space-y-4">
                    {sortedEmails.map((email, i) => {
                      const isClient = isClientEmail(email.expediteur, dossier.nom_client);
                      return (
                        <motion.div
                          key={email.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="relative pl-10"
                        >
                          {/* Timeline dot */}
                          <div className="absolute left-2.5 top-4 h-3 w-3 rounded-full border-2 border-background bg-border" />

                          <Card className="overflow-hidden">
                            <CardContent className="p-4">
                              {/* Date + direction */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {isClient ? (
                                    <ArrowDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
                                  ) : (
                                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                                  )}
                                  <span className="text-xs font-medium text-foreground">{email.expediteur}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatDateFr(email.created_at)}
                                </span>
                              </div>

                              {/* Subject */}
                              <p className="text-sm font-semibold font-sans mb-2">{email.objet}</p>

                              {/* Content */}
                              {email.contenu ? (
                                <EmailContentBlock content={email.contenu} />
                              ) : email.resume ? (
                                <p className="text-sm text-muted-foreground">{email.resume}</p>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">En cours d'analyse…</p>
                              )}

                              {/* Draft */}
                              {email.brouillon && (
                                <div className="mt-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
                                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Brouillon Donna</p>
                                  <p className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-line">{email.brouillon}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: Documents */}
            {documents.length > 0 && (
              <div>
                <h2 className="text-lg font-serif font-semibold mb-4">Documents et pièces jointes</h2>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <Collapsible key={doc.id}>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {getDocIcon(doc.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium font-sans truncate">{doc.nom_fichier || doc.nom}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.date_reception ? formatDateFr(doc.date_reception) : formatDateFr(doc.created_at)}
                                {doc.type && <> • {doc.type}</>}
                              </p>
                            </div>
                            {doc.contenu_extrait && (
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-xs gap-1">
                                  Voir l'extrait
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </CollapsibleTrigger>
                            )}
                          </div>
                          {doc.contenu_extrait && (
                            <CollapsibleContent>
                              <div className="mt-3 pt-3 border-t border-border">
                                <p className="text-sm text-muted-foreground whitespace-pre-line">{doc.contenu_extrait}</p>
                              </div>
                            </CollapsibleContent>
                          )}
                        </CardContent>
                      </Card>
                    </Collapsible>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: Sidebar — 1/3 */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Domaine juridique" value={dossier.domaine} />
                <InfoRow
                  label="Dernier échange"
                  value={dossier.dernier_echange_date ? formatDateFr(dossier.dernier_echange_date) : "—"}
                />
                <InfoRow label="Emails" value={`${emails.length}`} />
                <InfoRow label="Documents" value={`${documents.length}`} />
                <InfoRow label="Statut" value={dossier.statut} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
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
