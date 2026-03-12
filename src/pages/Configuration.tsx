// Configuration.tsx — Endpoints:
// GET/PUT /api/config, GET/PUT /api/config/examples,
// GET/POST/DELETE /api/config/documents, GET /api/config/sources,
// GET/POST/PUT/DELETE /api/config/rules

import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Plus, X, FileText, Brain, Shield, Workflow, Loader2, ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

interface ConfigDocument {
  id: string;
  nom: string;
  type: string;
  created_at: string;
}

interface ConfigRule {
  id: string;
  condition: string;
  action: string;
}

const Configuration = () => {
  // Champs correspondant exactement au contrat API
  const [formule_appel, setFormuleAppel] = useState("cher_maitre");
  const [formule_politesse, setFormulePolitesse] = useState("cordialement");
  const [niveau_concision, setNiveauConcision] = useState([50]);
  const [ton_reponse, setTonReponse] = useState([50]);
  const [nom_avocat, setNomAvocat] = useState("");
  const [nom_cabinet, setNomCabinet] = useState("");
  const [specialite, setSpecialite] = useState("");
  const [signature, setSignature] = useState("");
  const [examples, setExamples] = useState(["", "", ""]);
  const [documents, setDocuments] = useState<ConfigDocument[]>([]);
  const [sources, setSources] = useState("");
  const [rules, setRules] = useState<ConfigRule[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chargement initial — GET /api/config + examples + documents + sources + rules
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [config, examplesData, docsData, sourcesData, rulesData] = await Promise.all([
          api.get('/api/config').catch(() => null),
          api.get('/api/config/examples').catch(() => null),
          api.get('/api/config/documents').catch(() => []),
          api.get('/api/config/sources').catch(() => null),
          api.get('/api/config/rules').catch(() => []),
        ]);

        if (config) {
          setFormuleAppel(config.formule_appel || "cher_maitre");
          setFormulePolitesse(config.formule_politesse || "cordialement");
          setNiveauConcision([config.niveau_concision ?? 50]);
          setTonReponse([config.ton_reponse ?? 50]);
          setNomAvocat(config.nom_avocat || "");
          setNomCabinet(config.nom_cabinet || "");
          setSpecialite(config.specialite || "");
          setSignature(config.signature || "");
        }

        if (examplesData?.examples) {
          setExamples(examplesData.examples.length >= 3 
            ? examplesData.examples 
            : [...examplesData.examples, ...Array(3 - examplesData.examples.length).fill("")]);
        }

        if (Array.isArray(docsData)) {
          setDocuments(docsData);
        }

        if (sourcesData?.sources) {
          setSources(sourcesData.sources);
        }

        if (Array.isArray(rulesData)) {
          setRules(rulesData);
        }
      } catch (error) {
        console.error('Error loading config:', error);
      }
      setLoadingConfig(false);
    };

    loadAll();
  }, []);

  // PUT /api/config + PUT /api/config/examples
  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.put('/api/config', {
          formule_appel,
          formule_politesse,
          niveau_concision: niveau_concision[0],
          ton_reponse: ton_reponse[0],
          nom_avocat,
          nom_cabinet,
          specialite,
          signature,
        }),
        api.put('/api/config/examples', { examples }),
      ]);
      toast.success("Configuration sauvegardée — Donna s'entraîne sur vos données !");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
      console.error(error);
    }
    setSaving(false);
  };

  // POST /api/config/documents (multipart/form-data)
  const handleFileUpload = async (filesToUpload: File[]) => {
    for (const file of filesToUpload) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const doc = await api.upload<ConfigDocument>('/api/config/documents', formData);
        if (doc?.id) {
          setDocuments((prev) => [...prev, doc]);
        }
        toast.success(`${file.name} uploadé`);
      } catch (error) {
        toast.error(`Erreur upload : ${file.name}`);
        console.error(error);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFileUpload(Array.from(e.dataTransfer.files));
    }
  };

  // DELETE /api/config/documents/:id
  const removeDocument = async (docId: string) => {
    try {
      await api.delete(`/api/config/documents/${docId}`);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      toast.success("Document supprimé");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // POST /api/config/rules
  const addRule = async () => {
    try {
      const newRule = await api.post<ConfigRule>('/api/config/rules', { condition: "", action: "" });
      if (newRule?.id) {
        setRules((prev) => [...prev, newRule]);
      } else {
        // Fallback: ajouter localement si l'API ne retourne pas d'id
        setRules((prev) => [...prev, { id: `temp-${Date.now()}`, condition: "", action: "" }]);
      }
    } catch (error) {
      // Fallback local
      setRules((prev) => [...prev, { id: `temp-${Date.now()}`, condition: "", action: "" }]);
    }
  };

  // PUT /api/config/rules/:id
  const updateRule = async (index: number, field: "condition" | "action", value: string) => {
    const rule = rules[index];
    const updated = { ...rule, [field]: value };
    setRules((prev) => prev.map((r, i) => (i === index ? updated : r)));

    // Debounced save would be better, but for now save on blur
    if (!rule.id.startsWith('temp-')) {
      try {
        await api.put(`/api/config/rules/${rule.id}`, { condition: updated.condition, action: updated.action });
      } catch (error) {
        console.error('Error updating rule:', error);
      }
    }
  };

  // DELETE /api/config/rules/:id
  const removeRule = async (index: number) => {
    const rule = rules[index];
    if (!rule.id.startsWith('temp-')) {
      try {
        await api.delete(`/api/config/rules/${rule.id}`);
      } catch (error) {
        toast.error("Erreur suppression règle");
        return;
      }
    }
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExample = (index: number, value: string) => {
    setExamples((prev) => prev.map((e, i) => (i === index ? value : e)));
  };

  if (loadingConfig) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="h-3 w-3" />
          Tableau de bord
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Configuration</h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            Paramétrez Donna pour qu'elle s'adapte parfaitement à votre pratique.
          </p>
        </div>

        {/* Carte 1 — L'ADN et la Voix du Cabinet */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-serif">L'ADN et la Voix du Cabinet</CardTitle>
            </div>
            <CardDescription className="font-sans">
              Définissez le ton et le style de communication de Donna.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nouveaux champs du contrat API */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-sans text-sm">Nom de l'avocat</Label>
                <Input
                  className="font-sans text-sm"
                  placeholder="Votre nom"
                  value={nom_avocat}
                  onChange={(e) => setNomAvocat(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-sans text-sm">Nom du cabinet</Label>
                <Input
                  className="font-sans text-sm"
                  placeholder="Nom de votre cabinet"
                  value={nom_cabinet}
                  onChange={(e) => setNomCabinet(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-sans text-sm">Spécialité</Label>
              <Input
                className="font-sans text-sm"
                placeholder="Droit du travail, Droit commercial..."
                value={specialite}
                onChange={(e) => setSpecialite(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-sans text-sm">Formule d'appel par défaut</Label>
                <Select value={formule_appel} onValueChange={(val) => { if (val) setFormuleAppel(val); }}>
                  <SelectTrigger className="font-sans">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    <SelectItem value="cher_maitre">Cher Maître</SelectItem>
                    <SelectItem value="madame_monsieur">Madame, Monsieur</SelectItem>
                    <SelectItem value="prenom">Prénom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-sans text-sm">Formule de politesse par défaut</Label>
                <Select value={formule_politesse} onValueChange={(val) => { if (val) setFormulePolitesse(val); }}>
                  <SelectTrigger className="font-sans">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    <SelectItem value="bien_a_vous">Bien à vous</SelectItem>
                    <SelectItem value="cordialement">Cordialement</SelectItem>
                    <SelectItem value="veuillez_agreer">Veuillez agréer l'expression de mes salutations distinguées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-sans text-sm">Niveau de concision</Label>
              <Slider value={niveau_concision} onValueChange={setNiveauConcision} max={100} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground font-sans">
                <span>Très direct / Concis</span>
                <span>Détaillé / Explicatif</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-sans text-sm">Ton de la réponse</Label>
              <Slider value={ton_reponse} onValueChange={setTonReponse} max={100} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground font-sans">
                <span>Strictement factuel</span>
                <span>Empathique / Rassurant</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-sans text-sm">Signature email</Label>
              <Textarea
                rows={3}
                className="font-sans text-sm resize-y"
                placeholder="Votre signature email par défaut..."
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Carte 2 — Entraînement IA */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-serif">Entraînement IA</CardTitle>
            </div>
            <CardDescription className="font-sans">
              Donna analysera ces emails pour comprendre votre style de rédaction unique.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {examples.map((example, index) => (
              <div key={index} className="space-y-2">
                <Label className="font-sans text-sm">
                  Email exemple #{index + 1} — Collez un email parfait que vous avez écrit récemment (anonymisé)
                </Label>
                <Textarea
                  rows={4}
                  className="font-sans text-sm resize-y"
                  placeholder="Collez votre email ici..."
                  value={example}
                  onChange={(e) => updateExample(index, e.target.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Carte 3 — Le Coffre-Fort Juridique */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-serif">Le Coffre-Fort Juridique</CardTitle>
            </div>
            <CardDescription className="font-sans">
              Fournissez à Donna vos sources factuelles et documents clés.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="font-sans text-sm text-muted-foreground">
                Déposez vos documents clés ici ou <span className="underline">parcourez</span>
              </p>
              <p className="font-sans text-xs text-muted-foreground/70 mt-1">
                Grille tarifaire, politique interne, modèles de contrats…
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                    <span className="font-sans text-sm text-foreground truncate">{doc.nom}</span>
                    <button onClick={() => removeDocument(doc.id)} className="text-muted-foreground hover:text-foreground ml-2">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-sans text-sm">Sources et Jurisprudences favorites</Label>
              <Textarea
                rows={4}
                className="font-sans text-sm resize-y"
                placeholder="Ex : Dalloz, Code Civil commenté, conventions collectives spécifiques…"
                value={sources}
                onChange={(e) => setSources(e.target.value)}
              />
              <p className="text-xs text-muted-foreground font-sans">
                Sur quels ouvrages, codes ou bases de données juridiques souhaitez-vous que Donna se base en priorité ?
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Carte 4 — Règles et Workflows */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-serif">Règles et Workflows</CardTitle>
            </div>
            <CardDescription className="font-sans">
              Créez des automatismes « Si X, alors Y » pour gagner du temps.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rules.map((rule, index) => (
              <div key={rule.id} className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="font-sans text-xs text-muted-foreground">Si l'email contient…</Label>
                  <Input
                    className="font-sans text-sm"
                    placeholder="condition"
                    value={rule.condition}
                    onChange={(e) => updateRule(index, "condition", e.target.value)}
                  />
                </div>
                <span className="text-muted-foreground font-sans text-sm mt-5">→</span>
                <div className="flex-1 space-y-1">
                  <Label className="font-sans text-xs text-muted-foreground">Alors Donna doit…</Label>
                  <Input
                    className="font-sans text-sm"
                    placeholder="action"
                    value={rule.action}
                    onChange={(e) => updateRule(index, "action", e.target.value)}
                  />
                </div>
                <button onClick={() => removeRule(index)} className="text-muted-foreground hover:text-foreground mt-5">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addRule} className="font-sans">
              <Plus className="h-4 w-4 mr-1" /> Ajouter une règle automatique
            </Button>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-sans text-base py-5"
        >
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Sauvegarder et Entraîner Donna
        </Button>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default Configuration;
