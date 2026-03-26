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

// ---------------------------------------------------------------------------
// MockEmail — the single source of truth for all demo emails
// ---------------------------------------------------------------------------

export interface MockEmail {
  id: string;
  expediteur: string;
  email: string;
  objet: string;
  resume: string;
  corps_original: string;
  date: string; // ISO string
  dossier_id: string | null;
  dossier_nom: string | null;
  dossier_domaine: string | null;
  category: "client" | "newsletter" | "notification" | "spam";
  email_type: "informatif" | "demande" | "relance" | "convocation" | "piece_jointe";
  pieces_jointes: { nom: string; taille: string; type_mime: string; resume_ia: string }[];
  brouillon_mock: string | null;
}

// ---------------------------------------------------------------------------
// 12 mock emails — dates relative to "today" = 2026-03-26
// ---------------------------------------------------------------------------

export const mockAllEmails: MockEmail[] = [
  // ===== LAST 24 h (March 25-26, 2026) =====
  {
    id: "e1",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "Avancement de la procédure ?",
    resume:
      "Mme Dupont demande des nouvelles de la mise en demeure envoyée à BTP Pro le 2 mars. Elle s'inquiète du silence de l'entreprise et souhaite connaître les prochaines étapes si aucune réponse n'est reçue avant l'expiration du délai.",
    corps_original:
      "Bonjour Maître Fernandez,\n\nJe me permets de vous relancer concernant la mise en demeure que vous avez envoyée à BTP Pro le 2 mars dernier.\n\nAvez-vous reçu une réponse de leur part ? Le silence de cette entreprise m'inquiète beaucoup. Les travaux non conformes continuent de causer des problèmes et je constate de nouvelles dégradations sur la façade nord.\n\nQuelles sont les prochaines étapes si BTP Pro ne répond pas avant l'expiration du délai ?\n\nJe vous remercie pour votre aide et votre réactivité.\n\nCordialement,\nMarie Dupont",
    date: "2026-03-25T14:32:00Z",
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dupont,\n\nJe vous remercie pour votre message et comprends votre inquiétude.\n\nÀ ce jour, BTP Pro n'a pas donné suite à notre mise en demeure du 2 mars. Le délai de réponse expire le 2 avril prochain.\n\nEn l'absence de réponse à cette date, je vous recommande d'engager une procédure judiciaire devant le Tribunal de commerce. Je prépare d'ores et déjà le dossier d'assignation.\n\nJe reste à votre disposition pour en discuter.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e2",
    expediteur: "Newsletter Ordre des Avocats",
    email: "newsletter@ordre-avocats-paris.fr",
    objet: "Actualités juridiques mars 2026",
    resume:
      "Newsletter mensuelle de l'Ordre des Avocats de Paris. Au sommaire : réforme de la procédure civile, nouvelles obligations RGPD pour les cabinets, et rappel des formations disponibles au 2e trimestre 2026.",
    corps_original:
      "Chers Confrères et Consoeurs,\n\nRetrouvez les actualités du mois de mars 2026 :\n\n1. Réforme de la procédure civile — Le décret n° 2026-187 du 15 mars 2026 modifie les délais de mise en état. Les nouvelles dispositions s'appliquent aux instances introduites à compter du 1er mai 2026.\n\n2. RGPD — Rappel : les cabinets doivent mettre à jour leur registre de traitement avant le 30 juin 2026.\n\n3. Formations — Inscriptions ouvertes pour les sessions de mai (droit du travail, procédure prud'homale).\n\nBonne lecture,\nL'Ordre des Avocats de Paris",
    date: "2026-03-26T07:00:00Z",
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "newsletter",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "e3",
    expediteur: "Cabinet Durand",
    email: "cabinet.durand@avocat.fr",
    objet: "Contestation mise en demeure Dupont",
    resume:
      "L'avocat de BTP Pro conteste la non-conformité des travaux invoquée par Mme Dupont. Il joint une attestation du chef de chantier et sollicite un délai de 15 jours pour produire des pièces complémentaires.",
    corps_original:
      "Chère Consoeur,\n\nJ'ai l'honneur de vous écrire au nom de mon client, la société BTP Pro, en réponse à votre mise en demeure du 2 mars 2026.\n\nMon client conteste formellement la non-conformité alléguée des travaux réalisés au domicile de Mme Dupont. Vous trouverez ci-joint une attestation de conformité établie par le chef de chantier, M. Laurent Petit, en date du 15 janvier 2026.\n\nNous sollicitons un délai supplémentaire de 15 jours pour produire l'ensemble des pièces justificatives, notamment le procès-verbal de réception des travaux et le rapport du bureau de contrôle.\n\nDans l'attente de votre retour, je vous prie d'agréer, Chère Consoeur, l'expression de mes sentiments confraternels.\n\nMe Durand\nCabinet Durand & Associés",
    date: "2026-03-25T16:45:00Z",
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "conclusions_adverses_BTP.pdf",
        taille: "420 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Conclusions adverses de BTP Pro contestant la non-conformité des travaux. L'entreprise produit une attestation du chef de chantier et demande un délai de 15 jours pour pièces complémentaires.",
      },
    ],
    brouillon_mock:
      "Cher Confrère,\n\nJ'accuse réception de votre courrier du 25 mars et des pièces jointes.\n\nJe note la contestation de votre client. Toutefois, l'attestation du chef de chantier ne saurait constituer à elle seule une preuve de conformité des travaux. Ma cliente dispose de constats d'huissier et de photographies datées établissant les malfaçons.\n\nS'agissant du délai supplémentaire sollicité, j'y consens sous réserve qu'il n'excède pas 15 jours à compter de ce jour, soit le 9 avril 2026 au plus tard.\n\nJe vous prie d'agréer, Cher Confrère, l'expression de mes sentiments confraternels.\n\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e4",
    expediteur: "Notification Tribunal",
    email: "notifications@justice.gouv.fr",
    objet: "Confirmation dépôt conclusions",
    resume:
      "Le greffe du Tribunal de commerce confirme la réception et l'enregistrement des conclusions déposées le 24 mars 2026 dans le cadre du dossier RG 26/01234. Aucune action requise.",
    corps_original:
      "Maître,\n\nNous accusons réception de vos conclusions déposées le 24 mars 2026 par voie électronique.\n\nRéférence du dossier : RG 26/01234\nDate d'enregistrement : 25 mars 2026\nNombre de pages : 18\n\nVos conclusions ont été versées au dossier et transmises à la partie adverse.\n\nLe Greffe du Tribunal de commerce de Paris",
    date: "2026-03-25T09:15:00Z",
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "notification",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },

  // ===== LAST 7 DAYS additional (March 19-24) =====
  {
    id: "e5",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Simulation d'indemnités",
    resume:
      "M. Martin transmet la simulation d'indemnités reçue de son employeur TechCorp. L'indemnité légale est chiffrée à 8 400 euros, sans aucune supra-légale proposée. Il demande conseil avant le 2e entretien.",
    corps_original:
      "Bonjour Maître,\n\nJe viens de recevoir la simulation d'indemnités de mon employeur (en pièce jointe). Ils proposent uniquement l'indemnité légale, soit 8 400 euros.\n\nAprès 7 ans dans l'entreprise et les conditions de travail que j'ai subies, cela me semble vraiment insuffisant. J'ai entendu parler d'indemnités supra-légales dans le cadre des ruptures conventionnelles.\n\nPourriez-vous analyser ce document et me dire ce que vous en pensez ? Le 2e entretien est prévu la semaine prochaine et j'aimerais être bien préparé.\n\nMerci pour votre aide,\nJean-Pierre Martin",
    date: "2026-03-22T17:20:00Z",
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "simulation_indemnites.pdf",
        taille: "89 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Simulation chiffrant l'indemnité de rupture conventionnelle à 8 400 € (indemnité légale). Aucune supra-légale proposée par l'employeur.",
      },
    ],
    brouillon_mock:
      "Cher Monsieur Martin,\n\nJ'ai bien reçu la simulation d'indemnités de votre employeur et je l'ai analysée en détail.\n\nLe montant proposé de 8 400 euros correspond effectivement au minimum légal. Compte tenu de votre ancienneté de 7 ans et des circonstances que vous m'avez décrites, je considère cette proposition insuffisante.\n\nJe recommande de négocier une indemnité supra-légale d'au moins 3 mois de salaire brut supplémentaires, soit environ 12 600 euros en sus de l'indemnité légale. Je prépare un argumentaire détaillé pour le 2e entretien.\n\nJe vous propose un point téléphonique avant l'entretien pour préparer la négociation.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e6",
    expediteur: "Service RH TechCorp",
    email: "rh@techcorp.fr",
    objet: "Confirmation 2e entretien préalable",
    resume:
      "Le service RH de TechCorp confirme le 2e entretien préalable pour la rupture conventionnelle de M. Martin, fixé au 28 mars 2026 à 15h00. L'ordre du jour porte sur les conditions financières.",
    corps_original:
      "Maître Fernandez,\n\nNous vous confirmons la tenue du deuxième entretien dans le cadre de la procédure de rupture conventionnelle de M. Jean-Pierre Martin.\n\nDate : 28 mars 2026 à 15h00\nLieu : Salle de réunion B2, siège TechCorp, 35 avenue de la Grande Armée, 75016 Paris\nOrdre du jour : conditions financières de la rupture conventionnelle\n\nM. Martin pourra être accompagné de la personne de son choix conformément à l'article L1237-12 du Code du travail.\n\nCordialement,\nService des Ressources Humaines\nSAS TechCorp",
    date: "2026-03-23T10:00:00Z",
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "convocation",
    pieces_jointes: [],
    brouillon_mock:
      "Madame, Monsieur,\n\nJ'accuse réception de votre convocation au 2e entretien préalable du 28 mars 2026 à 15h00.\n\nJe confirme que j'accompagnerai M. Martin en qualité de conseil lors de cet entretien, conformément aux dispositions de l'article L1237-12 du Code du travail.\n\nJe vous prie de bien vouloir prévoir un ordre du jour écrit détaillant les points à aborder, notamment les conditions financières envisagées.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e7",
    expediteur: "Expert judiciaire Philippe Renard",
    email: "expert.bati@experts.fr",
    objet: "Rapport d'expertise définitif - Affaire Roux",
    resume:
      "L'expert judiciaire transmet son rapport définitif de 42 pages confirmant les vices cachés du bien acquis par la famille Roux : fissures structurelles, infiltrations et défaut d'isolation. Le coût des réparations est estimé à 78 000 euros HT.",
    corps_original:
      "Maître Fernandez,\n\nVeuillez trouver ci-joint mon rapport d'expertise définitif concernant le bien immobilier acquis par la famille Roux, situé au 45 avenue des Lilas, 75019 Paris.\n\nMes conclusions confirment l'existence de désordres constitutifs de vices cachés au sens de l'article 1641 du Code civil :\n- Fissures structurelles affectant les murs porteurs avec infiltrations d'eau en sous-sol\n- Défaut d'isolation thermique non conforme à la RT2012\n- Désordres de la charpente nécessitant une reprise complète\n\nLe coût estimé des réparations s'élève à 78 000 euros HT, détaillé en annexe 3 du rapport.\n\nJe reste à votre entière disposition pour toute question complémentaire ou pour une audition devant le tribunal.\n\nCordialement,\nM. Philippe Renard\nExpert judiciaire en bâtiment près la Cour d'appel de Paris",
    date: "2026-03-21T09:00:00Z",
    dossier_id: "4",
    dossier_nom: "Famille Roux",
    dossier_domaine: "Immobilier",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "rapport_expertise_vices_caches.pdf",
        taille: "2.4 MB",
        type_mime: "application/pdf",
        resume_ia:
          "Rapport de 42 pages confirmant les vices cachés du bien acquis par la famille Roux : fissures structurelles, infiltrations, défaut d'isolation. Coût des réparations estimé à 78 000 € HT.",
      },
    ],
    brouillon_mock:
      "Monsieur l'Expert,\n\nJ'accuse réception de votre rapport d'expertise définitif et vous en remercie.\n\nVos conclusions confortent la position de mes clients, la famille Roux, quant à l'existence de vices cachés antérieurs à la vente. Le chiffrage des réparations à 78 000 euros HT constitue un élément déterminant pour notre action en garantie.\n\nJe me permettrai de vous recontacter prochainement afin de préparer votre éventuelle audition à l'audience.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e8",
    expediteur: "Cabinet comptable Fidal",
    email: "marketing@fidal.fr",
    objet: "Offre spéciale fin de trimestre",
    resume:
      "Email promotionnel du cabinet Fidal proposant une offre de fin de trimestre sur des prestations comptables et fiscales pour les professions libérales. Aucun intérêt pour le cabinet.",
    corps_original:
      "Cher(e) professionnel(le),\n\nLe cabinet Fidal vous propose une offre exceptionnelle pour la clôture de votre exercice fiscal 2025.\n\nNos prestations comprennent :\n- Bilan annuel et déclaration 2035 : à partir de 890 euros HT\n- Audit fiscal préventif : 450 euros HT\n- Optimisation de la rémunération TNS : forfait 250 euros HT\n\nOffre valable jusqu'au 31 mars 2026.\n\nContactez-nous au 01 44 55 66 77 ou répondez à cet email.\n\nCordialement,\nL'équipe commerciale Fidal",
    date: "2026-03-20T11:30:00Z",
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "spam",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },

  // ===== LAST 30 DAYS additional (Feb 25 - March 18) =====
  {
    id: "e9",
    expediteur: "Claire Dubois",
    email: "claire.dubois@orange.fr",
    objet: "Question sur l'audience du 15 avril",
    resume:
      "Mme Dubois s'inquiète de l'audience du 15 avril concernant son litige avec la SCI Les Tilleuls. Elle demande quels documents elle doit rassembler et si sa présence est obligatoire à l'audience.",
    corps_original:
      "Bonjour Maître Fernandez,\n\nJ'ai bien reçu la convocation pour l'audience du 15 avril et je suis assez stressée à l'idée de passer devant le tribunal.\n\nJ'aurais plusieurs questions :\n- Est-ce que ma présence est obligatoire le jour de l'audience ?\n- Quels documents dois-je vous fournir en complément ? J'ai retrouvé les derniers relevés de charges de 2024 et 2025.\n- La SCI Les Tilleuls a-t-elle déjà déposé ses conclusions ?\n\nJe reste disponible pour un rendez-vous si vous le jugez nécessaire.\n\nMerci beaucoup,\nClaire Dubois",
    date: "2026-03-15T11:20:00Z",
    dossier_id: "5",
    dossier_nom: "Claire Dubois",
    dossier_domaine: "Litige immobilier",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dubois,\n\nJe comprends votre inquiétude et vous rassure : votre présence à l'audience du 15 avril n'est pas obligatoire. C'est une audience de mise en état au cours de laquelle je plaiderai en votre nom.\n\nConcernant les documents, je vous remercie d'avoir retrouvé les relevés de charges 2024-2025. Merci de me les transmettre par email ou courrier avant le 5 avril afin que je puisse les intégrer à nos conclusions.\n\nLa SCI Les Tilleuls n'a pas encore déposé ses conclusions. Le délai court jusqu'au 10 avril.\n\nJe vous propose un point téléphonique la semaine prochaine pour faire le bilan.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e10",
    expediteur: "Tribunal de Grande Instance",
    email: "greffe.tgi@justice.fr",
    objet: "Convocation audience 15 avril",
    resume:
      "Convocation officielle du TGI de Paris pour l'audience du 15 avril 2026 à 14h00, salle 3B, 2e chambre civile. Affaire Dubois c/ SCI Les Tilleuls, RG 25/04512. Les pièces complémentaires doivent être déposées avant le 10 avril.",
    corps_original:
      "Maître,\n\nPar la présente, nous vous informons que l'affaire enregistrée sous le numéro RG 25/04512, opposant Mme Claire DUBOIS à la SCI LES TILLEULS, est fixée à l'audience du :\n\n15 avril 2026 à 14h00\nSalle 3B — 2e chambre civile\nTribunal de Grande Instance de Paris\n4, boulevard du Palais, 75001 Paris\n\nLes pièces complémentaires devront être déposées au greffe avant le 10 avril 2026.\n\nVeuillez agréer, Maître, l'expression de nos salutations distinguées.\n\nLe Greffier en chef",
    date: "2026-03-10T14:02:00Z",
    dossier_id: "5",
    dossier_nom: "Claire Dubois",
    dossier_domaine: "Litige immobilier",
    category: "client",
    email_type: "convocation",
    pieces_jointes: [
      {
        nom: "convocation_audience.pdf",
        taille: "156 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Convocation officielle pour l'audience du 15 avril 2026 à 14h00, salle 3B, 2e chambre civile, TGI Paris. Affaire Dubois c/ SCI Les Tilleuls, RG 25/04512.",
      },
    ],
    brouillon_mock: null,
  },
  {
    id: "e11",
    expediteur: "Alice Bernard",
    email: "alice.b@free.fr",
    objet: "Divorce par consentement mutuel - Premier contact",
    resume:
      "Nouvelle cliente souhaitant entamer un divorce par consentement mutuel. Mariée depuis 8 ans, deux enfants (6 et 4 ans), un appartement en copropriété. Accord trouvé sur la garde alternée et le partage du patrimoine. Elle demande un premier rendez-vous.",
    corps_original:
      "Bonjour Maître Fernandez,\n\nJe me permets de vous contacter sur recommandation de mon amie Sophie Leroy qui a été très satisfaite de vos services.\n\nMon mari et moi avons décidé d'un commun accord de divorcer. Nous sommes mariés depuis 8 ans sous le régime de la communauté réduite aux acquêts. Nous avons deux enfants, Léa (6 ans) et Hugo (4 ans), et un appartement en copropriété à Paris 11e.\n\nNous souhaitons un divorce par consentement mutuel et avons déjà trouvé un accord sur la garde des enfants (alternée, une semaine sur deux) et le partage du patrimoine.\n\nPourriez-vous me recevoir pour un premier rendez-vous afin de m'expliquer la procédure ? Quels documents dois-je préparer ?\n\nJe vous remercie par avance,\nAlice Bernard\n06 12 34 56 78",
    date: "2026-03-05T15:30:00Z",
    dossier_id: "6",
    dossier_nom: "Alice Bernard",
    dossier_domaine: "Droit de la famille",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Bernard,\n\nJe vous remercie pour votre prise de contact et la confiance que vous m'accordez sur recommandation de Mme Leroy.\n\nLe divorce par consentement mutuel est en effet la procédure la plus adaptée lorsque les deux époux sont d'accord. Depuis la réforme de 2017, cette procédure se fait par acte d'avocat sans passage devant le juge, sauf en présence d'un enfant demandant à être auditionné.\n\nJe vous propose un premier rendez-vous à mon cabinet. Merci de vous munir des documents suivants : livret de famille, acte de mariage, titres de propriété, et 3 derniers avis d'imposition.\n\nJe reste à votre disposition pour convenir d'une date.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e12",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "RE: Mise en demeure BTP Pro",
    resume:
      "Mme Dupont transmet des photos supplémentaires des dégâts constatés sur la façade nord de son bâtiment. Les clichés datés du 20 mars 2026 montrent des fissures visibles et des infiltrations d'eau qui se sont aggravées.",
    corps_original:
      "Bonjour Maître,\n\nComme convenu lors de notre dernier échange, je vous transmets en pièce jointe les photos complémentaires des dégâts sur la façade nord.\n\nCes photos ont été prises le 20 mars 2026. Vous constaterez que les fissures se sont élargies depuis le dernier constat et que l'infiltration d'eau est désormais visible à l'intérieur du mur.\n\nJe suis vraiment inquiète car la situation empire de semaine en semaine. Mon voisin m'a dit que cela pouvait compromettre la structure du bâtiment.\n\nMerci de me dire si ces photos pourront être utiles dans le cadre de la procédure.\n\nBien cordialement,\nMarie Dupont",
    date: "2026-03-01T09:15:00Z",
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "photos_travaux_complementaires.jpeg",
        taille: "1.2 MB",
        type_mime: "image/jpeg",
        resume_ia:
          "Photos montrant les dégâts supplémentaires sur la façade nord du bâtiment, datées du 20 mars 2026. Fissures visibles et infiltration d'eau.",
      },
    ],
    brouillon_mock:
      "Chère Madame Dupont,\n\nJe vous remercie pour l'envoi de ces photos complémentaires qui documentent clairement l'aggravation des désordres.\n\nCes clichés constituent des éléments de preuve importants qui viendront étayer notre dossier. Ils démontrent le caractère évolutif des malfaçons et renforcent notre demande de réparation intégrale.\n\nJe vous recommande par ailleurs de faire établir un constat d'huissier dans les meilleurs délais afin de figer officiellement l'état des dégradations.\n\nJe vous tiens informée de la suite de la procédure.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
];

