import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Props {
  theme?: "light" | "dark"
  className?: string
  chromeless?: boolean
}

// 4 scenes × ~8s = 32s cycle
const CYCLE = 32
const SCENES = [0, 8, 16, 24] // start times

const C = {
  bg: "#FFFFFF", sidebar: "#F9FAFB", card: "#F3F4F6", border: "#E5E7EB",
  text: "#111827", muted: "#6B7280", light: "#9CA3AF",
  accent: "#2563EB", accentBg: "#EFF6FF",
  green: "#10B981", red: "#EF4444",
}

const FOLDERS = [
  { name: "Dupont c/ Dupont", color: "#2563EB" },
  { name: "SCI Les Tilleuls", color: "#3B82F6" },
  { name: "Succession Martin", color: "#F59E0B" },
]

export default function DashboardCinematic({ className = "" }: Props) {
  const [t, setT] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setT(p => (p + 0.1) % CYCLE), 100)
    return () => clearInterval(timer)
  }, [])

  const scene = t < 8 ? 0 : t < 16 ? 1 : t < 24 ? 2 : 3
  const st = t - SCENES[scene] // scene-local time

  // Sidebar: which nav item is active
  const navActive = scene === 3 ? "briefing" : "dossiers"
  // Which folder is highlighted
  const activeFolderIdx = scene === 1 ? 0 : scene === 2 ? 1 : -1

  // Folders appear progressively during scene 0
  const foldersVisible = scene === 0
    ? [st > 4, st > 5, st > 6]
    : [true, true, true]

  return (
    <div className={className} style={{
      width: "100%", maxWidth: 1000, margin: "0 auto",
      borderRadius: 16, overflow: "hidden",
      boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ background: C.bg, height: 520, display: "flex", position: "relative", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{
          width: 188, minWidth: 188, background: C.sidebar,
          borderRight: `1px solid ${C.border}`, padding: "20px 12px",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 2 }}>Donna</div>
          <div style={{ fontSize: 10, color: C.green, marginBottom: 24 }}>
            ● {scene === 0 ? "Analyse en cours..." : scene === 1 ? "Dossier ouvert" : scene === 2 ? "Dossier ouvert" : "Briefing prêt"}
          </div>

          {/* Nav: Tableau de bord */}
          <motion.div
            animate={{
              background: navActive === "dashboard" ? C.accentBg : "transparent",
              color: navActive === "dashboard" ? C.accent : C.muted,
            }}
            style={{ fontSize: 12, padding: "7px 10px", borderRadius: 8, marginBottom: 12, fontWeight: 500 }}
          >
            Tableau de bord
          </motion.div>

          {/* Folders section */}
          <div style={{ fontSize: 9, color: C.light, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, paddingLeft: 10 }}>
            Dossiers
          </div>
          {FOLDERS.map((f, i) => (
            <AnimatePresence key={f.name}>
              {foldersVisible[i] && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{
                    opacity: 1, x: 0,
                    background: activeFolderIdx === i ? C.accentBg : "transparent",
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 10px", borderRadius: 8, marginBottom: 3,
                    fontSize: 12, color: C.text,
                  }}
                >
                  {/* Colored dot badge */}
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: f.color, flexShrink: 0,
                  }} />
                  <span style={{
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    color: activeFolderIdx === i ? C.accent : C.text,
                    fontWeight: activeFolderIdx === i ? 600 : 400,
                  }}>
                    {f.name}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}

          {/* Nav: Briefing */}
          <div style={{ marginTop: "auto" }}>
            <motion.div
              animate={{
                background: navActive === "briefing" ? C.accentBg : "transparent",
                color: navActive === "briefing" ? C.accent : C.muted,
              }}
              style={{ fontSize: 12, padding: "7px 10px", borderRadius: 8, fontWeight: 500 }}
            >
              Briefing
            </motion.div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden", position: "relative" }}>
          <AnimatePresence mode="wait">
            {scene === 0 && <SceneScan key="s0" t={st} />}
            {scene === 1 && <SceneDossierDupont key="s1" t={st} />}
            {scene === 2 && <SceneDossierSCI key="s2" t={st} />}
            {scene === 3 && <SceneBriefing key="s3" t={st} />}
          </AnimatePresence>
        </div>

        {/* Donna agent */}
        <DonnaAgent scene={scene} st={st} />
      </div>
    </div>
  )
}

