import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageTransition } from "@/components/PageTransition";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-foreground flex flex-col">
        <PublicNavbar invertColors />

        {/* Hero — full viewport, image background, left-aligned text */}
        <main className="relative flex-1 flex items-end pb-24 sm:pb-32 min-h-[90vh]">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src={heroBg}
              alt="Avocate travaillant dans son cabinet"
              className="w-full h-full object-cover"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 sm:px-16 lg:px-24 max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.08] text-white mb-8"
            >
              Donna lit vos mails,
              <br />
              rédige vos réponses.
              <br />
              <span className="text-white/50">Vous validez.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="text-white/70 text-base sm:text-lg font-sans leading-relaxed max-w-md mb-12"
            >
              L'intelligence artificielle au service des avocats.
              Donna traite vos emails, analyse vos pièces jointes
              et prépare vos réponses.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <Link to="/demo">
                <button className="bg-white text-black px-8 py-3.5 rounded text-sm font-sans font-medium hover:bg-white/90 transition-colors flex items-center gap-2 min-h-[48px]">
                  Demander une démo
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link to="/login">
                <button className="border border-white/30 text-white px-8 py-3.5 rounded text-sm font-sans font-medium hover:border-white/60 transition-colors min-h-[48px]">
                  Se connecter
                </button>
              </Link>
            </motion.div>
          </div>
        </main>

        <PublicFooter />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default Index;
