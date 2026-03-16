import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle, ChevronRight, Sparkles, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { apiGet, apiPut } from "@/lib/api";

const Configuration = () => {
  const [signature, setSignature] = useState("");
  const [profil_style, setProfilStyle] = useState("");
  const [gmailConnected, setGmailConnected] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingSignature, setSavingSignature] = useState(false);
  const [savingProfil, setSavingProfil] = useState(false);
  const [connectingGmail, setConnectingGmail] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const config = await apiGet("/api/config").catch(() => null);
        if (config) {
          setSignature(config.signature || "");
          setProfilStyle(config.profil_style || "");
          setGmailConnected(!!config.refresh_token);
        }
      } catch (e) {
        console.error("Error loading config:", e);
      }
      setLoadingConfig(false);
    };
    load();
  }, []);

  const handleConnectGmail = async () => {
    setConnectingGmail(true);
    try {
      const res = await apiGet<{ auth_url: string }>("/api/import/gmail/auth");
      if (res.auth_url) {
        window.location.href = res.auth_url;
      }
    } catch {
      toast.error("Erreur lors de la connexion Gmail");
      setConnectingGmail(false);
    }
  };

  const saveSignature = async () => {
    setSavingSignature(true);
    try {
      await apiPut("/api/config", { signature });
      toast.success("✓ Signature sauvegardée");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
    setSavingSignature(false);
  };

  const saveProfil = async () => {
    setSavingProfil(true);
    try {
      await apiPut("/api/config", { profil_style });
      toast.success("✓ Profil sauvegardé");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
    setSavingProfil(false);
  };

  if (loadingConfig) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12 space-y-10">
          <div className="h-8 w-40 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
          <div className="space-y-3">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-24 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 space-y-12">
          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Paramètres</h1>

          {/* Section 1 — Gmail */}
          <section>
            {gmailConnected ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                  <div>
                    <p className="text-base font-medium text-green-900">Gmail connecté</p>
                    <p className="text-sm text-green-700 mt-0.5">Donna surveille votre boîte mail en continu.</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleConnectGmail}
                  disabled={connectingGmail}
                  className="text-green-700 hover:text-green-900 hover:bg-green-100 px-0"
                >
                  {connectingGmail && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                  Reconnecter Gmail
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-[#6C63FF]/30 bg-[#6C63FF]/[0.03] p-8 text-center space-y-4">
                <Mail className="h-10 w-10 mx-auto text-[#6C63FF]" />
                <div className="space-y-1.5">
                  <p className="text-lg font-semibold text-foreground">
                    Connectez votre boîte Gmail
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Donna analysera vos 90 derniers jours d'emails et surveillera les nouveaux en continu.
                  </p>
                </div>
                <Button
                  onClick={handleConnectGmail}
                  disabled={connectingGmail}
                  className="bg-[#6C63FF] hover:bg-[#5a52e0] text-white px-6"
                >
                  {connectingGmail && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Connecter Gmail
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </section>

          {/* Section 2 — Signature */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Signature email</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Utilisée par Donna pour rédiger les brouillons de réponse.
              </p>
            </div>
            <Textarea
              rows={4}
              className="text-sm resize-y"
              placeholder="Donna détectera votre signature automatiquement lors de la connexion Gmail"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
            />
            <Button
              onClick={saveSignature}
              disabled={savingSignature}
              size="sm"
            >
              {savingSignature && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              Sauvegarder
            </Button>
          </section>

          {/* Section 3 — Profil de personnalité */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Profil de personnalité</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Collez le profil généré par ChatGPT pour que Donna adopte votre style de travail.
              </p>
            </div>

            <Collapsible>
              <CollapsibleTrigger className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 cursor-pointer">
                Comment obtenir mon profil ?
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-2 text-sm text-muted-foreground rounded-lg bg-muted/50 p-4">
                <p>1. Ouvrez ChatGPT</p>
                <p>2. Collez ce prompt :</p>
                <div className="bg-muted rounded p-3 font-mono text-xs leading-relaxed">
                  Analyse l'ensemble de nos conversations passées et produis un document structuré qui décrit : mon style d'écriture, mes réflexes juridiques, mes préférences de format, et mon ton professionnel. Base-toi uniquement sur nos échanges.
                </div>
                <p>3. Copiez la réponse de ChatGPT</p>
                <p>4. Collez-la dans le champ ci-dessous</p>
              </CollapsibleContent>
            </Collapsible>

            <Textarea
              className="text-sm resize-y min-h-[160px]"
              placeholder="Collez ici le profil généré par ChatGPT..."
              value={profil_style}
              onChange={(e) => setProfilStyle(e.target.value)}
            />
            <Button
              onClick={saveProfil}
              disabled={savingProfil}
              size="sm"
            >
              {savingProfil && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              Sauvegarder
            </Button>
          </section>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default Configuration;
