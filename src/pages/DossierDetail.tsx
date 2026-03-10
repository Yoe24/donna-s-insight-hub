// DossierDetail.tsx — Endpoint: GET /api/dossiers/:id

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Email } from "@/hooks/useEmails";
import { api } from "@/lib/api";

interface DossierDetailData {
  id: string;
  nom: string;
  client: string;
  type_droit: string;
  nb_emails: number;
  created_at: string;
  statut: string;
}

interface DossierResponse {
  dossier: DossierDetailData;
  emails: Email[];
}

const DossierDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [dossier, setDossier] = useState<DossierDetailData | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchDossier = async () => {
      try {
        const data = await api.get<DossierResponse>(`/api/dossiers/${id}`);
        setDossier(data.dossier);
        setEmails(data.emails || []);
      } catch (error) {
        console.error('Error fetching dossier:', error);
      }
      setLoading(false);
    };
    fetchDossier();
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
              <h1 className="text-2xl font-serif font-bold text-foreground">{dossier.nom || dossier.client}</h1>
              <p className="text-sm text-muted-foreground font-sans mt-1">{dossier.type_droit} • {dossier.client}</p>
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-sans ${dossier.statut === "actif" ? "border-accent/30 text-accent" : "border-muted-foreground/30 text-muted-foreground"}`}
            >
              {dossier.statut}
            </Badge>
          </div>
        </div>

        {/* Emails du dossier */}
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
