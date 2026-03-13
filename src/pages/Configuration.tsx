import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail, Upload, X, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

interface ConfigDocument {
  id: string;
  nom: string;
  type: string;
  created_at: string;
}

const Configuration = () => {
  const [nom_avocat, setNomAvocat] = useState("");
  const [nom_cabinet, setNomCabinet] = useState("");
  const [specialite, setSpecialite] = useState("");
  const [signature, setSignature] = useState("");
  const [examples, setExamples] = useState(["", "", ""]);
  const [documents, setDocuments] = useState<ConfigDocument[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [config, examplesData, docsData] = await Promise.all([
          api.get('/api/config').catch(() => null),
          api.get('/api/config/examples').catch(() => null),
          api.get('/api/config/documents').catch(() => []),
        ]);

        if (config) {
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
      } catch (error) {
        console.error('Error loading config:', error);
      }
      setLoadingConfig(false);
    };

    loadAll();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.put('/api/config', {
          nom_avocat,
          nom_cabinet,
          specialite,
          signature,
        }),
        api.put('/api/config/examples', { examples }),
      ]);
      toast.success("✓ Configuration sauvegardée");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
      console.error(error);
    }
    setSaving(false);
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

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Configurez Donna</h1>
              <p className="text-muted-foreground font-sans text-sm mt-1">
                Ces informations permettent à Donna de vous connaître et de travailler efficacement pour vous.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link to="/onboarding">
                <Mail className="h-4 w-4 mr-2" />
                Importer ma boîte mail
              </Link>
            </Button>
          </div>

          {/* Section 1 — Votre cabinet */}
          <Card className="border-border shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Votre cabinet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

          {/* Section 2 — Entraînez Donna */}
          <Card className="border-border shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Exemples d'emails</CardTitle>
              <CardDescription className="font-sans">
                Collez 3 emails que vous avez écrits récemment. Donna s'en inspire pour mieux comprendre votre style.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {examples.map((example, index) => (
                <Textarea
                  key={index}
                  rows={4}
                  className="font-sans text-sm resize-y"
                  placeholder="Collez un email ici..."
                  value={example}
                  onChange={(e) => updateExample(index, e.target.value)}
                />
              ))}
            </CardContent>
          </Card>

          {/* Bouton sauvegarder */}
          <div className="space-y-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sauvegarder
            </Button>
            <p className="text-xs text-muted-foreground text-center font-sans">
              Toutes ces informations sont stockées de manière sécurisée et servent uniquement à entraîner Donna, votre employé numérique. Elles ne sont jamais partagées.
            </p>
          </div>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default Configuration;
