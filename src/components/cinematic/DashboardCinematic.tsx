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

export default function DashboardCinematic({ className = "" }: Props) {
  const [t, setT] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setT(p => (p + 0.1) % CYCLE), 100)
    return () => clearInterval(timer)
  }, [])

  const scene = t < 8 ? 0 : t < 16 ? 1 : t < 24 ? 2 : 3
  const st = t - SCENES[scene] // scene-local time

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
          width: 180, minWidth: 180, background: C.sidebar,
          borderRight: `1px solid ${C.border}`, padding: "20px 12px",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 2 }}>Donna</div>
          <div style={{ fontSize: 10, color: C.green, marginBottom: 24 }}>
            ● {scene === 0 ? "Nouveau mail reçu" : scene === 1 ? "Classement en cours" : scene === 2 ? "Dossier ouvert" : "Brouillon généré"}
          </div>

          <div style={{ fontSize: 9, color: C.light, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Dossiers</div>
          {["Dupont c/ Dupont", "SCI Les Tilleuls", "Succession Martin"].map((name, i) => (
            <motion.div
              key={name}
              animate={{
                background: (scene >= 2 && i === 0) ? C.accentBg : "transparent",
                scale: (scene === 1 && st > 5 && i === 0) ? [1, 1.04, 1] : 1,
              }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 10px", borderRadius: 8, marginBottom: 3,
                fontSize: 12, color: C.text,
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: 3, background: ["#2563EB", "#3B82F6", "#F59E0B"][i] }} />
              <span>{name}</span>
            </motion.div>
          ))}

          <div style={{ marginTop: "auto" }}>
            {["Inbox", "Dossiers", "Briefing"].map((label, i) => (
              <motion.div
                key={label}
                animate={{
                  background: (scene === 0 && i === 0) || (scene >= 1 && scene <= 2 && i === 1) || (scene === 3 && i === 2) ? C.accentBg : "transparent",
                  color: (scene === 0 && i === 0) || (scene >= 1 && scene <= 2 && i === 1) || (scene === 3 && i === 2) ? C.accent : C.muted,
                }}
                style={{ fontSize: 12, padding: "7px 10px", borderRadius: 8, marginBottom: 2 }}
              >
                {label}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden", position: "relative" }}>
          <AnimatePresence mode="wait">
            {scene === 0 && <SceneInbox key="s0" t={st} />}
            {scene === 1 && <SceneDragDrop key="s1" t={st} />}
            {scene === 2 && <SceneDossier key="s2" t={st} />}
            {scene === 3 && <SceneBrouillon key="s3" t={st} />}
          </AnimatePresence>
        </div>

        {/* Donna avatar */}
        <DonnaAgent scene={scene} st={st} />
      </div>
    </div>
  )
}

// ─── DONNA AGENT — moves, clicks, drags ───

function DonnaAgent({ scene, st }: { scene: number; st: number }) {
  // Donna's position and action per scene
  let x = 400, y = 250, label = "", visible = true

  if (scene === 0) {
    // Watching inbox, then moves to email
    x = st < 3 ? 500 : 440
    y = st < 3 ? 60 : 100
    label = st < 4 ? "Nouveau mail détecté..." : "Analyse du mail..."
    visible = st > 1
  } else if (scene === 1) {
    // Drag email to dossier folder
    if (st < 2) { x = 440; y = 100; label = "Ce mail concerne Dupont..." }
    else if (st < 5) {
      // Dragging animation: from email position to sidebar folder
      const p = Math.min((st - 2) / 3, 1)
      x = 440 - p * 380  // move left towards sidebar
      y = 100 + p * 80   // move down towards folder
      label = "Classement dans Dupont c/ Dupont"
    } else {
      x = 60; y = 180; label = "✓ Mail classé"
    }
  } else if (scene === 2) {
    // Inside dossier, clicking around
    x = st < 3 ? 300 : st < 6 ? 530 : 300
    y = st < 3 ? 60 : st < 6 ? 150 : 200
    label = st < 3 ? "Ouverture du dossier..." : st < 6 ? "Pièce jointe résumée" : "Dossier complet"
  } else if (scene === 3) {
    // Click briefing, then generate draft
    if (st < 2) { x = 350; y = 60; label = "Retour au briefing..." }
    else if (st < 4) { x = 400; y = 200; label = "Clic → Générer brouillon" }
    else { x = 400; y = 250; label = "✓ Brouillon prêt à envoyer" }
  }

  if (!visible) return null

  return (
    <motion.div
      animate={{ x, y }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      style={{
        position: "absolute", zIndex: 30, pointerEvents: "none",
        display: "flex", alignItems: "center", gap: 8,
        left: 180, // offset by sidebar width
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

// ─── SCENE 0: INBOX — new email arrives ───

function SceneInbox({ t }: { t: number }) {
  const emails = [
    { initials: "TP", color: "#2563EB", sender: "Tribunal de Paris", subject: "Convocation audience JAF — 15 avril", time: "08:12", isNew: true },
    { initials: "KB", color: "#3B82F6", sender: "Me Karim Benzara", subject: "RE: Conclusions — SCI Les Tilleuls", time: "08:34", isNew: false },
    { initials: "CM", color: "#10B981", sender: "Cabinet Moreau", subject: "Pièces complémentaires dossier Dupont", time: "09:01", isNew: false },
    { initials: "GN", color: "#EF4444", sender: "Greffe TGI Nanterre", subject: "Notification jugement n°2026/1847", time: "09:28", isNew: false },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Boîte de réception</span>
      </div>

      {/* Existing emails */}
      {emails.slice(1).map((e, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderBottom: `1px solid ${C.border}`, opacity: 0.6 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: e.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>{e.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.sender}</div>
            <div style={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.subject}</div>
          </div>
          <div style={{ fontSize: 10, color: C.light }}>{e.time}</div>
        </div>
      ))}

      {/* NEW email slides in from top */}
      <motion.div
        initial={{ opacity: 0, y: -50, height: 0 }}
        animate={{ opacity: t > 2 ? 1 : 0, y: t > 2 ? 0 : -50, height: t > 2 ? "auto" : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "14px 24px",
          borderBottom: `1px solid ${C.border}`,
          background: t > 4 ? C.accentBg : "#FEF9C3",
          overflow: "hidden", order: -1,
        }}
      >
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>TP</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
            Tribunal de Paris
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: t > 2.5 ? 1 : 0 }}
              style={{ marginLeft: 8, fontSize: 9, background: "#FEF3C7", color: "#92400E", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}
            >
              NOUVEAU
            </motion.span>
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>Convocation audience JAF — 15 avril</div>
        </div>
        <div style={{ fontSize: 10, color: C.light }}>À l'instant</div>
      </motion.div>

      {/* Donna's analysis appearing */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: t > 5 ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ margin: "16px 24px", padding: "12px 16px", borderRadius: 10, background: C.accentBg, border: `1px solid rgba(37,99,235,0.15)` }}
      >
        <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginBottom: 4 }}>Analyse de Donna :</div>
        <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
          Ce mail concerne le dossier <strong>Dupont c/ Dupont</strong>. Convocation JAF le 15 avril, salle 12. <span style={{ color: C.red, fontWeight: 600 }}>Urgent.</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── SCENE 1: DRAG & DROP — Donna moves email to folder ───

function SceneDragDrop({ t }: { t: number }) {
  const dragging = t > 2 && t < 5
  const dropped = t > 5

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Boîte de réception</span>
      </div>

      {/* The email being dragged */}
      <motion.div
        animate={{
          x: dragging ? -200 : 0,
          y: dragging ? 60 : 0,
          scale: dragging ? 0.9 : 1,
          opacity: dropped ? 0 : 1,
          rotate: dragging ? -2 : 0,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "14px 24px",
          borderBottom: `1px solid ${C.border}`,
          background: dragging ? "#EFF6FF" : "#FEF9C3",
          boxShadow: dragging ? "0 8px 30px rgba(0,0,0,0.15)" : "none",
          borderRadius: dragging ? 12 : 0,
          zIndex: dragging ? 10 : 1,
          position: "relative",
        }}
      >
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>TP</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Tribunal de Paris</div>
          <div style={{ fontSize: 12, color: C.muted }}>Convocation audience JAF — 15 avril</div>
        </div>
      </motion.div>

      {/* Remaining emails */}
      {[
        { initials: "KB", color: "#3B82F6", sender: "Me Karim Benzara", subject: "RE: Conclusions — SCI Les Tilleuls" },
        { initials: "CM", color: "#10B981", sender: "Cabinet Moreau", subject: "Pièces complémentaires dossier Dupont" },
      ].map((e, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderBottom: `1px solid ${C.border}`, opacity: 0.5 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: e.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>{e.initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: C.text }}>{e.sender}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{e.subject}</div>
          </div>
        </div>
      ))}

      {/* Success message after drop */}
      <AnimatePresence>
        {dropped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ margin: "20px 24px", padding: "14px 18px", borderRadius: 10, background: "#ECFDF5", border: "1px solid #A7F3D0" }}
          >
            <div style={{ fontSize: 12, color: "#065F46", fontWeight: 600 }}>✓ Mail classé dans "Dupont c/ Dupont"</div>
            <div style={{ fontSize: 11, color: "#047857", marginTop: 4 }}>Pièce jointe détectée → téléchargée et résumée</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── SCENE 2: DOSSIER VIEW — like a drive, mails left, files right ───

function SceneDossier({ t }: { t: number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Dossier header */}
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: 3, background: "#2563EB" }} />
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Dupont c/ Dupont</span>
        <span style={{ fontSize: 11, color: C.light }}>Droit de la famille</span>
      </div>

      {/* Two columns: emails left, files right */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: emails */}
        <div style={{ flex: 1, borderRight: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", fontSize: 10, color: C.light, textTransform: "uppercase", letterSpacing: 1, borderBottom: `1px solid ${C.border}` }}>
            Échanges (12)
          </div>
          {[
            { sender: "Tribunal de Paris", subject: "Convocation JAF", date: "Auj.", urgent: true, isNew: true },
            { sender: "Cabinet Moreau", subject: "Pièces complémentaires", date: "Auj.", urgent: false, isNew: false },
            { sender: "Me Benzara", subject: "Conclusions en réponse", date: "02/04", urgent: false, isNew: false },
            { sender: "Jean-Pierre Martin", subject: "Documents demandés", date: "01/04", urgent: false, isNew: false },
            { sender: "Greffe CPH Paris", subject: "Convocation conciliation", date: "25/03", urgent: false, isNew: false },
          ].map((e, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: t > 0.5 + i * 0.4 ? 1 : 0, x: t > 0.5 + i * 0.4 ? 0 : -10 }}
              transition={{ duration: 0.3 }}
              style={{
                padding: "10px 16px", borderBottom: `1px solid ${C.border}`,
                background: e.isNew ? C.accentBg : "transparent",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: e.isNew ? 700 : 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {e.sender}
                  {e.urgent && <span style={{ marginLeft: 6, fontSize: 9, color: C.red, fontWeight: 700 }}>URGENT</span>}
                  {e.isNew && <span style={{ marginLeft: 6, fontSize: 9, color: C.accent, fontWeight: 700 }}>NOUVEAU</span>}
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>{e.subject}</div>
              </div>
              <div style={{ fontSize: 10, color: C.light }}>{e.date}</div>
            </motion.div>
          ))}
        </div>

        {/* Right: files */}
        <div style={{ width: 260, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", fontSize: 10, color: C.light, textTransform: "uppercase", letterSpacing: 1, borderBottom: `1px solid ${C.border}` }}>
            Pièces jointes (5)
          </div>
          {[
            { name: "Convocation_JAF.pdf", type: "PDF", size: "156 Ko", isNew: true },
            { name: "Conclusions_v2.docx", type: "DOC", size: "89 Ko", isNew: false },
            { name: "Jugement_2026-1847.pdf", type: "PDF", size: "312 Ko", isNew: false },
            { name: "Attestation_école.pdf", type: "PDF", size: "67 Ko", isNew: false },
            { name: "Contrat_travail.pdf", type: "PDF", size: "245 Ko", isNew: false },
          ].map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: t > 2 + i * 0.5 ? 1 : 0, y: t > 2 + i * 0.5 ? 0 : 8 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px", borderBottom: `1px solid ${C.border}`,
                background: f.isNew && t > 4 ? "#ECFDF5" : "transparent",
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: f.type === "PDF" ? "#EF444412" : "#2563EB12",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8, fontWeight: 700,
                color: f.type === "PDF" ? C.red : C.accent,
              }}>
                {f.type}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                <div style={{ fontSize: 9, color: C.light }}>{f.size}{f.isNew && <span style={{ marginLeft: 4, color: C.green, fontWeight: 600 }}>Résumée ✓</span>}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── SCENE 3: BRIEFING + GENERATE DRAFT ───

function SceneBrouillon({ t }: { t: number }) {
  const clickGenerate = t > 3
  const draftReady = t > 5

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Bonjour Me Fernandez,</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>1 nouveau mail classé, 1 brouillon à générer.</div>
      </div>

      {/* Task card with generate button */}
      <div style={{ padding: "16px 24px" }}>
        <div style={{ fontSize: 10, color: C.light, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>TO-DO</div>

        <div style={{
          padding: "16px", borderRadius: 12,
          border: `1px solid ${draftReady ? "#A7F3D0" : C.border}`,
          background: draftReady ? "#ECFDF5" : C.bg,
          transition: "all 0.4s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Tribunal de Paris — Convocation JAF</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Dossier Dupont c/ Dupont · Audience 15 avril</div>
            </div>
            <span style={{ fontSize: 9, color: C.red, fontWeight: 600, background: "#FEF2F2", padding: "2px 8px", borderRadius: 6 }}>Urgent</span>
          </div>

          {/* Generate button */}
          <motion.button
            animate={{
              background: draftReady ? C.green : clickGenerate ? "#1D4ED8" : C.accent,
              scale: clickGenerate && !draftReady ? [1, 0.95, 1] : 1,
            }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8,
              border: "none", color: "#fff", fontSize: 12, fontWeight: 600,
              cursor: "default",
            }}
          >
            {draftReady ? "✓ Brouillon prêt" : clickGenerate ? "Génération..." : "Générer le brouillon"}
          </motion.button>
        </div>

        {/* Draft preview appears */}
        <AnimatePresence>
          {draftReady && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.5 }}
              style={{
                marginTop: 12, padding: "14px 16px", borderRadius: 10,
                border: `1px solid ${C.border}`, background: C.card,
                overflow: "hidden",
              }}
            >
              <div style={{ fontSize: 10, color: C.accent, fontWeight: 600, marginBottom: 6 }}>✎ Brouillon généré</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7, fontFamily: "ui-serif, Georgia, serif" }}>
                Madame la Présidente,
                <br /><br />
                J'accuse réception de la convocation à l'audience du 15 avril 2026. Je confirme la présence de ma cliente, Mme Dupont...
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.accent}20`, background: C.accentBg, cursor: "default" }}>
                  Relire
                </div>
                <div style={{ fontSize: 11, color: "#fff", fontWeight: 600, padding: "4px 12px", borderRadius: 6, background: C.green, cursor: "default" }}>
                  Envoyer
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
