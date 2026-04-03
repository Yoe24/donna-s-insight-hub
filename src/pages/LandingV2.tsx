import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Shield, Zap, Brain, Clock, Mail, FolderOpen } from "lucide-react"
import DashboardCinematic from "@/components/cinematic/DashboardCinematic"

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.6 } }

const CAPABILITIES = [
  { icon: Mail, title: "Lecture automatique", desc: "Donna lit chaque email entrant et identifie l'expediteur, le contexte et l'urgence." },
  { icon: FolderOpen, title: "Classement par dossier", desc: "Les emails sont automatiquement relies a vos dossiers clients." },
  { icon: Brain, title: "Analyse contextuelle", desc: "Elle comprend les pieces jointes, les dates limites, les demandes." },
  { icon: Zap, title: "Briefing instantane", desc: "Chaque matin, un resume clair de tout ce qui compte." },
  { icon: Clock, title: "Brouillons pre-rediges", desc: "Des reponses dans votre style, pretes a valider et envoyer." },
  { icon: Shield, title: "Confidentialite totale", desc: "Lecture seule, donnees en France, zero entrainement IA." },
]

const TICKER_ITEMS = [
  "847 emails analyses aujourd'hui",
  "12 cabinets connectes",
  "99.9% uptime",
  "3 200 brouillons generes cette semaine",
  "100% conformite RGPD",
  "Hebergement souverain France",
]

export default function LandingV2() {
  return (
    <div style={{ background: "#050B18", color: "#F9FAFB", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}>

      {/* Animated blue-cyan gradient background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.5, background: "radial-gradient(ellipse at 20% 50%, rgba(29,78,216,0.18) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(37,99,235,0.08) 0%, transparent 50%)" }} />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(5,11,24,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(37,99,235,0.15)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.3px" }}>Donna</span>
        <Link to="/demo" style={{ padding: "9px 22px", borderRadius: 8, background: "linear-gradient(135deg, #1D4ED8, #06B6D4)", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(29,78,216,0.4)" }}>Activer Donna</Link>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 1, padding: "108px 32px 72px", maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        <motion.div {...fadeUp}>
          <div style={{ display: "inline-block", padding: "5px 16px", borderRadius: 20, border: "1px solid rgba(37,99,235,0.35)", background: "rgba(37,99,235,0.08)", fontSize: 12, color: "#60A5FA", marginBottom: 24, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Assistante juridique IA
          </div>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, lineHeight: 1.08, marginBottom: 22, letterSpacing: "-0.03em", background: "linear-gradient(180deg, #F9FAFB 30%, #93C5FD 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Votre premiere<br />employee numerique
          </h1>
          <p style={{ fontSize: 17, color: "#6B7280", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.75 }}>
            Donna analyse vos emails, prepare vos briefings et redige vos reponses. 24h/24, sans pause, sans erreur.
          </p>
          <Link to="/demo" style={{ display: "inline-block", padding: "15px 36px", borderRadius: 10, background: "linear-gradient(135deg, #1D4ED8, #06B6D4)", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 40px rgba(29,78,216,0.45)", letterSpacing: "0.01em" }}>Voir la demo</Link>
        </motion.div>
        <motion.div {...fadeUp} transition={{ delay: 0.3, duration: 0.6 }} style={{ marginTop: 56 }}>
          {/* Animated gradient border container */}
          <div style={{ padding: 1.5, borderRadius: 18, background: "linear-gradient(135deg, rgba(29,78,216,0.5), rgba(6,182,212,0.4), rgba(29,78,216,0.3))", boxShadow: "0 0 80px rgba(37,99,235,0.2), 0 0 0 1px rgba(255,255,255,0.04)" }}>
            <div style={{ borderRadius: 16.5, overflow: "hidden" }}>
              <DashboardCinematic theme="dark" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Meet Donna */}
      <section style={{ position: "relative", zIndex: 1, padding: "72px 32px", maxWidth: 520, margin: "0 auto" }}>
        <motion.div {...fadeUp} style={{ padding: 32, borderRadius: 20, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", border: "1px solid rgba(37,99,235,0.2)", textAlign: "center", boxShadow: "0 0 40px rgba(37,99,235,0.08)" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #1D4ED8, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 22, fontWeight: 700, boxShadow: "0 8px 32px rgba(29,78,216,0.4)" }}>D</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2, letterSpacing: "-0.02em" }}>Donna</div>
          <div style={{ fontSize: 13, color: "#60A5FA", marginBottom: 20 }}>Assistante juridique IA</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 28 }}>
            {[{ v: "500+", l: "emails/jour" }, { v: "24/7", l: "disponible" }, { v: "0", l: "erreurs" }].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>{s.v}</div>
                <div style={{ fontSize: 10, color: "#4B5563", marginTop: 2, letterSpacing: "0.04em" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Capabilities */}
      <section style={{ position: "relative", zIndex: 1, padding: "72px 32px", maxWidth: 960, margin: "0 auto" }}>
        <motion.h2 {...fadeUp} style={{ fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 48, letterSpacing: "-0.03em" }}>Capacites</motion.h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {CAPABILITIES.map((cap, i) => (
            <motion.div key={cap.title} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.6 }} style={{ padding: 28, borderRadius: 14, background: "rgba(255,255,255,0.025)", backdropFilter: "blur(8px)", border: "1px solid rgba(37,99,235,0.15)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)" }} />
              <cap.icon size={20} style={{ color: "#60A5FA", marginBottom: 14 }} />
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 7, color: "#F9FAFB" }}>{cap.title}</h3>
              <p style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.7 }}>{cap.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ticker */}
      <section style={{ position: "relative", zIndex: 1, padding: "20px 0", borderTop: "1px solid rgba(37,99,235,0.12)", borderBottom: "1px solid rgba(37,99,235,0.12)", overflow: "hidden" }}>
        <motion.div animate={{ x: [0, -1200] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} style={{ display: "flex", gap: 48, whiteSpace: "nowrap" }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ fontSize: 12, color: "#4B5563", display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.03em" }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#2563EB", boxShadow: "0 0 6px #2563EB" }} />
              {item}
            </span>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", zIndex: 1, padding: "96px 32px", textAlign: "center" }}>
        <motion.div {...fadeUp}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.03em" }}>Activez Donna aujourd'hui</h2>
          <p style={{ fontSize: 14, color: "#4B5563", marginBottom: 32 }}>14 jours gratuits. Aucune carte requise.</p>
          <Link to="/demo" style={{ display: "inline-block", padding: "15px 40px", borderRadius: 10, background: "linear-gradient(135deg, #1D4ED8, #06B6D4)", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 40px rgba(29,78,216,0.45)", letterSpacing: "0.01em" }}>Voir la demo</Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, padding: "28px 32px", borderTop: "1px solid rgba(37,99,235,0.1)", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 14 }}>
          <Link to="/securite" style={{ fontSize: 12, color: "#374151", textDecoration: "none" }}>Securite</Link>
          <Link to="/mentions-legales" style={{ fontSize: 12, color: "#374151", textDecoration: "none" }}>Mentions legales</Link>
          <a href="mailto:donna@donna-legal.com" style={{ fontSize: 12, color: "#374151", textDecoration: "none" }}>donna@donna-legal.com</a>
        </div>
        <p style={{ fontSize: 11, color: "#1F2937" }}>&copy; 2026 Donna-Legal.com</p>
      </footer>
    </div>
  )
}
