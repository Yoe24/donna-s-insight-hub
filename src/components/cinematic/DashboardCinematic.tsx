import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EMAILS, FOLDERS, BRIEFING, ANALYSIS_SUMMARY, CHAT_MESSAGES, TODOS, DRAFT_TEXT, DOSSIER_FILES } from "./cinematic-data"

interface Props {
  theme?: "light" | "dark"
  className?: string
  chromeless?: boolean
}

const CYCLE_DURATION = 25000 // 25s total

// Scene timings (seconds into cycle)
const SCENE_TIMES = [0, 4, 8, 13, 17, 21]

const themes = {
  light: {
    bg: "#FFFFFF", sidebar: "#F9FAFB", card: "#F3F4F6", border: "#E5E7EB",
    text: "#111827", textMuted: "#6B7280", textLight: "#9CA3AF",
    accent: "#2563EB", accentBg: "#EFF6FF", accentLight: "#DBEAFE",
    browserBg: "#F9FAFB", browserBar: "#E5E7EB",
    dot1: "#FF5F57", dot2: "#FFBD2E", dot3: "#27C93F",
    success: "#10B981", successBg: "#ECFDF5",
    chatUser: "#2563EB", chatDonna: "#F3F4F6",
  },
  dark: {
    bg: "#0F0F0F", sidebar: "#1A1A1A", card: "#1F1F1F", border: "#2A2A2A",
    text: "#F9FAFB", textMuted: "#9CA3AF", textLight: "#6B7280",
    accent: "#3B82F6", accentBg: "#0A1628", accentLight: "#1E3A5F",
    browserBg: "#141414", browserBar: "#252525",
    dot1: "#FF5F57", dot2: "#FFBD2E", dot3: "#27C93F",
    success: "#34D399", successBg: "#064E3B",
    chatUser: "#3B82F6", chatDonna: "#1F1F1F",
  },
}

type Theme = typeof themes.dark

export default function DashboardCinematic({ theme = "dark", className = "", chromeless = false }: Props) {
  const [scene, setScene] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const c = themes[theme]

  // Elapsed time in seconds (updates every 100ms for smooth animations)
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 0.1
        if (next >= CYCLE_DURATION / 1000) return 0
        return next
      })
    }, 100)
    return () => clearInterval(timer)
  }, [])

  // Derive scene from elapsed time
  useEffect(() => {
    let currentScene = 0
    for (let i = SCENE_TIMES.length - 1; i >= 0; i--) {
      if (elapsed >= SCENE_TIMES[i]) { currentScene = i; break }
    }
    setScene(currentScene)
  }, [elapsed])

  // Reset on cycle
  useEffect(() => {
    if (elapsed === 0) setScene(0)
  }, [elapsed])

  const sceneElapsed = elapsed - SCENE_TIMES[scene]

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

      {/* Dashboard Container */}
      <div style={{
        background: c.bg,
        border: chromeless ? "none" : `1px solid ${c.border}`,
        borderTop: chromeless ? "none" : "none",
        borderRadius: chromeless ? 12 : "0 0 12px 12px",
        overflow: "hidden", height: 400, display: "flex", position: "relative",
      }}>
        {/* Sidebar */}
        <Sidebar colors={c} scene={scene} elapsed={elapsed} />

        {/* Main Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          <AnimatePresence mode="wait">
            {scene === 0 && <InboxScene key="inbox" colors={c} elapsed={sceneElapsed} />}
            {scene === 1 && <AnalysisScene key="analysis" colors={c} elapsed={sceneElapsed} />}
            {scene === 2 && <ChatScene key="chat" colors={c} elapsed={sceneElapsed} />}
            {scene === 3 && <TodoDraftScene key="todo" colors={c} elapsed={sceneElapsed} />}
            {scene === 4 && <DossierScene key="dossier" colors={c} elapsed={sceneElapsed} />}
            {scene === 5 && <BriefingScene key="briefing" colors={c} elapsed={sceneElapsed} />}
          </AnimatePresence>
        </div>

        {/* Fake Cursor */}
        <FakeCursor colors={c} scene={scene} sceneElapsed={sceneElapsed} />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ─── SIDEBAR ───

