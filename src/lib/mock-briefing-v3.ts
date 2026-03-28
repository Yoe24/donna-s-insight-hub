// mock-briefing-v3.ts — Données mockées pour le briefing conversationnel V3
// 6 dossiers juridiques réalistes, emails en français juridique
// Utilisé uniquement en mode démo (isDemo() === true)

import type { DossierEmail } from "@/components/BriefingDetailPanel";

const NOW = new Date();
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString();
const daysAgo = (d: number, h = 10) =>
  new Date(NOW.getTime() - d * 86_400_000 - h * 3_600_000).toISOString();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface V3Email {
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
  email_type: "informatif" | "demande" | "relance" | "convocation" | "piece_jointe";
  category: "client" | "newsletter" | "notification" | "spam" | "confrere" | "juridiction";
  pieces_jointes: Array<{
    nom: string;
    taille: string;
    type_mime: string;
    resume_ia: string;
  }>;
  brouillon_mock: string | null;
  urgence: "haute" | "moyenne" | "basse";
}

export interface V3Dossier {
  id: string;
  nom: string;
  domaine: string;
  urgence: "haute" | "moyenne" | "basse";
  resume_situation: string;
  message_donna: string;
  emails: V3Email[];
  pieces_jointes_count: number;
}

// ---------------------------------------------------------------------------
// Emails mockés
// ---------------------------------------------------------------------------

