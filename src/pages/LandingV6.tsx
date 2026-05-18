import { Link } from "react-router-dom"
import { ArrowRight, Shield, Lock, Server, FileCheck, Mail, FolderOpen, Sparkles } from "lucide-react"
import LenisProvider from "@/components/motion/LenisProvider"
import MarqueeIntegrations from "@/components/motion/MarqueeIntegrations"
import ScrollReveal from "@/components/motion/ScrollReveal"

const FEATURES = [
  {
    n: "01",
    icon: Mail,
    title: "Vos emails, lus et compris.",
    body: "Donna lit chaque matin votre boîte. Elle distingue l'urgent du bruit, identifie les pièces qui exigent une réponse, prépare un brief de 5 minutes.",
  },
  {
    n: "02",
    icon: FolderOpen,
    title: "Vos dossiers, classés tout seuls.",
    body: "Chaque email atterrit dans le bon dossier client. Conclusions, ordonnances, échanges contradictoire — tout est rangé sans que vous y pensiez.",
  },
  {
    n: "03",
    icon: Sparkles,
    title: "Vos réponses, déjà rédigées.",
    body: "Donna prépare le projet de réponse dans votre style, citations jurisprudentielles à l'appui. Vous validez. Vous envoyez.",
  },
]

const SECURITY = [
  { icon: Shield, label: "Conforme RGPD" },
  { icon: Server, label: "Hébergement France" },
  { icon: Lock, label: "Chiffrement bout en bout" },
  { icon: FileCheck, label: "Zéro entraînement IA" },
]

