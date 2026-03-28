/**
 * mock-briefing-v2.ts
 * Données mock pour la page Briefing V2 (cartes visuelles style Notion).
 * 6 dossiers fictifs réalistes — avocate Maître Fernandez, cabinet parisien.
 */

import type { DossierEmail } from "@/components/BriefingDetailPanel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface V2PieceJointe {
  nom: string;
  taille: string;
  type_mime: string;
  resume_ia: string;
}

export type V2EmailType =
  | "convocation"
  | "demande"
  | "informatif"
  | "piece_jointe"
  | "relance";

export type V2UrgencyLevel = "urgent" | "a_traiter" | "traite";

export interface V2Email {
  id: string;
  expediteur: string;
  email: string;
  objet: string;
  resume: string;
  corps_original: string;
  date: string;
  dossier_id: string;
  email_type: V2EmailType;
  urgency: V2UrgencyLevel;
  pieces_jointes: V2PieceJointe[];
  brouillon_mock: string | null;
  from_email: string;
  to_email: string;
}

export interface V2Dossier {
  id: string;
  nom: string;
  domaine: string;
  urgency: V2UrgencyLevel;
  /** Emails à traiter dans ce dossier */
  emails: V2Email[];
  /** Résumé Donna du dossier */
  summary: string;
  dates_cles: string[];
  deadline_days: number | null;
}

export interface V2BriefStats {
  total_emails: number;
  emails_dossiers: number;
  emails_filtres: number;
  pieces_jointes: number;
  temps_gagne_minutes: number;
}

export interface V2BriefingData {
  narrative: string;
  stats: V2BriefStats;
  dossiers: V2Dossier[];
  /** Emails filtrés par Donna (hors dossiers) */
  filtered_emails: V2FilteredEmail[];
}

export interface V2FilteredEmail {
  id: string;
  expediteur: string;
  objet: string;
  resume: string;
  date: string;
  reason: "newsletter" | "spam" | "notification";
}

// ---------------------------------------------------------------------------
// Helpers de date
// ---------------------------------------------------------------------------

const NOW = new Date();
const hoursAgo = (h: number) =>
  new Date(NOW.getTime() - h * 3600000).toISOString();
const daysAgo = (d: number, h = 9) =>
  new Date(NOW.getTime() - d * 86400000 - h * 3600000).toISOString();

// ---------------------------------------------------------------------------
// Dossier 1 — Dupont c/ Dupont  (URGENT — divorce, garde alternée)
// ---------------------------------------------------------------------------

