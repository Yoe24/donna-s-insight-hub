import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Plus, X, FileText, Brain, Shield, Workflow } from "lucide-react";

const Configuration = () => {
  const [greeting, setGreeting] = useState("cher_maitre");
  const [closing, setClosing] = useState("cordialement");
  const [concision, setConcision] = useState([50]);
  const [tone, setTone] = useState([50]);
  const [examples, setExamples] = useState(["", "", ""]);
  const [files, setFiles] = useState<File[]>([]);
  const [sources, setSources] = useState("");
  const [rules, setRules] = useState<{ keyword: string; action: string }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    toast.success("Configuration sauvegardée — Donna s'entraîne sur vos données !");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addRule = () => {
    setRules((prev) => [...prev, { keyword: "", action: "" }]);
  };

  const updateRule = (index: number, field: "keyword" | "action", value: string) => {
    setRules((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const removeRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExample = (index: number, value: string) => {
    setExamples((prev) => prev.map((e, i) => (i === index ? value : e)));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-sans text-sm">Formule d'appel par défaut</Label>
                <Select value={greeting} onValueChange={setGreeting}>
                  <SelectTrigger className="font-sans">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cher_maitre">Cher Maître</SelectItem>
                    <SelectItem value="madame_monsieur">Madame, Monsieur</SelectItem>
                    <SelectItem value="prenom">Prénom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-sans text-sm">Formule de politesse par défaut</Label>
                <Select value={closing} onValueChange={setClosing}>
                  <SelectTrigger className="font-sans">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bien_a_vous">Bien à vous</SelectItem>
                    <SelectItem value="cordialement">Cordialement</SelectItem>
                    <SelectItem value="veuillez_agreer">Veuillez agréer l'expression de mes salutations distinguées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-sans text-sm">Niveau de concision</Label>
              <Slider value={concision} onValueChange={setConcision} max={100} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground font-sans">
                <span>Très direct / Concis</span>
                <span>Détaillé / Explicatif</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-sans text-sm">Ton de la réponse</Label>
              <Slider value={tone} onValueChange={setTone} max={100} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground font-sans">
                <span>Strictement factuel</span>
                <span>Empathique / Rassurant</span>
              </div>
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

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                    <span className="font-sans text-sm text-foreground truncate">{file.name}</span>
                    <button onClick={() => removeFile(index)} className="text-muted-foreground hover:text-foreground ml-2">
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
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="font-sans text-xs text-muted-foreground">Si l'email contient…</Label>
                  <Input
                    className="font-sans text-sm"
                    placeholder="mot-clé"
                    value={rule.keyword}
                    onChange={(e) => updateRule(index, "keyword", e.target.value)}
                  />
                </div>
                <span className="text-muted-foreground font-sans text-sm mt-5">→</span>
                <div className="flex-1 space-y-1">
                  <Label className="font-sans text-xs text-muted-foreground">Alors Donna doit…</Label>
                  <Input
                    className="font-sans text-sm"
                    placeholder="action / phrase à ajouter"
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
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-sans text-base py-5"
        >
          Sauvegarder et Entraîner Donna
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default Configuration;
