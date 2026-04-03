// Data for the DashboardCinematic animation (6-scene narrative)

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

export const BRIEFING = {
  greeting: "Bonjour Me Fernandez,",
  summary: "5 emails ce matin. 2 urgents, 3 brouillons prêts.",
  bullets: [
    "Convocation audience JAF le 15 avril, salle 12",
    "Conclusions Benzara à valider avant jeudi",
    "Notification jugement Nanterre à télécharger",
  ],
  stats: [
    { label: "emails analysés", value: 5 },
    { label: "brouillons prêts", value: 3 },
    { label: "heures gagnées", value: 2 },
  ],
}

export const ANALYSIS_SUMMARY = "Email du Tribunal de Paris : convocation à l'audience JAF du 15 avril 2026 à 14h, salle 12. Objet : mesures provisoires résidence des enfants."

export const CHAT_MESSAGES = [
  { from: "donna" as const, text: "Convocation JAF le 15 avril à 14h, salle 12. Voulez-vous que je prépare un récapitulatif du dossier ?" },
  { from: "user" as const, text: "Oui, prépare les conclusions" },
  { from: "donna" as const, text: "C'est noté. Brouillon en cours..." },
]

export const TODOS = [
  { text: "Relire conclusions Benzara", done: true },
  { text: "Télécharger jugement Nanterre", done: true },
  { text: "Préparer audience JAF 15/04", done: false },
]

export const DRAFT_TEXT = "Madame la Présidente,\n\nJ'ai l'honneur de vous adresser les présentes conclusions dans l'intérêt de Mme Dupont, dans le cadre de la procédure relative aux mesures provisoires..."

export const DOSSIER_FILES = [
  { name: "Conclusions_v2.docx", type: "doc", date: "02/04" },
  { name: "Jugement_2026-1847.pdf", type: "pdf", date: "01/04" },
  { name: "Convocation_JAF.pdf", type: "pdf", date: "03/04" },
  { name: "PV_audience_mars.pdf", type: "pdf", date: "15/03" },
  { name: "Attestation_école.pdf", type: "pdf", date: "10/03" },
]
