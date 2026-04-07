import { Helmet } from "react-helmet-async";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Donna Legal",
  url: "https://donna-legal.com",
  logo: "https://donna-legal.com/favicon.svg",
  description:
    "Donna est une assistante juridique IA qui lit vos emails, trie vos dossiers et prépare vos réponses. Conçue pour les avocats.",
  foundingDate: "2026",
  sameAs: ["https://www.linkedin.com/company/donna-legal"],
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@donna-legal.com",
    contactType: "customer service",
    availableLanguage: "French",
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Donna Legal",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://donna-legal.com",
  description:
    "Assistant juridique IA : tri automatique des emails, classement des dossiers, briefing quotidien, brouillons de réponse.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    description: "Gratuit pendant la phase de lancement",
  },
  featureList: [
    "Tri automatique des emails par dossier",
    "Briefing quotidien chaque matin",
    "Brouillons de réponse dans votre style",
    "Connexion sécurisée OAuth (Gmail, Outlook)",
    "Données hébergées en France",
  ],
};

export function OrganizationJsonLd() {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
    </Helmet>
  );
}

export function SoftwareJsonLd() {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(softwareSchema)}
      </script>
    </Helmet>
  );
}
