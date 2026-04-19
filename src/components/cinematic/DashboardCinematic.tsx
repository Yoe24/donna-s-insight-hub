import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Props {
  theme?: "light" | "dark"
  className?: string
  chromeless?: boolean
}

// 8 scenes x 5s = 40s cycle
const SCENE_DURATION = 5
const TOTAL_SCENES = 8
const TOTAL = SCENE_DURATION * TOTAL_SCENES

// Color palette — futuristic premium
const C = {
  bg: "#f8f7ff",
  card: "#ffffff",
  border: "rgba(99,88,210,0.1)",
  text: "#0f0e1a",
  muted: "#7c7a9b",
  accent: "#6358D2",
  accentSoft: "rgba(99,88,210,0.08)",
  accentGlow: "rgba(99,88,210,0.25)",
  accentViolet: "#8b5cf6",
  accentBlue: "#3b82f6",
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  pill: {
    blue: { bg: "#EFF6FF", text: "#1D4ED8" },
    green: { bg: "#ECFDF5", text: "#059669" },
    amber: { bg: "#FFFBEB", text: "#D97706" },
    red: { bg: "#FEF2F2", text: "#DC2626" },
    gray: { bg: "#F3F4F6", text: "#374151" },
    violet: { bg: "#f5f3ff", text: "#6d28d9" },
  }
}

