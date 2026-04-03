import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import {
  Settings, LayoutDashboard, Paperclip, Eye, Edit3, Send, ChevronRight, Mail,
  ArrowUp, MessageCircle, X, Menu, ArrowLeft, Copy, Check, FileText, Download,
  Calendar, AlertTriangle, CheckCircle2, Clock, ThumbsUp, Pencil, XCircle
} from "lucide-react"
import ReactMarkdown from "react-markdown"

// ─── Palette ───
const BG = "#FFFFFF"
const SIDEBAR_BG = "#F9FAFB"
const SIDEBAR_BORDER = "#E5E7EB"
const TEXT = "#111827"
const TEXT_MUTED = "#6B7280"
const TEXT_LIGHT = "#9CA3AF"
const ACCENT = "#2563EB"
const ACCENT_BG = "#EFF6FF"
const URGENT = "#EF4444"
const URGENT_BG = "#FEF2F2"
const GREEN = "#10B981"
const BORDER = "#E5E7EB"

// ─── Hook ───
function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < bp : false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
    setMobile(mq.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [bp])
  return mobile
}

// ═══════════════════════════════════════════════════════
// ─── DEMO DATA ───
// ═══════════════════════════════════════════════════════

const DOSSIERS = [
  { id: "d1", initials: "JM", name: "Jean-Pierre Martin", type: "Droit du travail", color: "#2563EB",
    summary: "Litige prud'homal en cours. M. Martin conteste son licenciement pour faute grave. Audience de conciliation prévue le 22 avril 2026. Enjeu principal : indemnités de licenciement (18 mois d'ancienneté) + dommages-intérêts pour licenciement sans cause réelle et sérieuse.",
    status: "actif" as const, domain: "Travail",
    emails: [
      { id: "e10", sender: "Jean-Pierre Martin", subject: "Documents demandés pour le dossier", date: "1 avril", resume: "M. Martin transmet ses 3 derniers bulletins de salaire et son contrat de travail comme demandé." },
      { id: "e11", sender: "Me Laurent (adverse)", subject: "Conclusions en défense", date: "28 mars", resume: "L'employeur maintient la qualification de faute grave. Argument : absences répétées non justifiées." },
      { id: "e12", sender: "Greffe CPH Paris", subject: "Convocation bureau de conciliation", date: "25 mars", resume: "Convocation pour le 22 avril 2026 à 9h30. Bureau de conciliation, section industrie." },
      { id: "e13", sender: "Jean-Pierre Martin", subject: "Re: Attestations de collègues", date: "22 mars", resume: "M. Martin transmet 3 attestations de collègues confirmant qu'il avait prévenu son manager de ses absences." },
      { id: "e14", sender: "Me Laurent (adverse)", subject: "Pièces complémentaires employeur", date: "20 mars", resume: "Transmission des registres de pointage et du règlement intérieur. L'employeur conteste les attestations." },
      { id: "e15", sender: "Jean-Pierre Martin", subject: "Certificat médical", date: "18 mars", resume: "Certificat du Dr Benali attestant d'un arrêt de travail du 2 au 7 mars pour gastro-entérite aiguë." },
      { id: "e16", sender: "CPAM Paris", subject: "Confirmation indemnités journalières", date: "15 mars", resume: "La CPAM confirme le versement des IJ pour la période du 2 au 7 mars 2026." },
      { id: "e17", sender: "Jean-Pierre Martin", subject: "Question sur les indemnités", date: "12 mars", resume: "M. Martin demande une estimation des indemnités qu'il pourrait obtenir en cas de requalification." },
      { id: "e18", sender: "Inspection du travail", subject: "Accusé réception signalement", date: "10 mars", resume: "L'inspection du travail accuse réception du signalement pour licenciement abusif." },
      { id: "e19", sender: "Jean-Pierre Martin", subject: "Premier contact — contestation licenciement", date: "8 mars", resume: "Premier mail de M. Martin expliquant sa situation. Licencié le 15/03 pour faute grave, il conteste les motifs." },
    ],
    documents: [
      { id: "doc1", name: "Contrat_travail_Martin.pdf", type: "PDF", size: "245 Ko", date: "1 avril", resume: "CDI signé le 12/09/2024, poste de responsable logistique, salaire brut 3 200€/mois, clause de non-concurrence de 12 mois." },
      { id: "doc2", name: "Lettre_licenciement.pdf", type: "PDF", size: "128 Ko", date: "15 mars", resume: "Licenciement pour faute grave notifié le 15/03/2026. Motifs invoqués : absences injustifiées les 2, 3 et 7 mars 2026." },
      { id: "doc3", name: "Bulletins_salaire_Q4.pdf", type: "PDF", size: "312 Ko", date: "1 avril", resume: "Bulletins oct/nov/déc 2025. Salaire net moyen : 2 480€. Pas de prime ni variable sur la période." },
      { id: "doc1b", name: "Attestations_collegues.pdf", type: "PDF", size: "189 Ko", date: "22 mars", resume: "3 attestations de collègues (M. Fabre, Mme Lopez, M. Chen) confirmant que M. Martin avait prévenu son supérieur de ses absences par SMS." },
      { id: "doc1c", name: "Certificat_medical_Benali.pdf", type: "PDF", size: "56 Ko", date: "18 mars", resume: "Certificat médical du Dr Benali. Arrêt prescrit du 2 au 7 mars 2026. Diagnostic : gastro-entérite aiguë." },
      { id: "doc1d", name: "Registre_pointage_mars.xlsx", type: "XLSX", size: "78 Ko", date: "20 mars", resume: "Registre de pointage du mois de mars. Absences de M. Martin relevées les 2, 3, 4, 5, 6 et 7 mars. Aucune mention de justificatif dans le système." },
      { id: "doc1e", name: "Reglement_interieur.pdf", type: "PDF", size: "1.4 Mo", date: "20 mars", resume: "Règlement intérieur de la société LogiTrans. Article 12 : toute absence non justifiée sous 48h constitue une faute. Article 15 : procédure disciplinaire obligatoire avant licenciement." },
      { id: "doc1f", name: "Captures_SMS_manager.jpg", type: "JPG", size: "2.1 Mo", date: "22 mars", resume: "Captures d'écran de SMS entre M. Martin et son manager M. Duval. Messages du 2 mars à 7h12 : 'Bonjour, je suis malade, je ne pourrai pas venir'. Réponse du manager : 'OK bon rétablissement'." },
      { id: "doc1g", name: "Simulation_indemnites.docx", type: "DOCX", size: "34 Ko", date: "12 mars", resume: "Estimation préparée par le cabinet : indemnité légale de licenciement (2 700€) + dommages-intérêts pour licenciement sans cause (6 à 12 mois de salaire, soit 19 200€ à 38 400€)." },
    ],
  },
  { id: "d2", initials: "MD", name: "Marie Dupont", type: "Litige commercial", color: "#7C3AED",
    summary: "Contentieux commercial avec la société TechnoPlus SARL. Factures impayées pour un montant de 34 200€. Mise en demeure envoyée le 20 mars. Délai de réponse expiré. Prochaine étape : assignation en référé-provision.",
    status: "actif" as const, domain: "Commercial",
    emails: [
      { id: "e20", sender: "Marie Dupont", subject: "Re: Point sur le contentieux TechnoPlus", date: "2 avril", resume: "Mme Dupont confirme qu'aucun règlement n'est intervenu. Elle souhaite accélérer la procédure." },
      { id: "e21", sender: "Me Garnier (TechnoPlus)", subject: "Demande de délai de paiement", date: "30 mars", resume: "L'avocat de TechnoPlus propose un échelonnement sur 6 mois. Reconnaît la dette mais invoque des difficultés de trésorerie." },
      { id: "e22", sender: "Marie Dupont", subject: "Tr: Relance n°3 restée sans réponse", date: "28 mars", resume: "Mme Dupont transfère sa 3e relance amiable restée sans réponse depuis 15 jours." },
      { id: "e23", sender: "Huissier Maître Petit", subject: "PV de signification — mise en demeure", date: "25 mars", resume: "L'huissier confirme la remise en main propre de la mise en demeure au gérant de TechnoPlus le 24 mars." },
      { id: "e24", sender: "Marie Dupont", subject: "Bon de commande original", date: "22 mars", resume: "Mme Dupont envoie le bon de commande signé par le gérant de TechnoPlus pour la prestation de conseil en transformation digitale." },
      { id: "e25", sender: "Expert-comptable Mme Dupont", subject: "Relevé de compte client TechnoPlus", date: "20 mars", resume: "L'expert-comptable fournit le relevé montrant 3 factures échues : 60j, 90j et 120j de retard." },
      { id: "e26", sender: "Marie Dupont", subject: "Premier contact — recouvrement TechnoPlus", date: "15 mars", resume: "Mme Dupont explique la situation : prestation réalisée entre sept et déc 2025, 3 factures impayées totalisant 34 200€." },
      { id: "e27", sender: "Greffe Tribunal Commerce", subject: "Extrait Kbis TechnoPlus SARL", date: "18 mars", resume: "Kbis à jour de TechnoPlus SARL. Capital social : 10 000€. Gérant : M. Philippe Renaud. Siège : 45 rue de la Paix, Paris 2e." },
      { id: "e28", sender: "Me Garnier (TechnoPlus)", subject: "Re: Mise en demeure — contestation partielle", date: "1 avril", resume: "Me Garnier conteste la facture F-2025-118 (10 000€) arguant que la prestation n'a pas été livrée complètement." },
      { id: "e29", sender: "Marie Dupont", subject: "Preuve livraison prestation complète", date: "2 avril", resume: "Mme Dupont transmet les PV de recette signés par TechnoPlus pour les 3 prestations, y compris F-2025-118." },
    ],
    documents: [
      { id: "doc4", name: "Factures_impayees_recap.pdf", type: "PDF", size: "89 Ko", date: "20 mars", resume: "3 factures impayées : F-2025-089 (12 400€), F-2025-102 (11 800€), F-2025-118 (10 000€). Total : 34 200€ TTC." },
      { id: "doc4b", name: "Bon_commande_TechnoPlus.pdf", type: "PDF", size: "134 Ko", date: "22 mars", resume: "Bon de commande n°BC-2025-034 signé par M. Renaud (TechnoPlus). Prestation : conseil en transformation digitale. Montant total : 34 200€ HT." },
      { id: "doc4c", name: "Mise_en_demeure_TechnoPlus.pdf", type: "PDF", size: "98 Ko", date: "20 mars", resume: "Mise en demeure de payer 34 200€ sous 8 jours. Envoi par huissier. Mention de l'article L.441-10 du Code de commerce (pénalités de retard)." },
      { id: "doc4d", name: "PV_signification_huissier.pdf", type: "PDF", size: "167 Ko", date: "25 mars", resume: "PV de signification par Me Petit, huissier. Remise en main propre au gérant M. Renaud le 24/03/2026 à 10h45 au siège social." },
      { id: "doc4e", name: "Releve_compte_client.xlsx", type: "XLSX", size: "45 Ko", date: "20 mars", resume: "Balance âgée : F-2025-089 (échue 120j, 12 400€), F-2025-102 (échue 90j, 11 800€), F-2025-118 (échue 60j, 10 000€). Intérêts de retard calculés : 1 890€." },
      { id: "doc4f", name: "PV_recette_F2025-118.pdf", type: "PDF", size: "78 Ko", date: "2 avril", resume: "PV de recette signé par M. Renaud le 15/12/2025. Prestation livraison SI complète. Mention : 'Conforme au cahier des charges'." },
      { id: "doc4g", name: "Kbis_TechnoPlus.pdf", type: "PDF", size: "210 Ko", date: "18 mars", resume: "Extrait Kbis au 18/03/2026. TechnoPlus SARL, RCS Paris B 812 345 678. Capital : 10 000€. Activité : services informatiques." },
      { id: "doc4h", name: "Contrat_prestation_conseil.pdf", type: "PDF", size: "1.8 Mo", date: "15 mars", resume: "Contrat cadre de prestation de conseil entre Dupont Consulting et TechnoPlus SARL. Durée : sept 2025 à fév 2026. Clause de paiement : 30 jours fin de mois." },
    ],
  },
  { id: "d3", initials: "CD", name: "Claire Dubois", type: "Litige immobilier", color: "#059669",
    summary: "Trouble de voisinage — Mme Dubois se plaint de nuisances sonores répétées (travaux non autorisés par la copropriété). Constat d'huissier effectué le 25 mars. Médiation en cours avec le syndic.",
    status: "actif" as const, domain: "Immobilier",
    emails: [
      { id: "e30", sender: "Claire Dubois", subject: "Nouveaux travaux ce week-end", date: "2 avril", resume: "Mme Dubois signale que le voisin (M. Legrand, 4e étage) a repris les travaux samedi malgré la médiation." },
      { id: "e31", sender: "Syndic Foncia Neuilly", subject: "Re: Demande intervention travaux non autorisés", date: "1 avril", resume: "Le syndic confirme qu'aucune autorisation AG n'a été donnée pour les travaux de M. Legrand. Mise en demeure envoyée." },
      { id: "e32", sender: "Me Huissier Bertrand", subject: "Constat de nuisances — rapport définitif", date: "28 mars", resume: "Constat d'huissier réalisé le 25 mars. Bruit mesuré à 72 dB dans l'appartement Dubois (norme : 30 dB). Travaux de démolition de cloison sans autorisation." },
      { id: "e33", sender: "Claire Dubois", subject: "Photos des fissures dans mon plafond", date: "26 mars", resume: "Mme Dubois envoie 6 photos montrant des fissures apparues au plafond de sa chambre, directement sous l'appartement de M. Legrand." },
      { id: "e34", sender: "Mairie de Neuilly", subject: "Réponse demande permis de travaux", date: "25 mars", resume: "La mairie confirme qu'aucune déclaration de travaux n'a été déposée par M. Legrand pour l'adresse concernée." },
      { id: "e35", sender: "Expert BTP M. Roche", subject: "Devis expertise fissures", date: "24 mars", resume: "Devis d'expertise pour évaluer les fissures et déterminer si les travaux du 4e en sont la cause. Montant : 1 200€ HT." },
      { id: "e36", sender: "Claire Dubois", subject: "Historique des nuisances", date: "20 mars", resume: "Mme Dubois récapitule : travaux depuis le 1er février, 6 jours/semaine, de 8h à 20h. Plainte au syndic le 10 février, sans effet." },
      { id: "e37", sender: "Syndic Foncia Neuilly", subject: "PV AG copropriété 2025", date: "22 mars", resume: "Le syndic transmet le PV de la dernière AG. Aucune résolution autorisant des travaux au 4e étage." },
      { id: "e38", sender: "Claire Dubois", subject: "Main courante déposée", date: "15 mars", resume: "Mme Dubois a déposé une main courante au commissariat de Neuilly pour tapage diurne répété." },
      { id: "e39", sender: "Claire Dubois", subject: "Premier contact — nuisances voisinage", date: "10 mars", resume: "Premier mail. Mme Dubois habite au 3e étage du 12 avenue Peretti, Neuilly. Travaux bruyants au 4e depuis 6 semaines." },
    ],
    documents: [
      { id: "doc5", name: "Constat_huissier_25mars.pdf", type: "PDF", size: "2.4 Mo", date: "28 mars", resume: "Constat de Me Bertrand. Bruits mesurés à 72 dB (seuil : 30 dB). Photos de chantier visible depuis le palier. Cloison en cours de démolition sans étayage." },
      { id: "doc5b", name: "Photos_fissures_plafond.jpg", type: "JPG", size: "4.8 Mo", date: "26 mars", resume: "6 photos haute résolution montrant des fissures au plafond de la chambre (3e étage). Fissures de 0,5 à 2 mm, orientation longitudinale." },
      { id: "doc5c", name: "PV_AG_copro_2025.pdf", type: "PDF", size: "890 Ko", date: "22 mars", resume: "PV de l'AG du 15/01/2025. 23 résolutions votées. Aucune concernant des travaux au lot n°12 (4e étage, M. Legrand)." },
      { id: "doc5d", name: "Mise_demeure_syndic_Legrand.pdf", type: "PDF", size: "67 Ko", date: "1 avril", resume: "Mise en demeure du syndic à M. Legrand de cesser immédiatement tous travaux non autorisés sous peine de poursuites." },
      { id: "doc5e", name: "Devis_expertise_BTP_Roche.pdf", type: "PDF", size: "112 Ko", date: "24 mars", resume: "Devis de M. Roche, expert BTP agréé. Expertise des fissures + recherche du lien de causalité avec les travaux. 1 200€ HT, délai 10 jours." },
      { id: "doc5f", name: "Main_courante_commissariat.pdf", type: "PDF", size: "89 Ko", date: "15 mars", resume: "Main courante n°2026/MC/1234 déposée le 15/03/2026 au commissariat de Neuilly. Objet : tapage diurne répété depuis le 1er février." },
      { id: "doc5g", name: "Reponse_mairie_permis.pdf", type: "PDF", size: "45 Ko", date: "25 mars", resume: "Courrier de la mairie de Neuilly. Aucune déclaration préalable ni permis de construire déposé par M. Legrand pour le 12 avenue Peretti." },
      { id: "doc5h", name: "Reglement_copropriete.pdf", type: "PDF", size: "3.2 Mo", date: "10 mars", resume: "Règlement de copropriété. Art. 8 : travaux modifiant la structure nécessitent autorisation AG à majorité art. 25. Art. 9 : horaires travaux autorisés 9h-12h / 14h-18h en semaine." },
    ],
  },
  { id: "d4", initials: "FR", name: "Famille Roux", type: "Immobilier", color: "#D97706",
    summary: "Acquisition immobilière — compromis signé le 10 mars pour un bien à Neuilly (485 000€). Conditions suspensives : prêt bancaire (réponse attendue le 10 avril) + diagnostics techniques. Acte authentique prévu le 15 mai.",
    status: "en_attente" as const, domain: "Immobilier",
    emails: [
      { id: "e40", sender: "Famille Roux", subject: "Re: Offre de prêt reçue de la BNP", date: "2 avril", resume: "Les Roux ont reçu l'offre de prêt BNP : 388 000€ sur 25 ans à 3,2%. Ils demandent si les conditions sont acceptables." },
      { id: "e41", sender: "Me Durand (notaire)", subject: "Projet acte authentique", date: "1 avril", resume: "Le notaire transmet le projet d'acte authentique pour relecture. Acte prévu le 15 mai à 14h." },
      { id: "e42", sender: "Agence Century 21 Neuilly", subject: "Diagnostics techniques — résultats", date: "30 mars", resume: "Tous les diagnostics sont conformes sauf l'amiante : présence dans les dalles de sol du sous-sol. Devis désamiantage : 4 500€." },
      { id: "e43", sender: "BNP Paribas — Service Prêts", subject: "Accord de principe prêt immobilier", date: "28 mars", resume: "Accord de principe pour un prêt de 388 000€. Taux : 3,2% fixe, durée 25 ans. Mensualité : 1 870€. Assurance : 0,34%." },
      { id: "e44", sender: "Famille Roux", subject: "Question sur la clause amiante", date: "31 mars", resume: "M. Roux demande si la présence d'amiante peut être un motif de renégociation du prix ou d'annulation." },
      { id: "e45", sender: "Me Durand (notaire)", subject: "Compromis signé — confirmation", date: "10 mars", resume: "Confirmation de la signature du compromis. Dépôt de garantie de 48 500€ (10%) reçu sur le compte séquestre." },
      { id: "e46", sender: "Assurance MMA", subject: "Devis assurance emprunteur", date: "25 mars", resume: "Devis assurance emprunteur : 85€/mois pour le couple. Couverture décès, PTIA, ITT. Délégation d'assurance possible." },
      { id: "e47", sender: "Famille Roux", subject: "Visite contre-expertise plomberie", date: "22 mars", resume: "Les Roux souhaitent faire une contre-expertise de la plomberie car l'agent a mentionné des tuyaux en plomb." },
      { id: "e48", sender: "Agence Century 21 Neuilly", subject: "Coordonnées vendeur pour état des lieux", date: "20 mars", resume: "L'agence transmet les coordonnées du vendeur pour organiser un pré-état des lieux avant la signature." },
      { id: "e49", sender: "Famille Roux", subject: "Premier contact — achat appartement Neuilly", date: "5 mars", resume: "La famille Roux souhaite acquérir un T4 au 8 rue de Chartres, Neuilly. Budget max : 500 000€. Besoin d'accompagnement juridique." },
      { id: "e49b", sender: "Courtier Cafpi", subject: "Comparatif offres de prêt", date: "26 mars", resume: "Le courtier présente 3 offres : BNP (3,2%), Crédit Agricole (3,35%), LCL (3,45%). Recommande la BNP." },
    ],
    documents: [
      { id: "doc6", name: "Compromis_vente_Neuilly.pdf", type: "PDF", size: "2.8 Mo", date: "10 mars", resume: "Compromis de vente du T4, 8 rue de Chartres, Neuilly. Prix : 485 000€. Conditions suspensives : obtention prêt avant le 10 avril, diagnostics conformes." },
      { id: "doc6b", name: "Diagnostics_techniques.pdf", type: "PDF", size: "5.6 Mo", date: "30 mars", resume: "Dossier complet de diagnostics : DPE (classe C), plomb (négatif), électricité (conforme), gaz (conforme), amiante (positif — dalles sol sous-sol)." },
      { id: "doc6c", name: "Offre_pret_BNP.pdf", type: "PDF", size: "345 Ko", date: "2 avril", resume: "Offre de prêt BNP Paribas. Montant : 388 000€, taux fixe 3,2%, durée 300 mois, mensualité 1 870€. TAEG : 3,89%." },
      { id: "doc6d", name: "Projet_acte_authentique.pdf", type: "PDF", size: "1.6 Mo", date: "1 avril", resume: "Projet d'acte de vente par Me Durand. Date prévue : 15/05/2026 à 14h. Prix net vendeur : 485 000€. Frais de notaire estimés : 36 375€." },
      { id: "doc6e", name: "Devis_desamiantage.pdf", type: "PDF", size: "78 Ko", date: "30 mars", resume: "Devis société AmiClean. Retrait dalles amiantées sous-sol (18m²). Montant : 4 500€ TTC. Délai : 3 jours ouvrés." },
      { id: "doc6f", name: "Comparatif_prets.xlsx", type: "XLSX", size: "56 Ko", date: "26 mars", resume: "Comparatif 3 banques. BNP : 3,2% / 1 870€/mois. CA : 3,35% / 1 910€/mois. LCL : 3,45% / 1 935€/mois. Économie BNP vs LCL sur 25 ans : 19 500€." },
      { id: "doc6g", name: "Plan_appartement_T4.pdf", type: "PDF", size: "890 Ko", date: "5 mars", resume: "Plan du T4, 92m², 4e étage avec ascenseur. 3 chambres, séjour 28m², cuisine équipée, 2 SdB, balcon 8m², cave." },
      { id: "doc6h", name: "Devis_assurance_MMA.pdf", type: "PDF", size: "123 Ko", date: "25 mars", resume: "Assurance emprunteur MMA. Quotité 50/50. Cotisation : 85€/mois. Couverture : décès, PTIA, ITT 90j franchise. Tarif garanti 10 ans." },
    ],
  },
  { id: "d5", initials: "AB", name: "Alice Bernard", type: "Droit de la famille", color: "#DC2626",
    summary: "Procédure de divorce par consentement mutuel. Convention en cours de rédaction. Points restants : partage du bien commun (appartement estimé 320 000€) + garde alternée des 2 enfants (Léa, 8 ans et Hugo, 5 ans).",
    status: "actif" as const, domain: "Famille",
    emails: [
      { id: "e50", sender: "Alice Bernard", subject: "Re: Convention — OK pour la garde alternée", date: "2 avril", resume: "Mme Bernard accepte la garde alternée une semaine sur deux. Elle souhaite que le domicile familial soit le point de référence scolaire." },
      { id: "e51", sender: "Me Vidal (avocat M. Bernard)", subject: "Proposition partage bien commun", date: "1 avril", resume: "Me Vidal propose que M. Bernard rachète la part de Mme Bernard (160 000€) avec un prêt, ou vente du bien et partage 50/50." },
      { id: "e52", sender: "Notaire Me Blanc", subject: "Estimation bien immobilier", date: "30 mars", resume: "Le notaire estime l'appartement à 320 000€ (valeur marché). Restant dû sur le prêt : 145 000€. Actif net : 175 000€." },
      { id: "e53", sender: "Alice Bernard", subject: "Relevé patrimoine commun", date: "28 mars", resume: "Mme Bernard envoie le relevé des comptes joints et l'épargne commune : livret A (12 400€), PEL (28 000€), assurance-vie (15 600€)." },
      { id: "e54", sender: "Me Vidal (avocat M. Bernard)", subject: "Accord de principe pension alimentaire", date: "25 mars", resume: "M. Bernard accepte 350€/mois/enfant soit 700€/mois au total. Indexation annuelle sur l'indice INSEE." },
      { id: "e55", sender: "Alice Bernard", subject: "Attestation revenus 2025", date: "22 mars", resume: "Mme Bernard transmet son avis d'imposition. Revenus 2025 : 42 000€ net. Poste : cadre RH chez Danone." },
      { id: "e56", sender: "Me Vidal (avocat M. Bernard)", subject: "Attestation revenus M. Bernard", date: "22 mars", resume: "Revenus 2025 de M. Bernard : 58 000€ net. Poste : directeur technique chez Capgemini." },
      { id: "e57", sender: "Alice Bernard", subject: "Calendrier scolaire enfants", date: "20 mars", resume: "Calendrier scolaire de Léa (CE2, école Pasteur) et Hugo (GS, maternelle Curie). Vacances : dates à répartir." },
      { id: "e58", sender: "Psychologue Mme Faure", subject: "Attestation suivi enfants", date: "18 mars", resume: "La psychologue atteste que les enfants vivent bien la séparation. Recommande une garde alternée régulière pour la stabilité." },
      { id: "e59", sender: "Alice Bernard", subject: "Premier contact — divorce consentement mutuel", date: "10 mars", resume: "Mme Bernard souhaite divorcer à l'amiable. Mariée depuis 2016, 2 enfants. Accord de principe avec M. Bernard sur le principe." },
      { id: "e59b", sender: "Banque LCL", subject: "Situation prêt immobilier", date: "15 mars", resume: "Capital restant dû : 145 000€. Mensualité : 980€. Fin du prêt : mars 2034. Possibilité de désolidarisation sous conditions." },
      { id: "e59c", sender: "Alice Bernard", subject: "Planning garde proposé", date: "1 avril", resume: "Mme Bernard propose un planning de garde : semaines paires chez elle, impaires chez M. Bernard. Vacances 50/50." },
    ],
    documents: [
      { id: "doc7", name: "Livret_famille.pdf", type: "PDF", size: "567 Ko", date: "10 mars", resume: "Livret de famille. Mariage le 18/06/2016 à Paris 15e. Enfants : Léa née le 12/04/2018, Hugo né le 23/09/2021." },
      { id: "doc7b", name: "Estimation_appartement_Me_Blanc.pdf", type: "PDF", size: "234 Ko", date: "30 mars", resume: "Estimation notariale du bien commun : T3, 75m², 15 rue de Vaugirard Paris 15e. Valeur : 320 000€. Méthode : comparaison avec transactions récentes du quartier." },
      { id: "doc7c", name: "Avis_imposition_2025_Bernard_A.pdf", type: "PDF", size: "189 Ko", date: "22 mars", resume: "Avis d'imposition 2025 de Mme Alice Bernard. Revenu net imposable : 42 000€. Impôt : 3 840€. 1 part fiscale." },
      { id: "doc7d", name: "Avis_imposition_2025_Bernard_P.pdf", type: "PDF", size: "195 Ko", date: "22 mars", resume: "Avis d'imposition 2025 de M. Paul Bernard. Revenu net imposable : 58 000€. Impôt : 7 200€. 1 part fiscale." },
      { id: "doc7e", name: "Releve_comptes_joints.pdf", type: "PDF", size: "78 Ko", date: "28 mars", resume: "Solde compte joint : 3 200€. Livret A joint : 12 400€. PEL Mme Bernard : 28 000€. Assurance-vie M. Bernard : 15 600€." },
      { id: "doc7f", name: "Attestation_psychologue.pdf", type: "PDF", size: "56 Ko", date: "18 mars", resume: "Attestation de Mme Faure, psychologue. Suivi de Léa et Hugo depuis janvier 2026. Les enfants s'adaptent bien. Recommande garde alternée 1 semaine/1 semaine." },
      { id: "doc7g", name: "Projet_convention_divorce.docx", type: "DOCX", size: "89 Ko", date: "2 avril", resume: "Projet de convention. Garde alternée, pension 700€/mois, vente du bien et partage 50/50 de l'actif net, prestation compensatoire : non demandée." },
      { id: "doc7h", name: "Situation_pret_LCL.pdf", type: "PDF", size: "112 Ko", date: "15 mars", resume: "Tableau d'amortissement prêt LCL. Capital initial : 250 000€ en 2019. Restant dû : 145 000€. Mensualité : 980€. Fin : mars 2034." },
      { id: "doc7i", name: "Planning_garde_alternee.xlsx", type: "XLSX", size: "34 Ko", date: "1 avril", resume: "Planning proposé : semaines paires chez Mme Bernard, impaires chez M. Bernard. Vacances Noël : alternance annuelle. Été : 3 semaines chacun." },
    ],
  },
]

