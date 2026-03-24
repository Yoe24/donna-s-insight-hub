import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle, ChevronRight, X } from "lucide-react";
import { apiGet, apiPut, apiPublicGet } from "@/lib/api";
import { isDemoMode } from "@/hooks/useDemoMode";

interface ConfigData {
  signature?: string;
  profil_style?: string;
  refresh_token?: string;
}

const Configuration = () => {
  const [config, setConfig] = useState<ConfigData>({});
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const isDemo = isDemoMode();

  // Signature
  const [signature, setSignature] = useState("");
  const [savingSignature, setSavingSignature] = useState(false);

  // Instructions
  const [instructions, setInstructions] = useState("");
  const [savedInstructions, setSavedInstructions] = useState<string[]>([]);
  const [savingInstructions, setSavingInstructions] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setGmailConnected(false);
      setSignature("Cordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris\n01 23 45 67 89");
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

  const handleDisconnectGmail = () => {
    setGmailConnected(false);
    setGmailEmail("");
    setShowDisconnectDialog(false);
    toast.success("Gmail déconnecté");
  };

  const handleSaveSignature = async () => {
    setSavingSignature(true);
    if (!isDemo) {
      try {
        await apiPut("/api/config", { signature });
      } catch {
        toast.error("Erreur lors de la sauvegarde");
        setSavingSignature(false);
        return;
      }
    }
    toast.success("Signature sauvegardée");
    setSavingSignature(false);
  };

  const handleAddInstruction = async () => {
    if (!instructions.trim()) return;
    setSavingInstructions(true);
    const newList = [...savedInstructions, instructions.trim()];
    if (!isDemo) {
      try {
        await apiPut("/api/config", { profil_style: newList.join("\n") });
      } catch {
        toast.error("Erreur lors de la sauvegarde");
        setSavingInstructions(false);
        return;
      }
    }
    setSavedInstructions(newList);
    setInstructions("");
    toast.success("Instruction ajoutée");
    setSavingInstructions(false);
  };

  const handleRemoveInstruction = async (idx: number) => {
    const newList = savedInstructions.filter((_, i) => i !== idx);
    if (!isDemo) {
      try {
        await apiPut("/api/config", { profil_style: newList.join("\n") });
      } catch {
        toast.error("Erreur lors de la suppression");
        return;
      }
    }
    setSavedInstructions(newList);
  };

  if (loadingConfig) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto py-12 space-y-8">
          <div className="h-8 w-40 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
          <div className="h-40 bg-muted animate-pulse rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="max-w-xl mx-auto py-8 sm:py-12 px-4 space-y-8">
          <h1 className="text-xl font-serif font-bold text-foreground">Configurez-moi</h1>

          {/* Bloc 1 — Connexion Gmail */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Connexion email
            </h2>
            {gmailConnected ? (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      Connecté à <strong>{gmailEmail || "votre boîte Gmail"}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Donna analyse vos emails en continu
                    </p>
                  </div>
                </div>
                <div className="pl-8">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setShowDisconnectDialog(true)}
                  >
                    Déconnecter
                  </Button>
                </div>
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
                <Button onClick={handleConnectGmail} disabled={connectingGmail}>
                  {connectingGmail && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Connecter Gmail <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </section>

          {/* Bloc 2 — Signature email */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Signature email
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Utilisée par Donna pour rédiger vos brouillons de réponse
            </p>
            <Textarea
              rows={5}
              className="text-sm resize-y"
              placeholder="Ex : Maître Alexandra Fernandez — Avocate au Barreau de Paris — 01 23 45 67 89"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
            />
            <Button
              onClick={handleSaveSignature}
              disabled={savingSignature}
              size="sm"
              className="mt-3"
            >
              {savingSignature && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              Sauvegarder
            </Button>
          </section>

          {/* Bloc 3 — Instructions pour Donna */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Instructions pour Donna
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Donnez des consignes en langage naturel, comme à une assistante
            </p>
            <Textarea
              rows={3}
              className="text-sm resize-y"
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
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-foreground"
                  >
                    <span className="max-w-[280px] truncate">{inst}</span>
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
        </div>

        {/* Disconnect Gmail confirmation */}
        <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Déconnecter Gmail ?</AlertDialogTitle>
              <AlertDialogDescription>
                Donna arrêtera d'analyser vos emails. Confirmer ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDisconnectGmail}
              >
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default Configuration;