// ─── FLOATING PARTICLES ───
function Particles({ count = 12 }: { count?: number }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
      dx: (Math.random() - 0.5) * 30,
      dy: (Math.random() - 0.5) * 30,
    }))
  )
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {particles.current.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: C.accentGlow,
          }}
          animate={{
            x: [0, p.dx, 0],
            y: [0, p.dy, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// ─── GLOW CARD ───
function GlowCard({ children, style = {}, glow = false, ...rest }: React.HTMLAttributes<HTMLDivElement> & { glow?: boolean }) {
  return (
    <div
      style={{
        background: C.card,
        borderRadius: 18,
        boxShadow: glow
          ? `0 4px 32px ${C.accentGlow}, 0 1px 3px rgba(0,0,0,0.06)`
          : "0 2px 20px rgba(0,0,0,0.06)",
        border: `1px solid ${C.border}`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

// ─── SCENE WRAPPER ───
function SceneWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "28px 20px 56px",
      }}
    >
      {children}
    </motion.div>
  )
}

// ─── BENEFIT TEXT ───
function BenefitText({ show, text }: { show: boolean; text: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            marginTop: 18,
            fontSize: 13,
            color: C.muted,
            fontStyle: "italic",
            textAlign: "center",
            maxWidth: 300,
            lineHeight: 1.6,
          }}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── SCENE 1 — "Le matin, 8h" ───
function Scene1({ t }: { t: number }) {
  const envelopes = [
    { x: "15%", y: "20%", delay: 0.2 },
    { x: "78%", y: "30%", delay: 0.6 },
    { x: "25%", y: "65%", delay: 1.0 },
    { x: "70%", y: "60%", delay: 1.4 },
  ]

  return (
    <SceneWrapper>
      {/* Floating envelopes in background */}
      {envelopes.map((env, i) => (
        <AnimatePresence key={i}>
          {t > env.delay && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{
                opacity: [0, 0.25, 0.18],
                y: [0, 8, 0],
                scale: 1,
              }}
              transition={{
                opacity: { duration: 0.6 },
                y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 },
                scale: { duration: 0.4 },
              }}
              style={{
                position: "absolute",
                left: env.x,
                top: env.y,
                pointerEvents: "none",
              }}
            >
              <svg width="22" height="16" viewBox="0 0 24 18" fill="none">
                <rect x="1" y="1" width="22" height="16" rx="2" stroke={C.accent} strokeWidth="1.5" fill={C.accentSoft} />
                <path d="m1 4 11 7 11-7" stroke={C.accent} strokeWidth="1.5" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        style={{ textAlign: "center", position: "relative", zIndex: 1 }}
      >
        {/* Mail icon with glow */}
        <motion.div
          animate={{
            boxShadow: [
              `0 0 0px ${C.accentGlow}`,
              `0 0 24px ${C.accentGlow}`,
              `0 0 0px ${C.accentGlow}`,
            ],
            scale: [1, 1.04, 1],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 68, height: 68, borderRadius: 22,
            background: `linear-gradient(135deg, ${C.accentSoft}, rgba(139,92,246,0.08))`,
            border: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 22px",
          }}
        >
          <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
            <rect x="1" y="1" width="30" height="22" rx="3" stroke={C.accent} strokeWidth="1.8" fill="none" />
            <path d="m1 5 15 9.5L31 5" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" />
            <motion.rect
              x="1" y="1" width="30" height="22" rx="3"
              fill={C.accent}
              animate={{ opacity: [0, 0.06, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </svg>
        </motion.div>

        {/* Time */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{ fontSize: 13, color: C.muted, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}
        >
          8h00
        </motion.div>

        {/* Main text */}
        <div style={{ fontSize: 26, fontWeight: 700, color: C.text, lineHeight: 1.2, marginBottom: 6 }}>
          Vous ouvrez Donna.
        </div>

        {/* Subtitle fade-in */}
        <AnimatePresence>
          {t > 1.4 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                fontSize: 15, color: C.muted, fontWeight: 500,
                display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
              }}
            >
              <motion.span
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                  background: C.red,
                }}
              />
              89 emails recus cette nuit
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </SceneWrapper>
  )
}

// ─── SCENE 2 — "Donna lit tout" ───
function Scene2({ t }: { t: number }) {
  const emails = [
    { from: "Greffe TJ Paris", subject: "Convocation audience Dupont" },
    { from: "Cabinet Moreau", subject: "Transmission pieces dossier Martin" },
    { from: "Assurance AXA", subject: "Accord transaction Lefevre" },
    { from: "Greffe CA Versailles", subject: "Arret rendu — affaire Blanchard" },
  ]
  const scanProgress = Math.max(0, Math.min(1, (t - 0.4) / 2.5))
  const checkedCount = Math.floor(scanProgress * emails.length)

  return (
    <SceneWrapper>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ fontSize: 22, fontWeight: 700, color: C.text, textAlign: "center", marginBottom: 20 }}
      >
        Donna a deja tout lu.
      </motion.div>

      <GlowCard glow={t > 1} style={{ padding: "14px 18px", width: "100%", maxWidth: 360, position: "relative", overflow: "hidden" }}>
        {/* Scan line */}
        {t > 0.4 && t < 3.2 && (
          <motion.div
            style={{
              position: "absolute",
              left: 0, right: 0,
              top: `${scanProgress * 100}%`,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${C.accent}, ${C.accentViolet}, transparent)`,
              boxShadow: `0 0 12px ${C.accentGlow}`,
              zIndex: 10,
            }}
          />
        )}

        {emails.map((email, i) => {
          const isChecked = i < checkedCount
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 0",
                borderBottom: i < emails.length - 1 ? `1px solid ${C.border}` : "none",
              }}
            >
              {/* Check mark */}
              <motion.div
                animate={isChecked ? { scale: [0, 1.2, 1], opacity: 1 } : { scale: 1, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: isChecked ? C.green : "transparent",
                  border: isChecked ? "none" : `1.5px solid ${C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {isChecked && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </motion.div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 1 }}>{email.from}</div>
                <div style={{
                  fontSize: 12, color: isChecked ? C.muted : C.text, fontWeight: 500,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  textDecoration: isChecked ? "line-through" : "none",
                  transition: "all 0.3s",
                }}>
                  {email.subject}
                </div>
              </div>
            </motion.div>
          )
        })}
      </GlowCard>

      <BenefitText
        show={t > 3.0}
        text="Vous n'ouvrez plus votre boite mail avec la boule au ventre."
      />
    </SceneWrapper>
  )
}

// ─── SCENE 3 — "Le tri" ───
function Scene3({ t }: { t: number }) {
  const dossierItems = ["Martin c/ AXA", "Dupont divorce", "Lefevre succession", "Blanchard appel", "Renard travail", "Moreau SA"]
  const urgentItems = ["Reponse greffe", "Signifier arret", "Conclure avant 24"]
  const filteredCount = Math.floor(Math.min(Math.max(0, (t - 1.8) / 1.5), 1) * 80)

  return (
    <SceneWrapper>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ fontSize: 21, fontWeight: 700, color: C.text, textAlign: "center", marginBottom: 18 }}
      >
        Tries, classes, organises
      </motion.div>

      <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 420, alignItems: "flex-start" }}>
        {/* Dossiers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ flex: 1 }}
        >
          <GlowCard style={{ padding: "12px 10px" }}>
            <div style={{ fontSize: 10, color: C.accent, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
              Dossiers
            </div>
            {dossierItems.map((item, i) => (
              <AnimatePresence key={item}>
                {t > 0.3 + i * 0.15 && (
                  <motion.div
                    initial={{ x: -16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      fontSize: 11, color: C.text, fontWeight: 500,
                      padding: "4px 6px", borderRadius: 6,
                      marginBottom: 3,
                      background: i % 2 === 0 ? C.accentSoft : "transparent",
                      display: "flex", alignItems: "center", gap: 5,
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: [C.accent, C.accentBlue, C.green, C.amber, C.accentViolet, C.red][i % 6], flexShrink: 0 }} />
                    {item}
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </GlowCard>
        </motion.div>

        {/* A traiter */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          style={{ flex: 1 }}
        >
          <GlowCard style={{ padding: "12px 10px" }} glow={t > 0.8}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: C.red, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                A traiter
              </div>
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: C.red, display: "inline-block",
                }}
              />
            </div>
            {urgentItems.map((item, i) => (
              <AnimatePresence key={item}>
                {t > 0.8 + i * 0.2 && (
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      fontSize: 11, color: C.text, fontWeight: 600,
                      padding: "5px 6px", borderRadius: 6,
                      marginBottom: 3,
                      background: "rgba(239,68,68,0.06)",
                      borderLeft: `2.5px solid ${C.red}`,
                    }}
                  >
                    {item}
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </GlowCard>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          style={{ flex: 1 }}
        >
          <GlowCard style={{ padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              Filtres
            </div>
            <motion.div
              style={{ fontSize: 32, fontWeight: 700, color: C.muted, lineHeight: 1, marginBottom: 4, fontVariantNumeric: "tabular-nums" }}
            >
              {filteredCount}
            </motion.div>
            <div style={{ fontSize: 10, color: C.muted }}>emails elimines</div>
            <div style={{ marginTop: 8 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <AnimatePresence key={i}>
                  {t > 1.8 + i * 0.2 && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      style={{
                        height: 4, background: "#e5e7eb", borderRadius: 2,
                        marginBottom: 3, width: `${60 + i * 8}%`,
                      }}
                    />
                  )}
                </AnimatePresence>
              ))}
            </div>
          </GlowCard>
        </motion.div>
      </div>

      <BenefitText show={t > 3.2} text="3 actions. Le reste est gere." />
    </SceneWrapper>
  )
}

// ─── SCENE 4 — "Les echeances" ───
function Scene4({ t }: { t: number }) {
  const events = [
    { day: 22, label: "Audience Martin", color: C.red, delay: 0.8 },
    { day: 23, label: "Forclusion Dupont", color: C.red, delay: 1.2 },
    { day: 24, label: "Conclusions", color: C.amber, delay: 1.6 },
    { day: 30, label: "Mediation Dubois", color: C.green, delay: 2.1 },
  ]

  const today = 19
  const calendarDays: (number | null)[] = [null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, null, null, null]

  return (
    <SceneWrapper>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ fontSize: 18, fontWeight: 700, color: C.text, textAlign: "center", marginBottom: 14 }}
      >
        Chaque date critique, extraite automatiquement
      </motion.div>

      <GlowCard glow style={{ padding: "16px 16px 12px", width: "100%", maxWidth: 380 }}>
        {/* Month header */}
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Avril 2026
        </div>

        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 4 }}>
          {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((d) => (
            <div key={d} style={{ fontSize: 9, color: C.muted, textAlign: "center", fontWeight: 700, letterSpacing: "0.06em", padding: "1px 0" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={idx} />
            const event = events.find((e) => e.day === day)
            const isToday = day === today
            const showEvent = event && t > event.delay

            return (
              <div key={idx} style={{ position: "relative", textAlign: "center" }}>
                {showEvent ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 350, damping: 14 }}
                    style={{ position: "relative" }}
                  >
                    {/* Ping ring */}
                    <motion.div
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ duration: 0.7, delay: 0.1 }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 6,
                        border: `1.5px solid ${event.color}`,
                      }}
                    />
                    <div style={{
                      background: event.color,
                      borderRadius: 6,
                      padding: "3px 2px",
                      boxShadow: `0 2px 10px ${event.color}55`,
                    }}>
                      <div style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>{day}</div>
                      <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {event.label.split(" ")[0]}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div style={{
                    padding: "4px 2px",
                    borderRadius: 6,
                    background: isToday ? C.accentSoft : "transparent",
                    border: isToday ? `1px solid ${C.border}` : "none",
                  }}>
                    <div style={{
                      fontSize: 11,
                      color: isToday ? C.accent : C.muted,
                      fontWeight: isToday ? 700 : 400,
                    }}>
                      {day}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Sync icons */}
        <AnimatePresence>
          {t > 2.8 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                marginTop: 10, paddingTop: 8,
                borderTop: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect width="14" height="14" rx="3" fill="#4285F4" />
                <rect x="3" y="5" width="8" height="6" rx="0.5" fill="white" />
                <rect x="3" y="3" width="8" height="3" fill="#4285F4" />
                <rect x="5" y="2" width="1.5" height="2.5" rx="0.5" fill="white" />
                <rect x="7.5" y="2" width="1.5" height="2.5" rx="0.5" fill="white" />
              </svg>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect width="14" height="14" rx="3" fill="#0078D4" />
                <rect x="2.5" y="2.5" width="9" height="9" rx="0.5" fill="white" fillOpacity="0.9" />
                <rect x="4" y="4" width="6" height="1" fill="#0078D4" />
                <rect x="4" y="6.5" width="6" height="0.8" fill="#0078D4" fillOpacity="0.5" />
                <rect x="4" y="8.2" width="4" height="0.8" fill="#0078D4" fillOpacity="0.5" />
              </svg>
              <span style={{ fontSize: 10, color: C.muted }}>Synchronise avec votre calendrier</span>
            </motion.div>
          )}
        </AnimatePresence>
      </GlowCard>

      <BenefitText show={t > 3.5} text="Plus jamais une echeance oubliee." />
    </SceneWrapper>
  )
}

