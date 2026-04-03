import { useState, useEffect } from "react";
import DashboardCinematic from "@/components/cinematic/DashboardCinematic";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Mail,
  FileText,
  PenLine,
  Inbox,
  FolderOpen,
  Paperclip,
  ClipboardCheck,
  PenTool,
  Clock,
  Shield,
  Lock,
  BrainCog,
  Trash2,
} from "lucide-react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageTransition } from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" as const },
  }),
};

const briefCards = [
  {
    icon: Mail,
    title: "Elle lit et trie vos emails",
    text: "Donna analyse chaque email entrant, identifie les clients, filtre les newsletters et classe chaque message dans le bon dossier.",
  },
  {
    icon: FileText,
    title: "Elle résume l'essentiel",
    text: "Plus besoin de lire 30 emails. Donna vous donne un résumé clair et actionnable de chaque message, avec les points d'attention.",
  },
  {
    icon: PenLine,
    title: "Elle prépare vos réponses",
    text: "En un clic, Donna rédige un brouillon de réponse professionnelle dans votre style. Vous relisez, vous validez, vous envoyez.",
  },
];

const features = [
  {
    icon: Inbox,
    title: "Tri intelligent des emails",
    text: "Donna distingue les emails de vos clients, les prospects et les newsletters. Les messages importants sont mis en avant, le reste est filtré.",
  },
  {
    icon: FolderOpen,
    title: "Création automatique des dossiers",
    text: "Chaque client est identifié et organisé dans un dossier. Donna suit l'historique des échanges et vous donne une vue d'ensemble instantanée.",
  },
  {
    icon: Paperclip,
    title: "Analyse des pièces jointes",
    text: "Contrats, factures, documents juridiques : Donna lit les PDF et les Word, en extrait l'essentiel et les rattache au bon dossier.",
  },
  {
    icon: ClipboardCheck,
    title: "Résumés actionnables",
    text: "Chaque email est résumé en quelques lignes. Vous savez immédiatement ce que le client demande et ce que vous devez faire.",
  },
  {
    icon: PenTool,
    title: "Brouillons de réponse",
    text: "Donna rédige des réponses professionnelles dans votre style. Vous n'avez qu'à relire et envoyer.",
  },
  {
    icon: Clock,
    title: "Disponible 24h/24",
    text: "Donna ne prend pas de vacances, ne tombe pas malade et ne démissionne pas. Elle travaille pendant que vous dormez.",
  },
];

const steps = [
  {
    num: "01",
    title: "Connectez votre Gmail",
    text: "Donna se connecte à votre boîte mail en lecture seule via Google. Aucun mot de passe à partager.",
  },
  {
    num: "02",
    title: "Donna analyse votre cabinet",
    text: "En 5 minutes, Donna lit vos 30 derniers jours d'emails, crée vos dossiers clients et apprend votre style.",
  },
  {
    num: "03",
    title: "Consultez votre brief",
    text: "Chaque matin, ouvrez Donna et retrouvez vos emails résumés, vos dossiers à jour et vos brouillons prêts.",
  },
];

const securityPoints = [
  { icon: Shield, label: "Lecture seule" },
  { icon: Lock, label: "Données chiffrées" },
  { icon: BrainCog, label: "Aucun entraînement IA" },
  { icon: Trash2, label: "Suppression immédiate" },
];

const rotatingPhrases = [
  "ne dort jamais.",
  "trie vos mails.",
  "rédige vos réponses.",
  "classe vos dossiers.",
];

