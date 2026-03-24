// Mock briefing data for demo mode — matches the API shape of /api/briefs/today

export interface BriefingDossier {
  dossier_id: string;
  nom: string;
  domaine: string;
  needs_immediate_attention: boolean;
  new_emails_count: number;
  summary: string;
  // One-line narrative for briefing view
  emails_narrative: string;
  pieces_narrative: string | null;
  dates_cles: string[];
  deadline_days: number | null;
  attente?: { description: string; jours: number } | null;
}

export interface BriefingStats {
  emails_analyzed: number;
  emails_dossiers: number;
  emails_generaux: number;
  dossiers_count: number;
  deadline_soon_count: number;
  needs_response_count: number;
  temps_gagne_minutes: number;
  pieces_extraites: number;
  dates_detectees: number;
}

export interface BriefingData {
  content: {
    executive_summary: string;
    stats: BriefingStats;
    dossiers: BriefingDossier[];
  };
}

export const mockBriefing: BriefingData = {
  content: {
    executive_summary: "Vous avez reçu 29 emails sur 7 dossiers depuis hier.",
    stats: {
      emails_analyzed: 29,
      emails_dossiers: 22,
      emails_generaux: 7,
      dossiers_count: 7,
      deadline_soon_count: 1,
      needs_response_count: 3,
      temps_gagne_minutes: 145,
      pieces_extraites: 3,
      dates_detectees: 2,
    },
    dossiers: [
      {
        dossier_id: "1",
        nom: "Marie Dupont",
        domaine: "Litige commercial",
        needs_immediate_attention: true,
        new_emails_count: 3,
        summary: "Mme Dupont conteste une facture de 3 200 € pour travaux non conformes.",
        emails_narrative:
          "Mme Dupont demande des nouvelles, BTP Pro n'a pas répondu à la mise en demeure",
        pieces_narrative: "1 pièce jointe reçue : photos complémentaires des travaux (JPEG).",
        dates_cles: ["14 mars 2026 — Expiration mise en demeure"],
        deadline_days: 4,
        attente: {
          description: "Mise en demeure envoyée le 2 mars, pas de réponse de BTP Pro",
          jours: 22,
        },
      },
      {
        dossier_id: "2",
        nom: "Jean-Pierre Martin",
        domaine: "Droit du travail",
        needs_immediate_attention: true,
        new_emails_count: 2,
        summary: "Rupture conventionnelle en cours de négociation avec SAS TechCorp.",
        emails_narrative:
          "2e entretien confirmé par RH TechCorp, simulation d'indemnités reçue",
        pieces_narrative: "1 pièce jointe reçue : simulation d'indemnités (PDF).",
        dates_cles: ["12 mars 2026 — 2e entretien employeur"],
        deadline_days: 2,
        attente: null,
      },
      {
        dossier_id: "4",
        nom: "Famille Roux",
        domaine: "Immobilier",
        needs_immediate_attention: false,
        new_emails_count: 1,
        summary: "Vices cachés confirmés par l'expertise. Audience fixée au 20 mars.",
        emails_narrative:
          "Rapport d'expertise définitif reçu, désordres structurels confirmés",
        pieces_narrative:
          "2 pièces jointes reçues : rapport d'expertise définitif (PDF), annexe photographique (PDF).",
        dates_cles: ["20 mars 2026 — Audience TGI"],
        deadline_days: 10,
        attente: null,
      },
      {
        dossier_id: "5",
        nom: "Claire Dubois",
        domaine: "Litige immobilier",
        needs_immediate_attention: false,
        new_emails_count: 1,
        summary: "Charges de copropriété abusives. Audience le 15 avril.",
        emails_narrative:
          "Convocation audience 15 avril reçue, salle 3B",
        pieces_narrative: "1 pièce jointe reçue : convocation TGI (PDF).",
        dates_cles: ["10 avril 2026 — Date limite pièces complémentaires", "15 avril 2026 — Audience TGI"],
        deadline_days: 32,
        attente: {
          description: "Pièces complémentaires demandées à Mme Dubois le 3 mars",
          jours: 21,
        },
      },
      {
        dossier_id: "6",
        nom: "Alice Bernard",
        domaine: "Droit de la famille",
        needs_immediate_attention: false,
        new_emails_count: 1,
        summary: "Nouveau dossier — divorce par consentement mutuel.",
        emails_narrative:
          "Demande de premier rendez-vous pour procédure de divorce",
        pieces_narrative: null,
        dates_cles: [],
        deadline_days: null,
        attente: null,
      },
    ],
  },
};

export const mockConfig = {
  nom_avocat: "Alexandra",
  refresh_token: null,
  profil_style: "",
  signature: "",
  taux_horaire: null,
};
