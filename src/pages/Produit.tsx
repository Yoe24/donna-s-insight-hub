import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, FileText, CheckCircle2, ArrowRight, Clock, Shield } from "lucide-react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageTransition } from "@/components/PageTransition";

const features = [
  {
    icon: Mail,
    title: "Lecture automatique",
    description: "Donna lit chaque email entrant, identifie le dossier concerné et résume le contenu en quelques lignes.",
  },
  {
    icon: FileText,
    title: "Rédaction de brouillons",
    description: "Elle rédige un brouillon de réponse personnalisé, sourcé et annoté, prêt à être validé.",
  },
  {
    icon: CheckCircle2,
    title: "Validation par l'avocat",
    description: "Vous relisez, modifiez si nécessaire, puis envoyez. Vous gardez le contrôle total.",
  },
  {
    icon: Clock,
    title: "Gain de temps",
    description: "2 à 3 heures économisées chaque jour sur le traitement de vos emails non facturables.",
  },
  {
    icon: Shield,
    title: "Confidentialité totale",
    description: "Vos données sont chiffrées, hébergées en France, et jamais utilisées pour entraîner des modèles.",
  },
];

const Produit = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNavbar />

        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-sans font-medium uppercase tracking-widest text-muted-foreground mb-4">
              Solution
            </p>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-foreground leading-tight mb-5">
              Votre premier employé
              <br />
              numérique juridique
            </h1>
            <p className="text-base sm:text-lg font-sans text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Donna traite votre boîte mail 24/7. Elle lit, trie, résume et rédige — vous validez.
            </p>
          </motion.div>
        </section>

        {/* Features */}
        <section className="max-w-4xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border border-border rounded-2xl overflow-hidden">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className={`bg-background p-8 ${i === features.length - 1 && features.length % 2 !== 0 ? "sm:col-span-2" : ""}`}
              >
                <f.icon className="h-5 w-5 text-foreground mb-4" strokeWidth={1.5} />
                <h3 className="text-base font-serif font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm font-sans text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-14"
          >
            <Link to="/demo">
              <button className="bg-foreground text-background px-8 py-3 rounded-full text-sm font-sans font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 min-h-[48px]">
                Demander une démo
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </motion.div>
        </section>

        <PublicFooter />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default Produit;
