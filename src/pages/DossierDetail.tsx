import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, FileText, File, ChevronDown, Sparkles, Paperclip, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import type { Email } from "@/hooks/useEmails";
import { apiGet } from "@/lib/api";
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
      return <span className="inline-flex items-center rounded-full bg-prospect-light text-prospect-foreground text-xs px-2.5 py-1 font-medium">Actif</span>;
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
  if (t.includes("pdf")) return <FileText className="h-4 w-4 text-red-500 shrink-0" />;
  if (t.includes("word") || t.includes("doc")) return <File className="h-4 w-4 text-client shrink-0" />;
  return <FileText className="h-4 w-4 text-muted-foreground shrink-0" />;
};

// Parse the structured resume_situation field
function parseResumeSituation(text: string) {
  const sections = {
    client: '',
    besoin: '',
    situation: '',
    enAttente: '',
    pieces: '',
    echanges: '',
    prochaineAction: '',
  };
  if (!text) return sections;

  const clientMatch = text.match(/👤[^\n]*?:\s*([\s\S]*?)(?=📌|📊|⏳|📎|💬|🎯|$)/);
  const besoinMatch = text.match(/📌[^\n]*?:\s*([\s\S]*?)(?=📊|⏳|📎|💬|🎯|$)/);
  const situationMatch = text.match(/📊[^\n]*?:\s*([\s\S]*?)(?=⏳|📎|💬|🎯|$)/);
  const attenteMatch = text.match(/⏳[^\n]*?:\s*([\s\S]*?)(?=📎|💬|🎯|$)/);
  const piecesMatch = text.match(/📎[^\n]*?:\s*([\s\S]*?)(?=💬|🎯|$)/);
  const echangesMatch = text.match(/💬[^\n]*?:\s*([\s\S]*?)(?=🎯|$)/);
  const actionMatch = text.match(/🎯[^\n]*?:\s*([\s\S]*?)$/);

  if (clientMatch) sections.client = clientMatch[1].trim();
  if (besoinMatch) sections.besoin = besoinMatch[1].trim();
  if (situationMatch) sections.situation = situationMatch[1].trim();
  if (attenteMatch) sections.enAttente = attenteMatch[1].trim();
  if (piecesMatch) sections.pieces = piecesMatch[1].trim();
  if (echangesMatch) sections.echanges = echangesMatch[1].trim();
  if (actionMatch) sections.prochaineAction = actionMatch[1].trim();

  return sections;
}

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
        const data = await apiGet<DossierDetailData>(`/api/dossiers/${id}`);
        setDossier(data);
        setEmails(data.emails || []);
        setDocuments(data.dossier_documents || []);
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
          <Link to="/dossiers" className="text-primary underline text-sm mt-2 inline-block">← Retour aux dossiers</Link>
        </div>
      </DashboardLayout>
    );
  }

  const rapport = parseResumeSituation(dossier.resume_situation);
  const hasRapport = Object.values(rapport).some(v => v.length > 0);
  const sortedEmails = [...emails].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const isEnAttenteVide = !rapport.enAttente || rapport.enAttente.toLowerCase().includes("rien") || rapport.enAttente.toLowerCase().includes("aucun");

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link
          to="/dossiers"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour aux dossiers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main — 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start justify-between gap-4 mb-1">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-foreground">{dossier.nom_client}</h1>
                  <p className="text-sm text-muted-foreground font-sans mt-0.5">{dossier.email_client}</p>
                </div>
                {statutBadge(dossier.statut)}
              </div>
              <div className="inline-flex items-center rounded-md bg-secondary text-secondary-foreground text-xs px-2.5 py-1 font-medium mt-2">
                {dossier.domaine}
              </div>
            </motion.div>

            {/* Rapport Donna */}
            {hasRapport ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border-l-4 border-l-donna bg-card border border-border shadow-sm overflow-hidden"
              >
                {/* Donna header */}
                <div className="flex items-center gap-2.5 px-5 pt-5 pb-3">
                  <div className="h-7 w-7 rounded-full bg-donna-light flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-donna" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Rapport Donna</p>
                </div>

                <div className="px-5 pb-5 space-y-4">
                  {/* Besoin */}
                  {rapport.besoin && (
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">📌 Besoin</p>
                      <p className="text-sm text-foreground leading-relaxed">{rapport.besoin}</p>
                    </div>
                  )}

                  {/* Situation actuelle */}
                  {rapport.situation && (
                    <div className="p-4">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">📊 Situation actuelle</p>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{rapport.situation}</p>
                    </div>
                  )}

                  {/* En attente */}
                  {rapport.enAttente && (
                    <div className={`rounded-lg p-4 ${isEnAttenteVide ? "bg-prospect-light" : "bg-orange-50"}`}>
                      <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${isEnAttenteVide ? "text-prospect-foreground" : "text-orange-700"}`}>
                        ⏳ En attente
                      </p>
                      <p className={`text-sm leading-relaxed ${isEnAttenteVide ? "text-prospect-foreground" : "text-orange-800"}`}>
                        {rapport.enAttente}
                      </p>
                    </div>
                  )}

                  {/* Prochaine action */}
                  {rapport.prochaineAction && (
                    <div className="rounded-lg bg-client-light p-4">
                      <p className="text-[11px] font-semibold text-client-foreground uppercase tracking-wide mb-1.5">🎯 Prochaine action recommandée</p>
                      <p className="text-sm font-medium text-client-foreground leading-relaxed">{rapport.prochaineAction}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : dossier.resume_situation ? (
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{dossier.resume_situation}</p>
                </CardContent>
              </Card>
            ) : null}

            {/* Pièces jointes — collapsed */}
            {documents.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-full text-left">
                    <Paperclip className="h-4 w-4" />
                    <span>📎 Voir les {documents.length} pièce{documents.length > 1 ? "s" : ""} échangée{documents.length > 1 ? "s" : ""}</span>
                    <ChevronDown className="h-3.5 w-3.5 ml-auto transition-transform group-data-[state=open]:rotate-180" />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-3 space-y-2">
                    {documents.map((doc) => (
                      <Collapsible key={doc.id}>
                        <Card className="bg-card">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              {getDocIcon(doc.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{doc.nom_fichier || doc.nom}</p>
                                <p className="text-xs text-muted-foreground">
                                  {doc.date_reception ? formatDateFr(doc.date_reception) : formatDateFr(doc.created_at)}
                                </p>
                              </div>
                              {doc.contenu_extrait && (
                                <CollapsibleTrigger asChild>
                                  <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                                    Extrait <ChevronDown className="h-3 w-3" />
                                  </button>
                                </CollapsibleTrigger>
                              )}
                            </div>
                            {doc.contenu_extrait && (
                              <CollapsibleContent>
                                <div className="mt-3 pt-3 border-t border-border">
                                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{doc.contenu_extrait}</p>
                                </div>
                              </CollapsibleContent>
                            )}
                          </CardContent>
                        </Card>
                      </Collapsible>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Historique emails — collapsed */}
            {sortedEmails.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-full text-left">
                    <MessageSquare className="h-4 w-4" />
                    <span>💬 Voir les {sortedEmails.length} email{sortedEmails.length > 1 ? "s" : ""} échangé{sortedEmails.length > 1 ? "s" : ""}</span>
                    <ChevronDown className="h-3.5 w-3.5 ml-auto transition-transform group-data-[state=open]:rotate-180" />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-3 space-y-1.5">
                    {sortedEmails.map((email) => (
                      <Collapsible key={email.id}>
                        <Card className="bg-card">
                          <CardContent className="p-3">
                            <CollapsibleTrigger asChild>
                              <button className="w-full text-left flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground truncate">{email.expediteur}</span>
                                    <span className="text-[11px] text-muted-foreground shrink-0">{formatDateFr(email.created_at)}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">{email.objet}</p>
                                </div>
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="mt-3 pt-3 border-t border-border">
                                <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
                                  {email.contenu || email.resume || "Contenu non disponible."}
                                </p>
                              </div>
                            </CollapsibleContent>
                          </CardContent>
                        </Card>
                      </Collapsible>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          {/* Sidebar — 1/3 */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Domaine" value={dossier.domaine} />
                <InfoRow label="Dernier échange" value={dossier.dernier_echange_date ? formatDateFr(dossier.dernier_echange_date) : "—"} />
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