const dupont_emails: V2Email[] = [
  {
    id: "v2-e1",
    expediteur: "Madame Dupont",
    email: "isabelle.dupont@gmail.com",
    objet: "Mon ex-mari refuse de me rendre les enfants",
    resume:
      "Mme Dupont signale que son ex-mari n'a pas restitué les enfants à la fin de son droit de visite du week-end. Elle demande une intervention urgente avant l'audience du JAF.",
    corps_original:
      "Maître Fernandez,\n\nJe vous écris en urgence. Mon ex-mari Frédéric n'a pas ramené les enfants dimanche soir comme prévu. Il était censé les déposer à 18h et j'attends toujours. Il ne répond plus à mes messages. Je suis en panique totale.\n\nQu'est-ce que je fais ? Est-ce que j'appelle la police ? Est-ce que ça va servir à quelque chose ? L'audience avec le JAF est dans moins de trois semaines, j'ai peur que ça complique tout.\n\nMerci de me rappeler dès que possible.\nIsabelle Dupont",
    date: hoursAgo(2),
    dossier_id: "v2-d1",
    email_type: "demande",
    urgency: "urgent",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dupont,\n\nJe comprends votre inquiétude. Si les enfants ne vous ont pas été restitués dans les délais prévus par l'ordonnance, vous pouvez contacter la police pour un signalement. Je prends en charge la rédaction d'un référé d'heure à heure si la situation ne se régularise pas d'ici ce soir.\n\nContactez-moi dès que possible par téléphone.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Isabelle Dupont <isabelle.dupont@gmail.com>",
    to_email: "alexandra@cabinet-fernandez.fr",
  },
  {
    id: "v2-e2",
    expediteur: "JAF — Tribunal judiciaire de Paris",
    email: "jaf-paris@tribunaljudiciaire.fr",
    objet: "Convocation audience JAF — 15 avril 2026",
    resume:
      "Le Juge aux affaires familiales convoque les parties à une audience de mise en état le 15 avril 2026 à 9h30. Ordre du jour : révision des modalités de la garde alternée et de la pension alimentaire.",
    corps_original:
      "Maître Fernandez,\n\nNous avons l'honneur de vous convoquer, ainsi que la partie adverse représentée par Me Laurent, à une audience devant le Juge aux affaires familiales du Tribunal judiciaire de Paris :\n\nDate : le 15 avril 2026 à 9h30\nSalle : 4.07 — 4e étage\nObjet : Révision de l'ordonnance de garde alternée et de la pension alimentaire — dossier RG 26/00578\n\nLes parties devront produire leurs conclusions et pièces au plus tard le 8 avril 2026.\n\nLe Greffier\nTribunal judiciaire de Paris",
    date: hoursAgo(6),
    dossier_id: "v2-d1",
    email_type: "convocation",
    urgency: "urgent",
    pieces_jointes: [
      {
        nom: "Ordonnance JAF.pdf",
        taille: "340 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Ordonnance de mise en état. Audience le 15 avril à 9h30. Les deux parents doivent produire leurs conclusions et pièces avant le 8 avril.",
      },
      {
        nom: "Attestation école.pdf",
        taille: "180 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Attestation de l'école primaire Victor Hugo confirmant les absences de l'enfant sur les semaines imputées au père.",
      },
    ],
    brouillon_mock:
      "Madame, Monsieur,\n\nJ'accuse réception de la convocation du 15 avril 2026. Je confirme la présence de ma cliente Mme Isabelle Dupont à cette audience.\n\nJe déposerai les conclusions et pièces dans le délai imparti.\n\nCordialement,\nMe Alexandra Fernandez",
    from_email: "JAF Paris <jaf-paris@tribunaljudiciaire.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
  },
  {
    id: "v2-e3",
    expediteur: "Me Laurent",
    email: "me.laurent@cabinet-laurent.fr",
    objet: "RE : Conclusions en réponse — Dupont c/ Dupont",
    resume:
      "Me Laurent, conseil de M. Frédéric Dupont, conteste la demande de révision de garde. Il argue que la situation professionnelle de sa cliente est instable et demande le maintien du statu quo.",
    corps_original:
      "Chère Consoeur,\n\nJ'ai l'honneur de vous adresser mes conclusions en réponse dans le dossier Dupont c/ Dupont (RG 26/00578).\n\nMon client conteste formellement la demande de révision des modalités de garde formulée par votre cliente. La situation professionnelle instable de Mme Dupont (trois changements d'employeur en deux ans) ne saurait constituer une évolution de circonstances au sens de l'article 373-2-13 du Code civil.\n\nNous demandons le maintien de l'ordonnance initiale.\n\nBien confraternellement,\nMe Laurent",
    date: daysAgo(1, 14),
    dossier_id: "v2-d1",
    email_type: "piece_jointe",
    urgency: "urgent",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Confrère,\n\nJ'ai bien reçu vos conclusions en réponse. Je me réserve le droit d'y répliquer avant l'audience du 15 avril.\n\nJe note que la « stabilité professionnelle » invoquée ne répond pas aux éléments produits par ma cliente concernant les absences scolaires non justifiées.\n\nCordialement,\nMe Alexandra Fernandez",
    from_email: "Cabinet Laurent <me.laurent@cabinet-laurent.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
  },
];

// ---------------------------------------------------------------------------
// Dossier 2 — SCI Les Tilleuls c/ Brasserie du Parc  (À TRAITER — bail commercial)
// ---------------------------------------------------------------------------

