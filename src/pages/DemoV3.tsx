import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import {
  Settings, LayoutDashboard, Paperclip, Eye, Edit3, Send, ChevronRight, Mail,
  ArrowUp, X, Menu, ArrowLeft, Copy, Check, FileText, Download,
  Calendar, CheckCircle2, Clock, ThumbsUp, Pencil, XCircle,
  SkipForward, ChevronDown, Zap
} from "lucide-react"
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

// ─── Dates dynamiques ───
function getToday() {
  const now = new Date()
  const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]
  const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
  return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
}

function getTodayShort() {
  const now = new Date()
  const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
  return `${now.getDate()} ${months[now.getMonth()]}`
}

function getDaysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  const months = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
  return `${d.getDate()} ${months[d.getMonth()]}`
}

// ─── Hook mobile ───
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

// ═══════════════════════════════════════════════════════
// ─── DEMO DATA ───
// ═══════════════════════════════════════════════════════

const DOSSIERS = [
  { id: "d1", initials: "JM", name: "Jean-Pierre Martin", type: "Droit du travail", color: "#2563EB",
    summary: "Litige prud'homal en cours. M. Martin conteste son licenciement pour faute grave. Audience de conciliation prévue le 22 avril 2026. Enjeu principal : indemnités de licenciement (18 mois d'ancienneté) + dommages-intérêts pour licenciement sans cause réelle et sérieuse.",
    status: "actif" as const, domain: "Travail",
    emails: [
      { id: "e10", sender: "Jean-Pierre Martin", subject: "Documents demandés pour le dossier", date: getDaysAgo(2), resume: "M. Martin transmet ses 3 derniers bulletins de salaire et son contrat de travail comme demandé." },
      { id: "e11", sender: "Me Laurent (adverse)", subject: "Conclusions en défense", date: getDaysAgo(5), resume: "L'employeur maintient la qualification de faute grave. Argument : absences répétées non justifiées." },
      { id: "e12", sender: "Greffe CPH Paris", subject: "Convocation bureau de conciliation", date: getDaysAgo(8), resume: "Convocation pour le 22 avril à 9h30. Bureau de conciliation, section industrie." },
    ],
    documents: [
      { id: "doc1", name: "Contrat_travail_Martin.pdf", type: "PDF", size: "245 Ko", date: getDaysAgo(2), resume: "CDI signé, poste de responsable logistique, salaire brut 3 200€/mois." },
      { id: "doc2", name: "Lettre_licenciement.pdf", type: "PDF", size: "128 Ko", date: getDaysAgo(18), resume: "Licenciement pour faute grave notifié. Motifs invoqués : absences injustifiées." },
    ],
    deadlines: [
      { date: "22 avril 2026", label: "Audience bureau de conciliation", urgent: true },
      { date: "15 avril 2026", label: "Date limite dépôt conclusions", urgent: true },
    ],
  },
  { id: "d2", initials: "MD", name: "Marie Dupont", type: "Litige commercial", color: "#7C3AED",
    summary: "Contentieux commercial avec la société TechnoPlus SARL. Factures impayées pour un montant de 34 200€. Mise en demeure envoyée. Prochaine étape : assignation en référé-provision.",
    status: "actif" as const, domain: "Commercial",
    emails: [
      { id: "e20", sender: "Marie Dupont", subject: "Re: Point sur le contentieux TechnoPlus", date: getDaysAgo(1), resume: "Mme Dupont confirme qu'aucun règlement n'est intervenu. Elle souhaite accélérer la procédure." },
      { id: "e21", sender: "Me Garnier (TechnoPlus)", subject: "Demande de délai de paiement", date: getDaysAgo(3), resume: "L'avocat de TechnoPlus propose un échelonnement sur 6 mois." },
    ],
    documents: [
      { id: "doc4", name: "Factures_impayees_recap.pdf", type: "PDF", size: "89 Ko", date: getDaysAgo(13), resume: "3 factures impayées : total 34 200€ TTC." },
    ],
    deadlines: [
      { date: "10 avril 2026", label: "Assignation en référé-provision", urgent: true },
    ],
  },
  { id: "d3", initials: "CD", name: "Claire Dubois", type: "Litige immobilier", color: "#059669",
    summary: "Trouble de voisinage — Mme Dubois se plaint de nuisances sonores répétées. Constat d'huissier effectué. Médiation en cours avec le syndic.",
    status: "actif" as const, domain: "Immobilier",
    emails: [
      { id: "e30", sender: "Claire Dubois", subject: "Nouveaux travaux ce week-end", date: getDaysAgo(1), resume: "Mme Dubois signale que le voisin a repris les travaux malgré la médiation." },
      { id: "e31", sender: "Syndic Foncia Neuilly", subject: "Re: Demande intervention travaux non autorisés", date: getDaysAgo(2), resume: "Le syndic confirme l'absence d'autorisation. Mise en demeure envoyée." },
    ],
    documents: [
      { id: "doc5", name: "Constat_huissier.pdf", type: "PDF", size: "2.4 Mo", date: getDaysAgo(5), resume: "Bruit mesuré à 72 dB. Travaux sans autorisation constatés." },
    ],
    deadlines: [
      { date: "15 avril 2026", label: "Médiation avec le syndic", urgent: false },
    ],
  },
  { id: "d4", initials: "FR", name: "Famille Roux", type: "Immobilier", color: "#D97706",
    summary: "Acquisition immobilière — compromis signé. Conditions suspensives : prêt bancaire + diagnostics. Acte authentique prévu.",
    status: "en_attente" as const, domain: "Immobilier",
    emails: [
      { id: "e40", sender: "Famille Roux", subject: "Re: Offre de prêt reçue de la BNP", date: getDaysAgo(1), resume: "Les Roux ont reçu l'offre de prêt BNP : 388 000€ sur 25 ans à 3,2%." },
    ],
    documents: [
      { id: "doc6", name: "Compromis_vente.pdf", type: "PDF", size: "2.8 Mo", date: getDaysAgo(23), resume: "Compromis signé. Prix : 485 000€." },
    ],
    deadlines: [
      { date: "15 mai 2026", label: "Signature acte authentique", urgent: true },
    ],
  },
  { id: "d5", initials: "AB", name: "Alice Bernard", type: "Droit de la famille", color: "#DC2626",
    summary: "Procédure de divorce par consentement mutuel. Convention en cours de rédaction. Points restants : partage bien commun + garde alternée.",
    status: "actif" as const, domain: "Famille",
    emails: [
      { id: "e50", sender: "Alice Bernard", subject: "Re: Convention — OK pour la garde alternée", date: getDaysAgo(1), resume: "Mme Bernard accepte la garde alternée une semaine sur deux." },
    ],
    documents: [
      { id: "doc7", name: "Projet_convention_divorce.docx", type: "DOCX", size: "89 Ko", date: getDaysAgo(1), resume: "Projet de convention. Garde alternée, pension 700€/mois." },
    ],
    deadlines: [
      { date: "25 avril 2026", label: "Signature convention de divorce", urgent: true },
    ],
  },
  { id: "d6", initials: "SM", name: "Succession Martin", type: "Droit successoral", color: "#0891B2",
    summary: "Succession de M. Robert Martin. Actif successoral estimé à 780 000€. Deux héritiers en parts égales. Déclaration de succession à déposer.",
    status: "actif" as const, domain: "Succession",
    emails: [
      { id: "e60", sender: "Cabinet Moreau", subject: "Pièces complémentaires succession Martin", date: getDaysAgo(2), resume: "Transmission de l'inventaire notarial préliminaire." },
    ],
    documents: [
      { id: "doc8", name: "Inventaire_notarial.pdf", type: "PDF", size: "1.2 Mo", date: getDaysAgo(2), resume: "Actif successoral estimé : 780 000€." },
    ],
    deadlines: [
      { date: "2 août 2026", label: "Déclaration de succession (6 mois)", urgent: false },
    ],
  },
]

