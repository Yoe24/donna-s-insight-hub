// Mock briefing data for demo mode — matches the API shape of /api/briefs/today

import type { DossierEmail } from "@/components/BriefingDetailPanel";

/** Email shape inside a briefing dossier (from API) */
export interface BriefingDossierEmail {
  id?: string;
  from_name?: string;
  from_email?: string;
  subject?: string;
  date?: string;
  summary?: string;
  /** Legacy field names */
  expediteur?: string;
  objet?: string;
  resume?: string | null;
  created_at?: string;
}

export interface BriefingDossier {
  dossier_id: string;
  /** API may return `name` or `nom` */
  name?: string;
  nom: string;
  /** API may return `domain` or `domaine` */
  domain?: string;
  domaine: string;
  needs_immediate_attention: boolean;
  new_emails_count: number;
  summary: string;
  emails_narrative: string;
  pieces_narrative: string | null;
  dates_cles: string[];
  deadline_days: number | null;
  attente?: { description: string; jours: number } | null;
  /** Inline emails array from the API brief */
  emails?: BriefingDossierEmail[];
  emails_recus?: BriefingDossierEmail[];
}

export interface PeriodStats {
  total: number;
  dossier_emails: number;
  general_emails: number;
  attachments_count: number;
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
  last_24h?: PeriodStats;
  last_7d?: PeriodStats;
  last_30d?: PeriodStats;
}

