import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Props {
  theme?: "light" | "dark"
  className?: string
  chromeless?: boolean
}

const SCENE_DURATION = 6
const TOTAL_SCENES = 6
const TOTAL = SCENE_DURATION * TOTAL_SCENES

// ─── ANIMATED CURSOR ───
interface CursorProps {
  fromX: number
  fromY: number
  toX: number
  toY: number
  trigger?: boolean
  delay?: number
}

function AnimatedCursor({ fromX, fromY, toX, toY, trigger = false, delay = 0 }: CursorProps) {
  return (
    <motion.div
      initial={{ x: fromX, y: fromY, scale: 1, opacity: 0 }}
      animate={
        trigger
          ? [
              { x: fromX, y: fromY, scale: 1, opacity: 1 },
              { x: toX, y: toY, scale: 1, opacity: 1 },
              { x: toX, y: toY, scale: 0.8, opacity: 1 },
              { x: toX, y: toY, scale: 1, opacity: 1 },
            ]
          : { x: fromX, y: fromY, scale: 1, opacity: 0 }
      }
      transition={{
        duration: 1.8,
        delay,
        ease: "easeInOut",
        times: [0, 0.55, 0.75, 1],
      }}
      style={{
        position: "absolute",
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: "#1a1a1a",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        pointerEvents: "none",
        zIndex: 20,
      }}
    />
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
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px 60px",
      }}
    >
      {children}
    </motion.div>
  )
}

// ─── FADE IN ELEMENT ───
function FadeIn({
  children,
  delay = 0,
  slideUp = false,
  style = {},
}: {
  children: React.ReactNode
  delay?: number
  slideUp?: boolean
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: slideUp ? 20 : 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// ─── DOT ───
function Dot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        marginTop: 2,
      }}
    />
  )
}

// ─── SCENE 1 — "Le matin" ───
function Scene1({ t }: { t: number }) {
  return (
    <SceneWrapper>
      <FadeIn>
        <p
          style={{
            fontSize: "clamp(24px, 5vw, 34px)",
            fontWeight: 700,
            color: "#1a1a1a",
            textAlign: "center",
            lineHeight: 1.2,
            letterSpacing: "-0.5px",
            margin: 0,
          }}
        >
          8h00. 89 emails reçus.
        </p>
      </FadeIn>
      {t >= 2 && (
        <FadeIn delay={0} slideUp>
          <p
            style={{
              fontSize: "clamp(15px, 2.5vw, 18px)",
              color: "#999",
              textAlign: "center",
              marginTop: 16,
              fontWeight: 400,
            }}
          >
            Donna a déjà tout lu pour vous.
          </p>
        </FadeIn>
      )}
    </SceneWrapper>
  )
}

