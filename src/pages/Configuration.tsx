import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Configuration = () => {
  const handleSave = () => {
    toast.success("Configuration sauvegardée");
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-serif font-bold text-foreground">Configuration</h1>
        <p className="text-muted-foreground font-sans text-sm">
          Personnalisez Donna pour qu'elle s'adapte à votre pratique.
        </p>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Informations personnelles</CardTitle>
            <CardDescription className="font-sans">Vos coordonnées professionnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-sans text-sm">Nom</Label>
                <Input placeholder="Maître Durand" defaultValue="Maître Caroline Durand" className="font-sans" />
              </div>
              <div className="space-y-2">
                <Label className="font-sans text-sm">Cabinet</Label>
                <Input placeholder="Cabinet Durand & Associés" defaultValue="Cabinet Durand & Associés" className="font-sans" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-sans text-sm">Spécialité</Label>
              <Input placeholder="Droit des affaires" defaultValue="Droit civil & commercial" className="font-sans" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Ton & Signature</CardTitle>
            <CardDescription className="font-sans">Aidez Donna à écrire comme vous</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-sans text-sm">Exemple de mail (pour capter votre ton)</Label>
              <Textarea
                rows={5}
                className="font-sans text-sm"
                placeholder="Collez ici un exemple d'email que vous avez rédigé..."
                defaultValue="Cher Monsieur,&#10;&#10;Suite à notre entretien du 15 mars, je me permets de revenir vers vous concernant les points soulevés. Je vous propose de fixer un rendez-vous la semaine prochaine afin de finaliser les termes de l'accord.&#10;&#10;Je reste à votre disposition pour tout complément d'information.&#10;&#10;Cordialement,"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-sans text-sm">Signature email</Label>
              <Textarea
                rows={4}
                className="font-sans text-sm"
                placeholder="Votre signature professionnelle..."
                defaultValue="Maître Caroline Durand&#10;Avocate au Barreau de Paris&#10;Cabinet Durand & Associés&#10;Tél : 01 42 00 00 00"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Calcul du ROI</CardTitle>
            <CardDescription className="font-sans">Votre taux horaire pour le calcul des économies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="font-sans text-sm">Taux horaire (€/h)</Label>
              <Input type="number" defaultValue={350} className="font-sans max-w-[200px]" />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans"
        >
          Sauvegarder
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default Configuration;