// ---------------------------------------------------------------------------
// Helpers: filter by period & compute stats
// ---------------------------------------------------------------------------

const TODAY = new Date("2026-03-26T23:59:59Z");

function getEmailsForPeriod(period: "24h" | "7j" | "30j"): MockEmail[] {
  const cutoff = new Date(TODAY);
  if (period === "24h") {
    cutoff.setDate(cutoff.getDate() - 1);
  } else if (period === "7j") {
    cutoff.setDate(cutoff.getDate() - 7);
  } else {
    cutoff.setDate(cutoff.getDate() - 30);
  }
  return mockAllEmails.filter((e) => new Date(e.date) >= cutoff);
}

function computeStats(emails: MockEmail[]): PeriodStats {
  const dossierEmails = emails.filter((e) => e.dossier_id !== null);
  const generalEmails = emails.filter((e) => e.dossier_id === null);
  const attachmentsCount = emails.reduce((sum, e) => sum + e.pieces_jointes.length, 0);
  return {
    total: emails.length,
    dossier_emails: dossierEmails.length,
    general_emails: generalEmails.length,
    attachments_count: attachmentsCount,
  };
}

// ---------------------------------------------------------------------------
// Compute dossier IDs per period
// ---------------------------------------------------------------------------

function getDossierIdsForPeriod(period: "24h" | "7j" | "30j"): string[] {
  const emails = getEmailsForPeriod(period);
  const ids = new Set<string>();
  emails.forEach((e) => {
    if (e.dossier_id) ids.add(e.dossier_id);
  });
  return Array.from(ids);
}