const Index = () => {
  const [form, setForm] = useState({ nom: "", email: "", cabinet: "", volume: "" });
  const [sent, setSent] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.email) {
      toast({ title: "Veuillez remplir au moins votre nom et email.", variant: "destructive" });
      return;
    }
    // Store in localStorage until a real backend is connected
    const submissions = JSON.parse(localStorage.getItem("donna_demo_requests") || "[]");
    submissions.push({ ...form, submittedAt: new Date().toISOString() });
    localStorage.setItem("donna_demo_requests", JSON.stringify(submissions));

    setSent(true);
    toast({ title: "Merci ! Nous vous recontactons sous 24h." });
  };

  const scrollToDemo = () => {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col" style={{ scrollBehavior: "smooth" }}>
        <PublicNavbar />

        {/* ───── SECTION 1 — HERO ───── */}
        <section className="bg-background">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            {/* Left text */}
            <div className="flex-1 max-w-xl">

              <h1
                className="text-3xl sm:text-4xl lg:text-[3.5rem] font-serif font-bold leading-[1.25] text-foreground mb-6"
              >
                Une employée qui
                <AnimatePresence mode="wait">
                  <motion.span
                    key={rotatingPhrases[phraseIndex]}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-primary block pt-2 sm:pt-3"
                  >
                    {rotatingPhrases[phraseIndex]}
                  </motion.span>
                </AnimatePresence>
              </h1>

              <p
                className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-md mb-10"
              >
                Tous vos emails du matin résumés, triés et prêts à répondre en 5&nbsp;minutes.
              </p>

              <div
                className="flex flex-col sm:flex-row items-start gap-4"
              >
                <Link to="/login">
                  <button className="bg-foreground text-background px-7 py-3.5 rounded-lg text-sm font-sans font-medium hover:opacity-90 hover:scale-105 transition-all duration-200 flex items-center gap-2">
                    Recruter Donna
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <button
                  onClick={scrollToDemo}
                  className="border border-border text-foreground px-7 py-3.5 rounded-lg text-sm font-sans font-medium hover:bg-muted hover:scale-105 transition-all duration-200"
                >
                  Demander une démo
                </button>
              </div>
            </div>

            {/* Right — Dashboard animé sans bordure */}
            <div className="flex-1 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative w-full"
              >
                <DashboardCinematic theme="light" chromeless={true} />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ───── SECTION — SÉCURITÉ (remonté après le hero) ───── */}
        <section className="bg-background">
          <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-20 md:py-28 text-center">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-12"
            >
              Conçue pour le secret professionnel
            </motion.h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
              className="flex flex-wrap justify-center gap-8 sm:gap-12 mb-10"
            >
              {securityPoints.map((pt) => (
                <div key={pt.label} className="flex items-center gap-3">
                  <pt.icon className="h-5 w-5 text-foreground" />
                  <span className="text-sm font-sans font-medium text-foreground">{pt.label}</span>
                </div>
              ))}
            </motion.div>

            <Link
              to="/securite"
              className="text-sm font-sans text-gray-600 hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              En savoir plus sur notre politique de sécurité
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* ───── SECTION 2 — LE BRIEF DU MATIN ───── */}
        <section style={{ backgroundColor: "#F9FAFB" }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20 md:py-28">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
                Chaque matin, Donna vous fait le brief
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-lg mx-auto">
                Comme une assistante qui aurait lu tous vos emails pendant la nuit.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {briefCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  custom={i}
                  variants={fadeUp}
                  className="bg-background rounded-2xl p-8 shadow-sm border border-border/50"
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-5">
                    <card.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="text-lg font-sans font-semibold text-foreground mb-3">{card.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{card.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ───── SECTION 3 — CE QUE DONNA FAIT (zigzag) ───── */}
        <section className="bg-background">
          <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-20 md:py-28">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="text-center mb-20"
            >
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
                Une employée qui ne dort jamais
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-lg mx-auto">
                Voici ce que Donna fait automatiquement, sans que vous ayez à lever le petit doigt.
              </p>
            </motion.div>

            <div className="space-y-16 md:space-y-20">
              {features.map((feat, i) => {
                const isEven = i % 2 === 0;
                return (
                  <motion.div
                    key={feat.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    custom={0}
                    variants={fadeUp}
                    className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-16`}
                  >
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <feat.icon className="h-8 w-8 text-foreground" />
                    </div>
                    <div className={`${isEven ? "md:text-left" : "md:text-right"} text-center`}>
                      <h3 className="text-xl font-sans font-semibold text-foreground mb-2">{feat.title}</h3>
                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-md">{feat.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ───── SECTION 4 — CHIFFRES ───── */}
        <section style={{ backgroundColor: "#111111" }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20 md:py-28">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-serif font-bold text-white text-center mb-16"
            >
              Le temps gagné, chaque jour
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              {[
                { big: "2h", sub: "gagnées par jour sur le traitement de vos emails" },
                { big: "30", sub: "emails traités automatiquement chaque matin" },
                { big: "1 clic", sub: "pour obtenir un brouillon de réponse professionnel" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.big}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                >
                  <p className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-white mb-3">{stat.big}</p>
                  <p className="text-sm sm:text-base" style={{ color: "#6B7280" }}>{stat.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ───── SECTION 5 — COMMENT ÇA MARCHE ───── */}
        <section className="bg-background">
          <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 py-20 md:py-28">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-serif font-bold text-foreground text-center mb-16"
            >
              Recruter Donna prend 5&nbsp;minutes
            </motion.h2>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden md:block" />

              <div className="space-y-14">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.num}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                    variants={fadeUp}
                    className="flex gap-8 items-start"
                  >
                    <span className="text-3xl sm:text-4xl font-serif font-bold shrink-0 w-12 text-center" style={{ color: "#ccc" }}>
                      {step.num}
                    </span>
                    <div>
                      <h3 className="text-lg font-sans font-semibold text-foreground mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{step.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ───── SECTION 6 — TÉMOIGNAGE ───── */}
        <section style={{ backgroundColor: "#F9FAFB" }}>
          <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 py-20 md:py-28 text-center">
            <motion.blockquote
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-xl sm:text-2xl lg:text-3xl font-serif italic leading-relaxed text-foreground mb-8"
            >
              "Donna a changé ma façon de travailler. Je ne perds plus de temps à trier mes emails, je me concentre sur mes dossiers."
            </motion.blockquote>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
              className="text-gray-600 text-sm font-sans"
            >
              Témoignage d'une avocate en droit des affaires, Paris. Nom partagé sur demande.
            </motion.p>
          </div>
        </section>

        {/* ───── SECTION 8 — CTA + FORMULAIRE DÉMO ───── */}
        <section id="demo" style={{ backgroundColor: "#111111" }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20 md:py-28 flex flex-col lg:flex-row gap-16 items-start">
            {/* Left */}
            <div className="flex-1 max-w-md">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-6">
                Prêt à recruter Donna&nbsp;?
              </h2>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: "#6B7280" }}>
                Laissez-nous vos coordonnées et nous vous recontactons sous 24h pour une démonstration personnalisée.
              </p>
            </div>

            {/* Right — form */}
            <div className="flex-1 w-full max-w-lg bg-background rounded-2xl p-8 shadow-lg">
              {sent ? (
                <div className="text-center py-8">
                  <p className="text-lg font-sans font-semibold text-foreground mb-2">Merci !</p>
                  <p className="text-muted-foreground text-sm">Nous vous recontactons sous 24h.</p>
                </div>
              ) : (
                <form onSubmit={handleDemo} method="POST" className="space-y-5">
                  <div>
                    <Label htmlFor="d-nom" className="text-foreground text-sm">Nom complet</Label>
                    <Input
                      id="d-nom"
                      name="nom"
                      required
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="d-email" className="text-foreground text-sm">Email professionnel</Label>
                    <Input
                      id="d-email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="d-cabinet" className="text-foreground text-sm">Nom du cabinet</Label>
                    <Input
                      id="d-cabinet"
                      name="cabinet"
                      value={form.cabinet}
                      onChange={(e) => setForm({ ...form, cabinet: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground text-sm">Emails reçus par jour</Label>
                    <Select name="emails_par_jour" value={form.volume} onValueChange={(v) => setForm({ ...form, volume: v })}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<20">Moins de 20</SelectItem>
                        <SelectItem value="20-50">20 – 50</SelectItem>
                        <SelectItem value="50-100">50 – 100</SelectItem>
                        <SelectItem value=">100">Plus de 100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-foreground text-background py-3.5 rounded-lg text-sm font-sans font-medium hover:opacity-90 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    Demander une démo
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="text-xs text-muted-foreground text-center">
                    Pas de carte bancaire requise. Pas d'engagement.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ───── SECTION 9 — FOOTER ───── */}
        <footer style={{ backgroundColor: "#111111", borderTop: "1px solid #222" }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="font-serif font-bold text-white text-sm">Donna</p>
              <p className="text-xs mt-1" style={{ color: "#6B7280" }}>Votre employée numérique juridique</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-sans" style={{ color: "#6B7280" }}>
              <Link to="/securite" className="hover:text-white transition-colors">Sécurité</Link>
              <Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
              <button onClick={scrollToDemo} className="hover:text-white transition-colors">Demander une démo</button>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-8">
            <p className="text-xs" style={{ color: "#4B5563" }}>© 2026 Donna-Legal.com · Votre employée numérique juridique</p>
          </div>
        </footer>

        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default Index;