// ─── DONNA AGENT ───

function DonnaAgent({ scene, st }: { scene: number; st: number }) {
  let x = 300, y = 200, label = "", visible = true

  if (scene === 0) {
    x = st < 3 ? 240 : 180
    y = st < 3 ? 80 : 140
    label = st < 3 ? "Analyse des emails..." : "89 emails reçus ce mois-ci..."
    visible = st > 0.5
  } else if (scene === 1) {
    // Cursor moves to sidebar folder, then into content
    if (st < 2) {
      x = -110; y = 100   // sidebar: Dupont folder
      label = "Ouverture du dossier..."
    } else if (st < 4) {
      x = 160; y = 100
      label = "3 échanges, 2 pièces jointes classées..."
    } else {
      x = 160; y = 220
      label = "Échéance JAF le 15 avril"
    }
  } else if (scene === 2) {
    if (st < 1.5) {
      x = -110; y = 130   // sidebar: SCI folder
      label = "Dossier suivant..."
    } else if (st < 4) {
      x = 140; y = 80
      label = "Loyers impayés 12 600€..."
    } else {
      x = 140; y = 200
      label = "Mise en demeure prête"
    }
  } else if (scene === 3) {
    if (st < 1.5) {
      x = -120; y = 300   // sidebar: Briefing nav
      label = "Retour au briefing..."
    } else if (st < 3) {
      x = 180; y = 60
      label = "Votre briefing est prêt"
    } else {
      x = 200; y = 220
      label = "3 tâches identifiées"
    }
  }

  if (!visible) return null

  return (
    <motion.div
      animate={{ x, y }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      style={{
        position: "absolute", zIndex: 30, pointerEvents: "none",
        display: "flex", alignItems: "center", gap: 8,
        left: 188, // offset by sidebar width
      }}
    >
      <motion.div
        animate={{
          boxShadow: ["0 0 0px #2563EB40", "0 0 16px #2563EB50", "0 0 0px #2563EB40"],
        }}
        transition={{ duration: 1.2, repeat: Infinity }}
        style={{
          width: 30, height: 30, borderRadius: "50%",
          background: C.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: "#fff",
          border: "2px solid #fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        D
      </motion.div>
      <motion.div
        key={label}
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        style={{
          background: "#fff", padding: "4px 12px", borderRadius: 16,
          fontSize: 11, fontWeight: 500, color: C.accent,
          whiteSpace: "nowrap",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          border: `1px solid ${C.border}`,
        }}
      >
        {label}
      </motion.div>
    </motion.div>
  )
}

// ─── SCENE 0: SCAN DES EMAILS ───

const EMAIL_SUBJECTS = [
  "Convocation audience JAF — 15 avril",
  "RE: Conclusions — SCI Les Tilleuls",
  "Pièces complémentaires dossier Dupont",
  "Notification jugement n°2026/1847",
  "Mise en demeure — Loyers impayés",
  "Rapport expertise immobilière",
  "Demande de renvoi — Tribunal correctionnel",
]

function SceneScan({ t }: { t: number }) {
  // Counter goes from 0 to 89 over ~3.5 seconds
  const counter = Math.min(Math.round((t / 3.5) * 89), 89)
  // Which subjects are visible (one every ~0.8s, starting at t=0.5)
  const visibleSubjects = EMAIL_SUBJECTS.filter((_, i) => t > 0.5 + i * 0.8)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Analyse de vos emails...</span>
      </div>

      {/* Central scan circle + counter */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24, paddingBottom: 16 }}>
        <motion.div
          animate={{ boxShadow: ["0 0 0px #2563EB30", "0 0 32px #2563EB40", "0 0 0px #2563EB30"] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            width: 96, height: 96, borderRadius: "50%",
            border: `3px solid ${C.accent}`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: C.accentBg,
          }}
        >
          <motion.span
            key={counter}
            style={{ fontSize: 28, fontWeight: 700, color: C.accent, lineHeight: 1 }}
          >
            {counter}
          </motion.span>
          <span style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>emails</span>
        </motion.div>

        {/* Scanning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            width: 112, height: 112, borderRadius: "50%",
            border: `2px dashed ${C.accent}30`,
            marginTop: 0,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Email subjects scrolling */}
      <div style={{ flex: 1, overflow: "hidden", padding: "0 24px" }}>
        <div style={{ fontSize: 10, color: C.light, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          Sujets détectés
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {visibleSubjects.slice(-5).map((subj, i) => (
            <motion.div
              key={subj}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                fontSize: 11, color: C.text,
                padding: "5px 10px", borderRadius: 6,
                background: i === visibleSubjects.slice(-5).length - 1 ? C.accentBg : C.card,
                border: `1px solid ${i === visibleSubjects.slice(-5).length - 1 ? C.accent + "30" : C.border}`,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {subj}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── SCENE 1: DOSSIER DUPONT C/ DUPONT ───

function SceneDossierDupont({ t }: { t: number }) {
  const emails = [
    { initials: "TP", color: "#2563EB", sender: "Tribunal de Paris", subject: "Convocation audience JAF — 15 avril", date: "Auj." },
    { initials: "CM", color: "#10B981", sender: "Cabinet Moreau", subject: "Pièces complémentaires", date: "Auj." },
    { initials: "MB", color: "#3B82F6", sender: "Me Benzara", subject: "Conclusions en réponse", date: "02/04" },
  ]
  const attachments = [
    { name: "Convocation_JAF.pdf", type: "PDF", color: C.red },
    { name: "Conclusions_v2.docx", type: "DOC", color: C.accent },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563EB" }} />
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Dupont c/ Dupont</span>
        <span style={{ fontSize: 11, color: C.light }}>Droit de la famille</span>
      </div>

      {/* Emails sliding in */}
      <div style={{ padding: "12px 24px 8px" }}>
        <div style={{ fontSize: 10, color: C.light, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
          Échanges
        </div>
        {emails.map((e, i) => (
          <motion.div
            key={e.sender}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: t > 0.4 + i * 0.9 ? 1 : 0, x: t > 0.4 + i * 0.9 ? 0 : 20 }}
            transition={{ duration: 0.35 }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 8, marginBottom: 4,
              background: i === 0 ? C.accentBg : C.card,
              border: `1px solid ${i === 0 ? C.accent + "25" : C.border}`,
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: e.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {e.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: i === 0 ? 700 : 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.sender}</div>
              <div style={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.subject}</div>
            </div>
            <div style={{ fontSize: 10, color: C.light, flexShrink: 0 }}>{e.date}</div>
          </motion.div>
        ))}
      </div>

      {/* Attachments appearing */}
      <div style={{ padding: "0 24px 8px" }}>
        <div style={{ fontSize: 10, color: C.light, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
          Pièces jointes
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {attachments.map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: t > 3.2 + i * 0.7 ? 1 : 0, y: t > 3.2 + i * 0.7 ? 0 : 8 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 10px", borderRadius: 8,
                border: `1px solid ${C.border}`, background: C.card,
              }}
            >
              <div style={{ width: 22, height: 22, borderRadius: 4, background: a.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: a.color }}>
                {a.type}
              </div>
              <span style={{ fontSize: 10, color: C.text }}>{a.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Deadline badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: t > 5.2 ? 1 : 0, scale: t > 5.2 ? 1 : 0.9 }}
        transition={{ duration: 0.35 }}
        style={{
          margin: "4px 24px 0",
          padding: "10px 14px", borderRadius: 10,
          background: "#FEF2F2", border: `1px solid ${C.red}30`,
          display: "flex", alignItems: "center", gap: 8,
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "#991B1B", fontWeight: 600 }}>15 avril — Audience JAF</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: C.red, background: "#FEF2F2", fontWeight: 700, padding: "2px 7px", borderRadius: 5, border: `1px solid ${C.red}40` }}>
          URGENT
        </span>
      </motion.div>
    </motion.div>
  )
}

// ─── SCENE 2: DOSSIER SCI LES TILLEULS ───

function SceneDossierSCI({ t }: { t: number }) {
  const emails = [
    { initials: "KB", color: "#3B82F6", sender: "Me Karim Benzara", subject: "RE: Conclusions — SCI Les Tilleuls", date: "Auj." },
    { initials: "GN", color: "#EF4444", sender: "Greffe TGI Nanterre", subject: "Notification jugement n°2026/1847", date: "07/04" },
    { initials: "PD", color: "#F59E0B", sender: "Prop. Duplessis", subject: "Mise en demeure", date: "05/04" },
  ]
  const attachments = [
    { name: "Mise_en_demeure.pdf", type: "PDF", color: C.red },
    { name: "Bail_SCI.pdf", type: "PDF", color: C.red },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B82F6" }} />
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>SCI Les Tilleuls</span>
        <span style={{ fontSize: 11, color: C.light }}>Droit immobilier</span>
      </div>

      {/* Emails */}
      <div style={{ padding: "12px 24px 8px" }}>
        <div style={{ fontSize: 10, color: C.light, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
          Échanges
        </div>
        {emails.map((e, i) => (
          <motion.div
            key={e.sender}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: t > 0.3 + i * 0.6 ? 1 : 0, x: t > 0.3 + i * 0.6 ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 8, marginBottom: 4,
              background: i === 0 ? C.accentBg : C.card,
              border: `1px solid ${i === 0 ? C.accent + "25" : C.border}`,
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: e.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {e.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: i === 0 ? 700 : 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.sender}</div>
              <div style={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.subject}</div>
            </div>
            <div style={{ fontSize: 10, color: C.light, flexShrink: 0 }}>{e.date}</div>
          </motion.div>
        ))}
      </div>

      {/* Attachments */}
      <div style={{ padding: "0 24px 8px" }}>
        <div style={{ fontSize: 10, color: C.light, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
          Pièces jointes
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {attachments.map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: t > 2.5 + i * 0.5 ? 1 : 0, y: t > 2.5 + i * 0.5 ? 0 : 8 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 10px", borderRadius: 8,
                border: `1px solid ${C.border}`, background: C.card,
              }}
            >
              <div style={{ width: 22, height: 22, borderRadius: 4, background: a.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: a.color }}>
                {a.type}
              </div>
              <span style={{ fontSize: 10, color: C.text }}>{a.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Amount + status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: t > 4.5 ? 1 : 0, scale: t > 4.5 ? 1 : 0.9 }}
        transition={{ duration: 0.35 }}
        style={{
          margin: "4px 24px 0",
          padding: "10px 14px", borderRadius: 10,
          background: "#FEF2F2", border: `1px solid ${C.red}30`,
          display: "flex", alignItems: "center", gap: 8,
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "#991B1B", fontWeight: 600 }}>Loyers impayés 12 600€</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: C.green, background: "#ECFDF5", fontWeight: 700, padding: "2px 7px", borderRadius: 5, border: `1px solid ${C.green}40` }}>
          Mise en demeure prête
        </span>
      </motion.div>
    </motion.div>
  )
}

// ─── SCENE 3: BRIEFING / TO-DO ───

const TASKS = [
  { title: "Dupont c/ Dupont", detail: "Confirmer présence audience JAF — 15 avril", color: C.red },
  { title: "SCI Les Tilleuls", detail: "Envoyer mise en demeure loyers impayés", color: "#F59E0B" },
  { title: "Succession Martin", detail: "Transmettre inventaire au notaire", color: C.accent },
]

function SceneBriefing({ t }: { t: number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
        {/* Circle "19 emails" */}
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: C.accentBg, border: `2px solid ${C.accent}40`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.accent, lineHeight: 1 }}>19</span>
          <span style={{ fontSize: 7, color: C.muted }}>emails</span>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Bonjour Alexandra.</div>
          <div style={{ fontSize: 11, color: C.muted }}>19 emails lus. 3 tâches identifiées.</div>
        </div>
      </div>

      {/* Task cards */}
      <div style={{ padding: "14px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 10, color: C.light, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>
          Tâches prioritaires
        </div>
        {TASKS.map((task, i) => (
          <motion.div
            key={task.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: t > 1.2 + i * 1.0 ? 1 : 0, y: t > 1.2 + i * 1.0 ? 0 : 12 }}
            transition={{ duration: 0.4 }}
            style={{
              padding: "12px 14px", borderRadius: 10,
              border: `1px solid ${C.border}`, background: C.bg,
              display: "flex", flexDirection: "column", gap: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{task.title}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{task.detail}</div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: task.color, flexShrink: 0, marginLeft: 8 }} />
            </div>
            {/* CTA button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: t > 1.8 + i * 1.0 ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "inline-flex", alignItems: "center",
                padding: "5px 12px", borderRadius: 6,
                background: C.text, color: "#fff",
                fontSize: 11, fontWeight: 600, width: "fit-content",
                cursor: "default",
              }}
            >
              Réponse générée par Donna
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
