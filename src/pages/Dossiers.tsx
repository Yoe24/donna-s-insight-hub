import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useDossiers } from "@/hooks/useDossiers";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const statutColor: Record<string, string> = {
  actif: "bg-green-500",
  en_attente: "bg-orange-400",
  archive: "bg-muted-foreground",
};

export default function Dossiers() {
  const { dossiers, loading } = useDossiers();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Dossiers</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : dossiers.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucun dossier pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {dossiers.map((d) => (
              <Link key={d.id} to={`/dossiers/${d.id}`}>
                <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between py-4 px-5">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${statutColor[d.statut] || "bg-muted-foreground"}`} />
                      <span className="font-medium text-sm">{d.nom_client}</span>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{d.statut?.replace("_", " ")}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
