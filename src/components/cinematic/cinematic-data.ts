// Fake data for the DashboardCinematic animation

export const EMAILS = [
  { sender: "Tribunal de Paris", initials: "TP", color: "#2563EB", subject: "Convocation audience JAF — 15 avril 2026", time: "08:12" },
  { sender: "Me Karim Benzara", initials: "KB", color: "#3B82F6", subject: "RE: Conclusions en réponse — SCI Les Tilleuls", time: "08:34" },
  { sender: "Cabinet Moreau", initials: "CM", color: "#10B981", subject: "Pièces complémentaires dossier Dupont", time: "09:01" },
  { sender: "Sibel Bilge", initials: "SB", color: "#F59E0B", subject: "Demande de rendez-vous — succession Martin", time: "09:15" },
  { sender: "Greffe TGI Nanterre", initials: "GN", color: "#EF4444", subject: "Notification jugement n°2026/1847", time: "09:28" },
]

export const FOLDERS = [
  { name: "Dupont c/ Dupont", count: 3, color: "#2563EB" },
  { name: "SCI Les Tilleuls", count: 2, color: "#3B82F6" },
  { name: "Succession Martin", count: 1, color: "#F59E0B" },
]

export const BRIEFING = {
  greeting: "Bonjour Me Fernandez,",
  summary: "5 emails ce matin. 2 urgents, 3 brouillons prets.",
  bullets: [
    "Convocation audience JAF le 15 avril, salle 12",
    "Conclusions Benzara a valider avant jeudi",
    "Notification jugement Nanterre a telecharger",
  ],
  stats: [
    { label: "emails analyses", value: 5 },
    { label: "brouillons prets", value: 3 },
    { label: "heures gagnees", value: 2 },
  ],
}

export const ANALYSIS_SUMMARY = "Email du Tribunal de Paris : convocation a l'audience JAF du 15 avril 2026 a 14h, salle 12. Objet : mesures provisoires residence des enfants."