// ─── SCENE 2 — "Le tri" ───
function Scene2({ t }: { t: number }) {
  const cards = [
    { label: "Répondre au greffe", dot: "#ef4444" },
    { label: "Valider le brouillon Dupont", dot: "#f59e0b" },
    { label: "Relire les conclusions Martin", dot: "#f59e0b" },
  ]
  return (
    <SceneWrapper>
      <FadeIn>
        <p
          style={{
            fontSize: "clamp(22px, 4.5vw, 30px)",
            fontWeight: 700,
            color: "#1a1a1a",
            textAlign: "center",
            lineHeight: 1.2,
            letterSpacing: "-0.4px",
            margin: "0 0 24px",
          }}
        >
          80 emails filtrés.{" "}
          <span style={{ color: "#1a1a1a" }}>3 actions à faire.</span>
        </p>
      </FadeIn>

      <div
        style={{
          width: "100%",
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          position: "relative",
        }}
      >
        {cards.map((card, i) => (
          <AnimatePresence key={i}>
            {t >= 1 + i * 0.4 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  background: i === 0 && t >= 3.5 ? "#f5f5f5" : "#ffffff",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  border: "1px solid #eeeeee",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Dot color={card.dot} />
                <span
                  style={{
                    fontSize: "clamp(13px, 2vw, 15px)",
                    color: "#1a1a1a",
                    fontWeight: 500,
                  }}
                >
                  {card.label}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        ))}

        {t >= 3 && (
          <AnimatedCursor
            fromX={40}
            fromY={-80}
            toX={40}
            toY={-2}
            trigger={t >= 3}
            delay={0}
          />
        )}
      </div>
    </SceneWrapper>
  )
}

// ─── SCENE 3 — "Les échéances" ───
function Scene3({ t }: { t: number }) {
  const items = [
    { date: "22 avr", label: "Audience conciliation Martin", dot: "#ef4444" },
    { date: "23 avr", label: "Forclusion Dupont", dot: "#ef4444" },
    { date: "24 avr", label: "Dépôt conclusions", dot: "#f59e0b" },
    { date: "30 avr", label: "Médiation Dubois", dot: "#999" },
  ]
  return (
    <SceneWrapper>
      <FadeIn>
        <p
          style={{
            fontSize: "clamp(20px, 4vw, 28px)",
            fontWeight: 700,
            color: "#1a1a1a",
            textAlign: "center",
            lineHeight: 1.2,
            letterSpacing: "-0.4px",
            margin: "0 0 24px",
          }}
        >
          4 échéances extraites de vos emails
        </p>
      </FadeIn>

      <div
        style={{
          width: "100%",
          maxWidth: 380,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          position: "relative",
        }}
      >
        {items.map((item, i) => (
          <AnimatePresence key={i}>
            {t >= 0.8 + i * 0.5 && (
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Dot color={item.dot} />
                <span
                  style={{
                    fontSize: "clamp(12px, 1.8vw, 14px)",
                    color: "#999",
                    fontWeight: 600,
                    width: 46,
                    flexShrink: 0,
                  }}
                >
                  {item.date}
                </span>
                <span
                  style={{
                    fontSize: "clamp(13px, 2vw, 15px)",
                    color: "#1a1a1a",
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        ))}

        {t >= 3.5 && (
          <AnimatedCursor
            fromX={180}
            fromY={-72}
            toX={20}
            toY={-72}
            trigger={t >= 3.5}
            delay={0}
          />
        )}
      </div>

      {t >= 3 && (
        <FadeIn delay={0} slideUp style={{ marginTop: 20 }}>
          <p
            style={{
              fontSize: "clamp(11px, 1.6vw, 13px)",
              color: "#bbb",
              textAlign: "center",
            }}
          >
            Synchronisé avec Google Calendar et Outlook
          </p>
        </FadeIn>
      )}
    </SceneWrapper>
  )
}

// ─── TYPING EFFECT ───
function TypingText({ text, active }: { text: string; active: boolean }) {
  const [displayed, setDisplayed] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!active) {
      setDisplayed("")
      return
    }
    let i = 0
    function next() {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i < text.length) {
        timerRef.current = setTimeout(next, 28)
      }
    }
    timerRef.current = setTimeout(next, 0)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [active, text])

  return (
    <span>
      {displayed}
      {active && displayed.length < text.length && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            background: "#1a1a1a",
            marginLeft: 1,
            verticalAlign: "middle",
          }}
        />
      )}
    </span>
  )
}

// ─── SCENE 4 — "La réponse" ───
function Scene4({ t }: { t: number }) {
  const draftText =
    "Maître, je confirme la présence de mon client à l'audience du 22 avril..."

  return (
    <SceneWrapper>
      <FadeIn>
        <p
          style={{
            fontSize: "clamp(22px, 4.5vw, 30px)",
            fontWeight: 700,
            color: "#1a1a1a",
            textAlign: "center",
            lineHeight: 1.2,
            letterSpacing: "-0.4px",
            margin: "0 0 20px",
          }}
        >
          Votre réponse est prête
        </p>
      </FadeIn>

      <FadeIn delay={0.3} slideUp style={{ width: "100%", maxWidth: 400 }}>
        <div
          style={{
            border: "1px solid #eeeeee",
            borderRadius: 16,
            background: "#ffffff",
            padding: "16px 20px",
            position: "relative",
          }}
        >
          <p
            style={{
              fontSize: "clamp(12px, 1.8vw, 13px)",
              color: "#999",
              margin: "0 0 2px",
            }}
          >
            À : Greffe TJ Paris
          </p>
          <p
            style={{
              fontSize: "clamp(12px, 1.8vw, 13px)",
              color: "#999",
              margin: "0 0 12px",
            }}
          >
            Objet : Re: Convocation audience Dupont
          </p>
          <div
            style={{
              height: 1,
              background: "#f0f0f0",
              margin: "0 0 12px",
            }}
          />
          <p
            style={{
              fontSize: "clamp(13px, 2vw, 15px)",
              color: "#1a1a1a",
              lineHeight: 1.6,
              margin: 0,
              minHeight: 28,
            }}
          >
            <TypingText text={draftText} active={t >= 1} />
          </p>

          {t >= 4 && (
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", position: "relative" }}>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  border: "1px solid #1a1a1a",
                  borderRadius: 8,
                  padding: "8px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  background: "#ffffff",
                  color: "#1a1a1a",
                  cursor: "default",
                }}
              >
                Envoyer
              </motion.button>
              <AnimatedCursor
                fromX={60}
                fromY={-30}
                toX={16}
                toY={4}
                trigger={t >= 4}
                delay={0}
              />
            </div>
          )}
        </div>
      </FadeIn>
    </SceneWrapper>
  )
}

