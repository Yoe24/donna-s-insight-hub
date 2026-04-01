import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { EyeOff, ShieldOff, Lock, Trash2, UserCheck, KeyRound, ArrowRight } from "lucide-react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageTransition } from "@/components/PageTransition";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const pillars = [
  {
    icon: EyeOff,
    title: "Lecture seule, rien d'autre",
    text: "Donna lit vos emails pour les résumer, mais ne peut ni envoyer, ni supprimer, ni modifier quoi que ce soit dans votre boîte mail. La connexion Gmail est en lecture seule (scope gmail.readonly) et révocable à tout moment depuis votre compte Google.",
  },
  {
    icon: ShieldOff,
    title: "Aucun entraînement sur vos données",
    text: "Vos emails et documents ne sont jamais utilisés pour entraîner les modèles d'intelligence artificielle. Chaque appel à l'IA est paramétré pour interdire la rétention des données. Vos informations sont analysées puis immédiatement oubliées par le modèle.",
  },
  {
    icon: Lock,
    title: "Chiffrement systématique",
    text: "Toutes les connexions sont protégées par HTTPS (TLS 1.2+). Les données sont chiffrées en transit et au repos. Les tokens d'accès à votre boîte mail sont sécurisés en base de données. Aucun mot de passe n'est stocké. L'authentification passe exclusivement par OAuth.",
  },
  {
    icon: Trash2,
    title: "Suppression à la demande",
    text: "Vous gardez le contrôle total de vos données. Déconnectez votre boîte mail, supprimez vos dossiers et vos emails traités, révoquez l'accès de Donna : tout cela en un clic, sans délai, sans justification.",
  },
  {
    icon: UserCheck,
    title: "Isolation par cabinet",
    text: "Chaque cabinet d'avocats dispose d'un espace strictement isolé. Aucun croisement de données entre les utilisateurs. Vos emails, vos dossiers et vos documents ne sont accessibles qu'à vous.",
  },
  {
    icon: KeyRound,
    title: "Connexion OAuth sécurisée",
    text: "Donna ne vous demande jamais votre mot de passe. La connexion passe par le protocole OAuth de Google, le même standard utilisé par les applications professionnelles les plus exigeantes. Vous pouvez révoquer l'accès à tout moment depuis les paramètres de votre compte Google.",
  },
];

const steps = [
  {
    num: "01",
    title: "Connexion sécurisée",
    text: "Vous connectez votre boîte Gmail via OAuth. Donna obtient un accès en lecture seule. Aucun mot de passe n'est transmis.",
  },
  {
    num: "02",
    title: "Lecture de l'email",
    text: "Donna récupère le contenu de l'email et les pièces jointes via l'API Gmail officielle de Google.",
  },
  {
    num: "03",
    title: "Analyse par l'IA",
    text: "L'email est envoyé à l'intelligence artificielle pour être résumé. Le paramètre de non-rétention est activé : l'IA traite les données puis les oublie immédiatement.",
  },
  {
    num: "04",
    title: "Résumé sauvegardé",
    text: "Le résumé et le dossier client sont sauvegardés dans votre espace sécurisé, chiffré et isolé des autres utilisateurs.",
  },
  {
    num: "05",
    title: "Vous décidez",
    text: "Vous consultez le résumé, générez un brouillon de réponse si besoin, et gardez le contrôle total sur chaque action.",
  },
];

