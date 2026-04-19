import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Props {
  theme?: "light" | "dark"
  className?: string
  chromeless?: boolean
}

// Scene durations (seconds): 6+6+6+6+6+6 = 36s cycle
const SCENE_DURATION = 6
const TOTAL = 36

// Minimal color palette
const C = {
  bg: "#fafafa",
  card: "#ffffff",
  border: "rgba(0,0,0,0.07)",
  text: "#1a1a1a",
  muted: "#888888",
  accent: "#1a1a1a",
  pill: {
    blue: { bg: "#EFF6FF", text: "#1D4ED8" },
    green: { bg: "#ECFDF5", text: "#059669" },
    amber: { bg: "#FFFBEB", text: "#D97706" },
    red: { bg: "#FEF2F2", text: "#DC2626" },
    gray: { bg: "#F3F4F6", text: "#374151" },
  }
}

function Card({ children, style = {}, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div style={{
      background: C.card,
      borderRadius: 16,
      boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      border: `1px solid ${C.border}`,
      ...style,
    }} {...rest}>
      {children}
    </div>
  )
}

function Pill({ children, color = "gray" }: { children: React.ReactNode; color?: keyof typeof C.pill }) {
  const s = C.pill[color]
  return (
    <span style={{
      display: "inline-block",
      background: s.bg,
      color: s.text,
      borderRadius: 99,
      padding: "4px 12px",
      fontSize: 12,
      fontWeight: 600,
    }}>
      {children}
    </span>
  )
}

// ─── SCENE WRAPPER ───
function SceneWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "32px 24px",
      }}
    >
      {children}
    </motion.div>
  )
}

// ─── SCENE 1 — LA BOITE MAIL ───
function Scene1({ t }: { t: number }) {
  const [count, setCount] = useState(0)
  const target = 89

  useEffect(() => {
    if (t < 0.5) { setCount(0); return }
    const elapsed = (t - 0.5) * 1000
    const progress = Math.min(elapsed / 3500, 1)
    setCount(Math.floor(progress * target))
  }, [t])

  return (
    <SceneWrapper>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ textAlign: "center" }}
      >
        {/* Icon */}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 64, height: 64, borderRadius: 20,
            background: "#F3F4F6",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 28,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m2 7 10 6.5L22 7"/>
          </svg>
        </motion.div>

        {/* Counter */}
        <div style={{ fontSize: 64, fontWeight: 700, color: C.text, lineHeight: 1, marginBottom: 8, fontVariantNumeric: "tabular-nums" }}>
          {count}
        </div>
        <div style={{ fontSize: 18, color: C.muted, marginBottom: 20, fontWeight: 500 }}>
          emails reçus
        </div>

        {/* Subtitle */}
        <AnimatePresence>
          {t > 2 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ fontSize: 14, color: C.muted, maxWidth: 280, lineHeight: 1.6 }}
            >
              Donna lit chaque email et chaque pièce jointe
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </SceneWrapper>
  )
}