export interface BriefingData {
  content: {
    executive_summary: string;
    stats: BriefingStats;
    dossiers: BriefingDossier[];
    emails_by_period?: {
      last_24h: string[];
      last_7d: string[];
      last_30d: string[];
    };
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
      last_24h: { total: 8, dossier_emails: 6, general_emails: 2, attachments_count: 1 },
      last_7d: { total: 29, dossier_emails: 22, general_emails: 7, attachments_count: 3 },
      last_30d: { total: 87, dossier_emails: 64, general_emails: 23, attachments_count: 9 },
    },
    emails_by_period: {
      last_24h: ["1", "2", "6"],
      last_7d: ["1", "2", "4", "5", "6"],
      last_30d: ["1", "2", "4", "5", "6"],
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
      contenu: "Bonjour Maître Fernandez,\n\nJe me permets de vous relancer concernant la mise en demeure que vous avez envoyée à BTP Pro le 2 mars dernier.\n\nAvez-vous reçu une réponse de leur part ? Le silence de cette entreprise m'inquiète beaucoup. Les travaux non conformes continuent de causer des dégâts — j'ai constaté de nouvelles fissures sur la façade nord ce week-end (photos en pièce jointe).\n\nQuelles sont les prochaines étapes si BTP Pro ne répond pas avant l'expiration du délai ?\n\nJe vous remercie pour votre aide,\nMarie Dupont",
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
      contenu: "Bonjour Maître,\n\nJe reviens vers vous car je n'ai toujours aucune nouvelle de BTP Pro depuis l'envoi de la mise en demeure. Cela fait maintenant 19 jours.\n\nEst-ce normal qu'ils ne répondent pas ? Dois-je m'inquiéter ?\n\nBien cordialement,\nMarie Dupont",
    },
    {
      id: "e1-3",
      expediteur: "BTP Pro (via avocat)",
      email: "cabinet.durand@avocat.fr",
      objet: "Contestation mise en demeure Dupont",
      date: "19 mars 2026, 16h45",
      resume: "L'avocat de BTP Pro conteste la non-conformité des travaux et demande un délai supplémentaire pour produire des pièces justificatives.",
      contenu: "Chère Consoeur,\n\nJ'ai l'honneur de vous écrire au nom de mon client, la société BTP Pro, en réponse à votre mise en demeure du 2 mars 2026.\n\nMon client conteste formellement la non-conformité alléguée des travaux réalisés au domicile de Mme Dupont. Vous trouverez ci-joint une attestation de conformité établie par le chef de chantier.\n\nNous sollicitons un délai supplémentaire de 15 jours pour produire l'ensemble des pièces justificatives, notamment le procès-verbal de réception des travaux.\n\nDans l'attente de votre retour, je vous prie d'agréer, Chère Consoeur, l'expression de mes sentiments confraternels.\n\nMe Durand\nCabinet Durand & Associés",
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
      contenu: "Maître Fernandez,\n\nNous vous confirmons la tenue du deuxième entretien dans le cadre de la procédure de rupture conventionnelle de M. Jean-Pierre Martin.\n\nDate : 25 mars 2026 à 15h00\nLieu : Salle de réunion B2, siège TechCorp\nOrdre du jour : conditions financières de la rupture\n\nM. Martin pourra être accompagné de la personne de son choix.\n\nCordialement,\nService des Ressources Humaines\nSAS TechCorp",
    },
    {
      id: "e2-2",
      expediteur: "Jean-Pierre Martin",
      email: "jp.martin@entreprise.fr",
      objet: "Simulation d'indemnités",
      date: "22 mars 2026, 17h20",
      resume: "M. Martin transmet la simulation d'indemnités reçue de son employeur. Il souhaite votre avis sur le montant proposé.",
      contenu: "Bonjour Maître,\n\nJe viens de recevoir la simulation d'indemnités de mon employeur (en pièce jointe). Ils proposent l'indemnité légale uniquement, soit 8 400 €.\n\nÇa me semble faible après 7 ans dans l'entreprise. Est-ce qu'on peut négocier plus ? J'ai entendu parler d'indemnités supra-légales.\n\nMerci de me dire ce que vous en pensez avant l'entretien de mardi.\n\nCordialement,\nJean-Pierre Martin",
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
      contenu: "Maître Fernandez,\n\nVeuillez trouver ci-joint mon rapport d'expertise définitif concernant le bien immobilier acquis par la famille Roux, situé au 45 avenue des Lilas, 75019 Paris.\n\nMes conclusions confirment l'existence de vices cachés :\n- Fissures structurelles affectant les murs porteurs (infiltrations d'eau en sous-sol)\n- Défaut d'isolation thermique non conforme à la RT2012\n- Désordres de la charpente nécessitant une reprise complète\n\nLe coût estimé des réparations s'élève à 78 000 € HT.\n\nL'annexe photographique (67 clichés) documente l'ensemble des désordres constatés.\n\nJe reste à votre disposition pour toute question.\n\nCordialement,\nM. Philippe Renard\nExpert judiciaire en bâtiment",
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
      contenu: "Maître,\n\nPar la présente, nous vous informons que l'affaire enregistrée sous le numéro RG 25/04512, opposant Mme Claire DUBOIS à la SCI LES TILLEULS, est fixée à l'audience du :\n\n15 avril 2026 à 14h00\nSalle 3B — 2e chambre civile\nTribunal de Grande Instance de Paris\n\nLes pièces complémentaires devront être déposées au greffe avant le 10 avril 2026.\n\nVeuillez agréer, Maître, l'expression de nos salutations distinguées.\n\nLe Greffier en chef",
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
      contenu: "Bonjour Maître Fernandez,\n\nJe me permets de vous contacter sur recommandation de mon amie Sophie qui a été très satisfaite de vos services.\n\nMon mari et moi avons décidé d'un commun accord de divorcer. Nous sommes mariés depuis 8 ans, nous avons deux enfants (6 et 4 ans) et un appartement en copropriété.\n\nNous souhaitons un divorce par consentement mutuel et avons déjà trouvé un accord sur la garde des enfants (alternée) et le partage du patrimoine.\n\nPourriez-vous me recevoir pour un premier rendez-vous ? Quels documents dois-je préparer ?\n\nJe vous remercie par avance,\nAlice Bernard\n06 12 34 56 78",
    },
  ],
};

export const mockConfig = {
  nom_avocat: "Alexandra",
  nom_cabinet: "Cabinet Fernandez",
  specialite: "Droit civil et droit de la famille",
  signature: "Cordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris\nCabinet Fernandez\n12 rue de Rivoli, 75004 Paris\n01 23 45 67 89",
  formule_appel: "cher_maitre",
  formule_politesse: "cordialement",
  profil_style: "Les mails de l'Ordre des Avocats ne sont jamais urgents",
  refresh_token: null,
  taux_horaire: 350,
};
