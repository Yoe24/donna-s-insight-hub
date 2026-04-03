import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageTransition } from "@/components/PageTransition";

const Tarifs = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNavbar />
        <section className="flex-1 max-w-3xl mx-auto px-6 pt-16 pb-20">
          <p className="text-xs font-sans font-medium uppercase tracking-widest text-muted-foreground mb-4">
            Tarifs
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-foreground leading-tight mb-6">
            Tarifs
          </h1>
          <p className="text-base sm:text-lg font-sans text-muted-foreground leading-relaxed mb-8">
            Donna est gratuite pendant la phase de lancement. Sans engagement, sans carte bancaire.
          </p>
          <a
            href="mailto:donna@donna-legal.com"
            className="inline-flex items-center gap-2 bg-foreground text-background font-sans font-medium text-sm px-8 py-3.5 rounded-lg hover:bg-foreground/90 transition-colors"
          >
            Demander un accès
          </a>
        </section>
        <PublicFooter />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default Tarifs;