const tilleuls_emails: V2Email[] = [
  {
    id: "v2-e4",
    expediteur: "M. Bertrand — SCI Les Tilleuls",
    email: "bertrand@sci-lestilleuls.fr",
    objet: "3 mois de loyers impayés — quelle suite ?",
    resume:
      "M. Bertrand, gérant de la SCI, signale que la Brasserie du Parc n'a pas réglé les loyers de janvier, février et mars 2026 (total 9 600 euros). Il demande une mise en demeure formelle en vue d'une résiliation.",
    corps_original:
      "Maître Fernandez,\n\nComme je vous l'avais annoncé lors de notre rendez-vous du mois dernier, la Brasserie du Parc est maintenant en retard de 3 mois complets. Le total des loyers impayés s'élève à 9 600 euros TTC (loyer mensuel : 3 200 euros + charges).\n\nJ'ai essayé de contacter le gérant M. Marceau à plusieurs reprises sans succès. Il était pourtant ponctuel depuis 5 ans. Ce changement soudain m'inquiète — est-ce que la brasserie serait en difficulté financière ?\n\nJe souhaite engager la procédure de résiliation du bail pour défaut de paiement. Qu'est-ce que je dois faire ?\n\nCordialement,\nM. Bertrand",
    date: hoursAgo(4),
    dossier_id: "v2-d2",
    email_type: "demande",
    urgency: "a_traiter",
    pieces_jointes: [
      {
        nom: "Bail commercial.pdf",
        taille: "520 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Bail commercial signé le 1er janvier 2021 pour une durée de 9 ans. Loyer mensuel 3 200 euros HT. Clause résolutoire de plein droit en cas de non-paiement après commandement resté infructueux.",
      },
      {
        nom: "Mise en demeure.pdf",
        taille: "120 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Projet de mise en demeure adressée à la Brasserie du Parc pour paiement sous 8 jours de 9 600 euros correspondant aux loyers de janvier, février et mars 2026.",
      },
    ],
    brouillon_mock:
      "Monsieur Bertrand,\n\nJ'ai bien reçu votre message et les pièces jointes.\n\nCompte tenu du bail commercial que vous m'avez transmis, la procédure est la suivante : nous devons d'abord envoyer un commandement de payer par acte d'huissier, puis attendre un délai d'un mois. Si le locataire ne régularise pas dans ce délai, la clause résolutoire joue de plein droit.\n\nJe vous propose de mandater un huissier pour la délivrance du commandement dès cette semaine.\n\nCordialement,\nMe Alexandra Fernandez",
    from_email: "SCI Les Tilleuls <bertrand@sci-lestilleuls.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
  },
  {
    id: "v2-e5",
    expediteur: "Me Girard — Cabinet Girard",
    email: "me.girard@cabinet-girard.fr",
    objet: "Brasserie du Parc — contestation des charges",
    resume:
      "L'avocat du locataire conteste les charges locatives pour l'année 2025 (3 800 euros réclamés), arguant d'une absence de justificatifs détaillés. Il propose une compensation des arriérés de loyer par ce litige.",
    corps_original:
      "Chère Consoeur,\n\nJ'ai été constitué aux intérêts de la Brasserie du Parc SARL dans le cadre du litige qui vous oppose à mon client.\n\nMon client conteste les charges locatives de 2025 d'un montant de 3 800 euros, au motif que le bailleur n'a jamais produit les justificatifs détaillés malgré deux demandes formelles.\n\nDans ce contexte, je vous informe que mon client se prévaut d'une compensation légale entre sa créance de charges indues et les loyers réclamés.\n\nJe reste ouvert à une résolution amiable du litige.\n\nBien confraternellement,\nMe Girard",
    date: daysAgo(2, 11),
    dossier_id: "v2-d2",
    email_type: "informatif",
    urgency: "a_traiter",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Confrère,\n\nJ'accuse réception de votre courrier.\n\nLa compensation légale invoquée par votre client n'est pas recevable : les conditions en sont strictement encadrées, et le litige sur les charges ne saurait suspendre l'obligation de payer les loyers.\n\nJe vous rappelle que la clause résolutoire est suspendue à l'expiration d'un délai d'un mois après commandement, et non à la résolution du litige sur les charges.\n\nCordialement,\nMe Alexandra Fernandez",
    from_email: "Cabinet Girard <me.girard@cabinet-girard.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
  },
];

// ---------------------------------------------------------------------------
// Dossier 3 — Succession Martin  (À TRAITER — partage successoral)
// ---------------------------------------------------------------------------