const TASKS = [
  {
    id: 1,
    dossier: "Dupont c/ Dupont",
    dossier_id: "d-dupont",
    tribunal: "Tribunal de Grande Instance de Paris",
    date: `Aujourd'hui, 15h06`,
    title: "Convocation audience JAF — Dupont c/ Dupont — 15 avril 2026",
    urgent: true,
    desc: "Le greffe du JAF convoque les parties à une audience le 15 avril 2026 à 14h00, salle 12. L'objet porte sur les mesures provisoires (résidence des enfants, pension alimentaire).",
    tags: [
      { name: "convocation_jaf_15avril.pdf", type: "PDF", size: "156 Ko", resume: "Convocation officielle du greffe du JAF de Paris. Audience fixée au 15 avril 2026 à 14h00, salle 12." },
      { name: "ordonnance_jaf_provisoir.pdf", type: "PDF", size: "203 Ko", resume: "Ordonnance de non-conciliation. Pension alimentaire provisoire : 400€/mois." },
    ],
    status: "sent" as const,
    email_from: "Greffe du JAF <greffe.jaf@tgi-paris.justice.fr>",
    email_to: "Me Alexandra Fernandez <a.fernandez@cabinet-fernandez.fr>",
    email_cc: "Me Karim Benzara <k.benzara@avocats-paris.fr>",
    email_date: `${getTodayShort()}, 15:06`,
    resume: "Le greffe du Juge aux Affaires Familiales de Paris vous convoque à une audience le 15 avril 2026 à 14h00.",
    corps_original: "Madame le Conseil,\n\nNous avons l'honneur de vous informer que l'audience relative à l'affaire n°2026/01234 — Dupont c/ Dupont — a été fixée au 15 avril 2026 à 14h00, salle 12.\n\nVeuillez agréer, Madame le Conseil, l'expression de nos salutations distinguées.\n\nLe Greffier en Chef",
    draft: "Madame, Monsieur,\n\nJ'accuse réception de la convocation à l'audience du 15 avril 2026 à 14h00.\n\nJe vous confirme la présence de ma cliente, Mme Dupont.\n\nNos conclusions seront transmises dans le délai imparti.\n\nVeuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: 2,
    dossier: "SCI Les Tilleuls",
    dossier_id: "d-tilleuls",
    tribunal: "M. Karim Benzara",
    date: `Aujourd'hui, 12h06`,
    title: "Loyers impayés — situation critique — besoin d'action urgente",
    urgent: true,
    desc: "M. Benzara, gérant de la SCI Les Tilleuls, signale que le locataire commercial n'a pas payé les loyers de janvier, février et mars, soit 3 × 4 200 €.",
    tags: [
      { name: "bail_commercial_sci.pdf", type: "PDF", size: "892 Ko", resume: "Bail commercial. Loyer mensuel : 4 200€ HT. Clause résolutoire en cas de non-paiement." },
      { name: "mise_en_demeure_model.docx", type: "DOCX", size: "45 Ko", resume: "Modèle de mise en demeure. Montant réclamé : 12 600€. Délai de 8 jours." },
    ],
    status: "draft" as const,
    email_from: "Karim Benzara <k.benzara@gmail.com>",
    email_to: "Me Alexandra Fernandez <a.fernandez@cabinet-fernandez.fr>",
    email_cc: "",
    email_date: `${getTodayShort()}, 12:06`,
    resume: "M. Benzara signale une situation urgente de loyers impayés. Total : 12 600€ sur 3 mois.",
    corps_original: "Maître,\n\nJe me permets de vous écrire en urgence. Le restaurant Le Soleil d'Or n'a pas réglé les loyers de janvier, février et mars.\n\nCordialement,\nKarim Benzara",
    draft: "Monsieur Tran,\n\nJe me permets de vous écrire au nom de mon client, M. Karim Benzara, gérant de la SCI Les Tilleuls.\n\nÀ ce jour, les loyers de janvier, février et mars restent impayés, soit 12 600€.\n\nJe vous mets en demeure de régulariser dans un délai de 8 jours.\n\nVeuillez agréer, Monsieur, l'expression de mes salutations distinguées.\n\nMe Alexandra Fernandez",
  },
  {
    id: 3,
    dossier: "Succession Martin",
    dossier_id: "d-martin",
    tribunal: "Cabinet Moreau",
    date: "Hier, 16h22",
    title: "Pièces complémentaires — dossier succession Martin",
    urgent: false,
    desc: "Le cabinet Moreau transmet les pièces complémentaires demandées pour le dossier de succession Martin.",
    tags: [
      { name: "inventaire_notarial.pdf", type: "PDF", size: "1.2 Mo", resume: "Actif successoral estimé : 780 000€. Deux héritiers en parts égales." },
    ],
    status: "pending" as const,
    email_from: "Cabinet Moreau <contact@cabinet-moreau.fr>",
    email_to: "Me Alexandra Fernandez <a.fernandez@cabinet-fernandez.fr>",
    email_cc: "",
    email_date: "Hier, 16:22",
    resume: "Le Cabinet Moreau transmet les pièces pour la succession Martin. Actif estimé à 780 000€.",
    corps_original: "Chère Consœur,\n\nVeuillez trouver ci-joint les pièces complémentaires pour le dossier de succession Martin.\n\nConfraternellement,\nCabinet Moreau",
    draft: "Cher Confrère,\n\nJ'accuse bonne réception des pièces pour la succession Martin.\n\nJe procède à l'analyse et reviendrai vers vous sous 10 jours.\n\nConfraternellement,\n\nMe Alexandra Fernandez",
  },
]

