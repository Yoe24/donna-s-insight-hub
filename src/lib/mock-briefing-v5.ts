/**
 * mock-briefing-v5.ts — Données mock pour DashboardV5 (dashboard premium fintech)
 * 6 dossiers, 12 emails, données juridiques réalistes en français
 */

import type { Email } from "@/hooks/useEmails";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NOW = new Date();
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600_000).toISOString();
const daysAgo = (d: number, h = 9) =>
  new Date(NOW.getTime() - d * 86_400_000 - h * 3_600_000).toISOString();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EmailPriority = "urgent" | "normal" | "traite";

export interface V5PieceJointe {
  nom: string;
  taille: string;
  type_mime: string;
  resume_ia: string;
}

export interface V5Email {
  id: string;
  expediteur: string;
  from_email: string;
  objet: string;
  resume: string;
  corps_original: string;
  brouillon_mock: string | null;
  date: string;
  dossier_id: string;
  dossier_nom: string;
  dossier_domaine: string;
  pieces_jointes: V5PieceJointe[];
  priority: EmailPriority;
}

export interface V5WeekStats {
  lun: number;
  mar: number;
  mer: number;
  jeu: number;
  ven: number;
}

export interface V5BriefingData {
  nom_avocat: string;
  date_briefing: string;
  temps_gagne_minutes: number;
  emails_count: number;
  classes_count: number;
  pj_count: number;
  narrative: string;
  emails_prioritaires: V5Email[];
  emails_traites: V5Email[];
  week_stats: V5WeekStats;
}

// ---------------------------------------------------------------------------
// Emails prioritaires — 3 dossiers urgents/importants
// ---------------------------------------------------------------------------

