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
  from_email: string;
  to_email: string;
  cc_email: string | null;
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
      "Cher Maître Fernandez,\n\nJe me permets de vous relancer une nouvelle fois, et je m'excuse d'avance si je suis un peu insistante, mais la situation me pèse énormément depuis plusieurs semaines et j'ai vraiment besoin d'être rassurée.\n\nConcernant la mise en demeure que vous avez envoyée à BTP Pro le 2 mars dernier, avez-vous eu le moindre retour de leur part ? Un courrier, un appel, n'importe quoi ? Parce que de mon côté c'est le silence radio complet. J'ai essayé d'appeler leur standard (le 01 45 67 89 00) trois fois cette semaine et personne ne décroche jamais. La secrétaire m'avait dit « M. Bertrand vous rappellera » il y a 10 jours et je n'ai toujours rien.\n\nEn plus, et c'est ça qui me rend vraiment malade, les dégâts continuent de s'aggraver. Ce matin encore, en ouvrant les volets de la chambre du fond, j'ai constaté une nouvelle fissure sur la façade nord, juste au-dessus de la fenêtre de la cuisine. Elle fait facilement 30 centimètres. Mon voisin M. Lefèvre (celui qui est architecte à la retraite, je vous en avais parlé) est passé voir et il m'a dit que « ça n'annonce rien de bon pour la structure ». Ça m'a glacée.\n\nJ'ai aussi remarqué que quand il pleut — et avec ce temps de mars, il pleut pratiquement tous les jours — il y a maintenant de l'humidité visible sur le mur intérieur du salon, côté nord. Je n'ose même plus inviter de monde à la maison, c'est la honte.\n\nDu coup mes questions sont les suivantes :\n- Est-ce que le délai de la mise en demeure est bientôt expiré ?\n- Quelles sont les prochaines étapes concrètes si BTP Pro ne daigne toujours pas répondre ?\n- Faut-il que je fasse faire un nouveau constat par un huissier pour documenter l'aggravation ?\n- Est-ce qu'on peut demander des dommages et intérêts pour le préjudice moral ? Parce que franchement, entre le stress et les nuits blanches, je suis à bout.\n\nExcusez-moi pour ce long message, je sais que vous êtes très occupée, mais je me sens vraiment seule face à cette situation et vous êtes mon seul recours.\n\nJe vous remercie infiniment pour votre aide et votre réactivité, c'est vraiment précieux.\n\nEn vous souhaitant une bonne fin de journée,\n\nBien cordialement,\nMarie Dupont\n06 78 90 12 34\n\nPS : j'ai pris des photos ce matin, je vous les envoie dans un prochain email si vous pensez que c'est utile.",
    date: hoursAgo(3),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dupont,\n\nJe vous remercie pour votre message et comprends votre inquiétude.\n\nÀ ce jour, BTP Pro n'a pas donné suite à notre mise en demeure du 2 mars. Le délai de réponse expire le 2 avril prochain.\n\nEn l'absence de réponse à cette date, je vous recommande d'engager une procédure judiciaire devant le Tribunal de commerce. Je prépare d'ores et déjà le dossier d'assignation.\n\nJe reste à votre disposition pour en discuter.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Marie Dupont <marie.dupont@gmail.com>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e2",
    expediteur: "Newsletter Ordre des Avocats",
    email: "newsletter@ordre-avocats-paris.fr",
    objet: "Actualités juridiques",
    resume:
      "Newsletter mensuelle de l'Ordre des Avocats de Paris. Au sommaire : réforme de la procédure civile, nouvelles obligations RGPD pour les cabinets, et rappel des formations disponibles au 2e trimestre.",
    corps_original:
      "Chers Confrères et Consoeurs,\n\nL'Ordre des Avocats de Paris a le plaisir de vous adresser sa lettre d'information mensuelle. Nous vous invitons à prendre connaissance des points suivants, qui concernent l'ensemble de la profession et notamment les obligations réglementaires à respecter dans les prochaines semaines.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n1. RÉFORME DE LA PROCÉDURE CIVILE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nLe décret n° 2026-187 du 15 mars 2026 portant modification des délais de mise en état en matière civile a été publié au Journal Officiel du 16 mars 2026. Les principales modifications sont les suivantes :\n\n• Réduction du délai de mise en état de 4 à 3 mois pour les affaires relevant du circuit court\n• Introduction d'une audience de programmation obligatoire dans les 6 semaines suivant l'assignation\n• Possibilité pour le juge de la mise en état de prononcer la clôture d'office en cas d'inactivité des parties pendant 3 mois\n• Obligation de déposer les conclusions récapitulatives au plus tard 15 jours avant l'audience de plaidoiries (au lieu de l'audience de clôture)\n\nCes nouvelles dispositions s'appliquent aux instances introduites à compter du 1er mai 2026. Pour les instances en cours, un régime transitoire est prévu à l'article 12 du décret. Nous vous recommandons vivement de consulter la circulaire d'application sur le site du ministère de la Justice.\n\nUne conférence d'information sera organisée le 10 avril à 18h00 en salle des conférences du Palais de Justice. Inscription sur le site de l'Ordre.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n2. OBLIGATIONS RGPD — RAPPEL URGENT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nRappel : conformément à la délibération CNIL n° 2025-312, les cabinets d'avocats doivent impérativement mettre à jour leur registre de traitement des données personnelles avant le 30 juin 2026. La CNIL a annoncé une campagne de contrôles ciblée sur les professions juridiques au second semestre 2026.\n\nLes points de vigilance :\n• Mise à jour de la politique de confidentialité du cabinet\n• Vérification des contrats de sous-traitance (hébergeurs cloud, logiciels de gestion)\n• Désignation d'un référent RGPD (obligatoire pour les cabinets de plus de 5 avocats)\n• Formation des collaborateurs au traitement des données sensibles des clients\n\nUn guide pratique « RGPD et cabinets d'avocats — édition 2026 » est téléchargeable gratuitement sur le site de l'Ordre, rubrique « Publications ».\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n3. FORMATIONS — INSCRIPTIONS OUVERTES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nLes inscriptions sont ouvertes pour les sessions de formation du 2e trimestre 2026 :\n\n• 6 mai — Droit du travail : les dernières évolutions jurisprudentielles (4h, Maître Caroline Levy)\n• 13 mai — Procédure prud'homale : les pièges à éviter en référé (4h, Maître Philippe Dumont)\n• 20 mai — Droit immobilier : garantie des vices cachés après la réforme (4h, Professeur Henri Mazeaud)\n• 27 mai — Médiation et modes alternatifs de règlement des différends (8h, Maître Sophie Renard)\n• 3 juin — Cybersécurité pour les cabinets d'avocats (4h, M. Alexandre Petit, expert ANSSI)\n\nRappel : chaque avocat doit valider 20 heures de formation continue par an. Consultez votre compteur sur formation.barreaudeparis.fr\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n4. VIE DE L'ORDRE — EN BREF\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n• Cotisation ordinale 2026 : date limite de paiement reportée au 30 avril 2026 (au lieu du 31 mars)\n• Bibliothèque du Palais : nouveaux horaires à compter du 1er avril (8h30–19h00 du lundi au vendredi)\n• Permanence déontologie : tous les mercredis de 14h00 à 17h00, sans rendez-vous\n• Prochaine assemblée générale de l'Ordre : 15 mai 2026 à 17h00\n\nNous restons à votre disposition pour toute question.\n\nConfraternellement,\nLe Bureau de l'Ordre des Avocats de Paris\n\n---\nVous recevez cet email car vous êtes inscrit(e) au Barreau de Paris.\nPour vous désabonner : parametres.ordre-avocats-paris.fr/newsletters",
    date: hoursAgo(5),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "newsletter",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Newsletter Ordre des Avocats <newsletter@ordre-avocats-paris.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e3",
    expediteur: "Cabinet Durand",
    email: "cabinet.durand@avocat.fr",
    objet: "Contestation mise en demeure",
    resume:
      "L'avocat de BTP Pro conteste la non-conformité des travaux invoquée par Mme Dupont. Il joint ses conclusions adverses avec une attestation du chef de chantier et sollicite un délai de 15 jours pour produire des pièces complémentaires.",
    corps_original:
      "Chère Consoeur,\n\nJ'ai l'honneur de vous écrire en ma qualité de conseil de la société BTP Pro (SARL au capital de 150 000 euros, RCS Paris B 823 456 789), représentée par son gérant M. Éric Bertrand, en réponse à votre mise en demeure du 2 mars 2026 reçue par LRAR le 5 mars 2026 (AR n° 1A 189 456 7823 5).\n\nÀ titre liminaire, je tiens à souligner que mon client a pris connaissance de votre courrier avec la plus grande attention et entend contester fermement et dans les termes les plus formels les allégations de non-conformité des travaux réalisés au domicile de votre cliente, Mme Marie Dupont, situé au 12 rue des Acacias, 75019 Paris.\n\nEn effet, et sans que cette liste soit exhaustive :\n\n1° Les travaux de ravalement ont été exécutés conformément au devis n° DEV-2025-0312 du 15 septembre 2025, accepté et signé sans réserve par Mme Dupont. L'ensemble des prestations décrites au devis — ravalement de façade, isolation thermique par l'extérieur et remplacement des gouttières — ont été réalisées dans les règles de l'art et selon les normes DTU en vigueur.\n\n2° Mon client verse aux débats une attestation de conformité établie par M. Laurent Petit, chef de chantier et titulaire du certificat Qualibat n° 2024-78456, en date du 15 janvier 2026 (pièce adverse n° 1, ci-jointe). Cette attestation certifie que l'ensemble des travaux a été exécuté conformément aux prescriptions du devis et aux normes applicables.\n\n3° Il convient de rappeler que Mme Dupont a signé le procès-verbal de réception des travaux le 20 janvier 2026 sans émettre la moindre réserve, ce qui constitue, conformément à une jurisprudence constante (Cass. 3e civ., 12 octobre 2017, n° 16-19.657), une acceptation tacite de la conformité des ouvrages.\n\n4° Les prétendues « fissures » invoquées par votre cliente sont en réalité des micro-fissures de retrait parfaitement normales dans les semaines suivant un ravalement, comme l'atteste tout professionnel du bâtiment. Elles ne constituent en aucun cas un désordre imputable à mon client.\n\nCeci étant précisé, et dans un souci de loyauté procédurale, nous sollicitons un délai supplémentaire de quinze (15) jours ouvrés à compter de la réception du présent courrier pour produire l'ensemble des pièces justificatives complémentaires, à savoir :\n- Le procès-verbal de réception des travaux signé par Mme Dupont le 20 janvier 2026\n- Le rapport du bureau de contrôle technique VERITAS (référence V-2026-01234)\n- Les fiches techniques des matériaux utilisés\n- Les photos de chantier prises lors de l'exécution des travaux\n\nMon client se réserve par ailleurs expressément le droit de poursuivre Mme Dupont en paiement de la facture n° FA-2025-0847 d'un montant de 3 200 euros TTC, demeurée impayée à ce jour malgré deux relances amiables.\n\nDans l'attente de votre retour sur le délai sollicité, et me tenant à votre entière disposition pour tout échange confraternel que vous jugeriez utile, je vous prie d'agréer, Chère Consoeur, l'expression de mes sentiments les plus confraternels.\n\nMe Henri Durand\nAvocat au Barreau de Paris\nCabinet Durand & Associés\n18 rue du Faubourg Saint-Honoré, 75008 Paris\nTél. : 01 42 56 78 90 — Fax : 01 42 56 78 91\nEmail : h.durand@cabinet-durand.fr\nToque : P0456",
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
    from_email: "Cabinet Durand <cabinet.durand@avocat.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: "secretariat@cabinet-durand.fr",
  },
  {
    id: "e4",
    expediteur: "Notification Tribunal",
    email: "notifications@justice.gouv.fr",
    objet: "Confirmation dépôt",
    resume:
      "Le greffe du Tribunal de commerce confirme la réception et l'enregistrement des conclusions déposées dans le cadre du dossier RG 26/01234. Aucune action requise.",
    corps_original:
      "TRIBUNAL DE COMMERCE DE PARIS\nGreffe — Service des mises en état\n1, quai de Corse, 75004 Paris\nTéléphone : 01 44 32 51 51\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nACCUSÉ DE RÉCEPTION — DÉPÔT ÉLECTRONIQUE\nRéférence interne : GR-2026-03-MEE-00847\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nMaître,\n\nNous avons l'honneur de vous informer que le greffe du Tribunal de commerce de Paris accuse réception de vos conclusions déposées par voie électronique via le Réseau Privé Virtuel des Avocats (RPVA), conformément aux dispositions de l'article 748-1 du Code de procédure civile et de l'arrêté du 7 avril 2009 relatif à la communication par voie électronique.\n\nRéférence du dossier : RG 26/01234\nParties : DUPONT Marie c/ SARL BTP PRO\nNature de l'acte : Conclusions en défense n° 1\nDate de dépôt : ce jour\nDate d'enregistrement : ce jour\nHeure d'enregistrement : 09h47\nNombre de pages : 18\nNombre de pièces jointes : 4 (bordereau de communication de pièces inclus)\nFormat : PDF/A conforme\n\nVos conclusions ont été enregistrées et versées au dossier de la procédure. Elles ont été mises à disposition de la partie adverse par voie dématérialisée conformément à l'article 815 du Code de procédure civile.\n\nNous vous rappelons que la prochaine audience de mise en état est fixée au 22 avril 2026 à 10h00, salle 4A, et que tout dépôt de pièces complémentaires devra intervenir au plus tard 15 jours avant cette date.\n\nLe présent accusé de réception vaut notification au sens de l'article 748-3 du Code de procédure civile.\n\nVeuillez agréer, Maître, l'expression de nos salutations distinguées.\n\nLe Greffier en chef\nMme Isabelle MOREAU\nTribunal de commerce de Paris\n\n---\nCe message est généré automatiquement par le système de gestion des procédures civiles.\nEn cas de difficulté technique, contactez le support RPVA au 01 44 32 52 00.\nRéf. horodatage : TC-PAR-2026-0327-094712-SHA256",
    date: hoursAgo(10),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "notification",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Notification Tribunal <notifications@justice.gouv.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e5",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Question entretien préalable",
    resume:
      "M. Martin s'interroge sur les points à aborder lors du 2e entretien préalable de rupture conventionnelle. Il souhaite savoir comment négocier l'indemnité supra-légale et si la clause de non-concurrence est négociable.",
    corps_original:
      "Cher Maître Fernandez,\n\nJ'espère que vous allez bien. Je me permets de vous écrire ce soir (excusez l'heure tardive, il est presque 23h mais je n'arrive pas à dormir tellement je cogite sur ce 2e entretien) parce que j'ai vraiment besoin de vos conseils avant la réunion avec TechCorp.\n\nComme vous le savez, le 2e entretien préalable approche à grands pas et je suis assez stressé, pour être honnête. Le premier s'est passé de manière assez froide — le DRH, M. Leblanc, était poli mais très distant, et j'ai eu l'impression qu'il récitait un script préparé par le service juridique. Ma femme me dit que je suis trop pessimiste, mais quand même, quand un DRH vous dit « la politique de l'entreprise est de s'en tenir à l'indemnité légale » avec un sourire figé, ça ne rassure pas.\n\nBref, j'ai énormément de questions et j'ai essayé de les organiser :\n\n1. L'indemnité supra-légale : comment je l'aborde concrètement ? Parce qu'au premier entretien, quand j'ai vaguement évoqué le sujet, Leblanc a fait comme s'il n'avait pas entendu. Est-ce que je dois avancer un chiffre précis ? Un collègue qui est parti l'an dernier m'a dit qu'il avait obtenu 4 mois de salaire en plus de l'indemnité légale, mais il avait 12 ans d'ancienneté. Avec mes 7 ans, qu'est-ce qui est raisonnable de demander ?\n\n2. La clause de non-concurrence : c'est vraiment ce qui m'inquiète le plus. J'ai un projet avec un ancien collègue pour monter une boîte dans le même secteur (cloud computing / DevOps), et si la clause s'applique pendant 12 mois, ça tue le projet dans l'oeuf. Est-ce qu'elle est négociable dans le cadre de la rupture conventionnelle ? Mon avenant de 2024 prévoit une contrepartie de 30% du salaire moyen, ce qui fait environ 1 260 euros par mois — c'est ridicule comparé à ce que je perds en ne pouvant pas travailler dans mon domaine.\n\n3. La question du préavis : dans une rupture conventionnelle, est-ce qu'il y a un préavis ? Si oui, puis-je demander une dispense ? J'ai des RTT en stock (17 jours) et je me demande comment ça se goupille.\n\n4. Les heures supplémentaires : j'ai fait le décompte (je vous enverrai le tableau Excel dans un prochain email), et j'arrive à environ 180 heures non payées sur les deux dernières années. Est-ce que je dois mettre ça sur la table tout de suite ou le garder comme une « carte en réserve » ?\n\n5. Et une question bête peut-être : est-ce que je dois prendre des notes pendant l'entretien ? Est-ce qu'il y aura un compte-rendu officiel ?\n\nPardon pour ce pavé, je sais que c'est beaucoup de questions d'un coup. Si vous préférez qu'on se voie en personne avant l'entretien, je peux me libérer n'importe quel jour cette semaine (sauf mercredi, j'ai les enfants). Mon numéro pour me joindre rapidement : 06 87 65 43 21.\n\nMerci encore pour votre accompagnement, ça me rassure énormément de savoir que je ne suis pas seul dans cette galère.\n\nBien cordialement,\nJean-Pierre Martin\n\nPS : au fait, j'ai croisé mon manager ce matin à la machine à café et il a été bizarrement sympa avec moi. Est-ce que ça veut dire quelque chose ou je suis juste parano ?",
    date: hoursAgo(14),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Monsieur Martin,\n\nVoici mes recommandations pour le 2e entretien :\n\n1. Indemnité supra-légale : ouvrez la discussion en rappelant vos 7 ans d'ancienneté et vos évaluations positives. Demandez au minimum 3 mois de salaire brut en sus de l'indemnité légale.\n\n2. Clause de non-concurrence : elle est parfaitement négociable. Demandez sa levée ou, à défaut, une contrepartie financière renforcée.\n\n3. Préavis : dans une rupture conventionnelle, il n'y a pas de préavis au sens strict, mais vous pouvez négocier la date de fin de contrat.\n\n4. Heures supplémentaires : gardez cet argument en réserve comme levier de négociation si besoin.\n\nJe vous propose un appel demain pour préparer en détail.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Jean-Pierre Martin <jp.martin@entreprise.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: "rh@techcorp.fr",
  },
  {
    id: "e6",
    expediteur: "RH TechCorp",
    email: "rh@techcorp.fr",
    objet: "Confirmation 2e entretien",
    resume:
      "Le service RH de TechCorp confirme le 2e entretien préalable pour la rupture conventionnelle de M. Martin. L'ordre du jour porte sur les conditions financières et la date de sortie envisagée.",
    corps_original:
      "Maître Fernandez,\n\nPar la présente, et conformément aux dispositions des articles L1237-12 et suivants du Code du travail, nous avons l'honneur de vous confirmer la tenue du deuxième entretien préalable dans le cadre de la procédure de rupture conventionnelle individuelle engagée à la demande de M. Jean-Pierre Martin, salarié de notre société en qualité de Chef de Projet Technique, matricule n° TEC-2019-0342.\n\nLes modalités de cet entretien sont les suivantes :\n\nDate : dans 3 jours\nHeure : 15h00 (durée prévisionnelle : 1h30)\nLieu : Salle de réunion B2 — 3e étage\nSiège social SAS TechCorp\n35, avenue de la Grande Armée\n75016 Paris\n(Métro ligne 1 — Argentine ou Charles de Gaulle-Étoile)\n\nOrdre du jour :\n1. Rappel des échanges du premier entretien du 14 mars 2026\n2. Discussion des conditions financières de la rupture conventionnelle\n3. Examen de l'indemnité spécifique de rupture conventionnelle\n4. Date de sortie envisagée et modalités pratiques\n5. Sort de la clause de non-concurrence (avenant du 1er janvier 2024)\n6. Questions diverses\n\nParticiperont à cet entretien côté employeur :\n- M. Stéphane Leblanc, Directeur des Ressources Humaines\n- Mme Sophie Garnier, Responsable RH\n- M. Yann Kergoat, Directeur Technique (supérieur hiérarchique de M. Martin)\n\nConformément à l'article L1237-12 du Code du travail, nous vous informons que M. Martin peut se faire assister, lors de cet entretien, par la personne de son choix appartenant au personnel de l'entreprise ou, en l'absence d'institution représentative du personnel dans l'entreprise, par un conseiller du salarié choisi sur une liste dressée par l'autorité administrative (liste consultable en mairie et auprès de la DREETS d'Île-de-France). Nous notons que M. Martin nous a informé qu'il serait accompagné de son conseil, Me Alexandra Fernandez, avocate au Barreau de Paris.\n\nNous vous prions de bien vouloir nous confirmer votre présence par retour de courrier électronique.\n\nNous vous prions d'agréer, Maître, l'expression de nos salutations distinguées.\n\nMme Sophie Garnier\nResponsable des Ressources Humaines\nSAS TechCorp — Au capital de 2 500 000 euros\nRCS Paris B 512 345 678\n35, avenue de la Grande Armée — 75016 Paris\nTél. : 01 56 78 90 00 — Fax : 01 56 78 90 01\nEmail : rh@techcorp.fr\n\nPièce jointe : ordre du jour détaillé (1 page)",
    date: hoursAgo(18),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "convocation",
    pieces_jointes: [],
    brouillon_mock:
      "Madame, Monsieur,\n\nJ'accuse réception de votre convocation au 2e entretien préalable.\n\nJe confirme que j'accompagnerai M. Martin en qualité de conseil lors de cet entretien, conformément aux dispositions de l'article L1237-12 du Code du travail.\n\nJe vous prie de bien vouloir prévoir un ordre du jour écrit détaillant les points à aborder, notamment les conditions financières envisagées.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "RH TechCorp <rh@techcorp.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: "jp.martin@entreprise.fr",
  },
  {
    id: "e7",
    expediteur: "Expert judiciaire Philippe Renard",
    email: "expert.bati@experts.fr",
    objet: "Complément rapport expertise",
    resume:
      "L'expert judiciaire transmet un complément à son rapport d'expertise sur le bien de la famille Roux. Il ajoute une analyse des fondations révélant un affaissement de 4 cm, aggravant le chiffrage initial des réparations.",
    corps_original:
      "Maître Fernandez,\n\nSuite à l'accédit complémentaire du 18 mars 2026 auquel vous avez assisté, je me permets de vous transmettre sans délai un addendum à mon rapport d'expertise n° EXP-2026-0478-R concernant le bien immobilier situé au 45, avenue des Lilas, 75019 Paris, propriété de M. et Mme Patrick ROUX.\n\nComme je l'ai brièvement évoqué lors de notre échange sur place, les investigations complémentaires réalisées à l'aide du géoradar (modèle GSSI StructureScan Mini XT) et des mesures par nivellement topographique ont mis en évidence un élément nouveau d'une gravité significative que je me dois de porter immédiatement à votre connaissance.\n\nI. CONSTATATIONS COMPLÉMENTAIRES\n\nLe relevé topographique de précision (tolérance +/- 0,5 mm) effectué par mon collaborateur M. Duval, géomètre expert DPLG, a révélé un affaissement différentiel de 4,2 cm (quarante-deux millimètres) affectant la fondation filante du mur porteur est du bâtiment, sur une longueur linéaire d'environ 6,80 mètres. Cet affaissement n'avait pas été détecté lors de l'expertise initiale car il était masqué par un ragréage de sol posé ultérieurement — vraisemblablement dans les mois précédant la vente, ce qui constitue, à mon sens, un indice supplémentaire de dissimulation volontaire.\n\nLes mesures au fissuromètre électronique confirment que les fissures F3 et F4 identifiées dans mon rapport initial (cf. rapport principal, pages 18-22, planches photographiques n° 12 à 17) sont directement corrélées à ce mouvement de fondation. L'orientation des fissures à 45° par rapport à l'horizontale est caractéristique d'un tassement différentiel.\n\nII. ANALYSE GÉOTECHNIQUE\n\nJ'ai fait procéder à deux sondages pressiométriques (profondeur 8 m) par le laboratoire FONDASOL (rapport n° FS-2026-1247, annexé au présent addendum). Les résultats montrent :\n- La présence d'un horizon argileux gonflant (argiles vertes de Sannoisian) entre 2,50 m et 4,80 m de profondeur\n- Un module pressiométrique Ep de 3,2 MPa seulement, traduisant une compressibilité élevée du sol\n- L'absence totale de drainage périphérique, contrairement à ce qu'exigeaient les règles de l'art pour ce type de terrain\n\nIII. INCIDENCE SUR LE CHIFFRAGE\n\nCompte tenu de ces constatations, le chiffrage des réparations doit être revu à la hausse comme suit :\n\n- Reprise en sous-oeuvre des fondations (micro-pieux) : 28 500 euros HT\n- Drainage périphérique complet : 6 800 euros HT\n- Injection de résine expansive : 4 200 euros HT\n- Réparation des fissures structurelles (rapport initial) : 32 000 euros HT\n- Reprise isolation + ravalement (rapport initial) : 21 000 euros HT\n\nTotal général révisé : 92 500 euros HT (soit 111 000 euros TTC)\nContre 78 000 euros HT initialement (soit +18,6%)\n\nLe détail quantitatif et estimatif figure en Annexe 3 bis du présent addendum.\n\nIV. RÉSERVES MÉTHODOLOGIQUES\n\nJe précise que les investigations réalisées ne portent que sur les parties accessibles du bâtiment. Des désordres supplémentaires pourraient être découverts lors des travaux de reprise, notamment au niveau du réseau d'assainissement enterré qui n'a pu faire l'objet que d'un contrôle visuel partiel par caméra d'inspection.\n\nJe me tiens naturellement à votre entière disposition pour toute question complémentaire ou pour un échange technique avec le conseil de la partie adverse s'il en manifestait le souhait.\n\nVeuillez agréer, Maître, l'expression de ma considération distinguée.\n\nM. Philippe Renard\nExpert judiciaire en bâtiment\nInscrit sur la liste des experts de la Cour d'appel de Paris\nRubrique C.02 — Bâtiment, travaux publics\nMembre de la Compagnie des Experts de Justice de Paris\n22, rue de Rivoli, 75004 Paris\nTél. : 01 48 87 65 43 — Port. : 06 23 45 67 89\nEmail : expert.bati@experts.fr\nN° SIRET : 456 789 012 00034",
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
    from_email: "Expert judiciaire Philippe Renard <expert.bati@experts.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: "greffe@tj-paris.fr",
  },
  {
    id: "e8",
    expediteur: "Pub LinkedIn",
    email: "noreply@linkedin.com",
    objet: "Nouvelles opportunités",
    resume:
      "Email promotionnel LinkedIn suggérant des profils de juristes et proposant un abonnement Premium pour développer son réseau professionnel. Aucun intérêt pour le cabinet.",
    corps_original:
      "Bonjour Alexandra,\n\nVotre réseau professionnel continue de croître et nous voulions partager avec vous les temps forts de votre activité LinkedIn cette semaine !\n\n📊 Votre tableau de bord hebdomadaire :\n\n• 12 juristes et professionnels du droit ont consulté votre profil cette semaine (+34% par rapport à la semaine dernière)\n• 3 avocats du Barreau de Paris souhaitent se connecter avec vous\n• 5 nouvelles opportunités correspondent à vos compétences en droit du travail et droit immobilier\n• Votre publication « Les 5 réflexes à avoir face à un vice caché » a été vue 847 fois\n• 2 recruteurs ont recherché votre profil (cabinets d'avocats, Paris)\n\n💎 Passez à LinkedIn Premium et débloquez tout le potentiel de votre réseau :\n\n✓ Voyez qui a consulté votre profil dans les 90 derniers jours\n✓ Envoyez des InMails à n'importe quel membre du réseau\n✓ Accédez à LinkedIn Learning (plus de 16 000 cours)\n✓ Obtenez des insights sur les candidats et recruteurs\n✓ Badge Premium sur votre profil\n\n🎁 Offre exclusive : essai GRATUIT pendant 30 jours, sans engagement.\nAnnulez à tout moment. Tarif après l'essai : 29,99 euros/mois.\n\n👉 Activez votre essai gratuit : linkedin.com/premium/trial?ref=weekly-digest\n\nÀ bientôt sur LinkedIn !\nL'équipe LinkedIn\n\n---\nLinkedIn Ireland Unlimited Company, Wilton Place, Dublin 2, Ireland\nVous recevez cet email car vous êtes membre de LinkedIn.\nPour gérer vos préférences de notification : linkedin.com/settings/notifications\nPour vous désabonner de cet email : linkedin.com/unsubscribe?ref=digest-weekly",
    date: hoursAgo(22),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "spam",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Pub LinkedIn <noreply@linkedin.com>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
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
      "Cher Maître,\n\nJe me permets de revenir vers vous comme nous en avions discuté lors de notre conversation téléphonique de vendredi dernier. Vous m'aviez demandé de prendre des photos complémentaires des dégâts sur la façade nord, et c'est chose faite — je vous les transmets en pièce jointe (j'ai mis les 12 photos dans un fichier ZIP pour que ce ne soit pas trop lourd, j'espère que vous arriverez à l'ouvrir, mon fils m'a aidée à faire la compression).\n\nAlors je ne suis pas experte en bâtiment, évidemment, mais même à l'oeil nu c'est flagrant : les fissures se sont nettement élargies depuis le constat du mois dernier. La plus grande, celle qui part de l'angle nord-est vers la fenêtre de la chambre d'amis, fait maintenant au moins 2 centimètres de large par endroits. On voit carrément le jour à travers quand on met une lampe torche derrière. C'est terrifiant.\n\nEt le pire, Maître, c'est l'infiltration d'eau. Depuis les grosses pluies de la semaine dernière (on a eu 3 jours de pluie non-stop, vous avez dû voir ça aussi à Paris), il y a maintenant une tache d'humidité parfaitement visible sur le mur intérieur du salon, côté nord. La tache fait environ 50 cm de diamètre et elle s'agrandit. J'ai mis une bassine dessous mais ce n'est pas une solution.\n\nMon voisin, M. Lefèvre — je crois que je vous en ai déjà parlé, il est architecte à la retraite — est venu voir samedi et il a fait une mine très grave. Il m'a dit texto : « Marie, ça peut compromettre la structure du bâtiment si ce n'est pas traité rapidement. » Il m'a même proposé de faire une attestation écrite si ça pouvait aider, ce qui est vraiment gentil de sa part.\n\nJ'ai aussi remarqué que le crépi posé par BTP Pro commence à se décoller par plaques entières sur toute la zone nord. Il y en avait un gros morceau par terre dans le jardin ce matin. Je l'ai gardé au cas où.\n\nDites-moi s'il vous plaît si ces photos seront utiles dans le cadre de la procédure. J'essaie de tout documenter comme vous me l'avez conseillé, mais j'avoue que c'est épuisant moralement de voir sa maison se dégrader comme ça sans pouvoir rien faire.\n\nEst-ce que vous pensez que je devrais aussi faire constater les dégâts par un huissier ? Ma soeur, qui a eu un problème similaire il y a quelques années (mais avec sa piscine, pas avec la façade), me dit que c'est indispensable.\n\nMerci infiniment pour votre aide et votre patience.\n\nBien cordialement,\nMarie Dupont\n06 78 90 12 34\n\nPS : j'allais oublier — j'ai horodaté toutes les photos avec la date et l'heure sur mon téléphone, comme vous me l'aviez suggéré.",
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
    from_email: "Marie Dupont <marie.dupont@gmail.com>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e10",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "Facture BTP Pro impayée",
    resume:
      "Mme Dupont signale avoir reçu une relance de BTP Pro pour le paiement de la facture de 3 200 euros qu'elle conteste. Elle demande si elle doit répondre directement ou si le cabinet s'en charge.",
    corps_original:
      "Cher Maître,\n\nJe suis vraiment paniquée et j'ai besoin de vos conseils de toute urgence. Je viens de recevoir ce matin dans ma boîte aux lettres une lettre recommandée de BTP Pro (je vous la scanne et vous la joins à cet email) et le ton est franchement menaçant.\n\nEn résumé, ils me réclament le paiement de la facture n° FA-2025-0847 d'un montant de 3 200 euros TTC et ils me donnent un délai de 8 jours pour payer, faute de quoi — je cite leur lettre — « nous nous verrons contraints de confier le recouvrement de cette créance à un huissier de justice, dont les frais seront intégralement à votre charge ». Ils ajoutent que « des intérêts de retard au taux légal majoré seront exigibles de plein droit ».\n\nFranchement, ça m'a fait un choc. J'en ai eu des palpitations toute la matinée. Ma mère qui était à la maison (elle vient garder les enfants le mercredi) m'a vue dans cet état et m'a dit de vous appeler tout de suite, mais je n'ai pas osé vous déranger par téléphone alors je vous écris.\n\nMes questions sont les suivantes :\n- Est-ce que je dois leur répondre directement à cette lettre ? Mon premier réflexe était de leur écrire pour leur dire ma façon de penser sur la qualité de leurs travaux, mais ma soeur m'a conseillé de ne rien faire sans votre avis.\n- Est-ce que c'est vous qui vous en chargez dans le cadre de la procédure en cours ? Je préférerais, honnêtement, parce que je ne me sens pas de taille à les affronter seule.\n- Est-ce qu'ils ont vraiment le droit d'envoyer un huissier ? Ça veut dire quoi concrètement ? Quelqu'un va venir chez moi ? Saisir mes meubles ? Je sais que je dramatise peut-être mais je ne dors plus.\n- Et surtout : est-ce que je DOIS payer cette facture en attendant que la procédure avance ? Parce que je n'ai aucune envie de payer 3 200 euros pour des travaux bâclés, mais en même temps je ne veux pas avoir d'ennuis.\n\nJ'ai aussi vérifié dans mes comptes : la lettre de relance mentionne une « première relance » datée du 15 février que je n'ai jamais reçue. Soit ils mentent, soit elle s'est perdue dans le courrier. En tout cas, moi, la première relance que j'ai eue, c'est celle d'aujourd'hui.\n\nPardon de vous bombarder de messages mais c'est vraiment une situation très angoissante pour moi. Mon mari (enfin, mon ex-mari) m'a dit que j'aurais dû « mieux choisir mon entrepreneur », ce qui n'aide pas vraiment...\n\nMerci de me répondre dès que possible, même juste un petit mot pour me dire quoi faire.\n\nAvec toute ma gratitude,\nMarie Dupont\n06 78 90 12 34",
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
    from_email: "Marie Dupont <marie.dupont@gmail.com>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e11",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "RE: Constat d'huissier",
    resume:
      "Mme Dupont confirme avoir contacté l'huissier recommandé. Le constat est programmé pour la semaine prochaine. Elle demande quels points l'huissier doit particulièrement documenter.",
    corps_original:
      "Cher Maître,\n\nBonne nouvelle (enfin, au milieu de tout ça, on prend ce qu'on peut !) : j'ai bien contacté l'huissier que vous m'avez recommandé, Me Leclerc. Il est très sympathique et professionnel, il m'a tout de suite mise en confiance au téléphone. Il m'a dit qu'il connaissait bien votre cabinet et qu'il avait déjà travaillé avec vous sur d'autres affaires.\n\nIl peut venir faire le constat la semaine prochaine, soit mardi matin à partir de 9h, soit mercredi après-midi vers 14h. Personnellement je préfère le mardi car mercredi j'ai normalement les enfants, mais je peux m'arranger si le mercredi convient mieux. Pourriez-vous lui envoyer vos instructions directement ? Il m'a dit qu'il était joignable au 01 43 56 78 90 ou par email à leclerc.huissier@justice.fr.\n\nJ'ai une question importante : y a-t-il des points précis que l'huissier doit documenter en priorité ? Je veux m'assurer que le constat sera le plus complet possible et qu'on n'oublie rien d'important. Mon voisin architecte (M. Lefèvre, celui dont je vous ai déjà parlé) m'a conseillé de faire mesurer les fissures avec un fissuromètre et de photographier aussi l'intérieur, pas seulement la façade. Est-ce que c'est quelque chose que l'huissier fait habituellement ?\n\nAutre sujet, et je ne sais pas si c'est lié ou pas : mon assurance habitation (MAIF, contrat n° 2345678A) m'a contactée hier. Apparemment, un de mes voisins a signalé des « désordres sur la façade » et l'assurance a ouvert un dossier de leur côté. L'agent m'a posé plein de questions sur les travaux de BTP Pro et m'a demandé si j'avais un « recours en cours ». Je n'ai pas su quoi répondre.\n\nDois-je les informer de la procédure en cours avec vous ? Est-ce que ça peut m'aider ou au contraire compliquer les choses ? Et est-ce que la garantie « dommages-ouvrage » peut jouer dans mon cas ? Je ne suis même pas sûre de l'avoir, pour être honnête.\n\nExcusez-moi encore pour toutes ces questions, je sais que je vous en pose beaucoup mais je préfère ne rien faire sans votre avis.\n\nMerci mille fois,\nMarie Dupont\n\nPS : Me Leclerc m'a dit que le constat coûterait environ 350 euros. Est-ce que c'est un tarif normal ? Et est-ce que BTP Pro devra rembourser ces frais si on gagne ?",
    date: daysAgo(4, 11),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dupont,\n\nParfait pour le rendez-vous avec Me Leclerc. Je lui enverrai mes instructions détaillées.\n\nL'huissier devra documenter en priorité : les fissures sur la façade nord avec mesures précises, les infiltrations d'eau avec photos, l'état de la toiture, et tout écart par rapport au devis initial signé.\n\nConcernant votre assurance habitation, oui, déclarez la situation à votre assureur. La garantie dommages-ouvrage pourrait être activable si elle existe.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Marie Dupont <marie.dupont@gmail.com>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e12",
    expediteur: "Cabinet Durand",
    email: "cabinet.durand@avocat.fr",
    objet: "RE: Délai pièces complémentaires",
    resume:
      "Me Durand remercie pour l'accord sur le délai de 15 jours et annonce la transmission prochaine du PV de réception des travaux et du rapport du bureau de contrôle technique.",
    corps_original:
      "Chère Consoeur,\n\nJ'accuse réception de votre courrier électronique du 20 mars 2026 par lequel vous consentez au délai supplémentaire de quinze jours sollicité par mon client pour la production de pièces complémentaires, et je vous en remercie.\n\nMon client, la SARL BTP Pro, s'engage formellement à vous transmettre l'ensemble des pièces justificatives avant l'expiration du délai convenu, soit au plus tard le 4 avril 2026. J'attire votre attention sur le fait que la constitution de ce dossier documentaire nécessite la sollicitation de tiers (bureau de contrôle, fournisseurs) dont les délais de réponse ne dépendent pas de la seule diligence de mon client.\n\nLes pièces suivantes vous seront communiquées par voie dématérialisée, accompagnées d'un bordereau de communication actualisé :\n\n1. Le procès-verbal de réception des travaux en date du 20 janvier 2026, dûment signé par Mme Dupont — et j'insiste sur ce point, Chère Consoeur, car il me semble qu'il s'agit d'un élément absolument déterminant pour l'appréciation du présent litige — sans la moindre réserve. Votre cliente a pris possession des ouvrages après visite contradictoire, en présence du chef de chantier M. Laurent Petit, et n'a formulé aucune observation ni restriction. La jurisprudence est constante sur ce point : l'absence de réserves à la réception emporte acceptation des ouvrages en l'état (Cass. 3e civ., 12 octobre 2017, n° 16-19.657 ; Cass. 3e civ., 24 janvier 2019, n° 17-28.454).\n\n2. Le rapport de vérification du bureau de contrôle technique VERITAS, référence V-2026-01234, portant sur la conformité des travaux aux normes DTU applicables.\n\n3. Les bons de livraison des matériaux utilisés pour le ravalement (bardage PVC, isolant thermique, gouttières), établissant la conformité des matériaux au devis signé par votre cliente.\n\n4. Le planning d'exécution des travaux et les comptes-rendus de chantier hebdomadaires.\n\nPar ailleurs, et au-delà de la question des réserves à la réception, je me permets d'ores et déjà de vous signaler que mon client entend faire valoir que les prétendues « fissures » dont se plaint votre cliente constituent des phénomènes de retrait parfaitement normaux et prévisibles dans les semaines suivant un ravalement, comme l'attestent les préconisations du DTU 42.1. Ces phénomènes sont sans lien avec la qualité d'exécution des travaux et ne sauraient engager la responsabilité de mon client.\n\nMon client se réserve, en tout état de cause, l'intégralité de ses moyens de défense, y compris la demande reconventionnelle en paiement de la facture n° FA-2025-0847 restée impayée.\n\nDans l'attente de nos échanges ultérieurs, et restant à votre disposition pour tout échange confraternel que vous jugeriez utile, je vous prie d'agréer, Chère Consoeur, l'expression de mes sentiments les plus confraternels.\n\nMe Henri Durand\nAvocat au Barreau de Paris\nCabinet Durand & Associés\nTél. : 01 42 56 78 90\nToque : P0456",
    date: daysAgo(5, 16),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Confrère,\n\nJ'accuse réception de votre courrier.\n\nS'agissant du procès-verbal de réception, je vous précise que ma cliente a signé ce document sous la pression du chef de chantier et sans avoir été informée de son droit d'émettre des réserves. Par ailleurs, les désordres constatés étaient pour la plupart non apparents à la date de la réception.\n\nJe réserve l'ensemble de mes moyens de défense dans l'attente de vos pièces.\n\nSentiments confraternels,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Cabinet Durand <cabinet.durand@avocat.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
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
      "Cher Maître,\n\nJ'espère que vous avez passé un bon week-end. De mon côté, pas tellement — j'ai passé mon samedi à éplucher les documents que TechCorp m'a envoyés vendredi soir (à 18h47, bien sûr, c'est toujours comme ça chez eux, ils envoient les trucs importants au dernier moment pour qu'on n'ait pas le temps de réfléchir).\n\nBref, je vous transmets en pièce jointe la simulation d'indemnités que le service RH m'a fait parvenir. Et autant vous le dire tout de suite : je suis tombé de ma chaise. Ils proposent uniquement l'indemnité légale de rupture conventionnelle, calculée selon l'article L1237-13 du Code du travail, soit un montant de... 8 400 euros brut. Huit mille quatre cents euros. Pour 7 ans de bons et loyaux services.\n\nJe ne sais pas si vous avez eu le temps de calculer ce que ça donne net, mais d'après mes recherches (j'ai passé une partie de mon dimanche sur des forums juridiques, je sais que vous allez me gronder), ça ferait à peine 7 000 euros net en poche. C'est même pas deux mois de salaire.\n\nQuand je pense à tout ce que j'ai donné à cette boîte — les nuits blanches avant les mises en production, les week-ends passés à résoudre des incidents critiques, les 180 heures supplémentaires dont on a déjà parlé, sans compter la promotion de 2024 qu'ils m'ont fait miroiter pendant 6 mois avant de « l'oublier »... franchement, 8 400 euros, c'est presque insultant.\n\nMon collègue Frédéric, qui est parti en rupture conventionnelle l'an dernier avec 12 ans d'ancienneté, m'a dit qu'il avait obtenu l'équivalent de 8 mois de salaire au total (légale + supra-légale). Sa femme est avocate en droit social (au cabinet Morin, je crois) et c'est elle qui a négocié. Alors évidemment il avait plus d'ancienneté que moi, mais quand même, ça donne une idée.\n\nEst-ce que vous pourriez analyser ce document en détail et me dire :\n1. Est-ce que le calcul de l'indemnité légale est au moins correct ?\n2. Quel montant de supra-légale vous pensez qu'on pourrait raisonnablement demander ?\n3. Est-ce que les jours de RTT restants (j'en ai 17) et mes congés payés (12 jours) sont pris en compte quelque part ?\n\nMerci beaucoup Maître, j'ai vraiment besoin de votre éclairage avant le 2e entretien.\n\nCordialement,\nJean-Pierre Martin\n06 87 65 43 21\n\nPS : ma femme me demande aussi si l'indemnité de rupture conventionnelle est imposable. Je lui ai dit que je vous demanderais.",
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
    from_email: "Jean-Pierre Martin <jp.martin@entreprise.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: "rh@techcorp.fr",
  },
  {
    id: "e14",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Mes évaluations annuelles",
    resume:
      "M. Martin transmet ses trois dernières évaluations annuelles chez TechCorp, toutes très positives. Il estime que ces documents renforcent sa position pour négocier une meilleure indemnité.",
    corps_original:
      "Cher Maître,\n\nComme vous me l'avez demandé lors de notre dernier échange, je vous transmets en pièce jointe mes trois dernières évaluations annuelles chez TechCorp (2023, 2024 et 2025). J'ai dû fouiller un peu dans mes emails pour retrouver celle de 2023, car TechCorp utilise un outil en ligne (Workday) et ils n'envoient pas systématiquement de PDF. Du coup j'ai fait des captures d'écran que j'ai compilées dans un seul document PDF — j'espère que c'est lisible.\n\nVous constaterez que j'ai toujours été noté au minimum « Dépasse les attentes » (note 4/5) et même « Exceptionnel » (5/5) en 2024 — oui, l'année même où ils m'ont refusé la promotion, c'est quand même un comble.\n\nPour vous donner un peu de contexte sur chaque année :\n\n• 2023 : note globale 4/5 « Dépasse les attentes ». Mon manager de l'époque, M. Renaud (qui a quitté l'entreprise depuis), a écrit dans ses commentaires que j'étais « un pilier de l'équipe technique » et « un collaborateur sur lequel on peut toujours compter en situation de crise ». Il avait même souligné ma gestion du projet de migration cloud qui avait économisé 40 000 euros de coûts d'infrastructure à l'entreprise.\n\n• 2024 : note globale 5/5 « Exceptionnel ». Mon nouveau manager, M. Kergoat (celui qui ne m'adresse quasiment plus la parole aujourd'hui, allez comprendre), m'a recommandé pour une promotion au grade de Senior Technical Lead. Il a écrit — je cite — « Jean-Pierre mérite pleinement cette promotion, sa contribution technique est exceptionnelle et il fait preuve de leadership naturel ». La promotion a été validée par M. Kergoat et transmise à la Direction Technique en juin 2024. Et puis... plus rien. Quand j'ai relancé en septembre, on m'a dit que « les budgets étaient gelés ». Quand j'ai relancé en décembre, on m'a dit que « ce serait réévalué au Q1 2025 ». En Q1 2025, c'est comme si le sujet n'avait jamais existé.\n\n• 2025 : note globale 4/5 « Dépasse les attentes ». Mais là, les commentaires sont beaucoup plus froids. M. Kergoat a écrit les compliments minimum requis par la politique RH. J'ai l'impression que quelqu'un lui a demandé de « refroidir » mon évaluation pour justifier le refus de promotion a posteriori, mais bon, c'est peut-être de la paranoïa de ma part.\n\nEn tout cas, je pense que ces documents montrent clairement deux choses : premièrement, ma valeur pour l'entreprise pendant 7 ans, et deuxièmement, le traitement injuste que j'ai subi avec cette promotion « oubliée ». Ça devrait peser dans la négociation de l'indemnité supra-légale, non ?\n\nDites-moi ce que vous en pensez.\n\nCordialement,\nJean-Pierre Martin",
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
    from_email: "Jean-Pierre Martin <jp.martin@entreprise.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e15",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Heures supplémentaires non payées",
    resume:
      "M. Martin mentionne avoir accumulé environ 180 heures supplémentaires non rémunérées sur les deux dernières années. Il demande si cela peut être utilisé comme levier dans la négociation.",
    corps_original:
      "Cher Maître,\n\nSuite à votre suggestion lors de notre dernier rendez-vous, j'ai passé mon week-end (encore un, ma femme commence à trouver que cette rupture conventionnelle lui prend son mari le samedi...) à reconstituer le décompte de mes heures supplémentaires non rémunérées sur les deux dernières années.\n\nAlors, la méthodologie : TechCorp utilise un système de badgeuse électronique (Kelio) mais paradoxalement, le système n'est pas configuré pour comptabiliser les heures sup'. Il enregistre les heures d'entrée et de sortie, mais le module de calcul des dépassements est désactivé. C'est bien pratique pour eux. Heureusement, j'ai accès à mon historique de badgeage sur le portail RH, et j'ai tout exporté en Excel.\n\nD'après mes pointages, j'estime le total à environ 180 heures non payées sur la période mars 2024 à mars 2026 :\n\n- Mars à juin 2024 : environ 35 heures (projet de migration cloud, on restait tous les soirs jusqu'à 20h-20h30 pendant 3 mois)\n- Septembre à décembre 2024 : environ 55 heures (lancement de la plateforme DevOps v2, la « dead march » comme on l'appelait entre nous — il y a eu un week-end où j'ai travaillé 14 heures d'affilée le samedi pour une mise en production urgente)\n- Janvier à juin 2025 : environ 45 heures (astreintes non rémunérées, interventions le dimanche pour des incidents en production)\n- Septembre 2025 à mars 2026 : environ 45 heures (heures de soirée, réunions US programmées à 19h à cause du décalage horaire avec l'équipe de San Francisco)\n\nMon contrat prévoit 35 heures par semaine, point. Pas de forfait jours, pas de convention de forfait heures, rien. Je suis censé être aux 35h, mais dans les faits je faisais régulièrement 40 à 45 heures par semaine, voire plus en période de rush. Aucune de ces heures n'a été comptabilisée, ni rémunérée, ni récupérée en repos compensateur.\n\nJ'ai aussi retrouvé pas mal d'emails professionnels envoyés après 20h ou le week-end, qui prouvent que je travaillais bien en dehors des horaires normaux. Je peux vous transmettre les plus significatifs si vous pensez que c'est utile comme preuve.\n\nMa question : est-ce que je dois mettre tout ça sur la table directement lors du 2e entretien, ou est-ce que c'est plus malin de le garder en réserve comme un argument de négociation, genre « si vous ne faites pas un effort sur la supra-légale, je fais une demande séparée aux prud'hommes pour les heures sup' » ? Mon collègue Frédéric (encore lui, désolé) me dit que c'est ce que sa femme avocate avait fait et que ça avait fait « sauter le verrou » de la DRH. Qu'en pensez-vous ?\n\nJe vous prépare le tableau Excel détaillé pour notre prochain rendez-vous.\n\nMerci encore pour tout,\nJean-Pierre Martin\n06 87 65 43 21",
    date: daysAgo(5, 8),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Monsieur Martin,\n\nLes heures supplémentaires non rémunérées constituent un excellent levier de négociation. Sur la base de 180 heures avec les majorations légales, cela représente un montant d'environ 5 400 euros.\n\nJe vous recommande de ne pas en faire une demande séparée mais de l'utiliser comme argument pour obtenir une indemnité supra-légale plus élevée. Cela évitera un contentieux prud'homal distinct.\n\nConservez précieusement tous vos relevés de pointage et emails envoyés en dehors des horaires.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Jean-Pierre Martin <jp.martin@entreprise.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e16",
    expediteur: "RH TechCorp",
    email: "rh@techcorp.fr",
    objet: "Documents à préparer pour le 2e entretien",
    resume:
      "Le service RH de TechCorp demande à M. Martin de préparer une liste de documents pour le 2e entretien : derniers bulletins de paie, solde de congés et certificat médical si arrêt en cours.",
    corps_original:
      "Monsieur Martin,\n\nDans le cadre de la poursuite de la procédure de rupture conventionnelle individuelle vous concernant, et en application des dispositions des articles L1237-11 à L1237-16 du Code du travail, nous vous prions de bien vouloir prendre note des éléments suivants relatifs au deuxième entretien préalable.\n\nAfin de faciliter le traitement administratif de votre dossier et de permettre le calcul définitif de l'ensemble de vos indemnités de fin de contrat, nous vous saurions gré de bien vouloir préparer et apporter lors de l'entretien les documents suivants :\n\n1. Vos trois (3) derniers bulletins de salaire (janvier, février et mars 2026), en original et en copie\n2. Le relevé actualisé de votre solde de congés payés (disponible sur le portail RH Workday, rubrique « Mon solde CP/RTT »)\n3. Un certificat médical de votre médecin traitant si vous êtes actuellement en arrêt de travail ou si un arrêt est en cours de prescription\n4. Votre relevé d'identité bancaire (RIB) à jour, au format SEPA (IBAN/BIC), pour le versement des indemnités\n5. Une copie de votre pièce d'identité en cours de validité\n\nNous vous informons également que le service paie a procédé au calcul prévisionnel suivant, sous réserve de modifications :\n- Indemnité spécifique de rupture conventionnelle (art. L1237-13) : 8 400 euros brut\n- Indemnité compensatrice de congés payés : à calculer selon le solde au jour de la rupture\n- Indemnité compensatrice de RTT : à calculer selon le solde\n\nLe solde de tout compte définitif vous sera remis le dernier jour de travail effectif, accompagné du certificat de travail et de l'attestation Pôle Emploi (France Travail).\n\nPour toute question relative à la préparation de ces documents, vous pouvez contacter Mme Laure Berthier, gestionnaire paie, au poste 4567 ou par email à l.berthier@techcorp.fr.\n\nNous vous rappelons que vous pouvez vous faire assister lors de cet entretien par un salarié de l'entreprise ou par un conseiller du salarié, conformément à l'article L1237-12 du Code du travail.\n\nCordialement,\n\nMme Sophie Garnier\nResponsable des Ressources Humaines\nSAS TechCorp\n35, avenue de la Grande Armée — 75016 Paris\nTél. direct : 01 56 78 90 12\nEmail : s.garnier@techcorp.fr\n\nCe courriel et ses pièces jointes sont confidentiels et destinés exclusivement à leurs destinataires. Si vous n'êtes pas le destinataire visé, merci de nous en informer et de détruire ce message.",
    date: daysAgo(3, 9),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Madame Garnier,\n\nJ'accuse réception de votre demande au nom de M. Martin.\n\nLes documents sollicités seront préparés et disponibles pour le 2e entretien. Toutefois, je note que le certificat médical n'est requis que si M. Martin est en arrêt, ce qui n'est pas le cas à ce jour.\n\nJe me permets de rappeler que la rupture conventionnelle doit faire l'objet d'un accord libre et éclairé des deux parties.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "RH TechCorp <rh@techcorp.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
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
      "Cher Maître Fernandez,\n\nNous avons bien reçu le rapport d'expertise de M. Renard et nous l'avons lu attentivement avec mon épouse Sophie — enfin, « attentivement » est un grand mot parce que c'est quand même très technique et il y a des passages qu'on n'a pas vraiment compris (toute la partie sur les « modules pressiométriques » et les « DTU », par exemple). Mais les conclusions, elles, sont malheureusement très claires : la maison a de gros problèmes et les réparations vont coûter une fortune.\n\nOn en a discuté longuement hier soir après avoir couché les enfants (notre fille de 8 ans commence d'ailleurs à poser des questions sur « pourquoi il y a des fissures dans le mur de sa chambre », ce qui est assez déchirant) et on a une longue liste de questions. Je m'excuse d'avance si certaines sont naïves, mais on n'a jamais eu affaire à la justice et tout ça nous dépasse un peu.\n\nVoici nos interrogations :\n\n1. Le vendeur, M. Gauthier, peut-il prétendre qu'il n'était pas au courant des fissures et des problèmes d'isolation ? Parce que notre voisine, Mme Lelong (qui habitait déjà dans la rue quand M. Gauthier était là), nous a dit qu'il avait fait refaire les enduits intérieurs juste avant de mettre en vente — ce qui laisse penser qu'il a voulu cacher les fissures. Sophie est furieuse, elle dit que c'est de l'escroquerie pure et simple.\n\n2. Quelle est la durée de la garantie des vices cachés exactement ? On a acheté en juin 2025, donc ça fait 9 mois. Un ami de Sophie qui est agent immobilier nous a dit qu'on avait « 2 ans à partir de la découverte du vice », mais il n'était pas sûr. Sommes-nous encore dans les délais pour agir ?\n\n3. Le rapport parle de 78 000 euros HT de réparations (et maintenant 92 500 avec le complément sur les fondations). C'est énorme. Mais est-ce que ce montant couvre uniquement les réparations matérielles, ou aussi le préjudice de jouissance ? Parce que depuis qu'on a emménagé, on vit quand même dans une maison avec des infiltrations d'eau, des fissures partout, un sous-sol inutilisable et une isolation qui ne sert à rien. L'hiver a été terrible — la facture de chauffage de janvier a été de 380 euros pour 120 m², c'est délirant.\n\n4. Est-ce qu'on peut carrément demander l'annulation de la vente plutôt qu'une réparation ? Franchement, à ce stade, si c'était possible, on préférerait récupérer notre argent et partir. On a payé 485 000 euros pour cette maison et avec 92 500 euros de réparations à faire, plus le stress, plus les factures de chauffage... on n'en peut plus.\n\n5. Et M. Gauthier qui est parti au Portugal — est-ce qu'on peut quand même le poursuivre ? Il ne va pas échapper à la justice parce qu'il est à l'étranger quand même ?\n\nOn est vraiment très inquiets, Maître. Sophie dort très mal et moi j'ai du mal à me concentrer au travail. C'est notre premier achat immobilier et on a l'impression de s'être fait avoir comme des débutants.\n\nOn vous fait entièrement confiance et on attend vos conseils avec impatience.\n\nBien cordialement,\nPatrick et Sophie Roux\n06 45 67 89 01 (Patrick)\n06 78 12 34 56 (Sophie)\n\nPS : Sophie me demande aussi si on peut demander des dommages et intérêts pour le préjudice moral. Elle dit qu'elle a développé des insomnies depuis qu'on a découvert les problèmes et que son médecin lui a prescrit des anxiolytiques.",
    date: daysAgo(3, 15),
    dossier_id: "4",
    dossier_nom: "Famille Roux",
    dossier_domaine: "Immobilier",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chers Monsieur et Madame Roux,\n\nVoici mes réponses à vos questions :\n\n1. Le vendeur pourra difficilement prétendre ignorer les fissures. L'expert a relevé des indices de travaux de dissimulation (enduit récent sur les fissures), ce qui suggère une connaissance des désordres.\n\n2. L'action en garantie des vices cachés doit être intentée dans les 2 ans suivant la découverte du vice. Nous sommes dans les délais.\n\n3. Les 78 000 euros couvrent les seules réparations. Nous demanderons en sus le préjudice de jouissance et les troubles liés aux travaux.\n\n4. L'annulation de la vente (action rédhibitoire) est possible, mais la réduction du prix avec indemnisation est généralement plus avantageuse.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Famille Roux <p.roux@wanadoo.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: "notaire@me-blanchard.fr",
  },
  {
    id: "e18",
    expediteur: "Notaire Me Blanchard",
    email: "blanchard@notaires-paris.fr",
    objet: "Acte de vente Roux - copie authentique",
    resume:
      "Le notaire transmet la copie authentique de l'acte de vente du bien acquis par la famille Roux. Le document mentionne une clause d'exclusion de garantie des vices cachés que le cabinet devra analyser.",
    corps_original:
      "Maître Fernandez,\n\nEn réponse à votre courrier du 10 mars 2026, et après vérification dans nos archives, j'ai l'honneur de vous transmettre ci-joint la copie authentique de l'acte de vente reçu en mon étude le 15 juin 2025, portant mutation de l'immeuble à usage d'habitation situé 45, avenue des Lilas, 75019 Paris (cadastré section AH n° 147, parcelle de 310 m², surface habitable de 120 m²), consenti par M. Jean-Claude GAUTHIER, né le 12 avril 1958 à Lyon (Rhône), demeurant alors au 45, avenue des Lilas, 75019 Paris, au profit de M. Patrick ROUX et Mme Sophie ROUX née MERCIER, demeurant 8, rue des Peupliers, 92100 Boulogne-Billancourt, moyennant le prix principal de quatre cent quatre-vingt-cinq mille euros (485 000 euros), frais d'acte en sus.\n\nL'acte a été publié au Service de la Publicité Foncière de Paris 19e le 23 juin 2025 sous la référence 2025 P 04512.\n\nJe me permets d'attirer tout particulièrement votre attention sur les dispositions suivantes de l'acte :\n\n• Article 8 — Clause d'exclusion de garantie des vices cachés : l'acquéreur prend le bien dans l'état où il se trouve au jour de l'entrée en jouissance, sans garantie de la part du vendeur pour raison de vices ou défauts cachés, de quelque nature qu'ils soient, le vendeur déclarant n'avoir connaissance d'aucun vice ou défaut caché affectant le bien vendu. Cette clause est standard dans les ventes entre particuliers, mais vous n'êtes pas sans savoir qu'elle est inapplicable en cas de mauvaise foi du vendeur, conformément à la jurisprudence constante de la Cour de cassation (cf. notamment Cass. 3e civ., 27 septembre 2006, n° 05-16.980).\n\n• Article 12 — État des diagnostics : l'acte fait référence au dossier de diagnostics techniques annexé, et notamment au Diagnostic de Performance Énergétique (DPE) établi par la société DiagImmo Île-de-France (n° ADEME 2025-IDF-45678) mentionnant une note C. À la lumière des informations que vous m'avez communiquées concernant les défauts d'isolation constatés par l'expert judiciaire, je note que la responsabilité du diagnostiqueur pourrait être engagée concurremment à celle du vendeur.\n\n• Article 15 — Déclarations du vendeur : M. Gauthier a déclaré ne pas avoir connaissance de sinistres affectant l'immeuble, ce qui, au regard du rapport d'expertise judiciaire, paraît pour le moins contestable.\n\nJe tiens à préciser, par souci de transparence, que notre étude a rédigé l'acte dans les conditions habituelles et que le vendeur comme les acquéreurs ont bénéficié des explications d'usage. L'ensemble des diagnostics étaient formellement conformes à la date de la vente.\n\nJe reste bien entendu à votre entière disposition pour tout renseignement complémentaire que vous jugeriez utile, et notamment pour une consultation de mon dossier sur rendez-vous.\n\nJe vous prie d'agréer, Maître, l'expression de mes sentiments distingués.\n\nMe Antoine Blanchard\nNotaire associé\nÉtude Blanchard & Moreau\nNotaires à Paris\n12, rue Saint-Honoré, 75001 Paris\nTél. : 01 42 60 34 56 — Fax : 01 42 60 34 57\nEmail : blanchard@notaires-paris.fr\nOffice créé en 1923",
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
    from_email: "Notaire Me Blanchard <blanchard@notaires-paris.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e19",
    expediteur: "Famille Roux",
    email: "p.roux@wanadoo.fr",
    objet: "Problème d'humidité aggravé",
    resume:
      "M. Roux signale une aggravation des infiltrations d'eau dans le sous-sol. L'humidité a endommagé des meubles et des cartons de documents personnels. Il demande s'il peut entreprendre des travaux d'urgence.",
    corps_original:
      "Cher Maître,\n\nJe vous écris en urgence, pardonnez le côté un peu décousu de ce message mais je suis en train de passer la serpillière au sous-sol pour la troisième fois de la journée et je tape sur mon téléphone entre deux seaux d'eau.\n\nLa situation s'est encore sérieusement dégradée depuis les pluies torrentielles de ces trois derniers jours. L'infiltration dans le sous-sol, qui était jusqu'ici limitée à un suintement le long du mur est (celui que l'expert avait identifié dans son rapport), s'est transformée en véritable entrée d'eau. Il y a maintenant une flaque permanente d'environ 2 m² au pied du mur, avec une épaisseur de 2 à 3 centimètres d'eau stagnante.\n\nLe pire, c'est les dégâts collatéraux. On avait des meubles stockés au sous-sol — une commode ancienne qui appartenait à la mère de Sophie et qui a une grande valeur sentimentale pour elle — et elle est fichue, le bois a gonflé et les tiroirs ne s'ouvrent plus. Il y avait aussi 4 ou 5 cartons de documents personnels : les albums photos de mariage, les dessins d'enfants de notre fille, des papiers administratifs importants (déclarations d'impôts, quittances...). Tout est trempé. Sophie a pleuré en voyant les photos de mariage gondolées par l'eau. C'est affreux.\n\nJ'ai aussi une étagère IKEA qui s'est littéralement effondrée sous l'effet de l'humidité — les panneaux de particules n'ont pas résisté. Heureusement il n'y avait personne à côté quand c'est tombé.\n\nMes questions urgentes :\n\n1. Est-ce que je peux faire intervenir un plombier (ou un spécialiste de l'étanchéité) en urgence pour limiter les dégâts ? Mon voisin M. Lefranc me recommande l'entreprise HydroStop (01 48 56 78 90), qui fait des interventions d'urgence pour les infiltrations. Mais ça risque de coûter cher.\n\n2. Est-ce que ces frais d'intervention urgente seront remboursables dans le cadre de la procédure contre Gauthier ? Parce que financièrement, entre le crédit immobilier (1 850 euros/mois), les factures de chauffage exorbitantes et vos honoraires (que je ne conteste absolument pas, je vous rassure, c'est juste que tout s'accumule), on commence à être vraiment serrés.\n\n3. Faut-il que je fasse constater l'état actuel par un huissier avant de faire intervenir quelqu'un ? Je ne voudrais pas qu'on me reproche d'avoir « détruit des preuves » en nettoyant.\n\n4. Est-ce qu'il faut que je déclare un sinistre à mon assurance habitation ? Sophie pense que oui, mais j'ai peur que ça complique les choses avec la procédure en cours.\n\nMerci de me répondre dès que possible, même par un SMS rapide si c'est plus simple pour vous. On est un peu au désespoir là.\n\nPatrick Roux\n06 45 67 89 01\n\nPS : j'ai pris des photos et une vidéo de l'état du sous-sol, je vous les enverrai dès que j'aurai accès à mon ordinateur (pour l'instant il est au premier étage et je n'ose pas quitter le sous-sol de peur que ça empire).",
    date: daysAgo(6, 8),
    dossier_id: "4",
    dossier_nom: "Famille Roux",
    dossier_domaine: "Immobilier",
    category: "client",
    email_type: "relance",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Monsieur Roux,\n\nOui, vous pouvez et devez faire intervenir un plombier en urgence pour limiter les dégâts. C'est une obligation de mitigation du préjudice.\n\nConservez impérativement toutes les factures d'intervention. Ces frais seront inclus dans notre demande d'indemnisation.\n\nJe vous recommande également de photographier l'état actuel du sous-sol avant toute intervention et de faire constater les dégâts par l'huissier si possible.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Famille Roux <p.roux@wanadoo.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
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
      "Cher Maître Fernandez,\n\nComme promis lors de notre dernier entretien à votre cabinet (merci encore pour le café, d'ailleurs), je vous transmets en pièce jointe les relevés de charges de copropriété pour les exercices 2024 et 2025. J'aurais pu vous les envoyer plus tôt mais j'ai dû batailler avec le syndic pendant deux semaines pour obtenir les documents — ils ont fait « un problème informatique » comme excuse, classique.\n\nJ'ai pris le temps de faire quelques calculs sur un tableur (je suis comptable de formation, ça aide un peu dans ce genre de situations) et voici ce que ça donne :\n\n- Charges 2023 : 3 200 euros/an (soit environ 267 euros/mois) — c'était déjà un peu élevé pour une résidence de cette taille, mais passons\n- Charges 2024 : 3 850 euros/an (soit 321 euros/mois) → augmentation de 20% par rapport à 2023\n- Charges 2025 : 4 700 euros/an (soit 392 euros/mois) → augmentation de 47% en deux ans !\n\nQuand je compare avec la copropriété de ma soeur à Vincennes (résidence de taille comparable, 35 lots), elle paie 2 100 euros/an. Même en tenant compte des différences de localisation et de prestations, le compte n'y est pas.\n\nCe qui m'énerve le plus, c'est que le syndic Les Tilleuls n'a jamais — et je dis bien jamais — justifié ces augmentations lors des assemblées générales. J'y assiste chaque année, et chaque année c'est le même cirque : le président de séance (qui est un ami personnel du gérant du syndic, M. Vidal, soit dit en passant) fait voter les résolutions à toute vitesse sans laisser le temps aux copropriétaires de poser des questions. La dernière AG a duré 45 minutes pour 12 résolutions. C'est scandaleux.\n\nConcrètement, quand j'ai demandé le détail du poste « entretien et maintenance » qui est passé de 1 200 à 2 400 euros en un an, M. Vidal m'a répondu devant tout le monde que « les coûts augmentent, c'est l'inflation, Madame ». L'inflation à 100%, bien sûr. J'ai les PV d'AG qui le montrent, les résolutions ont été votées sans que le détail des postes soit présenté comme l'exige la loi.\n\nJ'ai identifié au moins trois postes suspects :\n1. « Entretien espaces verts » : 8 000 euros/an pour une cour avec un carré de pelouse de 20 m² et deux bacs à fleurs. C'est délirant.\n2. « Honoraires du syndic » : augmentation de 35% en un an, sans renégociation du mandat\n3. « Nettoyage parties communes » : la société de nettoyage (qui appartient à la belle-soeur de M. Vidal, d'après ma voisine Mme Petit) vient deux fois par semaine au lieu des quatre fois prévues au contrat. J'ai tenu un journal de ses passages pendant 3 mois.\n\nJ'espère que tous ces éléments vous seront utiles pour l'audience. C'est une situation qui dure depuis trop longtemps et il faut que ça cesse.\n\nN'hésitez pas si vous avez besoin de documents supplémentaires, j'ai tout classé méthodiquement.\n\nCordialement,\nClaire Dubois\n06 23 45 67 89\n\nPS : j'ai appris par ma voisine que le syndic Les Tilleuls avait aussi des problèmes avec d'autres copropriétés qu'il gère. Si ça peut aider à montrer un « schéma » de comportement...",
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
    from_email: "Claire Dubois <claire.dubois@orange.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e21",
    expediteur: "Claire Dubois",
    email: "claire.dubois@orange.fr",
    objet: "Question sur l'audience du 15 avril",
    resume:
      "Mme Dubois s'inquiète de l'audience du 15 avril et demande si sa présence est obligatoire. Elle souhaite savoir quels documents supplémentaires elle doit rassembler.",
    corps_original:
      "Cher Maître Fernandez,\n\nJ'ai bien reçu la convocation pour l'audience du 15 avril au Tribunal de Grande Instance de Paris (salle 3B, 2e chambre civile, 14h00 — j'ai noté tous les détails dans mon agenda, mon téléphone et un post-it sur le frigo, on n'est jamais trop prudent).\n\nJe ne vous cache pas que je suis assez stressée, voire franchement angoissée à l'idée de passer devant le tribunal. Je n'ai jamais mis les pieds dans un tribunal de ma vie et je m'imagine déjà debout à la barre, interrogée par un juge sévère comme dans les séries télé. Ma collègue au bureau, Nathalie, qui a eu un divorce compliqué, m'a raconté son audience et ça ne m'a pas rassurée du tout (même si elle m'a dit que son affaire n'avait rien à voir avec la mienne).\n\nJ'aurais plusieurs questions, en vrac, excusez-moi pour le désordre :\n\n1. Est-ce que ma présence est obligatoire le jour de l'audience ? Parce que si c'est le cas, il faut que je pose un jour de congé au bureau et mon chef n'est pas toujours très compréhensif (je suis comptable dans un cabinet de conseil, et avril c'est la période fiscale, le pire moment pour s'absenter).\n\n2. Si je viens, est-ce qu'on va me poser des questions ? Est-ce que je dois préparer quelque chose ? Est-ce que le syndic sera là en face de moi ? Honnêtement, je ne me sens pas capable de faire face à M. Vidal (le gérant du syndic), il est très intimidant et il a un avocat qui a l'air très agressif (d'après ce que m'a dit ma voisine Mme Petit qui l'a croisé une fois).\n\n3. Quels documents complémentaires dois-je encore vous fournir ? J'ai déjà transmis les relevés de charges, le PV d'AG, les trois courriers recommandés... il me manque quelque chose ?\n\n4. La SCI Les Tilleuls a-t-elle déjà déposé ses conclusions ? Et si oui, est-ce que je peux les voir ? J'aimerais savoir ce qu'ils racontent comme excuses cette fois.\n\n5. Question pratique : le tribunal, c'est au Palais de Justice sur l'île de la Cité ? J'y suis jamais allée. Il y a un parking à proximité ou c'est mieux de venir en métro ?\n\nJe suis disponible pour un rendez-vous à votre cabinet si vous jugez nécessaire de faire un point avant l'audience. Je peux me libérer n'importe quel soir après 18h30 (le temps de quitter le bureau) ou le samedi matin si vous travaillez le week-end.\n\nMerci infiniment pour votre soutien, Maître. Cette histoire de charges me pourrit la vie depuis deux ans et j'ai vraiment hâte que ça se termine, même si je suis morte de peur à l'idée du tribunal.\n\nBien cordialement,\nClaire Dubois\n06 23 45 67 89\n\nPS : ma mère me demande si « on risque de perdre » et si dans ce cas je devrai payer les frais d'avocat du syndic. Je lui ai dit que vous m'aviez rassurée sur nos chances, mais pourriez-vous me confirmer ?",
    date: daysAgo(5, 11),
    dossier_id: "5",
    dossier_nom: "Claire Dubois",
    dossier_domaine: "Litige immobilier",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dubois,\n\nJe comprends votre inquiétude et vous rassure : votre présence à l'audience du 15 avril n'est pas obligatoire. C'est une audience de mise en état au cours de laquelle je plaiderai en votre nom.\n\nLa SCI Les Tilleuls n'a pas encore déposé ses conclusions. Le délai court jusqu'au 10 avril.\n\nJe vous propose un point téléphonique la semaine prochaine pour faire le bilan.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Claire Dubois <claire.dubois@orange.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
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
      "Cher Maître Fernandez,\n\nTout d'abord, merci encore pour notre entretien de la semaine dernière. Ça m'a fait du bien de pouvoir parler de cette situation avec quelqu'un de bienveillant et de professionnel. C'est bizarre à dire mais ça m'a un peu soulagée — comme si mettre les mots sur cette décision de divorce la rendait moins effrayante.\n\nBref, je ne vais pas m'étendre sur le plan émotionnel (c'est le rôle de ma psy, pas le vôtre !), passons aux choses pratiques.\n\nJ'ai rassemblé tous les documents que vous m'avez demandés. Ça m'a pris un peu de temps parce que je suis assez désorganisée (Thomas — mon mari — me le reproche d'ailleurs régulièrement, c'est peut-être une des raisons du divorce, allez savoir...). Mais voilà, c'est fait :\n\n✓ Livret de famille (l'original — j'espère que vous n'en avez besoin que temporairement parce que j'en ai besoin pour inscrire Hugo à la cantine de la maternelle en septembre)\n✓ Copie intégrale de l'acte de mariage — demandée à la mairie du 11e il y a 15 jours, reçue hier seulement. La mairie est d'une lenteur... J'avais fait la demande en ligne sur service-public.fr comme vous me l'aviez indiqué.\n✓ Titre de propriété de l'appartement du 28 rue Oberkampf, Paris 11e (l'original est chez le notaire, je vous envoie la copie)\n✓ 3 derniers avis d'imposition (2023, 2024, 2025) — déclaration commune avec Thomas, évidemment\n✓ Relevé de patrimoine immobilier et financier — j'ai fait un tableau récapitulatif de mémoire, dites-moi si c'est suffisant ou s'il faut des justificatifs bancaires en plus\n\nPar contre, je n'ai pas trouvé notre contrat de mariage — ce qui est normal puisqu'on n'en a pas. On s'est mariés sous le régime légal (communauté réduite aux acquêts) sans passer chez le notaire. C'est ce que ma mère nous avait conseillé à l'époque, « pas besoin de contrat quand on s'aime »... bon.\n\nSur un autre sujet : Thomas et moi avons eu une longue discussion ce week-end (de manière très civilisée, devant un café, les enfants étaient chez mes parents). Il est d'accord pour que nous nous partagions les frais d'avocat à parts égales, ce qui simplifie les choses. Il a aussi trouvé un avocat de son côté, Me Catherine Leroy du cabinet Leroy-Vannier (je crois qu'elle est spécialisée en droit de la famille aussi). Est-ce que vous la connaissez ? Est-ce que ça vous pose un problème ?\n\nPourriez-vous m'indiquer le montant de vos honoraires pour un divorce par consentement mutuel ? Thomas me demande un devis précis (il est comme ça, très carré sur les questions d'argent — un vrai ingénieur). Je me doute que ça dépend de la complexité du dossier, mais même une fourchette m'aiderait.\n\nDernière question : combien de temps prend la procédure en général, du début à la fin ? J'aimerais, si possible, que tout soit finalisé avant la rentrée de septembre pour que les enfants commencent l'année scolaire avec la situation clarifiée.\n\nMerci encore pour votre accompagnement,\n\nCordialement,\nAlice Bernard\n06 12 34 56 78\nalice.b@free.fr\n\nPS : j'ai oublié de vous demander au cabinet — est-ce que les enfants doivent être entendus par un juge dans un divorce par consentement mutuel ? Léa a 6 ans et Hugo 4 ans, je ne voudrais pas les traumatiser avec tout ça.",
    date: daysAgo(3, 16),
    dossier_id: "6",
    dossier_nom: "Alice Bernard",
    dossier_domaine: "Droit de la famille",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Bernard,\n\nJe vous remercie pour votre diligence dans la constitution du dossier. L'ensemble des documents est complet.\n\nConcernant mes honoraires, pour un divorce par consentement mutuel, mes honoraires s'élèvent à 2 500 euros HT par époux (soit 3 000 euros TTC). Cela couvre la rédaction de la convention, les échanges avec le notaire et l'accompagnement jusqu'à l'enregistrement.\n\nJe vous rappelle que chaque époux doit avoir son propre avocat. Votre mari devra donc mandater un confrère de son choix.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Alice Bernard <alice.b@free.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
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
      "Cher(e) abonné(e),\n\nRetrouvez ci-dessous la veille jurisprudentielle sélectionnée par la Rédaction Dalloz pour la semaine 12 (du 16 au 22 mars 2026). Cette semaine, des arrêts particulièrement importants en matière de vices cachés, de rupture conventionnelle et de droit de la famille.\n\n═══════════════════════════════════════\n1. VICES CACHÉS — CLAUSE EXONÉRATOIRE\n═══════════════════════════════════════\n\nCass. 3e civ., 18 mars 2026, n° 25-14.892, FS-B\n\nFaits : Un particulier achète un bien immobilier présentant des vices de construction importants (fissures structurelles, défaut d'isolation). L'acte de vente contenait une clause d'exclusion de garantie des vices cachés. La cour d'appel avait rejeté l'action de l'acquéreur en se fondant sur cette clause.\n\nSolution : Cassation. La troisième chambre civile rappelle avec force que la clause exonératoire de garantie des vices cachés est « inopérante lorsque le vendeur avait connaissance du vice ». La Cour précise que cette connaissance peut être présumée lorsque des indices matériels de dissimulation sont établis (en l'espèce, travaux d'enduit réalisés quelques mois avant la vente pour masquer les fissures).\n\nPortée : Cet arrêt renforce la protection de l'acquéreur en élargissant les cas de présomption de mauvaise foi du vendeur. Il s'inscrit dans la lignée de Cass. 3e civ., 27 septembre 2006, n° 05-16.980, mais va plus loin en admettant la preuve par indices matériels.\n\nNote R. Delmas, Dalloz actualité, à paraître.\n\n═══════════════════════════════════════\n2. RUPTURE CONVENTIONNELLE — HARCÈLEMENT\n═══════════════════════════════════════\n\nCE, 20 mars 2026, n° 472.581, Lebon T.\n\nFaits : Un salarié signe une rupture conventionnelle dans un contexte de harcèlement moral (mise à l'écart, retrait de responsabilités, objectifs inatteignables). La DREETS avait refusé d'homologuer la convention. L'employeur conteste devant le tribunal administratif.\n\nSolution : Rejet. Le Conseil d'État précise que l'autorité administrative doit vérifier le libre consentement du salarié et que l'existence d'une situation de harcèlement moral, dès lors qu'elle est établie par un faisceau d'indices, fait obstacle à l'homologation de la convention, peu important que le salarié ait été à l'initiative de la demande de rupture conventionnelle.\n\nPortée : Arrêt important qui clarifie le rôle de la DREETS dans le contrôle de l'homologation et les conséquences du harcèlement moral sur la validité du consentement.\n\nComm. F. Gaudu, Dr. social, n° 4/2026, à paraître.\n\n═══════════════════════════════════════\n3. DIVORCE — RÉSIDENCE ALTERNÉE\n═══════════════════════════════════════\n\nCass. 1re civ., 19 mars 2026, n° 25-11.347, FS-P\n\nFaits : Dans le cadre d'un divorce, le père demande la résidence alternée pour les deux enfants (4 et 7 ans). La mère s'y oppose au motif de la distance entre les domiciles (15 km). La cour d'appel avait fixé la résidence principale chez la mère.\n\nSolution : Cassation partielle. La première chambre civile rappelle que la seule distance géographique ne suffit pas à écarter la résidence alternée et que le juge doit procéder à un examen circonstancié de l'intérêt de l'enfant en tenant compte de « la capacité de chaque parent à assumer ses obligations matérielles et affectives, la stabilité des conditions de vie offertes, et les résultats de l'enquête sociale ».\n\nPortée : La Cour affine les critères d'appréciation de l'intérêt de l'enfant et refuse une approche purement mécanique fondée sur la distance.\n\n═══════════════════════════════════════\nÀ NOTER ÉGALEMENT\n═══════════════════════════════════════\n\n• Cass. com., 17 mars 2026, n° 25-10.234 — Cautionnement : proportionnalité de l'engagement de la caution personne physique\n• CA Paris, pôle 1, ch. 3, 21 mars 2026 — Référé-expertise : conditions d'urgence en matière de vices de construction\n• Cass. soc., 20 mars 2026, n° 25-13.678 — Licenciement économique : obligation de reclassement dans le groupe\n\n═══════════════════════════════════════\n\nPour accéder aux textes intégraux des décisions et aux commentaires de la doctrine, connectez-vous sur dalloz.fr avec vos identifiants.\n\nBonne lecture,\nLa Rédaction Dalloz\n\n---\nÉditions Dalloz — 31-35, rue Froidevaux, 75014 Paris\nService abonnements : 01 40 64 54 54\nVous recevez cette newsletter car vous êtes abonné(e) au Bulletin Dalloz.\nGérer vos préférences : dalloz.fr/mon-compte/newsletters",
    date: daysAgo(2, 7),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "newsletter",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Bulletin Dalloz <newsletter@dalloz.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e24",
    expediteur: "Notification RPVA",
    email: "rpva@avocats.fr",
    objet: "Mise à jour du système RPVA",
    resume:
      "Le RPVA informe d'une maintenance programmée du système de communication électronique pour les avocats. Le service sera indisponible pendant 4 heures le week-end prochain.",
    corps_original:
      "CONSEIL NATIONAL DES BARREAUX\nDirection des Systèmes d'Information\nService RPVA / e-barreau\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nAVIS DE MAINTENANCE PROGRAMMÉE\nRéf. : RPVA-MAINT-2026-012\nPriorité : MOYENNE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nChers Confrères,\n\nNous avons l'honneur de vous informer qu'une opération de maintenance programmée du Réseau Privé Virtuel des Avocats (RPVA) et de la plateforme e-barreau sera réalisée ce week-end, conformément au calendrier de maintenance annuel validé par la Commission Informatique et Libertés du CNB lors de sa séance du 15 janvier 2026.\n\nCette opération de maintenance a pour objet la mise à jour des certificats de sécurité SSL/TLS, la migration du module de dépôt de conclusions vers la version 4.2.1, et l'application de correctifs de sécurité sur l'infrastructure serveur.\n\nMODALITÉS :\n• Date : samedi prochain\n• Horaire : de 06h00 à 10h00 (heure de Paris, UTC+1)\n• Durée estimée : 4 heures (sous réserve d'aléas techniques)\n• Impact : indisponibilité TOTALE du service e-barreau pendant toute la durée de l'intervention\n\nSERVICES AFFECTÉS :\n• Dépôt de conclusions et pièces\n• Consultation des dossiers\n• Messagerie sécurisée inter-barreaux\n• Calendrier des audiences\n• Module de notification\n\nSERVICES NON AFFECTÉS :\n• Site institutionnel cnb.avocat.fr\n• Annuaire des avocats\n• Espace de formation en ligne\n\nPRÉCAUTIONS :\n• Les communications électroniques en cours de transmission au moment de l'interruption ne seront PAS affectées. Elles seront traitées dès la remise en service.\n• Nous vous recommandons vivement de planifier vos dépôts de conclusions et communications électroniques en conséquence, et d'anticiper tout dépôt dont le délai expire le samedi ou le lundi suivant.\n• En cas de prolongation de l'interruption au-delà de 10h00, un bulletin d'information sera diffusé par email et sur le compte Twitter @CNB_avocat.\n\nSUPPORT TECHNIQUE :\nEn cas de difficulté après la remise en service, contactez le support technique RPVA :\n• Par téléphone : 01 53 30 85 60 (du lundi au vendredi, 9h-18h)\n• Par email : support.rpva@cnb.avocat.fr\n• FAQ en ligne : cnb.avocat.fr/rpva/support\n\nNous vous prions de nous excuser pour la gêne occasionnée et vous remercions de votre compréhension.\n\nLe Service Technique\nDirection des Systèmes d'Information\nConseil National des Barreaux\n22, rue de Londres — 75009 Paris\n\n---\nCet email est envoyé automatiquement à l'ensemble des avocats disposant d'un accès RPVA actif.\nPour modifier vos préférences de notification : cnb.avocat.fr/mon-compte/notifications",
    date: daysAgo(4, 8),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "notification",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Notification RPVA <rpva@avocats.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e25",
    expediteur: "Formation Continue",
    email: "formation@barreaudeparis.fr",
    objet: "Rappel obligation formation 2026",
    resume:
      "Rappel de l'obligation de formation continue pour les avocats. Il reste 8 heures à valider avant le 31 décembre 2026. Trois sessions sont proposées en avril et mai.",
    corps_original:
      "BARREAU DE PARIS\nService de la Formation Continue des Avocats\nMaison du Barreau — 2, rue de Harlay, 75001 Paris\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nRAPPEL — OBLIGATION DE FORMATION CONTINUE\nAnnée civile 2026 — Situation au 20 mars 2026\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nMaître Alexandra FERNANDEZ\nN° CNBF : 75-P-2018-04567\nBarreau d'inscription : Paris\nDate de prestation de serment : 15 novembre 2018\n\nMaître Fernandez,\n\nConformément aux dispositions de l'article 14-2 de la loi n° 71-1130 du 31 décembre 1971 modifiée et du décret n° 2011-1230 du 3 octobre 2011, nous vous rappelons votre obligation annuelle de formation continue.\n\nVOTRE SITUATION :\n• Heures requises pour l'année 2026 : 20 heures\n• Heures validées au 20 mars 2026 : 12 heures\n    - 8 janvier 2026 : « Actualités de la procédure civile » (4h) — validé\n    - 5 février 2026 : « Pratique des modes amiables de résolution des différends » (4h) — validé\n    - 22 février 2026 : Colloque « La transformation numérique du cabinet d'avocat » (4h) — validé\n• Heures restant à effectuer : 8 heures\n• Date limite de validation : 31 décembre 2026\n\nSESSIONS DISPONIBLES AU 2E TRIMESTRE 2026 :\n\nNous vous invitons à consulter le catalogue complet sur formation.barreaudeparis.fr. Voici une sélection de sessions correspondant à vos domaines de pratique :\n\n📅 15 avril 2026 — « Droit de la famille : actualités législatives et jurisprudentielles 2025-2026 »\n   Intervenant : Me Caroline Levy (Barreau de Paris)\n   Durée : 4 heures (14h-18h)\n   Lieu : Maison du Barreau, salle Malesherbes\n   Places disponibles : 23/40\n\n📅 22 avril 2026 — « Procédure civile numérique : maîtriser le nouveau e-barreau »\n   Intervenant : Me Philippe Dumont (Barreau de Versailles)\n   Durée : 4 heures (9h-13h)\n   Lieu : Maison du Barreau, salle Berryer\n   Places disponibles : 8/30 ⚠️ PRESQUE COMPLET\n\n📅 10 mai 2026 — « Droit immobilier : garantie des vices cachés après la réforme »\n   Intervenant : Pr. Henri Mazeaud (Université Paris II Panthéon-Assas)\n   Durée : 4 heures (14h-18h)\n   Lieu : Amphithéâtre de l'Ordre, Palais de Justice\n   Places disponibles : 31/50\n\n📅 27 mai 2026 — « Droit du travail : ruptures conventionnelles et contentieux post-rupture »\n   Intervenant : Me Sophie Renard (Barreau de Lyon)\n   Durée : 4 heures (9h-13h)\n   Lieu : Maison du Barreau, salle Malesherbes\n   Places disponibles : 18/40\n\nINSCRIPTION :\nRendez-vous sur formation.barreaudeparis.fr et identifiez-vous avec votre numéro CNBF.\n\nNous vous rappelons que le non-respect de l'obligation de formation continue est susceptible de sanctions disciplinaires (article 14-2, alinéa 3, de la loi du 31 décembre 1971).\n\nRestant à votre disposition,\n\nLe Service de la Formation Continue\nBarreau de Paris\nTél. : 01 44 32 49 49\nEmail : formation@barreaudeparis.fr\nHoraires : du lundi au vendredi, 9h30–17h00",
    date: daysAgo(6, 9),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "notification",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Formation Continue <formation@barreaudeparis.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
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
      "Cher Maître,\n\nComme convenu lors de notre conversation de vendredi, je vous transmets en pièce jointe les photos que j'ai prises ce week-end des dégâts sur la façade et à l'intérieur de la maison. J'ai essayé de prendre les clichés sous différents angles et à différentes heures de la journée pour que ce soit le plus parlant possible (mon fils de 19 ans, qui fait des études de photographie, m'a aidée à cadrer correctement — il a insisté pour que je prenne des photos en lumière rasante le matin tôt, parce qu'apparemment ça fait mieux ressortir les reliefs et les fissures).\n\nLes fissures se sont nettement élargies depuis le mois dernier, c'est vraiment impressionnant à quel point ça va vite. La plus préoccupante est celle qui court le long de la fenêtre de la cuisine côté nord — elle devait faire un demi-centimètre quand je l'ai signalée pour la première fois, et maintenant on pourrait presque y glisser un doigt. Quand il y a du vent, on sent carrément l'air froid passer à travers.\n\nÀ l'intérieur, l'infiltration d'eau est maintenant visible à l'oeil nu sur le mur du salon. J'ai mis des feuilles de papier essuie-tout pour voir si c'était actif et elles étaient humides le lendemain matin. Il y a aussi des traces de moisissure noire qui commencent à apparaître dans l'angle entre le mur et le plafond. Je ne sais pas si c'est dangereux pour la santé mais ça ne me rassure pas du tout (j'ai lu sur internet que les moisissures noires pouvaient provoquer des allergies et des problèmes respiratoires, est-ce qu'on pourrait ajouter ça au préjudice ?).\n\nCôté assurance, j'ai appelé la MAIF comme vous me l'aviez conseillé. La conseillère était sympathique mais elle m'a dit clairement que « sans constat d'huissier officiel, nous ne pouvons pas ouvrir de dossier ». Elle m'a aussi demandé si j'avais une garantie « dommages-ouvrage » et quand je lui ai répondu que je ne savais pas ce que c'était, elle a soupiré. Ce n'était pas très encourageant.\n\nJe suis de plus en plus préoccupée par la situation, Maître. Chaque jour qui passe, j'ai l'impression que ma maison se dégrade un peu plus et que BTP Pro s'en lave les mains. Ma mère me propose de venir habiter chez elle le temps que les choses se règlent, mais ce serait une capitulation et je refuse.\n\nPouvez-vous me conseiller sur la marche à suivre ? Faut-il faire le constat d'huissier en priorité, ou envoyer d'abord la mise en demeure, ou les deux en même temps ?\n\nMerci de votre aide précieuse,\n\nBien cordialement,\nMarie Dupont\n06 78 90 12 34",
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
    from_email: "Marie Dupont <marie.dupont@gmail.com>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e27",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "Devis réparation toiture",
    resume:
      "Mme Dupont a fait établir un devis pour la réparation urgente de la toiture. Le montant s'élève à 2 800 euros HT. Elle demande si elle peut engager les travaux ou s'il faut attendre la fin de la procédure.",
    corps_original:
      "Cher Maître,\n\nÉnième problème avec cette fichue maison — cette fois c'est la toiture. Après l'orage de mercredi soir (celui qui a fait tomber des arbres dans le parc des Buttes-Chaumont, vous en avez peut-être entendu parler aux informations), j'ai découvert jeudi matin une grosse flaque d'eau dans le grenier. L'eau avait traversé la toiture et coulé le long de la charpente. Heureusement que je suis montée au grenier pour chercher les valises (je prépare les vacances de Pâques des enfants chez leur père), sinon je ne l'aurais pas vu avant des semaines.\n\nJ'ai fait venir un couvreur recommandé par mon voisin (Entreprise Toitures Mercier, ça fait 25 ans qu'ils travaillent dans le quartier, ils sont sérieux). Il est monté sur le toit et il a constaté :\n- Plusieurs tuiles cassées ou déplacées sur le versant nord (justement celui que BTP Pro avait « réparé »)\n- Le faîtage mal scellé — d'après le couvreur, le mortite utilisé par BTP Pro n'est pas du tout adapté pour ce type de toiture\n- Un solin décollé au niveau de la cheminée qui laisse passer l'eau à chaque pluie\n\nIl m'a remis un devis de 2 800 euros HT (soit 3 360 euros TTC) pour les réparations urgentes. Ce n'est pas donné mais il dit que si on ne fait rien, les dégâts sur la charpente vont s'aggraver et là on parlera de dizaines de milliers d'euros.\n\nMa question est la suivante : est-ce que je peux engager ces travaux maintenant ou est-ce que je dois absolument attendre la fin de la procédure avec BTP Pro ? Je comprends bien qu'il ne faut peut-être pas toucher aux « preuves » mais en même temps, l'hiver prochain arrive dans 8 mois et je ne peux pas laisser ma toiture fuiter pendant tout ce temps. Les enfants dorment dans les chambres du premier étage, juste sous les combles, et l'humidité va finir par descendre.\n\nLe couvreur m'a dit qu'il pouvait commencer la semaine prochaine si je lui confirme rapidement. Est-ce que je dois d'abord faire passer l'huissier pour constater l'état de la toiture avant les réparations ?\n\nMerci de me répondre assez vite si possible, le couvreur a d'autres chantiers en attente et il ne peut pas me garder le créneau indéfiniment.\n\nBien cordialement,\nMarie Dupont\n\nPS : je vous joins le devis de M. Mercier. Si vous connaissez un couvreur moins cher qui fait du bon travail, je suis preneuse aussi. Mon budget est vraiment très serré en ce moment.",
    date: daysAgo(10, 14),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dupont,\n\nVous pouvez engager les travaux urgents de toiture. Il est de votre devoir de limiter l'aggravation des dommages (obligation de mitigation).\n\nConservez soigneusement le devis, la facture et prenez des photos avant/après les travaux. Ces frais seront ajoutés à notre demande d'indemnisation auprès de BTP Pro.\n\nLe montant de 2 800 euros HT me semble raisonnable pour ce type d'intervention.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Marie Dupont <marie.dupont@gmail.com>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e28",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "Envoi devis initial BTP Pro",
    resume:
      "Mme Dupont retrouve et transmet le devis initial signé de BTP Pro pour les travaux de ravalement. Le document montre les prestations promises et non réalisées conformément.",
    corps_original:
      "Cher Maître,\n\nVictoire ! Après avoir retourné tout mon bureau ce week-end (et mis un bazar monstre dans la maison, désolée pour la digression mais c'était vraiment un chantier — un de plus), j'ai enfin retrouvé le devis initial que j'avais signé avec BTP Pro le 15 septembre 2025. Il était coincé dans une pochette avec les factures d'électricité, allez savoir pourquoi je l'avais rangé là.\n\nC'est un document de 4 pages qui détaille de manière assez précise toutes les prestations qui devaient être réalisées. Je vous le scanne et vous l'envoie séparément parce que le fichier est un peu lourd.\n\nEn relisant ce devis attentivement et en le comparant avec ce qui a effectivement été fait (ou plutôt mal fait), les écarts sont flagrants, même pour une néophyte comme moi :\n\n1. Le bardage : le devis spécifie « bardage PVC haute qualité, gamme DECEUNINCK TWINSON O, coloris gris anthracite, épaisseur 23 mm ». Or, le bardage posé est clairement du bas de gamme — mon voisin M. Lefèvre (l'architecte à la retraite) m'a dit que c'est probablement du PVC premier prix qu'on trouve en grande surface de bricolage à 15 euros le m² au lieu des 35-40 euros du devis. La différence de qualité est visible à l'oeil nu : le plastique est plus fin, il se déforme déjà sous l'effet de la chaleur.\n\n2. L'isolation par l'extérieur : le devis prévoyait « isolation thermique par l'extérieur, panneaux de polystyrène expansé haute densité, épaisseur 120 mm, finition enduit hydraulique ». D'après le couvreur qui est venu la semaine dernière, l'isolation posée fait à peine 60 mm d'épaisseur et c'est du polystyrène standard (pas haute densité). C'est pour ça que ma facture de chauffage est astronomique.\n\n3. La gouttière : le devis indiquait « gouttière aluminium laqué, profil demi-ronde, développé 33 ». Ce qui a été installé, c'est une gouttière PVC standard qui est déjà en train de se tordre et de se décoller du mur à certains endroits.\n\nQuand on additionne tout ça, on comprend mieux pourquoi BTP Pro m'a facturé 3 200 euros pour des travaux qui en valent probablement la moitié. C'est du vol, ni plus ni moins.\n\nJ'espère vraiment que ce document sera la pièce qui manquait au puzzle. Dites-moi si vous avez besoin d'autre chose, je suis devenue experte en fouille d'archives à force.\n\nCordialement,\nMarie Dupont",
    date: daysAgo(12, 11),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dupont,\n\nExcellent, ce devis initial est une pièce maîtresse de notre dossier. Il permet de démontrer objectivement les écarts entre les prestations promises et celles réalisées.\n\nJe vais le confronter point par point avec le constat d'huissier et les photos pour étayer notre argumentation devant le tribunal.\n\nMerci pour votre diligence.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Marie Dupont <marie.dupont@gmail.com>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e29",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "Facture 3200 euros contestée",
    resume:
      "Mme Dupont transmet la facture de 3 200 euros de BTP Pro qu'elle conteste. Elle détaille les postes qui ne correspondent pas au devis initial et demande l'envoi rapide de la mise en demeure.",
    corps_original:
      "Cher Maître,\n\nSuite à notre premier rendez-vous de mardi, je vous transmets comme convenu la fameuse facture n° FA-2025-0847 de BTP Pro, d'un montant total de 3 200 euros TTC. C'est cette facture qu'ils me harcèlent pour que je paye alors que le travail n'est même pas terminé correctement.\n\nJ'ai passé la soirée d'hier à comparer cette facture ligne par ligne avec le devis initial (celui que je vous ai remis au cabinet) et voici ce que j'ai trouvé — tenez-vous bien :\n\n1. Le poste « Ravalement façade complète, préparation + enduit + peinture » : facturé 1 350 euros, soit le même prix que dans le devis. Sauf que les matériaux utilisés ne sont absolument pas ceux prévus ! Le devis parlait de « peinture minérale microporeuse de marque ZOLPAN ou similaire » et ce qu'ils ont mis, c'est une peinture bas de gamme qui s'écaille déjà. Mon voisin architecte dit que c'est probablement de la peinture vinylique qu'on achète chez Brico Dépôt à 25 euros le pot de 10 litres.\n\n2. Le poste « Isolation thermique par l'extérieur, fourniture et pose » : facturé 980 euros, intégralement. Or, la pose n'est même pas terminée ! Il reste toute la partie au-dessus de la fenêtre de la cuisine (environ 3 m²) qui n'a pas été isolée. Et comme je vous l'ai expliqué, l'épaisseur de l'isolant posé est la moitié de ce qui était prévu au devis.\n\n3. Le poste « Remplacement gouttières aluminium, 12 ml » : facturé 420 euros. Sauf qu'ils ont posé du PVC et pas de l'aluminium. La différence de prix entre les deux est énorme.\n\n4. Et le pompon : un poste « Nettoyage de chantier et évacuation des gravats » facturé 450 euros qui N'ÉTAIT PAS PRÉVU AU DEVIS. Alors premièrement, le nettoyage de chantier est normalement inclus dans le prix des travaux (c'est ma soeur qui me l'a dit, son mari travaille dans le bâtiment). Et deuxièmement, ils n'ont même pas nettoyé ! Il y avait encore des gravats dans mon jardin trois semaines après la fin du chantier, c'est moi qui ai dû les mettre dans des sacs poubelle et les amener à la déchetterie avec ma petite Clio.\n\nBref, en résumé : ils me facturent 3 200 euros pour des travaux à moitié faits, avec des matériaux de mauvaise qualité, et ils ajoutent 450 euros pour un service qui n'a pas été rendu. C'est du foutage de tête, excusez-moi l'expression.\n\nJe refuse catégoriquement de payer cette facture tant que les travaux ne seront pas conformes au devis que j'ai signé. Est-ce que vous pouvez envoyer la mise en demeure le plus rapidement possible ? Plus on attend, plus ils s'enhardissent.\n\nMerci Maître, je compte vraiment sur vous.\n\nCordialement,\nMarie Dupont\n06 78 90 12 34",
    date: daysAgo(15, 10),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dupont,\n\nJ'ai bien reçu la facture et votre analyse comparative avec le devis.\n\nVotre refus de payer est parfaitement justifié au regard des non-conformités constatées. Le poste « nettoyage chantier » non prévu au devis est contestable et les matériaux de qualité inférieure constituent une inexécution contractuelle.\n\nJe rédige la mise en demeure dans les 48 heures. BTP Pro aura 30 jours pour se mettre en conformité, faute de quoi nous engagerons la procédure judiciaire.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Marie Dupont <marie.dupont@gmail.com>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e30",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "Premier contact - travaux non conformes",
    resume:
      "Premier email de Mme Dupont exposant sa situation : des travaux de ravalement réalisés par BTP Pro ne sont pas conformes au devis. Elle cherche un avocat pour la conseiller.",
    corps_original:
      "Cher Maître Fernandez,\n\nJe me permets de vous contacter sur recommandation de mon notaire, Me Blanchard de l'étude Blanchard & Moreau (qui m'a vendu mon petit pavillon il y a deux ans, il connaît bien ma situation). Il m'a dit que vous étiez spécialisée dans ce type de litiges et que vous étiez « redoutable au tribunal » — ce sont ses mots, pas les miens, et c'est exactement ce dont j'ai besoin en ce moment.\n\nVoici ma situation, je vais essayer d'être claire même si c'est un peu compliqué :\n\nJ'ai fait réaliser des travaux de ravalement sur ma maison (un petit pavillon des années 60, au 12 rue des Acacias dans le 19e) par une entreprise qui s'appelle BTP Pro, basée à Pantin. C'est mon voisin qui me les avait recommandés en me disant qu'ils avaient fait un « super boulot » chez lui — bon, depuis j'ai regardé de plus près chez mon voisin et son ravalement n'est pas terrible non plus, mais passons.\n\nLe devis s'élevait à 3 200 euros TTC et devait inclure :\n- Un ravalement complet de la façade (décapage, enduit, peinture)\n- Une isolation thermique par l'extérieur (je voulais faire des économies de chauffage, la maison est une passoire thermique)\n- Le remplacement des gouttières (les anciennes en zinc étaient percées)\n\nLes travaux ont duré 3 semaines en novembre-décembre 2025. Le gérant, M. Bertrand, était assez sympathique au début — toujours souriant, toujours « pas de souci Madame Dupont, on s'occupe de tout ». Mais dès que le chantier a été terminé, le ton a changé.\n\nParce que dès le mois de janvier, les problèmes ont commencé à apparaître : la peinture de la façade s'est mise à cloquer et à s'écailler, des fissures sont apparues le long des fenêtres (à peine un mois après la fin du chantier !), l'isolation est manifestement incomplète (il manque des panneaux sur toute une section), et les gouttières installées ne sont pas en aluminium comme prévu au devis mais en PVC bas de gamme.\n\nQuand j'ai appelé BTP Pro pour leur signaler tout ça, on m'a d'abord dit « c'est normal, les fissures de retrait disparaissent d'elles-mêmes au bout de quelques semaines ». Trois mois plus tard, elles sont toujours là, et elles s'agrandissent. Quand j'ai rappelé, le gérant M. Bertrand a commencé à m'éviter : « il est sur un chantier », « il est en réunion », « il vous rappelle ». Bien sûr, il n'a jamais rappelé.\n\nEt maintenant, le comble : ils me réclament le paiement intégral de la facture de 3 200 euros, avec des menaces de « recouvrement » si je ne paie pas dans les 30 jours. Je n'ai aucune intention de payer pour des travaux bâclés avec des matériaux de mauvaise qualité.\n\nPourriez-vous me recevoir en rendez-vous pour examiner mon dossier ? J'ai le devis signé, des photos des malfaçons, des captures d'écran de mes échanges SMS avec le gérant, et la facture contestée. Je suis disponible n'importe quel jour de la semaine, je travaille à temps partiel (je suis secrétaire médicale, les mardi et jeudi).\n\nMerci d'avance pour votre aide, Maître. Honnêtement, cette histoire me gâche la vie depuis des semaines et je ne sais plus quoi faire.\n\nEn vous remerciant par avance,\n\nCordialement,\nMarie Dupont\n12, rue des Acacias, 75019 Paris\n06 78 90 12 34\nmarie.dupont@gmail.com",
    date: daysAgo(22, 15),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dupont,\n\nJe vous remercie pour votre prise de contact.\n\nLa situation que vous décrivez relève d'un litige de droit de la consommation pour non-conformité des travaux. Vous disposez de plusieurs recours : la mise en conformité forcée, la résolution du contrat ou la réduction du prix.\n\nJe vous propose un rendez-vous à mon cabinet pour examiner le devis, les photos et tout document utile. Mes prochaines disponibilités sont en début de semaine prochaine.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Marie Dupont <marie.dupont@gmail.com>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e31",
    expediteur: "Marie Dupont",
    email: "marie.dupont@gmail.com",
    objet: "RE: Rendez-vous cabinet",
    resume:
      "Mme Dupont confirme le rendez-vous au cabinet et annonce qu'elle viendra avec l'ensemble de ses documents : devis, facture, contrat, photos et échanges de SMS avec BTP Pro.",
    corps_original:
      "Cher Maître,\n\nMerci beaucoup pour votre réponse rapide et pour le créneau de rendez-vous. Je vous confirme ma venue au cabinet mardi prochain à 10h00. J'ai vérifié sur Google Maps, je serai chez vous en 35 minutes en métro depuis chez moi (ligne 7bis jusqu'à Danube puis ligne 5 jusqu'à... enfin bref, je trouverai).\n\nJ'ai préparé un dossier aussi complet que possible. J'ai passé mon dimanche à tout ranger, classer et numéroter (ma soeur, qui est assistante juridique dans un cabinet de notaire, m'a aidée — elle m'a dit de tout mettre dans l'ordre chronologique avec des intercalaires, j'espère que c'est bien comme ça).\n\nVoici ce que j'apporterai :\n\n1. Le devis original signé par moi et par M. Bertrand (gérant de BTP Pro), daté du 15 septembre 2025 — 4 pages avec le détail des prestations\n2. La facture n° FA-2025-0847 de 3 200 euros TTC\n3. Le contrat de prestation de services (c'est un document d'une page assez sommaire, d'ailleurs je ne suis pas sûre qu'il soit très régulier — il n'y a pas de mention de délai de rétractation ni de garantie)\n4. 24 photos des malfaçons prises entre janvier et mars 2026, imprimées en couleur et datées\n5. Les captures d'écran de mes échanges SMS avec M. Bertrand, le gérant de BTP Pro\n\nÀ propos des SMS, il y en a un qui me semble particulièrement intéressant. Le 28 janvier, quand je lui ai signalé les premières fissures, il m'a répondu texto : « Mme Dupont les petites fissures c'est normal après un ravalement. Ca disparait tout seul au bout de quelques semaines. Vous inquiétez pas. » (avec les fautes d'orthographe). Ma soeur dit que c'est un « aveu » parce qu'il reconnaît implicitement l'existence des fissures tout en minimisant le problème. Est-ce que vous pensez que c'est exploitable ?\n\nIl y a aussi un échange du 15 février où je lui demande de revenir voir les dégâts et où il me répond : « je passe la semaine prochaine ». Bien sûr, il n'est jamais passé.\n\nJ'apporterai aussi mon attestation d'assurance habitation MAIF et, si je la retrouve, la carte de visite du chef de chantier M. Petit (au cas où on en aurait besoin).\n\nEst-ce que vous pensez que je devrais aussi demander à mon voisin M. Lefèvre (l'architecte à la retraite) de m'accompagner au rendez-vous ? Il connaît bien le dossier et pourrait vous donner un avis technique. Si c'est trop, je comprendrai, je ne veux pas non plus venir avec un comité.\n\nÀ mardi Maître, et encore merci.\n\nCordialement,\nMarie Dupont\n06 78 90 12 34\n\nPS : y a-t-il un parking près de votre cabinet au cas où je viendrais en voiture ? Le métro avec un gros dossier sous le bras, ce n'est pas l'idéal.",
    date: daysAgo(20, 16),
    dossier_id: "1",
    dossier_nom: "Marie Dupont",
    dossier_domaine: "Litige commercial",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dupont,\n\nParfait, je confirme notre rendez-vous mardi à 10h00.\n\nLes SMS du gérant de BTP Pro sont effectivement très intéressants. Ils pourraient constituer un aveu des malfaçons. Merci de m'apporter les captures d'écran sur papier ou par email.\n\nPensez également à apporter votre attestation d'assurance habitation et, si possible, les coordonnées de voisins témoins des travaux.\n\nÀ mardi,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Marie Dupont <marie.dupont@gmail.com>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
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
      "Cher Maître,\n\nAprès notre échange téléphonique de la semaine dernière, vous m'avez demandé de vous exposer en détail par écrit mes conditions de travail chez TechCorp pour que vous ayez une vision complète de la situation. J'ai pris le temps de tout rédiger ce week-end, avec des dates et des exemples concrets. Préparez-vous, c'est un peu long, mais je pense que chaque détail compte.\n\nPour remettre les choses en contexte : quand j'ai rejoint TechCorp en mars 2019, c'était une entreprise dynamique avec une vraie culture bienveillante. Mon premier manager, M. Renaud, était quelqu'un de formidable — il m'a fait monter en compétence, il m'a confié des projets stratégiques, il m'a valorisé auprès de la direction. J'étais heureux d'aller travailler tous les matins. Ma femme vous le confirmera, je rentrais le soir en parlant avec enthousiasme de mes projets.\n\nTout a changé en septembre 2024, quand M. Renaud a quitté l'entreprise (il est parti chez un concurrent, d'ailleurs, ce qui en dit long sur l'ambiance) et qu'il a été remplacé par M. Yann Kergoat. Du jour au lendemain, l'atmosphère est devenue glaciale.\n\nVoici la chronologie de la dégradation, aussi précise que possible :\n\n• Octobre 2024 : M. Kergoat décide de « réorganiser l'espace de travail ». Concrètement, on m'a retiré mon bureau individuel (que j'occupais depuis 3 ans) pour me mettre dans un open space au 2e étage, au milieu de l'équipe support client. L'argument officiel : « favoriser la collaboration inter-équipes ». La réalité : je suis entouré de gens qui passent leurs journées au téléphone, je n'arrive plus à me concentrer, et mes projets de développement nécessitent du calme. Trois autres développeurs ont gardé leurs bureaux individuels, dont un qui a moins d'ancienneté que moi.\n\n• Décembre 2024 : Mes objectifs annuels pour 2025 arrivent. Surprise : ils ont été augmentés de 40% par rapport à 2024. Quand j'en ai parlé à M. Kergoat, il m'a dit « c'est l'exigence qui monte, il faut s'adapter ». Personne d'autre dans l'équipe n'a eu une augmentation d'objectifs aussi brutale — j'ai vérifié discrètement avec mes collègues.\n\n• Février 2025 : Je ne suis plus convié aux réunions hebdomadaires d'architecture technique, auxquelles j'avais toujours participé depuis 2020. Quand j'ai demandé pourquoi, on m'a dit que « le format de la réunion avait changé » et qu'elle était « réservée aux seniors ». Je SUIS senior. Enfin, je l'étais sur le papier, jusqu'à ce que mon titre soit discrètement changé dans l'organigramme en « développeur confirmé » au lieu de « développeur senior ».\n\n• Mars 2025 : Mon manager ne me parle quasiment plus en personne. Toutes les communications passent par email ou par Slack. Des messages froids, factuels, sans aucune chaleur humaine. Quand on se croise dans le couloir, il fait comme si je n'existais pas. C'est extrêmement humiliant.\n\n• Mai 2025 : Ma promotion au grade de Senior Technical Lead, qui avait été validée par M. Renaud et transmise à la Direction en juin 2024, est officiellement « oubliée ». Quand j'ai relancé le DRH, il m'a dit qu'il « n'avait aucune trace de cette demande ». Or, j'ai l'email de M. Renaud qui confirme la transmission. Je vous l'ai déjà envoyé.\n\n• Depuis septembre 2025 : C'est la politique de la terre brûlée. On me confie des tâches subalternes (de la documentation technique, du support de niveau 1) alors que je gérais des projets à 200 000 euros de budget. Un stagiaire de 22 ans a récupéré mon dernier projet.\n\nMa question est la suivante : est-ce que tout cela peut constituer du harcèlement moral au sens du Code du travail ? Parce que ma femme, qui a lu des articles sur le sujet, est convaincue que oui. Mon médecin aussi — il m'a prescrit des anxiolytiques en décembre dernier et m'a proposé un arrêt de travail que j'ai refusé (par fierté, probablement à tort).\n\nEt surtout : est-ce que ça change la donne pour la rupture conventionnelle ? Parce que si c'est du harcèlement, est-ce que je ne devrais pas plutôt aller aux prud'hommes pour licenciement nul ? Je ne veux pas faire de bêtise stratégique.\n\nExcusez la longueur de ce message, mais vous m'aviez dit de tout mettre par écrit et de n'oublier aucun détail.\n\nCordialement,\nJean-Pierre Martin",
    date: daysAgo(10, 16),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Monsieur Martin,\n\nLes faits que vous décrivez pourraient effectivement constituer des indices de harcèlement moral au sens de l'article L1152-1 du Code du travail.\n\nToutefois, dans le cadre d'une rupture conventionnelle, il faut être prudent : si le consentement est vicié par le harcèlement, la rupture conventionnelle pourrait être requalifiée en licenciement nul.\n\nJe vous recommande de constituer un dossier de preuves (emails, témoignages de collègues) et nous en discuterons pour déterminer la meilleure stratégie.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Jean-Pierre Martin <jp.martin@entreprise.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: "rh@techcorp.fr",
  },
  {
    id: "e33",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Contrat de travail et avenants",
    resume:
      "M. Martin transmet son contrat de travail initial et les deux avenants signés depuis son embauche. Le dernier avenant de 2024 mentionne la clause de non-concurrence et la rémunération variable.",
    corps_original:
      "Cher Maître,\n\nComme convenu lors de notre rendez-vous de lundi (merci encore pour le temps que vous m'avez consacré, 1h30, c'est au-delà de ce que j'espérais — et merci aussi pour votre franchise, ça fait du bien d'avoir quelqu'un qui vous dit les choses clairement), je vous transmets en pièce jointe l'ensemble de mes documents contractuels avec TechCorp.\n\nJ'ai tout scanné en un seul PDF pour vous simplifier la vie. Voici le contenu :\n\n1. Mon contrat de travail initial — CDI signé le 1er mars 2019\nC'est un contrat assez standard pour un développeur senior. 35 heures hebdomadaires, pas de forfait jours (j'insiste sur ce point parce que c'est important pour les heures sup), salaire d'embauche de 3 200 euros brut, période d'essai de 4 mois renouvelée une fois. La convention collective applicable est la SYNTEC.\n\n2. L'avenant n° 1 du 15 septembre 2021 — Changement de poste\nPassage de « Développeur Senior » à « Chef de Projet Technique ». Augmentation de salaire à 3 800 euros brut. Rien de spécial à signaler, c'était une promotion méritée après 2 ans et demi dans la boîte.\n\n3. L'avenant n° 2 du 1er janvier 2024 — Nouveau grade + clause de non-concurrence\nC'est celui qui me pose problème. Il officialise mon passage au coefficient 3.1 de la SYNTEC (Position 3, Niveau 1) avec un salaire porté à 4 200 euros brut. Mais surtout, il introduit une clause de non-concurrence qui n'existait pas dans mon contrat initial !\n\nCette clause prévoit :\n- Interdiction d'exercer une activité concurrente pendant 12 mois après la fin du contrat\n- Périmètre géographique : Île-de-France\n- Domaine : « services informatiques et numériques, cloud computing, DevOps et infrastructure »\n- Contrepartie financière : 30% du salaire mensuel moyen des 12 derniers mois, versée mensuellement pendant la durée de l'interdiction\n\n30% de 4 200 euros, ça fait environ 1 260 euros par mois pendant 12 mois. Sauf que si je ne peux pas travailler dans mon domaine pendant un an, je perds au minimum 4 200 euros par mois de salaire. Le déséquilibre est flagrant, non ?\n\nEt c'est justement ce qui me préoccupe le plus : avec mon ami Sébastien (ancien collègue chez TechCorp, parti en 2023), on a un projet de créer une société de conseil en DevOps. On a déjà des prospects, un business plan, et un investisseur intéressé. Mais si la clause de non-concurrence s'applique, on ne pourra pas lancer la boîte avant janvier 2027 au plus tôt. C'est un an de perdu, et Sébastien ne va pas m'attendre éternellement.\n\nPourriez-vous examiner cette clause en détail et me dire :\n- Est-elle juridiquement valable ? (J'ai lu des choses sur internet sur les clauses « disproportionnées » qui peuvent être annulées)\n- Peut-on la faire lever dans le cadre de la négociation de la rupture conventionnelle ?\n- Si on ne peut pas la faire lever, peut-on au moins renégocier la contrepartie à la hausse ?\n\nMerci beaucoup Maître.\n\nCordialement,\nJean-Pierre Martin\n06 87 65 43 21",
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
    from_email: "Jean-Pierre Martin <jp.martin@entreprise.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e34",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Premier contact - rupture conventionnelle",
    resume:
      "Premier email de M. Martin. Il expose sa situation chez TechCorp : 7 ans d'ancienneté, poste de chef de projet technique, salaire brut de 4 200 euros. Il souhaite négocier une rupture conventionnelle.",
    corps_original:
      "Cher Maître Fernandez,\n\nJe me permets de vous contacter sur recommandation de mon ami Frédéric Morel, qui a eu recours à vos services l'année dernière pour un litige prud'homal contre son ancien employeur (la société DataViz, si je me souviens bien). Il m'a chaudement recommandé de faire appel à vous en me disant que vous aviez été « remarquable dans la négociation ». Venant de Frédéric qui n'est pas du genre à faire des compliments, c'est un bel éloge.\n\nJe vous contacte parce que je traverse une période professionnelle très difficile et que j'ai besoin des conseils d'un(e) avocat(e) spécialisé(e) en droit du travail.\n\nVoici ma situation en quelques mots (je développerai en rendez-vous si vous acceptez de me recevoir) :\n\nJe m'appelle Jean-Pierre Martin, j'ai 38 ans, je suis marié et père de deux enfants (9 et 6 ans). Je travaille en tant que Chef de Projet Technique chez TechCorp depuis le 1er mars 2019. TechCorp est une SAS d'environ 450 salariés spécialisée dans le cloud computing et les services DevOps — c'est une boîte qui a le vent en poupe (levée de fonds de 12 millions en 2023), mais dont la culture d'entreprise s'est sérieusement dégradée depuis le changement de direction technique il y a un an et demi.\n\nMon salaire actuel est de 4 200 euros brut par mois (soit environ 3 300 euros net), plus une prime variable théorique de 10% que je n'ai jamais touchée intégralement depuis 2024 (toujours des « objectifs non atteints » alors que mes évaluations sont excellentes — cherchez l'erreur).\n\nPour faire court : mes conditions de travail se sont progressivement dégradées depuis l'arrivée de mon nouveau manager en septembre 2024. Retrait de responsabilités, mise à l'écart des réunions stratégiques, objectifs augmentés de 40%, promotion validée puis « oubliée »... L'ambiance est devenue toxique et je ne me vois plus d'avenir dans cette entreprise. Mon médecin traitant s'inquiète pour ma santé (il a commencé à parler de « burn-out »), et ma femme me dit chaque soir que « je ne suis plus le même depuis un an ».\n\nJ'ai décidé de partir, mais je voudrais le faire intelligemment. J'ai évoqué l'idée d'une rupture conventionnelle avec mon manager direct, M. Kergoat, qui a semblé plutôt ouvert (il est sans doute soulagé de me voir partir, d'ailleurs). Le DRH, M. Stéphane Leblanc, m'a contacté dans la foulée et m'a proposé un premier entretien préalable la semaine prochaine.\n\nLe problème, c'est que je ne sais absolument pas comment négocier ce type de chose. Je ne connais pas mes droits, je ne sais pas quel montant demander, je ne sais pas comment gérer la clause de non-concurrence qui figure dans mon avenant de 2024, et je ne sais pas si je dois accepter le premier entretien sans être accompagné ou si c'est une erreur.\n\nPourriez-vous m'accompagner dans cette démarche ? Idéalement, j'aurais besoin d'un rendez-vous rapide avant le premier entretien (qui est la semaine prochaine) pour au moins être briefé sur les points clés.\n\nJe suis disponible tous les jours après 18h30 et le week-end. Mon numéro de portable : 06 87 65 43 21 (n'hésitez pas à m'appeler, je décroche toujours, sauf quand je suis en réunion chez TechCorp).\n\nMerci d'avance pour votre retour, Maître. Cette situation me pèse énormément et j'ai besoin de savoir que je suis entre de bonnes mains.\n\nCordialement,\nJean-Pierre Martin\nChef de Projet Technique — SAS TechCorp\njp.martin@entreprise.fr (pro) / jp.martin.perso@gmail.com (perso)\n06 87 65 43 21",
    date: daysAgo(18, 15),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Monsieur Martin,\n\nJe vous remercie pour votre confiance.\n\nVotre situation est classique et une rupture conventionnelle est effectivement la voie la plus adaptée. Avec 7 ans d'ancienneté et un salaire de 4 200 euros brut, l'indemnité légale minimum serait d'environ 8 400 euros, mais nous viserons bien plus.\n\nJe vous propose un rendez-vous rapide avant votre premier entretien avec le DRH pour préparer votre stratégie.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Jean-Pierre Martin <jp.martin@entreprise.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e35",
    expediteur: "Jean-Pierre Martin",
    email: "jp.martin@entreprise.fr",
    objet: "Compte-rendu 1er entretien",
    resume:
      "M. Martin fait le compte-rendu du premier entretien préalable avec TechCorp. Le DRH a accepté le principe de la rupture conventionnelle mais a évoqué uniquement l'indemnité légale.",
    corps_original:
      "Cher Maître,\n\nJe sors à l'instant du premier entretien préalable avec le DRH de TechCorp et je voulais vous faire un compte-rendu à chaud, tant que tout est encore frais dans ma mémoire (je suis dans ma voiture sur le parking de la boîte, j'écris sur mon téléphone, excusez les éventuelles fautes de frappe).\n\nL'entretien a duré environ 45 minutes. Côté TechCorp, il y avait M. Leblanc (DRH) et Mme Garnier (responsable RH). J'étais seul, puisqu'on avait convenu que je n'avais pas besoin d'accompagnement pour ce premier entretien « exploratoire ».\n\nVoici ce qui s'est dit, point par point :\n\n1. Sur le principe de la rupture conventionnelle : M. Leblanc a accepté le principe. Il a dit que « l'entreprise comprenait mon souhait d'évolution professionnelle » (c'est joliment formulé, on croirait qu'ils me rendent service). Il m'a précisé que « ce n'était pas une décision prise à la légère côté employeur » et que « la direction avait validé le principe ». Mme Garnier hochait la tête en prenant des notes sur son ordinateur portable.\n\n2. Sur l'indemnité : et là, douche froide. M. Leblanc m'a dit texto : « La politique de TechCorp est de s'en tenir à l'indemnité spécifique de rupture conventionnelle telle que définie par le Code du travail, c'est-à-dire l'indemnité légale. » Quand j'ai timidement évoqué la possibilité d'une indemnité supra-légale (comme vous m'aviez dit de le faire en douceur), il a souri et a répondu : « Ce n'est pas dans les habitudes de TechCorp, mais nous pourrons en rediscuter lors du deuxième entretien. » J'ai trouvé le sourire un peu condescendant, mais bon.\n\n3. Sur la date de sortie : il m'a proposé le 30 avril comme date de fin de contrat. Ça me laisse un peu plus d'un mois. J'aurais préféré le 15 avril pour avoir plus de temps pour préparer mon projet avec Sébastien, mais je n'ai rien dit pour l'instant.\n\n4. Sur la clause de non-concurrence : quand j'ai abordé le sujet, M. Leblanc a fait un geste vague de la main et a dit « nous verrons cela au deuxième entretien, c'est un sujet qui nécessite une validation de la Direction Technique ». J'ai trouvé ça évasif, comme s'il ne voulait pas s'avancer.\n\n5. Points positifs : l'ambiance était cordiale, pas agressive. Ils n'ont fait aucune référence à mes performances ou à un quelconque reproche. Ce qui confirme que c'est bien eux qui ont un intérêt à ce que je parte (vous aviez raison sur ce point).\n\nLe deuxième entretien est prévu dans une dizaine de jours. Cette fois, j'aimerais vraiment que vous m'accompagniez, Maître. J'ai senti que Leblanc est un négociateur aguerri (ça fait 15 ans qu'il est DRH, il doit connaître tous les coups) et je ne me sens pas de taille à défendre seul mes intérêts sur les questions financières et la clause de non-concurrence.\n\nQu'en pensez-vous ? Votre présence à l'entretien est-elle possible ? Et quels sont les frais associés, si je puis me permettre de demander ?\n\nDans l'attente de votre avis,\n\nCordialement,\nJean-Pierre Martin\n06 87 65 43 21\n\nPS : en sortant de la salle, j'ai croisé mon collègue Damien dans le couloir. Il m'a fait un clin d'oeil et m'a dit « courage ». Je crois que toute l'équipe est au courant. Formidable, la confidentialité chez TechCorp...",
    date: daysAgo(14, 17),
    dossier_id: "2",
    dossier_nom: "Jean-Pierre Martin",
    dossier_domaine: "Droit du travail",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Monsieur Martin,\n\nMerci pour ce compte-rendu détaillé.\n\nLa position du DRH est classique mais négociable. Le fait que TechCorp ait accepté le principe est un bon signe. La « politique de l'entreprise » n'est pas un argument juridique.\n\nJe vous accompagnerai au 2e entretien. Nous demanderons formellement l'indemnité supra-légale, la levée de la clause de non-concurrence et une date de sortie avancée au 15 avril.\n\nJe vous prépare un argumentaire solide.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Jean-Pierre Martin <jp.martin@entreprise.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
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
      "Maître Fernandez,\n\nJ'ai l'honneur de vous transmettre ci-joint, en version numérique PDF horodaté et signé électroniquement (certificat qualifié eIDAS RGS**), mon rapport d'expertise définitif référencé EXP-2026-0478-R, établi dans le cadre de la mission d'expertise judiciaire ordonnée par le Tribunal de Grande Instance de Paris (ordonnance de référé du 12 décembre 2025, RG 25/09876, M. le Juge des référés LECLERC), concernant le bien immobilier à usage d'habitation acquis par M. et Mme Patrick ROUX, situé au 45, avenue des Lilas, 75019 Paris, cadastré section AH n° 147.\n\nI. RAPPEL DE LA MISSION\n\nPar ordonnance du 12 décembre 2025, il m'a été confié la mission de :\n1° Se rendre sur les lieux et les décrire\n2° Constater et décrire les désordres allégués par les demandeurs\n3° En rechercher les causes et déterminer s'ils sont antérieurs ou postérieurs à la vente\n4° Estimer le coût des réparations nécessaires\n5° Donner un avis technique sur la connaissance que le vendeur pouvait avoir des désordres\n\nII. DÉROULEMENT DES OPÉRATIONS\n\nL'accédit principal a eu lieu le 8 février 2026, en présence de M. et Mme Roux, de Me Fernandez (conseil des demandeurs) et de Me Garcia (conseil du défendeur, M. Gauthier, absent et non représenté). Un second accédit, rendu nécessaire par la découverte de désordres complémentaires, a eu lieu le 18 mars 2026 (cf. addendum à venir).\n\nLes investigations ont comporté : inspection visuelle intérieure et extérieure, relevé des fissures par fissuromètre électronique, mesures d'humidité par humidimètre à micro-ondes (modèle TROTEC T660), contrôle d'isolation thermique par caméra infrarouge (FLIR E86), sondages destructifs ponctuels (2 points de sondage autorisés par le magistrat), et examen de la charpente par carottage.\n\nIII. CONSTATATIONS ET CONCLUSIONS\n\nMes conclusions, développées aux pages 8 à 35 du rapport, confirment l'existence de désordres graves constitutifs de vices cachés au sens de l'article 1641 du Code civil, à savoir :\n\nA) Fissures structurelles (cf. pages 8-15, planches photographiques n° 1 à 11)\nSix fissures majeures affectant les murs porteurs, dont trois traversantes (F1, F3 et F5 dans la nomenclature du rapport). Orientation à 45° caractéristique d'un tassement différentiel. Présence de traces de réparations antérieures (enduit de rebouchage type SIKA MonoTop-620, application estimée à 4-6 mois avant la vente) attestant une connaissance probable des désordres par le vendeur.\n\nB) Infiltrations d'eau en sous-sol (cf. pages 16-22, planches n° 12 à 17)\nInfiltrations actives en pied de mur est, traces d'humidité ascensionnelle caractérisées, taux d'humidité mesuré entre 85% et 92% HR dans le sous-sol (norme maximale admissible : 60% HR). Absence totale de drainage périphérique.\n\nC) Défaut d'isolation thermique (cf. pages 23-28, planches n° 18 à 24)\nL'imagerie infrarouge révèle des ponts thermiques majeurs sur l'ensemble des parois du bâtiment. L'isolation existante (laine de verre 45 mm dans les combles, aucune isolation des murs) est très largement non conforme à la réglementation thermique RT2012, et ce malgré le Diagnostic de Performance Énergétique (DPE) qui affichait une note C. Je recommande expressément une contre-expertise du DPE.\n\nD) Désordres de charpente (cf. pages 29-35, planches n° 25 à 30)\nPrésence de champignons lignivores (mérule suspecte sur un chevron, analyse mycologique à confirmer par le laboratoire CTBA) et attaque d'insectes xylophages (vrillettes) sur les pannes sablières. Reprise complète de la charpente nécessaire.\n\nIV. ESTIMATION DES RÉPARATIONS\n\nLe coût estimé des réparations nécessaires pour remettre le bien en état de conformité s'élève à 78 000 euros HT (quatre-vingt-treize mille six cents euros TTC au taux de TVA de 20%), détaillé en annexe 3 du rapport.\n\nV. AVIS SUR LA CONNAISSANCE DU VENDEUR\n\nLes traces de réparations cosmétiques récentes (enduit de rebouchage sur les fissures, peinture fraîche dans le sous-sol) constituent, à mon avis d'expert, des indices matériels forts d'une connaissance des désordres par le vendeur antérieurement à la vente.\n\nJe me tiens naturellement à votre disposition et à celle du Tribunal pour toute demande de précision complémentaire ou pour être entendu à l'audience.\n\nVeuillez agréer, Maître, l'expression de ma considération distinguée.\n\nM. Philippe Renard\nExpert judiciaire en bâtiment\nInscrit sur la liste des experts de la Cour d'appel de Paris\nRubrique C.02 — Bâtiment, travaux publics\n22, rue de Rivoli, 75004 Paris\nTél. : 01 48 87 65 43\nEmail : expert.bati@experts.fr",
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
    from_email: "Expert judiciaire Philippe Renard <expert.bati@experts.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e37",
    expediteur: "Famille Roux",
    email: "p.roux@wanadoo.fr",
    objet: "Coordonnées de l'ancien propriétaire",
    resume:
      "M. Roux fournit les coordonnées complètes de l'ancien propriétaire, M. Gauthier, et précise que ce dernier a quitté la France pour s'installer au Portugal il y a 3 mois.",
    corps_original:
      "Cher Maître,\n\nVous m'aviez demandé de retrouver les coordonnées de l'ancien propriétaire, M. Gauthier. Ça n'a pas été simple parce que, comme je vous le disais, il a quitté la France assez précipitamment après la vente, mais j'ai fini par retrouver ses coordonnées grâce aux voisins et à un peu de recherche sur internet (Sophie a retrouvé son profil LinkedIn et son nouveau numéro de téléphone portugais).\n\nVoici ce que j'ai pu rassembler :\n\nM. Jean-Claude GAUTHIER\nNé le 12 avril 1958 (il a 67 ans, il est à la retraite)\nAncienne adresse : 45, avenue des Lilas, 75019 Paris (c'est notre maison, évidemment)\nNouvelle adresse : Rua das Flores, 28, 3° Dto, 1200-195 Lisboa, Portugal\nTéléphone portugais : +351 912 345 678\nTéléphone français (peut-être encore actif ?) : 06 34 56 78 90\nEmail : jc.gauthier@gmail.com\nLinkedIn : linkedin.com/in/jcgauthier (profil très sommaire, juste « Retraité, expatrié au Portugal »)\n\nMaintenant, pour le contexte — et je pense que c'est important pour le dossier :\n\nJ'ai discuté avec plusieurs voisins de la rue et voici ce qui en ressort :\n\n• Mme Lelong (n° 43, la voisine de gauche) : elle vit dans la rue depuis 30 ans. Elle m'a dit que M. Gauthier avait fait des travaux « en catimini » l'hiver dernier, juste avant de mettre la maison en vente. D'après elle, il y avait des ouvriers qui venaient le soir et le week-end (ce qui est suspect). Elle pense qu'ils ont refait les enduits intérieurs pour « cacher les fissures ». Elle est prête à témoigner si nécessaire.\n\n• M. Durand (n° 47, en face) : il m'a dit que M. Gauthier lui avait confié il y a environ 2 ans (donc bien avant la vente) qu'il avait « des problèmes d'humidité au sous-sol ». Il ne se souvient plus des termes exacts mais il est catégorique : Gauthier savait que la maison avait des problèmes d'infiltration.\n\n• Mme Bouchard (n° 41, la voisine de droite) : elle est moins catégorique mais elle a noté que Gauthier avait l'air « très pressé de vendre ». La maison a été mise en vente et vendue en moins de 2 mois, ce qui est rapide pour le quartier.\n\nCe qui est particulièrement troublant, c'est le timing : M. Gauthier a vendu la maison le 15 juin 2025, et d'après les voisins, il a quitté la France pour le Portugal environ 3 mois plus tard, en septembre 2025. Comme par hasard, juste avant que les premiers problèmes ne commencent à apparaître avec l'arrivée de l'automne et des pluies.\n\nSophie dit que c'est un « escroc qui a pris la fuite ». Je suis un peu moins catégorique mais quand même, ça ne sent pas bon.\n\nEst-ce que le fait qu'il soit au Portugal complique les choses pour la procédure ? Il ne va pas pouvoir se cacher derrière la frontière, quand même ?\n\nCordialement,\nPatrick Roux\n06 45 67 89 01\n\nPS : si vous avez besoin que je contacte les voisins pour qu'ils fassent des attestations écrites, je m'en occupe. Ils sont tous très sympathiques et solidaires.",
    date: daysAgo(12, 14),
    dossier_id: "4",
    dossier_nom: "Famille Roux",
    dossier_domaine: "Immobilier",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Cher Monsieur Roux,\n\nMerci pour ces informations précieuses.\n\nLe départ précipité de M. Gauthier au Portugal peu après la vente est un indice supplémentaire de sa mauvaise foi. Son départ à l'étranger ne fait pas obstacle à notre action, mais il faudra prévoir une signification par voie diplomatique.\n\nLe témoignage des voisins pourrait être utile. Pourriez-vous me transmettre les noms et coordonnées de ceux qui seraient prêts à témoigner ?\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Famille Roux <p.roux@wanadoo.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: "notaire@me-blanchard.fr",
  },
  {
    id: "e38",
    expediteur: "Famille Roux",
    email: "p.roux@wanadoo.fr",
    objet: "Premier contact - vices cachés maison",
    resume:
      "Premier email de la famille Roux exposant la découverte de fissures structurelles dans leur maison achetée 6 mois plus tôt. Ils demandent une consultation pour évaluer leurs recours.",
    corps_original:
      "Cher Maître Fernandez,\n\nNous nous permettons de vous écrire sur les conseils de Mme Lefranc, notre voisine du 47 avenue des Lilas, dont l'une des amies a fait appel à vos services il y a quelques années pour un litige immobilier. Nous espérons que vous pourrez nous aider car nous sommes dans une situation catastrophique.\n\nNous nous présentons : je suis Patrick Roux, 35 ans, ingénieur en informatique chez Capgemini, et mon épouse Sophie Roux (née Mercier), 33 ans, professeure des écoles. Nous avons deux enfants, Emma (8 ans) et Lucas (5 ans). Nous avons acheté le 15 juin 2025, pour la somme de 485 000 euros, une maison individuelle de 120 m² située au 45, avenue des Lilas, 75019 Paris. C'est notre premier achat immobilier — nous étions locataires à Boulogne-Billancourt depuis notre mariage et nous avions économisé pendant 5 ans pour constituer l'apport.\n\nNous étions tellement heureux de devenir propriétaires. Sophie en rêvait depuis l'enfance, et les enfants étaient fous de joie d'avoir un jardin. Nous avions fait le tour du quartier, les écoles étaient bien, la rue était calme, la maison nous plaisait beaucoup. Le vendeur, M. Jean-Claude Gauthier, un retraité très aimable, nous avait tout montré avec le sourire en nous disant que « cette maison, c'est 30 ans de bonheur ». On lui faisait confiance.\n\nEt puis l'automne est arrivé, et le rêve s'est transformé en cauchemar.\n\nD'abord, en octobre, on a remarqué des fissures sur les murs porteurs du rez-de-chaussée. Au début on s'est dit que c'était juste cosmétique, mais elles se sont rapidement élargies. Aujourd'hui, certaines font plus d'un centimètre de large et sont traversantes — on voit la lumière du jour à travers.\n\nEnsuite, dès les premières pluies sérieuses de novembre, de l'eau s'est infiltrée dans le sous-sol. Au début un simple suintement, maintenant c'est une vraie entrée d'eau à chaque épisode pluvieux. Le sous-sol est devenu inutilisable. On y avait stocké des affaires des enfants, des albums photos, des documents administratifs — tout est foutu.\n\nEt pour couronner le tout, quand on a fait venir un chauffagiste en décembre parce que nos factures de chauffage étaient astronomiques (380 euros pour le seul mois de janvier !), il nous a dit que l'isolation était « quasi inexistante ». Pourtant, le Diagnostic de Performance Énergétique annexé à l'acte de vente affichait une note C ! Le chauffagiste nous a dit que c'était impossible et que la note réelle devrait être E ou F. On se demande si le DPE n'a pas été trafiqué.\n\nNous avons payé 485 000 euros pour cette maison, nous avons un crédit immobilier de 1 850 euros par mois sur 25 ans, et nous découvrons qu'elle est criblée de problèmes que le vendeur nous a manifestement cachés. Nous sommes dévastés. Sophie pleure tous les soirs, les enfants sentent que quelque chose ne va pas, et moi je n'arrive plus à me concentrer au travail.\n\nPouvez-vous nous recevoir et nous dire si nous avons un recours contre le vendeur ? Nous ne savons pas vers qui nous tourner et nous avons besoin d'aide.\n\nEn vous remerciant par avance,\n\nCordialement,\nPatrick et Sophie Roux\n45, avenue des Lilas, 75019 Paris\nTél. : 06 45 67 89 01 (Patrick) / 06 78 12 34 56 (Sophie)\nEmail : p.roux@wanadoo.fr",
    date: daysAgo(20, 10),
    dossier_id: "4",
    dossier_nom: "Famille Roux",
    dossier_domaine: "Immobilier",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chers Monsieur et Madame Roux,\n\nJe vous remercie de votre confiance.\n\nLes désordres que vous décrivez pourraient constituer des vices cachés au sens de l'article 1641 du Code civil. Vous disposez de recours contre le vendeur.\n\nLa première étape est de faire constater les désordres par un expert judiciaire. Je peux saisir le tribunal d'une demande d'expertise en référé, ce qui permettra d'établir officiellement la nature et l'étendue des dommages.\n\nJe vous propose un rendez-vous rapide pour examiner vos documents.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Famille Roux <p.roux@wanadoo.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e39",
    expediteur: "Famille Roux",
    email: "p.roux@wanadoo.fr",
    objet: "Diagnostics immobiliers de la vente",
    resume:
      "La famille Roux transmet les diagnostics immobiliers réalisés lors de la vente. Le DPE affichait une note C, mais les Roux suspectent une fraude car l'isolation est quasi inexistante.",
    corps_original:
      "Cher Maître,\n\nComme convenu lors de notre rendez-vous, je vous transmets en pièce jointe l'intégralité du dossier de diagnostics techniques qui étaient annexés à l'acte de vente de notre maison. Ce sont les documents que le notaire Me Blanchard nous a remis lors de la signature.\n\nLe dossier comprend :\n\n1. Diagnostic de Performance Énergétique (DPE) — Établi le 2 mai 2025 par la société DiagImmo Île-de-France (M. Bernard Dupré, diagnostiqueur certifié AFNOR n° DPE-2023-IDF-4567)\n   Résultat : Note C (énergie : 149 kWh/m²/an — émissions GES : 31 kg CO2/m²/an)\n   → C'est CE document qui nous a convaincus que la maison était correctement isolée. La note C, ça veut quand même dire « logement assez performant » !\n\n2. État des Risques et Pollutions (ERP) — Établi le 28 avril 2025\n   Résultat : RAS (pas de risque identifié — ni inondation, ni mouvement de terrain, ni radon)\n   → Ironique, quand on sait que le sous-sol est régulièrement inondé...\n\n3. Diagnostic Amiante — Établi le 2 mai 2025\n   Résultat : Négatif (absence d'amiante dans les matériaux et produits de construction)\n\n4. Diagnostic Plomb (CREP) — Établi le 2 mai 2025\n   Résultat : Négatif (concentrations inférieures au seuil réglementaire de 1 mg/cm²)\n\n5. Diagnostic Termites — Établi le 2 mai 2025\n   Résultat : Négatif (absence d'indices d'infestation par les termites)\n   → Mais il n'a apparemment rien dit sur les vrillettes et la possible mérule dans la charpente, que l'expert Renard a découvertes...\n\n6. Diagnostic Installation Électrique — Établi le 5 mai 2025\n   Résultat : 3 anomalies mineures identifiées (B3.3.4, B3.3.6, B6.3) — rien de grave\n\n7. Diagnostic Installation Gaz — Établi le 5 mai 2025\n   Résultat : 1 anomalie mineure (type A1) — remplacement d'un flexible recommandé\n\nTous les diagnostics ont été réalisés par la même société (DiagImmo Île-de-France, basée à Clichy) en une seule journée, le 2 mai 2025 pour la plupart. Sophie me fait remarquer que faire 5 diagnostics en une journée sur une maison de 120 m², ça semble un peu rapide pour un travail sérieux. Elle n'a pas tort.\n\nCe qui nous préoccupe le plus, c'est évidemment le DPE. Notre chauffagiste (M. Gaston, de l'entreprise Thermoclim, qui intervient dans le quartier depuis 20 ans et qui est très réputé) nous a dit sans hésiter que la note C était « impossible » pour une maison des années 60 avec une isolation aussi déficiente. Il estime que la note réelle devrait être E, voire F. Il m'a même dit — je le cite — « soit le diagnostiqueur n'a pas fait son travail, soit il a fermé les yeux ». Sophie va plus loin et pense que Gauthier a payé le diagnostiqueur pour truquer le DPE, mais je ne veux pas faire de procès d'intention sans preuves.\n\nNos questions :\n- Le diagnostiqueur a-t-il été négligent ou potentiellement complice du vendeur ?\n- Peut-on engager sa responsabilité en plus de celle du vendeur ?\n- Si le DPE est avéré frauduleux, ça change quoi dans notre procédure ?\n\nMerci pour tout, Maître.\n\nCordialement,\nPatrick Roux\n06 45 67 89 01",
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
    from_email: "Famille Roux <p.roux@wanadoo.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
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
      "TRIBUNAL DE GRANDE INSTANCE DE PARIS\n2e CHAMBRE CIVILE\n4, boulevard du Palais — 75001 Paris\nTéléphone : 01 44 32 51 51\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCONVOCATION À L'AUDIENCE\nRéférence dossier : RG 25/04512\nN° de parquet : PQ 25/2026-04512\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nMaître Alexandra FERNANDEZ\nAvocate au Barreau de Paris\nCabinet Fernandez\nToque : D1234\n\nMaître,\n\nPar la présente, et en application de l'article 760 du Code de procédure civile, nous avons l'honneur de vous informer que l'affaire enregistrée sous le numéro de rôle général RG 25/04512, inscrite au répertoire de la 2e chambre civile, opposant :\n\nDEMANDERESSE :\nMme Claire DUBOIS, née le 14 mars 1982 à Bordeaux (Gironde)\nDemeurant : 8, résidence Les Tilleuls, 75012 Paris\nReprésentée par : Me Alexandra FERNANDEZ, avocate au Barreau de Paris\n\nDÉFENDERESSE :\nSCI LES TILLEULS, société civile immobilière au capital de 50 000 euros\nRCS Paris B 456 789 012\nSiège social : 15, rue de la Roquette, 75011 Paris\nReprésentée par son gérant, M. Philippe VIDAL\nReprésentée par : Me Jean-Marc GARCIA, avocat au Barreau de Paris\n\nOBJET DU LITIGE :\nContestations de charges de copropriété — Demande d'annulation de résolutions d'assemblée générale — Demande de dommages et intérêts\n\nest fixée à l'audience de PLAIDOIRIES du :\n\n📅 15 AVRIL 2026 à 14h00\nSalle 3B — 2e chambre civile\nTribunal de Grande Instance de Paris\n4, boulevard du Palais, 75001 Paris\n(Accès : Métro Cité, ligne 4 / Métro Saint-Michel, ligne 4 et RER B/C)\n\nCOMPOSITION DE LA CHAMBRE :\n- Mme Marie-Christine DUFOUR, Présidente\n- M. François LEGRAND, Assesseur\n- Mme Nathalie BERTIN, Assesseur\n- Mme Isabelle MOREAU, Greffière\n\nOBLIGATIONS PROCÉDURALES :\n1. Les conclusions récapitulatives devront être déposées au greffe au plus tard le 8 avril 2026.\n2. Les pièces complémentaires et bordereau de communication actualisé devront être déposés au greffe avant le 10 avril 2026.\n3. Toute demande de renvoi devra être formulée au plus tard 48 heures avant l'audience, par voie électronique via le RPVA, et ne sera accordée que pour motif légitime.\n\nNous vous rappelons que la non-comparution de l'une des parties pourra entraîner le prononcé d'un jugement réputé contradictoire, conformément aux dispositions de l'article 472 du Code de procédure civile.\n\nVeuillez agréer, Maître, l'expression de nos salutations distinguées.\n\nPar délégation du Greffier en chef,\nMme Isabelle MOREAU\nGreffière de la 2e chambre civile\nTribunal de Grande Instance de Paris\n\n---\nCe document est généré par le système de gestion des audiences du TGI de Paris.\nRéf. horodatage : TGI-PAR-2026-0311-143022\nNotification effectuée par voie électronique (RPVA) le 11/03/2026 à 14h30.",
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
    from_email: "Tribunal de Grande Instance <greffe.tgi@justice.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e41",
    expediteur: "Claire Dubois",
    email: "claire.dubois@orange.fr",
    objet: "PV assemblée générale copropriété",
    resume:
      "Mme Dubois transmet le PV de la dernière assemblée générale de copropriété. Les résolutions sur les charges ont été votées sans présentation du détail des postes, ce qui renforce sa contestation.",
    corps_original:
      "Cher Maître,\n\nJe vous transmets en pièce jointe le procès-verbal de la dernière assemblée générale de copropriété de la résidence Les Tilleuls, qui s'est tenue le 12 décembre 2025 dans la salle polyvalente de la mairie du 12e arrondissement. Pardonnez le délai, il m'a fallu trois relances par email au syndic pour obtenir ce document (envoi initial le 13 décembre, première relance le 3 janvier, deuxième relance le 15 janvier — j'ai reçu le PV le 22 janvier seulement, soit 40 jours après l'AG, alors que l'article 17 du décret du 17 mars 1967 prévoit un envoi dans le mois suivant).\n\nJ'ai annoté le PV au surligneur jaune sur les passages qui me semblent les plus problématiques. Voici les points clés :\n\n1. Page 3, résolution n° 5 — Approbation des comptes de l'exercice 2025 :\nLe syndic a présenté les comptes de manière globale, avec un seul chiffre total pour chaque catégorie (« charges courantes : 187 000 euros », « charges exceptionnelles : 34 000 euros »). Quand j'ai levé la main pour demander le détail des postes — ce qui est mon droit absolu en tant que copropriétaire — M. Vidal (le gérant du syndic qui faisait office de syndic de séance) m'a dit que « le détail est consultable au bureau du syndic sur rendez-vous ». J'ai insisté en citant l'article 18-1 de la loi du 10 juillet 1965, et le président de séance (M. Marchetti, copropriétaire du 5e étage, qui est un ami personnel de M. Vidal — ils jouent au golf ensemble tous les dimanches, c'est ma voisine Mme Petit qui me l'a dit) m'a coupé la parole en disant « Madame Dubois, nous avons un ordre du jour chargé, veuillez respecter le déroulement de la séance ». Quatre autres copropriétaires ont protesté verbalement mais M. Marchetti a fait voter la résolution immédiatement. Résultat : approuvée par 4 235 tantièmes contre 2 118 (les copropriétaires « amis » du syndic votent toujours en bloc).\n\n2. Page 5, résolution n° 8 — Budget prévisionnel 2026 :\nLe budget prévisionnel pour 2026 s'élève à 215 000 euros, soit une augmentation de 15% par rapport à 2025 (187 000 euros). Quand j'ai demandé la justification de cette augmentation — 15% en un an, c'est énorme, l'inflation était à 2,1% en 2025 — M. Vidal a répondu vaguement que « les coûts de maintenance augmentent » et que « le contrat de nettoyage a été renégocié à la hausse ». Renégocié à la hausse ? Qui renégocie un contrat à la hausse au détriment de ses mandants ? À moins d'avoir un intérêt personnel, évidemment...\n\n3. Page 7, résolution n° 11 — Renouvellement du mandat du syndic :\nLe mandat du syndic Les Tilleuls a été renouvelé pour 3 ans (!) sans mise en concurrence d'autres syndics, comme l'exige pourtant l'article 21 de la loi du 10 juillet 1965. J'ai demandé que d'autres devis soient présentés et M. Marchetti m'a dit que « le conseil syndical a estimé que le syndic actuel donnait satisfaction ». Le conseil syndical, c'est 3 personnes dont M. Marchetti lui-même et la belle-soeur de M. Vidal. Tout est dit.\n\nJe pense que ces irrégularités sont extrêmement importantes pour notre dossier. L'AG a été conduite de manière à étouffer toute contestation et à maintenir le syndic en place sans aucun contrôle.\n\nJ'ai hâte d'avoir votre avis.\n\nCordialement,\nClaire Dubois\n06 23 45 67 89\n\nPS : j'ai compté — il y avait 18 copropriétaires présents ou représentés sur 35 (soit 51% des tantièmes). Le quorum minimum a été atteint de justesse. Mme Petit me dit que M. Marchetti avait « fait le tour des mandats de procuration » dans les jours précédant l'AG, ce qui n'est pas très déontologique...",
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
    from_email: "Claire Dubois <claire.dubois@orange.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e42",
    expediteur: "Claire Dubois",
    email: "claire.dubois@orange.fr",
    objet: "Premier contact - charges copropriété",
    resume:
      "Premier email de Mme Dubois. Elle conteste les charges de copropriété excessives facturées par la SCI Les Tilleuls. Les charges ont augmenté de 47% en deux ans sans explication.",
    corps_original:
      "Cher Maître Fernandez,\n\nJe me permets de vous contacter car je suis à bout de patience et de ressources face à une situation qui dure depuis maintenant deux ans. Avant toute chose, je m'excuse pour la longueur de cet email, mais je veux être sûre de ne rien oublier pour que vous puissiez évaluer ma situation correctement.\n\nJe suis Claire Dubois, 43 ans, comptable dans un cabinet de conseil (BDO France, si ça peut avoir de l'importance). Je suis propriétaire d'un appartement de 52 m² au 2e étage de la résidence Les Tilleuls, 8 résidence des Tilleuls, 75012 Paris. J'ai acheté cet appartement en 2018 pour 285 000 euros, seule (je suis célibataire), avec un crédit immobilier que je rembourse encore pendant 12 ans. C'est mon unique bien immobilier et toutes mes économies sont passées dedans.\n\nLa résidence est gérée par la SCI Les Tilleuls, dont le gérant est M. Philippe Vidal. Il est syndic professionnel et gère apparemment une dizaine de copropriétés dans Paris et en proche banlieue. La résidence comprend 35 lots (30 appartements et 5 commerces en rez-de-chaussée) et a été construite en 1975.\n\nMon problème, c'est les charges de copropriété. Quand j'ai acheté en 2018, elles étaient de 2 800 euros par an, ce qui était raisonnable. Et puis, progressivement, sans que personne ne s'en rende vraiment compte, elles ont augmenté :\n\n- 2018 : 2 800 euros/an\n- 2019 : 2 900 euros/an (+3,6% — rien d'anormal)\n- 2020 : 2 950 euros/an (+1,7% — COVID, tout était gelé)\n- 2021 : 3 000 euros/an (+1,7% — encore raisonnable)\n- 2022 : 3 100 euros/an (+3,3% — début de la tendance)\n- 2023 : 3 200 euros/an (+3,2% — on commence à tiquer)\n- 2024 : 3 850 euros/an (+20% !!! — là j'ai vraiment réagi)\n- 2025 : 4 700 euros/an (+22% par rapport à 2024, +47% par rapport à 2023)\n\nQuand j'étais comptable, j'ai appris à repérer les anomalies dans les chiffres. Et là, c'est flagrant : l'accélération brutale des charges à partir de 2024 ne correspond à aucune augmentation de prestations visible. La résidence n'a pas été rénovée, le gardien est toujours le même (quand il est là, ce qui n'est pas tous les jours), le ménage n'est pas mieux fait, l'ascenseur tombe en panne une fois par mois, et les espaces verts se résument à un carré de pelouse de 20 m² qui n'est tondu que quand le syndic se souvient de son existence.\n\nJ'ai demandé le détail des postes de charges à plusieurs reprises :\n- Première demande par email le 10 janvier 2025 → pas de réponse\n- Deuxième demande par courrier recommandé le 15 mai 2025 → AR signé, pas de réponse\n- Troisième demande par courrier recommandé (mise en demeure) le 20 août 2025 → AR signé, pas de réponse\n- Quatrième demande par courrier recommandé le 10 novembre 2025 → AR signé, réponse enfin reçue le 5 décembre : « Les comptes sont consultables au bureau du syndic sur rendez-vous. Veuillez prendre contact avec notre secrétariat. » Quand j'ai appelé pour prendre rendez-vous, on m'a dit que M. Vidal était « en déplacement » pour les 3 prochaines semaines.\n\nD'autres copropriétaires se plaignent aussi de la situation. Ma voisine du 3e, Mme Françoise Petit, est dans le même état que moi. Le couple du 4e étage, les Leclerc, aussi. Mais personne n'ose agir parce que « c'est compliqué, ça coûte cher, et de toute façon le syndic a les clés de l'immeuble ». C'est la loi du silence dans la copropriété.\n\nMoi, j'en ai assez. Pensez-vous que j'aie un recours ? Si oui, quel type de procédure me conseillez-vous ? Et surtout, combien ça coûte ? Je ne roule pas sur l'or (justement à cause de ces charges qui m'étouffent), mais je suis prête à me battre.\n\nMerci d'avance pour votre réponse, Maître.\n\nCordialement,\nClaire Dubois\n8, résidence Les Tilleuls — 75012 Paris\n06 23 45 67 89\nclaire.dubois@orange.fr",
    date: daysAgo(25, 10),
    dossier_id: "5",
    dossier_nom: "Claire Dubois",
    dossier_domaine: "Litige immobilier",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dubois,\n\nJe vous remercie pour votre prise de contact.\n\nUne augmentation de 47% des charges en deux ans est effectivement anormale et le syndic a une obligation légale de transparence. Vous disposez de plusieurs recours : contestation des résolutions d'AG, demande de justification des charges, voire changement de syndic.\n\nJe vous propose un rendez-vous pour examiner vos relevés de charges, PV d'AG et courriers recommandés.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Claire Dubois <claire.dubois@orange.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e43",
    expediteur: "Claire Dubois",
    email: "claire.dubois@orange.fr",
    objet: "Courriers recommandés au syndic",
    resume:
      "Mme Dubois transmet les copies de ses trois courriers recommandés au syndic Les Tilleuls demandant le détail des charges. Aucun n'a reçu de réponse, ce qui caractérise un refus de communication.",
    corps_original:
      "Cher Maître,\n\nComme vous me l'avez demandé lors de notre premier rendez-vous, je vous transmets les copies de mes trois courriers recommandés avec accusé de réception envoyés au syndic Les Tilleuls sur les 6 derniers mois. J'ai fait des photocopies des lettres ET des accusés de réception (les petits cartons verts signés), pour que le dossier soit complet. Ma soeur Patricia, qui est assistante juridique chez un notaire, m'a dit que les AR originaux seraient importants pour le tribunal, donc je les conserve précieusement chez moi dans une pochette plastique.\n\nVoici le détail chronologique :\n\n📌 Courrier n° 1 — 15 mai 2025\nObjet : Demande de communication du détail des charges de copropriété pour l'exercice 2024\nEnvoyé en LRAR au siège du syndic : SCI Les Tilleuls, 15 rue de la Roquette, 75011 Paris\nN° de recommandé : 1A 234 567 8901 2\nAR signé le : 18 mai 2025 (par « S. Moreau », sans doute la secrétaire de M. Vidal)\nRéponse reçue : AUCUNE\n\nDans ce courrier, je demandais poliment la communication du grand livre des charges, les factures des prestataires, et le détail des postes « entretien » et « honoraires syndic ». J'ai même proposé de me déplacer au bureau du syndic pour consulter les documents sur place. Silence radio.\n\n📌 Courrier n° 2 — 20 août 2025\nObjet : Mise en demeure de communiquer les comptes de copropriété — Article 18-1 de la loi du 10 juillet 1965\nEnvoyé en LRAR : même adresse\nN° de recommandé : 1A 345 678 9012 3\nAR signé le : 22 août 2025 (par « P. Vidal » — c'est le gérant lui-même qui a signé cette fois)\nRéponse reçue : AUCUNE\n\nCette fois, j'avais durci le ton. J'ai cité l'article 18-1 de la loi de 1965 et l'article 33 du décret du 17 mars 1967 qui obligent le syndic à communiquer les documents comptables à tout copropriétaire qui en fait la demande. J'ai donné un délai de 30 jours pour répondre. Rien.\n\n📌 Courrier n° 3 — 10 novembre 2025\nObjet : Dernière mise en demeure avant action en justice — Charges de copropriété abusives\nEnvoyé en LRAR : même adresse\nN° de recommandé : 1A 456 789 0123 4\nAR signé le : 13 novembre 2025 (signature illisible)\nRéponse reçue : AUCUNE\n\nDans ce dernier courrier, j'ai clairement indiqué mon intention de saisir le tribunal si les documents ne m'étaient pas communiqués sous 15 jours. J'ai même mentionné que je consultais un avocat (c'était avant de vous rencontrer, j'avais juste pris des renseignements à la permanence juridique de la mairie du 12e). Toujours rien.\n\nTrois courriers recommandés, trois accusés de réception dûment signés, zéro réponse en 6 mois. C'est désespérant et révoltant. Quand on pense que ce M. Vidal gère l'argent de 35 copropriétaires sans le moindre scrupule de transparence, ça donne envie de... enfin, passons.\n\nMa voisine Mme Petit a elle aussi envoyé un courrier recommandé en octobre, qui est resté sans réponse. Si ça peut être utile, elle m'a dit qu'elle pouvait vous en transmettre la copie.\n\nJ'espère que ces documents suffiront à montrer au tribunal que le syndic fait preuve d'un mépris total envers les copropriétaires.\n\nBien cordialement,\nClaire Dubois\n06 23 45 67 89",
    date: daysAgo(22, 14),
    dossier_id: "5",
    dossier_nom: "Claire Dubois",
    dossier_domaine: "Litige immobilier",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dubois,\n\nMerci pour ces courriers qui sont des pièces essentielles.\n\nLe triple refus de réponse du syndic constitue un manquement caractérisé à son obligation de communication (article 21 de la loi du 10 juillet 1965). C'est un argument très fort devant le tribunal.\n\nLes accusés de réception prouvent que vos demandes ont bien été reçues. Le juge en tirera les conséquences.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Claire Dubois <claire.dubois@orange.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
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
      "Cher Maître Fernandez,\n\nJe me permets de vous contacter — et croyez bien que ce n'est pas un email facile à écrire. J'ai dû m'y reprendre trois fois avant de trouver le courage d'appuyer sur « envoyer ». Écrire « je veux divorcer » noir sur blanc, même à une avocate que je ne connais pas encore, ça rend la chose terriblement réelle.\n\nC'est mon amie Sophie Leroy qui m'a donné votre nom. Vous l'avez accompagnée pour son divorce il y a deux ans et elle a été, je cite, « bluffée par votre humanité et votre professionnalisme ». Sophie est ma meilleure amie depuis la fac et je lui fais entièrement confiance quand elle me recommande quelqu'un.\n\nVoici ma situation, aussi simplement que possible :\n\nJe m'appelle Alice Bernard, j'ai 36 ans. Je suis graphiste freelance (je travaille depuis chez moi, ce qui va être un point important pour la garde des enfants car je suis très disponible). Mon mari, Thomas Bernard, a 38 ans et il est ingénieur en cybersécurité chez Thales (CDI, il gagne bien sa vie, environ 43 000 euros par an).\n\nNous nous sommes mariés le 15 juillet 2018 à la mairie du 11e arrondissement de Paris, sous le régime légal de la communauté réduite aux acquêts (pas de contrat de mariage). Nous avons deux enfants :\n- Léa, née le 8 septembre 2019 (elle aura 7 ans en septembre) — elle est en CE1 à l'école élémentaire Voltaire, Paris 11e\n- Hugo, né le 3 mars 2022 (il a 4 ans) — il est en moyenne section à la maternelle Voltaire, même rue\n\nNous sommes aussi propriétaires d'un appartement de 65 m² au 28, rue Oberkampf, Paris 11e. On l'a acheté ensemble en mars 2020 (oui, juste avant le premier confinement — on avait le sens du timing !) pour 380 000 euros avec un crédit immobilier à la Banque Populaire.\n\nPour être tout à fait honnête avec vous, notre couple s'est délité progressivement depuis la naissance de Hugo. Pas de drame, pas de trahison, pas de violence — juste un éloignement progressif, une lassitude, des centres d'intérêt qui ont divergé. Thomas est devenu très absorbé par son travail (il part tôt, rentre tard), et moi j'ai eu l'impression de porter seule la charge mentale de la famille. On a essayé la thérapie de couple pendant 6 mois avec une psychologue du 11e, Mme Leduc, mais ça n'a pas suffi. On s'est regardés un soir et on s'est dit « on n'est plus heureux ensemble ».\n\nLa bonne nouvelle dans tout ça (si on peut parler de bonne nouvelle), c'est que Thomas et moi sommes d'accord sur tout :\n- La garde : alternée, une semaine sur deux, avec l'école comme point de bascule le lundi matin\n- L'appartement : je le garde et je rachète sa part (il ira en location)\n- Les enfants : pas de pension alimentaire car nos revenus sont proches\n- L'ambiance : on reste en bons termes, on veut que les enfants vivent ça le mieux possible\n\nOn souhaite donc un divorce par consentement mutuel, le plus simple et le plus rapide possible. Les enfants ne savent pas encore — on voulait attendre d'avoir lancé la procédure pour leur annoncer de manière encadrée (notre psy nous a donné des conseils sur comment faire).\n\nPourriez-vous me recevoir pour un premier rendez-vous ? Je suis flexible sur les horaires (avantage du freelance). Et combien coûte approximativement un divorce par consentement mutuel, pour que je puisse prévenir Thomas ?\n\nMerci d'avance pour votre réponse, et pardon pour ce long email.\n\nCordialement,\nAlice Bernard\n28, rue Oberkampf — 75011 Paris\n06 12 34 56 78\nalice.b@free.fr\n\nPS : Sophie me dit de vous dire bonjour de sa part. Et de vous féliciter pour votre déménagement dans le nouveau cabinet.",
    date: daysAgo(25, 15),
    dossier_id: "6",
    dossier_nom: "Alice Bernard",
    dossier_domaine: "Droit de la famille",
    category: "client",
    email_type: "demande",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Bernard,\n\nJe vous remercie pour votre confiance.\n\nLe divorce par consentement mutuel est la procédure la plus adaptée quand les époux sont d'accord. Depuis la réforme de 2017, cette procédure se fait par acte d'avocat sans passage devant le juge.\n\nJe vous propose un premier rendez-vous à mon cabinet. Munissez-vous du livret de famille, acte de mariage, titres de propriété et 3 derniers avis d'imposition.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Alice Bernard <alice.b@free.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e45",
    expediteur: "Alice Bernard",
    email: "alice.b@free.fr",
    objet: "Titre de propriété appartement",
    resume:
      "Mme Bernard transmet le titre de propriété de l'appartement conjugal à Paris 11e. L'appartement a été acheté en 2020 pour 380 000 euros avec un crédit en cours de 245 000 euros.",
    corps_original:
      "Cher Maître,\n\nComme convenu lors de notre rendez-vous (merci encore, c'était vraiment rassurant de vous rencontrer en personne — vous dégagez un calme qui fait du bien quand on est dans la tempête émotionnelle d'un divorce), je vous transmets en pièce jointe le titre de propriété de notre appartement.\n\nIl s'agit de l'appartement situé au 28, rue Oberkampf, 75011 Paris, 3e étage gauche, lot n° 34 de la copropriété. C'est un T3 de 65 m² (loi Carrez), avec une petite cave au sous-sol (lot n° 78).\n\nQuelques précisions utiles que j'ai rassemblées pour vous (Thomas m'a aidée, il est plus méthodique que moi pour les questions financières) :\n\n• Achat en indivision 50/50, acte notarié du 6 mars 2020, reçu par Me Delacroix de l'étude Delacroix-Joubert, 14 boulevard Voltaire, Paris 11e\n• Prix d'achat : 380 000 euros (hors frais de notaire — les frais étaient de 28 500 euros si je me souviens bien)\n• Crédit immobilier : Banque Populaire, prêt n° 20-IMMO-74523, taux fixe 1,45%, durée 25 ans, mensualités de 1 547 euros. Capital restant dû au 1er mars 2026 : environ 245 000 euros (j'ai regardé sur notre espace client en ligne).\n• Charges de copropriété : 220 euros/mois (c'est raisonnable, notre syndic est correct — si seulement tous les syndics étaient comme le nôtre !)\n• Taxe foncière : 1 850 euros/an\n• Estimation actuelle : j'ai demandé à l'agence du quartier (Century 21 Oberkampf), ils estiment la valeur entre 410 000 et 430 000 euros. Disons 420 000 euros pour faire un chiffre rond.\n\nThomas et moi sommes d'accord sur le principe : je garde l'appartement et je lui rachète sa part. C'est plus logique car :\n1. Les enfants sont scolarisés dans le quartier et je veux leur éviter un déménagement\n2. Thomas préfère aller en location dans le 12e (il a repéré un T2 à 1 200 euros/mois près de la gare de Lyon, ce qui lui simplifie le trajet pour aller chez Thales à Palaiseau)\n3. Je peux reprendre le crédit à mon nom seul car mes revenus de freelance + mon épargne suffisent (j'ai vérifié avec la banque, ils sont OK en principe)\n\nMes questions :\n- Faut-il faire une estimation officielle par un expert immobilier agréé, ou l'estimation de l'agence suffit-elle pour la convention de divorce ?\n- Comment calcule-t-on exactement la « soulte » que je dois verser à Thomas ? Est-ce que c'est (420 000 - 245 000) / 2 = 87 500 euros ? Ou c'est plus compliqué que ça ?\n- Est-ce qu'il y a des frais de notaire sur le rachat de la part de Thomas ? Parce que si oui, il faut que je les budgétise...\n\nMerci pour votre patience avec toutes mes questions. Je sais que ça doit vous sembler très basique pour une avocate, mais c'est la première fois que je divorce (et j'espère la dernière !).\n\nCordialement,\nAlice Bernard\n06 12 34 56 78",
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
    from_email: "Alice Bernard <alice.b@free.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e46",
    expediteur: "Alice Bernard",
    email: "alice.b@free.fr",
    objet: "Accord sur la garde des enfants",
    resume:
      "Mme Bernard détaille l'accord trouvé avec son mari sur la garde alternée des enfants. Elle demande comment formaliser ces arrangements dans la convention de divorce.",
    corps_original:
      "Cher Maître,\n\nThomas et moi avons eu une longue conversation hier soir (après avoir couché les enfants, comme d'habitude — ces discussions se font toujours à 21h30 autour d'une tisane, c'est devenu notre petit rituel de « négociation de divorce », aussi absurde que ça puisse paraître). Et nous avons finalisé notre accord sur la garde des enfants.\n\nJe vous détaille tout parce que je sais que la précision est importante dans une convention de divorce :\n\n1. Garde alternée : une semaine sur deux, du lundi matin au lundi suivant. Le « parent sortant » dépose les enfants à l'école le lundi matin, et le « parent entrant » les récupère à la sortie de l'école le même jour. Ça évite le moment un peu gênant du « passage de relais » entre parents, et c'est mieux pour les enfants qui font la transition en douceur dans un lieu neutre (l'école). C'est notre psy Mme Leduc qui nous a conseillé cette formule.\n\n2. Vacances scolaires : on a opté pour un système d'alternance que Sophie Leroy (mon amie) nous a recommandé parce que ça avait bien fonctionné pour elle :\n   - Années paires (2026, 2028...) : première moitié des vacances chez papa, deuxième moitié chez maman\n   - Années impaires (2027, 2029...) : l'inverse\n   - Exception : Noël et jour de l'An alternent chaque année (les années paires Noël chez papa et Jour de l'An chez maman, et vice versa)\n   - Les vacances d'été sont coupées en deux au 15 juillet ou au 1er août (à déterminer)\n\n3. Pas de pension alimentaire : Thomas et moi avons des revenus quasi équivalents (moi environ 45 000 euros/an en freelance, lui environ 43 000 euros/an chez Thales). On part du principe que chacun assume les frais courants des enfants pendant sa semaine de garde. Les dépenses exceptionnelles (rentrée scolaire, activités extrascolaires, voyages scolaires, frais médicaux non remboursés) seraient partagées 50/50 sur présentation de justificatifs.\n\n4. Scolarité : les enfants restent dans leurs écoles actuelles (école et maternelle Voltaire, Paris 11e). C'est non-négociable pour nous deux — ils ont leurs copains, leurs repères, et la directrice est formidable.\n\n5. Clause de non-éloignement : chacun de nous s'engage à ne pas déménager à plus de 20 km du domicile de l'autre parent, sauf accord mutuel. Thomas a déjà repéré un appartement dans le 12e, à 4 km de la rue Oberkampf, donc c'est parfait.\n\n6. Point sensible : les animaux. On a un chat, Biscotte (je sais, ça prête à sourire dans un contexte juridique, mais pour les enfants c'est important). On a décidé que Biscotte resterait avec moi dans l'appartement et que les enfants le retrouveraient pendant « ma » semaine.\n\nComment intègre-t-on tout cela dans la convention de divorce ? Est-ce qu'il faut tout détailler ou est-ce qu'on peut rester sur des principes généraux ? Thomas étant ingénieur, il aimerait que tout soit le plus précis possible (il dit « une convention, c'est comme un cahier des charges, il faut être exhaustif »). Moi, j'ai peur que trop de détails rendent les choses rigides.\n\nQuel est votre avis, Maître ?\n\nCordialement,\nAlice Bernard\n06 12 34 56 78\n\nPS : Thomas me demande aussi si la clause de non-éloignement est juridiquement contraignante ou si c'est juste « symbolique ». Il veut être sûr que je ne partirai pas vivre en Bretagne chez ma mère (c'est une blague entre nous, ma mère habite à Vannes et elle rêve que je m'installe là-bas).",
    date: daysAgo(15, 14),
    dossier_id: "6",
    dossier_nom: "Alice Bernard",
    dossier_domaine: "Droit de la famille",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Bernard,\n\nVotre accord est clair et bien structuré. Je vais le formaliser dans la convention de divorce.\n\nQuelques précisions importantes : même en cas de revenus équivalents, le juge pourrait recommander une pension alimentaire symbolique. La clause de non-éloignement de 20 km est tout à fait valable.\n\nJe rédige un projet de convention que je vous transmettrai pour relecture. Votre mari devra la faire valider par son propre avocat.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Alice Bernard <alice.b@free.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e47",
    expediteur: "Alice Bernard",
    email: "alice.b@free.fr",
    objet: "Avis d'imposition 2023-2025",
    resume:
      "Mme Bernard transmet les trois derniers avis d'imposition du couple. Les revenus combinés s'élèvent à environ 85 000 euros annuels, répartis de manière quasi égale entre les deux époux.",
    corps_original:
      "Cher Maître,\n\nVoici nos trois derniers avis d'imposition comme demandé. Thomas les avait bien rangés dans un classeur « Finances » (il est d'une maniaquerie que même Marie Kondo lui envierait), donc pour une fois, on a retrouvé les documents facilement.\n\nJe vous les scanne et vous les envoie en pièce jointe. Voici le résumé chiffré :\n\n📊 Avis d'imposition 2023 (revenus 2022) :\n- Revenu fiscal de référence du foyer : 82 500 euros\n- Détail : Alice (revenus BNC, micro-entrepreneur puis réel simplifié) : 42 000 euros / Thomas (revenus salariaux, Thales) : 40 500 euros\n- Impôt sur le revenu payé : 7 890 euros\n- Quotient familial : 3 parts (2 adultes + 2 enfants)\n\n📊 Avis d'imposition 2024 (revenus 2023) :\n- Revenu fiscal de référence du foyer : 85 200 euros\n- Détail : Alice : 43 500 euros / Thomas : 41 700 euros\n- Impôt sur le revenu payé : 8 340 euros\n- Quotient familial : 3 parts\n\n📊 Avis d'imposition 2025 (revenus 2024) :\n- Revenu fiscal de référence du foyer : 87 800 euros\n- Détail : Alice : 45 000 euros / Thomas : 42 800 euros\n- Impôt sur le revenu payé : 8 780 euros\n- Quotient familial : 3 parts\n\nNos revenus sont effectivement très proches — l'écart est de l'ordre de 2 000 à 2 500 euros par an, ce qui est marginal. Thomas a une progression salariale plus régulière (augmentation annuelle de 2-3% chez Thales, c'est l'avantage du CDI dans un grand groupe), tandis que mes revenus de freelance sont plus irréguliers (bonne année en 2024 grâce à un gros contrat avec une agence de pub, mais 2025 devrait être plus modeste).\n\nJe précise que Thomas a aussi un Plan d'Épargne Entreprise (PEE) chez Thales qui contient environ 12 000 euros d'intéressement/participation accumulés depuis 2019. De mon côté, j'ai un PEL à 8 500 euros (ouvert il y a des années, je ne le touche plus) et un Livret A avec environ 5 000 euros (c'est ma « réserve de sécurité » de freelance). On en a discuté et on pense que chacun garde ses propres placements — ça vous semble correct ?\n\nEn tout cas, l'écart de revenus étant aussi faible, je pense que l'absence de pension alimentaire dans notre convention ne devrait poser aucun problème. C'est ce que vous m'aviez dit aussi, si je me souviens bien.\n\nDites-moi si vous avez besoin d'autres documents financiers. Thomas propose de vous envoyer aussi ses fiches de paie si nécessaire.\n\nCordialement,\nAlice Bernard\n06 12 34 56 78",
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
    from_email: "Alice Bernard <alice.b@free.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
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
      "Chers Confrères et Consoeurs,\n\nL'Ordre des Avocats de Paris a le plaisir de vous convier à la 47e édition du Gala annuel du Barreau de Paris, événement incontournable de la vie de notre profession et moment privilégié de convivialité entre confrères.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✨ GALA ANNUEL DU BARREAU DE PARIS ✨\n47e édition — « L'avocat, artisan de la justice »\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📅 Date : Samedi 20 avril 2026\n🕗 Heure : Accueil à 19h30 — Cocktail à 20h00 — Dîner à 21h00\n📍 Lieu : Salle des Pas Perdus, Palais de Justice de Paris\n   4, boulevard du Palais, 75001 Paris\n   (Métro Cité, ligne 4)\n👔 Dress code : Tenue de soirée (pour mesdames et messieurs)\n\nPROGRAMME DE LA SOIRÉE :\n\n• 19h30 — Accueil et vestiaire\n• 20h00 — Cocktail de bienvenue offert par le Bâtonnier\n   Champagne, amuse-bouches, animation musicale par le Quartet du Palais\n• 20h45 — Discours d'ouverture du Bâtonnier, Me Pierre-Antoine Leclercq\n• 21h00 — Dîner assis, 4 services\n   Menu élaboré par le chef étoilé Yannick Alléno (Le Pavillon Ledoyen)\n   Accord mets et vins sélectionné par notre sommelier\n• 22h30 — Remise des prix :\n   - Prix du Jeune Avocat de l'année 2026\n   - Prix de l'Innovation juridique\n   - Prix du Pro Bono\n• 23h00 — Ouverture du bal\n   Orchestre « Les Juristes Jazzy » (formation de 8 musiciens)\n• 01h00 — Fin de la soirée\n\nINFORMATIONS PRATIQUES :\n\n• Places limitées à 500 convives (premier arrivé, premier servi)\n• Tarif : 65 euros par personne (dîner et boissons inclus)\n• Tarif jeune avocat (prestation de serment < 5 ans) : 45 euros\n• Possibilité d'acheter des tables de 8 ou 10 personnes pour les cabinets\n• Menu végétarien disponible sur demande\n• Parking Palais de Justice : accès réservé sur présentation du billet\n\nINSCRIPTION :\nRendez-vous sur gala.barreaudeparis.fr avant le 10 avril 2026.\nPaiement par carte bancaire ou virement.\n\n⚠️ Attention : 380 places déjà réservées, il ne reste que 120 places disponibles !\n\nNous comptons sur votre présence nombreuse pour faire de cette soirée un moment mémorable de fraternité et de convivialité.\n\nConfraternellement,\n\nLe Comité d'organisation du Gala 2026\nPrésidente : Me Véronique Duval-Arnaud\nVice-président : Me Stéphane de La Rosa\nContact : gala@barreaudeparis.fr — 01 44 32 49 50\n\n---\nVous recevez cet email en tant que membre inscrit au Barreau de Paris.\nPour vous désabonner : parametres.ordre-avocats-paris.fr/newsletters",
    date: daysAgo(8, 7),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "newsletter",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Newsletter Ordre des Avocats <newsletter@ordre-avocats-paris.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e49",
    expediteur: "Claire Dubois",
    email: "claire.dubois@orange.fr",
    objet: "Témoignage de ma voisine",
    resume:
      "Mme Dubois informe qu'une voisine copropriétaire, Mme Petit, est prête à témoigner des irrégularités du syndic Les Tilleuls. Elle subit les mêmes augmentations de charges et a des preuves de surfacturation.",
    corps_original:
      "Cher Maître,\n\nUne excellente nouvelle pour notre dossier ! J'ai eu une longue conversation hier soir avec ma voisine du 3e étage, Mme Françoise Petit (que je croise régulièrement dans l'ascenseur et avec qui je râle contre le syndic depuis des mois). Elle m'a dit qu'elle était prête à témoigner officiellement dans notre affaire contre la SCI Les Tilleuls. C'est la première fois qu'un copropriétaire accepte de s'engager à côté de moi, et franchement, ça me fait un bien fou de ne plus me sentir seule dans ce combat.\n\nFrançoise (je me permets de l'appeler par son prénom car on est devenues assez proches depuis cette histoire) est une ancienne chef comptable à la retraite. Elle a 62 ans, elle est très rigoureuse et méthodique — exactement le profil de témoin crédible, je pense. Elle a ses propres griefs contre le syndic :\n\n1. Les charges : elle subit exactement les mêmes augmentations que moi. Son appartement (3 pièces, 58 m²) est passé de 3 400 euros/an en 2023 à 5 100 euros/an en 2025. C'est encore pire que moi en proportion (+50% en deux ans).\n\n2. Le poste « entretien espaces verts » : c'est son cheval de bataille. Françoise a calculé que ce poste est facturé 8 000 euros par an à la copropriété. Or, les « espaces verts » de la résidence, c'est un carré de pelouse de 20 m² dans la cour, deux bacs à fleurs en béton devant l'entrée, et un arbuste (un laurier, je crois). 8 000 euros pour tondre 20 m² de pelouse et arroser un laurier, même en comptant un passage par semaine, c'est astronomique. Françoise pense que l'entreprise de jardinage est surfacturée et pourrait avoir des liens avec M. Vidal.\n\n3. Le gardien : Françoise a tenu un « journal de présence » du gardien, M. Boumediene, pendant 3 mois (octobre, novembre, décembre 2025). Elle a noté les heures d'arrivée et de départ du gardien chaque jour. Résultat : le gardien est censé être à plein temps (35 heures/semaine, de 7h30 à 15h30), mais en réalité il ne fait qu'une vingtaine d'heures par semaine. Il arrive souvent à 9h, part à 14h, et ne vient pas du tout le vendredi une semaine sur deux. Françoise a tout noté dans un cahier avec les dates et les heures précises. C'est de l'or en barre, non ?\n\n4. Petit détail intéressant : Françoise m'a aussi appris que le gardien M. Boumediene est un cousin par alliance de M. Vidal (le gérant du syndic). C'est la soeur de Mme Vidal qui est mariée avec le frère de M. Boumediene, ou quelque chose comme ça — les liens familiaux sont un peu compliqués, mais le lien existe. Ça expliquerait pourquoi le gardien fait ce qu'il veut sans que le syndic ne dise rien.\n\nPuis-je transmettre vos coordonnées à Françoise pour qu'elle vous envoie directement son attestation ? Elle m'a dit qu'elle pouvait aussi venir à votre cabinet si vous préférez la rencontrer en personne avant l'audience. Elle est très disponible (elle est à la retraite).\n\nEst-ce qu'on devrait aussi essayer de rallier d'autres copropriétaires ? Le couple Leclerc du 4e est mécontent aussi, mais ils sont plus timides. Avec le témoignage de Françoise, peut-être qu'ils oseront se joindre à nous ?\n\nMerci encore, Maître. Je sens qu'on avance !\n\nCordialement,\nClaire Dubois\n06 23 45 67 89\n\nPS : Françoise me demande si elle peut être partie prenante dans le procès (« intervention volontaire », elle a retenu le terme juridique) ou si elle peut seulement témoigner. Elle est très motivée !",
    date: daysAgo(9, 10),
    dossier_id: "5",
    dossier_nom: "Claire Dubois",
    dossier_domaine: "Litige immobilier",
    category: "client",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock:
      "Chère Madame Dubois,\n\nC'est une excellente nouvelle. Le témoignage de Mme Petit renforcera considérablement notre dossier, surtout concernant la surfacturation du poste espaces verts.\n\nOui, transmettez-lui mes coordonnées. Je lui enverrai un modèle d'attestation conforme à l'article 202 du Code de procédure civile.\n\nPlus nous aurons de copropriétaires témoins, plus notre argumentation sera solide devant le tribunal.\n\nCordialement,\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
    from_email: "Claire Dubois <claire.dubois@orange.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e50",
    expediteur: "Pub LegalTech",
    email: "marketing@legalstart.fr",
    objet: "Automatisez vos contrats avec l'IA",
    resume:
      "Email promotionnel d'une LegalTech proposant un outil de génération automatique de contrats. Offre d'essai gratuit de 14 jours. Aucun intérêt pour le cabinet.",
    corps_original:
      "Bonjour Maître Fernandez,\n\nEt si vous pouviez diviser par 10 le temps passé à rédiger vos contrats ? C'est la promesse de LegalStart Pro, la plateforme de rédaction juridique assistée par intelligence artificielle qui révolutionne déjà le quotidien de plus de 3 500 avocats en France.\n\n🚀 POURQUOI LES AVOCATS ADOPTENT LEGALSTART PRO ?\n\nDans un cabinet d'avocat, la rédaction de contrats représente en moyenne 35% du temps de travail facturable. Notre IA juridique, entraînée sur plus de 2 millions de documents juridiques français, vous permet de :\n\n✅ Générer un contrat complet et personnalisé en moins de 5 minutes\n✅ Choisir parmi plus de 200 modèles validés et mis à jour par notre comité scientifique de 12 avocats et professeurs de droit\n✅ Bénéficier de la mise à jour automatique de vos modèles avec les dernières évolutions législatives et jurisprudentielles\n✅ Intégrer la signature électronique certifiée eIDAS directement dans vos documents\n✅ Stocker vos contrats en toute sécurité sur nos serveurs hébergés en France (certifiés ISO 27001)\n✅ Collaborer avec vos clients via un espace de relecture partagé\n\n📊 LES CHIFFRES QUI PARLENT :\n• 92% de nos utilisateurs déclarent gagner plus de 5 heures par semaine\n• 87% estiment que la qualité de leurs contrats s'est améliorée\n• 4,7/5 de note moyenne sur Trustpilot (856 avis)\n\n💬 CE QU'EN DISENT VOS CONFRÈRES :\n« Depuis que j'utilise LegalStart Pro, j'ai pu prendre 30% de dossiers en plus tout en partant du cabinet à 19h. » — Me Sophie R., avocate à Lyon\n\n« L'IA ne remplace pas l'avocat, elle supprime les tâches répétitives pour nous laisser nous concentrer sur la valeur ajoutée. » — Me François D., avocat à Paris\n\n🎁 OFFRE SPÉCIALE — ESSAI GRATUIT DE 14 JOURS :\n\nCréez votre compte maintenant sur legalstart.fr/pro et accédez immédiatement à l'ensemble de nos fonctionnalités premium :\n\n• Sans engagement, sans carte bancaire\n• Accès à tous les modèles de contrats\n• Support dédié par chat et téléphone\n• Webinaire de prise en main offert\n\nTarif après l'essai : à partir de 49 euros HT/mois (facturation annuelle)\nTarif mensuel sans engagement : 69 euros HT/mois\n\n👉 Créez votre compte : legalstart.fr/pro?ref=emailing-mars-2026&source=cabinet\n\nÀ bientôt sur LegalStart Pro !\n\nL'équipe LegalStart\n\n---\nLegalStart SAS — 42 rue de la Chaussée d'Antin, 75009 Paris\nRCS Paris B 678 901 234 — TVA FR 12 678901234\nVous recevez cet email car votre adresse figure dans l'annuaire du Barreau de Paris.\nSe désabonner : legalstart.fr/unsubscribe\nPolitique de confidentialité : legalstart.fr/privacy",
    date: daysAgo(10, 8),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "spam",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Pub LegalTech <marketing@legalstart.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e51",
    expediteur: "Bulletin Dalloz",
    email: "newsletter@dalloz.fr",
    objet: "Veille jurisprudentielle - Semaine 11",
    resume:
      "Bulletin hebdomadaire Dalloz avec un focus sur la réforme du droit des contrats et un arrêt important sur la responsabilité des constructeurs.",
    corps_original:
      "Cher(e) abonné(e),\n\nRetrouvez ci-dessous la veille jurisprudentielle sélectionnée par la Rédaction Dalloz pour la semaine 11 (du 9 au 15 mars 2026). Cette semaine, trois arrêts importants touchant à la responsabilité des constructeurs, à la réforme des sûretés et au temps partiel.\n\n═══════════════════════════════════════\n1. RESPONSABILITÉ DÉCENNALE — NOTION D'OUVRAGE\n═══════════════════════════════════════\n\nCass. 3e civ., 11 mars 2026, n° 25-12.345, FS-P+B\n\nFaits : Un particulier fait réaliser des travaux de ravalement et d'isolation par l'extérieur. Des fissures apparaissent après la réception. Le maître d'ouvrage agit sur le fondement de la garantie décennale. L'entrepreneur conteste la qualification d'ouvrage.\n\nSolution : La troisième chambre civile précise que les travaux de ravalement avec isolation par l'extérieur constituent un « ouvrage » au sens de l'article 1792 du Code civil dès lors qu'ils « modifient la structure ou le comportement thermique du bâtiment ». Elle distingue les « dommages intermédiaires » (qui relèvent de la responsabilité contractuelle de droit commun) des désordres compromettant la solidité de l'ouvrage (garantie décennale).\n\nPortée : Arrêt de principe clarifiant la frontière entre responsabilité décennale et dommages intermédiaires pour les travaux de rénovation énergétique. Important dans le contexte de la multiplication des litiges liés aux travaux d'isolation thermique par l'extérieur.\n\nNote J.-P. Karila, RDI 2026, à paraître.\n\n═══════════════════════════════════════\n2. RÉFORME DES SÛRETÉS — APPLICATION DANS LE TEMPS\n═══════════════════════════════════════\n\nCass. com., 12 mars 2026, n° 25-11.876, FS-B\n\nFaits : Un cautionnement souscrit en 2019, antérieur à la réforme issue de l'ordonnance n° 2021-1192 du 15 septembre 2021. La banque invoque les anciennes dispositions, le débiteur les nouvelles.\n\nSolution : La chambre commerciale rappelle le principe posé par l'article 37 de l'ordonnance : les contrats conclus avant le 1er janvier 2022 demeurent régis par les dispositions anciennes, y compris pour les instances introduites postérieurement. Toutefois, les nouvelles règles relatives à l'information annuelle de la caution s'appliquent immédiatement.\n\nPortée : Clarification bienvenue du régime transitoire de la réforme des sûretés, source de contentieux depuis son entrée en vigueur.\n\n═══════════════════════════════════════\n3. TEMPS PARTIEL — REQUALIFICATION\n═══════════════════════════════════════\n\nCass. soc., 13 mars 2026, n° 25-10.543, FS-P\n\nFaits : Un salarié à temps partiel (24h/semaine) effectue régulièrement des heures complémentaires portant son temps de travail effectif au-delà de 35 heures pendant plusieurs mois consécutifs. Il demande la requalification de son contrat en temps plein.\n\nSolution : La chambre sociale accueille la demande. Elle rappelle que « lorsque le recours à des heures complémentaires a pour effet de porter la durée du travail du salarié au niveau de la durée légale ou conventionnelle du travail pendant douze semaines consécutives ou pendant douze semaines au cours d'une période de quinze semaines, le contrat est présumé à temps complet ».\n\nPortée : Application stricte du mécanisme de requalification prévu par l'article L3123-8 du Code du travail. Mise en garde pour les employeurs ayant recours systématique aux heures complémentaires.\n\n═══════════════════════════════════════\nÀ NOTER ÉGALEMENT\n═══════════════════════════════════════\n\n• CA Versailles, 14 mars 2026 — Copropriété : obligations de transparence du syndic sur le détail des charges\n• Cass. 1re civ., 12 mars 2026 — Prestation compensatoire : actualisation des critères d'appréciation\n• CE, 10 mars 2026 — Aide juridictionnelle : conditions de retrait en cas de revenus dissimulés\n\nPour accéder aux textes intégraux : dalloz.fr (identifiants abonné)\n\nBonne lecture,\nLa Rédaction Dalloz\n\n---\nÉditions Dalloz — 31-35, rue Froidevaux, 75014 Paris\nSe désabonner : dalloz.fr/newsletters/unsubscribe",
    date: daysAgo(11, 7),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "newsletter",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Bulletin Dalloz <newsletter@dalloz.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e52",
    expediteur: "Notification RPVA",
    email: "rpva@avocats.fr",
    objet: "Nouvelle version e-barreau disponible",
    resume:
      "Le RPVA annonce la mise à jour de la plateforme e-barreau avec de nouvelles fonctionnalités de dépôt électronique et une interface modernisée.",
    corps_original:
      "CONSEIL NATIONAL DES BARREAUX\nDirection des Systèmes d'Information\nService RPVA / e-barreau\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nMISE À JOUR DE LA PLATEFORME E-BARREAU\nVersion 4.2.0 — Notes de version\nRéf. : RPVA-UPDATE-2026-003\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nChers Confrères,\n\nNous avons le plaisir de vous informer du déploiement prochain de la version 4.2.0 de la plateforme e-barreau, fruit de 18 mois de développement et de concertation avec les représentants de la profession. Cette mise à jour constitue une évolution majeure de l'outil de communication électronique des avocats.\n\nLa migration sera effective dès lundi prochain à 6h00. Vos identifiants de connexion (login et mot de passe) restent inchangés. Votre clé de certification RPVA reste valide.\n\nNOUVEAUTÉS DE LA VERSION 4.2.0 :\n\n1. Module de dépôt de conclusions amélioré\n   • Validation automatique du format PDF/A avant dépôt\n   • Vérification de la taille maximale (50 Mo par envoi, au lieu de 20 Mo précédemment)\n   • Numérotation automatique des pages et du bordereau de pièces\n   • Horodatage certifié conforme au règlement eIDAS\n   • Prévisualisation du document avant envoi\n\n2. Interface modernisée et responsive\n   • Nouveau design épuré et accessible (conformité RGAA niveau AA)\n   • Navigation simplifiée avec menu latéral repliable\n   • Compatible tablette et smartphone (iOS 15+ / Android 12+)\n   • Mode sombre disponible dans les paramètres\n   • Recherche full-text dans l'historique des communications\n\n3. Tableau de bord des échéances procédurales\n   • Vue calendaire des audiences à venir\n   • Alertes personnalisables (J-30, J-15, J-7, J-1) pour les délais de dépôt\n   • Export iCal compatible Outlook, Google Calendar et Apple Calendar\n   • Synchronisation automatique avec les dates fixées par les juridictions\n\n4. Notifications push sur mobile\n   • Application mobile e-barreau disponible sur App Store et Google Play\n   • Notifications en temps réel pour les nouvelles communications\n   • Notifications de dépôt adverse (dans les 15 minutes suivant le dépôt)\n   • Rappels d'échéances personnalisables\n\n5. Améliorations diverses\n   • Temps de chargement réduit de 60% (passage au protocole HTTP/3)\n   • Signature électronique multi-documents\n   • Historique des communications consultable sur 10 ans (au lieu de 5 ans)\n   • Export des données en format CSV et Excel\n\nCONFIGURATION REQUISE :\n• Navigateur : Chrome 100+, Firefox 100+, Safari 16+, Edge 100+\n• Clé RPVA : version 3.x ou supérieure\n• Internet Explorer n'est plus supporté\n\nSUPPORT ET FORMATION :\n• Webinaire de présentation : mercredi prochain, 12h30-13h30 (inscription sur cnb.avocat.fr/webinaires)\n• Guide utilisateur PDF : disponible sur cnb.avocat.fr/e-barreau/documentation\n• Support technique : 01 53 30 85 60 (lun-ven, 9h-18h) ou support.rpva@cnb.avocat.fr\n\nNous vous remercions de votre patience pendant la phase de migration et restons à votre disposition pour toute question.\n\nLe Service Technique\nDirection des Systèmes d'Information\nConseil National des Barreaux\n22, rue de Londres — 75009 Paris",
    date: daysAgo(13, 9),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "notification",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Notification RPVA <rpva@avocats.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e53",
    expediteur: "Spam Logiciel Comptable",
    email: "promo@comptaexpert.fr",
    objet: "Offre spéciale profession libérale -30%",
    resume:
      "Email promotionnel pour un logiciel comptable avec une réduction de 30% pour les professions libérales. Aucun intérêt pour le cabinet.",
    corps_original:
      "Cher(e) professionnel(le) libéral(e),\n\nVous êtes avocat(e), médecin, architecte, consultant(e) ? La comptabilité de votre cabinet vous prend trop de temps et vous empêche de vous consacrer à votre coeur de métier ? Nous avons LA solution pour vous.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🏆 COMPTAEXPERT PRO — ÉLU MEILLEUR LOGICIEL COMPTABLE\nPROFESSIONS LIBÉRALES 2025 (Trophées Infogreffe)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nRejoignez les 12 000 professionnels libéraux qui ont déjà simplifié leur comptabilité avec ComptaExpert Pro :\n\n📋 Déclaration 2035 automatisée\nNotre IA analyse vos écritures comptables et pré-remplit automatiquement votre déclaration 2035 (BNC). Plus besoin de passer des heures à recopier vos chiffres. Transmission directe à l'administration fiscale via le portail impots.gouv.fr.\n\n🏦 Rapprochement bancaire intelligent\nConnectez votre compte professionnel (plus de 350 banques compatibles) et notre algorithme catégorise automatiquement 95% de vos transactions. Les 5% restants ? Un simple clic pour les affecter au bon poste.\n\n📊 Tableaux de bord en temps réel\nVisualisez en un coup d'oeil votre chiffre d'affaires, vos charges, votre résultat prévisionnel et vos échéances fiscales. Comparez avec l'année précédente. Exportez en PDF pour votre banquier.\n\n📤 Export direct vers votre comptable\nEnvoyez votre FEC (Fichier des Écritures Comptables) à votre expert-comptable en un clic. Compatible avec tous les logiciels du marché (Sage, Cegid, ACD, Quadratus...).\n\n💡 Et aussi :\n• Gestion de la TVA (si assujetti)\n• Suivi des honoraires et facturation\n• Carnet de recettes/dépenses conforme AGA\n• Archivage légal des justificatifs (conformité DGFiP)\n• Application mobile iOS/Android\n• Support technique illimité par chat et téléphone\n\n🎉 OFFRE EXCLUSIVE — CODE PROMO AVOCAT2026 :\n\n• Tarif normal : 42 euros HT/mois\n• Avec le code AVOCAT2026 : 29 euros HT/mois (soit -30%)\n• Offre valable pour les 12 premiers mois d'abonnement\n• Essai gratuit de 30 jours — sans carte bancaire, sans engagement\n\n💬 « ComptaExpert m'a fait gagner 3 heures par semaine. Mon expert-comptable est ravi de la qualité des exports. » — Me Laurent P., avocat à Bordeaux\n\n👉 Essayez gratuitement : comptaexpert.fr/essai-gratuit?code=AVOCAT2026\n\nL'équipe ComptaExpert\n\n---\nComptaExpert SAS — 8, rue de la Paix, 75002 Paris\nRCS Paris B 789 012 345\nSe désabonner : comptaexpert.fr/unsubscribe",
    date: daysAgo(14, 11),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "spam",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Spam Logiciel Comptable <promo@comptaexpert.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e54",
    expediteur: "Notification Tribunal",
    email: "notifications@justice.gouv.fr",
    objet: "Accusé de réception assignation",
    resume:
      "Le greffe accuse réception de l'assignation déposée dans l'affaire Roux c/ Gauthier. Le dossier est enregistré sous le numéro RG 26/02891.",
    corps_original:
      "TRIBUNAL DE GRANDE INSTANCE DE PARIS\nService du greffe civil — Bureau d'enregistrement\n4, boulevard du Palais — 75001 Paris\nTéléphone : 01 44 32 51 51\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nACCUSÉ DE RÉCEPTION D'ASSIGNATION\nEnregistrement au répertoire général\nRéférence interne : GR-2026-03-CIVIL-02891\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nMaître Alexandra FERNANDEZ\nAvocate au Barreau de Paris\nCabinet Fernandez\nToque : D1234\n\nMaître,\n\nNous avons l'honneur de vous informer que le greffe du Tribunal de Grande Instance de Paris accuse réception de l'assignation en garantie des vices cachés sur le fondement des articles 1641 et suivants du Code civil, déposée en date de ce jour par voie électronique via le RPVA, au nom et pour le compte de :\n\nDEMANDEURS :\nM. Patrick ROUX, né le 3 mai 1991 à Nantes (Loire-Atlantique)\net Mme Sophie ROUX née MERCIER, née le 12 septembre 1993 à Paris 14e\nDemeurant ensemble au 45, avenue des Lilas, 75019 Paris\nReprésentés par : Me Alexandra FERNANDEZ, avocate au Barreau de Paris (Toque D1234)\n\nDÉFENDEUR :\nM. Jean-Claude GAUTHIER, né le 12 avril 1958 à Lyon (Rhône)\nDernier domicile connu en France : 45, avenue des Lilas, 75019 Paris\nDomicile actuel déclaré : Rua das Flores, 28, 3° Dto, 1200-195 Lisboa, Portugal\nReprésenté par : non constitué à ce jour\n\nOBJET DE LA DEMANDE :\nAction en garantie des vices cachés — Demande d'indemnisation au titre des articles 1641, 1644 et 1645 du Code civil — Responsabilité du vendeur de mauvaise foi\n\nENREGISTREMENT :\nNuméro de rôle général : RG 26/02891\nJuridiction : TGI Paris, 5e chambre civile\nDate d'enregistrement : ce jour\nHeure d'enregistrement : 11h23\nNombre de pages de l'assignation : 24\nNombre de pièces visées au bordereau : 8\n\nINFORMATIONS PROCÉDURALES :\n• L'assignation a été placée au rôle de la 5e chambre civile, présidée par Mme la Juge BERTRAND.\n• L'audience d'orientation sera fixée ultérieurement et vous sera notifiée par voie dématérialisée via le RPVA dans un délai de 15 jours.\n• Le défendeur sera assigné à son domicile portugais. Conformément au Règlement (UE) n° 1393/2007 relatif à la signification et à la notification des actes judiciaires, la signification à l'étranger sera effectuée par voie diplomatique ou par l'entité requise de l'État membre de destination. Les délais de comparution seront augmentés en conséquence (article 643 du CPC : augmentation de 2 mois pour les personnes domiciliées dans un État de l'UE).\n• Vous êtes invité(e) à constituer le dossier de plaidoirie conformément aux instructions de la chambre (guide disponible sur e-barreau, rubrique « 5e chambre civile »).\n\nLe présent accusé de réception vaut notification au sens de l'article 748-3 du Code de procédure civile.\n\nVeuillez agréer, Maître, l'expression de nos salutations distinguées.\n\nPar délégation du Greffier en chef,\nM. Jean-Marc LEFORT\nGreffier — Service de l'enregistrement civil\nTribunal de Grande Instance de Paris\n\n---\nCe message est généré automatiquement. Réf. horodatage : TGI-PAR-2026-0312-112315-SHA256\nEn cas de difficulté technique : support.greffe@justice.gouv.fr",
    date: daysAgo(15, 9),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "notification",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Notification Tribunal <notifications@justice.gouv.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e55",
    expediteur: "Pub Fournitures Bureau",
    email: "offres@bureau-discount.fr",
    objet: "Papier A4 à prix cassé",
    resume:
      "Email publicitaire pour des fournitures de bureau à prix réduit. Ramettes de papier A4, toners et accessoires. Aucun intérêt.",
    corps_original:
      "Bonjour,\n\n🌸 GRANDE VENTE DE PRINTEMPS — JUSQU'À -40% SUR TOUT LE CATALOGUE ! 🌸\n\nBureau Discount, le spécialiste des fournitures de bureau depuis 1998, vous propose des offres exceptionnelles pour équiper votre cabinet à prix cassés. Plus de 15 000 références en stock, livrées en 24/48h en Île-de-France.\n\n━━━━━ NOS MEILLEURES OFFRES ━━━━━\n\n📄 PAPIER & IMPRESSION\n• Ramette papier A4 80g Navigator Universal (500 feuilles) : 3,99 euros au lieu de 5,49 euros (-27%)\n• Ramette papier A4 100g Clairefontaine DCP (500 feuilles) : 7,90 euros au lieu de 11,50 euros — idéal pour les impressions juridiques\n• Enveloppes kraft C4 (229x324mm) — lot de 250 : 14,90 euros au lieu de 22,00 euros\n• Toner HP LaserJet Pro MFP M428 (CF259A) : 39,90 euros au lieu de 59,90 euros (-33%)\n• Toner Brother TN-2420 compatible : 19,90 euros au lieu de 34,90 euros (-43%)\n\n📁 CLASSEMENT & ARCHIVAGE\n• Lot de 10 chemises à rabat Exacompta (3 rabats, assorties) : 4,50 euros\n• Boîte d'archives Bankers Box (10 unités) : 24,90 euros — parfait pour archiver vos dossiers clients\n• Pochettes perforées A4 cristal (lot de 100) : 3,20 euros\n• Intercalaires 12 positions A4, jeu de 5 : 2,80 euros\n• Dossiers suspendus Esselte Pendaflex (lot de 25) : 12,50 euros\n\n✏️ ÉCRITURE & PETIT BUREAU\n• Agrafeuse professionnelle Rapid K1 (50 feuilles) : 12,90 euros\n• Stylos Pilot G-2 07 noir (lot de 12) : 9,90 euros\n• Post-it Super Sticky 76x76mm (lot de 12 blocs) : 8,90 euros\n• Correcteur Tipp-Ex roller (lot de 3) : 4,50 euros\n• Calculatrice de bureau Casio MS-80F : 14,90 euros\n\n🖥️ MOBILIER — NOUVEAUTÉS PRINTEMPS\n• Fauteuil de bureau ergonomique « Confort Pro » : 189 euros au lieu de 299 euros (-37%)\n• Lampe de bureau LED articulée, intensité réglable : 34,90 euros\n• Destructeur de documents Fellowes 225i (coupe croisée, 16 feuilles) : 149 euros au lieu de 219 euros\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🚚 LIVRAISON GRATUITE dès 50 euros d'achat (Île-de-France)\n🔄 Retours gratuits sous 30 jours\n💳 Paiement à 30 jours sur facture pour les professionnels\n\n📦 Commandez sur bureau-discount.fr\nOu par téléphone : 01 48 90 12 34 (lun-ven, 9h-18h)\nOu par email : commandes@bureau-discount.fr\n\nOffres valables jusqu'au 15 avril 2026, dans la limite des stocks disponibles.\n\nCordialement,\nL'équipe Bureau Discount\n\n---\nBureau Discount SARL — Zone d'activité des Bruyères, 93100 Montreuil\nSe désabonner : bureau-discount.fr/unsubscribe",
    date: daysAgo(16, 10),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "spam",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Pub Fournitures Bureau <offres@bureau-discount.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e56",
    expediteur: "Bulletin Dalloz",
    email: "newsletter@dalloz.fr",
    objet: "Veille jurisprudentielle - Semaine 10",
    resume:
      "Bulletin hebdomadaire Dalloz avec les décisions marquantes de la semaine, notamment un arrêt sur le devoir de conseil du notaire et une décision sur les charges de copropriété.",
    corps_original:
      "Cher(e) abonné(e),\n\nRetrouvez ci-dessous la veille jurisprudentielle sélectionnée par la Rédaction Dalloz pour la semaine 10 (du 2 au 8 mars 2026). Trois arrêts importants cette semaine en matière de responsabilité notariale, de copropriété et de droit du travail.\n\n═══════════════════════════════════════\n1. DEVOIR DE CONSEIL DU NOTAIRE — DPE\n═══════════════════════════════════════\n\nCass. 1re civ., 4 mars 2026, n° 25-10.789, FS-P\n\nFaits : Un acquéreur achète un bien immobilier sur la foi d'un DPE affichant une note C. Il découvre postérieurement que l'isolation est quasi inexistante et que la note réelle devrait être E ou F. Il met en cause la responsabilité du notaire instrumentaire pour manquement à son devoir de conseil.\n\nSolution : La première chambre civile retient la responsabilité du notaire. Elle juge que « le notaire, tenu d'un devoir de conseil et de mise en garde, doit vérifier la cohérence apparente des diagnostics annexés à l'acte de vente. En présence d'indices patents de discordance entre le DPE et l'état réel du bien (ancienneté de la construction, absence visible d'isolation, prix de vente inférieur au marché), le notaire manque à son obligation en se bornant à annexer le DPE sans alerter l'acquéreur ».\n\nPortée : Arrêt majeur qui élargit le devoir de conseil du notaire en matière de diagnostics techniques. Le notaire ne peut plus se réfugier derrière la « présomption de validité » du DPE.\n\nNote M. Mekki, JCP N 2026, à paraître. Voir également : Tribune « Après l'arrêt du 4 mars 2026 : le notaire, nouveau garant de la fiabilité du DPE ? », Dr. imm. 2026.\n\n═══════════════════════════════════════\n2. CHARGES DE COPROPRIÉTÉ — TRANSPARENCE\n═══════════════════════════════════════\n\nCass. 3e civ., 5 mars 2026, n° 25-11.234, FS-B\n\nFaits : Un copropriétaire conteste les résolutions d'AG approuvant les comptes et le budget prévisionnel, au motif que le syndic n'a pas présenté le détail des postes de charges lors de l'assemblée. Le syndic argue que les documents étaient « consultables sur rendez-vous au bureau du syndic ».\n\nSolution : La troisième chambre civile annule les résolutions contestées. Elle juge que « l'obligation de présenter les comptes avec le détail des postes de charges, prévue par les articles 18-1 de la loi du 10 juillet 1965 et 11 du décret du 14 mars 2005, est une obligation substantielle dont la méconnaissance entraîne la nullité des résolutions votées. La simple mise à disposition des documents au bureau du syndic ne satisfait pas à cette obligation ».\n\nPortée : Confirmation de l'obligation de transparence du syndic et de la sanction de la nullité. Les syndics professionnels doivent impérativement présenter le détail des charges lors de l'AG.\n\n═══════════════════════════════════════\n3. RUPTURE CONVENTIONNELLE — HARCÈLEMENT\n═══════════════════════════════════════\n\nCass. soc., 6 mars 2026, n° 25-12.678, FS-P+B\n\nFaits : Un salarié victime de harcèlement moral (mise à l'écart, suppression de responsabilités, objectifs inatteignables) signe une rupture conventionnelle. Il demande ultérieurement la nullité de la convention pour vice du consentement.\n\nSolution : La chambre sociale prononce la nullité de la rupture conventionnelle. Elle rappelle que « l'existence d'un harcèlement moral au moment de la signature de la convention de rupture conventionnelle constitue un vice du consentement entraînant la nullité de la convention, sauf à l'employeur de démontrer que le consentement du salarié était libre et éclairé malgré la situation de harcèlement ». La nullité produit les effets d'un licenciement nul.\n\nPortée : Arrêt de principe renforçant la protection du salarié harcelé dans le cadre des ruptures conventionnelles. L'employeur supporte désormais la charge de la preuve du consentement libre.\n\n═══════════════════════════════════════\n\nPour accéder aux textes intégraux : dalloz.fr (identifiants abonné)\n\nBonne lecture,\nLa Rédaction Dalloz\n\n---\nÉditions Dalloz — 31-35, rue Froidevaux, 75014 Paris\nSe désabonner : dalloz.fr/newsletters/unsubscribe",
    date: daysAgo(18, 7),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "newsletter",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Bulletin Dalloz <newsletter@dalloz.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e57",
    expediteur: "Notification Tribunal",
    email: "notifications@justice.gouv.fr",
    objet: "Mise à jour rôle des audiences",
    resume:
      "Le greffe informe de la mise à jour du rôle des audiences pour avril 2026. Trois affaires concernent le cabinet : RG 26/01234, RG 25/04512 et RG 26/02891.",
    corps_original:
      "TRIBUNAL DE GRANDE INSTANCE DE PARIS\nService du greffe — Secrétariat général\n4, boulevard du Palais — 75001 Paris\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nMISE À JOUR DU RÔLE DES AUDIENCES\nMois d'avril 2026\nRéf. : GR-ROLE-2026-04-PUBLICATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nMaître Alexandra FERNANDEZ\nAvocate au Barreau de Paris\nToque : D1234\n\nMaître,\n\nNous avons l'honneur de vous informer de la publication du rôle des audiences du Tribunal de Grande Instance de Paris pour le mois d'avril 2026. Ce rôle est consultable dans son intégralité sur la plateforme e-barreau (rubrique « Audiences > Rôle mensuel »).\n\nCi-dessous, les affaires vous concernant en qualité de conseil constitué :\n\n═══════════════════════════════════════\nAFFAIRE N° 1\n═══════════════════════════════════════\nN° RG : 26/01234\nParties : DUPONT Marie c/ SARL BTP PRO\nNature : Litige commercial — Non-conformité des travaux\nType d'audience : Mise en état\nDate : 22 avril 2026\nHeure : 10h00\nSalle : 4A — 3e chambre civile\nJuge : M. le Juge de la mise en état DUCHEMIN\nObservations : Dépôt de pièces complémentaires de la défense attendu. Clôture envisagée à cette audience si les parties sont en état.\n\n═══════════════════════════════════════\nAFFAIRE N° 2\n═══════════════════════════════════════\nN° RG : 25/04512\nParties : DUBOIS Claire c/ SCI LES TILLEULS\nNature : Litige immobilier — Contestation de charges de copropriété\nType d'audience : Plaidoiries\nDate : 15 avril 2026\nHeure : 14h00\nSalle : 3B — 2e chambre civile\nJuge : Mme la Présidente DUFOUR\nObservations : Conclusions récapitulatives à déposer au plus tard le 8 avril. Pièces complémentaires au plus tard le 10 avril. Durée de plaidoirie estimée : 30 minutes par partie.\n\n═══════════════════════════════════════\nAFFAIRE N° 3\n═══════════════════════════════════════\nN° RG : 26/02891\nParties : ROUX Patrick et Sophie c/ GAUTHIER Jean-Claude\nNature : Immobilier — Garantie des vices cachés\nType d'audience : Orientation\nDate : 28 avril 2026\nHeure : 9h30\nSalle : 2C — 5e chambre civile\nJuge : Mme la Juge BERTRAND\nObservations : Première audience. Le défendeur, domicilié au Portugal, n'a pas encore constitué avocat. Les délais de signification internationale (Règlement UE 1393/2007) sont en cours. Report possible si la signification n'est pas effective.\n\n═══════════════════════════════════════\n\nNous vous rappelons que tout changement ou report d'audience sera notifié par voie électronique via le RPVA. Il vous appartient de vérifier régulièrement votre boîte de réception e-barreau.\n\nPour toute question relative au rôle des audiences, veuillez contacter le secrétariat de la chambre concernée aux horaires d'ouverture (lundi au vendredi, 9h-12h / 14h-16h).\n\nVeuillez agréer, Maître, l'expression de nos salutations distinguées.\n\nLe Greffe du Tribunal de Grande Instance de Paris\n\n---\nCe message est généré automatiquement par le système de gestion des audiences.\nRéf. horodatage : TGI-PAR-2026-0307-091534",
    date: daysAgo(20, 9),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "notification",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Notification Tribunal <notifications@justice.gouv.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e58",
    expediteur: "Pub Séminaire Juridique",
    email: "inscriptions@seminairejuridique.fr",
    objet: "Masterclass Intelligence Artificielle et Droit",
    resume:
      "Email promotionnel pour une masterclass sur l'IA et le droit prévue en mai 2026. Programme de deux jours à 890 euros. Aucun intérêt immédiat pour le cabinet.",
    corps_original:
      "Maître Fernandez,\n\nL'intelligence artificielle transforme la profession d'avocat. Êtes-vous prêt(e) à prendre le virage ? Ne manquez pas notre Masterclass exceptionnelle, animée par les meilleurs experts du droit et de la technologie.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🤖 MASTERCLASS — INTELLIGENCE ARTIFICIELLE ET DROIT\nEnjeux et opportunités pour les avocats\nÉdition 2026 — 3e année consécutive — COMPLET 2 FOIS EN 2025\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📅 Dates : 15 et 16 mai 2026 (9h00-18h00 les deux jours)\n📍 Lieu : Hôtel Marriott Paris La Défense, Grande Salle Concorde\n   2, boulevard de Neuilly — 92081 Paris La Défense\n   (RER A — La Défense Grande Arche / Tramway T2)\n💰 Tarif : 890 euros HT par participant (déjeuners et pauses café inclus)\n   Tarif « early bird » (-15%) : 756 euros HT si inscription avant le 15 avril\n   Tarif cabinet (3+ inscriptions) : 756 euros HT/personne\n🎓 Formation validée au titre de la formation continue obligatoire : 14 heures\n\nPROGRAMME DÉTAILLÉ :\n\n═══ JOUR 1 — 15 MAI ═══\n\n9h00 — Accueil et café de bienvenue\n\n9h30 — Conférence d'ouverture : « L'IA et le droit : où en sommes-nous en 2026 ? »\n   Pr. Cédric Villani (Médaille Fields, ancien député)\n   Tour d'horizon des technologies IA appliquées au droit : LLM, RAG, agents autonomes\n\n10h30 — Pause café\n\n11h00 — Table ronde : « L'IA dans la recherche juridique »\n   • Me Sophie Renard (Barreau de Lyon) — Comment j'ai réduit mes recherches de 4h à 30 min\n   • M. Jean-Baptiste Soufron (CEO, Doctrine.fr) — L'avenir de la legal tech en France\n   • Pr. Fabrice Mattatia (Paris-Saclay) — Fiabilité des IA juridiques : mythes et réalités\n\n12h30 — Déjeuner assis (menu gastronomique, 2 services)\n\n14h00 — Atelier pratique : « Rédiger avec l'IA : conclusions, contrats, consultations »\n   Démonstrations live avec Claude, GPT-4, Harvey AI et Mistral Legal\n   Exercice pratique : rédiger des conclusions en 15 minutes\n\n16h00 — Pause café\n\n16h30 — Conférence : « Questions éthiques et déontologiques »\n   Me Vincent Nioré (Ancien membre du CNB, commission déontologie)\n   Secret professionnel, confidentialité des données, responsabilité de l'avocat\n\n18h00 — Cocktail networking\n\n═══ JOUR 2 — 16 MAI ═══\n\n9h00 — Café et retour sur le jour 1\n\n9h30 — Atelier : « Automatiser les tâches répétitives du cabinet »\n   Workflows IA pour le classement des emails, la gestion des échéances, la facturation\n\n11h00 — Pause café\n\n11h30 — Table ronde : « Les limites de l'IA — Ce que l'IA ne fera jamais »\n   Le jugement humain, la plaidoirie, l'empathie client\n\n12h30 — Déjeuner\n\n14h00 — Ateliers au choix (2 x 1h30) :\n   A) « Configurer son cabinet pour l'IA » (niveau débutant)\n   B) « Prompt engineering avancé pour juristes » (niveau intermédiaire)\n   C) « Développer un assistant IA sur mesure pour son cabinet » (niveau avancé)\n\n17h00 — Conférence de clôture et remise des attestations de formation\n\n17h30 — Fin de la masterclass\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚠️ Places limitées à 50 participants pour garantir la qualité des ateliers pratiques.\n📊 48 places déjà vendues en 2 semaines. Il ne reste que 2 places !\n\n👉 Inscrivez-vous maintenant : seminairejuridique.fr/ia-droit\nOu contactez-nous : inscriptions@seminairejuridique.fr / 01 45 67 89 01\n\nL'équipe Séminaire Juridique\n\n---\nSéminaire Juridique SAS — 5, rue Marbeuf, 75008 Paris\nSIREN 901 234 567 — Organisme de formation n° 11 75 56789 75\nSe désabonner : seminairejuridique.fr/unsubscribe",
    date: daysAgo(22, 8),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "spam",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Pub Séminaire Juridique <inscriptions@seminairejuridique.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e59",
    expediteur: "Newsletter Ordre des Avocats",
    email: "newsletter@ordre-avocats-paris.fr",
    objet: "Actualités juridiques février",
    resume:
      "Newsletter mensuelle de l'Ordre des Avocats de Paris pour février. Au sommaire : aide juridictionnelle revalorisée, cotisation ordinale 2026, et nouveau protocole sanitaire au Palais.",
    corps_original:
      "Chers Confrères et Consoeurs,\n\nL'Ordre des Avocats de Paris a le plaisir de vous adresser sa lettre d'information mensuelle pour le mois de février 2026. Nous vous invitons à prendre connaissance des actualités ci-dessous, qui concernent l'ensemble de la profession.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n1. AIDE JURIDICTIONNELLE — REVALORISATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nBonne nouvelle pour la profession : le décret n° 2026-145 du 10 février 2026 porte revalorisation de 5% des barèmes de l'aide juridictionnelle, applicable aux missions acceptées à compter du 1er mars 2026.\n\nConcrètement, les principales unités de valeur sont revalorisées comme suit :\n• UV de base : passage de 36 euros à 37,80 euros\n• UV pour les procédures de divorce : passage de 34 UV à 34 UV (montant par UV revalorisé)\n• UV pour les procédures prud'homales : inchangé en nombre, mais revalorisé en montant\n\nLe Bâtonnier rappelle que cette revalorisation, bien que bienvenue, reste en deçà des demandes formulées par la profession (revalorisation de 15% demandée par la Conférence des Bâtonniers). Le Bureau de l'Ordre continuera à plaider auprès de la Chancellerie pour une revalorisation significative de l'aide juridictionnelle.\n\nPour consulter les nouveaux barèmes détaillés : aide-juridictionnelle.justice.gouv.fr\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n2. COTISATION ORDINALE 2026\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nNous vous rappelons que la cotisation ordinale pour l'année 2026 est désormais exigible.\n\n• Montant : 520 euros (inchangé par rapport à 2025)\n• Date limite de paiement : 30 avril 2026 (délai reporté, initialement fixé au 31 mars)\n• Modalités de paiement :\n   - En ligne sur votre espace personnel : moncompte.barreaudeparis.fr\n   - Par chèque à l'ordre de « Ordre des Avocats de Paris »\n   - Par virement bancaire (RIB disponible sur le site de l'Ordre)\n   - Possibilité de paiement en 3 fois sans frais (demande à formuler avant le 15 mars)\n\nAttention : le non-paiement de la cotisation dans les délais peut entraîner des poursuites disciplinaires conformément au Règlement Intérieur National.\n\nPour les confrères ayant prêté serment depuis moins de 2 ans, un tarif réduit de 260 euros est applicable. Contactez le Service des Cotisations (cotisations@barreaudeparis.fr) pour en bénéficier.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n3. PROTOCOLE SANITAIRE — MISE À JOUR\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSuite à l'amélioration de la situation sanitaire et conformément aux recommandations du Haut Conseil de la Santé Publique, le port du masque n'est plus obligatoire dans les enceintes judiciaires à compter du 1er mars 2026.\n\nCette mesure s'applique :\n• Au Palais de Justice de Paris (4, boulevard du Palais)\n• Au TGI de Paris (Porte de Clichy)\n• À l'ensemble des juridictions d'Île-de-France\n• À la Maison du Barreau (2, rue de Harlay)\n\nLe port du masque reste recommandé (non obligatoire) dans les salles d'audience en cas d'affluence.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n4. BIBLIOTHÈQUE DE L'ORDRE — NOUVEAUX HORAIRES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nÀ compter du 1er mars 2026, la bibliothèque de l'Ordre adopte de nouveaux horaires élargis pour mieux répondre aux besoins de la profession :\n\n• Du lundi au vendredi : 8h30 à 19h00 (anciens horaires : 9h00-18h00)\n• Samedi matin : 9h00-13h00 (NOUVEAU — sur une période d'essai de 3 mois)\n• Fermeture : dimanches et jours fériés\n\nRappel des services disponibles :\n• Accès libre aux ouvrages juridiques (plus de 25 000 références)\n• Postes informatiques avec accès Dalloz, LexisNexis, Lamy et Doctrine.fr\n• Espace de travail calme (20 places assises)\n• Service de photocopie et d'impression\n• Prêt inter-bibliothèques avec l'Université Paris II Panthéon-Assas\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n5. EN BREF\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n• Élections au Conseil de l'Ordre : les candidatures sont ouvertes jusqu'au 15 mai 2026\n• Permanence juridique gratuite pour les justiciables : nouveaux créneaux les mardis et jeudis après-midi\n• Colloque « L'avocat face à la transition écologique » : 12 mars 2026, Maison du Barreau (inscription gratuite)\n• Tournoi de football inter-barreaux : 23 mars 2026, stade Charléty — inscrivez votre équipe !\n\nNous restons à votre disposition pour toute question.\n\nConfraternellement,\nLe Bureau de l'Ordre des Avocats de Paris\n\n---\nOrdre des Avocats de Paris — Maison du Barreau\n2, rue de Harlay — 75001 Paris\nTél. : 01 44 32 48 48\nVous recevez cet email car vous êtes inscrit(e) au Barreau de Paris.\nSe désabonner : parametres.ordre-avocats-paris.fr/newsletters",
    date: daysAgo(25, 7),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "newsletter",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Newsletter Ordre des Avocats <newsletter@ordre-avocats-paris.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
  {
    id: "e60",
    expediteur: "Notification Tribunal",
    email: "notifications@justice.gouv.fr",
    objet: "Rappel cotisation RPVA 2026",
    resume:
      "Rappel de la cotisation annuelle RPVA 2026 de 96 euros à régler avant le 31 mars. Le paiement peut se faire en ligne sur le site du CNB.",
    corps_original:
      "CONSEIL NATIONAL DES BARREAUX\nService Comptabilité — Gestion des cotisations\n22, rue de Londres — 75009 Paris\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nRAPPEL — COTISATION ANNUELLE RPVA 2026\nRéf. : COT-RPVA-2026-AF-D1234\n⚠️ ÉCHÉANCE : 31 MARS 2026\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nMaître Alexandra FERNANDEZ\nAvocate au Barreau de Paris\nN° CNBF : 75-P-2018-04567\nN° de clé RPVA : CLE-2022-IDF-78456\nToque : D1234\n\nMaître,\n\nNous vous rappelons que la cotisation annuelle au titre de l'utilisation du Réseau Privé Virtuel des Avocats (RPVA) et de la plateforme e-barreau pour l'année 2026 est exigible et doit être réglée avant le 31 mars 2026.\n\nDÉTAIL DE LA COTISATION :\n• Cotisation annuelle RPVA 2026 : 80,00 euros HT\n• TVA (20%) : 16,00 euros\n• Total TTC : 96,00 euros\n• N° de facture : FAC-RPVA-2026-04567\n\nMODES DE PAIEMENT ACCEPTÉS :\n\n1. En ligne (recommandé — traitement instantané) :\n   Rendez-vous sur cnb.avocat.fr/paiement\n   Identifiez-vous avec votre numéro CNBF et votre mot de passe\n   Paiement par carte bancaire (Visa, Mastercard, CB) sécurisé par 3D Secure\n\n2. Par chèque :\n   Chèque de 96,00 euros à l'ordre de « Conseil National des Barreaux »\n   Mention au dos : votre numéro CNBF (75-P-2018-04567)\n   À adresser à : CNB — Service Comptabilité — 22, rue de Londres — 75009 Paris\n\n3. Par virement bancaire :\n   IBAN : FR76 3000 4028 3700 0100 0156 782\n   BIC : BNPAFRPPXXX\n   Banque : BNP Paribas — Agence Paris Opéra\n   Référence à mentionner : COT-RPVA-2026-75P201804567\n\n⚠️ IMPORTANT — CONSÉQUENCES DU NON-PAIEMENT :\n\nConformément à la délibération du Conseil d'administration du CNB en date du 15 novembre 2025, en cas de non-paiement de la cotisation RPVA au-delà du 31 mars 2026 :\n\n• Un premier rappel sera envoyé le 1er avril 2026\n• En l'absence de régularisation sous 15 jours, votre accès à la plateforme e-barreau sera suspendu temporairement\n• Vous ne pourrez plus effectuer de dépôts de conclusions ni de communications électroniques avec les juridictions\n• Des frais de relance de 15 euros pourront être facturés\n\nNous vous invitons vivement à procéder au règlement dans les meilleurs délais afin d'éviter toute interruption de service qui pourrait affecter vos procédures en cours.\n\nPour toute question relative à votre cotisation, vous pouvez contacter le Service Comptabilité :\n• Par téléphone : 01 53 30 85 50 (du lundi au vendredi, 9h-12h / 14h-17h)\n• Par email : cotisations@cnb.avocat.fr\n• Votre espace en ligne : cnb.avocat.fr/mon-compte/cotisations\n\nNous vous remercions de votre diligence.\n\nVeuillez agréer, Maître, l'expression de nos salutations distinguées.\n\nLe Service Comptabilité\nConseil National des Barreaux\n22, rue de Londres — 75009 Paris\n\n---\nCet email est envoyé automatiquement aux avocats dont la cotisation RPVA 2026 n'a pas été enregistrée à ce jour.\nSi vous avez déjà réglé votre cotisation, veuillez ne pas tenir compte de ce message.\nRéf. : COT-RPVA-2026-RAPPEL-01-20260227",
    date: daysAgo(28, 10),
    dossier_id: null,
    dossier_nom: null,
    dossier_domaine: null,
    category: "notification",
    email_type: "informatif",
    pieces_jointes: [],
    brouillon_mock: null,
    from_email: "Notification Tribunal <notifications@justice.gouv.fr>",
    to_email: "alexandra@cabinet-fernandez.fr",
    cc_email: null,
  },
];

