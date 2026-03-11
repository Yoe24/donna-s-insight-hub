import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Loader2, FileText } from "lucide-react";
import { motion } from "framer-motion";
import type { Email } from "@/hooks/useEmails";
import { api } from "@/lib/api";

interface DossierDetailData {
  id: string;
  nom_client: string;
  email_client: string;
  statut: string;
  domaine: string;
  resume_situation: string;
  dernier_echange_date: string;
}

interface DossierDocument {
  id: string;
  nom: string;
  type: string;
  created_at: string;
}

const statutBadge = (statut: string) => {
  switch (statut) {
    case "actif":
      return <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs px-2 py-0.5 font-medium">Actif</span>;
    case "en_attente":
      return <span className="inline-flex items-center rounded-full bg-orange-100 text-orange-800 text-xs px-2 py-0.5 font-medium">En attente</span>;
    case "archive":
      return <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-xs px-2 py-0.5 font-medium">Archivé</span>;
    default:
      return <Badge variant="outline" className="text-xs">{statut}</Badge>;
  }
};

const DossierDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [dossier, setDossier] = useState<DossierDetailData | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [documents, setDocuments] = useState<DossierDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchAll = async () => {
      try {
        const [dossierData, emailsData, docsData] = await Promise.all([
          api.get<DossierDetailData>(`/api/dossiers/${id}`),
          api.get<Email[]>(`/api/dossiers/${id}/emails`).catch(() => []),
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
          <Link to="/dossiers" className="text-accent underline text-sm mt-2 inline-block">
            ← Retour aux dossiers
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link to="/dossiers" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour aux dossiers
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">{dossier.nom_client}</h1>
              <p className="text-sm text-muted-foreground font-sans mt-1">
                {dossier.email_client} • {dossier.domaine}
              </p>
            </div>
            {statutBadge(dossier.statut)}
          </div>
          {dossier.resume_situation && (
            <p className="text-sm text-muted-foreground mt-3">{dossier.resume_situation}</p>
          )}
        </div>

        {/* Documents */}
        {documents.length > 0 && (
          <div>
            <h2 className="text-sm font-serif font-semibold mb-3">Documents ({documents.length})</h2>
            <Card className="border-border bg-card divide-y divide-border">
              {documents.map((doc) => (
                <div key={doc.id} className="px-4 py-3 flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans font-medium truncate">{doc.nom}</p>
                    <p className="text-[11px] text-muted-foreground">{doc.type}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Emails */}
        <div>
          <h2 className="text-sm font-serif font-semibold mb-3">Emails associés ({emails.length})</h2>
          
          {emails.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground text-sm">Aucun email dans ce dossier</p>
            </Card>
          ) : (
            <Card className="border-border bg-card overflow-hidden divide-y divide-border">
              {emails.map((email, i) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-4 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-sans font-semibold text-xs truncate">{email.expediteur}</span>
                        <Badge variant="outline" className="text-[9px]">{email.statut}</Badge>
                      </div>
                      <p className="text-xs font-medium truncate">{email.objet}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                        {email.resume || "En cours d'analyse..."}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(email.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DossierDetailPage;