// ─── SCENE 5 — "Les reponses" ───
function Scene5({ t }: { t: number }) {
  const fullText = "Audience de conciliation le 22 avril. Reponse attendue. Brouillon prepare."
  const typingStart = 1.6
  const typingDuration = 2.8
  const progress = Math.max(0, Math.min(1, (t - typingStart) / typingDuration))
  const displayedLength = Math.floor(progress * fullText.length)
  const displayed = t > typingStart ? fullText.slice(0, displayedLength) : ""
  const isTyping = displayed.length < fullText.length && t > typingStart

  return (
    <SceneWrapper>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ fontSize: 21, fontWeight: 700, color: C.text, textAlign: "center", marginBottom: 18 }}
      >
        Vos reponses, deja redigees
      </motion.div>

      <AnimatePresence>
        {t > 0.5 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            style={{ width: "100%", maxWidth: 370 }}
          >
            <GlowCard glow={t > 2.5} style={{ padding: "18px 20px" }}>
              {/* Email header */}
              <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>
                  De : <span style={{ fontWeight: 700, color: C.text }}>Greffe TJ Paris</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                  Convocation audience Dupont c/ Dupont
                </div>
              </div>

              {/* Donna writes */}
              <div style={{ marginBottom: 14 }}>
                <div style={{
                  fontSize: 9, color: C.accent, textTransform: "uppercase",
                  letterSpacing: "0.12em", marginBottom: 8, fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ width: 5, height: 5, borderRadius: "50%", background: C.accent, display: "inline-block" }}
                  />
                  Donna redige
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.65, minHeight: 52 }}>
                  {displayed}
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.55, repeat: Infinity }}
                      style={{
                        display: "inline-block", width: 2, height: 13,
                        background: C.accent, verticalAlign: "text-bottom", marginLeft: 1,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* CTA button */}
              <AnimatePresence>
                {t > 4.2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          `0 0 0px ${C.accentGlow}`,
                          `0 4px 22px ${C.accentGlow}`,
                          `0 0 0px ${C.accentGlow}`,
                        ],
                      }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      style={{
                        background: `linear-gradient(135deg, ${C.accent}, ${C.accentViolet})`,
                        color: "#fff",
                        borderRadius: 10, padding: "10px 18px",
                        fontSize: 12, fontWeight: 700, textAlign: "center", cursor: "pointer",
                      }}
                    >
                      Envoyer la reponse
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlowCard>
          </motion.div>
        )}
      </AnimatePresence>

      <BenefitText show={t > 4.2} text="Vous validez en 1 clic. Donna s'occupe du reste." />
    </SceneWrapper>
  )
}

