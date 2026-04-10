import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import {
  Settings, LayoutDashboard, Paperclip, Eye, Edit3, Send, ChevronRight, Mail,
  ArrowUp, MessageCircle, X, Menu, ArrowLeft, Copy, Check, FileText, Download,
  Calendar, AlertTriangle, CheckCircle2, Clock, ThumbsUp, Pencil, XCircle, Loader2,
  SkipForward
} from "lucide-react"
import ReactMarkdown from "react-markdown"

// ─── Palette (identique DemoV2) ───
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
// ─── DEMO DATA (repris de DemoV2) ───
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
// ─── ANIMATION STATE ───
// ═══════════════════════════════════════════════════════

interface AnimState {
  // Phase scanning
  isScanning: boolean
  mailCount: number       // 0 → 89
  currentEmailIdx: number // index dans SIMULATED_EMAILS
  // Stats
  statsEmailCount: number // 0 → 12
  statsDossierCount: number // 0 → 6
  statsFilteredCount: number // 0 → 9
  // Dossiers visibles (index dans DOSSIERS)
  visibleDossierCount: number
  // Tâches visibles
  visibleTaskCount: number
  // Briefing text
  briefingText: string
  briefingDone: boolean
  // Done
  done: boolean
}

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

// ─── TaskCard ───
function TaskCard({ task, delay, onView, onDraft, onTreat, treated }: {
  task: typeof TASKS[0]; delay: number
  onView: () => void; onDraft: () => void; onTreat: () => void; treated: boolean
}) {
  if (treated) {
    return (
      <motion.div
        initial={{ opacity: 1 }} animate={{ opacity: 0.55 }}
        transition={{ duration: 0.3 }}
        style={{ border: `1px solid ${BORDER}`, borderRadius: 10, marginBottom: 12, overflow: "hidden", background: "#F9FAFB" }}
      >
        <div style={{ padding: "14px 18px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: TEXT_MUTED }}><span style={{ color: TEXT_LIGHT, fontWeight: 500 }}>{task.dossier}</span>{" · "}{task.tribunal}</div>
            <span style={{ fontSize: 11, color: TEXT_LIGHT, flexShrink: 0, marginLeft: 12 }}>{task.date}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <CheckCircle2 size={16} color={GREEN} />
            <span style={{ fontSize: 14, fontWeight: 600, color: TEXT_MUTED, textDecoration: "line-through" }}>{task.title}</span>
          </div>
        </div>
        <div style={{ padding: "10px 18px 14px", display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${BORDER}` }}>
          <button onClick={onTreat} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 6, border: `1px solid ${GREEN}30`, background: "#F0FDF4", color: GREEN, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
            <CheckCircle2 size={13} /> Mail envoyé
          </button>
        </div>
      </motion.div>
    )
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ border: `1px solid ${BORDER}`, borderRadius: 10, marginBottom: 12, overflow: "hidden", background: BG }}
    >
      <div style={{ padding: "14px 18px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: TEXT_MUTED }}><span style={{ color: TEXT, fontWeight: 500 }}>{task.dossier}</span>{" · "}{task.tribunal}</div>
          <span style={{ fontSize: 11, color: TEXT_LIGHT, flexShrink: 0, marginLeft: 12 }}>{task.date}</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
          {task.urgent && <span style={{ width: 6, height: 6, borderRadius: "50%", background: URGENT, flexShrink: 0, marginTop: 6 }} />}
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, lineHeight: 1.4 }}>{task.title}</div>
        </div>
        {task.urgent && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: URGENT_BG, color: URGENT, fontSize: 11, fontWeight: 600, marginBottom: 8 }}>⚡ Urgent</span>}
        <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.65, marginBottom: 10 }}>{task.desc}</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {task.tags.map(tag => (
            <span key={tag.name} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: "#F9FAFB", border: `1px solid ${BORDER}`, fontSize: 11, color: TEXT_MUTED }}>
              <Paperclip size={10} /> {tag.name}
            </span>
          ))}
        </div>
      </div>
      <div style={{ padding: "10px 18px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onView} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 6, border: `1px solid ${BORDER}`, background: BG, color: TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}><Eye size={13} /> Voir</button>
          <button onClick={onDraft} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 6, border: `1px solid ${BORDER}`, background: BG, color: TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}><Edit3 size={13} /> Brouillon</button>
        </div>
        <button onClick={onTreat} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 6, border: `1px solid ${BORDER}`, background: "#FEF9EC", color: "#B45309", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
          <Clock size={13} /> Mail en attente
        </button>
      </div>
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

// ─── Chat Panel ───
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
  useEffect(() => { if (isOpen && textareaRef.current) setTimeout(() => textareaRef.current?.focus(), 300) }, [isOpen])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setShowSuggestions(false)
    setMessages(prev => [...prev, { role: "user", content: trimmed, ts: Date.now() }])
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    setLoading(true)
    await new Promise(r => setTimeout(r, 900 + Math.random() * 800))
    setMessages(prev => [...prev, { role: "assistant", content: getDemoResponse(trimmed), ts: Date.now() }])
    setLoading(false)
  }

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input) } }
  const autoResize = () => { const el = textareaRef.current; if (!el) return; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 120) + "px" }

  if (!isOpen && !isMobile) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        style={{ width: 56, flexShrink: 0, borderLeft: `1px solid ${BORDER}`, background: SIDEBAR_BG, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, gap: 12, cursor: "pointer", position: "relative" }}
        onClick={onToggle}
      >
        <div style={{ position: "relative" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>D</div>
          <div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: GREEN, border: `2px solid ${SIDEBAR_BG}` }} />
        </div>
        <div style={{ writingMode: "vertical-rl", textOrientation: "mixed", fontSize: 11, color: TEXT_MUTED, letterSpacing: "0.02em", whiteSpace: "nowrap", userSelect: "none" }}>Donna est là</div>
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT, marginTop: 4 }} />
      </motion.div>
    )
  }

  if (!isOpen && isMobile) return null

  const panelStyle: React.CSSProperties = isMobile
    ? { position: "fixed", inset: 0, zIndex: 100, background: BG, display: "flex", flexDirection: "column" }
    : { width: 380, flexShrink: 0, borderLeft: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", background: BG, height: "100%" }

  return (
    <motion.div
      initial={isMobile ? { y: "100%" } : { width: 0, opacity: 0 }}
      animate={isMobile ? { y: 0 } : { width: 380, opacity: 1 }}
      exit={isMobile ? { y: "100%" } : { width: 0, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      style={panelStyle}
    >
      <div style={{ padding: isMobile ? "12px 16px" : "16px 20px", paddingTop: isMobile ? "max(12px, env(safe-area-inset-top))" : 16, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10, background: BG, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>D</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Donna</div>
          <div style={{ fontSize: 11, color: GREEN, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: GREEN, display: "inline-block" }} /> En ligne · Mode démo
          </div>
        </div>
        <button onClick={onToggle} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: TEXT_MUTED, flexShrink: 0 }}><X size={16} /></button>
      </div>
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
              <div style={{ background: ACCENT, borderRadius: "16px 16px 4px 16px", padding: "10px 14px", fontSize: 13, color: "#fff", lineHeight: 1.65, maxWidth: "85%", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>{msg.content}</div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>D</div>
            <div style={{ background: "#F9FAFB", borderRadius: "16px 16px 16px 4px", padding: "12px 16px", border: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} style={{ width: 6, height: 6, borderRadius: "50%", background: TEXT_MUTED }} />)}
              </div>
            </div>
          </div>
        )}
        {showSuggestions && messages.length === 1 && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                style={{ textAlign: "left", padding: "8px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#FAFAFA", fontSize: 12, color: TEXT_MUTED, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", lineHeight: 1.4 }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = ACCENT_BG; (e.target as HTMLElement).style.borderColor = "#BFDBFE"; (e.target as HTMLElement).style.color = ACCENT }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = "#FAFAFA"; (e.target as HTMLElement).style.borderColor = BORDER; (e.target as HTMLElement).style.color = TEXT_MUTED }}
              >{s}</button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "12px 16px", paddingBottom: isMobile ? "max(16px, env(safe-area-inset-bottom))" : 16, borderTop: `1px solid ${BORDER}`, background: BG, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${BORDER}`, background: "#FAFAFA" }}>
          <textarea ref={textareaRef} value={input} onChange={e => { setInput(e.target.value); autoResize() }} onKeyDown={handleKey}
            placeholder="Posez votre question à Donna..." rows={1}
            style={{ flex: 1, border: "none", background: "transparent", resize: "none", outline: "none", fontSize: 13, color: TEXT, lineHeight: 1.5, fontFamily: "inherit", minHeight: 20, maxHeight: 120 }}
          />
          <button onClick={() => send(input)} disabled={!input.trim() || loading}
            style={{ width: 32, height: 32, borderRadius: "50%", background: input.trim() && !loading ? ACCENT : "#E5E7EB", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() && !loading ? "pointer" : "default", flexShrink: 0 }}
          ><ArrowUp size={15} color={input.trim() && !loading ? "#fff" : TEXT_LIGHT} /></button>
        </div>
        <div style={{ fontSize: 10, color: TEXT_LIGHT, textAlign: "center", marginTop: 6 }}>Mode démo — données fictives à titre d'illustration</div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════
// ─── SCANNING ZONE (remplace le briefing pendant l'animation) ───
// ═══════════════════════════════════════════════════════

function ScanningZone({ mailCount, currentEmailSubject, isMobile }: {
  mailCount: number
  currentEmailSubject: string
  isMobile: boolean
}) {
  const pct = Math.round((mailCount / 89) * 100)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? "18px 16px" : "24px 28px", marginBottom: 24, background: BG }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
          {/* Spinner ring */}
          <svg width="44" height="44" style={{ position: "absolute", top: 0, left: 0 }}>
            <circle cx="22" cy="22" r="18" fill="none" stroke={BORDER} strokeWidth="3" />
            <motion.circle
              cx="22" cy="22" r="18"
              fill="none" stroke={ACCENT} strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 18}`}
              strokeDashoffset={`${2 * Math.PI * 18 * (1 - pct / 100)}`}
              transform="rotate(-90 22 22)"
              style={{ transition: "stroke-dashoffset 0.4s ease" }}
            />
          </svg>
          {/* D in center */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44 }}>
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}
            >D</motion.div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 2 }}>
            Donna analyse vos emails...
          </div>
          <div style={{ fontSize: 12, color: TEXT_MUTED }}>
            <span style={{ fontWeight: 600, color: ACCENT }}>{mailCount}</span> / 89 emails analysés
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: mailCount >= 89 ? GREEN : TEXT_MUTED }}>
          {pct}%
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: BORDER, borderRadius: 2, marginBottom: 14, overflow: "hidden" }}>
        <motion.div
          style={{ height: "100%", background: ACCENT, borderRadius: 2 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Current email subject */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentEmailSubject}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Mail size={13} color={TEXT_LIGHT} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: TEXT_MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {currentEmailSubject}
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════
// ─── SIDEBAR CONTENT (accepte visibleCount) ───
// ═══════════════════════════════════════════════════════

function SidebarContent({ onDossierClick, activeDossierId, visibleDossierCount }: {
  onDossierClick: (d: typeof DOSSIERS[0]) => void
  activeDossierId: string | null
  visibleDossierCount: number
}) {
  const visible = DOSSIERS.slice(0, visibleDossierCount)
  return (
    <>
      <div style={{ padding: "20px 16px 12px", borderBottom: `1px solid ${SIDEBAR_BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: TEXT }}>Donna</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: ACCENT_BG, color: ACCENT, letterSpacing: "0.05em" }}>DÉMO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
          <span style={{ fontSize: 11, color: TEXT_MUTED }}>
            {visibleDossierCount < DOSSIERS.length ? "Analyse en cours..." : "À jour · Dernière analyse il y a 2 min"}
          </span>
        </div>
      </div>
      <div style={{ padding: "12px 8px" }}>
        <button onClick={() => onDossierClick(null as any)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", borderRadius: 6, background: !activeDossierId ? "#F3F4F6" : "transparent", marginBottom: 2, width: "100%", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
          <LayoutDashboard size={15} style={{ color: !activeDossierId ? TEXT : TEXT_MUTED }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: !activeDossierId ? 600 : 400, color: !activeDossierId ? TEXT : TEXT_MUTED }}>Briefing</div>
            <div style={{ fontSize: 10, color: TEXT_MUTED }}>Votre journée en un coup d'œil</div>
          </div>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", borderRadius: 6, marginBottom: 2 }}>
          <Settings size={15} style={{ color: TEXT_MUTED }} />
          <div>
            <div style={{ fontSize: 13, color: TEXT_MUTED }}>Configurez-moi</div>
            <div style={{ fontSize: 10, color: TEXT_LIGHT }}>Personnalisez votre assistante</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "8px 16px", flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_LIGHT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          Dossiers {visibleDossierCount > 0 && `(${visibleDossierCount})`}
        </div>
        {visible.length === 0 && (
          <div style={{ fontSize: 12, color: TEXT_LIGHT, fontStyle: "italic", paddingLeft: 4 }}>Aucun dossier encore...</div>
        )}
        <AnimatePresence>
          {visible.map((d, i) => (
            <motion.div key={d.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => onDossierClick(d)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", marginBottom: 2, cursor: "pointer", borderRadius: 6, background: activeDossierId === d.id ? "#F3F4F6" : "transparent", transition: "background 0.15s" }}
              onMouseEnter={e => { if (activeDossierId !== d.id) e.currentTarget.style.background = "#F9FAFB" }}
              onMouseLeave={e => { if (activeDossierId !== d.id) e.currentTarget.style.background = "transparent" }}
            >
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: d.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{d.initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: activeDossierId === d.id ? 600 : 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                <div style={{ fontSize: 10, color: TEXT_MUTED }}>{d.type}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
        <Link to="/contact" style={{ fontSize: 12, color: ACCENT, fontWeight: 500, marginBottom: 6, display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
          <Mail size={12} /> Demander un essai gratuit
        </Link>
        <Link to="/" style={{ fontSize: 12, color: TEXT_MUTED, textDecoration: "none" }}>← Retour au site</Link>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════
// ─── MAIN PAGE ───
// ═══════════════════════════════════════════════════════

const DONNA_BRIEFING_TEXT = "Bonjour Alexandra, c'est Donna. J'ai trié vos 12 emails ce matin — 9 étaient du bruit (newsletters, prospection), je m'en suis occupée. Il vous reste 3 brouillons de réponse à valider, tout est prêt."
const DONNA_BRIEFING_SUBTITLE = "Votre to-do du jour est juste en dessous."

export default function DemoV3() {
  const isMobile = useIsMobile()
  const [chatOpen, setChatOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [treatedIds, setTreatedIds] = useState<Set<number>>(new Set())

  // Drawer state
  const [selectedTask, setSelectedTask] = useState<typeof TASKS[0] | null>(null)
  const [drawerMode, setDrawerMode] = useState<"view" | "draft">("view")

  // Dossier detail state
  const [selectedDossier, setSelectedDossier] = useState<typeof DOSSIERS[0] | null>(null)

  // ─── Animation state ───
  const [isScanning, setIsScanning] = useState(true)
  const [mailCount, setMailCount] = useState(0)
  const [currentEmailIdx, setCurrentEmailIdx] = useState(0)
  const [visibleDossierCount, setVisibleDossierCount] = useState(0)
  const [visibleTaskCount, setVisibleTaskCount] = useState(0)
  const [statsEmailCount, setStatsEmailCount] = useState(0)
  const [statsDossierCount, setStatsDossierCount] = useState(0)
  const [statsFilteredCount, setStatsFilteredCount] = useState(0)
  const [statsVisible, setStatsVisible] = useState(false)
  const [briefingText, setBriefingText] = useState("")
  const [briefingSubtitle, setBriefingSubtitle] = useState("")
  const [briefingDone, setBriefingDone] = useState(false)
  const [animDone, setAnimDone] = useState(false)

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const addTimer = useCallback((fn: () => void, delay: number) => {
    const t = setTimeout(fn, delay)
    timersRef.current.push(t)
    return t
  }, [])

  // ─── Skip to final state ───
  const skipToEnd = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = []
    setIsScanning(false)
    setMailCount(89)
    setCurrentEmailIdx(SIMULATED_EMAILS.length - 1)
    setVisibleDossierCount(DOSSIERS.length)
    setVisibleTaskCount(TASKS.length)
    setStatsVisible(true)
    setStatsEmailCount(12)
    setStatsDossierCount(6)
    setStatsFilteredCount(9)
    setBriefingText(DONNA_BRIEFING_TEXT)
    setBriefingSubtitle(DONNA_BRIEFING_SUBTITLE)
    setBriefingDone(true)
    setAnimDone(true)
  }, [])

  // ─── Animation sequence ───
  useEffect(() => {
    // 0-2s : Dashboard vide, spinner démarre
    // 2-12s : compteur monte 0→89, emails défilent
    const emailIntervalMs = 10000 / 40 // 10s pour ~40 emails

    // Start rotating email subjects every ~250ms
    let emailRotateInterval: ReturnType<typeof setInterval> | null = null

    addTimer(() => {
      // Start email rotation
      emailRotateInterval = setInterval(() => {
        setCurrentEmailIdx(i => (i + 1) % SIMULATED_EMAILS.length)
      }, 250)

      // Increment mail count: 0 → 89 over 10s
      const milestones = [5, 12, 18, 25, 32, 40, 47, 55, 62, 70, 76, 81, 85, 87, 89]
      milestones.forEach((target, i) => {
        addTimer(() => setMailCount(target), i * (10000 / milestones.length))
      })
    }, 2000)

    // Dossiers appear one by one starting at 5s
    const dossierTimings = [5000, 7000, 9000, 11000, 13000, 15000]
    dossierTimings.forEach((delay, i) => {
      addTimer(() => setVisibleDossierCount(i + 1), delay)
    })

    // Stats appear at 12s
    addTimer(() => {
      setStatsVisible(true)
      // Animate stats
      const intervals: ReturnType<typeof setInterval>[] = []
      let e = 0, d = 0, f = 0
      const emailInt = setInterval(() => {
        e++
        setStatsEmailCount(e)
        if (e >= 12) clearInterval(emailInt)
      }, 600)
      setTimeout(() => {
        const dossierInt = setInterval(() => {
          d++
          setStatsDossierCount(d)
          if (d >= 6) clearInterval(dossierInt)
        }, 700)
        setTimeout(() => {
          const filteredInt = setInterval(() => {
            f++
            setStatsFilteredCount(f)
            if (f >= 9) clearInterval(filteredInt)
          }, 600)
        }, 400)
      }, 200)
    }, 12000)

    // Spinner ends at 15s
    addTimer(() => {
      if (emailRotateInterval) clearInterval(emailRotateInterval)
      setIsScanning(false)
    }, 15000)

    // Tasks appear at 20s, 22s, 24s
    addTimer(() => setVisibleTaskCount(1), 20000)
    addTimer(() => setVisibleTaskCount(2), 22000)
    addTimer(() => setVisibleTaskCount(3), 24000)

    // Donna types briefing at 20s
    addTimer(() => {
      const fullText = DONNA_BRIEFING_TEXT
      let idx = 0
      const typeInterval = setInterval(() => {
        idx += 3
        setBriefingText(fullText.slice(0, idx))
        if (idx >= fullText.length) {
          clearInterval(typeInterval)
          setBriefingText(fullText)
          setBriefingSubtitle(DONNA_BRIEFING_SUBTITLE)
          setBriefingDone(true)
        }
      }, 30)
      timersRef.current.push(typeInterval as any)
    }, 20000)

    // All done at 30s
    addTimer(() => setAnimDone(true), 30000)

    return () => {
      timersRef.current.forEach(t => clearTimeout(t))
      if (emailRotateInterval) clearInterval(emailRotateInterval)
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

  const currentEmailSubject = SIMULATED_EMAILS[currentEmailIdx] || ""

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
            Landing <ChevronRight size={10} />
          </Link>
        </div>
      )}

      {/* Layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* Mobile sidebar overlay */}
        {isMobile && (
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 50 }}
                />
                <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  style={{ position: "fixed", top: 40, left: 0, bottom: 0, zIndex: 51, width: 260, background: SIDEBAR_BG, borderRight: `1px solid ${SIDEBAR_BORDER}`, display: "flex", flexDirection: "column", overflowY: "auto" }}
                >
                  <SidebarContent
                    onDossierClick={d => { setSelectedDossier(d); setSidebarOpen(false) }}
                    activeDossierId={selectedDossier?.id || null}
                    visibleDossierCount={visibleDossierCount}
                  />
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        )}

        {/* Desktop sidebar */}
        {!isMobile && (
          <aside style={{ width: 220, background: SIDEBAR_BG, borderRight: `1px solid ${SIDEBAR_BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
            <SidebarContent
              onDossierClick={d => setSelectedDossier(d)}
              activeDossierId={selectedDossier?.id || null}
              visibleDossierCount={visibleDossierCount}
            />
          </aside>
        )}

        {/* Main content */}
        {selectedDossier ? (
          <DossierDetailView dossier={selectedDossier} onClose={() => setSelectedDossier(null)} isMobile={isMobile} />
        ) : (
          <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? "20px 16px" : "32px 32px", position: "relative" }}>

            {/* Header: greeting + skip button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 24 : 30, fontWeight: 400, color: TEXT, marginBottom: 4, letterSpacing: "-0.02em" }}>Bonjour, Alexandra</h1>
                <p style={{ fontSize: 13, color: TEXT_MUTED }}>Je suis Donna, votre employée numérique · {getToday()}</p>
              </motion.div>

              {/* Bouton Passer — visible pendant l'animation */}
              <AnimatePresence>
                {!animDone && (
                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    onClick={skipToEnd}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "7px 14px", borderRadius: 8,
                      border: `1px solid ${BORDER}`, background: BG,
                      color: TEXT_MUTED, fontSize: 12, cursor: "pointer",
                      fontFamily: "inherit", flexShrink: 0, marginLeft: 16,
                      marginTop: 4,
                    }}
                  >
                    <SkipForward size={13} /> Passer
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Stats bar — apparaît progressivement */}
            <AnimatePresence>
              {statsVisible && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? "14px 16px" : "18px 22px", marginBottom: 16, display: "flex", alignItems: "center", gap: isMobile ? 12 : 20, flexWrap: "wrap" }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: isMobile ? 26 : 32, fontWeight: 700, color: TEXT, lineHeight: 1 }}>{treatedIds.size}</div>
                    <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>/3</div>
                  </div>
                  <div style={{ width: 1, height: 36, background: BORDER }} />
                  <div style={{ display: "flex", gap: isMobile ? 10 : 16, flex: 1, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: TEXT_MUTED }}>
                      <Mail size={13} /> {statsEmailCount > 0 ? `${statsEmailCount} reçus` : "–"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: TEXT_MUTED }}>
                      <LayoutDashboard size={13} /> {statsDossierCount > 0 ? `${statsDossierCount} dossiers` : "–"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: TEXT_MUTED }}>
                      <Settings size={13} /> {statsFilteredCount > 0 ? `${statsFilteredCount} filtrés` : "–"}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scanning zone OR briefing text */}
            <AnimatePresence mode="wait">
              {isScanning ? (
                <ScanningZone
                  key="scanning"
                  mailCount={mailCount}
                  currentEmailSubject={currentEmailSubject}
                  isMobile={isMobile}
                />
              ) : (
                <motion.div
                  key="briefing"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? "14px 16px" : "18px 22px", marginBottom: 24, minHeight: 80 }}
                >
                  {briefingText ? (
                    <AnimatePresence>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                        <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.7, marginBottom: briefingSubtitle ? 6 : 0 }}>
                          {briefingText}
                          {!briefingDone && (
                            <motion.span
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              style={{ display: "inline-block", width: 2, height: 14, background: ACCENT, marginLeft: 2, verticalAlign: "text-bottom" }}
                            />
                          )}
                        </p>
                        {briefingSubtitle && (
                          <p style={{ fontSize: 12, color: TEXT_MUTED, fontStyle: "italic" }}>{briefingSubtitle}</p>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <div style={{ display: "flex", gap: 5, alignItems: "center", height: 20 }}>
                      <span style={{ fontSize: 12, color: TEXT_MUTED, marginRight: 4 }}>Donna prépare votre briefing...</span>
                      {[0, 1, 2].map(i => <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} style={{ width: 5, height: 5, borderRadius: "50%", background: TEXT_MUTED }} />)}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* To-do list — tasks appear one by one */}
            <AnimatePresence>
              {visibleTaskCount > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.08em", textTransform: "uppercase" }}>TO-DO LIST</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: URGENT }}>
                      {TASKS.slice(0, visibleTaskCount).filter(t => t.urgent && !treatedIds.has(t.id)).length}
                    </span>
                  </div>

                  {TASKS.slice(0, visibleTaskCount).map((task, i) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      delay={0}
                      onView={() => handleView(task)}
                      onDraft={() => handleDraft(task)}
                      onTreat={() => handleTreat(task.id)}
                      treated={treatedIds.has(task.id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA — apparaît à la fin */}
            <AnimatePresence>
              {animDone && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ marginTop: 24, padding: isMobile ? "16px" : "18px 22px", borderRadius: 12, background: ACCENT_BG, border: `1px solid rgba(37,99,235,0.15)`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: isMobile ? 80 : 0 }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: ACCENT, marginBottom: 4 }}>Vous aimez ce que vous voyez ?</div>
                    <div style={{ fontSize: 13, color: TEXT_MUTED }}>Connectez votre vraie boîte mail — 14 jours gratuits, sans engagement.</div>
                  </div>
                  <Link to="/contact" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, background: ACCENT, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
                    Demander un essai gratuit <Send size={13} />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        )}

        {/* Chat panel */}
        <AnimatePresence mode="wait">
          <DonnaChatPanel key={chatOpen ? "open" : "closed"} isOpen={chatOpen} onToggle={() => setChatOpen(o => !o)} isMobile={isMobile} />
        </AnimatePresence>

        {/* Mobile floating bubble */}
        {isMobile && !chatOpen && (
          <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setChatOpen(true)}
            style={{ position: "fixed", bottom: 20, right: 20, zIndex: 40, width: 56, height: 56, borderRadius: "50%", background: ACCENT, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 20px rgba(37,99,235,0.35)" }}
          >
            <MessageCircle size={24} color="#fff" />
            <div style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: "#EF4444", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>1</div>
          </motion.button>
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
