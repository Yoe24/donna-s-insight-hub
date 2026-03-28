/**
 * Mock data for Dashboard V4 — Dopamine & Gamification
 * Source of truth for the V4 demo mode.
 * Ne pas modifier mock-briefing.ts — ce fichier est indépendant.
 */

const NOW = new Date();
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600_000).toISOString();
const daysAgo = (d: number, h = 9) =>
  new Date(NOW.getTime() - d * 86_400_000 - h * 3_600_000).toISOString();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface V4Email {
  id: string;
  expediteur: string;
  email_from: string;
  objet: string;
  resume: string;
  corps_original: string;
  date: string;
  dossier_id: string | null;
  dossier_nom: string | null;
  dossier_domaine: string | null;
  urgency: "haute" | "moyenne" | "basse" | null;
  email_type: "informatif" | "demande" | "relance" | "convocation" | "piece_jointe";
  pieces_jointes: {
    nom: string;
    taille: string;
    type_mime: string;
    resume_ia: string;
  }[];
  brouillon_mock: string | null;
  /** Annuler — Donna l'a classé, pas besoin d'action */
  filtered_by_donna?: boolean;
}

export interface V4Dossier {
  id: string;
  nom: string;
  domaine: string;
  urgency: "haute" | "moyenne" | "basse";
  email_ids: string[];
  resume_court: string;
  dates_cles: string[];
}

export interface V4BriefingData {
  nom_avocat: string;
  date_briefing: string;
  narrative: string;
  /** Emails nécessitant une action */
  emails_action: V4Email[];
  /** Emails traités automatiquement par Donna */
  emails_traites: V4Email[];
  stats: {
    total_analyses: number;
    action_required: number;
    auto_traites: number;
    temps_gagne_minutes: number;
    streak_jours: number;
    brouillons_generes: number;
    brief_lu: boolean;
  };
  dossiers: V4Dossier[];
}

// ---------------------------------------------------------------------------
// 6 dossiers
// ---------------------------------------------------------------------------

export const v4Dossiers: V4Dossier[] = [
  {
    id: "d1",
    nom: "Dupont c/ Dupont",
    domaine: "Droit de la famille",
    urgency: "haute",
    email_ids: ["v4-e1"],
    resume_court: "Divorce contentieux — convocation JAF 15 avril",
    dates_cles: ["Audience JAF : 15 avril 2026"],
  },
  {
    id: "d2",
    nom: "SCI Les Tilleuls",
    domaine: "Bail commercial",
    urgency: "haute",
    email_ids: ["v4-e2"],
    resume_court: "3 mois de loyers impayés — mise en demeure à envoyer",
    dates_cles: ["Mise en demeure : avant le 5 avril 2026"],
  },
  {
    id: "d3",
    nom: "Succession Martin",
    domaine: "Droit des successions",
    urgency: "moyenne",
    email_ids: ["v4-e3"],
    resume_court: "Désaccord entre héritiers sur le partage",
    dates_cles: ["Réunion notariale : 22 avril 2026"],
  },
  {
    id: "d4",
    nom: "Madame Roux",
    domaine: "Droit du travail",
    urgency: "moyenne",
    email_ids: ["v4-e4"],
    resume_court: "Licenciement abusif — audience prud'hommes à préparer",
    dates_cles: ["Audience prud'hommes : 8 mai 2026"],
  },
  {
    id: "d5",
    nom: "Dubois & Fils",
    domaine: "Recouvrement",
    urgency: "basse",
    email_ids: ["v4-e5"],
    resume_court: "Recouvrement 45 000 € — accusé de réception dossier",
    dates_cles: [],
  },
  {
    id: "d6",
    nom: "Association Horizon",
    domaine: "Droit associatif",
    urgency: "basse",
    email_ids: [],
    resume_court: "Conflit de gouvernance — médiation en cours",
    dates_cles: [],
  },
];

// ---------------------------------------------------------------------------
// Emails nécessitant une action (3)
// ---------------------------------------------------------------------------

