/**
 * Données mock V1 — 6 dossiers réalistes pour la page briefing todo-list
 * Utilisées exclusivement par Dashboard V1 (ux/v1)
 */

import type { MockEmail } from "@/lib/mock-briefing";

const NOW = new Date();
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600000).toISOString();
const daysAgo = (d: number, h = 9) =>
  new Date(NOW.getTime() - d * 86400000 - h * 3600000).toISOString();

// ---------------------------------------------------------------------------
// 18 emails — 6 dossiers × 3 emails chacun
// IDs : v1-e1 … v1-e18  |  dossier_id : "d1" … "d6"
// ---------------------------------------------------------------------------

export const mockV1Emails: MockEmail[] = [

  // =========================================================================
  // DOSSIER D1 — Dupont c/ Dupont — Divorce contentieux
  // =========================================================================
  {
    id: "v1-e1",
    expediteur: "Sophie Dupont",
    email: "sophie.dupont@gmail.com",
    objet: "Mon ex-mari refuse de me rendre les enfants",
    resume:
      "Mme Dupont signale que son ex-mari refuse de lui rendre les enfants ce week-end, en violation de l'ordonnance de garde alternée du JAF. Elle demande une intervention urgente.",
    corps_original:
      "Maître Fernandez,\n\nJe vous contacte en urgence. Mon ex-mari Thomas refuse catégoriquement de me rendre les enfants ce week-end, alors que c'est mon tour de garde selon l'ordonnance du JAF. Il prétexte que les enfants ne veulent pas venir, ce que je ne crois pas une seule seconde — ils ont 7 et 9 ans, ils ne peuvent pas décider seuls.\n\nJ'ai essayé de l'appeler trois fois ce matin, il ne décroche pas. J'ai envoyé un SMS, pas de réponse.\n\nQue puis-je faire ? Est-ce que je dois appeler la police ? Aller chercher les enfants moi-même ?\n\nJe suis dans tous mes états. Merci de me rappeler dès que possible.\n\nCordialement,\nSophie Dupont\n06 12 34 56 78",
    date: hoursAgo(1),
    dossier_id: "d1",
    dossier_nom: "Dupont c/ Dupont",
    dossier_domaine: "Droit de la famille",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dupont,\n\nJe prends note de votre message et comprends l'urgence de la situation.\n\nEn cas de non-représentation d'enfant, vous pouvez :\n1. Contacter la police pour constater le refus (demander un procès-verbal)\n2. Dans un second temps, déposer une plainte pour non-représentation d'enfant (art. 227-5 du Code pénal), passible de 1 an d'emprisonnement et 15 000 € d'amende\n\nJe vous conseille de procéder au dépôt de plainte dès ce soir. Je me charge de saisir le JAF dès lundi matin pour une ordonnance de mise en conformité.\n\nCordialement,\nMe Alexandra Fernandez",
    from_email: "sophie.dupont@gmail.com",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "v1-e2",
    expediteur: "Me Laurent",
    email: "m.laurent@cabinet-laurent.fr",
    objet: "Dupont c/ Dupont — Conclusions en réponse",
    resume:
      "L'avocat de M. Thomas Dupont dépose ses conclusions en réponse. Il conteste la résidence principale chez la mère et demande le maintien de la garde alternée telle qu'ordonnée. Délai de 15 jours pour pièces complémentaires.",
    corps_original:
      "Chère Consoeur,\n\nJe vous transmets en pièce jointe les conclusions en réponse de M. Thomas Dupont dans le cadre de la procédure Dupont c/ Dupont (RG 26/03412, JAF Paris, 4e chambre).\n\nMon client conteste la demande de modification de résidence principale formulée par votre cliente. Il fait valoir que la garde alternée actuelle est parfaitement adaptée au rythme de vie des enfants et que toute modification serait préjudiciable à leur équilibre.\n\nJe vous rappelle que la prochaine audience est fixée au 15 avril 2026 à 10h00 devant M. le Juge Beaumont.\n\nJe sollicite un délai de 15 jours pour production de pièces complémentaires.\n\nBien confraternellement,\nMe Jean-Pierre Laurent\nAvocat au Barreau de Paris",
    date: hoursAgo(3),
    dossier_id: "d1",
    dossier_nom: "Dupont c/ Dupont",
    dossier_domaine: "Droit de la famille",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "Conclusions_en_réponse_Laurent_26-03-2026.pdf",
        taille: "340 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Conclusions de Me Laurent pour M. Thomas Dupont. Contestation de la demande de résidence principale. Demande de maintien de la garde alternée avec argumentation sur l'intérêt des enfants. Production de deux attestations de l'école.",
      },
    ],
    brouillon_mock: null,
    from_email: "Me Laurent <m.laurent@cabinet-laurent.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: "secretariat@cabinet-laurent.fr",
  },
  {
    id: "v1-e3",
    expediteur: "Tribunal de Paris — JAF",
    email: "jaf.paris@justice.gouv.fr",
    objet: "Convocation — Audience JAF 15 avril 2026",
    resume:
      "Convocation à l'audience du JAF du Tribunal judiciaire de Paris fixée au 15 avril 2026 à 10h00, affaire Dupont c/ Dupont (RG 26/03412). Présence obligatoire des parties et de leurs conseils.",
    corps_original:
      "TRIBUNAL JUDICIAIRE DE PARIS\nJuge aux affaires familiales — 4e chambre\n4, boulevard du Palais — 75001 Paris\n\nCONVOCATION\n\nMaître Alexandra FERNANDEZ,\nAvocate de Madame Sophie DUPONT\n\nVous êtes convoqués à l'audience du Juge aux affaires familiales du Tribunal judiciaire de Paris :\n\nDate : Mercredi 15 avril 2026\nHeure : 10h00\nSalle : 4A, 2e étage\nAffaire : DUPONT Sophie c/ DUPONT Thomas\nRG : 26/03412\nObjets : modification résidence habituelle enfants, révision contribution à l'entretien\n\nLa présence des parties et de leurs conseils est OBLIGATOIRE.\n\nM. le Juge Emmanuel BEAUMONT\nJuge aux affaires familiales",
    date: hoursAgo(5),
    dossier_id: "d1",
    dossier_nom: "Dupont c/ Dupont",
    dossier_domaine: "Droit de la famille",
    category: "client",
    email_type: "convocation",
    pieces_jointes: [
      {
        nom: "Ordonnance_JAF_12janvier2026.pdf",
        taille: "210 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Ordonnance du JAF du 12 janvier 2026 fixant la garde alternée semaine/semaine. Résidence principale : chez la mère pendant la durée de la procédure. Contribution de M. Dupont : 350 €/mois par enfant.",
      },
      {
        nom: "Attestation_école_primaire.pdf",
        taille: "95 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Attestation de la directrice de l'école primaire certifiant que les deux enfants sont scolarisés à Paris 11e et que les absences depuis janvier 2026 sont imputables à des conflits de garde.",
      },
    ],
    brouillon_mock: null,
    from_email: "JAF Paris <jaf.paris@justice.gouv.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },

  // =========================================================================
  // DOSSIER D2 — SCI Les Tilleuls c/ Brasserie du Parc — Bail commercial
  // =========================================================================
  {
    id: "v1-e4",
    expediteur: "M. Fontaine (SCI Les Tilleuls)",
    email: "p.fontaine@sci-tilleuls.fr",
    objet: "Locataires toujours en défaut — 3 mois impayés",
    resume:
      "M. Fontaine, gérant de la SCI Les Tilleuls, signale que la Brasserie du Parc n'a pas payé les loyers de janvier, février et mars 2026 (3 150 €/mois). Il demande l'envoi d'une mise en demeure et une procédure d'expulsion.",
    corps_original:
      "Maître Fernandez,\n\nJe vous contacte car la situation avec la Brasserie du Parc devient intenable. Cela fait maintenant 3 mois qu'ils ne nous paient pas — janvier, février, mars — soit 9 450 euros de loyers impayés auxquels il faut ajouter les charges (environ 850 euros).\n\nJ'ai tenté de joindre M. Berthelot (le gérant) plusieurs fois. La semaine dernière il m'a finalement répondu que « la brasserie traversait des difficultés mais que ça allait s'arranger ». Ça ne s'arrange pas.\n\nJe veux qu'on leur envoie une mise en demeure formelle et je veux savoir si on peut lancer une procédure d'expulsion. Le bail prévoit une clause résolutoire pour loyers impayés depuis plus de 2 mois.\n\nMerci de me revenir rapidement.\n\nM. Pierre Fontaine\nGérant SCI Les Tilleuls",
    date: hoursAgo(2),
    dossier_id: "d2",
    dossier_nom: "SCI Les Tilleuls c/ Brasserie du Parc",
    dossier_domaine: "Bail commercial",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Monsieur Fontaine,\n\nJ'accuse réception de votre message. La situation est effectivement préoccupante et je comprends votre impatience.\n\nJe vous propose d'agir en deux temps :\n\n1. Envoi immédiat d'une mise en demeure par LRAR aux gérants de la Brasserie du Parc, avec un délai de 8 jours pour régulariser\n2. Si absence de paiement : assignation en référé pour constater l'acquisition de la clause résolutoire et obtenir l'expulsion sous 4-6 semaines\n\nJe vous transmets le projet de mise en demeure d'ici 24 heures pour validation.\n\nCordialement,\nMe Alexandra Fernandez",
    from_email: "Pierre Fontaine <p.fontaine@sci-tilleuls.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "v1-e5",
    expediteur: "Me Rousseau (Brasserie du Parc)",
    email: "c.rousseau@avocat-rousseau.fr",
    objet: "Contestation du montant des charges",
    resume:
      "L'avocat de la Brasserie du Parc conteste le décompte des charges envoyé par la SCI. Il soutient que certaines charges ne sont pas récupérables selon le bail. Il propose un délai de paiement de 6 mois.",
    corps_original:
      "Chère Consoeur,\n\nJe me permets de vous écrire en qualité de conseil de la Brasserie du Parc SAS, en réponse à la mise en demeure informelle adressée à mon client le 15 mars 2026.\n\nMon client conteste le montant des charges réclamées. L'article 7 du bail commercial du 12 mars 2022 limite les charges récupérables aux charges de copropriété courantes, à l'exclusion des travaux de gros entretien. Or le dernier décompte de charges comprend la réfection de la toiture pour 12 000 euros, ce qui nous semble contraire aux stipulations du bail.\n\nPar ailleurs, mon client traverse une période de difficultés financières conjoncturelles liées à la hausse des coûts matières. Il propose un échelonnement du paiement des loyers sur 6 mois.\n\nJe reste disponible pour tout échange.\n\nBien confraternellement,\nMe Christine Rousseau",
    date: hoursAgo(6),
    dossier_id: "d2",
    dossier_nom: "SCI Les Tilleuls c/ Brasserie du Parc",
    dossier_domaine: "Bail commercial",
    category: "client",
    email_type: "demande",
    pieces_jointes: [
      {
        nom: "Bail_commercial_2022.pdf",
        taille: "680 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Bail commercial signé le 12 mars 2022 pour locaux commerciaux de 180 m² situés avenue du Parc. Loyer : 3 150 €/mois HT. Durée : 9 ans (3-6-9). Clause résolutoire pour loyers impayés depuis plus de 2 mois consécutifs.",
      },
    ],
    brouillon_mock: null,
    from_email: "Me Rousseau <c.rousseau@avocat-rousseau.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "v1-e6",
    expediteur: "M. Fontaine (SCI Les Tilleuls)",
    email: "p.fontaine@sci-tilleuls.fr",
    objet: "Mise en demeure du 5 mars — suite",
    resume:
      "M. Fontaine confirme avoir reçu la mise en demeure du 5 mars et demande confirmation que la procédure d'expulsion peut être lancée si la Brasserie ne paie pas sous 8 jours.",
    corps_original:
      "Maître,\n\nJ'ai bien reçu copie de la mise en demeure du 5 mars. Pouvez-vous me confirmer que si la Brasserie ne paie pas d'ici le 13 mars, on peut lancer la procédure d'expulsion immédiatement ?\n\nMerci,\nP. Fontaine",
    date: daysAgo(2),
    dossier_id: "d2",
    dossier_nom: "SCI Les Tilleuls c/ Brasserie du Parc",
    dossier_domaine: "Bail commercial",
    category: "client",
    email_type: "demande",
    pieces_jointes: [
      {
        nom: "Mise_en_demeure_5mars2026.pdf",
        taille: "180 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Mise en demeure adressée à la Brasserie du Parc par Me Fernandez, réclamant le paiement de 9 450 euros de loyers impayés dans un délai de 8 jours, sous peine d'acquisition de la clause résolutoire.",
      },
    ],
    brouillon_mock: null,
    from_email: "Pierre Fontaine <p.fontaine@sci-tilleuls.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },

  // =========================================================================
  // DOSSIER D3 — Succession Martin — Partage successoral
  // =========================================================================
  {
    id: "v1-e7",
    expediteur: "Me Beaumont (notaire)",
    email: "beaumont@notaire-beaumont.fr",
    objet: "Succession Martin — compte rendu réunion héritiers",
    resume:
      "Me Beaumont, notaire en charge de la succession Martin, transmet le compte rendu de la réunion des héritiers. L'accord n'a pas pu être trouvé sur la vente du bien immobilier de Deauville. Il propose une expertise judiciaire.",
    corps_original:
      "Maître Fernandez,\n\nSuite à notre rendez-vous du 22 mars en présence des trois héritiers Martin (M. Étienne Martin, Mme Isabelle Martin-Duval et M. Philippe Martin), j'ai l'honneur de vous transmettre le compte rendu joint.\n\nComme vous le savez, l'accord n'a pas pu être trouvé concernant la maison de Deauville. Mme Isabelle Martin-Duval s'oppose à la vente, contrairement à ses deux frères. Conformément à l'article 840 du Code civil, il convient donc d'envisager une procédure de licitation ou une action en partage judiciaire.\n\nJe vous propose d'organiser une réunion de médiation dans un premier temps, avant d'aller en justice. Pourriez-vous me faire connaître votre position ?\n\nBien confraternellement,\nMe Robert Beaumont\nNotaire",
    date: hoursAgo(4),
    dossier_id: "d3",
    dossier_nom: "Succession Martin",
    dossier_domaine: "Droit successoral",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "CR_réunion_héritiers_22mars.pdf",
        taille: "290 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Compte rendu de la réunion des héritiers Martin du 22 mars 2026. Désaccord sur la vente de la maison de Deauville. Mme Isabelle Martin-Duval souhaite conserver le bien. Les deux autres héritiers veulent vendre. Estimation : 485 000 €.",
      },
      {
        nom: "Estimation_immobilière_Deauville.pdf",
        taille: "420 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Estimation du cabinet Immoval : maison de 180 m² à Deauville estimée à 485 000 € nets vendeur. État général bon. Travaux de remise en état estimés à 35 000 €. Marché local dynamique.",
      },
    ],
    brouillon_mock: null,
    from_email: "Me Beaumont <beaumont@notaire-beaumont.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "v1-e8",
    expediteur: "Étienne Martin",
    email: "e.martin@martin-holding.fr",
    objet: "Ma sœur refuse de vendre la maison de Deauville",
    resume:
      "M. Étienne Martin (héritier principal, mandant) demande d'accélérer la procédure. Sa sœur Isabelle bloque la vente depuis 8 mois. Il veut aller en justice pour obtenir le partage judiciaire.",
    corps_original:
      "Maître,\n\nSuite à la réunion chez le notaire, ma sœur Isabelle persiste dans son refus de vendre la maison de Deauville. Cette situation dure depuis plus de 8 mois maintenant et je n'en peux plus. Philippe est d'accord avec moi pour vendre.\n\nNous sommes deux contre un. Est-ce qu'on peut forcer la vente ? Le notaire m'a parlé d'une « licitation » mais je ne comprends pas bien comment ça fonctionne.\n\nPar ailleurs, sachez que la maison n'est pas entretenue — ma sœur y passe des week-ends mais ne fait aucun travaux. Le toit commence à poser problème selon le plombier que j'ai fait passer.\n\nMerci pour votre aide,\nÉtienne Martin",
    date: daysAgo(1),
    dossier_id: "d3",
    dossier_nom: "Succession Martin",
    dossier_domaine: "Droit successoral",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Monsieur Martin,\n\nJe vous confirme qu'il est possible de contraindre au partage même en présence d'un héritier récalcitrant.\n\nDeux voies s'offrent à vous :\n1. L'action en partage judiciaire (art. 840 CC) : le tribunal ordonne la vente aux enchères (licitation). Durée : 12-18 mois\n2. La procédure participative (médiation imposée) — plus rapide si votre sœur accepte de dialoguer\n\nJe vous recommande de saisir le tribunal dans les 15 jours pour ne pas laisser le bien se dégrader davantage (valeur locative perdue, risque de sinistre).\n\nJe prépare l'assignation.\n\nCordialement,\nMe Fernandez",
    from_email: "Étienne Martin <e.martin@martin-holding.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "v1-e9",
    expediteur: "Me Beaumont (notaire)",
    email: "beaumont@notaire-beaumont.fr",
    objet: "Acte de décès M. Georges Martin — transmission",
    resume:
      "Transmission de l'acte de décès de M. Georges Martin (décédé le 3 novembre 2025) et de l'inventaire du patrimoine successoral. Valeur totale estimée à 740 000 € (immobilier + liquidités + mobilier).",
    corps_original:
      "Maître,\n\nVeuillez trouver ci-joint l'acte de décès de M. Georges Martin et l'inventaire du patrimoine successoral.\n\nBien confraternellement,\nMe Beaumont",
    date: daysAgo(5),
    dossier_id: "d3",
    dossier_nom: "Succession Martin",
    dossier_domaine: "Droit successoral",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "Acte_de_décès_Georges_Martin.pdf",
        taille: "120 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Acte de décès de M. Georges Martin, décédé le 3 novembre 2025 à Paris 15e, à l'âge de 78 ans. Trois héritiers : Étienne (1/3), Isabelle (1/3), Philippe (1/3).",
      },
    ],
    brouillon_mock: null,
    from_email: "Me Beaumont <beaumont@notaire-beaumont.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },

  // =========================================================================
  // DOSSIER D4 — Madame Roux — Licenciement abusif
  // =========================================================================
  {
    id: "v1-e10",
    expediteur: "Valérie Roux",
    email: "v.roux@gmail.com",
    objet: "J'ai reçu ma lettre de licenciement hier",
    resume:
      "Mme Roux a reçu sa lettre de licenciement pour motif personnel. Elle conteste la réalité des faits reprochés et souhaite contester aux prud'hommes. Elle demande à connaître ses droits et délais.",
    corps_original:
      "Maître Fernandez,\n\nJ'ai reçu ma lettre de licenciement hier par LRAR. Le motif invoqué est une « insuffisance professionnelle » et des « manquements répétés aux procédures internes ».\n\nJe conteste absolument ces faits. J'ai toujours eu d'excellentes évaluations (je vous joins les deux derniers entretiens annuels) et les prétendus « manquements » n'ont jamais fait l'objet du moindre avertissement écrit.\n\nJe pense que c'est un licenciement déguisé : depuis le rachat de mon entreprise en janvier, mon nouveau responsable cherche à se débarrasser des « anciens » pour embaucher ses propres équipes.\n\nQue faire maintenant ? Combien de temps j'ai pour aller aux prud'hommes ?\n\nMerci,\nValérie Roux",
    date: hoursAgo(6),
    dossier_id: "d4",
    dossier_nom: "Madame Roux",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "demande",
    pieces_jointes: [
      {
        nom: "Lettre_de_licenciement_Roux.pdf",
        taille: "145 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Lettre de licenciement de Mme Valérie Roux datée du 27 mars 2026, signée par M. Christophe Bard (DRH). Motif : insuffisance professionnelle et manquements répétés aux procédures internes. Aucun avertissement préalable mentionné.",
      },
      {
        nom: "Contrat_de_travail_Roux.pdf",
        taille: "380 KB",
        type_mime: "application/pdf",
        resume_ia:
          "CDI signé le 5 juin 2017, poste de responsable administrative et financière, statut cadre. Salaire brut mensuel : 4 850 €. Ancienneté : 8 ans et 10 mois. Pas de clause de non-concurrence.",
      },
    ],
    brouillon_mock:
      "Chère Madame Roux,\n\nJ'accuse réception de votre message et de votre lettre de licenciement.\n\nVous disposez d'un délai de 12 mois à compter de la notification pour saisir le Conseil de prud'hommes.\n\nAu regard des éléments que vous me transmettez (absence d'avertissement, excellentes évaluations), il existe de sérieux arguments pour qualifier ce licenciement d'abusif. La soudaineté du licenciement après un rachat peut également laisser supposer un motif économique déguisé, ce qui ouvrirait droit à des indemnités supplémentaires.\n\nJe vous propose un rendez-vous cette semaine pour constituer votre dossier.\n\nCordialement,\nMe Alexandra Fernandez",
    from_email: "Valérie Roux <v.roux@gmail.com>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "v1-e11",
    expediteur: "Me Garnier (avocat employeur)",
    email: "f.garnier@cabinet-garnier.fr",
    objet: "Roux c/ SAS Technovex — Contestation",
    resume:
      "L'avocat de l'employeur SAS Technovex maintient que le licenciement est fondé et produit 4 comptes rendus d'entretiens soulignant des insuffisances. Il s'oppose à tout accord amiable à ce stade.",
    corps_original:
      "Chère Consoeur,\n\nJe vous confirme que ma cliente, la SAS Technovex, maintient que le licenciement de Mme Roux est pleinement fondé sur des motifs réels et sérieux.\n\nNous versons aux débats 4 comptes rendus d'entretiens trimestriels entre janvier et décembre 2025 faisant état d'insuffisances répétées, ainsi que les emails adressés à Mme Roux lui demandant de se conformer aux nouvelles procédures mises en place depuis le rachat.\n\nMa cliente n'envisage pas d'accord amiable à ce stade.\n\nBien confraternellement,\nMe François Garnier",
    date: daysAgo(3),
    dossier_id: "d4",
    dossier_nom: "Madame Roux",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Me Garnier <f.garnier@cabinet-garnier.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "v1-e12",
    expediteur: "Valérie Roux",
    email: "v.roux@gmail.com",
    objet: "Mes évaluations 2024 et 2025",
    resume:
      "Mme Roux transmet ses deux derniers entretiens annuels d'évaluation (2024 et 2025), tous deux positifs, pour étayer sa contestation du licenciement.",
    corps_original:
      "Maître,\n\nComme convenu, je vous transmets mes deux derniers entretiens annuels. Comme vous pouvez le constater, mes résultats sont « conformes aux attentes » voire « au-delà des attentes » sur la quasi-totalité des critères. Aucune mention d'insuffisance professionnelle.\n\nV. Roux",
    date: daysAgo(4),
    dossier_id: "d4",
    dossier_nom: "Madame Roux",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "Evaluation_annuelle_2025.pdf",
        taille: "210 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Entretien annuel 2025 de Mme Roux, signé par son responsable direct M. Leblanc (avant rachat). Note globale : 4/5. Commentaire : « Excellente maîtrise des procédures comptables. Autonomie appréciée. » Aucune observation négative.",
      },
    ],
    brouillon_mock: null,
    from_email: "Valérie Roux <v.roux@gmail.com>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },

  // =========================================================================
  // DOSSIER D5 — Entreprise Dubois & Fils — Recouvrement
  // =========================================================================
  {
    id: "v1-e13",
    expediteur: "Bernard Dubois",
    email: "b.dubois@dubois-fils.fr",
    objet: "Impayés — 45 000 € depuis 6 mois",
    resume:
      "M. Dubois signale que son client Constructions Normandes SAS lui doit 45 000 € de factures impayées depuis 6 mois. Malgré 3 relances, aucun paiement. Il demande une procédure d'injonction de payer.",
    corps_original:
      "Maître Fernandez,\n\nJe vous contacte pour une affaire de recouvrement urgente.\n\nLa société Constructions Normandes SAS (SIRET 823 456 789 00015) me doit 45 200 euros TTC correspondant à 6 factures de prestations de menuiserie émises entre septembre 2025 et janvier 2026. Malgré 3 relances écrites et 2 appels téléphoniques, aucun paiement n'est intervenu.\n\nLe gérant, M. Alain Dupré, répond toujours « qu'il va régler ça la semaine prochaine » mais ça dure depuis 6 mois.\n\nPeut-on faire une injonction de payer ? J'ai entendu dire que c'est rapide.\n\nBernard Dubois\nDubois & Fils SARL",
    date: hoursAgo(8),
    dossier_id: "d5",
    dossier_nom: "Entreprise Dubois & Fils",
    dossier_domaine: "Recouvrement",
    category: "client",
    email_type: "demande",
    pieces_jointes: [
      {
        nom: "Factures_impayées_Constructions_Normandes.pdf",
        taille: "520 KB",
        type_mime: "application/pdf",
        resume_ia:
          "6 factures impayées de Dubois & Fils à Constructions Normandes SAS entre septembre 2025 et janvier 2026. Montant total : 45 200 € TTC. Prestations : fourniture et pose de menuiseries extérieures sur chantier résidentiel.",
      },
    ],
    brouillon_mock:
      "Monsieur Dubois,\n\nJ'accuse réception de votre message. La procédure d'injonction de payer est effectivement adaptée à votre situation.\n\nVoici les étapes :\n1. Requête en injonction de payer auprès du Tribunal de commerce (délai : 8-15 jours pour obtenir l'ordonnance)\n2. Signification de l'ordonnance au débiteur par huissier\n3. Si opposition : audience contradictoire\n4. Si pas d'opposition : titre exécutoire immédiat → saisie possible\n\nPour préparer la requête, j'aurai besoin des 6 factures, des bons de commande/devis, et des preuves des relances.\n\nCordialement,\nMe Fernandez",
    from_email: "Bernard Dubois <b.dubois@dubois-fils.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "v1-e14",
    expediteur: "Constructions Normandes SAS",
    email: "contact@constructions-normandes.fr",
    objet: "Difficultés financières — demande de délai",
    resume:
      "Constructions Normandes SAS reconnaît la dette mais invoque des difficultés financières liées à un chantier public en retard. Propose un règlement en 3 fois sur 6 mois.",
    corps_original:
      "Madame le Maître,\n\nSuite aux relances de notre fournisseur Dubois & Fils, nous vous contactons pour vous faire part de notre situation.\n\nNous reconnaissons devoir la somme réclamée. Cependant, nous traversons des difficultés de trésorerie liées au retard de paiement d'un marché public (Mairie de Rouen, 320 000 €) dont le règlement est attendu pour fin mai 2026.\n\nNous proposons un règlement en 3 versements égaux sur 6 mois : 15 000 € début avril, 15 000 € début juin, 15 200 € début août.\n\nNous espérons que cette proposition sera acceptable.\n\nCordialement,\nAlain Dupré, Gérant",
    date: daysAgo(6),
    dossier_id: "d5",
    dossier_nom: "Entreprise Dubois & Fils",
    dossier_domaine: "Recouvrement",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Constructions Normandes <contact@constructions-normandes.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "v1-e15",
    expediteur: "Bernard Dubois",
    email: "b.dubois@dubois-fils.fr",
    objet: "Relances courrier — confirmation envoi",
    resume:
      "M. Dubois transmet les preuves des 3 relances adressées à Constructions Normandes SAS, dont 2 par LRAR. Ces pièces seront utiles pour la procédure judiciaire.",
    corps_original:
      "Maître,\n\nComme demandé, je vous transmets les accusés de réception des 3 relances LRAR adressées à Constructions Normandes.\n\nB. Dubois",
    date: daysAgo(7),
    dossier_id: "d5",
    dossier_nom: "Entreprise Dubois & Fils",
    dossier_domaine: "Recouvrement",
    category: "client",
    email_type: "piece_jointe",
    pieces_jointes: [
      {
        nom: "Relances_courrier_AR_Normandes.pdf",
        taille: "190 KB",
        type_mime: "application/pdf",
        resume_ia:
          "3 lettres de relance adressées à Constructions Normandes SAS. 2 par LRAR (accusés signés les 15/12/2025 et 20/01/2026), 1 par email. Aucune réponse aux deux premières, réponse évasive à la troisième.",
      },
    ],
    brouillon_mock: null,
    from_email: "Bernard Dubois <b.dubois@dubois-fils.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },

  // =========================================================================
  // DOSSIER D6 — Association Horizon — Conflit bureau
  // =========================================================================
  {
    id: "v1-e16",
    expediteur: "Marc Lefort (Président)",
    email: "m.lefort@asso-horizon.fr",
    objet: "Trésorier — dépenses non autorisées",
    resume:
      "M. Lefort, président de l'association Horizon, signale que le trésorier a effectué des dépenses non autorisées pour 8 200 €. Il souhaite engager une procédure de révocation et éventuellement poursuivre pour abus de confiance.",
    corps_original:
      "Maître Fernandez,\n\nJe vous contacte en urgence concernant notre trésorier, M. Patrick Vidal.\n\nAu cours de la vérification des comptes de l'exercice 2025, nous avons découvert qu'il a effectué des dépenses pour un montant total de 8 200 euros sans aucune autorisation du bureau ni de l'assemblée générale. Ces dépenses incluent notamment l'achat de matériel informatique pour usage personnel et des déplacements non liés à l'activité associative.\n\nLes statuts de l'association sont pourtant clairs : toute dépense supérieure à 500 euros doit être validée par le bureau en réunion.\n\nJe souhaite :\n1. Révoquer M. Vidal de ses fonctions de trésorier\n2. Récupérer les sommes détournées\n3. Éventuellement déposer plainte pour abus de confiance\n\nComment procède-t-on ?\n\nM. Lefort",
    date: hoursAgo(10),
    dossier_id: "d6",
    dossier_nom: "Association Horizon",
    dossier_domaine: "Droit des associations",
    category: "client",
    email_type: "demande",
    pieces_jointes: [
      {
        nom: "Statuts_Association_Horizon.pdf",
        taille: "250 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Statuts de l'Association Horizon (loi 1901), approuvés en AG du 12 mars 2019. Article 12 : les dépenses supérieures à 500 € nécessitent une validation préalable du bureau. Article 15 : révocation des membres du bureau par vote de l'AG à la majorité des 2/3.",
      },
      {
        nom: "Relevés_bancaires_janv-mars2026.pdf",
        taille: "340 KB",
        type_mime: "application/pdf",
        resume_ia:
          "Relevés bancaires de l'Association Horizon pour les mois de janvier à mars 2026. 14 virements non justifiés pour un total de 8 200 €. Principaux postes : achat ordinateur (1 200 €), hôtel Paris 4 nuits (940 €), achats Amazon sans justificatif (3 800 €).",
      },
    ],
    brouillon_mock: null,
    from_email: "Marc Lefort <m.lefort@asso-horizon.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "v1-e17",
    expediteur: "Marc Lefort (Président)",
    email: "m.lefort@asso-horizon.fr",
    objet: "Convocation AG extraordinaire — suite",
    resume:
      "M. Lefort demande un modèle de convocation pour une assemblée générale extraordinaire afin de procéder à la révocation du trésorier.",
    corps_original:
      "Maître,\n\nSuite à notre échange, pourriez-vous me préparer un modèle de convocation pour l'AG extraordinaire ? Je dois l'envoyer aux 47 membres avec 15 jours de préavis selon nos statuts.\n\nMerci,\nM. Lefort",
    date: daysAgo(2),
    dossier_id: "d6",
    dossier_nom: "Association Horizon",
    dossier_domaine: "Droit des associations",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Monsieur le Président,\n\nVoici le modèle de convocation :\n\n---\nAssociation Horizon — Loi 1901\nConvocation à l'Assemblée Générale Extraordinaire\n\nMonsieur, Madame,\n\nVous êtes convoqué(e) à l'Assemblée Générale Extraordinaire de l'Association Horizon qui se tiendra le [DATE] à [HEURE] à [LIEU].\n\nOrdre du jour :\n1. Présentation des irrégularités financières constatées\n2. Vote sur la révocation du trésorier\n3. Élection d'un nouveau trésorier\n4. Questions diverses\n\nConformément à l'article 15 des statuts, la révocation nécessite une majorité des 2/3 des membres présents ou représentés.\n---\n\nCordialement,\nMe Fernandez",
    from_email: "Marc Lefort <m.lefort@asso-horizon.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "v1-e18",
    expediteur: "Patrick Vidal",
    email: "p.vidal@gmail.com",
    objet: "Ma réponse aux accusations",
    resume:
      "M. Patrick Vidal, trésorier, conteste les accusations du président. Il affirme que les dépenses étaient légitimes et qu'il dispose de justificatifs. Il menace une action en diffamation si la procédure de révocation est engagée.",
    corps_original:
      "Maître Fernandez,\n\nJ'apprends que le président Lefort vous a contacté pour me faire révoquer et me poursuivre. Je tiens à répondre.\n\nToutes les dépenses que j'ai effectuées étaient justifiées par les besoins de l'association. L'ordinateur a remplacé l'ancien matériel en panne. Les déplacements concernaient des réunions de réseau associatif. J'ai tous les justificatifs.\n\nSi M. Lefort engage une procédure de révocation ou dépose plainte sans fondement, je me réserve le droit de poursuivre l'association pour diffamation.\n\nP. Vidal",
    date: daysAgo(1),
    dossier_id: "d6",
    dossier_nom: "Association Horizon",
    dossier_domaine: "Droit des associations",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Patrick Vidal <p.vidal@gmail.com>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getV1EmailsForPeriod(period: "24h" | "7j" | "30j"): MockEmail[] {
  const now = new Date();
  const cutoff = new Date(now);
  if (period === "24h") cutoff.setDate(cutoff.getDate() - 1);
  else if (period === "7j") cutoff.setDate(cutoff.getDate() - 7);
  else cutoff.setDate(cutoff.getDate() - 30);
  return mockV1Emails.filter((e) => new Date(e.date) >= cutoff);
}

export function getV1Stats(emails: MockEmail[]) {
  const dossierEmails = emails.filter((e) => e.dossier_id !== null);
  const attachmentsCount = emails.reduce((sum, e) => sum + e.pieces_jointes.length, 0);
  return {
    total: emails.length,
    dossier_emails: dossierEmails.length,
    general_emails: emails.length - dossierEmails.length,
    attachments_count: attachmentsCount,
  };
}

// IDs dossiers V1
export const V1_DOSSIER_IDS = ["d1", "d2", "d3", "d4", "d5", "d6"];

export const v1DossierLabels: Record<string, { nom: string; domaine: string }> = {
  d1: { nom: "Dupont c/ Dupont", domaine: "Droit de la famille" },
  d2: { nom: "SCI Les Tilleuls c/ Brasserie du Parc", domaine: "Bail commercial" },
  d3: { nom: "Succession Martin", domaine: "Droit successoral" },
  d4: { nom: "Madame Roux", domaine: "Droit du travail" },
  d5: { nom: "Entreprise Dubois & Fils", domaine: "Recouvrement" },
  d6: { nom: "Association Horizon", domaine: "Droit des associations" },
};
