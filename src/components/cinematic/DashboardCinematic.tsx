import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Calendar, Folder, CheckSquare } from "lucide-react"

interface Props {
  theme?: "light" | "dark"
  className?: string
  chromeless?: boolean
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const CYCLE_DURATION = 24000 // 24s total loop

// Phase boundaries in ms
const PHASE = {
  input:   { start: 0,     end: 5000  },
  connect: { start: 5000,  end: 9000  },
  outputs: { start: 9000,  end: 16000 },
  hold:    { start: 16000, end: 21000 },
  fadeOut: { start: 21000, end: 24000 },
}

const TICK_MS = 80

// ─── STYLES ──────────────────────────────────────────────────────────────────

const S = {
  bg:         "#0f0f0f",
  glass:      "rgba(255,255,255,0.05)",
  glassBorder:"rgba(255,255,255,0.08)",
  text:       "#ffffff",
  muted:      "#888888",
  mutedLight: "#cccccc",
  line:       "rgba(255,255,255,0.15)",
  glow:       "0 0 8px rgba(255,255,255,0.5)",
  dotRed:     "#ef4444",
  dotOrange:  "#f97316",
  dotGreen:   "#22c55e",
  dotBlue:    "#3b82f6",
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

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
    @keyframes pulseDot {
      0%, 100% { opacity: 0.3; transform: scale(0.8); }
      50%       { opacity: 1;   transform: scale(1.1); }
    }
    @keyframes glowPulse {
      0%, 100% { box-shadow: 0 0 4px rgba(255,255,255,0.3); }
      50%       { box-shadow: 0 0 12px rgba(255,255,255,0.7); }
    }
  `
  document.head.appendChild(style)
}

// ─── GLASS CIRCLE ─────────────────────────────────────────────────────────────

function GlassCircle({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: S.glass,
      border: `1px solid ${S.glassBorder}`,
      backdropFilter: "blur(10px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      {children}
    </div>
  )
}

// ─── CONNECTOR HORIZONTAL (draws from left to right) ──────────────────────────

function ConnectorH({ active, showDot, width = 64 }: { active: boolean; showDot: boolean; width?: number }) {
  useEffect(() => { injectStyles() }, [])
  return (
    <div style={{
      position: "relative",
      width: width,
      height: 1,
      flexShrink: 0,
      alignSelf: "center",
      overflow: "visible",
    }}>
      {/* Line drawing animation */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 1,
        width: active ? "100%" : "0%",
        background: S.line,
        transition: active ? "width 1.2s ease-out" : "none",
      }} />
      {/* Travelling dot */}
      {showDot && (
        <div style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: S.glow,
          animation: "travelX 1.6s ease-in-out infinite",
        }} />
      )}
    </div>
  )
}

// ─── CONNECTOR VERTICAL (draws from top to bottom) ────────────────────────────

function ConnectorV({ active, showDot, height = 32 }: { active: boolean; showDot: boolean; height?: number }) {
  useEffect(() => { injectStyles() }, [])
  return (
    <div style={{
      position: "relative",
      height: height,
      width: 1,
      flexShrink: 0,
      alignSelf: "center",
      overflow: "visible",
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1,
        height: active ? "100%" : "0%",
        background: S.line,
        transition: active ? "height 1.2s ease-out" : "none",
      }} />
      {showDot && (
        <div style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: S.glow,
          animation: "travelY 1.6s ease-in-out infinite",
        }} />
      )}
    </div>
  )
}

// ─── INPUT CARD ───────────────────────────────────────────────────────────────

function InputCard({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flexShrink: 0 }}
        >
          <GlassCircle size={48}>
            <Mail size={20} color={S.text} />
          </GlassCircle>
          <span style={{ fontSize: 14, color: S.text, fontWeight: 400 }}>Votre boîte mail</span>
          {/* Email skeleton lines */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 120 }}>
            {[75, 60, 80, 65].map((pct, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.35, duration: 0.8 }}
                style={{
                  height: 6,
                  borderRadius: 99,
                  background: "rgba(255,255,255,0.1)",
                  width: `${pct}%`,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── DONNA NODE ───────────────────────────────────────────────────────────────

function DonnaNode({ visible, processing }: { visible: boolean; processing: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0 }}
        >
          {/* D circle */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: S.glass,
            border: `1px solid ${S.glassBorder}`,
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: processing ? "glowPulse 2s ease-in-out infinite" : "none",
          }}>
            <span style={{ fontSize: 28, fontWeight: 300, color: S.text, letterSpacing: "-0.5px" }}>D</span>
          </div>
          {/* Processing label */}
          {processing ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: S.muted }}>Analyse en cours</span>
              <div style={{ display: "flex", gap: 3 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: "50%",
                      background: S.muted,
                      animation: `pulseDot 1.4s ease-in-out ${i * 0.25}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <span style={{ fontSize: 12, color: S.muted }}>Donna</span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── OUTPUT CARDS ─────────────────────────────────────────────────────────────

function CalendarOutput({ visible }: { visible: boolean }) {
  const entries = [
    { text: "22 avr — Audience Dupont",    dot: S.dotRed    },
    { text: "24 avr — Conclusions Martin", dot: S.dotOrange },
    { text: "30 avr — Médiation Dubois",   dot: S.dotGreen  },
  ]
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background: S.glass,
            border: `1px solid ${S.glassBorder}`,
            backdropFilter: "blur(10px)",
            borderRadius: 16,
            padding: "12px 14px",
            width: 170,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <GlassCircle size={28}>
              <Calendar size={13} color={S.mutedLight} />
            </GlassCircle>
            <span style={{ fontSize: 14, color: S.text, fontWeight: 400 }}>Vos échéances</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {entries.map((e, i) => (
              <motion.div
                key={e.text}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.5, duration: 0.5 }}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: e.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: S.mutedLight }}>{e.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function DossiersOutput({ visible }: { visible: boolean }) {
  const items = [
    { text: "Martin — Prud'hommes", color: S.dotBlue   },
    { text: "Dupont — Référé",      color: S.dotOrange },
    { text: "Dubois — Copropriété", color: S.dotGreen  },
  ]
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background: S.glass,
            border: `1px solid ${S.glassBorder}`,
            backdropFilter: "blur(10px)",
            borderRadius: 16,
            padding: "12px 14px",
            width: 170,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <GlassCircle size={28}>
              <Folder size={13} color={S.mutedLight} />
            </GlassCircle>
            <span style={{ fontSize: 14, color: S.text, fontWeight: 400 }}>Vos dossiers classés</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {items.map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.5, duration: 0.5 }}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div style={{ width: 6, height: 6, borderRadius: 1, background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: S.mutedLight }}>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function TodoOutput({ visible }: { visible: boolean }) {
  const tasks = [
    "Répondre au greffe",
    "Valider brouillon Dupont",
    "Relire conclusions",
  ]
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background: S.glass,
            border: `1px solid ${S.glassBorder}`,
            backdropFilter: "blur(10px)",
            borderRadius: 16,
            padding: "12px 14px",
            width: 170,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <GlassCircle size={28}>
              <CheckSquare size={13} color={S.mutedLight} />
            </GlassCircle>
            <span style={{ fontSize: 14, color: S.text, fontWeight: 400 }}>Actions du jour</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {tasks.map((task, i) => (
              <motion.div
                key={task}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.5, duration: 0.5 }}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.3)",
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, color: S.mutedLight }}>{task}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── DESKTOP LAYOUT ───────────────────────────────────────────────────────────

function DesktopPipeline({ ms }: { ms: number }) {
  const showInput    = ms >= PHASE.input.start
  const showConn1    = ms >= PHASE.connect.start
  const showDot1     = ms >= PHASE.connect.start + 300 && ms < PHASE.outputs.start
  const showDonna    = ms >= PHASE.connect.start
  const processing   = ms >= PHASE.connect.start && ms < PHASE.outputs.start
  const showConns2   = ms >= PHASE.outputs.start
  const showDot2     = ms >= PHASE.outputs.start + 300 && ms < PHASE.hold.start
  const showCalendar = ms >= PHASE.outputs.start
  const showDossiers = ms >= PHASE.outputs.start + 2000
  const showTodo     = ms >= PHASE.outputs.start + 4000
  const showTagline  = ms >= PHASE.hold.start

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      padding: "0 32px",
      boxSizing: "border-box",
    }}>
      {/* Header label */}
      <div style={{
        fontSize: 11,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: "#444",
        marginBottom: 32,
        fontWeight: 400,
      }}>
        Comment Donna fonctionne
      </div>

