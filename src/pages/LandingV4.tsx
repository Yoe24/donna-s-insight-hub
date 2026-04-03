import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { Shield, Lock, Server } from "lucide-react"
import DashboardCinematic from "@/components/cinematic/DashboardCinematic"

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.6 } }

const CHAT_MESSAGES = [
  { role: "user" as const, text: "Donna, qu'est-ce que j'ai d'urgent ce matin ?", delay: 1 },
  { role: "donna" as const, text: "Bonjour Me Fernandez. Vous avez 3 emails urgents : une convocation JAF pour le 15 avril, les conclusions Benzara a valider avant jeudi, et une notification de jugement du TGI Nanterre a telecharger.", delay: 3.5 },
  { role: "user" as const, text: "Prepare une reponse pour le tribunal.", delay: 8 },
  { role: "donna" as const, text: "Voici un brouillon : \"Madame la Greffiere, j'accuse reception de la convocation du 15 avril 2026. Je confirme ma presence a l'audience...\" Voulez-vous que je l'ajuste ?", delay: 10.5 },
]

const USE_CASES = [
  { title: "Droit de la famille", desc: "Audiences, pensions, gardes. Donna detecte chaque echeance et prepare vos conclusions.", color: "#2563EB" },
  { title: "Droit commercial", desc: "Contentieux, mises en demeure, relances. Donna trie par dossier et urgence.", color: "#3B82F6" },
  { title: "Droit generaliste", desc: "De l'immobilier au penal, Donna s'adapte a votre pratique et vos clients.", color: "#10B981" },
]

