import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Cycle total : 25 secondes
// Phase 1 : 0-5s   → Scan emails
// Phase 2 : 5-15s  → Dossiers se créent
// Phase 3 : 15-22s → Briefing / tâches
// Phase 4 : 22-25s → Fade out + reset

const CYCLE = 25

const EMAILS_SCAN = [
  "Tribunal de Paris — Convocation JAF",
  "Me Karim Benzara — RE: Conclusions",
  "Cabinet Moreau — Pièces complémentaires",
  "Greffe TGI Nanterre — Notification jugement",
  "Marie Dupont — Documents demandés",
  "Jean-Pierre Martin — Accord de principe",
  "Résidence Les Lilas — Impayés mars 2026",
  "Notaire Girard — Succession Martin",
  "Tribunal Commerce — Assignation n°2026",
  "Claire Dubois — Consultation divorce",
]

const DOSSIERS = [
  { name: "Jean-Pierre Martin", color: "#3B82F6", domain: "Droit civil" },
  { name: "Marie Dupont", color: "#8B5CF6", domain: "Droit famille" },
  { name: "Claire Dubois", color: "#0D9488", domain: "Divorce" },
]

const TACHES = [
  { label: "Convocation JAF — 15 avril", badge: "Urgent", badgeColor: "#EF4444", badgeBg: "#FEF2F2" },
  { label: "Loyers impayés — Résidence Les Lilas", badge: "Action", badgeColor: "#D97706", badgeBg: "#FEF3C7" },
  { label: "Succession Martin — pièces manquantes", badge: "En attente", badgeColor: "#6B7280", badgeBg: "#F3F4F6" },
]

