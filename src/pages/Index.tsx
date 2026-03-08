import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-serif font-bold tracking-tight text-foreground">Donna</h2>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors">Plateforme</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">À propos</span>
          <Link to="/tutorial" className="hover:text-foreground transition-colors">Se connecter</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight text-foreground mb-6">
            Votre temps vaut plus que le tri de vos emails
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-sans leading-relaxed">
            Donna lit, résume et rédige vos brouillons. Vous gardez le contrôle, elle fait le reste.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <Link to="/tutorial">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-10 py-6 text-base font-sans font-medium tracking-wide shadow-lg hover:shadow-xl transition-all"
            >
              Commencer là
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16 text-xs text-muted-foreground font-sans"
        >
          Confidentiel. Sécurisé. Conçu pour le droit.
        </motion.p>
      </main>
    </div>
  );
};

export default Index;
