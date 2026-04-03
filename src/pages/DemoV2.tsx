import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { Settings, LayoutDashboard, Paperclip, Eye, Edit3, Send, ChevronRight, Mail, ArrowUp, MessageCircle, X, Menu } from "lucide-react"
import ReactMarkdown from "react-markdown"

// ─── Palette ───
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

// ─── Hook ───
function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < bp : false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
    setMobile(mq.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [bp])
  return mobile
}

// ─── Demo data ───
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
    desc: "M. Benzara, gérant de la SCI Les Tilleuls, signale que le locataire commercial (restaurant Le Soleil d'Or) n'a pas payé les loyers des mois de janvier, février et mars 2026, soit 3 × 4 200 €.",
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

// ─── Chat ───
interface ChatMessage {
  role: "user" | "assistant"
  content: string
  ts: number
}

const WELCOME: ChatMessage = {
  role: "assistant",
  content: `Alexandra, c'est Donna 👋\n\nJ'ai fait le tour de tes dossiers ce matin. Deux points qui méritent ton attention :\n\n⚡ **Audience JAF le 15 avril** — les conclusions adverses sont arrivées, j'ai préparé ta fiche. Il reste 12 jours.\n\n⚡ **SCI Tilleuls** — 3 mois d'impayés (12 600 €). La mise en demeure est prête, chaque jour de retard fragilise ta position.\n\nJe connais tes dossiers, tes échéances et tes pièces. Demande-moi ce que tu veux — même un truc que tu demanderais normalement à ton stagiaire.`,
  ts: Date.now(),
}

const SUGGESTIONS = [
  "Prépare-moi pour l'audience JAF",
  "Montre-moi la situation Tilleuls",
  "Qu'est-ce que je risque d'oublier ?",
  "Calcule les loyers impayés",
  "Rédige la relance Greffe Nanterre",
]