export const v4EmailsAction: V4Email[] = [
  {
    id: "v4-e1",
    expediteur: "Tribunal de Grande Instance de Paris",
    email_from: "greffe.jaf@justice.gouv.fr",
    objet: "Convocation audience JAF — Dupont c/ Dupont — 15 avril 2026",
    urgency: "haute",
    email_type: "convocation",
    date: hoursAgo(2),
    dossier_id: "d1",
    dossier_nom: "Dupont c/ Dupont",
    dossier_domaine: "Droit de la famille",
    resume:
      "Le greffe du JAF convoque les parties à une audience le 15 avril 2026 à 14h00, salle 12. L'objet porte sur les mesures provisoires (résidence des enfants, pension alimentaire). Présence obligatoire des deux parties et de leurs conseils.",
    corps_original:
      "TRIBUNAL DE GRANDE INSTANCE DE PARIS\nJuge aux Affaires Familiales\n\nMaître Fernandez,\n\nNous vous convoquons à une audience devant le Juge aux Affaires Familiales le 15 avril 2026 à 14h00, salle 12, 1er étage.\n\nAffaire : Dupont Éric c/ Dupont Nathalie\nRéférence : RG 26/02847\n\nOrdre du jour :\n- Résidence habituelle des enfants mineurs (Léa, 8 ans, et Tom, 5 ans)\n- Droit de visite et d'hébergement de l'autre parent\n- Montant de la pension alimentaire\n- Attribution du domicile conjugal pendant la procédure\n\nVotre présence et celle de votre cliente sont obligatoires. En cas d'empêchement, vous devez impérativement en informer le greffe au moins 48h à l'avance.\n\nCordialement,\nLe Greffier en chef",
    pieces_jointes: [
      {
        nom: "convocation_jaf_15avril.pdf",
        taille: "185 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Convocation officielle du JAF pour l'audience du 15 avril 2026 à 14h00. Objet : mesures provisoires divorce Dupont. Présence obligatoire.",
      },
      {
        nom: "ordonnance_jaf_provisoire.pdf",
        taille: "312 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Ordonnance provisoire fixant la résidence des enfants chez la mère et une pension alimentaire provisoire de 600 €/mois. Valable jusqu'à l'audience.",
      },
    ],
    brouillon_mock:
      "Maître,\n\nJ'accuse réception de la convocation à l'audience JAF du 15 avril 2026.\n\nMa cliente, Mme Dupont Nathalie, et moi-même serons présents à l'audience.\n\nNous déposerons nos conclusions avant le 10 avril conformément au calendrier de procédure.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "v4-e2",
    expediteur: "M. Karim Benzara",
    email_from: "karim.benzara@sci-tilleuls.fr",
    objet: "Loyers impayés — situation critique — besoin d'action urgente",
    urgency: "haute",
    email_type: "demande",
    date: hoursAgo(5),
    dossier_id: "d2",
    dossier_nom: "SCI Les Tilleuls",
    dossier_domaine: "Bail commercial",
    resume:
      "M. Benzara, gérant de la SCI Les Tilleuls, signale que le locataire commercial (restaurant Le Soleil d'Or) n'a pas payé les loyers des mois de janvier, février et mars 2026, soit 3 × 4 200 € = 12 600 € de créance. Il demande d'engager la procédure d'expulsion et de recouvrement sans délai.",
    corps_original:
      "Maître Fernandez,\n\nJe vous contacte en urgence concernant notre locataire, M. Samir Okafor, exploitant le restaurant « Le Soleil d'Or » au rez-de-chaussée du 14 rue des Lilas, 75020 Paris.\n\nSituation :\n- Loyer mensuel : 4 200 € TTC (bail signé le 1er septembre 2022, renouvelé le 1er septembre 2025)\n- Loyers impayés : janvier 2026, février 2026, mars 2026\n- Total dû : 12 600 € TTC (hors intérêts de retard)\n- Appels téléphoniques sans réponse depuis le 15 janvier\n- Lettre de relance amiable envoyée le 20 février — sans réponse\n\nJ'ai constaté que le restaurant est toujours ouvert (il fait des affaires, visiblement). Ce silence total de sa part est incompréhensible et insupportable.\n\nJe vous demande d'agir le plus vite possible pour :\n1. Lui envoyer une mise en demeure par LRAR\n2. Engager la procédure de résiliation du bail pour défaut de paiement\n3. Si nécessaire, obtenir une ordonnance d'expulsion\n\nCordialement,\nKarim Benzara\nGérant — SCI Les Tilleuls",
    pieces_jointes: [
      {
        nom: "releve_impayés_Q1_2026.xlsx",
        taille: "48 KB",
        type_mime:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        resume_ia:
          "Tableau récapitulatif des loyers impayés : janvier (4 200 €), février (4 200 €), mars (4 200 €). Total : 12 600 € TTC. Dernière relance amiable : 20 février 2026.",
      },
    ],
    brouillon_mock:
      "Cher Monsieur Benzara,\n\nJ'ai bien pris note de la situation concernant M. Okafor.\n\nJe vous confirme que nous allons immédiatement :\n1. Adresser une mise en demeure par lettre recommandée avec accusé de réception sous 48h, avec mise en demeure de régulariser sous 8 jours\n2. Préparer une assignation en référé pour constat de résiliation du bail et expulsion si aucun règlement n'intervient dans ce délai\n\nLes intérêts de retard au taux légal s'ajouteront à la créance principale de 12 600 €.\n\nJe reviens vers vous dès l'envoi de la mise en demeure.\n\nCordialement,\nMe Alexandra Fernandez",
  },
  {
    id: "v4-e3",
    expediteur: "Me François Leconte",
    email_from: "f.leconte@notaire-leconte.fr",
    objet: "Succession Martin — désaccord héritiers — demande de position",
    urgency: "moyenne",
    email_type: "piece_jointe",
    date: hoursAgo(9),
    dossier_id: "d3",
    dossier_nom: "Succession Martin",
    dossier_domaine: "Droit des successions",
    resume:
      "Le notaire Me Leconte informe que les deux héritiers (Isabelle et Christophe Martin) sont en désaccord sur l'évaluation du bien immobilier principal. Isabelle souhaite vendre, Christophe veut conserver. Me Leconte demande la position formelle de votre cliente avant la réunion du 22 avril.",
    corps_original:
      "Maître Fernandez,\n\nJe me permets de vous écrire dans le cadre de la succession de feu M. Robert Martin, décédé le 12 décembre 2025.\n\nComme vous le savez, deux héritiers sont concernés :\n- Mme Isabelle Martin, votre cliente\n- M. Christophe Martin, représenté par Me Garnier\n\nLe principal point de blocage concerne le bien immobilier sis au 8 allée des Chênes, 69006 Lyon (estimé entre 420 000 € et 480 000 € selon les deux estimations réalisées).\n\nIsabelle souhaite procéder à la vente du bien et partager le produit. Christophe souhaite se voir attribuer le bien en nature moyennant le versement d'une soulte à sa sœur.\n\nLe désaccord porte également sur l'évaluation retenue : Isabelle souhaite retenir l'estimation haute (480 000 €) tandis que Christophe insiste sur l'estimation basse (420 000 €).\n\nAuriez-vous l'amabilité de me faire parvenir la position formelle et écrite de votre cliente avant le 18 avril, afin que je puisse préparer le projet d'acte de partage pour notre réunion du 22 avril ?\n\nBien confraternellement,\nMe François Leconte\nNotaire à Lyon",
    pieces_jointes: [
      {
        nom: "estimation_immo_martin.pdf",
        taille: "890 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Rapport d'estimation du bien immobilier de Lyon. Estimation basse : 420 000 € (agence B). Estimation haute : 480 000 € (agence A). Écart de 60 000 € source du désaccord successoral.",
      },
    ],
    brouillon_mock:
      "Cher Maître Leconte,\n\nJe vous remercie pour votre message concernant la succession Martin.\n\nAprès échange avec ma cliente Mme Isabelle Martin, je vous confirme sa position :\n\n1. Elle demande la vente du bien immobilier de Lyon, estimant qu'une attribution en nature à son frère la pénaliserait financièrement\n2. Elle entend retenir l'estimation haute de 480 000 €, correspondant à la valeur de marché actuelle selon l'agence A\n3. Elle est ouverte à une réunion le 22 avril comme prévu\n\nJe vous ferai parvenir ses observations écrites formelles avant le 18 avril.\n\nBien confraternellement,\nMe Alexandra Fernandez",
  },
];

