import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, User, Wand2, Settings, X } from "lucide-react";
import { apiGet, apiPut, apiPublicGet } from "@/lib/api";
import { isDemoMode } from "@/hooks/useDemoMode";

const Configuration = () => {
  const isDemo = isDemoMode();
  const navigate = useNavigate();
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saving, setSaving] = useState(false);

  // Section 1 — Connexion
  const [gmailConnected, setGmailConnected] = useState(false);
  const [connectingGmail, setConnectingGmail] = useState(false);

  // Section 2 — Profil
  const [nomComplet, setNomComplet] = useState("");
  const [cabinet, setCabinet] = useState("");
  const [signature, setSignature] = useState("");
  const [barreau, setBarreau] = useState("");
  const [domaines, setDomaines] = useState<string[]>([]);

  // Section 3 — Donna
  const [ton, setTon] = useState("formel");
  const [instructions, setInstructions] = useState("");
  const [savedInstructions, setSavedInstructions] = useState<string[]>([]);
  const [formuleAppel, setFormuleAppel] = useState("");
  const [formulePolitesse, setFormulePolitesse] = useState("");

  // Section 4 — Avancé
  const [frequenceBrief, setFrequenceBrief] = useState("matin");
  const [langue, setLangue] = useState("fr");

  useEffect(() => {
    if (isDemo) {
      setNomComplet("Maître Alexandra Fernandez");
      setCabinet("Cabinet Fernandez");
      setSignature("Cordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris\nCabinet Fernandez\n12 rue de Rivoli, 75004 Paris\n01 23 45 67 89");
      setBarreau("Paris");
      setDomaines(["Droit civil", "Droit de la famille"]);
      setTon("formel");
      setFormuleAppel("Maître,");
      setFormulePolitesse("Je vous prie d'agréer, Maître, l'expression de mes salutations distinguées.");
      setSavedInstructions(["Les mails de l'Ordre des Avocats ne sont jamais urgents"]);
      setLoadingConfig(false);
      return;
    }
    const load = async () => {
      try {
        const c = await apiGet<any>("/api/config").catch(() => null);
        if (c) {
          setGmailConnected(!!c.refresh_token);
          setNomComplet(c.nom_avocat || "");
          setCabinet(c.nom_cabinet || "");
          setSignature(c.signature || "");
          setTon(c.ton_reponse || "formel");
          setFormuleAppel(c.formule_appel || "");
          setFormulePolitesse(c.formule_politesse || "");
          if (c.profil_style) {
            setSavedInstructions((c.profil_style || "").split("\n").filter((l: string) => l.trim()));
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
    if (isDemo) { navigate("/login"); return; }
    setConnectingGmail(true);
    try {
      const res = await apiPublicGet<{ auth_url: string }>("/api/import/gmail/auth");
      if (res.auth_url) window.location.href = res.auth_url;
    } catch {
      toast.error("Erreur lors de la connexion Gmail");
      setConnectingGmail(false);
    }
  };

  const handleAddInstruction = () => {
    if (!instructions.trim()) return;
    setSavedInstructions((prev) => [...prev, instructions.trim()]);
    setInstructions("");
    toast.success("Instruction ajoutée");
  };

  const handleRemoveInstruction = (idx: number) => {
    setSavedInstructions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    if (!isDemo) {
      try {
        await apiPut("/api/config", {
          nom_avocat: nomComplet,
          nom_cabinet: cabinet,
          signature,
          ton_reponse: ton,
          formule_appel: formuleAppel,
          formule_politesse: formulePolitesse,
          profil_style: savedInstructions.join("\n"),
        });
      } catch {
        toast.error("Erreur lors de la sauvegarde");
        setSaving(false);
        return;
      }
    }
    toast.success("Préférences sauvegardées");
    setSaving(false);
  };

  const completedSections = [
    gmailConnected,
    nomComplet && signature,
    savedInstructions.length > 0,
    true, // avancé toujours "complet"
  ].filter(Boolean).length;

  if (loadingConfig) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto py-12 space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="max-w-xl mx-auto py-8 sm:py-12 px-4">
          <h1 className="text-xl font-serif font-bold text-foreground mb-2">Configurez-moi</h1>
          <p className="text-sm text-muted-foreground mb-8">{completedSections}/4 sections complétées</p>

          <Accordion type="multiple" defaultValue={["connexion", "profil"]} className="space-y-3">

            {/* Section 1 — Connexion */}
            <AccordionItem value="connexion" className="rounded-2xl border border-border bg-card shadow-sm px-1">
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Connexion email</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                {gmailConnected ? (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                    <p className="text-sm text-foreground">Connecté à votre boîte Gmail</p>
                    <p className="text-xs text-muted-foreground mt-1">Donna analyse vos emails en continu</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button onClick={handleConnectGmail} disabled={connectingGmail || isDemo} className="w-full">
                      {connectingGmail && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {isDemo ? "Disponible après inscription" : "Connecter Gmail"}
                    </Button>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Donna accède à vos emails en lecture seule. Vos données sont chiffrées et vous pouvez révoquer l'accès à tout moment.
                    </p>
                    <div className="flex items-center gap-2 opacity-50">
                      <span className="text-xs text-muted-foreground">Outlook</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Bientôt</span>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Section 2 — Profil */}
            <AccordionItem value="profil" className="rounded-2xl border border-border bg-card shadow-sm px-1">
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Mon profil</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Nom complet</Label>
                  <Input value={nomComplet} onChange={(e) => setNomComplet(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Cabinet</Label>
                  <Input value={cabinet} onChange={(e) => setCabinet(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Barreau</Label>
                  <Input value={barreau} onChange={(e) => setBarreau(e.target.value)} placeholder="Paris" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Signature email</Label>
                  <Textarea value={signature} onChange={(e) => setSignature(e.target.value)} rows={5} className="mt-1 text-sm resize-y" />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 3 — Donna */}
            <AccordionItem value="donna" className="rounded-2xl border border-border bg-card shadow-sm px-1">
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Wand2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Personnaliser Donna</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 space-y-5">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Ton des réponses</Label>
                  <RadioGroup value={ton} onValueChange={setTon} className="flex gap-4">
                    {[
                      { value: "formel", label: "Formel" },
                      { value: "equilibre", label: "Équilibré" },
                      { value: "conversationnel", label: "Conversationnel" },
                    ].map((opt) => (
                      <div key={opt.value} className="flex items-center gap-2">
                        <RadioGroupItem value={opt.value} id={`ton-${opt.value}`} />
                        <Label htmlFor={`ton-${opt.value}`} className="text-sm cursor-pointer">{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Formule d'appel</Label>
                  <Input value={formuleAppel} onChange={(e) => setFormuleAppel(e.target.value)} placeholder="Maître," className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Formule de politesse</Label>
                  <Input value={formulePolitesse} onChange={(e) => setFormulePolitesse(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Instructions pour Donna</Label>
                  <div className="flex gap-2 mt-1">
                    <Textarea
                      rows={2}
                      className="text-sm resize-y flex-1"
                      placeholder="Ex : Toujours vouvoyer les clients, utiliser des formules de politesse complètes..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                    />
                    <Button variant="outline" size="sm" className="shrink-0 self-end" onClick={handleAddInstruction} disabled={!instructions.trim()}>
                      Ajouter
                    </Button>
                  </div>
                  {savedInstructions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {savedInstructions.map((inst, i) => (
                        <div key={i} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-foreground">
                          <span className="max-w-[280px] truncate">{inst}</span>
                          <button onClick={() => handleRemoveInstruction(i)} className="text-muted-foreground hover:text-foreground transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 4 — Avancé */}
            <AccordionItem value="avance" className="rounded-2xl border border-border bg-card shadow-sm px-1">
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Paramètres avancés</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Fréquence du briefing</Label>
                  <Select value={frequenceBrief} onValueChange={setFrequenceBrief}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="matin">Chaque matin</SelectItem>
                      <SelectItem value="deux_fois">Deux fois par jour</SelectItem>
                      <SelectItem value="temps_reel">Temps réel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Langue des résumés</Label>
                  <Select value={langue} onValueChange={setLangue}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">D'autres options de personnalisation seront bientôt disponibles.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="pt-6">
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Sauvegarder mes préférences
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default Configuration;
