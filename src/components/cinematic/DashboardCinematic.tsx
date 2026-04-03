import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EMAILS, FOLDERS, BRIEFING, CHAT_MESSAGES, DRAFT_TEXT } from "./cinematic-data"

interface Props {
  theme?: "light" | "dark"
  className?: string
  chromeless?: boolean
}

const CYCLE_DURATION = 36 // 36s — 3 scenes, 12s each

const DONNA_STATUS = [
  "Donna trie vos emails...",
  "Donna rédige un brouillon...",
  "Donna prépare votre brief...",
]

const themes = {
  light: {
    bg: "#FFFFFF", sidebar: "#F9FAFB", card: "#F3F4F6", border: "#E5E7EB",
    text: "#111827", textMuted: "#6B7280", textLight: "#9CA3AF",
    accent: "#2563EB", accentBg: "#EFF6FF",
    success: "#10B981",
    chatUser: "#2563EB", chatDonna: "#F3F4F6",
  },
  dark: {
    bg: "#0F0F0F", sidebar: "#1A1A1A", card: "#1F1F1F", border: "#2A2A2A",
    text: "#F9FAFB", textMuted: "#9CA3AF", textLight: "#6B7280",
    accent: "#3B82F6", accentBg: "#0A1628",
    success: "#34D399",
    chatUser: "#3B82F6", chatDonna: "#1F1F1F",
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
      {/* Dashboard Container — tall */}
      <div style={{
        background: c.bg,
        height: 520,
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Sidebar */}
        <Sidebar colors={c} scene={scene} elapsed={elapsed} />

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden", position: "relative" }}>
          <AnimatePresence mode="wait">
            {scene === 0 && <InboxScene key="inbox" colors={c} t={sceneTime} />}
            {scene === 1 && <ChatDraftScene key="chat" colors={c} t={sceneTime} />}
            {scene === 2 && <BriefingScene key="briefing" colors={c} t={sceneTime} />}
          </AnimatePresence>
        </div>

        {/* Donna Avatar — the star of the show */}
        <DonnaAvatar colors={c} scene={scene} sceneTime={sceneTime} />
      </div>
    </div>
  )
}

// ─── DONNA AVATAR — Replaces cursor, shows it's an AI agent ───

function DonnaAvatar({ colors: c, scene, sceneTime }: { colors: Theme; scene: number; sceneTime: number }) {
  const status = DONNA_STATUS[scene]

  // Position per scene — Donna moves to where she's working
  const positions = [
    { x: 340, y: 80 },   // Scene 0: near emails
    { x: 300, y: 180 },  // Scene 1: near chat area
    { x: 400, y: 100 },  // Scene 2: near briefing
  ]
  const pos = positions[scene]

  // Donna moves slightly within each scene
  const offsetY = Math.sin(sceneTime * 0.5) * 8
  const pulseActive = (scene === 0 && sceneTime > 2 && sceneTime < 10) ||
                      (scene === 1 && sceneTime > 1 && sceneTime < 8) ||
                      (scene === 2 && sceneTime > 1 && sceneTime < 9)

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
      {/* Avatar circle */}
      <motion.div
        animate={{
          boxShadow: pulseActive
            ? ["0 0 0px #2563EB40", "0 0 24px #2563EB50", "0 0 0px #2563EB40"]
            : "0 0 0px #2563EB40",
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: c.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          color: "#fff",
          flexShrink: 0,
          border: "2px solid #fff",
        }}
      >
        D
      </motion.div>

      {/* Status pill */}
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
        ● {scene === 0 ? "Analyse en cours" : scene === 1 ? "Rédaction" : "Brief prêt"}
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
            background: scene === 2 && i === 0 ? c.accentBg : "transparent",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: 3, background: f.color, flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
        </motion.div>
      ))}

      {/* Bottom nav */}
      <div style={{ marginTop: 32 }}>
        {[
          { label: "Inbox", active: scene === 0 },
          { label: "Brouillons", active: scene === 1 },
          { label: "Briefing", active: scene === 2 },
        ].map(item => (
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

// ─── SCENE 0: INBOX ───

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
            animate={{
              opacity: t > i * 1.5 ? 1 : 0,
              y: t > i * 1.5 ? 0 : 15,
            }}
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

// ─── SCENE 1: CHAT + DRAFT ───

function ChatDraftScene({ colors: c, t }: { colors: Theme; t: number }) {
  const draftStart = 7
  const typedLength = t > draftStart ? Math.min(Math.floor((t - draftStart) * 8), DRAFT_TEXT.length) : 0
  const visibleDraft = DRAFT_TEXT.slice(0, typedLength)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* Chat area */}
      <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: c.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#fff",
          }}>
            D
          </div>
          <div>
            <span style={{ fontSize: 14, fontWeight: 600, color: c.text }}>Donna</span>
            <span style={{ fontSize: 10, color: c.success, marginLeft: 8 }}>● En ligne</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {CHAT_MESSAGES.map((msg, i) => {
            const showAt = i * 2
            const isUser = msg.from === "user"

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: t > showAt ? 1 : 0, y: t > showAt ? 0 : 12 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  padding: "12px 16px",
                  borderRadius: 16,
                  background: isUser ? c.chatUser : c.chatDonna,
                  color: isUser ? "#fff" : c.text,
                  fontSize: 13, lineHeight: 1.6,
                  maxWidth: "80%",
                  alignSelf: isUser ? "flex-end" : "flex-start",
                }}
              >
                {msg.text}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Draft */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: t > draftStart - 0.5 ? 1 : 0, y: t > draftStart - 0.5 ? 0 : 10 }}
        transition={{ duration: 0.5 }}
        style={{
          borderTop: `1px solid ${c.border}`,
          padding: "16px 24px",
          background: c.card,
        }}
      >
        <div style={{ fontSize: 11, color: c.accent, fontWeight: 600, marginBottom: 8 }}>
          ✎ Brouillon en cours...
        </div>
        <div style={{
          fontSize: 13, color: c.text, lineHeight: 1.8,
          fontFamily: "ui-serif, Georgia, serif",
          minHeight: 50,
        }}>
          {visibleDraft}
          {typedLength < DRAFT_TEXT.length && typedLength > 0 && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{ borderLeft: `2px solid ${c.accent}`, marginLeft: 1 }}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── SCENE 2: BRIEFING ───

