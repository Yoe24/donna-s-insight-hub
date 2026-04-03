import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Shield, Lock, Server, Eye } from "lucide-react"
import DashboardCinematic from "@/components/cinematic/DashboardCinematic"

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.6 } }

const FEATURES = [
  { title: "Tri intelligent", desc: "Donna lit chaque email, identifie l'expediteur, le dossier et l'urgence. Vous ne touchez a rien." },
  { title: "Briefing du matin", desc: "En 5 minutes, vous savez tout. Audiences, relances, pieces manquantes. Clair et actionnable." },
  { title: "Brouillons de reponse", desc: "Donna prepare vos reponses dans votre style. Vous relisez, vous validez, vous envoyez." },
]

const STATS = [
  { value: "2h", label: "gagnees chaque jour" },
  { value: "5 min", label: "pour votre briefing" },
  { value: "100%", label: "confidentialite garantie" },
]

const SECURITY = [
  { icon: Lock, title: "Acces en lecture seule", desc: "Donna lit vos emails. Elle ne peut ni envoyer ni supprimer." },
  { icon: Shield, title: "Conforme RGPD", desc: "Vos donnees restent en France. Chiffrees, supprimables a tout moment." },
  { icon: Server, title: "Hebergement francais", desc: "Infrastructure souveraine conforme aux exigences du barreau." },
  { icon: Eye, title: "Zero entrainement IA", desc: "Vos emails ne sont jamais utilises pour entrainer un modele." },
]

