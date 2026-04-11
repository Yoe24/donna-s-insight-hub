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

// ─── Palette sobre — cabinet d'avocats ───
const BG = "#FFFFFF"
const SIDEBAR_BG = "#F8F9FA"
const SIDEBAR_BORDER = "#DEE2E6"
const TEXT = "#1A1A2E"
const TEXT_MUTED = "#6C757D"
const TEXT_LIGHT = "#ADB5BD"
const ACCENT = "#2C3E6B"
const ACCENT_BG = "#E8ECF4"
const URGENT = "#C0392B"
const URGENT_BG = "#FDF2F2"
const GREEN = "#27AE60"
const BORDER = "#DEE2E6"
const INITIALS_BG = "#E9ECEF"
const INITIALS_TEXT = "#495057"

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
      { date: "15 avril 2026", label: "Date limite dépôt conclusions", urgent: true },
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
      { date: "10 avril 2026", label: "Assignation en référé-provision", urgent: true },
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
      { date: "15 avril 2026", label: "Médiation avec le syndic", urgent: false },
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

// ─── Slim TaskCard — nouveau design ───
function SlimTaskCard({ task, onExpand, expanded, onDraft, onTreat, treated }: {
  task: typeof TASKS[0]
  onExpand: () => void
  expanded: boolean
  onDraft: () => void
  onTreat: () => void
  treated: boolean
}) {
  if (treated) {
    return (
      <motion.div
        initial={{ opacity: 1 }} animate={{ opacity: 0.42 }}
        transition={{ duration: 0.3 }}
        style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 20px", marginBottom: 10, background: SIDEBAR_BG, display: "flex", alignItems: "center", gap: 10 }}
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        border: `1px solid ${task.urgent ? "rgba(192,57,43,0.22)" : BORDER}`,
        borderRadius: 10,
        marginBottom: 12,
        overflow: "hidden",
        background: BG,
      }}
    >
      <div style={{ padding: "16px 20px" }}>
        {/* Ligne 1 : checkbox + titre + badge urgent */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {/* Checkbox discret */}
          <button
            onClick={e => { e.stopPropagation(); onTreat() }}
            title="Marquer comme traité"
            style={{ width: 17, height: 17, borderRadius: "50%", border: `1.5px solid ${BORDER}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: 2, padding: 0, transition: "border-color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = TEXT_MUTED)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER)}
          />
          {/* Titre cliquable pour expand */}
          <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={onExpand}>
            <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, lineHeight: 1.35, marginBottom: 4 }}>{task.title}</div>
            <div style={{ fontSize: 12, color: TEXT_MUTED, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.resume}</div>
          </div>
          {/* Badge Urgent uniquement */}
          {task.urgent && (
            <span style={{ fontSize: 10, fontWeight: 700, color: URGENT, background: URGENT_BG, padding: "2px 7px", borderRadius: 4, letterSpacing: "0.06em", border: `1px solid rgba(192,57,43,0.18)`, flexShrink: 0, marginTop: 1 }}>URGENT</span>
          )}
        </div>
        {/* Ligne 2 : bouton Réponse générée par Donna */}
        <div style={{ marginTop: 12, marginLeft: 27 }}>
          <button
            onClick={e => { e.stopPropagation(); onDraft() }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 7, border: "none", background: ACCENT, color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, boxShadow: "0 1px 4px rgba(44,62,107,0.15)" }}
          >
            <Edit3 size={13} /> Réponse générée par Donna
          </button>
        </div>
      </div>
      {/* Expand : détail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "14px 20px 16px 47px", borderTop: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 6, lineHeight: 1.6 }}>
                <span style={{ color: TEXT_LIGHT, display: "inline-block", minWidth: 36 }}>De</span>
                <span style={{ fontWeight: 500, color: TEXT }}>{task.email_from}</span>
              </div>
              <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 10, lineHeight: 1.6 }}>
                <span style={{ color: TEXT_LIGHT, display: "inline-block", minWidth: 36 }}>Date</span>
                <span style={{ color: TEXT }}>{task.email_date}</span>
              </div>
              <div style={{ background: ACCENT_BG, borderRadius: 7, padding: "10px 14px", marginBottom: 12, border: `1px solid rgba(44,62,107,0.1)` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: ACCENT, marginBottom: 4 }}>Résumé Donna</div>
                <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.65, margin: 0 }}>{task.resume}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={e => { e.stopPropagation(); onDraft() }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 6, border: `1px solid ${BORDER}`, background: BG, color: TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                >
                  <Mail size={12} /> Voir le mail original
                </button>
                {task.tags.length > 0 && task.tags.map(tag => (
                  <span key={tag.name} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 5, background: SIDEBAR_BG, border: `1px solid ${BORDER}`, fontSize: 11, color: TEXT_MUTED }}>
                    <Paperclip size={10} /> {tag.name}
                  </span>
                ))}
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
      style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: isMobile ? "100%" : "min(680px, 55vw)", background: BG, zIndex: 80, display: "flex", flexDirection: "column", boxShadow: "-4px 0 30px rgba(0,0,0,0.08)", borderLeft: `1px solid ${BORDER}` }}
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
            <div style={{ background: SIDEBAR_BG, borderRadius: 8, padding: "14px 16px", marginBottom: 20, fontSize: 12, lineHeight: 1.8, border: `1px solid ${BORDER}` }}>
              <div><span style={{ color: TEXT_LIGHT, width: 32, display: "inline-block" }}>De</span> <span style={{ color: TEXT }}>{task.email_from}</span></div>
              <div><span style={{ color: TEXT_LIGHT, width: 32, display: "inline-block" }}>À</span> <span style={{ color: TEXT }}>{task.email_to}</span></div>
              {task.email_cc && <div><span style={{ color: TEXT_LIGHT, width: 32, display: "inline-block" }}>Cc</span> <span style={{ color: TEXT }}>{task.email_cc}</span></div>}
              <div><span style={{ color: TEXT_LIGHT, width: 32, display: "inline-block" }}>Date</span> <span style={{ color: TEXT }}>{task.email_date}</span></div>
            </div>
            <div style={{ background: ACCENT_BG, borderRadius: 8, padding: "16px 18px", marginBottom: 20, border: `1px solid rgba(44,62,107,0.12)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: TEXT, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>D</div>
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
                    <div style={{ background: SIDEBAR_BG, borderRadius: 8, padding: "14px 16px", border: `1px solid ${BORDER}`, fontSize: 13, color: TEXT, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                      {task.corps_original}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {task.tags.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_LIGHT, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Pièces jointes</div>
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
            <button onClick={handleGenerateDraft} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px 20px", borderRadius: 8, background: ACCENT, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <Edit3 size={15} /> Générer une réponse
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Brouillon de réponse</h2>
            <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 16 }}>Re: {task.title}</p>
            {draftLoading ? (
              <div style={{ background: SIDEBAR_BG, borderRadius: 8, padding: 20, border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: TEXT, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>D</div>
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
                  style={{ width: "100%", minHeight: 280, padding: "16px 18px", borderRadius: 8, border: `1.5px solid ${BORDER}`, background: SIDEBAR_BG, fontSize: 13, color: TEXT, lineHeight: 1.7, fontFamily: "inherit", resize: "vertical", outline: "none" }}
                  onFocus={e => (e.target.style.borderColor = ACCENT)}
                  onBlur={e => (e.target.style.borderColor = BORDER)}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={handleCopy} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, background: TEXT, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    {copied ? <><Check size={14} /> Copié !</> : <><Copy size={14} /> Copier</>}
                  </button>
                </div>
                <div style={{ marginTop: 20, padding: "16px 18px", borderRadius: 8, background: SIDEBAR_BG, border: `1px solid ${BORDER}` }}>
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
                          { key: "modifier", icon: Pencil, label: "Quelques modifications", color: TEXT_MUTED },
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
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: TEXT, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>D</div>
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

// ─── Cinematic Phase A: email scanning ───
function PhaseAScanZone({ mailCount, currentEmailSubject, isMobile, donnaLines, donnaActive }: {
  mailCount: number; currentEmailSubject: string; isMobile: boolean
  donnaLines: string[]; donnaActive: boolean
}) {
  const pct = Math.round((mailCount / 89) * 100)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: isMobile ? "16px" : "22px 26px", background: BG }}
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
            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.8, repeat: Infinity }} style={{ fontSize: 11, fontWeight: 700, color: ACCENT }}>D</motion.span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 2 }}>
            <span style={{ fontWeight: 700, color: ACCENT }}>{mailCount}</span> / 89 emails analysés
          </div>
          <div style={{ height: 3, background: BORDER, borderRadius: 2, overflow: "hidden" }}>
            <motion.div style={{ height: "100%", background: ACCENT, borderRadius: 2 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentEmailSubject} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.2 }}
          style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}
        >
          <Mail size={11} color={TEXT_LIGHT} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: TEXT_MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentEmailSubject}</span>
        </motion.div>
      </AnimatePresence>

      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: TEXT, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>D</div>
          <DonnaVoice lines={donnaLines} active={donnaActive} />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Cinematic Phase B: dossier being processed (main area) ───
function PhaseBDossierFocus({ dossier, donnaLines, donnaActive, showCheck }: {
  dossier: typeof DOSSIERS[0]
  donnaLines: string[]
  donnaActive: boolean
  showCheck: boolean
}) {
  return (
    <motion.div
      key={dossier.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "22px 26px", background: BG }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: INITIALS_BG, display: "flex", alignItems: "center", justifyContent: "center", color: INITIALS_TEXT, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{dossier.initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{dossier.name}</div>
          <div style={{ fontSize: 11, color: TEXT_MUTED }}>{dossier.domain}</div>
        </div>
        <AnimatePresence>
          {showCheck && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
              <CheckCircle2 size={20} color={GREEN} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: TEXT, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>D</div>
        <DonnaVoice lines={donnaLines} active={donnaActive} />
      </div>
    </motion.div>
  )
}

// ─── Cinematic Phase C: briefing being typed ───
function PhaseCBriefing({ lines, active, isMobile, onAllDone }: {
  lines: string[]; active: boolean; isMobile: boolean; onAllDone?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: isMobile ? "16px" : "22px 26px", background: BG }}
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
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: ACCENT_BG, color: ACCENT, letterSpacing: "0.05em" }}>DÉMO</span>
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
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: INITIALS_BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: INITIALS_TEXT, flexShrink: 0 }}>{d.initials}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? TEXT : TEXT_MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
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

