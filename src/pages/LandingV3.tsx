import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, X } from "lucide-react"
import DashboardCinematic from "@/components/cinematic/DashboardCinematic"

// ─── Harvey-exact color system ───
const INK = "#0F0E0D"
const IVORY = "#FAFAF9"
const GRAY_100 = "#F2F1F0"
const GRAY_300 = "#CCCAC6"
const GRAY_600 = "#706D66"
const GRAY_800 = "#33312C"
const GRAY_900 = "#1F1D1A"

const USE_CASES = [
  "Recherche juridique",
  "Gestion de dossiers",
  "Analyse de documents",
  "Rédaction de contrats",
  "Conformité RGPD",
  "Préparation d'audiences",
]

const QUOTES = [
  {
    text: "Donna m'a transformé ma pratique. Chaque matin, mon briefing est prêt avant que j'ouvre l'ordinateur. Je gagne facilement 2 heures par jour.",
    author: "Me Alexandra Fernandez",
    role: "Avocate en droit de la famille",
  },
  {
    text: "Ce qui m'a convaincu, c'est la confidentialité. Données en France, lecture seule, zéro entraînement IA. Exactement ce qu'exige le barreau.",
    author: "Me Karim Benzara",
    role: "Avocat en droit commercial",
  },
  {
    text: "En 5 minutes je sais tout ce qui compte. Les relances, les audiences, les pièces manquantes. Donna ne rate rien.",
    author: "Me Claire Moreau",
    role: "Avocate en droit immobilier",
  },
]

const STATS = [
  { value: "2h", label: "économisées par jour en moyenne" },
  { value: "5 min", label: "pour un briefing complet" },
  { value: "100%", label: "confidentialité des données" },
  { value: "0", label: "email urgent oublié" },
]