// ─── SCENE 6 — "Le resultat" ───
function Scene6({ t }: { t: number }) {
  const countTarget = 2
  const countProgress = Math.min(1, Math.max(0, (t - 0.4) / 1.2))
  const count = Math.floor(countProgress * countTarget)

  const pills = [
    { label: "Dossiers classes", delay: 1.8 },
    { label: "Echeances surveillees", delay: 2.2 },
    { label: "Reponses pretes", delay: 2.6 },
  ]

  return (
    <SceneWrapper>
      {/* Subtle confetti / particle effect */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={t > 0.3 ? {
              opacity: [0, 0.6, 0],
              y: [0, -60 - Math.random() * 40],
              x: [(Math.random() - 0.5) * 80],
            } : {}}
            transition={{ duration: 2.5, delay: i * 0.2, repeat: Infinity, repeatDelay: 1.5 }}
            style={{
              position: "absolute",
              left: `${15 + i * 10}%`,
              bottom: "30%",
              width: 5, height: 5,
              borderRadius: Math.random() > 0.5 ? "50%" : 2,
              background: [C.accent, C.accentBlue, C.green, C.amber, C.accentViolet][i % 5],
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {t > 0.3 && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            style={{ textAlign: "center", marginBottom: 6, position: "relative", zIndex: 1 }}
          >
            <div style={{
              fontSize: 80, fontWeight: 800, color: C.text, lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              background: `linear-gradient(135deg, ${C.text}, ${C.accent})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {count}
              <span style={{ fontSize: 48 }}>h</span>
            </div>
            <div style={{ fontSize: 16, color: C.muted, fontWeight: 600, marginTop: 4 }}>
              gagnees par jour
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", position: "relative", zIndex: 1 }}>
        {pills.map((pill) => (
          <AnimatePresence key={pill.label}>
            {t > pill.delay && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: C.accentSoft,
                  border: `1px solid ${C.border}`,
                  borderRadius: 99, padding: "6px 12px",
                  fontSize: 12, color: C.accent, fontWeight: 600,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5.5" fill={C.green} />
                  <path d="M3 6l2 2 4-3.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {pill.label}
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      <BenefitText show={t > 3.2} text="Du temps pour vos clients. Pas pour votre boite mail." />
    </SceneWrapper>
  )
}

// ─── SCENE 7 — "La serenite" ───
function Scene7({ t }: { t: number }) {
  const words = [
    { text: "Vos clients", delay: 0.8 },
    { text: "Vos audiences", delay: 1.5 },
    { text: "Votre cabinet", delay: 2.2 },
  ]

  return (
    <SceneWrapper>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        style={{ textAlign: "center", marginBottom: 28 }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.3, maxWidth: 320 }}>
          Vous vous concentrez sur l'essentiel
        </div>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        {words.map((word) => (
          <AnimatePresence key={word.text}>
            {t > word.delay && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.div
                  animate={{ scale: [1, 1.015, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    fontSize: 20, fontWeight: 700, color: C.text,
                    padding: "10px 28px",
                    background: C.accentSoft,
                    borderRadius: 14,
                    border: `1px solid ${C.border}`,
                    boxShadow: `0 2px 16px ${C.accentGlow}`,
                    letterSpacing: "0.02em",
                  }}
                >
                  {word.text}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      <AnimatePresence>
        {t > 3.5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              marginTop: 22, fontSize: 13, color: C.muted,
              fontStyle: "italic", textAlign: "center",
            }}
          >
            Calme. Maitrise. Confiance.
          </motion.div>
        )}
      </AnimatePresence>
    </SceneWrapper>
  )
}

// ─── SCENE 8 — "CTA" ───
function Scene8({ t }: { t: number }) {
  return (
    <SceneWrapper>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", position: "relative", zIndex: 1 }}
      >
        {/* Donna wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em",
            background: `linear-gradient(135deg, ${C.text}, ${C.accent})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 8,
          }}
        >
          Donna
        </motion.div>

        {/* Tagline */}
        <AnimatePresence>
          {t > 0.8 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                fontSize: 14, color: C.muted, marginBottom: 28,
                maxWidth: 280, lineHeight: 1.5,
              }}
            >
              L'assistante qui veille pendant que vous plaidez
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA button with gradient border */}
        <AnimatePresence>
          {t > 1.6 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{ display: "inline-block", position: "relative", padding: 2, borderRadius: 14 }}
            >
              {/* Animated gradient border */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute", inset: 0, borderRadius: 14,
                  background: `conic-gradient(from 0deg, ${C.accent}, ${C.accentViolet}, ${C.accentBlue}, ${C.accent})`,
                }}
              />
              <div style={{
                position: "relative", zIndex: 1,
                background: "#fff",
                borderRadius: 12, padding: "12px 30px",
                fontSize: 14, fontWeight: 700, color: C.accent,
                cursor: "pointer",
              }}>
                Essayer gratuitement
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legal */}
        <AnimatePresence>
          {t > 2.5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{ marginTop: 12, fontSize: 11, color: C.muted }}
            >
              Gratuit 14 jours. Sans engagement.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </SceneWrapper>
  )
}

