import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Users, Lightbulb } from "lucide-react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageTransition } from "@/components/PageTransition";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const values = [
  {
    icon: Shield,
    title: "La confiance avant tout",
    text: "Le secret professionnel n'est pas négociable. Chaque décision technique que nous prenons est guidée par la protection de vos données.",
  },
  {
    icon: Users,
    title: "Construit avec les avocats",
    text: "Donna n'est pas conçue en chambre. Chaque fonctionnalité est testée et validée par des avocats en exercice avant d'être déployée.",
  },
  {
    icon: Lightbulb,
    title: "La simplicité comme exigence",
    text: "Pas de formation nécessaire, pas de paramétrage complexe. Vous connectez votre boîte mail, Donna fait le reste.",
  },
];

const APropos = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNavbar />

        {/* Section 1 — Hero */}
        <section className="py-20 sm:py-28 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <p className="text-xs font-sans font-medium uppercase tracking-[0.2em] text-muted-foreground mb-5">
                Notre histoire
              </p>
              <h1 className="text-3xl sm:text-[3rem] font-serif font-bold text-foreground leading-[1.15] mb-6">
                Donna est née d'un constat de terrain.
              </h1>
              <p className="text-lg font-sans leading-relaxed max-w-[600px]" style={{ color: "#374151" }}>
                En échangeant avec des dizaines d'avocats indépendants et de petits cabinets à travers la France, un même constat revenait sans cesse : le quotidien est noyé sous les emails. Donna est la réponse à ce problème.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Section 2 — Le Constat */}
        <section className="py-20 sm:py-24 px-6" style={{ backgroundColor: "#F9FAFB" }}>
          <div className="max-w-[700px] mx-auto text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-8">Le constat</h2>
              <div className="font-sans text-left sm:text-center space-y-6" style={{ color: "#374151", fontSize: "1.1rem", lineHeight: 1.8 }}>
                <p>
                  Un avocat indépendant reçoit en moyenne 30 à 50 emails par jour. Chaque email doit être lu, compris, classé, et souvent suivi d'une réponse. C'est un travail invisible qui prend 2 à 3 heures par jour — du temps qui n'est ni facturé, ni consacré aux dossiers.
                </p>
                <p>
                  Les grands cabinets ont des assistantes, des secrétariats juridiques, des outils sur mesure. Les avocats indépendants, eux, font tout seuls.
                </p>
                <p className="font-semibold text-foreground">Donna change ça.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 3 — Notre Vision */}
        <section className="py-20 sm:py-24 px-6">
          <div className="max-w-[700px] mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-8 text-center">Notre vision</h2>
              <div className="font-sans space-y-6" style={{ color: "#374151", fontSize: "1.1rem", lineHeight: 1.8 }}>
                <p>Donna n'est pas un logiciel de plus. C'est votre première employée numérique.</p>
                <p>
                  Elle arrive le matin avant vous. Elle a lu tous vos emails. Elle a trié les urgences, filtré les newsletters, classé les pièces jointes dans les bons dossiers. Elle vous a préparé un brief clair et des brouillons de réponse dans votre style.
                </p>
                <p>Vous ouvrez Donna, vous lisez, vous validez. C'est tout.</p>
                <p className="font-semibold text-foreground">
                  Notre mission est simple : rendre aux avocats le temps qu'ils méritent de consacrer à leurs clients.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 4 — L'équipe */}
        <section className="py-20 sm:py-24 px-6" style={{ backgroundColor: "#F9FAFB" }}>
          <div className="max-w-[700px] mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-8 text-center">
                Qui est derrière Donna ?
              </h2>
              <div className="font-sans space-y-6" style={{ color: "#374151", fontSize: "1.1rem", lineHeight: 1.8 }}>
                <p>
                  Donna est née d'une enquête menée auprès de cabinets indépendants et de petites structures de 3 à 6 avocats. Le même problème revenait partout : trop d'emails, pas assez de temps, et aucun outil adapté à leur réalité.
                </p>
                <p>
                  Une équipe de juristes et d'ingénieurs convaincus que l'IA peut transformer le quotidien des avocats — sans jamais compromettre le secret professionnel — a décidé de construire ce que personne ne proposait : une employée numérique pensée pour le cabinet d'à côté, pas pour les géants du CAC 40.
                </p>
                <p>
                  Chaque fonctionnalité est conçue avec des avocats en exercice. Chaque décision technique est guidée par un principe simple : si un avocat ne l'utiliserait pas au quotidien, on ne le construit pas.
                </p>
                <p className="font-semibold text-foreground">
                  Donna n'est pas née dans un laboratoire. Elle est née dans un cabinet d'avocats.
                </p>
              </div>
              <a
                href="mailto:contact@donna-legal.ai"
                className="inline-block mt-6 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
              >
                contact@donna-legal.ai
              </a>
            </motion.div>
          </div>
        </section>

        {/* Section 5 — Nos Valeurs */}
        <section className="py-20 sm:py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-2xl sm:text-3xl font-serif font-bold text-foreground text-center mb-14"
            >
              Ce en quoi nous croyons
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
              {values.map((v, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.15 } },
                  }}
                  className="text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
                    <v.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-foreground mb-3">{v.title}</h3>
                  <p className="font-sans text-muted-foreground leading-relaxed text-sm">{v.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6 — CTA */}
        <section className="py-20 sm:py-24 px-6" style={{ backgroundColor: "#111111" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-8">
              Envie de rencontrer Donna ?
            </h2>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-foreground font-sans font-medium text-sm px-8 py-3.5 rounded-lg hover:bg-white/90 transition-colors"
            >
              Demander une démo →
            </Link>
          </motion.div>
        </section>

        <PublicFooter />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default APropos;
