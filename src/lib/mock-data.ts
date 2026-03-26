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

export interface MockAttachment {
  id: string;
  filename: string;
  type: string;
  date: string;
}

export interface ActivityItem {
  id: string;
  expediteur: string;
  email: string;
  objet: string;
  resume: string;
  contenu: string;
  heureReception: string;
  created_at: string;
  statut: "brouillon_genere" | "en_attente" | "valide";
  brouillon: string;
  dossier: string;
  dossier_id: string | null;
  pipelineStep: PipelineStep;
  attachments: MockAttachment[];
}

export const activityFeed: ActivityItem[] = [
  {
    id: "1",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "Avancement de la procédure ?",
    resume: "Mme Dupont demande où en est la mise en demeure envoyée à BTP Pro le 2 mars. Elle souhaite savoir si une réponse a été reçue.",
    contenu: "Bonjour Maître Fernandez,\n\nJe me permets de vous relancer concernant la mise en demeure que vous avez envoyée à BTP Pro le 2 mars dernier.\n\nAvez-vous reçu une réponse de leur part ? Le silence de cette entreprise m'inquiète beaucoup. Les travaux non conformes continuent de causer des dégâts — j'ai constaté de nouvelles fissures sur la façade nord ce week-end (photos en pièce jointe).\n\nQuelles sont les prochaines étapes si BTP Pro ne répond pas avant l'expiration du délai ?\n\nJe vous remercie pour votre aide,\nMarie Dupont",
    heureReception: "09:12",
    created_at: "2026-03-23T09:12:00Z",
    statut: "brouillon_genere",
    brouillon: "Madame Dupont,\n\nJ'ai bien pris connaissance de votre situation concernant la facture contestée de 3 200€. Je vous propose d'engager une procédure de médiation amiable dans un premier temps. Je prépare le courrier de mise en demeure à adresser à l'entreprise.\n\nCordialement,",
    dossier: "Dupont - Litige commercial",
    dossier_id: "1",
    pipelineStep: "controle_juridique",
    attachments: [
      { id: "att-1-1", filename: "photos_travaux_complementaires.jpeg", type: "image", date: "2026-03-23T09:12:00Z" },
    ],
  },
  {
    id: "2",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Simulation d'indemnités",
    resume: "M. Martin transmet la simulation d'indemnités reçue de son employeur. Il souhaite votre avis sur le montant proposé (8 400 € indemnité légale).",
    contenu: "Bonjour Maître,\n\nJe viens de recevoir la simulation d'indemnités de mon employeur (en pièce jointe). Ils proposent l'indemnité légale uniquement, soit 8 400 €.\n\nÇa me semble faible après 7 ans dans l'entreprise. Est-ce qu'on peut négocier plus ? J'ai entendu parler d'indemnités supra-légales.\n\nMerci de me dire ce que vous en pensez avant l'entretien de mardi.\n\nCordialement,\nJean-Pierre Martin",
    heureReception: "09:45",
    created_at: "2026-03-22T17:20:00Z",
    statut: "brouillon_genere",
    brouillon: "Monsieur Martin,\n\nConcernant votre demande de rupture conventionnelle, voici les étapes à suivre : 1) Demande d'entretien préalable, 2) Négociation des termes, 3) Signature de la convention. Vos indemnités minimales s'élèvent à...\n\nCordialement,",
    dossier: "Martin - Droit du travail",
    dossier_id: "2",
    pipelineStep: "brouillon",
    attachments: [
      { id: "att-2-1", filename: "simulation_indemnites_martin.pdf", type: "pdf", date: "2026-03-22T17:20:00Z" },
    ],
  },
  {
    id: "3",
    expediteur: "BTP Pro (via avocat)",
    email: "cabinet.durand@avocat.fr",
    objet: "Contestation mise en demeure Dupont",
    resume: "L'avocat de BTP Pro conteste la non-conformité des travaux et demande un délai supplémentaire pour produire des pièces justificatives.",
    contenu: "Chère Consoeur,\n\nJ'ai l'honneur de vous écrire au nom de mon client, la société BTP Pro, en réponse à votre mise en demeure du 2 mars 2026.\n\nMon client conteste formellement la non-conformité alléguée des travaux réalisés au domicile de Mme Dupont. Vous trouverez ci-joint une attestation de conformité établie par le chef de chantier.\n\nNous sollicitons un délai supplémentaire de 15 jours pour produire l'ensemble des pièces justificatives.\n\nMe Durand\nCabinet Durand & Associés",
    heureReception: "10:30",
    created_at: "2026-03-19T16:45:00Z",
    statut: "en_attente",
    brouillon: "",
    dossier: "Dupont - Litige commercial",
    dossier_id: "1",
    pipelineStep: "lecture_pj",
    attachments: [
      { id: "att-3-1", filename: "attestation_conformite_BTP.pdf", type: "pdf", date: "2026-03-19T16:45:00Z" },
    ],
  },
  {
    id: "4",
    expediteur: "Expert judiciaire",
    email: "expert.bati@experts.fr",
    objet: "Rapport d'expertise définitif - Affaire Roux",
    resume: "Transmission du rapport d'expertise définitif confirmant les vices cachés : fissures structurelles, infiltrations, défaut d'isolation.",
    contenu: "Maître Fernandez,\n\nVeuillez trouver ci-joint mon rapport d'expertise définitif concernant le bien immobilier acquis par la famille Roux.\n\nMes conclusions confirment l'existence de vices cachés. Le coût estimé des réparations s'élève à 78 000 € HT.\n\nCordialement,\nM. Philippe Renard\nExpert judiciaire en bâtiment",
    heureReception: "11:15",
    created_at: "2026-03-22T09:00:00Z",
    statut: "brouillon_genere",
    brouillon: "Cher confrère,\n\nJe vous remercie pour la transmission du rapport. Les conclusions confirment notre position.\n\nConfraternellement,",
    dossier: "Roux - Immobilier",
    dossier_id: "4",
    pipelineStep: "dashboard",
    attachments: [
      { id: "att-4-1", filename: "rapport_expertise_definitif.pdf", type: "pdf", date: "2026-03-22T09:00:00Z" },
      { id: "att-4-2", filename: "annexe_photographique.pdf", type: "pdf", date: "2026-03-22T09:00:00Z" },
    ],
  },
  {
    id: "5",
    expediteur: "Tribunal de Grande Instance",
    email: "greffe.tgi@justice.fr",
    objet: "Convocation audience - 15 avril",
    resume: "Convocation pour l'audience du 15 avril à 14h00, salle 3B, concernant l'affaire Dubois c/ SCI Les Tilleuls. Pièces complémentaires à transmettre avant le 10 avril.",
    contenu: "Maître,\n\nPar la présente, nous vous informons que l'affaire enregistrée sous le numéro RG 25/04512, opposant Mme Claire DUBOIS à la SCI LES TILLEULS, est fixée à l'audience du 15 avril 2026 à 14h00, salle 3B.\n\nLes pièces complémentaires devront être déposées avant le 10 avril 2026.\n\nLe Greffier en chef",
    heureReception: "14:02",
    created_at: "2026-03-20T14:02:00Z",
    statut: "valide",
    brouillon: "Madame Dubois,\n\nJe vous informe que l'audience est fixée au 15 avril à 14h00. Merci de me transmettre les dernières pièces justificatives avant le 8 avril afin que je puisse préparer le dossier.\n\nCordialement,",
    dossier: "Dubois - Litige immobilier",
    dossier_id: "5",
    pipelineStep: "dashboard",
    attachments: [
      { id: "att-5-1", filename: "convocation_TGI_15avril.pdf", type: "pdf", date: "2026-03-20T14:02:00Z" },
    ],
  },
  {
    id: "6",
    expediteur: "Alice Bernard",
    email: "alice.b@free.fr",
    objet: "Divorce par consentement mutuel - Premier contact",
    resume: "Nouvelle cliente souhaitant entamer une procédure de divorce par consentement mutuel. Elle demande un premier rendez-vous et les documents nécessaires.",
    contenu: "Bonjour Maître Fernandez,\n\nJe me permets de vous contacter sur recommandation de mon amie Sophie.\n\nMon mari et moi avons décidé d'un commun accord de divorcer. Nous sommes mariés depuis 8 ans, nous avons deux enfants (6 et 4 ans).\n\nNous souhaitons un divorce par consentement mutuel. Pourriez-vous me recevoir pour un premier rendez-vous ?\n\nAlice Bernard\n06 12 34 56 78",
    heureReception: "15:30",
    created_at: "2026-03-23T15:30:00Z",
    statut: "brouillon_genere",
    brouillon: "Madame Bernard,\n\nJe serais ravie de vous accompagner dans votre procédure de divorce par consentement mutuel. Pour notre premier rendez-vous, merci de préparer : livret de famille, justificatifs de revenus, et état du patrimoine.\n\nCordialement,",
    dossier: "Bernard - Droit de la famille",
    dossier_id: "6",
    pipelineStep: "extraction",
    attachments: [],
  },
];

