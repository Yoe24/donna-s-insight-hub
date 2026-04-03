import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EMAILS, FOLDERS, BRIEFING, CHAT_MESSAGES, DRAFT_TEXT } from "./cinematic-data"

interface Props {
  theme?: "light" | "dark"
  className?: string
  chromeless?: boolean
}

const CYCLE_DURATION = 36 // 36s total — 3 scenes, 12s each

const themes = {
  light: {
    bg: "#FFFFFF", sidebar: "#F9FAFB", card: "#F3F4F6", border: "#E5E7EB",
    text: "#111827", textMuted: "#6B7280", textLight: "#9CA3AF",
    accent: "#2563EB", accentBg: "#EFF6FF",
    browserBg: "#F9FAFB", browserBar: "#E5E7EB",
    dot1: "#FF5F57", dot2: "#FFBD2E", dot3: "#27C93F",
    success: "#10B981",
    chatUser: "#2563EB", chatDonna: "#F3F4F6",
  },
  dark: {
    bg: "#0F0F0F", sidebar: "#1A1A1A", card: "#1F1F1F", border: "#2A2A2A",
    text: "#F9FAFB", textMuted: "#9CA3AF", textLight: "#6B7280",
    accent: "#3B82F6", accentBg: "#0A1628",
    browserBg: "#141414", browserBar: "#252525",
    dot1: "#FF5F57", dot2: "#FFBD2E", dot3: "#27C93F",
    success: "#34D399",
    chatUser: "#3B82F6", chatDonna: "#1F1F1F",
  },
}

type Theme = typeof themes.dark