      {/* Pipeline row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        gap: 0,
      }}>
        {/* INPUT */}
        <InputCard visible={showInput} />

        {/* Connector 1 */}
        <div style={{ marginLeft: 20, marginRight: 20 }}>
          <ConnectorH active={showConn1} showDot={showDot1} width={56} />
        </div>

        {/* DONNA */}
        <DonnaNode visible={showDonna} processing={processing} />

        {/* Outputs block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginLeft: 20 }}>
          {/* Output 1 */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <ConnectorH active={showConns2} showDot={showDot2} width={56} />
            <div style={{ marginLeft: 16 }}>
              <CalendarOutput visible={showCalendar} />
            </div>
          </div>
          {/* Output 2 */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <ConnectorH active={showConns2} showDot={showDot2} width={56} />
            <div style={{ marginLeft: 16 }}>
              <DossiersOutput visible={showDossiers} />
            </div>
          </div>
          {/* Output 3 */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <ConnectorH active={showConns2} showDot={showDot2} width={56} />
            <div style={{ marginLeft: 16 }}>
              <TodoOutput visible={showTodo} />
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <AnimatePresence>
        {showTagline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            style={{
              marginTop: 32,
              fontSize: 16,
              fontWeight: 300,
              color: "#666",
              textAlign: "center",
              letterSpacing: "0.02em",
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
  const showConn1    = ms >= PHASE.connect.start
  const showDot1     = ms >= PHASE.connect.start + 300 && ms < PHASE.outputs.start
  const showDonna    = ms >= PHASE.connect.start
  const processing   = ms >= PHASE.connect.start && ms < PHASE.outputs.start
  const showConns2   = ms >= PHASE.outputs.start
  const showDot2     = ms >= PHASE.outputs.start + 300 && ms < PHASE.hold.start
  const showCalendar = ms >= PHASE.outputs.start
  const showDossiers = ms >= PHASE.outputs.start + 2000
  const showTodo     = ms >= PHASE.outputs.start + 4000
  const showTagline  = ms >= PHASE.hold.start

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      padding: "24px 16px 32px",
      boxSizing: "border-box",
      gap: 0,
    }}>
      <div style={{
        fontSize: 10,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: "#444",
        marginBottom: 24,
        fontWeight: 400,
      }}>
        Comment Donna fonctionne
      </div>

      <InputCard visible={showInput} />
      <ConnectorV active={showConn1} showDot={showDot1} height={36} />
      <DonnaNode visible={showDonna} processing={processing} />
      <ConnectorV active={showConns2} showDot={showDot2} height={36} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }}>
        <CalendarOutput visible={showCalendar} />
        <DossiersOutput visible={showDossiers} />
        <TodoOutput     visible={showTodo} />
      </div>

      <AnimatePresence>
        {showTagline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            style={{
              marginTop: 24,
              fontSize: 14,
              fontWeight: 300,
              color: "#666",
              textAlign: "center",
              letterSpacing: "0.02em",
            }}
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
  const [globalOpacity, setGlobalOpacity] = useState(1)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    tickRef.current = setInterval(() => {
      setMs((prev) => {
        const next = prev + TICK_MS

        // Phase 5: fade out (21-24s)
        if (next >= PHASE.fadeOut.start && next < PHASE.fadeOut.end) {
          const progress = (next - PHASE.fadeOut.start) / (PHASE.fadeOut.end - PHASE.fadeOut.start)
          setGlobalOpacity(1 - progress)
        }

        // Reset at end
        if (next >= CYCLE_DURATION) {
          setGlobalOpacity(0)
          setTimeout(() => {
            setMs(0)
            setGlobalOpacity(1)
          }, 300)
          return prev
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
        height: isMobile ? undefined : 420,
        minHeight: isMobile ? 500 : 420,
        borderRadius: 16,
        overflow: "hidden",
        background: S.bg,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          opacity: globalOpacity,
          transition: "opacity 0.15s linear",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isMobile
          ? <MobilePipeline ms={ms} />
          : <DesktopPipeline ms={ms} />
        }
      </div>
    </div>
  )
}