export const v3Emails: V3Email[] = [

  // DOSSIER 1 — Dupont c/ Dupont — Divorce contentieux
  {
    id: "v3-e1",
    expediteur: "Sandrine Dupont",
    email_from: "sandrine.dupont@gmail.com",
    objet: "Convocation audience JAF — urgent",
    resume:
      "Le Juge aux Affaires Familiales du TJ de Paris convoque les parties le 15 avril pour statuer sur la garde alternée des enfants. Me Dupont transmet l'ordonnance et demande la préparation des conclusions d'ici le 8 avril.",
    corps_original:
      "Maître,\n\nJe viens de recevoir une convocation du Juge aux Affaires Familiales (JAF) du Tribunal judiciaire de Paris. L'audience est fixée au mercredi 15 avril à 14h00 en salle 4.\n\nL'objet est la demande de garde alternée semaine/semaine pour nos deux enfants, Théo (8 ans) et Léa (6 ans).\n\nMon ex-mari conteste toujours la garde alternée et demande une résidence principale chez lui. Son avocate, Me Laurent, a déjà transmis ses conclusions et prétend que mon emploi du temps est incompatible avec les besoins des enfants.\n\nJ'ai joint l'ordonnance de convocation ainsi que l'attestation de l'école confirmant que les deux enfants sont inscrits à 5 minutes de mon domicile.\n\nPourriez-vous me confirmer que vous serez disponible le 15 avril et me dire quelles pièces vous avez besoin de moi d'ici le 8 avril ?\n\nJe reste joignable au 06 12 34 56 78.\n\nCordialement,\nSandrine Dupont",
    date: hoursAgo(2),
    dossier_id: "d1",
    dossier_nom: "Dupont c/ Dupont",
    dossier_domaine: "Droit de la famille",
    email_type: "convocation",
    category: "client",
    urgence: "haute",
    pieces_jointes: [
      {
        nom: "Ordonnance JAF 15 avril.pdf",
        taille: "280 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Ordonnance de convocation du JAF du TJ de Paris fixant l'audience au 15 avril pour statuer sur la résidence des enfants Dupont. Délai de dépôt des conclusions : 8 avril.",
      },
      {
        nom: "Attestation école primaire.pdf",
        taille: "120 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Attestation de l'école primaire Sainte-Marie confirmant l'inscription de Théo et Léa Dupont, résidence principale déclarée chez Mme Sandrine Dupont.",
      },
    ],
    brouillon_mock:
      "Chère Madame Dupont,\n\nJe vous confirme avoir bien reçu la convocation pour l'audience du 15 avril devant le JAF.\n\nJe serai présent(e) à vos côtés ce jour-là. Pour préparer au mieux nos conclusions, merci de me transmettre avant le 5 avril :\n- Le planning de votre emploi du temps mensuel\n- Toute correspondance avec M. Dupont concernant les enfants\n- L'avis des enseignants si disponible\n\nJe prépare dès à présent une réponse aux arguments de Me Laurent.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: "v3-e2",
    expediteur: "Me Laurent",
    email_from: "m.laurent@cabinet-laurent.fr",
    objet: "Conclusions M. Dupont — garde résidence principale",
    resume:
      "Me Laurent, avocate de M. Dupont, transmet ses conclusions demandant la résidence principale des enfants chez son client. Elle conteste l'attestation de l'école et sollicite une expertise familiale.",
    corps_original:
      "Chère Consoeur,\n\nSuite à l'ordonnance de convocation du 22 mars, je vous adresse par la présente les conclusions de mon client, M. Frédéric Dupont.\n\nM. Dupont sollicite la résidence principale des deux enfants à son domicile, situé à 200 mètres de l'école. Il conteste la proposition de garde alternée au motif que :\n\n1. Mme Dupont exerce une profession libérale avec des horaires variables (parfois jusqu'à 20h), incompatibles selon lui avec les besoins de jeunes enfants.\n\n2. L'attestation de l'école que vous produirez est antérieure au déménagement de M. Dupont au 3 rue des Lilas, Paris 19e — désormais situé à 150 mètres de l'établissement.\n\n3. Mon client demande qu'il soit ordonné une expertise socio-familiale pour évaluer les conditions de vie chez chacun des parents avant toute décision définitive.\n\nJe joins les conclusions et pièces adverses numérotées 1 à 8.\n\nDans l'attente de vos conclusions en réponse, je vous prie d'agréer, Chère Consoeur, mes sentiments confraternels les meilleurs.\n\nMe Sophie Laurent\nAvocat au Barreau de Paris",
    date: hoursAgo(5),
    dossier_id: "d1",
    dossier_nom: "Dupont c/ Dupont",
    dossier_domaine: "Droit de la famille",
    email_type: "piece_jointe",
    category: "confrere",
    urgence: "haute",
    pieces_jointes: [
      {
        nom: "Conclusions adverses M. Dupont.pdf",
        taille: "560 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Conclusions de M. Dupont demandant la résidence principale des enfants. Arguments : horaires de travail de Mme Dupont, nouveau domicile proche de l'école, demande d'expertise socio-familiale.",
      },
    ],
    brouillon_mock:
      "Chère Consoeur,\n\nJ'ai bien reçu vos conclusions du 28 mars.\n\nJe vous confirme que je transmettrai les conclusions de Mme Dupont en réponse avant le 8 avril, délai fixé par l'ordonnance.\n\nConcernant la demande d'expertise, ma cliente s'y oppose en l'état compte tenu des délais que cela impliquerait pour les enfants.\n\nCordialement,\nMe Alexandra Fernandez",
  },

  // DOSSIER 2 — SCI Les Tilleuls c/ Brasserie du Parc
  {
    id: "v3-e3",
    expediteur: "M. Benoît Lefranc",
    email_from: "b.lefranc@sci-tilleuls.fr",
    objet: "3 mois de loyers impayés — situation critique",
    resume:
      "M. Lefranc, gérant de la SCI Les Tilleuls, signale que la Brasserie du Parc est en défaut de paiement depuis janvier. Le montant dû est de 18 750 euros. Il demande l'envoi d'une mise en demeure formelle.",
    corps_original:
      "Maître Fernandez,\n\nJe vous contacte en urgence concernant notre locataire, la Brasserie du Parc (SARL, RCS Paris 512 456 789), exploitée par M. Karim Mansouri.\n\nDepuis le 1er janvier 2026, la brasserie n'a plus réglé son loyer mensuel de 6 250 euros TTC. Malgré mes deux relances par email et un courrier recommandé, M. Mansouri ne répond plus.\n\nLa situation est la suivante :\n- Loyer janvier 2026 : 6 250 € — non réglé\n- Loyer février 2026 : 6 250 € — non réglé\n- Loyer mars 2026 : 6 250 € — non réglé\nTotal impayé : 18 750 euros TTC\n\nLa clause résolutoire est stipulée à l'article 12 du bail commercial signé le 15 mars 2022.\n\nJe vous demande d'agir en urgence : envoi d'une mise en demeure officielle avec commandement de payer.\n\nBien cordialement,\nBenoît Lefranc\nGérant — SCI Les Tilleuls",
    date: hoursAgo(4),
    dossier_id: "d2",
    dossier_nom: "SCI Les Tilleuls c/ Brasserie du Parc",
    dossier_domaine: "Droit immobilier",
    email_type: "demande",
    category: "client",
    urgence: "haute",
    pieces_jointes: [
      {
        nom: "Bail commercial 15 mars 2022.pdf",
        taille: "890 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Bail commercial de 9 ans signé le 15 mars 2022 entre la SCI Les Tilleuls (bailleur) et la Brasserie du Parc SARL (preneur). Loyer mensuel : 6 250 € TTC. Clause résolutoire à l'article 12.",
      },
      {
        nom: "Mise en demeure amiable.pdf",
        taille: "95 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Courrier de relance amiable du gérant adressé le 5 mars 2026 à la Brasserie du Parc, réclamant le règlement des loyers de janvier et février 2026.",
      },
    ],
    brouillon_mock:
      "Cher Monsieur Lefranc,\n\nJ'ai bien pris note de la situation. Le montant total impayé de 18 750 euros justifie une action rapide.\n\nJe procède dès aujourd'hui à la rédaction d'un commandement de payer visant la clause résolutoire, conformément aux articles L. 145-41 et suivants du Code de commerce.\n\nCe commandement vous sera soumis pour signature avant envoi par huissier, dans les 48 heures.\n\nCordialement,\nMe Alexandra Fernandez",
  },
  {
    id: "v3-e4",
    expediteur: "Me Thierry Bonnet",
    email_from: "t.bonnet@bonnet-avocats.com",
    objet: "Contestation charges — Brasserie du Parc",
    resume:
      "L'avocat de la Brasserie du Parc conteste les charges de 2025 (8 400 euros) et propose une médiation avant toute action judiciaire.",
    corps_original:
      "Chère Consoeur,\n\nJe me présente : Me Thierry Bonnet, avocat de la Brasserie du Parc et de M. Karim Mansouri.\n\nMon client reconnaît être en retard sur les loyers courants mais conteste formellement le montant de la régularisation des charges pour l'année 2025, que votre client a portée à 8 400 euros.\n\nMon client n'a jamais reçu le détail de ces charges malgré ses demandes réitérées. Il estime que ce montant est excessif au regard de la taille des locaux (85 m²).\n\nMon client est disposé à régler les loyers courants et les charges justifiées. Avant toute procédure judiciaire, je vous propose une médiation dans les 15 prochains jours.\n\nDans l'attente de votre retour, je vous adresse mes sentiments confraternels.\n\nMe Thierry Bonnet",
    date: hoursAgo(9),
    dossier_id: "d2",
    dossier_nom: "SCI Les Tilleuls c/ Brasserie du Parc",
    dossier_domaine: "Droit immobilier",
    email_type: "demande",
    category: "confrere",
    urgence: "moyenne",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Confrère,\n\nJ'ai transmis votre email à mon client.\n\nSur la question des charges, je vous confirme que mon client est en mesure de produire l'ensemble des justificatifs. Cette communication n'efface pas pour autant le défaut de paiement des loyers eux-mêmes.\n\nJe prends note de votre proposition de médiation. Je reviens vers vous dans les 5 jours ouvrés avec la position de mon client.\n\nCordialement,\nMe Alexandra Fernandez",
  },

  // DOSSIER 3 — Succession Martin
  {
    id: "v3-e5",
    expediteur: "Me François Arnaud",
    email_from: "f.arnaud@notaires-arnaud.fr",
    objet: "Succession Martin — estimation bien immobilier",
    resume:
      "Le notaire transmet l'estimation de l'appartement (380 000 euros) et rappelle que les héritiers doivent se positionner sur le partage amiable avant le 10 mai.",
    corps_original:
      "Maître Fernandez,\n\nDans le cadre de la succession de feu M. Henri Martin, décédé le 12 janvier 2026, je vous adresse l'estimation immobilière de l'appartement situé au 47 avenue Victor Hugo, Paris 16e.\n\nRésultats :\n- Estimation basse : 365 000 €\n- Estimation haute : 395 000 €\n- Valeur retenue pour la succession : 380 000 €\n\nActif successoral net : 513 370 €\n\nLes trois héritiers ont jusqu'au 10 mai 2026 pour se mettre d'accord sur un partage amiable. À défaut, je serai contraint de demander l'ouverture d'une procédure de licitation judiciaire.\n\nVotre cliente, Mme Claire Martin, est la seule à avoir indiqué vouloir conserver l'appartement en rachetant les parts de ses frère et sœur.\n\nCordialement,\nMe François Arnaud\nNotaire",
    date: hoursAgo(7),
    dossier_id: "d3",
    dossier_nom: "Succession Martin",
    dossier_domaine: "Droit des successions",
    email_type: "informatif",
    category: "juridiction",
    urgence: "moyenne",
    pieces_jointes: [
      {
        nom: "Acte de décès Henri Martin.pdf",
        taille: "145 KB",
        type_mime: "application/pdf",
        resume_ia: "Acte de décès de M. Henri Martin, né le 3 avril 1948, décédé le 12 janvier 2026 à Paris 16e.",
      },
      {
        nom: "Estimation immobilière 47 av Victor Hugo.pdf",
        taille: "340 KB",
        type_mime: "application/pdf",
        resume_ia: "Rapport d'estimation notariale de l'appartement 47 avenue Victor Hugo, Paris 16e (T4, 85m²). Valeur retenue : 380 000 €.",
      },
    ],
    brouillon_mock:
      "Maître,\n\nJe vous remercie pour la transmission de l'estimation.\n\nMa cliente, Mme Claire Martin, est prête à reprendre l'appartement à la valeur de 380 000 euros. Elle conteste la valorisation à 395 000 euros demandée par ses frère et sœur.\n\nJe vous reviendrai sous 8 jours avec sa proposition écrite de rachat des parts.\n\nCordialement,\nMe Alexandra Fernandez",
  },
  {
    id: "v3-e6",
    expediteur: "Paul Martin",
    email_from: "paul.martin.paris@outlook.fr",
    objet: "Je refuse la valeur de 380 000 €",
    resume:
      "M. Paul Martin (héritier) conteste l'estimation à 380 000 euros et exige 400 000 euros pour céder sa part. Il menace de bloquer le partage amiable.",
    corps_original:
      "Maître,\n\nJe suis Paul Martin, fils de Henri Martin. Vous représentez ma sœur Claire dans cette affaire.\n\nJe vous écris directement pour vous dire que je n'accepterai pas de vendre ma part à 380 000 euros.\n\nJ'ai fait faire ma propre estimation par un agent immobilier qui m'a dit que l'appartement valait facilement 400 000 euros vu le marché actuel dans le 16e.\n\nSi Claire ne veut pas mettre 400 000 euros, j'ai déjà un acheteur potentiel qui est prêt à en payer 405 000 euros cash.\n\nJe donne 15 jours à Claire pour se décider.\n\nPaul Martin\n06 98 76 54 32",
    date: daysAgo(1),
    dossier_id: "d3",
    dossier_nom: "Succession Martin",
    dossier_domaine: "Droit des successions",
    email_type: "demande",
    category: "client",
    urgence: "moyenne",
    pieces_jointes: [],
    brouillon_mock: null,
  },

  // DOSSIER 4 — Madame Roux — Licenciement abusif
  {
    id: "v3-e7",
    expediteur: "Nathalie Roux",
    email_from: "nathalie.roux.pro@gmail.com",
    objet: "Licenciement reçu — que faire ?",
    resume:
      "Mme Roux a reçu sa lettre de licenciement pour insuffisance professionnelle datée du 26 mars. Elle estime être victime d'une discrimination après sa grossesse.",
    corps_original:
      "Maître Fernandez,\n\nJ'ai reçu aujourd'hui par LRAR ma lettre de licenciement pour « insuffisance professionnelle ».\n\nVoilà ce qui s'est passé :\n- J'étais chef de projet IT depuis 4 ans, avec d'excellentes évaluations\n- Je suis revenue de congé maternité le 15 septembre 2025\n- À mon retour, j'ai été rétrogradée sans explication\n- Le 28 octobre, j'ai reçu un « avertissement » pour « manque de rigueur »\n- Depuis novembre, je suis mise à l'écart des réunions de direction\n- Et maintenant ce licenciement\n\nJe pense que c'est clairement lié à ma grossesse. Je veux aller aux prud'hommes.\n\nJe vous joins la lettre de licenciement et mon contrat de travail.\n\nNathalie Roux\n06 45 67 89 01",
    date: hoursAgo(1),
    dossier_id: "d4",
    dossier_nom: "Madame Roux",
    dossier_domaine: "Droit du travail",
    email_type: "demande",
    category: "client",
    urgence: "haute",
    pieces_jointes: [
      {
        nom: "Lettre de licenciement.pdf",
        taille: "185 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Lettre de licenciement pour insuffisance professionnelle datée du 26 mars 2026. Motifs invoqués vagues, absence de faits précis et datés — fragilité pour l'employeur.",
      },
      {
        nom: "Contrat de travail.pdf",
        taille: "420 KB",
        type_mime: "application/pdf",
        resume_ia: "CDI signé le 3 mars 2021, poste Chef de projet senior IT, salaire brut mensuel 4 850 €, ancienneté 4 ans.",
      },
    ],
    brouillon_mock:
      "Chère Madame Roux,\n\nJe vous remercie pour ces informations et la transmission des documents.\n\nÀ première lecture, la situation présente plusieurs indices de discrimination liée à la maternité, protégée par les articles L. 1225-1 et suivants du Code du travail.\n\nJe vous propose un rendez-vous téléphonique demain entre 14h et 16h pour faire le point complet.\n\nCordialement,\nMe Alexandra Fernandez",
  },
  {
    id: "v3-e8",
    expediteur: "Me Claude Girard",
    email_from: "c.girard@girard-social.fr",
    objet: "TechSolutions — Position employeur",
    resume:
      "L'avocat de TechSolutions conteste tout caractère discriminatoire et propose une transaction amiable à 8 000 euros bruts.",
    corps_original:
      "Chère Consoeur,\n\nEn réponse à votre courrier du 18 mars, je vous transmets la position de mon client TechSolutions SA.\n\nMon client conteste fermement tout lien entre le licenciement de Mme Roux et sa situation familiale. Le licenciement repose sur des éléments objectifs et documentés.\n\nMon client est prêt à proposer une transaction amiable à hauteur de 8 000 euros bruts (environ 3 mois de préavis + 2 mois d'indemnités), sans reconnaissance de préjudice.\n\nCette offre est valable 15 jours.\n\nCordialement,\nMe Claude Girard",
    date: daysAgo(1, 8),
    dossier_id: "d4",
    dossier_nom: "Madame Roux",
    dossier_domaine: "Droit du travail",
    email_type: "informatif",
    category: "confrere",
    urgence: "moyenne",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Confrère,\n\nJ'ai bien reçu votre courrier et l'ai transmis à ma cliente.\n\nL'offre de 8 000 euros est manifestement insuffisante. Nous maintenons notre demande de préavis (14 550 euros) + indemnité légale (5 820 euros) + dommages-intérêts pour licenciement discriminatoire (29 100 euros minimum).\n\nTotal réclamé : 49 470 euros bruts.\n\nCordialement,\nMe Alexandra Fernandez",
  },

  // DOSSIER 5 — Entreprise Dubois & Fils — Recouvrement
  {
    id: "v3-e9",
    expediteur: "Gilles Dubois",
    email_from: "g.dubois@dubois-fils-elec.fr",
    objet: "Client Renard toujours impayé — besoin d'agir",
    resume:
      "M. Dubois signale 3 factures impayées pour 45 000 euros HT. Il souhaite engager une procédure d'injonction de payer.",
    corps_original:
      "Maître Fernandez,\n\nJe reviens vers vous concernant M. Antoine Renard qui ne paie toujours pas malgré mes relances.\n\n- Facture n° 2025-0089 du 10 septembre 2025 : 18 000 € HT — non payée\n- Facture n° 2025-0112 du 5 novembre 2025 : 15 500 € HT — non payée\n- Facture n° 2025-0141 du 20 décembre 2025 : 11 500 € HT — non payée\nTotal : 45 000 € HT soit 54 000 € TTC\n\nCes factures correspondent à des travaux d'installation électrique réalisés et réceptionnés sans réserve.\n\nQuel est le meilleur recours : injonction de payer ou assignation en référé provision ?\n\nCordialement,\nGilles Dubois\nGérant — Dubois & Fils Électricité",
    date: hoursAgo(6),
    dossier_id: "d5",
    dossier_nom: "Entreprise Dubois & Fils",
    dossier_domaine: "Droit commercial",
    email_type: "demande",
    category: "client",
    urgence: "moyenne",
    pieces_jointes: [
      {
        nom: "Factures impayées Renard.pdf",
        taille: "310 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Pack de 3 factures impayées : 2025-0089 (18 000 € HT), 2025-0112 (15 500 € HT), 2025-0141 (11 500 € HT). Total : 45 000 € HT. Bons de réception signés sans réserve.",
      },
    ],
    brouillon_mock:
      "Cher Monsieur Dubois,\n\nJe vous remercie pour ces informations.\n\nLes bons de réception signés sont des éléments précieux : la créance est certaine, liquide et exigible.\n\nJe recommande l'injonction de payer (art. 1405 CPC), plus rapide et moins coûteuse qu'un référé. Délai indicatif : 3 à 6 semaines. Coût : environ 900 euros HT.\n\nJe prépare la requête dès réception de votre accord.\n\nCordialement,\nMe Alexandra Fernandez",
  },

  // DOSSIER 6 — Association Horizon
  {
    id: "v3-e10",
    expediteur: "Jean-Claude Perrin",
    email_from: "jc.perrin@asso-horizon.org",
    objet: "Exclusion contestée — que dit la loi ?",
    resume:
      "M. Perrin demande conseil sur la validité d'une exclusion d'un membre du bureau votée à 7 voix contre 5. L'exclu conteste le délai de convocation (9 jours au lieu de 15).",
    corps_original:
      "Maître Fernandez,\n\nLors de l'assemblée générale extraordinaire du 20 mars 2026, le bureau a soumis au vote l'exclusion de M. Fabrice Vidal, trésorier, pour « comportement préjudiciable à l'association ».\n\nLe vote a été : 7 voix pour l'exclusion, 5 voix contre, 2 abstentions.\n\nM. Vidal conteste la procédure. Il prétend :\n1. Qu'il n'a pas été convoqué avec un préavis suffisant (article 12 de nos statuts prévoit 15 jours, il a reçu la convocation 9 jours avant)\n2. Que les motifs d'exclusion ne sont pas suffisamment précis\n\nIl nous a envoyé une lettre d'avocat menaçant d'annuler l'AG devant le tribunal.\n\nPouvez-vous m'indiquer si notre procédure est valable ?\n\nJean-Claude Perrin\nPrésident — Association Horizon",
    date: daysAgo(1, 6),
    dossier_id: "d6",
    dossier_nom: "Association Horizon",
    dossier_domaine: "Droit associatif",
    email_type: "demande",
    category: "client",
    urgence: "basse",
    pieces_jointes: [
      {
        nom: "Statuts Association Horizon.pdf",
        taille: "220 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Statuts de l'Association Horizon (loi 1901). Article 12 : procédure d'exclusion — convocation par LRAR avec préavis de 15 jours, droit pour le membre de présenter sa défense.",
      },
    ],
    brouillon_mock:
      "Cher Monsieur Perrin,\n\nJ'ai bien reçu votre demande et pris connaissance des statuts.\n\nL'enjeu principal est le délai de convocation : vos statuts imposent 15 jours, et M. Vidal n'a reçu sa convocation que 9 jours avant l'AG. C'est une irrégularité formelle qui fragilise la procédure.\n\nJe vous propose deux options :\n1. Régulariser en convoquant une nouvelle AG avec le bon délai (solution recommandée)\n2. Défendre la procédure en démontrant que M. Vidal a pu exercer ses droits malgré le délai réduit\n\nPourriez-vous me confirmer si M. Vidal était présent à l'AG et s'il a pris la parole ?\n\nCordialement,\nMe Alexandra Fernandez",
  },

  // Emails filtrés
  {
    id: "v3-f1",
    expediteur: "Ordre des Avocats de Paris",
    email_from: "newsletter@barreau-paris.fr",
    objet: "Lettre d'information mars 2026",
    resume: "Newsletter mensuelle : réforme de la procédure civile, nouvelles formations obligatoires, rappel cotisation ordinale.",
    corps_original: "Newsletter de l'Ordre des Avocats de Paris — mars 2026.",
    date: hoursAgo(3),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    email_type: "informatif",
    category: "newsletter",
    urgence: "basse",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "v3-f2",
    expediteur: "Lexbase",
    email_from: "alertes@lexbase.fr",
    objet: "Alerte jurisprudence — droit du travail",
    resume: "3 nouvelles décisions Cour de cassation en droit du travail. Arrêt notable : discrimination syndicale.",
    corps_original: "Alerte jurisprudence Lexbase — 28 mars 2026.",
    date: hoursAgo(4),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    email_type: "informatif",
    category: "newsletter",
    urgence: "basse",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "v3-f3",
    expediteur: "Calendly",
    email_from: "notifications@calendly.com",
    objet: "Confirmation RDV — Mme Lefebvre demain à 10h",
    resume: "Confirmation automatique du rendez-vous du 29 mars à 10h avec Mme Claire Lefebvre.",
    corps_original: "Confirmation de rendez-vous Calendly.",
    date: hoursAgo(6),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    email_type: "informatif",
    category: "notification",
    urgence: "basse",
    pieces_jointes: [],
    brouillon_mock: null,
  },
  {
    id: "v3-f4",
    expediteur: "Legaltech Summit",
    email_from: "info@legaltech-summit.fr",
    objet: "Dernière chance — tarif early bird 14 avril",
    resume: "Promotion pour la conférence LegalTech Summit 2026, Paris, 14 avril.",
    corps_original: "Email promotionnel — LegalTech Summit 2026.",
    date: hoursAgo(8),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    email_type: "informatif",
    category: "spam",
    urgence: "basse",
    pieces_jointes: [],
    brouillon_mock: null,
  },
];