export default function LandingDashboardCinematic({ className = "" }: { className?: string }) {
  const [t, setT] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setT(prev => {
        const next = (prev + 0.1) % CYCLE
        return parseFloat(next.toFixed(1))
      })
    }, 100)
    return () => clearInterval(timer)
  }, [])

  // Gestion du fade-out en phase 4
  useEffect(() => {
    setFadeOut(t >= 22)
  }, [t >= 22])

  const phase = t < 5 ? 1 : t < 15 ? 2 : t < 22 ? 3 : 4

  // Nombre d'emails scannés (phase 1 : 0→89 en 5s)
  const emailCount = phase === 1 ? Math.floor((t / 5) * 89) : 89

  // Emails défilants visibles (phase 1)
  const visibleEmailIdx = phase === 1 ? Math.floor((t / 5) * EMAILS_SCAN.length) : EMAILS_SCAN.length

  // Dossiers apparus (phase 2 : 1 dossier toutes les ~2s)
  const dossiersCount = phase === 1 ? 0 : phase === 2 ? Math.min(Math.floor((t - 5) / 3) + 1, 3) : 3

  // Dossier actif en phase 2 (celui sur lequel le curseur "clique")
  const activeDossierIdx = phase === 2 ? Math.min(Math.floor((t - 5) / 3), 2) : phase >= 3 ? 0 : -1

  // Tâches apparues (phase 3)
  const tachesCount = phase === 3 ? Math.min(Math.floor((t - 15) / 2) + 1, 3) : phase > 3 ? 3 : 0

  // Message "tape" en phase 3
  const donnaMessage = "3 tâches identifiées"
  const donnaTypedLen = phase === 3 ? Math.min(Math.floor((t - 20) * 10), donnaMessage.length) : phase > 3 ? donnaMessage.length : 0

  // ── Position du curseur ──
  // Phase 1 (0-5s) : survole la zone principale (zone de scan)
  // Phase 2 (5-15s) : clique sur chaque dossier dans la sidebar
  // Phase 3 (15-22s) : clique sur "Tableau de bord" puis sur les tâches
  // Phase 4 (22-25s) : disparaît
  let cursorX = 220
  let cursorY = 120
  let cursorClick = false

  if (phase === 1) {
    // Survole la barre de progression et les emails qui défilent
    const progress = t / 5
    cursorX = 180 + Math.sin(progress * Math.PI * 2) * 60
    cursorY = 80 + progress * 60
  } else if (phase === 2) {
    // Clique sur chaque dossier dans la sidebar
    const subT = t - 5
    if (subT < 1) {
      // Se déplace vers la sidebar
      cursorX = 60
      cursorY = 140 + activeDossierIdx * 32
    } else if (subT < 1.5) {
      cursorX = 60
      cursorY = 140 + activeDossierIdx * 32
      cursorClick = true
    } else {
      // Se déplace vers le contenu du dossier
      cursorX = 200 + Math.sin(subT * 2) * 30
      cursorY = 140 + (subT - 1.5) * 20
    }
  } else if (phase === 3) {
    const subT = t - 15
    if (subT < 2) {
      // Clique sur "Tableau de bord"
      cursorX = 60
      cursorY = 220
      cursorClick = subT > 0.5 && subT < 1.2
    } else {
      // Survole les tâches
      const taskIdx = Math.min(Math.floor((subT - 2) / 2), 2)
      cursorX = 200 + Math.sin(subT) * 20
      cursorY = 120 + taskIdx * 52
      cursorClick = (subT % 2) < 0.5
    }
  } else {
    // Phase 4 : curseur disparaît
    cursorX = 200
    cursorY = 200
  }

  return (
    <motion.div
      className={className}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      style={{
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        borderRadius: 12,
        border: "1px solid #E5E5E5",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        overflow: "hidden",
        background: "#FFFFFF",
        userSelect: "none",
        position: "relative",
      }}
    >
      {/* Barre titre */}
      <div style={{
        background: "#F9FAFB",
        borderBottom: "1px solid #E5E5E5",
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#E5E5E5" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#E5E5E5" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#E5E5E5" }} />
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{
            background: "#EBEBEB",
            borderRadius: 6,
            padding: "2px 16px",
            fontSize: 10,
            color: "#737373",
            fontFamily: "Inter, sans-serif",
          }}>
            app.donna-legal.com
          </div>
        </div>
      </div>

      {/* Corps principal */}
      <div style={{ display: "flex", height: 360, position: "relative", overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <div style={{
          width: 148,
          minWidth: 148,
          background: "#F9FAFB",
          borderRight: "1px solid #E5E5E5",
          padding: "14px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}>
          {/* Branding */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0D0D0D", marginBottom: 2, fontFamily: "Inter, sans-serif" }}>
            Donna
          </div>
          <div style={{ fontSize: 9, color: "#10B981", marginBottom: 12, fontFamily: "Inter, sans-serif" }}>
            ● Analyse en cours
          </div>

          {/* Nav items */}
          {[
            { label: "Boîte de réception", active: phase === 1 },
            { label: "Dossiers", active: phase === 2 },
            { label: "Tableau de bord", active: phase === 3 },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                fontSize: 11,
                color: item.active ? "#0D0D0D" : "#737373",
                fontWeight: item.active ? 600 : 400,
                padding: "6px 8px",
                borderRadius: 6,
                background: item.active ? "#F0F0F0" : "transparent",
                borderLeft: item.active ? "2px solid #0D0D0D" : "2px solid transparent",
                fontFamily: "Inter, sans-serif",
                transition: "all 0.3s ease",
              }}
            >
              {item.label}
            </div>
          ))}

          {/* Séparateur */}
          <div style={{ borderTop: "1px solid #E5E5E5", margin: "8px 0" }} />

          {/* Dossiers */}
          <div style={{ fontSize: 9, color: "#737373", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, fontFamily: "Inter, sans-serif" }}>
            Dossiers
          </div>

          {DOSSIERS.map((d, i) => (
            <AnimatePresence key={d.name}>
              {i < dossiersCount && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    background: i === activeDossierIdx ? "#F0F0F0" : "transparent",
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, delay: 0 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 8px",
                    borderRadius: 6,
                    fontSize: 10,
                    color: "#0D0D0D",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <div style={{ width: 7, height: 7, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* ── Zone principale ── */}
        <div style={{ flex: 1, minWidth: 0, position: "relative", overflow: "hidden" }}>
          <AnimatePresence mode="wait">

            {/* PHASE 1 — Scan emails */}
            {phase === 1 && (
              <motion.div
                key="phase1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ height: "100%", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}
              >
                {/* Titre */}
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0D0D0D", fontFamily: "Inter, sans-serif" }}>
                  Analyse de votre boîte mail
                </div>

                {/* Cercle de progression */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ position: "relative", width: 60, height: 60 }}>
                    <svg width="60" height="60" viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="25" fill="none" stroke="#E5E5E5" strokeWidth="4" />
                      <motion.circle
                        cx="30" cy="30" r="25"
                        fill="none"
                        stroke="#0D0D0D"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 25}`}
                        animate={{ strokeDashoffset: 2 * Math.PI * 25 * (1 - emailCount / 89) }}
                        transition={{ duration: 0.2 }}
                        style={{ transformOrigin: "30px 30px", transform: "rotate(-90deg)" }}
                      />
                    </svg>
                    <div style={{
                      position: "absolute", inset: 0, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: "#0D0D0D",
                      fontFamily: "Inter, sans-serif",
                    }}>
                      {emailCount}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#0D0D0D", fontFamily: "Inter, sans-serif" }}>
                      {emailCount} emails analysés
                    </div>
                    <div style={{ fontSize: 10, color: "#737373", fontFamily: "Inter, sans-serif" }}>
                      Identification des clients...
                    </div>
                  </div>
                </div>

                {/* Emails qui défilent */}
                <div style={{
                  flex: 1,
                  overflow: "hidden",
                  borderRadius: 8,
                  border: "1px solid #E5E5E5",
                }}>
                  {EMAILS_SCAN.slice(0, visibleEmailIdx).map((subject, i) => (
                    <motion.div
                      key={subject}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        padding: "6px 12px",
                        borderBottom: i < visibleEmailIdx - 1 ? "1px solid #F0F0F0" : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: i === visibleEmailIdx - 1 ? "#10B981" : "#E5E5E5",
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontSize: 10,
                        color: i === visibleEmailIdx - 1 ? "#0D0D0D" : "#737373",
                        fontFamily: "Inter, sans-serif",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {subject}
                      </span>
                      {i === visibleEmailIdx - 1 && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{
                            marginLeft: "auto", fontSize: 9, color: "#10B981",
                            fontWeight: 600, flexShrink: 0, fontFamily: "Inter, sans-serif",
                          }}
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PHASE 2 — Dossiers se créent + contenu */}
            {phase === 2 && (
              <motion.div
                key="phase2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ height: "100%", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0D0D0D", fontFamily: "Inter, sans-serif" }}>
                  {dossiersCount < 3 ? "Création des dossiers clients..." : "Dossiers créés — sélection d'un dossier"}
                </div>

                {/* Dossier actif : contenu */}
                {activeDossierIdx >= 0 && activeDossierIdx < DOSSIERS.length && (
                  <motion.div
                    key={activeDossierIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      border: "1px solid #E5E5E5",
                      borderRadius: 8,
                      overflow: "hidden",
                      flex: 1,
                    }}
                  >
                    {/* En-tête dossier */}
                    <div style={{
                      background: "#F9FAFB",
                      borderBottom: "1px solid #E5E5E5",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: 2,
                        background: DOSSIERS[activeDossierIdx].color,
                      }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#0D0D0D", fontFamily: "Inter, sans-serif" }}>
                        {DOSSIERS[activeDossierIdx].name}
                      </span>
                      <span style={{ fontSize: 10, color: "#737373", fontFamily: "Inter, sans-serif" }}>
                        — {DOSSIERS[activeDossierIdx].domain}
                      </span>
                    </div>

                    {/* Emails du dossier */}
                    <div style={{ padding: "8px 0" }}>
                      {[
                        { subject: "Convocation audience — 15 avril", date: "Auj.", isNew: true },
                        { subject: "Documents complémentaires reçus", date: "Hier", isNew: false },
                        { subject: "Confirmation rendez-vous", date: "02/04", isNew: false },
                      ].map((mail, idx) => {
                        const subT = t - 5
                        const visible = subT > 1.5 + idx * 0.6
                        return (
                          <motion.div
                            key={mail.subject}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 8 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              padding: "6px 12px",
                              borderBottom: idx < 2 ? "1px solid #F0F0F0" : "none",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <div style={{
                              width: 6, height: 6, borderRadius: "50%",
                              background: mail.isNew ? "#0D0D0D" : "#E5E5E5",
                              flexShrink: 0,
                            }} />
                            <span style={{
                              flex: 1,
                              fontSize: 10,
                              fontWeight: mail.isNew ? 600 : 400,
                              color: "#0D0D0D",
                              fontFamily: "Inter, sans-serif",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                              {mail.subject}
                            </span>
                            <span style={{ fontSize: 9, color: "#737373", flexShrink: 0, fontFamily: "Inter, sans-serif" }}>
                              {mail.date}
                            </span>
                            {mail.isNew && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{
                                  fontSize: 9, color: "#10B981", fontWeight: 700,
                                  flexShrink: 0, fontFamily: "Inter, sans-serif",
                                }}
                              >
                                ✓
                              </motion.span>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* PJ */}
                    <div style={{
                      borderTop: "1px solid #E5E5E5",
                      padding: "8px 12px",
                      display: "flex",
                      gap: 8,
                    }}>
                      {["Convocation.pdf", "Conclusions.docx"].map((pj, idx) => {
                        const subT = t - 5
                        const visible = subT > 2.5 + idx * 0.5
                        return (
                          <motion.div
                            key={pj}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }}
                            transition={{ duration: 0.25 }}
                            style={{
                              background: "#F3F4F6",
                              borderRadius: 6,
                              padding: "3px 8px",
                              fontSize: 9,
                              color: "#737373",
                              fontFamily: "Inter, sans-serif",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <span style={{ fontSize: 8 }}>📎</span>
                            {pj}
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* PHASE 3 — Briefing / tâches */}
            {phase === 3 && (
              <motion.div
                key="phase3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ height: "100%", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}
              >
                {/* Greeting */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0D0D0D", fontFamily: "Inter, sans-serif" }}>
                    Tableau de bord
                  </div>
                  <div style={{ fontSize: 10, color: "#737373", fontFamily: "Inter, sans-serif", marginTop: 2 }}>
                    {tachesCount > 0 ? `${tachesCount} tâche${tachesCount > 1 ? "s" : ""} identifiée${tachesCount > 1 ? "s" : ""}` : "Analyse en cours..."}
                  </div>
                </div>

                {/* Tâches */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {TACHES.slice(0, tachesCount).map((tache, i) => (
                    <motion.div
                      key={tache.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.05 }}
                      style={{
                        border: "1px solid #E5E5E5",
                        borderRadius: 8,
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#FFFFFF",
                      }}
                    >
                      <div style={{
                        width: 14, height: 14, borderRadius: "50%",
                        border: "1.5px solid #E5E5E5",
                        flexShrink: 0,
                      }} />
                      <span style={{
                        flex: 1,
                        fontSize: 10,
                        color: "#0D0D0D",
                        fontFamily: "Inter, sans-serif",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {tache.label}
                      </span>
                      <span style={{
                        fontSize: 9,
                        color: tache.badgeColor,
                        background: tache.badgeBg,
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontWeight: 600,
                        flexShrink: 0,
                        fontFamily: "Inter, sans-serif",
                      }}>
                        {tache.badge}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Message Donna qui "tape" */}
                {donnaTypedLen > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      marginTop: "auto",
                      background: "#0D0D0D",
                      borderRadius: 8,
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: "#FFFFFF20",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700, color: "#FFFFFF",
                      flexShrink: 0, fontFamily: "Inter, sans-serif",
                    }}>
                      D
                    </div>
                    <span style={{ fontSize: 10, color: "#FFFFFF", fontFamily: "Inter, sans-serif" }}>
                      {donnaMessage.slice(0, donnaTypedLen)}
                      {donnaTypedLen < donnaMessage.length && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        >
                          ▌
                        </motion.span>
                      )}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── Curseur animé ── */}
        {phase !== 4 && (
          <motion.div
            animate={{
              x: cursorX,
              y: cursorY,
              scale: cursorClick ? [1, 0.75, 1] : 1,
            }}
            transition={{
              x: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
              y: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
              scale: { duration: 0.25, ease: "easeInOut" },
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#0D0D0D",
              boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
              pointerEvents: "none",
              zIndex: 50,
              transformOrigin: "center center",
            }}
          >
            {/* Anneau de pulse au clic */}
            {cursorClick && (
              <motion.div
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "#0D0D0D",
                }}
              />
            )}
          </motion.div>
        )}

      </div>
    </motion.div>
  )
}