// ---------------------------------------------------------------------------
// Build dossiers from emails
// ---------------------------------------------------------------------------

interface DossierMeta {
  dossier_id: string;
  nom: string;
  domaine: string;
  needs_immediate_attention: boolean;
  summary: string;
  emails_narrative: string;
  pieces_narrative: string | null;
  dates_cles: string[];
  deadline_days: number | null;
  attente: { description: string; jours: number } | null;
}

const dossierMeta: Record<string, Omit<DossierMeta, "dossier_id">> = {
  "1": {
    nom: "Marie Dupont",
    domaine: "Litige commercial",
    needs_immediate_attention: true,
    summary: "Mme Dupont conteste une facture de 3 200 euros pour travaux non conformes réalisés par BTP Pro. Mise en demeure envoyée le 2 mars, réponse contestatoire reçue de l'avocat adverse.",
    emails_narrative:
      "Mme Dupont demande des nouvelles de la procédure. Le Cabinet Durand (avocat de BTP Pro) conteste la non-conformité et produit une attestation du chef de chantier. Photos complémentaires des dégâts transmises par la cliente.",
    pieces_narrative: "2 pièces jointes : conclusions adverses de BTP Pro (PDF, 420 KB) et photos des dégâts complémentaires (JPEG, 1.2 MB).",
    dates_cles: ["2 avril 2026 — Expiration délai mise en demeure", "9 avril 2026 — Délai supplémentaire accordé au Cabinet Durand"],
    deadline_days: 7,
    attente: {
      description: "Mise en demeure envoyée le 2 mars, réponse contestatoire reçue le 25 mars — délai de 15 jours accordé pour pièces complémentaires",
      jours: 24,
    },
  },
  "2": {
    nom: "Jean-Pierre Martin",
    domaine: "Droit du travail",
    needs_immediate_attention: true,
    summary: "Rupture conventionnelle en cours de négociation avec SAS TechCorp. Indemnité légale de 8 400 euros proposée, jugée insuffisante. 2e entretien confirmé le 28 mars.",
    emails_narrative:
      "M. Martin transmet la simulation d'indemnités de TechCorp (8 400 euros, indemnité légale seule). Le service RH confirme le 2e entretien préalable le 28 mars à 15h00.",
    pieces_narrative: "1 pièce jointe reçue : simulation d'indemnités de TechCorp (PDF, 89 KB).",
    dates_cles: ["28 mars 2026 — 2e entretien préalable rupture conventionnelle"],
    deadline_days: 2,
    attente: null,
  },
  "4": {
    nom: "Famille Roux",
    domaine: "Immobilier",
    needs_immediate_attention: false,
    summary: "Vices cachés confirmés par le rapport d'expertise définitif. Coût des réparations estimé à 78 000 euros HT. Action en garantie à engager.",
    emails_narrative:
      "Rapport d'expertise définitif reçu de M. Philippe Renard, expert judiciaire. Les désordres structurels sont confirmés : fissures, infiltrations, défaut d'isolation.",
    pieces_narrative: "1 pièce jointe reçue : rapport d'expertise définitif (PDF, 2.4 MB, 42 pages).",
    dates_cles: ["20 mai 2026 — Date limite assignation en garantie des vices cachés"],
    deadline_days: 55,
    attente: null,
  },
  "5": {
    nom: "Claire Dubois",
    domaine: "Litige immobilier",
    needs_immediate_attention: false,
    summary: "Charges de copropriété abusives contestées par Mme Dubois contre la SCI Les Tilleuls. Audience fixée au 15 avril 2026.",
    emails_narrative:
      "Convocation officielle reçue du TGI pour l'audience du 15 avril, salle 3B. Mme Dubois s'inquiète et demande quels documents préparer.",
    pieces_narrative: "1 pièce jointe reçue : convocation TGI du 15 avril (PDF, 156 KB).",
    dates_cles: ["10 avril 2026 — Date limite dépôt pièces complémentaires", "15 avril 2026 — Audience TGI, 2e chambre civile"],
    deadline_days: 15,
    attente: {
      description: "Pièces complémentaires demandées à Mme Dubois le 3 mars — relevés de charges 2024-2025 à transmettre",
      jours: 23,
    },
  },
  "6": {
    nom: "Alice Bernard",
    domaine: "Droit de la famille",
    needs_immediate_attention: false,
    summary: "Nouveau dossier — divorce par consentement mutuel. Mme Bernard et son mari sont d'accord sur la garde alternée et le partage du patrimoine. Premier rendez-vous à fixer.",
    emails_narrative:
      "Première prise de contact de Mme Bernard pour un divorce amiable. Deux enfants (6 et 4 ans), un appartement en copropriété. Recommandée par une ancienne cliente.",
    pieces_narrative: null,
    dates_cles: [],
    deadline_days: null,
    attente: null,
  },
};