// ---------------------------------------------------------------------------
// Dossiers V3
// ---------------------------------------------------------------------------

export const v3Dossiers: V3Dossier[] = [
  {
    id: "d1",
    nom: "Dupont c/ Dupont",
    domaine: "Droit de la famille",
    urgence: "haute",
    resume_situation: "Divorce contentieux avec litige sur la garde alternée de Théo (8 ans) et Léa (6 ans). Audience JAF fixée au 15 avril.",
    message_donna:
      "Mme Dupont vient de recevoir sa convocation pour l'audience du 15 avril devant le Juge aux Affaires Familiales. Me Laurent, avocate de M. Dupont, a transmis ses conclusions ce matin : elle demande la résidence principale chez son client et sollicite une expertise socio-familiale.\n\nJ'ai extrait l'ordonnance de convocation et l'attestation de l'école. Vos conclusions en réponse sont attendues avant le 8 avril.",
    emails: v3Emails.filter((e) => e.dossier_id === "d1"),
    pieces_jointes_count: 3,
  },
  {
    id: "d2",
    nom: "SCI Les Tilleuls c/ Brasserie du Parc",
    domaine: "Droit immobilier",
    urgence: "haute",
    resume_situation: "Bail commercial — 3 mois de loyers impayés (18 750 €). Locataire en difficulté, avocat adverse propose une médiation.",
    message_donna:
      "M. Lefranc signale 3 mois de loyers impayés, soit 18 750 euros. La clause résolutoire est stipulée à l'article 12 du bail.\n\nSurprise ce matin : l'avocat de la brasserie, Me Bonnet, conteste les charges de l'année 2025 et propose une médiation avant toute action. Son client reconnaît le retard mais demande les justificatifs de charges.\n\nJe vous recommande d'envoyer le commandement de payer visant la clause résolutoire sans attendre — la médiation peut avoir lieu en parallèle.",
    emails: v3Emails.filter((e) => e.dossier_id === "d2"),
    pieces_jointes_count: 2,
  },
  {
    id: "d3",
    nom: "Succession Martin",
    domaine: "Droit des successions",
    urgence: "moyenne",
    resume_situation: "Partage successoral avec désaccord sur la valeur de l'appartement. Actif net : 513 370 €. Délai amiable : 10 mai.",
    message_donna:
      "Le notaire a transmis l'estimation retenue : 380 000 euros pour l'appartement avenue Victor Hugo. Votre cliente Mme Claire Martin souhaite le conserver.\n\nProblème : son frère Paul Martin refuse cette valeur et exige 400 000 euros, arguant d'une contre-expertise d'agence. Il menace de vendre à un tiers à 405 000 euros si Claire ne s'aligne pas d'ici 15 jours.\n\nLe notaire impose un accord amiable avant le 10 mai, faute de quoi une licitation judiciaire sera ouverte.",
    emails: v3Emails.filter((e) => e.dossier_id === "d3"),
    pieces_jointes_count: 2,
  },
  {
    id: "d4",
    nom: "Madame Roux",
    domaine: "Droit du travail",
    urgence: "haute",
    resume_situation: "Licenciement pour insuffisance professionnelle après retour de congé maternité. Indices de discrimination. Offre adverse : 8 000 €.",
    message_donna:
      "Mme Roux vient de recevoir sa lettre de licenciement ce matin. La chronologie est parlante : retour de congé maternité en septembre, rétrogradation en octobre, avertissement en novembre, licenciement aujourd'hui.\n\nL'avocat de l'employeur propose déjà une transaction à 8 000 euros. La lettre ne cite aucun fait précis et daté — c'est un point de fragilité pour l'employeur.\n\nJ'ai extrait le contrat : salaire 4 850 euros bruts, ancienneté 4 ans. Les droits de Mme Roux sont bien supérieurs à l'offre proposée.",
    emails: v3Emails.filter((e) => e.dossier_id === "d4"),
    pieces_jointes_count: 2,
  },
  {
    id: "d5",
    nom: "Entreprise Dubois & Fils",
    domaine: "Droit commercial",
    urgence: "moyenne",
    resume_situation: "Recouvrement de 45 000 € HT sur 3 factures impayées. Travaux réceptionnés sans réserve. Procédure à engager.",
    message_donna:
      "M. Dubois attend votre conseil sur la meilleure voie de recouvrement pour les 45 000 euros impayés par M. Renard. Les bons de réception sont signés sans réserve — la créance est solide.\n\nIl s'interroge entre injonction de payer et référé provision. J'ai préparé un brouillon de réponse expliquant les deux options et recommandant l'injonction de payer pour sa rapidité.",
    emails: v3Emails.filter((e) => e.dossier_id === "d5"),
    pieces_jointes_count: 1,
  },
  {
    id: "d6",
    nom: "Association Horizon",
    domaine: "Droit associatif",
    urgence: "basse",
    resume_situation: "Exclusion d'un membre du bureau contestée. Irrégularité formelle de délai (9 jours au lieu de 15). Menace de recours.",
    message_donna:
      "M. Perrin demande si l'exclusion de M. Vidal est juridiquement solide. La réponse est nuancée : le délai de convocation de 9 jours au lieu de 15 est une irrégularité formelle réelle.\n\nLa solution la plus sûre serait de régulariser en convoquant une nouvelle assemblée avec le bon délai. J'ai préparé un brouillon de conseil expliquant les deux options.",
    emails: v3Emails.filter((e) => e.dossier_id === "d6"),
    pieces_jointes_count: 1,
  },
];

