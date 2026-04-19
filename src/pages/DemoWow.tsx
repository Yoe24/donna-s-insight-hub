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

// ─── Palette DemoWow — charte donna-legal.com ───
const BG = "#FFFFFF"
const SIDEBAR_BG = "#F9FAFB"
const SIDEBAR_BORDER = "#E5E5E5"
const TEXT = "#0D0D0D"
const TEXT_MUTED = "#737373"
const TEXT_LIGHT = "#A0A0A0"
const ACCENT = "#0D0D0D"
const ACCENT_BG = "#F5F5F5"
const URGENT = "#FF5555"
const URGENT_BG = "#FEF2F2"
const GREEN = "#10B981"
const BORDER = "#E5E5E5"
const INITIALS_BG = "#E5E5E5"
const INITIALS_TEXT = "#333"

// 6 couleurs uniques par dossier (pas par domaine), jamais deux pareilles côte à côte
const DOSSIER_COLORS: Record<string, string> = {
  "d1": "#2563EB",   // Jean-Pierre Martin — bleu
  "d2": "#9333EA",   // Marie Dupont — violet
  "d3": "#0891B2",   // Claire Dubois — teal
  "d4": "#E11D48",   // Famille Roux — rose
  "d5": "#D97706",   // Alice Bernard — ambre
  "d6": "#059669",   // Succession Martin — vert émeraude
}

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
  { id: "d1", initials: "JM", name: "Jean-Pierre Martin", type: "Droit du travail", color: "#2C3E6B",
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
      { date: "24 avril 2026", label: "Date limite dépôt conclusions", urgent: true },
    ],
  },
  { id: "d2", initials: "MD", name: "Marie Dupont", type: "Litige commercial", color: "#2C3E6B",
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
      { date: "23 avril 2026", label: "Date de forclusion — assignation référé-provision", urgent: true },
    ],
  },
  { id: "d3", initials: "CD", name: "Claire Dubois", type: "Litige immobilier", color: "#2C3E6B",
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
      { date: "30 avril 2026", label: "Médiation avec le syndic", urgent: false },
    ],
  },
  { id: "d4", initials: "FR", name: "Famille Roux", type: "Immobilier", color: "#2C3E6B",
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
  { id: "d5", initials: "AB", name: "Alice Bernard", type: "Droit de la famille", color: "#2C3E6B",
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
  { id: "d6", initials: "SM", name: "Succession Martin", type: "Droit successoral", color: "#2C3E6B",
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
    urgent: false,
    context: "Le greffe convoque les parties à une audience le 15 avril. Réponse attendue.",
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
    urgent: false,
    context: "Le client signale une situation urgente. Il demande une action rapide pour protéger ses droits.",
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
    context: "Le cabinet Moreau transmet les pièces complémentaires. Documents à vérifier.",
    desc: "Le cabinet Moreau transmet les pièces complémentaires demandées pour le dossier de succession Martin.",
    tags: [
      { name: "inventaire_notarial.pdf", type: "PDF", size: "1.2 Mo", resume: "Actif successoral estimé : 780 000€. Deux héritiers en parts égales." },
    ],
    status: "draft" as const,
    email_from: "Cabinet Moreau <contact@cabinet-moreau.fr>",
    email_to: "Me Alexandra Fernandez <a.fernandez@cabinet-fernandez.fr>",
    email_cc: "",
    email_date: "Hier, 16:22",
    resume: "Le Cabinet Moreau transmet les pièces pour la succession Martin. Actif estimé à 780 000€.",
    corps_original: "Chère Consœur,\n\nVeuillez trouver ci-joint les pièces complémentaires pour le dossier de succession Martin.\n\nConfraternellement,\nCabinet Moreau",
    draft: "Cher Confrère,\n\nJ'accuse bonne réception des pièces pour la succession Martin.\n\nJe procède à l'analyse et reviendrai vers vous sous 10 jours.\n\nConfraternellement,\n\nMe Alexandra Fernandez",
  },
]

// ─── Emails Inbox (dossiers + bruit) ───
const INBOX_EMAILS = [
  // Dossiers
  ...([
    { id: "e10", sender: "Jean-Pierre Martin", subject: "Documents demandés pour le dossier", date: getDaysAgo(2), resume: "M. Martin transmet ses 3 derniers bulletins de salaire et son contrat de travail comme demandé.", dossier: "Martin", isBruit: false },
    { id: "e11", sender: "Me Laurent (adverse)", subject: "Conclusions en défense", date: getDaysAgo(5), resume: "L'employeur maintient la qualification de faute grave. Argument : absences répétées non justifiées.", dossier: "Martin", isBruit: false },
    { id: "e12", sender: "Greffe CPH Paris", subject: "Convocation bureau de conciliation", date: getDaysAgo(8), resume: "Convocation pour le 22 avril à 9h30. Bureau de conciliation, section industrie.", dossier: "Martin", isBruit: false },
    { id: "e20", sender: "Marie Dupont", subject: "Re: Point sur le contentieux TechnoPlus", date: getDaysAgo(1), resume: "Mme Dupont confirme qu'aucun règlement n'est intervenu. Elle souhaite accélérer la procédure.", dossier: "Dupont", isBruit: false },
    { id: "e21", sender: "Me Garnier (TechnoPlus)", subject: "Demande de délai de paiement", date: getDaysAgo(3), resume: "L'avocat de TechnoPlus propose un échelonnement sur 6 mois.", dossier: "Dupont", isBruit: false },
    { id: "e30", sender: "Claire Dubois", subject: "Nouveaux travaux ce week-end", date: getDaysAgo(1), resume: "Mme Dubois signale que le voisin a repris les travaux malgré la médiation.", dossier: "Dubois", isBruit: false },
    { id: "e31", sender: "Syndic Foncia Neuilly", subject: "Re: Demande intervention travaux non autorisés", date: getDaysAgo(2), resume: "Le syndic confirme l'absence d'autorisation. Mise en demeure envoyée.", dossier: "Dubois", isBruit: false },
    { id: "e40", sender: "Famille Roux", subject: "Re: Offre de prêt reçue de la BNP", date: getDaysAgo(1), resume: "Les Roux ont reçu l'offre de prêt BNP : 388 000€ sur 25 ans à 3,2%.", dossier: "Roux", isBruit: false },
    { id: "e50", sender: "Alice Bernard", subject: "Re: Convention — OK pour la garde alternée", date: getDaysAgo(1), resume: "Mme Bernard accepte la garde alternée une semaine sur deux.", dossier: "Bernard", isBruit: false },
    { id: "e60", sender: "Cabinet Moreau", subject: "Pièces complémentaires succession Martin", date: getDaysAgo(2), resume: "Transmission de l'inventaire notarial préliminaire.", dossier: "Succession Martin", isBruit: false },
  ] as const),
  // Bruit
  { id: "b1", sender: "Lexbase Newsletter", subject: "Veille juridique de la semaine", date: getDaysAgo(0), resume: "Les dernières décisions de la Cour de cassation en droit du travail.", dossier: null, isBruit: true },
  { id: "b2", sender: "Ordre des Avocats Paris", subject: "Rappel : cotisation annuelle 2026", date: getDaysAgo(2), resume: "Votre cotisation est à régler avant le 30 avril.", dossier: null, isBruit: true },
  { id: "b3", sender: "LinkedIn", subject: "3 nouvelles notifications", date: getDaysAgo(1), resume: "Me Garnier a consulté votre profil.", dossier: null, isBruit: true },
  { id: "b4", sender: "Wolters Kluwer", subject: "Mise à jour Lamyline — droit immobilier", date: getDaysAgo(3), resume: "Nouvelles fiches pratiques disponibles.", dossier: null, isBruit: true },
  { id: "b5", sender: "CARPA Paris", subject: "Relevé de compte séquestre — mars 2026", date: getDaysAgo(4), resume: "Votre relevé mensuel est disponible.", dossier: null, isBruit: true },
  { id: "b6", sender: "CNB Formation", subject: "Webinaire IA et avocats — 22 avril", date: getDaysAgo(1), resume: "Inscription ouverte pour le webinaire sur l'IA dans la pratique juridique.", dossier: null, isBruit: true },
  { id: "b7", sender: "Gazette du Palais", subject: "Flash info — réforme procédure civile", date: getDaysAgo(0), resume: "Le décret du 3 avril modifie les délais de recours.", dossier: null, isBruit: true },
  { id: "b8", sender: "Docusign", subject: "Document signé — compromis Roux", date: getDaysAgo(5), resume: "Le compromis de vente a été signé électroniquement.", dossier: null, isBruit: true },
  { id: "b9", sender: "RPVA", subject: "Accusé réception conclusions Martin", date: getDaysAgo(3), resume: "Vos conclusions ont été reçues par le greffe.", dossier: null, isBruit: true },
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

// ─── Narration de Donna pour chaque dossier (Phase B) ───
// Chaque dossier = 5 lignes : résumé + échanges + PJ + échéances + conclusion
const DOSSIER_DONNA_LINES: string[][] = [
  [
    "J'ai trouvé un litige prud'homal avec M. Martin. Licenciement contesté pour faute grave.",
    "3 échanges entre vous, le greffe et l'avocat adverse. Je les classe par ordre chronologique.",
    "2 pièces jointes extraites, renommées et classées : contrat de travail et lettre de licenciement.",
    "Attention : audience de conciliation le 22 avril, et dépôt des conclusions le 15 avril.",
    "Dossier Martin traité.",
  ],
  [
    "Nouveau dossier. Marie Dupont a un contentieux commercial avec TechnoPlus SARL.",
    "2 échanges entre votre cliente et l'avocat adverse. Je trie la chronologie.",
    "1 pièce jointe extraite, renommée et classée : le récapitulatif des 3 factures impayées, 34 200 euros.",
    "Echéance urgente : assignation en référé-provision à préparer au plus vite.",
    "Dossier Dupont traité.",
  ],
  [
    "Un litige de voisinage pour Claire Dubois. Nuisances sonores et travaux non autorisés.",
    "2 échanges entre votre cliente et le syndic Foncia. Je les archive.",
    "1 pièce jointe extraite, renommée et classée : le constat d'huissier avec mesure des nuisances.",
    "Prochaine étape : médiation avec le syndic prévue le 15 avril.",
    "Dossier Dubois traité.",
  ],
  [
    "La famille Roux prépare une acquisition immobilière à 485 000 euros.",
    "1 échange avec vos clients. L'offre de prêt BNP vient d'arriver.",
    "1 pièce jointe extraite, renommée et classée : le compromis de vente.",
    "Echéance importante : signature chez le notaire prévue le 15 mai. Je surveille les délais.",
    "Dossier Roux traité.",
  ],
  [
    "Un dossier de divorce pour Alice Bernard. Consentement mutuel en cours.",
    "1 échange avec votre cliente. Elle accepte la garde alternée.",
    "1 pièce jointe extraite, renommée et classée : le projet de convention de divorce.",
    "Echéance : signature de la convention le 25 avril.",
    "Dossier Bernard traité.",
  ],
  [
    "Une succession de 780 000 euros à partager entre deux héritiers.",
    "1 échange avec le cabinet du notaire. Il manque encore des pièces.",
    "1 pièce jointe extraite, renommée et classée : l'inventaire notarial.",
    "Je prépare un brouillon de relance au notaire pour les documents manquants.",
    "Dossier Succession Martin traité.",
  ],
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

// ─── Utilitaire : parse "22 avril 2026" → Date JS ───
function parseFrenchDate(s: string): Date | null {
  const MONTHS: Record<string, number> = {
    "janvier": 0, "février": 1, "mars": 2, "avril": 3, "mai": 4, "juin": 5,
    "juillet": 6, "août": 7, "septembre": 8, "octobre": 9, "novembre": 10, "décembre": 11,
  }
  const parts = s.trim().split(" ")
  if (parts.length < 2) return null
  const day = parseInt(parts[0], 10)
  const month = MONTHS[parts[1]?.toLowerCase()]
  const year = parts[2] ? parseInt(parts[2], 10) : new Date().getFullYear()
  if (isNaN(day) || month === undefined) return null
  return new Date(year, month, day)
}

// ─── Utilitaire : jours restants avant une date ───
function daysUntil(d: Date): number {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

// ─── Urgency color selon jours restants ───
function urgencyColor(days: number): string {
  if (days < 0) return "#9CA3AF"   // passée — gris
  if (days < 7) return URGENT      // rouge
  if (days < 14) return "#D97706"  // orange
  return GREEN                      // vert
}

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
// ─── TYPING HOOK ───
// Retourne le texte en cours de frappe + si terminé
// ═══════════════════════════════════════════════════════
function useTypingText(targetText: string, active: boolean, charsPerSec = 35) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active) {
      setDisplayed("")
      setDone(false)
      return
    }
    setDisplayed("")
    setDone(false)
    let idx = 0
    const msPerChar = 1000 / charsPerSec
    intervalRef.current = setInterval(() => {
      idx += 1
      setDisplayed(targetText.slice(0, idx))
      if (idx >= targetText.length) {
        clearInterval(intervalRef.current!)
        setDone(true)
      }
    }, msPerChar)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [targetText, active, charsPerSec])

  return { displayed, done }
}

// ═══════════════════════════════════════════════════════
// ─── SUB-COMPONENTS ───
// ═══════════════════════════════════════════════════════

type TaskStatus = "sent" | "draft" | "pending"

// ─── Task Card — design DemoWow glassmorphism ───
function SlimTaskCard({ task, onExpand, expanded, onDraft, onTreat, treated }: {
  task: typeof TASKS[0]
  onExpand: () => void
  expanded: boolean
  onDraft: () => void
  onTreat: () => void
  treated: boolean
}) {
  const [hovered, setHovered] = useState(false)

  if (treated) {
    return (
      <motion.div
        initial={{ opacity: 1 }} animate={{ opacity: 0.42 }}
        transition={{ duration: 0.3 }}
        style={{ border: `1px solid ${BORDER}`, borderRadius: 16, padding: "14px 20px", marginBottom: 10, background: BG, display: "flex", alignItems: "center", gap: 10 }}
      >
        <button
          onClick={onTreat}
          title="Marquer comme non traité"
          style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${GREEN}`, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}
        >
          <Check size={10} color="#fff" />
        </button>
        <span style={{ fontSize: 14, color: TEXT_MUTED, textDecoration: "line-through", flex: 1 }}>{task.title}</span>
      </motion.div>
    )
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        marginBottom: 12,
        overflow: "hidden",
        background: BG,
        boxShadow: hovered
          ? "0 4px 12px rgba(0,0,0,0.06)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ padding: "16px 20px" }}>
        {/* Ligne 1 : checkbox + titre */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {/* Checkbox discret */}
          <button
            onClick={e => { e.stopPropagation(); onTreat() }}
            title="Marquer comme traité"
            style={{ width: 17, height: 17, borderRadius: "50%", border: `1.5px solid ${BORDER}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: 2, padding: 0, transition: "border-color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = TEXT_MUTED)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER)}
          />
          {/* Dossier + titre + contexte cliquables pour expand */}
          <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={onExpand}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Dossier {task.dossier}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, lineHeight: 1.35, marginBottom: 4 }}>{task.title}</div>
            {/* Phrase contextuelle actionnable */}
            {(task as any).context && (
              <div style={{ fontSize: 12, color: TEXT_MUTED, lineHeight: 1.5 }}>{(task as any).context}</div>
            )}
          </div>
        </div>
        {/* Ligne 2 : bouton Réponse générée par Donna — toujours visible sur toutes les tâches */}
        <div style={{ marginTop: 12, marginLeft: 27 }}>
          <button
            onClick={e => { e.stopPropagation(); onDraft() }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.9" }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1" }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 24px", borderRadius: 8, border: "none", background: "#0D0D0D", color: "#FFFFFF", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, transition: "opacity 0.2s" }}
          >
            <Edit3 size={13} /> Réponse générée par Donna
          </button>
        </div>
      </div>
      {/* Expand : vue détaillée style DemoV2 */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "14px 20px 18px 20px", borderTop: `1px solid ${BORDER}` }}>
              {/* En-tête email */}
              <div style={{ background: SIDEBAR_BG, borderRadius: 8, padding: "12px 14px", marginBottom: 14, fontSize: 12, lineHeight: 1.8, border: `1px solid ${BORDER}` }}>
                <div><span style={{ color: TEXT_LIGHT, display: "inline-block", minWidth: 36 }}>De</span> <span style={{ fontWeight: 600, color: TEXT }}>{task.email_from}</span></div>
                <div><span style={{ color: TEXT_LIGHT, display: "inline-block", minWidth: 36 }}>À</span> <span style={{ color: TEXT }}>{task.email_to}</span></div>
                {task.email_cc && <div><span style={{ color: TEXT_LIGHT, display: "inline-block", minWidth: 36 }}>Cc</span> <span style={{ color: TEXT }}>{task.email_cc}</span></div>}
                <div><span style={{ color: TEXT_LIGHT, display: "inline-block", minWidth: 36 }}>Date</span> <span style={{ color: TEXT }}>{task.email_date}</span></div>
              </div>
              {/* Section Résumé Donna */}
              <div style={{ background: ACCENT_BG, borderRadius: 8, padding: "12px 14px", marginBottom: 14, border: `1px solid rgba(37,99,235,0.12)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>D</div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: ACCENT }}>Résumé Donna</span>
                </div>
                <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.65, margin: 0 }}>{task.resume}</p>
              </div>
              {/* Lien email original */}
              <button
                onClick={e => { e.stopPropagation(); onDraft() }}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: ACCENT, fontFamily: "inherit", marginBottom: 12, textDecoration: "underline", padding: 0 }}
              >
                <Mail size={12} /> Voir l'email original
              </button>
              {/* Pièces jointes */}
              {task.tags.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Pièces jointes</div>
                  {task.tags.map(tag => (
                    <div key={tag.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 7, border: `1px solid ${BORDER}`, background: BG, marginBottom: 5 }}>
                      <FileText size={15} color={ACCENT} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tag.name}</div>
                        <div style={{ fontSize: 10, color: TEXT_LIGHT }}>{tag.type} · {tag.size}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Bouton Générer une réponse */}
              <button
                onClick={e => { e.stopPropagation(); onDraft() }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.9" }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1" }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", padding: "10px 24px", borderRadius: 8, background: "#0D0D0D", color: "#FFFFFF", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.2s" }}
              >
                <Edit3 size={14} /> Générer une réponse
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Email Drawer — style DemoV2 ───
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
      style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: isMobile ? "100%" : "min(680px, 55vw)", background: BG, zIndex: 80, display: "flex", flexDirection: "column", boxShadow: "-4px 0 30px rgba(0,0,0,0.08)", borderLeft: `1px solid ${BORDER}` }}
    >
      {/* Header avec onglets Voir / Brouillon */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: TEXT_MUTED, fontFamily: "inherit" }}>
          <ArrowLeft size={16} /> Retour
        </button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <button
            onClick={() => setActiveMode("view")}
            style={{ padding: "5px 13px", borderRadius: 6, border: `1px solid ${activeMode === "view" ? ACCENT : BORDER}`, background: activeMode === "view" ? ACCENT_BG : BG, color: activeMode === "view" ? ACCENT : TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}
          >
            <Eye size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Voir
          </button>
          <button
            onClick={handleGenerateDraft}
            style={{ padding: "5px 13px", borderRadius: 6, border: `1px solid ${activeMode === "draft" ? ACCENT : BORDER}`, background: activeMode === "draft" ? ACCENT_BG : BG, color: activeMode === "draft" ? ACCENT : TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}
          >
            <Edit3 size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Brouillon
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px" }}>
        {activeMode === "view" ? (
          <>
            {/* Titre email */}
            <h2 style={{ fontSize: 19, fontWeight: 600, color: TEXT, marginBottom: 16, lineHeight: 1.3 }}>{task.title}</h2>

            {/* Métadonnées email */}
            <div style={{ background: SIDEBAR_BG, borderRadius: 10, padding: "14px 16px", marginBottom: 20, fontSize: 12, lineHeight: 1.9, border: `1px solid ${BORDER}` }}>
              <div><span style={{ color: TEXT_LIGHT, width: 36, display: "inline-block" }}>De</span> <span style={{ fontWeight: 500, color: TEXT }}>{task.email_from}</span></div>
              <div><span style={{ color: TEXT_LIGHT, width: 36, display: "inline-block" }}>À</span> <span style={{ color: TEXT }}>{task.email_to}</span></div>
              {task.email_cc && <div><span style={{ color: TEXT_LIGHT, width: 36, display: "inline-block" }}>Cc</span> <span style={{ color: TEXT }}>{task.email_cc}</span></div>}
              <div><span style={{ color: TEXT_LIGHT, width: 36, display: "inline-block" }}>Date</span> <span style={{ color: TEXT }}>{task.email_date}</span></div>
            </div>

            {/* Résumé Donna */}
            <div style={{ background: ACCENT_BG, borderRadius: 10, padding: "16px 18px", marginBottom: 20, border: `1px solid rgba(37,99,235,0.12)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>D</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: ACCENT }}>Résumé Donna</span>
              </div>
              <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.7, margin: 0 }}>{task.resume}</p>
            </div>

            {/* Lien email original */}
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => setShowOriginal(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: ACCENT, fontFamily: "inherit", marginBottom: 8, textDecoration: "underline", padding: 0 }}>
                <Mail size={13} /> {showOriginal ? "Masquer l'email original" : "Voir l'email original"}
                <ChevronRight size={12} style={{ transform: showOriginal ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              <AnimatePresence>
                {showOriginal && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                    <div style={{ background: SIDEBAR_BG, borderRadius: 8, padding: "14px 16px", border: `1px solid ${BORDER}`, fontSize: 13, color: TEXT, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                      {task.corps_original}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pièces jointes */}
            {task.tags.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Pièces jointes</div>
                {task.tags.map(tag => (
                  <button key={tag.name} onClick={() => setSelectedAttachment(tag)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, marginBottom: 6, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = SIDEBAR_BG)}
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

            {/* Bouton Générer une réponse */}
            <button
              onClick={handleGenerateDraft}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.9" }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1" }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 24px", borderRadius: 8, background: "#0D0D0D", color: "#FFFFFF", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.2s" }}
            >
              <Edit3 size={15} /> Générer une réponse
            </button>
          </>
        ) : (
          /* VUE BROUILLON — style DemoV2 */
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Brouillon de réponse</h2>
            <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 16 }}>Re: {task.title}</p>

            {draftLoading ? (
              <div style={{ background: SIDEBAR_BG, borderRadius: 10, padding: 20, border: `1px solid ${BORDER}` }}>
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
                {/* Textarea éditable style lettre */}
                <textarea
                  value={draftText}
                  onChange={e => setDraftText(e.target.value)}
                  style={{ width: "100%", minHeight: 300, padding: "18px 20px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#FAFAFA", fontSize: 13, color: TEXT, lineHeight: 1.75, fontFamily: "Georgia, serif", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => (e.target.style.borderColor = ACCENT)}
                  onBlur={e => (e.target.style.borderColor = BORDER)}
                />

                {/* Bouton Copier */}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={handleCopy} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, background: "#111827", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    {copied ? <><Check size={14} /> Copié !</> : <><Copy size={14} /> Copier</>}
                  </button>
                </div>

                {/* Feedback — "Ce brouillon vous convient ?" */}
                <div style={{ marginTop: 20, padding: "16px 18px", borderRadius: 10, background: SIDEBAR_BG, border: `1px solid ${BORDER}` }}>
                  {feedback ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: GREEN }}>
                      <CheckCircle2 size={16} /> Merci ! Donna apprend de vos retours.
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 10, fontWeight: 500 }}>Ce brouillon vous convient ?</p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[
                          { key: "parfait", icon: ThumbsUp, label: "Parfait", color: GREEN },
                          { key: "modifier", icon: Pencil, label: "Quelques modifications", color: "#D97706" },
                          { key: "erreur", icon: XCircle, label: "Erreurs", color: URGENT },
                        ].map(fb => (
                          <button key={fb.key} onClick={() => setFeedback(fb.key)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 7, border: `1px solid ${BORDER}`, background: BG, color: TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                            onMouseEnter={e => { (e.currentTarget.style.borderColor = fb.color); (e.currentTarget.style.color = fb.color); (e.currentTarget.style.background = `${fb.color}08`) }}
                            onMouseLeave={e => { (e.currentTarget.style.borderColor = BORDER); (e.currentTarget.style.color = TEXT_MUTED); (e.currentTarget.style.background = BG) }}
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

      {/* Modal pièce jointe */}
      <AnimatePresence>
        {selectedAttachment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setSelectedAttachment(null)}
          >
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: BG, borderRadius: 12, width: "100%", maxWidth: 700, maxHeight: "80vh", display: "flex", flexDirection: isMobile ? "column" : "row", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            >
              <div style={{ flex: 1, background: SIDEBAR_BG, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, padding: 24 }}>
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
  const statusColors = { actif: GREEN, en_attente: TEXT_MUTED, "archivé": TEXT_LIGHT }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "20px 16px" : "32px 40px" }}>
      <div style={{ marginBottom: 24 }}>
        <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: TEXT_MUTED, fontFamily: "inherit", marginBottom: 16 }}>
          <ArrowLeft size={16} /> Retour au tableau de bord
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: INITIALS_BG, display: "flex", alignItems: "center", justifyContent: "center", color: INITIALS_TEXT, fontSize: 14, fontWeight: 700 }}>{dossier.initials}</div>
          <div>
            <h1 style={{ fontSize: isMobile ? 21 : 25, fontWeight: 600, color: TEXT, margin: 0, lineHeight: 1.2 }}>{dossier.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: SIDEBAR_BG, color: TEXT_MUTED, border: `1px solid ${BORDER}`, fontWeight: 500 }}>{dossier.status === "actif" ? "Actif" : dossier.status === "en_attente" ? "En attente" : "Archivé"}</span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: SIDEBAR_BG, color: TEXT_MUTED, border: `1px solid ${BORDER}` }}>{dossier.domain}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: ACCENT_BG, borderRadius: 8, padding: "16px 18px", marginBottom: 24, border: `1px solid rgba(44,62,107,0.12)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: TEXT, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>D</div>
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
              onMouseEnter={e => (e.currentTarget.style.background = SIDEBAR_BG)}
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
              onMouseEnter={e => (e.currentTarget.style.background = SIDEBAR_BG)}
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
              <div key={i} style={{ padding: "10px 16px", borderRadius: 8, border: `1px solid ${dl.urgent ? "rgba(192,57,43,0.25)" : BORDER}`, background: dl.urgent ? URGENT_BG : SIDEBAR_BG, flex: "1 1 200px", minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <Clock size={12} color={dl.urgent ? URGENT : TEXT_MUTED} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: dl.urgent ? URGENT : TEXT }}>{dl.date}</span>
                  {dl.urgent && <span style={{ fontSize: 9, fontWeight: 700, color: URGENT, background: "rgba(192,57,43,0.1)", padding: "1px 5px", borderRadius: 3, letterSpacing: "0.05em" }}>URGENT</span>}
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
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
              onClick={e => e.stopPropagation()}
              style={{ background: BG, borderRadius: 12, width: "100%", maxWidth: 700, maxHeight: "80vh", display: "flex", flexDirection: isMobile ? "column" : "row", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            >
              <div style={{ flex: 1, background: SIDEBAR_BG, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, padding: 24 }}>
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
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: TEXT, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>D</div>
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
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setSelectedEmail(null)}
          >
            <motion.div initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}
              onClick={e => e.stopPropagation()}
              style={{ background: BG, borderRadius: 12, width: "100%", maxWidth: 640, maxHeight: "80vh", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column" }}
            >
              <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>{selectedEmail.subject}</div>
                  <button onClick={() => setSelectedEmail(null)} style={{ background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED, padding: 4 }}><X size={18} /></button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: INITIALS_BG, display: "flex", alignItems: "center", justifyContent: "center", color: INITIALS_TEXT, fontSize: 13, fontWeight: 700 }}>
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
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: TEXT, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>D</div>
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
  th: ({ children }: any) => <th style={{ padding: "4px 8px", border: `1px solid ${BORDER}`, background: SIDEBAR_BG, fontSize: 11, fontWeight: 600 }}>{children}</th>,
  td: ({ children }: any) => <td style={{ padding: "4px 8px", border: `1px solid ${BORDER}` }}>{children}</td>,
  hr: () => <hr style={{ border: "none", borderTop: `1px solid ${BORDER}`, margin: "8px 0" }} />,
  code: ({ children }: any) => <code style={{ background: SIDEBAR_BG, padding: "1px 4px", borderRadius: 3, fontSize: 12 }}>{children}</code>,
}

// ─── DonnaVoice: affiche les lignes de Donna en séquence avec effet typing ───
function DonnaVoice({ lines, active, onAllDone }: {
  lines: string[]
  active: boolean
  onAllDone?: () => void
}) {
  const [lineIdx, setLineIdx] = useState(0)
  const [typedLines, setTypedLines] = useState<string[]>([])
  const [currentTyped, setCurrentTyped] = useState("")
  const [allDone, setAllDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!active) {
      setLineIdx(0)
      setTypedLines([])
      setCurrentTyped("")
      setAllDone(false)
      return
    }
    // Start typing the current line
    let charIdx = 0
    const line = lines[0] || ""
    setCurrentTyped("")
    setTypedLines([])
    setLineIdx(0)

    function typeLine(lIdx: number) {
      const target = lines[lIdx]
      if (!target) {
        setAllDone(true)
        onAllDone?.()
        return
      }
      let ci = 0
      setCurrentTyped("")
      intervalRef.current = setInterval(() => {
        ci += 1
        setCurrentTyped(target.slice(0, ci))
        if (ci >= target.length) {
          clearInterval(intervalRef.current!)
          // After 1.4s pause, move to next line
          timeoutRef.current = setTimeout(() => {
            setTypedLines(prev => [...prev, target])
            setCurrentTyped("")
            setLineIdx(lIdx + 1)
            typeLine(lIdx + 1)
          }, 1400)
        }
      }, 1000 / 35) // ~35 chars/sec
    }

    typeLine(0)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [active, lines.join("|")])

  if (!active) return null

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {typedLines.map((line, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6 }}
        >
          {line}
        </motion.div>
      ))}
      {currentTyped && (
        <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.6 }}>
          {currentTyped}
          <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.65, repeat: Infinity }}
            style={{ display: "inline-block", width: 2, height: 13, background: ACCENT, marginLeft: 2, verticalAlign: "text-bottom" }} />
        </div>
      )}
    </div>
  )
}

// ─── Cercle de scan unifié (réutilisé Phase A, B, C) ───
function ScanCircle({ size, count, total, isFiltering, isFinal }: {
  size: number
  count: number
  total: number
  isFiltering?: boolean
  isFinal?: boolean
}) {
  const r = (size / 2) * 0.9 - 5
  const circumference = 2 * Math.PI * r
  const progress = isFinal ? 1 : Math.min(1, count / total)
  const dashOffset = circumference * (1 - progress)
  const cx = size / 2
  const cy = size / 2
  const displayCount = count

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      {/* Fond violet plein avec glow */}
      <div className="donna-scan-circle" style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        background: "#111111",
        boxShadow: "0 0 20px rgba(17,17,17,0.3), 0 0 60px rgba(17,17,17,0.1)",
      }} />
      {/* Anneau de progression SVG par-dessus */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", top: 0, left: 0 }}>
        {/* Anneau de fond semi-transparent */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={size >= 100 ? 6 : 4} />
        {/* Anneau de progression blanc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={size >= 100 ? 6 : 4}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${dashOffset}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: isFiltering ? "stroke-dashoffset 0.8s ease" : "stroke-dashoffset 0.35s ease" }}
        />
      </svg>
      {/* Texte centré */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        {isFiltering ? (
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.7, repeat: Infinity }}
            style={{ fontSize: size >= 100 ? 22 : 16, fontWeight: 700, color: "#fff", lineHeight: 1 }}
          >
            {displayCount}
          </motion.span>
        ) : (
          <span style={{ fontSize: size >= 100 ? (size >= 115 ? 28 : 22) : 16, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
            {displayCount}
          </span>
        )}
        {size >= 100 && (
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.72)", marginTop: 3, letterSpacing: "0.03em" }}>
            {isFinal ? "emails" : "emails lus"}
          </span>
        )}
      </div>
    </motion.div>
  )
}

// ─── Cinematic Phase A: email scanning ───
function PhaseAScanZone({ mailCount, currentEmailSubject, isMobile, donnaLines, donnaActive, isFiltering }: {
  mailCount: number; currentEmailSubject: string; isMobile: boolean
  donnaLines: string[]; donnaActive: boolean; isFiltering: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      style={{ border: `1px solid ${BORDER}`, borderRadius: 16, padding: isMobile ? "20px 16px" : "28px 32px", background: BG, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {/* Grand cercle centré */}
      <ScanCircle size={120} count={mailCount} total={89} isFiltering={isFiltering} isFinal={false} />

      {/* Texte sous le cercle */}
      <div style={{ marginTop: 16, textAlign: "center" }}>
        {isFiltering ? (
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ fontSize: 13, color: ACCENT, fontWeight: 600, margin: "0 0 8px" }}
          >
            Donna filtre le bruit...
          </motion.p>
        ) : (
          <p style={{ fontSize: 13, color: TEXT_MUTED, margin: "0 0 8px" }}>Analyse de vos emails...</p>
        )}
      </div>

      {/* Sujet de mail défilant */}
      {!isFiltering && (
        <AnimatePresence mode="wait">
          <motion.div key={currentEmailSubject} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.2 }}
            style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}
          >
            <Mail size={11} color={TEXT_LIGHT} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: TEXT_MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: isMobile ? 260 : 400 }}>{currentEmailSubject}</span>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Donna voice */}
      {donnaActive && (
        <div style={{ marginTop: 12, borderTop: `1px solid ${BORDER}`, paddingTop: 14, width: "100%", maxWidth: 480 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: TEXT, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>D</div>
            <DonnaVoice lines={donnaLines} active={donnaActive} />
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─── Cinematic Phase B: dossier being processed (main area) ───
function PhaseBDossierFocus({ dossier, donnaLines, donnaActive, showCheck, dossierIdx }: {
  dossier: typeof DOSSIERS[0]
  donnaLines: string[]
  donnaActive: boolean
  showCheck: boolean
  dossierIdx: number
}) {
  // Track internal progression: how many emails/docs/deadlines are visible
  // Timeline over 9s: header 0-0.5s, emails 0.5-3s, docs 3-4.5s, deadlines 4.5-6s, check 6-7s
  const [visibleEmails, setVisibleEmails] = useState(0)
  const [visibleDocs, setVisibleDocs] = useState(0)
  const [visibleDeadlines, setVisibleDeadlines] = useState(0)
  const [showEmailSection, setShowEmailSection] = useState(false)
  const [showDocSection, setShowDocSection] = useState(false)
  const [showDeadlineSection, setShowDeadlineSection] = useState(false)

  const internalTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Reset and re-run when dossier changes
  useEffect(() => {
    // Clear previous timers
    internalTimersRef.current.forEach(t => clearTimeout(t))
    internalTimersRef.current = []

    // Reset state
    setVisibleEmails(0)
    setVisibleDocs(0)
    setVisibleDeadlines(0)
    setShowEmailSection(false)
    setShowDocSection(false)
    setShowDeadlineSection(false)

    if (!donnaActive) return

    const add = (fn: () => void, delay: number) => {
      const t = setTimeout(fn, delay)
      internalTimersRef.current.push(t)
    }

    // 0.5s: show ÉCHANGES section
    add(() => setShowEmailSection(true), 500)

    // Emails appear one by one starting at 0.7s, 1.2s apart each
    dossier.emails.forEach((_, i) => {
      add(() => setVisibleEmails(i + 1), 700 + i * 800)
    })

    // 3s: show PIÈCES JOINTES section
    add(() => setShowDocSection(true), 3000)

    // Docs appear starting at 3.2s
    dossier.documents.forEach((_, i) => {
      add(() => setVisibleDocs(i + 1), 3200 + i * 700)
    })

    // 4.5s: show ÉCHÉANCES section
    add(() => setShowDeadlineSection(true), 4500)

    // Deadlines appear starting at 4.7s
    dossier.deadlines.forEach((_, i) => {
      add(() => setVisibleDeadlines(i + 1), 4700 + i * 650)
    })

    return () => {
      internalTimersRef.current.forEach(t => clearTimeout(t))
    }
  }, [dossier.id, donnaActive])

  const dossierColor = DOSSIER_COLORS[dossier.id] || INITIALS_BG

  return (
    <motion.div
      key={dossier.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      style={{ border: `1px solid ${BORDER}`, borderRadius: 16, padding: "22px 26px", background: BG, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      {/* Header: scan circle + dossier identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <ScanCircle size={60} count={89} total={89} isFiltering={false} isFinal={true} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: TEXT_LIGHT, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Dossier {dossierIdx + 1} / {DOSSIERS.length}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: dossierColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
              {dossier.initials}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{dossier.name}</div>
              <div style={{ fontSize: 12, color: TEXT_MUTED }}>{dossier.type}</div>
            </div>
            <AnimatePresence>
              {showCheck && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <CheckCircle2 size={18} color="#059669" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#059669" }}>Dossier traité</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* LIVE FILL: Échanges */}
      <AnimatePresence>
        {showEmailSection && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ marginBottom: 16 }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <Mail size={10} />
              Échanges
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <AnimatePresence>
                {dossier.emails.slice(0, visibleEmails).map((email, i) => (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: SIDEBAR_BG,
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    {/* Initiale expéditeur */}
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: INITIALS_BG,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: INITIALS_TEXT, flexShrink: 0,
                    }}>
                      {email.sender.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {email.sender}
                      </div>
                      <div style={{ fontSize: 11, color: TEXT_MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {email.subject}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: TEXT_LIGHT, flexShrink: 0 }}>{email.date}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIVE FILL: Pièces jointes */}
      <AnimatePresence>
        {showDocSection && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ marginBottom: 16 }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <Paperclip size={10} />
              Pièces jointes
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <AnimatePresence>
                {dossier.documents.slice(0, visibleDocs).map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: SIDEBAR_BG,
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <FileText size={14} color={ACCENT} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: 10, color: TEXT_LIGHT }}>{doc.type} · {doc.size}</div>
                    </div>
                    {/* Download progress indicator — fast fade-in bar */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: 32 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      style={{ height: 3, background: "rgba(0,0,0,0.12)", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}
                    >
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        style={{ height: "100%", background: ACCENT, borderRadius: 2 }}
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIVE FILL: Échéances */}
      <AnimatePresence>
        {showDeadlineSection && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ marginBottom: 16 }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <Calendar size={10} />
              Échéances
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <AnimatePresence>
                {dossier.deadlines.slice(0, visibleDeadlines).map((dl, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 22 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: dl.urgent ? URGENT_BG : SIDEBAR_BG,
                      border: `1px solid ${dl.urgent ? "rgba(255,85,85,0.25)" : BORDER}`,
                    }}
                  >
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{dl.urgent ? "⚠️" : "📅"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: dl.urgent ? URGENT : TEXT }}>
                        {dl.date}
                      </div>
                      <div style={{ fontSize: 11, color: TEXT_MUTED }}>{dl.label}</div>
                    </div>
                    {dl.urgent && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: URGENT, background: URGENT_BG, padding: "2px 6px", borderRadius: 3, letterSpacing: "0.05em", flexShrink: 0 }}>URGENT</span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Donna voice — commentary below the live fill */}
      {donnaActive && (
        <div style={{ marginTop: 12, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: TEXT, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>D</div>
            <DonnaVoice lines={donnaLines} active={donnaActive} />
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─── Cinematic Phase C: briefing being typed ───
function PhaseCBriefing({ lines, active, isMobile, onAllDone }: {
  lines: string[]; active: boolean; isMobile: boolean; onAllDone?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      style={{ border: `1px solid ${BORDER}`, borderRadius: 16, padding: isMobile ? "16px" : "22px 26px", background: BG, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: TEXT, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>D</div>
        <div style={{ flex: 1 }}>
          <DonnaVoice lines={lines} active={active} onAllDone={onAllDone} />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Calendrier style Google Calendar — grille mensuelle complète ───
function MiniCalendar({ deadlineItems }: {
  deadlineItems: { date: Date; label: string; dossierName: string; dossierColor: string; urgent: boolean }[]
}) {
  const [calMonth, setCalMonth] = useState(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), 1)
  })
  const [tooltip, setTooltip] = useState<{ key: string; x: number; y: number } | null>(null)

  const year = calMonth.getFullYear()
  const month = calMonth.getMonth()

  const MONTH_NAMES_FULL = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
  const MONTH_NAMES_SHORT = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
  const DAY_NAMES = ["L", "M", "M", "J", "V", "S", "D"]

  const today = new Date()
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth()
  const todayDate = today.getDate()

  // Build deadline map: key → items
  const dlMap: Record<string, typeof deadlineItems> = {}
  deadlineItems.forEach(item => {
    const key = `${item.date.getFullYear()}-${item.date.getMonth()}-${item.date.getDate()}`
    if (!dlMap[key]) dlMap[key] = []
    dlMap[key].push(item)
  })

  // Build full 6-row grid (42 cells)
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7 // 0=lundi
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  type Cell = { day: number; currentMonth: boolean; dateObj: Date }
  const cells: Cell[] = []

  // Days from previous month
  for (let i = 0; i < firstDow; i++) {
    const d = daysInPrevMonth - firstDow + 1 + i
    cells.push({ day: d, currentMonth: false, dateObj: new Date(year, month - 1, d) })
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, dateObj: new Date(year, month, d) })
  }
  // Next month days to fill 42 cells
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, currentMonth: false, dateObj: new Date(year, month + 1, d) })
  }

  // Month pill bar: current month ± 5 months
  const pillMonths = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(todayYear, todayMonth + i - 2, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const isCurrentMonth = year === calMonth.getFullYear() && month === calMonth.getMonth()

  return (
    <div style={{ background: BG, border: `1px solid ${BORDER}` }}>
      {/* En-tête : mois + année + flèches */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px 10px",
        borderBottom: `1px solid #eee`,
      }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>
          {MONTH_NAMES_FULL[month]} {year}
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          <button
            onClick={() => setCalMonth(new Date(year, month - 1, 1))}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 7px", borderRadius: 5, color: TEXT_MUTED, display: "flex", alignItems: "center", transition: "background 0.12s" }}
            onMouseEnter={e => (e.currentTarget.style.background = SIDEBAR_BG)}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
            aria-label="Mois précédent"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button
            onClick={() => setCalMonth(new Date(year, month + 1, 1))}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 7px", borderRadius: 5, color: TEXT_MUTED, display: "flex", alignItems: "center", transition: "background 0.12s" }}
            onMouseEnter={e => (e.currentTarget.style.background = SIDEBAR_BG)}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
            aria-label="Mois suivant"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      {/* Barre de mois scrollable */}
      <div style={{
        display: "flex", gap: 6, overflowX: "auto", padding: "10px 16px",
        borderBottom: `1px solid #eee`,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>
        {pillMonths.map((pm, i) => {
          const isActive = pm.year === year && pm.month === month
          return (
            <button
              key={i}
              onClick={() => setCalMonth(new Date(pm.year, pm.month, 1))}
              style={{
                flexShrink: 0,
                padding: "4px 11px",
                borderRadius: 20,
                border: isActive ? `1.5px solid ${ACCENT}` : `1px solid ${BORDER}`,
                background: isActive ? ACCENT : "transparent",
                color: isActive ? "#fff" : TEXT_MUTED,
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
                whiteSpace: "nowrap" as const,
              }}
            >
              {MONTH_NAMES_SHORT[pm.month]}
            </button>
          )
        })}
      </div>

      {/* En-têtes jours de semaine */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
        borderBottom: `1px solid #eee`,
      }}>
        {DAY_NAMES.map((d, i) => (
          <div key={i} style={{
            textAlign: "center",
            fontSize: 11,
            fontWeight: 500,
            color: TEXT_LIGHT,
            padding: "6px 0",
            letterSpacing: "0.04em",
          }}>{d}</div>
        ))}
      </div>

      {/* Grille 6x7 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {cells.map((cell, i) => {
          const key = `${cell.dateObj.getFullYear()}-${cell.dateObj.getMonth()}-${cell.dateObj.getDate()}`
          const events = cell.currentMonth ? (dlMap[key] || []) : []
          const isTodayCell = cell.currentMonth &&
            cell.day === todayDate &&
            month === todayMonth &&
            year === todayYear
          const hasEvents = events.length > 0
          const hasUrgent = events.some(e => e.urgent)
          const isTooltipVisible = tooltip?.key === key

          // Border: right except last column, bottom except last row
          const col = i % 7
          const row = Math.floor(i / 7)
          const borderRight = col < 6 ? `1px solid #eee` : "none"
          const borderBottom = row < 5 ? `1px solid #eee` : "none"

          return (
            <div
              key={i}
              style={{
                position: "relative",
                borderRight,
                borderBottom,
                minHeight: 72,
                padding: "5px 5px 4px",
                background: isTooltipVisible ? "#fafafa" : BG,
                cursor: hasEvents ? "pointer" : "default",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => {
                if (hasEvents) {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                  setTooltip({ key, x: rect.left, y: rect.top })
                }
              }}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => hasEvents && setTooltip(isTooltipVisible ? null : { key, x: 0, y: 0 })}
            >
              {/* Numéro du jour — aligné en haut à droite */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 3 }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  fontSize: 12,
                  fontWeight: isTodayCell ? 700 : 400,
                  color: isTodayCell ? "#fff" : cell.currentMonth ? TEXT : TEXT_LIGHT,
                  background: isTodayCell ? ACCENT : "transparent",
                  lineHeight: 1,
                }}>
                  {cell.day}
                </span>
              </div>

              {/* Blocs d'échéances */}
              {hasEvents && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {events.slice(0, 3).map((ev, ei) => (
                    <div
                      key={ei}
                      style={{
                        borderLeft: ev.urgent ? `2px solid ${URGENT}` : `2px solid ${ev.dossierColor}`,
                        background: ev.urgent ? URGENT_BG : `${ev.dossierColor}12`,
                        borderRadius: "0 3px 3px 0",
                        padding: "1px 4px",
                        fontSize: 10,
                        fontWeight: 500,
                        color: ev.urgent ? URGENT : ev.dossierColor,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap" as const,
                        lineHeight: 1.5,
                      }}
                    >
                      {ev.label}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div style={{ fontSize: 9, color: TEXT_LIGHT, paddingLeft: 4 }}>
                      +{events.length - 3} de plus
                    </div>
                  )}
                </div>
              )}

              {/* Tooltip au survol */}
              {isTooltipVisible && hasEvents && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: col >= 4 ? "auto" : 0,
                  right: col >= 4 ? 0 : "auto",
                  zIndex: 30,
                  background: "#fff",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 10,
                  boxShadow: "0 6px 24px rgba(0,0,0,0.10)",
                  padding: "10px 12px",
                  minWidth: 200,
                  maxWidth: 260,
                  pointerEvents: "none",
                }}>
                  {events.map((ev, ei) => (
                    <div key={ei} style={{
                      display: "flex", alignItems: "flex-start", gap: 8,
                      marginBottom: ei < events.length - 1 ? 8 : 0,
                    }}>
                      <div style={{
                        width: 3, alignSelf: "stretch", borderRadius: 2,
                        background: ev.urgent ? URGENT : ev.dossierColor,
                        flexShrink: 0, marginTop: 2,
                      }} />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: TEXT, lineHeight: 1.4 }}>{ev.dossierName}</div>
                        <div style={{ fontSize: 10, color: TEXT_MUTED, lineHeight: 1.4 }}>{ev.label}</div>
                        {ev.urgent && (
                          <div style={{ fontSize: 9, color: URGENT, fontWeight: 600, marginTop: 2 }}>Urgent</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Section Calendrier — directement visible en phase 4 ───
function EcheancesSection({ isMobile }: { isMobile: boolean }) {
  // Construire les items calendrier depuis tous les dossiers
  const calItems = DOSSIERS.flatMap(d =>
    d.deadlines.map(dl => {
      const parsed = parseFrenchDate(dl.date)
      if (!parsed) return null
      const remaining = Math.round((parsed.getTime() - new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime()) / (1000 * 60 * 60 * 24))
      return {
        date: parsed,
        label: dl.label,
        dossierName: d.name,
        dossierColor: DOSSIER_COLORS[d.id] || "#888",
        urgent: dl.urgent || remaining <= 7,
      }
    })
  ).filter(Boolean) as { date: Date; label: string; dossierName: string; dossierColor: string; urgent: boolean }[]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      style={{ marginBottom: 20 }}
    >
      {/* Titre de section */}
      <div style={{ marginBottom: 14, marginTop: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: TEXT_LIGHT, textTransform: "uppercase" as const, letterSpacing: "0.12em" }}>
          VOS ÉCHÉANCES
        </span>
      </div>

      {/* Calendrier Google Calendar style */}
      <MiniCalendar deadlineItems={calItems} />

      {/* Boutons de connexion */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: 10,
        marginTop: 14,
      }}>
        <button
          onClick={() => console.log("Bientôt disponible")}
          style={{
            flex: 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "9px 16px",
            borderRadius: 9,
            border: `1px solid ${BORDER}`,
            background: BG,
            color: TEXT_MUTED,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT; (e.currentTarget as HTMLButtonElement).style.color = ACCENT }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; (e.currentTarget as HTMLButtonElement).style.color = TEXT_MUTED }}
        >
          <Calendar size={14} />
          Connecter Google Calendar
        </button>
        <button
          onClick={() => console.log("Bientôt disponible")}
          style={{
            flex: 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "9px 16px",
            borderRadius: 9,
            border: `1px solid ${BORDER}`,
            background: BG,
            color: TEXT_MUTED,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT; (e.currentTarget as HTMLButtonElement).style.color = ACCENT }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; (e.currentTarget as HTMLButtonElement).style.color = TEXT_MUTED }}
        >
          <Calendar size={14} />
          Connecter Outlook
        </button>
      </div>
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
  const cinematicHighlight = animPhase === 1 ? DOSSIERS[Math.min(visibleDossierCount - 1, DOSSIERS.length - 1)]?.id : null

  return (
    <>
      <div style={{ padding: "18px 14px 12px", borderBottom: `1px solid ${SIDEBAR_BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17, color: TEXT }}>Donna</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#0D0D0D", color: "#FFFFFF", letterSpacing: "0.05em" }}>DÉMO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.2, repeat: animPhase < 4 ? Infinity : 0 }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: animPhase < 4 ? ACCENT : GREEN, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: TEXT_MUTED }}>
            {animPhase < 4 ? "Analyse en cours..." : "À jour · il y a 2 min"}
          </span>
        </div>
      </div>

      <div style={{ padding: "10px 6px" }}>
        <button onClick={() => onDossierClick(null)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 6, background: activeDossierId === null && animPhase >= 4 ? ACCENT_BG : "transparent", marginBottom: 2, width: "100%", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
          <LayoutDashboard size={14} style={{ color: activeDossierId === null ? ACCENT : TEXT_MUTED, flexShrink: 0 }} />
          <div style={{ fontSize: 13, fontWeight: activeDossierId === null ? 600 : 400, color: activeDossierId === null ? TEXT : TEXT_MUTED }}>Tableau de bord</div>
        </button>
      </div>

      <div style={{ padding: "4px 14px 8px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
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
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => animPhase >= 4 && onDossierClick(d)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", marginBottom: 2,
                  cursor: animPhase >= 4 ? "pointer" : "default",
                  borderRadius: 6,
                  background: isActive ? ACCENT_BG : "transparent",
                  borderLeft: isActive ? `3px solid ${ACCENT}` : "3px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: DOSSIER_COLORS[d.id] || INITIALS_BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{d.initials}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? TEXT : TEXT_MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: TEXT_LIGHT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.domain}</div>
                </div>
                {isActive && animPhase === 1 && (
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div style={{ padding: "10px 14px", borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
        <a href="https://calendly.com/contact-donna-legal/onboarding-15min" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: ACCENT, fontWeight: 500, display: "flex", alignItems: "center", gap: 5, textDecoration: "none", marginBottom: 6 }}>
          <Mail size={11} /> Demander un essai gratuit
        </a>
        <Link to="/" style={{ fontSize: 11, color: TEXT_MUTED, textDecoration: "none" }}>← Retour au site</Link>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════
// ─── MAIN PAGE ───
// ═══════════════════════════════════════════════════════

// Textes Phase A — Donna lors du scan
const PHASE_A_DONNA_LINES = [
  "Je me connecte à votre boîte mail et j'analyse les 30 derniers jours...",
  "89 emails reçus ce mois-ci. Je vais les trier pour vous.",
]

// Textes Phase C — Donna construit le briefing
const PHASE_C_DONNA_LINES = [
  "Bonjour Alexandra. 19 emails lus. 3 tâches identifiées.",
  "9 étaient du bruit, je m'en suis occupée. Il vous reste 3 brouillons de réponse à valider, tout est prêt.",
]

// Textes Phase D — ROI
const PHASE_D_DONNA_LINES = [
  "J'ai lu, trié et organisé les pièces jointes par dossier de 89 emails durant ces 24 dernières heures.",
  "Demain matin à 8h, votre prochain tableau de bord sera prêt automatiquement.",
]

export default function DemoV3() {
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [treatedIds, setTreatedIds] = useState<Set<number>>(new Set())
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"todo" | "inbox">("todo")
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null)
  const [inboxPeriodFilter, setInboxPeriodFilter] = useState<"24h" | "7j" | "30j">("24h")
  const [inboxTypeFilter, setInboxTypeFilter] = useState<"tous" | "dossiers" | "bruit">("tous")

  // Collapsible tâches
  const [tasksCollapsed, setTasksCollapsed] = useState(false)

  // Drawer state
  const [selectedTask, setSelectedTask] = useState<typeof TASKS[0] | null>(null)
  const [drawerMode, setDrawerMode] = useState<"view" | "draft">("view")

  // Dossier detail
  const [selectedDossier, setSelectedDossier] = useState<typeof DOSSIERS[0] | null>(null)

  // ─── Animation phases ───
  // 0 = Phase A (scan, 0-10s)
  // 1 = Phase B (dossiers, 10-64s, ~9s par dossier, 5 lignes chacun)
  // 2 = Phase C (briefing, 64-78s)
  // 3 = Phase D (ROI, 78-90s)
  // 4 = Phase E (interactive, 90s+)
  const [animPhase, setAnimPhase] = useState(0)
  const [mailCount, setMailCount] = useState(0)
  const [currentEmailIdx, setCurrentEmailIdx] = useState(0)
  const [visibleDossierCount, setVisibleDossierCount] = useState(0)
  const [activeCinematicDossierIdx, setActiveCinematicDossierIdx] = useState(-1)
  const [dossierDonnaActive, setDossierDonnaActive] = useState(false)
  const [dossierShowCheck, setDossierShowCheck] = useState(false)
  // Phase A donna lines
  const [phaseADonnaActive, setPhaseADonnaActive] = useState(false)
  const [phaseAFiltering, setPhaseAFiltering] = useState(false)
  // Phase C + D donna lines state
  const [phaseCActive, setPhaseCActive] = useState(false)
  const [phaseDActive, setPhaseDActive] = useState(false)
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
    setDossierDonnaActive(false)
    setDossierShowCheck(false)
    setPhaseADonnaActive(false)
    setPhaseAFiltering(false)
    setPhaseCActive(false)
    setPhaseDActive(false)
    setVisibleTaskCount(TASKS.length)
    setRoiVisible(true)
    setAnimDone(true)
  }, [])

  // ─── Animation sequence ───
  useEffect(() => {
    // === PHASE A: 0-10s — scan emails ===
    // 0s: start email counter
    addTimer(() => {
      emailIntervalRef.current = setInterval(() => {
        setCurrentEmailIdx(i => (i + 1) % SIMULATED_EMAILS.length)
      }, 200)
      const milestones = [3, 8, 14, 22, 30, 40, 50, 60, 70, 78, 83, 86, 88, 89]
      milestones.forEach((target, i) => {
        addTimer(() => setMailCount(target), 500 + i * (8500 / milestones.length))
      })
    }, 300)

    // 1s: Donna Phase A starts speaking
    addTimer(() => {
      setPhaseADonnaActive(true)
    }, 1000)

    // Dossiers appear DURING scan (progressive discovery)
    // Dossier 1 appears at ~15 emails, dossier 2 at ~30, etc.
    const dossierAppearTimes = [3000, 4500, 5500, 6500, 7200, 8000]
    dossierAppearTimes.forEach((delay, i) => {
      addTimer(() => {
        setVisibleDossierCount(i + 1)
      }, delay)
    })

    // 8.5s: Phase A filtering — compteur atteint 89, Donna "filtre le bruit"
    addTimer(() => {
      if (emailIntervalRef.current) { clearInterval(emailIntervalRef.current); emailIntervalRef.current = null }
      setPhaseAFiltering(true)
    }, 8500)

    // === PHASE B: 10-64s — dossiers detail (~9s each for 5 lines) ===
    // Dossiers already visible in sidebar, now Donna explains each one
    const dossierStartTimes = [10000, 19000, 28000, 37000, 46000, 55000]
    dossierStartTimes.forEach((delay, i) => {
      addTimer(() => {
        if (emailIntervalRef.current) { clearInterval(emailIntervalRef.current); emailIntervalRef.current = null }
        setAnimPhase(1)
        setActiveCinematicDossierIdx(i)
        setDossierShowCheck(false)
        setDossierDonnaActive(false)
        addTimer(() => {
          setDossierDonnaActive(true)
        }, 300)
        addTimer(() => {
          setDossierShowCheck(true)
        }, 7500)
      }, delay)
    })

    // === PHASE C: 64s — briefing construction ===
    addTimer(() => {
      setAnimPhase(2)
      setActiveCinematicDossierIdx(-1)
      setDossierDonnaActive(false)
      setPhaseCActive(true)
      // Tasks appear progressively
      addTimer(() => setVisibleTaskCount(1), 3000)
      addTimer(() => setVisibleTaskCount(2), 6000)
      addTimer(() => setVisibleTaskCount(3), 9000)
    }, 64000)

    // === PHASE D: 78s — ROI ===
    addTimer(() => {
      setAnimPhase(3)
      setRoiVisible(true)
      setPhaseDActive(true)
    }, 78000)

    // === PHASE E: 90s — interactive ===
    addTimer(() => {
      setAnimPhase(4)
      setAnimDone(true)
    }, 90000)

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
  const currentDonnaLines = activeCinematicDossierIdx >= 0 ? DOSSIER_DONNA_LINES[activeCinematicDossierIdx] : []
  const urgentRemaining = TASKS.slice(0, visibleTaskCount).filter(t => t.urgent && !treatedIds.has(t.id)).length

  return (
    <div style={{ background: "#FFFFFF", color: TEXT, height: "100vh", fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
      `}</style>

      {/* Top bar — mobile only */}
      {isMobile && (
        <div style={{ height: 40, background: BG, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", padding: "0 16px", gap: 8, flexShrink: 0 }}>
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
                  style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 50 }} />
                <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  style={{ position: "fixed", top: 40, left: 0, bottom: 0, zIndex: 51, width: 240, background: SIDEBAR_BG, borderRight: `1px solid ${SIDEBAR_BORDER}`, display: "flex", flexDirection: "column", overflowY: "auto" }}
                >
                  <SidebarContent onDossierClick={d => { setSelectedDossier(d); setSidebarOpen(false) }} activeDossierId={selectedDossier?.id || null} visibleDossierCount={visibleDossierCount} animPhase={animPhase} />
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
          <main style={{ flex: 1, overflowY: "auto", position: "relative", width: "100%" }}>
          <div style={{ maxWidth: isMobile ? "100%" : 900, margin: "0 auto", padding: isMobile ? "20px 16px" : "36px 44px" }}>

            {/* Header + Skip button — always visible */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 22 : 27, fontWeight: 400, color: TEXT, marginBottom: 4, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  Bonjour, Alexandra
                </h1>
                <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.4 }}>
                  Je suis Donna, votre assistante · {getToday()}
                </p>
              </motion.div>

              {/* Bouton Passer — toujours en haut à droite, visible jusqu'à animDone */}
              <AnimatePresence>
                {!animDone && (
                  <motion.button
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    onClick={skipToEnd}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 7, border: `1px solid ${BORDER}`, background: BG, color: TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, marginLeft: 16, marginTop: 4 }}
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
                  <PhaseAScanZone
                    mailCount={mailCount}
                    currentEmailSubject={currentEmailSubject}
                    isMobile={isMobile}
                    donnaLines={PHASE_A_DONNA_LINES}
                    donnaActive={phaseADonnaActive}
                    isFiltering={phaseAFiltering}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHASE B: dossier focus */}
            <AnimatePresence mode="wait">
              {animPhase === 1 && currentCinematicDossier && (
                <motion.div key={`phaseB-${currentCinematicDossier.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} style={{ marginBottom: 20 }}>
                  <PhaseBDossierFocus
                    dossier={currentCinematicDossier}
                    donnaLines={currentDonnaLines}
                    donnaActive={dossierDonnaActive}
                    showCheck={dossierShowCheck}
                    dossierIdx={activeCinematicDossierIdx}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* BLOC UNIQUE — Cercle emails + message Donna */}
            <AnimatePresence>
              {animPhase >= 2 && (
                <motion.div key="donna-bloc" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }} style={{ marginBottom: 20 }}>
                  <div style={{
                    background: BG,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 16,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    padding: isMobile ? "18px 16px" : "22px 24px",
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "flex-start" : "center",
                    gap: isMobile ? 14 : 20,
                  }}>
                    {/* Indicateur emails — même cercle que la cinématique */}
                    <button
                      onClick={() => setActiveTab(prev => prev === "inbox" ? "todo" : "inbox")}
                      title={activeTab === "inbox" ? "Retour aux tâches" : "Voir l'inbox complète"}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: ACCENT,
                        cursor: "pointer",
                        padding: 0,
                        border: "none",
                        flexShrink: 0,
                        transition: "all 0.25s ease",
                        display: "flex",
                        flexDirection: "column" as const,
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)" }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.1)" }}
                    >
                      <span style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1 }}>19</span>
                      <span style={{ fontSize: 8, color: "rgba(255,255,255,0.75)", letterSpacing: "0.04em", textTransform: "uppercase" as const, marginTop: 2 }}>emails</span>
                    </button>

                    {/* Texte Donna */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {activeTab === "inbox" ? (
                        /* Vue Inbox activée */
                        <div>
                          <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.7, margin: "0 0 8px" }}>
                            Vous consultez votre inbox. <strong>19 emails</strong> reçus dans les dernières 24 heures.
                          </p>
                          <button
                            onClick={() => setActiveTab("todo")}
                            style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: ACCENT, fontFamily: "inherit", padding: 0, fontWeight: 500 }}
                          >
                            <ArrowLeft size={13} /> Retour aux tâches
                          </button>
                        </div>
                      ) : animPhase >= 4 ? (
                        /* Texte statique post-cinématique */
                        <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.7, margin: 0 }}>
                          <strong>Bonjour Alexandra.</strong> <strong>19 emails</strong> lus ces dernières 24h. <strong>3 tâches</strong> identifiées.
                        </p>
                      ) : (
                        /* Texte animé pendant la cinématique */
                        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 16px", background: BG }}>
                          <PhaseCBriefing
                            lines={PHASE_C_DONNA_LINES}
                            active={phaseCActive}
                            isMobile={isMobile}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>


            {/* Échéances à surveiller — visible en phase 4 uniquement */}
            <AnimatePresence>
              {animPhase >= 4 && activeTab === "todo" && (
                <motion.div key="echeances" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <EcheancesSection isMobile={isMobile} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tasks — onglet To-do list */}
            <AnimatePresence>
              {visibleTaskCount > 0 && animPhase >= 2 && activeTab === "todo" && (
                <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ marginBottom: 8 }}>
                  {/* Titre collapsible "Tâches créées par Donna" */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: tasksCollapsed ? 0 : 14, marginTop: 4, cursor: "pointer", userSelect: "none" as const }}
                    onClick={() => setTasksCollapsed(o => !o)}
                  >
                    <div style={{ height: 1, flex: 1, background: BORDER }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: TEXT_LIGHT, textTransform: "uppercase" as const, letterSpacing: 0.8, whiteSpace: "nowrap" as const }}>Tâches créées par Donna</span>
                      <motion.div
                        animate={{ rotate: tasksCollapsed ? -90 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <ChevronDown size={12} color={TEXT_LIGHT} />
                      </motion.div>
                    </div>
                    <div style={{ height: 1, flex: 1, background: BORDER }} />
                  </div>
                  <AnimatePresence>
                    {!tasksCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: "hidden" }}
                      >
                        {TASKS.slice(0, visibleTaskCount).map((task) => (
                          <SlimTaskCard
                            key={task.id}
                            task={task}
                            onExpand={() => handleExpandTask(task.id)}
                            expanded={expandedTaskId === task.id}
                            onDraft={() => handleDraft(task)}
                            onTreat={() => handleTreat(task.id)}
                            treated={treatedIds.has(task.id)}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inbox — onglet Inbox */}
            <AnimatePresence>
              {animPhase >= 2 && activeTab === "inbox" && (
                <motion.div key="inbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ marginBottom: 8 }}>
                  {/* En-tête inbox : titre à gauche, filtres à droite */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>
                        Boîte de réception
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, background: ACCENT, color: "#fff", borderRadius: 10, padding: "1px 7px", lineHeight: 1.6 }}>
                        {INBOX_EMAILS.length}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <select
                        value={inboxPeriodFilter}
                        onChange={e => setInboxPeriodFilter(e.target.value as "24h" | "7j" | "30j")}
                        style={{ fontSize: 11, color: TEXT_MUTED, background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontFamily: "inherit", outline: "none" }}
                      >
                        <option value="24h">24h</option>
                        <option value="7j">7 jours</option>
                        <option value="30j">30 jours</option>
                      </select>
                      <select
                        value={inboxTypeFilter}
                        onChange={e => setInboxTypeFilter(e.target.value as "tous" | "dossiers" | "bruit")}
                        style={{ fontSize: 11, color: TEXT_MUTED, background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontFamily: "inherit", outline: "none" }}
                      >
                        <option value="tous">Tous</option>
                        <option value="dossiers">Dossiers</option>
                        <option value="bruit">Bruit</option>
                      </select>
                    </div>
                  </div>

                  {/* Liste emails — style boîte mail */}
                  {(() => {
                    // Couleurs variées pour les avatars
                    const AVATAR_COLORS = [
                      { bg: "#DBEAFE", text: "#1D4ED8" }, // bleu
                      { bg: "#D1FAE5", text: "#065F46" }, // vert
                      { bg: "#FEE2E2", text: "#991B1B" }, // rouge
                      { bg: "#EDE9FE", text: "#5B21B6" }, // violet
                      { bg: "#FEF3C7", text: "#92400E" }, // ambre
                      { bg: "#E0F2FE", text: "#0369A1" }, // bleu ciel
                      { bg: "#FCE7F3", text: "#9D174D" }, // rose
                      { bg: "#F3F4F6", text: "#374151" }, // gris
                    ]
                    // Assigne une couleur fixe par expéditeur (hash simple)
                    function getAvatarColor(sender: string) {
                      let h = 0
                      for (let i = 0; i < sender.length; i++) h = (h * 31 + sender.charCodeAt(i)) & 0xffff
                      return AVATAR_COLORS[h % AVATAR_COLORS.length]
                    }

                    const d0 = getDaysAgo(0)
                    const d1 = getDaysAgo(1)

                    const filtered = INBOX_EMAILS.filter(email => {
                      if (inboxTypeFilter === "dossiers" && email.isBruit) return false
                      if (inboxTypeFilter === "bruit" && !email.isBruit) return false
                      if (inboxPeriodFilter === "24h") {
                        return email.date === d0 || email.date === d1
                      }
                      if (inboxPeriodFilter === "7j") {
                        const days7 = Array.from({ length: 8 }, (_, i) => getDaysAgo(i))
                        return days7.includes(email.date)
                      }
                      return true
                    })

                    if (filtered.length === 0) {
                      return (
                        <div style={{ padding: "32px 16px", textAlign: "center", color: TEXT_MUTED, fontSize: 13 }}>
                          Aucun email sur cette période.
                        </div>
                      )
                    }

                    return (
                      <div style={{ marginTop: 12, border: `1px solid ${BORDER}`, borderRadius: 12, background: BG, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        {filtered.map((email, idx) => {
                          const isUnread = email.date === d0 || email.date === d1
                          const isExpanded = expandedEmailId === email.id
                          const avatar = getAvatarColor(email.sender)
                          const isLast = idx === filtered.length - 1

                          return (
                            <div key={email.id} style={{ borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.04)" }}>
                              {/* Ligne principale — style Gmail */}
                              <div
                                onClick={() => setExpandedEmailId(prev => prev === email.id ? null : email.id)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  padding: "9px 14px",
                                  cursor: "pointer",
                                  background: isExpanded ? SIDEBAR_BG : "transparent",
                                  transition: "background 0.12s",
                                }}
                                onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = SIDEBAR_BG }}
                                onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = "transparent" }}
                              >
                                {/* Point non lu */}
                                <div style={{ width: 8, flexShrink: 0, display: "flex", justifyContent: "center" }}>
                                  {isUnread && (
                                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#0D0D0D" }} />
                                  )}
                                </div>

                                {/* Avatar initiale */}
                                <div style={{
                                  width: 32, height: 32, borderRadius: "50%",
                                  background: avatar.bg,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 12, fontWeight: 700, color: avatar.text,
                                  flexShrink: 0,
                                }}>
                                  {email.sender.charAt(0).toUpperCase()}
                                </div>

                                {/* Contenu : expéditeur + objet */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  {/* Ligne 1 : expéditeur + date */}
                                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 1 }}>
                                    <span style={{
                                      fontSize: 13,
                                      fontWeight: isUnread ? 700 : 400,
                                      color: "#111827",
                                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                      maxWidth: "60%",
                                    }}>
                                      {email.sender}
                                    </span>
                                    <span style={{ fontSize: 11, color: TEXT_LIGHT, flexShrink: 0, fontWeight: isUnread ? 600 : 400 }}>
                                      {email.date}
                                    </span>
                                  </div>
                                  {/* Ligne 2 : objet */}
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{
                                      fontSize: 12,
                                      color: isUnread ? TEXT : TEXT_MUTED,
                                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                      flex: 1,
                                    }}>
                                      {email.subject}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Expand : contenu de l'email */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.22 }}
                                    style={{ overflow: "hidden" }}
                                  >
                                    <div style={{
                                      padding: "16px 20px 18px 54px",
                                      borderTop: `1px solid ${BORDER}`,
                                      borderLeft: `3px solid ${ACCENT}`,
                                      background: SIDEBAR_BG,
                                    }}>
                                      {/* En-tête email */}
                                      <div style={{ marginBottom: 14, fontSize: 12, lineHeight: 1.9 }}>
                                        <div>
                                          <span style={{ color: TEXT_LIGHT, display: "inline-block", minWidth: 44 }}>De</span>
                                          <span style={{ fontWeight: 600, color: TEXT }}>{email.sender}</span>
                                        </div>
                                        <div>
                                          <span style={{ color: TEXT_LIGHT, display: "inline-block", minWidth: 44 }}>Date</span>
                                          <span style={{ color: TEXT }}>{email.date}</span>
                                        </div>
                                        <div>
                                          <span style={{ color: TEXT_LIGHT, display: "inline-block", minWidth: 44 }}>Objet</span>
                                          <span style={{ color: TEXT, fontWeight: 500 }}>{email.subject}</span>
                                        </div>
                                        {email.dossier && (
                                          <div>
                                            <span style={{ color: TEXT_LIGHT, display: "inline-block", minWidth: 44 }}>Dossier</span>
                                            <span style={{ fontSize: 11, color: ACCENT, background: ACCENT_BG, borderRadius: 4, padding: "1px 7px", fontWeight: 600 }}>{email.dossier}</span>
                                          </div>
                                        )}
                                      </div>
                                      {/* Corps */}
                                      <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.8, margin: 0 }}>
                                        {email.resume}
                                      </p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHASE D: ROI — Encart élégant style DemoV2 */}
            <AnimatePresence>
              {roiVisible && (
                <motion.div key="roi"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1], delay: 0.2 }}
                  style={{ marginTop: 24, padding: isMobile ? "18px 16px" : "22px 26px", borderRadius: 16, background: ACCENT_BG, border: `1px solid ${BORDER}` }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    {/* Icône Donna */}
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>D</div>
                    <div style={{ flex: 1 }}>
                      {/* Texte principal en gras */}
                      <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: TEXT, marginBottom: 8, lineHeight: 1.3 }}>
                        89 emails lus, triés et classés en 4 minutes
                      </div>
                      {/* Sous-texte */}
                      <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.65, margin: "0 0 10px" }}>
                        Donna a organisé vos pièces jointes par dossier et identifié 3 actions prioritaires.
                      </p>
                      {/* Texte DonnaVoice si cinématique active */}
                      {phaseDActive && !animDone && (
                        <DonnaVoice lines={PHASE_D_DONNA_LINES} active={phaseDActive} />
                      )}
                      {/* Dernière ligne après cinématique */}
                      {(animDone || !phaseDActive) && (
                        <p style={{ fontSize: 12, color: TEXT_LIGHT, margin: 0 }}>
                          Demain matin à 8h, votre prochain tableau de bord sera prêt.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHASE E: CTA */}
            <AnimatePresence>
              {animDone && (
                <motion.div key="cta"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1], delay: 0.3 }}
                  style={{ marginTop: 24, padding: isMobile ? "18px" : "22px 28px", borderRadius: 16, background: "#0D0D0D", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: isMobile ? 24 : 0 }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 5 }}>Vous aimez ce que vous voyez ?</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>Connectez votre boîte mail professionnelle — 7 jours gratuits.</div>
                  </div>
                  <a href="https://calendly.com/contact-donna-legal/onboarding-15min" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 24px", borderRadius: 8, background: "#FFFFFF", color: "#0D0D0D", fontSize: 13, fontWeight: 500, textDecoration: "none", flexShrink: 0 }}>
                    Demander un essai gratuit <Send size={13} />
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