const emailsPrioritaires: V5Email[] = [
  // ---- 1. Dupont c/ Dupont — URGENT ----
  {
    id: "v5-e1",
    expediteur: "Me Laurent Aubert",
    from_email: "l.aubert@cabinet-aubert.fr",
    objet: "Convocation JAF — audience 15 avril 2026",
    resume:
      "Le conseil de M. Dupont transmet la convocation devant le Juge aux Affaires Familiales fixée au 15 avril 2026 à 14h00. Il sollicite votre position écrite sur les modalités de garde avant le 5 avril.",
    corps_original:
      "Chère Consoeur,\n\nJe vous adresse ci-joint la convocation devant le Juge aux Affaires Familiales du Tribunal judiciaire de Paris, chambre 2.6, audience fixée au 15 avril 2026 à 14h00 (pièce n° 1).\n\nÀ cette occasion, mon client, M. Dupont Frédéric, entend maintenir sa demande de résidence alternée pour les deux enfants mineurs (Léa, 8 ans, et Tom, 11 ans), telle que formulée dans ses premières conclusions du 3 mars 2026.\n\nPar ailleurs, en vue d'une éventuelle médiation préalable que le JAF pourrait ordoncer, mon client se dit prêt à envisager une répartition 12/14 jours si votre cliente abandonne sa demande de prestation compensatoire.\n\nJe vous saurais gré de me communiquer vos observations et la position définitive de Mme Dupont avant le 5 avril prochain, délai en deçà duquel nous déposerons nos notes en délibéré.\n\nVeuillez agréer, Chère Consoeur, l'expression de mes sentiments les plus confraternels.\n\nMe Laurent Aubert\nAvocat au Barreau de Paris",
    brouillon_mock:
      "Cher Confrère,\n\nJ'ai bien reçu la convocation pour l'audience JAF du 15 avril 2026.\n\nMa cliente, Mme Dupont, s'oppose à la résidence alternée et maintient sa demande de résidence principale avec droit de visite et d'hébergement classique pour M. Dupont. S'agissant de la prestation compensatoire, sa demande est maintenue au regard des disparités de revenus constatées.\n\nJe vous ferai parvenir mes conclusions en réponse avant le 5 avril.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    date: hoursAgo(1),
    dossier_id: "v5-d1",
    dossier_nom: "Dupont c/ Dupont",
    dossier_domaine: "Droit de la famille",
    pieces_jointes: [
      {
        nom: "convocation_JAF_15avril.pdf",
        taille: "180 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Convocation devant le JAF de Paris pour le 15 avril 2026 à 14h00, chambre 2.6. Objet : résidence des enfants mineurs et prestation compensatoire dans le cadre du divorce Dupont.",
      },
    ],
    priority: "urgent",
  },
  // ---- 2. SCI Les Tilleuls — impayés ----
  {
    id: "v5-e2",
    expediteur: "M. Gérard Tilleul",
    from_email: "g.tilleul@sci-tilleuls.fr",
    objet: "Loyers impayés — 3ème mois consécutif",
    resume:
      "Le gérant de la SCI signale le 3e mois consécutif de loyers impayés par le locataire commercial (bail du 1er mars 2024). Il demande d'engager la procédure de résiliation et sollicite une estimation du délai avant expulsion.",
    corps_original:
      "Maître Fernandez,\n\nJe reviens vers vous suite à notre entretien du 12 mars concernant la situation locative de notre immeuble au 24 rue des Peupliers, 75012 Paris.\n\nÀ ce jour, M. Karim Benali, titulaire du bail commercial signé le 1er mars 2024 pour l'exploitation d'un restaurant, est en défaut de paiement pour les mois de janvier, février et mars 2026, soit un arriéré total de 8 400 euros TTC (3 × 2 800 euros).\n\nToutes mes tentatives amiables sont restées vaines : deux courriers recommandés avec AR sont restés sans réponse (LRAR du 15 janvier et du 20 février 2026), et M. Benali ne répond plus à mes appels téléphoniques.\n\nJe souhaite maintenant engager la procédure judiciaire pour :\n1. Obtenir le paiement des arriérés (8 400 euros + intérêts)\n2. Faire constater la résiliation du bail aux torts du locataire\n3. Obtenir son expulsion dans les meilleurs délais\n\nPouvez-vous m'indiquer le délai réaliste avant que M. Benali quitte effectivement les lieux, et estimer les frais de procédure ? Je dois en informer les autres associés lors de notre prochaine assemblée le 3 avril.\n\nEn vous remerciant par avance,\nGérard Tilleul\nGérant de la SCI Les Tilleuls",
    brouillon_mock:
      "Monsieur Tilleul,\n\nJe vous remercie pour votre message. À la lecture de votre situation, je vous confirme que les conditions sont réunies pour engager la procédure de résiliation judiciaire du bail commercial.\n\nEn pratique, la procédure se déroule comme suit :\n1. Délivrance d'un commandement de payer visant la clause résolutoire (délai : 1 mois pour régularisation)\n2. Si défaut : assignation devant le Tribunal judiciaire — délai d'audience : 2 à 3 mois\n3. Jugement de résiliation et expulsion : 3 à 6 mois après l'assignation\n\nDélai total estimé : 6 à 10 mois. Frais prévisionnels : environ 3 500 à 5 000 euros HT.\n\nJe vous propose de vous adresser un devis précis cette semaine.\n\nCordialement,\nMe Alexandra Fernandez",
    date: hoursAgo(3),
    dossier_id: "v5-d2",
    dossier_nom: "SCI Les Tilleuls",
    dossier_domaine: "Bail commercial",
    pieces_jointes: [],
    priority: "urgent",
  },
  // ---- 3. Succession Martin — notaire ----
  {
    id: "v5-e3",
    expediteur: "Me Sophie Beaumont",
    from_email: "s.beaumont@notaires-beaumont.fr",
    objet: "Partage successoral — désaccord héritiers",
    resume:
      "Le notaire en charge de la succession Martin transmet un procès-verbal de carence suite au désaccord persistant entre les héritiers sur l'évaluation du bien immobilier. Elle invite à saisir le tribunal pour licitation.",
    corps_original:
      "Maître Fernandez,\n\nSuite à la réunion du 20 mars 2026 réunissant l'ensemble des héritiers de feu M. Henri Martin (décédé le 12 novembre 2025), je me trouve dans l'obligation de dresser le présent procès-verbal de carence.\n\nLes héritiers n'ont pu parvenir à un accord sur les points suivants :\n\n1. Évaluation de l'immeuble sis 8 avenue Victor Hugo, Bordeaux (33000) : votre cliente Mme Isabelle Martin-Rousseau évalue le bien à 420 000 euros sur la base d'une estimation de l'agence Immobordeaux ; ses frères M. Pierre Martin et M. Jacques Martin retiennent quant à eux le prix de 380 000 euros résultant d'une contre-estimation.\n\n2. Récompenses dues à la succession par M. Pierre Martin au titre d'une avance sur héritage de 25 000 euros en 2019 : M. Pierre Martin conteste devoir réintégrer cette somme dans la masse partageable.\n\n3. Attribution préférentielle du bien immobilier : Mme Martin-Rousseau demande l'attribution préférentielle en sa faveur, ce que ses frères refusent.\n\nEn conséquence, je vous invite, ainsi que les autres conseils, à saisir le Tribunal judiciaire de Bordeaux aux fins de licitation et de désignation d'un juge commissaire chargé de procéder aux opérations de partage judiciaire (articles 840 et suivants du Code civil).\n\nJe reste à votre disposition pour coordonner les prochaines étapes.\n\nBien confraternelement,\nMe Sophie Beaumont\nNotaire à Bordeaux",
    brouillon_mock:
      "Maître Beaumont,\n\nJe vous remercie pour ce procès-verbal de carence et prends acte des points de blocage.\n\nAprès concertation avec ma cliente Mme Martin-Rousseau, je vous confirme qu'elle maintient sa position sur les trois points soulevés. En particulier, s'agissant de l'évaluation immobilière, elle entend solliciter la nomination d'un expert judiciaire en vue d'une estimation contradictoire.\n\nJe prépare l'assignation aux fins de partage judiciaire devant le TJ de Bordeaux. Pourriez-vous me confirmer que vous disposez de l'intégralité de l'inventaire successoral ?\n\nCordialement,\nMe Alexandra Fernandez",
    date: hoursAgo(5),
    dossier_id: "v5-d3",
    dossier_nom: "Succession Martin",
    dossier_domaine: "Droit des successions",
    pieces_jointes: [
      {
        nom: "PV_carence_succession_Martin.pdf",
        taille: "290 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Procès-verbal de carence dressé par Me Beaumont le 20 mars 2026. Désaccord sur l'évaluation du bien immobilier (420 k€ vs 380 k€), récompenses dues et attribution préférentielle. Invitation à saisir le TJ de Bordeaux.",
      },
    ],
    priority: "normal",
  },
];

