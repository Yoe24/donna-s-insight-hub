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
import { ArrowLeft, FileText, File, Mail, Image, RefreshCw, MoreHorizontal, Pencil, Tag, Archive, ArrowRightLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Email } from "@/hooks/useEmails";
import { apiGet } from "@/lib/api";
import { isDemo } from "@/lib/auth";
import { mockBriefing, mockDossierEmails, mockAllEmails, mockEcheances } from "@/lib/mock-briefing";
import { EmailDrawer } from "@/components/EmailDrawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  taille?: string;
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
  const [selectedDoc, setSelectedDoc] = useState<DossierDocument | null>(null);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDomaineDialog, setShowDomaineDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [activeTab, setActiveTab] = useState<"echanges" | "documents" | "echeances">("echanges");

  const echeances = isDemo() ? (mockEcheances[id || ""] || []) : [];

  const fetchDossier = useCallback(async () => {
    if (!id) return;

    if (isDemo()) {
      await new Promise((r) => setTimeout(r, 350));
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
        created_at: (() => {
          const m = mockAllEmails.find((me) => me.id === e.id);
          return m ? m.date : e.date || "";
        })(),
        updated_at: (() => {
          const m = mockAllEmails.find((me) => me.id === e.id);
          return m ? m.date : e.date || "";
        })(),
        from_email: e.email || "",
      }));

      const demoDocs: DossierDocument[] = rawEmails.flatMap((e, i) =>
        (e.pieces_jointes || []).map((pj, j) => ({
          id: `doc-${i}-${j}`,
          nom_fichier: pj.nom,
          type: pj.nom.split(".").pop() || "",
          summary: pj.resume || "",
          taille: pj.taille || "",
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
        <div className="max-w-3xl mx-auto py-8 space-y-6">
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !dossier) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-12 text-center">
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
        <div className="max-w-3xl mx-auto py-12 text-center">
          <p className="text-muted-foreground">Dossier introuvable.</p>
          <Link to="/dashboard" className="text-primary underline text-sm mt-2 inline-block">← Retour</Link>
        </div>
      </DashboardLayout>
    );
  }

  const sortedEmails = [...emails].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  const sortedDocs = [...documents].sort((a, b) => new Date(b.date_reception || 0).getTime() - new Date(a.date_reception || 0).getTime());
  const lastExchangeDate = sortedEmails.length > 0 ? formatDateFr(sortedEmails[0].created_at) : "—";
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto pb-24">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour
        </Link>

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-serif font-semibold text-foreground truncate">{dossier.name}</h1>
                {statutBadge(dossier.status)}
                {dossier.domain ? (
                  <span className="inline-flex items-center rounded-md bg-secondary text-secondary-foreground text-xs px-2.5 py-1 font-medium shrink-0">
                    {dossier.domain}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex items-start gap-2 shrink-0">
              <div className="text-right text-xs text-muted-foreground space-y-0.5">
                {lastExchangeDate !== "—" && <p>Dernier échange : {lastExchangeDate}</p>}
                <p>{sortedEmails.length} emails · {sortedDocs.length} documents</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => { setRenameValue(dossier.name); setShowRenameDialog(true); }}>
                    <Pencil className="h-3.5 w-3.5 mr-2" /> Renommer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDomaineDialog(true)}>
                    <Tag className="h-3.5 w-3.5 mr-2" /> Changer le domaine
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info("Fusion disponible après connexion Gmail")}>
                    <ArrowRightLeft className="h-3.5 w-3.5 mr-2" /> Fusionner avec…
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                    <Archive className="h-3.5 w-3.5 mr-2" /> Archiver
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>

        {dossier.summary || dossier.domain ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
            <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Résumé du dossier</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
                <div><span className="text-muted-foreground">Client :</span> <span className="text-foreground font-medium">{dossier.name}</span></div>
                <div><span className="text-muted-foreground">Domaine :</span> <span className="text-foreground">{dossier.domain || "—"}</span></div>
              </div>
              {dossier.summary && (
                <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">{dossier.summary}</p>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                {lastExchangeDate !== "—" ? `Dernier échange : ${lastExchangeDate}` : ""} · {sortedEmails.length} échanges · {sortedDocs.length} documents
              </p>
            </div>
          </motion.div>
        ) : null}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {/* Tabs */}
          <div className="flex gap-1.5 mb-4">
            {([
              { id: "echanges" as const, label: "Échanges", count: sortedEmails.length },
              { id: "documents" as const, label: "Documents", count: sortedDocs.length },
              { id: "echeances" as const, label: "Échéances", count: echeances.length },
            ]).map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            {activeTab === "echanges" && (
              <ScrollArea className="h-[480px]">
                <div className="divide-y divide-border">
                  {sortedEmails.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-5">Aucun échange</p>
                  ) : sortedEmails.map((email) => {
                    const senderName = (email.expediteur || "").replace(/<[^>]+>/, "").trim();
                    return (
                      <button key={email.id} onClick={() => setSelectedEmail(email)}
                        className="w-full flex items-center gap-2 px-5 py-3 text-left hover:bg-muted/50 transition-colors">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium text-foreground shrink-0 max-w-[140px] truncate">{senderName}</span>
                        <span className="text-muted-foreground shrink-0">—</span>
                        <span className="text-sm text-muted-foreground truncate flex-1 min-w-0">{email.objet || ""}</span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-auto pl-2 tabular-nums whitespace-nowrap">{formatDateShort(email.created_at)}</span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}

            {activeTab === "documents" && (
              <ScrollArea className="h-[480px]">
                <div className="divide-y divide-border">
                  {sortedDocs.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-5">Aucun document</p>
                  ) : sortedDocs.map((doc) => (
                    <button key={doc.id} onClick={() => setSelectedDoc(doc)}
                      className="w-full flex items-center gap-2 px-5 py-3 hover:bg-muted/50 transition-colors text-left">
                      {getDocIcon(doc.type)}
                      <span className="text-sm text-foreground truncate flex-1 min-w-0">{doc.nom_fichier || ""}</span>
                      {doc.taille && <span className="text-xs text-muted-foreground shrink-0">{doc.taille}</span>}
                      <span className="text-xs text-muted-foreground shrink-0 ml-auto pl-2 tabular-nums whitespace-nowrap">{formatDateShort(doc.date_reception)}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}

            {activeTab === "echeances" && (
              <div className="divide-y divide-border">
                {echeances.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-5">Aucune échéance</p>
                ) : echeances.map((ech) => {
                  const echDate = new Date(ech.date);
                  const daysUntil = Math.ceil((echDate.getTime() - Date.now()) / 86400000);
                  const dateStr = echDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
                  return (
                    <div key={ech.id} className="flex items-start gap-4 px-5 py-3.5">
                      <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap w-24 shrink-0 pt-0.5">{dateStr}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{ech.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Source : {ech.source}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        ech.status === "depassee" ? "bg-red-100 text-red-700" :
                        ech.status === "proche" ? "bg-orange-100 text-orange-700" :
                        "bg-emerald-100 text-emerald-700"
                      }`}>
                        {ech.status === "depassee" ? "Dépassée" : ech.status === "proche" ? `J-${Math.abs(daysUntil)}` : `dans ${daysUntil}j`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedEmail ? <EmailDrawer email={selectedEmail} onClose={() => setSelectedEmail(null)} showDossierLink={false} context="dossier" /> : null}
      </AnimatePresence>

      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {selectedDoc?.nom_fichier}
            </DialogTitle>
            {selectedDoc?.taille && (
              <DialogDescription>{selectedDoc.taille}</DialogDescription>
            )}
          </DialogHeader>
          {selectedDoc?.summary && (
            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Résumé Donna</p>
              <p className="text-sm text-foreground/85 leading-relaxed">{selectedDoc.summary}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center pt-2">
            Téléchargement disponible après connexion Gmail
          </p>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renommer le dossier</DialogTitle>
          </DialogHeader>
          <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowRenameDialog(false)}>Annuler</Button>
            <Button size="sm" onClick={() => {
              if (dossier && renameValue.trim()) {
                setDossier({ ...dossier, name: renameValue.trim() });
                toast.success("Dossier renommé");
              }
              setShowRenameDialog(false);
            }}>Renommer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change domain dialog */}
      <Dialog open={showDomaineDialog} onOpenChange={setShowDomaineDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Changer le domaine</DialogTitle>
          </DialogHeader>
          <Select onValueChange={(val) => {
            if (dossier) setDossier({ ...dossier, domain: val });
            toast.success("Domaine mis à jour");
            setShowDomaineDialog(false);
          }}>
            <SelectTrigger><SelectValue placeholder={dossier?.domain || "Choisir un domaine"} /></SelectTrigger>
            <SelectContent>
              {["Droit du travail", "Droit de la famille", "Droit immobilier", "Droit commercial", "Droit pénal", "Autre"].map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DialogContent>
      </Dialog>

      {/* Archive confirmation */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiver ce dossier ?</AlertDialogTitle>
            <AlertDialogDescription>Le dossier sera déplacé dans les archives. Vous pourrez le restaurer plus tard.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { toast.success("Dossier archivé"); setShowArchiveDialog(false); }}>
              Archiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default DossierDetailPage;