export default function DashboardCinematic({ theme = "dark", className = "", chromeless = false }: Props) {
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
    <div className={className} style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
      {/* Browser Chrome */}
      {!chromeless && (
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
      )}

      {/* Fixed-size dashboard container */}
      <div style={{
        background: c.bg,
        border: chromeless ? "none" : `1px solid ${c.border}`,
        borderTop: chromeless ? "none" : "none",
        borderRadius: chromeless ? 12 : "0 0 12px 12px",
        overflow: "hidden",
        height: 400,
        display: "flex",
        position: "relative",
      }}>
        {/* Sidebar — always visible, fixed width */}
        <Sidebar colors={c} scene={scene} elapsed={elapsed} />

        {/* Main content — fixed area, scenes crossfade inside */}
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden", position: "relative" }}>
          <AnimatePresence mode="wait">
            {scene === 0 && <InboxScene key="inbox" colors={c} t={sceneTime} />}
            {scene === 1 && <ChatDraftScene key="chat" colors={c} t={sceneTime} />}
            {scene === 2 && <BriefingScene key="briefing" colors={c} t={sceneTime} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─── SIDEBAR (always same width, never animates size) ───

function Sidebar({ colors: c, scene, elapsed }: { colors: Theme; scene: number; elapsed: number }) {
  return (
    <div style={{
      width: 150, minWidth: 150, maxWidth: 150,
      background: c.sidebar,
      borderRight: `1px solid ${c.border}`,
      padding: "16px 10px",
      overflow: "hidden",
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 4 }}>Donna</div>
      <div style={{ fontSize: 10, color: scene >= 1 ? c.accent : c.success, marginBottom: 20 }}>
        {scene === 0 ? "● En ligne" : scene === 1 ? "● En analyse..." : "● Brief prêt"}
      </div>

      <div style={{ fontSize: 9, color: c.textLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
        Dossiers
      </div>
      {FOLDERS.map((f, i) => (
        <motion.div
          key={f.name}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: elapsed > 2 + i * 1 ? 1 : 0, x: elapsed > 2 + i * 1 ? 0 : -15 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 8px", borderRadius: 6, marginBottom: 3,
            fontSize: 11, color: c.text,
            background: scene === 2 && i === 0 ? c.accentBg : "transparent",
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: 2, background: f.color, flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
        </motion.div>
      ))}
    </div>
  )
}

// ─── SCENE 0: INBOX (0-12s) ───
// Emails arrive slowly, one by one. Urgent badges highlight. Simple & airy.

function InboxScene({ colors: c, t }: { colors: Theme; t: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* Top bar */}
      <div style={{
        padding: "14px 20px",
        borderBottom: `1px solid ${c.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: c.text }}>Boîte de réception</span>
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: t > 7 ? 1 : 0, scale: t > 7 ? 1 : 0.8 }}
          transition={{ duration: 0.4 }}
          style={{
            fontSize: 10, fontWeight: 600, color: "#fff",
            background: c.accent, padding: "3px 10px", borderRadius: 10,
          }}
        >
          5 nouveaux
        </motion.span>
      </div>

      {/* Emails — one every 1.5s, plenty of space */}
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
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 20px",
              borderBottom: `1px solid ${c.border}`,
              background: email.urgent && t > 9 ? c.accentBg : "transparent",
              transition: "background 0.5s ease",
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: email.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {email.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: c.text,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {email.sender}
                {email.urgent && t > 8 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ marginLeft: 8, fontSize: 9, color: "#EF4444", fontWeight: 700 }}
                  >
                    URGENT
                  </motion.span>
                )}
              </div>
              <div style={{
                fontSize: 11, color: c.textMuted, marginTop: 1,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {email.subject}
              </div>
            </div>
            <div style={{ fontSize: 10, color: c.textLight, flexShrink: 0 }}>{email.time}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── SCENE 1: CHAT + DRAFT (12-24s) ───
// Donna chats, then a draft appears below. No side panels.

function ChatDraftScene({ colors: c, t }: { colors: Theme; t: number }) {
  // Draft starts typing at t=7s
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
      <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Chat header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", background: c.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff",
          }}>
            D
          </div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: c.text }}>Donna</span>
            <span style={{ fontSize: 9, color: c.success, marginLeft: 6 }}>● En ligne</span>
          </div>
        </div>

        {/* Chat messages — one every 2s, slow and clear */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CHAT_MESSAGES.map((msg, i) => {
            const showAt = i * 2
            const isUser = msg.from === "user"

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: t > showAt ? 1 : 0,
                  y: t > showAt ? 0 : 10,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  background: isUser ? c.chatUser : c.chatDonna,
                  color: isUser ? "#fff" : c.text,
                  fontSize: 12, lineHeight: 1.5,
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

      {/* Draft preview — appears at t=7s, types slowly */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: t > draftStart - 0.5 ? 1 : 0, y: t > draftStart - 0.5 ? 0 : 10 }}
        transition={{ duration: 0.5 }}
        style={{
          borderTop: `1px solid ${c.border}`,
          padding: "12px 20px",
          background: c.card,
        }}
      >
        <div style={{ fontSize: 10, color: c.accent, fontWeight: 600, marginBottom: 6 }}>
          ✎ Brouillon en cours...
        </div>
        <div style={{
          fontSize: 11, color: c.text, lineHeight: 1.7,
          fontFamily: "ui-serif, Georgia, serif",
          minHeight: 40,
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

// ─── SCENE 2: BRIEFING (24-36s) ───
// Morning recap with stats. Clean, final, satisfying.

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{ fontSize: 15, fontWeight: 600, color: c.text }}
        >
          {BRIEFING.greeting}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: t > 1 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          style={{ fontSize: 12, color: c.textMuted, marginTop: 6, lineHeight: 1.5 }}
        >
          {BRIEFING.summary}
        </motion.div>
      </div>

      {/* Bullets — appear one by one */}
      <div style={{ padding: "16px 24px", flex: 1 }}>
        {BRIEFING.bullets.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: t > 2.5 + i * 1.5 ? 1 : 0, x: t > 2.5 + i * 1.5 ? 0 : 12 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              fontSize: 12, color: c.text, padding: "8px 0",
              display: "flex", gap: 8, alignItems: "flex-start",
              borderBottom: `1px solid ${c.border}`,
            }}
          >
            <span style={{ color: c.accent, fontWeight: 700, flexShrink: 0 }}>•</span>
            <span style={{ lineHeight: 1.5 }}>{b}</span>
          </motion.div>
        ))}

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: t > 7 ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ display: "flex", gap: 24, marginTop: 24, justifyContent: "center" }}
        >
          {BRIEFING.stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: t > 7.5 + i * 0.5 ? 1 : 0, scale: t > 7.5 + i * 0.5 ? 1 : 0.9 }}
              transition={{ duration: 0.4 }}
              style={{ textAlign: "center" }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: c.accent }}>{s.value}</div>
              <div style={{ fontSize: 10, color: c.textLight, marginTop: 2 }}>{s.label}</div>
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
          position: "absolute", bottom: 20, right: 20,
          padding: "10px 20px", borderRadius: 10,
          background: c.accent, color: "#fff",
          fontSize: 13, fontWeight: 600,
          boxShadow: `0 4px 24px ${c.accent}30`,
        }}
      >
        ✓ Votre brief est prêt
      </motion.div>
    </motion.div>
  )
}
