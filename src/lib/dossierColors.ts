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

// ─── Matching event ↔ dossier (multi-critères, scoré) ───────────────────────
//
// Trois signaux, par ordre de fiabilité :
//   1. case_reference (RG 2026/00892) — match exact normalisé → score 100 (lock)
//   2. opposing_party (Distri-Plus SARL) — premier mot ↔ event.counterparty → score 50
//   3. nom_client (premier mot) — match dans event.client + event.counterparty → score 10
//
// Pourquoi pas un seul critère : pour un vrai cabinet, plusieurs dossiers
// peuvent partager un mot du client (ex: "SAS"), ou un même opposing_party
// peut apparaître côté client d'une autre affaire. La référence de procédure
// départage avec certitude.

export interface DossierMatchInput {
  nom_client: string;
  opposing_party?: string | null;
  case_reference?: string | null;
}

function normalize(s: string | null | undefined): string {
  return (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function firstWord(s: string | null | undefined): string {
  const norm = normalize(s);
  return norm.split(" ")[0] || "";
}

function scoreDossier(
  d: DossierMatchInput,
  client: string,
  counterparty: string,
  caseRef: string
): number {
  // 1. case_reference exact (after normalizing) → 100
  const dRef = normalize(d.case_reference);
  if (dRef && caseRef && (dRef === caseRef || caseRef.includes(dRef) || dRef.includes(caseRef))) {
    return 100;
  }

  // 2. opposing_party premier mot dans (client OU counterparty)
  // Les rôles peuvent s'inverser dans un thread (ex: mail du greffe où l'event.client
  // pointe vers la partie adverse du dossier). On cherche dans les deux.
  const dOpp = firstWord(d.opposing_party);
  if (dOpp && (client.includes(dOpp) || counterparty.includes(dOpp))) {
    return 50;
  }

  // 3. nom_client premier mot dans (client OU counterparty)
  const dClient = firstWord(d.nom_client);
  if (dClient && (client.includes(dClient) || counterparty.includes(dClient))) {
    return 10;
  }

  return 0;
}

// Renvoie l'index du dossier le mieux matché, ou -1 si aucun match.
export function findDossierIndex(
  clientName: string | null | undefined,
  counterpartyName: string | null | undefined,
  caseRef: string | null | undefined,
  dossiers: DossierMatchInput[]
): number {
  const c = normalize(clientName);
  const cp = normalize(counterpartyName);
  const ref = normalize(caseRef);

  let bestIdx = -1;
  let bestScore = 0;
  for (let i = 0; i < dossiers.length; i++) {
    const score = scoreDossier(dossiers[i], c, cp, ref);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestIdx;
}

// Renvoie la couleur du dossier matchant, ou null si pas de match.
// Conserve la signature legacy 2-args (client + counterparty) pour
// compatibilité avec l'ancien code, et accepte un 4ème arg optionnel case_ref.
export function colorForClient(
  clientName: string | null | undefined,
  counterpartyName: string | null | undefined,
  dossiers: DossierMatchInput[],
  caseRef?: string | null
): DossierColor | null {
  const idx = findDossierIndex(clientName, counterpartyName, caseRef ?? null, dossiers);
  return idx >= 0 ? colorByIndex(idx) : null;
}