function Sidebar({ colors: c, scene, elapsed }: { colors: Theme; scene: number; elapsed: number }) {
  const activeFolder = scene >= 4 ? 0 : -1

  return (
    <div style={{ width: 160, background: c.sidebar, borderRight: `1px solid ${c.border}`, padding: "16px 10px", flexShrink: 0, overflow: "hidden" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 4 }}>Donna</div>
      <motion.div
        animate={{ color: scene >= 1 ? c.accent : c.textLight }}
        style={{ fontSize: 10, marginBottom: 16 }}
      >
        {scene >= 1 ? "● En analyse..." : "En ligne"}
      </motion.div>

      <div style={{ fontSize: 10, color: c.textLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Dossiers</div>
      {FOLDERS.map((f, i) => (
        <motion.div
          key={f.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: elapsed > 1 + i * 0.5 ? 1 : 0, x: elapsed > 1 + i * 0.5 ? 0 : -20 }}
          transition={{ duration: 0.4 }}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 8px", borderRadius: 6, marginBottom: 4,
            fontSize: 11, color: c.text,
            background: activeFolder === i ? c.accentBg : "transparent",
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: 2, background: f.color, flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
          <span style={{ marginLeft: "auto", fontSize: 9, color: c.textLight }}>{f.count}</span>
        </motion.div>
      ))}

      {/* Nav items at bottom */}
      <div style={{ marginTop: 24 }}>
        {["Inbox", "Brouillons", "Briefing"].map((item, i) => (
          <motion.div
            key={item}
            animate={{
              background: (scene === 0 && i === 0) || (scene === 3 && i === 1) || (scene === 5 && i === 2) ? c.accentBg : "transparent",
              color: (scene === 0 && i === 0) || (scene === 3 && i === 1) || (scene === 5 && i === 2) ? c.accent : c.textMuted,
            }}
            style={{ fontSize: 11, padding: "5px 8px", borderRadius: 6, marginBottom: 2, cursor: "default" }}
          >
            {item}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── SCENE 0: INBOX ───

function InboxScene({ colors: c, elapsed }: { colors: Theme; elapsed: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ flex: 1, overflow: "hidden" }}
    >
      {/* Header bar */}
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>Boîte de réception</span>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: elapsed > 2.5 ? 1 : 0, scale: elapsed > 2.5 ? 1 : 0.8 }}
          style={{ fontSize: 10, fontWeight: 600, color: "#fff", background: c.accent, padding: "2px 8px", borderRadius: 10 }}
        >
          5 nouveaux
        </motion.div>
      </div>

      {/* Email list */}
      {EMAILS.map((email, i) => (
        <motion.div
          key={email.sender}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: elapsed > i * 0.5 ? 1 : 0, x: elapsed > i * 0.5 ? 0 : 40 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 16px", borderBottom: `1px solid ${c.border}`,
            background: email.urgent && elapsed > 3 ? c.accentBg : "transparent",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", background: email.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {email.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {email.sender}
                {email.urgent && <span style={{ marginLeft: 6, fontSize: 9, color: "#EF4444", fontWeight: 700 }}>URGENT</span>}
              </div>
              <div style={{ fontSize: 11, color: c.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.subject}</div>
            </div>
            <div style={{ fontSize: 10, color: c.textLight, flexShrink: 0 }}>{email.time}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ─── SCENE 1: ANALYSIS ───

function AnalysisScene({ colors: c, elapsed }: { colors: Theme; elapsed: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ flex: 1, display: "flex", overflow: "hidden" }}
    >
      {/* Email list (dimmed) */}
      <div style={{ flex: 1, overflow: "hidden", opacity: 0.5 }}>
        {EMAILS.slice(0, 3).map((email) => (
          <div key={email.sender} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: `1px solid ${c.border}` }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: email.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {email.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.sender}</div>
              <div style={{ fontSize: 11, color: c.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.subject}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Analysis Panel */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 220, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ background: c.card, borderLeft: `1px solid ${c.border}`, overflow: "hidden", flexShrink: 0 }}
      >
        <div style={{ padding: 14 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ fontSize: 10, color: c.accent, fontWeight: 600, marginBottom: 8 }}
          >
            Donna analyse...
          </motion.div>

          {/* Shimmer loading */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: elapsed > 2 ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            {[80, 60, 90].map((w, i) => (
              <div key={i} style={{ height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${c.border} 25%, ${c.accentBg} 50%, ${c.border} 75%)`, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", width: `${w}%` }} />
            ))}
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: elapsed > 2.2 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontSize: 11, color: c.text, lineHeight: 1.6, marginTop: 8 }}
          >
            {ANALYSIS_SUMMARY}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: elapsed > 3 ? 1 : 0, scale: elapsed > 3 ? 1 : 0.8 }}
            style={{ marginTop: 12, display: "inline-block", padding: "4px 10px", borderRadius: 6, background: c.accent, color: "#fff", fontSize: 10, fontWeight: 600 }}
          >
            Voir le résumé →
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── SCENE 2: CHAT ───

function ChatScene({ colors: c, elapsed }: { colors: Theme; elapsed: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      {/* Chat header */}
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${c.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>D</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: c.text }}>Donna</div>
          <div style={{ fontSize: 9, color: c.success }}>● En ligne</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 10, justifyContent: "flex-end" }}>
        {CHAT_MESSAGES.map((msg, i) => {
          const delay = i * 1.4
          const isUser = msg.from === "user"
          const showTyping = elapsed > delay && elapsed < delay + 0.8
          const showMessage = elapsed > delay + 0.8

          return (
            <div key={i}>
              {/* Typing indicator */}
              <AnimatePresence>
                {showTyping && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                      display: "flex", gap: 3, padding: "8px 12px", borderRadius: 12,
                      background: isUser ? c.chatUser : c.chatDonna,
                      alignSelf: isUser ? "flex-end" : "flex-start",
                      maxWidth: "60%", marginLeft: isUser ? "auto" : 0,
                    }}
                  >
                    {[0, 1, 2].map(d => (
                      <motion.div
                        key={d}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.15 }}
                        style={{ width: 5, height: 5, borderRadius: "50%", background: isUser ? "#fff" : c.textMuted }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message bubble */}
              <AnimatePresence>
                {showMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    style={{
                      padding: "8px 12px", borderRadius: 12,
                      background: isUser ? c.chatUser : c.chatDonna,
                      color: isUser ? "#fff" : c.text,
                      fontSize: 11, lineHeight: 1.5,
                      maxWidth: "75%",
                      marginLeft: isUser ? "auto" : 0,
                    }}
                  >
                    {msg.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Input bar */}
      <div style={{ padding: "8px 16px", borderTop: `1px solid ${c.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, padding: "6px 12px", borderRadius: 8, background: c.card, fontSize: 11, color: c.textLight }}>
          Répondre à Donna...
        </div>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: c.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg>
        </div>
      </div>
    </motion.div>
  )
}

// ─── SCENE 3: TODO + DRAFT ───

function TodoDraftScene({ colors: c, elapsed }: { colors: Theme; elapsed: number }) {
  const typedLength = Math.min(Math.floor(elapsed * 12), DRAFT_TEXT.length)
  const visibleDraft = DRAFT_TEXT.slice(0, typedLength)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ flex: 1, display: "flex", overflow: "hidden" }}
    >
      {/* Left: To-do list */}
      <div style={{ flex: 1, padding: 16, overflow: "hidden" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 12 }}>Tâches du jour</div>
        {TODOS.map((todo, i) => {
          const checkDelay = 0.5 + i * 0.8
          const isChecked = elapsed > checkDelay

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.3, duration: 0.3 }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${c.border}` }}
            >
              <motion.div
                animate={{
                  background: isChecked ? c.success : "transparent",
                  borderColor: isChecked ? c.success : c.border,
                }}
                transition={{ type: "spring", damping: 15, stiffness: 300 }}
                style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: `2px solid ${c.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {isChecked && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 300 }}
                    width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </motion.svg>
                )}
              </motion.div>
              <span style={{
                fontSize: 11, color: c.text,
                textDecoration: isChecked ? "line-through" : "none",
                opacity: isChecked ? 0.6 : 1,
              }}>
                {todo.text}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Right: Draft */}
      <div style={{ width: 240, borderLeft: `1px solid ${c.border}`, padding: 14, overflow: "hidden", flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: c.accent, fontWeight: 600, marginBottom: 4 }}>Brouillon</div>
        <div style={{ fontSize: 10, color: c.textLight, marginBottom: 10 }}>Réponse — Tribunal de Paris</div>
        <div style={{ fontSize: 11, color: c.text, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "ui-serif, Georgia, serif" }}>
          {visibleDraft}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ borderLeft: `2px solid ${c.accent}`, marginLeft: 1 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ─── SCENE 4: DOSSIER ───

function DossierScene({ colors: c, elapsed }: { colors: Theme; elapsed: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ flex: 1, padding: 16, overflow: "hidden" }}
    >
      {/* Dossier header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: "#2563EB" }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>Dupont c/ Dupont</span>
        <span style={{ fontSize: 10, color: c.textLight, marginLeft: 4 }}>Droit de la famille</span>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {[
          { label: "Emails", value: "12" },
          { label: "Documents", value: "5" },
          { label: "Brouillons", value: "3" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.2 }}
            style={{ textAlign: "center" }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: c.accent }}>{s.value}</div>
            <div style={{ fontSize: 9, color: c.textLight }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Files list */}
      <div style={{ fontSize: 10, color: c.textLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Documents</div>
      {DOSSIER_FILES.map((file, i) => (
        <motion.div
          key={file.name}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: elapsed > 0.8 + i * 0.4 ? 1 : 0, x: elapsed > 0.8 + i * 0.4 ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 10px", borderRadius: 6, marginBottom: 4,
            background: i === 0 ? c.accentBg : "transparent",
          }}
        >
          <div style={{
            width: 24, height: 24, borderRadius: 4,
            background: file.type === "pdf" ? "#EF444420" : "#2563EB20",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 8, fontWeight: 700,
            color: file.type === "pdf" ? "#EF4444" : "#2563EB",
          }}>
            {file.type.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: c.text }}>{file.name}</div>
          </div>
          <div style={{ fontSize: 9, color: c.textLight }}>{file.date}</div>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ─── SCENE 5: BRIEFING ───

function BriefingScene({ colors: c, elapsed }: { colors: Theme; elapsed: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ flex: 1, overflow: "hidden" }}
    >
      {/* Briefing card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ padding: "14px 16px", background: c.accentBg, borderBottom: `1px solid ${c.border}` }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 4 }}>{BRIEFING.greeting}</div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: elapsed > 0.5 ? 1 : 0 }}
          style={{ fontSize: 11, color: c.textMuted, marginBottom: 8 }}
        >
          {BRIEFING.summary}
        </motion.div>
        {BRIEFING.bullets.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: elapsed > 1 + i * 0.5 ? 1 : 0, x: elapsed > 1 + i * 0.5 ? 0 : 10 }}
            style={{ fontSize: 11, color: c.text, padding: "2px 0", display: "flex", gap: 6 }}
          >
            <span style={{ color: c.accent }}>•</span> {b}
          </motion.div>
        ))}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: elapsed > 2.5 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: "flex", gap: 16, marginTop: 12 }}
        >
          {BRIEFING.stats.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: c.accent }}>{s.value}</div>
              <div style={{ fontSize: 9, color: c.textLight }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Completion badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: elapsed > 3 ? 1 : 0, scale: elapsed > 3 ? 1 : 0.8 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        style={{
          position: "absolute", bottom: 16, right: 16,
          padding: "10px 18px", borderRadius: 10,
          background: c.accent, color: "#fff",
          fontSize: 12, fontWeight: 600,
          boxShadow: `0 4px 20px ${c.accent}40`,
        }}
      >
        ✓ Votre brief est prêt
      </motion.div>
    </motion.div>
  )
}

// ─── FAKE CURSOR ───

function FakeCursor({ colors: c, scene, sceneElapsed }: { colors: Theme; scene: number; sceneElapsed: number }) {
  // Cursor positions per scene (x, y)
  const positions: Record<number, { x: number[]; y: number[]; times: number[] }> = {
    0: { x: [500, 300, 300], y: [300, 50, 50], times: [0, 0.5, 1] },
    1: { x: [300, 450, 450], y: [50, 200, 200], times: [0, 0.5, 1] },
    2: { x: [450, 400, 400], y: [200, 330, 330], times: [0, 0.5, 1] },
    3: { x: [200, 80, 80], y: [200, 120, 120], times: [0, 0.5, 1] },
    4: { x: [200, 200, 200], y: [200, 100, 100], times: [0, 0.5, 1] },
    5: { x: [300, 300, 300], y: [200, 200, 200], times: [0, 0.5, 1] },
  }

  const pos = positions[scene] || positions[0]
  const progress = Math.min(sceneElapsed / 2, 1)
  const idx = Math.min(Math.floor(progress * (pos.x.length - 1)), pos.x.length - 2)
  const t = (progress * (pos.x.length - 1)) - idx
  const x = pos.x[idx] + (pos.x[idx + 1] - pos.x[idx]) * t
  const y = pos.y[idx] + (pos.y[idx + 1] - pos.y[idx]) * t

  return (
    <motion.div
      animate={{ x, y, opacity: sceneElapsed > 0.3 && sceneElapsed < 3 ? 0.8 : 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ position: "absolute", width: 16, height: 20, zIndex: 20, pointerEvents: "none", left: 160 }}
    >
      <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
        <path d="M0 0L0 16L4.5 12L7.5 19L10 18L7 11L12 10L0 0Z" fill={c.text} stroke={c.bg} strokeWidth="1" />
      </svg>
      {/* Click ripple */}
      <motion.div
        animate={{
          opacity: sceneElapsed > 1.2 && sceneElapsed < 1.7 ? [0, 0.5, 0] : 0,
          scale: sceneElapsed > 1.2 && sceneElapsed < 1.7 ? [0, 1.5, 2] : 0,
        }}
        transition={{ duration: 0.5 }}
        style={{ position: "absolute", top: -5, left: -5, width: 24, height: 24, borderRadius: "50%", border: `2px solid ${c.accent}` }}
      />
    </motion.div>
  )
}
