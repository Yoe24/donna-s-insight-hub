import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { Check, Shield, Lock, Server, Eye, ArrowRight } from "lucide-react"
import DashboardCinematic from "@/components/cinematic/DashboardCinematic"

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.6 } }

const HEADLINES = [
  "Vos emails, geres.",
  "Vos dossiers, classes.",
  "Vos reponses, pretes.",
]

const TICKER_ITEMS = [
  "Conforme RGPD", "Hebergement France", "Secret professionnel", "Lecture seule",
  "Zero entrainement IA", "Chiffrement bout en bout", "Suppression immediate",
]

const CHAT_LINES = [
  { role: "user" as const, text: "Donna, qu'est-ce que j'ai d'urgent ?", delay: 1 },
  { role: "donna" as const, text: "3 emails urgents : convocation JAF, conclusions Benzara, notification jugement Nanterre. Vos brouillons sont prets.", delay: 3.5 },
]

function MiniChat() {
  const [count, setCount] = useState(0)
  const [cycle, setCycle] = useState(0)
  useEffect(() => {
    const timers = CHAT_LINES.map((msg, i) => setTimeout(() => setCount(i + 1), msg.delay * 1000))
    timers.push(setTimeout(() => { setCount(0); setCycle(c => c + 1) }, 10000))
    return () => timers.forEach(clearTimeout)
  }, [cycle])
  return (
    <div style={{ padding: 20, borderRadius: 14, background: "#F8FAFF", border: "1px solid #DBEAFE", boxShadow: "0 4px 16px rgba(37,99,235,0.08)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <AnimatePresence>
          {CHAT_LINES.slice(0, count).map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3 }} style={{
              padding: "9px 14px",
              borderRadius: 12,
              background: msg.role === "user" ? "#2563EB" : "#FFFFFF",
              color: msg.role === "user" ? "#fff" : "#111827",
              fontSize: 12,
              lineHeight: 1.65,
              maxWidth: "90%",
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              marginLeft: msg.role === "user" ? "auto" : 0,
              boxShadow: msg.role === "user" ? "0 3px 10px rgba(37,99,235,0.3)" : "0 2px 6px rgba(0,0,0,0.05)",
              border: msg.role === "donna" ? "1px solid #E5E7EB" : "none",
            }}>
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function LandingV5() {
  const [headlineIdx, setHeadlineIdx] = useState(0)
  useEffect(() => { const t = setInterval(() => setHeadlineIdx(i => (i + 1) % HEADLINES.length), 3000); return () => clearInterval(t) }, [])

  return (
    <div style={{ background: "#FFFFFF", color: "#111827", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(16px)", borderBottom: "1px solid #E5E7EB", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, letterSpacing: "-0.3px" }}>Donna</span>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <Link to="/securite" style={{ color: "#9CA3AF", fontSize: 13, textDecoration: "none" }}>Securite</Link>
          <Link to="/demo" style={{ padding: "9px 22px", borderRadius: 8, background: "#2563EB", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" }}>Voir la demo</Link>
        </div>
      </nav>

      {/* Hero — rotating headline + cinematic */}
      <section style={{ padding: "96px 32px 72px", maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        <motion.div {...fadeUp}>
          <div style={{ height: "clamp(56px, 7vw, 72px)", marginBottom: 20, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AnimatePresence mode="wait">
              <motion.h1 key={headlineIdx} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.03em", color: "#111827" }}>
                {HEADLINES[headlineIdx].replace(".", "")}
                <span style={{ color: "#2563EB" }}>.</span>
              </motion.h1>
            </AnimatePresence>
          </div>
          <p style={{ fontSize: 16, color: "#6B7280", maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.8 }}>
            Donna lit vos emails, classe vos dossiers et prepare vos reponses chaque matin. En 5 minutes, vous savez tout.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
            <Link to="/demo" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 30px", borderRadius: 8, background: "#2563EB", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 6px 24px rgba(37,99,235,0.4)" }}>Voir la demo <ArrowRight size={15} /></Link>
            <Link to="/securite" style={{ padding: "13px 30px", borderRadius: 8, border: "1px solid #D1D5DB", color: "#6B7280", fontSize: 14, textDecoration: "none" }}>En savoir plus</Link>
          </div>
        </motion.div>
        <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.6 }} style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.08), 0 0 0 1px rgba(37,99,235,0.08)" }}>
          <DashboardCinematic theme="light" />
        </motion.div>
      </section>

      {/* Trust ticker */}
      <section style={{ padding: "18px 0", borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB", overflow: "hidden" }}>
        <motion.div animate={{ x: [0, -800] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ display: "flex", gap: 32, whiteSpace: "nowrap" }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ fontSize: 11, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.04em" }}>
              <Shield size={10} style={{ color: "#2563EB" }} /> {item}
            </span>
          ))}
        </motion.div>
      </section>

      {/* Before / After */}
      <section style={{ padding: "96px 32px", maxWidth: 800, margin: "0 auto" }}>
        <motion.h2 {...fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, textAlign: "center", marginBottom: 40, letterSpacing: "-0.02em" }}>Avant et apres Donna</motion.h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <motion.div {...fadeUp} style={{ padding: 28, borderRadius: 14, background: "#FEF2F2", border: "1px solid #FECACA" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#DC2626", marginBottom: 14 }}>Sans Donna</div>
            {["45 min a trier vos emails", "Relances oubliees", "Stress des le matin"].map(t => (
              <div key={t} style={{ fontSize: 13, color: "#7F1D1D", marginBottom: 8 }}>✕ {t}</div>
            ))}
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} style={{ padding: 28, borderRadius: 14, background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1D4ED8", marginBottom: 14 }}>Avec Donna</div>
            {["5 min pour tout savoir", "Relances detectees", "Briefing clair et serein"].map(t => (
              <div key={t} style={{ fontSize: 13, color: "#1E3A8A", marginBottom: 8, display: "flex", alignItems: "center", gap: 7 }}><Check size={12} style={{ color: "#2563EB" }} /> {t}</div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Chat demo section */}
      <section style={{ padding: "72px 32px", background: "#F9FAFB", borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40, alignItems: "center" }}>
          <motion.div {...fadeUp}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 14, letterSpacing: "-0.02em" }}>Parlez-lui, elle comprend.</h2>
            <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.75 }}>Donna comprend vos dossiers, vos clients, vos urgences. Posez une question, elle repond.</p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
            <MiniChat />
          </motion.div>
        </div>
      </section>

      {/* Dark stats — premium blue glow */}
      <section style={{ padding: "72px 32px", background: "radial-gradient(ellipse at center, #0A1628 0%, #111827 60%)", position: "relative", overflow: "hidden" }}>
        {/* Ambient glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 600, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, textAlign: "center", position: "relative", zIndex: 1 }}>
          {[{ v: "2h", l: "gagnees/jour" }, { v: "5 min", l: "pour le briefing" }, { v: "100%", l: "confidentiel" }].map((s, i) => (
            <motion.div key={s.l} {...fadeUp} transition={{ delay: i * 0.12 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, color: "#3B82F6", textShadow: "0 0 40px rgba(59,130,246,0.5)", lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 8, letterSpacing: "0.04em" }}>{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section style={{ padding: "72px 32px", background: "#0F172A" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <motion.h2 {...fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#F9FAFB", textAlign: "center", marginBottom: 36, letterSpacing: "-0.02em" }}>Securite sans compromis</motion.h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { icon: Lock, title: "Lecture seule", desc: "Jamais d'envoi ni suppression." },
              { icon: Shield, title: "RGPD", desc: "Donnees en France, chiffrees." },
              { icon: Server, title: "Hebergement FR", desc: "Infrastructure souveraine." },
              { icon: Eye, title: "Zero IA training", desc: "Vos emails restent les votres." },
            ].map((s, i) => (
              <motion.div key={s.title} {...fadeUp} transition={{ delay: i * 0.08 }} style={{ padding: 22, borderRadius: 12, border: "1px solid rgba(59,130,246,0.15)", background: "rgba(59,130,246,0.04)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)" }} />
                <s.icon size={18} style={{ color: "#3B82F6", marginBottom: 10 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F9FAFB", marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: "#4B5563" }}>{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "96px 32px", textAlign: "center", background: "#FFFFFF" }}>
        <motion.div {...fadeUp}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 14, letterSpacing: "-0.02em" }}>Testez Donna gratuitement</h2>
          <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 32 }}>14 jours. Sans engagement. Sans carte bancaire.</p>
          <Link to="/demo" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 36px", borderRadius: 10, background: "#2563EB", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 32px rgba(37,99,235,0.4)" }}>Voir la demo <ArrowRight size={16} /></Link>
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