// ─── SCENE LABELS ───
const SCENE_LABELS = [
  "8h00 — Vous ouvrez Donna",
  "Donna lit tout",
  "Le tri",
  "Les echeances",
  "Les reponses",
  "Le resultat",
  "La serenite",
  "Decouvrir Donna",
]

// ─── MAIN COMPONENT ───
export default function DashboardCinematic({ className = "" }: Props) {
  const [t, setT] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    ref.current = setInterval(() => setT((p) => {
      const next = parseFloat((p + 0.1).toFixed(1))
      return next >= TOTAL ? 0 : next
    }), 100)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [])

  const scene = Math.min(Math.floor(t / SCENE_DURATION), TOTAL_SCENES - 1)
  const st = t - scene * SCENE_DURATION

  // Gradient shifts subtly per scene
  const gradients = [
    "radial-gradient(ellipse at 20% 50%, rgba(99,88,210,0.12), rgba(139,92,246,0.06), transparent)",
    "radial-gradient(ellipse at 70% 30%, rgba(59,130,246,0.10), rgba(99,88,210,0.07), transparent)",
    "radial-gradient(ellipse at 40% 60%, rgba(16,185,129,0.08), rgba(99,88,210,0.09), transparent)",
    "radial-gradient(ellipse at 60% 40%, rgba(239,68,68,0.08), rgba(245,158,11,0.07), transparent)",
    "radial-gradient(ellipse at 30% 70%, rgba(99,88,210,0.12), rgba(59,130,246,0.08), transparent)",
    "radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.10), rgba(99,88,210,0.10), transparent)",
    "radial-gradient(ellipse at 35% 45%, rgba(139,92,246,0.12), rgba(99,88,210,0.08), transparent)",
    "radial-gradient(ellipse at 50% 50%, rgba(99,88,210,0.15), rgba(139,92,246,0.12), transparent)",
  ]

  return (
    <div className={className} style={{
      width: "100%",
      borderRadius: 22,
      overflow: "hidden",
      boxShadow: `0 8px 48px rgba(99,88,210,0.12), 0 2px 8px rgba(0,0,0,0.06)`,
      border: `1px solid ${C.border}`,
      background: C.bg,
    }}>
      <motion.div
        animate={{ background: `${gradients[scene]}, ${C.bg}` }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{ position: "relative", minHeight: 440 }}
      >
        <Particles count={10} />

        {/* Scene content */}
        <div style={{ position: "relative", minHeight: 440, zIndex: 1 }}>
          <AnimatePresence mode="wait">
            {scene === 0 && <Scene1 key="s1" t={st} />}
            {scene === 1 && <Scene2 key="s2" t={st} />}
            {scene === 2 && <Scene3 key="s3" t={st} />}
            {scene === 3 && <Scene4 key="s4" t={st} />}
            {scene === 4 && <Scene5 key="s5" t={st} />}
            {scene === 5 && <Scene6 key="s6" t={st} />}
            {scene === 6 && <Scene7 key="s7" t={st} />}
            {scene === 7 && <Scene8 key="s8" t={st} />}
          </AnimatePresence>
        </div>

        {/* Bottom navigation */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "10px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderTop: `1px solid rgba(99,88,210,0.08)`,
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(8px)",
          zIndex: 10,
        }}>
          {/* 8 dots */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {Array.from({ length: TOTAL_SCENES }, (_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === scene ? 20 : 5,
                  background: i === scene ? C.accent : "#D1D5DB",
                  boxShadow: i === scene ? `0 0 8px ${C.accentGlow}` : "none",
                }}
                transition={{ duration: 0.3 }}
                style={{
                  height: 5,
                  borderRadius: 99,
                }}
              />
            ))}
          </div>

          {/* Scene label */}
          <AnimatePresence mode="wait">
            <motion.div
              key={scene}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25 }}
              style={{ fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: "0.05em" }}
            >
              {SCENE_LABELS[scene] ?? ""}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