function buildDossiers(): BriefingDossier[] {
  // Group emails by dossier_id
  const grouped: Record<string, MockEmail[]> = {};
  for (const email of mockAllEmails) {
    if (email.dossier_id) {
      if (!grouped[email.dossier_id]) grouped[email.dossier_id] = [];
      grouped[email.dossier_id].push(email);
    }
  }

  const dossiers: BriefingDossier[] = [];
  for (const [dossierId, emails] of Object.entries(grouped)) {
    const meta = dossierMeta[dossierId];
    if (!meta) continue;

    const briefingEmails: BriefingDossierEmail[] = emails.map((e) => ({
      id: e.id,
      expediteur: e.expediteur,
      objet: e.objet,
      resume: e.resume,
      created_at: e.date,
    }));

    dossiers.push({
      dossier_id: dossierId,
      nom: meta.nom,
      domaine: meta.domaine,
      needs_immediate_attention: meta.needs_immediate_attention,
      new_emails_count: emails.length,
      summary: meta.summary,
      emails_narrative: meta.emails_narrative,
      pieces_narrative: meta.pieces_narrative,
      dates_cles: meta.dates_cles,
      deadline_days: meta.deadline_days,
      attente: meta.attente,
      emails: briefingEmails,
    });
  }

  // Sort: immediate attention first, then by deadline
  dossiers.sort((a, b) => {
    if (a.needs_immediate_attention !== b.needs_immediate_attention) {
      return a.needs_immediate_attention ? -1 : 1;
    }
    return (a.deadline_days ?? 999) - (b.deadline_days ?? 999);
  });

  return dossiers;
}

