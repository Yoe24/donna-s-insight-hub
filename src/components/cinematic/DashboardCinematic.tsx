import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Calendar, Folder, CheckSquare } from "lucide-react"

interface Props {
  theme?: "light" | "dark"
  className?: string
  chromeless?: boolean
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const CYCLE_DURATION = 20000 // 20s total loop
const TICK_MS = 80

// Phase boundaries in ms
const PHASE = {
  input:   { start: 0,     end: 4000  },
  process: { start: 4000,  end: 8000  },
  outputs: { start: 8000,  end: 14000 },
  hold:    { start: 14000, end: 18000 },
  reset:   { start: 18000, end: 20000 },
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const S = {
  bg:        "#fafafa",
  card:      "#ffffff",
  cardDonna: "#f5f5f5",
  border:    "#eeeeee",
  text:      "#1a1a1a",
  muted:     "#999999",
  line:      "#dddddd",
  dot:       "#999999",
  shadow:    "0 2px 12px rgba(0,0,0,0.06)",
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function fadeIn(delay = 0, duration = 0.8) {
  return {
    initial:    { opacity: 0, scale: 0.97 },
    animate:    { opacity: 1, scale: 1 },
    transition: { duration, delay, ease: "easeOut" },
  }
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return mobile
}

// ─── TRAVELLING DOT (CSS keyframes via inline style) ──────────────────────────

let stylesInjected = false
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return
  stylesInjected = true
  const style = document.createElement("style")
  style.textContent = `
    @keyframes travelX {
      0%   { left: 0%;   opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { left: 100%; opacity: 0; }
    }
    @keyframes travelY {
      0%   { top: 0%;   opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
    @keyframes pulse-line {
      0%, 100% { opacity: 0.4; }
      50%       { opacity: 1;   }
    }
  `
  document.head.appendChild(style)
}

// ─── CONNECTOR LINE ──────────────────────────────────────────────────────────

function ConnectorH({ active, showDots }: { active: boolean; showDots: boolean }) {
  useEffect(() => { injectStyles() }, [])
  return (
    <div style={{
      position: "relative",
      width: 64,
      height: 2,
      background: active ? S.line : "transparent",
      transition: "background 0.4s ease",
      alignSelf: "center",
      flexShrink: 0,
    }}>
      {/* Arrowhead */}
      {active && (
        <div style={{
          position: "absolute",
          right: -1,
          top: "50%",
          transform: "translateY(-50%)",
          width: 0,
          height: 0,
          borderTop: "4px solid transparent",
          borderBottom: "4px solid transparent",
          borderLeft: `6px solid ${S.line}`,
        }} />
      )}
      {/* Travelling dot */}
      {showDots && (
        <div style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: S.dot,
          animation: "travelX 1.4s ease-in-out infinite",
        }} />
      )}
    </div>
  )
}

function ConnectorV({ active, showDots }: { active: boolean; showDots: boolean }) {
  useEffect(() => { injectStyles() }, [])
  return (
    <div style={{
      position: "relative",
      height: 32,
      width: 2,
      background: active ? S.line : "transparent",
      transition: "background 0.4s ease",
      alignSelf: "center",
      flexShrink: 0,
    }}>
      {active && (
        <div style={{
          position: "absolute",
          bottom: -1,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: `6px solid ${S.line}`,
        }} />
      )}
      {showDots && (
        <div style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: S.dot,
          animation: "travelY 1.4s ease-in-out infinite",
        }} />
      )}
    </div>
  )
}

// ─── INPUT CARD ───────────────────────────────────────────────────────────────

