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
// 60 mock emails — dates relative to NOW
// ---------------------------------------------------------------------------

const NOW = new Date();
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600000).toISOString();
const daysAgo = (d: number, h = 12) => new Date(NOW.getTime() - d * 86400000 - h * 3600000).toISOString();

export const mockAllEmails: MockEmail[] = [
  // =========================================================================
  // LAST 24 HOURS (8 emails: e1–e8)
  // =========================================================================
  {
    id: "e1",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "Avancement de la procédure ?",
    resume:
      "Mme Dupont demande des nouvelles de la mise en demeure envoyée à BTP Pro le 2 mars. Elle s'inquiète du silence de l'entreprise et souhaite connaître les prochaines étapes si aucune réponse n'est reçue avant l'expiration du délai.",
    corps_original:
      "Bonjour Maître Fernandez,\n\nJe me permets de vous relancer concernant la mise en demeure que vous avez envoyée à BTP Pro le 2 mars dernier.\n\nAvez-vous reçu une réponse de leur part ? Le silence de cette entreprise m'inquiète beaucoup. Les travaux non conformes continuent de causer des problèmes et je constate de nouvelles dégradations sur la façade nord.\n\nQuelles sont les prochaines étapes si BTP Pro ne répond pas avant l'expiration du délai ?\n\nJe vous remercie pour votre aide et votre réactivité.\n\nCordialement,\nMarie Dupont",
    date: hoursAgo(3),
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
    objet: "Actualités juridiques",
    resume:
      "Newsletter mensuelle de l'Ordre des Avocats de Paris. Au sommaire : réforme de la procédure civile, nouvelles obligations RGPD pour les cabinets, et rappel des formations disponibles au 2e trimestre.",
    corps_original:
      "Chers Confrères et Consoeurs,\n\nRetrouvez les actualités du mois :\n\n1. Réforme de la procédure civile — Le décret n° 2026-187 du 15 mars 2026 modifie les délais de mise en état. Les nouvelles dispositions s'appliquent aux instances introduites à compter du 1er mai 2026.\n\n2. RGPD — Rappel : les cabinets doivent mettre à jour leur registre de traitement avant le 30 juin 2026.\n\n3. Formations — Inscriptions ouvertes pour les sessions de mai (droit du travail, procédure prud'homale).\n\nBonne lecture,\nL'Ordre des Avocats de Paris",
    date: hoursAgo(5),
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
    objet: "Contestation mise en demeure",
    resume:
      "L'avocat de BTP Pro conteste la non-conformité des travaux invoquée par Mme Dupont. Il joint ses conclusions adverses avec une attestation du chef de chantier et sollicite un délai de 15 jours pour produire des pièces complémentaires.",
    corps_original:
      "Chère Consoeur,\n\nJ'ai l'honneur de vous écrire au nom de mon client, la société BTP Pro, en réponse à votre mise en demeure du 2 mars 2026.\n\nMon client conteste formellement la non-conformité alléguée des travaux réalisés au domicile de Mme Dupont. Vous trouverez ci-joint une attestation de conformité établie par le chef de chantier, M. Laurent Petit, en date du 15 janvier 2026.\n\nNous sollicitons un délai supplémentaire de 15 jours pour produire l'ensemble des pièces justificatives, notamment le procès-verbal de réception des travaux et le rapport du bureau de contrôle.\n\nDans l'attente de votre retour, je vous prie d'agréer, Chère Consoeur, l'expression de mes sentiments confraternels.\n\nMe Durand\nCabinet Durand & Associés",
    date: hoursAgo(8),
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
      "Cher Confrère,\n\nJ'accuse réception de votre courrier et des pièces jointes.\n\nJe note la contestation de votre client. Toutefois, l'attestation du chef de chantier ne saurait constituer à elle seule une preuve de conformité des travaux. Ma cliente dispose de constats d'huissier et de photographies datées établissant les malfaçons.\n\nS'agissant du délai supplémentaire sollicité, j'y consens sous réserve qu'il n'excède pas 15 jours à compter de ce jour.\n\nJe vous prie d'agréer, Cher Confrère, l'expression de mes sentiments confraternels.\n\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e4",
    expediteur: "Notification Tribunal",
    email: "notifications@justice.gouv.fr",
    objet: "Confirmation dépôt",
    resume:
      "Le greffe du Tribunal de commerce confirme la réception et l'enregistrement des conclusions déposées dans le cadre du dossier RG 26/01234. Aucune action requise.",
    corps_original:
      "Maître,\n\nNous accusons réception de vos conclusions déposées par voie électronique.\n\nRéférence du dossier : RG 26/01234\nDate d'enregistrement : ce jour\nNombre de pages : 18\n\nVos conclusions ont été versées au dossier et transmises à la partie adverse.\n\nLe Greffe du Tribunal de commerce de Paris",
    date: hoursAgo(10),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "notification",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "e5",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Question entretien préalable",
    resume:
      "M. Martin s'interroge sur les points à aborder lors du 2e entretien préalable de rupture conventionnelle. Il souhaite savoir comment négocier l'indemnité supra-légale et si la clause de non-concurrence est négociable.",
    corps_original:
      "Bonjour Maître Fernandez,\n\nLe 2e entretien avec TechCorp approche et j'aimerais être bien préparé.\n\nJ'ai plusieurs questions :\n- Comment aborder la question de l'indemnité supra-légale ? Ils n'en ont pas parlé lors du premier entretien.\n- Ma clause de non-concurrence est-elle négociable dans le cadre de la rupture conventionnelle ?\n- Puis-je demander une dispense de préavis ?\n- Faut-il que je mentionne les heures supplémentaires non payées ?\n\nJe compte sur vos conseils pour être efficace.\n\nCordialement,\nJean-Pierre Martin",
    date: hoursAgo(14),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Monsieur Martin,\n\nVoici mes recommandations pour le 2e entretien :\n\n1. Indemnité supra-légale : ouvrez la discussion en rappelant vos 7 ans d'ancienneté et vos évaluations positives. Demandez au minimum 3 mois de salaire brut en sus de l'indemnité légale.\n\n2. Clause de non-concurrence : elle est parfaitement négociable. Demandez sa levée ou, à défaut, une contrepartie financière renforcée.\n\n3. Préavis : dans une rupture conventionnelle, il n'y a pas de préavis au sens strict, mais vous pouvez négocier la date de fin de contrat.\n\n4. Heures supplémentaires : gardez cet argument en réserve comme levier de négociation si besoin.\n\nJe vous propose un appel demain pour préparer en détail.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e6",
    expediteur: "RH TechCorp",
    email: "rh@techcorp.fr",
    objet: "Confirmation 2e entretien",
    resume:
      "Le service RH de TechCorp confirme le 2e entretien préalable pour la rupture conventionnelle de M. Martin. L'ordre du jour porte sur les conditions financières et la date de sortie envisagée.",
    corps_original:
      "Maître Fernandez,\n\nNous vous confirmons la tenue du deuxième entretien dans le cadre de la procédure de rupture conventionnelle de M. Jean-Pierre Martin.\n\nDate : dans 3 jours à 15h00\nLieu : Salle de réunion B2, siège TechCorp, 35 avenue de la Grande Armée, 75016 Paris\nOrdre du jour : conditions financières de la rupture conventionnelle et date de sortie envisagée\n\nM. Martin pourra être accompagné de la personne de son choix conformément à l'article L1237-12 du Code du travail.\n\nCordialement,\nService des Ressources Humaines\nSAS TechCorp",
    date: hoursAgo(18),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "convocation",
    pieces_jointes: [],
    brouillon_mock:
      "Madame, Monsieur,\n\nJ'accuse réception de votre convocation au 2e entretien préalable.\n\nJe confirme que j'accompagnerai M. Martin en qualité de conseil lors de cet entretien, conformément aux dispositions de l'article L1237-12 du Code du travail.\n\nJe vous prie de bien vouloir prévoir un ordre du jour écrit détaillant les points à aborder, notamment les conditions financières envisagées.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e7",
    expediteur: "Expert judiciaire Philippe Renard",
    email: "expert.bati@experts.fr",
    objet: "Complément rapport expertise",
    resume:
      "L'expert judiciaire transmet un complément à son rapport d'expertise sur le bien de la famille Roux. Il ajoute une analyse des fondations révélant un affaissement de 4 cm, aggravant le chiffrage initial des réparations.",
    corps_original:
      "Maître Fernandez,\n\nSuite à ma visite complémentaire du bien situé au 45 avenue des Lilas, je vous transmets un addendum à mon rapport d'expertise.\n\nL'analyse approfondie des fondations a révélé un affaissement de 4 cm sur la partie est du bâtiment, non détecté lors de l'expertise initiale. Ce désordre est directement lié aux fissures structurelles constatées précédemment.\n\nCette découverte aggrave le chiffrage des réparations, qui passe de 78 000 euros HT à 92 500 euros HT (détail en annexe).\n\nJe reste disponible pour toute question complémentaire.\n\nCordialement,\nM. Philippe Renard\nExpert judiciaire en bâtiment près la Cour d'appel de Paris",
    date: hoursAgo(20),
    dossier_id: "4",
    dossier_nom: "Famille Roux",
    dossier_domaine: "Immobilier",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "complement_expertise.pdf",
        taille: "1.8 MB",
        type_mime: "application/pdf",
        resume_ia:
          "Addendum au rapport d'expertise révélant un affaissement de fondations de 4 cm. Le chiffrage des réparations passe de 78 000 à 92 500 euros HT suite à cette découverte.",
      },
    ],
    brouillon_mock:
      "Monsieur l'Expert,\n\nJ'accuse réception de votre complément d'expertise et vous en remercie.\n\nL'affaissement des fondations que vous avez découvert constitue un élément supplémentaire majeur pour notre action en garantie des vices cachés. Le nouveau chiffrage de 92 500 euros HT renforce considérablement la position de mes clients.\n\nJe vous recontacterai pour préparer votre éventuelle audition à l'audience.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e8",
    expediteur: "Pub LinkedIn",
    email: "noreply@linkedin.com",
    objet: "Nouvelles opportunités",
    resume:
      "Email promotionnel LinkedIn suggérant des profils de juristes et proposant un abonnement Premium pour développer son réseau professionnel. Aucun intérêt pour le cabinet.",
    corps_original:
      "Bonjour Alexandra,\n\nVotre réseau s'agrandit ! Découvrez les profils qui ont consulté votre page cette semaine :\n\n- 12 juristes ont vu votre profil\n- 3 avocats souhaitent se connecter\n- 5 nouvelles offres correspondent à vos compétences\n\nPassez à LinkedIn Premium pour accéder à des fonctionnalités exclusives et développer votre réseau professionnel.\n\nEssai gratuit de 30 jours.\n\nL'équipe LinkedIn",
    date: hoursAgo(22),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "spam",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },

  // =========================================================================
  // LAST 7 DAYS additional (17 emails: e9–e25)
  // =========================================================================

  // --- Dossier 1: Marie Dupont (4 more, 2 PJ) ---
  {
    id: "e9",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "Photos complémentaires façade nord",
    resume:
      "Mme Dupont transmet des photos complémentaires des dégâts constatés sur la façade nord. Les clichés montrent des fissures qui se sont élargies et des infiltrations d'eau visibles à l'intérieur du mur.",
    corps_original:
      "Bonjour Maître,\n\nComme convenu lors de notre dernier échange, je vous transmets en pièce jointe les photos complémentaires des dégâts sur la façade nord.\n\nVous constaterez que les fissures se sont élargies depuis le dernier constat et que l'infiltration d'eau est désormais visible à l'intérieur du mur.\n\nJe suis vraiment inquiète car la situation empire de semaine en semaine. Mon voisin m'a dit que cela pouvait compromettre la structure du bâtiment.\n\nMerci de me dire si ces photos pourront être utiles dans le cadre de la procédure.\n\nBien cordialement,\nMarie Dupont",
    date: daysAgo(2, 9),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "photos_facade_nord_mars.zip",
        taille: "3.8 MB",
        type_mime: "application/zip",
        resume_ia:
          "Archive contenant 12 photographies haute résolution de la façade nord, montrant l'élargissement des fissures et les infiltrations d'eau. Photos datées et géolocalisées.",
      },
    ],
    brouillon_mock:
      "Chère Madame Dupont,\n\nJe vous remercie pour l'envoi de ces photos complémentaires qui documentent clairement l'aggravation des désordres.\n\nCes clichés constituent des éléments de preuve importants qui viendront étayer notre dossier. Ils démontrent le caractère évolutif des malfaçons et renforcent notre demande de réparation intégrale.\n\nJe vous recommande par ailleurs de faire établir un constat d'huissier dans les meilleurs délais afin de figer officiellement l'état des dégradations.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e10",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "Facture BTP Pro impayée",
    resume:
      "Mme Dupont signale avoir reçu une relance de BTP Pro pour le paiement de la facture de 3 200 euros qu'elle conteste. Elle demande si elle doit répondre directement ou si le cabinet s'en charge.",
    corps_original:
      "Bonjour Maître,\n\nJe viens de recevoir une lettre de relance de BTP Pro pour la facture de 3 200 euros.\n\nIls menacent de saisir un huissier si je ne règle pas sous 8 jours. C'est assez stressant car je ne souhaite évidemment pas payer pour des travaux non conformes.\n\nDois-je leur répondre directement ou est-ce que vous vous en chargez dans le cadre de la procédure en cours ?\n\nJe vous joins la lettre de relance reçue ce matin.\n\nMerci pour votre aide,\nMarie Dupont",
    date: daysAgo(3, 14),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "relance_BTP_Pro.pdf",
        taille: "185 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Lettre de relance de BTP Pro exigeant le paiement de 3 200 euros sous 8 jours, avec menace de recours à un huissier. Facture n° FA-2025-0847 du 15 décembre 2025.",
      },
    ],
    brouillon_mock:
      "Chère Madame Dupont,\n\nNe répondez surtout pas directement à cette relance. C'est une manoeuvre classique de pression.\n\nJe vais adresser un courrier à BTP Pro leur rappelant que la facture fait l'objet d'une contestation formelle et qu'aucun paiement ne sera effectué tant que les travaux ne seront pas mis en conformité.\n\nLa menace d'huissier est sans fondement tant qu'ils n'ont pas obtenu de titre exécutoire. Restez sereine.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e11",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "RE: Constat d'huissier",
    resume:
      "Mme Dupont confirme avoir contacté l'huissier recommandé. Le constat est programmé pour la semaine prochaine. Elle demande quels points l'huissier doit particulièrement documenter.",
    corps_original:
      "Bonjour Maître,\n\nJ'ai bien contacté l'huissier que vous m'avez recommandé, Me Leclerc. Il peut venir faire le constat la semaine prochaine, mardi ou mercredi.\n\nY a-t-il des points précis que l'huissier doit documenter en priorité ? Je veux m'assurer que le constat sera le plus complet possible.\n\nPar ailleurs, mon assurance habitation m'a contactée. Dois-je les informer de la procédure en cours ?\n\nMerci,\nMarie Dupont",
    date: daysAgo(4, 11),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dupont,\n\nParfait pour le rendez-vous avec Me Leclerc. Je lui enverrai mes instructions détaillées.\n\nL'huissier devra documenter en priorité : les fissures sur la façade nord avec mesures précises, les infiltrations d'eau avec photos, l'état de la toiture, et tout écart par rapport au devis initial signé.\n\nConcernant votre assurance habitation, oui, déclarez la situation à votre assureur. La garantie dommages-ouvrage pourrait être activable si elle existe.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e12",
    expediteur: "Cabinet Durand",
    email: "cabinet.durand@avocat.fr",
    objet: "RE: Délai pièces complémentaires",
    resume:
      "Me Durand remercie pour l'accord sur le délai de 15 jours et annonce la transmission prochaine du PV de réception des travaux et du rapport du bureau de contrôle technique.",
    corps_original:
      "Chère Consoeur,\n\nJe vous remercie d'avoir accepté le délai supplémentaire. Mon client s'engage à produire l'ensemble des pièces avant l'échéance convenue.\n\nLe procès-verbal de réception des travaux signé par Mme Dupont le 20 janvier 2026 et le rapport du bureau de contrôle VERITAS vous seront transmis dans les prochains jours.\n\nJe souhaite par ailleurs attirer votre attention sur le fait que Mme Dupont a signé le PV de réception sans émettre de réserves, ce qui constitue un élément important pour l'appréciation du litige.\n\nSentiments confraternels,\nMe Durand",
    date: daysAgo(5, 16),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Confrère,\n\nJ'accuse réception de votre courrier.\n\nS'agissant du procès-verbal de réception, je vous précise que ma cliente a signé ce document sous la pression du chef de chantier et sans avoir été informée de son droit d'émettre des réserves. Par ailleurs, les désordres constatés étaient pour la plupart non apparents à la date de la réception.\n\nJe réserve l'ensemble de mes moyens de défense dans l'attente de vos pièces.\n\nSentiments confraternels,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },

  // --- Dossier 2: Jean-Pierre Martin (4 more, 2 PJ) ---
  {
    id: "e13",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Simulation d'indemnités reçue",
    resume:
      "M. Martin transmet la simulation d'indemnités reçue de TechCorp. L'indemnité légale est chiffrée à 8 400 euros, sans aucune supra-légale proposée. Il demande conseil avant le 2e entretien.",
    corps_original:
      "Bonjour Maître,\n\nJe viens de recevoir la simulation d'indemnités de mon employeur (en pièce jointe). Ils proposent uniquement l'indemnité légale, soit 8 400 euros.\n\nAprès 7 ans dans l'entreprise et les conditions de travail que j'ai subies, cela me semble vraiment insuffisant. J'ai entendu parler d'indemnités supra-légales dans le cadre des ruptures conventionnelles.\n\nPourriez-vous analyser ce document et me dire ce que vous en pensez ?\n\nMerci pour votre aide,\nJean-Pierre Martin",
    date: daysAgo(2, 17),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "simulation_indemnites_techcorp.pdf",
        taille: "89 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Simulation chiffrant l'indemnité de rupture conventionnelle à 8 400 euros (indemnité légale uniquement). Aucune supra-légale proposée par l'employeur TechCorp.",
      },
    ],
    brouillon_mock:
      "Cher Monsieur Martin,\n\nJ'ai bien reçu et analysé la simulation d'indemnités de votre employeur.\n\nLe montant de 8 400 euros correspond au minimum légal. Compte tenu de votre ancienneté de 7 ans et de vos évaluations positives, je considère cette proposition très insuffisante.\n\nJe recommande de négocier une indemnité supra-légale d'au moins 3 mois de salaire brut supplémentaires, soit environ 12 600 euros en sus. Je prépare un argumentaire détaillé.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e14",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Mes évaluations annuelles",
    resume:
      "M. Martin transmet ses trois dernières évaluations annuelles chez TechCorp, toutes très positives. Il estime que ces documents renforcent sa position pour négocier une meilleure indemnité.",
    corps_original:
      "Bonjour Maître,\n\nComme vous me l'avez demandé, je vous transmets mes trois dernières évaluations annuelles (2023, 2024, 2025).\n\nVous constaterez que j'ai toujours été noté « Dépasse les attentes » ou « Exceptionnel ». Mon manager direct m'a même recommandé pour une promotion en 2024, qui n'a finalement jamais été validée par la direction.\n\nJe pense que ces documents montrent clairement ma valeur pour l'entreprise et devraient peser dans la négociation.\n\nCordialement,\nJean-Pierre Martin",
    date: daysAgo(4, 10),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "evaluations_annuelles_2023_2025.pdf",
        taille: "340 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Trois évaluations annuelles de M. Martin chez TechCorp (2023-2025). Notes « Dépasse les attentes » et « Exceptionnel ». Recommandation pour promotion en 2024 non validée par la direction.",
      },
    ],
    brouillon_mock:
      "Cher Monsieur Martin,\n\nMerci pour ces documents qui sont effectivement très utiles.\n\nVos évaluations systématiquement excellentes et la promotion non honorée constituent des arguments solides. Ils démontrent que votre départ représente une perte réelle pour l'entreprise et justifient une indemnité supra-légale significative.\n\nJ'intègrerai ces éléments dans notre stratégie de négociation pour le 2e entretien.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e15",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Heures supplémentaires non payées",
    resume:
      "M. Martin mentionne avoir accumulé environ 180 heures supplémentaires non rémunérées sur les deux dernières années. Il demande si cela peut être utilisé comme levier dans la négociation.",
    corps_original:
      "Bonjour Maître,\n\nJ'ai fait le calcul de mes heures supplémentaires non payées sur les deux dernières années. D'après mes pointages, j'estime le total à environ 180 heures.\n\nMon contrat prévoit 35 heures par semaine mais je travaillais régulièrement 40 à 45 heures, notamment sur les projets urgents. Aucune de ces heures n'a été comptabilisée ni rémunérée.\n\nPensez-vous que je puisse utiliser cet argument dans la négociation de la rupture conventionnelle ? Ou faut-il en faire une demande séparée ?\n\nMerci,\nJean-Pierre Martin",
    date: daysAgo(5, 8),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Monsieur Martin,\n\nLes heures supplémentaires non rémunérées constituent un excellent levier de négociation. Sur la base de 180 heures avec les majorations légales, cela représente un montant d'environ 5 400 euros.\n\nJe vous recommande de ne pas en faire une demande séparée mais de l'utiliser comme argument pour obtenir une indemnité supra-légale plus élevée. Cela évitera un contentieux prud'homal distinct.\n\nConservez précieusement tous vos relevés de pointage et emails envoyés en dehors des horaires.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e16",
    expediteur: "RH TechCorp",
    email: "rh@techcorp.fr",
    objet: "Documents à préparer pour le 2e entretien",
    resume:
      "Le service RH de TechCorp demande à M. Martin de préparer une liste de documents pour le 2e entretien : derniers bulletins de paie, solde de congés et certificat médical si arrêt en cours.",
    corps_original:
      "Monsieur Martin,\n\nEn vue du 2e entretien dans le cadre de votre rupture conventionnelle, nous vous prions de bien vouloir préparer les documents suivants :\n\n- Vos 3 derniers bulletins de paie\n- Le relevé de votre solde de congés payés\n- Un certificat médical si vous êtes en arrêt de travail\n- Votre relevé d'identité bancaire (RIB) à jour\n\nCes documents faciliteront le calcul définitif de vos indemnités.\n\nCordialement,\nMme Sophie Garnier\nResponsable RH — SAS TechCorp",
    date: daysAgo(3, 9),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Madame Garnier,\n\nJ'accuse réception de votre demande au nom de M. Martin.\n\nLes documents sollicités seront préparés et disponibles pour le 2e entretien. Toutefois, je note que le certificat médical n'est requis que si M. Martin est en arrêt, ce qui n'est pas le cas à ce jour.\n\nJe me permets de rappeler que la rupture conventionnelle doit faire l'objet d'un accord libre et éclairé des deux parties.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },

  // --- Dossier 4: Famille Roux (3 more, 1 PJ) ---
  {
    id: "e17",
    expediteur: "Famille Roux",
    email: "p.roux@wanadoo.fr",
    objet: "Questions sur le rapport d'expertise",
    resume:
      "M. Roux a lu le rapport d'expertise et s'interroge sur plusieurs points techniques. Il demande des éclaircissements sur la portée de la garantie des vices cachés et les délais pour agir.",
    corps_original:
      "Bonjour Maître Fernandez,\n\nNous avons bien reçu le rapport d'expertise et l'avons lu attentivement avec mon épouse.\n\nNous avons plusieurs questions :\n- Le vendeur peut-il prétendre qu'il n'était pas au courant des fissures ?\n- Quelle est la durée de la garantie des vices cachés ? Sommes-nous encore dans les délais ?\n- Est-ce que les 78 000 euros couvrent uniquement les réparations ou aussi le préjudice de jouissance ?\n- Pouvons-nous demander l'annulation de la vente plutôt qu'une réparation ?\n\nNous sommes très inquiets et attendons vos conseils.\n\nCordialement,\nPatrick et Sophie Roux",
    date: daysAgo(3, 15),
    dossier_id: "4",
    dossier_nom: "Famille Roux",
    dossier_domaine: "Immobilier",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chers Monsieur et Madame Roux,\n\nVoici mes réponses à vos questions :\n\n1. Le vendeur pourra difficilement prétendre ignorer les fissures. L'expert a relevé des indices de travaux de dissimulation (enduit récent sur les fissures), ce qui suggère une connaissance des désordres.\n\n2. L'action en garantie des vices cachés doit être intentée dans les 2 ans suivant la découverte du vice. Nous sommes dans les délais.\n\n3. Les 78 000 euros couvrent les seules réparations. Nous demanderons en sus le préjudice de jouissance et les troubles liés aux travaux.\n\n4. L'annulation de la vente (action rédhibitoire) est possible, mais la réduction du prix avec indemnisation est généralement plus avantageuse.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e18",
    expediteur: "Notaire Me Blanchard",
    email: "blanchard@notaires-paris.fr",
    objet: "Acte de vente Roux - copie authentique",
    resume:
      "Le notaire transmet la copie authentique de l'acte de vente du bien acquis par la famille Roux. Le document mentionne une clause d'exclusion de garantie des vices cachés que le cabinet devra analyser.",
    corps_original:
      "Maître Fernandez,\n\nSuite à votre demande, veuillez trouver ci-joint la copie authentique de l'acte de vente du bien situé 45 avenue des Lilas, 75019 Paris, en date du 15 juin 2025.\n\nJe me permets d'attirer votre attention sur l'article 8 de l'acte qui contient une clause d'exclusion de la garantie des vices cachés, clause standard dans les ventes entre particuliers.\n\nJe reste à votre disposition pour tout renseignement complémentaire.\n\nCordialement,\nMe Blanchard\nNotaire — Étude Blanchard & Moreau\n12 rue Saint-Honoré, 75001 Paris",
    date: daysAgo(5, 10),
    dossier_id: "4",
    dossier_nom: "Famille Roux",
    dossier_domaine: "Immobilier",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "acte_vente_roux_copie_authentique.pdf",
        taille: "1.5 MB",
        type_mime: "application/pdf",
        resume_ia:
          "Copie authentique de l'acte de vente du 15 juin 2025. Contient une clause d'exclusion de garantie des vices cachés (article 8). Prix de vente : 485 000 euros.",
      },
    ],
    brouillon_mock:
      "Cher Maître Blanchard,\n\nJe vous remercie pour la transmission de la copie authentique de l'acte de vente.\n\nJ'ai bien noté la clause d'exclusion de garantie des vices cachés à l'article 8. Toutefois, cette clause est inopposable lorsque le vendeur avait connaissance du vice, ce que l'expertise semble démontrer. L'enduit récent sur les fissures constitue un indice fort de mauvaise foi du vendeur.\n\nJe vous recontacterai si j'ai besoin d'éléments complémentaires.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e19",
    expediteur: "Famille Roux",
    email: "p.roux@wanadoo.fr",
    objet: "Problème d'humidité aggravé",
    resume:
      "M. Roux signale une aggravation des infiltrations d'eau dans le sous-sol. L'humidité a endommagé des meubles et des cartons de documents personnels. Il demande s'il peut entreprendre des travaux d'urgence.",
    corps_original:
      "Bonjour Maître,\n\nJe vous écris en urgence car la situation s'est encore dégradée. Les infiltrations dans le sous-sol se sont intensifiées suite aux pluies de ces derniers jours.\n\nL'eau stagne maintenant sur environ 2 m² et a endommagé plusieurs meubles ainsi que des cartons contenant des documents personnels importants.\n\nPuis-je faire intervenir un plombier en urgence pour limiter les dégâts ? Les frais seront-ils remboursables dans le cadre de la procédure ?\n\nMerci de me répondre rapidement.\n\nPatrick Roux",
    date: daysAgo(6, 8),
    dossier_id: "4",
    dossier_nom: "Famille Roux",
    dossier_domaine: "Immobilier",
    category: "client",
    email_type: "relance",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Monsieur Roux,\n\nOui, vous pouvez et devez faire intervenir un plombier en urgence pour limiter les dégâts. C'est une obligation de mitigation du préjudice.\n\nConservez impérativement toutes les factures d'intervention. Ces frais seront inclus dans notre demande d'indemnisation.\n\nJe vous recommande également de photographier l'état actuel du sous-sol avant toute intervention et de faire constater les dégâts par l'huissier si possible.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },

  // --- Dossier 5: Claire Dubois (2 more, 1 PJ) ---
  {
    id: "e20",
    expediteur: "Claire Dubois",
    email: "claire.dubois@orange.fr",
    objet: "Relevés de charges 2024-2025",
    resume:
      "Mme Dubois transmet les relevés de charges de copropriété pour 2024 et 2025. Elle signale des écarts importants par rapport aux provisions versées, avec une augmentation de 47% non justifiée par le syndic.",
    corps_original:
      "Bonjour Maître Fernandez,\n\nComme promis, je vous transmets les relevés de charges de copropriété pour les exercices 2024 et 2025.\n\nJ'ai fait quelques calculs :\n- Charges 2023 : 3 200 euros/an\n- Charges 2024 : 3 850 euros/an (+20%)\n- Charges 2025 : 4 700 euros/an (+47% par rapport à 2023)\n\nLe syndic Les Tilleuls n'a jamais justifié ces augmentations lors des AG. Les PV d'assemblée générale montrent que les résolutions ont été votées sans présenter le détail des postes.\n\nJ'espère que ces documents vous seront utiles.\n\nCordialement,\nClaire Dubois",
    date: daysAgo(4, 14),
    dossier_id: "5",
    dossier_nom: "Claire Dubois",
    dossier_domaine: "Litige immobilier",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "releves_charges_2024_2025.pdf",
        taille: "245 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Relevés de charges de copropriété 2024 et 2025 montrant une augmentation de 47% par rapport à 2023. Charges passées de 3 200 euros à 4 700 euros/an sans justification détaillée.",
      },
    ],
    brouillon_mock:
      "Chère Madame Dubois,\n\nMerci pour ces relevés qui sont essentiels à notre argumentation.\n\nL'augmentation de 47% en deux ans sans justification détaillée constitue un argument très fort devant le tribunal. Le syndic a une obligation légale de transparence et de justification des charges.\n\nJe vais intégrer ces éléments dans nos conclusions pour l'audience du 15 avril. Je vous tiendrai informée.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e21",
    expediteur: "Claire Dubois",
    email: "claire.dubois@orange.fr",
    objet: "Question sur l'audience du 15 avril",
    resume:
      "Mme Dubois s'inquiète de l'audience du 15 avril et demande si sa présence est obligatoire. Elle souhaite savoir quels documents supplémentaires elle doit rassembler.",
    corps_original:
      "Bonjour Maître Fernandez,\n\nJ'ai bien reçu la convocation pour l'audience du 15 avril et je suis assez stressée à l'idée de passer devant le tribunal.\n\nJ'aurais plusieurs questions :\n- Est-ce que ma présence est obligatoire le jour de l'audience ?\n- Quels documents dois-je vous fournir en complément ?\n- La SCI Les Tilleuls a-t-elle déjà déposé ses conclusions ?\n\nJe reste disponible pour un rendez-vous si vous le jugez nécessaire.\n\nMerci beaucoup,\nClaire Dubois",
    date: daysAgo(5, 11),
    dossier_id: "5",
    dossier_nom: "Claire Dubois",
    dossier_domaine: "Litige immobilier",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dubois,\n\nJe comprends votre inquiétude et vous rassure : votre présence à l'audience du 15 avril n'est pas obligatoire. C'est une audience de mise en état au cours de laquelle je plaiderai en votre nom.\n\nLa SCI Les Tilleuls n'a pas encore déposé ses conclusions. Le délai court jusqu'au 10 avril.\n\nJe vous propose un point téléphonique la semaine prochaine pour faire le bilan.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },

  // --- Dossier 6: Alice Bernard (1 more) ---
  {
    id: "e22",
    expediteur: "Alice Bernard",
    email: "alice.b@free.fr",
    objet: "Documents pour le divorce",
    resume:
      "Mme Bernard annonce qu'elle a rassemblé l'ensemble des documents demandés pour la procédure de divorce par consentement mutuel : livret de famille, acte de mariage, titres de propriété et avis d'imposition.",
    corps_original:
      "Bonjour Maître Fernandez,\n\nSuite à notre échange, j'ai rassemblé tous les documents que vous m'avez demandés :\n\n- Livret de famille (original)\n- Copie intégrale de l'acte de mariage (demandée en mairie, reçue hier)\n- Titre de propriété de l'appartement (Paris 11e)\n- 3 derniers avis d'imposition (2023, 2024, 2025)\n- Relevé de patrimoine immobilier et financier\n\nMon mari est d'accord pour que nous nous partagions les frais d'avocat. Pourriez-vous m'indiquer le montant de vos honoraires pour cette procédure ?\n\nCordialement,\nAlice Bernard",
    date: daysAgo(3, 16),
    dossier_id: "6",
    dossier_nom: "Alice Bernard",
    dossier_domaine: "Droit de la famille",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Bernard,\n\nJe vous remercie pour votre diligence dans la constitution du dossier. L'ensemble des documents est complet.\n\nConcernant mes honoraires, pour un divorce par consentement mutuel, mes honoraires s'élèvent à 2 500 euros HT par époux (soit 3 000 euros TTC). Cela couvre la rédaction de la convention, les échanges avec le notaire et l'accompagnement jusqu'à l'enregistrement.\n\nJe vous rappelle que chaque époux doit avoir son propre avocat. Votre mari devra donc mandater un confrère de son choix.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },

  // --- Filtered emails (3 more) ---
  {
    id: "e23",
    expediteur: "Bulletin Dalloz",
    email: "newsletter@dalloz.fr",
    objet: "Veille jurisprudentielle - Semaine 12",
    resume:
      "Bulletin hebdomadaire Dalloz avec les décisions de justice marquantes de la semaine : arrêt de la Cour de cassation sur les vices cachés, décision du Conseil d'État sur le droit du travail.",
    corps_original:
      "Cher(e) abonné(e),\n\nRetrouvez la veille jurisprudentielle de la semaine 12 :\n\n1. Cass. 3e civ., 18 mars 2026 — Vices cachés et clause exonératoire : la Cour rappelle que la clause est inopérante en cas de mauvaise foi du vendeur professionnel.\n\n2. CE, 20 mars 2026 — Rupture conventionnelle : le Conseil d'État précise les conditions de validité du consentement du salarié en situation de harcèlement.\n\n3. Cass. 1re civ., 19 mars 2026 — Divorce et résidence alternée : précisions sur les critères d'appréciation de l'intérêt de l'enfant.\n\nBonne lecture,\nLa Rédaction Dalloz",
    date: daysAgo(2, 7),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "newsletter",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "e24",
    expediteur: "Notification RPVA",
    email: "rpva@avocats.fr",
    objet: "Mise à jour du système RPVA",
    resume:
      "Le RPVA informe d'une maintenance programmée du système de communication électronique pour les avocats. Le service sera indisponible pendant 4 heures le week-end prochain.",
    corps_original:
      "Chers Confrères,\n\nNous vous informons qu'une maintenance programmée du Réseau Privé Virtuel des Avocats (RPVA) aura lieu ce week-end.\n\nDate : samedi prochain, de 6h00 à 10h00\nImpact : indisponibilité totale du service e-barreau\n\nLes communications électroniques en cours ne seront pas affectées. Nous vous recommandons de planifier vos dépôts en conséquence.\n\nLe Service Technique CNB",
    date: daysAgo(4, 8),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "notification",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "e25",
    expediteur: "Formation Continue",
    email: "formation@barreaudeparis.fr",
    objet: "Rappel obligation formation 2026",
    resume:
      "Rappel de l'obligation de formation continue pour les avocats. Il reste 8 heures à valider avant le 31 décembre 2026. Trois sessions sont proposées en avril et mai.",
    corps_original:
      "Maître Fernandez,\n\nNous vous rappelons que vous devez valider 20 heures de formation continue par an.\n\nÀ ce jour, vous avez validé 12 heures sur les 20 requises pour l'année 2026. Il vous reste donc 8 heures à effectuer avant le 31 décembre 2026.\n\nSessions disponibles :\n- 15 avril : Droit de la famille — Actualités (4h)\n- 22 avril : Procédure civile numérique (4h)\n- 10 mai : Droit immobilier — Vices cachés (4h)\n\nInscriptions sur formation.barreaudeparis.fr\n\nLe Service Formation",
    date: daysAgo(6, 9),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "notification",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },

  // =========================================================================
  // LAST 30 DAYS additional (35 emails: e26–e60)
  // =========================================================================

  // --- Dossier 1: Marie Dupont (6 more, 1 PJ) ---
  {
    id: "e26",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "RE: Mise en demeure BTP Pro",
    resume:
      "Mme Dupont transmet des photos supplémentaires des dégâts sur la façade. Les clichés montrent des fissures visibles et des infiltrations d'eau qui se sont aggravées depuis le dernier constat.",
    corps_original:
      "Bonjour Maître,\n\nComme convenu, je vous transmets en pièce jointe les photos des dégâts pris ce week-end.\n\nLes fissures se sont nettement élargies depuis le mois dernier, surtout du côté de la fenêtre de la cuisine. L'infiltration d'eau est maintenant visible à l'oeil nu sur le mur intérieur.\n\nJe suis de plus en plus préoccupée par la situation. Mon assureur me dit que sans constat d'huissier officiel, il ne peut rien faire.\n\nMerci de me conseiller sur la marche à suivre.\n\nBien cordialement,\nMarie Dupont",
    date: daysAgo(8, 9),
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
          "Photos montrant les dégâts supplémentaires sur la façade du bâtiment. Fissures visibles et infiltration d'eau sur le mur intérieur, avec gros plan sur la zone de la cuisine.",
      },
    ],
    brouillon_mock:
      "Chère Madame Dupont,\n\nMerci pour ces photos qui documentent l'aggravation des désordres.\n\nJe vais les verser au dossier. Concernant le constat d'huissier, je vous recommande de prendre rendez-vous avec Me Leclerc, huissier de justice, que je connais pour son sérieux. Je lui transmettrai mes instructions.\n\nPour votre assurance, le constat d'huissier devrait débloquer la situation. Je rédige un courrier à votre assureur en parallèle.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e27",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "Devis réparation toiture",
    resume:
      "Mme Dupont a fait établir un devis pour la réparation urgente de la toiture. Le montant s'élève à 2 800 euros HT. Elle demande si elle peut engager les travaux ou s'il faut attendre la fin de la procédure.",
    corps_original:
      "Bonjour Maître,\n\nJ'ai fait venir un couvreur pour évaluer la toiture car les fuites s'aggravent. Il m'a remis un devis de 2 800 euros HT pour les réparations urgentes (remplacement des tuiles cassées et étanchéité du faîtage).\n\nPuis-je engager ces travaux ou dois-je attendre la fin de la procédure avec BTP Pro ? J'ai peur que l'hiver prochain cause encore plus de dégâts si je ne fais rien.\n\nJe vous transmets le devis.\n\nMerci,\nMarie Dupont",
    date: daysAgo(10, 14),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dupont,\n\nVous pouvez engager les travaux urgents de toiture. Il est de votre devoir de limiter l'aggravation des dommages (obligation de mitigation).\n\nConservez soigneusement le devis, la facture et prenez des photos avant/après les travaux. Ces frais seront ajoutés à notre demande d'indemnisation auprès de BTP Pro.\n\nLe montant de 2 800 euros HT me semble raisonnable pour ce type d'intervention.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e28",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "Envoi devis initial BTP Pro",
    resume:
      "Mme Dupont retrouve et transmet le devis initial signé de BTP Pro pour les travaux de ravalement. Le document montre les prestations promises et non réalisées conformément.",
    corps_original:
      "Bonjour Maître,\n\nJ'ai retrouvé dans mes archives le devis initial que j'avais signé avec BTP Pro le 15 septembre 2025. Il détaille toutes les prestations qui devaient être réalisées.\n\nEn le comparant avec ce qui a été fait, on voit bien les écarts : le bardage devait être en PVC haute qualité (et non en bas de gamme), l'isolation par l'extérieur n'a pas été posée correctement, et la gouttière installée n'est pas celle prévue au devis.\n\nJ'espère que ce document sera utile.\n\nCordialement,\nMarie Dupont",
    date: daysAgo(12, 11),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dupont,\n\nExcellent, ce devis initial est une pièce maîtresse de notre dossier. Il permet de démontrer objectivement les écarts entre les prestations promises et celles réalisées.\n\nJe vais le confronter point par point avec le constat d'huissier et les photos pour étayer notre argumentation devant le tribunal.\n\nMerci pour votre diligence.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e29",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "Facture 3200 euros contestée",
    resume:
      "Mme Dupont transmet la facture de 3 200 euros de BTP Pro qu'elle conteste. Elle détaille les postes qui ne correspondent pas au devis initial et demande l'envoi rapide de la mise en demeure.",
    corps_original:
      "Bonjour Maître,\n\nVoici la facture n° FA-2025-0847 de BTP Pro d'un montant de 3 200 euros TTC.\n\nEn la comparant au devis initial, je constate que :\n- Le poste « ravalement façade » est facturé au prix convenu mais les matériaux utilisés sont de qualité inférieure\n- Le poste « isolation extérieure » est facturé intégralement alors que la pose n'est pas terminée\n- Un poste « nettoyage chantier » de 450 euros n'était pas prévu au devis\n\nJe refuse de payer cette facture tant que les travaux ne seront pas conformes. Pouvez-vous envoyer la mise en demeure rapidement ?\n\nMerci,\nMarie Dupont",
    date: daysAgo(15, 10),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dupont,\n\nJ'ai bien reçu la facture et votre analyse comparative avec le devis.\n\nVotre refus de payer est parfaitement justifié au regard des non-conformités constatées. Le poste « nettoyage chantier » non prévu au devis est contestable et les matériaux de qualité inférieure constituent une inexécution contractuelle.\n\nJe rédige la mise en demeure dans les 48 heures. BTP Pro aura 30 jours pour se mettre en conformité, faute de quoi nous engagerons la procédure judiciaire.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e30",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "Premier contact - travaux non conformes",
    resume:
      "Premier email de Mme Dupont exposant sa situation : des travaux de ravalement réalisés par BTP Pro ne sont pas conformes au devis. Elle cherche un avocat pour la conseiller.",
    corps_original:
      "Bonjour Maître Fernandez,\n\nJe me permets de vous contacter sur recommandation de mon notaire. J'ai un problème avec une entreprise de BTP qui a réalisé des travaux de ravalement chez moi.\n\nLes travaux devaient coûter 3 200 euros et devaient inclure un ravalement complet de la façade, une isolation par l'extérieur et le remplacement des gouttières.\n\nOr, les travaux ne sont pas conformes : les matériaux sont de mauvaise qualité, l'isolation est incomplète, et des fissures sont déjà apparues un mois après la fin du chantier.\n\nL'entreprise BTP Pro refuse de reconnaître les malfaçons et me réclame le paiement intégral.\n\nPourriez-vous me recevoir pour examiner mon dossier ?\n\nCordialement,\nMarie Dupont\n06 78 90 12 34",
    date: daysAgo(22, 15),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dupont,\n\nJe vous remercie pour votre prise de contact.\n\nLa situation que vous décrivez relève d'un litige de droit de la consommation pour non-conformité des travaux. Vous disposez de plusieurs recours : la mise en conformité forcée, la résolution du contrat ou la réduction du prix.\n\nJe vous propose un rendez-vous à mon cabinet pour examiner le devis, les photos et tout document utile. Mes prochaines disponibilités sont en début de semaine prochaine.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e31",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "RE: Rendez-vous cabinet",
    resume:
      "Mme Dupont confirme le rendez-vous au cabinet et annonce qu'elle viendra avec l'ensemble de ses documents : devis, facture, contrat, photos et échanges de SMS avec BTP Pro.",
    corps_original:
      "Bonjour Maître,\n\nJe vous confirme ma venue au cabinet mardi prochain à 10h00.\n\nJe viendrai avec :\n- Le devis original signé\n- La facture de 3 200 euros\n- Le contrat de prestation\n- Les photos que j'ai prises des malfaçons\n- Les captures d'écran de mes échanges SMS avec le gérant de BTP Pro\n\nLe gérant m'a dit par SMS que « les petites fissures, c'est normal après un ravalement ». Je pense que ce message est intéressant pour le dossier.\n\nÀ mardi,\nMarie Dupont",
    date: daysAgo(20, 16),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dupont,\n\nParfait, je confirme notre rendez-vous mardi à 10h00.\n\nLes SMS du gérant de BTP Pro sont effectivement très intéressants. Ils pourraient constituer un aveu des malfaçons. Merci de m'apporter les captures d'écran sur papier ou par email.\n\nPensez également à apporter votre attestation d'assurance habitation et, si possible, les coordonnées de voisins témoins des travaux.\n\nÀ mardi,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },

  // --- Dossier 2: Jean-Pierre Martin (4 more, 1 PJ) ---
  {
    id: "e32",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Mes conditions de travail",
    resume:
      "M. Martin décrit en détail ses conditions de travail dégradées chez TechCorp : open space bruyant, objectifs inatteignables, mise à l'écart progressive. Il s'interroge sur la qualification de harcèlement moral.",
    corps_original:
      "Bonjour Maître,\n\nJe souhaite vous exposer en détail mes conditions de travail chez TechCorp pour que vous ayez une vision complète de la situation.\n\nDepuis environ 18 mois, mes conditions se sont progressivement dégradées :\n- On m'a déplacé dans un open space bruyant alors que j'avais un bureau individuel\n- Mes objectifs annuels ont été augmentés de 40% sans discussion\n- Je ne suis plus convié aux réunions d'équipe importantes\n- Mon manager ne me parle plus que par email\n- Ma promotion validée en 2024 a été « oubliée »\n\nEst-ce que cela peut constituer du harcèlement moral ? Cela changerait-il la donne pour la rupture conventionnelle ?\n\nCordialement,\nJean-Pierre Martin",
    date: daysAgo(10, 16),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Monsieur Martin,\n\nLes faits que vous décrivez pourraient effectivement constituer des indices de harcèlement moral au sens de l'article L1152-1 du Code du travail.\n\nToutefois, dans le cadre d'une rupture conventionnelle, il faut être prudent : si le consentement est vicié par le harcèlement, la rupture conventionnelle pourrait être requalifiée en licenciement nul.\n\nJe vous recommande de constituer un dossier de preuves (emails, témoignages de collègues) et nous en discuterons pour déterminer la meilleure stratégie.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e33",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Contrat de travail et avenants",
    resume:
      "M. Martin transmet son contrat de travail initial et les deux avenants signés depuis son embauche. Le dernier avenant de 2024 mentionne la clause de non-concurrence et la rémunération variable.",
    corps_original:
      "Bonjour Maître,\n\nComme convenu, je vous transmets :\n\n1. Mon contrat de travail initial signé le 1er mars 2019\n2. L'avenant n°1 du 15 septembre 2021 (changement de poste)\n3. L'avenant n°2 du 1er janvier 2024 (nouveau grade + clause de non-concurrence)\n\nL'avenant de 2024 prévoit une clause de non-concurrence de 12 mois avec une contrepartie financière de 30% du salaire mensuel moyen. C'est cette clause qui me préoccupe si je quitte TechCorp.\n\nMerci de les examiner.\n\nCordialement,\nJean-Pierre Martin",
    date: daysAgo(12, 10),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "contrat_avenants_martin.pdf",
        taille: "520 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Contrat de travail CDI du 1er mars 2019 et deux avenants. L'avenant n°2 de janvier 2024 contient une clause de non-concurrence de 12 mois avec contrepartie de 30% du salaire moyen.",
      },
    ],
    brouillon_mock:
      "Cher Monsieur Martin,\n\nJ'ai analysé votre contrat et les avenants.\n\nLa clause de non-concurrence de 12 mois avec 30% de contrepartie est relativement standard. Dans le cadre de la rupture conventionnelle, nous pouvons négocier soit sa levée (ce qui vous libère), soit une contrepartie renforcée.\n\nJe recommande de demander la levée de la clause. L'employeur a 30 jours après la rupture pour y renoncer, ce qui vous laisserait dans l'incertitude. Mieux vaut régler ce point lors de la négociation.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e34",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Premier contact - rupture conventionnelle",
    resume:
      "Premier email de M. Martin. Il expose sa situation chez TechCorp : 7 ans d'ancienneté, poste de chef de projet technique, salaire brut de 4 200 euros. Il souhaite négocier une rupture conventionnelle.",
    corps_original:
      "Bonjour Maître Fernandez,\n\nJe vous contacte sur recommandation d'un ami qui a eu recours à vos services l'an dernier pour un litige prud'homal.\n\nVoici ma situation : je suis chef de projet technique chez TechCorp (SAS, 450 salariés) depuis le 1er mars 2019, soit bientôt 7 ans. Mon salaire brut est de 4 200 euros par mois.\n\nJe souhaite négocier une rupture conventionnelle car mes conditions de travail se sont dégradées. L'ambiance est devenue toxique et je ne me vois plus d'avenir dans cette entreprise.\n\nJ'ai déjà évoqué le sujet avec mon manager qui semble ouvert. Le DRH m'a proposé un premier entretien la semaine prochaine.\n\nPourriez-vous m'accompagner dans cette démarche ?\n\nCordialement,\nJean-Pierre Martin\n06 87 65 43 21",
    date: daysAgo(18, 15),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Monsieur Martin,\n\nJe vous remercie pour votre confiance.\n\nVotre situation est classique et une rupture conventionnelle est effectivement la voie la plus adaptée. Avec 7 ans d'ancienneté et un salaire de 4 200 euros brut, l'indemnité légale minimum serait d'environ 8 400 euros, mais nous viserons bien plus.\n\nJe vous propose un rendez-vous rapide avant votre premier entretien avec le DRH pour préparer votre stratégie.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e35",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Compte-rendu 1er entretien",
    resume:
      "M. Martin fait le compte-rendu du premier entretien préalable avec TechCorp. Le DRH a accepté le principe de la rupture conventionnelle mais a évoqué uniquement l'indemnité légale.",
    corps_original:
      "Bonjour Maître,\n\nVoici le résumé du premier entretien qui a eu lieu ce matin :\n\n- Le DRH, M. Leblanc, a accepté le principe de la rupture conventionnelle\n- Il m'a dit que la politique de l'entreprise est de ne proposer que l'indemnité légale\n- Quand j'ai évoqué l'indemnité supra-légale, il m'a dit que « ce n'est pas dans les habitudes de TechCorp »\n- Il m'a proposé une date de sortie au 30 avril\n- Il ne s'est pas prononcé sur la clause de non-concurrence\n\nLe 2e entretien est prévu dans une dizaine de jours. J'aimerais que vous m'accompagniez cette fois.\n\nQu'en pensez-vous ?\n\nCordialement,\nJean-Pierre Martin",
    date: daysAgo(14, 17),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Monsieur Martin,\n\nMerci pour ce compte-rendu détaillé.\n\nLa position du DRH est classique mais négociable. Le fait que TechCorp ait accepté le principe est un bon signe. La « politique de l'entreprise » n'est pas un argument juridique.\n\nJe vous accompagnerai au 2e entretien. Nous demanderons formellement l'indemnité supra-légale, la levée de la clause de non-concurrence et une date de sortie avancée au 15 avril.\n\nJe vous prépare un argumentaire solide.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },

  // --- Dossier 4: Famille Roux (4 more, 1 PJ) ---
  {
    id: "e36",
    expediteur: "Expert judiciaire Philippe Renard",
    email: "expert.bati@experts.fr",
    objet: "Rapport d'expertise définitif - Affaire Roux",
    resume:
      "L'expert judiciaire transmet son rapport définitif de 42 pages confirmant les vices cachés du bien acquis par la famille Roux. Le coût des réparations est estimé à 78 000 euros HT.",
    corps_original:
      "Maître Fernandez,\n\nVeuillez trouver ci-joint mon rapport d'expertise définitif concernant le bien immobilier acquis par la famille Roux, situé au 45 avenue des Lilas, 75019 Paris.\n\nMes conclusions confirment l'existence de désordres constitutifs de vices cachés au sens de l'article 1641 du Code civil :\n- Fissures structurelles affectant les murs porteurs avec infiltrations d'eau en sous-sol\n- Défaut d'isolation thermique non conforme à la RT2012\n- Désordres de la charpente nécessitant une reprise complète\n\nLe coût estimé des réparations s'élève à 78 000 euros HT, détaillé en annexe 3.\n\nJe reste à votre entière disposition.\n\nCordialement,\nM. Philippe Renard\nExpert judiciaire en bâtiment près la Cour d'appel de Paris",
    date: daysAgo(9, 9),
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
          "Rapport d'expertise définitif de 42 pages confirmant les vices cachés : fissures structurelles, infiltrations, défaut d'isolation. Coût des réparations estimé à 78 000 euros HT.",
      },
    ],
    brouillon_mock:
      "Monsieur l'Expert,\n\nJ'accuse réception de votre rapport d'expertise définitif et vous en remercie.\n\nVos conclusions confortent la position de mes clients quant à l'existence de vices cachés antérieurs à la vente. Le chiffrage à 78 000 euros HT constitue un élément déterminant pour notre action en garantie.\n\nJe me permettrai de vous recontacter pour préparer votre éventuelle audition à l'audience.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e37",
    expediteur: "Famille Roux",
    email: "p.roux@wanadoo.fr",
    objet: "Coordonnées de l'ancien propriétaire",
    resume:
      "M. Roux fournit les coordonnées complètes de l'ancien propriétaire, M. Gauthier, et précise que ce dernier a quitté la France pour s'installer au Portugal il y a 3 mois.",
    corps_original:
      "Bonjour Maître,\n\nVoici les coordonnées de l'ancien propriétaire comme vous me l'avez demandé :\n\nM. Jean-Claude Gauthier\nAncienne adresse : 45 avenue des Lilas, 75019 Paris\nNouvelle adresse : Rua das Flores, 28, 1200-195 Lisboa, Portugal\nTéléphone : +351 912 345 678\nEmail : jc.gauthier@gmail.com\n\nD'après les voisins, il a quitté la France il y a environ 3 mois, peu après la vente. Certains pensent qu'il savait que la maison avait des problèmes.\n\nCordialement,\nPatrick Roux",
    date: daysAgo(12, 14),
    dossier_id: "4",
    dossier_nom: "Famille Roux",
    dossier_domaine: "Immobilier",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Monsieur Roux,\n\nMerci pour ces informations précieuses.\n\nLe départ précipité de M. Gauthier au Portugal peu après la vente est un indice supplémentaire de sa mauvaise foi. Son départ à l'étranger ne fait pas obstacle à notre action, mais il faudra prévoir une signification par voie diplomatique.\n\nLe témoignage des voisins pourrait être utile. Pourriez-vous me transmettre les noms et coordonnées de ceux qui seraient prêts à témoigner ?\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e38",
    expediteur: "Famille Roux",
    email: "p.roux@wanadoo.fr",
    objet: "Premier contact - vices cachés maison",
    resume:
      "Premier email de la famille Roux exposant la découverte de fissures structurelles dans leur maison achetée 6 mois plus tôt. Ils demandent une consultation pour évaluer leurs recours.",
    corps_original:
      "Bonjour Maître Fernandez,\n\nNous vous contactons car nous avons un grave problème avec la maison que nous avons achetée il y a 6 mois au 45 avenue des Lilas, 75019 Paris.\n\nDes fissures importantes sont apparues sur les murs porteurs, de l'eau s'infiltre dans le sous-sol dès qu'il pleut, et notre chauffagiste nous a dit que l'isolation était quasi inexistante malgré ce qu'indiquait le DPE.\n\nNous avons payé 485 000 euros pour cette maison. C'est notre premier achat immobilier et nous sommes dévastés.\n\nPouvez-vous nous aider ? Avons-nous un recours contre le vendeur ?\n\nCordialement,\nPatrick et Sophie Roux\n06 45 67 89 01",
    date: daysAgo(20, 10),
    dossier_id: "4",
    dossier_nom: "Famille Roux",
    dossier_domaine: "Immobilier",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chers Monsieur et Madame Roux,\n\nJe vous remercie de votre confiance.\n\nLes désordres que vous décrivez pourraient constituer des vices cachés au sens de l'article 1641 du Code civil. Vous disposez de recours contre le vendeur.\n\nLa première étape est de faire constater les désordres par un expert judiciaire. Je peux saisir le tribunal d'une demande d'expertise en référé, ce qui permettra d'établir officiellement la nature et l'étendue des dommages.\n\nJe vous propose un rendez-vous rapide pour examiner vos documents.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e39",
    expediteur: "Famille Roux",
    email: "p.roux@wanadoo.fr",
    objet: "Diagnostics immobiliers de la vente",
    resume:
      "La famille Roux transmet les diagnostics immobiliers réalisés lors de la vente. Le DPE affichait une note C, mais les Roux suspectent une fraude car l'isolation est quasi inexistante.",
    corps_original:
      "Bonjour Maître,\n\nNous vous transmettons les diagnostics immobiliers qui étaient annexés à l'acte de vente :\n\n- Diagnostic de Performance Énergétique (DPE) : note C\n- État des risques et pollutions : RAS\n- Diagnostic amiante : négatif\n- Diagnostic plomb : négatif\n- Diagnostic termites : négatif\n\nLe DPE affiche une note C, ce qui semblait correct à l'achat. Mais notre chauffagiste nous dit que l'isolation est quasi inexistante et que la note devrait être E ou F. Le diagnostiqueur a-t-il été négligent ou complice ?\n\nCordialement,\nPatrick Roux",
    date: daysAgo(18, 11),
    dossier_id: "4",
    dossier_nom: "Famille Roux",
    dossier_domaine: "Immobilier",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "diagnostics_immobiliers_vente.pdf",
        taille: "980 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Diagnostics immobiliers annexés à l'acte de vente : DPE note C (possiblement erroné), amiante négatif, plomb négatif, termites négatif. Le DPE est suspect au regard de l'état réel de l'isolation.",
      },
    ],
    brouillon_mock:
      "Cher Monsieur Roux,\n\nMerci pour ces diagnostics. L'écart entre le DPE (note C) et la réalité (isolation quasi inexistante) est effectivement suspect.\n\nNous pourrions envisager une action complémentaire contre le diagnostiqueur pour manquement professionnel. Le rapport de l'expert judiciaire permettra de confirmer cette hypothèse.\n\nJe conserve ces documents au dossier.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },

  // --- Dossier 5: Claire Dubois (4 more, 1 PJ) ---
  {
    id: "e40",
    expediteur: "Tribunal de Grande Instance",
    email: "greffe.tgi@justice.fr",
    objet: "Convocation audience 15 avril",
    resume:
      "Convocation officielle du TGI de Paris pour l'audience du 15 avril à 14h00, salle 3B, 2e chambre civile. Affaire Dubois c/ SCI Les Tilleuls, RG 25/04512.",
    corps_original:
      "Maître,\n\nPar la présente, nous vous informons que l'affaire enregistrée sous le numéro RG 25/04512, opposant Mme Claire DUBOIS à la SCI LES TILLEULS, est fixée à l'audience du :\n\n15 avril 2026 à 14h00\nSalle 3B — 2e chambre civile\nTribunal de Grande Instance de Paris\n4, boulevard du Palais, 75001 Paris\n\nLes pièces complémentaires devront être déposées au greffe avant le 10 avril 2026.\n\nVeuillez agréer, Maître, l'expression de nos salutations distinguées.\n\nLe Greffier en chef",
    date: daysAgo(16, 14),
    dossier_id: "5",
    dossier_nom: "Claire Dubois",
    dossier_domaine: "Litige immobilier",
    category: "client",
    email_type: "convocation",
    pieces_jointes: [
      {
        nom: "convocation_audience_15avril.pdf",
        taille: "156 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Convocation officielle pour l'audience du 15 avril 2026 à 14h00, salle 3B, 2e chambre civile, TGI Paris. Affaire Dubois c/ SCI Les Tilleuls, RG 25/04512.",
      },
    ],
    brouillon_mock: null,
  },
  {
    id: "e41",
    expediteur: "Claire Dubois",
    email: "claire.dubois@orange.fr",
    objet: "PV assemblée générale copropriété",
    resume:
      "Mme Dubois transmet le PV de la dernière assemblée générale de copropriété. Les résolutions sur les charges ont été votées sans présentation du détail des postes, ce qui renforce sa contestation.",
    corps_original:
      "Bonjour Maître,\n\nJe vous transmets le procès-verbal de la dernière assemblée générale de copropriété du 12 décembre 2025.\n\nVous remarquerez à la page 3 que la résolution n°5 sur l'approbation des comptes a été votée sans que le syndic ne présente le détail des postes de charges. Plusieurs copropriétaires ont protesté mais le président de séance a passé outre.\n\nÀ la page 5, la résolution n°8 sur le budget prévisionnel 2026 montre une augmentation de 15% sans justification.\n\nJe pense que ces irrégularités sont importantes pour notre dossier.\n\nCordialement,\nClaire Dubois",
    date: daysAgo(12, 15),
    dossier_id: "5",
    dossier_nom: "Claire Dubois",
    dossier_domaine: "Litige immobilier",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "PV_AG_copropriete_2025.pdf",
        taille: "380 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Procès-verbal de l'AG de copropriété du 12 décembre 2025. Résolution n°5 sur les comptes votée sans détail des postes. Budget 2026 en hausse de 15% sans justification (résolution n°8).",
      },
    ],
    brouillon_mock:
      "Chère Madame Dubois,\n\nMerci pour ce PV qui est une pièce essentielle.\n\nLe vote de la résolution n°5 sans présentation du détail des postes constitue une irrégularité qui pourrait justifier l'annulation de cette résolution. De même, l'augmentation de 15% du budget sans justification est contestable.\n\nCes éléments renforcent considérablement notre argumentation devant le tribunal.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e42",
    expediteur: "Claire Dubois",
    email: "claire.dubois@orange.fr",
    objet: "Premier contact - charges copropriété",
    resume:
      "Premier email de Mme Dubois. Elle conteste les charges de copropriété excessives facturées par la SCI Les Tilleuls. Les charges ont augmenté de 47% en deux ans sans explication.",
    corps_original:
      "Bonjour Maître Fernandez,\n\nJe me permets de vous contacter car je suis copropriétaire dans une résidence gérée par la SCI Les Tilleuls et je subis des charges abusives depuis deux ans.\n\nMes charges sont passées de 3 200 euros/an en 2023 à 4 700 euros/an en 2025, soit une augmentation de 47% que le syndic refuse d'expliquer.\n\nJ'ai demandé le détail des postes à plusieurs reprises par courrier recommandé, sans réponse. D'autres copropriétaires se plaignent aussi mais personne n'ose agir.\n\nPensez-vous que j'ai un recours ?\n\nCordialement,\nClaire Dubois\n06 23 45 67 89",
    date: daysAgo(25, 10),
    dossier_id: "5",
    dossier_nom: "Claire Dubois",
    dossier_domaine: "Litige immobilier",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dubois,\n\nJe vous remercie pour votre prise de contact.\n\nUne augmentation de 47% des charges en deux ans est effectivement anormale et le syndic a une obligation légale de transparence. Vous disposez de plusieurs recours : contestation des résolutions d'AG, demande de justification des charges, voire changement de syndic.\n\nJe vous propose un rendez-vous pour examiner vos relevés de charges, PV d'AG et courriers recommandés.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e43",
    expediteur: "Claire Dubois",
    email: "claire.dubois@orange.fr",
    objet: "Courriers recommandés au syndic",
    resume:
      "Mme Dubois transmet les copies de ses trois courriers recommandés au syndic Les Tilleuls demandant le détail des charges. Aucun n'a reçu de réponse, ce qui caractérise un refus de communication.",
    corps_original:
      "Bonjour Maître,\n\nVoici les copies de mes trois courriers recommandés avec AR envoyés au syndic Les Tilleuls :\n\n1. 15 mai 2025 — Demande de détail des charges 2024 → AR signé, pas de réponse\n2. 20 août 2025 — Relance avec mise en demeure de communiquer les comptes → AR signé, pas de réponse\n3. 10 novembre 2025 — 2e relance + menace d'action en justice → AR signé, pas de réponse\n\nTrois courriers, trois accusés de réception, zéro réponse. C'est désespérant.\n\nCordialement,\nClaire Dubois",
    date: daysAgo(22, 14),
    dossier_id: "5",
    dossier_nom: "Claire Dubois",
    dossier_domaine: "Litige immobilier",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dubois,\n\nMerci pour ces courriers qui sont des pièces essentielles.\n\nLe triple refus de réponse du syndic constitue un manquement caractérisé à son obligation de communication (article 21 de la loi du 10 juillet 1965). C'est un argument très fort devant le tribunal.\n\nLes accusés de réception prouvent que vos demandes ont bien été reçues. Le juge en tirera les conséquences.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },

  // --- Dossier 6: Alice Bernard (4 more, 2 PJ) ---
  {
    id: "e44",
    expediteur: "Alice Bernard",
    email: "alice.b@free.fr",
    objet: "Divorce par consentement mutuel - Premier contact",
    resume:
      "Premier email de Mme Bernard souhaitant entamer un divorce par consentement mutuel. Mariée depuis 8 ans, deux enfants, un appartement en copropriété. Elle demande un premier rendez-vous.",
    corps_original:
      "Bonjour Maître Fernandez,\n\nJe me permets de vous contacter sur recommandation de mon amie Sophie Leroy qui a été très satisfaite de vos services.\n\nMon mari et moi avons décidé d'un commun accord de divorcer. Nous sommes mariés depuis 8 ans sous le régime de la communauté réduite aux acquêts. Nous avons deux enfants, Léa (6 ans) et Hugo (4 ans), et un appartement en copropriété à Paris 11e.\n\nNous souhaitons un divorce par consentement mutuel et avons déjà trouvé un accord sur la garde des enfants (alternée, une semaine sur deux) et le partage du patrimoine.\n\nPourriez-vous me recevoir pour un premier rendez-vous ?\n\nCordialement,\nAlice Bernard\n06 12 34 56 78",
    date: daysAgo(25, 15),
    dossier_id: "6",
    dossier_nom: "Alice Bernard",
    dossier_domaine: "Droit de la famille",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Bernard,\n\nJe vous remercie pour votre confiance.\n\nLe divorce par consentement mutuel est la procédure la plus adaptée quand les époux sont d'accord. Depuis la réforme de 2017, cette procédure se fait par acte d'avocat sans passage devant le juge.\n\nJe vous propose un premier rendez-vous à mon cabinet. Munissez-vous du livret de famille, acte de mariage, titres de propriété et 3 derniers avis d'imposition.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e45",
    expediteur: "Alice Bernard",
    email: "alice.b@free.fr",
    objet: "Titre de propriété appartement",
    resume:
      "Mme Bernard transmet le titre de propriété de l'appartement conjugal à Paris 11e. L'appartement a été acheté en 2020 pour 380 000 euros avec un crédit en cours de 245 000 euros.",
    corps_original:
      "Bonjour Maître,\n\nComme convenu, voici le titre de propriété de notre appartement situé 28 rue Oberkampf, 75011 Paris.\n\nQuelques précisions utiles :\n- Achat en indivision 50/50 en mars 2020\n- Prix d'achat : 380 000 euros\n- Crédit immobilier en cours : capital restant dû environ 245 000 euros (Banque Populaire)\n- Estimation actuelle par l'agence du quartier : environ 420 000 euros\n\nMon mari et moi sommes d'accord : je garde l'appartement et je lui rachète sa part. Faut-il faire une estimation officielle ?\n\nCordialement,\nAlice Bernard",
    date: daysAgo(20, 11),
    dossier_id: "6",
    dossier_nom: "Alice Bernard",
    dossier_domaine: "Droit de la famille",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "titre_propriete_oberkampf.pdf",
        taille: "890 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Titre de propriété de l'appartement au 28 rue Oberkampf, Paris 11e. Achat en indivision 50/50 en mars 2020 pour 380 000 euros. Crédit restant : 245 000 euros.",
      },
    ],
    brouillon_mock:
      "Chère Madame Bernard,\n\nMerci pour le titre de propriété.\n\nPour le rachat de la part de votre mari, une estimation officielle est fortement recommandée (par un notaire ou un expert immobilier agréé). L'estimation de l'agence ne suffira pas pour la convention.\n\nSur la base de 420 000 euros et d'un crédit restant de 245 000 euros, la soulte à verser à votre mari serait d'environ 87 500 euros.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e46",
    expediteur: "Alice Bernard",
    email: "alice.b@free.fr",
    objet: "Accord sur la garde des enfants",
    resume:
      "Mme Bernard détaille l'accord trouvé avec son mari sur la garde alternée des enfants. Elle demande comment formaliser ces arrangements dans la convention de divorce.",
    corps_original:
      "Bonjour Maître,\n\nMon mari et moi avons finalisé notre accord sur les enfants :\n\n- Garde alternée une semaine sur deux, du lundi matin au lundi suivant\n- Vacances scolaires partagées en alternance (années paires chez papa, impaires chez maman pour la première moitié, et inversement)\n- Pas de pension alimentaire car nous avons des revenus équivalents\n- L'école reste la même (école du quartier)\n- Chacun s'engage à ne pas déménager à plus de 20 km\n\nComment intégrons-nous tout cela dans la convention ?\n\nCordialement,\nAlice Bernard",
    date: daysAgo(15, 14),
    dossier_id: "6",
    dossier_nom: "Alice Bernard",
    dossier_domaine: "Droit de la famille",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Bernard,\n\nVotre accord est clair et bien structuré. Je vais le formaliser dans la convention de divorce.\n\nQuelques précisions importantes : même en cas de revenus équivalents, le juge pourrait recommander une pension alimentaire symbolique. La clause de non-éloignement de 20 km est tout à fait valable.\n\nJe rédige un projet de convention que je vous transmettrai pour relecture. Votre mari devra la faire valider par son propre avocat.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e47",
    expediteur: "Alice Bernard",
    email: "alice.b@free.fr",
    objet: "Avis d'imposition 2023-2025",
    resume:
      "Mme Bernard transmet les trois derniers avis d'imposition du couple. Les revenus combinés s'élèvent à environ 85 000 euros annuels, répartis de manière quasi égale entre les deux époux.",
    corps_original:
      "Bonjour Maître,\n\nVoici nos trois derniers avis d'imposition comme demandé :\n\n- 2023 : revenus imposables 82 500 euros (Alice : 42 000, Thomas : 40 500)\n- 2024 : revenus imposables 85 200 euros (Alice : 43 500, Thomas : 41 700)\n- 2025 : revenus imposables 87 800 euros (Alice : 45 000, Thomas : 42 800)\n\nNos revenus sont effectivement assez proches, ce qui devrait simplifier la question de la pension alimentaire.\n\nCordialement,\nAlice Bernard",
    date: daysAgo(18, 10),
    dossier_id: "6",
    dossier_nom: "Alice Bernard",
    dossier_domaine: "Droit de la famille",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "avis_imposition_2023_2025.pdf",
        taille: "650 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Trois avis d'imposition du couple Bernard (2023-2025). Revenus combinés de 82 500 à 87 800 euros/an, répartition quasi égale entre les époux.",
      },
    ],
    brouillon_mock:
      "Chère Madame Bernard,\n\nMerci pour les avis d'imposition.\n\nL'écart de revenus étant inférieur à 10%, il est effectivement cohérent de ne pas prévoir de pension alimentaire dans la convention. Le notaire et l'avocat de votre mari ne devraient pas s'y opposer.\n\nJe progresse bien dans la rédaction de la convention. Je vous enverrai un premier projet la semaine prochaine.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },

  // --- Filtered emails (13 more: e48-e60) ---
  {
    id: "e48",
    expediteur: "Newsletter Ordre des Avocats",
    email: "newsletter@ordre-avocats-paris.fr",
    objet: "Gala annuel du Barreau - Invitation",
    resume:
      "Invitation au gala annuel du Barreau de Paris prévu le 20 avril 2026 au Palais de justice. Dress code : tenue de soirée. Places limitées à 500 convives.",
    corps_original:
      "Chers Confrères et Consoeurs,\n\nNous avons le plaisir de vous convier au Gala annuel du Barreau de Paris.\n\nDate : samedi 20 avril 2026 à 20h00\nLieu : Salle des Pas Perdus, Palais de Justice, 75001 Paris\nDress code : Tenue de soirée\nCocktail suivi d'un dîner assis\nPlaces limitées à 500 convives\n\nInscription : gala.barreaudeparis.fr (65 euros/personne)\n\nNous espérons vous y retrouver nombreux.\n\nLe Comité d'organisation",
    date: daysAgo(8, 7),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "newsletter",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "e49",
    expediteur: "Claire Dubois",
    email: "claire.dubois@orange.fr",
    objet: "Témoignage de ma voisine",
    resume:
      "Mme Dubois informe qu'une voisine copropriétaire, Mme Petit, est prête à témoigner des irrégularités du syndic Les Tilleuls. Elle subit les mêmes augmentations de charges et a des preuves de surfacturation.",
    corps_original:
      "Bonjour Maître,\n\nBonne nouvelle : ma voisine du 3e étage, Mme Françoise Petit, est d'accord pour témoigner dans notre affaire contre la SCI Les Tilleuls.\n\nElle subit les mêmes augmentations de charges que moi et a découvert que le poste « entretien espaces verts » est facturé 8 000 euros par an alors que la résidence n'a qu'un petit carré de pelouse.\n\nElle a aussi constaté que le gardien, qui est salarié du syndic, fait très peu d'heures de présence malgré un poste à plein temps.\n\nPuis-je lui transmettre vos coordonnées pour qu'elle vous envoie son attestation ?\n\nCordialement,\nClaire Dubois",
    date: daysAgo(9, 10),
    dossier_id: "5",
    dossier_nom: "Claire Dubois",
    dossier_domaine: "Litige immobilier",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dubois,\n\nC'est une excellente nouvelle. Le témoignage de Mme Petit renforcera considérablement notre dossier, surtout concernant la surfacturation du poste espaces verts.\n\nOui, transmettez-lui mes coordonnées. Je lui enverrai un modèle d'attestation conforme à l'article 202 du Code de procédure civile.\n\nPlus nous aurons de copropriétaires témoins, plus notre argumentation sera solide devant le tribunal.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "e50",
    expediteur: "Pub LegalTech",
    email: "marketing@legalstart.fr",
    objet: "Automatisez vos contrats avec l'IA",
    resume:
      "Email promotionnel d'une LegalTech proposant un outil de génération automatique de contrats. Offre d'essai gratuit de 14 jours. Aucun intérêt pour le cabinet.",
    corps_original:
      "Bonjour Maître Fernandez,\n\nDécouvrez comment automatiser la rédaction de vos contrats grâce à notre IA juridique :\n\n- Générez un contrat complet en moins de 5 minutes\n- Plus de 200 modèles validés par des avocats\n- Mise à jour automatique avec les dernières évolutions légales\n- Signature électronique intégrée\n\nEssai gratuit de 14 jours — sans engagement.\n\nCréez votre compte sur legalstart.fr/pro\n\nL'équipe LegalStart",
    date: daysAgo(10, 8),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "spam",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "e51",
    expediteur: "Bulletin Dalloz",
    email: "newsletter@dalloz.fr",
    objet: "Veille jurisprudentielle - Semaine 11",
    resume:
      "Bulletin hebdomadaire Dalloz avec un focus sur la réforme du droit des contrats et un arrêt important sur la responsabilité des constructeurs.",
    corps_original:
      "Cher(e) abonné(e),\n\nRetrouvez la veille jurisprudentielle de la semaine 11 :\n\n1. Cass. 3e civ., 11 mars 2026 — Responsabilité décennale : précisions sur la notion d'ouvrage et les dommages intermédiaires.\n\n2. Cass. com., 12 mars 2026 — Réforme des sûretés : application dans le temps des nouvelles dispositions.\n\n3. Cass. soc., 13 mars 2026 — Temps partiel : requalification en temps plein en cas d'heures complémentaires régulières.\n\nBonne lecture,\nLa Rédaction Dalloz",
    date: daysAgo(11, 7),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "newsletter",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "e52",
    expediteur: "Notification RPVA",
    email: "rpva@avocats.fr",
    objet: "Nouvelle version e-barreau disponible",
    resume:
      "Le RPVA annonce la mise à jour de la plateforme e-barreau avec de nouvelles fonctionnalités de dépôt électronique et une interface modernisée.",
    corps_original:
      "Chers Confrères,\n\nNous avons le plaisir de vous informer de la mise à jour de la plateforme e-barreau.\n\nNouveautés :\n- Nouveau module de dépôt de conclusions avec validation automatique du format\n- Interface modernisée et responsive\n- Tableau de bord des échéances procédurales\n- Notifications push sur mobile\n\nLa migration sera effective dès lundi prochain. Vos identifiants restent inchangés.\n\nLe Service Technique CNB",
    date: daysAgo(13, 9),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "notification",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "e53",
    expediteur: "Spam Logiciel Comptable",
    email: "promo@comptaexpert.fr",
    objet: "Offre spéciale profession libérale -30%",
    resume:
      "Email promotionnel pour un logiciel comptable avec une réduction de 30% pour les professions libérales. Aucun intérêt pour le cabinet.",
    corps_original:
      "Cher(e) professionnel(le) libéral(e),\n\nProfitez de notre offre exceptionnelle :\n\nComptaExpert Pro — Le logiciel comptable n°1 des professions libérales\n\n- Déclaration 2035 automatisée\n- Rapprochement bancaire intelligent\n- Tableaux de bord en temps réel\n- Export direct vers votre comptable\n\nOffre spéciale : -30% avec le code AVOCAT2026\nSoit 29 euros/mois au lieu de 42 euros/mois\n\nTestez gratuitement pendant 30 jours.\n\nL'équipe ComptaExpert",
    date: daysAgo(14, 11),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "spam",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "e54",
    expediteur: "Notification Tribunal",
    email: "notifications@justice.gouv.fr",
    objet: "Accusé de réception assignation",
    resume:
      "Le greffe accuse réception de l'assignation déposée dans l'affaire Roux c/ Gauthier. Le dossier est enregistré sous le numéro RG 26/02891.",
    corps_original:
      "Maître,\n\nNous accusons réception de l'assignation en garantie des vices cachés déposée au nom de M. et Mme ROUX contre M. Jean-Claude GAUTHIER.\n\nNuméro d'enregistrement : RG 26/02891\nJuridiction : TGI Paris, 5e chambre civile\nDate d'enregistrement : ce jour\n\nL'audience d'orientation sera fixée ultérieurement. Vous serez convoqué(e) par voie dématérialisée.\n\nLe Greffe du TGI de Paris",
    date: daysAgo(15, 9),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "notification",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "e55",
    expediteur: "Pub Fournitures Bureau",
    email: "offres@bureau-discount.fr",
    objet: "Papier A4 à prix cassé",
    resume:
      "Email publicitaire pour des fournitures de bureau à prix réduit. Ramettes de papier A4, toners et accessoires. Aucun intérêt.",
    corps_original:
      "Bonjour,\n\nGrande vente de printemps chez Bureau Discount !\n\n- Ramette papier A4 80g (500 feuilles) : 3,99 euros au lieu de 5,49 euros\n- Toner HP LaserJet Pro : 39,90 euros au lieu de 59,90 euros\n- Lot de 10 chemises à rabat : 4,50 euros\n- Agrafeuse professionnelle : 12,90 euros\n\nLivraison gratuite dès 50 euros d'achat.\n\nCommandez sur bureau-discount.fr\n\nL'équipe Bureau Discount",
    date: daysAgo(16, 10),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "spam",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "e56",
    expediteur: "Bulletin Dalloz",
    email: "newsletter@dalloz.fr",
    objet: "Veille jurisprudentielle - Semaine 10",
    resume:
      "Bulletin hebdomadaire Dalloz avec les décisions marquantes de la semaine, notamment un arrêt sur le devoir de conseil du notaire et une décision sur les charges de copropriété.",
    corps_original:
      "Cher(e) abonné(e),\n\nRetrouvez la veille jurisprudentielle de la semaine 10 :\n\n1. Cass. 1re civ., 4 mars 2026 — Devoir de conseil du notaire : le notaire doit vérifier l'exactitude du DPE en cas de doute sérieux.\n\n2. Cass. 3e civ., 5 mars 2026 — Charges de copropriété : le syndic ne peut voter l'augmentation des charges sans justifier le détail des postes.\n\n3. Cass. soc., 6 mars 2026 — Rupture conventionnelle et harcèlement : conditions de validité du consentement.\n\nBonne lecture,\nLa Rédaction Dalloz",
    date: daysAgo(18, 7),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "newsletter",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "e57",
    expediteur: "Notification Tribunal",
    email: "notifications@justice.gouv.fr",
    objet: "Mise à jour rôle des audiences",
    resume:
      "Le greffe informe de la mise à jour du rôle des audiences pour avril 2026. Trois affaires concernent le cabinet : RG 26/01234, RG 25/04512 et RG 26/02891.",
    corps_original:
      "Maître,\n\nNous vous informons de la publication du rôle des audiences pour le mois d'avril 2026.\n\nAffaires vous concernant :\n- RG 26/01234 — Dupont c/ BTP Pro — Mise en état, 22 avril, 10h00\n- RG 25/04512 — Dubois c/ SCI Les Tilleuls — Plaidoiries, 15 avril, 14h00\n- RG 26/02891 — Roux c/ Gauthier — Orientation, 28 avril, 9h30\n\nConsultable sur e-barreau.\n\nLe Greffe du TGI de Paris",
    date: daysAgo(20, 9),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "notification",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "e58",
    expediteur: "Pub Séminaire Juridique",
    email: "inscriptions@seminairejuridique.fr",
    objet: "Masterclass Intelligence Artificielle et Droit",
    resume:
      "Email promotionnel pour une masterclass sur l'IA et le droit prévue en mai 2026. Programme de deux jours à 890 euros. Aucun intérêt immédiat pour le cabinet.",
    corps_original:
      "Maître Fernandez,\n\nNe manquez pas notre Masterclass exceptionnelle :\n\n« Intelligence Artificielle et Droit — Enjeux et opportunités pour les avocats »\n\nDates : 15-16 mai 2026\nLieu : Hôtel Marriott, Paris La Défense\nPrix : 890 euros HT (déjeuners inclus)\n\nProgramme :\n- L'IA dans la recherche juridique\n- Rédaction assistée par IA\n- Questions éthiques et déontologiques\n- Ateliers pratiques\n\nInscription : seminairejuridique.fr/ia-droit\n\nPlaces limitées à 50 participants.",
    date: daysAgo(22, 8),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "spam",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "e59",
    expediteur: "Newsletter Ordre des Avocats",
    email: "newsletter@ordre-avocats-paris.fr",
    objet: "Actualités juridiques février",
    resume:
      "Newsletter mensuelle de l'Ordre des Avocats de Paris pour février. Au sommaire : aide juridictionnelle revalorisée, cotisation ordinale 2026, et nouveau protocole sanitaire au Palais.",
    corps_original:
      "Chers Confrères et Consoeurs,\n\nRetrouvez les actualités du mois de février 2026 :\n\n1. Aide juridictionnelle — Revalorisation de 5% des barèmes, applicable au 1er mars 2026.\n\n2. Cotisation ordinale 2026 — Date limite de paiement : 30 avril 2026. Montant inchangé : 520 euros.\n\n3. Protocole sanitaire — Fin du port du masque obligatoire au Palais de Justice à compter du 1er mars 2026.\n\n4. Bibliothèque — Nouveaux horaires d'ouverture : du lundi au vendredi, 8h30-19h00.\n\nBonne lecture,\nL'Ordre des Avocats de Paris",
    date: daysAgo(25, 7),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "newsletter",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "e60",
    expediteur: "Notification Tribunal",
    email: "notifications@justice.gouv.fr",
    objet: "Rappel cotisation RPVA 2026",
    resume:
      "Rappel de la cotisation annuelle RPVA 2026 de 96 euros à régler avant le 31 mars. Le paiement peut se faire en ligne sur le site du CNB.",
    corps_original:
      "Maître,\n\nNous vous rappelons que la cotisation annuelle RPVA 2026 d'un montant de 96 euros TTC doit être réglée avant le 31 mars 2026.\n\nModes de paiement :\n- En ligne sur cnb.avocat.fr/paiement\n- Par chèque à l'ordre du CNB\n- Par virement (RIB disponible sur le site)\n\nEn cas de non-paiement, votre accès à e-barreau pourra être suspendu.\n\nLe Service Comptabilité du CNB",
    date: daysAgo(28, 10),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "notification",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
  },
];