// ---------------------------------------------------------------------------
// Compute stats
// ---------------------------------------------------------------------------

const stats24h = computeStats(getEmailsForPeriod("24h"));
const stats7d = computeStats(getEmailsForPeriod("7j"));
const stats30d = computeStats(getEmailsForPeriod("30j"));

const allDossiers = buildDossiers();
const allPjCount = mockAllEmails.reduce((sum, e) => sum + e.pieces_jointes.length, 0);
const allDatesCount = allDossiers.reduce((sum, d) => sum + d.dates_cles.length, 0);

// ---------------------------------------------------------------------------
// mockBriefing — the main export
// ---------------------------------------------------------------------------

export const mockBriefing: BriefingData = {
  content: {
    executive_summary: `Vous avez reçu ${stats24h.total} emails dans les dernières 24 heures, dont ${stats24h.dossier_emails} liés à vos dossiers. ${allDossiers.filter((d) => d.needs_immediate_attention).length} dossiers nécessitent votre attention immédiate.`,
    stats: {
      emails_analyzed: stats30d.total,
      emails_dossiers: stats30d.dossier_emails,
      emails_generaux: stats30d.general_emails,
      dossiers_count: allDossiers.length,
      deadline_soon_count: allDossiers.filter((d) => d.deadline_days !== null && d.deadline_days <= 7).length,
      needs_response_count: mockAllEmails.filter((e) => e.brouillon_mock !== null).length,
      temps_gagne_minutes: mockAllEmails.length * 12,
      pieces_extraites: allPjCount,
      dates_detectees: allDatesCount,
      last_24h: stats24h,
      last_7d: stats7d,
      last_30d: stats30d,
    },
    emails_by_period: {
      last_24h: getDossierIdsForPeriod("24h"),
      last_7d: getDossierIdsForPeriod("7j"),
      last_30d: getDossierIdsForPeriod("30j"),
    },
    dossiers: allDossiers,
  },
};