function InputCard({ visible }: { visible: boolean }) {
  const emails = [
    "Greffe TJ Paris",
    "Cabinet Dupont & Ass.",
    "Mme Dubois — Syndic",
    "Huissier Leclerc",
  ]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div {...fadeIn(0)} style={{ width: 148, flexShrink: 0 }}>
          <div style={{
            background: S.card,
            border: `1px solid ${S.border}`,
            borderRadius: 12,
            boxShadow: S.shadow,
            padding: "14px 14px 12px",
          }}>
            {/* Icon + title */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "#F3F4F6",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Mail size={14} color={S.text} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: S.text }}>Votre boîte mail</span>
            </div>

            {/* Email lines */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {emails.map((em, i) => (
                <motion.div
                  key={em}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.25, duration: 0.5 }}
                  style={{
                    height: 8,
                    borderRadius: 99,
                    background: "#eeeeee",
                    width: `${75 + (i % 2) * 15}%`,
                  }}
                />
              ))}
            </div>

            {/* Counter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              style={{ marginTop: 10, fontSize: 11, color: S.muted, fontVariantNumeric: "tabular-nums" }}
            >
              89 emails
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── DONNA CARD ───────────────────────────────────────────────────────────────

function DonnaCard({ visible, processing }: { visible: boolean; processing: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div {...fadeIn(0, 0.6)} style={{ flexShrink: 0 }}>
          <div style={{
            background: S.cardDonna,
            border: `1px solid ${S.border}`,
            borderRadius: 14,
            boxShadow: S.shadow,
            padding: "18px 20px",
            textAlign: "center",
            minWidth: 96,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: S.text, letterSpacing: -0.5, marginBottom: 8 }}>
              Donna
            </div>
            {/* Activity pulse */}
            <div style={{ display: "flex", justifyContent: "center", gap: 3 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: processing ? S.text : "#cccccc",
                    animation: processing ? `pulse-line 1.2s ease-in-out ${i * 0.3}s infinite` : "none",
                    transition: "background 0.4s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── OUTPUT CARDS ─────────────────────────────────────────────────────────────

function CalendarCard({ visible }: { visible: boolean }) {
  const entries = [
    { day: "22 avr", label: "Audience Dupont" },
    { day: "24 avr", label: "Conclusions Martin" },
    { day: "30 avr", label: "Médiation Dubois" },
  ]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div {...fadeIn(0)}>
          <div style={{
            background: S.card,
            border: `1px solid ${S.border}`,
            borderRadius: 12,
            boxShadow: S.shadow,
            padding: "12px 14px",
            width: 160,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Calendar size={13} color={S.muted} />
              <span style={{ fontSize: 11, fontWeight: 600, color: S.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Vos échéances
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {entries.map((e, i) => (
                <motion.div
                  key={e.day}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3, duration: 0.5 }}
                  style={{ display: "flex", gap: 8, alignItems: "baseline" }}
                >
                  <span style={{ fontSize: 10, color: S.muted, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{e.day}</span>
                  <span style={{ fontSize: 11, color: S.text, fontWeight: 500 }}>{e.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function DossiersCard({ visible }: { visible: boolean }) {
  const dossiers = [
    { name: "Martin", matter: "Prud'hommes", color: "#DBEAFE" },
    { name: "Dupont", matter: "Référé",      color: "#FEF9C3" },
    { name: "Dubois", matter: "Copropriété", color: "#DCFCE7" },
  ]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div {...fadeIn(0)}>
          <div style={{
            background: S.card,
            border: `1px solid ${S.border}`,
            borderRadius: 12,
            boxShadow: S.shadow,
            padding: "12px 14px",
            width: 160,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Folder size={13} color={S.muted} />
              <span style={{ fontSize: 11, fontWeight: 600, color: S.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Dossiers classés
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {dossiers.map((d, i) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3, duration: 0.5 }}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}
                >
                  <div style={{
                    width: 20, height: 16, borderRadius: 4,
                    background: d.color,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 11, color: S.text, fontWeight: 500 }}>
                    {d.name} <span style={{ color: S.muted, fontWeight: 400 }}>– {d.matter}</span>
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function TodoCard({ visible }: { visible: boolean }) {
  const tasks = [
    "Répondre au greffe",
    "Valider brouillon Dupont",
    "Relire conclusions",
  ]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div {...fadeIn(0)}>
          <div style={{
            background: S.card,
            border: `1px solid ${S.border}`,
            borderRadius: 12,
            boxShadow: S.shadow,
            padding: "12px 14px",
            width: 160,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <CheckSquare size={13} color={S.muted} />
              <span style={{ fontSize: 11, fontWeight: 600, color: S.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Actions du jour
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {tasks.map((task, i) => (
                <motion.div
                  key={task}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3, duration: 0.5 }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 7 }}
                >
                  <div style={{
                    width: 12, height: 12, borderRadius: 3,
                    border: `1.5px solid ${S.line}`,
                    flexShrink: 0, marginTop: 1,
                  }} />
                  <span style={{ fontSize: 11, color: S.text }}>{task}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── DESKTOP LAYOUT ───────────────────────────────────────────────────────────

function DesktopPipeline({ ms }: { ms: number }) {
  const showInput    = ms >= PHASE.input.start
  const showArrow1   = ms >= PHASE.process.start
  const showDots1    = ms >= PHASE.process.start + 200 && ms < PHASE.outputs.start
  const showDonna    = ms >= PHASE.process.start
  const processing   = ms >= PHASE.process.start && ms < PHASE.outputs.start
  const showArrows2  = ms >= PHASE.outputs.start
  const showDots2    = ms >= PHASE.outputs.start + 200 && ms < PHASE.hold.start
  const showCalendar = ms >= PHASE.outputs.start
  const showDossiers = ms >= PHASE.outputs.start + 1500
  const showTodo     = ms >= PHASE.outputs.start + 3000
  const showTagline  = ms >= PHASE.hold.start

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "32px 24px" }}>
      {/* Main row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, width: "100%" }}>
        {/* INPUT */}
        <InputCard visible={showInput} />

        {/* Arrow 1 */}
        <div style={{ marginLeft: 8, marginRight: 8 }}>
          <ConnectorH active={showArrow1} showDots={showDots1} />
        </div>

        {/* DONNA */}
        <DonnaCard visible={showDonna} processing={processing} />

        {/* Arrow 2 block: vertical stack of 3 outputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginLeft: 8 }}>
          {/* Line to Calendar */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <ConnectorH active={showArrows2} showDots={showDots2} />
            <div style={{ marginLeft: 8 }}>
              <CalendarCard visible={showCalendar} />
            </div>
          </div>

          {/* Line to Dossiers */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <ConnectorH active={showArrows2} showDots={showDots2} />
            <div style={{ marginLeft: 8 }}>
              <DossiersCard visible={showDossiers} />
            </div>
          </div>

          {/* Line to Todo */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <ConnectorH active={showArrows2} showDots={showDots2} />
            <div style={{ marginLeft: 8 }}>
              <TodoCard visible={showTodo} />
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <AnimatePresence>
        {showTagline && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              marginTop: 32,
              fontSize: 13,
              color: S.muted,
              textAlign: "center",
            }}
          >
            Connectez votre boîte mail. Donna s'occupe du reste.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── MOBILE LAYOUT ────────────────────────────────────────────────────────────

function MobilePipeline({ ms }: { ms: number }) {
  const showInput    = ms >= PHASE.input.start
  const showArrow1   = ms >= PHASE.process.start
  const showDots1    = ms >= PHASE.process.start + 200 && ms < PHASE.outputs.start
  const showDonna    = ms >= PHASE.process.start
  const processing   = ms >= PHASE.process.start && ms < PHASE.outputs.start
  const showArrows2  = ms >= PHASE.outputs.start
  const showDots2    = ms >= PHASE.outputs.start + 200 && ms < PHASE.hold.start
  const showCalendar = ms >= PHASE.outputs.start
  const showDossiers = ms >= PHASE.outputs.start + 1500
  const showTodo     = ms >= PHASE.outputs.start + 3000
  const showTagline  = ms >= PHASE.hold.start

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "24px 16px", gap: 0 }}>
      <InputCard visible={showInput} />

      <ConnectorV active={showArrow1} showDots={showDots1} />

      <DonnaCard visible={showDonna} processing={processing} />

      <ConnectorV active={showArrows2} showDots={showDots2} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }}>
        <CalendarCard visible={showCalendar} />
        <DossiersCard visible={showDossiers} />
        <TodoCard     visible={showTodo} />
      </div>

      <AnimatePresence>
        {showTagline && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{ marginTop: 24, fontSize: 12, color: S.muted, textAlign: "center" }}
          >
            Connectez votre boîte mail. Donna s'occupe du reste.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function DashboardCinematic({ className = "" }: Props) {
  const [ms, setMs] = useState(0)
  const [globalVisible, setGlobalVisible] = useState(true)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    tickRef.current = setInterval(() => {
      setMs((prev) => {
        const next = prev + TICK_MS
        if (next >= CYCLE_DURATION) {
          // Trigger reset fade
          setGlobalVisible(false)
          setTimeout(() => {
            setMs(0)
            setGlobalVisible(true)
          }, 600)
          return prev // hold during fade
        }
        return next
      })
    }, TICK_MS)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [])

  return (
    <div
      className={className}
      style={{
        width: "100%",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
        border: `1px solid rgba(0,0,0,0.07)`,
        background: S.bg,
        minHeight: isMobile ? 480 : 340,
      }}
    >
      <motion.div
        animate={{ opacity: globalVisible ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ width: "100%", minHeight: "inherit" }}
      >
        {isMobile
          ? <MobilePipeline ms={ms} />
          : <DesktopPipeline ms={ms} />
        }
      </motion.div>
    </div>
  )
}