// Textes Phase A — Donna lors du scan
const PHASE_A_DONNA_LINES = [
  "Je me connecte à votre boîte mail et j'analyse les 30 derniers jours...",
  "89 emails reçus ce mois-ci. Je vais les trier pour vous.",
]

// Textes Phase C — Donna construit le briefing
const PHASE_C_DONNA_LINES = [
  "Voilà, j'ai tout trié. Voici votre briefing du jour.",
  "3 actions à traiter. La plus urgente : l'audience JAF Dupont est dans 6 jours.",
]

// Textes Phase D — ROI
const PHASE_D_DONNA_LINES = [
  "J'ai lu, trié et organisé les pièces jointes par dossier de 89 emails durant ces 24 dernières heures. Vous auriez mis environ 2h30.",
  "Demain matin à 8h, votre prochain tableau de bord sera prêt automatiquement.",
]

export default function DemoV3() {
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [treatedIds, setTreatedIds] = useState<Set<number>>(new Set())
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"todo" | "inbox">("todo")
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null)
  const [inboxPeriodFilter, setInboxPeriodFilter] = useState<"24h" | "7j" | "30j">("30j")
  const [inboxTypeFilter, setInboxTypeFilter] = useState<"tous" | "dossiers" | "bruit">("tous")

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

    // === PHASE B: 10-64s — dossiers (~9s each for 5 lines) ===
    // Timings: 10s, 19s, 28s, 37s, 46s, 55s
    const dossierStartTimes = [10000, 19000, 28000, 37000, 46000, 55000]
    dossierStartTimes.forEach((delay, i) => {
      addTimer(() => {
        if (emailIntervalRef.current) { clearInterval(emailIntervalRef.current); emailIntervalRef.current = null }
        setAnimPhase(1)
        setVisibleDossierCount(i + 1)
        setActiveCinematicDossierIdx(i)
        setDossierShowCheck(false)
        setDossierDonnaActive(false)
        // Small delay then start donna voice for this dossier
        addTimer(() => {
          setDossierDonnaActive(true)
        }, 300)
        // Show check after 5 lines (~5 lines * ~1.2s typing + 1.2s pause = ~8s, show check at ~7.5s)
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
    <div style={{ background: BG, color: TEXT, height: "100vh", fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Top bar — mobile only */}
      {isMobile && (
        <div style={{ height: 40, background: SIDEBAR_BG, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", padding: "0 16px", gap: 8, flexShrink: 0 }}>
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
          <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? "20px 16px" : "36px 44px", position: "relative", maxWidth: 780 }}>

            {/* Header + Skip button — always visible */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHASE C: briefing Donna voice */}
            <AnimatePresence>
              {animPhase >= 2 && (
                <motion.div key="briefing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 24 }}>
                  <PhaseCBriefing
                    lines={PHASE_C_DONNA_LINES}
                    active={phaseCActive}
                    isMobile={isMobile}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action count + onglets */}
            <AnimatePresence>
              {animPhase >= 2 && visibleTaskCount > 0 && (
                <motion.div key="action-count" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: isMobile ? 34 : 42, fontWeight: 700, color: activeTab === "todo" && urgentRemaining > 0 ? URGENT : TEXT, lineHeight: 1 }}>
                        {activeTab === "todo"
                          ? TASKS.slice(0, visibleTaskCount).filter(t => !treatedIds.has(t.id)).length
                          : INBOX_EMAILS.length
                        }
                      </span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>
                          {activeTab === "todo" ? "tâches" : "emails"}
                        </div>
                        <div style={{ fontSize: 12, color: TEXT_MUTED }}>aujourd'hui</div>
                      </div>
                    </div>
                    {activeTab === "todo" && urgentRemaining > 0 && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: URGENT_BG, border: `1px solid rgba(192,57,43,0.2)` }}>
                        <Zap size={12} color={URGENT} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: URGENT }}>{urgentRemaining} urgente{urgentRemaining > 1 ? "s" : ""}</span>
                      </motion.div>
                    )}
                  </div>
                  {/* Onglets To-do list / Inbox */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                    <button
                      onClick={() => setActiveTab("todo")}
                      style={{
                        padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer",
                        fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                        background: activeTab === "todo" ? ACCENT : "#F0F1F3",
                        color: activeTab === "todo" ? "#fff" : TEXT_MUTED,
                        transition: "all 0.18s",
                      }}
                    >
                      To-do list
                    </button>
                    <button
                      onClick={() => setActiveTab("inbox")}
                      style={{
                        padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer",
                        fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                        background: activeTab === "inbox" ? ACCENT : "#F0F1F3",
                        color: activeTab === "inbox" ? "#fff" : TEXT_MUTED,
                        transition: "all 0.18s",
                      }}
                    >
                      Inbox
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tasks — onglet To-do list */}
            <AnimatePresence>
              {visibleTaskCount > 0 && animPhase >= 2 && activeTab === "todo" && (
                <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ marginBottom: 8 }}>
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

            {/* Inbox — onglet Inbox */}
            <AnimatePresence>
              {animPhase >= 2 && activeTab === "inbox" && (
                <motion.div key="inbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ marginBottom: 8 }}>
                  {/* Filtres discrets */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginBottom: 14 }}>
                    <select
                      value={inboxPeriodFilter}
                      onChange={e => setInboxPeriodFilter(e.target.value as "24h" | "7j" | "30j")}
                      style={{ fontSize: 11, color: TEXT_MUTED, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", outline: "none", appearance: "none", WebkitAppearance: "none", paddingRight: 12 }}
                    >
                      <option value="24h">24 dernières heures</option>
                      <option value="7j">7 derniers jours</option>
                      <option value="30j">30 derniers jours</option>
                    </select>
                    <span style={{ color: BORDER, fontSize: 12 }}>|</span>
                    <select
                      value={inboxTypeFilter}
                      onChange={e => setInboxTypeFilter(e.target.value as "tous" | "dossiers" | "bruit")}
                      style={{ fontSize: 11, color: TEXT_MUTED, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", outline: "none", appearance: "none", WebkitAppearance: "none", paddingRight: 12 }}
                    >
                      <option value="tous">Tous</option>
                      <option value="dossiers">Dossiers</option>
                      <option value="bruit">Bruit</option>
                    </select>
                  </div>
                  {/* Liste emails */}
                  {(() => {
                    const now = new Date()
                    const filtered = INBOX_EMAILS.filter(email => {
                      // Filtre type
                      if (inboxTypeFilter === "dossiers" && email.isBruit) return false
                      if (inboxTypeFilter === "bruit" && !email.isBruit) return false
                      // Filtre période (simplifié : on filtre par index de getDaysAgo)
                      // Les emails avec getDaysAgo(0) ou (1) = 24h, getDaysAgo(0-7) = 7j, tout = 30j
                      // On extrait le numéro de jour depuis la date formatée — approche : comparer avec getDaysAgo
                      if (inboxPeriodFilter === "24h") {
                        const d0 = getDaysAgo(0); const d1 = getDaysAgo(1)
                        return email.date === d0 || email.date === d1
                      }
                      if (inboxPeriodFilter === "7j") {
                        const days7 = Array.from({ length: 8 }, (_, i) => getDaysAgo(i))
                        return days7.includes(email.date)
                      }
                      return true // 30j = tout
                    })
                    return filtered.map(email => (
                      <div key={email.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, marginBottom: 8, background: BG, overflow: "hidden" }}>
                        <div
                          onClick={() => setExpandedEmailId(prev => prev === email.id ? null : email.id)}
                          style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                        >
                          {/* Initiale expéditeur */}
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: email.isBruit ? "#F0F1F3" : INITIALS_BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: INITIALS_TEXT, flexShrink: 0 }}>
                            {email.sender.charAt(0)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 1 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: email.isBruit ? TEXT_MUTED : TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.sender}</span>
                              <span style={{ fontSize: 11, color: TEXT_LIGHT, flexShrink: 0 }}>{email.date}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 12, color: email.isBruit ? TEXT_MUTED : TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{email.subject}</span>
                              {email.dossier && (
                                <span style={{ fontSize: 10, color: TEXT_LIGHT, background: SIDEBAR_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "1px 6px", flexShrink: 0, whiteSpace: "nowrap" }}>{email.dossier}</span>
                              )}
                            </div>
                          </div>
                          <ChevronDown size={13} color={TEXT_LIGHT} style={{ flexShrink: 0, transform: expandedEmailId === email.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                        </div>
                        <AnimatePresence>
                          {expandedEmailId === email.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22 }}
                              style={{ overflow: "hidden" }}
                            >
                              <div style={{ padding: "14px 18px 16px", borderTop: `1px solid ${BORDER}` }}>
                                <div style={{ marginBottom: 10 }}>
                                  <div style={{ fontSize: 12, lineHeight: 1.7 }}>
                                    <span style={{ color: TEXT_LIGHT, display: "inline-block", minWidth: 52 }}>De</span>
                                    <span style={{ fontWeight: 600, color: TEXT }}>{email.sender}</span>
                                  </div>
                                  <div style={{ fontSize: 12, lineHeight: 1.7 }}>
                                    <span style={{ color: TEXT_LIGHT, display: "inline-block", minWidth: 52 }}>Date</span>
                                    <span style={{ color: TEXT }}>{email.date}</span>
                                  </div>
                                  <div style={{ fontSize: 12, lineHeight: 1.7 }}>
                                    <span style={{ color: TEXT_LIGHT, display: "inline-block", minWidth: 52 }}>Objet</span>
                                    <span style={{ color: TEXT }}>{email.subject}</span>
                                  </div>
                                </div>
                                <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.75, margin: "0 0 8px" }}>{email.resume}</p>
                                {email.dossier && (
                                  <div style={{ marginTop: 10 }}>
                                    <span style={{ fontSize: 11, color: TEXT_LIGHT, background: SIDEBAR_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "2px 8px" }}>Dossier : {email.dossier}</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHASE D: ROI — Donna voice */}
            <AnimatePresence>
              {roiVisible && (
                <motion.div key="roi"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                  style={{ marginTop: 20, padding: isMobile ? "16px" : "20px 24px", borderRadius: 10, background: SIDEBAR_BG, border: `1px solid ${BORDER}` }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: TEXT, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>D</div>
                    <DonnaVoice lines={PHASE_D_DONNA_LINES} active={phaseDActive} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHASE E: CTA */}
            <AnimatePresence>
              {animDone && (
                <motion.div key="cta"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                  style={{ marginTop: 24, padding: isMobile ? "18px" : "22px 28px", borderRadius: 10, background: ACCENT, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: isMobile ? 24 : 0 }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 5 }}>Vous aimez ce que vous voyez ?</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>Connectez votre vraie boîte mail — 14 jours gratuits.</div>
                  </div>
                  <Link to="/contact" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 22px", borderRadius: 8, background: "#fff", color: ACCENT, fontSize: 14, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
                    Demander un essai <Send size={13} />
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