function BriefingScene({ colors: c, t }: { colors: Theme; t: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div style={{ padding: "24px 28px", borderBottom: `1px solid ${c.border}` }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{ fontSize: 18, fontWeight: 600, color: c.text }}
        >
          {BRIEFING.greeting}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: t > 1 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          style={{ fontSize: 13, color: c.textMuted, marginTop: 8, lineHeight: 1.6 }}
        >
          {BRIEFING.summary}
        </motion.div>
      </div>

      <div style={{ padding: "20px 28px", flex: 1 }}>
        {BRIEFING.bullets.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: t > 2.5 + i * 1.5 ? 1 : 0, x: t > 2.5 + i * 1.5 ? 0 : 12 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              fontSize: 13, color: c.text, padding: "10px 0",
              display: "flex", gap: 10, alignItems: "flex-start",
              borderBottom: `1px solid ${c.border}`,
              lineHeight: 1.5,
            }}
          >
            <span style={{ color: c.accent, fontWeight: 700, flexShrink: 0, fontSize: 14 }}>•</span>
            <span>{b}</span>
          </motion.div>
        ))}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: t > 7 ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ display: "flex", gap: 32, marginTop: 32, justifyContent: "center" }}
        >
          {BRIEFING.stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: t > 7.5 + i * 0.5 ? 1 : 0, scale: t > 7.5 + i * 0.5 ? 1 : 0.9 }}
              transition={{ duration: 0.4 }}
              style={{ textAlign: "center" }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: c.accent }}>{s.value}</div>
              <div style={{ fontSize: 11, color: c.textLight, marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Final badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: t > 9 ? 1 : 0, scale: t > 9 ? 1 : 0.9 }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        style={{
          position: "absolute", bottom: 24, right: 24,
          padding: "12px 24px", borderRadius: 12,
          background: c.accent, color: "#fff",
          fontSize: 14, fontWeight: 600,
          boxShadow: `0 4px 24px ${c.accent}30`,
        }}
      >
        ✓ Votre brief est prêt
      </motion.div>
    </motion.div>
  )
}