const martin_emails: V2Email[] = [
  {
    id: "v2-e6",
    expediteur: "Me Beaumont — Notaire",
    email: "me.beaumont@notaires-beaumont.fr",
    objet: "Succession Martin — désaccord sur l'actif immobilier",
    resume:
      "Le notaire Me Beaumont informe que les héritiers ne s'accordent pas sur la valeur de la maison familiale (entre 380 000 et 420 000 euros selon les parties). Il sollicite la position de votre cliente Mme Martin-Leblanc.",
    corps_original:
      "Maître Fernandez,\n\nJe me permets de vous informer de l'avancement du règlement de la succession Martin (acte de décès du 12 janvier 2026, Monsieur Henri Martin).\n\nLors de la réunion de famille du 22 mars, les héritiers n'ont pas pu s'accorder sur la valeur de la maison familiale sise 14 rue des Chênes, 91400 Orsay. M. Thierry Martin (frère de votre cliente) propose 380 000 euros, tandis que Mme Sophie Martin-Leblanc (votre cliente) estime que le bien vaut au moins 420 000 euros au vu des travaux récents.\n\nAfin de débloquer la situation, je vous propose de mandater un expert immobilier indépendant. Pourriez-vous me confirmer l'accord de votre cliente pour cette démarche ?\n\nBien confraternellement,\nMe Beaumont, notaire",
    date: hoursAgo(8),
    dossier_id: "v2-d3",
    email_type: "demande",
    urgency: "a_traiter",
    pieces_jointes: [
      {
        nom: "Acte de décès.pdf",
        taille: "95 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Acte de décès de M. Henri Martin, décédé le 12 janvier 2026 à Orsay. Succession ouverte le même jour.",
      },
      {
        nom: "Estimation immobilière.pdf",
        taille: "2.1 MB",
        type_mime: "application/pdf",
        resume_ia:
          "Estimation réalisée par l'agence Century 21 en février 2026 : fourchette entre 390 000 et 415 000 euros. Estimation fondée sur les transactions récentes dans le secteur.",
      },
    ],
    brouillon_mock:
      "Maître Beaumont,\n\nJ'ai bien reçu votre courrier et en ai informé ma cliente Mme Sophie Martin-Leblanc.\n\nMa cliente marque son accord pour le recours à un expert immobilier indépendant, sous réserve que l'expert soit choisi d'un commun accord entre les parties ou, à défaut, désigné par le Président du Tribunal judiciaire d'Évry.\n\nCordialement,\nMe Alexandra Fernandez",
    from_email: "Me Beaumont notaire <me.beaumont@notaires-beaumont.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
  },
  {
    id: "v2-e7",
    expediteur: "Mme Martin-Leblanc",
    email: "sophie.martin.leblanc@free.fr",
    objet: "Ma sœur refuse de vendre la maison",
    resume:
      "Mme Martin-Leblanc se plaint que son frère Thierry bloque la vente de la maison familiale pour y habiter avec sa famille. Elle demande s'il est possible de demander un partage judiciaire.",
    corps_original:
      "Maître Fernandez,\n\nJe suis à bout. Mon frère Thierry m'a annoncé hier qu'il ne voulait pas vendre la maison d'Orsay. Il veut y emménager avec sa femme et ses enfants. Or moi j'ai besoin de ma part d'héritage, j'ai des emprunts à rembourser.\n\nEst-ce que je peux forcer la vente ? Il me semble que la loi est de mon côté, non ? Je ne veux pas me brouiller avec mon frère mais là c'est vraiment bloquant pour moi financièrement.\n\nMerci d'avance,\nSophie",
    date: daysAgo(2, 16),
    dossier_id: "v2-d3",
    email_type: "demande",
    urgency: "a_traiter",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Martin-Leblanc,\n\nEn droit des successions, nul ne peut être contraint de rester dans l'indivision. Vous disposez effectivement du droit de demander le partage judiciaire (article 840 du Code civil) si votre frère s'oppose à la vente amiable.\n\nCette procédure permet au tribunal de désigner un notaire pour procéder au partage. C'est un recours à utiliser en dernier ressort après avoir épuisé les voies amiables.\n\nJe vous conseille de laisser d'abord Me Beaumont tenter une conciliation.\n\nCordialement,\nMe Alexandra Fernandez",
    from_email: "Sophie Martin-Leblanc <sophie.martin.leblanc@free.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
  },
];

// ---------------------------------------------------------------------------
// Dossier 4 — Madame Roux  (URGENT — licenciement abusif, prud'hommes)
// ---------------------------------------------------------------------------