// ─── Sujets de mails simulés ───
const SIMULATED_EMAILS = [
  "Convocation audience JAF — Dupont c/ Dupont",
  "RE: Mise en demeure loyers impayés — SCI Les Tilleuls",
  "Pièces complémentaires — succession Martin",
  "Ordonnance de non-conciliation — TGI Paris",
  "Acte de vente — Famille Roux",
  "Conclusions adverses — Martin c/ Entreprise Duval",
  "Facture honoraires — Cabinet Alexandra",
  "Relance greffe — Tribunal de commerce Nanterre",
  "Signification huissier — affaire Dubois",
  "Réponse BNP Paribas — offre de prêt",
  "Re: Garde alternée — convention Bernard",
  "Extrait Kbis — TechnoPlus SARL",
  "Certificat médical — dossier prud'homal Martin",
  "PV d'assemblée générale copropriété",
  "Attestation de suivi psychologue — enfants Bernard",
  "Devis désamiantage — appartement Neuilly Roux",
  "Notification jugement — TGI Nanterre",
  "Demande délai de paiement — TechnoPlus",
  "Rapport expertise fissures — expert Roche",
  "Main courante commissariat — Dubois",
  "Contrat de travail signé — M. Jean-Pierre Martin",
  "Re: Proposition règlement amiable SCI",
  "Bulletin de salaire transmis — dossier prud'homal",
  "Offre de prêt confirmée — BNP 388 000€",
  "Procès-verbal constat d'huissier — nuisances",
  "Saisine tribunal de commerce Paris",
  "Accord de principe pension alimentaire — Bernard",
  "Relevé de compte — Dupont Consulting",
  "Avis d'imposition 2025 — Alice Bernard",
  "Acte naissance — succession Robert Martin",
  "Bon de commande litigieux — TechnoPlus",
  "Réponse mairie Neuilly — permis de travaux",
  "Compte rendu médiation — syndic Foncia",
  "Conclusions en défense — licenciement LogiTrans",
  "Mise en demeure signifiée par huissier Bertrand",
  "Re: Planning audience CPH Paris — section industrie",
  "Rapport psychologue — famille Bernard",
  "Re: Proposition règlement amiable loyers",
  "Courrier CPAM — indemnités journalières Martin",
  "Comparatif offres de prêt — courtier Cafpi",
]

// ─── Textes explicatifs Donna pendant la Phase B ───
const DONNA_PHASE_B_TEXTS = [
  "Donna classe vos emails par dossier client...",
  "Donna télécharge et archive les pièces jointes...",
  "Donna repère les échéances et les dates d'audience...",
  "Donna prépare vos brouillons de réponse...",
  "Donna identifie ce qui est urgent...",
  "Donna construit votre briefing du jour...",
]

// ─── Détails affichés pour chaque dossier pendant la cinématique ───
const DOSSIER_CINEMATIC_DETAILS = [
  { emails: 3, attachments: 2, deadline: "22 avril" },
  { emails: 2, attachments: 1, deadline: "10 avril" },
  { emails: 2, attachments: 1, deadline: "15 avril" },
  { emails: 1, attachments: 1, deadline: "15 mai" },
  { emails: 1, attachments: 1, deadline: "25 avril" },
  { emails: 1, attachments: 1, deadline: null },
]

// ─── Chat data ───
interface ChatMessage { role: "user" | "assistant"; content: string; ts: number }

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
]

function getDemoResponse(q: string): string {
  const s = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  if (s.includes("audience") || s.includes("jaf") || s.includes("prepare"))
    return `**Fiche de préparation — Audience JAF du 15 avril**\n\n**Lieu :** TGI Paris — Salle 12 — 14h00\n\n**Objet :** Mesures provisoires\n- Résidence des enfants\n- Pension alimentaire\n\n**Points de friction :**\n1. Résidence principale contestée\n2. Pension : client estime max 350€\n\n**Pièces à emporter :**\n- Ordonnance JAF provisoire\n- Relevés de compte\n- Attestations d'hébergement\n\nBrouillon de conclusions prêt.`
  if (s.includes("tilleul") || s.includes("loyer") || s.includes("calcul"))
    return `**SCI Les Tilleuls — Loyers impayés**\n\n| Mois | Montant |\n|------|--------|\n| Janvier | 4 200 € |\n| Février | 4 200 € |\n| Mars | 4 200 € |\n| **Total** | **12 600 €** |\n\n**Actions :**\n1. Mise en demeure LRAR (modèle prêt)\n2. Commandement de payer\n3. Assignation en référé\n\nMise en demeure prête à valider.`
  if (s.includes("oubli") || s.includes("manque") || s.includes("verifie"))
    return `**3 points d'attention**\n\n1. **SCI Les Tilleuls** — Mise en demeure non envoyée. Brouillon prêt.\n\n2. **Succession Martin** — Pièces à accuser réception.\n\n3. **Greffe TGI Nanterre** — Délai d'appel : 30 jours.`
  return `Essayez :\n- *"Prépare-moi pour l'audience JAF"*\n- *"Calcule les loyers Tilleuls"*\n- *"Qu'est-ce que je risque d'oublier ?"*`
}

// ═══════════════════════════════════════════════════════
// ─── PHASE DEFINITIONS ───
// 0 = Phase A: scan emails (0-8s)
// 1 = Phase B: dossiers creation (8-25s)
// 2 = Phase C: briefing construction (25-40s)
// 3 = Phase D: ROI reveal (40-50s)
// 4 = Phase E: interactive (50s+)
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// ─── SUB-COMPONENTS ───
// ═══════════════════════════════════════════════════════

type TaskStatus = "sent" | "draft" | "pending"

function StatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { label: string; bg: string; color: string }> = {
    sent: { label: "Mail envoyé", bg: "#F0FDF4", color: "#16A34A" },
    draft: { label: "Brouillon prêt", bg: ACCENT_BG, color: ACCENT },
    pending: { label: "À traiter", bg: "#FEF9EC", color: "#B45309" },
  }
  const s = map[status]
  return <span style={{ padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>{s.label}</span>
}

// ─── Slim TaskCard (Phase E — briefing épuré) ───
function SlimTaskCard({ task, onExpand, expanded, onView, onDraft, onTreat, treated }: {
  task: typeof TASKS[0]
  onExpand: () => void
  expanded: boolean
  onView: () => void
  onDraft: () => void
  onTreat: () => void
  treated: boolean
}) {
  if (treated) {
    return (
      <motion.div
        initial={{ opacity: 1 }} animate={{ opacity: 0.5 }}
        transition={{ duration: 0.3 }}
        style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 20px", marginBottom: 10, background: "#F9FAFB", display: "flex", alignItems: "center", gap: 10 }}
      >
        <CheckCircle2 size={16} color={GREEN} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 14, color: TEXT_MUTED, textDecoration: "line-through", flex: 1 }}>{task.title}</span>
        <button onClick={onTreat} style={{ fontSize: 11, color: GREEN, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Annuler</button>
      </motion.div>
    )
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ border: `1px solid ${task.urgent ? "rgba(239,68,68,0.25)" : BORDER}`, borderRadius: 12, marginBottom: 10, overflow: "hidden", background: BG }}
    >
      <div style={{ padding: "16px 20px", cursor: "pointer" }} onClick={onExpand}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {task.urgent && (
            <span style={{ flexShrink: 0, marginTop: 2, width: 7, height: 7, borderRadius: "50%", background: URGENT, display: "inline-block" }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <StatusBadge status={task.status} />
              {task.urgent && (
                <span style={{ fontSize: 10, fontWeight: 700, color: URGENT, background: URGENT_BG, padding: "2px 6px", borderRadius: 4, letterSpacing: "0.04em" }}>URGENT</span>
              )}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, lineHeight: 1.35, marginBottom: 4 }}>{task.title}</div>
            <div style={{ fontSize: 12, color: TEXT_MUTED }}>{task.resume}</div>
          </div>
          <ChevronDown size={16} color={TEXT_LIGHT} style={{ flexShrink: 0, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", marginTop: 2 }} />
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
              <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.65, marginBottom: 12 }}>{task.desc}</p>
              {task.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                  {task.tags.map(tag => (
                    <span key={tag.name} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: "#F9FAFB", border: `1px solid ${BORDER}`, fontSize: 11, color: TEXT_MUTED }}>
                      <Paperclip size={10} /> {tag.name}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={onView} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 7, border: `1px solid ${BORDER}`, background: BG, color: TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  <Eye size={13} /> Voir l'email
                </button>
                <button onClick={onDraft} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 7, border: `1px solid ${ACCENT}`, background: ACCENT_BG, color: ACCENT, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                  <Edit3 size={13} /> Brouillon Donna
                </button>
                <button onClick={onTreat} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 7, border: `1px solid ${GREEN}30`, background: "#F0FDF4", color: GREEN, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, marginLeft: "auto" }}>
                  <CheckCircle2 size={13} /> Traiter
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Email Drawer ───
function EmailDrawer({ task, mode: initialMode, onClose, isMobile }: {
  task: typeof TASKS[0]; mode: "view" | "draft"; onClose: () => void; isMobile: boolean
}) {
  const [activeMode, setActiveMode] = useState(initialMode)
  const [draftText, setDraftText] = useState(task.draft)
  const [draftLoading, setDraftLoading] = useState(initialMode === "draft")
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState<typeof task.tags[0] | null>(null)

  useEffect(() => {
    if (initialMode === "draft") {
      setDraftLoading(true)
      const t = setTimeout(() => setDraftLoading(false), 1200)
      return () => clearTimeout(t)
    }
  }, [initialMode])

  const handleCopy = () => {
    navigator.clipboard.writeText(draftText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenerateDraft = () => {
    setActiveMode("draft")
    setDraftLoading(true)
    setTimeout(() => setDraftLoading(false), 1200)
  }

  return (
    <motion.div
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: isMobile ? "100%" : "min(680px, 55vw)", background: BG, zIndex: 80, display: "flex", flexDirection: "column", boxShadow: "-4px 0 30px rgba(0,0,0,0.1)", borderLeft: `1px solid ${BORDER}` }}
    >
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: TEXT_MUTED, fontFamily: "inherit" }}>
          <ArrowLeft size={16} /> Retour
        </button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button onClick={() => setActiveMode("view")} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${activeMode === "view" ? ACCENT : BORDER}`, background: activeMode === "view" ? ACCENT_BG : BG, color: activeMode === "view" ? ACCENT : TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
            <Eye size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Voir
          </button>
          <button onClick={handleGenerateDraft} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${activeMode === "draft" ? ACCENT : BORDER}`, background: activeMode === "draft" ? ACCENT_BG : BG, color: activeMode === "draft" ? ACCENT : TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
            <Edit3 size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Brouillon
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px" }}>
        {activeMode === "view" ? (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: TEXT, marginBottom: 16, lineHeight: 1.3 }}>{task.title}</h2>
            <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "14px 16px", marginBottom: 20, fontSize: 12, lineHeight: 1.8, border: `1px solid ${BORDER}` }}>
              <div><span style={{ color: TEXT_LIGHT, width: 32, display: "inline-block" }}>De</span> <span style={{ color: TEXT }}>{task.email_from}</span></div>
              <div><span style={{ color: TEXT_LIGHT, width: 32, display: "inline-block" }}>À</span> <span style={{ color: TEXT }}>{task.email_to}</span></div>
              {task.email_cc && <div><span style={{ color: TEXT_LIGHT, width: 32, display: "inline-block" }}>Cc</span> <span style={{ color: TEXT }}>{task.email_cc}</span></div>}
              <div><span style={{ color: TEXT_LIGHT, width: 32, display: "inline-block" }}>Date</span> <span style={{ color: TEXT }}>{task.email_date}</span></div>
            </div>
            <div style={{ background: ACCENT_BG, borderRadius: 10, padding: "16px 18px", marginBottom: 20, border: `1px solid rgba(37,99,235,0.12)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>D</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: ACCENT }}>Résumé Donna</span>
              </div>
              <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.7, margin: 0 }}>{task.resume}</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => setShowOriginal(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: TEXT_MUTED, fontFamily: "inherit", marginBottom: 8 }}>
                <Mail size={13} /> {showOriginal ? "Masquer l'email original" : "Voir l'email original"}
                <ChevronRight size={12} style={{ transform: showOriginal ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              <AnimatePresence>
                {showOriginal && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                    <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "14px 16px", border: `1px solid ${BORDER}`, fontSize: 13, color: TEXT, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                      {task.corps_original}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {task.tags.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_LIGHT, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Pièces jointes</div>
                {task.tags.map(tag => (
                  <button key={tag.name} onClick={() => setSelectedAttachment(tag)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, marginBottom: 6, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                    onMouseLeave={e => (e.currentTarget.style.background = BG)}
                  >
                    <FileText size={18} color={ACCENT} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tag.name}</div>
                      <div style={{ fontSize: 11, color: TEXT_LIGHT }}>{tag.type} · {tag.size}</div>
                    </div>
                    <Eye size={14} color={TEXT_LIGHT} />
                  </button>
                ))}
              </div>
            )}
            <button onClick={handleGenerateDraft} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px 20px", borderRadius: 8, background: ACCENT, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <Edit3 size={15} /> Générer une réponse
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Brouillon de réponse</h2>
            <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 16 }}>Re: {task.title}</p>
            {draftLoading ? (
              <div style={{ background: "#F9FAFB", borderRadius: 10, padding: 20, border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>D</div>
                  <span style={{ fontSize: 12, color: ACCENT, fontWeight: 500 }}>Donna rédige...</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[85, 70, 90, 60].map((w, i) => (
                    <motion.div key={i} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      style={{ height: 10, borderRadius: 4, background: BORDER, width: `${w}%` }} />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <textarea
                  value={draftText}
                  onChange={e => setDraftText(e.target.value)}
                  style={{ width: "100%", minHeight: 280, padding: "16px 18px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#FAFAFA", fontSize: 13, color: TEXT, lineHeight: 1.7, fontFamily: "inherit", resize: "vertical", outline: "none" }}
                  onFocus={e => (e.target.style.borderColor = ACCENT)}
                  onBlur={e => (e.target.style.borderColor = BORDER)}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={handleCopy} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, background: "#111827", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    {copied ? <><Check size={14} /> Copié !</> : <><Copy size={14} /> Copier</>}
                  </button>
                </div>
                <div style={{ marginTop: 20, padding: "16px 18px", borderRadius: 10, background: "#F9FAFB", border: `1px solid ${BORDER}` }}>
                  {feedback ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: GREEN }}>
                      <CheckCircle2 size={16} /> Merci ! Donna apprend de vos retours.
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 10 }}>Ce brouillon vous convient ?</p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[
                          { key: "parfait", icon: ThumbsUp, label: "Parfait", color: GREEN },
                          { key: "modifier", icon: Pencil, label: "Quelques modifications", color: "#D97706" },
                          { key: "erreur", icon: XCircle, label: "Erreurs", color: URGENT },
                        ].map(fb => (
                          <button key={fb.key} onClick={() => setFeedback(fb.key)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 6, border: `1px solid ${BORDER}`, background: BG, color: TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                            onMouseEnter={e => { (e.currentTarget.style.borderColor = fb.color); (e.currentTarget.style.color = fb.color) }}
                            onMouseLeave={e => { (e.currentTarget.style.borderColor = BORDER); (e.currentTarget.style.color = TEXT_MUTED) }}
                          >
                            <fb.icon size={13} /> {fb.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedAttachment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setSelectedAttachment(null)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: BG, borderRadius: 12, width: "100%", maxWidth: 700, maxHeight: "80vh", display: "flex", flexDirection: isMobile ? "column" : "row", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            >
              <div style={{ flex: 1, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, padding: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <FileText size={48} color={TEXT_LIGHT} style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>{selectedAttachment.name}</div>
                  <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>{selectedAttachment.type} · {selectedAttachment.size}</div>
                  <button style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, background: ACCENT, color: "#fff", border: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    <Download size={13} /> Télécharger
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>D</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>Résumé Donna</span>
                  </div>
                  <button onClick={() => setSelectedAttachment(null)} style={{ background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED }}><X size={18} /></button>
                </div>
                <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.7 }}>{selectedAttachment.resume}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Dossier Detail View ───
function DossierDetailView({ dossier, onClose, isMobile }: {
  dossier: typeof DOSSIERS[0]; onClose: () => void; isMobile: boolean
}) {
  const [selectedDoc, setSelectedDoc] = useState<typeof dossier.documents[0] | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<typeof dossier.emails[0] | null>(null)
  const statusColors = { actif: GREEN, en_attente: "#D97706", "archivé": TEXT_LIGHT }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "20px 16px" : "32px 32px" }}>
      <div style={{ marginBottom: 24 }}>
        <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: TEXT_MUTED, fontFamily: "inherit", marginBottom: 16 }}>
          <ArrowLeft size={16} /> Retour au briefing
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: dossier.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 700 }}>{dossier.initials}</div>
          <div>
            <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 600, color: TEXT, margin: 0, lineHeight: 1.2 }}>{dossier.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${statusColors[dossier.status]}15`, color: statusColors[dossier.status], fontWeight: 600 }}>{dossier.status === "actif" ? "Actif" : dossier.status === "en_attente" ? "En attente" : "Archivé"}</span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#F3F4F6", color: TEXT_MUTED }}>{dossier.domain}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: ACCENT_BG, borderRadius: 10, padding: "16px 18px", marginBottom: 24, border: `1px solid rgba(37,99,235,0.12)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>D</div>
          <span style={{ fontSize: 12, fontWeight: 600, color: ACCENT }}>Résumé Donna</span>
        </div>
        <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.7, margin: 0 }}>{dossier.summary}</p>
      </div>
      <div style={{ display: "flex", gap: 20, flexDirection: isMobile ? "column" : "row" }}>
        <div style={{ flex: 3 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            Échanges ({dossier.emails.length})
          </div>
          {dossier.emails.map(email => (
            <div key={email.id} onClick={() => setSelectedEmail(email)} style={{ padding: "12px 16px", borderRadius: 8, border: `1px solid ${BORDER}`, marginBottom: 8, cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
              onMouseLeave={e => (e.currentTarget.style.background = BG)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{email.sender}</span>
                <span style={{ fontSize: 11, color: TEXT_LIGHT }}>{email.date}</span>
              </div>
              <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 4 }}>{email.subject}</div>
              <div style={{ fontSize: 11, color: TEXT_LIGHT }}>{email.resume}</div>
            </div>
          ))}
        </div>
        <div style={{ flex: 2 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            Documents ({dossier.documents.length})
          </div>
          {dossier.documents.map(doc => (
            <button key={doc.id} onClick={() => setSelectedDoc(doc)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, marginBottom: 6, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
              onMouseLeave={e => (e.currentTarget.style.background = BG)}
            >
              <FileText size={16} color={ACCENT} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                <div style={{ fontSize: 11, color: TEXT_LIGHT }}>{doc.type} · {doc.size} · {doc.date}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {dossier.deadlines && dossier.deadlines.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={13} /> Échéances
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {dossier.deadlines.map((dl, i) => (
              <div key={i} style={{ padding: "10px 16px", borderRadius: 8, border: `1px solid ${dl.urgent ? "rgba(239,68,68,0.3)" : BORDER}`, background: dl.urgent ? URGENT_BG : "#F9FAFB", flex: "1 1 200px", minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <Clock size={12} color={dl.urgent ? URGENT : TEXT_MUTED} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: dl.urgent ? URGENT : TEXT }}>{dl.date}</span>
                  {dl.urgent && <span style={{ fontSize: 9, fontWeight: 600, color: URGENT, background: "rgba(239,68,68,0.1)", padding: "1px 5px", borderRadius: 3 }}>URGENT</span>}
                </div>
                <div style={{ fontSize: 12, color: TEXT_MUTED }}>{dl.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedDoc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: BG, borderRadius: 12, width: "100%", maxWidth: 700, maxHeight: "80vh", display: "flex", flexDirection: isMobile ? "column" : "row", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            >
              <div style={{ flex: 1, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, padding: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <FileText size={48} color={TEXT_LIGHT} style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>{selectedDoc.name}</div>
                  <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>{selectedDoc.type} · {selectedDoc.size}</div>
                  <button style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, background: ACCENT, color: "#fff", border: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    <Download size={13} /> Télécharger
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>D</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>Résumé Donna</span>
                  </div>
                  <button onClick={() => setSelectedDoc(null)} style={{ background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED }}><X size={18} /></button>
                </div>
                <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.7 }}>{selectedDoc.resume}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedEmail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setSelectedEmail(null)}
          >
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              style={{ background: BG, borderRadius: 12, width: "100%", maxWidth: 640, maxHeight: "80vh", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}
            >
              <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>{selectedEmail.subject}</div>
                  <button onClick={() => setSelectedEmail(null)} style={{ background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED, padding: 4 }}><X size={18} /></button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: dossier.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                    {selectedEmail.sender.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{selectedEmail.sender}</div>
                    <div style={{ fontSize: 11, color: TEXT_LIGHT }}>à Me Fernandez · {selectedEmail.date}</div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>
                <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.8 }}>
                  <p style={{ margin: "0 0 16px" }}>Bonjour Me Fernandez,</p>
                  <p style={{ margin: "0 0 16px" }}>{selectedEmail.resume}</p>
                  <p style={{ margin: 0 }}>Cordialement,<br />{selectedEmail.sender}</p>
                </div>
              </div>
              <div style={{ padding: "14px 24px", borderTop: `1px solid ${BORDER}`, background: ACCENT_BG }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>D</div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: ACCENT }}>Analyse Donna</span>
                </div>
                <p style={{ fontSize: 12, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>{selectedEmail.resume}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Chat markdown ───
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

// ─── Cinematic Phase A: email scanning ───
function PhaseAScanZone({ mailCount, currentEmailSubject, isMobile }: {
  mailCount: number; currentEmailSubject: string; isMobile: boolean
}) {
  const pct = Math.round((mailCount / 89) * 100)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? "16px" : "22px 26px", background: BG }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
          <svg width="36" height="36" style={{ position: "absolute", top: 0, left: 0 }}>
            <circle cx="18" cy="18" r="14" fill="none" stroke={BORDER} strokeWidth="2.5" />
            <motion.circle cx="18" cy="18" r="14" fill="none" stroke={ACCENT} strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 14}`}
              strokeDashoffset={`${2 * Math.PI * 14 * (1 - pct / 100)}`}
              transform="rotate(-90 18 18)"
              style={{ transition: "stroke-dashoffset 0.4s ease" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.span animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.6, repeat: Infinity }} style={{ fontSize: 11, fontWeight: 700, color: ACCENT }}>D</motion.span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 1 }}>Donna analyse vos emails des 30 derniers jours...</div>
          <div style={{ fontSize: 12, color: TEXT_MUTED }}>
            <span style={{ fontWeight: 600, color: ACCENT }}>{mailCount}</span> / 89 emails analysés
          </div>
        </div>
      </div>
      <div style={{ height: 3, background: BORDER, borderRadius: 2, marginBottom: 12, overflow: "hidden" }}>
        <motion.div style={{ height: "100%", background: ACCENT, borderRadius: 2 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={currentEmailSubject} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.2 }}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Mail size={11} color={TEXT_LIGHT} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: TEXT_MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentEmailSubject}</span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Cinematic Phase B: dossier being processed (main area) ───
function PhaseBDossierFocus({ dossier, details, donnaText }: {
  dossier: typeof DOSSIERS[0]
  details: typeof DOSSIER_CINEMATIC_DETAILS[0]
  donnaText: string
}) {
  return (
    <motion.div
      key={dossier.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", background: BG }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: dossier.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{dossier.initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{dossier.name}</div>
          <div style={{ fontSize: 11, color: TEXT_MUTED }}>{dossier.domain}</div>
        </div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 400 }}>
          <CheckCircle2 size={18} color={GREEN} />
        </motion.div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          `${details.emails} email${details.emails > 1 ? "s" : ""} archivé${details.emails > 1 ? "s" : ""}`,
          `${details.attachments} pièce${details.attachments > 1 ? "s" : ""} jointe${details.attachments > 1 ? "s" : ""} téléchargée${details.attachments > 1 ? "s" : ""}`,
          details.deadline ? `1 échéance notée : ${details.deadline}` : null,
        ].filter(Boolean).map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.15 }}
            style={{ fontSize: 12, color: TEXT_MUTED, display: "flex", alignItems: "center", gap: 6 }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
            {line}
          </motion.div>
        ))}
      </div>
      {donnaText && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: ACCENT_BG, border: `1px solid rgba(37,99,235,0.12)`, display: "flex", alignItems: "center", gap: 8 }}
        >
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 8, fontWeight: 700, flexShrink: 0 }}>D</div>
          <span style={{ fontSize: 12, color: ACCENT, fontStyle: "italic" }}>{donnaText}</span>
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Cinematic Phase C: briefing being typed ───
function PhaseCBriefing({ briefingText, briefingDone, isMobile }: {
  briefingText: string; briefingDone: boolean; isMobile: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? "16px" : "20px 24px", background: BG }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>D</div>
        <span style={{ fontSize: 12, fontWeight: 600, color: ACCENT }}>Donna écrit votre briefing...</span>
        {!briefingDone && (
          <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
        )}
      </div>
      <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.75, margin: 0, minHeight: 40 }}>
        {briefingText}
        {!briefingDone && (
          <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
            style={{ display: "inline-block", width: 2, height: 14, background: ACCENT, marginLeft: 2, verticalAlign: "text-bottom" }} />
        )}
      </p>
    </motion.div>
  )
}

// ─── Sidebar ───
function SidebarContent({ onDossierClick, activeDossierId, visibleDossierCount, animPhase }: {
  onDossierClick: (d: typeof DOSSIERS[0] | null) => void
  activeDossierId: string | null
  visibleDossierCount: number
  animPhase: number
}) {
  const visible = DOSSIERS.slice(0, visibleDossierCount)
  // During phase B, the focused dossier is highlighted
  const cinematicHighlight = animPhase === 1 ? DOSSIERS[Math.min(visibleDossierCount - 1, DOSSIERS.length - 1)]?.id : null

  return (
    <>
      <div style={{ padding: "18px 14px 12px", borderBottom: `1px solid ${SIDEBAR_BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17, color: TEXT }}>Donna</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: ACCENT_BG, color: ACCENT, letterSpacing: "0.05em" }}>DÉMO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: animPhase < 4 ? Infinity : 0 }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: animPhase < 4 ? ACCENT : GREEN, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: TEXT_MUTED }}>
            {animPhase < 4 ? "Analyse en cours..." : "À jour · il y a 2 min"}
          </span>
        </div>
      </div>

      <div style={{ padding: "10px 6px" }}>
        <button onClick={() => onDossierClick(null)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 6, background: activeDossierId === null && animPhase >= 4 ? "#F3F4F6" : "transparent", marginBottom: 2, width: "100%", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
          <LayoutDashboard size={14} style={{ color: activeDossierId === null ? TEXT : TEXT_MUTED, flexShrink: 0 }} />
          <div style={{ fontSize: 13, fontWeight: activeDossierId === null ? 600 : 400, color: activeDossierId === null ? TEXT : TEXT_MUTED }}>Briefing</div>
        </button>
      </div>

      <div style={{ padding: "4px 14px 8px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_LIGHT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          Dossiers {visibleDossierCount > 0 && `(${visibleDossierCount})`}
        </div>
        {visible.length === 0 && (
          <div style={{ fontSize: 11, color: TEXT_LIGHT, fontStyle: "italic", paddingLeft: 2 }}>En cours de création...</div>
        )}
        <AnimatePresence>
          {visible.map((d) => {
            const isActive = activeDossierId === d.id || (animPhase === 1 && cinematicHighlight === d.id)
            return (
              <motion.div key={d.id}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => animPhase >= 4 && onDossierClick(d)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", marginBottom: 2,
                  cursor: animPhase >= 4 ? "pointer" : "default",
                  borderRadius: 6,
                  background: isActive ? (animPhase === 1 ? `${d.color}18` : "#F3F4F6") : "transparent",
                  borderLeft: isActive && animPhase === 1 ? `3px solid ${d.color}` : "3px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: d.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{d.initials}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: isActive ? 600 : 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                </div>
                {isActive && animPhase === 1 && (
                  <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div style={{ padding: "10px 14px", borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
        <Link to="/contact" style={{ fontSize: 12, color: ACCENT, fontWeight: 500, display: "flex", alignItems: "center", gap: 5, textDecoration: "none", marginBottom: 6 }}>
          <Mail size={11} /> Demander un essai gratuit
        </Link>
        <Link to="/" style={{ fontSize: 11, color: TEXT_MUTED, textDecoration: "none" }}>← Retour au site</Link>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════
// ─── MAIN PAGE ───
// ═══════════════════════════════════════════════════════

const DONNA_BRIEFING_TEXT = "Bonjour Alexandra, voici votre briefing. J'ai analysé 89 emails et créé 6 dossiers. 9 emails sans intérêt ont été filtrés automatiquement. 3 actions vous attendent ce matin."

export default function DemoV3() {
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [treatedIds, setTreatedIds] = useState<Set<number>>(new Set())
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)

  // Drawer state
  const [selectedTask, setSelectedTask] = useState<typeof TASKS[0] | null>(null)
  const [drawerMode, setDrawerMode] = useState<"view" | "draft">("view")

  // Dossier detail
  const [selectedDossier, setSelectedDossier] = useState<typeof DOSSIERS[0] | null>(null)

  // ─── Animation phases ───
  // 0 = Phase A (scan), 1 = Phase B (dossiers), 2 = Phase C (briefing), 3 = Phase D (ROI), 4 = Phase E (interactive)
  const [animPhase, setAnimPhase] = useState(0)
  const [mailCount, setMailCount] = useState(0)
  const [currentEmailIdx, setCurrentEmailIdx] = useState(0)
  const [visibleDossierCount, setVisibleDossierCount] = useState(0)
  const [activeCinematicDossierIdx, setActiveCinematicDossierIdx] = useState(-1) // which dossier is focused in Phase B
  const [donnaPhaseText, setDonnaPhaseText] = useState(DONNA_PHASE_B_TEXTS[0])
  const [briefingText, setBriefingText] = useState("")
  const [briefingDone, setBriefingDone] = useState(false)
  const [visibleTaskCount, setVisibleTaskCount] = useState(0)
  const [roiVisible, setRoiVisible] = useState(false)
  const [animDone, setAnimDone] = useState(false)

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const emailIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const addTimer = useCallback((fn: () => void, delay: number) => {
    const t = setTimeout(fn, delay)
    timersRef.current.push(t)
    return t
  }, [])

  // ─── Skip to final state ───
  const skipToEnd = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = []
    if (emailIntervalRef.current) clearInterval(emailIntervalRef.current)
    setAnimPhase(4)
    setMailCount(89)
    setVisibleDossierCount(DOSSIERS.length)
    setActiveCinematicDossierIdx(-1)
    setBriefingText(DONNA_BRIEFING_TEXT)
    setBriefingDone(true)
    setVisibleTaskCount(TASKS.length)
    setRoiVisible(true)
    setAnimDone(true)
  }, [])

  // ─── Animation sequence ───
  useEffect(() => {
    // === PHASE A: 0-8s — scan emails ===
    addTimer(() => {
      emailIntervalRef.current = setInterval(() => {
        setCurrentEmailIdx(i => (i + 1) % SIMULATED_EMAILS.length)
      }, 220)
      const milestones = [5, 12, 20, 28, 36, 44, 52, 60, 68, 74, 80, 84, 87, 89]
      milestones.forEach((target, i) => {
        addTimer(() => setMailCount(target), i * (7000 / milestones.length))
      })
    }, 500)

    // === PHASE B: 8-25s — dossiers appear + navigate ===
    // Each dossier appears every ~2.5s, is highlighted for ~2s, then next
    const dossierTimings = [8000, 10500, 13000, 15500, 18000, 20500]
    dossierTimings.forEach((delay, i) => {
      addTimer(() => {
        if (emailIntervalRef.current) { clearInterval(emailIntervalRef.current); emailIntervalRef.current = null }
        setAnimPhase(1)
        setVisibleDossierCount(i + 1)
        setActiveCinematicDossierIdx(i)
        setDonnaPhaseText(DONNA_PHASE_B_TEXTS[i] || DONNA_PHASE_B_TEXTS[DONNA_PHASE_B_TEXTS.length - 1])
      }, delay)
    })

    // === PHASE C: 25s — briefing construction ===
    addTimer(() => {
      setAnimPhase(2)
      setActiveCinematicDossierIdx(-1)
      const fullText = DONNA_BRIEFING_TEXT
      let idx = 0
      const typeInterval = setInterval(() => {
        idx += 4
        setBriefingText(fullText.slice(0, idx))
        if (idx >= fullText.length) {
          clearInterval(typeInterval)
          setBriefingText(fullText)
          setBriefingDone(true)
        }
      }, 28)
      timersRef.current.push(typeInterval as any)
      // Tasks appear during briefing construction
      addTimer(() => setVisibleTaskCount(1), 3000)
      addTimer(() => setVisibleTaskCount(2), 5000)
      addTimer(() => setVisibleTaskCount(3), 7000)
    }, 23000)

    // === PHASE D: 40s — ROI encart ===
    addTimer(() => {
      setAnimPhase(3)
      setRoiVisible(true)
    }, 38000)

    // === PHASE E: 50s — interactive ===
    addTimer(() => {
      setAnimPhase(4)
      setAnimDone(true)
    }, 48000)

    return () => {
      timersRef.current.forEach(t => clearTimeout(t))
      if (emailIntervalRef.current) clearInterval(emailIntervalRef.current)
    }
  }, [addTimer])

  useEffect(() => { if (!isMobile) setSidebarOpen(false) }, [isMobile])

  const handleView = (task: typeof TASKS[0]) => { setSelectedTask(task); setDrawerMode("view") }
  const handleDraft = (task: typeof TASKS[0]) => { setSelectedTask(task); setDrawerMode("draft") }
  const handleTreat = (id: number) => {
    setTreatedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const handleExpandTask = (id: number) => {
    setExpandedTaskId(prev => prev === id ? null : id)
  }

  const currentEmailSubject = SIMULATED_EMAILS[currentEmailIdx] || ""
  const currentCinematicDossier = activeCinematicDossierIdx >= 0 ? DOSSIERS[activeCinematicDossierIdx] : null
  const currentCinematicDetails = activeCinematicDossierIdx >= 0 ? DOSSIER_CINEMATIC_DETAILS[activeCinematicDossierIdx] : null
  const urgentRemaining = TASKS.slice(0, visibleTaskCount).filter(t => t.urgent && !treatedIds.has(t.id)).length

  return (
    <div style={{ background: BG, color: TEXT, height: "100vh", fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Top bar — mobile only */}
      {isMobile && (
        <div style={{ height: 40, background: "#F3F4F6", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", padding: "0 16px", gap: 8, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
            <Menu size={18} color={TEXT_MUTED} />
          </button>
          <div style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 600, color: TEXT }}>Donna</div>
          <Link to="/" style={{ fontSize: 11, color: TEXT_LIGHT, textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
            Site <ChevronRight size={10} />
          </Link>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* Mobile sidebar overlay */}
        {isMobile && (
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 50 }} />
                <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  style={{ position: "fixed", top: 40, left: 0, bottom: 0, zIndex: 51, width: 240, background: SIDEBAR_BG, borderRight: `1px solid ${SIDEBAR_BORDER}`, display: "flex", flexDirection: "column", overflowY: "auto" }}
                >
                  <SidebarContent onDossierClick={d => { if (d) setSelectedDossier(d); setSidebarOpen(false) }} activeDossierId={selectedDossier?.id || null} visibleDossierCount={visibleDossierCount} animPhase={animPhase} />
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        )}

        {/* Desktop sidebar */}
        {!isMobile && (
          <aside style={{ width: 210, background: SIDEBAR_BG, borderRight: `1px solid ${SIDEBAR_BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
            <SidebarContent onDossierClick={d => setSelectedDossier(d)} activeDossierId={selectedDossier?.id || null} visibleDossierCount={visibleDossierCount} animPhase={animPhase} />
          </aside>
        )}

        {/* Main content */}
        {selectedDossier ? (
          <DossierDetailView dossier={selectedDossier} onClose={() => setSelectedDossier(null)} isMobile={isMobile} />
        ) : (
          <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? "20px 16px" : "36px 40px", position: "relative", maxWidth: 760 }}>

            {/* Header + Skip button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 22 : 28, fontWeight: 400, color: TEXT, marginBottom: 5, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  Bonjour, Alexandra
                </h1>
                <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.4 }}>
                  Je suis Donna, votre assistante · {getToday()}
                </p>
              </motion.div>
              <AnimatePresence>
                {!animDone && (
                  <motion.button
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    onClick={skipToEnd}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: `1px solid ${BORDER}`, background: BG, color: TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, marginLeft: 16, marginTop: 4 }}
                  >
                    <SkipForward size={12} /> Passer
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* PHASE A: scanning zone */}
            <AnimatePresence mode="wait">
              {animPhase === 0 && (
                <motion.div key="phaseA" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} style={{ marginBottom: 20 }}>
                  <PhaseAScanZone mailCount={mailCount} currentEmailSubject={currentEmailSubject} isMobile={isMobile} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHASE B: dossier focus */}
            <AnimatePresence mode="wait">
              {animPhase === 1 && currentCinematicDossier && currentCinematicDetails && (
                <motion.div key={`phaseB-${currentCinematicDossier.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} style={{ marginBottom: 20 }}>
                  <PhaseBDossierFocus dossier={currentCinematicDossier} details={currentCinematicDetails} donnaText={donnaPhaseText} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHASE C+: briefing message */}
            <AnimatePresence>
              {animPhase >= 2 && briefingText && (
                <motion.div key="briefing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 28 }}>
                  <PhaseCBriefing briefingText={briefingText} briefingDone={briefingDone} isMobile={isMobile} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHASE C+: single action count (replaces stats bar) */}
            <AnimatePresence>
              {animPhase >= 2 && visibleTaskCount > 0 && (
                <motion.div key="action-count" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: isMobile ? 36 : 44, fontWeight: 700, color: urgentRemaining > 0 ? URGENT : GREEN, lineHeight: 1 }}>
                        {TASKS.slice(0, visibleTaskCount).filter(t => !treatedIds.has(t.id)).length}
                      </span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>actions à traiter</div>
                        <div style={{ fontSize: 12, color: TEXT_MUTED }}>aujourd'hui</div>
                      </div>
                    </div>
                    {urgentRemaining > 0 && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: URGENT_BG, border: `1px solid rgba(239,68,68,0.2)` }}>
                        <Zap size={12} color={URGENT} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: URGENT }}>{urgentRemaining} urgente{urgentRemaining > 1 ? "s" : ""}</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tasks */}
            <AnimatePresence>
              {visibleTaskCount > 0 && animPhase >= 2 && (
                <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  {TASKS.slice(0, visibleTaskCount).map((task) => (
                    <SlimTaskCard
                      key={task.id}
                      task={task}
                      onExpand={() => handleExpandTask(task.id)}
                      expanded={expandedTaskId === task.id}
                      onView={() => handleView(task)}
                      onDraft={() => handleDraft(task)}
                      onTreat={() => handleTreat(task.id)}
                      treated={treatedIds.has(task.id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHASE D: ROI encart */}
            <AnimatePresence>
              {roiVisible && (
                <motion.div key="roi"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                  style={{ marginTop: 20, padding: isMobile ? "14px 16px" : "18px 22px", borderRadius: 12, background: "#F0FDF4", border: `1px solid rgba(16,185,129,0.2)` }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                    <Clock size={15} color={GREEN} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div style={{ fontSize: 13, color: "#065F46", lineHeight: 1.6 }}>
                      <strong>Donna a traité 89 emails en 4 minutes.</strong> Temps économisé estimé : <strong>environ 2h30.</strong>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Calendar size={15} color={GREEN} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div style={{ fontSize: 13, color: "#065F46", lineHeight: 1.6 }}>
                      Demain matin à 8h, votre prochain briefing sera prêt.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHASE E: CTA */}
            <AnimatePresence>
              {animDone && (
                <motion.div key="cta"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                  style={{ marginTop: 24, padding: isMobile ? "16px" : "20px 24px", borderRadius: 12, background: ACCENT, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: isMobile ? 24 : 0 }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Vous aimez ce que vous voyez ?</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Connectez votre vraie boîte mail — 14 jours gratuits.</div>
                  </div>
                  <Link to="/contact" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 22px", borderRadius: 9, background: "#fff", color: ACCENT, fontSize: 14, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
                    Demander un essai gratuit <Send size={13} />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        )}

        {/* Email drawer */}
        <AnimatePresence>
          {selectedTask && (
            <EmailDrawer task={selectedTask} mode={drawerMode} onClose={() => setSelectedTask(null)} isMobile={isMobile} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
