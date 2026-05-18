import { useEffect, useState } from "react"
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
import MarqueeIntegrations from "@/components/motion/MarqueeIntegrations"
import ScrollReveal from "@/components/motion/ScrollReveal"

const ROTATING_PHRASES = [
  "ne dort jamais.",
  "trie vos mails.",
  "rédige vos réponses.",
  "classe vos dossiers.",
  "surveille vos échéances.",
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
  const [phraseIdx, setPhraseIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setPhraseIdx((i) => (i + 1) % ROTATING_PHRASES.length), 3000)
    return () => clearInterval(t)
  }, [])

  return (
    <LenisProvider>
      <div
        style={{
          background: "#ffffff",
          color: "#0d0d0d",
          minHeight: "100vh",
          fontFamily: "Inter, system-ui, sans-serif",
          overflowX: "hidden",
        }}
      >
        {/* Nav */}
        <nav
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0,
            zIndex: 100,
            padding: "18px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "transparent",
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              mixBlendMode: "difference",
            }}
          >
            Donna
          </span>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <Link to="/produit" style={{ color: "#fff", fontSize: 13.5, textDecoration: "none", mixBlendMode: "difference" }}>Produit</Link>
            <Link to="/securite" style={{ color: "#fff", fontSize: 13.5, textDecoration: "none", mixBlendMode: "difference" }}>Sécurité</Link>
            <Link to="/tarifs" style={{ color: "#fff", fontSize: 13.5, textDecoration: "none", mixBlendMode: "difference" }}>Tarifs</Link>
            <Link
              to="/login"
              style={{
                padding: "10px 22px",
                borderRadius: 999,
                background: "#ffffff",
                color: "#0d0d0d",
                fontSize: 13.5,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "transform 200ms ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)" }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)" }}
            >
              Connexion <ArrowRight size={14} />
            </Link>
          </div>
        </nav>

        {/* HERO — full-bleed Ordalie-style */}
        <section
          style={{
            position: "relative",
            minHeight: "100vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            color: "#ffffff",
          }}
        >
          <div
            aria-hidden
            className="hero-bg"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url('/hero-bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              zIndex: 0,
              willChange: "transform",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, rgba(13,13,13,0.05) 0%, rgba(13,13,13,0.28) 70%, rgba(13,13,13,0.5) 100%)",
              zIndex: 1,
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "140px 24px 40px",
            }}
          >
            <ScrollReveal y={28}>
              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(44px, 7.5vw, 104px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.025em",
                  fontWeight: 700,
                  margin: "0 0 28px",
                  color: "#ffffff",
                  textShadow: "0 2px 30px rgba(13,13,13,0.22)",
                  maxWidth: 1100,
                }}
              >
                Une employée qui<br />
                <span
                  key={ROTATING_PHRASES[phraseIdx]}
                  style={{
                    display: "inline-block",
                    fontStyle: "italic",
                    color: "#ffffff",
                    animation: "phraseSlide 500ms ease-out",
                    background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(220,235,255,0.85) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {ROTATING_PHRASES[phraseIdx]}
                </span>
              </h1>
              <p
                style={{
                  fontSize: "clamp(15px, 1.4vw, 19px)",
                  color: "rgba(255,255,255,0.96)",
                  maxWidth: 580,
                  margin: "0 auto 40px",
                  lineHeight: 1.65,
                  textShadow: "0 1px 14px rgba(13,13,13,0.3)",
                }}
              >
                Tous vos emails du matin résumés, triés et prêts à répondre en 5 minutes.
              </p>
              <div style={{ display: "inline-flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
                <Link
                  to="/demo"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "16px 32px",
                    borderRadius: 999,
                    background: "#0d0d0d",
                    color: "#ffffff",
                    fontSize: 14.5,
                    fontWeight: 600,
                    textDecoration: "none",
                    boxShadow: "0 10px 36px rgba(13,13,13,0.35)",
                    transition: "transform 200ms ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)" }}
                >
                  Demander une démo <ArrowRight size={15} />
                </Link>
                <Link
                  to="/contact"
                  style={{
                    padding: "16px 32px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.92)",
                    color: "#0d0d0d",
                    fontSize: 14.5,
                    fontWeight: 500,
                    textDecoration: "none",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  Contactez-nous
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Hero bottom static logo strip */}
          <div style={{ position: "relative", zIndex: 2, padding: "0 24px 40px" }}>
            <div
              style={{
                maxWidth: 980,
                margin: "0 auto",
                display: "flex",
                gap: 48,
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                filter: "brightness(0) invert(1)",
                opacity: 0.9,
              }}
            >
              {["gmail", "outlook", "microsoft365", "onedrive", "googledrive", "googlecalendar"].map((slug) => (
                <img
                  key={slug}
                  src={`/logos/${slug}.svg`}
                  alt=""
                  style={{ height: 26, width: "auto" }}
                />
              ))}
            </div>
          </div>

          <style>{`
            .hero-bg { animation: heroKenBurns 22s ease-in-out infinite alternate; }
            @keyframes heroKenBurns {
              0%   { transform: scale(1) translate(0, 0); }
              100% { transform: scale(1.08) translate(-1%, -1.5%); }
            }
            @keyframes phraseSlide {
              0%   { opacity: 0; transform: translateY(8px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            @media (prefers-reduced-motion: reduce) {
              .hero-bg { animation: none; }
            }
          `}</style>
        </section>

        {/* SECTION — Connecté à votre écosystème (couleur, marquee animé) */}
        <section
          style={{
            padding: "96px 0 96px",
            background: "#ffffff",
          }}
        >
          <ScrollReveal>
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#737373",
                fontWeight: 500,
                marginBottom: 48,
              }}
            >
              Connecté à votre écosystème
            </p>
          </ScrollReveal>
          <MarqueeIntegrations />
        </section>

        {/* SECTION — Ce qu'elle fait (4 brief cards) */}
        <section style={{ padding: "120px 32px", background: "#fafafa" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <ScrollReveal>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(36px, 5vw, 64px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.028em",
                  fontWeight: 700,
                  maxWidth: 820,
                  margin: "0 0 72px",
                  color: "#0d0d0d",
                }}
              >
                Une employée numérique <em style={{ fontStyle: "italic", color: "#2563EB" }}>complète</em>.
              </h2>
            </ScrollReveal>

            <ScrollReveal stagger={0.1} y={40}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 24,
                }}
              >
                {BRIEF_CARDS.map((card) => {
                  const Icon = card.icon
                  return (
                    <article
                      key={card.title}
                      style={{
                        background: "#ffffff",
                        borderRadius: 20,
                        padding: "32px 28px",
                        border: "1px solid rgba(0,0,0,0.06)",
                        boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
                        transition: "transform 280ms ease, box-shadow 280ms ease",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)"
                        e.currentTarget.style.boxShadow = "0 18px 48px rgba(13,13,13,0.08)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)"
                        e.currentTarget.style.boxShadow = "0 1px 0 rgba(0,0,0,0.02)"
                      }}
                    >
                      <div
                        style={{
                          width: 44, height: 44,
                          borderRadius: 12,
                          background: "rgba(37,99,235,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 20,
                        }}
                      >
                        <Icon size={20} color="#2563EB" strokeWidth={2} />
                      </div>
                      <h3
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: 22,
                          lineHeight: 1.2,
                          letterSpacing: "-0.018em",
                          fontWeight: 700,
                          margin: "0 0 12px",
                          color: "#0d0d0d",
                        }}
                      >
                        {card.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 14.5,
                          lineHeight: 1.65,
                          color: "#525252",
                          margin: 0,
                        }}
                      >
                        {card.text}
                      </p>
                    </article>
                  )
                })}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* SECTION — Comment ça marche (3 steps) */}
        <section style={{ padding: "120px 32px", background: "#ffffff" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <ScrollReveal>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(36px, 5vw, 64px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.028em",
                  fontWeight: 700,
                  margin: "0 0 72px",
                  color: "#0d0d0d",
                }}
              >
                Trois minutes pour démarrer.
              </h2>
            </ScrollReveal>

            <ScrollReveal stagger={0.12} y={50}>
              {STEPS.map((step) => (
                <article
                  key={step.num}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(80px, 130px) 1fr minmax(0, 480px)",
                    gap: 56,
                    alignItems: "start",
                    padding: "48px 0",
                    borderTop: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 56,
                      lineHeight: 1,
                      color: "#0d0d0d",
                      fontWeight: 700,
                    }}
                  >
                    {step.num}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(24px, 2.6vw, 36px)",
                      lineHeight: 1.15,
                      letterSpacing: "-0.022em",
                      fontWeight: 700,
                      margin: 0,
                      color: "#0d0d0d",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 16,
                      lineHeight: 1.7,
                      color: "#525252",
                      margin: 0,
                    }}
                  >
                    {step.text}
                  </p>
                </article>
              ))}
            </ScrollReveal>
          </div>
        </section>

        {/* SECTION — Sécurité */}
        <section style={{ padding: "120px 32px", background: "#0d0d0d", color: "#fafafa" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
            <ScrollReveal>
              <p
                style={{
                  fontSize: 12,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 500,
                  marginBottom: 20,
                }}
              >
                Sécurité
              </p>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(36px, 5vw, 64px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.028em",
                  fontWeight: 700,
                  maxWidth: 820,
                  margin: "0 auto 64px",
                }}
              >
                Conçue pour le <em style={{ fontStyle: "italic", color: "#60a5fa" }}>secret professionnel</em>.
              </h2>
            </ScrollReveal>

            <ScrollReveal stagger={0.08} y={30}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 20,
                  marginBottom: 56,
                }}
              >
                {SECURITY.map((s) => {
                  const Icon = s.icon
                  return (
                    <div
                      key={s.label}
                      style={{
                        padding: "32px 24px",
                        borderRadius: 16,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <Icon size={24} color="#60a5fa" strokeWidth={1.6} />
                      <span style={{ fontSize: 15, fontWeight: 500 }}>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <Link
                to="/securite"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#fafafa",
                  fontSize: 14.5,
                  fontWeight: 500,
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.3)",
                  paddingBottom: 4,
                }}
              >
                Voir notre engagement complet <ArrowRight size={14} />
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ padding: "140px 32px", textAlign: "center", background: "#fafafa" }}>
          <ScrollReveal>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(40px, 6vw, 80px)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                fontWeight: 700,
                maxWidth: 900,
                margin: "0 auto 36px",
                color: "#0d0d0d",
              }}
            >
              Reprenez votre matin.
            </h2>
            <p
              style={{
                fontSize: 17,
                color: "#525252",
                maxWidth: 520,
                margin: "0 auto 44px",
                lineHeight: 1.6,
              }}
            >
              5 minutes pour configurer Donna. Un cabinet entier qui change.
            </p>
            <Link
              to="/demo"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "18px 36px",
                borderRadius: 999,
                background: "#0d0d0d",
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 14px 50px rgba(13,13,13,0.28)",
              }}
            >
              Demander une démo <ArrowRight size={16} />
            </Link>
          </ScrollReveal>
        </section>

        {/* FOOTER */}
        <footer
          style={{
            padding: "48px 32px",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18 }}>Donna</span>
          <div style={{ display: "flex", gap: 28, fontSize: 13, color: "#737373" }}>
            <Link to="/securite" style={{ color: "inherit", textDecoration: "none" }}>Sécurité</Link>
            <Link to="/tarifs" style={{ color: "inherit", textDecoration: "none" }}>Tarifs</Link>
            <Link to="/mentions-legales" style={{ color: "inherit", textDecoration: "none" }}>Mentions légales</Link>
            <Link to="/contact" style={{ color: "inherit", textDecoration: "none" }}>Contact</Link>
          </div>
        </footer>
      </div>
    </LenisProvider>
  )
}