// ─── SCENE 5 — "Le bénéfice" ───
function Scene5({ t }: { t: number }) {
  return (
    <SceneWrapper>
      <FadeIn>
        <p
          style={{
            fontSize: "clamp(64px, 14vw, 80px)",
            fontWeight: 700,
            color: "#1a1a1a",
            textAlign: "center",
            lineHeight: 1,
            letterSpacing: "-2px",
            margin: 0,
          }}
        >
          2h
        </p>
      </FadeIn>
      <FadeIn delay={0.3}>
        <p
          style={{
            fontSize: "clamp(16px, 3vw, 20px)",
            color: "#999",
            textAlign: "center",
            marginTop: 12,
            fontWeight: 400,
          }}
        >
          gagnées chaque matin
        </p>
      </FadeIn>
      {t >= 2 && (
        <FadeIn delay={0} slideUp style={{ marginTop: 28 }}>
          <p
            style={{
              fontSize: "clamp(13px, 2vw, 16px)",
              color: "#bbb",
              textAlign: "center",
              fontStyle: "italic",
              maxWidth: 280,
              lineHeight: 1.6,
            }}
          >
            Du temps pour vos clients.
            <br />
            Pas pour votre boîte mail.
          </p>
        </FadeIn>
      )}
    </SceneWrapper>
  )
}

// ─── SCENE 6 — "CTA" ───
function Scene6({ t }: { t: number }) {
  return (
    <SceneWrapper>
      <FadeIn>
        <p
          style={{
            fontSize: "clamp(36px, 8vw, 52px)",
            fontWeight: 300,
            color: "#1a1a1a",
            textAlign: "center",
            letterSpacing: "4px",
            margin: 0,
          }}
        >
          Donna
        </p>
      </FadeIn>
      <FadeIn delay={0.4}>
        <p
          style={{
            fontSize: "clamp(13px, 2vw, 16px)",
            color: "#999",
            textAlign: "center",
            marginTop: 12,
            fontWeight: 400,
          }}
        >
          L'assistante qui veille pendant que vous plaidez
        </p>
      </FadeIn>
      {t >= 1.5 && (
        <FadeIn delay={0} slideUp style={{ marginTop: 32 }}>
          <button
            style={{
              border: "1px solid #1a1a1a",
              borderRadius: 8,
              padding: "12px 32px",
              fontSize: "clamp(13px, 2vw, 15px)",
              fontWeight: 600,
              background: "#ffffff",
              color: "#1a1a1a",
              cursor: "default",
              letterSpacing: "0.2px",
            }}
          >
            Essayer gratuitement
          </button>
          <p
            style={{
              fontSize: "clamp(11px, 1.6vw, 13px)",
              color: "#bbb",
              textAlign: "center",
              marginTop: 10,
            }}
          >
            Gratuit 14 jours
          </p>
        </FadeIn>
      )}
    </SceneWrapper>
  )
}

// ─── MAIN COMPONENT ───
export default function DashboardCinematic({ className = "" }: Props) {
  const [t, setT] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    ref.current = setInterval(() => {
      setT((p) => {
        const next = parseFloat((p + 0.1).toFixed(1))
        return next >= TOTAL ? 0 : next
      })
    }, 100)
    return () => {
      if (ref.current) clearInterval(ref.current)
    }
  }, [])

  const scene = Math.min(Math.floor(t / SCENE_DURATION), TOTAL_SCENES - 1)
  const st = t - scene * SCENE_DURATION

  const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6]
  const SceneComponent = scenes[scene]

  return (
    <div
      className={className}
      style={{
        width: "100%",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 4px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        border: "1px solid #eeeeee",
        background: "#fafafa",
      }}
    >
      <div style={{ position: "relative", minHeight: 420 }}>
        <AnimatePresence mode="wait">
          <SceneComponent key={`scene-${scene}`} t={st} />
        </AnimatePresence>
      </div>

      {/* Bottom navigation — 6 dots */}
      <div
        style={{
          padding: "10px 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          borderTop: "1px solid #f0f0f0",
          background: "#ffffff",
        }}
      >
        {Array.from({ length: TOTAL_SCENES }, (_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === scene ? 10 : 8,
              height: i === scene ? 10 : 8,
              background: i === scene ? "#1a1a1a" : "#d0d0d0",
            }}
            transition={{ duration: 0.25 }}
            style={{
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}
