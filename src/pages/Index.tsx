import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-6 max-w-7xl mx-auto w-full">
        <Link to="/">
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">
            Donna
          </h2>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-sans text-muted-foreground">
          <Link to="/produit" className="hover:text-foreground transition-colors">
            Solution
          </Link>
          <Link to="/a-propos" className="hover:text-foreground transition-colors">
            À propos
          </Link>
          <Link to="/demo" className="hover:text-foreground transition-colors">
            Demander une démo
          </Link>
          <Link
            to="/login"
            className="text-foreground font-medium hover:opacity-70 transition-opacity"
          >
            Se connecter
          </Link>
        </div>
        <div className="flex md:hidden items-center gap-4 text-sm font-sans">
          <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
            Se connecter
          </Link>
        </div>
      </nav>

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
            <button className="bg-foreground text-background px-8 py-3 rounded-full text-sm font-sans font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
              Demander une démo
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <Link to="/login">
            <button className="border border-border text-foreground px-8 py-3 rounded-full text-sm font-sans font-medium hover:bg-muted transition-colors">
              Se connecter
            </button>
          </Link>
        </motion.div>
      </main>

      {/* Footer minimal */}
      <footer className="py-8 text-center">
        <p className="text-xs text-muted-foreground font-sans">
          © 2026 Donna — donna-legale.ai
        </p>
      </footer>
    </div>
  );
};

export default Index;
