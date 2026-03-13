import { motion } from "framer-motion";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageTransition } from "@/components/PageTransition";

const APropos = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNavbar />

        <section className="max-w-2xl mx-auto px-6 pt-16 pb-24 flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-sans font-medium uppercase tracking-widest text-muted-foreground mb-4">
              À propos
            </p>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground leading-tight mb-8">
              Construire l'avenir du droit,
              <br />
              un email à la fois.
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6 text-base font-sans text-muted-foreground leading-relaxed"
          >
            <p>
              Donna est née d'un constat simple : les avocats passent plus de temps à gérer leurs emails
              qu'à exercer leur métier. 66% du temps d'un avocat est consacré au traitement de sa messagerie.
            </p>
            <p>
              Nous avons créé le premier employé numérique dédié aux professionnels du droit.
              Donna lit, trie, résume et rédige — l'avocat garde le contrôle et valide chaque décision.
            </p>
            <p>
              Notre mission : redonner aux avocats le temps de faire ce qu'ils font de mieux —
              conseiller, plaider, défendre.
            </p>

            <div className="pt-8 border-t border-border">
              <h2 className="text-lg font-serif font-bold text-foreground mb-4">Nos principes</h2>
              <ul className="space-y-3">
                {[
                  "Confidentialité absolue — vos données ne quittent jamais la France.",
                  "Supervision humaine — rien ne part sans votre validation.",
                  "Simplicité radicale — pas de configuration complexe, pas de formation requise.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </section>

        <PublicFooter />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default APropos;