function FakeChat() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [typing, setTyping] = useState(false)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    setVisibleCount(0)

    CHAT_MESSAGES.forEach((msg, i) => {
      if (msg.role === "donna") {
        timers.push(setTimeout(() => setTyping(true), msg.delay * 1000 - 1500))
      }
      timers.push(setTimeout(() => { setTyping(false); setVisibleCount(i + 1) }, msg.delay * 1000))
    })

    timers.push(setTimeout(() => setCycle(c => c + 1), 18000))

    return () => timers.forEach(clearTimeout)
  }, [cycle])

  return (
    <div style={{ maxWidth: 460, margin: "0 auto", padding: 24, borderRadius: 20, background: "#F8FAFF", border: "1px solid #DBEAFE", minHeight: 300, boxShadow: "0 8px 40px rgba(37,99,235,0.08)" }}>
      {/* Chat header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #DBEAFE" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #1D4ED8, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, boxShadow: "0 4px 12px rgba(29,78,216,0.3)" }}>D</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1F2937", letterSpacing: "-0.01em" }}>Donna</div>
          <div style={{ fontSize: 10, color: "#10B981", letterSpacing: "0.04em" }}>● En ligne</div>
        </div>
      </div>
      {/* Messages */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <AnimatePresence>
          {CHAT_MESSAGES.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                padding: "10px 14px",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.role === "user" ? "#2563EB" : "#FFFFFF",
                color: msg.role === "user" ? "#fff" : "#1F2937",
                fontSize: 13,
                lineHeight: 1.65,
                boxShadow: msg.role === "user" ? "0 4px 12px rgba(37,99,235,0.3)" : "0 2px 8px rgba(0,0,0,0.06)",
                border: msg.role === "donna" ? "1px solid #E5E7EB" : "none",
              }}
            >
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {typing && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ alignSelf: "flex-start", padding: "10px 16px", borderRadius: "16px 16px 16px 4px", background: "#FFFFFF", border: "1px solid #E5E7EB", display: "flex", gap: 5 }}>
            {[0, 1, 2].map(i => (
              <motion.div key={i} animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }} style={{ width: 6, height: 6, borderRadius: "50%", background: "#9CA3AF" }} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function LandingV4() {
  return (
    <div style={{ background: "#F8FAFF", color: "#1F2937", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(248,250,255,0.94)", backdropFilter: "blur(16px)", borderBottom: "1px solid #DBEAFE", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, color: "#1F2937", letterSpacing: "-0.3px" }}>Donna</span>
        <Link to="/demo" style={{ padding: "9px 22px", borderRadius: 8, background: "#2563EB", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" }}>Discutez avec Donna</Link>
      </nav>

      {/* Hero with chat */}
      <section style={{ padding: "96px 32px 72px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48, alignItems: "center" }}>
          <motion.div {...fadeUp}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 700, lineHeight: 1.18, marginBottom: 18, letterSpacing: "-0.02em", color: "#111827" }}>
              Parlez-lui,<br />elle comprend.
            </h1>
            <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.8, marginBottom: 28 }}>
              Donna comprend vos dossiers, vos clients, vos urgences. Chaque matin, elle vous prepare un briefing sur mesure.
            </p>
            <Link to="/demo" style={{ display: "inline-block", padding: "13px 26px", borderRadius: 8, background: "#2563EB", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 6px 20px rgba(37,99,235,0.35)" }}>Voir la demo</Link>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
            <FakeChat />
          </motion.div>
        </div>
      </section>

      {/* Dashboard Cinematic */}
      <section style={{ padding: "72px 32px", background: "#FFFFFF", borderTop: "1px solid #DBEAFE", borderBottom: "1px solid #DBEAFE" }}>
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <motion.h2 {...fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, textAlign: "center", marginBottom: 36, letterSpacing: "-0.02em", color: "#111827" }}>
            Voyez Donna en action
          </motion.h2>
          <motion.div {...fadeUp} transition={{ delay: 0.2 }} style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 16px 60px rgba(37,99,235,0.1), 0 0 0 1px rgba(37,99,235,0.08)" }}>
            <DashboardCinematic theme="light" />
          </motion.div>
        </div>
      </section>

      {/* Use cases */}
      <section style={{ padding: "96px 32px", maxWidth: 960, margin: "0 auto" }}>
        <motion.h2 {...fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, textAlign: "center", marginBottom: 48, letterSpacing: "-0.02em", color: "#111827" }}>
          Adaptee a votre pratique
        </motion.h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
          {USE_CASES.map((uc, i) => (
            <motion.div key={uc.title} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.6 }} style={{ padding: 28, borderRadius: 16, background: "#FFFFFF", border: "1px solid #DBEAFE", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${uc.color}40, ${uc.color})` }} />
              <div style={{ width: 10, height: 10, borderRadius: 3, background: uc.color, marginBottom: 14 }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: "#111827" }}>{uc.title}</h3>
              <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.7 }}>{uc.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section style={{ padding: "72px 32px", background: "#FFFFFF", borderTop: "1px solid #DBEAFE" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <motion.h2 {...fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, textAlign: "center", marginBottom: 40, letterSpacing: "-0.02em", color: "#111827" }}>
            Votre secret professionnel, notre priorite
          </motion.h2>
          {[
            { icon: Lock, title: "Lecture seule", desc: "Donna ne peut ni envoyer ni supprimer vos emails." },
            { icon: Shield, title: "RGPD et secret professionnel", desc: "Donnees chiffrees, hebergees en France, supprimables a tout moment." },
            { icon: Server, title: "Zero entrainement IA", desc: "Vos emails ne servent jamais a entrainer un modele." },
          ].map((s, i) => (
            <motion.div key={s.title} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.6 }} style={{ display: "flex", gap: 18, padding: "20px 0", borderBottom: i < 2 ? "1px solid #F0F4FF" : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <s.icon size={18} style={{ color: "#2563EB" }} />
              </div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: "#111827" }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "96px 32px", textAlign: "center" }}>
        <motion.div {...fadeUp}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 16, letterSpacing: "-0.02em", color: "#111827" }}>Discutez avec Donna</h2>
          <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 28 }}>14 jours gratuits. Repondez a vos emails en 5 minutes.</p>
          <Link to="/demo" style={{ display: "inline-block", padding: "15px 32px", borderRadius: 10, background: "#2563EB", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 28px rgba(37,99,235,0.35)" }}>Voir la demo</Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "28px 32px", borderTop: "1px solid #DBEAFE", textAlign: "center" }}>
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
