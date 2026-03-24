// Mock briefing data for demo mode — matches the API shape of /api/briefs/today

import type { DossierEmail } from "@/components/BriefingDetailPanel";

export interface BriefingDossier {
  dossier_id: string;
  nom: string;
  domaine: string;
  needs_immediate_attention: boolean;
  new_emails_count: number;
  summary: string;
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

// Mock emails per dossier for the briefing detail panel
export const mockDossierEmails: Record<string, DossierEmail[]> = {
  "1": [
    {
      id: "e1-1",
      expediteur: "Marie Dupont",
      email: "marie.dupont@gmail.com",
      objet: "Avancement de la procédure ?",
      date: "23 mars 2026, 14h32",
      resume: "Mme Dupont demande où en est la mise en demeure envoyée à BTP Pro le 2 mars. Elle souhaite savoir si une réponse a été reçue et quelles sont les prochaines étapes.",
      pieces_jointes: [
        {
          nom: "photos_travaux_complementaires.jpeg",
          taille: "1.2 MB",
          resume: "Photos montrant les dégâts supplémentaires constatés sur la façade nord du bâtiment, datées du 20 mars 2026.",
        },
      ],
    },
    {
      id: "e1-2",
      expediteur: "Marie Dupont",
      email: "marie.dupont@gmail.com",
      objet: "RE: Mise en demeure BTP Pro",
      date: "21 mars 2026, 09h15",
      resume: "Relance sur le statut de la mise en demeure. Mme Dupont s'inquiète du silence de l'entreprise.",
    },
    {
      id: "e1-3",
      expediteur: "BTP Pro (via avocat)",
      email: "cabinet.durand@avocat.fr",
      objet: "Contestation mise en demeure Dupont",
      date: "19 mars 2026, 16h45",
      resume: "L'avocat de BTP Pro conteste la non-conformité des travaux et demande un délai supplémentaire pour produire des pièces justificatives.",
      pieces_jointes: [
        {
          nom: "attestation_conformite_BTP.pdf",
          taille: "340 KB",
          resume: "Attestation de conformité émise par le chef de chantier de BTP Pro, datée du 15 janvier 2026.",
        },
      ],
    },
  ],
  "2": [
    {
      id: "e2-1",
      expediteur: "RH TechCorp",
      email: "rh@techcorp.fr",
      objet: "Confirmation 2e entretien - Rupture conventionnelle",
      date: "23 mars 2026, 10h00",
      resume: "Le service RH confirme le 2e entretien prévu le 25 mars à 15h. L'ordre du jour portera sur les conditions financières.",
    },
    {
      id: "e2-2",
      expediteur: "Jean-Pierre Martin",
      email: "jp.martin@entreprise.fr",
      objet: "Simulation d'indemnités",
      date: "22 mars 2026, 17h20",
      resume: "M. Martin transmet la simulation d'indemnités reçue de son employeur. Il souhaite votre avis sur le montant proposé.",
      pieces_jointes: [
        {
          nom: "simulation_indemnites_martin.pdf",
          taille: "89 KB",
          resume: "Simulation chiffrant l'indemnité de rupture à 8 400 € (indemnité légale). Pas de supra-légale proposée.",
        },
      ],
    },
  ],
  "4": [
    {
      id: "e4-1",
      expediteur: "Expert judiciaire",
      email: "expert.bati@experts.fr",
      objet: "Rapport d'expertise définitif - Affaire Roux",
      date: "22 mars 2026, 09h00",
      resume: "Transmission du rapport d'expertise définitif confirmant les vices cachés : fissures structurelles, infiltrations, défaut d'isolation.",
      pieces_jointes: [
        {
          nom: "rapport_expertise_definitif.pdf",
          taille: "2.4 MB",
          resume: "Rapport de 42 pages détaillant les désordres structurels du bien acquis par la famille Roux. Conclusion : vices cachés avérés.",
        },
        {
          nom: "annexe_photographique.pdf",
          taille: "5.1 MB",
          resume: "67 photos documentant les fissures, infiltrations et défauts d'isolation constatés lors de l'expertise.",
        },
      ],
    },
  ],
  "5": [
    {
      id: "e5-1",
      expediteur: "Tribunal de Grande Instance",
      email: "greffe.tgi@justice.fr",
      objet: "Convocation audience - 15 avril",
      date: "20 mars 2026, 14h02",
      resume: "Convocation pour l'audience du 15 avril à 14h00, salle 3B, concernant l'affaire Dubois c/ SCI Les Tilleuls.",
      pieces_jointes: [
        {
          nom: "convocation_TGI_15avril.pdf",
          taille: "156 KB",
          resume: "Convocation officielle du Tribunal de Grande Instance pour l'audience du 15 avril 2026.",
        },
      ],
    },
  ],
  "6": [
    {
      id: "e6-1",
      expediteur: "Alice Bernard",
      email: "alice.b@free.fr",
      objet: "Divorce par consentement mutuel - Premier contact",
      date: "23 mars 2026, 15h30",
      resume: "Nouvelle cliente souhaitant entamer une procédure de divorce par consentement mutuel. Elle demande un premier rendez-vous et les documents nécessaires.",
    },
  ],
};

export const mockConfig = {
  nom_avocat: "Alexandra",
  refresh_token: null,
  profil_style: "",
  signature: "",
  taux_horaire: null,
};