const faqs = [
  {
    q: "Mes données sont-elles couvertes par le secret professionnel ?",
    a: "Donna est conçue dans le respect du secret professionnel des avocats. Vos emails et documents ne sont accessibles qu'à vous. Aucune donnée n'est partagée avec des tiers ni utilisée à d'autres fins que celles de votre cabinet.",
  },
  {
    q: "Donna peut-elle envoyer des emails en mon nom ?",
    a: "Non. Donna fonctionne en lecture seule. Elle peut lire et résumer vos emails, mais elle ne peut ni envoyer, ni répondre, ni supprimer de messages. Les brouillons de réponse sont générés dans l'interface Donna. C'est vous qui copiez et envoyez manuellement.",
  },
  {
    q: "L'IA s'entraîne-t-elle sur mes dossiers ?",
    a: "Non. Chaque appel à l'intelligence artificielle est configuré avec le paramètre de non-rétention. Vos données sont analysées pour produire un résumé, puis immédiatement supprimées de la mémoire du modèle. Aucune donnée client n'est utilisée pour améliorer ou entraîner l'IA.",
  },
  {
    q: "Qui a accès à mes emails ?",
    a: "Uniquement vous. Vos données sont isolées dans votre espace personnel et protégées par votre authentification. L'équipe Donna n'a pas accès au contenu de vos emails ni de vos dossiers.",
  },
  {
    q: "Comment supprimer toutes mes données ?",
    a: "Vous pouvez supprimer l'ensemble de vos données à tout moment depuis les paramètres de votre compte. La suppression est immédiate et définitive. Vous pouvez également révoquer l'accès de Donna à votre boîte Gmail depuis les paramètres de votre compte Google.",
  },
  {
    q: "Où sont hébergées mes données ?",
    a: "Vos données sont hébergées sur des serveurs sécurisés avec chiffrement au repos et en transit. La connexion à votre boîte mail passe par les serveurs officiels de Google via leur API sécurisée.",
  },
  {
    q: "Puis-je révoquer l'accès de Donna à tout moment ?",
    a: "Oui, immédiatement. Depuis l'interface Donna (bouton Déconnexion dans les paramètres) ou depuis les paramètres de sécurité de votre compte Google (https://myaccount.google.com/permissions). L'accès est coupé instantanément.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const Securite = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white flex flex-col">
        <PublicNavbar />

        {/* ── HERO ── */}
        <section className="px-6 sm:px-10 lg:px-24 pt-24 sm:pt-32 pb-24 sm:pb-36 max-w-5xl mx-auto w-full">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-sans font-medium uppercase tracking-[0.25em] text-neutral-400 mb-6"
          >
            Sécurité
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-[2.5rem] sm:text-[3.2rem] lg:text-[4rem] font-serif font-bold text-black leading-[1.1] max-w-4xl"
          >
            Le secret professionnel de vos clients est notre priorité absolue.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
            className="mt-8 text-neutral-500 text-base sm:text-lg font-sans leading-relaxed max-w-[500px]"
          >
            Donna protège les données de votre cabinet grâce à des mesures de sécurité et de confidentialité conçues pour le monde juridique.
          </motion.p>
        </section>

        {/* ── PILIERS ── */}
        <section className="bg-[#1A1A1A] px-6 sm:px-10 lg:px-24 py-24 sm:py-32">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white mb-16 sm:mb-20"
            >
              Protection conçue pour les avocats
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
              {pillars.map((p, i) => (
                <motion.div
                  key={p.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <p.icon className="h-6 w-6 text-white mb-5" strokeWidth={1.5} />
                  <h3 className="text-white font-sans font-semibold text-lg mb-3">
                    {p.title}
                  </h3>
                  <p className="text-[#B0B0B0] font-sans text-sm leading-relaxed">
                    {p.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section className="px-6 sm:px-10 lg:px-24 py-24 sm:py-32 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-black mb-4"
            >
              La sécurité est au cœur de chaque étape
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-neutral-500 font-sans text-base sm:text-lg mb-16 sm:mb-20 max-w-xl"
            >
              Voici comment Donna traite vos emails, de la réception au résumé.
            </motion.p>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[1.1rem] sm:left-[1.35rem] top-2 bottom-2 w-px bg-neutral-200" />

              <div className="space-y-12 sm:space-y-16">
                {steps.map((s, i) => (
                  <motion.div
                    key={s.num}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="relative pl-16 sm:pl-20"
                  >
                    {/* Number circle */}
                    <span className="absolute left-0 top-0 text-2xl sm:text-3xl font-serif font-bold text-neutral-300 w-10 sm:w-12 text-center">
                      {s.num}
                    </span>
                    <h3 className="font-sans font-semibold text-black text-base sm:text-lg mb-2">
                      {s.title}
                    </h3>
                    <p className="text-neutral-500 font-sans text-sm sm:text-base leading-relaxed max-w-lg">
                      {s.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="px-6 sm:px-10 lg:px-24 py-24 sm:py-32 bg-white border-t border-neutral-100">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">
            {/* Left intro */}
            <div className="lg:col-span-2">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-2xl sm:text-3xl font-serif font-bold text-black mb-5"
              >
                Questions fréquentes
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-neutral-500 font-sans text-sm sm:text-base leading-relaxed"
              >
                La confiance de nos clients repose sur la transparence. Nous répondons ici aux questions les plus fréquentes des avocats sur la sécurité de leurs données.
              </motion.p>
            </div>

            {/* Right accordion */}
            <div className="lg:col-span-3">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-b border-neutral-200">
                    <AccordionTrigger className="text-left font-sans font-medium text-black text-sm sm:text-base py-5 hover:no-underline">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-neutral-500 font-sans text-sm leading-relaxed pb-5">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-[#F5F5F5] px-6 sm:px-10 lg:px-24 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-black mb-8"
            >
              Prêt à gagner du temps sur vos emails ?
            </motion.h2>
            <Link to="/login">
              <button className="bg-black text-white px-8 py-3.5 rounded text-sm font-sans font-medium hover:bg-neutral-800 transition-colors inline-flex items-center gap-2">
                Commencer avec Donna
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </section>

        <PublicFooter />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default Securite;
