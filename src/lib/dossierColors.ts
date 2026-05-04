// Couleurs partagées entre sidebar (Tailwind classes) et calendar grid (hex literals).
// L'ordre est en alternance chaud/froid pour éviter teintes proches côte à côte.

export const DOSSIER_COLORS = [
  { bgClass: "bg-rose-100",    textClass: "text-rose-700",    bg: "#ffe4e6", text: "#9f1239" },
  { bgClass: "bg-sky-100",     textClass: "text-sky-700",     bg: "#e0f2fe", text: "#0369a1" },
  { bgClass: "bg-amber-100",   textClass: "text-amber-700",   bg: "#fef3c7", text: "#92400e" },
  { bgClass: "bg-violet-100",  textClass: "text-violet-700",  bg: "#ede9fe", text: "#6d28d9" },
  { bgClass: "bg-emerald-100", textClass: "text-emerald-700", bg: "#d1fae5", text: "#065f46" },
  { bgClass: "bg-orange-100",  textClass: "text-orange-700",  bg: "#ffedd5", text: "#9a3412" },
  { bgClass: "bg-teal-100",    textClass: "text-teal-700",    bg: "#ccfbf1", text: "#0f766e" },
  { bgClass: "bg-pink-100",    textClass: "text-pink-700",    bg: "#fce7f3", text: "#9f1239" },
];

export type DossierColor = (typeof DOSSIER_COLORS)[number];

export function colorByIndex(index: number): DossierColor {
  return DOSSIER_COLORS[index % DOSSIER_COLORS.length];
}

// Match un nom client/adverse à un dossier (par premier mot du nom_client).
// Renvoie la couleur du dossier matchant, ou null si pas de match.
export function colorForClient(
  clientName: string | null | undefined,
  counterpartyName: string | null | undefined,
  dossiers: Array<{ nom_client: string }>
): DossierColor | null {
  const haystack = `${clientName ?? ""} ${counterpartyName ?? ""}`.toLowerCase();
  for (let i = 0; i < dossiers.length; i++) {
    const keyword = (dossiers[i].nom_client.split(/\s/)[0] || "").toLowerCase();
    if (keyword && haystack.includes(keyword)) {
      return colorByIndex(i);
    }
  }
  return null;
}
