# Donna Legal - Frontend

## Architecture globale

Donna Legal est un assistant juridique IA pour avocats. Le projet a 3 composants :

- **Frontend (ce repo)** : React + TypeScript + Tailwind + shadcn/ui, deploye sur Vercel
- **Backend** : Node.js + Express + TypeScript, Docker sur VPS (`/var/www/donna-api/`)
- **Base de donnees** : Supabase Cloud (PostgreSQL)

## Stack technique

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (components dans `src/components/ui/`)
- Supabase Auth (connexion via magic link ou Google OAuth)
- Vitest pour les tests
- Deploiement automatique via Vercel (git push -> deploy)

## Structure du frontend

```
src/
  main.tsx                    # Point d'entree React
  App.tsx                     # Router principal
  contexts/
    AuthContext.tsx            # Provider auth Supabase (session, user, isDemo)
  lib/
    supabase.ts               # Client Supabase (anon key depuis env vars)
    api.ts                    # Client API backend (fetch avec auth token)
    auth.ts                   # Helpers auth
    mock-data.ts              # Donnees mock pour le mode demo
    mock-briefing.ts          # Brief mock pour le mode demo
    parseDonnaAnalysis.ts     # Parser du format resume Donna
    utils.ts                  # Utilitaires (cn, etc.)
  hooks/
    useDemoMode.ts            # Detecte si on est en mode demo
    useEmails.ts              # Hook emails (API ou mock selon le mode)
    useDossiers.ts            # Hook dossiers (API ou mock selon le mode)
  pages/
    Index.tsx                 # Landing page publique
    Login.tsx                 # Page connexion
    Onboarding.tsx            # Onboarding post-import Gmail
    Dashboard.tsx             # Dashboard principal (emails, pipeline, KPIs)
    DossierDetail.tsx         # Detail d'un dossier client
    FilActualite.tsx          # Brief quotidien
    Configuration.tsx         # Config cabinet (nom, specialite, style)
    Produit.tsx, Tarifs.tsx, APropos.tsx, Contact.tsx, Securite.tsx, MentionsLegales.tsx  # Pages publiques
  components/
    DashboardLayout.tsx       # Layout avec sidebar
    AppSidebar.tsx            # Navigation sidebar
    EmailDrawer.tsx           # Panneau detail email
    DonnaChat.tsx             # Chat avec Donna IA
    BriefingDetailPanel.tsx   # Panneau detail brief
    ErrorBoundary.tsx         # Error boundary React
    PublicNavbar.tsx, PublicFooter.tsx  # Nav/footer pages publiques
```

## Mode demo vs mode reel

Le frontend a deux modes de fonctionnement :

### Mode demo (`?demo=true` ou pas de session Supabase)
- Utilise des donnees mock locales (`mock-data.ts`, `mock-briefing.ts`)
- Aucun appel API au backend
- Aucune authentification requise
- Permet de tester l'UI sans backend
- Bug fix sidebar mode demo — `useDossiers.ts` utilise maintenant les mocks en mode demo au lieu d'appeler l'API

### Mode reel (utilisateur connecte via Supabase Auth)
- Auth Supabase obligatoire (session JWT)
- Tous les appels passent par `lib/api.ts` qui ajoute le Bearer token
- Le backend verifie le token et utilise `req.user.id` pour filtrer les donnees
- user_id n'est JAMAIS passe dans l'URL ou le body

## Regles de securite

1. **Pas de secrets en dur** : `src/lib/supabase.ts` utilise UNIQUEMENT `import.meta.env.VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`. Le code plante si ces variables manquent.

2. **Auth token automatique** : `lib/api.ts` ajoute le Bearer token Supabase a chaque requete vers le backend. Si pas de session, pas d'appel API.

3. **user_id depuis le token** : Le frontend ne passe jamais le user_id en parametre. Le backend l'extrait du JWT.

## Deploiement frontend

```bash
# Deploy automatique via Vercel
git push origin main
# -> Vercel detecte le push et redeploy automatiquement
```

### Variables d'environnement Vercel

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=https://api.donna-legal.com
```

## Connexion au backend

Le backend tourne sur `https://api.donna-legal.com` (VPS Docker, port 3000).

Routes API utilisees par le frontend :
- `GET /api/emails` - Liste des emails
- `GET /api/emails/:id` - Detail email
- `GET /api/emails/stats` - Statistiques
- `POST /api/emails/:id/feedback` - Feedback (parfait/modifier/erreur)
- `POST /api/emails/:id/draft` - Generer brouillon de reponse
- `GET /api/dossiers` - Liste des dossiers
- `GET /api/dossiers/:id` - Detail dossier
- `GET /api/config` - Config cabinet
- `PUT /api/config` - Modifier config
- `GET /api/briefs/today` - Brief du jour
- `POST /api/briefs/generate` - Generer un brief
- `POST /api/chat` - Chat avec Donna
- `GET /api/import/gmail/auth` - Lancer import Gmail
- `GET /api/import/status` - Statut import
- `GET /health` - Healthcheck (public)

Toutes les routes `/api/*` exigent un Bearer token Supabase valide (sauf import callback).

## Tests

```bash
npx vitest
```

Tests dans `src/test/`.