const roux_emails: V2Email[] = [
  {
    id: "v2-e8",
    expediteur: "Mme Roux",
    email: "camille.roux@gmail.com",
    objet: "J'ai reçu ma lettre de licenciement",
    resume:
      "Mme Camille Roux a reçu sa lettre de licenciement pour insuffisance professionnelle. Elle conteste les motifs invoqués et souhaite saisir le conseil de prud'hommes. La lettre fait état de faits datant de plus de 2 ans.",
    corps_original:
      "Maître Fernandez,\n\nJe viens de recevoir ma lettre de licenciement par LRAR. Le motif invoqué est « insuffisance professionnelle » mais c'est totalement faux. Mon employeur me reproche des retards dans les livrables d'un projet — des retards qui étaient dus à un manque de ressources que j'avais signalé par écrit à plusieurs reprises.\n\nDe plus, certains faits mentionnés dans la lettre datent de 2023. Est-ce que c'est légal de les utiliser comme motif de licenciement ?\n\nJe veux aller aux prud'hommes. Qu'est-ce qu'on fait ?\n\nCamille Roux",
    date: hoursAgo(3),
    dossier_id: "v2-d4",
    email_type: "demande",
    urgency: "urgent",
    pieces_jointes: [
      {
        nom: "Lettre licenciement.pdf",
        taille: "210 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Lettre de licenciement pour insuffisance professionnelle datée du 27 mars 2026. Reproche des retards sur le projet Mercure (T3 2025) et une note d'évaluation insuffisante de 2023. Préavis de 3 mois.",
      },
      {
        nom: "Contrat travail.pdf",
        taille: "280 KB",
        type_mime: "application/pdf",
        resume_ia:
          "CDI signé le 15 mars 2020. Poste : chef de projet digital. Salaire brut mensuel 4 100 euros. Ancienneté 6 ans.",
      },
    ],
    brouillon_mock:
      "Chère Madame Roux,\n\nJ'ai bien pris connaissance de votre lettre de licenciement.\n\nDeux éléments me semblent contestables : d'une part, les faits de 2023 sont prescrits (article L1332-4 du Code du travail — délai de prescription de 2 mois) ; d'autre part, l'insuffisance professionnelle invoquée paraît insuffisamment étayée au regard des signalements que vous dites avoir effectués.\n\nJe vous propose de nous réunir rapidement pour préparer la saisine du CPH. Le délai de prescription de l'action est de 12 mois à compter de la notification.\n\nCordialement,\nMe Alexandra Fernandez",
    from_email: "Camille Roux <camille.roux@gmail.com>",
    to_email: "alexandra@cabinet-fernandez.fr",
  },
  {
    id: "v2-e9",
    expediteur: "Me Faure — Avocat employeur",
    email: "me.faure@cabinet-faure.fr",
    objet: "Licenciement Mme Roux — position employeur",
    resume:
      "L'avocat de l'employeur défend la légitimité du licenciement. Il produit des éléments de suivi managérial et soutient que les insuffisances sont documentées et récentes.",
    corps_original:
      "Chère Consoeur,\n\nJ'ai été constitué pour la société Digitex SA dans le cadre du litige avec Mme Camille Roux.\n\nJe vous informe que mon client est en mesure de produire des éléments détaillés documentant les insuffisances professionnelles constatées sur les 18 derniers mois : rapports de suivi hebdomadaires, échanges email avec sa hiérarchie, comptes-rendus de réunions.\n\nLe licenciement est parfaitement fondé.\n\nJe reste à votre disposition pour un échange amiable.\n\nBien confraternellement,\nMe Faure",
    date: daysAgo(1, 10),
    dossier_id: "v2-d4",
    email_type: "informatif",
    urgency: "urgent",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Confrère,\n\nJ'accuse réception de votre courrier.\n\nNous attendrons la phase de conciliation devant le CPH pour échanger les pièces. Ma cliente conteste les motifs de licenciement, notamment les faits prescrits mentionnés dans la lettre.\n\nCordialement,\nMe Alexandra Fernandez",
    from_email: "Cabinet Faure <me.faure@cabinet-faure.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
  },
];

// ---------------------------------------------------------------------------
// Dossier 5 — Entreprise Dubois & Fils  (À TRAITER — recouvrement)
// ---------------------------------------------------------------------------