// ---------------------------------------------------------------------------
// Helpers: filter by period & compute stats
// ---------------------------------------------------------------------------

function getEmailsForPeriod(period: "24h" | "7j" | "30j"): MockEmail[] {
  const cutoff = new Date(NOW);
  if (period === "24h") cutoff.setDate(cutoff.getDate() - 1);
  else if (period === "7j") cutoff.setDate(cutoff.getDate() - 7);
  else cutoff.setDate(cutoff.getDate() - 30);
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
    summary:
      "Mme Dupont conteste une facture de 3 200 euros pour travaux non conformes réalisés par BTP Pro. Mise en demeure envoyée, réponse contestatoire reçue de l'avocat adverse. Constat d'huissier en cours de programmation.",
    emails_narrative:
      "12 emails au total. Mme Dupont relance sur la procédure. Le Cabinet Durand conteste la non-conformité et produit une attestation. Photos complémentaires des dégâts transmises. Constat d'huissier programmé.",
    pieces_narrative:
      "4 pièces jointes : conclusions adverses BTP Pro (PDF), photos façade nord (ZIP), relance BTP Pro (PDF), photos complémentaires (JPEG).",
    dates_cles: [
      "Expiration délai mise en demeure — sous 7 jours",
      "Délai supplémentaire Cabinet Durand — sous 14 jours",
      "Audience mise en état — 22 avril",
    ],
    deadline_days: 7,
    attente: {
      description:
        "Mise en demeure envoyée, réponse contestatoire reçue — délai de 15 jours accordé pour pièces complémentaires",
      jours: 24,
    },
  },
  "2": {
    nom: "Jean-Pierre Martin",
    domaine: "Droit du travail",
    needs_immediate_attention: true,
    summary:
      "Rupture conventionnelle en cours de négociation avec SAS TechCorp. 7 ans d'ancienneté, salaire 4 200 euros brut. Indemnité légale de 8 400 euros proposée, jugée insuffisante. 2e entretien confirmé dans 3 jours.",
    emails_narrative:
      "10 emails au total. M. Martin transmet simulation d'indemnités, évaluations annuelles, contrat et avenants. Heures supplémentaires non payées identifiées comme levier. 2e entretien confirmé par TechCorp.",
    pieces_narrative:
      "3 pièces jointes : simulation indemnités TechCorp (PDF), évaluations annuelles 2023-2025 (PDF), contrat et avenants (PDF).",
    dates_cles: [
      "2e entretien préalable — dans 3 jours",
      "Date de sortie envisagée — 30 avril",
    ],
    deadline_days: 3,
    attente: null,
  },
  "4": {
    nom: "Famille Roux",
    domaine: "Immobilier",
    needs_immediate_attention: false,
    summary:
      "Vices cachés confirmés par le rapport d'expertise définitif. Coût des réparations revu à la hausse : 92 500 euros HT après découverte d'un affaissement de fondations. Action en garantie engagée contre le vendeur M. Gauthier.",
    emails_narrative:
      "8 emails au total. Rapport d'expertise définitif et complément reçus. Acte de vente transmis par le notaire avec clause d'exclusion. Aggravation des infiltrations signalée. Assignation déposée.",
    pieces_narrative:
      "4 pièces jointes : complément expertise (PDF), rapport expertise définitif (PDF), acte de vente copie authentique (PDF), aucune PJ manquante.",
    dates_cles: [
      "Audience d'orientation — 28 avril",
      "Date limite assignation garantie vices cachés — sous 55 jours",
    ],
    deadline_days: 55,
    attente: null,
  },
  "5": {
    nom: "Claire Dubois",
    domaine: "Litige immobilier",
    needs_immediate_attention: false,
    summary:
      "Charges de copropriété abusives contestées par Mme Dubois contre la SCI Les Tilleuls. Augmentation de 47% en 2 ans sans justification. Audience fixée au 15 avril, TGI Paris.",
    emails_narrative:
      "7 emails au total. Convocation TGI reçue pour le 15 avril. Relevés de charges et PV d'AG transmis. Trois courriers recommandés au syndic sans réponse documentés.",
    pieces_narrative:
      "3 pièces jointes : relevés de charges 2024-2025 (PDF), convocation TGI (PDF), PV assemblée générale (PDF).",
    dates_cles: [
      "Date limite dépôt pièces — 10 avril",
      "Audience TGI, 2e chambre civile — 15 avril",
    ],
    deadline_days: 15,
    attente: {
      description:
        "Relevés de charges transmis — conclusions à finaliser avant le 10 avril",
      jours: 12,
    },
  },
  "6": {
    nom: "Alice Bernard",
    domaine: "Droit de la famille",
    needs_immediate_attention: false,
    summary:
      "Divorce par consentement mutuel. Mme Bernard et son mari sont d'accord sur la garde alternée et le partage du patrimoine. Appartement Paris 11e (420 000 euros estimés). Convention en cours de rédaction.",
    emails_narrative:
      "5 emails au total. Documents complets reçus : livret de famille, titre de propriété, avis d'imposition. Accord sur la garde des enfants formalisé. Convention de divorce en cours de rédaction.",
    pieces_narrative:
      "2 pièces jointes : titre de propriété (PDF), avis d'imposition 2023-2025 (PDF).",
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
