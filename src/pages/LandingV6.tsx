import { Link } from "react-router-dom"
import {
  ArrowRight,
  Mail,
  FileText,
  PenLine,
  Calendar,
  Shield,
  Lock,
  BrainCog,
  Trash2,
} from "lucide-react"
import LenisProvider from "@/components/motion/LenisProvider"
import ScrollReveal from "@/components/motion/ScrollReveal"

const HERO_LOGOS = [
  { src: "/logos/gmail.svg", alt: "Gmail" },
  { src: "/logos/outlook.svg", alt: "Outlook" },
  { src: "/logos/microsoft365.svg", alt: "Microsoft 365" },
  { src: "/logos/onedrive.svg", alt: "OneDrive" },
  { src: "/logos/googledrive.svg", alt: "Google Drive" },
  { src: "/logos/googlecalendar.svg", alt: "Google Calendar" },
  { src: "/logos/microsoftteams.svg", alt: "Microsoft Teams" },
  { src: "/logos/microsoftword.svg", alt: "Microsoft Word" },
]

const BRIEF_CARDS = [
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
  {
    icon: Calendar,
    title: "Elle surveille vos échéances",
    text: "Donna extrait chaque date critique de vos emails et pièces jointes : audiences, forclusions, délais d'appel. Tout est placé sur votre calendrier Google ou Outlook.",
  },
]

const STEPS = [
  {
    num: "01",
    title: "Connectez votre boîte mail",
    text: "Donna se connecte à votre boîte mail en lecture seule via Google ou Microsoft. Aucun mot de passe à partager.",
  },
  {
    num: "02",
    title: "Donna analyse vos mails",
    text: "En 5 minutes, Donna lit vos 30 derniers jours d'emails, crée vos dossiers clients et apprend votre style.",
  },
  {
    num: "03",
    title: "Consultez votre brief",
    text: "Chaque matin, ouvrez Donna et retrouvez vos emails résumés, vos dossiers à jour et vos brouillons prêts.",
  },
]

const SECURITY = [
  { icon: Shield, label: "Lecture seule" },
  { icon: Lock, label: "Données chiffrées" },
  { icon: BrainCog, label: "Aucun entraînement IA" },
  { icon: Trash2, label: "Suppression immédiate" },
]