// ---------------------------------------------------------------------------
// Helpers: filter by period & compute stats
// ---------------------------------------------------------------------------

export function getEmailsForPeriod(period: "24h" | "7j" | "30j"): MockEmail[] {
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

export const mockEcheances: Record<string, Array<{
  id: string;
  label: string;
  date: string;
  source: string;
  status: "a_venir" | "proche" | "depassee";
}>> = {
  "1": [
    { id: "ech-1", label: "Expiration mise en demeure BTP Pro", date: daysAgo(-5).split("T")[0], source: "Mise en demeure du 2 mars", status: "proche" },
    { id: "ech-2", label: "Audience Tribunal de commerce", date: daysAgo(-30).split("T")[0], source: "Assignation", status: "a_venir" },
  ],
  "2": [
    { id: "ech-3", label: "2e entretien préalable TechCorp", date: daysAgo(-4).split("T")[0], source: "Email RH du 26 mars", status: "proche" },
    { id: "ech-4", label: "Délai de rétractation", date: daysAgo(-20).split("T")[0], source: "Convention collective", status: "a_venir" },
  ],
  "4": [
    { id: "ech-5", label: "Dépôt conclusions récapitulatives", date: daysAgo(-15).split("T")[0], source: "Ordonnance du juge", status: "a_venir" },
  ],
  "5": [
    { id: "ech-6", label: "Audience TGI — Dubois c/ SCI Les Tilleuls", date: daysAgo(-18).split("T")[0], source: "Convocation tribunal", status: "a_venir" },
    { id: "ech-7", label: "Production des pièces complémentaires", date: daysAgo(2).split("T")[0], source: "Ordonnance du juge", status: "depassee" },
  ],
  "6": [
    { id: "ech-8", label: "Premier rendez-vous cabinet", date: daysAgo(-7).split("T")[0], source: "Email Alice Bernard", status: "a_venir" },
  ],
};

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