function UseCaseTicker() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % USE_CASES.length), 2600)
    return () => clearInterval(t)
  }, [])

  return (
    <section style={{ background: IVORY, color: INK, padding: "120px 40px 100px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Harvey-style layout: left label + right rotating word */}
        <div style={{ display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
          <p style={{ fontSize: "clamp(16px, 1.6vw, 20px)", color: GRAY_600, lineHeight: 1.5, fontWeight: 400, flexShrink: 0, maxWidth: 280 }}>
            Les meilleures équipes juridiques font confiance à Donna pour
          </p>
          <div style={{ flex: 1, minWidth: 280, overflow: "hidden", height: "clamp(52px, 7vw, 88px)", display: "flex", alignItems: "center" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -48 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 72px)", fontWeight: 400, color: INK, lineHeight: 1.05, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}
              >
                {USE_CASES[idx]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: GRAY_300, margin: "64px 0 56px" }} />

        {/* Sub-copy + CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <p style={{ fontSize: "clamp(14px, 1.4vw, 18px)", color: GRAY_600, maxWidth: 560, lineHeight: 1.7, margin: 0 }}>
            Donna lit vos emails, classe vos dossiers et prépare vos réponses chaque matin — en 5 minutes, vous savez tout ce qui compte.
          </p>
          <Link to="/demo" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 6, background: INK, color: IVORY, fontSize: 14, fontWeight: 500, textDecoration: "none", flexShrink: 0, letterSpacing: "0.01em" }}>
            Demander une démonstration <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function QuotesSection() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % QUOTES.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <section style={{ background: GRAY_100, color: INK, padding: "120px 40px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px, 2.4vw, 30px)", fontWeight: 400, lineHeight: 1.6, color: INK, marginBottom: 32, fontStyle: "italic" }}>
              "{QUOTES[idx].text}"
            </p>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: INK }}>{QUOTES[idx].author}</div>
              <div style={{ fontSize: 13, color: GRAY_600, marginTop: 2 }}>{QUOTES[idx].role}</div>
            </div>
          </motion.div>
        </AnimatePresence>
        {/* Dots */}
        <div style={{ display: "flex", gap: 8, marginTop: 40 }}>
          {QUOTES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{ width: 24, height: 3, borderRadius: 2, background: i === idx ? INK : GRAY_300, border: "none", cursor: "pointer", padding: 0, transition: "background 0.3s" }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function LandingV3() {
  const [bannerVisible, setBannerVisible] = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  // Dashboard zooms in slightly as user scrolls
  const dashScale = useTransform(scrollY, [0, 400], [0.92, 1.04])
  const dashOpacity = useTransform(scrollY, [0, 200], [0.7, 1])

  return (
    <div style={{ background: INK, color: IVORY, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ─── Announcement Banner (Harvey-style) ─── */}
      {bannerVisible && (
        <div style={{ background: GRAY_900, color: IVORY, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, position: "relative", zIndex: 100 }}>
          <span style={{ color: GRAY_300 }}>Donna est gratuite pendant le lancement —</span>
          <Link to="/demo" style={{ color: IVORY, fontWeight: 600, textDecoration: "none" }}>Rejoindre maintenant</Link>
          <button
            onClick={() => setBannerVisible(false)}
            style={{ position: "absolute", right: 16, background: "none", border: "none", color: GRAY_600, cursor: "pointer", padding: 4, display: "flex" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ─── Navigation (Harvey-exact) ─── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(15,14,13,0.92)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${GRAY_800}`, padding: "0 40px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: 22, color: IVORY, letterSpacing: "-0.02em" }}>Donna</span>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {["Plateforme", "Solutions", "Sécurité", "À propos"].map(item => (
              <Link key={item} to="/" style={{ color: GRAY_300, fontSize: 13, textDecoration: "none", fontWeight: 400, letterSpacing: "0.01em" }}>{item}</Link>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link to="/login" style={{ color: GRAY_300, fontSize: 13, textDecoration: "none", fontWeight: 400 }}>Connexion</Link>
            <Link to="/demo" style={{ padding: "9px 20px", borderRadius: 6, background: IVORY, color: INK, fontSize: 13, fontWeight: 500, textDecoration: "none", letterSpacing: "0.01em" }}>Demander une démo</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section (100vh, Harvey-dark) ─── */}
      <section ref={heroRef} style={{ background: INK, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "100px 40px 0", position: "relative", overflow: "hidden" }}>

        {/* Ambient glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", maxWidth: 840, position: "relative", zIndex: 1 }}
        >
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(42px, 6.5vw, 88px)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.03em", color: IVORY, marginBottom: 28 }}>
            La pratique juridique,<br />perfectionnée.
          </h1>
          <p style={{ fontSize: "clamp(15px, 1.6vw, 18px)", color: GRAY_300, maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7, fontWeight: 400 }}>
            Les meilleurs cabinets d'avocats font confiance à Donna pour élever leur pratique et naviguer la complexité.
          </p>
          <Link to="/demo" style={{ display: "inline-block", padding: "13px 28px", borderRadius: 6, background: IVORY, color: INK, fontSize: 14, fontWeight: 500, textDecoration: "none", letterSpacing: "0.01em" }}>
            Demander une démonstration
          </Link>
        </motion.div>

        {/* Dashboard — chromeless, zoom-in, no browser borders */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 80 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ scale: dashScale, opacity: dashOpacity, width: "100%", maxWidth: 1100, marginTop: 56, position: "relative", zIndex: 1 }}
        >
          {/* Bottom gradient fade */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 140, background: `linear-gradient(to bottom, transparent, ${INK})`, zIndex: 2, pointerEvents: "none" }} />
          <DashboardCinematic theme="dark" chromeless={true} className="" />
        </motion.div>
      </section>

      {/* ─── Use Case Ticker (ivory) ─── */}
      <UseCaseTicker />

      {/* ─── Product Detail (dark) ─── */}
      <section style={{ background: INK, padding: "120px 40px", borderTop: `1px solid ${GRAY_800}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            style={{ marginBottom: 80 }}
          >
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 3.5vw, 52px)", fontWeight: 400, letterSpacing: "-0.02em", color: IVORY, maxWidth: 680, lineHeight: 1.15 }}>
              Voyez Donna en action.
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9 }}
            style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,0.6)" }}
          >
            <DashboardCinematic theme="dark" chromeless={true} />
          </motion.div>
        </div>
      </section>

      {/* ─── Quotes (gray) ─── */}
      <QuotesSection />

      {/* ─── Stats (dark) ─── */}
      <section style={{ background: INK, padding: "120px 40px", borderTop: `1px solid ${GRAY_800}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 48 }}>
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 400, color: IVORY, lineHeight: 1, marginBottom: 12, letterSpacing: "-0.02em" }}>{s.value}</div>
                <div style={{ fontSize: 14, color: GRAY_600, lineHeight: 1.5 }}>{s.label}</div>
                <div style={{ height: 1, background: GRAY_800, marginTop: 24 }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Security/Trust (dark, Harvey PolicyLinkGrid style) ─── */}
      <section style={{ background: GRAY_900, padding: "100px 40px", borderTop: `1px solid ${GRAY_800}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 3vw, 44px)", fontWeight: 400, color: IVORY, marginBottom: 64, letterSpacing: "-0.02em" }}
          >
            Sécurité sans compromis.
          </motion.h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 1, background: GRAY_800 }}>
            {[
              { badge: "RGPD", title: "Conformité totale", desc: "Vos données ne quittent jamais la France. Chiffrées, supprimables à tout moment." },
              { badge: "Lecture seule", title: "Zéro risque d'envoi", desc: "Donna lit vos emails. Elle ne peut ni envoyer, ni supprimer, ni modifier." },
              { badge: "Hébergement FR", title: "Infrastructure souveraine", desc: "Serveurs en France, conformes aux exigences du barreau et de la profession." },
              { badge: "Zero IA training", title: "Vos données vous appartiennent", desc: "Vos emails ne sont jamais utilisés pour entraîner un modèle d'intelligence artificielle." },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                style={{ padding: "40px 32px", background: GRAY_900 }}
              >
                <div style={{ fontSize: 11, color: GRAY_600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>{s.badge}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: IVORY, marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: GRAY_600, lineHeight: 1.7 }}>{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA (dark) ─── */}
      <section style={{ background: INK, padding: "140px 40px", textAlign: "center", borderTop: `1px solid ${GRAY_800}` }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 4.5vw, 64px)", fontWeight: 400, color: IVORY, marginBottom: 20, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Prêt à recruter Donna ?
          </h2>
          <p style={{ fontSize: 16, color: GRAY_600, marginBottom: 36 }}>Gratuit pendant le lancement. Aucun engagement.</p>
          <Link to="/demo" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 6, background: IVORY, color: INK, fontSize: 14, fontWeight: 500, textDecoration: "none", letterSpacing: "0.01em" }}>
            Demander une démonstration
          </Link>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ background: INK, padding: "40px", borderTop: `1px solid ${GRAY_800}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: GRAY_600 }}>Donna</span>
          <div style={{ display: "flex", gap: 24 }}>
            <Link to="/securite" style={{ fontSize: 12, color: GRAY_600, textDecoration: "none" }}>Sécurité</Link>
            <Link to="/mentions-legales" style={{ fontSize: 12, color: GRAY_600, textDecoration: "none" }}>Mentions légales</Link>
            <a href="mailto:donna@donna-legal.com" style={{ fontSize: 12, color: GRAY_600, textDecoration: "none" }}>donna@donna-legal.com</a>
          </div>
          <p style={{ fontSize: 12, color: GRAY_800 }}>© 2026 Donna-Legal.com</p>
        </div>
      </footer>
    </div>
  )
}