const TASKS = [
  {
    id: 1,
    dossier: "Dupont c/ Dupont",
    dossier_id: "d-dupont",
    tribunal: "Tribunal de Grande Instance de Paris",
    date: "Aujourd'hui, 15h06",
    title: "Convocation audience JAF — Dupont c/ Dupont — 15 avril 2026",
    urgent: true,
    desc: "Le greffe du JAF convoque les parties à une audience le 15 avril 2026 à 14h00, salle 12. L'objet porte sur les mesures provisoires (résidence des enfants, pension alimentaire).",
    tags: [
      { name: "convocation_jaf_15avril.pdf", type: "PDF", size: "156 Ko", resume: "Convocation officielle du greffe du JAF de Paris. Audience fixée au 15 avril 2026 à 14h00, salle 12. Objet : mesures provisoires (résidence enfants, pension alimentaire). Parties convoquées : M. et Mme Dupont." },
      { name: "ordonnance_jaf_provisoir.pdf", type: "PDF", size: "203 Ko", resume: "Ordonnance de non-conciliation du 12 mars 2026. Le juge a fixé la résidence provisoire des enfants chez la mère. Pension alimentaire provisoire : 400€/mois. Audience au fond renvoyée au 15 avril." },
    ],
    status: "sent" as const,
    email_from: "Greffe du JAF <greffe.jaf@tgi-paris.justice.fr>",
    email_to: "Me Alexandra Fernandez <a.fernandez@cabinet-fernandez.fr>",
    email_cc: "Me Karim Benzara <k.benzara@avocats-paris.fr>",
    email_date: "3 avril 2026, 15:06",
    resume: "Le greffe du Juge aux Affaires Familiales de Paris vous convoque à une audience le 15 avril 2026 à 14h00. L'objet porte sur les mesures provisoires dans l'affaire Dupont c/ Dupont : résidence des enfants et pension alimentaire. Les conclusions adverses de Me Benzara ont été déposées le 28 mars.",
    corps_original: "Madame le Conseil,\n\nNous avons l'honneur de vous informer que l'audience relative à l'affaire n°2026/01234 — Dupont c/ Dupont — a été fixée au 15 avril 2026 à 14h00, salle 12 du Tribunal de Grande Instance de Paris.\n\nL'objet de cette audience porte sur les mesures provisoires :\n- Résidence des enfants mineurs\n- Fixation de la pension alimentaire\n- Organisation du droit de visite et d'hébergement\n\nVous êtes priée de bien vouloir transmettre vos conclusions au plus tard 5 jours avant l'audience.\n\nVeuillez agréer, Madame le Conseil, l'expression de nos salutations distinguées.\n\nLe Greffier en Chef",
    draft: "Madame, Monsieur,\n\nJ'accuse réception de la convocation à l'audience du 15 avril 2026 à 14h00 (affaire n°2026/01234 — Dupont c/ Dupont).\n\nJe vous confirme la présence de ma cliente, Mme Dupont, assistée de mon cabinet.\n\nNos conclusions seront transmises dans le délai imparti.\n\nVeuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: 2,
    dossier: "SCI Les Tilleuls",
    dossier_id: "d-tilleuls",
    tribunal: "M. Karim Benzara",
    date: "Aujourd'hui, 12h06",
    title: "Loyers impayés — situation critique — besoin d'action urgente",
    urgent: true,
    desc: "M. Benzara, gérant de la SCI Les Tilleuls, signale que le locataire commercial (restaurant Le Soleil d'Or) n'a pas payé les loyers des mois de janvier, février et mars 2026, soit 3 × 4 200 €.",
    tags: [
      { name: "bail_commercial_sci.pdf", type: "PDF", size: "892 Ko", resume: "Bail commercial signé le 01/01/2023 entre SCI Les Tilleuls (bailleur) et SARL Le Soleil d'Or (preneur). Loyer mensuel : 4 200€ HT. Durée : 9 ans. Clause résolutoire en cas de non-paiement après commandement de payer resté infructueux 1 mois." },
      { name: "mise_en_demeure_model.docx", type: "DOCX", size: "45 Ko", resume: "Modèle de mise en demeure préparé par Donna. Destinataire : SARL Le Soleil d'Or. Montant réclamé : 12 600€ (3 mois × 4 200€). Délai de 8 jours pour régulariser avant commandement de payer par huissier." },
    ],
    status: "draft" as const,
    email_from: "Karim Benzara <k.benzara@gmail.com>",
    email_to: "Me Alexandra Fernandez <a.fernandez@cabinet-fernandez.fr>",
    email_cc: "",
    email_date: "3 avril 2026, 12:06",
    resume: "M. Benzara, gérant de la SCI Les Tilleuls, signale une situation urgente de loyers impayés. Le locataire commercial (restaurant Le Soleil d'Or) accumule 3 mois d'impayés pour un total de 12 600€. Il demande une action rapide pour protéger ses droits.",
    corps_original: "Maître,\n\nJe me permets de vous écrire en urgence concernant la SCI Les Tilleuls dont je suis le gérant.\n\nLe restaurant Le Soleil d'Or, notre locataire commercial au 12 rue des Tilleuls, n'a toujours pas réglé les loyers de janvier, février et mars 2026.\n\nCela représente 3 mois × 4 200€ = 12 600€ d'impayés.\n\nJ'ai tenté de joindre le gérant M. Tran à plusieurs reprises sans succès. La situation devient critique car j'ai moi-même des échéances bancaires à honorer.\n\nPouvez-vous prendre les mesures nécessaires le plus rapidement possible ?\n\nCordialement,\nKarim Benzara",
    draft: "Monsieur Tran,\n\nJe me permets de vous écrire au nom de mon client, M. Karim Benzara, gérant de la SCI Les Tilleuls, propriétaire des locaux commerciaux situés au 12 rue des Tilleuls que vous occupez.\n\nÀ ce jour, les loyers des mois de janvier, février et mars 2026 restent impayés, soit un montant total de 12 600€ (3 × 4 200€ HT).\n\nConformément aux dispositions du bail commercial et aux articles L. 145-41 du Code de commerce, je vous mets en demeure de régulariser l'intégralité des loyers dus dans un délai de 8 jours à compter de la réception de la présente.\n\nÀ défaut, nous serons contraints d'engager les voies de recouvrement, incluant un commandement de payer par voie d'huissier.\n\nVeuillez agréer, Monsieur, l'expression de mes salutations distinguées.\n\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
  {
    id: 3,
    dossier: "Succession Martin",
    dossier_id: "d-martin",
    tribunal: "Cabinet Moreau",
    date: "Hier, 16h22",
    title: "Pièces complémentaires — dossier succession Martin",
    urgent: false,
    desc: "Le cabinet Moreau transmet les pièces complémentaires demandées pour le dossier de succession Martin : acte de naissance, certificat de décès, inventaire notarial.",
    tags: [
      { name: "acte_naissance_martin.pdf", type: "PDF", size: "67 Ko", resume: "Acte de naissance de feu M. Robert Martin, né le 14/06/1948 à Lyon 3e. Mentions marginales : mariage le 22/09/1975, décès le 02/02/2026." },
      { name: "certificat_deces.pdf", type: "PDF", size: "42 Ko", resume: "Certificat de décès de M. Robert Martin, décédé le 02/02/2026 à son domicile. Cause naturelle." },
      { name: "inventaire_notarial.pdf", type: "PDF", size: "1.2 Mo", resume: "Inventaire préliminaire établi par Me Durand, notaire. Actif successoral estimé : 780 000€ (bien immobilier 520 000€ + comptes bancaires 180 000€ + divers 80 000€). Passif : 12 000€. Héritiers : 2 enfants (parts égales)." },
    ],
    status: "pending" as const,
    email_from: "Cabinet Moreau <contact@cabinet-moreau.fr>",
    email_to: "Me Alexandra Fernandez <a.fernandez@cabinet-fernandez.fr>",
    email_cc: "",
    email_date: "2 avril 2026, 16:22",
    resume: "Le Cabinet Moreau transmet 3 pièces complémentaires pour le dossier de succession Martin : acte de naissance, certificat de décès et inventaire notarial préliminaire. L'actif successoral est estimé à 780 000€. Deux héritiers en parts égales.",
    corps_original: "Chère Consœur,\n\nVeuillez trouver ci-joint les pièces complémentaires que vous nous aviez demandées pour le dossier de succession de M. Robert Martin :\n\n1. Acte de naissance avec mentions marginales\n2. Certificat de décès\n3. Inventaire notarial préliminaire établi par Me Durand\n\nL'inventaire fait apparaître un actif successoral estimé à 780 000€, dont un bien immobilier à Neuilly évalué à 520 000€.\n\nNous restons à votre disposition pour toute question.\n\nConfraternellement,\nCabinet Moreau",
    draft: "Cher Confrère,\n\nJ'accuse bonne réception des pièces complémentaires relatives au dossier de succession Martin, à savoir :\n- Acte de naissance avec mentions marginales\n- Certificat de décès\n- Inventaire notarial préliminaire (Me Durand)\n\nJ'ai bien noté l'estimation de l'actif successoral à 780 000€. Je procède à l'analyse de l'inventaire et reviendrai vers vous sous 10 jours avec mes observations.\n\nConfraternellement,\n\nMe Alexandra Fernandez\nAvocate au Barreau de Paris",
  },
]

// ─── Chat data ───
interface ChatMessage { role: "user" | "assistant"; content: string; ts: number }

const WELCOME: ChatMessage = {
  role: "assistant",
  content: `Alexandra, c'est Donna 👋\n\nJ'ai fait le tour de tes dossiers ce matin. Deux points qui méritent ton attention :\n\n⚡ **Audience JAF le 15 avril** — les conclusions adverses sont arrivées, j'ai préparé ta fiche. Il reste 12 jours.\n\n⚡ **SCI Tilleuls** — 3 mois d'impayés (12 600 €). La mise en demeure est prête, chaque jour de retard fragilise ta position.\n\nJe connais tes dossiers, tes échéances et tes pièces. Demande-moi ce que tu veux — même un truc que tu demanderais normalement à ton stagiaire.`,
  ts: Date.now(),
}

const SUGGESTIONS = [
  "Prépare-moi pour l'audience JAF",
  "Montre-moi la situation Tilleuls",
  "Qu'est-ce que je risque d'oublier ?",
  "Calcule les loyers impayés",
  "Rédige la relance Greffe Nanterre",
]

function getDemoResponse(q: string): string {
  const s = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  if (s.includes("audience") || s.includes("jaf") || s.includes("15 avril") || s.includes("prepare"))
    return `**Fiche de préparation — Audience JAF du 15 avril 2026**\n\n📍 **Lieu :** TGI Paris — Salle 12 — 14h00\n\n**Objet :** Mesures provisoires\n- Résidence des enfants\n- Pension alimentaire (adverse : 450€/mois)\n\n**Chronologie :**\n- 12 mars : requête initiale\n- 28 mars : conclusions adverses (Me Benzara)\n- 3 avril : convocation reçue\n\n**Points de friction :**\n1. Résidence principale contestée — stabilité scolaire\n2. Pension : client estime max 350€\n\n**Pièces à emporter :**\n- Ordonnance JAF provisoire\n- Relevés de compte (3 mois)\n- Attestations d'hébergement\n\n✅ Brouillon de conclusions prêt.`
  if (s.includes("tilleul") || s.includes("loyer") || s.includes("benzara") || s.includes("sci") || s.includes("calcul") || s.includes("montant"))
    return `**SCI Les Tilleuls — Loyers impayés**\n\n| Mois | Montant |\n|------|--------|\n| Janvier | 4 200 € |\n| Février | 4 200 € |\n| Mars | 4 200 € |\n| **Total** | **12 600 €** |\n\n**Actions :**\n1. Mise en demeure LRAR (modèle prêt)\n2. Commandement de payer (huissier, si pas de réponse sous 8j)\n3. Assignation en référé\n\n✉️ Mise en demeure prête à valider.`
  if (s.includes("oubli") || s.includes("manque") || s.includes("verifie") || s.includes("filet") || s.includes("rien rater") || s.includes("passe entre"))
    return `**Alertes — 3 points d'attention**\n\n1. **SCI Les Tilleuls** — Mise en demeure non envoyée. Chaque jour fragilise la procédure. → Brouillon prêt.\n\n2. **Succession Martin** — Pièces du Cabinet Moreau pas encore classées. → Accuser réception.\n\n3. **Greffe TGI Nanterre** — Notification de jugement reçue. Délai d'appel : 30 jours.\n\n✅ Aucun délai de prescription imminent sur les autres dossiers.`
  if (s.includes("relance") || s.includes("greffe") || s.includes("nanterre") || s.includes("redige") || s.includes("brouillon"))
    return `**Brouillon — Greffe TGI Nanterre**\n\n---\n\nMadame, Monsieur,\n\nJ'accuse réception de la notification de jugement n°2026/1847.\n\nJe reviendrai vers vous dans les meilleurs délais concernant les suites éventuelles.\n\nSalutations distinguées.\n\n*Me Alexandra Fernandez*\n*Barreau de Paris*\n\n---\n\n✏️ Ajuster avant envoi ?`
  if (s.includes("succession") || (s.includes("martin") && !s.includes("jean")))
    return `**Succession Martin**\n\n📄 Pièces reçues :\n- Acte de naissance\n- Certificat de décès\n- Inventaire notarial (actif : 780 000€)\n\n**Prochaine étape :** Analyser l'inventaire.\n\n⏳ Déclaration de succession : 6 mois max.`
  if (s.includes("dossier") || s.includes("affaire") || s.includes("client"))
    return `**5 dossiers actifs :**\n\n1. 🔴 **Dupont c/ Dupont** — JAF 15 avril\n2. 🔴 **SCI Les Tilleuls** — 12 600€ impayés\n3. 🟡 **Succession Martin** — Pièces à classer\n4. 🟢 **Jean-Pierre Martin** — Attente client\n5. 🟢 **Alice Bernard** — Procédure en cours`
  if (s.includes("email") || s.includes("mail") || s.includes("briefing") || s.includes("matin") || s.includes("recu"))
    return `**Briefing — 12 emails reçus**\n\n**3 urgents :**\n- 🔴 Greffe JAF → Audience 15 avril\n- 🔴 M. Benzara → Impayés Tilleuls\n- 🔴 Greffe Nanterre → Notification jugement\n\n**2 à traiter :**\n- 🟡 Cabinet Moreau → Succession Martin\n- 🟡 Me Benzara → Conclusions\n\n**9 filtrés** (newsletters, prospection)\n\n✅ 3 brouillons prêts.`
  return `Essayez :\n- *"Prépare-moi pour l'audience JAF"*\n- *"Calcule les loyers Tilleuls"*\n- *"Qu'est-ce que je risque d'oublier ?"*\n- *"Où en est la succession Martin ?"*`
}

// ═══════════════════════════════════════════════════════
// ─── SUB-COMPONENTS ───
// ═══════════════════════════════════════════════════════

type TaskStatus = "sent" | "draft" | "pending"

function StatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { label: string; bg: string; color: string }> = {
    sent: { label: "Mail envoyé", bg: "#F0FDF4", color: "#16A34A" },
    draft: { label: "Brouillon prêt", bg: ACCENT_BG, color: ACCENT },
    pending: { label: "À traiter", bg: "#FEF9EC", color: "#B45309" },
  }
  const s = map[status]
  return <span style={{ padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>{s.label}</span>
}

// ─── TaskCard ───
function TaskCard({ task, delay, onView, onDraft, onTreat, treated }: {
  task: typeof TASKS[0]; delay: number
  onView: () => void; onDraft: () => void; onTreat: () => void; treated: boolean
}) {
  if (treated) {
    return (
      <motion.div initial={{ opacity: 1, height: "auto" }} animate={{ opacity: 0.5, height: "auto" }} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, marginBottom: 12, padding: "14px 18px", background: "#F9FAFB", display: "flex", alignItems: "center", gap: 10 }}>
        <CheckCircle2 size={18} color={GREEN} />
        <span style={{ fontSize: 13, color: TEXT_MUTED, textDecoration: "line-through" }}>{task.title}</span>
      </motion.div>
    )
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ border: `1px solid ${BORDER}`, borderRadius: 10, marginBottom: 12, overflow: "hidden", background: BG }}
    >
      <div style={{ padding: "14px 18px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: TEXT_MUTED }}><span style={{ color: TEXT, fontWeight: 500 }}>{task.dossier}</span>{" · "}{task.tribunal}</div>
          <span style={{ fontSize: 11, color: TEXT_LIGHT, flexShrink: 0, marginLeft: 12 }}>{task.date}</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
          {task.urgent && <span style={{ width: 6, height: 6, borderRadius: "50%", background: URGENT, flexShrink: 0, marginTop: 6 }} />}
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, lineHeight: 1.4 }}>{task.title}</div>
        </div>
        {task.urgent && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: URGENT_BG, color: URGENT, fontSize: 11, fontWeight: 600, marginBottom: 8 }}>⚡ Urgent</span>}
        <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.65, marginBottom: 10 }}>{task.desc}</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {task.tags.map(tag => (
            <span key={tag.name} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: "#F9FAFB", border: `1px solid ${BORDER}`, fontSize: 11, color: TEXT_MUTED }}>
              <Paperclip size={10} /> {tag.name}
            </span>
          ))}
        </div>
      </div>
      <div style={{ padding: "10px 18px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onView} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 6, border: `1px solid ${BORDER}`, background: BG, color: TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}><Eye size={13} /> Voir</button>
          <button onClick={onDraft} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 6, border: `1px solid ${BORDER}`, background: BG, color: TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}><Edit3 size={13} /> Brouillon</button>
        </div>
        <button onClick={onTreat} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 6, border: "none", background: task.status === "sent" ? "#111827" : ACCENT_BG, color: task.status === "sent" ? "#fff" : ACCENT, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
          {task.status === "sent" ? <><CheckCircle2 size={13} /> Mail envoyé</> : <StatusBadge status={task.status} />}
        </button>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════
// ─── EMAIL DRAWER ───
// ═══════════════════════════════════════════════════════

function EmailDrawer({ task, mode: initialMode, onClose, isMobile }: {
  task: typeof TASKS[0]; mode: "view" | "draft"; onClose: () => void; isMobile: boolean
}) {
  const [activeMode, setActiveMode] = useState(initialMode)
  const [draftText, setDraftText] = useState(task.draft)
  const [draftLoading, setDraftLoading] = useState(initialMode === "draft")
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState<typeof task.tags[0] | null>(null)

  useEffect(() => {
    if (initialMode === "draft") {
      setDraftLoading(true)
      const t = setTimeout(() => setDraftLoading(false), 1200)
      return () => clearTimeout(t)
    }
  }, [initialMode])

  const handleCopy = () => {
    navigator.clipboard.writeText(draftText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenerateDraft = () => {
    setActiveMode("draft")
    setDraftLoading(true)
    setTimeout(() => setDraftLoading(false), 1200)
  }

  return (
    <motion.div
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: isMobile ? "100%" : "min(680px, 55vw)", background: BG, zIndex: 80, display: "flex", flexDirection: "column", boxShadow: "-4px 0 30px rgba(0,0,0,0.1)", borderLeft: `1px solid ${BORDER}` }}
    >
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: TEXT_MUTED, fontFamily: "inherit" }}>
          <ArrowLeft size={16} /> Retour
        </button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button onClick={() => setActiveMode("view")} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${activeMode === "view" ? ACCENT : BORDER}`, background: activeMode === "view" ? ACCENT_BG : BG, color: activeMode === "view" ? ACCENT : TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
            <Eye size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Voir
          </button>
          <button onClick={handleGenerateDraft} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${activeMode === "draft" ? ACCENT : BORDER}`, background: activeMode === "draft" ? ACCENT_BG : BG, color: activeMode === "draft" ? ACCENT : TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
            <Edit3 size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Brouillon
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px" }}>
        {activeMode === "view" ? (
          <>
            {/* Subject */}
            <h2 style={{ fontSize: 20, fontWeight: 600, color: TEXT, marginBottom: 16, lineHeight: 1.3 }}>{task.title}</h2>

            {/* Metadata */}
            <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "14px 16px", marginBottom: 20, fontSize: 12, lineHeight: 1.8, border: `1px solid ${BORDER}` }}>
              <div><span style={{ color: TEXT_LIGHT, width: 32, display: "inline-block" }}>De</span> <span style={{ color: TEXT }}>{task.email_from}</span></div>
              <div><span style={{ color: TEXT_LIGHT, width: 32, display: "inline-block" }}>À</span> <span style={{ color: TEXT }}>{task.email_to}</span></div>
              {task.email_cc && <div><span style={{ color: TEXT_LIGHT, width: 32, display: "inline-block" }}>Cc</span> <span style={{ color: TEXT }}>{task.email_cc}</span></div>}
              <div><span style={{ color: TEXT_LIGHT, width: 32, display: "inline-block" }}>Date</span> <span style={{ color: TEXT }}>{task.email_date}</span></div>
            </div>

            {/* Donna's summary */}
            <div style={{ background: ACCENT_BG, borderRadius: 10, padding: "16px 18px", marginBottom: 20, border: `1px solid rgba(37,99,235,0.12)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>D</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: ACCENT }}>Résumé Donna</span>
              </div>
              <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.7, margin: 0 }}>{task.resume}</p>
            </div>

            {/* Original email */}
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => setShowOriginal(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: TEXT_MUTED, fontFamily: "inherit", marginBottom: 8 }}>
                <Mail size={13} /> {showOriginal ? "Masquer l'email original" : "Voir l'email original"}
                <ChevronRight size={12} style={{ transform: showOriginal ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              <AnimatePresence>
                {showOriginal && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                    <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "14px 16px", border: `1px solid ${BORDER}`, fontSize: 13, color: TEXT, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                      {task.corps_original}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pièces jointes */}
            {task.tags.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_LIGHT, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Pièces jointes</div>
                {task.tags.map(tag => (
                  <button key={tag.name} onClick={() => setSelectedAttachment(tag)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, marginBottom: 6, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                    onMouseLeave={e => (e.currentTarget.style.background = BG)}
                  >
                    <FileText size={18} color={ACCENT} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tag.name}</div>
                      <div style={{ fontSize: 11, color: TEXT_LIGHT }}>{tag.type} · {tag.size}</div>
                    </div>
                    <Eye size={14} color={TEXT_LIGHT} />
                  </button>
                ))}
              </div>
            )}

            {/* Generate draft CTA */}
            <button onClick={handleGenerateDraft} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px 20px", borderRadius: 8, background: ACCENT, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <Edit3 size={15} /> Générer une réponse
            </button>
          </>
        ) : (
          /* DRAFT MODE */
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Brouillon de réponse</h2>
            <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 16 }}>Re: {task.title}</p>

            {draftLoading ? (
              <div style={{ background: "#F9FAFB", borderRadius: 10, padding: 20, border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>D</div>
                  <span style={{ fontSize: 12, color: ACCENT, fontWeight: 500 }}>Donna rédige...</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[85, 70, 90, 60].map((w, i) => (
                    <motion.div key={i} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      style={{ height: 10, borderRadius: 4, background: BORDER, width: `${w}%` }} />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <textarea
                  value={draftText}
                  onChange={e => setDraftText(e.target.value)}
                  style={{ width: "100%", minHeight: 280, padding: "16px 18px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#FAFAFA", fontSize: 13, color: TEXT, lineHeight: 1.7, fontFamily: "inherit", resize: "vertical", outline: "none" }}
                  onFocus={e => (e.target.style.borderColor = ACCENT)}
                  onBlur={e => (e.target.style.borderColor = BORDER)}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={handleCopy} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, background: "#111827", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    {copied ? <><Check size={14} /> Copié !</> : <><Copy size={14} /> Copier</>}
                  </button>
                </div>

                {/* Feedback */}
                <div style={{ marginTop: 20, padding: "16px 18px", borderRadius: 10, background: "#F9FAFB", border: `1px solid ${BORDER}` }}>
                  {feedback ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: GREEN }}>
                      <CheckCircle2 size={16} /> Merci ! Donna apprend de vos retours.
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 10 }}>Ce brouillon vous convient ?</p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[
                          { key: "parfait", icon: ThumbsUp, label: "Parfait", color: GREEN },
                          { key: "modifier", icon: Pencil, label: "Quelques modifications", color: "#D97706" },
                          { key: "erreur", icon: XCircle, label: "Erreurs", color: URGENT },
                        ].map(fb => (
                          <button key={fb.key} onClick={() => setFeedback(fb.key)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 6, border: `1px solid ${BORDER}`, background: BG, color: TEXT_MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                            onMouseEnter={e => { (e.currentTarget.style.borderColor = fb.color); (e.currentTarget.style.color = fb.color) }}
                            onMouseLeave={e => { (e.currentTarget.style.borderColor = BORDER); (e.currentTarget.style.color = TEXT_MUTED) }}
                          >
                            <fb.icon size={13} /> {fb.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Attachment preview modal */}
      <AnimatePresence>
        {selectedAttachment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setSelectedAttachment(null)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: BG, borderRadius: 12, width: "100%", maxWidth: 700, maxHeight: "80vh", display: "flex", flexDirection: isMobile ? "column" : "row", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            >
              {/* Preview side */}
              <div style={{ flex: 1, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, padding: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <FileText size={48} color={TEXT_LIGHT} style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>{selectedAttachment.name}</div>
                  <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>{selectedAttachment.type} · {selectedAttachment.size}</div>
                  <button style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, background: ACCENT, color: "#fff", border: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    <Download size={13} /> Télécharger
                  </button>
                </div>
              </div>
              {/* Resume side */}
              <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>D</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>Résumé Donna</span>
                  </div>
                  <button onClick={() => setSelectedAttachment(null)} style={{ background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED }}><X size={18} /></button>
                </div>
                <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.7 }}>{selectedAttachment.resume}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════
// ─── DOSSIER DETAIL VIEW ───
// ═══════════════════════════════════════════════════════

function DossierDetailView({ dossier, onClose, isMobile }: {
  dossier: typeof DOSSIERS[0]; onClose: () => void; isMobile: boolean
}) {
  const [selectedDoc, setSelectedDoc] = useState<typeof dossier.documents[0] | null>(null)
  const statusColors = { actif: GREEN, en_attente: "#D97706", "archivé": TEXT_LIGHT }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "20px 16px" : "32px 32px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: TEXT_MUTED, fontFamily: "inherit", marginBottom: 16 }}>
          <ArrowLeft size={16} /> Retour au briefing
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: dossier.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 700 }}>{dossier.initials}</div>
          <div>
            <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 600, color: TEXT, margin: 0, lineHeight: 1.2 }}>{dossier.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${statusColors[dossier.status]}15`, color: statusColors[dossier.status], fontWeight: 600 }}>{dossier.status === "actif" ? "Actif" : dossier.status === "en_attente" ? "En attente" : "Archivé"}</span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#F3F4F6", color: TEXT_MUTED }}>{dossier.domain}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div style={{ background: ACCENT_BG, borderRadius: 10, padding: "16px 18px", marginBottom: 24, border: `1px solid rgba(37,99,235,0.12)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>D</div>
          <span style={{ fontSize: 12, fontWeight: 600, color: ACCENT }}>Résumé Donna</span>
        </div>
        <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.7, margin: 0 }}>{dossier.summary}</p>
      </div>

      {/* Two columns: Échanges + Documents */}
      <div style={{ display: "flex", gap: 20, flexDirection: isMobile ? "column" : "row" }}>
        {/* Échanges */}
        <div style={{ flex: 3 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            Échanges ({dossier.emails.length})
          </div>
          {dossier.emails.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: TEXT_LIGHT, fontSize: 13, background: "#F9FAFB", borderRadius: 8, border: `1px solid ${BORDER}` }}>
              Aucun échange pour le moment
            </div>
          ) : (
            dossier.emails.map(email => (
              <div key={email.id} style={{ padding: "12px 16px", borderRadius: 8, border: `1px solid ${BORDER}`, marginBottom: 8, cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                onMouseLeave={e => (e.currentTarget.style.background = BG)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{email.sender}</span>
                  <span style={{ fontSize: 11, color: TEXT_LIGHT }}>{email.date}</span>
                </div>
                <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 4 }}>{email.subject}</div>
                <div style={{ fontSize: 11, color: TEXT_LIGHT }}>{email.resume}</div>
              </div>
            ))
          )}
        </div>

        {/* Documents */}
        <div style={{ flex: 2 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            Documents ({dossier.documents.length})
          </div>
          {dossier.documents.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: TEXT_LIGHT, fontSize: 13, background: "#F9FAFB", borderRadius: 8, border: `1px solid ${BORDER}` }}>
              Aucun document
            </div>
          ) : (
            dossier.documents.map(doc => (
              <button key={doc.id} onClick={() => setSelectedDoc(doc)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, marginBottom: 6, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                onMouseLeave={e => (e.currentTarget.style.background = BG)}
              >
                <FileText size={16} color={ACCENT} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                  <div style={{ fontSize: 11, color: TEXT_LIGHT }}>{doc.type} · {doc.size} · {doc.date}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Document preview modal */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: BG, borderRadius: 12, width: "100%", maxWidth: 700, maxHeight: "80vh", display: "flex", flexDirection: isMobile ? "column" : "row", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            >
              <div style={{ flex: 1, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, padding: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <FileText size={48} color={TEXT_LIGHT} style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>{selectedDoc.name}</div>
                  <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>{selectedDoc.type} · {selectedDoc.size}</div>
                  <button style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, background: ACCENT, color: "#fff", border: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    <Download size={13} /> Télécharger
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>D</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>Résumé Donna</span>
                  </div>
                  <button onClick={() => setSelectedDoc(null)} style={{ background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED }}><X size={18} /></button>
                </div>
                <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.7 }}>{selectedDoc.resume}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// ─── CHAT PANEL ───
// ═══════════════════════════════════════════════════════

const mdComponents = {
  p: ({ children }: any) => <p style={{ margin: "0 0 6px", lineHeight: 1.65 }}>{children}</p>,
  strong: ({ children }: any) => <strong style={{ fontWeight: 600, color: TEXT }}>{children}</strong>,
  em: ({ children }: any) => <em style={{ color: TEXT_MUTED }}>{children}</em>,
  ul: ({ children }: any) => <ul style={{ margin: "4px 0", paddingLeft: 16 }}>{children}</ul>,
  ol: ({ children }: any) => <ol style={{ margin: "4px 0", paddingLeft: 16 }}>{children}</ol>,
  li: ({ children }: any) => <li style={{ marginBottom: 4, fontSize: 13 }}>{children}</li>,
  table: ({ children }: any) => <table style={{ borderCollapse: "collapse", width: "100%", margin: "8px 0", fontSize: 12 }}>{children}</table>,
  th: ({ children }: any) => <th style={{ padding: "4px 8px", border: `1px solid ${BORDER}`, background: "#F3F4F6", fontSize: 11, fontWeight: 600 }}>{children}</th>,
  td: ({ children }: any) => <td style={{ padding: "4px 8px", border: `1px solid ${BORDER}` }}>{children}</td>,
  hr: () => <hr style={{ border: "none", borderTop: `1px solid ${BORDER}`, margin: "8px 0" }} />,
  code: ({ children }: any) => <code style={{ background: "#F3F4F6", padding: "1px 4px", borderRadius: 3, fontSize: 12 }}>{children}</code>,
}

function DonnaChatPanel({ isOpen, onToggle, isMobile }: { isOpen: boolean; onToggle: () => void; isMobile: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, loading, scrollToBottom])
  useEffect(() => { if (isOpen && textareaRef.current) setTimeout(() => textareaRef.current?.focus(), 300) }, [isOpen])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setShowSuggestions(false)
    setMessages(prev => [...prev, { role: "user", content: trimmed, ts: Date.now() }])
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    setLoading(true)
    await new Promise(r => setTimeout(r, 900 + Math.random() * 800))
    setMessages(prev => [...prev, { role: "assistant", content: getDemoResponse(trimmed), ts: Date.now() }])
    setLoading(false)
  }

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input) } }
  const autoResize = () => { const el = textareaRef.current; if (!el) return; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 120) + "px" }

  // Collapsed state (desktop)
  if (!isOpen && !isMobile) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        style={{ width: 56, flexShrink: 0, borderLeft: `1px solid ${BORDER}`, background: SIDEBAR_BG, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, gap: 12, cursor: "pointer", position: "relative" }}
        onClick={onToggle}
      >
        <div style={{ position: "relative" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>D</div>
          <div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: GREEN, border: `2px solid ${SIDEBAR_BG}` }} />
        </div>
        <div style={{ writingMode: "vertical-rl", textOrientation: "mixed", fontSize: 11, color: TEXT_MUTED, letterSpacing: "0.02em", whiteSpace: "nowrap", userSelect: "none" }}>Donna est là</div>
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT, marginTop: 4 }} />
      </motion.div>
    )
  }

  if (!isOpen && isMobile) return null

  const panelStyle: React.CSSProperties = isMobile
    ? { position: "fixed", inset: 0, zIndex: 100, background: BG, display: "flex", flexDirection: "column" }
    : { width: 380, flexShrink: 0, borderLeft: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", background: BG, height: "100%" }

  return (
    <motion.div
      initial={isMobile ? { y: "100%" } : { width: 0, opacity: 0 }}
      animate={isMobile ? { y: 0 } : { width: 380, opacity: 1 }}
      exit={isMobile ? { y: "100%" } : { width: 0, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      style={panelStyle}
    >
      {/* Header */}
      <div style={{ padding: isMobile ? "12px 16px" : "16px 20px", paddingTop: isMobile ? "max(12px, env(safe-area-inset-top))" : 16, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10, background: BG, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>D</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Donna</div>
          <div style={{ fontSize: 11, color: GREEN, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: GREEN, display: "inline-block" }} /> En ligne · Mode démo
          </div>
        </div>
        <button onClick={onToggle} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: TEXT_MUTED, flexShrink: 0 }}><X size={16} /></button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", WebkitOverflowScrolling: "touch" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 16, display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, maxWidth: "92%" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>D</div>
                <div style={{ background: "#F9FAFB", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", fontSize: 13, color: TEXT, lineHeight: 1.65, border: `1px solid ${BORDER}` }}>
                  <ReactMarkdown components={mdComponents}>{msg.content}</ReactMarkdown>
                </div>
              </div>
            )}
            {msg.role === "user" && (
              <div style={{ background: ACCENT, borderRadius: "16px 16px 4px 16px", padding: "10px 14px", fontSize: 13, color: "#fff", lineHeight: 1.65, maxWidth: "85%", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>{msg.content}</div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>D</div>
            <div style={{ background: "#F9FAFB", borderRadius: "16px 16px 16px 4px", padding: "12px 16px", border: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} style={{ width: 6, height: 6, borderRadius: "50%", background: TEXT_MUTED }} />)}
              </div>
            </div>
          </div>
        )}
        {showSuggestions && messages.length === 1 && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                style={{ textAlign: "left", padding: "8px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#FAFAFA", fontSize: 12, color: TEXT_MUTED, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", lineHeight: 1.4 }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = ACCENT_BG; (e.target as HTMLElement).style.borderColor = "#BFDBFE"; (e.target as HTMLElement).style.color = ACCENT }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = "#FAFAFA"; (e.target as HTMLElement).style.borderColor = BORDER; (e.target as HTMLElement).style.color = TEXT_MUTED }}
              >{s}</button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", paddingBottom: isMobile ? "max(16px, env(safe-area-inset-bottom))" : 16, borderTop: `1px solid ${BORDER}`, background: BG, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${BORDER}`, background: "#FAFAFA" }}>
          <textarea ref={textareaRef} value={input} onChange={e => { setInput(e.target.value); autoResize() }} onKeyDown={handleKey}
            placeholder="Posez votre question à Donna..." rows={1}
            style={{ flex: 1, border: "none", background: "transparent", resize: "none", outline: "none", fontSize: 13, color: TEXT, lineHeight: 1.5, fontFamily: "inherit", minHeight: 20, maxHeight: 120 }}
          />
          <button onClick={() => send(input)} disabled={!input.trim() || loading}
            style={{ width: 32, height: 32, borderRadius: "50%", background: input.trim() && !loading ? ACCENT : "#E5E7EB", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() && !loading ? "pointer" : "default", flexShrink: 0 }}
          ><ArrowUp size={15} color={input.trim() && !loading ? "#fff" : TEXT_LIGHT} /></button>
        </div>
        <div style={{ fontSize: 10, color: TEXT_LIGHT, textAlign: "center", marginTop: 6 }}>Mode démo — données fictives à titre d'illustration</div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════
// ─── MAIN PAGE ───
// ═══════════════════════════════════════════════════════

export default function DemoV2() {
  const isMobile = useIsMobile()
  const [chatOpen, setChatOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [donnaTyping, setDonnaTyping] = useState(true)
  const [showMessage, setShowMessage] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const [treatedIds, setTreatedIds] = useState<Set<number>>(new Set())

  // Drawer state
  const [selectedTask, setSelectedTask] = useState<typeof TASKS[0] | null>(null)
  const [drawerMode, setDrawerMode] = useState<"view" | "draft">("view")

  // Dossier detail state
  const [selectedDossier, setSelectedDossier] = useState<typeof DOSSIERS[0] | null>(null)

  useEffect(() => {
    const t1 = setTimeout(() => { setDonnaTyping(false); setShowMessage(true) }, 2200)
    const t2 = setTimeout(() => setStatsVisible(true), 800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => { if (!isMobile) setSidebarOpen(false) }, [isMobile])

  const handleView = (task: typeof TASKS[0]) => { setSelectedTask(task); setDrawerMode("view") }
  const handleDraft = (task: typeof TASKS[0]) => { setSelectedTask(task); setDrawerMode("draft") }
  const handleTreat = (id: number) => { setTreatedIds(prev => new Set(prev).add(id)) }

  return (
    <div style={{ background: BG, color: TEXT, height: "100vh", fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Top bar — mobile only */}
      {isMobile && (
        <div style={{ height: 40, background: "#F3F4F6", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", padding: "0 16px", gap: 8, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
            <Menu size={18} color={TEXT_MUTED} />
          </button>
          <div style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 600, color: TEXT }}>Donna</div>
          <Link to="/v3" style={{ fontSize: 11, color: TEXT_LIGHT, textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
            Landing <ChevronRight size={10} />
          </Link>
        </div>
      )}

      {/* Layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* Mobile sidebar overlay */}
        {isMobile && (
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 50 }}
                />
                <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  style={{ position: "fixed", top: 40, left: 0, bottom: 0, zIndex: 51, width: 260, background: SIDEBAR_BG, borderRight: `1px solid ${SIDEBAR_BORDER}`, display: "flex", flexDirection: "column", overflowY: "auto" }}
                >
                  <SidebarContent onDossierClick={d => { setSelectedDossier(d); setSidebarOpen(false) }} activeDossierId={selectedDossier?.id || null} />
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        )}

        {/* Desktop sidebar */}
        {!isMobile && (
          <aside style={{ width: 220, background: SIDEBAR_BG, borderRight: `1px solid ${SIDEBAR_BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
            <SidebarContent onDossierClick={d => setSelectedDossier(d)} activeDossierId={selectedDossier?.id || null} />
          </aside>
        )}

        {/* Main content — either dashboard or dossier detail */}
        {selectedDossier ? (
          <DossierDetailView dossier={selectedDossier} onClose={() => setSelectedDossier(null)} isMobile={isMobile} />
        ) : (
          <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? "20px 16px" : "32px 32px" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 24 : 30, fontWeight: 400, color: TEXT, marginBottom: 4, letterSpacing: "-0.02em" }}>Bonjour, Alexandra</h1>
              <p style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 24 }}>Je suis Donna, votre employée numérique · Jeudi 3 avril</p>
            </motion.div>

            <AnimatePresence>
              {statsVisible && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? "14px 16px" : "18px 22px", marginBottom: 16, display: "flex", alignItems: "center", gap: isMobile ? 12 : 20, flexWrap: "wrap" }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: isMobile ? 26 : 32, fontWeight: 700, color: TEXT, lineHeight: 1 }}>{treatedIds.size}</div>
                    <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>/3</div>
                  </div>
                  <div style={{ width: 1, height: 36, background: BORDER }} />
                  <div style={{ display: "flex", gap: isMobile ? 10 : 16, flex: 1, flexWrap: "wrap" }}>
                    {[{ icon: Mail, value: "12 reçus" }, { icon: LayoutDashboard, value: "6 dossiers" }, { icon: Settings, value: "9 filtrés" }].map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: TEXT_MUTED }}><s.icon size={13} /> {s.value}</div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
              style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? "14px 16px" : "18px 22px", marginBottom: 24 }}
            >
              {donnaTyping ? (
                <div style={{ display: "flex", gap: 5, alignItems: "center", height: 20 }}>
                  <span style={{ fontSize: 12, color: TEXT_MUTED, marginRight: 4 }}>Donna analyse...</span>
                  {[0, 1, 2].map(i => <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} style={{ width: 5, height: 5, borderRadius: "50%", background: TEXT_MUTED }} />)}
                </div>
              ) : (
                <AnimatePresence>
                  {showMessage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                      <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.7, marginBottom: 6 }}>
                        Bonjour Alexandra, c'est Donna. J'ai trié vos <strong>12 emails</strong> ce matin — 9 étaient du bruit (newsletters, prospection), je m'en suis occupée. Il vous reste <strong>3 brouillons de réponse</strong> à valider, tout est prêt.
                      </p>
                      <p style={{ fontSize: 12, color: TEXT_MUTED, fontStyle: "italic" }}>Votre to-do du jour est juste en dessous.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.08em", textTransform: "uppercase" }}>TO-DO LIST</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: URGENT }}>{TASKS.filter(t => t.urgent && !treatedIds.has(t.id)).length}</span>
            </div>

            {TASKS.map((task, i) => (
              <TaskCard key={task.id} task={task} delay={0.6 + i * 0.15}
                onView={() => handleView(task)}
                onDraft={() => handleDraft(task)}
                onTreat={() => handleTreat(task.id)}
                treated={treatedIds.has(task.id)}
              />
            ))}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.6 }}
              style={{ marginTop: 24, padding: isMobile ? "16px" : "18px 22px", borderRadius: 12, background: ACCENT_BG, border: `1px solid rgba(37,99,235,0.15)`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: isMobile ? 80 : 0 }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: ACCENT, marginBottom: 4 }}>Vous aimez ce que vous voyez ?</div>
                <div style={{ fontSize: 13, color: TEXT_MUTED }}>Connectez votre vraie boîte mail — 14 jours gratuits, sans engagement.</div>
              </div>
              <Link to="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, background: ACCENT, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
                Commencer gratuitement <Send size={13} />
              </Link>
            </motion.div>
          </main>
        )}

        {/* Chat panel */}
        <AnimatePresence mode="wait">
          <DonnaChatPanel key={chatOpen ? "open" : "closed"} isOpen={chatOpen} onToggle={() => setChatOpen(o => !o)} isMobile={isMobile} />
        </AnimatePresence>

        {/* Mobile floating bubble */}
        {isMobile && !chatOpen && (
          <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setChatOpen(true)}
            style={{ position: "fixed", bottom: 20, right: 20, zIndex: 40, width: 56, height: 56, borderRadius: "50%", background: ACCENT, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 20px rgba(37,99,235,0.35)" }}
          >
            <MessageCircle size={24} color="#fff" />
            <div style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: "#EF4444", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>1</div>
          </motion.button>
        )}

        {/* Email drawer */}
        <AnimatePresence>
          {selectedTask && (
            <EmailDrawer task={selectedTask} mode={drawerMode} onClose={() => setSelectedTask(null)} isMobile={isMobile} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Sidebar content ───
function SidebarContent({ onDossierClick, activeDossierId }: { onDossierClick: (d: typeof DOSSIERS[0]) => void; activeDossierId: string | null }) {
  return (
    <>
      <div style={{ padding: "20px 16px 12px", borderBottom: `1px solid ${SIDEBAR_BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: TEXT }}>Donna</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: ACCENT_BG, color: ACCENT, letterSpacing: "0.05em" }}>DÉMO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
          <span style={{ fontSize: 11, color: TEXT_MUTED }}>À jour · Dernière analyse il y a 2 min</span>
        </div>
      </div>
      <div style={{ padding: "12px 8px" }}>
        <button onClick={() => onDossierClick(null as any)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", borderRadius: 6, background: !activeDossierId ? "#F3F4F6" : "transparent", marginBottom: 2, width: "100%", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
          <LayoutDashboard size={15} style={{ color: !activeDossierId ? TEXT : TEXT_MUTED }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: !activeDossierId ? 600 : 400, color: !activeDossierId ? TEXT : TEXT_MUTED }}>Briefing</div>
            <div style={{ fontSize: 10, color: TEXT_MUTED }}>Votre journée en un coup d'œil</div>
          </div>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", borderRadius: 6, marginBottom: 2 }}>
          <Settings size={15} style={{ color: TEXT_MUTED }} />
          <div>
            <div style={{ fontSize: 13, color: TEXT_MUTED }}>Configurez-moi</div>
            <div style={{ fontSize: 10, color: TEXT_LIGHT }}>Personnalisez votre assistante</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "8px 16px", flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_LIGHT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Dossiers</div>
        {DOSSIERS.map((d, i) => (
          <motion.div key={d.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            onClick={() => onDossierClick(d)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", marginBottom: 2, cursor: "pointer", borderRadius: 6, background: activeDossierId === d.id ? "#F3F4F6" : "transparent", transition: "background 0.15s" }}
            onMouseEnter={e => { if (activeDossierId !== d.id) e.currentTarget.style.background = "#F9FAFB" }}
            onMouseLeave={e => { if (activeDossierId !== d.id) e.currentTarget.style.background = "transparent" }}
          >
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: d.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{d.initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: activeDossierId === d.id ? 600 : 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
              <div style={{ fontSize: 10, color: TEXT_MUTED }}>{d.type}</div>
            </div>
          </motion.div>
        ))}
      </div>
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
        <div style={{ fontSize: 12, color: ACCENT, fontWeight: 500, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
          <Mail size={12} /> Connecter Gmail pour de vrais dossiers
        </div>
        <Link to="/login" style={{ fontSize: 12, color: TEXT_MUTED, textDecoration: "none" }}>← Déconnexion</Link>
      </div>
    </>
  )
}
