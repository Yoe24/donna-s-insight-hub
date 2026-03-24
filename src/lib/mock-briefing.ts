// Mock briefing data for demo mode — matches the API shape of /api/briefs/today
// but restructured as a narrative situational briefing

export interface BriefingDossier {
  dossier_id: string;
  nom: string;
  domaine: string;
  needs_immediate_attention: boolean;
  new_emails_count: number;
  summary: string;
  // Narrative fields for the briefing
  emails_narrative: string; // e.g. "Me Bernard a envoyé les conclusions adverses."
  pieces_narrative: string | null; // e.g. "2 pièces jointes reçues : ..."
  dates_cles: string[];
  deadline_days: number | null; // days until nearest deadline, null if none
  // "En attente" data
  attente?: { description: string; jours: number } | null;
}

export interface BriefingData {
  content: {
    executive_summary: string;
    stats: {
      emails_analyzed: number;
      dossiers_count: number;
      deadline_soon_count: number;
      needs_response_count: number;
      temps_gagne_minutes: number;
    };
    dossiers: BriefingDossier[];
  };
}

export const mockBriefing: BriefingData = {
  content: {
    executive_summary: "Vous avez reçu 29 emails sur 7 dossiers depuis hier.",
    stats: {
      emails_analyzed: 29,
      dossiers_count: 7,
      deadline_soon_count: 1,
      needs_response_count: 3,
      temps_gagne_minutes: 145,
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
          "Mme Dupont a demandé des nouvelles sur l'avancement de la procédure. L'entreprise BTP Pro n'a toujours pas répondu à la mise en demeure.",
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
          "M. Martin a posé une question sur le montant des indemnités. Le service RH de TechCorp a confirmé le 2e entretien.",
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
          "L'expert judiciaire a transmis son rapport définitif confirmant les désordres structurels.",
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
          "Le Tribunal a envoyé la convocation pour l'audience du 15 avril, salle 3B.",
        pieces_narrative: "1 pièce jointe reçue : convocation TGI (PDF).",
        dates_cles: ["10 avril 2026 — Date limite pièces complémentaires", "15 avril 2026 — Audience TGI"],
        deadline_days: 32,
        attente: {
          description: "Pièces complémentaires demandées à Mme Dubois le 3 mars, pas encore reçues",
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
          "Mme Bernard a demandé un premier rendez-vous pour entamer la procédure de divorce.",
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
