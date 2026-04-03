import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EMAILS, FOLDERS, DOSSIER, BRIEFING, DONNA_STATUS } from "./cinematic-data"

interface Props {
  theme?: "light" | "dark"
  className?: string
  chromeless?: boolean
}

const CYCLE_DURATION = 36 // 36s — 3 scenes, 12s each

const themes = {
  light: {
    bg: "#FFFFFF", sidebar: "#F9FAFB", card: "#F3F4F6", border: "#E5E7EB",
    text: "#111827", textMuted: "#6B7280", textLight: "#9CA3AF",
    accent: "#2563EB", accentBg: "#EFF6FF",
    success: "#10B981",
  },
  dark: {
    bg: "#0F0F0F", sidebar: "#1A1A1A", card: "#1F1F1F", border: "#2A2A2A",
    text: "#F9FAFB", textMuted: "#9CA3AF", textLight: "#6B7280",
    accent: "#3B82F6", accentBg: "#0A1628",
    success: "#34D399",
  },
}

type Theme = typeof themes.dark

export default function DashboardCinematic({ theme = "dark", className = "" }: Props) {
  const [elapsed, setElapsed] = useState(0)
  const c = themes[theme]

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 0.1
        return next >= CYCLE_DURATION ? 0 : next
      })
    }, 100)
    return () => clearInterval(timer)
  }, [])

  const scene = elapsed < 12 ? 0 : elapsed < 24 ? 1 : 2
  const sceneTime = elapsed - (scene * 12)

  return (
    <div className={className} style={{
      width: "100%",
      maxWidth: 1000,
      margin: "0 auto",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
      border: `1px solid ${c.border}`,
    }}>
      <div style={{
        background: c.bg,
        height: 520,
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}>
        <Sidebar colors={c} scene={scene} elapsed={elapsed} />

        <div style={{ flex: 1, minWidth: 0, overflow: "hidden", position: "relative" }}>
          <AnimatePresence mode="wait">
            {scene === 0 && <InboxScene key="inbox" colors={c} t={sceneTime} />}
            {scene === 1 && <DossierScene key="dossier" colors={c} t={sceneTime} />}
            {scene === 2 && <BriefingScene key="briefing" colors={c} t={sceneTime} />}
          </AnimatePresence>
        </div>

        <DonnaAvatar colors={c} scene={scene} sceneTime={sceneTime} />
      </div>
    </div>
  )
}

// ─── DONNA AVATAR ───

