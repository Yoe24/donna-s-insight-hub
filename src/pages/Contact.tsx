import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageTransition } from "@/components/PageTransition";

const Contact = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNavbar />
        <section className="flex-1 max-w-3xl mx-auto px-6 pt-16 pb-20">
          <p className="text-xs font-sans font-medium uppercase tracking-widest text-muted-foreground mb-4">
            Contact
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-foreground leading-tight mb-6">
            Nous contacter
          </h1>
          <p className="text-base sm:text-lg font-sans text-muted-foreground leading-relaxed">
            Contenu à venir.
          </p>
        </section>
        <PublicFooter />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default Contact;