const dubois_emails: V2Email[] = [
  {
    id: "v2-e10",
    expediteur: "M. Dubois",
    email: "directeur@dubois-fils.fr",
    objet: "Client qui ne paie toujours pas — 45 000 euros",
    resume:
      "M. Dubois signale que son client Constructions Lemaire n'a pas réglé trois factures totalisant 45 000 euros depuis 6 mois. Les relances amiables sont restées sans effet. Il souhaite engager une procédure d'injonction de payer.",
    corps_original:
      "Maître Fernandez,\n\nJe reviens vers vous concernant l'impayé de Constructions Lemaire.\n\nDespite mes nombreuses relances (emails, courriers, appels téléphoniques), ils n'ont pas versé un centime sur les 45 000 euros qu'ils nous doivent. Ça fait maintenant 6 mois que les premières factures sont échues.\n\nMa trésorerie est sérieusement impactée. J'ai 8 employés à payer. Il faut absolument agir vite.\n\nQuelle est la procédure la plus rapide ?\n\nM. Philippe Dubois",
    date: hoursAgo(5),
    dossier_id: "v2-d5",
    email_type: "demande",
    urgency: "a_traiter",
    pieces_jointes: [
      {
        nom: "Factures impayées.pdf",
        taille: "450 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Trois factures impayées : FA-2025-0234 (18 000 euros, échue le 15 septembre 2025), FA-2025-0289 (14 500 euros, échue le 1er octobre 2025), FA-2025-0312 (12 500 euros, échue le 15 novembre 2025). Total 45 000 euros TTC.",
      },
    ],
    brouillon_mock:
      "Monsieur Dubois,\n\nJ'ai bien reçu votre message et les factures impayées.\n\nLa procédure la plus rapide est l'injonction de payer (article 1405 du Code de procédure civile). Si le débiteur ne forme pas opposition dans le délai d'un mois, l'ordonnance devient exécutoire et vous pouvez faire procéder à une saisie.\n\nLe délai total est généralement de 6 à 8 semaines. Je vous prépare la requête cette semaine.\n\nCordialement,\nMe Alexandra Fernandez",
    from_email: "Dubois & Fils <directeur@dubois-fils.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
  },
];

// ---------------------------------------------------------------------------
// Dossier 6 — Association Horizon  (À TRAITER — conflit membres bureau)
// ---------------------------------------------------------------------------

const horizon_emails: V2Email[] = [
  {
    id: "v2-e11",
    expediteur: "M. Chardon — Président Horizon",
    email: "president@asso-horizon.fr",
    objet: "Trésorier : dépenses non autorisées — que faire ?",
    resume:
      "Le président de l'association Horizon signale que le trésorier a effectué des dépenses de 8 700 euros non approuvées par le bureau. Il souhaite l'exclure et récupérer les fonds.",
    corps_original:
      "Maître Fernandez,\n\nJe suis le président de l'association Horizon (loi 1901, 240 adhérents, budget annuel environ 80 000 euros).\n\nNotre trésorier, M. Éric Fontaine, a réalisé des dépenses d'un montant total de 8 700 euros sans approbation du bureau ni de l'assemblée générale. Il a notamment acheté du matériel informatique pour sa propre association amie et réglé des frais de déplacement personnels.\n\nNous avons les relevés bancaires qui prouvent tout. Le bureau souhaite :\n1. L'exclure de l'association\n2. Récupérer les 8 700 euros\n\nComment procéder légalement ?\n\nM. Bernard Chardon",
    date: hoursAgo(7),
    dossier_id: "v2-d6",
    email_type: "demande",
    urgency: "a_traiter",
    pieces_jointes: [
      {
        nom: "Statuts.pdf",
        taille: "175 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Statuts de l'Association Horizon (loi 1901, déposés en 2018). Article 10 : procédure d'exclusion par décision du bureau à la majorité des 2/3. Article 15 : le trésorier ne peut engager des dépenses au-delà de 500 euros sans autorisation du bureau.",
      },
      {
        nom: "Relevés bancaires.pdf",
        taille: "880 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Relevés du compte courant de l'association pour la période septembre 2025 — mars 2026. Identifie 7 transactions non autorisées imputables au trésorier pour un total de 8 700 euros.",
      },
    ],
    brouillon_mock:
      "Monsieur Chardon,\n\nJ'ai pris connaissance de votre dossier.\n\nVos statuts vous donnent le cadre nécessaire pour agir sur deux fronts :\n\n1. Exclusion : le bureau peut prononcer l'exclusion à la majorité des 2/3, à condition de respecter une procédure contradictoire (convocation du trésorier, remise d'un document exposant les griefs, délai pour se défendre).\n\n2. Remboursement : vous pouvez adresser une mise en demeure de rembourser les 8 700 euros, puis engager une action civile si nécessaire.\n\nJe vous conseille de ne pas agir de manière précipitée pour éviter tout vice de procédure.\n\nCordialement,\nMe Alexandra Fernandez",
    from_email: "Asso Horizon <president@asso-horizon.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
  },
];