// ---------------------------------------------------------------------------
// Emails traités — 9 emails classés et traités
// ---------------------------------------------------------------------------

const emailsTraites: V5Email[] = [
  {
    id: "v5-e4",
    expediteur: "Mme Claire Roux",
    from_email: "c.roux@gmail.com",
    objet: "Accusé de réception — votre courrier du 22 mars",
    resume:
      "Mme Roux accuse réception du mémoire en demande déposé devant le Conseil de prud'hommes. Elle confirme la réception et indique qu'elle prendra contact prochainement avec son employeur.",
    corps_original:
      "Maître,\n\nJ'ai bien reçu votre courrier du 22 mars et le mémoire que vous avez déposé au greffe du Conseil de prud'hommes. Merci de m'en avoir transmis une copie.\n\nJ'ai lu attentivement les pièces. J'avoue que certains arguments m'ont surprise, notamment les éléments concernant la rupture conventionnelle proposée, mais je vous fais confiance pour la suite.\n\nJ'ai informé ma DRH aujourd'hui par email de l'existence de la procédure. Est-ce que c'est bien ce qu'il fallait faire ?\n\nMerci encore pour votre accompagnement.\n\nBien cordialement,\nClaire Roux",
    brouillon_mock:
      "Madame Roux,\n\nJe vous remercie pour votre retour.\n\nS'agissant de l'information de votre DRH, c'est tout à fait exact — l'employeur sera de toute façon convoqué par le greffe. Je vous conseille néanmoins de limiter vos échanges directs avec votre employeur et de me transmettre toute communication reçue de sa part.\n\nCordialement,\nMe Alexandra Fernandez",
    date: hoursAgo(7),
    dossier_id: "v5-d4",
    dossier_nom: "Madame Roux",
    dossier_domaine: "Droit du travail",
    pieces_jointes: [],
    priority: "traite",
  },
  {
    id: "v5-e5",
    expediteur: "Tribunal judiciaire de Paris",
    from_email: "notifications@justice.fr",
    objet: "Avis d'audience — dossier RG 26/04521",
    resume:
      "Le greffe notifie la date d'audience au fond fixée au 2 juin 2026 à 9h30 dans l'affaire Dubois & Fils c/ Société Vertex (recouvrement de créance, 45 000 euros). À noter dans l'agenda.",
    corps_original:
      "TRIBUNAL JUDICIAIRE DE PARIS\n3e chambre civile — Section 2\n\nAVIS D'AUDIENCE\n\nRéférence : RG 26/04521\nAffaire : SA DUBOIS & FILS c/ SAS VERTEX SOLUTIONS\nObjet : Recouvrement de créance commerciale\n\nNous vous informons que l'audience au fond dans l'affaire référencée ci-dessus est fixée au :\n\nLundi 2 juin 2026 à 9h30\nSalle 210 — 2e étage\nTribunal judiciaire de Paris\n4 bd du Palais, 75001 Paris\n\nToutes les parties sont convoquées. Les conclusions définitives devront être déposées au plus tard le 17 mai 2026.\n\nLe Greffier en chef",
    brouillon_mock: null,
    date: hoursAgo(9),
    dossier_id: "v5-d5",
    dossier_nom: "Dubois & Fils",
    dossier_domaine: "Recouvrement",
    pieces_jointes: [],
    priority: "traite",
  },
  {
    id: "v5-e6",
    expediteur: "M. Bernard Chartier",
    from_email: "b.chartier@association-horizon.fr",
    objet: "Réponse à votre courrier — conflit bureau",
    resume:
      "Le président de l'association Horizon répond au courrier recommandé adressé à la demande du secrétaire général. Il conteste la régularité de la dernière assemblée générale et demande sa nullité. Dossier en cours d'instruction.",
    corps_original:
      "Maître Fernandez,\n\nJ'ai bien reçu votre courrier du 18 mars 2026, adressé au nom de M. Jean-Luc Fontaine, secrétaire général de l'association Horizon.\n\nEn ma qualité de président de l'association, je me dois de répondre point par point aux griefs formulés.\n\nConcernant la régularité de l'assemblée générale extraordinaire du 8 mars 2026 :\n- Les convocations ont bien été adressées à tous les membres à jour de cotisation (34 membres sur 36) par email et courrier simple, conformément à l'article 12 de nos statuts\n- Les 2 membres non convoqués (dont M. Fontaine) ont été exclus sur décision du bureau du 1er mars 2026 pour défaut de paiement de cotisation 2025\n- La validité de cette exclusion a été votée par 8 voix sur 10 au sein du bureau\n\nJe conteste donc fermement toute irrégularité dans la convocation.\n\nM. Chartier\nPrésident de l'association Horizon",
    brouillon_mock:
      "Monsieur le Président,\n\nJ'accuse réception de votre courrier du 25 mars en réponse au mien du 18 mars.\n\nPrenons acte de vos observations. Toutefois, je maintiens que la procédure d'exclusion de mon client n'est pas conforme aux statuts, qui prévoient un droit à être entendu préalablement à toute décision d'exclusion. Aucune telle procédure n'a été respectée en l'espèce.\n\nJe vous propose qu'un rendez-vous soit fixé dans les 15 jours pour tenter une résolution amiable du litige avant toute action judiciaire.\n\nCordialement,\nMe Alexandra Fernandez",
    date: hoursAgo(12),
    dossier_id: "v5-d6",
    dossier_nom: "Association Horizon",
    dossier_domaine: "Droit associatif",
    pieces_jointes: [],
    priority: "traite",
  },
  {
    id: "v5-e7",
    expediteur: "Me Laurent Aubert",
    from_email: "l.aubert@cabinet-aubert.fr",
    objet: "Bordereau de communication de pièces — dossier Dupont",
    resume:
      "Me Aubert communique le bordereau de 12 pièces adverse dans le cadre de la procédure de divorce. Les pièces comprennent 3 bulletins de salaire, un rapport d'expertise sociale et la convention de mariage.",
    corps_original:
      "Chère Consoeur,\n\nConformément au contradictoire, je vous adresse ci-joint le bordereau de communication de pièces n° 2 dans le dossier Dupont c/ Dupont (RG 26/01872).\n\nPièces communiquées :\n1. Bulletins de salaire M. Dupont — octobre, novembre, décembre 2025\n2. Avis d'imposition 2024 (couple)\n3. Rapport de l'enquêtrice sociale Mme Briand du 15 mars 2026\n4. Convention de mariage du 14 juin 2008\n5. Relevés de compte joint — septembre 2025 à mars 2026\n6. Acte de propriété de l'appartement (77 m2, Paris 11e)\n7 à 12. Échanges de mails entre les époux (octobre–décembre 2025)\n\nJe reste disponible pour tout échange confraternel.\n\nMe Laurent Aubert",
    brouillon_mock: null,
    date: daysAgo(1, 10),
    dossier_id: "v5-d1",
    dossier_nom: "Dupont c/ Dupont",
    dossier_domaine: "Droit de la famille",
    pieces_jointes: [
      {
        nom: "bordereau_pieces_Dupont_2.pdf",
        taille: "1.2 MB",
        type_mime: "application/pdf",
        resume_ia:
          "Bordereau de 12 pièces adverses (dossier Dupont). Comprend bulletins de salaire, avis d'imposition, rapport enquêtrice sociale du 15 mars 2026, convention de mariage et relevés de compte joint.",
      },
    ],
    priority: "traite",
  },
  {
    id: "v5-e8",
    expediteur: "Greffe Prud'hommes Paris",
    from_email: "greffe@cphar-paris.fr",
    objet: "Accusé réception mémoire — affaire Roux",
    resume:
      "Le greffe du Conseil de prud'hommes de Paris accuse réception du mémoire en demande déposé le 26 mars 2026 dans l'affaire Roux c/ SAS Optim RH. L'audience de conciliation est fixée au 18 mai 2026.",
    corps_original:
      "Maître,\n\nNous accusons réception du mémoire en demande déposé le 26 mars 2026 pour le compte de Mme Claire Roux dans l'affaire enregistrée sous le n° RG P 26/01234 (ROUX c/ SAS OPTIM RH).\n\nL'audience de conciliation est fixée au :\nLundi 18 mai 2026 à 14h30\nSalle des conciliations — rez-de-chaussée\nConseil de prud'hommes de Paris\n27 rue Louis Blanc, 75010 Paris\n\nLe dossier vous sera remis à l'audience.\n\nLe Greffier",
    brouillon_mock: null,
    date: daysAgo(1, 14),
    dossier_id: "v5-d4",
    dossier_nom: "Madame Roux",
    dossier_domaine: "Droit du travail",
    pieces_jointes: [],
    priority: "traite",
  },
  {
    id: "v5-e9",
    expediteur: "M. Alain Dubois",
    from_email: "a.dubois@dubois-fils.com",
    objet: "Mise à jour coordonnées facturation",
    resume:
      "M. Dubois communique les nouvelles coordonnées bancaires de la société pour le remboursement éventuel en cas de succès de la procédure. Aucune action urgente requise.",
    corps_original:
      "Maître Fernandez,\n\nSuite à notre changement de banque, je vous communique nos nouvelles coordonnées bancaires pour le virement des sommes recouvrées :\n\nBanque : Crédit Mutuel Entreprises\nIBAN : FR76 1027 8060 4100 0204 6410 108\nBIC : CMCIFR2A\nTitulaire : SA Dubois & Fils\n\nMerci de bien vouloir en prendre note.\n\nBien cordialement,\nAlain Dubois\nDirecteur Général\nDubois & Fils SA",
    brouillon_mock: null,
    date: daysAgo(2, 11),
    dossier_id: "v5-d5",
    dossier_nom: "Dubois & Fils",
    dossier_domaine: "Recouvrement",
    pieces_jointes: [],
    priority: "traite",
  },
  {
    id: "v5-e10",
    expediteur: "Notification RPVA",
    from_email: "no-reply@rpva.fr",
    objet: "Dépôt enregistré — dossier Roux",
    resume:
      "Le RPVA confirme l'enregistrement du dépôt électronique des conclusions dans l'affaire Roux c/ Optim RH. Dépôt horodaté le 26 mars 2026 à 17h22.",
    corps_original:
      "Réseau Privé Virtuel des Avocats — Confirmation de dépôt\n\nDossier : ROUX Claire c/ SAS OPTIM RH\nRéférence : RG P 26/01234\nNature : Mémoire en demande\nDate de dépôt : 26 mars 2026 à 17h22\nNombre de pièces : 8\n\nCe dépôt a été validé et versé au dossier de la procédure.\n\n---\nMessage généré automatiquement — ne pas répondre",
    brouillon_mock: null,
    date: daysAgo(2, 6),
    dossier_id: "v5-d4",
    dossier_nom: "Madame Roux",
    dossier_domaine: "Droit du travail",
    pieces_jointes: [],
    priority: "traite",
  },
  {
    id: "v5-e11",
    expediteur: "M. Gérard Tilleul",
    from_email: "g.tilleul@sci-tilleuls.fr",
    objet: "Documents complémentaires — bail commercial",
    resume:
      "M. Tilleul transmet les pièces demandées : bail commercial original, 2 LRAR de relance et les quittances de loyer 2025 montrant les paiements réguliers jusqu'en décembre.",
    corps_original:
      "Maître,\n\nSuite à votre demande de documents, je vous transmets ci-joint en PDF les pièces suivantes :\n- Bail commercial original signé le 1er mars 2024\n- LRAR du 15 janvier 2026 (réclamation loyers)\n- LRAR du 20 février 2026 (mise en demeure)\n- Quittances de loyer janvier à décembre 2025 (paiements réguliers)\n- Extrait Kbis SCI Les Tilleuls\n\nTenez-moi informé de la suite.\n\nGérard Tilleul",
    brouillon_mock: null,
    date: daysAgo(3, 10),
    dossier_id: "v5-d2",
    dossier_nom: "SCI Les Tilleuls",
    dossier_domaine: "Bail commercial",
    pieces_jointes: [
      {
        nom: "bail_commercial_SCI_Tilleuls.pdf",
        taille: "380 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Bail commercial de 9 ans conclu le 1er mars 2024 entre la SCI Les Tilleuls et M. Karim Benali pour l'exploitation d'un restaurant. Loyer mensuel : 2 800 euros TTC. Clause résolutoire standard.",
      },
      {
        nom: "LRAR_relances_janv_fev_2026.pdf",
        taille: "95 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Deux lettres recommandées avec AR (15 janvier et 20 février 2026) mises en demeure de payer les loyers impayés. Restées sans réponse.",
      },
    ],
    priority: "traite",
  },
  {
    id: "v5-e12",
    expediteur: "M. Jean Fontaine",
    from_email: "j.fontaine@association-horizon.fr",
    objet: "Transmission des statuts — association Horizon",
    resume:
      "M. Fontaine transmet les statuts de l'association Horizon en vigueur depuis 2019, ainsi que le procès-verbal de la dernière assemblée générale ordinaire. Documents utiles pour l'analyse de la régularité de l'AGE contestée.",
    corps_original:
      "Maître Fernandez,\n\nComme convenu lors de notre dernier entretien, je vous transmets les documents que vous m'avez demandés :\n\n1. Statuts de l'association Horizon (version en vigueur depuis l'AGE du 12 mai 2019)\n2. PV de l'AGO du 15 juin 2025 (dernière assemblée ordinaire)\n3. Liste des membres au 1er janvier 2026 (avec statut cotisation)\n\nJe reste à votre disposition.\n\nJean Fontaine\nSecrétaire général de l'association Horizon",
    brouillon_mock: null,
    date: daysAgo(3, 15),
    dossier_id: "v5-d6",
    dossier_nom: "Association Horizon",
    dossier_domaine: "Droit associatif",
    pieces_jointes: [
      {
        nom: "statuts_association_horizon_2019.pdf",
        taille: "240 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Statuts de l'association Horizon adoptés en 2019. L'article 12 prévoit une procédure d'exclusion avec droit à être entendu préalablement (délai de 15 jours pour présenter ses observations). L'article 15 définit les conditions de convocation aux AG (10 jours minimum par courrier).",
      },
    ],
    priority: "traite",
  },
];

