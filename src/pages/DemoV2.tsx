import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { Settings, LayoutDashboard, Paperclip, Eye, Edit3, Send, ChevronRight, Mail } from "lucide-react"

// ─── Same palette as the real dashboard ───
const BG = "#FFFFFF"
const SIDEBAR_BG = "#F9FAFB"
const SIDEBAR_BORDER = "#E5E7EB"
const TEXT = "#111827"
const TEXT_MUTED = "#6B7280"
const TEXT_LIGHT = "#9CA3AF"
const ACCENT = "#2563EB"
const ACCENT_BG = "#EFF6FF"
const URGENT = "#EF4444"
const URGENT_BG = "#FEF2F2"
const GREEN = "#10B981"
const BORDER = "#E5E7EB"

const DOSSIERS = [
  { initials: "JM", name: "Jean-Pierre Martin", type: "Droit du travail", color: "#2563EB" },
  { initials: "MD", name: "Marie Dupont", type: "Litige commercial", color: "#7C3AED" },
  { initials: "CD", name: "Claire Dubois", type: "Litige immobilier", color: "#059669" },
  { initials: "FR", name: "Famille Roux", type: "Immobilier", color: "#D97706" },
  { initials: "AB", name: "Alice Bernard", type: "Droit de la famille", color: "#DC2626" },
]

const TASKS = [
  {
    id: 1,
    dossier: "Dupont c/ Dupont",
    tribunal: "Tribunal de Grande Instance de Paris",
    date: "Aujourd'hui, 15h06",
    title: "Convocation audience JAF — Dupont c/ Dupont — 15 avril 2026",
    urgent: true,
    desc: "Le greffe du JAF convoque les parties à une audience le 15 avril 2026 à 14h00, salle 12. L'objet porte sur les mesures provisoires (résidence des enfants, pension alimentaire).",
    tags: ["convocation_jaf_15avril...", "ordonnance_jaf_provisoir..."],
    status: "sent",
  },
  {
    id: 2,
    dossier: "SCI Les Tilleuls",
    tribunal: "M. Karim Benzara",
    date: "Aujourd'hui, 12h06",
    title: "Loyers impayés — situation critique — besoin d'action urgente",
    urgent: true,
    desc: "M. Benzara, gérant de la SCI Les Tilleuls, signale que le locataire commercial (restaurant Le Soleil d'Or) n'a pas payé les loyers des mois de janvier, février et mars 2026, soit 3 × 4 200 €...",
    tags: ["bail_commercial_sci...", "mise_en_demeure_model..."],
    status: "draft",
  },
  {
    id: 3,
    dossier: "Succession Martin",
    tribunal: "Cabinet Moreau",
    date: "Hier, 16h22",
    title: "Pièces complémentaires — dossier succession Martin",
    urgent: false,
    desc: "Le cabinet Moreau transmet les pièces complémentaires demandées pour le dossier de succession Martin : acte de naissance, certificat de décès, inventaire notarial.",
    tags: ["pieces_succession_martin...", "inventaire_notarial..."],
    status: "pending",
  },
]

const DONNA_MESSAGE = "Alexandra, j'ai trié vos 12 emails ce matin. 9 étaient du bruit (newsletters, prospection) — je les ai filtrés pour vous. 3 brouillons de réponse sont prêts, il ne vous reste qu'à valider."

type TaskStatus = "sent" | "draft" | "pending"

function StatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { label: string; bg: string; color: string }> = {
    sent: { label: "Mail envoyé", bg: "#F0FDF4", color: "#16A34A" },
    draft: { label: "Brouillon prêt", bg: ACCENT_BG, color: ACCENT },
    pending: { label: "À traiter", bg: "#FEF9EC", color: "#B45309" },
  }
  const s = map[status]
  return (
    <span style={{ padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>
      {s.label}
    </span>
  )
}

function TaskCard({ task, delay }: { task: typeof TASKS[0]; delay: number }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ border: `1px solid ${BORDER}`, borderRadius: 10, marginBottom: 12, overflow: "hidden", background: BG }}
    >
      {/* Header */}
      <div style={{ padding: "14px 18px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: TEXT_MUTED }}>
            <span style={{ color: TEXT, fontWeight: 500 }}>{task.dossier}</span>
            {" · "}
            {task.tribunal}
          </div>
          <span style={{ fontSize: 11, color: TEXT_LIGHT, flexShrink: 0, marginLeft: 12 }}>{task.date}</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
          {task.urgent && <span style={{ width: 6, height: 6, borderRadius: "50%", background: URGENT, flexShrink: 0, marginTop: 6 }} />}
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, lineHeight: 1.4 }}>{task.title}</div>
        </div>
        {task.urgent && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: URGENT_BG, color: URGENT, fontSize: 11, fontWeight: 600, marginBottom: 8 }}>
            ⚡ Urgent
          </span>
        )}
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 18px 12px" }}>
              <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.65, marginBottom: 10 }}>{task.desc}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                {task.tags.map(tag => (
                  <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: "#F9FAFB", border: `1px solid ${BORDER}`, fontSize: 11, color: TEXT_MUTED }}>
                    <Paperclip size={10} /> {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div style={{ padding: "10px 18px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: expanded ? `1px solid ${BORDER}` : "none" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 6, border: `1px solid ${BORDER}`, background: BG, color: TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
          >
            <Eye size={13} /> {expanded ? "Réduire" : "Voir"}
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 6, border: `1px solid ${BORDER}`, background: BG, color: TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
            <Edit3 size={13} /> Brouillon
          </button>
        </div>
        <StatusBadge status={task.status as TaskStatus} />
      </div>
    </motion.div>
  )
}

export default function DemoV2() {
  const [activeTask] = useState<null>(null)
  const [donnaTyping, setDonnaTyping] = useState(true)
  const [showMessage, setShowMessage] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => { setDonnaTyping(false); setShowMessage(true) }, 2200)
    const t2 = setTimeout(() => setStatsVisible(true), 800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* ─── Top bar ─── */}
      <div style={{ height: 40, background: "#F3F4F6", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", padding: "0 16px", gap: 8 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#FF5F57", "#FFBD2E", "#27C93F"].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, maxWidth: 320, margin: "0 auto", background: "#FFFFFF", borderRadius: 4, padding: "3px 12px", fontSize: 11, color: TEXT_LIGHT, fontFamily: "ui-monospace, monospace", border: `1px solid ${BORDER}` }}>
          donna-legal.com/dashboard
        </div>
        <Link to="/v3" style={{ fontSize: 11, color: TEXT_LIGHT, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          Voir la landing <ChevronRight size={10} />
        </Link>
      </div>

      {/* ─── Dashboard layout ─── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ─── Sidebar ─── */}
        <aside style={{ width: 220, background: SIDEBAR_BG, borderRight: `1px solid ${SIDEBAR_BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>

          {/* Logo + badge */}
          <div style={{ padding: "20px 16px 12px", borderBottom: `1px solid ${SIDEBAR_BORDER}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: TEXT }}>Donna</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: ACCENT_BG, color: ACCENT, letterSpacing: "0.05em" }}>DÉMO</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
              <span style={{ fontSize: 11, color: TEXT_MUTED }}>À jour · Dernière analyse il y a 2 min</span>
            </div>
          </div>

          {/* Nav */}
          <div style={{ padding: "12px 8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", borderRadius: 6, background: "#F3F4F6", marginBottom: 2 }}>
              <LayoutDashboard size={15} style={{ color: TEXT }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Briefing</div>
                <div style={{ fontSize: 10, color: TEXT_MUTED }}>Votre journée en un coup d'œil</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", borderRadius: 6, marginBottom: 2 }}>
              <Settings size={15} style={{ color: TEXT_MUTED }} />
              <div>
                <div style={{ fontSize: 13, color: TEXT_MUTED }}>Configurez-moi</div>
                <div style={{ fontSize: 10, color: TEXT_LIGHT }}>Personnalisez votre assistante</div>
              </div>
            </div>
          </div>

          {/* Dossiers */}
          <div style={{ padding: "8px 16px", flex: 1, overflowY: "auto" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_LIGHT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Dossiers</div>
            {DOSSIERS.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", marginBottom: 2, cursor: "pointer" }}
              >
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: d.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {d.initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: TEXT_MUTED }}>{d.type}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom */}
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
            <div style={{ fontSize: 12, color: ACCENT, fontWeight: 500, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
              <Mail size={12} /> Connecter Gmail pour de vrais dossiers
            </div>
            <Link to="/login" style={{ fontSize: 12, color: TEXT_MUTED, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              ← Déconnexion
            </Link>
          </div>
        </aside>

        {/* ─── Main content ─── */}
        <main style={{ flex: 1, overflowY: "auto", padding: "32px 40px", maxWidth: 840 }}>

          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 400, color: TEXT, marginBottom: 4, letterSpacing: "-0.02em" }}>
              Bonjour, Alexandra
            </h1>
            <p style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 24 }}>Jeudi 3 avril</p>
          </motion.div>

          {/* Stats card */}
          <AnimatePresence>
            {statsVisible && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", marginBottom: 16, display: "flex", alignItems: "center", gap: 24 }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: TEXT, lineHeight: 1 }}>0</div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>/3</div>
                </div>
                <div style={{ width: 1, height: 40, background: BORDER }} />
                <div style={{ display: "flex", gap: 20, flex: 1 }}>
                  {[
                    { icon: Mail, value: "12 reçus" },
                    { icon: LayoutDashboard, value: "6 dossiers" },
                    { icon: Settings, value: "9 filtrés" },
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: TEXT_MUTED }}>
                      <s.icon size={14} /> {s.value}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Donna message */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 22px", marginBottom: 24 }}
          >
            {donnaTyping ? (
              <div style={{ display: "flex", gap: 5, alignItems: "center", height: 20 }}>
                <span style={{ fontSize: 12, color: TEXT_MUTED, marginRight: 4 }}>Donna analyse...</span>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} style={{ width: 5, height: 5, borderRadius: "50%", background: TEXT_MUTED }} />
                ))}
              </div>
            ) : (
              <AnimatePresence>
                {showMessage && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                    <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.7, marginBottom: 6 }}>
                      {DONNA_MESSAGE.split("12 emails").map((part, i) =>
                        i === 0 ? <span key={i}>{part}<strong>12 emails</strong></span> : <span key={i}>{part.split("3 brouillons de réponse").map((p2, j) =>
                          j === 0 ? <span key={j}>{p2}<strong>3 brouillons de réponse</strong></span> : <span key={j}>{p2}</span>
                        )}</span>
                      )}
                    </p>
                    <p style={{ fontSize: 12, color: TEXT_MUTED, fontStyle: "italic" }}>Tout est listé dans la to-do ci-dessous.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>

          {/* TO-DO LIST */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.08em", textTransform: "uppercase" }}>TO-DO LIST</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: URGENT }}>{TASKS.filter(t => t.urgent).length}</span>
          </div>

          {TASKS.map((task, i) => (
            <TaskCard key={task.id} task={task} delay={0.6 + i * 0.15} />
          ))}

          {/* CTA to real demo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            style={{ marginTop: 32, padding: "20px 24px", borderRadius: 12, background: ACCENT_BG, border: `1px solid rgba(37,99,235,0.15)`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: ACCENT, marginBottom: 4 }}>Vous aimez ce que vous voyez ?</div>
              <div style={{ fontSize: 13, color: TEXT_MUTED }}>Connectez votre vraie boîte mail — 14 jours gratuits, sans engagement.</div>
            </div>
            <Link to="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, background: ACCENT, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
              Commencer gratuitement <Send size={13} />
            </Link>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
