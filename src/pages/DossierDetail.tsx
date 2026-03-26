/**
 * DossierDetail — Single dossier page
 *
 * In demo mode, uses local mock data (no API calls).
 * In real mode, fetches from API using the active user_id.
 */

import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, File, Mail, Image, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Email } from "@/hooks/useEmails";
import { apiGet } from "@/lib/api";
import { isDemo } from "@/lib/auth";
import { mockBriefing, mockDossierEmails } from "@/lib/mock-briefing";
import { EmailDrawer } from "@/components/EmailDrawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ApiDossierEmail {
  id: string;
  from_name?: string;
  from_email?: string;
  subject?: string;
  summary?: string;
  date?: string;
}

interface ApiDossierDocument {
  id?: string;
  filename?: string;
  type?: string;
  date?: string;
  summary?: string;
  url?: string;
}

interface ApiDossierDetailData {
  id: string;
  name?: string;
  domain?: string;
  summary?: string;
  status?: string;
  emails?: ApiDossierEmail[];
  documents?: ApiDossierDocument[];
}

interface DossierDocument {
  id: string;
  nom_fichier: string;
  type: string;
  summary?: string;
  date_reception: string;
  url?: string;
}

interface DossierEmail extends Email {
  from_email?: string;
}

interface DossierDetailData {
  id: string;
  name: string;
  domain: string;
  summary: string;
  status: string;
  emails: DossierEmail[];
  documents: DossierDocument[];
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
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "—";
  }
};

const formatDateShort = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch {
    return "—";
  }
};

const getDocIcon = (type: string) => {
  const t = type?.toLowerCase() || "";
  if (t.includes("pdf")) return <FileText className="h-4 w-4 text-destructive/70 shrink-0" />;
  if (t.includes("word") || t.includes("doc")) return <File className="h-4 w-4 text-primary/70 shrink-0" />;
  if (t.includes("image") || t.includes("zip")) return <Image className="h-4 w-4 text-muted-foreground shrink-0" />;
  return <FileText className="h-4 w-4 text-muted-foreground shrink-0" />;
};

function buildSender(fromName?: string, fromEmail?: string): string {
  const safeName = fromName || "";
  const safeEmail = fromEmail || "";
  if (safeName && safeEmail) return `${safeName} <${safeEmail}>`;
  return safeName || safeEmail || "";
}

function normalizeEmail(email: ApiDossierEmail): DossierEmail {
  return {
    id: email.id,
    expediteur: buildSender(email.from_name, email.from_email),
    objet: email.subject || "",
    resume: email.summary || "",
    brouillon: null,
    pipeline_step: "pret_a_reviser",
    contexte_choisi: "",
    statut: "traite",
    created_at: email.date || "",
    updated_at: email.date || "",
    from_email: email.from_email || "",
  };
}

function normalizeDocument(doc: ApiDossierDocument, index: number): DossierDocument {
  return {
    id: doc.id || `doc-${index}`,
    nom_fichier: doc.filename || "",
    type: doc.type || "",
    summary: doc.summary || "",
    date_reception: doc.date || "",
    url: doc.url || "",
  };
}

function normalizeDossier(data: ApiDossierDetailData): DossierDetailData {
  return {
    id: data.id,
    name: data.name || "",
    domain: data.domain || "",
    summary: data.summary || "",
    status: data.status || "",
    emails: (data.emails || []).map(normalizeEmail),
    documents: (data.documents || []).map(normalizeDocument),
  };
}

const DossierDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [dossier, setDossier] = useState<DossierDetailData | null>(null);
  const [emails, setEmails] = useState<DossierEmail[]>([]);
  const [documents, setDocuments] = useState<DossierDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<DossierEmail | null>(null);
  const [error, setError] = useState(false);
  const [resumeExpanded, setResumeExpanded] = useState(false);

  const fetchDossier = useCallback(async () => {
    if (!id) return;

    if (isDemo()) {
      const mockDossier = mockBriefing.content.dossiers.find((d) => d.dossier_id === id);
      if (!mockDossier) { setError(true); setLoading(false); return; }

      const rawEmails = mockDossierEmails[id] || [];
      const demoEmails: DossierEmail[] = rawEmails.map((e) => ({
        id: e.id,
        expediteur: buildSender(e.expediteur, e.email),
        objet: e.objet,
        resume: e.resume || "",
        brouillon: null,
        pipeline_step: "pret_a_reviser",
        contexte_choisi: "",
        statut: "traite",
        created_at: e.date || "",
        updated_at: e.date || "",
        from_email: e.email || "",
      }));

      const demoDocs: DossierDocument[] = rawEmails.flatMap((e, i) =>
        (e.pieces_jointes || []).map((pj, j) => ({
          id: `doc-${i}-${j}`,
          nom_fichier: pj.nom,
          type: pj.nom.split(".").pop() || "",
          summary: pj.resume || "",
          date_reception: e.date || "",
          url: "",
        }))
      );

      const detail: DossierDetailData = {
        id,
        name: mockDossier.nom || mockDossier.name || "",
        domain: mockDossier.domaine || mockDossier.domain || "",
        summary: mockDossier.summary || "",
        status: "actif",
        emails: demoEmails,
        documents: demoDocs,
      };
      setDossier(detail);
      setEmails(demoEmails);
      setDocuments(demoDocs);
      setError(false);
      setLoading(false);
      return;
    }

    try {
      const data = await apiGet<ApiDossierDetailData>(`/api/dossiers/${id}`);
      const normalized = normalizeDossier(data);
      setDossier(normalized);
      setDocuments(normalized.documents);
      setEmails(normalized.emails);
      setError(false);
    } catch (e) {
      console.error("Error fetching dossier:", e);
      setError(true);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDossier();
  }, [fetchDossier]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto py-8 space-y-6">
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 h-64 bg-muted animate-pulse rounded-xl" />
            <div className="lg:col-span-2 h-64 bg-muted animate-pulse rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !dossier) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto py-12 text-center">
          <p className="text-lg font-serif text-foreground mb-2">Erreur de chargement</p>
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
        <div className="max-w-5xl mx-auto py-12 text-center">
          <p className="text-muted-foreground">Dossier introuvable.</p>
          <Link to="/dashboard" className="text-primary underline text-sm mt-2 inline-block">← Retour</Link>
        </div>
      </DashboardLayout>
    );
  }

  const sortedEmails = [...emails].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  const sortedDocs = [...documents].sort((a, b) => new Date(b.date_reception || 0).getTime() - new Date(a.date_reception || 0).getTime());
  const lastExchangeDate = sortedEmails.length > 0 ? formatDateFr(sortedEmails[0].created_at) : "—";
  const resumeText = dossier.summary || "";
  const resumeIsLong = resumeText.length > 250;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-16 overflow-hidden">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour
        </Link>

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-serif font-bold text-foreground truncate">{dossier.name}</h1>
                {statutBadge(dossier.status)}
                {dossier.domain ? (
                  <span className="inline-flex items-center rounded-md bg-secondary text-secondary-foreground text-xs px-2.5 py-1 font-medium shrink-0">
                    {dossier.domain}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground space-y-0.5 shrink-0">
              <p>Dernier échange : {lastExchangeDate}</p>
              <p>{sortedEmails.length} emails · {sortedDocs.length} documents</p>
            </div>
          </div>
        </motion.div>

        {resumeText ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
            <div className="rounded-xl bg-muted/40 border border-border p-5">
              <p className={`text-sm text-foreground/85 leading-relaxed whitespace-pre-line ${!resumeExpanded && resumeIsLong ? "line-clamp-3" : ""}`}>
                {resumeText}
              </p>
              {resumeIsLong ? (
                <button onClick={() => setResumeExpanded(!resumeExpanded)} className="text-xs text-primary hover:underline mt-1">
                  {resumeExpanded ? "Réduire" : "Lire la suite"}
                </button>
              ) : null}
            </div>
          </motion.div>
        ) : null}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-hidden">
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Emails
                  <span className="text-muted-foreground font-normal">({sortedEmails.length})</span>
                </h2>
              </div>
              <ScrollArea className="h-[420px]">
                <div className="divide-y divide-border">
                  {sortedEmails.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-5">Aucun email</p>
                  ) : (
                    sortedEmails.map((email) => {
                      const senderName = (email.expediteur || "").replace(/<[^>]+>/, "").trim() || "";
                      return (
                        <button
                          key={email.id}
                          onClick={() => setSelectedEmail(email)}
                          className="w-full flex items-center gap-2 px-5 py-3 text-left hover:bg-muted/50 transition-colors overflow-hidden"
                        >
                          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium text-foreground shrink-0 max-w-[120px] truncate">{senderName}</span>
                          <span className="text-muted-foreground shrink-0">—</span>
                          <span className="text-sm text-muted-foreground truncate flex-1 min-w-0">{email.objet || ""}</span>
                          <span className="text-xs text-muted-foreground shrink-0 ml-auto pl-2 tabular-nums whitespace-nowrap">
                            {formatDateShort(email.created_at)}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Documents
                  <span className="text-muted-foreground font-normal">({sortedDocs.length})</span>
                </h2>
              </div>
              <ScrollArea className="h-[420px]">
                <div className="divide-y divide-border">
                  {sortedDocs.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-5">Aucun document</p>
                  ) : (
                    sortedDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 px-5 py-3 hover:bg-muted/50 transition-colors cursor-default overflow-hidden">
                        {getDocIcon(doc.type)}
                        <span className="text-sm text-foreground truncate flex-1 min-w-0">{doc.nom_fichier || ""}</span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-auto pl-2 tabular-nums whitespace-nowrap">
                          {formatDateShort(doc.date_reception)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedEmail ? <EmailDrawer email={selectedEmail} onClose={() => setSelectedEmail(null)} showDossierLink={false} /> : null}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default DossierDetailPage;
