import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, Shield, Zap, Check } from "lucide-react";

const steps = [
  {
    icon: Mail,
    title: "Connectez votre boîte Gmail",
    description: "Donna se connecte à votre compte Gmail professionnel pour lire vos emails entrants en toute sécurité.",
  },
  {
    icon: Shield,
    title: "Autorisez l'accès en lecture",
    description: "Accordez les permissions nécessaires. Donna ne modifie jamais vos emails — elle les lit et crée des brouillons.",
  },
  {
    icon: Zap,
    title: "Donna commence à travailler",
    description: "Dès la connexion établie, Donna analyse vos emails, génère des résumés et prépare vos réponses.",
  },
];

const Tutorial = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link to="/">
          <h2 className="text-2xl font-serif font-bold tracking-tight text-foreground">Donna</h2>
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
            Connecter votre boîte mail
          </h1>
          <p className="text-muted-foreground font-sans text-lg">
            Trois étapes simples pour que Donna devienne votre assistante.
          </p>
        </motion.div>

        <div className="space-y-8 mb-16">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 * (i + 1) }}
              className="flex gap-6 items-start"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <step.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-sans font-medium text-accent uppercase tracking-wider">
                    Étape {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-serif font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-muted-foreground font-sans text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center"
        >
          <Link to="/dashboard">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-10 py-6 text-base font-sans font-medium shadow-lg"
            >
              <Check className="mr-2 h-5 w-5" />
              C'est fait — Accéder au tableau de bord
            </Button>
          </Link>
          <p className="mt-4 text-xs text-muted-foreground font-sans">
            La connexion sera effectuée avec votre avocat lors de votre premier rendez-vous.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Tutorial;