// ---------------------------------------------------------------------------
// Emails filtrés par Donna (hors dossiers)
// ---------------------------------------------------------------------------

export const v2FilteredEmails: V2FilteredEmail[] = [
  {
    id: "v2-f1",
    expediteur: "Newsletter Ordre des Avocats",
    objet: "Actualités juridiques — mars 2026",
    resume: "Newsletter mensuelle de l'Ordre des Avocats de Paris. Réforme procédure civile, formations disponibles.",
    date: hoursAgo(4),
    reason: "newsletter",
  },
  {
    id: "v2-f2",
    expediteur: "Notification Tribunal",
    objet: "Confirmation dépôt électronique — RG 26/01234",
    resume: "Accusé de réception du dépôt de pièces via RPVA. Aucune action requise.",
    date: hoursAgo(10),
    reason: "notification",
  },
  {
    id: "v2-f3",
    expediteur: "Bureau Discount",
    objet: "Soldes fournitures de bureau — -40%",
    resume: "Email publicitaire de fournitures de bureau. Ramettes, toners, mobilier.",
    date: daysAgo(1, 6),
    reason: "spam",
  },
  {
    id: "v2-f4",
    expediteur: "Bulletin Dalloz",
    objet: "Veille jurisprudentielle — semaine 12",
    resume: "Bulletin hebdomadaire Dalloz : 3 arrêts en responsabilité notariale, copropriété et prud'hommes.",
    date: daysAgo(2, 8),
    reason: "newsletter",
  },
  {
    id: "v2-f5",
    expediteur: "RPVA",
    objet: "Rappel cotisation RPVA 2026",
    resume: "Rappel de la cotisation annuelle RPVA 2026 — 96 euros à régler avant le 31 mars.",
    date: daysAgo(3, 7),
    reason: "notification",
  },
];

// ---------------------------------------------------------------------------
// Construction des dossiers V2
// ---------------------------------------------------------------------------

export const v2Dossiers: V2Dossier[] = [
  {
    id: "v2-d1",
    nom: "Dupont c/ Dupont",
    domaine: "Droit de la famille",
    urgency: "urgent",
    emails: dupont_emails,
    summary:
      "Divorce contentieux avec désaccord sur la garde alternée. Audience JAF fixée au 15 avril. La cliente signale un incident de non-restitution des enfants.",
    dates_cles: ["Dépôt conclusions — 8 avril", "Audience JAF — 15 avril"],
    deadline_days: 8,
  },
  {
    id: "v2-d2",
    nom: "SCI Les Tilleuls c/ Brasserie du Parc",
    domaine: "Bail commercial",
    urgency: "a_traiter",
    emails: tilleuls_emails,
    summary:
      "3 mois de loyers impayés (9 600 euros). Le locataire conteste les charges pour bloquer la procédure. Commandement de payer à délivrer.",
    dates_cles: ["Commandement huissier — à planifier"],
    deadline_days: null,
  },
  {
    id: "v2-d3",
    nom: "Succession Martin",
    domaine: "Droit successoral",
    urgency: "a_traiter",
    emails: martin_emails,
    summary:
      "Partage successoral bloqué sur la valeur de la maison familiale. Le notaire propose un expert indépendant. La cliente envisage un partage judiciaire.",
    dates_cles: ["Réponse notaire — à envoyer cette semaine"],
    deadline_days: 7,
  },
  {
    id: "v2-d4",
    nom: "Madame Roux",
    domaine: "Droit du travail",
    urgency: "urgent",
    emails: roux_emails,
    summary:
      "Licenciement pour insuffisance professionnelle contesté. Faits prescrits invoqués dans la lettre. Saisine CPH à préparer — délai 12 mois.",
    dates_cles: ["Saisine CPH — avant le 27 mars 2027"],
    deadline_days: null,
  },
  {
    id: "v2-d5",
    nom: "Entreprise Dubois & Fils",
    domaine: "Recouvrement",
    urgency: "a_traiter",
    emails: dubois_emails,
    summary:
      "45 000 euros de créances impayées depuis 6 mois. Procédure d'injonction de payer à engager en urgence pour préserver la trésorerie du client.",
    dates_cles: ["Requête injonction — cette semaine"],
    deadline_days: 5,
  },
  {
    id: "v2-d6",
    nom: "Association Horizon",
    domaine: "Droit associatif",
    urgency: "a_traiter",
    emails: horizon_emails,
    summary:
      "Trésorier ayant détourné 8 700 euros. Procédure d'exclusion et action en remboursement. Vérifier la régularité des statuts avant d'agir.",
    dates_cles: ["Mise en demeure — à rédiger"],
    deadline_days: null,
  },
];