function getDemoResponse(q: string): string {
  const s = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  if (s.includes("audience") || s.includes("jaf") || s.includes("15 avril") || s.includes("prepare")) {
    return `**Fiche de préparation — Audience JAF du 15 avril 2026**\n\n📍 **Lieu :** Tribunal de Grande Instance de Paris — Salle 12 — 14h00\n\n**Objet :** Mesures provisoires\n- Résidence des enfants (demande de résidence principale côté client)\n- Pension alimentaire (proposition adverse : 450€/mois)\n\n**Chronologie clé :**\n- 12 mars : dépôt de la requête initiale\n- 28 mars : conclusions adverses reçues (Me Benzara)\n- 3 avril (aujourd'hui) : convocation audience JAF reçue\n\n**Points de friction :**\n1. L'adversaire conteste la résidence principale — argument sur la stabilité scolaire\n2. Montant pension : votre client estime pouvoir payer 350€ max\n\n**Pièces à emporter :**\n- Ordonnance JAF provisoire (reçue ce matin)\n- Relevés de compte client (3 derniers mois)\n- Attestations d'hébergement\n\n**À soulever à l'audience :** Priorité à la continuité scolaire des enfants au domicile actuel du client.\n\n✅ Brouillon de conclusions prêt dans votre dossier.`
  }

  if (s.includes("tilleul") || s.includes("loyer") || s.includes("benzara") || s.includes("sci") || s.includes("calcul") || s.includes("montant")) {
    return `**Dossier SCI Les Tilleuls — Loyers impayés**\n\n**Situation :** Le restaurant Le Soleil d'Or (locataire commercial) n'a pas payé depuis janvier 2026.\n\n**Calcul des impayés :**\n| Mois | Montant |\n|------|--------|\n| Janvier 2026 | 4 200 € |\n| Février 2026 | 4 200 € |\n| Mars 2026 | 4 200 € |\n| **Total** | **12 600 €** |\n\n**Actions disponibles :**\n1. Mise en demeure par LRAR (modèle prêt dans le dossier)\n2. Commandement de payer (à délivrer par huissier si pas de réponse sous 8 jours)\n3. Assignation en référé pour résiliation bail\n\n**Délai légal :** Commandement de payer à délivrer dans les meilleurs délais — chaque mois de retard fragilise la procédure.\n\n📎 Bail commercial SCI_Les_Tilleuls.pdf disponible dans le dossier.\n\n✉️ Souhaitez-vous que je rédige la mise en demeure ?`
  }

  if (s.includes("oubli") || s.includes("manque") || s.includes("verifie") || s.includes("filet") || s.includes("rien rater") || s.includes("passe entre")) {
    return `**Revue de vos dossiers actifs — Alertes**\n\n⚠️ **3 points d'attention détectés :**\n\n1. **SCI Les Tilleuls** — Mise en demeure non encore envoyée. Chaque jour de délai fragilise la procédure. → Brouillon prêt, à valider.\n\n2. **Succession Martin** — Les pièces complémentaires reçues du Cabinet Moreau n'ont pas encore été classées officiellement au dossier. → Pensez à l'accuser de réception.\n\n3. **Greffe TGI Nanterre** — Notification de jugement reçue ce matin. Vous n'avez pas encore téléchargé le document officiel. Délai d'appel de 30 jours court à partir de la notification.\n\n✅ **Aucun délai de prescription imminent** sur les autres dossiers.\n\n💡 Voulez-vous que je vous prépare un récapitulatif des délais sur tous les dossiers actifs ?`
  }

  if (s.includes("relance") || s.includes("greffe") || s.includes("nanterre") || s.includes("redige") || s.includes("brouillon")) {
    return `**Brouillon — Accusé de réception Greffe TGI Nanterre**\n\n---\n\nMadame, Monsieur,\n\nJ'ai l'honneur d'accuser réception de la notification de jugement n°2026/1847, reçue ce jour par voie électronique.\n\nJe vous confirme en prendre bonne note et reviendrai vers vous dans les meilleurs délais concernant les suites éventuelles.\n\nVeuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\n*Me Alexandra Fernandez*\n*Avocate au Barreau de Paris*\n\n---\n\n✏️ Souhaitez-vous que j'ajuste le ton ou le contenu avant envoi ?`
  }

  if (s.includes("succession") || (s.includes("martin") && !s.includes("jean"))) {
    return `**Dossier Succession Martin**\n\nLe Cabinet Moreau a transmis aujourd'hui les pièces complémentaires :\n\n📄 **Pièces reçues :**\n- Acte de naissance du défunt\n- Certificat de décès\n- Inventaire notarial préliminaire\n\n**Prochaine étape :** Analyser l'inventaire et vérifier la cohérence avec les déclarations des héritiers.\n\n⏳ **Délai :** Déclaration de succession à déposer dans les 6 mois du décès.\n\nAccusez-vous réception des pièces au Cabinet Moreau ?`
  }

  if (s.includes("dossier") || s.includes("affaire") || s.includes("client")) {
    return `**Vos 5 dossiers actifs ce matin :**\n\n1. 🔴 **Dupont c/ Dupont** — Audience JAF le 15 avril (urgent)\n2. 🔴 **SCI Les Tilleuls** — Loyers impayés 12 600 € (urgent)\n3. 🟡 **Succession Martin** — Pièces reçues à classer\n4. 🟢 **Jean-Pierre Martin** — En attente retour client\n5. 🟢 **Alice Bernard** — Procédure en cours\n\nSur quel dossier voulez-vous que je me concentre ?`
  }

  if (s.includes("email") || s.includes("mail") || s.includes("briefing") || s.includes("matin") || s.includes("recu")) {
    return `**Briefing emails ce matin — 12 reçus**\n\n**3 urgents :**\n- 🔴 Greffe du JAF → Convocation audience 15 avril\n- 🔴 M. Benzara → Loyers impayés SCI Tilleuls\n- 🔴 Greffe TGI Nanterre → Notification jugement\n\n**2 à traiter :**\n- 🟡 Cabinet Moreau → Pièces succession Martin\n- 🟡 Me Karim Benzara → Conclusions SCI Tilleuls\n\n**9 filtrés** (newsletters, prospection, notifications automatiques)\n\n✅ **3 brouillons de réponse** prêts à valider dans votre to-do.`
  }

  return `Je peux vous aider sur vos dossiers et votre boîte mail. Essayez par exemple :\n\n- *"Prépare-moi pour l'audience JAF du 15 avril"*\n- *"Calcule les loyers impayés Tilleuls"*\n- *"Qu'est-ce que je risque d'oublier ?"*\n- *"Rédige la relance pour le greffe"*\n- *"Où en est le dossier Martin ?"*`
}