// ─── SCENE 2 — LE TRI INTELLIGENT ───
function Scene2({ t }: { t: number }) {
  const piles = [
    { label: "Dossiers clients", count: 6, color: "blue" as const, delay: 0.3 },
    { label: "A traiter", count: 3, color: "amber" as const, delay: 0.8 },
    { label: "Bruit filtre", count: 80, color: "gray" as const, delay: 1.3 },
  ]

  return (
    <SceneWrapper>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ fontSize: 20, fontWeight: 600, color: C.text, textAlign: "center", marginBottom: 28 }}
      >
        Tri intelligent de vos emails
      </motion.div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        {piles.map((pile) => (
          <AnimatePresence key={pile.label}>
            {t > pile.delay && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
              >
                <Card style={{ padding: "20px 24px", textAlign: "center", minWidth: 120 }}>
                  <div style={{
                    fontSize: 36, fontWeight: 700, color: C.pill[pile.color]?.text ?? C.text,
                    lineHeight: 1, marginBottom: 8,
                  }}>
                    {pile.count}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>
                    {pile.label}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </SceneWrapper>
  )
}

// ─── SCENE 3 — LES ECHEANCES ───
function Scene3({ t }: { t: number }) {
  const days = Array.from({ length: 35 }, (_, i) => i + 1)
  const deadlines: Record<number, string> = {
    7: "#DC2626",
    12: "#D97706",
    18: "#DC2626",
    22: "#DC2626",
    25: "#D97706",
    29: "#059669",
    31: "#D97706",
  }

  const deadlineEntries = Object.entries(deadlines)

  return (
    <SceneWrapper>
      <AnimatePresence>
        {t > 0.3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ textAlign: "center", marginBottom: 20 }}
          >
            <div style={{ fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 6 }}>
              7 echeances critiques detectees
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              Audiences, forclusions, delais d'appel
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {t > 0.6 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
          >
            <Card style={{ padding: "16px 20px" }}>
              {/* Day headers */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
                gap: 4, marginBottom: 4,
              }}>
                {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((d) => (
                  <div key={d} style={{ fontSize: 10, color: C.muted, textAlign: "center", fontWeight: 600, padding: "2px 0" }}>
                    {d}
                  </div>
                ))}
              </div>
              {/* Days grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {days.map((day) => {
                  const dotColor = deadlines[day]
                  const dotDelay = dotColor ? deadlineEntries.findIndex(([d]) => Number(d) === day) * 0.18 + 1.2 : 0
                  return (
                    <div key={day} style={{ position: "relative", textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: day > 30 ? "#ddd" : "#999", padding: "3px 0" }}>
                        {day <= 31 ? day : ""}
                      </div>
                      {dotColor && t > dotDelay && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: dotColor,
                            margin: "0 auto",
                            position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneWrapper>
  )
}

// ─── SCENE 4 — LES RESUMES ───
function Scene4({ t }: { t: number }) {
  const fullText = "Audience de conciliation le 22 avril. Reponse attendue avant le 18."
  const displayedLength = Math.floor(Math.min((t - 1.5) / 3.5 * fullText.length, fullText.length))
  const displayed = t > 1.5 ? fullText.slice(0, displayedLength) : ""

  return (
    <SceneWrapper>
      <AnimatePresence>
        {t > 0.4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: "100%", maxWidth: 380 }}
          >
            <Card style={{ padding: "20px 22px" }}>
              {/* Email header */}
              <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>
                  De : <span style={{ fontWeight: 600, color: C.text }}>Greffe TJ Paris</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                  Convocation audience Dupont
                </div>
              </div>

              {/* Donna summary */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, fontWeight: 600 }}>
                  Resume Donna
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.65, minHeight: 44 }}>
                  {displayed}
                  {displayed.length < fullText.length && t > 1.5 && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      style={{ display: "inline-block", width: 2, height: 14, background: C.text, verticalAlign: "text-bottom", marginLeft: 1 }}
                    />
                  )}
                </div>
              </div>

              {/* Button */}
              <AnimatePresence>
                {t > 4.5 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      animate={{ boxShadow: ["0 0 0px rgba(26,26,26,0.1)", "0 4px 20px rgba(26,26,26,0.18)", "0 0 0px rgba(26,26,26,0.1)"] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      style={{
                        background: C.text, color: "#fff",
                        borderRadius: 10, padding: "10px 18px",
                        fontSize: 12, fontWeight: 600, textAlign: "center", cursor: "pointer",
                      }}
                    >
                      Reponse generee par Donna
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneWrapper>
  )
}

// ─── SCENE 5 — LE RESULTAT ───
function Scene5({ t }: { t: number }) {
  const pills = [
    { label: "Dossiers classes", delay: 1.2, color: "blue" as const },
    { label: "Echeances surveillees", delay: 1.7, color: "green" as const },
    { label: "Reponses pretes", delay: 2.2, color: "gray" as const },
  ]

  return (
    <SceneWrapper>
      <AnimatePresence>
        {t > 0.3 && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            style={{ textAlign: "center", marginBottom: 24 }}
          >
            <div style={{ fontSize: 72, fontWeight: 700, color: C.text, lineHeight: 1 }}>
              2h
            </div>
            <div style={{ fontSize: 18, color: C.muted, fontWeight: 500, marginTop: 8 }}>
              gagnees par jour
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {pills.map((pill) => (
          <AnimatePresence key={pill.label}>
            {t > pill.delay && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Pill color={pill.color}>{pill.label}</Pill>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </SceneWrapper>
  )
}

// ─── SCENE 6 — CTA ───
function Scene6({ t }: { t: number }) {
  return (
    <SceneWrapper>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        style={{ textAlign: "center" }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: 36, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: -1 }}
        >
          Donna
        </motion.div>

        <AnimatePresence>
          {t > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}
            >
              +150 avocats nous font confiance
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {t > 1.8 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                display: "inline-block",
                border: `2px solid ${C.text}`,
                borderRadius: 12,
                padding: "12px 28px",
                fontSize: 14,
                fontWeight: 600,
                color: C.text,
                cursor: "pointer",
              }}
            >
              Essayer gratuitement
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </SceneWrapper>
  )
}

// ─── SCENE LABELS ───
const SCENE_LABELS = [
  "La boite mail",
  "Le tri intelligent",
  "Les echeances",
  "Les resumes",
  "Le resultat",
  "Decouvrir Donna",
]

// ─── MAIN COMPONENT ───
export default function DashboardCinematic({ className = "" }: Props) {
  const [t, setT] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    ref.current = setInterval(() => setT((p) => {
      const next = p + 0.1
      return next >= TOTAL ? 0 : next
    }), 100)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [])

  const scene = Math.floor(t / SCENE_DURATION)
  const st = t - scene * SCENE_DURATION

  return (
    <div className={className} style={{
      width: "100%",
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
      border: `1px solid rgba(0,0,0,0.07)`,
      background: C.bg,
    }}>
      {/* Gradient background layer */}
      <div style={{
        position: "relative",
        background: "radial-gradient(ellipse at 30% 50%, rgba(255,200,200,0.15), rgba(200,200,255,0.1), rgba(255,255,255,0)), #fafafa",
        minHeight: 420,
      }}>
        {/* Scene content */}
        <div style={{ position: "relative", minHeight: 420 }}>
          <AnimatePresence mode="wait">
            {scene === 0 && <Scene1 key="s1" t={st} />}
            {scene === 1 && <Scene2 key="s2" t={st} />}
            {scene === 2 && <Scene3 key="s3" t={st} />}
            {scene === 3 && <Scene4 key="s4" t={st} />}
            {scene === 4 && <Scene5 key="s5" t={st} />}
            {scene === 5 && <Scene6 key="s6" t={st} />}
          </AnimatePresence>
        </div>

        {/* Bottom progress bar + scene label */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "12px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderTop: `1px solid rgba(0,0,0,0.05)`,
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(6px)",
        }}>
          {/* Dots */}
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                style={{
                  width: i === scene ? 20 : 6,
                  height: 6,
                  borderRadius: 99,
                  background: i === scene ? C.text : "#D1D5DB",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>

          {/* Scene label */}
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>
            {SCENE_LABELS[scene] ?? ""}
          </div>
        </div>
      </div>
    </div>
  )
}
