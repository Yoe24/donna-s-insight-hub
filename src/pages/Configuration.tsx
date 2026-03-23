import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle, ChevronRight, X, FolderOpen } from "lucide-react";
import { apiGet, apiPut, apiPublicGet } from "@/lib/api";

interface ConfigData {
  signature?: string;
  profil_style?: string;
  refresh_token?: string;
  taux_horaire?: number;
  formule_appel?: string;
}

interface DossierItem {
  id: string;
  nom_client: string;
  domaine: string;
  email_count?: number;
}

const DOMAINES = [
  "Droit civil",
  "Droit pénal",
  "Droit du travail",
  "Droit commercial",
  "Droit de la famille",
  "Droit immobilier",
  "Droit administratif",
  "Droit fiscal",
  "Droit des sociétés",
  "Autre",
];

const Configuration = () => {
  const [config, setConfig] = useState<ConfigData>({});
  const [gmailConnected, setGmailConnected] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [connectingGmail, setConnectingGmail] = useState(false);

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
    const load = async () => {
      try {
        const c = await apiGet<ConfigData>("/api/config").catch(() => null);
        if (c) {
          setConfig(c);
          setGmailConnected(!!c.refresh_token);
          setSignature(c.signature || "");
          setTauxHoraire(c.taux_horaire ? String(c.taux_horaire) : "");
          // Parse saved instructions from profil_style
          if (c.profil_style) {
            const lines = c.profil_style.split("\n").filter((l) => l.trim());
            setSavedInstructions(lines);
          }
        }
      } catch (e) {
        console.error("Error loading config:", e);
      }
      setLoadingConfig(false);
    };
    load();
  }, []);

  useEffect(() => {
    const loadDossiers = async () => {
      try {
        const data = await apiGet<DossierItem[]>("/api/dossiers");
        setDossiers(data || []);
        // Count unclassified emails
        const emails = await apiGet<any[]>("/api/emails").catch(() => []);
        const unclassified = (emails || []).filter((e) => !e.dossier_id);
        setUnclassifiedCount(unclassified.length);
      } catch {
        // silent
      }
      setLoadingDossiers(false);
    };
    loadDossiers();
  }, []);

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

  const handleSaveInstructions = async () => {
    if (!instructions.trim()) return;
    setSavingInstructions(true);
    const newList = [...savedInstructions, instructions.trim()];
    try {
      await apiPut("/api/config", { profil_style: newList.join("\n") });
      setSavedInstructions(newList);
      setInstructions("");
      toast.success("Instruction sauvegardée");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
    setSavingInstructions(false);
  };

  const handleRemoveInstruction = async (idx: number) => {
    const newList = savedInstructions.filter((_, i) => i !== idx);
    try {
      await apiPut("/api/config", { profil_style: newList.join("\n") });
      setSavedInstructions(newList);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleSaveParams = async () => {
    setSavingParams(true);
    try {
      await apiPut("/api/config", {
        signature,
        taux_horaire: tauxHoraire ? Number(tauxHoraire) : null,
      });
      toast.success("Paramètres sauvegardés");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
    setSavingParams(false);
  };

  const handleRenameDossier = async (dossierId: string) => {
    if (!editValue.trim()) { setEditingName(null); return; }
    try {
      await apiPut(`/api/dossiers/${dossierId}`, { nom_client: editValue.trim() });
      setDossiers((prev) =>
        prev.map((d) => (d.id === dossierId ? { ...d, nom_client: editValue.trim() } : d))
      );
      toast.success("Nom mis à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
    setEditingName(null);
  };

  const handleChangeDomaine = async (dossierId: string, domaine: string) => {
    try {
      await apiPut(`/api/dossiers/${dossierId}`, { domaine });
      setDossiers((prev) =>
        prev.map((d) => (d.id === dossierId ? { ...d, domaine } : d))
      );
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
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
          <h1 className="text-2xl font-serif font-bold text-foreground">Paramètres</h1>

          {/* Bloc 1 — Connexion email */}
          <section>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
              Connexion email
            </h2>
            {gmailConnected ? (
              <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 p-5 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-[#10B981] shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Gmail connecté</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Donna surveille votre boîte mail en continu.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleConnectGmail}
                  disabled={connectingGmail}
                  className="text-xs text-muted-foreground"
                >
                  {connectingGmail && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                  Reconnecter
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
                <Mail className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Gmail non connecté</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connectez Gmail pour que Donna analyse vos emails.
                  </p>
                </div>
                <Button
                  onClick={handleConnectGmail}
                  disabled={connectingGmail}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  {connectingGmail && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Connecter Gmail
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </section>

          {/* Bloc 2 — Ce que Donna a compris */}
          <section>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
              Vos dossiers détectés par Donna
            </h2>
            {loadingDossiers ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : dossiers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                Aucun dossier détecté. Connectez Gmail pour commencer.
              </p>
            ) : (
              <div className="space-y-2">
                {dossiers.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-3"
                  >
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
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7"
                            onClick={() => handleRenameDossier(d.id)}
                          >
                            OK
                          </Button>
                        </div>
                      ) : (
                        <span
                          className="text-sm font-medium text-foreground cursor-pointer hover:underline"
                          onClick={() => {
                            setEditingName(d.id);
                            setEditValue(d.nom_client);
                          }}
                        >
                          {d.nom_client}
                        </span>
                      )}
                    </div>
                    <Select
                      value={d.domaine || ""}
                      onValueChange={(v) => handleChangeDomaine(d.id, v)}
                    >
                      <SelectTrigger className="w-40 h-7 text-xs border-border">
                        <SelectValue placeholder="Domaine" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOMAINES.map((dom) => (
                          <SelectItem key={dom} value={dom}>{dom}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {d.email_count != null && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {d.email_count} email{d.email_count > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {unclassifiedCount > 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                Donna a aussi détecté {unclassifiedCount} email{unclassifiedCount > 1 ? "s" : ""} non rattaché{unclassifiedCount > 1 ? "s" : ""}
              </p>
            )}
          </section>

          {/* Bloc 3 — Instructions pour Donna */}
          <section>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-1">
              Instructions pour Donna
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Donnez des instructions en langage naturel, comme à une assistante
            </p>
            <Textarea
              className="text-sm resize-y min-h-[100px]"
              placeholder="Ex : Les mails de l'Ordre des Avocats ne sont jamais urgents..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <Button
              onClick={handleSaveInstructions}
              disabled={savingInstructions || !instructions.trim()}
              size="sm"
              className="mt-3"
            >
              {savingInstructions && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              Sauvegarder
            </Button>

            {savedInstructions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {savedInstructions.map((inst, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-foreground"
                  >
                    <span className="max-w-[240px] truncate">{inst}</span>
                    <button
                      onClick={() => handleRemoveInstruction(i)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bloc 4 — Paramètres */}
          <section>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
              Paramètres
            </h2>
            <div className="rounded-xl border border-border bg-card p-5 space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Taux horaire (€/h)
                </label>
                <Input
                  type="number"
                  className="w-40 text-sm"
                  placeholder="Ex : 250"
                  value={tauxHoraire}
                  onChange={(e) => setTauxHoraire(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optionnel — permet d'estimer les économies réalisées
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Signature email
                </label>
                <Textarea
                  rows={3}
                  className="text-sm resize-y"
                  placeholder="Votre signature pour les brouillons de réponse"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSaveParams}
                disabled={savingParams}
                size="sm"
              >
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
