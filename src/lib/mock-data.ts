export type Period = "jour" | "semaine" | "mois";

export const kpiByPeriod: Record<Period, {
  mailsRecus: number;
  mailsOuverts: number;
  brouillonsCrees: number;
  brouillonsValides: number;
  tempsGagneMinutes: number;
  tauxHoraire: number;
}> = {
  jour: {
    mailsRecus: 47,
    mailsOuverts: 38,
    brouillonsCrees: 32,
    brouillonsValides: 25,
    tempsGagneMinutes: 186,
    tauxHoraire: 350,
  },
  semaine: {
    mailsRecus: 214,
    mailsOuverts: 189,
    brouillonsCrees: 156,
    brouillonsValides: 132,
    tempsGagneMinutes: 920,
    tauxHoraire: 350,
  },
  mois: {
    mailsRecus: 843,
    mailsOuverts: 756,
    brouillonsCrees: 612,
    brouillonsValides: 498,
    tempsGagneMinutes: 3720,
    tauxHoraire: 350,
  },
};

// Keep backward compat
export const kpiData = kpiByPeriod.jour;

export const computeROI = (data: typeof kpiData) => {
  const heures = Math.floor(data.tempsGagneMinutes / 60);
  const minutes = data.tempsGagneMinutes % 60;
  const argentGagne = Math.round((data.tempsGagneMinutes / 60) * data.tauxHoraire);
  return { heures, minutes, argentGagne };
};

export type PipelineStep = "reception" | "extraction" | "classification" | "lecture_pj" | "brouillon" | "controle_juridique" | "log_activite" | "dashboard";

export interface ActivityItem {
  id: string;
  expediteur: string;
  email: string;
  objet: string;
  resume: string;
  heureReception: string;
  statut: "brouillon_genere" | "en_attente" | "valide";
  brouillon: string;
  dossier: string;
  pipelineStep: PipelineStep;
}

export const activityFeed: ActivityItem[] = [
  {
    id: "1",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "Contestation facture - Dossier Dupont",
    resume: "La cliente conteste une facture de 3 200€ reçue pour des travaux non conformes. Elle demande un recours amiable avant action judiciaire.",
    heureReception: "09:12",
    statut: "brouillon_genere",
    brouillon: "Madame Dupont,\n\nJ'ai bien pris connaissance de votre situation concernant la facture contestée de 3 200€. Je vous propose d'engager une procédure de médiation amiable dans un premier temps. Je prépare le courrier de mise en demeure à adresser à l'entreprise.\n\nCordialement,",
    dossier: "Dupont - Litige commercial",
    pipelineStep: "controle_juridique",
  },
  {
    id: "2",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Rupture conventionnelle - Question urgente",
    resume: "Le client souhaite négocier une rupture conventionnelle avec son employeur. Il demande les étapes à suivre et les indemnités auxquelles il peut prétendre.",
    heureReception: "09:45",
    statut: "brouillon_genere",
    brouillon: "Monsieur Martin,\n\nConcernant votre demande de rupture conventionnelle, voici les étapes à suivre : 1) Demande d'entretien préalable, 2) Négociation des termes, 3) Signature de la convention. Vos indemnités minimales s'élèvent à...\n\nCordialement,",
    dossier: "Martin - Droit du travail",
    pipelineStep: "brouillon",
  },
  {
    id: "3",
    expediteur: "Sophie Lefebvre",
    email: "s.lefebvre@outlook.com",
    objet: "Bail commercial - Renouvellement",
    resume: "La cliente s'inquiète du renouvellement de son bail commercial arrivant à échéance dans 3 mois. Elle souhaite connaître ses droits et les démarches à effectuer.",
    heureReception: "10:30",
    statut: "en_attente",
    brouillon: "",
    dossier: "Lefebvre - Bail commercial",
    pipelineStep: "lecture_pj",
  },
  {
    id: "4",
    expediteur: "Cabinet Moreau & Associés",
    email: "contact@moreau-associes.fr",
    objet: "Proposition de collaboration - Dossier Roux",
    resume: "Le cabinet Moreau propose une collaboration sur le dossier Roux, affaire de droit immobilier complexe. Ils recherchent un spécialiste en urbanisme.",
    heureReception: "11:15",
    statut: "brouillon_genere",
    brouillon: "Cher confrère,\n\nJe vous remercie pour cette proposition de collaboration sur le dossier Roux. Le sujet m'intéresse particulièrement. Je suis disponible pour un échange la semaine prochaine afin de discuter des modalités.\n\nConfraternellement,",
    dossier: "Roux - Immobilier",
  },
  {
    id: "5",
    expediteur: "Tribunal de Grande Instance",
    email: "greffe.tgi@justice.fr",
    objet: "Convocation audience - 15 avril",
    resume: "Convocation pour l'audience du 15 avril à 14h00, salle 3B, concernant l'affaire Dubois c/ SCI Les Tilleuls. Pièces complémentaires à transmettre avant le 10 avril.",
    heureReception: "14:02",
    statut: "valide",
    brouillon: "Madame Dubois,\n\nJe vous informe que l'audience est fixée au 15 avril à 14h00. Merci de me transmettre les dernières pièces justificatives avant le 8 avril afin que je puisse préparer le dossier.\n\nCordialement,",
    dossier: "Dubois - Litige immobilier",
  },
  {
    id: "6",
    expediteur: "Alice Bernard",
    email: "alice.b@free.fr",
    objet: "Divorce par consentement mutuel",
    resume: "Nouvelle cliente souhaitant entamer une procédure de divorce par consentement mutuel. Elle demande un premier rendez-vous et les documents nécessaires.",
    heureReception: "15:30",
    statut: "brouillon_genere",
    brouillon: "Madame Bernard,\n\nJe serais ravie de vous accompagner dans votre procédure de divorce par consentement mutuel. Pour notre premier rendez-vous, merci de préparer : livret de famille, justificatifs de revenus, et état du patrimoine.\n\nCordialement,",
    dossier: "Bernard - Droit de la famille",
  },
];

export interface DossierItem {
  id: string;
  nomClient: string;
  categorie: string;
  nombreMails: number;
  dernierMail: string;
  retention: "1 semaine" | "2 semaines" | "1 mois";
  statut: "actif" | "archivé";
}

export const dossiers: DossierItem[] = [
  { id: "1", nomClient: "Marie Dupont", categorie: "Litige commercial", nombreMails: 8, dernierMail: "Aujourd'hui", retention: "1 mois", statut: "actif" },
  { id: "2", nomClient: "Jean-Pierre Martin", categorie: "Droit du travail", nombreMails: 5, dernierMail: "Aujourd'hui", retention: "1 mois", statut: "actif" },
  { id: "3", nomClient: "Sophie Lefebvre", categorie: "Bail commercial", nombreMails: 3, dernierMail: "Hier", retention: "2 semaines", statut: "actif" },
  { id: "4", nomClient: "Famille Roux", categorie: "Immobilier", nombreMails: 12, dernierMail: "Hier", retention: "1 mois", statut: "actif" },
  { id: "5", nomClient: "Claire Dubois", categorie: "Litige immobilier", nombreMails: 15, dernierMail: "Il y a 3 jours", retention: "1 mois", statut: "actif" },
  { id: "6", nomClient: "Alice Bernard", categorie: "Droit de la famille", nombreMails: 2, dernierMail: "Aujourd'hui", retention: "1 semaine", statut: "actif" },
  { id: "7", nomClient: "Pierre Garnier", categorie: "Droit pénal", nombreMails: 7, dernierMail: "Il y a 5 jours", retention: "2 semaines", statut: "archivé" },
];
