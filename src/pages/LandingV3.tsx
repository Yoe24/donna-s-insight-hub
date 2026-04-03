import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Shield, Lock, Server, Eye } from "lucide-react"
import DashboardCinematic from "@/components/cinematic/DashboardCinematic"

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.6 } }

const USE_CASES = [
  "Rédaction de contrats",
  "Analyse de documents",
  "Recherche jurisprudence",
  "Gestion des dossiers",
  "Conformité RGPD",
  "Briefings du matin",
]

function HarveySlotMachine() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % USE_CASES.length), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <section style={{ padding: "120px 32px 100px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 40, alignItems: "center" }}>
        {/* Left label */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} style={{ maxWidth: 240 }}>
          <p style={{ fontSize: "clamp(14px, 1.8vw, 18px)", color: "#6B7280", lineHeight: 1.6, fontWeight: 400 }}>
            Les équipes juridiques<br />d'élite utilisent Donna pour
          </p>
        </motion.div>

        {/* Slot machine */}
        <div style={{ overflow: "hidden", height: "clamp(60px, 8vw, 96px)", display: "flex", alignItems: "center" }}>
          <AnimatePresence mode="wait">
            <motion.h1
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 68px)", fontWeight: 700, lineHeight: 1.1, color: "#111827", letterSpacing: "-0.03em", whiteSpace: "nowrap" }}
            >
              {USE_CASES[idx]}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Right CTA */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
          <Link to="/demo" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 8, border: "1px solid #D1D5DB", color: "#374151", fontSize: 13, fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}>
            Explorer la plateforme <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>

      {/* Separator */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #E5E7EB, transparent)", margin: "40px 0" }} />

      {/* Sub-headline + CTA */}
      <motion.div {...fadeUp} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <p style={{ fontSize: 16, color: "#6B7280", maxWidth: 480, lineHeight: 1.75, margin: 0 }}>
          Donna lit vos emails, classe vos dossiers et prepare vos reponses. En 5 minutes chaque matin, vous savez tout ce qui compte.
        </p>
        <Link to="/demo" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 8, background: "#2563EB", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(37,99,235,0.35)", flexShrink: 0 }}>
          Essayer gratuitement <ArrowRight size={15} />
        </Link>
      </motion.div>
    </section>
  )
}

export default function LandingV3() {
  return (
    <div style={{ background: "#FFFFFF", color: "#111827", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(16px)", borderBottom: "1px solid #E5E7EB", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, color: "#111827", letterSpacing: "-0.3px" }}>Donna</span>
        <Link to="/demo" style={{ padding: "9px 22px", borderRadius: 8, background: "#2563EB", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" }}>Essayer Donna</Link>
      </nav>

      {/* Harvey slot machine hero */}
      <HarveySlotMachine />

      {/* Dashboard Cinematic */}
      <section style={{ padding: "0 32px 96px", maxWidth: 900, margin: "0 auto" }}>
        <motion.div {...fadeUp} style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)" }}>
          <DashboardCinematic theme="light" />
        </motion.div>
      </section>

      {/* Before / After */}
      <section style={{ padding: "96px 32px", background: "#F9FAFB", borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <motion.h2 {...fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, textAlign: "center", marginBottom: 48, letterSpacing: "-0.02em" }}>
            Avant et apres Donna
          </motion.h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            <motion.div {...fadeUp} style={{ padding: 32, borderRadius: 16, background: "#FEF2F2", border: "1px solid #FECACA" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#DC2626", marginBottom: 18, letterSpacing: "0.02em" }}>Sans Donna</div>
              {["45 min a trier vos emails", "Des relances oubliees", "Des pieces manquantes non detectees", "Du stress des le matin"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#7F1D1D", marginBottom: 10 }}>
                  <span style={{ color: "#DC2626", fontWeight: 700 }}>✕</span> {t}
                </div>
              ))}
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.1, duration: 0.6 }} style={{ padding: 32, borderRadius: 16, background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1D4ED8", marginBottom: 18, letterSpacing: "0.02em" }}>Avec Donna</div>
              {["5 min pour tout savoir", "Relances automatiquement detectees", "Chaque piece jointe classee", "Un briefing clair et serein"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#1E3A8A", marginBottom: 10 }}>
                  <span style={{ color: "#2563EB", fontWeight: 700 }}>✓</span> {t}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "96px 32px", maxWidth: 700, margin: "0 auto" }}>
        <motion.h2 {...fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, textAlign: "center", marginBottom: 56, letterSpacing: "-0.02em" }}>Comment ca marche</motion.h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { n: "1", title: "Connectez Gmail", desc: "Un clic, OAuth securise. Donna accede en lecture seule." },
            { n: "2", title: "Donna travaille", desc: "Elle analyse, classe et prepare tout pour vous." },
            { n: "3", title: "Consultez le briefing", desc: "5 minutes pour tout savoir. Des brouillons prets." },
          ].map((step, i) => (
            <motion.div key={step.n} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.6 }} style={{ display: "flex", gap: 20, padding: "28px 0", borderBottom: i < 2 ? "1px solid #E5E7EB" : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#2563EB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0, boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>{step.n}</div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: "#111827" }}>{step.title}</div>
                <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section style={{ padding: "72px 32px", background: "#F9FAFB", borderTop: "1px solid #E5E7EB" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {[
            { icon: Lock, label: "Lecture seule" },
            { icon: Shield, label: "Conforme RGPD" },
            { icon: Server, label: "Donnees en France" },
            { icon: Eye, label: "Zero entrainement IA" },
          ].map(s => (
            <motion.div key={s.label} {...fadeUp} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
              <s.icon size={16} style={{ color: "#2563EB" }} /> {s.label}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "120px 32px", textAlign: "center" }}>
        <motion.div {...fadeUp}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.02em" }}>Testez Donna gratuitement</h2>
          <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 32, lineHeight: 1.7 }}>14 jours offerts. Sans engagement, sans carte bancaire.</p>
          <Link to="/demo" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 36px", borderRadius: 10, background: "#2563EB", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 32px rgba(37,99,235,0.35)" }}>
            Voir la demo <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "28px 32px", borderTop: "1px solid #E5E7EB", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 14 }}>
          <Link to="/securite" style={{ fontSize: 12, color: "#9CA3AF", textDecoration: "none" }}>Securite</Link>
          <Link to="/mentions-legales" style={{ fontSize: 12, color: "#9CA3AF", textDecoration: "none" }}>Mentions legales</Link>
          <a href="mailto:donna@donna-legal.com" style={{ fontSize: 12, color: "#9CA3AF", textDecoration: "none" }}>donna@donna-legal.com</a>
        </div>
        <p style={{ fontSize: 11, color: "#D1D5DB" }}>&copy; 2026 Donna-Legal.com</p>
      </footer>
    </div>
  )
}