export const v3FilteredEmails = v3Emails.filter((e) => e.dossier_id === null);

// ---------------------------------------------------------------------------
// Stats par période
// ---------------------------------------------------------------------------

export function getV3EmailsForPeriod(period: "24h" | "7j" | "30j"): V3Email[] {
  const cutoff = new Date(NOW);
  if (period === "24h") cutoff.setDate(cutoff.getDate() - 1);
  else if (period === "7j") cutoff.setDate(cutoff.getDate() - 7);
  else cutoff.setDate(cutoff.getDate() - 30);
  return v3Emails.filter((e) => new Date(e.date) >= cutoff);
}

export interface V3Stats {
  total: number;
  dossier_emails: number;
  filtered_emails: number;
  pieces_jointes_count: number;
  temps_gagne_minutes: number;
  dossiers_urgents: number;
}

export function getV3Stats(period: "24h" | "7j" | "30j"): V3Stats {
  const emails = getV3EmailsForPeriod(period);
  const dossierEmails = emails.filter((e) => e.dossier_id !== null);
  const filteredEmails = emails.filter((e) => e.dossier_id === null);
  const pjCount = emails.reduce((sum, e) => sum + e.pieces_jointes.length, 0);
  const dossierIds = new Set(dossierEmails.map((e) => e.dossier_id));
  const dossiersUrgents = v3Dossiers.filter(
    (d) => d.urgence === "haute" && dossierIds.has(d.id)
  ).length;
  return {
    total: emails.length,
    dossier_emails: dossierEmails.length,
    filtered_emails: filteredEmails.length,
    pieces_jointes_count: pjCount,
    temps_gagne_minutes: Math.round(emails.length * 7),
    dossiers_urgents: dossiersUrgents,
  };
}

