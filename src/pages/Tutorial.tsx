import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const Tutorial = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link to="/">
          <h2 className="text-2xl font-serif font-bold tracking-tight text-foreground">Donna</h2>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-3">
            Comment ça marche ?
          </h1>
          <p className="text-muted-foreground font-sans text-base sm:text-lg max-w-md mx-auto">
            Découvrez le workflow en 3 étapes simples.
          </p>
        </motion.div>

        {/* Workflow visual */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-border hidden sm:block" />

          {/* Step 1 — Left aligned */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex flex-col sm:flex-row items-center gap-6 mb-8 sm:mb-0"
          >
            <div className="sm:w-1/2 sm:pr-10 sm:text-right order-2 sm:order-1">
              <span className="inline-block text-[11px] font-sans font-semibold uppercase tracking-wider text-accent mb-2">
                Étape 1
              </span>
              <h3 className="text-lg font-serif font-bold text-foreground mb-1.5">
                Connectez votre boîte mail
              </h3>
              <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                Reliez votre Gmail professionnel à Donna. La connexion est sécurisée et prend 30 secondes.
              </p>
            </div>
            {/* Illustration card */}
            <div className="sm:w-1/2 sm:pl-10 order-1 sm:order-2 flex justify-center sm:justify-start">
              <div className="relative w-56 h-40 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/60 flex items-center justify-center overflow-hidden">
                {/* Animated mail icon */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="w-16 h-12 bg-card rounded-lg border border-border shadow-sm flex items-center justify-center">
                    <svg width="28" height="20" viewBox="0 0 28 20" fill="none" className="text-blue-500">
                      <rect x="1" y="1" width="26" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <path d="M1 4L14 12L27 4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </div>
                </motion.div>
                {/* Connection line animation */}
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
                >
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <div className="w-6 h-0.5 bg-accent/50" />
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </motion.div>
                {/* Label */}
                <span className="absolute top-3 left-3 text-[10px] font-sans font-medium text-blue-500/70">
                  Gmail → Donna
                </span>
              </div>
            </div>
            {/* Center dot */}
            <div className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent border-4 border-background z-10" />
          </motion.div>

          {/* Animated arrow between steps (mobile) */}
          <div className="flex justify-center sm:hidden my-4">
            <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ArrowRight className="h-5 w-5 text-accent rotate-90" />
            </motion.div>
          </div>
          <div className="hidden sm:block h-12" />

          {/* Step 2 — Right aligned (quinconce) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="relative flex flex-col sm:flex-row items-center gap-6 mb-8 sm:mb-0"
          >
            {/* Illustration card */}
            <div className="sm:w-1/2 sm:pr-10 flex justify-center sm:justify-end order-1">
              <div className="relative w-56 h-40 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-200/60 flex flex-col items-center justify-center gap-2 overflow-hidden">
                {/* Incoming mails animation */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + i * 0.3, repeat: Infinity, repeatDelay: 3 }}
                    className="flex items-center gap-2 w-40"
                  >
                    <div className="w-6 h-6 rounded-full bg-violet-200 flex items-center justify-center shrink-0">
                      <span className="text-[8px] font-sans font-bold text-violet-600">
                        {["MD", "JP", "SL"][i]}
                      </span>
                    </div>
                    <div className="flex-1 h-2.5 rounded-full bg-violet-200/70" />
                  </motion.div>
                ))}
                {/* Label */}
                <span className="absolute top-3 left-3 text-[10px] font-sans font-medium text-violet-500/70">
                  Analyse & tri
                </span>
                {/* Processing indicator */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute bottom-3 right-3 w-5 h-5 rounded-full border-2 border-violet-300 border-t-violet-600"
                />
              </div>
            </div>
            <div className="sm:w-1/2 sm:pl-10 sm:text-left order-2">
              <span className="inline-block text-[11px] font-sans font-semibold uppercase tracking-wider text-accent mb-2">
                Étape 2
              </span>
              <h3 className="text-lg font-serif font-bold text-foreground mb-1.5">
                Donna analyse et prépare
              </h3>
              <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                Elle lit chaque mail, identifie le dossier, résume le contenu et rédige un brouillon de réponse personnalisé.
              </p>
            </div>
            {/* Center dot */}
            <div className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent border-4 border-background z-10" />
          </motion.div>

          {/* Animated arrow between steps (mobile) */}
          <div className="flex justify-center sm:hidden my-4">
            <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ArrowRight className="h-5 w-5 text-accent rotate-90" />
            </motion.div>
          </div>
          <div className="hidden sm:block h-12" />

          {/* Step 3 — Left aligned */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="relative flex flex-col sm:flex-row items-center gap-6"
          >
            <div className="sm:w-1/2 sm:pr-10 sm:text-right order-2 sm:order-1">
              <span className="inline-block text-[11px] font-sans font-semibold uppercase tracking-wider text-accent mb-2">
                Étape 3
              </span>
              <h3 className="text-lg font-serif font-bold text-foreground mb-1.5">
                Vous validez ou modifiez
              </h3>
              <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                Relisez le brouillon, vérifiez la jurisprudence et les pièces jointes, puis envoyez. Vous gardez le contrôle total.
              </p>
              <p className="text-xs font-sans text-accent mt-2 font-medium">
                Cette étape se fait avec votre avocat conseil lors du premier rendez-vous.
              </p>
            </div>
            {/* Illustration card */}
            <div className="sm:w-1/2 sm:pl-10 order-1 sm:order-2 flex justify-center sm:justify-start">
              <div className="relative w-56 h-40 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/60 flex items-center justify-center overflow-hidden">
                {/* Document with checkmarks */}
                <div className="w-32 bg-card rounded-lg border border-border shadow-sm p-3 space-y-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 + i * 0.4, repeat: Infinity, repeatDelay: 4 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.4 + i * 0.4, repeat: Infinity, repeatDelay: 4, type: "spring" }}
                        className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"
                      >
                        <Check className="h-2.5 w-2.5 text-emerald-600" />
                      </motion.div>
                      <div className="flex-1 h-2 rounded-full bg-muted" />
                    </motion.div>
                  ))}
                </div>
                {/* Label */}
                <span className="absolute top-3 left-3 text-[10px] font-sans font-medium text-emerald-500/70">
                  Validation
                </span>
              </div>
            </div>
            {/* Center dot */}
            <div className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent border-4 border-background z-10" />
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-center mt-14"
        >
          <Link to="/dashboard">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-10 py-6 text-base font-sans font-medium shadow-lg"
            >
              <Check className="mr-2 h-5 w-5" />
              Accéder au tableau de bord
            </Button>
          </Link>
          <p className="mt-4 text-xs text-muted-foreground font-sans">
            La connexion sera configurée avec votre avocat lors du premier rendez-vous.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Tutorial;