export default function LandingV1() {
  return (
    <div style={{ background: "#0A0A0A", color: "#F9FAFB", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Subtle blue ambient background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 15% 40%, rgba(37,99,235,0.07) 0%, transparent 55%), radial-gradient(ellipse at 85% 80%, rgba(59,130,246,0.05) 0%, transparent 50%)" }} />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,10,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, letterSpacing: "-0.3px" }}>Donna</span>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link to="/securite" style={{ color: "#6B7280", fontSize: 13, textDecoration: "none", letterSpacing: "0.02em" }}>Securite</Link>
          <Link to="/demo" style={{ padding: "9px 22px", borderRadius: 8, background: "#2563EB", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(37,99,235,0.35)", transition: "opacity 0.2s" }}>Demander une demo</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 1, padding: "96px 32px 72px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Dot grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(59,130,246,0.12) 1px, transparent 1px)", backgroundSize: "28px 28px", maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)", pointerEvents: "none", zIndex: 0 }} />
        <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: 56, position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 20, border: "1px solid rgba(59,130,246,0.25)", fontSize: 11, color: "#60A5FA", marginBottom: 24, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Assistante juridique IA
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 5.5vw, 62px)", fontWeight: 700, lineHeight: 1.12, marginBottom: 24, letterSpacing: "-0.02em" }}>
            L'avocate{" "}
            <span style={{ background: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              numerique
            </span>
            <br />qui ne dort jamais.
          </h1>
          <p style={{ fontSize: 17, color: "#9CA3AF", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.75 }}>
            Donna lit vos emails chaque matin, classe vos dossiers et prepare vos reponses. Vous gardez le controle. Elle fait le reste.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/demo" style={{ padding: "13px 30px", borderRadius: 8, background: "#2563EB", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 6px 24px rgba(37,99,235,0.4)", letterSpacing: "0.01em" }}>Voir la demo</Link>
            <Link to="/securite" style={{ padding: "13px 30px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", color: "#9CA3AF", fontSize: 14, textDecoration: "none" }}>En savoir plus</Link>
          </div>
        </motion.div>
        <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.6 }} style={{ position: "relative", zIndex: 1 }}>
          {/* Glow behind cinematic */}
          <div style={{ position: "absolute", inset: -40, background: "radial-gradient(ellipse at center, rgba(37,99,235,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1, borderRadius: 16, boxShadow: "0 0 0 1px rgba(59,130,246,0.15), 0 32px 80px rgba(0,0,0,0.5)" }}>
            <DashboardCinematic theme="dark" />
          </div>
        </motion.div>
      </section>

      {/* Trust bar */}
      <section style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "22px 32px", background: "rgba(15,15,15,0.8)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "center", gap: 36, flexWrap: "wrap" }}>
          {["Conforme RGPD", "Hebergement France", "Secret professionnel respecte", "Lecture seule"].map(t => (
            <span key={t} style={{ fontSize: 12, color: "#6B7280", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#3B82F6", boxShadow: "0 0 6px #3B82F6" }} /> {t}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ position: "relative", zIndex: 1, padding: "96px 32px", maxWidth: 960, margin: "0 auto" }}>
        <motion.h2 {...fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, textAlign: "center", marginBottom: 56, letterSpacing: "-0.02em" }}>
          Ce que Donna fait pour vous
        </motion.h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.6 }} style={{ padding: 32, borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(15,15,15,0.9)", borderLeft: "2px solid rgba(59,130,246,0.4)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)" }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: "#F9FAFB" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.75 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{ position: "relative", zIndex: 1, padding: "72px 32px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, textAlign: "center" }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label} {...fadeUp} transition={{ delay: i * 0.15, duration: 0.6 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 700, color: "#3B82F6", textShadow: "0 0 40px rgba(59,130,246,0.4)", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#4B5563", marginTop: 8, letterSpacing: "0.03em" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ position: "relative", zIndex: 1, padding: "96px 32px", maxWidth: 640, margin: "0 auto" }}>
        <motion.h2 {...fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, textAlign: "center", marginBottom: 56, letterSpacing: "-0.02em" }}>
          3 etapes, 5 minutes
        </motion.h2>
        {[
          { n: "1", title: "Connectez votre boite mail", desc: "OAuth Google securise. Donna accede en lecture seule." },
          { n: "2", title: "Donna analyse vos emails", desc: "Elle identifie les dossiers, les urgences, les relances." },
          { n: "3", title: "Consultez votre briefing", desc: "Chaque matin, un resume clair. Des brouillons prets a envoyer." },
        ].map((step, i) => (
          <motion.div key={step.n} {...fadeUp} transition={{ delay: i * 0.15, duration: 0.6 }} style={{ display: "flex", gap: 22, marginBottom: 44, paddingBottom: i < 2 ? 44 : 0, borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(59,130,246,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#3B82F6", flexShrink: 0, boxShadow: "0 0 20px rgba(59,130,246,0.15)" }}>{step.n}</div>
            <div style={{ paddingTop: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: "#F9FAFB" }}>{step.title}</div>
              <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>{step.desc}</div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Security */}
      <section style={{ position: "relative", zIndex: 1, padding: "96px 32px", background: "rgba(15,15,15,0.9)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <motion.h2 {...fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, textAlign: "center", marginBottom: 56, letterSpacing: "-0.02em" }}>
            Securite sans compromis
          </motion.h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
            {SECURITY.map((s, i) => (
              <motion.div key={s.title} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.6 }} style={{ padding: 28, borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,10,10,0.8)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)" }} />
                <s.icon size={20} style={{ color: "#3B82F6", marginBottom: 14 }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 7, color: "#F9FAFB" }}>{s.title}</h3>
                <p style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.7 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section style={{ position: "relative", zIndex: 1, padding: "96px 32px", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <motion.div {...fadeUp}>
          <div style={{ fontSize: 32, color: "#3B82F6", marginBottom: 20, opacity: 0.5 }}>"</div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontStyle: "italic", lineHeight: 1.75, color: "#D1D5DB", marginBottom: 24 }}>
            Donna m'a fait gagner un temps considerable. Chaque matin, mon briefing est pret avant meme que je n'ouvre mon ordinateur.
          </p>
          <p style={{ fontSize: 13, color: "#4B5563", letterSpacing: "0.04em" }}>Me Alexandra Fernandez — avocate en droit de la famille</p>
        </motion.div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", zIndex: 1, padding: "96px 32px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
        <motion.div {...fadeUp}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 16, letterSpacing: "-0.02em" }}>Pret a recruter Donna ?</h2>
          <p style={{ fontSize: 15, color: "#4B5563", marginBottom: 32 }}>14 jours d'essai gratuit. Sans engagement.</p>
          <Link to="/demo" style={{ display: "inline-block", padding: "15px 36px", borderRadius: 10, background: "#2563EB", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 32px rgba(37,99,235,0.4)", letterSpacing: "0.01em" }}>Voir la demo</Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, padding: "28px 32px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 14 }}>
          <Link to="/securite" style={{ fontSize: 12, color: "#4B5563", textDecoration: "none" }}>Securite</Link>
          <Link to="/mentions-legales" style={{ fontSize: 12, color: "#4B5563", textDecoration: "none" }}>Mentions legales</Link>
          <a href="mailto:donna@donna-legal.com" style={{ fontSize: 12, color: "#4B5563", textDecoration: "none" }}>donna@donna-legal.com</a>
        </div>
        <p style={{ fontSize: 11, color: "#374151" }}>&copy; 2026 Donna-Legal.com</p>
      </footer>
    </div>
  )
}
