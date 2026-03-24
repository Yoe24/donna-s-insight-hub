import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle, ChevronRight, X, FolderOpen, Trash2 } from "lucide-react";
import { apiGet, apiPut, apiPublicGet } from "@/lib/api";
import { isDemoMode } from "@/hooks/useDemoMode";
import { dossiers as mockDossiersList } from "@/lib/mock-data";

interface ConfigData {
  signature?: string;
  profil_style?: string;
  refresh_token?: string;
  taux_horaire?: number;
}

interface DossierItem {
  id: string;
  nom_client: string;
  domaine: string;
  email_count?: number;
}

const DOMAINES = [
  "Droit civil", "Droit pénal", "Droit du travail", "Droit commercial",
  "Droit de la famille", "Droit immobilier", "Droit administratif",
  "Droit fiscal", "Droit des sociétés", "Autre",
];

const Configuration = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<ConfigData>({});
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const isDemo = isDemoMode();

  // Dossiers
  const [dossiers, setDossiers] = useState<DossierItem[]>([]);
  const [loadingDossiers, setLoadingDossiers] = useState(true);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [unclassifiedCount, setUnclassifiedCount] = useState(0);

  // Instructions
  const [instructions, setInstructions] = useState("");
  const [savedInstructions, setSavedInstructions] = useState<string[]>([]);
  const [savingInstructions, setSavingInstructions] = useState(false);

  // Params
  const [tauxHoraire, setTauxHoraire] = useState("");
  const [signature, setSignature] = useState("");
  const [savingParams, setSavingParams] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setGmailConnected(false);
      setSignature("Cordialement,\nMe Alexandra Martin");
      setTauxHoraire("");
      setSavedInstructions(["Les mails de l'Ordre des Avocats ne sont jamais urgents"]);
      setLoadingConfig(false);
      return;
    }
    const load = async () => {
      try {
        const c = await apiGet<ConfigData>("/api/config").catch(() => null);
        if (c) {
          setConfig(c);
          setGmailConnected(!!c.refresh_token);
          setSignature(c.signature || "");
          setTauxHoraire(c.taux_horaire ? String(c.taux_horaire) : "");
          if (c.profil_style) {
            setSavedInstructions(c.profil_style.split("\n").filter((l) => l.trim()));
          }
        }
      } catch (e) {
        console.error("Error loading config:", e);
      }
      setLoadingConfig(false);
    };
    load();
  }, [isDemo]);

  useEffect(() => {
    if (isDemo) {
      setDossiers(
        mockDossiersList.filter((d) => d.statut === "actif").map((d) => ({
          id: d.id,
          nom_client: d.nomClient,
          domaine: d.categorie,
          email_count: d.nombreMails,
        }))
      );
      setUnclassifiedCount(3);
      setLoadingDossiers(false);
      return;
    }
    const loadDossiers = async () => {
      try {
        const data = await apiGet<DossierItem[]>("/api/dossiers");
        setDossiers(data || []);
        const emails = await apiGet<any[]>("/api/emails").catch(() => []);
        setUnclassifiedCount((emails || []).filter((e) => !e.dossier_id).length);
      } catch { /* silent */ }
      setLoadingDossiers(false);
    };
    loadDossiers();
  }, [isDemo]);

  const handleConnectGmail = async () => {
    setConnectingGmail(true);
    try {
      const res = await apiPublicGet<{ auth_url: string }>("/api/import/gmail/auth");
      if (res.auth_url) window.location.href = res.auth_url;
    } catch {
      toast.error("Erreur lors de la connexion Gmail");
      setConnectingGmail(false);
    }
  };

  const handleAddInstruction = async () => {
    if (!instructions.trim()) return;
    setSavingInstructions(true);
    const newList = [...savedInstructions, instructions.trim()];
    if (!isDemo) {
      try {
        await apiPut("/api/config", { profil_style: newList.join("\n") });
      } catch { toast.error("Erreur lors de la sauvegarde"); setSavingInstructions(false); return; }
    }
    setSavedInstructions(newList);
    setInstructions("");
    toast.success("Instruction ajoutée");
    setSavingInstructions(false);
  };

  const handleRemoveInstruction = async (idx: number) => {
    const newList = savedInstructions.filter((_, i) => i !== idx);
    if (!isDemo) {
      try { await apiPut("/api/config", { profil_style: newList.join("\n") }); }
      catch { toast.error("Erreur lors de la suppression"); return; }
    }
    setSavedInstructions(newList);
  };

  const handleSaveParams = async () => {
    setSavingParams(true);
    if (!isDemo) {
      try {
        await apiPut("/api/config", { signature, taux_horaire: tauxHoraire ? Number(tauxHoraire) : null });
      } catch { toast.error("Erreur lors de la sauvegarde"); setSavingParams(false); return; }
    }
    toast.success("Paramètres sauvegardés");
    setSavingParams(false);
  };

  const handleRenameDossier = async (dossierId: string) => {
    if (!editValue.trim()) { setEditingName(null); return; }
    if (!isDemo) {
      try { await apiPut(`/api/dossiers/${dossierId}`, { nom_client: editValue.trim() }); }
      catch { toast.error("Erreur"); setEditingName(null); return; }
    }
    setDossiers((prev) => prev.map((d) => (d.id === dossierId ? { ...d, nom_client: editValue.trim() } : d)));
    toast.success("Nom mis à jour");
    setEditingName(null);
  };

  const handleChangeDomaine = async (dossierId: string, domaine: string) => {
    if (!isDemo) {
      try { await apiPut(`/api/dossiers/${dossierId}`, { domaine }); }
      catch { toast.error("Erreur"); return; }
    }
    setDossiers((prev) => prev.map((d) => (d.id === dossierId ? { ...d, domaine } : d)));
  };

  const handleDeleteDossier = async (dossierId: string) => {
    // UI only for now — just remove from local list
    setDossiers((prev) => prev.filter((d) => d.id !== dossierId));
    toast.success("Dossier supprimé");
  };

  if (loadingConfig) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12 space-y-6">
          <div className="h-8 w-40 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
          <div className="h-48 bg-muted animate-pulse rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 space-y-10">
          <h1 className="text-xl font-serif font-bold text-foreground">Configurez-moi</h1>

          {/* Bloc 1 — Connexion */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Connexion email
            </h2>
            {gmailConnected ? (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Gmail connecté</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Donna surveille votre boîte mail en continu.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleConnectGmail} disabled={connectingGmail} className="text-xs text-muted-foreground">
                  {connectingGmail && <Loader2 className="h-3 w-3 animate-spin mr-1" />} Reconnecter
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
                <Mail className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Gmail non connecté</p>
                  <p className="text-xs text-muted-foreground mt-1">Connectez Gmail pour que Donna analyse vos emails.</p>
                </div>
                <Button onClick={handleConnectGmail} disabled={connectingGmail}>
                  {connectingGmail && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Connecter Gmail <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </section>

          {/* Bloc 2 — Ce que Donna a compris */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Vos dossiers détectés
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Vérifiez et corrigez ce que Donna a identifié</p>

            {loadingDossiers ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}
              </div>
            ) : dossiers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Aucun dossier détecté. Connectez Gmail pour commencer.</p>
            ) : (
              <div className="space-y-2">
                {dossiers.map((d) => (
                  <div key={d.id} className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-3">
                    <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      {editingName === d.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            className="h-7 text-sm"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRenameDossier(d.id);
                              if (e.key === "Escape") setEditingName(null);
                            }}
                            autoFocus
                          />
                          <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => handleRenameDossier(d.id)}>OK</Button>
                        </div>
                      ) : (
                        <span
                          className="text-sm font-medium text-foreground cursor-pointer hover:underline"
                          onClick={() => { setEditingName(d.id); setEditValue(d.nom_client); }}
                        >
                          {d.nom_client}
                        </span>
                      )}
                    </div>
                    <Select value={d.domaine || ""} onValueChange={(v) => handleChangeDomaine(d.id, v)}>
                      <SelectTrigger className="w-36 h-7 text-xs border-border">
                        <SelectValue placeholder="Domaine" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOMAINES.map((dom) => <SelectItem key={dom} value={dom}>{dom}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {d.email_count != null && (
                      <span className="text-xs text-muted-foreground shrink-0">{d.email_count} email{d.email_count > 1 ? "s" : ""}</span>
                    )}
                    <button
                      onClick={() => handleDeleteDossier(d.id)}
                      className="text-muted-foreground/50 hover:text-destructive transition-colors shrink-0"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {unclassifiedCount > 0 && (
              <button
                onClick={() => navigate("/fil?filter=unclassified")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-3 inline-block"
              >
                {unclassifiedCount} email{unclassifiedCount > 1 ? "s" : ""} non rattaché{unclassifiedCount > 1 ? "s" : ""} à un dossier →
              </button>
            )}
          </section>

          {/* Bloc 3 — Mes règles */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Instructions pour Donna
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              En langage naturel, comme à une assistante
            </p>
            <Textarea
              className="text-sm resize-y min-h-[80px]"
              placeholder="Ex : Les mails de l'Ordre des Avocats ne sont jamais urgents / Le dossier Dupont est prioritaire cette semaine"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <Button
              onClick={handleAddInstruction}
              disabled={savingInstructions || !instructions.trim()}
              size="sm"
              variant="outline"
              className="mt-3"
            >
              {savingInstructions && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              Ajouter
            </Button>

            {savedInstructions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {savedInstructions.map((inst, i) => (
                  <div key={i} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-foreground">
                    <span className="max-w-[260px] truncate">{inst}</span>
                    <button onClick={() => handleRemoveInstruction(i)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bloc 4 — Paramètres */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Paramètres</h2>
            <div className="rounded-xl border border-border bg-card p-5 space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Taux horaire (€/h)</label>
                <Input
                  type="number"
                  className="w-40 text-sm"
                  placeholder="Ex : 250"
                  value={tauxHoraire}
                  onChange={(e) => setTauxHoraire(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Optionnel — débloque l'affichage € dans le fil d'activité</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Signature email</label>
                <Textarea
                  rows={3}
                  className="text-sm resize-y"
                  placeholder="Votre signature pour les brouillons de réponse"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveParams} disabled={savingParams} size="sm">
                {savingParams && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                Sauvegarder
              </Button>
            </div>
          </section>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default Configuration;