export function getV3ActiveDossiers(period: "24h" | "7j" | "30j"): V3Dossier[] {
  const emails = getV3EmailsForPeriod(period);
  const activeDossierIds = new Set(
    emails.filter((e) => e.dossier_id !== null).map((e) => e.dossier_id as string)
  );
  return v3Dossiers.filter((d) => activeDossierIds.has(d.id));
}

export function getV3FilteredForPeriod(period: "24h" | "7j" | "30j"): V3Email[] {
  const emails = getV3EmailsForPeriod(period);
  return emails.filter((e) => e.dossier_id === null);
}

// ---------------------------------------------------------------------------
// mockDossierEmailsV3
// ---------------------------------------------------------------------------

export function buildV3DossierEmails(): Record<string, DossierEmail[]> {
  const grouped: Record<string, DossierEmail[]> = {};
  for (const email of v3Emails) {
    if (!email.dossier_id) continue;
    if (!grouped[email.dossier_id]) grouped[email.dossier_id] = [];
    const pj = email.pieces_jointes.map((p) => ({ nom: p.nom, taille: p.taille, resume: p.resume_ia }));
    const dateObj = new Date(email.date);
    const dateFormatted = dateObj.toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
    grouped[email.dossier_id].push({
      id: email.id,
      expediteur: email.expediteur,
      email: email.email_from,
      objet: email.objet,
      date: dateFormatted,
      resume: email.resume,
      contenu: email.corps_original,
      pieces_jointes: pj.length > 0 ? pj : undefined,
    });
  }
  return grouped;
}

export const mockDossierEmailsV3 = buildV3DossierEmails();