// ─── Sub-components ───
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
      <div style={{ padding: "14px 18px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: TEXT_MUTED }}>
            <span style={{ color: TEXT, fontWeight: 500 }}>{task.dossier}</span>{" · "}{task.tribunal}
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
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 18px 12px" }}>
              <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.65, marginBottom: 10 }}>{task.desc}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
      <div style={{ padding: "10px 18px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: expanded ? `1px solid ${BORDER}` : "none" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setExpanded(e => !e)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 6, border: `1px solid ${BORDER}`, background: BG, color: TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
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

// ─── Markdown components for chat ───
const mdComponents = {
  p: ({ children }: any) => <p style={{ margin: "0 0 6px", lineHeight: 1.65 }}>{children}</p>,
  strong: ({ children }: any) => <strong style={{ fontWeight: 600, color: TEXT }}>{children}</strong>,
  em: ({ children }: any) => <em style={{ color: TEXT_MUTED }}>{children}</em>,
  ul: ({ children }: any) => <ul style={{ margin: "4px 0", paddingLeft: 16 }}>{children}</ul>,
  ol: ({ children }: any) => <ol style={{ margin: "4px 0", paddingLeft: 16 }}>{children}</ol>,
  li: ({ children }: any) => <li style={{ marginBottom: 4, fontSize: 13 }}>{children}</li>,
  table: ({ children }: any) => <table style={{ borderCollapse: "collapse", width: "100%", margin: "8px 0", fontSize: 12 }}>{children}</table>,
  th: ({ children }: any) => <th style={{ padding: "4px 8px", border: `1px solid ${BORDER}`, background: "#F3F4F6", fontSize: 11, fontWeight: 600 }}>{children}</th>,
  td: ({ children }: any) => <td style={{ padding: "4px 8px", border: `1px solid ${BORDER}` }}>{children}</td>,
  hr: () => <hr style={{ border: "none", borderTop: `1px solid ${BORDER}`, margin: "8px 0" }} />,
  code: ({ children }: any) => <code style={{ background: "#F3F4F6", padding: "1px 4px", borderRadius: 3, fontSize: 12 }}>{children}</code>,
}

// ─── Chat Panel ───
function DonnaChatPanel({ isOpen, onToggle, isMobile }: { isOpen: boolean; onToggle: () => void; isMobile: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, loading, scrollToBottom])

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
  }, [isOpen])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setShowSuggestions(false)
    setMessages(prev => [...prev, { role: "user", content: trimmed, ts: Date.now() }])
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    setLoading(true)
    await new Promise(r => setTimeout(r, 900 + Math.random() * 800))
    const response = getDemoResponse(trimmed)
    setMessages(prev => [...prev, { role: "assistant", content: response, ts: Date.now() }])
    setLoading(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 120) + "px"
  }

  // ─── Collapsed state (desktop only) ───
  if (!isOpen && !isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{
          width: 56,
          flexShrink: 0,
          borderLeft: `1px solid ${BORDER}`,
          background: SIDEBAR_BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 16,
          gap: 12,
          cursor: "pointer",
          position: "relative",
        }}
        onClick={onToggle}
      >
        {/* Avatar */}
        <div style={{ position: "relative" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: "#111827",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 14, fontWeight: 700,
          }}>D</div>
          <div style={{
            position: "absolute", bottom: -1, right: -1,
            width: 10, height: 10, borderRadius: "50%", background: GREEN,
            border: `2px solid ${SIDEBAR_BG}`,
          }} />
        </div>

        {/* Vertical text teaser */}
        <div style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          fontSize: 11,
          color: TEXT_MUTED,
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}>
          Donna est là
        </div>

        {/* Pulsing dot to attract attention */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 8, height: 8, borderRadius: "50%", background: ACCENT,
            marginTop: 4,
          }}
        />

        {/* Tooltip on hover */}
        <div style={{
          position: "absolute", top: 12, right: 64,
          background: "#111827", color: "#fff",
          padding: "6px 10px", borderRadius: 6,
          fontSize: 11, whiteSpace: "nowrap",
          opacity: 0,
          transition: "opacity 0.2s",
          pointerEvents: "none",
        }}
          className="donna-collapsed-tooltip"
        >
          Parler avec Donna
        </div>
      </motion.div>
    )
  }

  // ─── Mobile floating bubble (when closed) ───
  if (!isOpen && isMobile) {
    return null // Handled by the parent's floating button
  }

  // ─── Full chat panel ───
  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed", inset: 0, zIndex: 100,
        background: BG, display: "flex", flexDirection: "column",
      }
    : {
        width: 380, flexShrink: 0, borderLeft: `1px solid ${BORDER}`,
        display: "flex", flexDirection: "column", background: BG, height: "100%",
      }

  return (
    <motion.div
      initial={isMobile ? { y: "100%" } : { width: 0, opacity: 0 }}
      animate={isMobile ? { y: 0 } : { width: 380, opacity: 1 }}
      exit={isMobile ? { y: "100%" } : { width: 0, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      style={panelStyle}
    >
      {/* Header */}
      <div style={{
        padding: isMobile ? "12px 16px" : "16px 20px",
        paddingTop: isMobile ? "max(12px, env(safe-area-inset-top))" : 16,
        borderBottom: `1px solid ${BORDER}`,
        display: "flex", alignItems: "center", gap: 10, background: BG, flexShrink: 0,
      }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>D</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em" }}>Donna</div>
          <div style={{ fontSize: 11, color: GREEN, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: GREEN, display: "inline-block" }} />
            En ligne · Mode démo
          </div>
        </div>
        <button
          onClick={onToggle}
          style={{
            width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`,
            background: BG, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: TEXT_MUTED, flexShrink: 0,
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", WebkitOverflowScrolling: "touch" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 16, display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, maxWidth: "92%" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>D</div>
                <div style={{ background: "#F9FAFB", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", fontSize: 13, color: TEXT, lineHeight: 1.65, border: `1px solid ${BORDER}` }}>
                  <ReactMarkdown components={mdComponents}>{msg.content}</ReactMarkdown>
                </div>
              </div>
            )}
            {msg.role === "user" && (
              <div style={{ background: ACCENT, borderRadius: "16px 16px 4px 16px", padding: "10px 14px", fontSize: 13, color: "#fff", lineHeight: 1.65, maxWidth: "85%", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>D</div>
            <div style={{ background: "#F9FAFB", borderRadius: "16px 16px 16px 4px", padding: "12px 16px", border: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} style={{ width: 6, height: 6, borderRadius: "50%", background: TEXT_MUTED }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {showSuggestions && messages.length === 1 && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{ textAlign: "left", padding: "8px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#FAFAFA", fontSize: 12, color: TEXT_MUTED, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", lineHeight: 1.4 }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = ACCENT_BG; (e.target as HTMLElement).style.borderColor = "#BFDBFE"; (e.target as HTMLElement).style.color = ACCENT }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = "#FAFAFA"; (e.target as HTMLElement).style.borderColor = BORDER; (e.target as HTMLElement).style.color = TEXT_MUTED }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 16px",
        paddingBottom: isMobile ? "max(16px, env(safe-area-inset-bottom))" : 16,
        borderTop: `1px solid ${BORDER}`, background: BG, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${BORDER}`, background: "#FAFAFA", transition: "border-color 0.2s" }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize() }}
            onKeyDown={handleKey}
            placeholder="Posez votre question à Donna..."
            rows={1}
            style={{ flex: 1, border: "none", background: "transparent", resize: "none", outline: "none", fontSize: 13, color: TEXT, lineHeight: 1.5, fontFamily: "inherit", minHeight: 20, maxHeight: 120 }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            style={{ width: 32, height: 32, borderRadius: "50%", background: input.trim() && !loading ? ACCENT : "#E5E7EB", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() && !loading ? "pointer" : "default", flexShrink: 0, transition: "background 0.2s" }}
          >
            <ArrowUp size={15} color={input.trim() && !loading ? "#fff" : TEXT_LIGHT} />
          </button>
        </div>
        <div style={{ fontSize: 10, color: TEXT_LIGHT, textAlign: "center", marginTop: 6 }}>
          Mode démo — données fictives à titre d'illustration
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main page ───
export default function DemoV2() {
  const isMobile = useIsMobile()
  const [chatOpen, setChatOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [donnaTyping, setDonnaTyping] = useState(true)
  const [showMessage, setShowMessage] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => { setDonnaTyping(false); setShowMessage(true) }, 2200)
    const t2 = setTimeout(() => setStatsVisible(true), 800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) setSidebarOpen(false)
  }, [isMobile])

  return (
    <div style={{ background: BG, color: TEXT, height: "100vh", fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Top bar — mobile only (hamburger + title) */}
      {isMobile && (
        <div style={{ height: 40, background: "#F3F4F6", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", padding: "0 16px", gap: 8, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
            <Menu size={18} color={TEXT_MUTED} />
          </button>
          <div style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 600, color: TEXT }}>Donna</div>
          <Link to="/v3" style={{ fontSize: 11, color: TEXT_LIGHT, textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
            Landing <ChevronRight size={10} />
          </Link>
        </div>
      )}

      {/* 3-column layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* Mobile sidebar overlay */}
        {isMobile && (
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 50 }}
                />
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  style={{
                    position: "fixed", top: 40, left: 0, bottom: 0, zIndex: 51,
                    width: 260, background: SIDEBAR_BG, borderRight: `1px solid ${SIDEBAR_BORDER}`,
                    display: "flex", flexDirection: "column", overflowY: "auto",
                  }}
                >
                  <SidebarContent />
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        )}

        {/* Desktop sidebar */}
        {!isMobile && (
          <aside style={{ width: 220, background: SIDEBAR_BG, borderRight: `1px solid ${SIDEBAR_BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
            <SidebarContent />
          </aside>
        )}

        {/* Main content */}
        <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? "20px 16px" : "32px 32px" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 24 : 30, fontWeight: 400, color: TEXT, marginBottom: 4, letterSpacing: "-0.02em" }}>Bonjour, Alexandra</h1>
            <p style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 24 }}>Je suis Donna, votre employée numérique · Jeudi 3 avril</p>
          </motion.div>

          <AnimatePresence>
            {statsVisible && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? "14px 16px" : "18px 22px", marginBottom: 16, display: "flex", alignItems: "center", gap: isMobile ? 12 : 20, flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: isMobile ? 26 : 32, fontWeight: 700, color: TEXT, lineHeight: 1 }}>0</div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>/3</div>
                </div>
                <div style={{ width: 1, height: 36, background: BORDER }} />
                <div style={{ display: "flex", gap: isMobile ? 10 : 16, flex: 1, flexWrap: "wrap" }}>
                  {[{ icon: Mail, value: "12 reçus" }, { icon: LayoutDashboard, value: "6 dossiers" }, { icon: Settings, value: "9 filtrés" }].map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: TEXT_MUTED }}>
                      <s.icon size={13} /> {s.value}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? "14px 16px" : "18px 22px", marginBottom: 24 }}>
            {donnaTyping ? (
              <div style={{ display: "flex", gap: 5, alignItems: "center", height: 20 }}>
                <span style={{ fontSize: 12, color: TEXT_MUTED, marginRight: 4 }}>Donna analyse...</span>
                {[0, 1, 2].map(i => <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} style={{ width: 5, height: 5, borderRadius: "50%", background: TEXT_MUTED }} />)}
              </div>
            ) : (
              <AnimatePresence>
                {showMessage && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                    <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.7, marginBottom: 6 }}>
                      Bonjour Alexandra, c'est Donna. J'ai trié vos <strong>12 emails</strong> ce matin — 9 étaient du bruit (newsletters, prospection), je m'en suis occupée. Il vous reste <strong>3 brouillons de réponse</strong> à valider, tout est prêt.
                    </p>
                    <p style={{ fontSize: 12, color: TEXT_MUTED, fontStyle: "italic" }}>Votre to-do du jour est juste en dessous.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.08em", textTransform: "uppercase" }}>TO-DO LIST</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: URGENT }}>{TASKS.filter(t => t.urgent).length}</span>
          </div>

          {TASKS.map((task, i) => <TaskCard key={task.id} task={task} delay={0.6 + i * 0.15} />)}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.6 }} style={{ marginTop: 24, padding: isMobile ? "16px" : "18px 22px", borderRadius: 12, background: ACCENT_BG, border: `1px solid rgba(37,99,235,0.15)`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: isMobile ? 80 : 0 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: ACCENT, marginBottom: 4 }}>Vous aimez ce que vous voyez ?</div>
              <div style={{ fontSize: 13, color: TEXT_MUTED }}>Connectez votre vraie boîte mail — 14 jours gratuits, sans engagement.</div>
            </div>
            <Link to="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, background: ACCENT, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
              Commencer gratuitement <Send size={13} />
            </Link>
          </motion.div>
        </main>

        {/* Chat panel (desktop: collapsible strip / expanded panel) */}
        <AnimatePresence mode="wait">
          <DonnaChatPanel key={chatOpen ? "open" : "closed"} isOpen={chatOpen} onToggle={() => setChatOpen(o => !o)} isMobile={isMobile} />
        </AnimatePresence>

        {/* Mobile floating bubble */}
        {isMobile && !chatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setChatOpen(true)}
            style={{
              position: "fixed",
              bottom: 20, right: 20, zIndex: 40,
              width: 56, height: 56, borderRadius: "50%",
              background: ACCENT, border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(37,99,235,0.35)",
            }}
          >
            <MessageCircle size={24} color="#fff" />
            {/* Notification dot */}
            <div style={{
              position: "absolute", top: -2, right: -2,
              width: 16, height: 16, borderRadius: "50%",
              background: "#EF4444", border: "2px solid #fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 700, color: "#fff",
            }}>1</div>
          </motion.button>
        )}
      </div>

      {/* Hover tooltip CSS */}
      <style>{`
        .donna-collapsed-tooltip { pointer-events: none !important; }
        div:hover > .donna-collapsed-tooltip { opacity: 1 !important; }
      `}</style>
    </div>
  )
}

// ─── Sidebar content (shared desktop/mobile) ───
function SidebarContent() {
  return (
    <>
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
      <div style={{ padding: "8px 16px", flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_LIGHT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Dossiers</div>
        {DOSSIERS.map((d, i) => (
          <motion.div key={d.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", marginBottom: 2, cursor: "pointer" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: d.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{d.initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
              <div style={{ fontSize: 10, color: TEXT_MUTED }}>{d.type}</div>
            </div>
          </motion.div>
        ))}
      </div>
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
        <div style={{ fontSize: 12, color: ACCENT, fontWeight: 500, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
          <Mail size={12} /> Connecter Gmail pour de vrais dossiers
        </div>
        <Link to="/login" style={{ fontSize: 12, color: TEXT_MUTED, textDecoration: "none" }}>← Déconnexion</Link>
      </div>
    </>
  )
}