export type TimelineType = "recu" | "envoye" | "note";

export interface TimelineItem {
  type: TimelineType;
  expediteur: string;
  date: string;
  resume: string;
}

export interface DateCle {
  label: string;
  date: string;
}

export interface PieceDocument {
  nom: string;
  type: "pdf" | "word" | "image";
}

export interface DossierItem {
  id: string;
  nomClient: string;
  categorie: string;
  nombreMails: number;
  dernierMail: string;
  retention: "1 semaine" | "2 semaines" | "1 mois";
  statut: "actif" | "archivé";
  titre: string;
  statutDossier: string;
  piecesCollectees: number;
  piecesTotal: number;
  resumeDonna: string;
  anticipation: { texte: string; echeance: string; brouillon: string };
  timeline: TimelineItem[];
  datesCles: DateCle[];
  piecesRecues: PieceDocument[];
  piecesManquantes: string[];
}

export const dossiers: DossierItem[] = [
  {
    id: "1", nomClient: "Marie Dupont", categorie: "Litige commercial", nombreMails: 8, dernierMail: "Aujourd'hui", retention: "1 mois", statut: "actif",
    titre: "Affaire Dupont c/ Entreprise BTP Pro",
    statutDossier: "En attente du client",
    piecesCollectees: 3, piecesTotal: 5,
    resumeDonna: "Mme Dupont conteste une facture de 3 200 € pour travaux non conformes. Une mise en demeure a été envoyée le 2 mars. L'entreprise n'a pas encore répondu. Le délai de réponse expire dans 5 jours.",
    anticipation: { texte: "L'échéance de la mise en demeure expire dans 5 jours (J-5). Donna a préparé un brouillon de relance recommandée.", echeance: "14 mars 2026", brouillon: "Madame, Monsieur,\n\nFaisant suite à notre courrier de mise en demeure du 2 mars 2026 resté sans réponse à ce jour, nous vous informons que notre cliente se réserve le droit d'engager une procédure judiciaire.\n\nNous vous prions de bien vouloir nous faire parvenir votre réponse sous 48 heures.\n\nCordialement," },
    timeline: [
      { type: "recu", expediteur: "Marie Dupont", date: "9 mars, 09:12", resume: "Demande de nouvelles sur l'avancement de la procédure." },
      { type: "envoye", expediteur: "Vous", date: "5 mars, 14:30", resume: "Confirmation d'envoi de la mise en demeure par LRAR." },
      { type: "note", expediteur: "Donna", date: "2 mars, 10:00", resume: "Mise en demeure rédigée et validée. Envoi programmé." },
      { type: "recu", expediteur: "Marie Dupont", date: "28 fév, 11:20", resume: "Transmission de la facture contestée et photos des travaux." },
      { type: "recu", expediteur: "Marie Dupont", date: "25 fév, 09:00", resume: "Premier contact : description du litige avec l'entreprise BTP Pro." },
    ],
    datesCles: [
      { label: "Expiration mise en demeure", date: "14 mars 2026" },
      { label: "Délai prescription", date: "25 fév 2028" },
    ],
    piecesRecues: [
      { nom: "Facture_BTP_Pro.pdf", type: "pdf" },
      { nom: "Photos_travaux.zip", type: "image" },
      { nom: "Contrat_initial.pdf", type: "pdf" },
    ],
    piecesManquantes: ["Devis comparatif d'un autre artisan", "PV de constat d'huissier"],
  },
  {
    id: "2", nomClient: "Jean-Pierre Martin", categorie: "Droit du travail", nombreMails: 5, dernierMail: "Aujourd'hui", retention: "1 mois", statut: "actif",
    titre: "Affaire Martin c/ SAS TechCorp",
    statutDossier: "Négociation en cours",
    piecesCollectees: 4, piecesTotal: 6,
    resumeDonna: "M. Martin souhaite une rupture conventionnelle. L'employeur a accepté le principe lors du 1er entretien. Le 2e entretien est prévu le 12 mars pour finaliser les termes financiers.",
    anticipation: { texte: "Le 2e entretien est dans 3 jours (J-3). Donna a préparé une simulation des indemnités et un argumentaire de négociation.", echeance: "12 mars 2026", brouillon: "Monsieur Martin,\n\nEn vue de votre entretien du 12 mars, voici les éléments préparés :\n- Indemnité légale estimée : 8 400 €\n- Indemnité supra-légale recommandée : 12 000 €\n- Points de négociation clés à aborder.\n\nCordialement," },
    timeline: [
      { type: "recu", expediteur: "Jean-Pierre Martin", date: "9 mars, 09:45", resume: "Question sur les indemnités auxquelles il peut prétendre." },
      { type: "envoye", expediteur: "Vous", date: "7 mars, 16:00", resume: "Envoi du récapitulatif du 1er entretien." },
      { type: "note", expediteur: "Donna", date: "6 mars, 09:00", resume: "Analyse du contrat de travail : ancienneté 7 ans, statut cadre." },
      { type: "recu", expediteur: "Jean-Pierre Martin", date: "5 mars, 10:30", resume: "Transmission du contrat de travail et des 3 derniers bulletins." },
    ],
    datesCles: [
      { label: "2e entretien employeur", date: "12 mars 2026" },
      { label: "Délai rétractation (15 jours)", date: "27 mars 2026" },
    ],
    piecesRecues: [
      { nom: "Contrat_travail_Martin.pdf", type: "pdf" },
      { nom: "Bulletins_salaire.pdf", type: "pdf" },
      { nom: "CR_entretien_1.docx", type: "word" },
      { nom: "Convention_collective.pdf", type: "pdf" },
    ],
    piecesManquantes: ["Attestation employeur", "Relevé de carrière"],
  },
  {
    id: "3", nomClient: "Sophie Lefebvre", categorie: "Bail commercial", nombreMails: 3, dernierMail: "Hier", retention: "2 semaines", statut: "actif",
    titre: "Affaire Lefebvre - Renouvellement bail",
    statutDossier: "Analyse en cours",
    piecesCollectees: 2, piecesTotal: 4,
    resumeDonna: "Mme Lefebvre exploite une boutique dont le bail commercial arrive à échéance le 1er juin. Le bailleur n'a pas encore notifié ses intentions. L'analyse des clauses du bail est en cours.",
    anticipation: { texte: "Le bail expire dans 84 jours. Donna recommande d'envoyer une demande de renouvellement par acte d'huissier avant le 1er avril.", echeance: "1 avril 2026", brouillon: "Madame Lefebvre,\n\nAfin de sécuriser le renouvellement de votre bail, je vous recommande de signifier votre demande par acte d'huissier avant le 1er avril 2026. Je prépare l'acte.\n\nCordialement," },
    timeline: [
      { type: "recu", expediteur: "Sophie Lefebvre", date: "8 mars, 10:30", resume: "Inquiétude sur le renouvellement, demande de conseil." },
      { type: "envoye", expediteur: "Vous", date: "7 mars, 15:00", resume: "Demande des pièces du bail en cours." },
      { type: "recu", expediteur: "Sophie Lefebvre", date: "6 mars, 09:00", resume: "Premier contact et envoi du bail actuel." },
    ],
    datesCles: [
      { label: "Date limite demande renouvellement", date: "1 avril 2026" },
      { label: "Échéance du bail", date: "1 juin 2026" },
    ],
    piecesRecues: [
      { nom: "Bail_commercial_2020.pdf", type: "pdf" },
      { nom: "Avenant_2022.pdf", type: "pdf" },
    ],
    piecesManquantes: ["Dernières quittances de loyer", "État des lieux d'entrée"],
  },
  {
    id: "4", nomClient: "Famille Roux", categorie: "Immobilier", nombreMails: 12, dernierMail: "Hier", retention: "1 mois", statut: "actif",
    titre: "Affaire Roux c/ Promoteur ImmoBat",
    statutDossier: "Audience programmée",
    piecesCollectees: 5, piecesTotal: 5,
    resumeDonna: "La famille Roux a acquis un bien avec des vices cachés (fissures structurelles). L'expertise judiciaire a confirmé les désordres. L'audience est fixée au 20 mars. Le dossier est complet.",
    anticipation: { texte: "L'audience est dans 11 jours (J-11). Donna a préparé les conclusions récapitulatives à déposer.", echeance: "20 mars 2026", brouillon: "Monsieur et Madame Roux,\n\nL'audience est fixée au 20 mars. Les conclusions récapitulatives sont prêtes. Je vous invite à un point téléphonique le 18 mars pour préparer l'audience.\n\nCordialement," },
    timeline: [
      { type: "note", expediteur: "Donna", date: "8 mars, 14:00", resume: "Conclusions récapitulatives finalisées, prêtes pour dépôt." },
      { type: "envoye", expediteur: "Vous", date: "5 mars, 11:00", resume: "Transmission du rapport d'expertise au tribunal." },
      { type: "recu", expediteur: "Expert judiciaire", date: "1 mars, 09:00", resume: "Rapport d'expertise confirmant les vices cachés." },
      { type: "recu", expediteur: "Famille Roux", date: "20 fév, 16:00", resume: "Photos complémentaires des fissures." },
      { type: "envoye", expediteur: "Vous", date: "15 fév, 10:00", resume: "Assignation déposée au greffe." },
    ],
    datesCles: [
      { label: "Audience TGI", date: "20 mars 2026" },
      { label: "Point téléphonique client", date: "18 mars 2026" },
    ],
    piecesRecues: [
      { nom: "Rapport_expertise.pdf", type: "pdf" },
      { nom: "Acte_vente.pdf", type: "pdf" },
      { nom: "Photos_fissures.zip", type: "image" },
      { nom: "Assignation.pdf", type: "pdf" },
      { nom: "Devis_reparations.pdf", type: "pdf" },
    ],
    piecesManquantes: [],
  },
  {
    id: "5", nomClient: "Claire Dubois", categorie: "Litige immobilier", nombreMails: 15, dernierMail: "Il y a 3 jours", retention: "1 mois", statut: "actif",
    titre: "Affaire Dubois c/ SCI Les Tilleuls",
    statutDossier: "En attente de pièces",
    piecesCollectees: 3, piecesTotal: 5,
    resumeDonna: "Mme Dubois conteste des charges de copropriété abusives. L'AG de copropriété a voté des travaux sans respecter les règles de majorité. Convocation audience fixée au 15 avril.",
    anticipation: { texte: "Pièces complémentaires à transmettre avant le 10 avril (J-32). Donna vous rappellera 7 jours avant l'échéance.", echeance: "10 avril 2026", brouillon: "Madame Dubois,\n\nPour finaliser votre dossier avant l'audience du 15 avril, j'aurais besoin des pièces suivantes : le PV de la dernière AG et vos relevés de charges des 2 dernières années.\n\nCordialement," },
    timeline: [
      { type: "recu", expediteur: "Tribunal de Grande Instance", date: "6 mars, 14:02", resume: "Convocation audience du 15 avril, salle 3B." },
      { type: "envoye", expediteur: "Vous", date: "3 mars, 09:00", resume: "Demande de pièces complémentaires à Mme Dubois." },
      { type: "recu", expediteur: "Claire Dubois", date: "28 fév, 11:00", resume: "Envoi des relevés de charges partiels." },
      { type: "note", expediteur: "Donna", date: "25 fév, 14:00", resume: "Analyse des statuts de copropriété : irrégularité détectée art. 25." },
    ],
    datesCles: [
      { label: "Date limite pièces complémentaires", date: "10 avril 2026" },
      { label: "Audience TGI", date: "15 avril 2026" },
    ],
    piecesRecues: [
      { nom: "Statuts_copropriete.pdf", type: "pdf" },
      { nom: "Releves_charges.pdf", type: "pdf" },
      { nom: "Convocation_TGI.pdf", type: "pdf" },
    ],
    piecesManquantes: ["PV dernière AG de copropriété", "Relevés de charges année N-1"],
  },
  {
    id: "6", nomClient: "Alice Bernard", categorie: "Droit de la famille", nombreMails: 2, dernierMail: "Aujourd'hui", retention: "1 semaine", statut: "actif",
    titre: "Affaire Bernard - Divorce consentement mutuel",
    statutDossier: "Premier contact",
    piecesCollectees: 0, piecesTotal: 4,
    resumeDonna: "Nouvelle cliente souhaitant un divorce par consentement mutuel. Premier rendez-vous à planifier. Aucune pièce n'a encore été transmise.",
    anticipation: { texte: "Aucune pièce collectée. Donna recommande d'envoyer la checklist documentaire à Mme Bernard.", echeance: "—", brouillon: "Madame Bernard,\n\nSuite à votre demande, voici la liste des documents nécessaires pour initier la procédure :\n- Livret de famille\n- Justificatifs de revenus (3 derniers mois)\n- État du patrimoine commun\n- Pièce d'identité\n\nCordialement," },
    timeline: [
      { type: "recu", expediteur: "Alice Bernard", date: "9 mars, 15:30", resume: "Demande de RDV pour entamer la procédure de divorce." },
    ],
    datesCles: [
      { label: "RDV initial à planifier", date: "À définir" },
    ],
    piecesRecues: [],
    piecesManquantes: ["Livret de famille", "Justificatifs de revenus", "État du patrimoine", "Pièce d'identité"],
  },
  {
    id: "7", nomClient: "Pierre Garnier", categorie: "Droit pénal", nombreMails: 7, dernierMail: "Il y a 5 jours", retention: "2 semaines", statut: "archivé",
    titre: "Affaire Garnier - Défense pénale",
    statutDossier: "Classé",
    piecesCollectees: 5, piecesTotal: 5,
    resumeDonna: "Affaire classée sans suite le 1er mars. M. Garnier a été relaxé. Dossier archivé automatiquement par Donna après 5 jours d'inactivité.",
    anticipation: { texte: "Dossier archivé. Aucune action requise.", echeance: "—", brouillon: "" },
    timeline: [
      { type: "note", expediteur: "Donna", date: "4 mars, 09:00", resume: "Dossier archivé automatiquement après classement sans suite." },
      { type: "recu", expediteur: "Tribunal correctionnel", date: "1 mars, 16:00", resume: "Notification de relaxe." },
      { type: "envoye", expediteur: "Vous", date: "25 fév, 10:00", resume: "Conclusions en défense déposées." },
    ],
    datesCles: [],
    piecesRecues: [
      { nom: "Jugement_relaxe.pdf", type: "pdf" },
      { nom: "Conclusions_defense.docx", type: "word" },
      { nom: "PV_audition.pdf", type: "pdf" },
      { nom: "Plainte_initiale.pdf", type: "pdf" },
      { nom: "Attestations_temoins.pdf", type: "pdf" },
    ],
    piecesManquantes: [],
  },
];
