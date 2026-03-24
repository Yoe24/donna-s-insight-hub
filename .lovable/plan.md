

## Plan : Bouton "Essayer la démo" sur la page Login → cinématique scan → briefing démo

### Problème actuel

Le toggle démo/Gmail est dans la sidebar du dashboard, ce qui n'a pas de sens. L'utilisateur doit pouvoir découvrir Donna **avant** de connecter son Gmail, directement depuis la page de login.

### Ce qui change

**1. Page Login (`src/pages/Login.tsx`)**
- Ajouter un bouton visible "Essayer la démo →" entre le bouton Outlook et le séparateur "ou"
- Style : bouton avec fond émeraude léger, texte émeraude, distinct des OAuth buttons
- Au clic : active le mode démo dans localStorage, puis redirige vers `/onboarding?demo=true`

**2. Page Onboarding (`src/pages/Onboarding.tsx`)**
- Détecter le query param `demo=true`
- En mode démo : pas de polling API, simuler la progression avec des données fictives (42 emails, 7 dossiers, 12 pièces jointes)
- Même cinématique complète : logo pulsé, messages qui défilent, barre de progression animée, minimum 6 secondes
- Le bouton final "Voir mon briefing →" redirige vers `/dashboard`

**3. Sidebar (`src/components/AppSidebar.tsx`)**
- Retirer le toggle Switch "Mode démo / Mode Gmail" du footer
- Garder le badge DÉMO/LIVE à côté du logo (lecture seule, pour savoir dans quel mode on est)
- En mode démo, ajouter un petit lien discret dans le footer : "Connecter Gmail pour de vrais dossiers →" qui mène à `/login`

**4. ProtectedRoute (`src/App.tsx`)**
- Autoriser l'accès aux pages protégées si `donna_demo_mode` est `true` dans localStorage (même sans `donna_user_id`)
- Cela permet de naviguer dans le dashboard en mode démo sans être authentifié

**5. `src/hooks/useDemoMode.ts`**
- Aucun changement structurel, le hook `useDemoMode` continue de lire/écrire `donna_demo_mode` dans localStorage

### Flux utilisateur

```text
/login
  ├── "Commencer avec Gmail →"  → OAuth → /onboarding?import=started → /dashboard (LIVE)
  └── "Essayer la démo →"       → set demo mode → /onboarding?demo=true → cinématique simulée → /dashboard (DÉMO)
```

### Fichiers modifiés

| Fichier | Action |
|---|---|
| `src/pages/Login.tsx` | Ajouter bouton "Essayer la démo" |
| `src/pages/Onboarding.tsx` | Supporter `?demo=true` avec scan simulé |
| `src/components/AppSidebar.tsx` | Retirer le switch, garder le badge, ajouter lien "Connecter Gmail" |
| `src/App.tsx` | Autoriser accès protégé en mode démo |