// ---------------------------------------------------------------------------
// Stats semaine
// ---------------------------------------------------------------------------

export const mockWeekStats: V5WeekStats = {
  lun: 32,
  mar: 51,
  mer: 44,
  jeu: 28,
  ven: 47,
};

// ---------------------------------------------------------------------------
// Briefing complet
// ---------------------------------------------------------------------------

export const mockBriefingV5: V5BriefingData = {
  nom_avocat: "Alexandra",
  date_briefing: NOW.toISOString(),
  temps_gagne_minutes: 47,
  emails_count: 12,
  classes_count: 9,
  pj_count: 6,
  narrative:
    "Ce matin, j'ai analysé 12 emails. 3 nécessitent votre attention — dont une convocation JAF urgente pour l'affaire Dupont (audience le 15 avril). Les 9 autres sont classés.",
  emails_prioritaires: emailsPrioritaires,
  emails_traites: emailsTraites,
  week_stats: mockWeekStats,
};

// ---------------------------------------------------------------------------
// Helpers pour convertir V5Email → Email (type du hook useEmails)
// ---------------------------------------------------------------------------

export function v5EmailToHookEmail(e: V5Email): Email {
  return {
    id: e.id,
    expediteur: e.expediteur,
    objet: e.objet,
    resume: e.resume,
    brouillon: e.brouillon_mock,
    pipeline_step: "pret_a_reviser",
    contexte_choisi: e.dossier_nom,
    statut: "traite",
    created_at: e.date,
    updated_at: e.date,
    // Extra fields consumed by EmailDrawer via (email as any)
    ...({
      brouillon: e.brouillon_mock,
      corps_original: e.corps_original,
      from_email: e.from_email,
      to_email: "alexandra@cabinet-fernandez.fr",
      cc_email: null,
      dossier_id: e.dossier_id,
      dossier_nom: e.dossier_nom,
      pieces_jointes: e.pieces_jointes,
      attachments: e.pieces_jointes.map((pj, i) => ({
        id: `${e.id}-pj-${i}`,
        filename: pj.nom,
        name: pj.nom,
        size: pj.taille,
        type: pj.type_mime,
        resume_ia: pj.resume_ia,
      })),
    } as any),
  };
}

// Period filtering helpers
export function getV5EmailsForPeriod(
  period: "24h" | "7j" | "30j",
  data: V5BriefingData
): { prioritaires: V5Email[]; traites: V5Email[] } {
  const now = Date.now();
  const limits: Record<string, number> = {
    "24h": 24 * 3600_000,
    "7j": 7 * 86_400_000,
    "30j": 30 * 86_400_000,
  };
  const limit = limits[period];
  const filter = (e: V5Email) => now - new Date(e.date).getTime() <= limit;
  return {
    prioritaires: data.emails_prioritaires.filter(filter),
    traites: data.emails_traites.filter(filter),
  };
}