// ---------------------------------------------------------------------------
// Emails traités automatiquement par Donna (9)
// ---------------------------------------------------------------------------

export const v4EmailsTraites: V4Email[] = [
  {
    id: "v4-t1",
    expediteur: "Mme Sophie Roux",
    email_from: "sophie.roux@gmail.com",
    objet: "Préparation audience prud'hommes — questions",
    urgency: "moyenne",
    email_type: "demande",
    date: hoursAgo(1),
    dossier_id: "d4",
    dossier_nom: "Madame Roux",
    dossier_domaine: "Droit du travail",
    resume:
      "Mme Roux demande des précisions sur le déroulement de l'audience prud'homale du 8 mai et les pièces qu'elle doit apporter. Classé par Donna — résumé ajouté au dossier.",
    corps_original:
      "Maître Fernandez,\n\nJ'ai quelques questions sur l'audience du 8 mai. Que dois-je apporter comme documents ? Comment ça se passe concrètement ? Dois-je prendre la journée ou juste la matinée ?\n\nMerci,\nSophie Roux",
    pieces_jointes: [],
    brouillon_mock: null,
    filtered_by_donna: true,
  },
  {
    id: "v4-t2",
    expediteur: "Cabinet Maître Garnier",
    email_from: "contact@cabinet-garnier.fr",
    objet: "Succession Martin — accusé de réception",
    urgency: "basse",
    email_type: "informatif",
    date: hoursAgo(3),
    dossier_id: "d3",
    dossier_nom: "Succession Martin",
    dossier_domaine: "Droit des successions",
    resume:
      "Accusé de réception des conclusions transmises hier. Aucune action requise. Classé par Donna.",
    corps_original:
      "Maître Fernandez,\n\nBonne réception de vos conclusions du 27 mars dans l'affaire Martin.\n\nConfraternellement,\nMe Garnier",
    pieces_jointes: [],
    brouillon_mock: null,
    filtered_by_donna: true,
  },
  {
    id: "v4-t3",
    expediteur: "Tribunal de commerce de Paris",
    email_from: "greffe@tc-paris.fr",
    objet: "Dubois & Fils — accusé réception dossier RG 26/03412",
    urgency: "basse",
    email_type: "informatif",
    date: hoursAgo(4),
    dossier_id: "d5",
    dossier_nom: "Dubois & Fils",
    dossier_domaine: "Recouvrement",
    resume:
      "Le greffe accuse réception du dossier de recouvrement Dubois & Fils. Référence RG 26/03412. Première audience fixée au 3 juin 2026. Classé par Donna.",
    corps_original:
      "Maître,\n\nLe greffe du Tribunal de commerce de Paris accuse réception de votre assignation en recouvrement.\n\nRéférence : RG 26/03412\nAffaire : Dubois & Fils SARL c/ Société Béton Sud\nPremière audience : 3 juin 2026 à 10h00, salle 8\n\nLe Greffier",
    pieces_jointes: [],
    brouillon_mock: null,
    filtered_by_donna: true,
  },
  {
    id: "v4-t4",
    expediteur: "Newsletter Ordre des Avocats",
    email_from: "newsletter@barreau-paris.fr",
    objet: "Actualités juridiques — mars 2026",
    urgency: null,
    email_type: "informatif",
    date: hoursAgo(6),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    resume:
      "Newsletter mensuelle. Réforme procédure civile, nouvelles formations, vie de l'Ordre. Classé par Donna — aucune action requise.",
    corps_original:
      "Chers Confrères,\n\nVeuillez trouver ci-dessous les actualités de l'Ordre du mois de mars 2026...\n\n[Newsletter complète]",
    pieces_jointes: [],
    brouillon_mock: null,
    filtered_by_donna: true,
  },
  {
    id: "v4-t5",
    expediteur: "Confirmation Système",
    email_from: "no-reply@e-barreau.fr",
    objet: "Confirmation dépôt e-barreau — RG 26/02847",
    urgency: null,
    email_type: "informatif",
    date: hoursAgo(7),
    dossier_id: "d1",
    dossier_nom: "Dupont c/ Dupont",
    dossier_domaine: "Droit de la famille",
    resume:
      "Accusé de réception automatique du dépôt de conclusions sur e-barreau pour RG 26/02847. Classé par Donna.",
    corps_original:
      "Votre dépôt a bien été enregistré.\nRéférence : RG 26/02847\nDate : 28 mars 2026 09:14",
    pieces_jointes: [],
    brouillon_mock: null,
    filtered_by_donna: true,
  },
  {
    id: "v4-t6",
    expediteur: "Mme Claire Dubois",
    email_from: "claire.dubois@hotmail.fr",
    objet: "Remerciements pour votre suivi",
    urgency: null,
    email_type: "informatif",
    date: hoursAgo(10),
    dossier_id: "d5",
    dossier_nom: "Dubois & Fils",
    dossier_domaine: "Recouvrement",
    resume:
      "Mme Dubois remercie pour le suivi du dossier de recouvrement. Message informatif classé par Donna.",
    corps_original:
      "Maître Fernandez,\n\nMerci pour votre réactivité et le suivi de notre dossier. Mon frère et moi sommes rassurés de savoir l'affaire entre vos mains.\n\nBien cordialement,\nClaire Dubois",
    pieces_jointes: [],
    brouillon_mock: null,
    filtered_by_donna: true,
  },
  {
    id: "v4-t7",
    expediteur: "Banque BNP Paribas",
    email_from: "noreply@bnpparibas.fr",
    objet: "Votre relevé de compte — mars 2026",
    urgency: null,
    email_type: "informatif",
    date: hoursAgo(11),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    resume:
      "Relevé mensuel BNP. Non lié à un dossier client. Classé par Donna — administratif cabinet.",
    corps_original:
      "Votre relevé de compte professionnel est disponible dans votre espace client BNP.",
    pieces_jointes: [],
    brouillon_mock: null,
    filtered_by_donna: true,
  },
  {
    id: "v4-t8",
    expediteur: "M. Philippe Nguyen",
    email_from: "p.nguyen@horizon-asso.org",
    objet: "Association Horizon — point de situation médiation",
    urgency: "basse",
    email_type: "informatif",
    date: hoursAgo(12),
    dossier_id: "d6",
    dossier_nom: "Association Horizon",
    dossier_domaine: "Droit associatif",
    resume:
      "M. Nguyen confirme que la médiation entre les membres du bureau avance positivement. Prochaine réunion le 10 avril. Classé par Donna — informatif.",
    corps_original:
      "Maître Fernandez,\n\nBonne nouvelle : après la réunion de hier soir, les tensions semblent s'apaiser. Les deux clans sont prêts à se retrouver autour d'une table le 10 avril avec le médiateur.\n\nJe vous tiens informée.\n\nCordialement,\nPhilippe Nguyen",
    pieces_jointes: [],
    brouillon_mock: null,
    filtered_by_donna: true,
  },
  {
    id: "v4-t9",
    expediteur: "Agenda Google",
    email_from: "calendar-notification@google.com",
    objet: "Rappel : Audience Dubois — demain 10h",
    urgency: null,
    email_type: "informatif",
    date: hoursAgo(14),
    dossier_id: "d5",
    dossier_nom: "Dubois & Fils",
    dossier_domaine: "Recouvrement",
    resume:
      "Rappel automatique Google Calendar. Classé par Donna — notification automatique.",
    corps_original:
      "Rappel : Audience Dubois & Fils — demain à 10h00 — Tribunal de commerce.",
    pieces_jointes: [],
    brouillon_mock: null,
    filtered_by_donna: true,
  },
];

// ---------------------------------------------------------------------------
// Briefing principal V4
// ---------------------------------------------------------------------------

export const v4Briefing: V4BriefingData = {
  nom_avocat: "Alexandra",
  date_briefing: NOW.toISOString(),
  narrative:
    "Bonjour Alexandra. Ce matin, j'ai analysé 12 nouveaux emails. 3 nécessitent votre attention immédiate — dont une convocation JAF urgente pour l'affaire Dupont. Les 9 autres ont été classés et résumés automatiquement. Vous avez gagné environ 47 minutes.",
  emails_action: v4EmailsAction,
  emails_traites: v4EmailsTraites,
  stats: {
    total_analyses: 12,
    action_required: 3,
    auto_traites: 9,
    temps_gagne_minutes: 47,
    streak_jours: 3,
    brouillons_generes: 2,
    brief_lu: false,
  },
  dossiers: v4Dossiers,
};

// ---------------------------------------------------------------------------
// Helper : retrouver un email par id
// ---------------------------------------------------------------------------

export const v4AllEmails: V4Email[] = [
  ...v4EmailsAction,
  ...v4EmailsTraites,
];

export function findV4Email(id: string): V4Email | undefined {
  return v4AllEmails.find((e) => e.id === id);
}
