import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageTransition } from "@/components/PageTransition";

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNavbar />

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold leading-[1.1] text-foreground mb-6">
              Donna lit vos mails,
              <br />
              rédige vos réponses.
              <br />
              <span className="text-muted-foreground">Vous validez.</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-10"
          >
            <Link to="/demo">
              <button className="bg-foreground text-background px-8 py-3 rounded-full text-sm font-sans font-medium hover:opacity-90 transition-opacity flex items-center gap-2 min-h-[48px]">
                Demander une démo
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link to="/login">
              <button className="border border-border text-foreground px-8 py-3 rounded-full text-sm font-sans font-medium hover:bg-muted transition-colors min-h-[48px]">
                Se connecter
              </button>
            </Link>
          </motion.div>
        </main>

        <PublicFooter />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default Index;