export default function LandingV6() {
  const heroLogosTrack = [...HERO_LOGOS, ...HERO_LOGOS, ...HERO_LOGOS]

  return (
    <LenisProvider>
      <div className="lv6-root">
        {/* Nav */}
        <nav className="lv6-nav">
          <span className="lv6-brand">Donna</span>
          <div className="lv6-nav-links">
            <Link to="/produit">Produit</Link>
            <Link to="/securite">Sécurité</Link>
            <Link to="/tarifs">Tarifs</Link>
            <Link to="/login" className="lv6-nav-cta">
              Connexion <ArrowRight size={14} />
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="lv6-hero">
          <div aria-hidden className="lv6-hero-bg" />
          <div aria-hidden className="lv6-hero-overlay" />

          <div className="lv6-hero-content">
            <ScrollReveal y={28}>
              <h1 className="lv6-hero-h1">
                Donna<span className="lv6-hero-h1-dot">.</span>
              </h1>
              <p className="lv6-hero-tagline">
                Vous perdez <strong>2 heures chaque matin</strong> à lire, trier et comprendre vos
                emails. Donna le fait pour vous pendant que vous dormez.
              </p>
              <div className="lv6-hero-ctas">
                <Link to="/demo" className="lv6-cta-primary">
                  Demander une démo <ArrowRight size={15} />
                </Link>
                <Link to="/contact" className="lv6-cta-secondary">
                  Contactez-nous
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Hero bottom — defiling logos integrated */}
          <div className="lv6-hero-marquee">
            <div className="lv6-hero-marquee-mask">
              <div className="lv6-hero-marquee-track">
                {heroLogosTrack.map((logo, i) => (
                  <div key={i} className="lv6-hero-marquee-item">
                    <img src={logo.src} alt={logo.alt} loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION — Une employée numérique complète (4 brief cards) */}
        <section className="lv6-section lv6-section-light">
          <div className="lv6-container">
            <ScrollReveal>
              <h2 className="lv6-h2">
                Une employée numérique{" "}
                <em className="lv6-h2-em">complète</em>.
              </h2>
            </ScrollReveal>

            <ScrollReveal stagger={0.1} y={40}>
              <div className="lv6-cards-grid">
                {BRIEF_CARDS.map((card) => {
                  const Icon = card.icon
                  return (
                    <article key={card.title} className="lv6-card">
                      <div className="lv6-card-icon">
                        <Icon size={20} color="#2563EB" strokeWidth={2} />
                      </div>
                      <h3 className="lv6-card-title">{card.title}</h3>
                      <p className="lv6-card-text">{card.text}</p>
                    </article>
                  )
                })}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* SECTION — Trois minutes pour démarrer */}
        <section className="lv6-section lv6-section-white">
          <div className="lv6-container">
            <ScrollReveal>
              <h2 className="lv6-h2">Trois minutes pour démarrer.</h2>
            </ScrollReveal>

            <ScrollReveal stagger={0.12} y={50}>
              {STEPS.map((step) => (
                <article key={step.num} className="lv6-step">
                  <div className="lv6-step-num">{step.num}</div>
                  <h3 className="lv6-step-title">{step.title}</h3>
                  <p className="lv6-step-text">{step.text}</p>
                </article>
              ))}
            </ScrollReveal>
          </div>
        </section>

        {/* SECTION — Sécurité */}
        <section className="lv6-section lv6-section-dark">
          <div className="lv6-container lv6-security-container">
            <ScrollReveal>
              <p className="lv6-eyebrow">Sécurité</p>
              <h2 className="lv6-h2 lv6-h2-light">
                Conçue pour le{" "}
                <em className="lv6-h2-em-light">secret professionnel</em>.
              </h2>
            </ScrollReveal>

            <ScrollReveal stagger={0.08} y={30}>
              <div className="lv6-security-grid">
                {SECURITY.map((s) => {
                  const Icon = s.icon
                  return (
                    <div key={s.label} className="lv6-security-card">
                      <Icon size={24} color="#60a5fa" strokeWidth={1.6} />
                      <span>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <Link to="/securite" className="lv6-security-link">
                Voir notre engagement complet <ArrowRight size={14} />
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* FINAL CTA — axé douleur */}
        <section className="lv6-section lv6-final-cta">
          <ScrollReveal>
            <h2 className="lv6-final-h2">
              Récupérez vos 2 heures<br />
              du matin<span className="lv6-final-h2-dot">.</span>
            </h2>
            <p className="lv6-final-tagline">
              Pendant que la boîte mail se remplit, Donna prend le relais. Vous arrivez au bureau,
              tout est déjà trié, classé, prêt à signer.
            </p>
            <Link to="/demo" className="lv6-cta-primary lv6-cta-final">
              Demander une démo <ArrowRight size={16} />
            </Link>
          </ScrollReveal>
        </section>

        {/* FOOTER */}
        <footer className="lv6-footer">
          <span className="lv6-brand-foot">Donna</span>
          <div className="lv6-footer-links">
            <Link to="/securite">Sécurité</Link>
            <Link to="/tarifs">Tarifs</Link>
            <Link to="/mentions-legales">Mentions légales</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </footer>
      </div>

      <style>{`
        .lv6-root {
          background: #ffffff;
          color: #0d0d0d;
          min-height: 100vh;
          font-family: Inter, system-ui, sans-serif;
          overflow-x: hidden;
        }

        /* NAV */
        .lv6-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 18px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
        }
        .lv6-brand {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 22px;
          letter-spacing: -0.02em;
          color: #ffffff;
          mix-blend-mode: difference;
        }
        .lv6-nav-links {
          display: flex;
          gap: 28px;
          align-items: center;
        }
        .lv6-nav-links a {
          color: #ffffff;
          font-size: 13.5px;
          text-decoration: none;
          mix-blend-mode: difference;
        }
        .lv6-nav-cta {
          padding: 10px 22px;
          border-radius: 999px;
          background: #ffffff !important;
          color: #0d0d0d !important;
          font-weight: 600;
          mix-blend-mode: normal !important;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: transform 200ms ease;
        }
        .lv6-nav-cta:hover { transform: translateY(-1px); }

        /* HERO */
        .lv6-hero {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          color: #ffffff;
        }
        .lv6-hero-bg {
          position: absolute; inset: 0;
          background-image: url('/hero-bg.jpg');
          background-size: cover;
          background-position: center;
          z-index: 0;
          will-change: transform;
          animation: heroKenBurns 22s ease-in-out infinite alternate;
        }
        @keyframes heroKenBurns {
          0%   { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.08) translate(-1%, -1.5%); }
        }
        .lv6-hero-overlay {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at center, rgba(13,13,13,0.32) 0%, rgba(13,13,13,0.52) 70%, rgba(13,13,13,0.65) 100%);
          z-index: 1;
        }
        @media (max-width: 760px) {
          .lv6-hero-overlay {
            background:
              linear-gradient(180deg, rgba(13,13,13,0.42) 0%, rgba(13,13,13,0.55) 50%, rgba(13,13,13,0.62) 100%);
          }
        }
        .lv6-hero-content {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 140px 24px 40px;
        }
        .lv6-hero-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(72px, 14vw, 200px);
          line-height: 0.95;
          letter-spacing: -0.04em;
          font-weight: 700;
          margin: 0 0 32px;
          color: #ffffff;
          text-shadow: 0 2px 30px rgba(13,13,13,0.22);
        }
        .lv6-hero-h1-dot { color: rgba(255,255,255,0.62); }
        .lv6-hero-tagline {
          font-size: clamp(16px, 1.5vw, 21px);
          color: rgba(255,255,255,0.96);
          max-width: 640px;
          margin: 0 auto 36px;
          line-height: 1.6;
          text-shadow: 0 1px 14px rgba(13,13,13,0.3);
        }
        .lv6-hero-tagline strong {
          font-weight: 600;
          color: #ffffff;
          background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(220,235,255,1) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .lv6-hero-ctas {
          display: inline-flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .lv6-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 32px;
          border-radius: 999px;
          background: #0d0d0d;
          color: #ffffff;
          font-size: 14.5px;
          font-weight: 600;
          text-decoration: none;
          box-shadow: 0 10px 36px rgba(13,13,13,0.35);
          transition: transform 200ms ease;
        }
        .lv6-cta-primary:hover { transform: translateY(-2px); }
        .lv6-cta-secondary {
          padding: 16px 32px;
          border-radius: 999px;
          background: rgba(255,255,255,0.92);
          color: #0d0d0d;
          font-size: 14.5px;
          font-weight: 500;
          text-decoration: none;
          backdrop-filter: blur(8px);
        }

        /* HERO marquee (integrated) */
        .lv6-hero-marquee {
          position: relative;
          z-index: 2;
          padding: 0 0 36px;
        }
        .lv6-hero-marquee-mask {
          width: 100%;
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%);
        }
        .lv6-hero-marquee-track {
          display: flex;
          gap: 72px;
          width: max-content;
          animation: marquee 38s linear infinite;
          align-items: center;
        }
        .lv6-hero-marquee-item {
          flex-shrink: 0;
          height: 32px;
          display: flex;
          align-items: center;
        }
        .lv6-hero-marquee-item img {
          height: 100%;
          width: auto;
          object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.85;
          transition: opacity 220ms ease;
        }
        .lv6-hero-marquee-item:hover img { opacity: 1; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .lv6-hero-bg, .lv6-hero-marquee-track { animation: none; }
        }

        /* Sections */
        .lv6-section { padding: 120px 32px; }
        .lv6-section-light { background: #fafafa; }
        .lv6-section-white { background: #ffffff; }
        .lv6-section-dark { background: #0d0d0d; color: #fafafa; }
        .lv6-container { max-width: 1200px; margin: 0 auto; }
        .lv6-security-container { text-align: center; }

        .lv6-h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(34px, 5vw, 64px);
          line-height: 1.05;
          letter-spacing: -0.028em;
          font-weight: 700;
          max-width: 820px;
          margin: 0 0 72px;
          color: #0d0d0d;
        }
        .lv6-h2-light { color: #ffffff; margin: 0 auto 64px; }
        .lv6-h2-em { font-style: italic; color: #2563EB; }
        .lv6-h2-em-light { font-style: italic; color: #60a5fa; }

        .lv6-eyebrow {
          font-size: 12px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          font-weight: 500;
          margin: 0 0 20px;
        }

        /* Cards grid */
        .lv6-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }
        .lv6-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 32px 28px;
          border: 1px solid rgba(0,0,0,0.06);
          transition: transform 280ms ease, box-shadow 280ms ease;
        }
        .lv6-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 48px rgba(13,13,13,0.08);
        }
        .lv6-card-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: rgba(37,99,235,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .lv6-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          line-height: 1.2;
          letter-spacing: -0.018em;
          font-weight: 700;
          margin: 0 0 12px;
          color: #0d0d0d;
        }
        .lv6-card-text {
          font-size: 14.5px;
          line-height: 1.65;
          color: #525252;
          margin: 0;
        }

        /* Steps */
        .lv6-step {
          display: grid;
          grid-template-columns: minmax(80px, 130px) 1fr minmax(0, 480px);
          gap: 56px;
          align-items: start;
          padding: 48px 0;
          border-top: 1px solid rgba(0,0,0,0.08);
        }
        .lv6-step-num {
          font-family: 'Playfair Display', serif;
          font-size: 56px;
          line-height: 1;
          color: #0d0d0d;
          font-weight: 700;
        }
        .lv6-step-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 2.6vw, 36px);
          line-height: 1.15;
          letter-spacing: -0.022em;
          font-weight: 700;
          margin: 0;
          color: #0d0d0d;
        }
        .lv6-step-text {
          font-size: 16px;
          line-height: 1.7;
          color: #525252;
          margin: 0;
        }

        /* Security */
        .lv6-security-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 56px;
        }
        .lv6-security-card {
          padding: 32px 24px;
          border-radius: 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .lv6-security-card span {
          font-size: 15px;
          font-weight: 500;
        }
        .lv6-security-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #fafafa;
          font-size: 14.5px;
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.3);
          padding-bottom: 4px;
        }

        /* Final CTA */
        .lv6-final-cta {
          padding: 140px 32px;
          text-align: center;
          background: #fafafa;
        }
        .lv6-final-h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(40px, 7vw, 96px);
          line-height: 1;
          letter-spacing: -0.035em;
          font-weight: 700;
          max-width: 900px;
          margin: 0 auto 32px;
          color: #0d0d0d;
        }
        .lv6-final-h2-dot { color: #2563EB; }
        .lv6-final-tagline {
          font-size: clamp(15px, 1.4vw, 18px);
          color: #525252;
          max-width: 560px;
          margin: 0 auto 44px;
          line-height: 1.65;
        }
        .lv6-cta-final {
          padding: 18px 36px;
          font-size: 15px;
          box-shadow: 0 14px 50px rgba(13,13,13,0.28);
        }

        /* Footer */
        .lv6-footer {
          padding: 48px 32px;
          border-top: 1px solid rgba(0,0,0,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          background: #ffffff;
        }
        .lv6-brand-foot {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 18px;
        }
        .lv6-footer-links {
          display: flex;
          gap: 28px;
          font-size: 13px;
          color: #737373;
        }
        .lv6-footer-links a {
          color: inherit;
          text-decoration: none;
        }

        /* ---------- RESPONSIVE MOBILE ---------- */
        @media (max-width: 760px) {
          .lv6-nav { padding: 14px 18px; }
          .lv6-nav-links { gap: 14px; }
          .lv6-nav-links a:not(.lv6-nav-cta) { display: none; }
          .lv6-nav-cta { padding: 8px 16px; font-size: 13px; }

          .lv6-hero-content { padding: 110px 20px 24px; }
          .lv6-hero-h1 { font-size: clamp(60px, 22vw, 100px); margin-bottom: 22px; }
          .lv6-hero-tagline { font-size: 15px; line-height: 1.55; margin-bottom: 28px; }
          .lv6-hero-ctas { width: 100%; flex-direction: column; gap: 10px; }
          .lv6-cta-primary, .lv6-cta-secondary { width: 100%; justify-content: center; padding: 15px 24px; }

          .lv6-hero-marquee { padding-bottom: 28px; }
          .lv6-hero-marquee-track { gap: 48px; animation-duration: 32s; }
          .lv6-hero-marquee-item { height: 26px; }

          .lv6-section { padding: 80px 20px; }
          .lv6-h2 { font-size: clamp(28px, 8vw, 44px); margin-bottom: 48px; }
          .lv6-cards-grid { grid-template-columns: 1fr; gap: 16px; }
          .lv6-card { padding: 26px 22px; }

          .lv6-step {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 32px 0;
          }
          .lv6-step-num { font-size: 38px; }
          .lv6-step-title { font-size: 24px; }
          .lv6-step-text { font-size: 15px; }

          .lv6-security-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .lv6-security-card { padding: 22px 16px; }

          .lv6-final-cta { padding: 80px 20px; }
          .lv6-final-h2 { font-size: clamp(34px, 10vw, 56px); }
          .lv6-final-tagline { font-size: 15px; }

          .lv6-footer { flex-direction: column; gap: 18px; padding: 36px 20px; text-align: center; }
          .lv6-footer-links { flex-wrap: wrap; justify-content: center; gap: 18px; }
        }
      `}</style>
    </LenisProvider>
  )
}