// ---------------------------------------------------------------------------
// Stats globales
// ---------------------------------------------------------------------------

const allV2Emails = [
  ...dupont_emails,
  ...tilleuls_emails,
  ...martin_emails,
  ...roux_emails,
  ...dubois_emails,
  ...horizon_emails,
];

const totalPJ = allV2Emails.reduce((sum, e) => sum + e.pieces_jointes.length, 0);

export const v2Stats: V2BriefStats = {
  total_emails: allV2Emails.length + v2FilteredEmails.length,
  emails_dossiers: allV2Emails.length,
  emails_filtres: v2FilteredEmails.length,
  pieces_jointes: totalPJ,
  temps_gagne_minutes: 45,
};

// ---------------------------------------------------------------------------
// Briefing narratif
// ---------------------------------------------------------------------------

export const v2Narrative =
  "Bonjour Maître Fernandez. Ce matin, Donna a analysé 12 nouveaux emails. 3 nécessitent votre attention immédiate : une convocation du JAF dans le dossier Dupont (audience le 15 avril), une lettre de licenciement pour Mme Roux avec des éléments contestables, et une demande urgente de M. Dubois sur ses créances impayées. Les 9 autres emails ont été classés et résumés. Donna vous a fait gagner environ 45 minutes.";

// ---------------------------------------------------------------------------
// Export principal
// ---------------------------------------------------------------------------

export const mockBriefingV2: V2BriefingData = {
  narrative: v2Narrative,
  stats: v2Stats,
  dossiers: v2Dossiers,
  filtered_emails: v2FilteredEmails,
};

// ---------------------------------------------------------------------------
// Helper : convert V2Email → Email (pour EmailDrawer)
// ---------------------------------------------------------------------------

export function v2EmailToDrawerEmail(e: V2Email, dossierNom: string, dossierDomaine: string) {
  return {
    id: e.id,
    expediteur: `${e.expediteur} <${e.email}>`,
    objet: e.objet,
    resume: e.resume,
    brouillon: e.brouillon_mock,
    pipeline_step: "pret_a_reviser" as const,
    contexte_choisi: "",
    statut: "traite",
    created_at: e.date,
    updated_at: e.date,
    contenu: e.corps_original,
    dossier_id: e.dossier_id,
    dossier_name: `${dossierNom} - ${dossierDomaine}`,
    from_email: e.email,
    email_type: e.email_type,
    attachments: e.pieces_jointes.map((pj, i) => ({
      id: `${e.id}-att-${i}`,
      filename: pj.nom,
      type: pj.type_mime.includes("pdf")
        ? ("pdf" as const)
        : pj.type_mime.includes("image")
        ? ("image" as const)
        : ("other" as const),
      size: pj.taille,
    })),
  };
}

// ---------------------------------------------------------------------------
// mockDossierEmailsV2 — pour BriefingDetailPanel compatibility
// ---------------------------------------------------------------------------

export const mockDossierEmailsV2: Record<string, DossierEmail[]> = {};

for (const d of v2Dossiers) {
  mockDossierEmailsV2[d.id] = d.emails.map((e) => ({
    id: e.id,
    expediteur: e.expediteur,
    email: e.email,
    objet: e.objet,
    date: new Date(e.date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    resume: e.resume,
    contenu: e.corps_original,
    pieces_jointes: e.pieces_jointes.length > 0
      ? e.pieces_jointes.map((pj) => ({
          nom: pj.nom,
          taille: pj.taille,
          resume: pj.resume_ia,
        }))
      : undefined,
  }));
}