// ---------------------------------------------------------------------------
// mockDossierEmails — mapped from mockAllEmails for BriefingDetailPanel
// ---------------------------------------------------------------------------

function buildMockDossierEmails(): Record<string, DossierEmail[]> {
  const grouped: Record<string, DossierEmail[]> = {};

  for (const email of mockAllEmails) {
    if (!email.dossier_id) continue;

    if (!grouped[email.dossier_id]) grouped[email.dossier_id] = [];

    const pj = email.pieces_jointes.map((p) => ({
      nom: p.nom,
      taille: p.taille,
      resume: p.resume_ia,
    }));

    const dateObj = new Date(email.date);
    const dateFormatted = dateObj.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    grouped[email.dossier_id].push({
      id: email.id,
      expediteur: email.expediteur,
      email: email.email,
      objet: email.objet,
      date: dateFormatted,
      resume: email.resume,
      contenu: email.corps_original,
      pieces_jointes: pj.length > 0 ? pj : undefined,
    });
  }

  // Sort each dossier's emails by date descending (newest first)
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => {
      const emailA = mockAllEmails.find((e) => e.id === a.id);
      const emailB = mockAllEmails.find((e) => e.id === b.id);
      return new Date(emailB?.date ?? 0).getTime() - new Date(emailA?.date ?? 0).getTime();
    });
  }

  return grouped;
}

export const mockDossierEmails: Record<string, DossierEmail[]> = buildMockDossierEmails();

// ---------------------------------------------------------------------------
// mockConfig — enriched cabinet configuration
// ---------------------------------------------------------------------------

export const mockConfig = {
  nom_avocat: "Alexandra",
  nom_cabinet: "Cabinet Fernandez",
  specialite: "Droit civil et droit de la famille",
  signature:
    "Cordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris\nCabinet Fernandez\n12 rue de Rivoli, 75004 Paris\n01 23 45 67 89",
  formule_appel: "cher_maitre",
  formule_politesse: "cordialement",
  profil_style: "Les mails de l'Ordre des Avocats ne sont jamais urgents",
  refresh_token: null,
  taux_horaire: 350,
};