export default function LandingV6() {
  return (
    <LenisProvider>
      <div style={{
        background: "#ffffff",
        color: "#0d0d0d",
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, sans-serif",
        overflowX: "hidden",
      }}>

        {/* Nav */}
        <nav style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          padding: "18px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "transparent",
        }}>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            mixBlendMode: "difference",
          }}>Donna</span>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <Link to="/produit" style={{ color: "#ffffff", fontSize: 13.5, textDecoration: "none", mixBlendMode: "difference" }}>Produit</Link>
            <Link to="/securite" style={{ color: "#ffffff", fontSize: 13.5, textDecoration: "none", mixBlendMode: "difference" }}>Sécurité</Link>
            <Link to="/tarifs" style={{ color: "#ffffff", fontSize: 13.5, textDecoration: "none", mixBlendMode: "difference" }}>Tarifs</Link>
            <Link to="/demo" style={{
              padding: "10px 22px",
              borderRadius: 999,
              background: "#ffffff",
              color: "#0d0d0d",
              fontSize: 13.5,
              fontWeight: 600,
              textDecoration: "none",
              transition: "transform 200ms ease",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)" }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)" }}
            >Connexion <ArrowRight size={14} /></Link>
          </div>
        </nav>

        {/* Hero — full-bleed background + centered copy (Ordalie pattern) */}
        <section
          className="hero-section"
          style={{
            position: "relative",
            minHeight: "100vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            color: "#ffffff",
          }}
        >
          {/* Background image cover with subtle ken-burns */}
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
          {/* Subtle overlay for text legibility */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, rgba(13,13,13,0.0) 0%, rgba(13,13,13,0.25) 70%, rgba(13,13,13,0.45) 100%)",
              zIndex: 1,
            }}
          />

          {/* Hero content centered */}
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
                  fontSize: "clamp(72px, 14vw, 192px)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.04em",
                  fontWeight: 400,
                  margin: "0 0 36px",
                  color: "#ffffff",
                  textShadow: "0 2px 30px rgba(13,13,13,0.18)",
                }}
              >
                Donna<span style={{ color: "rgba(255,255,255,0.62)" }}>.</span>
              </h1>
              <p
                style={{
                  fontSize: "clamp(15px, 1.4vw, 19px)",
                  color: "rgba(255,255,255,0.94)",
                  maxWidth: 620,
                  margin: "0 auto 40px",
                  lineHeight: 1.65,
                  textShadow: "0 1px 14px rgba(13,13,13,0.25)",
                }}
              >
                Accédez à des réponses juridiques fiables en un instant. Donna lit vos emails,
                classe vos dossiers et prépare vos réponses chaque matin.
              </p>
              <div style={{ display: "inline-flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
                <Link
                  to="/demo"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "15px 30px",
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
                  Essayez Donna <ArrowRight size={15} />
                </Link>
                <Link
                  to="/contact"
                  style={{
                    padding: "15px 30px",
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

          {/* Bottom logo strip (Ordalie pattern) */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              padding: "0 24px 40px",
            }}
          >
            <div
              style={{
                maxWidth: 1100,
                margin: "0 auto",
                display: "flex",
                gap: 56,
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                opacity: 0.95,
                filter: "brightness(0) invert(1)",
              }}
            >
              {["gmail", "outlook", "microsoft365", "onedrive", "googledrive", "googlecalendar"].map((slug) => (
                <img
                  key={slug}
                  src={`/logos/${slug}.svg`}
                  alt=""
                  style={{ height: 28, width: "auto", opacity: 0.92 }}
                />
              ))}
            </div>
          </div>

          <style>{`
            .hero-bg {
              animation: heroKenBurns 22s ease-in-out infinite alternate;
            }
            @keyframes heroKenBurns {
              0% { transform: scale(1) translate(0, 0); }
              100% { transform: scale(1.08) translate(-1%, -1.5%); }
            }
            @media (prefers-reduced-motion: reduce) {
              .hero-bg { animation: none; }
            }
          `}</style>
        </section>

        {/* Marquee integrations */}
        <section style={{
          padding: "72px 0 96px",
          borderTop: "1px solid rgba(0,0,0,0.05)",
          background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
        }}>
          <ScrollReveal>
            <p style={{
              textAlign: "center",
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#737373",
              fontWeight: 500,
              marginBottom: 44,
            }}>
              Connecté à votre écosystème
            </p>
          </ScrollReveal>
          <MarqueeIntegrations />
        </section>

        {/* Features */}
        <section style={{ padding: "120px 32px", maxWidth: 1200, margin: "0 auto" }}>
          <ScrollReveal>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(36px, 5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.028em",
              fontWeight: 700,
              maxWidth: 780,
              margin: "0 0 88px",
              color: "#0d0d0d",
            }}>
              Trois gestes que vous ne ferez plus jamais.
            </h2>
          </ScrollReveal>

          <ScrollReveal stagger={0.12} y={50}>
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <article key={f.n} style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(80px, 120px) 1fr minmax(0, 460px)",
                  gap: 48,
                  alignItems: "start",
                  padding: "44px 0",
                  borderTop: "1px solid rgba(0,0,0,0.08)",
                }}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 56,
                    lineHeight: 1,
                    color: "#0d0d0d",
                    fontWeight: 700,
                  }}>{f.n}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{
                      width: 44, height: 44,
                      borderRadius: 12,
                      background: "rgba(37,99,235,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Icon size={20} color="#2563EB" strokeWidth={2} />
                    </div>
                    <h3 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(24px, 2.6vw, 34px)",
                      lineHeight: 1.15,
                      letterSpacing: "-0.022em",
                      fontWeight: 700,
                      margin: 0,
                      color: "#0d0d0d",
                    }}>{f.title}</h3>
                  </div>
                  <p style={{
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: "#525252",
                    margin: 0,
                  }}>{f.body}</p>
                </article>
              )
            })}
          </ScrollReveal>
        </section>

        {/* Security */}
        <section style={{
          padding: "120px 32px",
          background: "#0d0d0d",
          color: "#fafafa",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <ScrollReveal>
              <p style={{
                fontSize: 12,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
                fontWeight: 500,
                marginBottom: 24,
              }}>
                Sécurité
              </p>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(36px, 5vw, 64px)",
                lineHeight: 1.05,
                letterSpacing: "-0.028em",
                fontWeight: 700,
                maxWidth: 780,
                margin: "0 0 72px",
              }}>
                Vos données ne quittent <em style={{ fontStyle: "italic", color: "#60a5fa" }}>jamais</em> la France.
              </h2>
            </ScrollReveal>

            <ScrollReveal stagger={0.08} y={30}>
              {/* grid wrapper must be a flex/grid for stagger to look right */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 24,
                marginBottom: 64,
              }}>
                {SECURITY.map((s) => {
                  const Icon = s.icon
                  return (
                    <div key={s.label} style={{
                      padding: "28px 24px",
                      borderRadius: 16,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}>
                      <Icon size={22} color="#60a5fa" strokeWidth={1.6} />
                      <span style={{ fontSize: 15, fontWeight: 500 }}>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <Link to="/securite" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#fafafa",
                fontSize: 14.5,
                fontWeight: 500,
                textDecoration: "none",
                borderBottom: "1px solid rgba(255,255,255,0.3)",
                paddingBottom: 4,
              }}>
                Voir notre engagement complet <ArrowRight size={14} />
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{
          padding: "140px 32px",
          textAlign: "center",
          background: "#fafafa",
        }}>
          <ScrollReveal>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(40px, 6vw, 84px)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
              fontWeight: 700,
              maxWidth: 900,
              margin: "0 auto 40px",
              color: "#0d0d0d",
            }}>
              Reprenez votre matin.
            </h2>
            <Link to="/demo" style={{
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
            }}>
              Voir la démo <ArrowRight size={16} />
            </Link>
          </ScrollReveal>
        </section>

        {/* Footer */}
        <footer style={{
          padding: "48px 32px",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18 }}>Donna</span>
          <div style={{ display: "flex", gap: 28, fontSize: 13, color: "#737373" }}>
            <Link to="/securite" style={{ color: "inherit", textDecoration: "none" }}>Sécurité</Link>
            <Link to="/mentions-legales" style={{ color: "inherit", textDecoration: "none" }}>Mentions légales</Link>
            <Link to="/contact" style={{ color: "inherit", textDecoration: "none" }}>Contact</Link>
          </div>
        </footer>
      </div>
    </LenisProvider>
  )
}
