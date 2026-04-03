import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EMAILS, FOLDERS, BRIEFING, ANALYSIS_SUMMARY } from "./cinematic-data"

interface Props {
  theme?: "light" | "dark"
  className?: string
}

const CYCLE_DURATION = 22000 // 22s total cycle

// ─── Color schemes ───
const themes = {
  light: {
    bg: "#FFFFFF", sidebar: "#F9FAFB", card: "#F3F4F6", border: "#E5E7EB",
    text: "#111827", textMuted: "#6B7280", textLight: "#9CA3AF",
    accent: "#2563EB", accentBg: "#EFF6FF", browserBg: "#F9FAFB",
    browserBar: "#E5E7EB", dot1: "#FF5F57", dot2: "#FFBD2E", dot3: "#27C93F",
  },
  dark: {
    bg: "#0F0F0F", sidebar: "#1A1A1A", card: "#1F1F1F", border: "#2A2A2A",
    text: "#F9FAFB", textMuted: "#9CA3AF", textLight: "#6B7280",
    accent: "#3B82F6", accentBg: "#0A1628", browserBg: "#141414",
    browserBar: "#252525", dot1: "#FF5F57", dot2: "#FFBD2E", dot3: "#27C93F",
  },
}

export default function DashboardCinematic({ theme = "dark", className = "" }: Props) {
  const [cycle, setCycle] = useState(0)
  const c = themes[theme]

  useEffect(() => {
    const timer = setInterval(() => setCycle(prev => prev + 1), CYCLE_DURATION)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className={className} style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={cycle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Browser Chrome */}
          <div style={{ background: c.browserBar, borderRadius: "12px 12px 0 0", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.dot1 }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.dot2 }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.dot3 }} />
            </div>
            <div style={{ flex: 1, background: theme === "dark" ? "#1A1A1A" : "#fff", borderRadius: 6, padding: "4px 12px", fontSize: 11, color: c.textLight, fontFamily: "ui-monospace, monospace" }}>
              donna-legal.com/dashboard
            </div>
          </div>

          {/* Dashboard Content */}
          <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden", height: 400, display: "flex", position: "relative" }}>

            {/* Sidebar */}
            <div style={{ width: 160, background: c.sidebar, borderRight: `1px solid ${c.border}`, padding: "16px 10px", flexShrink: 0, overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 4 }}>Donna</div>
              <div style={{ fontSize: 10, color: c.accent, marginBottom: 16 }}>En ligne</div>

              <div style={{ fontSize: 10, color: c.textLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Dossiers</div>
              {FOLDERS.map((f, i) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 8 + i * 0.6, duration: 0.4 }}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 6, marginBottom: 4, fontSize: 11, color: c.text, background: i === 0 ? c.accentBg : "transparent" }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: f.color, flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                </motion.div>
              ))}
            </div>

            {/* Main area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

              {/* Briefing Card — appears at scene 4 */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 12, duration: 0.6 }}
                style={{ padding: "12px 16px", borderBottom: `1px solid ${c.border}`, background: c.accentBg, overflow: "hidden" }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 4 }}>{BRIEFING.greeting}</div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 13, duration: 0.4 }}
                  style={{ fontSize: 11, color: c.textMuted, marginBottom: 8 }}
                >
                  {BRIEFING.summary}
                </motion.div>
                {BRIEFING.bullets.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 13.5 + i * 0.8, duration: 0.3 }}
                    style={{ fontSize: 11, color: c.text, padding: "2px 0", display: "flex", gap: 6 }}
                  >
                    <span style={{ color: c.accent }}>•</span> {b}
                  </motion.div>
                ))}
                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 16, duration: 0.5 }}
                  style={{ display: "flex", gap: 16, marginTop: 10 }}
                >
                  {BRIEFING.stats.map((s, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: c.accent }}>{s.value}</div>
                      <div style={{ fontSize: 9, color: c.textLight }}>{s.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Email list */}
              <div style={{ flex: 1, overflow: "hidden" }}>
                {EMAILS.map((email, i) => (
                  <motion.div
                    key={email.sender}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.4, duration: 0.4, ease: "easeOut" }}
                  >
                    <EmailRow email={email} index={i} colors={c} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Analysis Panel — slides in at scene 2 */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              transition={{ delay: 5, duration: 0.5 }}
              style={{ background: c.card, borderLeft: `1px solid ${c.border}`, overflow: "hidden", flexShrink: 0 }}
            >
              <div style={{ padding: 14 }}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 5.5 }}
                  style={{ fontSize: 10, color: c.accent, fontWeight: 600, marginBottom: 8 }}
                >
                  Donna analyse...
                </motion.div>
                {/* Shimmer */}
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 6.5, duration: 0.3 }}
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {[80, 60, 90].map((w, i) => (
                    <div key={i} style={{ height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${c.border} 25%, ${c.accentBg} 50%, ${c.border} 75%)`, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", width: `${w}%` }} />
                  ))}
                </motion.div>
                {/* Summary appears */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 7, duration: 0.5 }}
                  style={{ fontSize: 11, color: c.text, lineHeight: 1.6, marginTop: 8 }}
                >
                  {ANALYSIS_SUMMARY}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 7.8 }}
                  style={{ marginTop: 12, display: "inline-block", padding: "4px 10px", borderRadius: 6, background: c.accent, color: "#fff", fontSize: 10, fontWeight: 600 }}
                >
                  Brouillon pret
                </motion.div>
              </div>
            </motion.div>

            {/* Fake Cursor */}
            <FakeCursor colors={c} />

            {/* Completion badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0, 1, 1, 1, 0.7, 1], scale: [0.8, 0.8, 1, 1, 1, 1, 1] }}
              transition={{ delay: 18, duration: 3 }}
              style={{ position: "absolute", bottom: 16, right: 16, padding: "8px 16px", borderRadius: 8, background: c.accent, color: "#fff", fontSize: 12, fontWeight: 600, boxShadow: `0 4px 20px ${c.accent}40` }}
            >
              Votre brief est pret
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

// ─── Sub-components ───

function EmailRow({ email, index, colors: c }: { email: typeof EMAILS[0]; index: number; colors: typeof themes.dark }) {
  const isHighlighted = index === 0
  return (
    <motion.div
      animate={isHighlighted ? { backgroundColor: [c.bg, c.accentBg, c.accentBg] } : {}}
      transition={isHighlighted ? { delay: 3.5, duration: 0.3 } : {}}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: `1px solid ${c.border}`, cursor: "default" }}
    >
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: email.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
        {email.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.sender}</div>
        <div style={{ fontSize: 11, color: c.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.subject}</div>
      </div>
      <div style={{ fontSize: 10, color: c.textLight, flexShrink: 0 }}>{email.time}</div>
    </motion.div>
  )
}

function FakeCursor({ colors: c }: { colors: typeof themes.dark }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300, y: 200 }}
      animate={{
        opacity: [0, 0, 1, 1, 1, 1, 0],
        x: [300, 300, 250, 250, 250, 250, 400],
        y: [200, 200, 65, 65, 65, 65, 300],
      }}
      transition={{ delay: 2.5, duration: 3, times: [0, 0.05, 0.4, 0.5, 0.6, 0.9, 1] }}
      style={{ position: "absolute", width: 16, height: 20, zIndex: 20, pointerEvents: "none" }}
    >
      <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
        <path d="M0 0L0 16L4.5 12L7.5 19L10 18L7 11L12 10L0 0Z" fill={c.text} stroke={c.bg} strokeWidth="1" />
      </svg>
      {/* Click ripple */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 0.5, 0], scale: [0, 1.5, 2] }}
        transition={{ delay: 3.8, duration: 0.5 }}
        style={{ position: "absolute", top: -5, left: -5, width: 24, height: 24, borderRadius: "50%", border: `2px solid ${c.accent}` }}
      />
    </motion.div>
  )
}