function DonnaAvatar({ colors: c, scene, sceneTime }: { colors: Theme; scene: number; sceneTime: number }) {
  const status = DONNA_STATUS[scene]

  const positions = [
    { x: 340, y: 70 },   // Scene 0: near inbox emails
    { x: 280, y: 90 },   // Scene 1: near dossier content
    { x: 320, y: 130 },  // Scene 2: near brouillons
  ]
  const pos = positions[scene]
  const offsetY = Math.sin(sceneTime * 0.5) * 6
  const pulseActive = sceneTime > 2 && sceneTime < 10

  return (
    <motion.div
      animate={{
        x: pos.x,
        y: pos.y + offsetY,
        opacity: sceneTime > 0.5 ? 1 : 0,
      }}
      transition={{ type: "spring", damping: 25, stiffness: 120 }}
      style={{
        position: "absolute",
        zIndex: 30,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <motion.div
        animate={{
          boxShadow: pulseActive
            ? ["0 0 0px #2563EB40", "0 0 20px #2563EB50", "0 0 0px #2563EB40"]
            : "0 0 0px #2563EB40",
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          width: 32, height: 32, borderRadius: "50%",
          background: c.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#fff",
          flexShrink: 0, border: "2px solid #fff",
        }}
      >
        D
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 5 }}
          transition={{ duration: 0.4 }}
          style={{
            background: "#fff",
            padding: "5px 14px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 500,
            color: c.accent,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            border: `1px solid ${c.border}`,
          }}
        >
          {status}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

// ─── SIDEBAR ───

function Sidebar({ colors: c, scene, elapsed }: { colors: Theme; scene: number; elapsed: number }) {
  const navItems = [
    { label: "Inbox", active: scene === 0 },
    { label: "Dossiers", active: scene === 1 },
    { label: "Brouillons", active: scene === 2 },
  ]

  return (
    <div style={{
      width: 180, minWidth: 180, maxWidth: 180,
      background: c.sidebar,
      borderRight: `1px solid ${c.border}`,
      padding: "24px 14px",
      overflow: "hidden",
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: c.text, marginBottom: 4 }}>Donna</div>
      <div style={{ fontSize: 11, color: c.success, marginBottom: 28 }}>
        ● {scene === 0 ? "Tri en cours" : scene === 1 ? "Organisation" : "Brouillons prêts"}
      </div>

      <div style={{ fontSize: 9, color: c.textLight, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>
        Dossiers
      </div>
      {FOLDERS.map((f, i) => (
        <motion.div
          key={f.name}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: elapsed > 2 + i * 1.2 ? 1 : 0, x: elapsed > 2 + i * 1.2 ? 0 : -15 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 10px", borderRadius: 8, marginBottom: 4,
            fontSize: 12, color: c.text,
            background: scene === 1 && i === 0 ? c.accentBg : "transparent",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: 3, background: f.color, flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
        </motion.div>
      ))}

      <div style={{ marginTop: 32 }}>
        {navItems.map(item => (
          <motion.div
            key={item.label}
            animate={{
              background: item.active ? c.accentBg : "transparent",
              color: item.active ? c.accent : c.textMuted,
            }}
            style={{ fontSize: 12, padding: "7px 10px", borderRadius: 8, marginBottom: 2 }}
          >
            {item.label}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── SCENE 0: INBOX — "Donna trie vos emails" ───

function InboxScene({ colors: c, t }: { colors: Theme; t: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div style={{
        padding: "18px 24px",
        borderBottom: `1px solid ${c.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: c.text }}>Boîte de réception</span>
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: t > 7 ? 1 : 0, scale: t > 7 ? 1 : 0.8 }}
          transition={{ duration: 0.4 }}
          style={{
            fontSize: 11, fontWeight: 600, color: "#fff",
            background: c.accent, padding: "4px 12px", borderRadius: 12,
          }}
        >
          5 nouveaux
        </motion.span>
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        {EMAILS.map((email, i) => (
          <motion.div
            key={email.sender}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: t > i * 1.5 ? 1 : 0, y: t > i * 1.5 ? 0 : 15 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 24px",
              borderBottom: `1px solid ${c.border}`,
              background: email.urgent && t > 9 ? c.accentBg : "transparent",
              transition: "background 0.5s ease",
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%", background: email.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {email.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: c.text,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {email.sender}
                {email.urgent && t > 8 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ marginLeft: 8, fontSize: 10, color: "#EF4444", fontWeight: 700 }}
                  >
                    URGENT
                  </motion.span>
                )}
              </div>
              <div style={{
                fontSize: 12, color: c.textMuted, marginTop: 2,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {email.subject}
              </div>
            </div>
            <div style={{ fontSize: 11, color: c.textLight, flexShrink: 0 }}>{email.time}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── SCENE 1: DOSSIER — "Donna organise vos dossiers" ───

function DossierScene({ colors: c, t }: { colors: Theme; t: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      {/* Dossier header */}
      <div style={{ padding: "18px 24px", borderBottom: `1px solid ${c.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: "#2563EB" }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: c.text }}>{DOSSIER.name}</span>
          <span style={{ fontSize: 11, color: c.textLight, marginLeft: 4 }}>{DOSSIER.type}</span>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: t > 1 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.6 }}
        >
          {DOSSIER.summary}
        </motion.div>
      </div>

      {/* Content: stats + files + recent emails */}
      <div style={{ flex: 1, padding: "16px 24px", display: "flex", gap: 24, overflow: "hidden" }}>
        {/* Left: Recent exchanges + files */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: t > 2 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: "flex", gap: 24, marginBottom: 20 }}
          >
            {Object.entries(DOSSIER.stats).map(([key, val], i) => (
              <div key={key} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: c.accent }}>{val}</div>
                <div style={{ fontSize: 10, color: c.textLight, marginTop: 2 }}>{key}</div>
              </div>
            ))}
          </motion.div>

          {/* Recent exchanges */}
          <div style={{ fontSize: 10, color: c.textLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Échanges récents
          </div>
          {DOSSIER.recentEmails.map((email, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: t > 3 + i * 1 ? 1 : 0, x: t > 3 + i * 1 ? 0 : 15 }}
              transition={{ duration: 0.4 }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8, marginBottom: 4,
                background: email.urgent ? c.accentBg : "transparent",
                border: `1px solid ${c.border}`,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: c.text }}>
                  {email.sender}
                  {email.urgent && <span style={{ marginLeft: 6, fontSize: 9, color: "#EF4444", fontWeight: 700 }}>URGENT</span>}
                </div>
                <div style={{ fontSize: 11, color: c.textMuted, marginTop: 1 }}>{email.subject}</div>
              </div>
              <div style={{ fontSize: 10, color: c.textLight }}>{email.date}</div>
            </motion.div>
          ))}
        </div>

        {/* Right: Files */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: t > 4 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: 220, flexShrink: 0 }}
        >
          <div style={{ fontSize: 10, color: c.textLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            Pièces jointes
          </div>
          {DOSSIER.files.map((file, i) => (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: t > 5 + i * 0.6 ? 1 : 0, y: t > 5 + i * 0.6 ? 0 : 8 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 8, marginBottom: 4,
                border: `1px solid ${c.border}`,
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: file.type === "PDF" ? "#EF444415" : "#2563EB15",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8, fontWeight: 700,
                color: file.type === "PDF" ? "#EF4444" : "#2563EB",
              }}>
                {file.type}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
              </div>
              <div style={{ fontSize: 9, color: c.textLight }}>{file.date}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── SCENE 2: BRIEFING + BROUILLONS — "Donna crée vos brouillons" ───

function BriefingScene({ colors: c, t }: { colors: Theme; t: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* Greeting */}
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${c.border}` }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: c.text }}>{BRIEFING.greeting}</div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: t > 0.8 ? 1 : 0 }}
          style={{ fontSize: 13, color: c.textMuted, marginTop: 6 }}
        >
          {BRIEFING.summary}
        </motion.div>
      </div>

      {/* Brouillons list */}
      <div style={{ flex: 1, padding: "16px 24px", overflow: "hidden" }}>
        <div style={{ fontSize: 10, color: c.textLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Brouillons prêts à envoyer
        </div>

        {BRIEFING.drafts.map((draft, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: t > 2 + i * 1.5 ? 1 : 0, y: t > 2 + i * 1.5 ? 0 : 12 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              padding: "14px 16px",
              borderRadius: 10,
              border: `1px solid ${c.border}`,
              marginBottom: 10,
              background: i === 0 && t > 8 ? c.accentBg : c.bg,
              transition: "background 0.4s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{draft.recipient}</div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: t > 3 + i * 1.5 ? 1 : 0 }}
                style={{
                  fontSize: 10, fontWeight: 600,
                  color: c.success,
                  background: `${c.success}15`,
                  padding: "2px 8px", borderRadius: 8,
                }}
              >
                ✓ {draft.status}
              </motion.span>
            </div>
            <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>{draft.subject}</div>
            <div style={{ fontSize: 11, color: c.textLight, fontStyle: "italic", lineHeight: 1.5 }}>
              {draft.preview}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats + badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: t > 8 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          padding: "12px 24px",
          borderTop: `1px solid ${c.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 24 }}>
          {BRIEFING.stats.map((s, i) => (
            <div key={i}>
              <span style={{ fontSize: 18, fontWeight: 700, color: c.accent }}>{s.value}</span>
              <span style={{ fontSize: 10, color: c.textLight, marginLeft: 4 }}>{s.label}</span>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: t > 9 ? 1 : 0, scale: t > 9 ? 1 : 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          style={{
            padding: "8px 18px", borderRadius: 10,
            background: c.accent, color: "#fff",
            fontSize: 12, fontWeight: 600,
          }}
        >
          ✓ Votre brief est prêt
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
