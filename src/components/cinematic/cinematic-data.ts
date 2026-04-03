// Data for the DashboardCinematic animation (3-scene narrative, 36s)

export const EMAILS = [
  { sender: "Tribunal de Paris", initials: "TP", color: "#2563EB", subject: "Convocation audience JAF — 15 avril 2026", time: "08:12", urgent: true },
  { sender: "Me Karim Benzara", initials: "KB", color: "#3B82F6", subject: "RE: Conclusions en réponse — SCI Les Tilleuls", time: "08:34", urgent: false },
  { sender: "Cabinet Moreau", initials: "CM", color: "#10B981", subject: "Pièces complémentaires dossier Dupont", time: "09:01", urgent: false },
  { sender: "Sibel Bilge", initials: "SB", color: "#F59E0B", subject: "Demande de rendez-vous — succession Martin", time: "09:15", urgent: false },
  { sender: "Greffe TGI Nanterre", initials: "GN", color: "#EF4444", subject: "Notification jugement n°2026/1847", time: "09:28", urgent: true },
]

export const FOLDERS = [
  { name: "Dupont c/ Dupont", count: 3, color: "#2563EB" },
  { name: "SCI Les Tilleuls", count: 2, color: "#3B82F6" },
  { name: "Succession Martin", count: 1, color: "#F59E0B" },
]

// Scene 2: Dossier detail view
export const DOSSIER = {
  name: "Dupont c/ Dupont",
  type: "Droit de la famille",
  summary: "Procédure de divorce — mesures provisoires résidence des enfants. Audience JAF prévue le 15 avril 2026.",
  stats: { emails: 12, documents: 5, drafts: 3 },
  recentEmails: [
    { sender: "Tribunal de Paris", subject: "Convocation JAF", date: "03/04", urgent: true },
    { sender: "Cabinet Moreau", subject: "Pièces complémentaires", date: "03/04", urgent: false },
    { sender: "Me Benzara", subject: "Conclusions en réponse", date: "02/04", urgent: false },
  ],
  files: [
    { name: "Conclusions_v2.docx", type: "DOC", date: "02/04" },
    { name: "Jugement_2026-1847.pdf", type: "PDF", date: "01/04" },
    { name: "Convocation_JAF.pdf", type: "PDF", date: "03/04" },
    { name: "Attestation_école.pdf", type: "PDF", date: "10/03" },
  ],
}

// Scene 3: Briefing with ready drafts
export const BRIEFING = {
  greeting: "Bonjour Me Fernandez,",
  summary: "5 emails ce matin. 2 urgents, 3 brouillons prêts.",
  drafts: [
    { recipient: "Tribunal de Paris", subject: "Accusé de réception convocation JAF", status: "Prêt", preview: "Madame la Présidente, J'accuse réception de la convocation..." },
    { recipient: "Cabinet Moreau", subject: "RE: Pièces complémentaires", status: "Prêt", preview: "Cher confrère, Je vous remercie pour l'envoi des pièces..." },
    { recipient: "Sibel Bilge", subject: "RE: Rendez-vous succession", status: "Prêt", preview: "Madame, Suite à votre demande, je vous propose un..." },
  ],
  stats: [
    { label: "emails analysés", value: 5 },
    { label: "brouillons prêts", value: 3 },
    { label: "heures gagnées", value: 2 },
  ],
}

export const DONNA_STATUS = [
  "Donna trie vos emails...",
  "Donna organise vos dossiers...",
  "Donna crée vos brouillons...",
]
