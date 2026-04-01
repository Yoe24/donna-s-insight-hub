import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import { PageTransition } from "@/components/PageTransition";

const MentionsLegales = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNavbar />
        <main className="flex-1 max-w-2xl mx-auto px-6 py-16 font-sans">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-8">Mentions légales</h1>

          <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-lg font-serif font-bold text-foreground mb-2">Éditeur</h2>
              <p>Donna-Legal.ai · Adresse : sur demande · contact@donna-legal.ai</p>
            </section>

            <section>
              <h2 className="text-lg font-serif font-bold text-foreground mb-2">Hébergeur</h2>
              <p>
                Le frontend est servi via Vercel Inc. (CDN mondial). Les données utilisateurs sont hébergées en Europe (infrastructure conforme RGPD).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-serif font-bold text-foreground mb-2">Contact</h2>
              <p>contact@donna-legal.ai</p>
            </section>

            <section>
              <h2 className="text-lg font-serif font-bold text-foreground mb-2">Protection des données (RGPD)</h2>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles.
              </p>
              <p className="mt-2">
                Pour exercer ces droits, vous pouvez nous contacter à l'adresse : contact@donna-legal.ai
              </p>
              <p className="mt-2">
                Les données collectées via la plateforme sont utilisées exclusivement pour le fonctionnement du service Donna et ne sont jamais partagées avec des tiers.
              </p>
            </section>
          </div>
        </main>
        <PublicFooter />
      </div>
    </PageTransition>
  );
};

export default MentionsLegales;
